import React from 'react';
import { motion } from 'framer-motion';

const skills = [
  'Python', 'React', 'Java', 'HTML5', 'CSS3', 'JavaScript', 'Open Source', 'Gaming'
];

const Skills = () => (
  <section id="skills" className="skills-section">
    <h2>🛠️ Tech Stack</h2>
    <motion.div className="skills-grid" initial="hidden" whileInView="visible" variants={{hidden: {}, visible: {transition: {staggerChildren: 0.1}}}}>
      {skills.map(skill => (
        <motion.div key={skill} className="skill-badge" whileHover={{ scale: 1.1, boxShadow: '0 0 16px #6C63FF' }}>
          {skill}
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default Skills;
