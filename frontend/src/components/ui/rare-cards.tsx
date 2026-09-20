import * as React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Phone, Mail, Globe, Loader2 } from 'lucide-react';
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

export interface ChartCard1Props {
  title?: string;
  description?: string;
  data?: { month: string; value: number }[];
  className?: string;
}

const defaultChartData = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: 305 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: 273 },
  { month: 'May', value: 209 },
  { month: 'Jun', value: 214 },
  { month: 'Jul', value: 286 },
  { month: 'Aug', value: 320 },
  { month: 'Sep', value: 298 },
  { month: 'Oct', value: 342 },
  { month: 'Nov', value: 375 },
  { month: 'Dec', value: 410 },
];

export const ChartCard1: React.FC<ChartCard1Props> = ({
  title = 'Revenue Over Time',
  description = 'Monthly revenue for the current year',
  data = defaultChartData,
  className,
}) => {
  return (
    <div className={cn('w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 backdrop-blur-xl shadow-xl', className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#chartGradientEmerald)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export interface ChartGroup1Props {
  className?: string;
  revenueData?: { month: string; value: number }[];
  ordersData?: { month: string; value: number }[];
}

const defaultRevenueData = [
  { month: 'Jan', value: 18600 },
  { month: 'Feb', value: 30500 },
  { month: 'Mar', value: 23700 },
  { month: 'Apr', value: 27300 },
  { month: 'May', value: 20900 },
  { month: 'Jun', value: 31400 },
];

const defaultOrdersData = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: 305 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: 273 },
  { month: 'May', value: 209 },
  { month: 'Jun', value: 314 },
];

export const ChartGroup1: React.FC<ChartGroup1Props> = ({
  className,
  revenueData = defaultRevenueData,
  ordersData = defaultOrdersData,
}) => {
  return (
    <section className={cn('w-full py-6', className)}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 backdrop-blur-xl shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-100">Revenue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly revenue trends</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradientGroup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradientGroup)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 backdrop-blur-xl shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-100">Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly order volume</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Orders']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
  formSubheading?: string;
  formHeading?: string;
  successMessage?: string;
  submitLabel?: string;
  submittingLabel?: string;
  className?: string;
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

export const Contact2: React.FC<Contact2Props> = ({
  title = 'Contact Us',
  description = 'Building workforce operations with Stackly WFA-SQLite? Drop us a line if you need assistance configuring enterprise modules.',
  phone = '+1 (555) 010-2400',
  email = 'support@stackly-wfa.com',
  web = { label: 'stackly-wfa.com', url: 'https://stackly-wfa.com' },
  formHeading = 'Send us a message',
  formSubheading = 'We usually reply within one business day.',
  successMessage = 'Thanks — your message is in our inbox.',
  submitLabel = 'Send message',
  submittingLabel = 'Sending…',
  className,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) errs.message = 'Message is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsSubmitted(true);
      setShowSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 4500);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      setErrors({ root: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section className={cn('py-12 text-slate-100', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Info Side */}
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href={`tel:${phone}`} className="group flex items-center gap-3 text-slate-300 hover:text-emerald-400 transition-colors">
                <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                <span>{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="group flex items-center gap-3 text-slate-300 hover:text-emerald-400 transition-colors">
                <Mail className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                <span>{email}</span>
              </a>
              <a
                href={web.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Globe className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                <span>{web.label}</span>
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-white">{formHeading}</h2>
                <p className="text-xs text-slate-400">{formSubheading}</p>
              </div>

              {isSubmitted && (
                <div
                  className={cn(
                    'rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center transition-opacity duration-500',
                    showSuccess ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <p className="text-xs font-semibold text-emerald-400">{successMessage}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-xs font-semibold text-slate-300">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jordan"
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {errors.firstName && <span className="text-[11px] text-rose-400">{errors.firstName}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-xs font-semibold text-slate-300">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Kim"
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {errors.lastName && <span className="text-[11px] text-rose-400">{errors.lastName}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {errors.email && <span className="text-[11px] text-rose-400">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-xs font-semibold text-slate-300">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Question about enterprise modules"
                  className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {errors.subject && <span className="text-[11px] text-rose-400">{errors.subject}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-slate-300">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you are configuring…"
                  className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                {errors.message && <span className="text-[11px] text-rose-400">{errors.message}</span>}
              </div>

              {errors.root && <p className="text-xs text-rose-400">{errors.root}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSubmitting ? submittingLabel : submitLabel}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};




