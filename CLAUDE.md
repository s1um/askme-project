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

## 코드 규칙
 
- API 엔드포인트를 추가할 때 반드시 입력값 검증을 포함할 것
- 컴포넌트는 100줄 이내로 유지할 것. 넘으면 분리를 제안할 것
- 에러 발생 시 사용자에게 보여줄 메시지를 항상 포함할 것
- 모든 API 응답은 일관된 형식을 사용할 것: { success: boolean, data?: any, error?: string }
 
## 금지 사항
 
- 외부 CDN 링크 사용 금지 — 모든 의존성은 npm으로 관리
- console.log 디버깅 코드가 남아있으면 안 됨
- 하드코딩된 비밀값(API 키, 비밀번호 등) 금지 — 환경 변수 사용
- 주석 없는 복잡한 로직 금지 — 왜 이렇게 했는지 주석으로 설명
 
## 프로젝트 현황
 
- [x] 기본 CRUD API (질문 등록, 조회, 답변)
- [x] 프론트엔드 기본 페이지 (질문 목록, 질문 폼, 관리 페이지)
- [x] 프론트-백 연동 완료
- [ ] 개인화 기능 (Chapter 5에서 선택한 기능)
- [ ] 테스트 작성
- [ ] UI 폴리싱