import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface MeteorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  numberMeteors?: number;
  className?: string;
  glowColor?: string;
}

export const MeteorCard: React.FC<MeteorCardProps> = ({
  children,
  numberMeteors = 12,
  className,
  glowColor = 'rgba(59, 130, 246, 0.15)',
  ...props
}) => {
  const meteors = React.useMemo(() => new Array(numberMeteors).fill(true), [numberMeteors]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl',
        className
      )}
      style={{ boxShadow: `0 0 40px ${glowColor}` }}
      {...props}
    >
      {/* Meteors animation stream */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {meteors.map((_, el) => (
          <span
            key={`meteor-${el}`}
            className={cn(
              'animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]',
              "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#60a5fa] before:to-transparent"
            )}
            style={{
              top: 0,
              left: Math.floor(Math.random() * (400 - -400) + -400) + 'px',
              animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
              animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + 's',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = 'rgba(14, 165, 233, 0.15)',
  ...props
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-xl transition duration-300',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          opacity: opacity || (isFocused ? 1 : 0),
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export interface Banner2Props {
  title?: string;
  description?: string;
  linkText?: string;
  linkUrl?: string;
  defaultVisible?: boolean;
  className?: string;
  onClose?: () => void;
}

export const Banner2: React.FC<Banner2Props> = ({
  title = 'Version 2.0 is now available!',
  description = 'Read the full release notes',
  linkText = 'here',
  linkUrl = '#',
  defaultVisible = true,
  className,
  onClose,
}) => {
  const [isVisible, setIsVisible] = React.useState(defaultVisible);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <section
      className={cn(
        'w-full bg-slate-900/90 text-slate-100 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md transition-all duration-300',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-medium">
        <div className="flex-1 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="font-semibold text-emerald-400">{title}</span>
          <span className="text-slate-300">
            {description}{' '}
            <a
              href={linkUrl}
              className="underline underline-offset-2 hover:text-white transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              {linkText}
            </a>
            .
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss banner"
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </section>
  );
};

