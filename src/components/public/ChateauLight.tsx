"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface ChateauLightProps {
  className?: string;
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}

/**
 * ChateauLight - Effet de lumière chaude subtil
 * 
 * Un passage lumineux très discret qui peut accompagner une révélation
 * ou marquer un moment important (CTA, transition majeure, succès).
 * 
 * Utilise un gradient avec l'or du Château et une animation très lente.
 */
export function ChateauLight({ 
  className = "", 
  delay = 0,
  duration = 1.5,
  children
}: ChateauLightProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Lumière chaude qui traverse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-public-primary)]/10 to-transparent"
        initial={{ x: "-100%" }}
        whileInView={{ x: "100%" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration, 
          delay,
          ease: "easeInOut"
        }}
      />
      {children}
    </div>
  );
}
