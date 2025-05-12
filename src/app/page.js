import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import AudienceSection from "../components/AudienceSection";
import DemoSection from "../components/DemoSection";
import TestimonialsSection from "../components/TestimonialsSection";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <AudienceSection />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
