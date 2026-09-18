export interface TrainerDashboardStats {
  assignedBatches: number;
  totalStudents: number;
  todaysClasses: {
    _id: string;
    batch: { _id: string; name: string };
    startTime: string;
    endTime: string;
    topic: string;
  }[];
  pendingEvaluations: number;
  upcomingInterviews: number;
  recentAnnouncements: {
    _id: string;
    title: string;
    content: string;
    priority: string;
    publishAt: string;
  }[];
}
