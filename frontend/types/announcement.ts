export type AnnouncementAudience = "EVERYONE" | "STUDENTS" | "TRAINERS" | "BATCH" | "COURSE";
export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH";

export interface AdminAnnouncement {
  _id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  batch?: { _id: string; name: string };
  course?: { _id: string; name: string };
  priority: AnnouncementPriority;
  publishAt: string;
  expiresAt?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface AnnouncementFormInput {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  batch?: string;
  course?: string;
  priority: AnnouncementPriority;
  publishAt?: string;
  expiresAt?: string;
}

export interface AnnouncementListQuery {
  page: number;
  limit: number;
  audience?: AnnouncementAudience;
}
