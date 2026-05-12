import { useState } from 'react';

const LIKED_KEY = 'liked_questions';

function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLikedSet(set) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function QuestionCard({ question, onDelete }) {
  const { id, content, createdAt, answer, likes: initialLikes } = question;

  const [liked, setLiked] = useState(() => getLikedSet().has(id));
  const [likes, setLikes] = useState(initialLikes ?? 0);
  const [pending, setPending] = useState(false);

  async function handleLike() {
    if (pending) return;
    setPending(true);

    const method = liked ? 'DELETE' : 'POST';
    // 낙관적 업데이트: 응답 전에 UI 먼저 반영
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/questions/${id}/like`, { method });
      const data = await res.json();
      if (!data.success) throw new Error();

      // 서버 카운트로 동기화
      setLikes(data.data.likes);

      const set = getLikedSet();
      liked ? set.delete(id) : set.add(id);
      saveLikedSet(set);
    } catch {
      // 실패 시 롤백
      setLiked(liked);
      setLikes(prev => liked ? prev + 1 : prev - 1);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs font-semibold text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-0.5">Q</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{content}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(createdAt)}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
          >
            삭제
          </button>
        )}
      </div>

      {answer && (
        <div className="flex items-start gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="shrink-0 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full mt-0.5">A</span>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{answer.content}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(answer.createdAt)}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          onClick={handleLike}
          disabled={pending}
          className={`flex items-center gap-1 text-xs px-4 min-h-[44px] rounded-full border transition-colors
            ${liked
              ? 'border-rose-300 text-rose-500 bg-rose-50 dark:bg-rose-900/20'
              : 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-rose-300 hover:text-rose-400'
            } disabled:opacity-50`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}
