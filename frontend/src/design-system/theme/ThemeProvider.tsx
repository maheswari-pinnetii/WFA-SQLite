import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { STORAGE_KEYS } from '../../shared/constants/constants';
import { lightTheme } from './lightTheme.js';
import { darkTheme } from './darkTheme.js';
import { muiTypography } from './typography.js';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  themeObject: typeof lightTheme | typeof darkTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => undefined,
  setTheme: () => undefined,
  themeObject: darkTheme,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch {
      // localStorage unavailable (private browsing restrictions, etc.)
    }
    return 'dark'; // Default to dark mode
  });

  const themeObject = theme === 'light' ? lightTheme : darkTheme;

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: theme,
        primary: {
          main: theme === 'dark' ? '#2DD4BF' : '#0F766E',
        },
        background: {
          default: themeObject.palette.background,
          paper: themeObject.palette.card,
        },
        text: {
          primary: themeObject.palette.textPrimary,
          secondary: themeObject.palette.textSecondary,
        },
      },
      typography: muiTypography,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              borderRadius: 10,
              minHeight: 40,
              transition: 'all 180ms ease',
            },
            containedPrimary: {
              backgroundColor: '#20BFB3',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(32, 191, 179, 0.25)',
              '&:hover': {
                backgroundColor: '#18AFA5',
                boxShadow: '0 6px 18px rgba(32, 191, 179, 0.38)',
              },
              '&:active': {
                backgroundColor: '#0E8F88',
              },
              '&.Mui-disabled': {
                backgroundColor: '#475569',
                color: '#94A3B8',
              },
            },
            outlinedPrimary: {
              color: '#20BFB3',
              borderColor: '#20BFB3',
              '&:hover': {
                borderColor: '#20BFB3',
                backgroundColor: 'rgba(32, 191, 179, 0.08)',
              },
            },
            textPrimary: {
              color: '#20BFB3',
              '&:hover': {
                backgroundColor: 'rgba(32, 191, 179, 0.08)',
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transition: 'all 180ms ease',
              '&:hover': {
                color: '#20BFB3',
                backgroundColor: 'rgba(32, 191, 179, 0.08)',
              },
            },
          },
        },
        MuiCheckbox: {
          styleOverrides: {
            root: {
              color: '#64748B',
              '&.Mui-checked': {
                color: '#20BFB3',
              },
            },
          },
        },
        MuiRadio: {
          styleOverrides: {
            root: {
              color: '#64748B',
              '&.Mui-checked': {
                color: '#20BFB3',
              },
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            switchBase: {
              '&.Mui-checked': {
                color: '#20BFB3',
                '& + .MuiSwitch-track': {
                  backgroundColor: '#20BFB3',
                  opacity: 0.5,
                },
              },
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              color: '#94A3B8',
              '&.Mui-selected': {
                color: '#20BFB3',
                backgroundColor: 'rgba(32, 191, 179, 0.06)',
              },
              '&:hover': {
                color: '#20BFB3',
              },
            },
          },
        },
        MuiPaginationItem: {
          styleOverrides: {
            root: {
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              '&.Mui-selected': {
                backgroundColor: '#20BFB3 !important',
                color: '#FFFFFF',
              },
              '&:hover': {
                backgroundColor: 'rgba(32, 191, 179, 0.12)',
              },
            },
          },
        },
      },
    });
  }, [theme, themeObject]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);

    // Apply Shell and Status Palette as CSS Variables
    const palette = themeObject.palette;
    root.style.setProperty('--bg-primary', palette.background);
    root.style.setProperty('--bg-secondary', palette.surface);
    root.style.setProperty('--bg-card', palette.card);
    root.style.setProperty('--border-color', palette.border);
    root.style.setProperty('--text-primary', palette.textPrimary);
    root.style.setProperty('--text-secondary', palette.textSecondary);
    root.style.setProperty('--status-success', palette.success);
    root.style.setProperty('--status-error', palette.error);
    root.style.setProperty('--status-warning', palette.warning);
    root.style.setProperty('--status-info', palette.info);
    root.style.setProperty('--status-pending', (palette as any).pending || '#f59e0b');

    // Apply Role Colors in a Dynamic Style Tag
    const roles = themeObject.roles;
    let styleBlock = document.getElementById('role-theme-styles');
    if (!styleBlock) {
      styleBlock = document.createElement('style');
      styleBlock.id = 'role-theme-styles';
      document.head.appendChild(styleBlock);
    }
    
    styleBlock.innerHTML = `
      .role-admin {
        --role-primary: ${roles.ADMIN.primary};
        --role-secondary: ${roles.ADMIN.secondary};
        --role-background: ${roles.ADMIN.background};
        --role-text: ${roles.ADMIN.text};
      }
      .role-hr {
        --role-primary: ${roles.HR.primary};
        --role-secondary: ${roles.HR.secondary};
        --role-background: ${roles.HR.background};
        --role-text: ${roles.HR.text};
      }
      .role-manager {
        --role-primary: ${roles.MANAGER.primary};
        --role-secondary: ${roles.MANAGER.secondary};
        --role-background: ${roles.MANAGER.background};
        --role-text: ${roles.MANAGER.text};
      }
      .role-team-lead {
        --role-primary: ${roles.TEAM_LEAD.primary};
        --role-secondary: ${roles.TEAM_LEAD.secondary};
        --role-background: ${roles.TEAM_LEAD.background};
        --role-text: ${roles.TEAM_LEAD.text};
      }
      .role-employee {
        --role-primary: ${roles.EMPLOYEE.primary};
        --role-secondary: ${roles.EMPLOYEE.secondary};
        --role-background: ${roles.EMPLOYEE.background};
        --role-text: ${roles.EMPLOYEE.text};
      }
    `;
  }, [theme, themeObject]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, themeObject }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
