import React from 'react';
import { motion } from 'framer-motion';

const links = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/sri-narayana-tejaji/', icon: 'linkedin' },
  { label: 'GitHub', url: 'https://github.com/Tejaji-0', icon: 'github' },
  { label: 'Portfolio', url: 'https://devlancr.vercel.app/', icon: 'globe' }
];

const Contact = () => (
  <section id="contact" className="contact-section">
    <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="contact-content">
      <h2>🔗 Let’s Connect!</h2>
      <div className="contact-links">
        {links.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className={`contact-link ${link.icon}`}>
            {link.label}
          </a>
        ))}
      </div>
    </motion.div>
  </section>
);

export default Contact;
