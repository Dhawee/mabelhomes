"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Play, Image as ImageIcon } from "lucide-react";
import { PropertyVideo } from "@/types";
import PropertyVideoPlayer from "./PropertyVideoPlayer";

// Unified gallery item: can be an image URL or a video object
type GalleryItem =
  | { kind: "image"; url: string; order: number }
  | { kind: "video"; video: PropertyVideo; order: number };

function getVideoThumbnail(video: PropertyVideo): string | null {
  if (video.video_type === "youtube" && video.video_url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = video.video_url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
  }
  return null;
}

interface PropertyGalleryProps {
  images: string[];
  imagesDetails?: any[];
  videos?: PropertyVideo[];
  title: string;
}

export default function PropertyGallery({
  images,
  imagesDetails = [],
  videos = [],
  title,
}: PropertyGalleryProps) {
  // Build unified, ordered gallery items
  const items: GalleryItem[] = [];

  if (imagesDetails && imagesDetails.length > 0) {
    imagesDetails.forEach((img) => {
      const url = img.image_optimized || img.image || img.original || img.image_url;
      if (url) {
        items.push({
          kind: "image" as const,
          url,
          order: img.order,
        });
      }
    });
  } else {
    images.forEach((url, i) => {
      items.push({
        kind: "image" as const,
        url,
        order: i,
      });
    });
  }

  videos.forEach((video) => {
    items.push({
      kind: "video" as const,
      video,
      order: video.order,
    });
  });

  items.sort((a, b) => a.order - b.order);

  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const totalItems = items.length;
  const prev = () => setCurrent((c) => (c - 1 + totalItems) % totalItems);
  const next = () => setCurrent((c) => (c + 1) % totalItems);

  // Auto-rotate only through images (pause on videos)
  useEffect(() => {
    if (totalItems <= 1) return;
    const currentItem = items[current];
    // Don't auto-rotate if on a video slide
    if (currentItem?.kind === "video") return;

    const timer = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % totalItems;
        return next;
      });
    }, 20000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, current]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  if (totalItems === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-navy/5 dark:bg-white/5 flex items-center justify-center">
        <span className="text-navy/30 dark:text-white/30 text-6xl">🏠</span>
      </div>
    );
  }

  const currentItem = items[current];

  return (
    <>
      {/* Main Display */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group bg-black">
        {currentItem.kind === "image" ? (
          <Image
            src={currentItem.url}
            alt={`${title} — ${current + 1} of ${totalItems}`}
            fill
            className="object-cover cursor-pointer transition-opacity duration-300"
            sizes="100vw"
            priority={current === 0}
            onClick={() => setLightbox(true)}
          />
        ) : (
          <div className="w-full h-full">
            <PropertyVideoPlayer
              video={currentItem.video}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Gallery type indicator */}
        {currentItem.kind === "video" && (
          <div className="absolute top-4 left-4 bg-navy/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <Play size={12} /> Video Tour
          </div>
        )}

        {/* Navigation arrows — shown on hover */}
        {totalItems > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-navy/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-navy/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {totalItems > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-gold w-6 h-2"
                    : "bg-white/60 hover:bg-white w-2 h-2"
                }`}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Counter badge */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {totalItems}
        </div>
      </div>

      {/* Thumbnail strip */}
      {totalItems > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-200 ${
                i === current
                  ? "ring-2 ring-gold ring-offset-1 ring-offset-transparent scale-105"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`View item ${i + 1}`}
            >
              {item.kind === "image" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              ) : (
                <div className="relative w-full h-full bg-navy/80 flex flex-col items-center justify-center">
                  {getVideoThumbnail(item.video) ? (
                    <>
                      <Image
                        src={getVideoThumbnail(item.video)!}
                        alt=""
                        fill
                        className="object-cover opacity-50"
                        sizes="150px"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Play size={20} className="text-gold fill-gold" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="text-gold" />
                      <span className="text-white/60 text-[10px]">Video</span>
                    </>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox (images only) */}
      {lightbox && currentItem.kind === "image" && (
        <div
          className="fixed inset-0 z-[70] bg-navy/97 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(false);
          }}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-gold transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <button
            onClick={prev}
            className="absolute left-6 text-white/80 hover:text-gold transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/9] mx-20">
            <Image
              src={currentItem.url}
              alt={`${title} — ${current + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
          <button
            onClick={next}
            className="absolute right-6 text-white/80 hover:text-gold transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {current + 1} of {totalItems} · Press ESC or click outside to close
          </div>
        </div>
      )}
    </>
  );
}
