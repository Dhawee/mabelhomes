"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Heart } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { Property } from "@/types";

interface PropertyLikeButtonProps {
  property: Property;
  variant?: "card-action" | "image-badge";
  className?: string;
  iconSize?: number;
  onLikeToggle?: (liked: boolean, count: number) => void;
}

export default function PropertyLikeButton({
  property,
  variant = "card-action",
  className = "",
  iconSize = 16,
  onLikeToggle,
}: PropertyLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(property.likes_count ?? 0);
  const [liking, setLiking] = useState(false);

  // Retrieve or generate unique visitor ID
  const getVisitorId = (): string => {
    if (typeof window === "undefined") return "";
    let visitorId = localStorage.getItem("visitor_id") || "";
    if (!visitorId) {
      visitorId = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("visitor_id", visitorId);
    }
    return visitorId;
  };

  useEffect(() => {
    let cancelled = false;
    const visitorId = getVisitorId();
    if (!visitorId) return;

    const checkLikeStatus = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/properties/${property.slug}/like_status/?visitor_id=${visitorId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          setLiked(data.liked);
          setLikesCount(data.likes_count);
          onLikeToggle?.(data.liked, data.likes_count);
        }
      } catch (err) {
        console.error("Failed to check like status:", err);
      }
    };

    checkLikeStatus();
    return () => {
      cancelled = true;
    };
  }, [property.slug]);

  const handleLike = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liking) return;
    setLiking(true);

    const visitorId = getVisitorId();
    const wasLiked = liked;
    const prevCount = likesCount;
    const nextCount = wasLiked ? Math.max(0, likesCount - 1) : likesCount + 1;

    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount(nextCount);
    onLikeToggle?.(!wasLiked, nextCount);

    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${property.slug}/like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitor_id: visitorId }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(data.likes_count);
        onLikeToggle?.(data.liked, data.likes_count);
      } else {
        // Revert optimistic update
        setLiked(wasLiked);
        setLikesCount(prevCount);
        onLikeToggle?.(wasLiked, prevCount);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setLiked(wasLiked);
      setLikesCount(prevCount);
      onLikeToggle?.(wasLiked, prevCount);
    } finally {
      setLiking(false);
    }
  };

  if (variant === "image-badge") {
    const positionClass = className.includes("relative") || className.includes("absolute")
      ? ""
      : "absolute top-4 right-4";
    return (
      <button
        onClick={handleLike}
        className={`${positionClass} w-9 h-9 bg-white/90 dark:bg-navy/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer z-10 border-none ${className}`}
        aria-label="Save to favorites"
        type="button"
      >
        <Heart
          size={iconSize}
          className={liked ? "fill-gold text-gold" : "text-navy/60 dark:text-white/60"}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-navy transition-colors cursor-pointer border-none ${className}`}
      title="Like Property"
      type="button"
    >
      <Heart
        size={iconSize}
        className={liked ? "fill-gold text-gold" : "text-navy/60 dark:text-white/60"}
      />
      <span>{likesCount}</span>
    </button>
  );
}
