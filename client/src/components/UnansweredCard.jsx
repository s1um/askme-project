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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">Q</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800 leading-relaxed">{question.content}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(question.createdAt)}</p>
        </div>
        <button
          onClick={() => onDelete(question.id)}
          className="shrink-0 text-xs text-gray-300 hover:text-red-400 transition-colors"
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
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!answer.trim() || submitting}
            className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '등록 중...' : '답변 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
