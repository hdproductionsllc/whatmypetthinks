"use client";

import type { VoiceStyle } from "@/lib/anthropic";

const VOICES: { id: VoiceStyle; label: string; emoji: string }[] = [
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "dramatic", label: "Narrator", emoji: "🎬" },
  { id: "genz", label: "Gen-Z", emoji: "💀" },
  { id: "shakespeare", label: "Shakespeare", emoji: "🎭" },
  { id: "passive", label: "Passive Agg", emoji: "😒" },
  { id: "therapist", label: "Therapist", emoji: "🧠" },
  { id: "telenovela", label: "Telenovela", emoji: "🌹" },
];

interface Props {
  selected: VoiceStyle;
  onSelect: (voice: VoiceStyle) => void;
}

export default function VoiceSelector({ selected, onSelect }: Props) {
  return (
    <div className="px-4 py-2">
      <p className="mb-2 text-sm font-semibold text-charcoal-light">Voice style</p>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {VOICES.map((voice) => {
          const isActive = selected === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={`btn-press flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-amber text-white shadow-md"
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
