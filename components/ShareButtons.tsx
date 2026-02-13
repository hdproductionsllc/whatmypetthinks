"use client";

import { useState } from "react";
import {
  canUseWebShare,
  shareImage,
  downloadImage,
  copyLinkToClipboard,
} from "@/lib/shareUtils";

interface Props {
  standardImageUrl: string;
  storyImageUrl: string;
  caption: string;
}

export default function ShareButtons({
  standardImageUrl,
  storyImageUrl,
  caption,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const webShareAvailable = canUseWebShare();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleShare = async (dataUrl: string) => {
    const shared = await shareImage(dataUrl, caption);
    if (!shared && !webShareAvailable) {
      downloadImage(dataUrl);
      showToast("Photo saved!");
    }
  };

  const handleCopy = async () => {
    const copied = await copyLinkToClipboard();
    showToast(copied ? "Link copied!" : "Could not copy link");
  };

  return (
    <div className="px-4 py-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
      <div className="flex gap-3">
        {/* Share / Download primary */}
        {webShareAvailable ? (
          <>
            <button
              onClick={() => handleShare(standardImageUrl)}
              className="btn-press flex-1 rounded-2xl bg-teal px-4 py-3 font-bold text-white shadow-md transition hover:bg-teal-dark"
            >
              Share
            </button>
            <button
              onClick={() => handleShare(storyImageUrl)}
              className="btn-press flex-1 rounded-2xl bg-white px-4 py-3 font-bold text-teal shadow-md ring-1 ring-teal/20 transition hover:bg-teal/5"
            >
              Share to Story
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => downloadImage(standardImageUrl)}
              className="btn-press flex-1 rounded-2xl bg-teal px-4 py-3 font-bold text-white shadow-md transition hover:bg-teal-dark"
            >
              Download Photo
            </button>
            <button
              onClick={() => downloadImage(storyImageUrl, "petsubtitles-story.jpg")}
              className="btn-press flex-1 rounded-2xl bg-white px-4 py-3 font-bold text-teal shadow-md ring-1 ring-teal/20 transition hover:bg-teal/5"
            >
              Download Story
            </button>
          </>
        )}
      </div>

      {/* Save & Copy row */}
      <div className="mt-2 flex gap-3">
        {webShareAvailable && (
          <button
            onClick={() => {
              downloadImage(standardImageUrl);
              showToast("Photo saved!");
            }}
            className="btn-press flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gray-200"
          >
            Save Photo
          </button>
        )}
        <button
          onClick={handleCopy}
          className="btn-press flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gray-200"
        >
          Copy Link
        </button>
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
