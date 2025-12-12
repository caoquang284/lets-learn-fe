import { CloudinaryFile } from "./cloudinary-file";

export type AssignmentData = {
  description: string;
  open: string | null;
  close: string | null;
  remindToGrade: string | null;
  maximumFile: number | null;
  maximumFileSize: FileSizeOption | null;
  cloudinaryFiles?: CloudinaryFile[]; // Deprecated: kept for backward compatibility
  files?: CloudinaryFile[]; // New field from backend
};

export enum FileSizeOption {
  "1MB" = "1 MB",
  "2MB" = "2 MB",
  "3MB" = "3 MB",
  "4MB" = "4 MB",
  "5MB" = "5 MB",
  "6MB" = "6 MB",
  "7MB" = "7 MB",
  "8MB" = "8 MB",
  "9MB" = "9 MB",
  "10MB" = "10 MB",
}
