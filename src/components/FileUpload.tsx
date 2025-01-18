import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileUpload(acceptedFiles);
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-chatbot-primary bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-3 h-3 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-500">
        {isDragActive
          ? "Drop files here..."
          : "Drag & drop files here, or click to select"}
      </p>
    </div>
  );
};

export default FileUpload;