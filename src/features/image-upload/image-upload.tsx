"use client";

import { CircleUserRoundIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { typeImageEnum } from "@/lib/utils";

export default function ImageUpload(props: {
  imageUrl: string | null | undefined;
  objectTypeImage: typeImageEnum.PLAYER | typeImageEnum.TEAM;
  onFileSelect?: (file: File | null) => void;
}) {
  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: "image/*",
    initialFiles: props.imageUrl
      ? [
          {
            id: "avatar",
            url: props.imageUrl,
            name: "avatar",
            type: "image/jpeg",
            size: 150,
          },
        ]
      : [],
    onFilesAdded: (files) => {
      const file = files[0]?.file as File;

      if (!file) {
        return;
      }

      // Notifier le parent du fichier sélectionné au lieu de l'uploader immédiatement
      props.onFileSelect?.(file);
    },
  });

  const previewUrl = files[0]?.preview || null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area */}
        <button
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={previewUrl ? "Change image" : "Upload image"}
        >
          {previewUrl ? (
            <img
              className="size-full object-cover"
              src={previewUrl}
              alt={files[0]?.file?.name || "Uploaded image"}
              width={64}
              height={64}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-4 opacity-60" />
            </div>
          )}
        </button>
        {previewUrl && (
          <Button
            onClick={() => {
              removeFile(files[0]?.id);
              props.onFileSelect?.(null);
            }}
            size="icon"
            className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
