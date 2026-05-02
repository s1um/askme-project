import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  const mismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (mismatch) return;

    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    localStorage.setItem('token', data.token);
    navigate('/my');
  }

  const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="표시될 이름을 입력하세요"
              className={`${inputClass} border-gray-200`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className={`${inputClass} border-gray-200`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className={`${inputClass} border-gray-200`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className={`${inputClass} ${mismatch ? 'border-red-400' : 'border-gray-200'}`}
            />
            {mismatch && (
              <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={mismatch}
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            회원가입
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-500 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
