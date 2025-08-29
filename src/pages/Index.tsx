import HeroSection from "@/components/HeroSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import ScrollProgress from "@/components/animations/ScrollProgress";
import CursorTrail from "@/components/animations/CursorTrail";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <>
      <ScrollProgress />
      <CursorTrail />
      <motion.div 
        className="min-h-screen bg-background scroll-smooth"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </motion.div>
    </>
  );
};

export default Index;
