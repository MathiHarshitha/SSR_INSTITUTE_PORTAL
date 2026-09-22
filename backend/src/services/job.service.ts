import mongoose, { FilterQuery } from "mongoose";
import { Job, IJob } from "../models/Job";
import { JobApplication, IJobApplication } from "../models/JobApplication";
import { Enrollment } from "../models/Enrollment";
import { Attendance } from "../models/Attendance";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { assertAnyCourseCompleted } from "./careerResources.service";
import { recordAudit } from "./auditLog.service";
import { notifyUser } from "./notification.service";
import { emailService } from "./email.service";
import {
  CreateJobInput,
  ListApplicationsQuery,
  ListJobsQuery,
  UpdateJobInput,
} from "../validators/job.validator";

export async function createJob(adminId: string, input: CreateJobInput) {
  const job = await Job.create({
    ...input,
    jobLink: input.jobLink || undefined,
    skills: input.skills ?? [],
    eligibleCourses: input.eligibleCourses ?? [],
    createdBy: adminId,
  });

  await recordAudit({ userId: adminId, action: "JOB_CREATED", entity: "Job", entityId: job._id });
  return job;
}

export async function listJobsAdmin(query: ListJobsQuery) {
  const filter: FilterQuery<IJob> = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ title: regex }, { company: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Job.countDocuments(filter),
  ]);

  const applicationCounts = await JobApplication.aggregate<{ _id: unknown; count: number }>([
    { $match: { job: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(applicationCounts.map((c) => [String(c._id), c.count]));

  return {
    jobs: jobs.map((j) => ({ ...j, applicationCount: countMap.get(String(j._id)) ?? 0 })),
    total,
  };
}

export async function getJobById(id: string) {
  const job = await Job.findById(id).populate("eligibleCourses", "name").lean();
  if (!job) throw ApiError.notFound("Job not found");
  return job;
}

export async function updateJob(adminId: string, id: string, input: UpdateJobInput) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound("Job not found");

  const { jobLink, ...rest } = input;
  Object.assign(job, rest);
  if (jobLink !== undefined) job.jobLink = jobLink || undefined;
  await job.save();

  await recordAudit({ userId: adminId, action: "JOB_UPDATED", entity: "Job", entityId: job._id });
  return job;
}

export async function updateJobStatus(adminId: string, id: string, status: IJob["status"]) {
  const job = await Job.findById(id);
  if (!job) throw ApiError.notFound("Job not found");

  job.status = status;
  await job.save();

  await recordAudit({
    userId: adminId,
    action: "JOB_STATUS_CHANGED",
    entity: "Job",
    entityId: job._id,
    metadata: { status },
  });
  return job;
}

export async function listApplicationsForJob(jobId: string, query: ListApplicationsQuery) {
  const filter: FilterQuery<IJobApplication> = { job: jobId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter)
      .populate("student", "name email phone")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    JobApplication.countDocuments(filter),
  ]);

  return { applications, total };
}

async function getStudentOverallAttendancePercent(studentId: string): Promise<number | null> {
  const stats = await Attendance.aggregate<{ total: number; present: number }>([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE"]] }, 1, 0] } },
      },
    },
  ]);
  if (!stats.length || stats[0].total === 0) return null;
  return Math.round((stats[0].present / stats[0].total) * 100);
}

export async function listPublishedJobsForStudent(studentId: string) {
  const enrolledCourseIds = (await Enrollment.find({ student: studentId }).select("course").lean()).map(
    (e) => String(e.course)
  );
  const attendancePercent = await getStudentOverallAttendancePercent(studentId);

  const jobs = await Job.find({ status: "PUBLISHED", applicationDeadline: { $gte: new Date() } })
    .populate("eligibleCourses", "name")
    .sort({ applicationDeadline: 1 })
    .lean();

  const myApplications = await JobApplication.find({ student: studentId })
    .select("job status")
    .lean();
  const appliedMap = new Map(myApplications.map((a) => [String(a.job), a.status]));

  return jobs.map((job) => {
    const courseMatch =
      job.eligibleCourses.length === 0 ||
      job.eligibleCourses.some((c) => enrolledCourseIds.includes(String((c as { _id: unknown })._id)));
    const attendanceMatch =
      job.minAttendancePercent == null ||
      attendancePercent == null ||
      attendancePercent >= job.minAttendancePercent;

    return {
      ...job,
      isEligible: courseMatch && attendanceMatch,
      applicationStatus: appliedMap.get(String(job._id)) ?? null,
    };
  });
}

/** Re-derives the same course/attendance eligibility shown to the student in
 * listPublishedJobsForStudent, server-side, so a direct API call can't bypass the
 * "Not eligible" UI gate (spec §12/§13: never trust a client-sent eligibility flag). */
async function assertEligibleForJob(studentId: string, job: IJob): Promise<void> {
  if (job.eligibleCourses.length > 0) {
    const enrolledCourseIds = (
      await Enrollment.find({ student: studentId }).select("course").lean()
    ).map((e) => String(e.course));
    const courseMatch = job.eligibleCourses.some((c) => enrolledCourseIds.includes(String(c)));
    if (!courseMatch) throw ApiError.forbidden("You are not eligible for this job");
  }

  if (job.minAttendancePercent != null) {
    const attendancePercent = await getStudentOverallAttendancePercent(studentId);
    if (attendancePercent == null || attendancePercent < job.minAttendancePercent) {
      throw ApiError.forbidden("You are not eligible for this job");
    }
  }
}

export async function applyToJob(studentId: string, jobId: string, resumeUrl?: string) {
  const job = await Job.findById(jobId).lean();
  if (!job) throw ApiError.notFound("Job not found");
  if (job.status !== "PUBLISHED") throw ApiError.badRequest("This job is not accepting applications");
  if (job.applicationDeadline < new Date()) {
    throw ApiError.badRequest("The application deadline has passed");
  }

  const careerResourcesUnlocked = await assertAnyCourseCompleted(studentId);
  if (!careerResourcesUnlocked) {
    throw ApiError.forbidden("Complete a course to unlock Career Resources");
  }
  await assertEligibleForJob(studentId, job as unknown as IJob);

  const existing = await JobApplication.findOne({ job: jobId, student: studentId }).lean();
  if (existing) throw ApiError.conflict("You have already applied to this job");

  const application = await JobApplication.create({
    job: jobId,
    student: studentId,
    resumeUrl,
  });

  await recordAudit({
    userId: studentId,
    action: "JOB_APPLICATION_SUBMITTED",
    entity: "JobApplication",
    entityId: application._id,
  });

  return application;
}

export async function listMyApplications(studentId: string) {
  return JobApplication.find({ student: studentId })
    .populate("job", "title company applicationDeadline status")
    .sort({ appliedAt: -1 })
    .lean();
}

export async function withdrawApplication(studentId: string, applicationId: string) {
  const application = await JobApplication.findOne({ _id: applicationId, student: studentId });
  if (!application) throw ApiError.notFound("Application not found");
  if (["SELECTED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
    throw ApiError.badRequest(`Cannot withdraw an application that is already ${application.status}`);
  }

  application.status = "WITHDRAWN";
  await application.save();
  return application;
}

export async function updateApplicationStatus(
  adminId: string,
  applicationId: string,
  status: IJobApplication["status"],
  statusNote?: string
) {
  const application = await JobApplication.findById(applicationId);
  if (!application) throw ApiError.notFound("Application not found");

  application.status = status;
  if (statusNote !== undefined) application.statusNote = statusNote;
  await application.save();

  const [job, student] = await Promise.all([
    Job.findById(application.job).select("title company").lean(),
    User.findById(application.student).select("name email").lean(),
  ]);
  if (job && student) {
    await notifyUser(String(application.student), {
      type: "APPLICATION_STATUS_CHANGED",
      title: `Application update: ${job.title}`,
      message: `Your application to ${job.company} is now ${status.replace("_", " ").toLowerCase()}.`,
      link: "/student/jobs",
    });
    await emailService.sendApplicationStatusChanged(student.email, student.name, job.title, job.company, status);
  }

  await recordAudit({
    userId: adminId,
    action: "APPLICATION_STATUS_CHANGED",
    entity: "JobApplication",
    entityId: application._id,
    metadata: { status },
  });

  return application;
}
