export const POSITIONS = [
  "Web Developer",
  "AI Engineer",
  "Graphic Designer",
  "Video Editor",
  "Content Creator",
  "Social Media Specialist",
  "Digital Marketing Specialist",
  "Fashion Designer",
  "Sales Associate",
  "Store Manager",
  "Customer Support",
  "HR Specialist",
  "Operations Coordinator",
] as const;

export type Position = (typeof POSITIONS)[number];
