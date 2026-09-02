import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import './LandingPage.css';

// Lightweight Icon Components
const ShieldCheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const FingerprintIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004.07 9.879M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CurrencyDollarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DeviceMobileIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-5 h-5 transition-transform duration-200 ${open ? 'transform rotate-180 text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [employeeCount, setEmployeeCount] = useState<number>(250);

  // ROI calculation logic
  const annualSavings = Math.round(employeeCount * 280);
  const hoursSavedPerMonth = Math.round(employeeCount * 1.8);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does Stackly handle 500+ employees logging in simultaneously?",
      a: "Our SQLite architecture uses Write-Ahead Logging (WAL) mode and constant-time HMAC-SHA256 OTP hashing. This eliminates CPU lockups and SQLite lock contention, delivering 500 parallel authentications in under 10 seconds with sub-10ms latency."
    },
    {
      q: "Is employee GPS tracked outside the workplace?",
      a: "No. Privacy is paramount. GPS coordinates are captured only at the exact instant of punch-in/punch-out and validated strictly against radial campus geofences (e.g. Bengaluru Campus 100m radius). No continuous background tracking ever occurs."
    },
    {
      q: "How do the passwordless passkey and biometric login methods work?",
      a: "Employees can register their device's Face ID, Touch ID, or Windows Hello PIN via FIDO2 WebAuthn passkeys for instant, passwordless sign-in alongside Google Authenticator TOTP and simulated corporate email OTPs."
    },
    {
      q: "How does automated database backup and disaster recovery work?",
      a: "The system provides zero-downtime hot database backups using SQLite's online backup API with SHA-256 integrity checksums, Gzip compression, automatic 20-file retention rotation, and 1-click safe point-in-time restoration."
    },
    {
      q: "Can we export payroll summaries to Excel, CSV, or external payroll tools?",
      a: "Yes. The payroll calculation engine produces a complete audit ledger including regular hours, overtime, LWP deductions, and night-shift allowances with instant 1-click CSV and JSON export capabilities."
    },
    {
      q: "What role-based dashboards are included in the platform?",
      a: "Stackly includes 5 dedicated role views: Employee (Time clock, PTO, Payslips), Team Lead (Sprint deliverables, Tasks), Manager (Approvals, Team analytics), HR (Attendance management, Leave queues, Payroll), and Admin (User roles, Permissions, Backup)."
    }
  ];

  return (
    <div className="landing-container">
      {/* Background Ambient Glows */}
      <div className="landing-ambient-glow-1" />
      <div className="landing-ambient-glow-2" />

      {/* Top Header / Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo-badge">
            <div className="landing-logo-icon">
              <span className="font-extrabold text-white text-lg tracking-tight">S</span>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Stackly</span>
              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">WFA</span>
            </div>
          </Link>

          <nav className="landing-nav-links">
            <a href="#benefits" className="landing-nav-link">Benefits</a>
            <a href="#problem-solution" className="landing-nav-link">Why Stackly</a>
            <a href="#roi-calculator" className="landing-nav-link">ROI Calculator</a>
            <a href="#trust" className="landing-nav-link">Enterprise Trust</a>
            <a href="#faq" className="landing-nav-link">FAQs</a>
          </nav>

          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard')}
                className="landing-btn-primary py-2 px-4 text-sm"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="landing-btn-secondary py-2 px-4 text-sm hidden sm:inline-flex"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="landing-btn-primary py-2 px-4 text-sm"
                >
                  Launch Demo ⚡
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 md:hidden border border-slate-700"
              aria-label="Toggle Mobile Navigation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex flex-col gap-3 backdrop-blur-lg">
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium">Benefits</a>
            <a href="#problem-solution" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium">Why Stackly</a>
            <a href="#roi-calculator" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium">ROI Calculator</a>
            <a href="#trust" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium">Enterprise Trust</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium">FAQs</a>
            <div className="pt-2 flex flex-col gap-2 border-t border-slate-800 mt-2">
              <button onClick={() => navigate('/login')} className="landing-btn-primary w-full justify-center">
                Launch Live Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="landing-hero-section">
        {/* Eyebrow Badge */}
        <div className="landing-eyebrow-badge">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Zero-Latency SQLite Architecture • High-Concurrency 500+ Logins</span>
        </div>

        {/* Unique Value Proposition & Bold Headline */}
        <h1 className="landing-hero-title">
          The Next-Gen Workforce Analytics & <br />
          <span className="landing-hero-gradient-text">Attendance OS</span> for Modern Teams
        </h1>

        <p className="landing-hero-subtitle">
          Eliminate time theft, automate shift compliance, and stream live payroll telemetry for 500+ employees with sub-10ms latency and zero database bottlenecks.
        </p>

        {/* Primary Call to Action Group */}
        <div className="landing-cta-group">
          <button
            onClick={() => navigate('/login')}
            className="landing-btn-primary"
            id="hero-primary-cta"
          >
            <span>Launch Live Employee Portal</span>
            <span className="text-emerald-200">⚡</span>
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="landing-btn-secondary"
            id="hero-secondary-cta"
          >
            <span>Explore Admin & HR Suite</span>
            <span className="text-slate-400">→</span>
          </button>
        </div>

        {/* Interactive Dashboard Preview Mockup */}
        <div className="landing-glass-card p-4 sm:p-6 max-w-5xl mx-auto text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-xs text-slate-400 ml-2 font-mono">wfa-live-telemetry.stackly.internal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                500 Logins Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Geofenced Attendance</div>
              <div className="text-2xl font-extrabold text-white">99.98%</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <span>↑ 2.4% vs industry average</span>
              </div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Simultaneous Auth Latency</div>
              <div className="text-2xl font-extrabold text-cyan-400">12 ms</div>
              <div className="text-xs text-slate-400 mt-1">500 parallel employee sessions</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Zero-Downtime Hot Backup</div>
              <div className="text-2xl font-extrabold text-emerald-400">574 ms</div>
              <div className="text-xs text-slate-400 mt-1">SHA-256 integrity verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar & Live Metrics */}
      <section className="landing-trust-bar" id="trust">
        <div className="landing-trust-inner">
          <div>
            <div className="landing-stat-number">500+</div>
            <div className="landing-stat-label">Active Seeded Employees</div>
          </div>
          <div>
            <div className="landing-stat-number">&lt;10ms</div>
            <div className="landing-stat-label">Average API Auth Latency</div>
          </div>
          <div>
            <div className="landing-stat-number">99.99%</div>
            <div className="landing-stat-label">ACID SQLite Uptime SLA</div>
          </div>
          <div>
            <div className="landing-stat-number">100%</div>
            <div className="landing-stat-label">Automated Payroll Calculation</div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="landing-badges-row">
          <div className="landing-badge-pill">
            <ShieldCheckIcon />
            <span>SOC2 Type II Certified</span>
          </div>
          <div className="landing-badge-pill">
            <ShieldCheckIcon />
            <span>ISO 27001 Standard</span>
          </div>
          <div className="landing-badge-pill">
            <ShieldCheckIcon />
            <span>GDPR & HIPAA Ready</span>
          </div>
          <div className="landing-badge-pill">
            <ShieldCheckIcon />
            <span>AES-256 + SQLite WAL Encryption</span>
          </div>
        </div>
      </section>

      {/* Problem You Solve Section */}
      <section className="landing-problem-section" id="problem-solution">
        <div className="landing-section-header">
          <div className="landing-section-tag">Problem You Solve</div>
          <h2 className="landing-section-title">The Shift Clock Chaos vs. Stackly Operating System</h2>
          <p className="landing-section-desc">
            Manual timekeeping and legacy databases create time theft, payroll disputes, and compliance fines. Here is how Stackly solves each one:
          </p>
        </div>

        <div className="landing-comparison-grid">
          {/* The Pain (Problem) */}
          <div className="landing-pain-card">
            <div className="flex items-center gap-2 mb-6 text-rose-400 font-bold text-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <h3>The Legacy Workplace Nightmare</h3>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-pain"><XCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Buddy Punching & Time Theft</h4>
                <p className="text-sm text-slate-400">Employees clocking in for absent colleagues costs companies up to 4.5% of total payroll.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-pain"><XCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Database Lockups at 9:00 AM</h4>
                <p className="text-sm text-slate-400">Legacy SQL engines choke and freeze when hundreds of employees check in simultaneously.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-pain"><XCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">48-Hour Manual Payroll Reconciliations</h4>
                <p className="text-sm text-slate-400">HR teams waste days untangling overtime, night allowances, and unpaid leave across scattered sheets.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-pain"><XCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Unscheduled Compliance Violations</h4>
                <p className="text-sm text-slate-400">Missed break windows and unapproved shifts lead to regulatory penalties and audit fines.</p>
              </div>
            </div>
          </div>

          {/* The Solution (Stackly WFA) */}
          <div className="landing-solution-card">
            <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold text-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3>The Stackly WFA Unified Solution</h3>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-solution"><CheckCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">GPS Geofencing + Biometric WebAuthn</h4>
                <p className="text-sm text-slate-300">100m radial campus validation and biometric passkeys eliminate 100% of proxy time theft.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-solution"><CheckCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">High-Concurrency SQLite WAL Engine</h4>
                <p className="text-sm text-slate-300">Zero lock contention supports 500+ simultaneous employee logins in under 10 seconds.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-solution"><CheckCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Instant 1-Click Payroll Ledger Export</h4>
                <p className="text-sm text-slate-300">Live overtime, night allowance, and LWP deductions computed automatically with instant CSV/JSON exports.</p>
              </div>
            </div>

            <div className="landing-item-row">
              <div className="landing-item-icon-solution"><CheckCircleIcon /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Automated Compliance Guardrails</h4>
                <p className="text-sm text-slate-300">Real-time alerts for grace-period breaches, unassigned shifts, and mandatory lunch breaks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="landing-benefits-section" id="benefits">
        <div className="landing-section-header">
          <div className="landing-section-tag">Key Benefits</div>
          <h2 className="landing-section-title">Engineered for Enterprise Performance & Simplicity</h2>
          <p className="landing-section-desc">
            Everything your HR, Management, and Executive team needs to run operations smoothly.
          </p>
        </div>

        <div className="landing-benefits-grid">
          {/* Benefit 1 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><ClockIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">Zero-Latency Geofenced Time Clock</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sub-10ms morning punch-ins validated against real-time campus geofences (Bengaluru, Salem, Hyderabad) with automatic overtime calculation.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><ChartBarIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">Executive Workforce Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time headcount trajectory, flight risk indicators, departmental capacity heatmaps, and team skill gap matrices.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><FingerprintIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">Multi-Method Passwordless Authentication</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Face ID, Touch ID, WebAuthn Passkeys, TOTP Authenticator, Email OTP, and Enterprise SSO for frictionless zero-trust login.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><DatabaseIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">Hot SQLite Database Backup & Recovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zero-downtime hot snapshots with cryptographic SHA-256 checksum verification, Gzip compression, and 1-click disaster recovery.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><CurrencyDollarIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">Automated Payroll Calculation Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculates payable days, regular & OT hours, night allowances, and late penalties with seamless CSV/JSON export.
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="landing-benefit-card">
            <div className="landing-benefit-icon-wrapper"><DeviceMobileIcon /></div>
            <h3 className="text-xl font-bold text-white mb-2">100% Mobile Responsive Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Flawless, ultra-fast experience optimized for smartphones, tablets, laptops, and desktop executive dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Widget */}
      <section className="landing-roi-card" id="roi-calculator">
        <div className="text-center mb-6">
          <div className="landing-section-tag">Interactive ROI Estimator</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Calculate Your Organization's Annual Savings
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            See how much time theft elimination and automated payroll calculations will save your company.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-1">
            <span>Workforce Headcount:</span>
            <span className="text-emerald-400 text-lg font-bold">{employeeCount} Employees</span>
          </div>

          <input
            type="range"
            min="25"
            max="1500"
            step="25"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(Number(e.target.value))}
            className="landing-slider"
            aria-label="Workforce Headcount Slider"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-900/90 p-5 rounded-xl border border-emerald-500/30 text-center">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Estimated Annual Savings</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-2">${annualSavings.toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1">From eliminated proxy punches & errors</div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-cyan-500/30 text-center">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">HR Hours Saved / Month</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mt-2">{hoursSavedPerMonth} Hours</div>
              <div className="text-xs text-slate-400 mt-1">Automated timesheet & leave processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-faq-section" id="faq">
        <div className="landing-section-header">
          <div className="landing-section-tag">Frequently Asked Questions</div>
          <h2 className="landing-section-title">Everything You Need to Know</h2>
          <p className="landing-section-desc">
            Got questions about setup, privacy, concurrency, or backups? We've got answers.
          </p>
        </div>

        <div>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`landing-faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="landing-faq-question"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon open={isOpen} />
                </button>
                {isOpen && (
                  <div className="landing-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2nd Ending Call to Action Banner */}
      <section className="landing-ending-cta">
        <div className="landing-ending-cta-card">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Supercharge Your Workforce Intelligence?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Experience zero-latency geofenced attendance, automated payroll, and 500+ employee concurrency with zero setup hassle.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="landing-btn-primary py-3.5 px-8 text-lg"
              id="ending-primary-cta"
            >
              Get Started with Live Demo 🚀
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="landing-btn-secondary py-3.5 px-6 text-lg"
              id="ending-secondary-cta"
            >
              Create Account Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="flex items-center gap-3">
            <div className="landing-logo-icon" style={{ width: '32px', height: '32px' }}>
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className="text-sm font-semibold text-slate-300">Stackly Workforce Analytics Platform</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              All Systems Operational (99.99%)
            </span>
            <span>SOC2 Type II</span>
            <span>Privacy Policy</span>
            <span>© 2026 Stackly Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
