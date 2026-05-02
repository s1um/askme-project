function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function QuestionCard({ question }) {
  const { content, createdAt, answer } = question;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">Q</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800 leading-relaxed">{content}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(createdAt)}</p>
        </div>
      </div>

      {answer && (
        <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
          <span className="shrink-0 text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">A</span>
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">{answer.content}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(answer.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
