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
import { feedbackFormSchema, FeedbackFormValues } from "@/schemas/interview.schema";
import { useRecordInterviewFeedback } from "@/hooks/useInterviews";
import { MockInterviewRow } from "@/types/interview";

interface InterviewFeedbackDialogProps {
  interview: MockInterviewRow | null;
  onOpenChange: (open: boolean) => void;
}

export function InterviewFeedbackDialog({ interview, onOpenChange }: InterviewFeedbackDialogProps) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { rating: 3, strengths: "", weaknesses: "", feedback: "", recommendation: "", result: "PENDING" },
  });
  const recordMutation = useRecordInterviewFeedback();

  useEffect(() => {
    if (!interview) return;
    form.reset({
      rating: interview.rating ?? 3,
      strengths: interview.strengths ?? "",
      weaknesses: interview.weaknesses ?? "",
      feedback: interview.feedback ?? "",
      recommendation: interview.recommendation ?? "",
      result: interview.result,
    });
  }, [interview, form]);

  function handleSubmit(values: FeedbackFormValues) {
    if (!interview) return;
    recordMutation.mutate(
      {
        id: interview._id,
        input: {
          rating: values.rating,
          strengths: values.strengths || undefined,
          weaknesses: values.weaknesses || undefined,
          feedback: values.feedback || undefined,
          recommendation: values.recommendation || undefined,
          result: values.result,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={!!interview} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Interview feedback — {interview?.student.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
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
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="RECOMMENDED">Recommended</SelectItem>
                        <SelectItem value="NOT_RECOMMENDED">Not recommended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strengths</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weaknesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weaknesses</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall feedback</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={recordMutation.isPending} className="w-full">
                {recordMutation.isPending ? "Saving..." : "Save feedback"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
