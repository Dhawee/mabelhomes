import Hero from "@/components/home/Hero";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertySearch />
      <FeaturedProperties />
      <WhyChoose />
      <About />
      <Shortlets />
      <Services />
      <WhyInvest />
      <ClientJourney />
      <Testimonials />
      <Partners />
    </>
  );
}
