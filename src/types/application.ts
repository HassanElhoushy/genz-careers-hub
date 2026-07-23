export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type Interview = {
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // HH:mm
  location: string;
  locationUrl?: string;
  notes?: string;
};

/**
 * A joined view of an applicant's application + profile, as consumed by the UI.
 * Passwords live only in Supabase Auth — never in this shape.
 */
export type Application = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthday: string; // ISO date
  position: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  interview?: Interview;
  rejectionReason?: string;
  submittedAt: string; // ISO datetime
};
