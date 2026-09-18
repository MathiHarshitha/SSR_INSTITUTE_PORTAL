/* Development seed data. Run with `npm run seed`. Never run against production. */
import { connectDB, disconnectDB } from "../config/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { hashPassword } from "../utils/password";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { Course } from "../models/Course";

const ADMIN_EMAIL = "admin@ssrinstitute.in";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Passw0rd!";

async function seedCourses() {
  const courseDefs = [
    { name: "MERN Full Stack", shortDescription: "MongoDB, Express, React, Node.js", duration: "6 Months", fee: 45000, category: "Full Stack" },
    { name: "Frontend Development", shortDescription: "HTML, CSS, JavaScript, React", duration: "3 Months", fee: 25000, category: "Frontend" },
    { name: "Python Full Stack", shortDescription: "Python, Django, React", duration: "6 Months", fee: 42000, category: "Full Stack" },
    { name: "Digital Marketing", shortDescription: "SEO, SEM, Social Media Marketing", duration: "2 Months", fee: 15000, category: "Marketing" },
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

function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

async function run() {
  await connectDB();
  logger.info(`Seeding database: ${redactMongoUri(env.mongodbUri)}`);

  const courses = await seedCourses();
  await seedAdmin();
  await seedTrainers();
  await seedStudents(String(courses[0]._id));

  logger.info("Seed complete", {
    admin: ADMIN_EMAIL,
    password: SEED_PASSWORD,
    note: "Change this password immediately outside of development.",
  });

  await disconnectDB();
  process.exit(0);
}

run().catch((error) => {
  logger.error("Seeding failed", error);
  process.exit(1);
});
