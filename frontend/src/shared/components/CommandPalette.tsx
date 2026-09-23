import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Folder, Layout, Briefcase, FileSignature, X } from 'lucide-react';
import { apiClient as api } from '../../api/client';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        if (res.data && res.data.success) {
          setResults(res.data.data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Keyboard navigation within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, results.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          navigate(results[selectedIndex].link);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMPLOYEE': return <Users size={18} className="text-emerald-500" />;
      case 'PAGE': return <Layout size={18} className="text-blue-500" />;
      case 'WORKFLOW': return <FileSignature size={18} className="text-orange-500" />;
      case 'DOCUMENT': return <FileText size={18} className="text-purple-500" />;
      default: return <Folder size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 sm:px-0">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden transform transition-all animate-fadeIn">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <Search size={20} className="text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-base text-[var(--text-primary)] placeholder-slate-500"
            placeholder="Search employees, workflows, or pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent mx-2" />
          )}
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length > 0 && query.length < 2 && (
            <div className="p-6 text-center text-sm text-slate-400">
              Type at least 2 characters to search...
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="p-6 text-center text-sm text-slate-400">
              No results found for "<span className="text-[var(--text-primary)]">{query}</span>"
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map((result, idx) => (
                <li key={result.id}>
                  <button
                    onClick={() => {
                      navigate(result.link);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors cursor-pointer ${
                      selectedIndex === idx ? 'bg-[var(--bg-hover)] border-l-4 border-emerald-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="shrink-0 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {result.subtitle}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {result.type}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] px-4 py-2 flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
