"use client";

const INITIAL_FREE_CREDITS = 5;
const MAX_SHARE_CREDITS_PER_DAY = 3;

// Storage keys
const CREDITS_USED_KEY = "petsubtitles_credits_used";
const SHARE_CREDITS_KEY = "petsubtitles_share_credits_total";
const WAITLIST_KEY = "petsubtitles_waitlist_email";

function sharesTodayKey(): string {
  const d = new Date();
  return `petsubtitles_shares_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getNum(key: string): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

function setNum(key: string, val: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(val));
}

/** Total credits available right now */
export function getAvailableCredits(): number {
  const used = getNum(CREDITS_USED_KEY);
  const shareCredits = getNum(SHARE_CREDITS_KEY);
  return Math.max(0, INITIAL_FREE_CREDITS + shareCredits - used);
}

/** Whether the user can translate right now */
export function hasCredits(): boolean {
  return getAvailableCredits() > 0;
}

/** Use one credit (call after successful translation) */
export function useCredit(): void {
  setNum(CREDITS_USED_KEY, getNum(CREDITS_USED_KEY) + 1);
}

/** How many share credits earned today */
export function getShareCreditsToday(): number {
  return getNum(sharesTodayKey());
}

/** Whether the user can still earn credits by sharing today */
export function canEarnShareCredit(): boolean {
  return getShareCreditsToday() < MAX_SHARE_CREDITS_PER_DAY;
}

/** Earn a credit by sharing. Returns true if credit was earned, false if daily limit hit. */
export function earnShareCredit(): boolean {
  if (!canEarnShareCredit()) return false;
  setNum(SHARE_CREDITS_KEY, getNum(SHARE_CREDITS_KEY) + 1);
  setNum(sharesTodayKey(), getShareCreditsToday() + 1);
  return true;
}

/** How many share credits remain earnable today */
export function getShareCreditsRemaining(): number {
  return Math.max(0, MAX_SHARE_CREDITS_PER_DAY - getShareCreditsToday());
}

/** Premium voice check — all voices free for now */
export function isPremiumVoice(voiceId: string): boolean {
  return false;
}

export function saveWaitlistEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WAITLIST_KEY, email);
}

export function getWaitlistEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WAITLIST_KEY);
}
