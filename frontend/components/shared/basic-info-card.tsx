"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateMe } from "@/hooks/useProfile";
import { basicInfoSchema, BasicInfoFormValues } from "@/schemas/profile.schema";
import { AuthUser } from "@/types/auth";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusBadgeClassName(status: AuthUser["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-status-good/10 text-status-good";
    case "SUSPENDED":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "BLOCKED":
    case "REJECTED":
      return "bg-status-critical/10 text-status-critical";
    case "PENDING":
      return "bg-muted text-muted-foreground";
  }
}

export function BasicInfoCard({ user }: { user: AuthUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateMe();

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  });

  function startEdit() {
    form.reset({ name: user.name, phone: user.phone ?? "" });
    setIsEditing(true);
  }

  function handleSubmit(values: BasicInfoFormValues) {
    updateMutation.mutate(values, { onSuccess: () => setIsEditing(false) });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{user.role}</Badge>
            <Badge className={statusBadgeClassName(user.status)}>{user.status}</Badge>
          </div>
        </div>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{user.phone ?? "—"}</dd>
            </div>
            {user.lastLoginAt && (
              <div>
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="font-medium">{new Date(user.lastLoginAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
