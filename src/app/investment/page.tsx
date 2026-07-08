import WhyInvest from "@/components/home/WhyInvest";
import Link from "next/link";
import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment",
  description: `Real estate investment opportunities with ${SITE.name} at ${SITE.company}.`,
};

export default function InvestmentPage() {
  return (
    <>
      <div className="pt-32 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn className="text-center mb-8">
            <p className="section-subheading">Investment</p>
            <h1 className="section-heading">Investment Opportunities</h1>
            <p className="text-navy/60 dark:text-white/60 mt-4 max-w-2xl mx-auto">
              Build lasting wealth through strategic real estate investments in Nigeria&apos;s
              fastest-growing markets.
            </p>
          </FadeIn>
        </div>
      </div>
      <WhyInvest />
      <div className="section-padding text-center">
        <FadeIn>
          <Link href="/contact" className="btn-gold">
            Start Investing Today
          </Link>
        </FadeIn>
      </div>
    </>
  );
}
