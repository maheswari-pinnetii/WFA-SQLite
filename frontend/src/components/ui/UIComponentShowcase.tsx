import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Switch } from './switch';
import { Input } from './input';
import { Dialog } from './dialog';

export interface UIComponentShowcaseProps {
  className?: string;
}

export const UIComponentShowcase: React.FC<UIComponentShowcaseProps> = ({ className = '' }) => {
  const [toggleState, setToggleState] = useState(true);
  const [textFieldValue, setTextFieldValue] = useState('employee@thestackly.com');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const accordionItems = [
    {
      title: 'How does geofenced biometric clocking work?',
      content: 'Our geofence engine validates GPS coordinates against corporate hub radiuses (Bengaluru, Salem, Hyderabad) within 500 meters.'
    },
    {
      title: 'What SQLite journal mode is configured for high concurrency?',
      content: 'Write-Ahead Logging (WAL) mode is active with a busy timeout of 10,000ms and PASSIVE checkpointing.'
    }
  ];

  return (
    <div className={`ui-component-showcase p-6 bg-slate-900 text-white rounded-xl space-y-8 ${className}`}>
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-blue-400">Enterprise UI Design System Component Showcase</h2>
        <p className="text-slate-400 text-sm mt-1">
          Standardized UI component primitives: Cards, Sidebar, Widgets, Popover, ToggleSwitch, Text Fields, Modal, Accordion, Badge, and Progress Bar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Cards */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">1. Cards Primitive</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            High-conversion responsive container for metrics, forms, and analytical widgets.
          </CardContent>
        </Card>

        {/* 2. Sidebar Navigation */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">2. Sidebar Element</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm space-y-2">
            <div className="flex items-center gap-2 p-2 bg-slate-950 rounded">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="font-medium text-xs">Role Scoped Sidebar Drawer</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Widgets */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">3. Interactive Widgets</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 text-sm">
            <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-lg text-xs flex justify-between items-center">
              <span>Live Attendance Punch Widget</span>
              <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-semibold">ACTIVE</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Popover */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">4. Popover & Tooltip</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded text-white"
            >
              Toggle Popover
            </button>
            {popoverOpen && (
              <div className="absolute top-12 left-4 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-xl z-20 text-xs text-slate-300 w-48">
                Biometric Passkey HUD information overlay.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. ToggleSwitch */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">5. ToggleSwitch</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Dark Mode / Feature Flag</span>
            <Switch
              checked={toggleState}
              onCheckedChange={setToggleState}
            />
          </CardContent>
        </Card>

        {/* 6. Text Fields */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">6. Text Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="text-xs text-slate-400">Corporate Email Address</label>
            <Input
              value={textFieldValue}
              onChange={(e) => setTextFieldValue(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white text-xs"
            />
          </CardContent>
        </Card>

        {/* 7. Modal */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">7. Modal Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
            >
              Open Audit Modal
            </button>
            {isModalOpen && (
              <Dialog title="Audit Correction Desk Modal" onClose={() => setIsModalOpen(false)}>
                <div className="p-4 text-slate-300 text-sm space-y-3">
                  <p>Submit attendance correction request for HR/Manager review.</p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-500"
                  >
                    Close Modal
                  </button>
                </div>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* 8. Accordion */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">8. Accordion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {accordionItems.map((item, idx) => (
              <div key={idx} className="border border-slate-700 rounded overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                  className="w-full p-2 text-left text-xs font-semibold bg-slate-900 flex justify-between items-center text-slate-200"
                >
                  <span>{item.title}</span>
                  <span>{activeAccordion === idx ? '−' : '+'}</span>
                </button>
                {activeAccordion === idx && (
                  <div className="p-2 text-xs text-slate-400 bg-slate-950">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 9. Badge */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">9. Badge Status Indicators</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ADMIN</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">HR OPS</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">SOC2 COMPLIANT</Badge>
          </CardContent>
        </Card>

        {/* 10. Progress Bar */}
        <Card className="bg-slate-800 border-slate-700 col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg text-white">10. Progress Bar (Weekly Hours Goal: 36h / 40h)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Weekly Work Goal Adherence</span>
              <span>90%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-[90%] transition-all duration-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UIComponentShowcase;

