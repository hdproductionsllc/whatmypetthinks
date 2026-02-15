"use client";

const FREE_USES_PER_DAY = 5;
const MAX_SHARE_CREDITS_PER_DAY = 3;

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

// --- Credits ---

/** How many credits are available right now */
export function getAvailableCredits(): number {
  const used = getNum(storageKey("free_used"));
  const earned = getShareCreditsToday();
  return Math.max(0, FREE_USES_PER_DAY - used + earned);
}

/** Whether the user can translate */
export function hasCredits(): boolean {
  return getAvailableCredits() > 0;
}

/** Consume one credit */
export function useCredit(): void {
  const key = storageKey("free_used");
  setNum(key, getNum(key) + 1);
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

/** Earn a credit by sharing. Returns true if credit was earned. */
export function earnShareCredit(): boolean {
  if (!canEarnShareCredit()) return false;
  const sharesKey = storageKey("shares");
  setNum(sharesKey, getShareCreditsToday() + 1);
  return true;
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
