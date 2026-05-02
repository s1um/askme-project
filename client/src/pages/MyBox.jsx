import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareLink from '../components/ShareLink';
import UnansweredCard from '../components/UnansweredCard';
import QuestionCard from '../components/QuestionCard';

const DUMMY_USER = { id: 1, username: 'minju', displayName: '민주' };

const DUMMY_QUESTIONS = [
  {
    id: 1,
    content: '가장 좋아하는 음식이 뭐예요?',
    isAnswered: false,
    createdAt: '2026-05-02T10:00:00',
    answer: null,
  },
  {
    id: 2,
    content: '개발을 시작하게 된 계기가 있나요?',
    isAnswered: false,
    createdAt: '2026-05-01T14:30:00',
    answer: null,
  },
  {
    id: 3,
    content: '취미가 뭐예요?',
    isAnswered: true,
    createdAt: '2026-04-28T09:00:00',
    answer: {
      content: '코딩이요! 요즘은 사이드 프로젝트에 빠져있어요.',
      createdAt: '2026-04-28T11:00:00',
    },
  },
];

export default function MyBox() {
  const navigate = useNavigate();
  const user = DUMMY_USER;
  const [questions, setQuestions] = useState(DUMMY_QUESTIONS);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  async function handleAnswer(questionId, content) {
    // TODO: POST /api/my/questions/:id/answer
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, isAnswered: true, answer: { content, createdAt: new Date().toISOString() } }
          : q
      )
    );
  }

  function handleDelete(questionId) {
    // TODO: DELETE /api/my/questions/:id
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }

  const unanswered = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) => q.isAnswered);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">{user.displayName}의 질문함</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <ShareLink username={user.username} />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500">
            미답변 {unanswered.length}개
          </h2>
          {unanswered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">미답변 질문이 없습니다.</p>
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
          <h2 className="text-sm font-semibold text-gray-500">
            답변 완료 {answered.length}개
          </h2>
          {answered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">답변한 질문이 없습니다.</p>
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
