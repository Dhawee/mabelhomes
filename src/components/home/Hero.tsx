"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { SITE } from "@/data/site";

export default function Hero() {
  return (
    <section className="relative bg-white dark:bg-navy pt-20 overflow-hidden">
      {/* 2 inches of separation from the Nav Bar = pt-48 (192px) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-48 pb-20 md:pt-56">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gold uppercase tracking-[0.2em] text-sm font-semibold mb-6"
            >
              {SITE.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-heading text-5xl md:text-6xl lg:text-7xl text-navy dark:text-white font-light leading-[1.1] mb-8"
            >
              Helping You Buy,
              <br />
              Sell &amp;
              <br />
              <span className="text-gold">Invest With Confidence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-navy/70 dark:text-white/70 text-lg max-w-lg mb-10 leading-relaxed"
            >
              Helping families, professionals and investors find exceptional real
              estate opportunities with trusted guidance and unmatched market expertise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/contact" className="btn-gold">
                Book Consultation
              </Link>
              <Link href="/properties" className="btn-outline">
                View Properties
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-[400px] h-[500px] mx-auto">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-luxury-lg border border-gray-100 dark:border-white/5">
                <Image
                  src="/images/olajumoke-1.jpg"
                  alt={SITE.name}
                  fill
                  className="object-cover object-top"
                  sizes="400px"
                  priority
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -bottom-6 -left-8 bg-white dark:bg-navy rounded-2xl p-5 shadow-luxury border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="font-semibold text-navy dark:text-white text-sm">
                  Trusted Realtor
                </p>
                <p className="text-gold text-xs mt-1">{SITE.company}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
