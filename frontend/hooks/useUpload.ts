import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { extractErrorMessage } from "@/lib/api-client";

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadService.uploadFile(file, folder),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
