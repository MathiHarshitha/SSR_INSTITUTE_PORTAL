import { FilterQuery } from "mongoose";
import { Job, IJob } from "../models/Job";
import { JobApplication, IJobApplication } from "../models/JobApplication";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
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

  await recordAudit({
    userId: adminId,
    action: "APPLICATION_STATUS_CHANGED",
    entity: "JobApplication",
    entityId: application._id,
    metadata: { status },
  });

  return application;
}
