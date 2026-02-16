"use client";

import { supabase } from "./supabase";
import { hasFaces } from "./faceDetector";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOAD_COOLDOWN_MS = 5000;
let lastUploadTime = 0;

/** Re-encode any data URL as a compressed JPEG blob via canvas */
async function compressToJpeg(dataUrl: string, quality = 0.82): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Failed to load image for compression"));
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("JPEG compression failed"))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Fire-and-forget upload of a composited image to Supabase Storage + translations table.
 * Errors are silently logged — this must never block or crash the main UI flow.
 */
export function uploadTranslation(
  standardDataUrl: string,
  formatType: string,
  voiceStyle: string,
  petName?: string
): void {
  (async () => {
    try {
      if (!supabase) return;

      // Rate limit: one upload per 5 seconds
      const now = Date.now();
      if (now - lastUploadTime < UPLOAD_COOLDOWN_MS) return;
      lastUploadTime = now;

      // Check for human faces — still upload but mark as non-public
      const faceDetected = await hasFaces(standardDataUrl);

      // Compress to JPEG (PNG composites are 3-5MB, JPEG brings them to ~200-500KB)
      const blob = await compressToJpeg(standardDataUrl);

      // Reject oversized files (safety net — should never hit after JPEG compression)
      if (blob.size > MAX_FILE_SIZE) {
        console.warn("[feedUploader] File too large after compression:", blob.size);
        return;
      }

      // Sanitize pet name
      const cleanName = petName
        ? petName.slice(0, 50).trim().replace(/[<>"'&]/g, "")
        : null;

      // Upload to Storage with a unique filename
      const filename = `${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("Translations")
        .upload(filename, blob, { contentType: "image/jpeg" });

      if (uploadError) {
        console.warn("[feedUploader] Upload failed:", uploadError.message);
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("Translations")
        .getPublicUrl(filename);

      // Insert row into translations table (face-detected images stored but hidden from feed)
      const { error: insertError } = await supabase
        .from("translations")
        .insert({
          image_url: urlData.publicUrl,
          format_type: formatType,
          voice_style: voiceStyle,
          pet_name: cleanName,
          is_public: !faceDetected,
        });

      if (insertError) {
        console.warn("[feedUploader] Insert failed:", insertError.message);
      }
    } catch (err) {
      console.warn("[feedUploader] Unexpected error:", err);
    }
  })();
}
