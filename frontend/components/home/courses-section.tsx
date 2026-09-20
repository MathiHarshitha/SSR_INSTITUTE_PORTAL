"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicCourses } from "@/hooks/useCourses";

export function CoursesSection() {
  const { data: courses, isLoading } = usePublicCourses();

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </>
      ) : (
        courses?.map((course) => (
          <Card key={course._id}>
            <CardHeader>
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-base">{course.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{course.category}</p>
              <p>{course.duration}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
