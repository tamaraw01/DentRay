"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type ImageUploadProps = {
  disabled?: boolean;
  onImageSelected: (file: File, previewUrl: string) => void;
};

const allowedTypes = new Set(["image/jpeg", "image/png"]);
const maxFileSize = 8 * 1024 * 1024;

function validateFile(file: File) {
  if (!allowedTypes.has(file.type)) {
    return "File harus berupa gambar JPG, JPEG, atau PNG.";
  }
  if (file.size > maxFileSize) {
    return "Ukuran file terlalu besar. Gunakan gambar maksimal 8 MB.";
  }
  return "";
}

export function ImageUpload({ disabled = false, onImageSelected }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setError("");
    onImageSelected(file, nextPreviewUrl);
  };

  return (
    <div className="space-y-4">
      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.65rem] border border-dashed border-clinical-200 bg-slate-50/80 px-5 py-8 text-center transition hover:-translate-y-0.5 hover:border-clinical-400 hover:bg-white">
        <input
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0])}
          ref={inputRef}
          type="file"
        />
        <span>
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-clinical-700 shadow-sm ring-1 ring-slate-200">+</span>
          <span className="block text-base font-bold text-clinical-900">Unggah Foto Gigi</span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">JPG atau PNG · Maks. 8 MB</span>
        </span>
      </label>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

      <div>
        <Button disabled={disabled} onClick={() => inputRef.current?.click()} type="button" variant="secondary">
          Pilih File
        </Button>
      </div>
    </div>
  );
}
