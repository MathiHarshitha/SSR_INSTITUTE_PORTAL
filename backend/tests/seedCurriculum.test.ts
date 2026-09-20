import { seedCourses, seedCurriculum } from "../src/seed/seed";
import { curriculumDefs } from "../src/seed/curriculum";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";

describe("seedCurriculum", () => {
  it("wires every curriculum def to a matching seeded course", async () => {
    const courses = await seedCourses();
    const courseNames = new Set(courses.map((c) => c.name));
    for (const def of curriculumDefs) {
      expect(courseNames.has(def.courseName)).toBe(true);
    }
  });

  it("upserts modules/topics/lessons losslessly for every course, and lessons carry a topic", async () => {
    const courses = await seedCourses();
    await seedCurriculum(courses);

    let totalDefLessons = 0;
    for (const def of curriculumDefs) {
      for (const mod of def.modules) {
        totalDefLessons += mod.topics
          ? mod.topics.reduce((sum, t) => sum + t.lessons.length, 0)
          : (mod.lessons?.length ?? 0);
      }
    }

    const totalModules = await Module.countDocuments({});
    const totalTopics = await Topic.countDocuments({});
    const totalLessons = await Lesson.countDocuments({});
    const lessonsWithoutTopic = await Lesson.countDocuments({ topic: { $exists: false } });

    expect(totalTopics).toBeGreaterThan(0);
    expect(totalModules).toBeGreaterThan(0);
    expect(totalLessons).toBe(totalDefLessons);
    expect(lessonsWithoutTopic).toBe(0);

    // Every lesson's topic must belong to the same module as the lesson (hierarchy integrity).
    const lessons = await Lesson.find({}).select("topic module").lean();
    const topicsById = new Map((await Topic.find({}).select("module").lean()).map((t) => [String(t._id), String(t.module)]));
    for (const lesson of lessons) {
      expect(topicsById.get(String(lesson.topic))).toBe(String(lesson.module));
    }
  }, 120000);

  it("is idempotent — re-running seedCurriculum does not duplicate content", async () => {
    const courses = await seedCourses();
    await seedCurriculum(courses);
    const firstLessonCount = await Lesson.countDocuments({});
    const firstTopicCount = await Topic.countDocuments({});

    await seedCurriculum(courses);
    expect(await Lesson.countDocuments({})).toBe(firstLessonCount);
    expect(await Topic.countDocuments({})).toBe(firstTopicCount);
  }, 120000);
});
