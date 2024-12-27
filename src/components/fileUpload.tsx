"use client";
import { File, FileIcon, FileImageIcon } from "lucide-react";

import React from "react";
import { useDropzone } from "react-dropzone";
import { UploadButton } from "~/lib/uploadthing";
const FileUploadDropZone = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 3,

    onDrop: (acceptedFiles) => {
      console.log("Received files:", acceptedFiles);
    },
  });

  return (
    <div className="flex cursor-pointer items-center justify-center rounded-xl border border-primary bg-blue-400 p-4">
      {/* <div
        className="flex h-32 flex-col items-center justify-center gap-2"
        {...getRootProps()}
      >
        <input
          {...getInputProps()}
          className="flex h-24 items-center justify-center rounded-xl font-mono"
        />
        <FileIcon size={26} />
        <p className="text-xs">
          Drag 'n' drop some files here, or click to select files
        </p>
      </div> */}
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
};

export default FileUploadDropZone;
