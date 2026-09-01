import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-[0.98]',
        primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-[0.98]',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/20 active:scale-[0.98]',
        danger: 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/20 active:scale-[0.98]',
        outline: 'border border-slate-700 bg-transparent hover:bg-slate-800/60 hover:text-white text-slate-300',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]',
        ghost: 'hover:bg-slate-800 hover:text-white text-slate-400',
        link: 'text-blue-400 underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]',
        glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-white hover:bg-slate-800/80 shadow-md'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base font-bold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-3.5 h-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0 mr-1.5">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'>, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, icon, isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-3.5 h-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0 mr-1.5">{icon}</span>
        )}
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = 'MotionButton';
