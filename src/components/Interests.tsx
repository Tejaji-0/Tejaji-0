import React from 'react';
import { motion } from 'framer-motion';

const interests = [
  '💻 Open Source Collaboration',
  '🕹️ Gaming & Game Development',
  '🤖 Building cool things with code',
  '🌱 Always learning something new'
];

const Interests = () => (
  <section id="interests" className="interests-section">
    <h2>🎮 Interests</h2>
    <motion.ul className="interests-list" initial="hidden" whileInView="visible" variants={{hidden: {}, visible: {transition: {staggerChildren: 0.1}}}}>
      {interests.map(item => (
        <motion.li key={item} className="interest-item" whileHover={{ scale: 1.05, color: '#00E6E6' }}>{item}</motion.li>
      ))}
    </motion.ul>
  </section>
);

export default Interests;
