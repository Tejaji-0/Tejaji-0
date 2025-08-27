import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    name: 'SamosaGPT',
    url: 'https://github.com/Samosagpt/samosagpt',
    stars: true,
    screenshot: 'https://github.com/Tejaji-0/samosagpt/raw/main/demo.gif',
    description: '🚀 My favorite AI-powered project — hot and crispy like its name!'
  },
  {
    name: 'Devlancr',
    url: 'https://devlancr.vercel.app/',
    description: '⚡ A hub that connects developers with projects. Collaboration made effortless!'
  }
];

const Projects = () => (
  <section id="projects" className="projects-section">
    <h2>🌟 Featured Project</h2>
    <motion.div className="projects-carousel" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
      {projects.map((project, idx) => (
        <div key={project.name} className="project-card">
          {project.screenshot && <img src={project.screenshot} alt={project.name} className="project-screenshot" />}
          <h3><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a></h3>
          <p>{project.description}</p>
        </div>
      ))}
    </motion.div>
  </section>
);

export default Projects;
