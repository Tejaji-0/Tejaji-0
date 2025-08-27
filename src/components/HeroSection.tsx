import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

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
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="animate-fade-in">
          <p className="text-muted-foreground mb-4 text-lg font-mono">
            &lt; I love connecting with different people /&gt;
          </p>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">{name}</span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground/90">
            {title}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="glow-primary bg-primary text-primary-foreground hover:bg-primary/90">
              <Mail className="mr-2 h-5 w-5" />
              Get In Touch
            </Button>
            
            <div className="flex gap-4">
              <Button variant="outline" size="lg" asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
          
          <div className="animate-bounce">
            <ArrowDown className="h-8 w-8 text-muted-foreground mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;