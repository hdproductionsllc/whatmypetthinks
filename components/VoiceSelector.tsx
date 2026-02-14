"use client";

import type { VoiceStyle } from "@/lib/anthropic";

const VOICES: { id: VoiceStyle; label: string; emoji: string; premium: boolean }[] = [
  { id: "funny", label: "Funny", emoji: "😂", premium: false },
  { id: "sassy", label: "Sassy", emoji: "💅", premium: false },
  { id: "philosophical", label: "Deep", emoji: "🤔", premium: false },
  { id: "dramatic", label: "Drama", emoji: "🎭", premium: false },
  { id: "wholesome", label: "Sweet", emoji: "🥰", premium: false },
  { id: "unhinged", label: "Chaos", emoji: "🤪", premium: false },
  { id: "poetic", label: "Poetic", emoji: "✨", premium: false },
];

interface Props {
  selected: VoiceStyle;
  onSelect: (voice: VoiceStyle) => void;
  onPremiumTap: () => void;
}

export default function VoiceSelector({ selected, onSelect, onPremiumTap }: Props) {
  return (
    <div className="px-4 py-2">
      <p className="mb-2 text-sm font-semibold text-charcoal-light">Voice style</p>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {VOICES.map((voice) => {
          const isActive = selected === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => {
                if (voice.premium) {
                  onPremiumTap();
                } else {
                  onSelect(voice.id);
                }
              }}
              className={`btn-press flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-amber text-white shadow-md"
                  : voice.premium
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-charcoal shadow-sm ring-1 ring-gray-200"
              }`}
              aria-pressed={isActive}
              aria-label={`${voice.label} voice${voice.premium ? " (Premium)" : ""}`}
            >
              <span>{voice.emoji}</span>
              <span>{voice.label}</span>
              {voice.premium && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-50"
                  aria-hidden="true"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
