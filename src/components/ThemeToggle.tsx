// src/components/ThemeToggle.tsx
import { useTheme } from '../context/themeContext';
import { Moon } from 'lucide-react';
export const ThemeToggle = () => {
  const {
    theme,
    toggleTheme
  } = useTheme();
  const isDark = theme === 'dark';
  return <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer" onClick={toggleTheme}>
      <div className="flex items-center space-x-3">
        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
      </div>
      <div className={`w-10 h-6 rounded-full relative transition-colors ${isDark ? 'bg-indigo-500' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isDark ? 'translate-x-4' : 'translate-x-1'}`} />
      </div>
    </div>;
};