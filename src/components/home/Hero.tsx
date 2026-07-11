"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative bg-navy pt-20 overflow-hidden min-h-[85vh] flex flex-col justify-center">
      {/* Background Image with Dark Blue/Navy Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=95" // Luxury modern home exterior at dusk
          alt="Mabel Homes Premium Real Estate Background"
          fill
          priority
          className="object-cover"
        />
        {/* Navy/Blue Gradient Overlay - matching the dark left / clear right look of the screenshot */}
        <div className="absolute inset-0 bg-navy/60 dark:bg-navy/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent lg:hidden" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-32 pb-32 md:pt-48 md:pb-48">
        <div className="max-w-2xl text-left text-white">
          {/* Subtitle with trailing horizontal line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-gold uppercase tracking-[0.25em] text-xs md:text-sm font-bold font-heading">
              FIND YOUR DREAM HOME
            </span>
            <div className="w-16 h-[2px] bg-gold" />
          </motion.div>
          
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.15] mb-6 tracking-tight"
          >
            Home Is Closer <br />
            <span className="text-gold font-normal">Than You Think</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/80 text-base md:text-lg mb-10 leading-relaxed font-body max-w-lg"
          >
            We help you find the best property that suits your lifestyle and budget. Your dream home is just a click away.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/properties" className="btn-gold shadow-gold font-heading text-sm px-8 py-4 flex items-center gap-2">
              EXPLORE PROPERTIES <span className="text-lg">→</span>
            </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-navy font-heading text-sm px-8 py-4 flex items-center gap-2">
              CONTACT US <span className="text-lg">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
