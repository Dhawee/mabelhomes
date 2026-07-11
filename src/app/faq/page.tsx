"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { FAQS } from "@/data/site";
import FadeIn from "@/components/ui/FadeIn";

export default function FAQPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("1"); // Open the first FAQ by default
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Buying", "Selling", "Payments", "Inspections", "Documentation"];

  const filteredFaqs = selectedCategory === "All"
    ? FAQS
    : FAQS.filter(f => f.category === selectedCategory);

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-navy text-navy dark:text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">Support & Answers</p>
          <h1 className="section-heading mb-4">Frequently Asked Questions</h1>
          <p className="text-navy/65 dark:text-white/65 max-w-lg mx-auto font-body text-sm md:text-base leading-relaxed">
            Have questions about buying, selling, documents, or inspections? We have compiled responses to help you navigate your real estate transactions.
          </p>
        </FadeIn>

        {/* Category Pills */}
        <FadeIn className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenFaqId(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wider transition-all duration-300 font-heading border cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gold border-gold text-white shadow-md"
                  : "bg-soft dark:bg-navy-light border-gray-100 dark:border-white/5 text-navy/70 dark:text-white/70 hover:border-gold/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </FadeIn>

        {/* FAQ Accordion List */}
        <FadeIn className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-gray-100 dark:border-white/5 bg-soft/30 dark:bg-navy-light/40 hover:border-gold/20 transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <HelpCircle size={18} className="text-gold shrink-0" />
                      <span className="font-medium text-sm md:text-base text-navy dark:text-white font-heading">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gold shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-6 pt-0 text-xs md:text-sm text-navy/60 dark:text-white/60 leading-relaxed font-body pl-[39px]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-navy/55 dark:text-white/55 font-body">
              No questions found for this category.
            </div>
          )}
        </FadeIn>

        {/* Contact Banner */}
        <FadeIn delay={0.2} className="mt-16 text-center">
          <div className="luxury-card p-8 bg-soft/30 dark:bg-navy-light/30 border border-gray-100 dark:border-white/5">
            <h3 className="font-heading text-xl text-navy dark:text-white mb-2 font-normal">
              Still Have Questions?
            </h3>
            <p className="text-xs md:text-sm text-navy/60 dark:text-white/60 mb-6 font-body">
              Can't find the answer you are looking for? Send us a message and our support team will get right back to you.
            </p>
            <a
              href="https://wa.me/2347063711532"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2"
            >
              <MessageSquare size={16} /> Contact Support via WhatsApp
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
