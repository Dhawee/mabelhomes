"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <>
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group">
        <Image
          src={images[current]}
          alt={`${title} - Image ${current + 1}`}
          fill
          className="object-cover cursor-pointer"
          sizes="100vw"
          priority
          onClick={() => setLightbox(true)}
        />
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-gold w-6" : "bg-white/60"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`relative aspect-[4/3] rounded-lg overflow-hidden ${
              i === current ? "ring-2 ring-gold" : ""
            }`}
          >
            <Image src={img} alt="" fill className="object-cover" sizes="150px" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-navy/95 flex items-center justify-center">
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <button onClick={prev} className="absolute left-6 text-white hover:text-gold" aria-label="Previous">
            <ChevronLeft size={32} />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/9] mx-16">
            <Image src={images[current]} alt={title} fill className="object-contain" sizes="90vw" />
          </div>
          <button onClick={next} className="absolute right-6 text-white hover:text-gold" aria-label="Next">
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
