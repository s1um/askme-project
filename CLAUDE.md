#  AskMe - 익명 질문함

## 서비스 설명
사용자가 자신만의 질문함 페이지를 만들고, 공유 링크를 통해 익명 질문을 받고 공개 답변하는 서비스

## 기술 수택
- Frontend: REact 19 + Vite + Tailwind Css
- Backend: Express.js + better-sqlite3
- 모노레포: client., server/ 폴더 구조

## 컴벤션
- 컨포넌트: PascalCase (예: QuestionCard.jsx)
- API 라우트: /api/ 접두사
- 에러 응답: { error: string } 형식