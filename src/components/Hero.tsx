import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => (
  <section id="hero" className="hero-section">
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="hero-content">
      <img src="https://media.giphy.com/media/M9gbBd9nbDrOTu1Mqx/giphy.gif" alt="Tejaji Avatar" className="avatar-gif" />
      <h1 className="hero-heading">👋 Hey, I'm Tejaji!</h1>
      <p className="hero-subheading">Student • Developer • Builder</p>
      <div className="hero-buttons">
        <a href="#projects" className="gradient-button">🚀 View My Work</a>
        <a href="#contact" className="outline-button">📩 Connect</a>
      </div>
      <div className="hero-socials">
        <a href="https://github.com/Tejaji-0" target="_blank" rel="noopener noreferrer" className="social-badge github">GitHub</a>
        <a href="https://www.linkedin.com/in/sri-narayana-tejaji/" target="_blank" rel="noopener noreferrer" className="social-badge linkedin">LinkedIn</a>
      </div>
    </motion.div>
  </section>
);

export default Hero;
