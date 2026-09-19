export interface StudentProfileData {
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  highestQualification?: string;
  college?: string;
  graduationYear?: number;
  percentageOrCgpa?: string;
  skills: string[];
  experience?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface TrainerProfileData {
  qualification?: string;
  specialization?: string;
  experienceYears?: number;
  bio?: string;
  skills: string[];
  resumeUrl?: string;
}

export interface UpdateMeInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export type UpdateStudentProfileInput = Partial<StudentProfileData>;
export type UpdateTrainerProfileInput = Partial<TrainerProfileData>;
