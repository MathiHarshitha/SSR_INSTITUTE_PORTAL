"use client";

import { Star, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInterviews } from "@/hooks/useInterviews";
import { InterviewResult } from "@/types/interview";

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

export default function StudentInterviewsPage() {
  const { data: interviews, isLoading, isError } = useInterviews();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Mock Interviews</h2>
        <p className="text-sm text-muted-foreground">Your scheduled interviews and feedback history.</p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load interviews.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No interviews scheduled yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map((iv) => (
            <Card key={iv._id}>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{iv.type.replace("_", " ")} Interview</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(iv.date).toLocaleDateString()} · {iv.time}
                      {iv.batch ? ` · ${iv.batch.name}` : ""}
                    </p>
                  </div>
                  <Badge className={resultBadgeClassName(iv.result)}>{iv.result.replace("_", " ")}</Badge>
                </div>
                {iv.meetingLink && (
                  <a
                    href={iv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Video className="h-3 w-3" />
                    Join link
                  </a>
                )}
                {iv.rating && (
                  <div className="space-y-1 border-t border-border pt-2 text-sm">
                    <p className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                      Rating: {iv.rating}/5
                    </p>
                    {iv.feedback && <p className="text-muted-foreground">{iv.feedback}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
