"use client";

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/** Generate descriptive filename: petsubtitles-funny-20260213-143022.png */
export function generateFilename(voiceStyle?: string, isStory?: boolean): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const voice = voiceStyle || "funny";
  const suffix = isStory ? "-story" : "";
  return `petsubtitles-${voice}${suffix}-${date}-${time}.png`;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function shareImage(
  dataUrl: string,
  caption: string,
  voiceStyle?: string,
  isStory?: boolean
): Promise<boolean> {
  if (!canUseWebShare()) return false;

  try {
    const blob = await dataUrlToBlob(dataUrl);
    const filename = generateFilename(voiceStyle, isStory);
    const file = new File([blob], filename, { type: "image/png" });

    await navigator.share({
      title: "PetSubtitles",
      text: `"${caption}" — Translate YOUR pet's thoughts at petsubtitles.com`,
      files: [file],
    });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return false; // user cancelled — not an error
    }
    throw err;
  }
}

export function downloadImage(dataUrl: string, filename?: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename || generateFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyLinkToClipboard(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText("https://petsubtitles.com");
    return true;
  } catch {
    return false;
  }
}
