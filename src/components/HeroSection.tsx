import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedText from "@/components/animations/AnimatedText";
import FloatingBackground from "@/components/animations/FloatingBackground";
import ParticleSystem from "@/components/animations/ParticleSystem";

interface HeroSectionProps {
  name?: string;
  title?: string;
  description?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
}

const HeroSection = ({
  name = "Tejaji",
  title = "Full Stack Developer & AI Enthusiast", 
  description = "Building innovative solutions with Python, React, and AI. Passionate about chatbots, gaming, and open source collaboration.",
  githubUrl = "https://github.com/Tejaji-0",
  linkedinUrl = "https://www.linkedin.com/in/sri-narayana-tejaji/",
  email = "hello@tejaji.dev"
}: HeroSectionProps) => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Animated Background */}
      <FloatingBackground count={8} />
      <ParticleSystem count={30} />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.p 
            className="text-muted-foreground mb-4 text-lg font-mono"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            &lt; Hello World /&gt;
          </motion.p>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span 
              className="text-gradient"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {name}
            </motion.span>
          </motion.h1>
          
          <AnimatedText 
            className="text-2xl md:text-3xl font-semibold mb-6 text-foreground/90"
            delay={0.8}
          >
            {title}
          </AnimatedText>
          
          <AnimatedText 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            delay={1.2}
          >
            {description}
          </AnimatedText>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <a href="#contact" className="inline-flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Get In Touch
                </a>
              </Button>
            </motion.div>
            
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="outline" size="lg" asChild>
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub Profile">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: -360 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="outline" size="lg" asChild>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="inline-block"
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ArrowDown className="h-8 w-8 text-muted-foreground mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;