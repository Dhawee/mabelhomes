import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import About from "@/components/home/About";
import WhyChoose from "@/components/home/WhyChoose";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import Shortlets from "@/components/home/Shortlets";
import PropertySearch from "@/components/home/PropertySearch";
import Services from "@/components/home/Services";
import WhyInvest from "@/components/home/WhyInvest";
import ClientJourney from "@/components/home/ClientJourney";
import Testimonials from "@/components/home/Testimonials";
import Partners from "@/components/home/Partners";
import FAQ from "@/components/home/FAQ";
import Contact from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertySearch />
      <Stats />
      <About />
      <WhyChoose />
      <FeaturedProperties />
      <Shortlets />
      <Services />
      <WhyInvest />
      <ClientJourney />
      <Testimonials />
      <Partners />
      <FAQ />
      <Contact />
    </>
  );
}
