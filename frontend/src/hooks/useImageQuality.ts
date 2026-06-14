"use client";

import { useEffect, useState } from "react";

import { checkImageQuality } from "@/lib/image/checkImageQuality";
import type { ImageQualityResult } from "@/types/image-quality";

export function useImageQuality(file: File | null) {
  const fileKey = file
    ? `${file.name}:${file.size}:${file.lastModified}:${file.type}`
    : null;
  const [state, setState] = useState<{
    error: string;
    fileKey: string | null;
    quality: ImageQualityResult | null;
  }>({
    error: "",
    fileKey: null,
    quality: null
  });

  useEffect(() => {
    let isCurrent = true;

    if (!file) {
      return () => {
        isCurrent = false;
      };
    }

    void checkImageQuality(file)
      .then((result) => {
        if (isCurrent) {
          setState({ error: "", fileKey, quality: result });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setState({
            error: "Kualitas foto belum dapat diperiksa.",
            fileKey,
            quality: null
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [file, fileKey]);

  const hasCurrentResult = state.fileKey === fileKey;
  return {
    isCheckingQuality: Boolean(file) && !hasCurrentResult,
    quality: hasCurrentResult ? state.quality : null,
    qualityError: hasCurrentResult ? state.error : ""
  };
}
