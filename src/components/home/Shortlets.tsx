import Image from "next/image";
import Link from "next/link";
import { Check, Instagram, Calendar, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

const shortletFeatures = [
  "24/7 Power Supply & High-Speed Wi-Fi",
  "Regular Housekeeping & Professional Laundry",
  "Sophisticated Modern Kitchens & Appliances",
  "Premium, Secure, and Accessible Enclaves",
  "Dedicated Concierge & Round-the-Clock Support",
];

const shortletImages = [
  "/images/home/Shortlet Accommodations 1.jpeg",
  "/images/home/Shortlet Accommodations 2.jpeg",
  "/images/home/Shortlet Accommodations 3.jpeg",
];

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width="18"
    height="18"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Shortlets() {
  return (
    <section id="shortlets" className="section-padding bg-soft dark:bg-navy-light">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <FadeIn direction="left">
              <p className="section-subheading">Shortlet Accommodations</p>
              <h2 className="section-heading mb-6">
                Rosebowl Apartments
              </h2>
              <div className="space-y-4 text-navy/70 dark:text-white/70 leading-relaxed font-body">
                <p>
                  <strong>Rosebowl Apartments</strong> is a premier subsidiary of{" "}
                  <strong>Mabel Homes and Investment Limited</strong>, specializing in the management
                  of high-end, fully-serviced shortlet accommodations.
                </p>
                <p>
                  Whether you are traveling for business, on holiday with family, or looking for a
                  peaceful escape, our spaces are carefully curated to provide the comfort of a home and the luxury of a premium hotel.
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mt-6">
                {shortletFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-navy/80 dark:text-white/80 font-body">
                    <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Check size={14} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* 4 Action Buttons */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Link
                  href="/shortlets"
                  className="btn-gold shadow-gold inline-flex items-center justify-center gap-2 text-sm !py-3.5"
                >
                  <ArrowRight size={17} />
                  See Apartments
                </Link>

                <a
                  href="https://wa.me/2347063711532?text=Hello%20Mabel%20Homes,%20I%20would%20like%20to%20book%20a%20Shortlet%20Apartment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold shadow-gold inline-flex items-center justify-center gap-2 text-sm !py-3.5"
                >
                  <Calendar size={17} />
                  Book Now
                </a>

                <a
                  href="https://www.instagram.com/rosebowl_apartments?igsh=cnE2ZW13NGwxaDJr&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold inline-flex items-center justify-center gap-2 text-sm !py-3.5"
                >
                  <Instagram size={17} />
                  Explore on Instagram
                </a>

                <a
                  href="https://wa.me/2347063711532"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold inline-flex items-center justify-center gap-2 text-sm !py-3.5"
                >
                  <WhatsAppIcon />
                  Contact via WhatsApp
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Image Collage Grid */}
          <div className="lg:col-span-6">
            <FadeIn direction="right" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {/* Large Featured Image */}
                <div className="col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden group shadow-luxury border border-white/10 bg-gray-50 dark:bg-navy-dark">
                  <Image
                    src={shortletImages[0]}
                    alt="Rosebowl Living Space"
                    fill
                    className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                </div>
                {/* Smaller Image 1 */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden group shadow-luxury border border-white/10 bg-gray-50 dark:bg-navy-dark">
                  <Image
                    src={shortletImages[1]}
                    alt="Rosebowl Bedroom"
                    fill
                    className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                </div>
                {/* Smaller Image 2 */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden group shadow-luxury border border-white/10 bg-gray-50 dark:bg-navy-dark">
                  <Image
                    src={shortletImages[2]}
                    alt="Rosebowl Amenities"
                    fill
                    className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
