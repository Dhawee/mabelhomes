import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import About from "@/components/home/About";
import WhyChoose from "@/components/home/WhyChoose";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import PropertySearch from "@/components/home/PropertySearch";
import Services from "@/components/home/Services";
import WhyInvest from "@/components/home/WhyInvest";
import ClientJourney from "@/components/home/ClientJourney";
import Testimonials from "@/components/home/Testimonials";
import Company from "@/components/home/Company";
import FAQ from "@/components/home/FAQ";
import Contact from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <WhyChoose />
      <FeaturedProperties />
      <PropertySearch />
      <Services />
      <WhyInvest />
      <ClientJourney />
      <Testimonials />
      <Company />
      <FAQ />
      <Contact />
    </>
  );
}
