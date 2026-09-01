import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}: NumberTickerProps) {
  const spring = useSpring(direction === 'down' ? value : 0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      spring.set(value);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [spring, value, delay]);

  return (
    <motion.span className={cn('inline-block tabular-nums font-black', className)}>
      {display}
    </motion.span>
  );
}
