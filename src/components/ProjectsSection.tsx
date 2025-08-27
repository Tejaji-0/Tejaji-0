import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";

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
    liveUrl: "https://github.com/Samosagpt/samosagpt"
  },
  {
    title: "Interactive Web Applications",
    description: "Collection of responsive web applications built with modern frontend technologies, focusing on user experience and performance optimization.",
    technologies: ["React", "JavaScript", "HTML5", "CSS3", "Responsive Design"],
    githubUrl: "https://github.com/Tejaji-0"
  },
  {
    title: "Java Backend Solutions",
    description: "Robust backend applications and APIs developed in Java, demonstrating object-oriented programming principles and scalable architecture patterns.",
    technologies: ["Java", "Spring Framework", "REST APIs", "Database Integration"],
    githubUrl: "https://github.com/Tejaji-0"
  },
  {
    title: "Gaming Projects",
    description: "Fun gaming applications and interactive experiences that showcase creative programming and user engagement through game development principles.",
    technologies: ["JavaScript", "Game Development", "Interactive Design", "Animation"],
    githubUrl: "https://github.com/Tejaji-0"
  }
];

const ProjectsSection = ({ projects = defaultProjects }: ProjectsSectionProps) => {
  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A showcase of my passion projects - from AI chatbots to gaming experiences. 
            Each project represents a journey of learning and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.title}
              className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="border-primary/30 text-primary">
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  {project.githubUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Code
                      </a>
                    </Button>
                  )}
                  
                  {project.liveUrl && (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;