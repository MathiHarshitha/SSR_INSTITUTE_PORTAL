import { ProgressState } from "../constants/enums";

/**
 * Single source of truth for sequential course progression. Lock/unlock state is always
 * computed fresh from course structure + LessonProgress rows — never stored — so it can
 * never drift out of sync with the underlying completion facts, and survives refresh /
 * logout / re-login / reordering trivially (it's recomputed from durable data every call).
 *
 * Ordering is a single flat sequence across the whole course: modules by `order`, topics
 * within a module by `order`, lessons within a topic by `order`. A lesson unlocks only once
 * every lesson before it in that flat sequence is COMPLETED — this is what makes module
 * boundaries "unlock automatically" once every topic/lesson before them is done, without any
 * course-specific hardcoding (works identically for every course/curriculum shape).
 */

export interface LessonStageStatus {
  practiceRequired: boolean;
  practiceDone: boolean;
  quizRequired: boolean;
  quizDone: boolean;
  codingRequired: boolean;
  codingDone: boolean;
  /** The next stage the student must complete, or null if the lesson is fully done. */
  nextStage: "PRACTICE" | "QUIZ" | "CODING" | null;
}

export interface LessonLite {
  _id: unknown;
  topic: unknown;
  module: unknown;
  order: number;
  practice?: unknown;
  quiz?: unknown[];
  codingQuestion?: unknown;
}

export interface LessonProgressLite {
  lesson: unknown;
  practiceCompleted?: boolean;
  quizPassed?: boolean;
  codingCompleted?: boolean;
  completed?: boolean;
  quizAttempts?: number;
}

export interface TopicLite {
  _id: unknown;
  module: unknown;
  order: number;
}

export interface ModuleLite {
  _id: unknown;
  order: number;
}

export interface LessonNode {
  lessonId: string;
  state: ProgressState;
  stage: LessonStageStatus;
}

export interface TopicNode {
  topicId: string;
  state: ProgressState;
  lessonIds: string[];
}

export interface ModuleNode {
  moduleId: string;
  state: ProgressState;
  topicIds: string[];
}

export interface CourseProgressTree {
  lessons: Map<string, LessonNode>;
  topics: Map<string, TopicNode>;
  modules: Map<string, ModuleNode>;
  moduleOrder: string[];
  allModulesCompleted: boolean;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
}

/** Which stages a lesson actually has, and which of those the student has cleared. */
export function getLessonStageStatus(
  lesson: LessonLite,
  progress: LessonProgressLite | undefined
): LessonStageStatus {
  const practiceRequired = !!lesson.practice;
  const quizRequired = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
  const codingRequired = !!lesson.codingQuestion;

  const practiceDone = practiceRequired ? !!progress?.practiceCompleted : true;
  const quizDone = quizRequired ? !!progress?.quizPassed : true;
  const codingDone = codingRequired ? !!progress?.codingCompleted : true;

  let nextStage: LessonStageStatus["nextStage"] = null;
  if (practiceRequired && !practiceDone) nextStage = "PRACTICE";
  else if (quizRequired && !quizDone) nextStage = "QUIZ";
  else if (codingRequired && !codingDone) nextStage = "CODING";

  return { practiceRequired, practiceDone, quizRequired, quizDone, codingRequired, codingDone, nextStage };
}

/** True once every stage a lesson actually has has been cleared. */
export function isLessonStagesComplete(stage: LessonStageStatus): boolean {
  return stage.practiceDone && stage.quizDone && stage.codingDone;
}

function rollUpState(childStates: ProgressState[]): ProgressState {
  if (childStates.length === 0) return "COMPLETED";
  if (childStates.every((s) => s === "COMPLETED")) return "COMPLETED";
  if (childStates[0] === "LOCKED") return "LOCKED";
  if (childStates.some((s) => s === "IN_PROGRESS" || s === "COMPLETED")) return "IN_PROGRESS";
  return "UNLOCKED";
}

export function buildCourseProgressTree(
  modules: ModuleLite[],
  topics: TopicLite[],
  lessons: LessonLite[],
  progressRows: LessonProgressLite[]
): CourseProgressTree {
  const progressByLesson = new Map(progressRows.map((p) => [String(p.lesson), p]));

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const topicsByModule = new Map<string, TopicLite[]>();
  for (const t of topics) {
    const key = String(t.module);
    if (!topicsByModule.has(key)) topicsByModule.set(key, []);
    topicsByModule.get(key)!.push(t);
  }
  for (const list of topicsByModule.values()) list.sort((a, b) => a.order - b.order);

  const lessonsByTopic = new Map<string, LessonLite[]>();
  for (const l of lessons) {
    const key = String(l.topic);
    if (!lessonsByTopic.has(key)) lessonsByTopic.set(key, []);
    lessonsByTopic.get(key)!.push(l);
  }
  for (const list of lessonsByTopic.values()) list.sort((a, b) => a.order - b.order);

  const lessonNodes = new Map<string, LessonNode>();
  const topicNodes = new Map<string, TopicNode>();
  const moduleNodes = new Map<string, ModuleNode>();
  const moduleOrder: string[] = [];

  let priorLessonCompleted = true; // the very first lesson in the course is always reachable
  let totalLessons = 0;
  let completedLessons = 0;

  for (const mod of sortedModules) {
    const moduleId = String(mod._id);
    moduleOrder.push(moduleId);
    const moduleTopics = topicsByModule.get(moduleId) ?? [];
    const topicIds: string[] = [];

    for (const topic of moduleTopics) {
      const topicId = String(topic._id);
      topicIds.push(topicId);
      const topicLessons = lessonsByTopic.get(topicId) ?? [];
      const lessonIds: string[] = [];

      for (const lesson of topicLessons) {
        const lessonId = String(lesson._id);
        lessonIds.push(lessonId);
        totalLessons += 1;

        const progress = progressByLesson.get(lessonId);
        const stage = getLessonStageStatus(lesson, progress);
        const completed = !!progress?.completed && isLessonStagesComplete(stage);

        let state: ProgressState;
        if (completed) {
          state = "COMPLETED";
          completedLessons += 1;
        } else if (!priorLessonCompleted) {
          state = "LOCKED";
        } else {
          const anyStarted =
            !!progress &&
            ((stage.practiceRequired && stage.practiceDone) ||
              (stage.quizRequired && stage.quizDone) ||
              (stage.codingRequired && stage.codingDone) ||
              (progress.quizAttempts ?? 0) > 0);
          state = anyStarted ? "IN_PROGRESS" : "UNLOCKED";
        }

        lessonNodes.set(lessonId, { lessonId, state, stage });
        priorLessonCompleted = completed;
      }

      const topicLessonStates = lessonIds.map((id) => lessonNodes.get(id)!.state);
      topicNodes.set(topicId, { topicId, state: rollUpState(topicLessonStates), lessonIds });
    }

    const moduleTopicStates = topicIds.map((id) => topicNodes.get(id)!.state);
    moduleNodes.set(moduleId, { moduleId, state: rollUpState(moduleTopicStates), topicIds });
  }

  const allModulesCompleted =
    moduleOrder.length > 0 && moduleOrder.every((id) => moduleNodes.get(id)!.state === "COMPLETED");

  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    lessons: lessonNodes,
    topics: topicNodes,
    modules: moduleNodes,
    moduleOrder,
    allModulesCompleted,
    totalLessons,
    completedLessons,
    overallProgress,
  };
}

export function getLessonNode(tree: CourseProgressTree, lessonId: string): LessonNode | undefined {
  return tree.lessons.get(lessonId);
}
