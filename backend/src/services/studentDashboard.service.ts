import { Enrollment } from "../models/Enrollment";
import { ClassSchedule } from "../models/ClassSchedule";
import { Task } from "../models/Task";
import { Submission } from "../models/Submission";
import { MockInterview } from "../models/MockInterview";
import { Announcement } from "../models/Announcement";
import { visibleAnnouncementFilter } from "./announcement.service";
import { getCourseProgress } from "./progress.service";
import { getAttendanceSummary } from "./attendance.service";
import { listFeeStatus } from "./fee.service";
import { listStudentBatchIds } from "../utils/batchAccess";

export async function getStudentDashboard(studentId: string) {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate("course", "name")
    .populate("batch", "name")
    .lean();

  const batchIds = await listStudentBatchIds(studentId);
  const primaryEnrollment = enrollments[0] ?? null;

  const publishedTaskIds = await Task.find({ batch: { $in: batchIds }, status: "PUBLISHED" }).distinct(
    "_id"
  );

  const [
    courseProgress,
    attendanceSummary,
    upcomingClasses,
    submittedCount,
    upcomingInterviews,
    feeRows,
    recentAnnouncements,
    recentGrades,
  ] = await Promise.all([
    primaryEnrollment
      ? getCourseProgress(studentId, String((primaryEnrollment.course as { _id: unknown })._id))
      : null,
    primaryEnrollment
      ? getAttendanceSummary(String((primaryEnrollment.batch as { _id: unknown })._id), studentId, "STUDENT")
      : Promise.resolve([]),
    ClassSchedule.find({ batch: { $in: batchIds }, date: { $gte: new Date() } })
      .populate("batch", "name")
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    Submission.countDocuments({ student: studentId, task: { $in: publishedTaskIds } }),
    MockInterview.countDocuments({ student: studentId, date: { $gte: new Date() } }),
    listFeeStatus({ page: 1, limit: 100 }, studentId),
    Announcement.find(await visibleAnnouncementFilter({ id: studentId, role: "STUDENT" }))
      .sort({ publishAt: -1 })
      .limit(5)
      .lean(),
    Submission.find({ student: studentId, status: "EVALUATED" })
      .populate("task", "title maxMarks")
      .sort({ evaluatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const pendingTasksCount = Math.max(0, publishedTaskIds.length - submittedCount);

  const feeDue = feeRows.rows.reduce((sum, row) => sum + row.amountDue, 0);

  return {
    enrollment: primaryEnrollment,
    courseProgress: courseProgress?.overallProgress ?? 0,
    attendancePercentage: attendanceSummary[0]?.percentage ?? 0,
    pendingTasksCount,
    upcomingClasses,
    upcomingInterviews,
    feeDue,
    recentAnnouncements,
    recentGrades,
  };
}
