import { Types } from "mongoose";
import { User } from "../models/User";

/**
 * Students that count toward dashboards, reports, revenue and batch capacity: student accounts
 * that still exist and aren't flagged `isTestAccount`. Filtering aggregates by this list also
 * drops orphaned rows (enrollments, payments, ...) whose user was deleted directly in the DB.
 */
export async function countableStudentIds(): Promise<Types.ObjectId[]> {
  return User.find({ role: "STUDENT", isTestAccount: { $ne: true } }).distinct("_id");
}
