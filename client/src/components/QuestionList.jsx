import QuestionCard from './QuestionCard';

export default function QuestionList({ questions }) {
  const answered = questions.filter((q) => q.isAnswered);

  if (answered.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-10">
        아직 답변된 질문이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500">답변 완료 {answered.length}개</h2>
      {answered.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  );
}
