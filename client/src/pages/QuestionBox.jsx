import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';

export default function QuestionBox() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchBox() {
    try {
      const res = await fetch(`/api/questions/${username}`);
      if (res.status === 404) throw new Error('존재하지 않는 질문함입니다');
      if (!res.ok) throw new Error('불러오는 중 오류가 발생했습니다');
      const data = await res.json();
      setUser(data.user);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBox();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pb-16">
        <UserProfile displayName={user.displayName} username={username} />

        <div className="space-y-6">
          <QuestionForm ownerId={user.id} onSubmitted={fetchBox} />
          <QuestionList questions={questions} />
        </div>
      </div>
    </div>
  );
}
