export const ROLES = ["ADMIN", "TRAINER", "STUDENT"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["PENDING", "ACTIVE", "REJECTED", "BLOCKED", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

/** Sequential progression state for lessons/topics/modules/courses. */
export const PROGRESS_STATES = ["LOCKED", "UNLOCKED", "IN_PROGRESS", "COMPLETED"] as const;
export type ProgressState = (typeof PROGRESS_STATES)[number];

/** Passing threshold applied to lesson quizzes and the course final assessment. */
export const QUIZ_PASS_PERCENT = 60;
