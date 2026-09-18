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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { lessonFormSchema, LessonFormValues } from "@/schemas/module.schema";
import { AdminLesson, LessonFormInput } from "@/types/module";

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: AdminLesson | null;
  isSubmitting?: boolean;
  onSubmit: (input: LessonFormInput) => void;
}

const EMPTY: LessonFormValues = { title: "", description: "", estimatedMinutes: undefined };

export function LessonFormDialog({ open, onOpenChange, lesson, isSubmitting, onSubmit }: LessonFormDialogProps) {
  const form = useForm<LessonFormValues>({ resolver: zodResolver(lessonFormSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(
      lesson
        ? {
            title: lesson.title,
            description: lesson.description ?? "",
            estimatedMinutes: lesson.estimatedMinutes,
          }
        : EMPTY
    );
  }, [open, lesson, form]);

  function handleSubmit(values: LessonFormValues) {
    onSubmit({
      title: values.title,
      description: values.description || undefined,
      estimatedMinutes: values.estimatedMinutes,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit lesson" : "Add lesson"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson title</FormLabel>
                  <FormControl>
                    <Input placeholder="Variables and Data Types" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated minutes</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ""} />
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
                    <Textarea rows={3} placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : lesson ? "Save changes" : "Add lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
