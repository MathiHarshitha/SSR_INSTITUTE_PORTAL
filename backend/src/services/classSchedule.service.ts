import { FilterQuery } from "mongoose";
import { ClassSchedule, IClassSchedule } from "../models/ClassSchedule";
import { ApiError } from "../utils/ApiError";
import { assertBatchAccess, listTrainerBatchIds } from "../utils/batchAccess";
import { recordAudit } from "./auditLog.service";
import { Role } from "../constants/enums";
import {
  CreateClassScheduleInput,
  ListClassSchedulesQuery,
  UpdateClassScheduleInput,
} from "../validators/classSchedule.validator";

export async function createClass(userId: string, role: Role, input: CreateClassScheduleInput) {
  await assertBatchAccess(input.batch, userId, role);

  const classSchedule = await ClassSchedule.create({
    ...input,
    meetingLink: input.meetingLink || undefined,
    createdBy: userId,
  });

  await recordAudit({
    userId,
    action: "CLASS_SCHEDULED",
    entity: "ClassSchedule",
    entityId: classSchedule._id,
  });

  return classSchedule;
}

export async function listClasses(userId: string, role: Role, query: ListClassSchedulesQuery) {
  const filter: FilterQuery<IClassSchedule> = {};

  if (query.batch) {
    await assertBatchAccess(query.batch, userId, role);
    filter.batch = query.batch;
  } else if (role === "TRAINER") {
    filter.batch = { $in: await listTrainerBatchIds(userId) };
  }

  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  return ClassSchedule.find(filter)
    .populate("batch", "name")
    .populate("module", "name")
    .sort({ date: 1, startTime: 1 })
    .lean();
}

export async function updateClass(
  userId: string,
  role: Role,
  id: string,
  input: UpdateClassScheduleInput
) {
  const classSchedule = await ClassSchedule.findById(id);
  if (!classSchedule) throw ApiError.notFound("Class not found");

  await assertBatchAccess(String(classSchedule.batch), userId, role);

  const { meetingLink, ...rest } = input;
  Object.assign(classSchedule, rest);
  if (meetingLink !== undefined) classSchedule.meetingLink = meetingLink || undefined;
  await classSchedule.save();

  await recordAudit({
    userId,
    action: "CLASS_UPDATED",
    entity: "ClassSchedule",
    entityId: classSchedule._id,
  });
  return classSchedule;
}

export async function deleteClass(userId: string, role: Role, id: string) {
  const classSchedule = await ClassSchedule.findById(id);
  if (!classSchedule) throw ApiError.notFound("Class not found");

  await assertBatchAccess(String(classSchedule.batch), userId, role);

  await classSchedule.deleteOne();
  await recordAudit({ userId, action: "CLASS_DELETED", entity: "ClassSchedule", entityId: id });
}
