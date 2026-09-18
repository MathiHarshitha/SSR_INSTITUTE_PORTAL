"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInterviews } from "@/hooks/useInterviews";
import { ScheduleInterviewDialog } from "@/components/trainer/schedule-interview-dialog";
import { InterviewFeedbackDialog } from "@/components/trainer/interview-feedback-dialog";
import { InterviewResult, MockInterviewRow } from "@/types/interview";

function resultBadgeClassName(result: InterviewResult): string {
  switch (result) {
    case "RECOMMENDED":
      return "bg-status-good/10 text-status-good";
    case "NOT_RECOMMENDED":
      return "bg-status-critical/10 text-status-critical";
    case "PENDING":
      return "bg-muted text-muted-foreground";
  }
}

export default function TrainerInterviewsPage() {
  const { data: interviews, isLoading, isError } = useInterviews();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState<MockInterviewRow | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Mock Interviews</h2>
          <p className="text-sm text-muted-foreground">
            Schedule mock interviews and record feedback.
          </p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="h-4 w-4" />
          Schedule interview
        </Button>
      </div>

      <Card>
        <CardContent>
          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Failed to load interviews.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !interviews || interviews.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No interviews scheduled yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((iv) => (
                    <TableRow key={iv._id}>
                      <TableCell className="font-medium">{iv.student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{iv.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(iv.date).toLocaleDateString()} · {iv.time}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {iv.rating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                            {iv.rating}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={resultBadgeClassName(iv.result)}>
                          {iv.result.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setFeedbackInterview(iv)}>
                          Feedback
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleInterviewDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <InterviewFeedbackDialog
        interview={feedbackInterview}
        onOpenChange={(open) => !open && setFeedbackInterview(null)}
      />
    </div>
  );
}
