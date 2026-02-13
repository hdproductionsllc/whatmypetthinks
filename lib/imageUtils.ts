"use client";

const MAX_DIMENSION = 1024;
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

export async function resizeAndConvertToBase64(
  blob: Blob
): Promise<{ base64: string; dataUrl: string; mediaType: string }> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);

    const canvas = document.createElement("canvas");
    let { width, height } = img;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = dataUrl.split(",")[1];

    return { base64, dataUrl, mediaType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function processImageFile(
  file: File
): Promise<{ base64: string; dataUrl: string; mediaType: string }> {
  let blob: Blob = file;

  if (isHeicFile(file)) {
    blob = await convertHeicToJpeg(file);
  }

  return resizeAndConvertToBase64(blob);
}
