"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface ChateauImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}

/**
 * ChateauImageReveal - Révélation élégante d'image
 * 
 * Une révélation progressive d'image avec voile lumineux très subtil.
 * Utilise transform et opacity pour performance, évite les recalculs de layout.
 */
export function ChateauImageReveal({ 
  src, 
  alt, 
  className = "", 
  delay = 0,
  duration = 0.8,
  children
}: ChateauImageRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image avec révélation */}
      <motion.img
        src={src}
        alt={alt}
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 1.02 }}
        whileInView={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : duration, 
          delay: shouldReduceMotion ? 0 : delay,
          ease: "easeOut"
        }}
        className="w-full h-full object-cover"
      />
      
      {/* Voile lumineux très subtil qui se dissipe */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.4 }}
        whileInView={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : duration * 1.2, 
          delay: shouldReduceMotion ? 0 : delay + 0.2,
          ease: "easeOut"
        }}
      />
      
      {children}
    </div>
  );
}
