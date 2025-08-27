import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => (
  <footer id="footer" className="footer-section">
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} className="footer-content">
      <blockquote>“Learning never exhausts the mind.”</blockquote>
      <span className="footer-note">✨ Open to collabs, discussions, and gaming sessions!</span>
    </motion.div>
  </footer>
);

export default Footer;
