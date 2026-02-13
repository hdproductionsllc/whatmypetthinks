"use client";

import { useCallback, useState, useEffect } from "react";
import Header from "@/components/Header";
import PhotoCapture from "@/components/PhotoCapture";
import VoiceSelector from "@/components/VoiceSelector";
import TranslateButton from "@/components/TranslateButton";
import PaywallModal from "@/components/PaywallModal";
import ResultDisplay from "@/components/ResultDisplay";
import ShareButtons from "@/components/ShareButtons";
import RecentHistory, {
  saveToHistory,
  createThumbnail,
  type HistoryItem,
} from "@/components/RecentHistory";
import { processImageFile } from "@/lib/imageUtils";
import { compositeSubtitles } from "@/lib/imageCompositor";
import {
  hasReachedLimit,
  incrementUsage,
  isPremiumVoice,
  getRemainingTranslations,
} from "@/lib/usageTracker";
import type { VoiceStyle } from "@/lib/anthropic";

type AppState = "idle" | "photo_selected" | "translating" | "result" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedVoice, setSelectedVoice] = useState<VoiceStyle>("funny");
  const [imageData, setImageData] = useState<{
    base64: string;
    dataUrl: string;
    mediaType: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [caption, setCaption] = useState("");
  const [standardImage, setStandardImage] = useState("");
  const [storyImage, setStoryImage] = useState("");
  const [error, setError] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"premium_voice" | "daily_limit">("premium_voice");
  const [remaining, setRemaining] = useState(3);
  const [isOffline, setIsOffline] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  // Track online/offline
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const handleImageSelected = useCallback(async (file: File) => {
    try {
      setIsConverting(true);
      setError("");
      const result = await processImageFile(file);
      setImageData(result);
      setPreviewUrl(result.dataUrl);
      setAppState("photo_selected");
    } catch {
      setError("Could not process that image. Please try another photo.");
      setAppState("error");
    } finally {
      setIsConverting(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setImageData(null);
    setPreviewUrl(null);
    setCaption("");
    setStandardImage("");
    setStoryImage("");
    setError("");
    setAppState("idle");
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!imageData) return;

    // Check freemium limits
    if (hasReachedLimit()) {
      setPaywallReason("daily_limit");
      setPaywallOpen(true);
      return;
    }

    if (isPremiumVoice(selectedVoice)) {
      setPaywallReason("premium_voice");
      setPaywallOpen(true);
      return;
    }

    setAppState("translating");
    setError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageData.base64,
          mediaType: imageData.mediaType,
          voiceStyle: selectedVoice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setCaption(data.caption);

      // Composite the subtitles
      const composited = await compositeSubtitles(imageData.dataUrl, data.caption);
      setStandardImage(composited.standardDataUrl);
      setStoryImage(composited.storyDataUrl);

      // Track usage
      incrementUsage();
      setRemaining(getRemainingTranslations());

      // Save to history
      const thumbnail = await createThumbnail(composited.standardDataUrl);
      saveToHistory({
        thumbnailDataUrl: thumbnail,
        standardImageUrl: composited.standardDataUrl,
        storyImageUrl: composited.storyDataUrl,
        caption: data.caption,
      });
      setHistoryKey((k) => k + 1);

      setAppState("result");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again!"
      );
      setAppState("error");
    }
  }, [imageData, selectedVoice]);

  const handleRestore = useCallback((item: HistoryItem) => {
    setCaption(item.caption);
    setStandardImage(item.standardImageUrl);
    setStoryImage(item.storyImageUrl);
    setPreviewUrl(null);
    setImageData(null);
    setAppState("result");
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <Header />

      {/* Offline banner */}
      {isOffline && (
        <div className="mx-4 mb-2 rounded-xl bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-600">
          You&apos;re offline. Connect to the internet to translate.
        </div>
      )}

      {/* Photo upload */}
      <PhotoCapture
        onImageSelected={handleImageSelected}
        previewUrl={appState === "result" ? null : previewUrl}
        onClear={handleClear}
        isConverting={isConverting}
      />

      {/* Voice selector — show when photo selected or translating */}
      {(appState === "photo_selected" || appState === "translating") && (
        <VoiceSelector
          selected={selectedVoice}
          onSelect={setSelectedVoice}
          onPremiumTap={() => {
            setPaywallReason("premium_voice");
            setPaywallOpen(true);
          }}
        />
      )}

      {/* Translate button */}
      {(appState === "photo_selected" || appState === "translating") && (
        <TranslateButton
          onClick={handleTranslate}
          isLoading={appState === "translating"}
          disabled={!imageData || isOffline}
        />
      )}

      {/* Error state */}
      {appState === "error" && error && (
        <div className="mx-4 mt-4 rounded-2xl bg-red-50 px-4 py-3 text-center animate-fade-up">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={handleClear}
            className="mt-2 text-sm font-semibold text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {appState === "result" && standardImage && (
        <>
          <div className="mt-4">
            <ResultDisplay imageDataUrl={standardImage} caption={caption} />
          </div>
          <ShareButtons
            standardImageUrl={standardImage}
            storyImageUrl={storyImage}
            caption={caption}
          />
          <div className="px-4 py-2">
            <button
              onClick={handleClear}
              className="btn-press w-full rounded-2xl bg-gray-100 py-3 text-sm font-semibold text-charcoal transition hover:bg-gray-200"
            >
              Translate Another Pet
            </button>
          </div>
        </>
      )}

      {/* Remaining counter */}
      {appState !== "result" && (
        <div className="mt-2 text-center text-xs text-charcoal-light/60">
          {remaining} free translation{remaining !== 1 ? "s" : ""} remaining today
        </div>
      )}

      {/* Recent history */}
      <div className="mt-auto">
        <RecentHistory key={historyKey} onRestore={handleRestore} />
      </div>

      {/* Footer */}
      <footer className="px-4 pb-6 pt-2 text-center text-xs text-charcoal-light/40">
        Made with 🐾 by PetSubtitles
      </footer>

      {/* Paywall modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
      />
    </div>
  );
}
