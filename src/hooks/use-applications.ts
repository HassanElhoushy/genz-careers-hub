import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getApplicantEmails } from "@/lib/admin-applications.functions";
import type { Application, ApplicationStatus, Interview } from "@/types/application";


type ApplicationRow = {
  id: string;
  user_id: string;
  position: string;
  status: string;
  portfolio_url: string | null;
  interview_date: string | null;
  interview_time: string | null;
  interview_location: string | null;
  interview_location_url: string | null;
  interview_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
  phone: string | null;
  birthday: string | null;
};

function toApplication(
  row: ApplicationRow,
  profile: ProfileRow | null,
  email: string,
): Application {
  const interview: Interview | undefined = row.interview_date
    ? {
        date: row.interview_date,
        time: row.interview_time ?? "",
        location: row.interview_location ?? "",
        locationUrl: row.interview_location_url ?? undefined,
        notes: row.interview_notes ?? undefined,
      }
    : undefined;

  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name ?? "",
    email,
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
        .select("id, name, phone, birthday")
        .eq("id", userId)
        .maybeSingle();

      const { data: userData } = await supabase.auth.getUser();
      return toApplication(appRow as ApplicationRow, profile as ProfileRow | null, userData.user?.email ?? "");
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
        .select("id, name, phone, birthday")
        .in("id", ids);

      // Emails come from auth.users which is not directly queryable client-side;
      // fall back to blank + rely on name/phone. For a fuller admin view a
      // server function could join auth.users, but the current UI shows email
      // only in the desktop table — we keep it best-effort here.
      const profileById = new Map<string, ProfileRow>();
      (profiles ?? []).forEach((p) => profileById.set(p.id, p as ProfileRow));

      return (apps ?? []).map((a) =>
        toApplication(a as ApplicationRow, profileById.get(a.user_id) ?? null, ""),
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
        interview_date?: string | null;
        interview_time?: string | null;
        interview_location?: string | null;
        interview_location_url?: string | null;
        interview_notes?: string | null;
        rejection_reason?: string | null;
      } = {};
      if (status !== undefined) patch.status = status;
      if (interview !== undefined) {
        if (interview === null) {
          patch.interview_date = null;
          patch.interview_time = null;
          patch.interview_location = null;
          patch.interview_location_url = null;
          patch.interview_notes = null;
        } else {
          patch.interview_date = interview.date;
          patch.interview_time = interview.time;
          patch.interview_location = interview.location;
          patch.interview_location_url = interview.locationUrl ?? null;
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-applications"] }),
  });
}
