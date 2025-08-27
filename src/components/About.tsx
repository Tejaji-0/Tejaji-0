import React from 'react';
import { motion } from 'framer-motion';

const About = () => (
  <section id="about" className="about-section glassmorphism">
    <motion.div initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 1 }} className="about-content">
      <h2>⚡ About Me</h2>
      <p>I’m a curious dev who loves building fun things with code, tinkering with AI, and gaming on the side.</p>
      <pre className="about-code">
        <code>
{`const tejaji = {
  pronouns: 'He | Him',
  code: ['Python', 'Java', 'HTML', 'CSS', 'JS'],
  askMeAbout: ['chatbots', 'tech', 'app dev', 'gaming'],
  funFact: 'There are two ways to write error-free programs; only the third one works'
};`}
        </code>
      </pre>
    </motion.div>
  </section>
);

export default About;
