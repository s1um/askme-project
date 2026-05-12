import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="다크모드 전환"
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
