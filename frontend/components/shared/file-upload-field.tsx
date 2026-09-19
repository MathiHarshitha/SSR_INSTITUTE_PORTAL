"use client";

import { useRef, type ChangeEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadFile } from "@/hooks/useUpload";

interface FileUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  accept?: string;
}

/** A URL input paired with an "Upload" button — paste a link, or pick a file to upload to
 * Cloudinary and have its URL fill the input automatically. */
export function FileUploadField({ value, onChange, folder, placeholder, accept }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    uploadMutation.mutate({ file, folder }, { onSuccess: (result) => onChange(result.url) });
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder ?? "https://... or upload a file"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFileSelected} />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploadMutation.isPending ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}
