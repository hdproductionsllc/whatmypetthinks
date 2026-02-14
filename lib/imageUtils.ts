"use client";

/** Max dimension for the API call (keeps costs + latency low) */
const API_MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.8;

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export async function convertHeicToJpeg(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: JPEG_QUALITY,
  });
  return Array.isArray(result) ? result[0] : result;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Process an image file and return TWO versions:
 * - `base64` + `dataUrl` (small): resized to max 1024px for the API call
 * - `originalDataUrl` (full resolution): for canvas compositing output
 */
export async function processImageFile(
  file: File
): Promise<{
  base64: string;
  dataUrl: string;
  mediaType: string;
  originalDataUrl: string;
}> {
  let blob: Blob = file;

  if (isHeicFile(file)) {
    blob = await convertHeicToJpeg(file);
  }

  const fullUrl = URL.createObjectURL(blob);
  try {
    const img = await loadImage(fullUrl);
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    // --- Full-resolution data URL (for compositing) ---
    // Just read the original image as-is. For very large images (>4000px),
    // cap at 2048px to avoid canvas memory issues on mobile.
    const compositeMax = 2048;
    let compW = origW;
    let compH = origH;
    if (compW > compositeMax || compH > compositeMax) {
      const s = compositeMax / Math.max(compW, compH);
      compW = Math.round(compW * s);
      compH = Math.round(compH * s);
    }

    const compCanvas = document.createElement("canvas");
    compCanvas.width = compW;
    compCanvas.height = compH;
    const compCtx = compCanvas.getContext("2d")!;
    compCtx.drawImage(img, 0, 0, compW, compH);
    const originalDataUrl = compCanvas.toDataURL("image/jpeg", 0.92);

    // --- Small version for the API call ---
    let apiW = origW;
    let apiH = origH;
    if (apiW > API_MAX_DIMENSION || apiH > API_MAX_DIMENSION) {
      const scale = API_MAX_DIMENSION / Math.max(apiW, apiH);
      apiW = Math.round(apiW * scale);
      apiH = Math.round(apiH * scale);
    }

    const apiCanvas = document.createElement("canvas");
    apiCanvas.width = apiW;
    apiCanvas.height = apiH;
    const apiCtx = apiCanvas.getContext("2d")!;
    apiCtx.drawImage(img, 0, 0, apiW, apiH);
    const apiDataUrl = apiCanvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = apiDataUrl.split(",")[1];

    return {
      base64,
      dataUrl: apiDataUrl,
      mediaType: "image/jpeg",
      originalDataUrl,
    };
  } finally {
    URL.revokeObjectURL(fullUrl);
  }
}
