/* Development seed data. Run with `npm run seed`. Never run against production. */
import { connectDB, disconnectDB } from "../config/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { hashPassword } from "../utils/password";
import { User, IUser } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { Course, ICourse } from "../models/Course";
import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { Lesson } from "../models/Lesson";
import { Batch } from "../models/Batch";
import { Enrollment } from "../models/Enrollment";
import { curriculumDefs } from "./curriculum";

const ADMIN_EMAIL = "admin@ssrinstitute.in";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Passw0rd!";

export async function seedCourses() {
  const courseDefs = [
    { name: "MERN Full Stack", shortDescription: "MongoDB, Express, React, Node.js", duration: "6 Months", fee: 45000, category: "Full Stack" },
    { name: "Frontend Development", shortDescription: "HTML, CSS, JavaScript, React", duration: "3 Months", fee: 25000, category: "Frontend" },
    { name: "Python Full Stack", shortDescription: "Python, backend frameworks, SQL, REST APIs", duration: "6 Months", fee: 42000, category: "Full Stack" },
    { name: "Data Science", shortDescription: "Python, statistics, Pandas, visualization, ML foundations", duration: "5 Months", fee: 40000, category: "Data" },
    { name: "AI & Machine Learning", shortDescription: "Machine learning, deep learning, and modern generative AI", duration: "5 Months", fee: 48000, category: "Data" },
    { name: "Digital Marketing", shortDescription: "SEO, SEM, Social Media Marketing", duration: "2 Months", fee: 15000, category: "Marketing" },
    { name: "WordPress Development", shortDescription: "Build and manage professional WordPress websites", duration: "2 Months", fee: 18000, category: "Web" },
  ];

  const courses = [];
  for (const def of courseDefs) {
    const course = await Course.findOneAndUpdate(
      { name: def.name },
      { ...def, status: "PUBLISHED" },
      { upsert: true, new: true }
    );
    courses.push(course);
  }
  return courses;
}

async function seedAdmin() {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) return existing;

  const passwordHash = await hashPassword(SEED_PASSWORD);
  return User.create({
    name: "SSR Admin",
    email: ADMIN_EMAIL,
    phone: "9999999999",
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
    isEmailVerified: true,
  });
}

async function seedTrainers() {
  const defs = [
    { name: "Rahul Sharma", email: "rahul.trainer@ssrinstitute.in", specialization: "MERN Full Stack" },
    { name: "Priya Nair", email: "priya.trainer@ssrinstitute.in", specialization: "Python Full Stack" },
    { name: "Amit Verma", email: "amit.trainer@ssrinstitute.in", specialization: "Digital Marketing" },
  ];

  const passwordHash = await hashPassword(SEED_PASSWORD);
  const trainers = [];
  for (const def of defs) {
    let user = await User.findOne({ email: def.email });
    if (!user) {
      user = await User.create({
        name: def.name,
        email: def.email,
        phone: "9800000000",
        passwordHash,
        role: "TRAINER",
        status: "ACTIVE",
        isEmailVerified: true,
      });
      await TrainerProfile.create({
        user: user._id,
        qualification: "M.Tech",
        specialization: def.specialization,
        experienceYears: 5,
        skills: [def.specialization],
      });
    }
    trainers.push(user);
  }
  return trainers;
}

async function seedStudents(courseId: string) {
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const email = `student${i}@ssrinstitute.in`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: `Student ${i}`,
        email,
        phone: `98000000${String(i).padStart(2, "0")}`,
        passwordHash,
        role: "STUDENT",
        status: i <= 8 ? "ACTIVE" : "PENDING",
        isEmailVerified: true,
      });
      await StudentProfile.create({
        user: user._id,
        highestQualification: "B.Tech",
        college: "Sample Institute of Technology",
        interestedCourse: courseId,
        skills: ["JavaScript"],
      });
    }
    students.push(user);
  }
  return students;
}

/** One demo batch per course (idempotent by name), a trainer assigned round-robin so
 * `assertCourseContentAccess` and the trainer curriculum pages are testable out of the box. */
async function seedBatchesAndEnrollments(courses: ICourse[], trainers: IUser[], students: IUser[]) {
  const batches = [];
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const trainer = trainers[i % trainers.length];
    const name = `${course.name} - Batch 1`;
    const batch = await Batch.findOneAndUpdate(
      { course: course._id, name },
      {
        name,
        course: course._id,
        trainer: trainer._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        classDays: ["MON", "WED", "FRI"],
        startTime: "18:00",
        endTime: "20:00",
        mode: "ONLINE",
        capacity: 40,
        status: "ACTIVE",
      },
      { upsert: true, new: true }
    );
    batches.push(batch);
  }

  // Enroll active students across 2 courses each, so the multi-course "My Courses"
  // dashboard and cross-course search scoping are both demoable immediately.
  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  for (let i = 0; i < activeStudents.length; i++) {
    const student = activeStudents[i];
    const targetBatches = [batches[i % batches.length], batches[(i + 1) % batches.length]];
    for (const batch of targetBatches) {
      const exists = await Enrollment.findOne({ student: student._id, batch: batch._id });
      if (!exists) {
        await Enrollment.create({
          student: student._id,
          batch: batch._id,
          course: batch.course,
          enrolledAt: new Date(),
        });
      }
    }
  }

  return batches;
}

/** Upserts Module/Lesson trees from `curriculum/*.curriculum.ts` — idempotent on
 * (course, module name) and (module, lesson title), same upsert idiom as seedCourses. */
export async function seedCurriculum(courses: ICourse[]) {
  const courseByName = new Map(courses.map((c) => [c.name, c]));

  for (const courseDef of curriculumDefs) {
    const course = courseByName.get(courseDef.courseName);
    if (!course) {
      logger.warn(`seedCurriculum: no seeded course named "${courseDef.courseName}", skipping`);
      continue;
    }

    for (let mIndex = 0; mIndex < courseDef.modules.length; mIndex++) {
      const moduleDef = courseDef.modules[mIndex];
      const module = await Module.findOneAndUpdate(
        { course: course._id, name: moduleDef.name },
        {
          course: course._id,
          name: moduleDef.name,
          description: moduleDef.description,
          estimatedDuration: moduleDef.estimatedDuration,
          order: mIndex,
        },
        { upsert: true, new: true }
      );

      // Preferred shape: lessons already grouped into named topics. Legacy shape (a flat
      // `lessons` array with no topic grouping) is wrapped into one auto-generated topic per
      // module named after the module, so existing curriculum files keep seeding unchanged.
      const topicDefs =
        moduleDef.topics ?? [{ name: moduleDef.name, lessons: moduleDef.lessons ?? [] }];

      for (let tIndex = 0; tIndex < topicDefs.length; tIndex++) {
        const topicDef = topicDefs[tIndex];
        const topic = await Topic.findOneAndUpdate(
          { module: module._id, name: topicDef.name },
          {
            module: module._id,
            course: course._id,
            name: topicDef.name,
            description: topicDef.description,
            order: tIndex,
          },
          { upsert: true, new: true }
        );

        for (let lIndex = 0; lIndex < topicDef.lessons.length; lIndex++) {
          const lessonDef = topicDef.lessons[lIndex];
          await Lesson.findOneAndUpdate(
            { topic: topic._id, title: lessonDef.title },
            {
              topic: topic._id,
              module: module._id,
              course: course._id,
              title: lessonDef.title,
              description: lessonDef.description,
              estimatedMinutes: lessonDef.estimatedMinutes,
              order: lIndex,
              difficulty: lessonDef.difficulty ?? "BEGINNER",
              published: true,
              whatIsIt: lessonDef.whatIsIt,
              whyItMatters: lessonDef.whyItMatters,
              analogy: lessonDef.analogy,
              simpleExample: lessonDef.simpleExample,
              technicalExplanation: lessonDef.technicalExplanation,
              codeExamples: lessonDef.codeExamples ?? [],
              realWorldUsage: lessonDef.realWorldUsage,
              commonMistakes: lessonDef.commonMistakes ?? [],
              practice: lessonDef.practice ?? null,
              quiz: lessonDef.quiz ?? [],
              rememberThis: lessonDef.rememberThis,
              keyTakeaways: lessonDef.keyTakeaways ?? [],
            },
            { upsert: true, new: true }
          );
        }
      }
    }
  }
}

function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

async function run() {
  await connectDB();
  logger.info(`Seeding database: ${redactMongoUri(env.mongodbUri)}`);

  const courses = await seedCourses();
  await seedAdmin();
  const trainers = await seedTrainers();
  const students = await seedStudents(String(courses[0]._id));
  await seedBatchesAndEnrollments(courses, trainers, students);
  await seedCurriculum(courses);

  logger.info("Seed complete", {
    admin: ADMIN_EMAIL,
    password: SEED_PASSWORD,
    note: "Change this password immediately outside of development.",
  });

  await disconnectDB();
  process.exit(0);
}

if (require.main === module) {
  run().catch((error) => {
    logger.error("Seeding failed", error);
    process.exit(1);
  });
}
