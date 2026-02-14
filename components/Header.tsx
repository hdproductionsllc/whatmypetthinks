"use client";

import { getAvailableCredits } from "@/lib/usageTracker";
import { useEffect, useState } from "react";

interface Props {
  creditRefresh?: number;
}

export default function Header({ creditRefresh }: Props) {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    setCredits(getAvailableCredits());
  }, [creditRefresh]);

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Paw icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse cx="50" cy="62" rx="18" ry="22" fill="#F59E0B" />
          <ellipse cx="30" cy="36" rx="10" ry="13" fill="#F59E0B" transform="rotate(-10 30 36)" />
          <ellipse cx="44" cy="24" rx="9" ry="12" fill="#F59E0B" />
          <ellipse cx="58" cy="24" rx="9" ry="12" fill="#F59E0B" />
          <ellipse cx="72" cy="38" rx="10" ry="13" fill="#F59E0B" transform="rotate(10 72 38)" />
        </svg>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-charcoal">
          PetSubtitles
        </h1>
      </div>
      {credits !== null && (
        <div className={`rounded-full px-3 py-1 text-sm font-semibold ${
          credits > 0
            ? "bg-amber/10 text-amber"
            : "bg-red-50 text-red-500"
        }`}>
          {credits > 0 ? `🐾 ${credits} left` : "0 left"}
        </div>
      )}
    </header>
  );
}
