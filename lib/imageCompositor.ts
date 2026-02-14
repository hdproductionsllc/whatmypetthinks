"use client";

const BRAND_NAME = "PetSubtitles";
const BRAND_URL = "petsubtitles.com";
const AMBER = "#F59E0B";
const FOOTER_HEIGHT = 50;

interface CompositeResult {
  standardDataUrl: string;
  storyDataUrl: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for compositing"));
    img.src = src;
  });
}

/** Wait for Google Fonts with a timeout fallback */
async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch {
    // Proceed with system fonts
  }
}

/** Break text into lines that fit within maxWidth, with character-level fallback for long words */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Handle words that are individually wider than maxWidth
    if (ctx.measureText(word).width > maxWidth && currentLine === "") {
      let remaining = word;
      while (remaining.length > 0) {
        let end = remaining.length;
        while (end > 1 && ctx.measureText(remaining.slice(0, end)).width > maxWidth) {
          end--;
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = remaining.slice(0, end);
        remaining = remaining.slice(end);
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/** Auto-size font to fit text within constraints */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  fontFamily: string,
  bold = true
): { lines: string[]; fontSize: number } {
  let fontSize = startSize;

  while (fontSize >= minSize) {
    ctx.font = `${bold ? "bold " : ""}${fontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      return { lines, fontSize };
    }
    fontSize -= 2;
  }

  // At minimum size, just use whatever lines we get
  ctx.font = `${bold ? "bold " : ""}${minSize}px ${fontFamily}`;
  return { lines: wrapText(ctx, text, maxWidth), fontSize: minSize };
}

/** Draw the standard format: original image + subtitle bar + branded footer */
function drawStandard(
  img: HTMLImageElement,
  caption: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const totalH = img.naturalHeight + FOOTER_HEIGHT;
  canvas.width = w;
  canvas.height = totalH;

  const ctx = canvas.getContext("2d")!;

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Subtitle gradient bar (bottom 20% of image)
  const barHeight = img.naturalHeight * 0.2;
  const barY = img.naturalHeight - barHeight;
  const gradient = ctx.createLinearGradient(0, barY, 0, img.naturalHeight);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.5)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, barY, w, barHeight);

  // Caption text
  const padding = w * 0.06;
  const maxTextWidth = w - padding * 2;
  const fontFamily = '"Nunito", "Segoe UI", Arial, sans-serif';
  const { lines, fontSize } = fitText(
    ctx,
    caption,
    maxTextWidth,
    3,
    Math.round(w * 0.045),
    14,
    fontFamily
  );

  const lineHeight = fontSize * 1.3;
  const textBlockHeight = lines.length * lineHeight;
  const textStartY = img.naturalHeight - (barHeight * 0.4 + textBlockHeight) / 2;

  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], w / 2, textStartY + i * lineHeight);
  }

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Branded footer
  ctx.fillStyle = AMBER;
  ctx.fillRect(0, img.naturalHeight, w, FOOTER_HEIGHT);

  const footerY = img.naturalHeight + FOOTER_HEIGHT * 0.65;
  ctx.fillStyle = "white";

  // Left: brand name with paw emoji
  ctx.textAlign = "left";
  ctx.font = `bold 16px ${fontFamily}`;
  ctx.fillText(`🐾 ${BRAND_NAME}`, padding, footerY);

  // Right: URL
  ctx.textAlign = "right";
  ctx.font = `14px ${fontFamily}`;
  ctx.fillText(BRAND_URL, w - padding, footerY);

  return canvas;
}

/** Draw story format: 1080x1920 with gradient bg, centered photo, caption, CTA */
function drawStory(
  img: HTMLImageElement,
  caption: string
): HTMLCanvasElement {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Amber → orange gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, AMBER);
  bgGrad.addColorStop(1, "#EA580C");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const fontFamily = '"Nunito", "Segoe UI", Arial, sans-serif';
  const displayFont = '"Fredoka", "Nunito", sans-serif';

  // Top logo
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = `bold 48px ${displayFont}`;
  ctx.fillText(`🐾 ${BRAND_NAME}`, W / 2, 100);

  // Pet photo — centered, with rounded corners and shadow
  const photoMaxW = W - 120;
  const photoMaxH = H * 0.5;
  let photoW = img.naturalWidth;
  let photoH = img.naturalHeight;
  const scale = Math.min(photoMaxW / photoW, photoMaxH / photoH);
  photoW = Math.round(photoW * scale);
  photoH = Math.round(photoH * scale);
  const photoX = (W - photoW) / 2;
  const photoY = 160;
  const cornerRadius = 24;

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;

  // Rounded rect clip
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, cornerRadius);
  ctx.clip();
  ctx.drawImage(img, photoX, photoY, photoW, photoH);
  ctx.restore();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Caption below photo
  const captionY = photoY + photoH + 60;
  const captionMaxW = W - 120;
  const { lines, fontSize } = fitText(
    ctx,
    caption,
    captionMaxW,
    4,
    36,
    20,
    fontFamily
  );

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 4;

  const lineHeight = fontSize * 1.4;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, captionY + i * lineHeight);
  }

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // CTA banner at bottom
  const ctaH = 180;
  const ctaY = H - ctaH;
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, ctaY, W, ctaH);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = `bold 28px ${fontFamily}`;
  ctx.fillText("Translate YOUR pet's thoughts", W / 2, ctaY + 60);

  ctx.font = `24px ${fontFamily}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(BRAND_URL, W / 2, ctaY + 110);
  ctx.globalAlpha = 1;

  return canvas;
}

export async function compositeSubtitles(
  originalDataUrl: string,
  caption: string
): Promise<CompositeResult> {
  await ensureFontsReady();

  const img = await loadImage(originalDataUrl);

  const standardCanvas = drawStandard(img, caption);
  const storyCanvas = drawStory(img, caption);

  return {
    standardDataUrl: standardCanvas.toDataURL("image/png"),
    storyDataUrl: storyCanvas.toDataURL("image/jpeg", 0.92),
  };
}
