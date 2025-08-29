import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

const AnimatedCard = ({
  children,
  className = "",
  intensity = 10,
}: AnimatedCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x, y });
  };

  const calculateRotation = () => {
    const rotateX = (mousePosition.y / intensity) * -1;
    const rotateY = mousePosition.x / intensity;
    return { rotateX, rotateY };
  };

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        rotateX: isHovered ? calculateRotation().rotateX : 0,
        rotateY: isHovered ? calculateRotation().rotateY : 0,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? calculateRotation().rotateX : 0,
          rotateY: isHovered ? calculateRotation().rotateY : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedCard;
