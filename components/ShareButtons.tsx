"use client";

import { useState } from "react";
import {
  canUseWebShare,
  shareImage,
  downloadImage,
  generateFilename,
  copyLinkToClipboard,
} from "@/lib/shareUtils";
import { canEarnShareCredit } from "@/lib/usageTracker";

interface Props {
  standardImageUrl: string;
  storyImageUrl: string;
  caption: string;
  voiceStyle?: string;
  onShareComplete?: () => void;
}

export default function ShareButtons({
  standardImageUrl,
  storyImageUrl,
  caption,
  voiceStyle,
  onShareComplete,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const webShareAvailable = canUseWebShare();
  const canEarnCredit = canEarnShareCredit();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleShare = async (dataUrl: string, isStory: boolean) => {
    const shared = await shareImage(dataUrl, caption, voiceStyle, isStory);
    if (shared && onShareComplete) {
      onShareComplete();
    }
    if (!shared && !webShareAvailable) {
      downloadImage(dataUrl, generateFilename(voiceStyle, isStory));
      showToast("Photo saved!");
    }
  };

  const handleCopy = async () => {
    const copied = await copyLinkToClipboard();
    showToast(copied ? "Link copied! 🐾" : "Could not copy link");
  };

  const shareLabel = canEarnCredit
    ? "Share & Earn a Free Translation"
    : "Share This Masterpiece";

  const shareLabelShort = canEarnCredit
    ? "Share & Earn 1 Free"
    : "Share";

  return (
    <div className="px-4 py-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
      {/* Big share CTA */}
      <p className="mb-2 text-center text-sm font-bold text-charcoal">
        {canEarnCredit
          ? "Share to earn a bonus translation 👇"
          : "Your friends need to see this 👇"}
      </p>

      {webShareAvailable ? (
        <button
          onClick={() => handleShare(standardImageUrl, false)}
          className="btn-press mb-2 w-full rounded-2xl bg-teal px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-teal-dark min-h-[52px]"
        >
          <span className="sm:hidden">{shareLabelShort}</span>
          <span className="hidden sm:inline">{shareLabel}</span>
        </button>
      ) : (
        <button
          onClick={() => downloadImage(standardImageUrl, generateFilename(voiceStyle))}
          className="btn-press mb-2 w-full rounded-2xl bg-teal px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-teal-dark min-h-[52px]"
        >
          Download Photo
        </button>
      )}

      {/* Secondary actions row */}
      <div className="flex gap-2">
        {webShareAvailable ? (
          <>
            <button
              onClick={() => handleShare(storyImageUrl, true)}
              className="btn-press flex-1 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-teal shadow-sm ring-1 ring-teal/20 transition hover:bg-teal/5 min-h-[44px]"
            >
              📱 Share to Story
            </button>
            <button
              onClick={() => {
                downloadImage(standardImageUrl, generateFilename(voiceStyle));
                showToast("Saved! 🐾");
              }}
              className="btn-press flex-1 rounded-xl bg-gray-100 px-3 py-3 text-sm font-semibold text-charcoal transition hover:bg-gray-200 min-h-[44px]"
            >
              Save Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => downloadImage(storyImageUrl, generateFilename(voiceStyle, true))}
              className="btn-press flex-1 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-teal shadow-sm ring-1 ring-teal/20 transition hover:bg-teal/5 min-h-[44px]"
            >
              Download Story
            </button>
            <button
              onClick={handleCopy}
              className="btn-press flex-1 rounded-xl bg-gray-100 px-3 py-3 text-sm font-semibold text-charcoal transition hover:bg-gray-200 min-h-[44px]"
            >
              Copy Link
            </button>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-enter mt-3 flex justify-center">
          <div className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
