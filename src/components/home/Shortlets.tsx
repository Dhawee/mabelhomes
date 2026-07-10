import Image from "next/image";
import { Check, Instagram } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

const shortletFeatures = [
  "24/7 Power Supply & High-Speed Wi-Fi",
  "Regular Housekeeping & Professional Laundry",
  "Sophisticated Modern Kitchens & Appliances",
  "Premium, Secure, and Accessible Enclaves",
  "Dedicated Concierge & Round-the-Clock Support",
];

const shortletImages = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80", // Modern living room
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80", // Cozy bedroom
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80", // Hotel-like bathroom
];

export default function Shortlets() {
  return (
    <section id="shortlets" className="section-padding bg-soft dark:bg-navy/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <FadeIn direction="left">
              <p className="section-subheading">Shortlet Accommodations</p>
              <h2 className="section-heading mb-6">
                Rosebowl Apartments
              </h2>
              <div className="space-y-4 text-navy/70 dark:text-white/70 leading-relaxed">
                <p>
                  <strong>Rosebowl Apartments</strong> is a premier subsidiary of{" "}
                  <strong>Mabel Homes and Investment Limited</strong>, specializing in the management
                  of high-end, fully-serviced shortlet accommodations.
                </p>
                <p>
                  Whether you are traveling for business, holidaying with family, or looking for a
                  peaceful escape, our spaces are carefully curated to provide the comfort of a home and the luxury of a premium hotel.
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mt-6">
                {shortletFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-navy/80 dark:text-white/80">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Check size={14} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Instagram Button */}
              <div className="pt-8">
                <a
                  href="https://www.instagram.com/rosebowl_apartments?igsh=cnE2ZW13NGwxaDJr&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold shadow-gold inline-flex items-center gap-2"
                >
                  <Instagram size={18} />
                  Explore on Instagram
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Image Collage Grid */}
          <div className="lg:col-span-6">
            <FadeIn direction="right" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {/* Large Featured Image */}
                <div className="col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden group shadow-luxury border border-white/10">
                  <Image
                    src={shortletImages[0]}
                    alt="Rosebowl Living Space"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-colors duration-300" />
                </div>
                {/* Smaller Image 1 */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-luxury border border-white/10">
                  <Image
                    src={shortletImages[1]}
                    alt="Rosebowl Bedroom"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-colors duration-300" />
                </div>
                {/* Smaller Image 2 */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-luxury border border-white/10">
                  <Image
                    src={shortletImages[2]}
                    alt="Rosebowl Amenities"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-colors duration-300" />
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
