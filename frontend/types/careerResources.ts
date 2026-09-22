export interface CareerResourceCourseStatus {
  courseId: string;
  courseName: string;
  completed: boolean;
  careerResourcesUnlocked: boolean;
}

export interface CareerResourcesStatus {
  anyUnlocked: boolean;
  courses: CareerResourceCourseStatus[];
}

export interface InterviewResource {
  _id: string;
  title: string;
  description?: string;
  course: string;
  fileUrl?: string;
  status: "COMING_SOON" | "PUBLISHED";
  createdAt: string;
}
