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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { recordPaymentFormSchema, RecordPaymentFormValues } from "@/schemas/fee.schema";
import { useBatches } from "@/hooks/useBatches";
import { useBatchStudents } from "@/hooks/useBatches";
import { useRecordPayment } from "@/hooks/useFees";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "OTHER"] as const;

export function RecordPaymentDialog({ open, onOpenChange }: RecordPaymentDialogProps) {
  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentFormSchema),
    defaultValues: {
      batch: "",
      student: "",
      amount: 0,
      paymentMethod: "UPI",
      paymentDate: "",
      transactionRef: "",
      notes: "",
    },
  });

  const { data: batchData } = useBatches({ page: 1, limit: 100 });
  const batches = batchData?.batches ?? [];
  const selectedBatch = form.watch("batch");
  const { data: students } = useBatchStudents(selectedBatch || null);

  const recordMutation = useRecordPayment();

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  useEffect(() => {
    form.setValue("student", "");
  }, [selectedBatch, form]);

  function handleSubmit(values: RecordPaymentFormValues) {
    recordMutation.mutate(
      {
        student: values.student,
        batch: values.batch,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate || undefined,
        transactionRef: values.transactionRef || undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            The student must already be enrolled in the selected batch.
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
                        <SelectValue placeholder="Select a batch" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="transactionRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={recordMutation.isPending} className="w-full">
                {recordMutation.isPending ? "Recording..." : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
