import FadeIn from "@/components/ui/FadeIn";

const partners = [
  {
    name: "Veritasi",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    name: "Gracias",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    name: "Landmark Corporate Realty",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Arkland",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Periwinkle",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646M20.354 15.354l-6.108-6.108M20.354 15.354a9 9 0 01-11.708 0M8.646 3.646l6.108 6.108M8.646 3.646a9 9 0 0111.708 0m-11.708 0l-3.528 3.528M14.754 9.754l3.528-3.528" />
      </svg>
    ),
  },
  {
    name: "Zylus Homes",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>
    ),
  },
  {
    name: "Tribitat",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Adozillion Homes",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 12l10 10 10-10L12 2z M12 2v20 M2 12h20" />
      </svg>
    ),
  },
];

export default function Partners() {
  return (
    <section className="py-16 bg-white dark:bg-navy border-t border-b border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <FadeIn>
          <p className="section-subheading !mb-1">Our Collaborations</p>
          <h2 className="font-heading text-2.5xl text-navy dark:text-white tracking-tight">
            Trusted Partners & Developers
          </h2>
        </FadeIn>
      </div>

      {/* Infinite Horizontal Logo Marquee */}
      <div className="relative w-full overflow-hidden mask-fade py-2">
        <div className="flex gap-8 animate-marquee hover:[animation-play-state:paused] w-max select-none">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-50 dark:border-white/5 hover:border-gold/30 hover:bg-soft/20 dark:hover:bg-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group w-36 shrink-0"
            >
              <div className="group-hover:scale-105 transition-transform duration-300">
                {partner.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-center text-navy/70 dark:text-white/70 uppercase truncate w-full">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
