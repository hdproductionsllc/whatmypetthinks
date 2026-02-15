"use client";

import type { VoiceStyle } from "@/lib/anthropic";

const VOICES: { id: VoiceStyle; label: string; emoji: string }[] = [
  { id: "funny", label: "Silly", emoji: "😂" },
  { id: "passive", label: "Passive Agg", emoji: "😒" },
  { id: "genz", label: "Gen-Z", emoji: "💀" },
  { id: "dramatic", label: "Dramatic Narrator", emoji: "🎬" },
];

interface Props {
  selected: VoiceStyle;
  onSelect: (voice: VoiceStyle) => void;
}

export default function VoiceSelector({ selected, onSelect }: Props) {
  return (
    <div className="px-3 py-1.5">
      <p className="mb-1.5 text-sm font-semibold text-charcoal-light">Voice style</p>
      <div className="flex flex-wrap gap-1.5">
        {VOICES.map((voice) => {
          const isActive = selected === voice.id;

          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={`btn-press flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-coral text-white shadow-md"
                  : "bg-white text-charcoal shadow-sm ring-1 ring-gray-200"
              }`}
              aria-pressed={isActive}
              aria-label={`${voice.label} voice`}
            >
              <span>{voice.emoji}</span>
              <span>{voice.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
