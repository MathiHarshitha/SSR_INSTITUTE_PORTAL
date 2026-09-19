"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { issueCertificateFormSchema, IssueCertificateFormValues } from "@/schemas/certificate.schema";
import { useBatches, useBatchStudents } from "@/hooks/useBatches";
import { useIssueCertificate } from "@/hooks/useCertificates";

interface IssueCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueCertificateDialog({ open, onOpenChange }: IssueCertificateDialogProps) {
  const form = useForm<IssueCertificateFormValues>({
    resolver: zodResolver(issueCertificateFormSchema),
    defaultValues: { batch: "", student: "" },
  });

  const { data: batchData } = useBatches({ page: 1, limit: 100, status: "COMPLETED" });
  const batches = batchData?.batches ?? [];
  const selectedBatch = form.watch("batch");
  const { data: students } = useBatchStudents(selectedBatch || null);

  const issueMutation = useIssueCertificate();

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  useEffect(() => {
    form.setValue("student", "");
  }, [selectedBatch, form]);

  function handleSubmit(values: IssueCertificateFormValues) {
    issueMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue certificate</DialogTitle>
          <DialogDescription>
            Only completed batches are listed. The student must be enrolled in the selected batch.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a completed batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name} ({b.course.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {batches.length === 0 && (
                    <p className="text-xs text-muted-foreground">No completed batches yet.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="student"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBatch}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={selectedBatch ? "Select a student" : "Select a batch first"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(students ?? []).map((e) => (
                        <SelectItem key={e.student._id} value={e.student._id}>
                          {e.student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={issueMutation.isPending} className="w-full">
                {issueMutation.isPending ? "Issuing..." : "Issue certificate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
