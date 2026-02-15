"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SAMPLE_EXAMPLES } from "@/lib/sampleData";

interface FeedItem {
  id: string;
  image_url: string;
}

const MIN_ITEMS = 6;

export default function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("translations")
          .select("id, image_url")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) {
          console.warn("[LiveFeed] Fetch failed:", error.message);
          setItems([]);
        } else {
          setItems(data ?? []);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Supplement with static samples if we have fewer than MIN_ITEMS
  const staticFallbacks: FeedItem[] =
    items.length < MIN_ITEMS
      ? SAMPLE_EXAMPLES.slice(0, MIN_ITEMS - items.length).map((ex) => ({
          id: `sample-${ex.id}`,
          image_url: ex.image,
        }))
      : [];

  const displayItems = [...items, ...staticFallbacks];

  return (
    <>
      <div className="py-4">
        <p className="mb-3 px-4 text-sm font-semibold text-charcoal-light">
          What pets are saying right now
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-3">
            {displayItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setLightbox(item.image_url)}
                className="overflow-hidden rounded-2xl shadow-md transition-transform active:scale-95 animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img
                  src={item.image_url}
                  alt="Pet translation"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox}
              alt="Pet translation"
              className="w-full rounded-2xl"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-charcoal shadow-lg"
            >
              &times;
            </button>
            <a
              href="#try"
              onClick={(e) => {
                e.preventDefault();
                setLightbox(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-3 block rounded-xl bg-coral py-3 text-center text-sm font-bold text-white shadow-lg"
            >
              Try yours free
            </a>
          </div>
        </div>
      )}
    </>
  );
}
