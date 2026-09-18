export type InterviewType = "TECHNICAL" | "HR" | "COMMUNICATION" | "PROJECT_REVIEW" | "APTITUDE";
export type InterviewResult = "PENDING" | "RECOMMENDED" | "NOT_RECOMMENDED";

export interface MockInterviewRow {
  _id: string;
  student: { _id: string; name: string; email: string };
  interviewer: { _id: string; name: string };
  batch?: { _id: string; name: string };
  date: string;
  time: string;
  meetingLink?: string;
  type: InterviewType;
  topics: string[];
  notes?: string;
  rating?: number;
  strengths?: string;
  weaknesses?: string;
  feedback?: string;
  recommendation?: string;
  result: InterviewResult;
}

export interface ScheduleInterviewInput {
  student: string;
  batch?: string;
  date: string;
  time: string;
  meetingLink?: string;
  type: InterviewType;
  topics?: string[];
  notes?: string;
}

export interface RecordFeedbackInput {
  rating: number;
  strengths?: string;
  weaknesses?: string;
  feedback?: string;
  recommendation?: string;
  result: InterviewResult;
}
