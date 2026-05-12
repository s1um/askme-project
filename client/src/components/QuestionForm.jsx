import { useEffect, useState } from 'react';

const MAX_LENGTH = 300;

export default function QuestionForm({ ownerId, onSubmitted }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // 성공 메시지를 3초 후 자동으로 제거
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => setStatus('idle'), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    // 전송 중 중복 호출 방어 — 버튼 disabled만으로는 JS 직접 호출을 막지 못함
    if (status === 'loading') return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, ownerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '질문 전송에 실패했습니다');
      }

      setContent('');
      setStatus('success');
      onSubmitted?.();
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">익명으로 질문하기</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value.slice(0, MAX_LENGTH));
            if (status === 'error') setStatus('idle');
          }}
          disabled={isLoading}
          placeholder="궁금한 점을 익명으로 물어보세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${content.length >= MAX_LENGTH ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {content.length} / {MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="flex items-center px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 mr-1.5 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isLoading ? '전송 중...' : '질문 보내기'}
          </button>
        </div>

        {status === 'success' && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">✓ 질문이 전송되었습니다!</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
