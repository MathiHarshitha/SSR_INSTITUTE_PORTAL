import { Enrollment } from "../models/Enrollment";
import { isCourseCompleted } from "../utils/lessonAccess";

/**
 * Aggregate, per enrolled course, whether Jobs/Mock Interviews/Interview Resources are
 * unlocked for this student (spec §12: locked until the whole course is completed). The
 * frontend uses this to render "Complete the course to unlock Career Resources" vs. the
 * real content — but the actual enforcement lives in each resource's own service (jobs,
 * interviews, interview resources), not here; this is a read-only status summary.
 */
export async function getCareerResourcesStatus(studentId: string) {
  const enrollments = await Enrollment.find({ student: studentId })
    .select("course")
    .populate("course", "name")
    .lean();

  const courses = await Promise.all(
    enrollments.map(async (e) => {
      const courseDoc = e.course as unknown as { _id: unknown; name: string };
      const courseId = String(courseDoc._id);
      const completed = await isCourseCompleted(studentId, courseId);
      return {
        courseId,
        courseName: courseDoc.name,
        completed,
        careerResourcesUnlocked: completed,
      };
    })
  );

  const anyUnlocked = courses.some((c) => c.careerResourcesUnlocked);
  return { anyUnlocked, courses };
}

export async function assertAnyCourseCompleted(studentId: string): Promise<boolean> {
  const status = await getCareerResourcesStatus(studentId);
  return status.anyUnlocked;
}
