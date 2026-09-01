import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 7 }, (_, i) => (2024 + i).toString()); // 2024 to 2030

export const AttendanceCalendarView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState('2026');

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const yearNum = parseInt(selectedYear, 10);

  // Dynamic calculations for days and starting weekday
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthIndex, 1).getDay(); // 0: Sun, 1: Mon, etc.

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfWeek });

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setSelectedMonth('December');
      setSelectedYear((prev) => (parseInt(prev, 10) - 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setSelectedMonth('January');
      setSelectedYear((prev) => (parseInt(prev, 10) + 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex + 1]);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedMonth(MONTHS[today.getMonth()]);
    setSelectedYear(today.getFullYear().toString());
  };

  return (
    <div className="glass-panel w-full h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl font-sans text-[var(--text-primary)] flex flex-col justify-between space-y-4">
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]/60">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-blue-400" />
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            Attendance Calendar
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>

        {/* Compact Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrevMonth}
            title="Previous Month"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Month Selector */}
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1 pr-6 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m.slice(0, 3)}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2 py-1 pr-5 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={handleNextMonth}
            title="Next Month"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>

          <button 
            onClick={handleGoToToday}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold rounded-lg text-blue-400 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="space-y-2">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-400 tracking-wider">
          <div className="text-rose-400/80">Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div className="text-cyan-400/80">Sa</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {emptySlots.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square rounded-xl bg-transparent" />
          ))}

          {days.map((day) => {
            const dayOfWeek = (day + firstDayOfWeek - 1) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = day === 1 && selectedMonth === 'September' && selectedYear === '2026';
            const isHoliday = (day === 14 && selectedMonth === 'September') || (day === 2 && selectedMonth === 'October');
            const isLeave = day === 18 && selectedMonth === 'September';
            const isPresent = !isWeekend && !isHoliday && !isLeave && day <= 28;

            let tileClass = 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60';
            let dotColor = '';

            if (isToday) {
              tileClass = 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500 text-white font-black shadow-lg shadow-blue-500/20';
              dotColor = 'bg-blue-400';
            } else if (isHoliday) {
              tileClass = 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold';
              dotColor = 'bg-amber-400';
            } else if (isLeave) {
              tileClass = 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold';
              dotColor = 'bg-purple-400';
            } else if (isWeekend) {
              tileClass = 'bg-slate-950/40 border-slate-800/40 text-slate-600 font-medium';
            } else if (isPresent) {
              tileClass = 'bg-slate-900/60 border-slate-800 text-white font-semibold hover:border-emerald-500/40';
              dotColor = 'bg-emerald-400';
            }

            return (
              <div 
                key={day} 
                className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl border transition-all hover:scale-105 cursor-pointer relative p-1 ${tileClass}`}
              >
                <span>{day}</span>
                {dotColor && (
                  <span className={`w-1 h-1 rounded-full ${dotColor} mt-0.5`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Legend */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Present (19d)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Holiday (2d)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400" /> Leave (1d)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-600" /> Weekend (8d)
        </span>
      </div>
    </div>
  );
};
