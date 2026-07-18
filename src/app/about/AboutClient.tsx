"use client";

import Image from "next/image";
import { Award, GraduationCap } from "lucide-react";
import { SITE, STATS } from "@/data/site";
import Counter from "@/components/ui/Counter";
import FadeIn from "@/components/ui/FadeIn";
import BackButton from "@/components/properties/BackButton";

const certifications = [
  "Licensed Real Estate Broker — Lagos State",
  "Certified Property Manager (CPM)",
  "Real Estate Investment Advisor Certification",
  "Professional Negotiation Certificate",
];

const milestones = [
  {
    year: "2021",
    title: "Portfolio Development",
    description: "Helped multiple corporate and private clients build high-performing luxury portfolios.",
  },
  {
    year: "2024",
    title: "Client Service Distinction",
    description: "Honored with the Excellence in Client Service Award as transactions topped ₦3 billion.",
  },
  {
    year: "2025",
    title: "Lagos Top Broker Award",
    description: "Awarded Top Performing Broker at the Lagos Real Estate Awards with over 120+ successful transactions.",
  },
];

export default function AboutClient() {
  return (
    <div className="pt-32 pb-20 bg-white dark:bg-navy text-navy dark:text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-6">
          <BackButton />
        </div>
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <p className="section-subheading">About</p>
          <h1 className="section-heading">{SITE.name}</h1>
          <p className="text-navy/60 dark:text-white/60 mt-4 max-w-2xl mx-auto font-body">
            {SITE.title} at {SITE.company}
          </p>
        </FadeIn>

        {/* Bio Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <FadeIn direction="left">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-luxury-lg border border-gray-100 dark:border-white/5">
              <Image
                src="/images/olajumoke-1.jpg"
                alt={SITE.name}
                fill
                className="object-cover object-top"
                sizes="50vw"
                priority
              />
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <h2 className="font-heading text-3xl text-navy dark:text-white mb-6">
              Professional Biography
            </h2>
            <div className="space-y-4 text-navy/70 dark:text-white/70 leading-relaxed font-body">
              <p>
                Aluko Olajumoke .O is a distinguished Real Estate Broker and Consultant
                with over 6 years of experience in Nigeria&apos;s premium property market.
                Specializing in luxury residential and commercial properties across Lagos
                and Abuja, she has built a reputation for integrity, expertise, and
                exceptional client service.
              </p>
              <p>
                As a leading broker at Mabel Homes and Investment Limited, Olajumoke has facilitated
                transactions worth over ₦3 billion, helping families find their dream homes
                and investors build profitable portfolios. Her deep understanding of market
                dynamics, combined with a client-first approach, ensures every transaction
                is handled with the utmost professionalism.
              </p>
              <p>
                Beyond brokerage, Olajumoke is a passionate advocate for transparent real
                estate practices in Nigeria, regularly sharing market insights and investment
                advice through seminars, publications, and industry articles.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center luxury-card p-8 transition-all duration-500 hover:shadow-luxury-lg hover:-translate-y-1 bg-soft/10 dark:bg-navy/30 border border-gray-100 dark:border-white/5">
                <p className="font-heading text-4xl text-gold mb-2 font-normal">
                  <Counter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="text-sm text-navy/60 dark:text-white/60 uppercase tracking-wider font-heading">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Timeline & Certifications grid */}
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Milestone Timeline (2 cols on large screen) */}
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="flex items-center gap-3 mb-8">
                <Award size={24} className="text-gold" />
                <h2 className="font-heading text-2.5xl text-navy dark:text-white font-normal">My Professional Journey</h2>
              </div>
              <div className="relative pl-6 border-l border-gold/30 space-y-8 ml-3">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-navy border-2 border-gold flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gold tracking-widest uppercase font-heading">{milestone.year}</span>
                      <h3 className="font-heading text-lg text-navy dark:text-white font-medium mb-1 mt-0.5 group-hover:text-gold transition-colors">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-navy/60 dark:text-white/60 leading-relaxed font-body">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Certifications (1 col) */}
          <div>
            <FadeIn delay={0.2}>
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={24} className="text-gold" />
                <h2 className="font-heading text-2.5xl text-navy dark:text-white font-normal">Certifications</h2>
              </div>
              <ul className="space-y-4">
                {certifications.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-soft/30 dark:bg-navy/30 border border-gray-100 dark:border-white/5 hover:border-gold/30 hover:scale-[1.01] transition-all duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                    <span className="text-sm text-navy/70 dark:text-white/70 font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
