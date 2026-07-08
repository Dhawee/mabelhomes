import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE.company}.`,
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <FadeIn>
          <h1 className="section-heading mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-navy/70 dark:text-white/70 leading-relaxed">
            <p>
              {SITE.company} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, and safeguard your
              personal information when you visit our website or use our services.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">Information We Collect</h2>
            <p>
              We may collect personal information including your name, email address, phone number,
              and property preferences when you fill out contact forms, schedule consultations, or
              enquire about properties.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">How We Use Your Information</h2>
            <p>
              Your information is used to respond to enquiries, provide real estate services,
              send relevant property updates, and improve our website experience. We do not sell
              your personal information to third parties.
            </p>
            <h2 className="font-heading text-2xl text-navy dark:text-white">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
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
