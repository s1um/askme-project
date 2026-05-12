import { useState } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function UnansweredCard({ question, onAnswer, onDelete }) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    await onAnswer(question.id, answer.trim());
    setSubmitting(false);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-semibold text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-0.5">Q</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{question.content}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(question.createdAt)}</p>
        </div>
        <button
          onClick={() => onDelete(question.id)}
          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
        >
          삭제
        </button>
      </div>

      <form onSubmit={handleSubmit} className="pt-1 space-y-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="답변을 입력하세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!answer.trim() || submitting}
            className="flex items-center min-h-[44px] px-5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '등록 중...' : '답변 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
