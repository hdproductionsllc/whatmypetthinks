"use client";

import { SAMPLE_EXAMPLES } from "@/lib/sampleData";

export default function SocialProof() {
  return (
    <div className="py-4">
      <p className="mb-2 px-4 text-sm font-semibold text-charcoal-light">
        What pets are saying today
      </p>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {SAMPLE_EXAMPLES.map((example, i) => (
          <div
            key={example.id}
            className="shrink-0 w-44 overflow-hidden rounded-2xl bg-white shadow-md animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s`, scrollSnapAlign: "start" }}
          >
            {/* Real composited thumbnail */}
            <img
              src={example.thumb}
              alt={`${example.petType}: "${example.caption}"`}
              className="w-full"
              loading="lazy"
            />
            {/* Caption + meta */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">
                  {example.voiceEmoji} {example.voiceStyle}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-charcoal/40">{example.petType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
