export interface MyEnrollment {
  enrollmentId: string;
  course: {
    _id: string;
    name: string;
    shortDescription: string;
    category?: string;
    duration: string;
    thumbnailUrl?: string;
  };
  enrolledAt: string;
  lastVisitedLesson: { _id: string; title: string } | null;
  lastVisitedAt?: string;
  overallProgress: number;
  totalLessons: number;
  totalCompleted: number;
  courseCompleted: boolean;
  certificateUnlocked: boolean;
}
