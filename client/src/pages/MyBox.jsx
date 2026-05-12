import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareLink from '../components/ShareLink';
import UnansweredCard from '../components/UnansweredCard';
import QuestionCard from '../components/QuestionCard';
import ThemeToggle from '../components/ThemeToggle';

export default function MyBox() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/my/profile', { headers }).then((res) => {
        if (res.status === 401) { navigate('/login'); return null; }
        return res.json();
      }),
      fetch('/api/dashboard/questions', { headers }).then((res) => res.json()),
    ]).then(([profile, qs]) => {
      if (!profile) return;
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      setQuestions(qs);
    });
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  async function handleAnswer(questionId, content) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/my/questions/${questionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, isAnswered: true, answer: { content, createdAt: new Date().toISOString() } }
            : q
        )
      );
    }
  }

  async function handleDelete(questionId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/my/questions/${questionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm">
      불러오는 중...
    </div>
  );

  const unanswered = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) => q.isAnswered);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 dark:text-gray-100">{user.displayName}의 질문함</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <ShareLink username={user.username} />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            미답변 {unanswered.length}개
          </h2>
          {unanswered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">미답변 질문이 없습니다.</p>
          ) : (
            unanswered.map((q) => (
              <UnansweredCard
                key={q.id}
                question={q}
                onAnswer={handleAnswer}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            답변 완료 {answered.length}개
          </h2>
          {answered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">답변한 질문이 없습니다.</p>
          ) : (
            answered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
