export interface LessonProgressItem {
  lessonId: string;
  title: string;
  estimatedMinutes?: number;
  completed: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  name: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lessons: LessonProgressItem[];
}

export interface CourseProgress {
  courseId: string;
  overallProgress: number;
  totalLessons: number;
  totalCompleted: number;
  modules: ModuleProgress[];
}
