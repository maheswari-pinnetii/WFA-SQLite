import * as React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <div className="relative z-50 w-full max-w-lg">
            {children}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface DialogContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  onClose?: () => void;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => (
    <motion.div
      ref={ref as any}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      )}
      {children}
    </motion.div>
  )
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-bold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-slate-400 mt-1', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';
