"use client";

import { notFound } from "next/navigation";

/* Search is disabled for now. The route returns 404 and the nav link, top-bar search box and
 * backend `/search` route are commented out. To re-enable: restore the original page below,
 * uncomment the "Search" item in constants/nav.ts, and uncomment the `/search` route in
 * backend/src/routes/index.ts. */
export default function StudentSearchPage() {
  notFound();
}

/* Original search page:
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/useSearch";

export default function StudentSearchPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  // A new search from the top bar changes ?q= while this page stays mounted; adopt it.
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }
  const { data, isFetching, isError, isDebouncing } = useSearch(query);

  const hasResults =
    data &&
    (data.courses.length > 0 ||
      data.modules.length > 0 ||
      data.topics.length > 0 ||
      data.lessons.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Search</h2>
        <p className="text-sm text-muted-foreground">
          Search across your enrolled courses, modules, topics, and lessons.
        </p>
      </div>

      <div className="relative max-w-md">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search a course, module, topic or lesson"
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim().length < 2 ? (
        <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
      ) : isError && !isDebouncing && !isFetching ? (
        <p className="text-sm text-destructive">Search failed. Please try again.</p>
      ) : isDebouncing || isFetching || !data ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !hasResults ? (
        <p className="text-sm text-muted-foreground">No results found.</p>
      ) : (
        <div className="space-y-4">
          {data.lessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lessons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data.lessons.map((lesson) => (
                  <Link
                    key={lesson._id}
                    href={`/student/courses/${lesson.course._id}/lessons/${lesson._id}`}
                    className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.course.name} → {lesson.module.name} → {lesson.topic.name}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {data.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data.topics.map((topic) => (
                  <Link
                    key={topic._id}
                    href={`/student/courses/${topic.course._id}`}
                    className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <p className="font-medium">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.course.name} → {topic.module.name}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {data.modules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data.modules.map((mod) => (
                  <Link
                    key={mod._id}
                    href={`/student/courses/${mod.course._id}`}
                    className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <p className="font-medium">{mod.name}</p>
                    <p className="text-xs text-muted-foreground">{mod.course.name}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {data.courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {data.courses.map((course) => (
                  <Link
                    key={course._id}
                    href={`/student/courses/${course._id}`}
                    className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <p className="font-medium">{course.name}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
*/
