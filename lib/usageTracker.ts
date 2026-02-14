"use client";

const FREE_USES_PER_DAY = 10;
const MAX_SHARE_CREDITS_PER_DAY = 3;

// Premium voices — everything except "funny"
const PREMIUM_VOICES = new Set(["dramatic", "genz", "shakespeare", "passive", "therapist", "telenovela"]);

// Storage keys
const WAITLIST_KEY = "petsubtitles_waitlist_email";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function storageKey(prefix: string): string {
  return `petsubtitles_${prefix}_${todayKey()}`;
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

// --- Free tier (Funny voice) ---

/** How many free uses remain today */
export function getFreeUsesRemaining(): number {
  return Math.max(0, FREE_USES_PER_DAY - getNum(storageKey("free_used")));
}

/** Whether the user has free credits for the Funny voice */
export function hasFreeCredits(): boolean {
  return getFreeUsesRemaining() > 0;
}

/** Consume one free credit */
export function useFreeCredit(): void {
  const key = storageKey("free_used");
  setNum(key, getNum(key) + 1);
}

// --- Premium tier (all other voices) ---

/** Whether a voice requires premium credits */
export function isPremiumVoice(voiceId: string): boolean {
  return PREMIUM_VOICES.has(voiceId);
}

/** Get current premium credits (earned via sharing) */
export function getPremiumCredits(): number {
  return getNum(storageKey("premium_credits"));
}

/** Whether the user has premium credits */
export function hasPremiumCredits(): boolean {
  return getPremiumCredits() > 0;
}

/** Consume one premium credit */
export function usePremiumCredit(): void {
  const key = storageKey("premium_credits");
  const current = getNum(key);
  if (current > 0) {
    setNum(key, current - 1);
  }
}

// --- Share-to-unlock ---

/** How many share credits earned today */
function getShareCreditsToday(): number {
  return getNum(storageKey("shares"));
}

/** Whether the user can still earn credits by sharing today */
export function canEarnShareCredit(): boolean {
  return getShareCreditsToday() < MAX_SHARE_CREDITS_PER_DAY;
}

/** How many share credits remain earnable today */
export function getShareCreditsRemaining(): number {
  return Math.max(0, MAX_SHARE_CREDITS_PER_DAY - getShareCreditsToday());
}

/** Earn a premium credit by sharing. Returns true if credit was earned. */
export function earnShareCredit(): boolean {
  if (!canEarnShareCredit()) return false;
  const sharesKey = storageKey("shares");
  setNum(sharesKey, getShareCreditsToday() + 1);
  const creditsKey = storageKey("premium_credits");
  setNum(creditsKey, getNum(creditsKey) + 1);
  return true;
}

// --- Backward-compatible wrappers ---

/** Total credits available (free + premium). Used by Header badge. */
export function getAvailableCredits(): number {
  return getFreeUsesRemaining() + getPremiumCredits();
}

/** Whether the user can translate with any voice */
export function hasCredits(): boolean {
  return hasFreeCredits() || hasPremiumCredits();
}

/** Use one credit — prefers free, falls back to premium */
export function useCredit(): void {
  if (hasFreeCredits()) {
    useFreeCredit();
  } else {
    usePremiumCredit();
  }
}

// --- Waitlist ---

export function saveWaitlistEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WAITLIST_KEY, email);
}

export function getWaitlistEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WAITLIST_KEY);
}
