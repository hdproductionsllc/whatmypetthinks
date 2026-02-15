"use client";

import { useEffect, useRef, useState } from "react";
import { saveWaitlistEmail, getWaitlistEmail, getShareCreditsRemaining } from "@/lib/usageTracker";
import { canUseWebShare, shareImage } from "@/lib/shareUtils";
import { trackEvent } from "@/lib/analytics";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lastResultImage?: string;
  lastCaption?: string;
  onShareToUnlock?: () => void;
}

export default function PaywallModal({
  isOpen,
  onClose,
  lastResultImage,
  lastCaption,
  onShareToUnlock,
}: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shareCreditsLeft = getShareCreditsRemaining();
  const canShareToUnlock = shareCreditsLeft > 0 && (lastResultImage ? canUseWebShare() : true);

  useEffect(() => {
    const existing = getWaitlistEmail();
    if (existing) {
      setExistingEmail(existing);
      setSubmitted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current && !submitted && !canShareToUnlock) {
      inputRef.current.focus();
    }
  }, [isOpen, submitted, canShareToUnlock]);

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

  const handleShareToUnlock = async () => {
    if (lastResultImage && lastCaption) {
      setSharing(true);
      try {
        const shared = await shareImage(lastResultImage, lastCaption);
        if (shared && onShareToUnlock) {
          onShareToUnlock();
          onClose();
        }
      } catch {
        // Share cancelled or failed
      } finally {
        setSharing(false);
      }
    } else if (onShareToUnlock) {
      onShareToUnlock();
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      saveWaitlistEmail(email.trim());
      trackEvent("paywall_email_submitted");
      setSubmitted(true);
      setExistingEmail(email.trim());
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Daily limit reached"
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

        {/* Header */}
        <div className="text-center">
          <div className="mb-3 text-4xl">🐾</div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-charcoal">
            Daily Limit Reached
          </h2>
          <p className="mt-1 text-sm text-charcoal-light">
            Your free translations reset tomorrow
          </p>
        </div>

        {/* Share to unlock option */}
        {canShareToUnlock && (
          <div className="mt-5">
            <p className="mb-3 text-center text-sm text-charcoal-light">
              Share a result to earn 1 more translation
              <span className="block text-xs text-charcoal/40 mt-1">
                ({shareCreditsLeft} share credit{shareCreditsLeft !== 1 ? "s" : ""} left today)
              </span>
            </p>
            <button
              onClick={handleShareToUnlock}
              disabled={sharing}
              className="btn-press w-full rounded-2xl bg-teal px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-teal-dark min-h-[52px] disabled:opacity-50"
            >
              {sharing ? "Opening share..." : "Share & Unlock 1 More"}
            </button>
          </div>
        )}

        {/* Divider */}
        {canShareToUnlock && (
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        )}

        {/* Premium waitlist */}
        <div className={canShareToUnlock ? "" : "mt-5"}>
          <p className="mb-3 text-center text-sm text-charcoal-light">
            {canShareToUnlock
              ? "Go unlimited — no sharing required"
              : "Come back tomorrow for 5 more free translations, or go unlimited"}
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-green-50 p-4 text-center">
              <p className="text-sm font-semibold text-green-700">
                You&apos;re on the list! 🎉
              </p>
              <p className="mt-1 text-xs text-green-600">
                We&apos;ll notify {existingEmail} when premium launches.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                className="btn-press mt-3 w-full rounded-xl bg-amber py-3 font-bold text-white shadow-md transition hover:bg-amber-dark min-h-[44px]"
              >
                Join Premium Waitlist — $3.99/mo
              </button>
            </form>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600 min-h-[44px]"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
