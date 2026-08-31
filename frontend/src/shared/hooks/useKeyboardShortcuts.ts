import { useEffect } from 'react';

interface ShortcutHandlers {
  onToggleShortcutsModal?: () => void;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = ({
  onToggleShortcutsModal,
  onToggleSidebar,
  onToggleTheme,
  onFocusSearch,
  onEscape
}: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is actively typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        }
        return;
      }

      // Command/Ctrl + K => Focus Global Search
      if (modKey && (e.key.toLowerCase() === 'k' || e.key === '/')) {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Command/Ctrl + B => Toggle Sidebar
      if (modKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // Command/Ctrl + D => Toggle Theme
      if (modKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onToggleTheme?.();
        return;
      }

      // Pressing '?' (Shift + /) when not typing => Shortcuts modal
      if (!isInput && e.key === '?' && !modKey) {
        e.preventDefault();
        onToggleShortcutsModal?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleShortcutsModal, onToggleSidebar, onToggleTheme, onFocusSearch, onEscape]);
};

export default useKeyboardShortcuts;
