import { useEffect, useState } from 'react';

export default function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('서버에 연결할 수 없습니다.'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Askme</h1>
      <p>서버 응답: {message || '불러오는 중...'}</p>
    </div>
  );
}
