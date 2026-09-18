export const ROLES = ["ADMIN", "TRAINER", "STUDENT"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["PENDING", "ACTIVE", "REJECTED", "BLOCKED", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];
