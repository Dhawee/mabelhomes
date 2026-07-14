"use client";

import { useState } from "react";
import { Play, Maximize2, ExternalLink } from "lucide-react";
import { PropertyVideo } from "@/types";

interface PropertyVideoPlayerProps {
  video: PropertyVideo;
  className?: string;
}

export default function PropertyVideoPlayer({
  video,
  className = "",
}: PropertyVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  // Embedded external video (YouTube / Vimeo)
  if (video.embed_url && (video.video_type === "youtube" || video.video_type === "vimeo")) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`}>
        {!playing ? (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full absolute inset-0 flex flex-col items-center justify-center group z-10"
            aria-label="Play video"
          >
            {/* Thumbnail gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Platform label */}
            <span className="absolute top-4 right-4 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm capitalize z-10">
              {video.video_type === "youtube" ? "▶ YouTube" : "⬤ Vimeo"}
            </span>

            {/* Play button */}
            <div className="relative z-10 w-20 h-20 bg-gold rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-gold/90 transition-all duration-300">
              <Play size={32} className="text-white ml-1" />
            </div>

            {video.title && (
              <p className="relative z-10 text-white text-sm font-medium mt-4 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm max-w-[90%] text-center truncate">
                {video.title}
              </p>
            )}
          </button>
        ) : (
          <iframe
            src={`${video.embed_url}?autoplay=1&rel=0`}
            className="w-full h-full absolute inset-0"
            title={video.title || "Property Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // External link (generic URL not YouTube/Vimeo)
  if (video.video_type === "external" && video.video_url) {
    return (
      <div className={`relative w-full flex flex-col items-center justify-center bg-navy/5 dark:bg-white/5 rounded-xl p-8 ${className}`}>
        <ExternalLink size={40} className="text-gold mb-4" />
        <p className="text-navy/70 dark:text-white/70 text-sm mb-4">
          {video.title || "External Video"}
        </p>
        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-sm"
        >
          Watch Video
        </a>
      </div>
    );
  }

  // Uploaded MP4 / WebM file
  if (video.video_src) {
    return (
      <div className={`relative w-full bg-black rounded-xl overflow-hidden ${className}`}>
        <video
          className="w-full h-full object-contain"
          controls
          preload="metadata"
          title={video.title || "Property Video"}
        >
          <source
            src={video.video_src}
            type={video.video_src.endsWith(".webm") ? "video/webm" : "video/mp4"}
          />
          <p className="text-white/60 p-4 text-sm">
            Your browser does not support HTML5 video.{" "}
            <a
              href={video.video_src}
              className="text-gold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download the video
            </a>
          </p>
        </video>
      </div>
    );
  }

  return null;
}
