import * as React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Phone, Mail, Globe, Loader2, ArrowUp, ArrowDown, ChevronsUpDown, ChevronDown, ChevronRight, Package, Truck, RotateCcw, CreditCard, User, ShoppingBag, UserRoundPlus, CornerDownLeft } from 'lucide-react';
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
        <ResponsiveContainer width="99%" height="100%">
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
            <ResponsiveContainer width="99%" height="100%">
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
            <ResponsiveContainer width="99%" height="100%">
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

export interface DataTable4Item {
  id: string;
  item: string;
  type: string;
  stock: boolean;
  sku: string;
  price: number;
  availability: ('In store' | 'Online')[];
}

const defaultTableData: DataTable4Item[] = [
  { id: 'prod-001', item: 'Tablet Case', type: 'Electronics', stock: true, sku: 'TC-001', price: 83.24, availability: ['In store', 'Online'] },
  { id: 'prod-002', item: 'Smart Watch', type: 'Electronics', stock: true, sku: 'SW-002', price: 246.27, availability: ['In store', 'Online'] },
  { id: 'prod-003', item: 'Wool Sweater', type: 'Accessories', stock: true, sku: 'WS-003', price: 168.27, availability: ['In store'] },
  { id: 'prod-004', item: 'Wireless Earbuds', type: 'Electronics', stock: true, sku: 'WE-004', price: 107.75, availability: ['In store', 'Online'] },
  { id: 'prod-005', item: 'Laptop Sleeve', type: 'Electronics', stock: true, sku: 'LS-005', price: 248.02, availability: ['In store', 'Online'] },
  { id: 'prod-006', item: 'Running Shoes', type: 'Footwear', stock: true, sku: 'RS-006', price: 208.26, availability: ['In store'] },
  { id: 'prod-007', item: 'Winter Jacket', type: 'Clothing', stock: true, sku: 'WJ-007', price: 148.06, availability: ['In store'] },
  { id: 'prod-008', item: 'Phone Case', type: 'Accessories', stock: true, sku: 'PC-008', price: 298.08, availability: ['In store', 'Online'] },
  { id: 'prod-009', item: 'Fitness Tracker', type: 'Clothing', stock: true, sku: 'FT-009', price: 222.09, availability: ['In store'] },
  { id: 'prod-010', item: 'Sunglasses', type: 'Accessories', stock: true, sku: 'SG-010', price: 60.17, availability: ['In store'] },
];

export interface DataTable4Props {
  title?: string;
  description?: string;
  items?: DataTable4Item[];
  className?: string;
}

export const DataTable4: React.FC<DataTable4Props> = ({
  title = 'Minimal Responsive Table',
  description = 'Fully responsive table with horizontal scrolling, custom cell styling, and adaptive typography. Optimized for mobile devices with touch gestures and swipe hints.',
  items = defaultTableData,
  className,
}) => {
  const [sortKey, setSortKey] = React.useState<keyof DataTable4Item | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof DataTable4Item) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [items, sortKey, sortDir]);

  const renderSortIcon = (key: keyof DataTable4Item) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 ml-1" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1" /> : <ArrowDown className="w-3.5 h-3.5 ml-1" />;
  };

  return (
    <section className={cn('py-8 text-slate-100', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">{description}</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('sku')}>
                  <div className="flex items-center">
                    <span>SKU</span>
                    {renderSortIcon('sku')}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('item')}>
                  <div className="flex items-center">
                    <span>Item</span>
                    {renderSortIcon('item')}
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center">
                    <span>Type</span>
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th className="py-3 px-4">In Stock</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('price')}>
                  <div className="flex items-center">
                    <span>Price</span>
                    {renderSortIcon('price')}
                  </div>
                </th>
                <th className="py-3 px-4">Available In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {sortedData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 uppercase tracking-wide">{row.sku}</td>
                  <td className="py-3 px-4 font-bold text-white">{row.item}</td>
                  <td className="py-3 px-4 text-slate-400">{row.type}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                      {row.stock ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">${row.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {row.availability.map((loc) => (
                        <span key={loc} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500 sm:hidden">← Swipe to see more →</p>
      </div>
    </section>
  );
};

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Faq3Props {
  heading?: string;
  description?: string;
  items?: FaqItem[];
  className?: string;
}

const defaultFaqItems: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is Stackly WFA-SQLite?',
    answer:
      'Stackly WFA-SQLite is an enterprise workforce automation platform powered by high-performance SQLite database architecture, offering real-time attendance, shifts, leave management, and payroll.',
  },
  {
    id: 'faq-2',
    question: 'How does Role-Based Access Control (RBAC) work in Stackly?',
    answer:
      'Stackly features 5 distinct user roles (ADMIN, HR, MANAGER, TEAM_LEAD, EMPLOYEE) with granular permissions enforcing DBAC department scoping across all application endpoints.',
  },
  {
    id: 'faq-3',
    question: 'Is multi-device biometric authentication supported?',
    answer:
      'Yes, Stackly supports biometric device registration including FIDO2 WebAuthn, Face Recognition, Fingerprint scan, Homescreen Lock, and Device PIN authentication.',
  },
  {
    id: 'faq-4',
    question: 'What benefits does local SQLite database offer?',
    answer:
      'Local SQLite provides ultra-fast microsecond queries, zero-network latency for core operations, high-concurrency WAL mode, automated backups, and complete data ownership.',
  },
  {
    id: 'faq-5',
    question: 'How are shift rosters and overtime calculated?',
    answer:
      'Shift rosters support General Shift, Night Shift, and Custom Timings with automatic grace periods, overtime rules, split-shift detection, and real-time punch sync.',
  },
];

export const Faq3: React.FC<Faq3Props> = ({
  heading = 'Frequently asked questions',
  description = "Find answers to common questions about Stackly WFA-SQLite. Can't find what you're looking for? Contact our support team.",
  items = defaultFaqItems,
  className,
}) => {
  const [openId, setOpenId] = React.useState<string | null>('faq-1');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={cn('py-12 text-slate-100', className)}>
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="flex flex-col text-left md:text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
            {heading}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm lg:text-base max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden backdrop-blur-xl transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-emerald-400'
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export interface HelpCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  articles: number;
}

export interface PopularTopic {
  title: string;
  href: string;
}

export interface Help1Props {
  title?: string;
  description?: string;
  categories?: HelpCategory[];
  popularTopics?: PopularTopic[];
  className?: string;
  onContactSupport?: () => void;
}

const DEFAULT_CATEGORIES: HelpCategory[] = [
  {
    icon: <Package className="w-5 h-5 text-emerald-400" />,
    title: 'Workforce Orders',
    description: 'Track, modify, or manage equipment assignments',
    articles: 12,
  },
  {
    icon: <Truck className="w-5 h-5 text-blue-400" />,
    title: 'Dispatch & Logistics',
    description: 'Field delivery tracking and hardware dispatch',
    articles: 8,
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-amber-400" />,
    title: 'Returns & Swaps',
    description: 'Device return policy and exchange process',
    articles: 15,
  },
  {
    icon: <CreditCard className="w-5 h-5 text-purple-400" />,
    title: 'Payroll & Expenses',
    description: 'Direct deposits, reimbursements, and tax forms',
    articles: 10,
  },
  {
    icon: <User className="w-5 h-5 text-teal-400" />,
    title: 'Employee Profile',
    description: 'Profile updates, credentials, and security',
    articles: 7,
  },
  {
    icon: <ShoppingBag className="w-5 h-5 text-rose-400" />,
    title: 'Asset Inventory',
    description: 'Laptops, badges, and peripheral availability',
    articles: 9,
  },
];

const DEFAULT_TOPICS: PopularTopic[] = [
  { title: 'How to check my attendance status', href: '#' },
  { title: 'Requesting emergency leave or swap', href: '#' },
  { title: 'Resetting 2FA / WebAuthn credentials', href: '#' },
  { title: 'Payroll deposit not reflected', href: '#' },
  { title: 'Shift timing & grace period rules', href: '#' },
  { title: 'Downloading monthly payslips PDF', href: '#' },
];

export const Help1: React.FC<Help1Props> = ({
  title = 'Help Center',
  description = 'How can we help your workforce operations today?',
  categories = DEFAULT_CATEGORIES,
  popularTopics = DEFAULT_TOPICS,
  className,
  onContactSupport,
}) => {
  return (
    <section className={cn('py-12 text-slate-100', className)}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">{description}</p>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/60 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-white truncate">{category.title}</h3>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold text-slate-500">
                    {category.articles} articles
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-xl shadow-lg">
          <h2 className="mb-3 text-sm font-bold text-white">Popular Topics</h2>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((topic, index) => (
              <a
                key={index}
                href={topic.href}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-300 font-medium hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{topic.title}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <button
            type="button"
            onClick={onContactSupport}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export interface InviteUserMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Pending';
}

export interface InviteUser1Props {
  heading?: string;
  initialUsers?: InviteUserMember[];
  className?: string;
  onInviteSent?: (emails: string[], role: string) => void;
}

const defaultInviteUsers: InviteUserMember[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'Administrator',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'm.chen@company.com',
    role: 'Collaborator',
    status: 'Invited',
  },
];

export const InviteUser1: React.FC<InviteUser1Props> = ({
  heading = 'Invite Users',
  initialUsers = defaultInviteUsers,
  className,
  onInviteSent,
}) => {
  const [users, setUsers] = React.useState<InviteUserMember[]>(initialUsers);
  const [isOpen, setIsOpen] = React.useState(false);
  const [emailsText, setEmailsText] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('collaborator');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsText.trim()) return;

    const emailList = emailsText
      .split('\n')
      .flatMap((line) => line.split(','))
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emailList.length === 0) return;

    const newMembers: InviteUserMember[] = emailList.map((email, idx) => ({
      id: Date.now() + idx,
      name: email.split('@')[0],
      email,
      role: selectedRole === 'administrator' ? 'Administrator' : 'Collaborator',
      status: 'Invited',
    }));

    setUsers((prev) => [...prev, ...newMembers]);
    onInviteSent?.(emailList, selectedRole);

    setEmailsText('');
    setIsOpen(false);
  };

  return (
    <section className={cn('py-8 text-slate-100', className)}>
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Team Members</h2>
            <p className="mt-1 text-xs text-slate-400">Manage and invite users to your workforce team</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer w-fit"
          >
            <UserRoundPlus className="w-4 h-4" />
            <span>Invite Users</span>
          </button>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{user.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{user.email}</td>
                  <td className="py-3 px-4 text-slate-400">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        user.status === 'Active'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Dialog */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 p-4">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <UserRoundPlus className="w-4 h-4 text-emerald-400" />
                  <span>{heading}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="flex flex-col gap-4 p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email addresses</label>
                  <textarea
                    rows={3}
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder="Enter email addresses (one per line or comma separated)..."
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assign role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="collaborator">Collaborator</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  >
                    <span>Send Invitation</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export interface LeaderboardItem {
  name: string;
  value: number;
  maxValue?: number;
}

export interface Leaderboard1Props {
  title?: string;
  description?: string;
  items?: LeaderboardItem[];
  valuePrefix?: string;
  className?: string;
}

const defaultLeaderboardItems: LeaderboardItem[] = [
  { name: 'Engineering & Tech', value: 4520 },
  { name: 'Product Operations', value: 3210 },
  { name: 'Customer Support & Success', value: 2890 },
  { name: 'Human Resources & Talent', value: 1890 },
  { name: 'Finance & Administration', value: 1240 },
];

export const Leaderboard1: React.FC<Leaderboard1Props> = ({
  title = 'Top Departments',
  description = 'Workforce active logs by department',
  items = defaultLeaderboardItems,
  valuePrefix = '',
  className,
}) => {
  const maxValue = items[0]?.value || 1;

  return (
    <div className={cn('w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 backdrop-blur-xl shadow-xl', className)}>
      <div className="mb-5">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const pct = Math.min(Math.max((item.value / maxValue) * 100, 0), 100);
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">{item.name}</span>
                <span className="font-mono text-slate-400">
                  {valuePrefix}
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};









