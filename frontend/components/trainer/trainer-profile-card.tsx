"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useUpdateTrainerProfile } from "@/hooks/useProfile";
import { trainerProfileFormSchema, TrainerProfileFormValues } from "@/schemas/profile.schema";
import { TrainerProfileData } from "@/types/profile";

export function TrainerProfileCard({ profile }: { profile: TrainerProfileData | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateTrainerProfile();

  const form = useForm<TrainerProfileFormValues>({
    resolver: zodResolver(trainerProfileFormSchema),
    defaultValues: {
      qualification: profile?.qualification ?? "",
      specialization: profile?.specialization ?? "",
      experienceYears: profile?.experienceYears,
      bio: profile?.bio ?? "",
      skillsText: profile?.skills?.join(", ") ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
    },
  });

  function startEdit() {
    form.reset({
      qualification: profile?.qualification ?? "",
      specialization: profile?.specialization ?? "",
      experienceYears: profile?.experienceYears,
      bio: profile?.bio ?? "",
      skillsText: profile?.skills?.join(", ") ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
    });
    setIsEditing(true);
  }

  function handleSubmit(values: TrainerProfileFormValues) {
    updateMutation.mutate(
      {
        qualification: values.qualification || undefined,
        specialization: values.specialization || undefined,
        experienceYears: values.experienceYears,
        bio: values.bio || undefined,
        skills: values.skillsText
          ? values.skillsText.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        resumeUrl: values.resumeUrl || undefined,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Professional Details</CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (years)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="skillsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="React, Node.js, MongoDB" {...field} />
                    </FormControl>
                    <FormDescription>Separate skills with commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Qualification</dt>
                <dd className="font-medium">{profile?.qualification ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Specialization</dt>
                <dd className="font-medium">{profile?.specialization ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="font-medium">
                  {profile?.experienceYears != null ? `${profile.experienceYears} years` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Resume</dt>
                <dd className="font-medium">
                  {profile?.resumeUrl ? (
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      View resume
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="mb-1.5 text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile?.bio && (
              <div>
                <p className="text-muted-foreground">Bio</p>
                <p className="font-medium">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
