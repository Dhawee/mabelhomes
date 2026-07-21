import FadeIn from "@/components/ui/FadeIn";

const partners = [
  { name: "Veritasi",                  logo: "/images/partners/Veritasi Logo.jpg" },
  { name: "Gracias",                   logo: "/images/partners/gracias-global-logo-2_ew.png" },
  { name: "Landmark Corporate Realty", logo: "/images/partners/landmark corporate realty Logo.png" },
  { name: "Arkland",                   logo: "/images/partners/Arkland Logo.png" },
  { name: "Periwinkle",                logo: "/images/partners/periwinkle Logo.png" },
  { name: "Zylus Homes",               logo: "/images/partners/Zylus homes.jpg" },
  { name: "Tribitat",                  logo: "/images/partners/tribitat Logo.png" },
  { name: "Adozillion Homes",          logo: "/images/partners/adozillion homes_new.png" },
];

export default function Partners() {
  return (
    <section className="py-16 bg-white dark:bg-navy border-t border-b border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
        <FadeIn>
          <p className="section-subheading !mb-1">Our Collaborations</p>
          <h2 className="font-heading text-2.5xl text-navy dark:text-white tracking-tight">
            Trusted Partners &amp; Developers
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
              <div className="group-hover:scale-105 transition-transform duration-300 w-12 h-12 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain"
                />
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
