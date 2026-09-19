"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/shared/file-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { materialFormSchema, MaterialFormValues } from "@/schemas/material.schema";
import { useModules } from "@/hooks/useModules";
import { AdminBatch } from "@/types/batch";
import { MaterialFormInput, TrainerMaterial } from "@/types/material";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: AdminBatch[];
  material?: TrainerMaterial | null;
  isSubmitting?: boolean;
  onSubmit: (input: MaterialFormInput) => void;
}

const EMPTY: MaterialFormValues = {
  title: "",
  description: "",
  fileUrl: "",
  fileType: "DOCUMENT",
  batch: "",
  module: "",
};

export function MaterialFormDialog({
  open,
  onOpenChange,
  batches,
  material,
  isSubmitting,
  onSubmit,
}: MaterialFormDialogProps) {
  const form = useForm<MaterialFormValues>({ resolver: zodResolver(materialFormSchema), defaultValues: EMPTY });
  const selectedBatchId = form.watch("batch");
  const selectedBatch = batches.find((b) => b._id === selectedBatchId);
  const { data: modules } = useModules(selectedBatch?.course._id ?? "");
  const fileType = form.watch("fileType");

  useEffect(() => {
    if (!open) return;
    form.reset(
      material
        ? {
            title: material.title,
            description: material.description ?? "",
            fileUrl: material.fileUrl,
            fileType: material.fileType,
            batch: material.batch,
            module: material.module?._id ?? "",
          }
        : EMPTY
    );
  }, [open, material, form]);

  function handleSubmit(values: MaterialFormValues) {
    onSubmit({
      title: values.title,
      description: values.description || undefined,
      fileUrl: values.fileUrl,
      fileType: values.fileType,
      batch: values.batch,
      module: values.module || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{material ? "Edit material" : "Upload material"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="React Hooks Cheat Sheet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!material}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batches.map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="LINK">Link</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!!modules?.length && (
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No specific module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fileType === "LINK" ? "Link URL" : "File"}</FormLabel>
                  <FormControl>
                    {fileType === "LINK" ? (
                      <Input placeholder="https://..." {...field} />
                    ) : (
                      <FileUploadField
                        value={field.value}
                        onChange={field.onChange}
                        folder="materials"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : material ? "Save changes" : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
