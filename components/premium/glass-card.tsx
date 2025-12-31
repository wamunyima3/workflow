"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "strong";
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = "", intensity = "medium", hover = true, ...props }, ref) => {
    const intensityClasses = {
      light: "bg-background/40 backdrop-blur-sm",
      medium: "bg-background/60 backdrop-blur-md",
      strong: "bg-background/80 backdrop-blur-lg",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border border-border/50",
          intensityClasses[intensity],
          hover && "transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
