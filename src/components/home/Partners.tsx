import FadeIn from "@/components/ui/FadeIn";

const partners = [
  {
    name: "Eko Atlantic Development",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Lekki Gardens Ltd",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Chevron Real Estate",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Federal Housing Corp",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Victoria Realty",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10.5 10.5 0 0114.14 0M1.394 9.393a15.5 15.5 0 0121.212 0" />
      </svg>
    ),
  },
  {
    name: "Zenith Developer Group",
    icon: (
      <svg className="w-12 h-12 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
];

export default function Partners() {
  return (
    <section className="py-16 bg-white dark:bg-navy border-t border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-10">
          <p className="section-subheading !mb-1">Our Collaborations</p>
          <h2 className="font-heading text-2.5xl text-navy dark:text-white tracking-tight">
            Trusted Partners & Developers
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, i) => (
            <FadeIn key={partner.name} delay={i * 0.08} className="w-full">
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-50 dark:border-white/5 hover:border-gold/30 hover:bg-soft/20 dark:hover:bg-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 group select-none">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  {partner.icon}
                </div>
                <span className="text-[11px] font-semibold tracking-wider text-center text-navy/70 dark:text-white/70 uppercase">
                  {partner.name}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
