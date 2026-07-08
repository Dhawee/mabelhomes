"use client";

import { CLIENT_JOURNEY } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function ClientJourney() {
  return (
    <section className="section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Your Journey</p>
          <h2 className="section-heading">From Consultation to Handover</h2>
        </FadeIn>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-[1px] bg-gold/30" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CLIENT_JOURNEY.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="relative mx-auto w-24 h-24 rounded-full bg-white dark:bg-navy border-2 border-gold/30 flex items-center justify-center mb-4 group-hover:border-gold group-hover:shadow-gold transition-all duration-500">
                    <span className="font-heading text-2xl text-gold">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-base text-navy dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-navy/50 dark:text-white/50">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
