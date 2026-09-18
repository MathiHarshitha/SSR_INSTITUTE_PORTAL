"use client";

import { Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClasses } from "@/hooks/useSchedule";

export default function StudentSchedulePage() {
  const { data: classes, isLoading, isError } = useClasses({});

  const upcoming = (classes ?? []).filter((c) => new Date(c.date) >= new Date(new Date().toDateString()));
  const past = (classes ?? []).filter((c) => new Date(c.date) < new Date(new Date().toDateString()));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Schedule</h2>
        <p className="text-sm text-muted-foreground">Upcoming and past classes for your batch.</p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load schedule.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !classes || classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No classes scheduled yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming classes.</p>
              ) : (
                upcoming.map((c) => (
                  <Card key={c._id}>
                    <CardContent>
                      <p className="font-medium">{c.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(c.date).toLocaleDateString()} · {c.startTime}–{c.endTime}
                      </p>
                      {c.meetingLink && (
                        <a
                          href={c.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Video className="h-3 w-3" />
                          Join link
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {past.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Past</h3>
              <div className="space-y-2 opacity-70">
                {past.map((c) => (
                  <Card key={c._id}>
                    <CardContent>
                      <p className="font-medium">{c.topic}</p>
                      <p className="text-sm text-muted-foreground">{new Date(c.date).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
