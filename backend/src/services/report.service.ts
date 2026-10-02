import { Types } from "mongoose";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { Batch } from "../models/Batch";
import { Enrollment } from "../models/Enrollment";
import { Payment } from "../models/Payment";
import { Attendance } from "../models/Attendance";
import { Certificate } from "../models/Certificate";
import { JobApplication } from "../models/JobApplication";
import { countableStudentIds } from "../utils/countableStudents";

/** Every figure below only counts real, existing students — test accounts and rows left behind
 * by deleted users are excluded (see countableStudentIds). */
type Ids = Types.ObjectId[];
const onlyCountable = (ids: Ids) => ({ $match: { student: { $in: ids } } });

async function getEnrollmentsByCourse(ids: Ids) {
  const rows = await Enrollment.aggregate<{ _id: Types.ObjectId; count: number; courseName: string }>([
    onlyCountable(ids),
    { $group: { _id: "$course", count: { $sum: 1 } } },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $project: { count: 1, courseName: "$course.name" } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ courseId: String(r._id), courseName: r.courseName, enrolledCount: r.count }));
}

async function getFeeCollectionByBatch(ids: Ids) {
  const [finalFeeByBatch, collectedByBatch] = await Promise.all([
    Enrollment.aggregate<{ _id: Types.ObjectId; totalFinalFee: number }>([
      onlyCountable(ids),
      { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      {
        $group: {
          _id: "$batch",
          totalFinalFee: { $sum: { $max: [0, { $subtract: ["$course.fee", "$discount"] }] } },
        },
      },
    ]),
    Payment.aggregate<{ _id: Types.ObjectId; collected: number }>([
      onlyCountable(ids),
      { $group: { _id: "$batch", collected: { $sum: "$amount" } } },
    ]),
  ]);

  const collectedMap = new Map(collectedByBatch.map((r) => [String(r._id), r.collected]));
  const batchIds = finalFeeByBatch.map((r) => r._id);
  const batches = await Batch.find({ _id: { $in: batchIds } }).select("name").lean();
  const nameMap = new Map(batches.map((b) => [String(b._id), b.name]));

  return finalFeeByBatch
    .map((r) => {
      const collected = collectedMap.get(String(r._id)) ?? 0;
      return {
        batchId: String(r._id),
        batchName: nameMap.get(String(r._id)) ?? "Unknown batch",
        collected,
        pending: Math.max(0, r.totalFinalFee - collected),
      };
    })
    .sort((a, b) => b.collected + b.pending - (a.collected + a.pending));
}

async function getAttendanceByBatch(ids: Ids) {
  const rows = await Attendance.aggregate<{ _id: Types.ObjectId; total: number; present: number }>([
    onlyCountable(ids),
    {
      $group: {
        _id: "$batch",
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
      },
    },
  ]);

  const batchIds = rows.map((r) => r._id);
  const batches = await Batch.find({ _id: { $in: batchIds } }).select("name").lean();
  const nameMap = new Map(batches.map((b) => [String(b._id), b.name]));

  return rows
    .map((r) => ({
      batchId: String(r._id),
      batchName: nameMap.get(String(r._id)) ?? "Unknown batch",
      averagePercent: r.total === 0 ? 0 : Math.round((r.present / r.total) * 100),
    }))
    .sort((a, b) => a.batchName.localeCompare(b.batchName));
}

async function getApplicationsByStatus(ids: Ids) {
  const rows = await JobApplication.aggregate<{ _id: string; count: number }>([
    onlyCountable(ids),
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return rows.map((r) => ({ status: r._id, count: r.count }));
}

async function getEnrollmentsOverTime(ids: Ids) {
  const rows = await Enrollment.aggregate<{ _id: string; count: number }>([
    onlyCountable(ids),
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$enrolledAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);
  return rows.map((r) => ({ month: r._id, count: r.count }));
}

export async function getReportsOverview() {
  const ids = await countableStudentIds();
  const [
    totalStudents,
    totalTrainers,
    totalCourses,
    totalBatches,
    revenueCollectedTotal,
    totalCertificatesIssued,
    enrollmentsByCourse,
    feeCollectionByBatch,
    attendanceByBatch,
    applicationsByStatus,
    enrollmentsOverTime,
  ] = await Promise.all([
    User.countDocuments({ role: "STUDENT", status: "ACTIVE", isTestAccount: { $ne: true } }),
    User.countDocuments({ role: "TRAINER", status: "ACTIVE", isTestAccount: { $ne: true } }),
    Course.countDocuments({ status: "PUBLISHED" }),
    Batch.countDocuments(),
    Payment.aggregate<{ _id: null; total: number }>([
      onlyCountable(ids),
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((r) => r[0]?.total ?? 0),
    Certificate.countDocuments({ status: "ISSUED", student: { $in: ids } }),
    getEnrollmentsByCourse(ids),
    getFeeCollectionByBatch(ids),
    getAttendanceByBatch(ids),
    getApplicationsByStatus(ids),
    getEnrollmentsOverTime(ids),
  ]);

  const totalRevenuePending = feeCollectionByBatch.reduce((sum, b) => sum + b.pending, 0);

  const overallAttendance = attendanceByBatch.length
    ? Math.round(attendanceByBatch.reduce((sum, b) => sum + b.averagePercent, 0) / attendanceByBatch.length)
    : 0;

  const selectedCount = applicationsByStatus.find((a) => a.status === "SELECTED")?.count ?? 0;
  const totalApplications = applicationsByStatus.reduce((sum, a) => sum + a.count, 0);
  const placementSelectionRate =
    totalApplications === 0 ? 0 : Math.round((selectedCount / totalApplications) * 100);

  return {
    summary: {
      totalStudents,
      totalTrainers,
      totalCourses,
      totalBatches,
      revenueCollectedTotal,
      totalRevenuePending,
      overallAttendance,
      totalCertificatesIssued,
      totalApplications,
      placementSelectionRate,
    },
    enrollmentsByCourse,
    feeCollectionByBatch,
    attendanceByBatch,
    applicationsByStatus,
    enrollmentsOverTime,
  };
}
