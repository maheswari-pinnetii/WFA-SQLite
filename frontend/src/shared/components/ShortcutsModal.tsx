import React from 'react';
import { Command, X, Keyboard, Search, Moon, PanelLeft, LifeBuoy } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modSymbol = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: 'Navigation & Workspace',
      items: [
        {
          label: 'Global Quick Search / Command Palette',
          keys: [modSymbol, 'K'],
          icon: <Search size={15} className="text-blue-400" />
        },
        {
          label: 'Toggle Sidebar Collapse / Expand',
          keys: [modSymbol, 'B'],
          icon: <PanelLeft size={15} className="text-indigo-400" />
        },
        {
          label: 'Toggle Light / Dark Theme Mode',
          keys: [modSymbol, 'D'],
          icon: <Moon size={15} className="text-amber-400" />
        },
        {
          label: 'Close Active Modal / Dropdown / Drawer',
          keys: ['Esc'],
          icon: <X size={15} className="text-rose-400" />
        }
      ]
    },
    {
      title: 'Help & Documentation',
      items: [
        {
          label: 'Open Keyboard Shortcuts Guide',
          keys: ['?'],
          icon: <Keyboard size={15} className="text-emerald-400" />
        },
        {
          label: 'Open IT Support & Knowledge Base',
          keys: ['H'],
          icon: <LifeBuoy size={15} className="text-sky-400" />
        }
      ]
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="glass-panel w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <Command size={20} />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Power-user keybindings for faster navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Close shortcuts dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--bg-tertiary)]/60 border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] font-mono font-bold text-[10px]">Esc</kbd> to close anytime</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
