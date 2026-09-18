"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { arrayToLines, courseFormSchema, CourseFormValues, linesToArray } from "@/schemas/course.schema";
import { AdminCourse, CourseFormInput } from "@/types/course";

interface CourseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: AdminCourse | null;
  isSubmitting?: boolean;
  onSubmit: (input: CourseFormInput) => void;
}

const EMPTY_VALUES: CourseFormValues = {
  name: "",
  shortDescription: "",
  fullDescription: "",
  category: "",
  duration: "",
  fee: 0,
  thumbnailUrl: "",
  requirementsText: "",
  learningOutcomesText: "",
};

export function CourseFormSheet({
  open,
  onOpenChange,
  course,
  isSubmitting,
  onSubmit,
}: CourseFormSheetProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (course) {
      form.reset({
        name: course.name,
        shortDescription: course.shortDescription,
        fullDescription: course.fullDescription ?? "",
        category: course.category ?? "",
        duration: course.duration,
        fee: course.fee,
        thumbnailUrl: course.thumbnailUrl ?? "",
        requirementsText: arrayToLines(course.requirements),
        learningOutcomesText: arrayToLines(course.learningOutcomes),
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [open, course, form]);

  function handleSubmit(values: CourseFormValues) {
    onSubmit({
      name: values.name,
      shortDescription: values.shortDescription,
      fullDescription: values.fullDescription || undefined,
      category: values.category || undefined,
      duration: values.duration,
      fee: values.fee,
      thumbnailUrl: values.thumbnailUrl || undefined,
      requirements: linesToArray(values.requirementsText),
      learningOutcomes: linesToArray(values.learningOutcomesText),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{course ? "Edit course" : "Create course"}</SheetTitle>
          <SheetDescription>
            {course
              ? "Update the course details below."
              : "New courses start as a draft. Publish them once ready."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-4 pb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course name</FormLabel>
                  <FormControl>
                    <Input placeholder="MERN Full Stack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Stack" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="6 Months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="One-line summary shown on cards" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Detailed course description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requirementsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="One per line" {...field} />
                  </FormControl>
                  <FormDescription>One requirement per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learningOutcomesText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning outcomes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="One per line" {...field} />
                  </FormControl>
                  <FormDescription>One outcome per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional for now — file uploads land in a later phase.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : course ? "Save changes" : "Create course"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
