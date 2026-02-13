"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "petsubtitles_history";
const MAX_ITEMS = 10;

export interface HistoryItem {
  id: string;
  thumbnailDataUrl: string;
  standardImageUrl: string;
  storyImageUrl: string;
  caption: string;
  timestamp: number;
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "timestamp">): void {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
    };
    history.unshift(newItem);
    if (history.length > MAX_ITEMS) history.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    // QuotaExceededError — clear oldest items and retry
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      try {
        const history = getHistory();
        const trimmed = history.slice(0, Math.floor(history.length / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Give up silently — history is non-critical
      }
    }
  }
}

function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Create a small thumbnail from a data URL */
export function createThumbnail(dataUrl: string, maxSize = 150): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = maxSize / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => resolve(dataUrl); // fallback
    img.src = dataUrl;
  });
}

interface Props {
  onRestore: (item: HistoryItem) => void;
}

export default function RecentHistory({ onRestore }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Refresh when storage changes (e.g., after a new translation)
  useEffect(() => {
    const handleStorage = () => setHistory(getHistory());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="py-4">
      <p className="mb-2 px-4 text-sm font-semibold text-charcoal-light">
        Recent translations
      </p>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2">
        {history.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onRestore(item)}
            className="btn-press shrink-0 overflow-hidden rounded-2xl shadow-md transition hover:shadow-lg animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
            aria-label={`Restore translation: ${item.caption}`}
          >
            <img
              src={item.thumbnailDataUrl}
              alt={item.caption}
              className="h-24 w-24 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
