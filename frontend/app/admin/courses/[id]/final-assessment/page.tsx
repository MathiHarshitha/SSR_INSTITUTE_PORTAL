"use client";

import { use } from "react";
import { FinalAssessmentEditor } from "@/components/admin/final-assessment-editor";

export default function AdminFinalAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FinalAssessmentEditor courseId={id} backHref={`/admin/courses/${id}`} />;
}
