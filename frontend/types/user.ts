import { Role, UserStatus } from "@/types/auth";

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  rejectionReason?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  profile: Record<string, unknown> | null;
}

export interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

export interface RoleStatCounts {
  total: number;
  active: number;
  pending: number;
  blocked: number;
  rejected: number;
  suspended: number;
}

export interface UserStats {
  students: RoleStatCounts;
  trainers: RoleStatCounts;
  totalCourses: number;
}
