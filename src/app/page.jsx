import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CodeInsights from "@/components/landing/CodeInsights";
import LearningEfficiency from "@/components/landing/LearningEfficiency";
import StudentInsights from "@/components/landing/StudentInsights";
import CodingEnvironments from "@/components/landing/CodingEnvironments";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CodeInsights />
      <LearningEfficiency />
      <StudentInsights />
      <CodingEnvironments />
      <CTASection />
      <Footer />
    </main>
  );
}