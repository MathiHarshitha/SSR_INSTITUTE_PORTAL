"use client";

import { useMemo, useState } from "react";
import { Search, MoreHorizontal, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBatches } from "@/hooks/useBatches";
import { useCreateMaterial, useDeleteMaterial, useMaterials, useUpdateMaterial } from "@/hooks/useMaterials";
import { MaterialFormDialog } from "@/components/trainer/material-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MaterialFormInput, TrainerMaterial } from "@/types/material";

export default function TrainerMaterialsPage() {
  const { data: batchData } = useBatches({ page: 1, limit: 100 });
  const batches = batchData?.batches ?? [];

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [batchFilter, setBatchFilter] = useState<string>("ALL");

  const query = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search || undefined,
      batch: batchFilter !== "ALL" ? batchFilter : undefined,
    }),
    [search, batchFilter]
  );

  const { data, isLoading, isError } = useMaterials(query);
  const materials = data?.materials ?? [];

  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainerMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<TrainerMaterial | null>(null);

  function openCreate() {
    setEditingMaterial(null);
    setDialogOpen(true);
  }

  function openEdit(material: TrainerMaterial) {
    setEditingMaterial(material);
    setDialogOpen(true);
  }

  function handleSubmit(input: MaterialFormInput) {
    if (editingMaterial) {
      updateMutation.mutate(
        { id: editingMaterial._id, input },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Materials</h2>
          <p className="text-sm text-muted-foreground">
            Upload notes, recordings, and reference links for your batches.
          </p>
        </div>
        <Button onClick={openCreate} disabled={batches.length === 0}>
          <Plus className="h-4 w-4" />
          Upload material
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={batchFilter} onValueChange={(value) => setBatchFilter(value ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All my batches</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              No materials uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(material)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeletingMaterial(material)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MaterialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batches={batches}
        material={editingMaterial}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingMaterial}
        onOpenChange={(open) => !open && setDeletingMaterial(null)}
        title="Delete this material?"
        description={`"${deletingMaterial?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingMaterial) {
            deleteMutation.mutate(deletingMaterial._id, { onSuccess: () => setDeletingMaterial(null) });
          }
        }}
      />
    </div>
  );
}
