import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as jobService from "../services/job.service";
import {
  CreateJobInput,
  ListApplicationsQuery,
  ListJobsQuery,
  UpdateJobInput,
} from "../validators/job.validator";
import { JobStatus } from "../models/Job";
import { ApplicationStatus } from "../models/JobApplication";

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.createJob(req.user!.id, req.body as CreateJobInput);
  sendSuccess(res, 201, "Job created", job);
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListJobsQuery;
  const { jobs, total } = await jobService.listJobsAdmin(query);
  sendSuccess(res, 200, "Jobs fetched", jobs, buildPaginationMeta(query.page, query.limit, total));
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobById(req.params.id as string);
  sendSuccess(res, 200, "Job fetched", job);
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.updateJob(req.user!.id, req.params.id as string, req.body as UpdateJobInput);
  sendSuccess(res, 200, "Job updated", job);
});

export const updateJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: JobStatus };
  const job = await jobService.updateJobStatus(req.user!.id, req.params.id as string, status);
  sendSuccess(res, 200, "Job status updated", job);
});

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListApplicationsQuery;
  const { applications, total } = await jobService.listApplicationsForJob(
    req.params.id as string,
    query
  );
  sendSuccess(
    res,
    200,
    "Applications fetched",
    applications,
    buildPaginationMeta(query.page, query.limit, total)
  );
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, statusNote } = req.body as { status: ApplicationStatus; statusNote?: string };
  const application = await jobService.updateApplicationStatus(
    req.user!.id,
    req.params.applicationId as string,
    status,
    statusNote
  );
  sendSuccess(res, 200, "Application status updated", application);
});
