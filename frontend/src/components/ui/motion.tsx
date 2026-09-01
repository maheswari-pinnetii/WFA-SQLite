import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export const MotionContainer = ({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut', delay }}
    className={cn('w-full', className)}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  className,
  staggerChildren = 0.05,
  ...props
}: HTMLMotionProps<'div'> & { staggerChildren?: number }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren,
        },
      },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
