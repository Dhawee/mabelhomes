import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";
import BackButton from "@/components/properties/BackButton";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE.company}.`,
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>
        <FadeIn>
          <h1 className="section-heading mb-8">Terms of Service</h1>
          <div className="space-y-6 text-navy/70 dark:text-white/70 leading-relaxed">
            <p>
              By accessing and using the {SITE.company} website, you agree to be bound by these
              Terms of Service. Please read them carefully before using our services.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">Services</h2>
            <p>
              {SITE.company} provides real estate brokerage, consultancy, and investment advisory
              services. All property listings are subject to availability and may be updated without
              prior notice.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">Property Information</h2>
            <p>
              While we strive to ensure accuracy, property details including prices, dimensions,
              and availability are provided for informational purposes and may change. We recommend
              verifying all information during consultation.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">Contact</h2>
            <p>
              For questions regarding these terms, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-gold hover:underline">
                {SITE.email}
              </a>.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
