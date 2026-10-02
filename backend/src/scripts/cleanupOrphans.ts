/**
 * Finds records that still point at user accounts which no longer exist (e.g. students deleted
 * directly in the database) and, with --apply, deletes them.
 *
 *   npm run cleanup:orphans            # preview only — changes nothing
 *   npm run cleanup:orphans -- --apply # delete the orphaned records listed in the preview
 *
 * Financial and credential records (payments, payment requests, certificates) are never deleted
 * — they are only reported, so they can be reviewed by hand.
 */
import { Model } from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { Enrollment } from "../models/Enrollment";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { Notification } from "../models/Notification";
import { Session } from "../models/Session";
import { LessonProgress } from "../models/LessonProgress";
import { QuizAttempt } from "../models/QuizAttempt";
import { CodingSubmission } from "../models/CodingSubmission";
import { FinalAssessmentAttempt } from "../models/FinalAssessmentAttempt";
import { Submission } from "../models/Submission";
import { Attendance } from "../models/Attendance";
import { JobApplication } from "../models/JobApplication";
import { MockInterview } from "../models/MockInterview";
import { Payment } from "../models/Payment";
import { PaymentRequest } from "../models/PaymentRequest";
import { Certificate } from "../models/Certificate";

interface Target {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  field: string;
}

const DELETABLE: Target[] = [
  { label: "Enrollments", model: Enrollment, field: "student" },
  { label: "Student profiles", model: StudentProfile, field: "user" },
  { label: "Trainer profiles", model: TrainerProfile, field: "user" },
  { label: "Notifications", model: Notification, field: "user" },
  { label: "Sessions", model: Session, field: "user" },
  { label: "Lesson progress", model: LessonProgress, field: "student" },
  { label: "Quiz attempts", model: QuizAttempt, field: "student" },
  { label: "Coding submissions", model: CodingSubmission, field: "student" },
  { label: "Final assessment attempts", model: FinalAssessmentAttempt, field: "student" },
  { label: "Task submissions", model: Submission, field: "student" },
  { label: "Attendance records", model: Attendance, field: "student" },
  { label: "Job applications", model: JobApplication, field: "student" },
  { label: "Mock interviews", model: MockInterview, field: "student" },
];

const REPORT_ONLY: Target[] = [
  { label: "Payments (ledger)", model: Payment, field: "student" },
  { label: "Payment requests", model: PaymentRequest, field: "student" },
  { label: "Certificates", model: Certificate, field: "student" },
];

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  await connectDB();
  try {
    const existing = await User.find().distinct("_id");
    const orphanFilter = (field: string) => ({ [field]: { $exists: true, $ne: null, $nin: existing } });

    console.log(apply ? "Deleting orphaned records…\n" : "PREVIEW — nothing will be changed. Re-run with --apply to delete.\n");
    let total = 0;
    for (const t of DELETABLE) {
      const count = await t.model.countDocuments(orphanFilter(t.field));
      total += count;
      if (apply && count > 0) await t.model.deleteMany(orphanFilter(t.field));
      console.log(`${t.label.padEnd(28)} ${String(count).padStart(5)} ${apply && count > 0 ? "deleted" : ""}`);
    }

    console.log("\nKept for manual review (never deleted by this script):");
    for (const t of REPORT_ONLY) {
      console.log(`${t.label.padEnd(28)} ${String(await t.model.countDocuments(orphanFilter(t.field))).padStart(5)}`);
    }
    console.log(`\n${apply ? "Deleted" : "Would delete"} ${total} orphaned record(s).`);
  } finally {
    await disconnectDB();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
