"use client";

import type { VoiceStyle } from "@/lib/anthropic";
import { isPremiumVoice, hasPremiumCredits } from "@/lib/usageTracker";

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
  onPremiumTap?: (voice: VoiceStyle) => void;
  creditRefresh?: number;
}

export default function VoiceSelector({ selected, onSelect, onPremiumTap, creditRefresh }: Props) {
  const hasPremium = hasPremiumCredits();

  return (
    <div className="px-4 py-2">
      <p className="mb-2 text-sm font-semibold text-charcoal-light">Voice style</p>
      <div className="flex flex-wrap gap-2">
        {VOICES.map((voice) => {
          const isActive = selected === voice.id;
          const isPremium = isPremiumVoice(voice.id);
          const isLocked = isPremium && !hasPremium;

          return (
            <button
              key={voice.id}
              onClick={() => {
                if (isLocked && onPremiumTap) {
                  onPremiumTap(voice.id);
                } else {
                  onSelect(voice.id);
                }
              }}
              className={`btn-press flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-coral text-white shadow-md"
                  : isLocked
                  ? "bg-white text-charcoal/50 shadow-sm ring-1 ring-gray-200"
                  : "bg-white text-charcoal shadow-sm ring-1 ring-gray-200"
              }`}
              aria-pressed={isActive}
              aria-label={`${voice.label} voice${isLocked ? " (locked)" : ""}`}
            >
              <span>{voice.emoji}</span>
              <span>{voice.label}</span>
              {isLocked && <span className="ml-0.5 text-xs">🔒</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
