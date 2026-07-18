import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { SITE } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import BackButton from "@/components/properties/BackButton";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.name} for real estate consultations and enquiries.`,
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Get In Touch</p>
          <h1 className="section-heading">Contact Us</h1>
          <p className="text-navy/60 dark:text-white/60 mt-4 max-w-2xl mx-auto">
            Ready to start your real estate journey? We&apos;d love to hear from you.
          </p>
        </FadeIn>
        <ContactForm />
      </div>
    </div>
  );
}
