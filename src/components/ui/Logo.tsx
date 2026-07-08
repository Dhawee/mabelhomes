"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  href?: string | null;
  priority?: boolean;
}

export default function Logo({
  className,
  width = 160,
  height = 52,
  href = "/",
  priority = false,
}: LogoProps) {
  const image = (
    <Image
      src="/mabel-homes-logo.png"
      alt="Mabel Homes & Investment"
      width={width}
      height={height}
      className={cn("object-contain object-left", className)}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block shrink-0">
        {image}
      </Link>
    );
  }

  return <div className="inline-block shrink-0">{image}</div>;
}
