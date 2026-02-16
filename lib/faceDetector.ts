"use client";

type FaceAPI = typeof import("@vladmandic/face-api");

let faceapi: FaceAPI | null = null;
let modelLoaded = false;

async function ensureModel(): Promise<FaceAPI> {
  if (!faceapi) {
    faceapi = await import("@vladmandic/face-api");
  }
  if (!modelLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    modelLoaded = true;
  }
  return faceapi;
}

/**
 * Returns true if any human face is detected in the image.
 * Fails open (returns false) on any error so uploads aren't blocked.
 */
export async function hasFaces(dataUrl: string): Promise<boolean> {
  try {
    const api = await ensureModel();

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Failed to load image for face detection"));
      i.src = dataUrl;
    });

    const detections = await api.detectAllFaces(
      img,
      new api.TinyFaceDetectorOptions({ scoreThreshold: 0.4 })
    );

    return detections.length > 0;
  } catch (err) {
    console.warn("[faceDetector] Detection failed, allowing upload:", err);
    return false;
  }
}
