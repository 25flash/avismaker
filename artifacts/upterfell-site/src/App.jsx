import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import StorySection from './components/sections/StorySection';
import CollectionSection from './components/sections/CollectionSection';
import RaritySection from './components/sections/RaritySection';
import MintSection from './components/sections/MintSection';
import RoadmapSection from './components/sections/RoadmapSection';
import TeamSection from './components/sections/TeamSection';
import FAQSection from './components/sections/FAQSection';
import WalletModal from './components/modals/WalletModal';
import HouseModal from './components/modals/HouseModal';
import MintSuccessModal from './components/modals/MintSuccessModal';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main>
        <HeroSection />
        <StorySection />
        <CollectionSection />
        <RaritySection />
        <MintSection />
        <RoadmapSection />
        <TeamSection />
        <FAQSection />
      </main>
      <Footer />

      <WalletModal />
      <HouseModal />
      <MintSuccessModal />
    </div>
  );
}
