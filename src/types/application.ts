export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type Interview = {
  date: string; // ISO date
  time: string; // HH:mm
  location: string;
  locationUrl?: string;
  notes?: string;
};

export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string; // ISO date
  position: string;
  password: string; // demo-only, plain-text (localStorage)
  status: ApplicationStatus;
  interview?: Interview;
  rejectionReason?: string;
  submittedAt: string; // ISO datetime
};
