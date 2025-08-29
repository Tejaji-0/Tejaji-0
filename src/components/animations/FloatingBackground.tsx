import { motion } from "framer-motion";

interface FloatingElementProps {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

const FloatingElement = ({
  size = 100,
  color = "bg-primary/10",
  delay = 0,
  duration = 20,
  className = "",
}: FloatingElementProps) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-xl ${color} ${className}`}
      style={{
        width: size,
        height: size,
      }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
};

interface FloatingBackgroundProps {
  count?: number;
}

const FloatingBackground = ({ count = 6 }: FloatingBackgroundProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <FloatingElement
          key={i}
          size={Math.random() * 200 + 100}
          color={
            i % 3 === 0
              ? "bg-primary/10"
              : i % 3 === 1
              ? "bg-accent/10"
              : "bg-secondary/10"
          }
          delay={i * 2}
          duration={15 + Math.random() * 10}
          className={`
            ${i % 2 === 0 ? "top-1/4 left-1/4" : "bottom-1/4 right-1/4"}
            ${i % 3 === 0 ? "top-1/3 right-1/3" : ""}
            ${i % 4 === 0 ? "bottom-1/3 left-1/3" : ""}
          `}
        />
      ))}
    </div>
  );
};

export default FloatingBackground;
