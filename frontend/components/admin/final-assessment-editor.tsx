"use client";

import { useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  finalAssessmentFormSchema,
  FinalAssessmentFormValues,
  fromFinalAssessmentQuestion,
  toFinalAssessmentQuestion,
} from "@/schemas/finalAssessment.schema";
import { useFinalAssessmentAuthoring, useSaveFinalAssessment } from "@/hooks/useFinalAssessment";

const EMPTY: FinalAssessmentFormValues = {
  title: "Final Assessment",
  passingScore: 60,
  published: false,
  questions: [],
};

interface FinalAssessmentEditorProps {
  courseId: string;
  backHref: string;
}

/** Shared by admin (/admin/courses/[id]/final-assessment) and trainer
 * (/trainer/curriculum/[courseId]/final-assessment) — one final assessment per course,
 * unlocked for students only once every module is complete. */
export function FinalAssessmentEditor({ courseId, backHref }: FinalAssessmentEditorProps) {
  const { data: assessment, isLoading } = useFinalAssessmentAuthoring(courseId);
  const saveAssessment = useSaveFinalAssessment(courseId);

  const form = useForm<FinalAssessmentFormValues>({
    resolver: zodResolver(finalAssessmentFormSchema),
    defaultValues: EMPTY,
  });
  const questions = useFieldArray({ control: form.control, name: "questions" });

  useEffect(() => {
    if (isLoading) return;
    form.reset(
      assessment
        ? {
            title: assessment.title,
            passingScore: assessment.passingScore,
            published: assessment.published,
            questions: assessment.questions.map(fromFinalAssessmentQuestion),
          }
        : EMPTY
    );
  }, [isLoading, assessment, form]);

  function handleSubmit(values: FinalAssessmentFormValues) {
    saveAssessment.mutate({
      title: values.title,
      passingScore: values.passingScore,
      published: values.published,
      questions: values.questions.map(toFinalAssessmentQuestion),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={backHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}>
        <ArrowLeft className="h-4 w-4" />
        Back to curriculum
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Final Assessment</h1>
        <p className="text-sm text-muted-foreground">
          Unlocked for a student only once every module in this course is complete.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing score (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={100} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Published (visible to students once unlocked)</FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Questions</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  questions.append({ question: "", optionsText: "", correctOptionNumber: 1, explanation: "" })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add question
              </Button>
            </div>

            {questions.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            ) : (
              questions.fields.map((row, index) => (
                <Card key={row.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Question {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => questions.remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`questions.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Question" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`questions.${index}.optionsText`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea rows={3} placeholder={"Option 1\nOption 2\nOption 3"} {...field} />
                          </FormControl>
                          <FormDescription>One option per line.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`questions.${index}.correctOptionNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Correct option number</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Explanation (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={saveAssessment.isPending}>
                {saveAssessment.isPending ? "Saving..." : "Save final assessment"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
