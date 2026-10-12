/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
  autoGenerateReports: boolean;
  setAutoGenerateReports: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('dlt_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [autoGenerateReports, setAutoGenerateReportsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('dlt_auto_generate_reports');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('dlt_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dlt_theme', 'light');
    }
  }, [darkMode]);

  // Initial fetch from backend preferences
  useEffect(() => {
    let mounted = true;
    api.getPreferences().then((prefs) => {
      if (mounted && prefs) {
        if (localStorage.getItem('dlt_theme') === null) {
          setDarkModeState(prefs.dark_mode);
        }
        if (localStorage.getItem('dlt_auto_generate_reports') === null) {
          setAutoGenerateReportsState(prefs.auto_generate_reports);
        }
      }
    }).catch(() => {
      // Ignored, using local state
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);
    localStorage.setItem('dlt_theme', value ? 'dark' : 'light');
    try {
      await api.updatePreferences({
        dark_mode: value,
        auto_generate_reports: autoGenerateReports,
      });
    } catch {
      // Handled in api client
    }
  };

  const toggleDarkMode = async () => {
    await setDarkMode(!darkMode);
  };

  const setAutoGenerateReports = async (value: boolean) => {
    setAutoGenerateReportsState(value);
    localStorage.setItem('dlt_auto_generate_reports', String(value));
    try {
      await api.updatePreferences({
        dark_mode: darkMode,
        auto_generate_reports: value,
      });
    } catch {
      // Handled in api client
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode,
        autoGenerateReports,
        setAutoGenerateReports,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
