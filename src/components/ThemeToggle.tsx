// src/components/ThemeToggle.tsx
import { useTheme } from '../context/themeContext';
import { Moon } from 'lucide-react';
export const ThemeToggle = () => {
  const {
    theme,
    toggleTheme
  } = useTheme();
  const isDark = theme === 'dark';
  return (
  <div
    className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer"
    onClick={toggleTheme}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <Moon className="w-5 h-5 text-gray-600 md:mr-0 mr-2 dark:text-gray-300" />
      <span className="text-sm text-gray-700 dark:text-gray-200 hidden md:mr-3 mr-0 sm:inline">Dark Mode</span>
    </div>
    <div
      className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${
        isDark ? 'bg-indigo-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${
          isDark ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </div>
  </div>
);
};