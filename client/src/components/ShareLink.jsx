import { useState } from 'react';

export default function ShareLink({ username }) {
  const url = `${window.location.origin}/${username}`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-indigo-50 rounded-2xl p-4">
      <p className="text-xs font-medium text-indigo-400 mb-2">내 질문함 링크</p>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm text-indigo-700 truncate">{url}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors"
        >
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>
    </div>
  );
}
