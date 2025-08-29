import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CursorPosition {
  x: number;
  y: number;
}

const CursorTrail = () => {
  const [mousePosition, setMousePosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isOverText, setIsOverText] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = !!(target.tagName === 'BUTTON' || 
                              target.tagName === 'A' || 
                              target.closest('button') || 
                              target.closest('a') ||
                              target.classList.contains('cursor-pointer'));
      setIsHovering(isInteractive);

      // Check if hovering over text elements
      const isTextElement = !!(target.tagName === 'P' ||
                              target.tagName === 'H1' ||
                              target.tagName === 'H2' ||
                              target.tagName === 'H3' ||
                              target.tagName === 'H4' ||
                              target.tagName === 'H5' ||
                              target.tagName === 'H6' ||
                              target.tagName === 'SPAN' ||
                              target.tagName === 'DIV' && target.textContent?.trim() ||
                              target.tagName === 'EM' ||
                              target.tagName === 'STRONG' ||
                              target.classList.contains('text-') ||
                              window.getComputedStyle(target).cursor === 'text');
      setIsOverText(isTextElement && !isInteractive);
    };

    const hideTrail = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseleave", hideTrail);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseleave", hideTrail);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className={`fixed rounded-full pointer-events-none z-50 ${
          isOverText ? 'bg-primary/60 mix-blend-difference' : 'bg-primary'
        }`}
        animate={{
          x: mousePosition.x - (isHovering ? 8 : 6),
          y: mousePosition.y - (isHovering ? 8 : 6),
          width: isHovering ? 16 : 12,
          height: isHovering ? 16 : 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
      
      {/* Cursor ring */}
      <motion.div
        className="fixed border-2 border-primary/50 rounded-full pointer-events-none z-50"
        animate={{
          x: mousePosition.x - (isHovering ? 20 : 16),
          y: mousePosition.y - (isHovering ? 20 : 16),
          width: isHovering ? 40 : 32,
          height: isHovering ? 40 : 32,
          borderColor: "hsl(217 91% 60% / 0.8)",
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
        }}
      />
    </>
  );
};

export default CursorTrail;
