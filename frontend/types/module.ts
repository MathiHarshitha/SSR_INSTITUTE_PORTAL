export interface AdminModule {
  _id: string;
  course: string;
  name: string;
  description?: string;
  estimatedDuration?: string;
  order: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleFormInput {
  name: string;
  description?: string;
  estimatedDuration?: string;
}

export interface AdminLesson {
  _id: string;
  module: string;
  course: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormInput {
  title: string;
  description?: string;
  estimatedMinutes?: number;
}
