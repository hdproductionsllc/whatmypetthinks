"use client";

import { useEffect, useRef, useState } from "react";
import { saveWaitlistEmail, getWaitlistEmail } from "@/lib/usageTracker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reason: "premium_voice" | "daily_limit";
}

export default function PaywallModal({ isOpen, onClose, reason }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const existing = getWaitlistEmail();
    if (existing) {
      setExistingEmail(existing);
      setSubmitted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current && !submitted) {
      inputRef.current.focus();
    }
  }, [isOpen, submitted]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      saveWaitlistEmail(email.trim());
      setSubmitted(true);
      setExistingEmail(email.trim());
    }
  };

  const headline =
    reason === "premium_voice"
      ? "Your pet has more to say!"
      : "You've used all 3 free translations today!";

  const subtext =
    reason === "premium_voice"
      ? "Premium voices are coming soon. Join the waitlist to unlock Sassy, Dramatic, Poetic, and more!"
      : "Premium members get unlimited translations. Join the waitlist to be first in line!";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Premium waitlist"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-bounce-in">
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mb-3 text-4xl">🐾</div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-charcoal">
            {headline}
          </h2>
          <p className="mt-2 text-sm text-charcoal-light">{subtext}</p>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-sm font-semibold text-green-700">
              You&apos;re on the list! 🎉
            </p>
            <p className="mt-1 text-xs text-green-600">
              We&apos;ll notify {existingEmail} when premium launches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20"
            />
            <button
              type="submit"
              className="btn-press mt-3 w-full rounded-xl bg-amber py-3 font-bold text-white shadow-md transition hover:bg-amber-dark"
            >
              Join Waitlist
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
