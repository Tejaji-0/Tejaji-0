import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  once?: boolean;
}

const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: AnimatedSectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: once,
  });

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 50, x: 0 };
      case "down":
        return { opacity: 0, y: -50, x: 0 };
      case "left":
        return { opacity: 0, y: 0, x: 50 };
      case "right":
        return { opacity: 0, y: 0, x: -50 };
      default:
        return { opacity: 0, y: 50, x: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={
        inView
          ? { opacity: 1, y: 0, x: 0 }
          : getInitialPosition()
      }
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
