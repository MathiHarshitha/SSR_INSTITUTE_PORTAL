import { Course } from "../models/Course";

/** Public listing used by the student registration form's course picker. No auth required. */
export async function listPublishedCourses() {
  return Course.find({ status: "PUBLISHED" })
    .select("name shortDescription category duration fee")
    .sort({ name: 1 })
    .lean();
}
