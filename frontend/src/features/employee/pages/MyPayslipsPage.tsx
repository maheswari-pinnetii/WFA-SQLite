import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Calendar, Building2, User, Wallet, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { Skeleton } from '../../../components/ui/skeleton';

export const MyPayslipsPage: React.FC = () => {
  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn: () => payrollApi.getMyPayslips(),
  });

  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const handleDownload = (payslip: any) => {
    // Very basic placeholder for PDF download
    const text = `PAYSLIP - ${payslip.periodStart}\n\nEarnings: ${payslip.totalEarnings}\nDeductions: ${payslip.totalDeductions}\nNet Pay: ${payslip.netPay}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${payslip.periodStart}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white">My Payslips</h1>
        <p className="text-[var(--text-muted)] text-sm">View and download your monthly payroll records and tax deductions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List of Payslips */}
        <div className="md:col-span-1 space-y-3">
          {payslips.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center text-slate-400">
                <FileText className="mx-auto mb-2 opacity-50" />
                No payslips generated yet.
              </CardContent>
            </Card>
          ) : (
            payslips.map((p: any) => (
              <Card 
                key={p.id} 
                className={`cursor-pointer transition-all hover:border-blue-500/50 ${selectedPayslip?.id === p.id ? 'border-blue-500 bg-blue-500/5' : 'bg-slate-900 border-slate-800'}`}
                onClick={() => setSelectedPayslip(p)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedPayslip?.id === p.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Run {p.periodStart}</h4>
                      <p className="text-xs text-slate-500">${p.netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payslip Details View */}
        <div className="md:col-span-2">
          {selectedPayslip ? (
            <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="border-b border-slate-800 pb-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Payslip for {selectedPayslip.periodStart}</CardTitle>
                  <CardDescription>Generated on {new Date(selectedPayslip.runDate || selectedPayslip.periodEnd).toLocaleDateString()}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedPayslip)} className="gap-2">
                  <Download size={14} /> Download PDF
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Earnings */}
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-4 border-b border-slate-800 pb-2">
                      <Wallet size={16} />
                      <h3 className="font-bold tracking-wide uppercase text-xs">Earnings</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Basic Pay</span>
                        <span className="text-slate-200 font-mono">${selectedPayslip.basicPay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Allowances (Prorated)</span>
                        <span className="text-slate-200 font-mono">${(selectedPayslip.totalEarnings - selectedPayslip.basicPay).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-800/50 mt-2">
                        <span className="text-emerald-400">Gross Earnings</span>
                        <span className="text-emerald-400 font-mono">${selectedPayslip.totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 mb-4 border-b border-slate-800 pb-2">
                      <Scale size={16} />
                      <h3 className="font-bold tracking-wide uppercase text-xs">Deductions</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Provident Fund (PF)</span>
                        <span className="text-slate-200 font-mono">${selectedPayslip.pfAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Employee State Insurance (ESI)</span>
                        <span className="text-slate-200 font-mono">${selectedPayslip.esiAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Professional Tax (PT)</span>
                        <span className="text-slate-200 font-mono">${selectedPayslip.ptAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tax Deducted at Source (TDS)</span>
                        <span className="text-slate-200 font-mono">${selectedPayslip.tdsAmount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Other Deductions (LOP)</span>
                        <span className="text-slate-200 font-mono">${(selectedPayslip.totalDeductions - (selectedPayslip.pfAmount + selectedPayslip.esiAmount + selectedPayslip.ptAmount + selectedPayslip.tdsAmount) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-800/50 mt-2">
                        <span className="text-rose-400">Total Deductions</span>
                        <span className="text-rose-400 font-mono">${selectedPayslip.totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay Highlight */}
                <div className="bg-slate-950 rounded-2xl p-6 flex items-center justify-between border border-slate-800 shadow-inner">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">Net Transfer Amount</p>
                    <p className="text-slate-400 text-xs">Transferred to registered bank account.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400 tracking-tight font-mono">${selectedPayslip.netPay.toLocaleString()}</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-12 text-slate-500">
              <p>Select a payslip from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
