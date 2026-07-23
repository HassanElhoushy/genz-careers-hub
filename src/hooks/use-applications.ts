import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Application, ApplicationStatus, Interview } from "@/types/application";


type ApplicationRow = {
  id: string;
  user_id: string;
  position: string;
  status: string;
  portfolio_url: string | null;
  interview_type: string | null;
  interview_date: string | null;
  interview_time: string | null;
  interview_location: string | null;
  interview_location_url: string | null;
  interview_meeting_url: string | null;
  interview_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  phone: string | null;
  birthday: string | null;
  email: string | null;
};

function toApplication(
  row: ApplicationRow,
  profile: ProfileRow | null,
): Application {
  const interview: Interview | undefined = row.interview_date
    ? {
        type: (row.interview_type as "onsite" | "online") ?? "onsite",
        date: row.interview_date,
        time: row.interview_time ?? "",
        location: row.interview_location ?? undefined,
        locationUrl: row.interview_location_url ?? undefined,
        meetingUrl: row.interview_meeting_url ?? undefined,
        notes: row.interview_notes ?? undefined,
      }
    : undefined;

  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    birthday: profile?.birthday ?? "",
    position: row.position,
    portfolioUrl: row.portfolio_url ?? undefined,
    status: (row.status as ApplicationStatus) ?? "pending",
    interview,
    rejectionReason: row.rejection_reason ?? undefined,
    submittedAt: row.submitted_at,
  };
}

// ---------------------------------------------------------------------------
// Applicant: fetch own application
// ---------------------------------------------------------------------------
export function useMyApplication(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["my-application", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Application | null> => {
      if (!userId) return null;
      const { data: appRow, error: appErr } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (appErr) throw appErr;
      if (!appRow) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, phone, birthday, email")
        .eq("id", userId)
        .maybeSingle();

      return toApplication(appRow as ApplicationRow, profile as ProfileRow | null);
    },
  });
}

// ---------------------------------------------------------------------------
// Admin: list all applications (joined with profiles)
// ---------------------------------------------------------------------------
export function useAllApplications(enabled: boolean) {
  return useQuery({
    queryKey: ["all-applications"],
    enabled,
    queryFn: async (): Promise<Application[]> => {
      const { data: apps, error: appsErr } = await supabase
        .from("applications")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (appsErr) throw appsErr;

      const ids = (apps ?? []).map((a) => a.user_id);
      if (ids.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, phone, birthday, email")
        .in("id", ids);

      const profileById = new Map<string, ProfileRow>();
      (profiles ?? []).forEach((p) => profileById.set(p.id, p as ProfileRow));

      return (apps ?? []).map((a) =>
        toApplication(a as ApplicationRow, profileById.get(a.user_id) ?? null),
      );
    },
  });
}



// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      interview,
      rejectionReason,
    }: {
      id: string;
      status?: ApplicationStatus;
      interview?: Interview | null;
      rejectionReason?: string | null;
    }) => {
      const patch: {
        status?: ApplicationStatus;
        interview_type?: string | null;
        interview_date?: string | null;
        interview_time?: string | null;
        interview_location?: string | null;
        interview_location_url?: string | null;
        interview_meeting_url?: string | null;
        interview_notes?: string | null;
        rejection_reason?: string | null;
      } = {};
      if (status !== undefined) patch.status = status;
      if (interview !== undefined) {
        if (interview === null) {
          patch.interview_type = null;
          patch.interview_date = null;
          patch.interview_time = null;
          patch.interview_location = null;
          patch.interview_location_url = null;
          patch.interview_meeting_url = null;
          patch.interview_notes = null;
        } else {
          patch.interview_type = interview.type;
          patch.interview_date = interview.date;
          patch.interview_time = interview.time;
          patch.interview_location = interview.location ?? null;
          patch.interview_location_url = interview.locationUrl ?? null;
          patch.interview_meeting_url = interview.meetingUrl ?? null;
          patch.interview_notes = interview.notes ?? null;
        }
      }
      if (rejectionReason !== undefined) patch.rejection_reason = rejectionReason;

      const { error } = await supabase.from("applications").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-applications"] });
      qc.invalidateQueries({ queryKey: ["my-application"] });
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("delete_applicant", { target_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-applications"] }),
  });
}
