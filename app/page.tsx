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
  hasCredits,
  useCredit,
  earnShareCredit,
  getAvailableCredits,
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
  const [isOffline, setIsOffline] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [creditRefresh, setCreditRefresh] = useState(0);
  const [shareToast, setShareToast] = useState<string | null>(null);

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

  const refreshCredits = useCallback(() => {
    setCreditRefresh((k) => k + 1);
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

  const doTranslate = useCallback(async (voice?: VoiceStyle) => {
    if (!imageData) return;

    const voiceToUse = voice ?? selectedVoice;

    // Check credits
    if (!hasCredits()) {
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
          voiceStyle: voiceToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setCaption(data.caption);

      // Composite the subtitles
      let composited;
      try {
        composited = await compositeSubtitles(imageData.dataUrl, data.caption);
      } catch {
        throw new Error("Couldn't create the subtitle image. Try a different photo.");
      }
      setStandardImage(composited.standardDataUrl);
      setStoryImage(composited.storyDataUrl);

      // Use a credit
      useCredit();
      refreshCredits();

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
  }, [imageData, selectedVoice, refreshCredits]);

  const handleVoiceSelect = useCallback((voice: VoiceStyle) => {
    setSelectedVoice(voice);
    // If we're in result state, auto re-translate with the new voice
    if (appState === "result" && imageData) {
      doTranslate(voice);
    }
  }, [appState, imageData, doTranslate]);

  const handleShareComplete = useCallback(() => {
    const earned = earnShareCredit();
    refreshCredits();
    if (earned) {
      setShareToast("Earned 1 bonus translation! 🐾");
      setTimeout(() => setShareToast(null), 3000);
    }
  }, [refreshCredits]);

  const handleShareToUnlock = useCallback(() => {
    const earned = earnShareCredit();
    refreshCredits();
    if (earned) {
      setShareToast("Translation unlocked! 🐾");
      setTimeout(() => setShareToast(null), 3000);
    }
  }, [refreshCredits]);

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
      <Header creditRefresh={creditRefresh} />

      {/* Offline banner */}
      {isOffline && (
        <div className="mx-4 mb-2 rounded-xl bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-600">
          You&apos;re offline. Connect to the internet to translate.
        </div>
      )}

      {/* Share credit toast */}
      {shareToast && (
        <div className="toast-enter mx-4 mb-2 flex justify-center">
          <div className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {shareToast}
          </div>
        </div>
      )}

      {/* Photo upload — hide when showing result */}
      {appState !== "result" && appState !== "translating" && (
        <PhotoCapture
          onImageSelected={handleImageSelected}
          previewUrl={previewUrl}
          onClear={handleClear}
          isConverting={isConverting}
        />
      )}

      {/* Voice selector — show when photo selected, translating, OR in result state */}
      {(appState === "photo_selected" || appState === "translating" || appState === "result") && (
        <VoiceSelector
          selected={selectedVoice}
          onSelect={handleVoiceSelect}
        />
      )}

      {/* Translate button — show when photo selected */}
      {appState === "photo_selected" && (
        <TranslateButton
          onClick={() => doTranslate()}
          isLoading={false}
          disabled={!imageData || isOffline}
        />
      )}

      {/* Loading state */}
      {appState === "translating" && (
        <TranslateButton
          onClick={() => {}}
          isLoading={true}
          disabled={true}
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
          <div className="mt-2">
            <ResultDisplay imageDataUrl={standardImage} caption={caption} />
          </div>
          <ShareButtons
            standardImageUrl={standardImage}
            storyImageUrl={storyImage}
            caption={caption}
            voiceStyle={selectedVoice}
            onShareComplete={handleShareComplete}
          />
          <div className="flex gap-2 px-4 py-1">
            <button
              onClick={() => doTranslate()}
              className="btn-press flex-1 rounded-2xl bg-amber/10 py-3 text-sm font-bold text-amber transition hover:bg-amber/20 min-h-[44px]"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleClear}
              className="btn-press flex-1 rounded-2xl bg-gray-100 py-3 text-sm font-semibold text-charcoal transition hover:bg-gray-200 min-h-[44px]"
            >
              📷 New Photo
            </button>
          </div>
        </>
      )}

      {/* Spacer when no result */}
      {appState !== "result" && <div className="mt-2" />}

      {/* Recent history */}
      <div className="mt-auto">
        <RecentHistory key={historyKey} onRestore={handleRestore} />
      </div>

      {/* Footer */}
      <footer className="px-4 pb-6 pt-2 text-center text-xs text-charcoal/30">
        Made with 🐾 by PetSubtitles
      </footer>

      {/* Paywall modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="no_credits"
        lastResultImage={standardImage || undefined}
        lastCaption={caption || undefined}
        onShareToUnlock={handleShareToUnlock}
      />
    </div>
  );
}
