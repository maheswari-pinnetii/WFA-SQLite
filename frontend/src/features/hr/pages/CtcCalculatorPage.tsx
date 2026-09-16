import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { Calculator, DollarSign, PieChart, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const CtcCalculatorPage: React.FC = () => {
  const [annualCtc, setAnnualCtc] = useState<number>(1200000);
  const [basicPct, setBasicPct] = useState<number>(50);
  const [hraPct, setHraPct] = useState<number>(40);
  const [conveyance, setConveyance] = useState<number>(1600);
  const [medical, setMedical] = useState<number>(1250);
  const [food, setFood] = useState<number>(2200);
  const [bonus, setBonus] = useState<number>(50000);
  const [includeEmployerPf, setIncludeEmployerPf] = useState<boolean>(true);
  const [includeEmployerEsi, setIncludeEmployerEsi] = useState<boolean>(true);

  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recalculate();
  }, [annualCtc, basicPct, hraPct, conveyance, medical, food, bonus, includeEmployerPf, includeEmployerEsi]);

  const recalculate = async () => {
    try {
      setLoading(true);
      const res = await payrollApi.calculateCtc({
        annualCtc,
        basicPercentage: basicPct,
        hraPercentage: hraPct,
        conveyanceAllowance: conveyance,
        medicalAllowance: medical,
        foodAllowance: food,
        bonus,
        includeEmployerPf,
        includeEmployerEsi
      });
      setBreakdown(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Interactive CTC & Salary Breakup Calculator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Simulate annual CTC packages, statutory deductions (EPF, ESI, PT), income tax (TDS), and monthly take-home salary.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" /> Package Inputs
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Annual CTC (₹)</label>
              <input
                type="number"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Basic Salary % ({basicPct}%)</label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={basicPct}
                  onChange={(e) => setBasicPct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">HRA % ({hraPct}%)</label>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={hraPct}
                  onChange={(e) => setHraPct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Conveyance / mo (₹)</label>
                <input
                  type="number"
                  value={conveyance}
                  onChange={(e) => setConveyance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Medical Allowance / mo (₹)</label>
                <input
                  type="number"
                  value={medical}
                  onChange={(e) => setMedical(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Food Coupon / mo (₹)</label>
                <input
                  type="number"
                  value={food}
                  onChange={(e) => setFood(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Annual Performance Bonus (₹)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={includeEmployerPf} onChange={(e) => setIncludeEmployerPf(e.target.checked)} className="rounded" />
                <span>Include Employer EPF (12% of Basic) in CTC</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={includeEmployerEsi} onChange={(e) => setIncludeEmployerEsi(e.target.checked)} className="rounded" />
                <span>Include Employer ESI (3.25%) in CTC</span>
              </label>
            </div>
          </div>
        </div>

        {/* Breakdown Output */}
        <div className="lg:col-span-7 space-y-6">
          {breakdown && (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium block">Monthly Gross</span>
                  <span className="text-lg font-bold font-mono text-slate-100">₹{breakdown.monthlyGross.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">₹{breakdown.annualGross.toLocaleString('en-IN')} / year</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-rose-400 font-medium block">Monthly Deductions</span>
                  <span className="text-lg font-bold font-mono text-rose-400">₹{(breakdown.employeePfMonthly + breakdown.employeeEsiMonthly + breakdown.ptMonthly + breakdown.estimatedTdsMonthly).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">PF + ESI + PT + TDS</span>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                  <span className="text-xs text-emerald-400 font-bold block uppercase tracking-wider">Estimated Net Pay</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400">₹{breakdown.monthlyNetSalary.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-500/80 block mt-1">₹{breakdown.annualNetSalary.toLocaleString('en-IN')} / year</span>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <PieChart size={14} className="text-emerald-400" /> Complete Component Breakup
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">CTC ₹{annualCtc.toLocaleString('en-IN')}</span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4 text-right">Monthly (₹)</th>
                      <th className="py-2.5 px-4 text-right">Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="bg-slate-950/30 font-bold text-slate-200">
                      <td className="py-2 px-4" colSpan={3}>EARNINGS & ALLOWANCES</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Basic Pay</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.basicMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.basicAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">House Rent Allowance (HRA)</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.hraMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.hraAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Special Allowance</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.specialAllowanceMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.specialAllowanceAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Conveyance Allowance</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.conveyanceMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.conveyanceAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Medical Allowance</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.medicalMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right">₹{breakdown.medicalAnnual.toLocaleString('en-IN')}</td>
                    </tr>

                    <tr className="bg-slate-950/30 font-bold text-rose-400">
                      <td className="py-2 px-4" colSpan={3}>EMPLOYEE DEDUCTIONS & STATUTORY DEDUCTIONS</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Employee EPF (12%)</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.employeePfMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.employeePfAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Employee ESI (0.75%)</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.employeeEsiMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.employeeEsiAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Professional Tax (PT)</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.ptMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.ptAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-300">Estimated Income Tax (TDS)</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.estimatedTdsMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right text-rose-400">- ₹{breakdown.estimatedTdsAnnual.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
