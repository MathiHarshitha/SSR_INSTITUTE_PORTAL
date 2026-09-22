"use client";

import { FileSearch, FileText, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { useCareerResourcesStatus, useInterviewResources } from "@/hooks/useCareerResources";

/** Full upload/download flow is intentionally deferred — this wires up the access-control
 * surface (course-completion gate, nav entry, route) now so the real content can be added
 * later without touching authorization. */
export default function StudentInterviewResourcesPage() {
  const { data: status } = useCareerResourcesStatus();
  const { data: resources, isLoading } = useInterviewResources();

  const isLocked = !!status && !status.anyUnlocked;

  if (isLocked) {
    return (
      <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
        <div className="w-full max-w-lg">
          <NoAccess message="You don't have access to Interview Resources yet. Complete any one course to unlock it." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Career Resources"
        eyebrowIcon={FileSearch}
        title="Interview"
        titleAccent="Resources"
        subtitle="Interview question banks and prep material for your completed courses."
        quote="Preparation beats talent when talent doesn't prepare."
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : !resources || resources.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No interview resources published yet — check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((r) => (
            <Card key={r._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  {r.title}
                </CardTitle>
                {r.status === "COMING_SOON" && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" /> Coming soon
                  </Badge>
                )}
              </CardHeader>
              {r.description && (
                <CardContent className="text-sm text-muted-foreground">{r.description}</CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
