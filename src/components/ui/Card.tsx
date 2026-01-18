'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = false }: CardProps) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -4, scale: 1.01 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={cn(
        'bg-gradient-card backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden',
        hover && 'cursor-pointer',
        className
      )}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-6 py-4 border-t border-white/10 bg-navy-900/30', className)}>
      {children}
    </div>
  );
}
