import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/animations/AnimatedSection";
import AnimatedCard from "@/components/animations/AnimatedCard";

interface Skill {
  name: string;
  category: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface SkillsSectionProps {
  skills?: Skill[];
}

const defaultSkills: Skill[] = [
  // Programming Languages
  { name: "Python", category: "Languages", level: "Expert" },
  { name: "Java", category: "Languages", level: "Advanced" },
  { name: "JavaScript", category: "Languages", level: "Advanced" },
  { name: "TypeScript", category: "Languages", level: "Advanced" },
  { name: "C++", category: "Languages", level: "Intermediate" },
  
  // Frontend Development
  { name: "React", category: "Frontend", level: "Expert" },
  { name: "React Native", category: "Frontend", level: "Advanced" },
  { name: "Next.js", category: "Frontend", level: "Advanced" },
  { name: "HTML5", category: "Frontend", level: "Expert" },
  { name: "CSS3", category: "Frontend", level: "Expert" },
  { name: "Tailwind CSS", category: "Frontend", level: "Advanced" },
  { name: "Bootstrap", category: "Frontend", level: "Advanced" },
  
  // Backend Development
  { name: "Node.js", category: "Backend", level: "Advanced" },
  { name: "Django", category: "Backend", level: "Advanced" },
  { name: "Flask", category: "Backend", level: "Intermediate" },
  { name: ".NET", category: "Backend", level: "Intermediate" },
  
  // Databases
  { name: "MongoDB", category: "Database", level: "Advanced" },
  { name: "MySQL", category: "Database", level: "Advanced" },
  { name: "PostgreSQL", category: "Database", level: "Intermediate" },
  { name: "SQLite", category: "Database", level: "Intermediate" },
  
  // AI & Machine Learning
  { name: "TensorFlow", category: "AI/ML", level: "Advanced" },
  { name: "PyTorch", category: "AI/ML", level: "Advanced" },
  { name: "OpenCV", category: "AI/ML", level: "Intermediate" },
  { name: "scikit-learn", category: "AI/ML", level: "Advanced" },
  { name: "Pandas", category: "AI/ML", level: "Advanced" },
  
  // Mobile Development
  { name: "Flutter", category: "Mobile", level: "Intermediate" },
  { name: "NativeScript", category: "Mobile", level: "Beginner" },
  
  // Game Development
  { name: "Unity", category: "Game Dev", level: "Intermediate" },
  { name: "Unreal Engine", category: "Game Dev", level: "Beginner" },
  
  // Design & Creative
  { name: "Figma", category: "Design", level: "Advanced" },
  { name: "Photoshop", category: "Design", level: "Intermediate" },
  { name: "Illustrator", category: "Design", level: "Intermediate" },
  { name: "Adobe XD", category: "Design", level: "Intermediate" },
  { name: "Blender", category: "Design", level: "Beginner" },
  
  // DevOps & Tools
  { name: "Git", category: "DevOps", level: "Expert" },
  { name: "Docker", category: "DevOps", level: "Advanced" },
  { name: "Kubernetes", category: "DevOps", level: "Intermediate" },
  { name: "Linux", category: "DevOps", level: "Advanced" },
  { name: "Bash", category: "DevOps", level: "Intermediate" },
  { name: "Travis CI", category: "DevOps", level: "Intermediate" },
  
  // Other Technologies
  { name: "Electron", category: "Desktop", level: "Intermediate" },
  { name: "Arduino", category: "Hardware", level: "Intermediate" },
  { name: "Selenium", category: "Testing", level: "Intermediate" },
  { name: "MATLAB", category: "Data Science", level: "Intermediate" },
];

const SkillsSection = ({ skills = defaultSkills }: SkillsSectionProps) => {
  const skillCategories = Array.from(new Set(skills.map(skill => skill.category)));
  
  const getLevelColor = (level?: string) => {
    switch (level) {
      case "Expert": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-primary text-primary-foreground";
      case "Intermediate": return "bg-secondary text-secondary-foreground";
      case "Beginner": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Technical Skills</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <AnimatedSection
              key={category}
              delay={index * 0.1}
              direction="up"
            >
              <AnimatedCard className="h-full">
                <Card className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills
                        .filter(skill => skill.category === category)
                        .map((skill, skillIndex) => (
                          <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.1 + skillIndex * 0.05 
                            }}
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, -5, 5, 0],
                              transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className={`${getLevelColor(skill.level)} transition-all duration-300 cursor-pointer`}
                            >
                              {skill.name}
                            </Badge>
                          </motion.div>
                        ))
                      }
                    </div>
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

export default SkillsSection;