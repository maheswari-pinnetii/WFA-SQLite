import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'row-span-1 rounded-2xl group/bento hover:shadow-2xl hover:shadow-blue-500/10 transition duration-200 shadow-input dark:shadow-none p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl justify-between flex flex-col space-y-4 cursor-pointer',
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200">
        <div className="flex items-center gap-2 mb-2 text-blue-400">
          {icon}
        </div>
        <div className="font-bold text-slate-100 mb-1 text-sm tracking-tight">
          {title}
        </div>
        <div className="font-normal text-slate-400 text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
