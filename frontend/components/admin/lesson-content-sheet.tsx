"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  arrayToLines,
  fromQuizQuestion,
  lessonContentFormSchema,
  LessonContentFormValues,
  linesToArray,
  toQuizQuestion,
} from "@/schemas/module.schema";
import { AdminLesson, LessonFormInput } from "@/types/module";

interface LessonContentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: AdminLesson | null;
  isSubmitting?: boolean;
  onSubmit: (input: LessonFormInput) => void;
}

const EMPTY: LessonContentFormValues = {
  title: "",
  description: "",
  estimatedMinutes: undefined,
  difficulty: "BEGINNER",
  published: true,
  whatIsIt: "",
  whyItMatters: "",
  analogy: "",
  simpleExample: "",
  technicalExplanation: "",
  codeExamples: [],
  realWorldUsage: "",
  commonMistakes: [],
  practiceInstructions: "",
  practiceStarterCode: "",
  practiceHint: "",
  quiz: [],
  rememberThis: "",
  keyTakeawaysText: "",
};

export function LessonContentSheet({
  open,
  onOpenChange,
  lesson,
  isSubmitting,
  onSubmit,
}: LessonContentSheetProps) {
  const form = useForm<LessonContentFormValues>({
    resolver: zodResolver(lessonContentFormSchema),
    defaultValues: EMPTY,
  });

  const codeExamples = useFieldArray({ control: form.control, name: "codeExamples" });
  const commonMistakes = useFieldArray({ control: form.control, name: "commonMistakes" });
  const quiz = useFieldArray({ control: form.control, name: "quiz" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      lesson
        ? {
            title: lesson.title,
            description: lesson.description ?? "",
            estimatedMinutes: lesson.estimatedMinutes,
            difficulty: lesson.difficulty,
            published: lesson.published,
            whatIsIt: lesson.whatIsIt,
            whyItMatters: lesson.whyItMatters,
            analogy: lesson.analogy,
            simpleExample: lesson.simpleExample,
            technicalExplanation: lesson.technicalExplanation ?? "",
            codeExamples: lesson.codeExamples,
            realWorldUsage: lesson.realWorldUsage ?? "",
            commonMistakes: lesson.commonMistakes,
            practiceInstructions: lesson.practice?.instructions ?? "",
            practiceStarterCode: lesson.practice?.starterCode ?? "",
            practiceHint: lesson.practice?.hint ?? "",
            quiz: lesson.quiz.map(fromQuizQuestion),
            rememberThis: lesson.rememberThis ?? "",
            keyTakeawaysText: arrayToLines(lesson.keyTakeaways),
          }
        : EMPTY
    );
  }, [open, lesson, form]);

  function handleSubmit(values: LessonContentFormValues) {
    onSubmit({
      title: values.title,
      description: values.description || undefined,
      estimatedMinutes: values.estimatedMinutes,
      difficulty: values.difficulty,
      published: values.published,
      whatIsIt: values.whatIsIt || undefined,
      whyItMatters: values.whyItMatters || undefined,
      analogy: values.analogy || undefined,
      simpleExample: values.simpleExample || undefined,
      technicalExplanation: values.technicalExplanation || undefined,
      codeExamples: values.codeExamples.map((c) => ({
        title: c.title || undefined,
        language: c.language,
        code: c.code,
        explanation: c.explanation || undefined,
      })),
      realWorldUsage: values.realWorldUsage || undefined,
      commonMistakes: values.commonMistakes.map((m) => ({
        wrong: m.wrong,
        right: m.right,
        explanation: m.explanation || undefined,
      })),
      practice: values.practiceInstructions
        ? {
            instructions: values.practiceInstructions,
            starterCode: values.practiceStarterCode || undefined,
            hint: values.practiceHint || undefined,
          }
        : null,
      quiz: values.quiz.map(toQuizQuestion),
      rememberThis: values.rememberThis || undefined,
      keyTakeaways: linesToArray(values.keyTakeawaysText),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{lesson ? "Edit lesson" : "Add lesson"}</SheetTitle>
          <SheetDescription>
            Teach it the SSR way: simple explanation → analogy → example → code → practice → quiz.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-4 pb-4">
            <Tabs defaultValue="overview">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="teach">Teach it</TabsTrigger>
                <TabsTrigger value="code">Code &amp; practice</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="wrapup">Wrap-up</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="One-line summary shown in lists" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        Published (visible to enrolled students)
                      </label>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="teach" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="whatIsIt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is it? (simple explanation)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whyItMatters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do we need it?</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="analogy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analogy (&quot;Think of it like this...&quot;)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormDescription>
                        A memorable real-world comparison — a labeled box, a waiter, a LEGO block.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="simpleExample"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simple example</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technicalExplanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical explanation</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="realWorldUsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Real-world usage</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="code" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Code examples</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        codeExamples.append({ title: "", language: "javascript", code: "", explanation: "" })
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add example
                    </Button>
                  </div>
                  {codeExamples.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No code examples yet.</p>
                  ) : (
                    codeExamples.fields.map((row, index) => (
                      <Card key={row.id}>
                        <CardContent className="space-y-2 pt-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="grid flex-1 grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`codeExamples.${index}.title`}
                                render={({ field }) => (
                                  <Input placeholder="Title (optional)" {...field} />
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`codeExamples.${index}.language`}
                                render={({ field }) => <Input placeholder="javascript" {...field} />}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => codeExamples.remove(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`codeExamples.${index}.code`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea rows={4} className="font-mono text-xs" placeholder="Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`codeExamples.${index}.explanation`}
                            render={({ field }) => (
                              <Textarea rows={2} placeholder="Line-by-line explanation (optional)" {...field} />
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <FormLabel>Try it yourself (practice)</FormLabel>
                  <FormField
                    control={form.control}
                    name="practiceInstructions"
                    render={({ field }) => (
                      <Textarea rows={2} placeholder="Practice instructions" {...field} />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="practiceStarterCode"
                    render={({ field }) => (
                      <Textarea
                        rows={3}
                        className="font-mono text-xs"
                        placeholder="Starter code (optional)"
                        {...field}
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="practiceHint"
                    render={({ field }) => <Input placeholder="Hint (optional)" {...field} />}
                  />
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Quiz (self-check)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      quiz.append({ question: "", optionsText: "", correctOptionNumber: 1, explanation: "" })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add question
                  </Button>
                </div>
                {quiz.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No quiz questions yet.</p>
                ) : (
                  quiz.fields.map((row, index) => (
                    <Card key={row.id}>
                      <CardContent className="space-y-2 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <FormField
                            control={form.control}
                            name={`quiz.${index}.question`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Question" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => quiz.remove(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`quiz.${index}.optionsText`}
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
                            name={`quiz.${index}.correctOptionNumber`}
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
                            name={`quiz.${index}.explanation`}
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
              </TabsContent>

              <TabsContent value="wrapup" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Common mistakes</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => commonMistakes.append({ wrong: "", right: "", explanation: "" })}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  {commonMistakes.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No common mistakes listed yet.</p>
                  ) : (
                    commonMistakes.fields.map((row, index) => (
                      <Card key={row.id}>
                        <CardContent className="space-y-2 pt-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="grid flex-1 grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`commonMistakes.${index}.wrong`}
                                render={({ field }) => <Input placeholder="Wrong way" {...field} />}
                              />
                              <FormField
                                control={form.control}
                                name={`commonMistakes.${index}.right`}
                                render={({ field }) => <Input placeholder="Right way" {...field} />}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => commonMistakes.remove(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`commonMistakes.${index}.explanation`}
                            render={({ field }) => (
                              <Input placeholder="Why it matters (optional)" {...field} />
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="rememberThis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remember this (short memorable one-liner)</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keyTakeawaysText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key takeaways</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormDescription>One takeaway per line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : lesson ? "Save changes" : "Add lesson"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
