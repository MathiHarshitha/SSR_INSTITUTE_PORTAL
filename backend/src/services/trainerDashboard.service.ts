import { Batch } from "../models/Batch";
import { Enrollment } from "../models/Enrollment";
import { ClassSchedule } from "../models/ClassSchedule";
import { Submission } from "../models/Submission";
import { MockInterview } from "../models/MockInterview";
import { Announcement } from "../models/Announcement";
import { visibleAnnouncementFilter } from "./announcement.service";
import { listTrainerBatchIds } from "../utils/batchAccess";

function dayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getTrainerDashboard(trainerId: string) {
  const batchIds = await listTrainerBatchIds(trainerId);
  const { start, end } = dayRange(new Date());

  const [
    assignedBatches,
    totalStudents,
    todaysClasses,
    pendingEvaluations,
    upcomingInterviews,
    recentAnnouncements,
  ] = await Promise.all([
    Batch.countDocuments({ trainer: trainerId }),
    Enrollment.distinct("student", { batch: { $in: batchIds } }).then((ids) => ids.length),
    ClassSchedule.find({ batch: { $in: batchIds }, date: { $gte: start, $lt: end } })
      .populate("batch", "name")
      .sort({ startTime: 1 })
      .lean(),
    Submission.countDocuments({ batch: { $in: batchIds }, status: { $in: ["SUBMITTED", "LATE"] } }),
    MockInterview.countDocuments({ interviewer: trainerId, date: { $gte: new Date() } }),
    Announcement.find(await visibleAnnouncementFilter({ id: trainerId, role: "TRAINER" }))
      .sort({ publishAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    assignedBatches,
    totalStudents,
    todaysClasses,
    pendingEvaluations,
    upcomingInterviews,
    recentAnnouncements,
  };
}
