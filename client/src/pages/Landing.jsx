import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/my', { replace: true });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">Q</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AskMe</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">익명으로 질문을 받고, 나만의 방식으로 답해보세요</p>

        <div className="flex flex-col gap-3">
          <Link
            to="/signup"
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            시작하기
          </Link>
          <Link
            to="/login"
            className="w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
