"use client";

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function shareImage(
  dataUrl: string,
  caption: string
): Promise<boolean> {
  if (!canUseWebShare()) return false;

  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], "petsubtitles.jpg", { type: "image/jpeg" });

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

export function downloadImage(dataUrl: string, filename = "petsubtitles.jpg") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
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
