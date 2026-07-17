"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { API_BASE_URL } from "@/config";

// SVG Data URI placeholder for broken images (a nice gray card with a house icon)
const PLACEHOLDER_SVG = 
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%231E293B'/><path d='M400 180 L200 340 L240 340 L240 460 L360 460 L360 380 L440 380 L440 460 L560 460 L560 340 L600 340 Z' fill='%23B45309' opacity='0.8'/><text x='400' y='520' font-family='sans-serif' font-weight='600' font-size='22' fill='%23D1D5DB' text-anchor='middle'>Image Unavailable</text></svg>";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  propertySlug?: string;
  imageId?: string | number;
  containerClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  propertySlug,
  imageId,
  className = "",
  containerClassName = "",
  sizes,
  fill,
  priority,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);

  // If source changes, reset states
  useEffect(() => {
    setHasError(false);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    if (hasError) return; // Prevent loops
    setHasError(true);
    setLoading(false);

    if (propertySlug && !reported) {
      setReported(true);
      fetch(`${API_BASE_URL}/api/properties/${propertySlug}/log_missing_image/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: src,
          image_id: imageId || "unknown",
        }),
      }).catch((err) => {
        console.error("Failed to report missing image to admin notification pipeline:", err);
      });
    }
  };

  return (
    <div className={`relative w-full h-full ${containerClassName}`}>
      {/* Pulse skeleton placeholder */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-navy/40 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Image
        src={hasError ? PLACEHOLDER_SVG : src}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={`${className} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
