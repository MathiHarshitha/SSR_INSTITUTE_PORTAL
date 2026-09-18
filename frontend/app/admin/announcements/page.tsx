"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements, useDeleteAnnouncement } from "@/hooks/useAnnouncements";
import { CreateAnnouncementDialog } from "@/components/admin/create-announcement-dialog";
import { AnnouncementPriority } from "@/types/announcement";

function priorityBadgeClassName(priority: AnnouncementPriority): string {
  switch (priority) {
    case "HIGH":
      return "bg-status-critical/10 text-status-critical";
    case "NORMAL":
      return "bg-secondary/10 text-secondary";
    case "LOW":
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminAnnouncementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading, isError } = useAnnouncements({ page: 1, limit: 50 });
  const deleteMutation = useDeleteAnnouncement();

  const announcements = data?.announcements ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Publish updates to everyone, students, trainers, or a specific batch/course.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New announcement
        </Button>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load announcements.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No announcements published yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a._id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{a.title}</h3>
                    <Badge className={priorityBadgeClassName(a.priority)}>{a.priority}</Badge>
                    <Badge variant="outline">
                      {a.audience === "BATCH"
                        ? `Batch: ${a.batch?.name ?? "—"}`
                        : a.audience === "COURSE"
                          ? `Course: ${a.course?.name ?? "—"}`
                          : a.audience.charAt(0) + a.audience.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                  <p className="text-xs text-muted-foreground">
                    By {a.createdBy.name} · {new Date(a.publishAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(a._id)}
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAnnouncementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
