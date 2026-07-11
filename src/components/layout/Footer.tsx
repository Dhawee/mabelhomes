"use client";

import Link from "next/link";
import { Instagram, Facebook, Linkedin, Twitter, Mail, Phone, Globe, MapPin } from "lucide-react";
import { SITE, NAV_LINKS } from "@/data/site";
import Logo from "@/components/ui/Logo";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    width="14"
    height="14"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 border-t border-white/5">
      <div className="section-padding !pb-12 bg-[#0B1528] dark:bg-navy">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div>
            <div className="mb-6">
              <Logo width={180} height={58} className="brightness-0 invert opacity-95" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-body">
              Premium real estate brokerage and investment consultancy serving
              discerning clients across Nigeria.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: SITE.social.instagram },
                { icon: Facebook, href: SITE.social.facebook },
                { icon: Linkedin, href: SITE.social.linkedin },
                { icon: Twitter, href: SITE.social.twitter },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:bg-gold hover:border-gold hover:text-white transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-white font-medium">Quick Links</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => {
                if (link.label === "Contact") {
                  return (
                    <li key="faq">
                      <Link
                        href="/faq"
                        className="text-white/60 hover:text-gold transition-colors text-sm font-heading"
                      >
                        FAQ
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-gold transition-colors text-sm font-heading"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-white font-medium">Properties</h4>
            <ul className="space-y-3 font-heading">
              {["For Sale", "Offplan", "Finished Homes", "Condos", "Commercial", "Land"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/properties"
                      className="text-white/60 hover:text-gold transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6 text-white font-medium">Contact Us</h4>
            <ul className="space-y-4 font-body">
              {SITE.phone.map((phone) => {
                const isWhatsApp = phone.includes("706");
                return (
                  <li key={phone} className="flex items-center gap-3 text-sm text-white/60 hover:text-gold transition-colors">
                    {isWhatsApp ? (
                      <WhatsAppIcon className="text-gold shrink-0" />
                    ) : (
                      <Phone size={14} className="text-gold shrink-0" />
                    )}
                    <a
                      href={isWhatsApp ? `https://wa.me/${phone.replace(/[\s+]/g, "")}` : `tel:${phone.replace(/[\s+]/g, "")}`}
                      target={isWhatsApp ? "_blank" : undefined}
                      rel={isWhatsApp ? "noopener noreferrer" : undefined}
                    >
                      {phone}
                    </a>
                  </li>
                );
              })}
              <li className="flex items-center gap-3 text-sm text-white/60 hover:text-gold transition-colors">
                <Mail size={14} className="text-gold shrink-0" />
                <a href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60 hover:text-gold transition-colors">
                <Globe size={14} className="text-gold shrink-0" />
                <a href={`https://${SITE.website}`} target="_blank" rel="noopener noreferrer">
                  {SITE.website}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={14} className="text-gold shrink-0 mt-1" />
                <span>{SITE.address}</span>
              </li>
            </ul>

            <div className="mt-8">
              <h4 className="font-heading text-lg mb-4 text-white font-medium">Newsletter</h4>
              <form className="flex gap-2" action="#">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
                />
                <button type="submit" className="btn-gold !px-5 !py-2.5 text-sm cursor-pointer">
                  Join
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0B1528] dark:bg-navy">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} {SITE.company}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
