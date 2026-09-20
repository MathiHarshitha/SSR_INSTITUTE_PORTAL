"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerCourses } from "@/hooks/useCourses";

export default function TrainerCurriculumPage() {
  const { data: courses, isLoading } = useTrainerCourses();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          Manage lessons for the courses you&apos;re assigned to teach.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You aren&apos;t assigned to teach any batch yet, so there&apos;s no curriculum to manage.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {course.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{course.shortDescription}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{course.duration}</Badge>
                  {course.category && <Badge variant="outline">{course.category}</Badge>}
                </div>
                <Link
                  href={`/trainer/curriculum/${course._id}`}
                  className={cn(buttonVariants({ size: "sm" }), "w-full")}
                >
                  Manage curriculum
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
