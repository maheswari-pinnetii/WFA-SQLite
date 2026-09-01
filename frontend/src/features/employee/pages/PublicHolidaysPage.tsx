import React, { useState } from 'react';
import {
  Calendar,
  Palmtree,
  Sparkles,
  MapPin,
  ArrowRight,
  Sun,
  CheckCircle2,
  Info,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

interface Holiday {
  id: string;
  name: string;
  date: string;
  formattedDate: string;
  day: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  type: 'Mandatory' | 'Floating / Optional' | 'Observance';
  isLongWeekend: boolean;
  region: string;
  description: string;
}

export const PublicHolidaysPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('All Locations');
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  const holidays: Holiday[] = [
    {
      id: 'hol-1',
      name: "New Year's Day",
      date: '2026-01-01',
      formattedDate: 'Jan 01, 2026',
      day: 'Thursday',
      quarter: 'Q1',
      type: 'Mandatory',
      isLongWeekend: false,
      region: 'Global / All Locations',
      description: 'Official corporate non-working day for global offices celebrating the start of the year.'
    },
    {
      id: 'hol-2',
      name: 'Martin Luther King Jr. Day',
      date: '2026-01-19',
      formattedDate: 'Jan 19, 2026',
      day: 'Monday',
      quarter: 'Q1',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'US / Global HQ',
      description: 'Federal holiday honoring civil rights leader Martin Luther King Jr. (3-Day Long Weekend).'
    },
    {
      id: 'hol-3',
      name: "Presidents' Day / Washington Birthday",
      date: '2026-02-16',
      formattedDate: 'Feb 16, 2026',
      day: 'Monday',
      quarter: 'Q1',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'US / Global HQ',
      description: 'Federal holiday honoring US leadership and George Washington (3-Day Long Weekend).'
    },
    {
      id: 'hol-4',
      name: 'Spring Equinox / Floating Holiday 1',
      date: '2026-03-20',
      formattedDate: 'Mar 20, 2026',
      day: 'Friday',
      quarter: 'Q1',
      type: 'Floating / Optional',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Designated optional floating holiday for personal or cultural observances.'
    },
    {
      id: 'hol-5',
      name: 'Memorial Day',
      date: '2026-05-25',
      formattedDate: 'May 25, 2026',
      day: 'Monday',
      quarter: 'Q2',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'National day of remembrance honoring fallen service members (3-Day Long Weekend).'
    },
    {
      id: 'hol-6',
      name: 'Juneteenth National Independence Day',
      date: '2026-06-19',
      formattedDate: 'Jun 19, 2026',
      day: 'Friday',
      quarter: 'Q2',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'US / Global HQ',
      description: 'Commemorating the emancipation of enslaved African Americans (3-Day Long Weekend).'
    },
    {
      id: 'hol-7',
      name: 'Independence Day (Observed)',
      date: '2026-07-03',
      formattedDate: 'Jul 03, 2026',
      day: 'Friday',
      quarter: 'Q3',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Celebrating American Independence with a mandatory office shutdown.'
    },
    {
      id: 'hol-8',
      name: 'Labor Day',
      date: '2026-09-07',
      formattedDate: 'Sep 07, 2026',
      day: 'Monday',
      quarter: 'Q3',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Honoring the labor movement and American workers (3-Day Long Weekend).'
    },
    {
      id: 'hol-9',
      name: 'Autumn Harvest / Floating Holiday 2',
      date: '2026-10-23',
      formattedDate: 'Oct 23, 2026',
      day: 'Friday',
      quarter: 'Q4',
      type: 'Floating / Optional',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Designated optional floating holiday for personal or cultural observances.'
    },
    {
      id: 'hol-10',
      name: 'Thanksgiving Day',
      date: '2026-11-26',
      formattedDate: 'Nov 26, 2026',
      day: 'Thursday',
      quarter: 'Q4',
      type: 'Mandatory',
      isLongWeekend: false,
      region: 'Global / All Locations',
      description: 'National holiday of gratitude and family celebration.'
    },
    {
      id: 'hol-11',
      name: 'Day After Thanksgiving (Black Friday)',
      date: '2026-11-27',
      formattedDate: 'Nov 27, 2026',
      day: 'Friday',
      quarter: 'Q4',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Company-wide holiday creating a 4-Day Thanksgiving Long Weekend!'
    },
    {
      id: 'hol-12',
      name: 'Christmas Day',
      date: '2026-12-25',
      formattedDate: 'Dec 25, 2026',
      day: 'Friday',
      quarter: 'Q4',
      type: 'Mandatory',
      isLongWeekend: true,
      region: 'Global / All Locations',
      description: 'Global holiday celebration (3-Day Long Weekend).'
    }
  ];

  const filteredHolidays = holidays.filter((h) => {
    if (selectedQuarter !== 'ALL' && h.quarter !== selectedQuarter) return false;
    if (selectedType !== 'ALL' && h.type !== selectedType) return false;
    if (selectedRegion !== 'All Locations' && !h.region.includes(selectedRegion)) return false;
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) && !h.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const header = 'Holiday ID,Holiday Name,Date,Day,Quarter,Type,Long Weekend,Region,Description\n';
    const rows = holidays.map(
      h => `"${h.id}","${h.name}","${h.date}","${h.day}","${h.quarter}","${h.type}","${h.isLongWeekend ? 'Yes' : 'No'}","${h.region}","${h.description}"`
    ).join('\n');
    const csvData = header + rows;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Stackly_Public_Holidays_2026.csv';
    link.click();
    setExportNotice('Public Holidays CSV schedule downloaded successfully.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  const handleExportIcal = () => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Stackly Enterprise//Public Holidays 2026//EN\n';
    holidays.forEach(h => {
      const dt = h.date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${h.name} (${h.type})\nDESCRIPTION:${h.description}\nDTSTART;VALUE=DATE:${dt}\nDTEND;VALUE=DATE:${dt}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Stackly_Holidays_2026.ics';
    link.click();
    setExportNotice('Calendar (.iCal) file downloaded. You can import it directly to Google Calendar or Outlook.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Corporate Calendar 2026
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sun size={10} /> 10 Mandatory + 2 Floating
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Official Public Holidays (2026)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gazetted corporate non-working days, floating holidays, and long weekend schedules for all worldwide company offices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-emerald-400" /> Export CSV
          </Button>
          <Button size="sm" onClick={handleExportIcal} className="flex items-center gap-2">
            <CalendarDays size={14} /> Add to Calendar (.iCal)
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} /> {exportNotice}
        </div>
      )}

      {/* 2. Key Metrics Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Annual Holidays</span>
            <span className="text-2xl font-black text-white mt-1 block">12 Days</span>
            <span className="text-[10px] text-amber-400 font-mono">100% Paid Time Off</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
            <Calendar size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Mandatory Paid Days</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">10 Days</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Fixed Company-Wide</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Floating / Optional</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">2 Days</span>
            <span className="text-[10px] text-purple-400/80 font-mono">Employee Choice</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-lg">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Long Weekends</span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">8 Weekends</span>
            <span className="text-[10px] text-cyan-400/80 font-mono">Friday/Monday holidays</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
            <Palmtree size={22} />
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter Pills */}
          {(['ALL', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedQuarter === q
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {q === 'ALL' ? 'Full Year (2026)' : q}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Holiday Types</option>
            <option value="Mandatory">Mandatory Fixed</option>
            <option value="Floating / Optional">Floating / Optional</option>
          </select>

          <input
            type="text"
            placeholder="Search holiday name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-[200px]"
          />
        </div>
      </div>

      {/* 4. Holidays Grid & Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHolidays.map((h) => (
          <div
            key={h.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group shadow-xl relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
                  <span className="text-xs font-bold text-amber-400 font-mono">{h.formattedDate}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                  {h.day}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {h.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  h.type === 'Mandatory'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                }`}>
                  {h.type}
                </span>

                {h.isLongWeekend && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    🏖️ Long Weekend
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} /> {h.region}
                </span>
                <span className="font-mono font-bold text-slate-400">{h.quarter}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Policy Guidance Banner for Floating Holidays & Personal Leave */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-indigo-400" />
            <h3 className="text-base font-bold text-white">How to Claim Floating & Personal Leaves</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Employees are allocated 2 floating holidays per calendar year in addition to their 14-day Annual Paid Time Off (PTO) balance. Floating holidays can be claimed at any point via the Leave Request portal.
          </p>
        </div>

        <Link to="/employee/leave">
          <Button size="sm" className="flex items-center gap-2 whitespace-nowrap">
            Submit Leave Request <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
