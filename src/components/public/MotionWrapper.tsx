"use client";

import { motion, useReducedMotion } from "framer-motion";

export const FadeIn = ({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up"
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  const getInitialY = () => {
    if (direction === "up") return 20;
    if (direction === "down") return -20;
    return 0;
  };

  const getInitialX = () => {
    if (direction === "left") return 20;
    if (direction === "right") return -20;
    return 0;
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: getInitialY(), x: getInitialX() }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={{
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
        show: shouldReduceMotion 
          ? { opacity: 1, transition: { duration: 0.2 } }
          : { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
