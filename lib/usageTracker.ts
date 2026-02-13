"use client";

const FREE_DAILY_LIMIT = 3;
const KEY_PREFIX = "petsubtitles_usage_";
const WAITLIST_KEY = "petsubtitles_waitlist_email";

function todayKey(): string {
  const d = new Date();
  return `${KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getUsageToday(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(todayKey());
  return val ? parseInt(val, 10) : 0;
}

export function incrementUsage(): void {
  if (typeof window === "undefined") return;
  const current = getUsageToday();
  localStorage.setItem(todayKey(), String(current + 1));
}

export function hasReachedLimit(): boolean {
  return getUsageToday() >= FREE_DAILY_LIMIT;
}

export function getRemainingTranslations(): number {
  return Math.max(0, FREE_DAILY_LIMIT - getUsageToday());
}

export function isPremiumVoice(voice: string): boolean {
  return voice !== "funny";
}

export function saveWaitlistEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WAITLIST_KEY, email);
}

export function getWaitlistEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WAITLIST_KEY);
}
