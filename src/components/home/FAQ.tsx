"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";
import { cn } from "@/lib/utils";

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const categories = [...new Set(FAQS.map((f) => f.category))];

  return (
    <section className="section-padding bg-white border-b border-gray-100 dark:bg-navy/20 dark:border-white/5">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">FAQ</p>
          <h2 className="section-heading">Frequently Asked Questions</h2>
        </FadeIn>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <FadeIn>
              <h3 className="font-heading text-xl text-gold mb-4">{category}</h3>
            </FadeIn>
            <div className="space-y-3">
              {FAQS.filter((f) => f.category === category).map((faq) => (
                <FadeIn key={faq.id}>
                  <div className="luxury-card overflow-hidden">
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="font-medium text-navy dark:text-white pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={cn(
                          "text-gold shrink-0 transition-transform duration-300",
                          openId === faq.id && "rotate-180"
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        openId === faq.id ? "max-h-96" : "max-h-0"
                      )}
                    >
                      <p className="px-5 pb-5 text-sm text-navy/60 dark:text-white/60 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
