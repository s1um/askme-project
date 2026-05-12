import { vi, describe, it, expect, beforeEach } from 'vitest';

// vi.mock은 파일 최상단으로 호이스팅됨 — app.js가 import되기 전에 실행되어
// questions.js가 참조하는 db 모듈도 같은 인메모리 DB를 받게 된다
vi.mock('../db/index.js', async () => {
  const { default: Database } = await import('better-sqlite3');
  const { readFileSync } = await import('fs');

  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  // URL 객체로 경로를 해석하면 OS(Windows/Linux) 상관없이 동작한다
  const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf-8');
  db.exec(schema);

  return { default: db };
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import db from '../db/index.js'; // 위에서 mock된 인메모리 DB

// authMiddleware가 런타임에 이 값을 읽으므로 테스트 실행 전에 고정
process.env.JWT_SECRET = 'test-secret';

function generateToken(userId, username) {
  return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// ──────────────────────────────────────────────────────────────────────────────

describe('Questions API', () => {
  beforeEach(() => {
    // 외래키 CASCADE를 활용해 users 삭제 시 questions도 함께 정리됨
    db.prepare('DELETE FROM answers').run();
    db.prepare('DELETE FROM questions').run();
    db.prepare('DELETE FROM users').run();
    db.prepare(
      'INSERT INTO users (id, username, display_name, password_hash) VALUES (?, ?, ?, ?)'
    ).run(1, 'testuser', '테스트유저', 'hashed_password');
  });

  // ── POST /api/questions ────────────────────────────────────────────────────

  describe('POST /api/questions', () => {
    it('유효한 content와 ownerId로 질문을 생성한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: '오늘 점심 뭐 먹었어?', ownerId: 1 });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        content: '오늘 점심 뭐 먹었어?',
        createdAt: expect.any(String),
      });
      // 내부 필드가 응답에 포함되지 않는지 확인
      expect(res.body).not.toHaveProperty('user_id');
      expect(res.body).not.toHaveProperty('is_public');
      expect(res.body).not.toHaveProperty('answered_at');
    });

    it('300자 이내 최대 길이 질문을 허용한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: 'A'.repeat(300), ownerId: 1 });

      expect(res.status).toBe(201);
    });

    it('빈 content는 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: '', ownerId: 1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('공백만 있는 content는 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: '   ', ownerId: 1 });

      expect(res.status).toBe(400);
    });

    it('300자를 초과하는 content는 400을 반환한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: 'A'.repeat(301), ownerId: 1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('존재하지 않는 ownerId는 404를 반환한다', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ content: '질문입니다', ownerId: 9999 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ── GET /api/questions/:username ───────────────────────────────────────────

  describe('GET /api/questions/:username', () => {
    it('사용자 정보와 전체 질문 목록을 반환한다', async () => {
      db.prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)').run(1, '테스트 질문');

      const res = await request(app).get('/api/questions/testuser');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        user: { username: 'testuser', displayName: '테스트유저' },
        questions: expect.any(Array),
      });
      expect(res.body.questions).toHaveLength(1);
      expect(res.body.questions[0]).toMatchObject({
        content: '테스트 질문',
        isAnswered: false,
        answer: null,
      });
    });

    it('답변된 질문은 isAnswered: true와 answer 내용을 포함한다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '답변 있는 질문');
      db.prepare('INSERT INTO answers (question_id, content) VALUES (?, ?)').run(qId, '이렇습니다');

      const res = await request(app).get('/api/questions/testuser');

      expect(res.status).toBe(200);
      expect(res.body.questions[0]).toMatchObject({
        isAnswered: true,
        answer: { content: '이렇습니다' },
      });
    });

    it('질문이 없으면 빈 배열을 반환한다', async () => {
      const res = await request(app).get('/api/questions/testuser');

      expect(res.status).toBe(200);
      expect(res.body.questions).toEqual([]);
    });

    it('존재하지 않는 username은 404를 반환한다', async () => {
      const res = await request(app).get('/api/questions/nobody');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

  });

  // ── GET /api/questions/:username/answered ──────────────────────────────────

  describe('GET /api/questions/:username/answered', () => {
    it('답변 완료된 질문만 반환한다', async () => {
      const { lastInsertRowid: answeredId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '답변된 질문');
      db.prepare('INSERT INTO answers (question_id, content) VALUES (?, ?)').run(
        answeredId,
        '답변 내용'
      );
      // 미답변 질문은 결과에 포함되면 안 됨
      db.prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)').run(1, '미답변 질문');

      const res = await request(app).get('/api/questions/testuser/answered');

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(1);
      expect(res.body.questions[0]).toMatchObject({
        content: '답변된 질문',
        answer: { content: '답변 내용' },
      });
    });

    it('답변된 질문이 없으면 빈 배열을 반환한다', async () => {
      db.prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)').run(1, '미답변 질문');

      const res = await request(app).get('/api/questions/testuser/answered');

      expect(res.status).toBe(200);
      expect(res.body.questions).toEqual([]);
    });

    it('존재하지 않는 username은 404를 반환한다', async () => {
      const res = await request(app).get('/api/questions/nobody/answered');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ── POST /api/questions/:id/like ───────────────────────────────────────────

  describe('POST /api/questions/:id/like', () => {
    it('좋아요 수를 1 증가시킨다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '좋아요 테스트');

      const res = await request(app).post(`/api/questions/${qId}/like`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: { likes: 1 } });
    });

    it('연속 좋아요는 누적된다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '누적 좋아요 테스트');

      await request(app).post(`/api/questions/${qId}/like`);
      const res = await request(app).post(`/api/questions/${qId}/like`);

      expect(res.body).toEqual({ success: true, data: { likes: 2 } });
    });

    it('존재하지 않는 질문 ID는 404를 반환한다', async () => {
      const res = await request(app).post('/api/questions/9999/like');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, error: expect.any(String) });
    });

    it('ID가 0이면 400을 반환한다', async () => {
      const res = await request(app).post('/api/questions/0/like');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false });
    });

    it('ID가 음수면 400을 반환한다', async () => {
      const res = await request(app).post('/api/questions/-1/like');

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /api/questions/:id/like ────────────────────────────────────────

  describe('DELETE /api/questions/:id/like', () => {
    it('좋아요 수를 1 감소시킨다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content, likes) VALUES (?, ?, ?)')
        .run(1, '좋아요 취소 테스트', 3);

      const res = await request(app).delete(`/api/questions/${qId}/like`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: { likes: 2 } });
    });

    it('좋아요가 0일 때 취소해도 음수가 되지 않는다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content, likes) VALUES (?, ?, ?)')
        .run(1, '음수 방지 테스트', 0);

      const res = await request(app).delete(`/api/questions/${qId}/like`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: { likes: 0 } });
    });

    it('존재하지 않는 질문 ID는 404를 반환한다', async () => {
      const res = await request(app).delete('/api/questions/9999/like');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false, error: expect.any(String) });
    });

    it('ID가 음수면 400을 반환한다', async () => {
      const res = await request(app).delete('/api/questions/-1/like');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false });
    });
  });

  // ── POST /api/my/questions/:id/answer ─────────────────────────────────────

  describe('POST /api/my/questions/:id/answer', () => {
    it('질문 수신자가 본인의 질문에 답변할 수 있다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '답변할 질문');

      const token = generateToken(1, 'testuser');
      const res = await request(app)
        .post(`/api/my/questions/${qId}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '답변 내용입니다' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ content: '답변 내용입니다' });
    });

    it('다른 사용자의 질문에는 답변할 수 없다', async () => {
      // testuser2의 질문함에 질문 추가
      db.prepare(
        'INSERT INTO users (id, username, display_name, password_hash) VALUES (?, ?, ?, ?)'
      ).run(2, 'testuser2', '테스트유저2', 'dummy_hash');
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(2, 'testuser2의 질문');

      // testuser1이 testuser2의 질문에 답변 시도 → 403
      const token = generateToken(1, 'testuser');
      const res = await request(app)
        .post(`/api/my/questions/${qId}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '답변입니다' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('인증 토큰 없이 답변하면 401을 반환한다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '질문');

      const res = await request(app)
        .post(`/api/my/questions/${qId}/answer`)
        .send({ content: '답변' });

      expect(res.status).toBe(401);
    });

    it('빈 답변 내용은 400을 반환한다', async () => {
      const { lastInsertRowid: qId } = db
        .prepare('INSERT INTO questions (user_id, content) VALUES (?, ?)')
        .run(1, '질문');

      const token = generateToken(1, 'testuser');
      const res = await request(app)
        .post(`/api/my/questions/${qId}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });
  });
});
