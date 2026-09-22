"use client";

import { use } from "react";
import { FinalAssessmentEditor } from "@/components/admin/final-assessment-editor";

export default function TrainerFinalAssessmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  return (
    <FinalAssessmentEditor courseId={courseId} backHref={`/trainer/curriculum/${courseId}`} />
  );
}
