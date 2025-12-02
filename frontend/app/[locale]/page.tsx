import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { CategoriesSection } from '@/components/landing/categories-section';
import { PostTaskCTA } from '@/components/landing/post-task-cta';
import { TopContractorsSection } from '@/components/landing/top-contractors-section';
import { WhyChooseSection } from '@/components/landing/why-choose-section';
import { BecomeContractorCTA } from '@/components/landing/become-contractor-cta';
import { Footer } from '@/components/landing/footer';
import LandingPage from '@/components/pages/landing-page';
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingPage />
      {/* <Header />
      <HeroSection />
      <CategoriesSection />
      <PostTaskCTA />
      <TopContractorsSection />
      <WhyChooseSection />
      <BecomeContractorCTA />
      <Footer /> */}
    </main>
  );
}
