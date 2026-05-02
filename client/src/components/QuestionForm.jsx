import { useState } from 'react';

const MAX_LENGTH = 300;

export default function QuestionForm({ ownerId, onSubmitted }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">익명으로 질문하기</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value.slice(0, MAX_LENGTH));
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="궁금한 점을 익명으로 물어보세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${content.length >= MAX_LENGTH ? 'text-red-400' : 'text-gray-400'}`}>
            {content.length} / {MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={!content.trim() || status === 'loading'}
            className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? '전송 중...' : '질문 보내기'}
          </button>
        </div>

        {status === 'success' && (
          <p className="mt-2 text-sm text-emerald-600">질문이 전송되었습니다!</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
