"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

type ChateauLineVariant = "arch" | "horizon" | "accent" | "divider";

interface ChateauLineProps {
  variant?: ChateauLineVariant;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * ChateauLine - Signature visuelle architecturale du Château du Mwana
 * 
 * Une ligne fine inspirée de l'architecture du Château (arche, toiture, silhouette)
 * qui sert de fil conducteur visuel à travers les pages publiques.
 * 
 * Variants :
 * - "arch" : Ligne arquée pour transitions majeures
 * - "horizon" : Ligne horizontale pour séparateurs éditoriaux
 * - "accent" : Ligne d'accent pour souligner un titre ou CTA
 * - "divider" : Ligne simple de séparation
 */
export function ChateauLine({ 
  variant = "accent", 
  className = "", 
  delay = 0,
  duration = 0.8
}: ChateauLineProps) {
  const shouldReduceMotion = useReducedMotion();

  const getPath = () => {
    switch (variant) {
      case "arch":
        return "M0,50 Q50,0 100,50";
      case "horizon":
        return "M0,50 L100,50";
      case "divider":
        return "M20,50 L80,50";
      case "accent":
      default:
        return "M0,50 Q30,45 50,50 Q70,55 100,50";
    }
  };

  const getStrokeWidth = () => {
    switch (variant) {
      case "arch":
        return 2;
      case "horizon":
        return 1.5;
      case "divider":
        return 1;
      case "accent":
      default:
        return 2;
    }
  };

  const getWidth = () => {
    switch (variant) {
      case "divider":
        return "w-24";
      case "accent":
        return "w-32";
      case "arch":
        return "w-48";
      case "horizon":
      default:
        return "w-full";
    }
  };

  return (
    <div className={`flex justify-center ${getWidth()} ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-8"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, pathLength: 0 }}
        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, pathLength: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : duration, 
          delay: shouldReduceMotion ? 0 : delay,
          ease: "easeInOut"
        }}
      >
        <motion.path
          d={getPath()}
          stroke="var(--color-public-primary)"
          strokeWidth={getStrokeWidth()}
          fill="none"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={{ 
            duration: shouldReduceMotion ? 0 : duration * 0.8, 
            delay: shouldReduceMotion ? 0 : delay + 0.1 
          }}
        />
      </motion.svg>
    </div>
  );
}
