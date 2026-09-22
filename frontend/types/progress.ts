export type ProgressState = "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";

export interface LessonProgressItem {
  lessonId: string;
  title: string;
  estimatedMinutes?: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
  state: ProgressState;
  completed: boolean;
  quizBestScore?: number;
}

export interface TopicProgress {
  topicId: string;
  name: string;
  order: number;
  state: ProgressState;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lessons: LessonProgressItem[];
}

export interface ModuleProgress {
  moduleId: string;
  name: string;
  order: number;
  state: ProgressState;
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
  allModulesCompleted: boolean;
  finalAssessmentUnlocked: boolean;
  hasFinalAssessment: boolean;
  courseCompleted: boolean;
  certificateUnlocked: boolean;
  careerResourcesUnlocked: boolean;
  modules: ModuleProgress[];
}
