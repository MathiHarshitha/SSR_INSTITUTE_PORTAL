export interface LessonProgressItem {
  lessonId: string;
  title: string;
  estimatedMinutes?: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
  completed: boolean;
  quizBestScore?: number;
}

export interface TopicProgress {
  topicId: string;
  name: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lessons: LessonProgressItem[];
}

export interface ModuleProgress {
  moduleId: string;
  name: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  topics: TopicProgress[];
}

export interface CourseProgress {
  courseId: string;
  overallProgress: number;
  totalLessons: number;
  totalCompleted: number;
  modules: ModuleProgress[];
}
