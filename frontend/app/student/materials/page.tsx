"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMaterials } from "@/hooks/useMaterials";

export default function StudentMaterialsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  const query = useMemo(() => ({ page: 1, limit: 50, search: search || undefined }), [search]);
  const { data, isLoading, isError } = useMaterials(query);
  const materials = data?.materials ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Materials</h2>
        <p className="text-sm text-muted-foreground">
          Notes, recordings, and reference links for your batch.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load materials.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No materials shared yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Shared</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material._id}>
                      <TableCell className="font-medium">
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {material.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.fileType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.module?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
