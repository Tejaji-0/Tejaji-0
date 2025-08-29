import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/animations/AnimatedSection";
import AnimatedCard from "@/components/animations/AnimatedCard";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

interface ProjectsSectionProps {
  projects?: Project[];
}

const defaultProjects: Project[] = [
  {
    title: "SamosaGPT",
    description: "🚀 My favorite AI-powered project! An innovative chatbot solution that combines natural language processing with intelligent responses. Built with modern AI frameworks.",
    technologies: ["Python", "AI/ML", "Natural Language Processing", "API Integration"],
    githubUrl: "https://github.com/Samosagpt/samosagpt",
    liveUrl: "https://samosagpt.vercel.app/"
  },
  {
    title: "Devlancr",
    description: "Connect with fellow developers who share your passion for code. Find collaborators, mentors, and friends in the most innovative way possible.",
    technologies: ["React", "JavaScript", "HTML5", "CSS3", "Responsive Design"],
    liveUrl: "https://devlancr.vercel.app/"
  },
  {
    title: "Contact Hub",
    description: "The future of communication and event management",
    technologies: ["Java", "Spring Framework", "REST APIs", "Database Integration"],
    liveUrl: "https://contact-connect-invite.vercel.app/"
  },
  {
    title: "Gaming Projects",
    description: "Fun gaming applications and interactive experiences that showcase creative programming and user engagement through game development principles.",
    technologies: ["JavaScript", "Game Development", "Interactive Design", "Animation"],
    liveUrl: "http://tejaji-0.me/snake.io/"
  }
];

const ProjectsSection = ({ projects = defaultProjects }: ProjectsSectionProps) => {
  return (
    <section className="py-20 px-6 bg-muted/20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A showcase of my passion projects - from AI chatbots to gaming experiences. 
            Each project represents a journey of learning and innovation.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <AnimatedSection
              key={project.title}
              delay={index * 0.2}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <AnimatedCard className="h-full" intensity={15}>
                <Card className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300 group h-full relative overflow-hidden">
                  {/* Animated background on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <CardHeader className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {project.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <motion.div
                          key={tech}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.2 + techIndex * 0.1 
                          }}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -3, 3, 0],
                            transition: { duration: 0.3 }
                          }}
                        >
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {tech}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                    >
                      {project.githubUrl && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        </motion.div>
                      )}
                      
                      {project.liveUrl && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;