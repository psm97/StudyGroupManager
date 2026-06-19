# StudyGroupManager — 프로젝트 규칙

## 1. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Django 5.2, Django REST Framework |
| Database | PostgreSQL 15 |
| 통신 | Axios (Frontend ↔ Backend REST API) |

---

## 2. 디렉토리 구조

### Frontend (`frontend/`)

```
frontend/
├── public/                          # 정적 파일
├── src/
│   ├── app/                         # Next.js App Router 페이지
│   │   ├── accounts/
│   │   │   ├── login/page.tsx       # 로그인
│   │   │   ├── signup/page.tsx      # 회원가입
│   │   │   ├── nickname/page.tsx    # 닉네임 설정
│   │   │   ├── profile/page.tsx     # 프로필 조회
│   │   │   └── profile-settings/page.tsx  # 프로필 수정
│   │   ├── admin/
│   │   │   ├── page.tsx             # 관리자 대시보드
│   │   │   ├── layout.tsx
│   │   │   ├── members/page.tsx     # 회원 관리
│   │   │   ├── groups/page.tsx      # 그룹 관리
│   │   │   ├── analytics/page.tsx   # 통계
│   │   │   ├── files/page.tsx       # 파일 관리
│   │   │   ├── logs/page.tsx        # 로그
│   │   │   ├── report/page.tsx      # 리포트
│   │   │   ├── config/page.tsx      # 설정
│   │   │   ├── profile/page.tsx     # 관리자 프로필
│   │   │   └── _components/
│   │   │       ├── AdminSidebar.tsx
│   │   │       └── AdminTopbar.tsx
│   │   ├── ai/
│   │   │   ├── attendance-analysis/page.tsx  # 출석 분석 (리더: 그룹+개인 / 멤버: 개인)
│   │   │   ├── monthly-report/page.tsx       # 월간 리포트 (리더: 그룹+개인 / 멤버: 개인)
│   │   │   └── planner/page.tsx              # AI 플래너 (리더: 그룹+개인 / 멤버: 개인, 챗봇 포함)
│   │   ├── attendance/
│   │   │   ├── check/page.tsx       # 출석 체크
│   │   │   └── stats/page.tsx       # 출석 통계
│   │   ├── dashboard/page.tsx       # 대시보드
│   │   ├── groups/
│   │   │   ├── page.tsx             # 그룹 목록
│   │   │   └── [id]/page.tsx        # 그룹 상세
│   │   ├── penalty/page.tsx         # 벌금 관리
│   │   ├── support/
│   │   │   ├── notice/page.tsx      # 공지사항
│   │   │   ├── resources/page.tsx   # 학습 자료
│   │   │   └── calendar/page.tsx    # 캘린더
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # 루트 (랜딩)
│   │   └── globals.css
│   ├── components/                  # 공통 컴포넌트
│   │   ├── Header.tsx
│   │   ├── LeftMenu.tsx
│   │   ├── DarkMode.tsx
│   │   ├── GroupTabsCard.tsx
│   │   └── PlannerChat.tsx          # AI 플래너 챗봇 UI (ai/planner 전용)
│   ├── lib/
│   │   └── axios.ts                 # Axios 인스턴스 설정
│   ├── api/                         # API 호출 함수 모음
│   │   ├── accounts.ts
│   │   ├── groups.ts
│   │   ├── attendance.ts
│   │   ├── penalty.ts
│   │   ├── ai.ts
│   │   └── support.ts
│   └── types/                       # TypeScript 타입 정의
│       ├── user.ts
│       ├── group.ts
│       ├── attendance.ts
│       ├── penalty.ts
│       └── ai.ts                    # AttendanceRiskAnalysis, MonthlyReport, StudyGoal, WeeklyProgress, PlannerChatHistory
├── package.json
├── tsconfig.json
└── next.config.ts
```

### Backend (`backend/`)

```
backend/
├── studygroupmanager/               # 프로젝트 설정
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── middleware.py
├── accounts/                        # 사용자 인증·프로필
│   ├── models.py                    # User
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── groups/                          # 스터디 그룹 관리
│   ├── models.py                    # StudyGroup, GroupMembership
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── attendance/                      # 출석 관리
│   ├── models.py                    # AttendanceSession, AttendanceRecord
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── penalty/                         # 벌금 관리
│   ├── models.py                    # Penalty
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── ai/                              # AI 분석·리포트·플래너
│   ├── models.py                    # AttendanceRiskAnalysis, MonthlyReport, StudyGoal, WeeklyProgress, PlannerChatHistory
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── support/                         # 공지·자료·캘린더
│   ├── models.py                    # Notice, Resource, CalendarEvent
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── migrations/
├── dashboard/                       # 대시보드 집계
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── migrations/
├── admin/                           # 관리자 기능
│   ├── views.py
│   └── urls.py
└── manage.py
```

---

## 3. Frontend ↔ Backend 통신 규칙 (Axios)

모든 API 호출은 Axios를 사용하며, `src/lib/axios.ts`에 정의된 인스턴스를 통해 통신한다.

```typescript
// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
```

- **패키지**: `axios ^1.18.0` (`package.json` dependencies에 설치됨)
- **baseURL**: `http://localhost:8000/api`
- **인증**: 쿠키 기반 세션 (`withCredentials: true`)
- **CSRF**: Django `csrftoken` 쿠키를 `X-CSRFToken` 헤더로 전달
- **응답 형식**: JSON

### API 엔드포인트 규칙

| 앱 | 접두사 |
|----|--------|
| accounts | `/api/accounts/` |
| groups | `/api/groups/` |
| attendance | `/api/attendance/` |
| penalty | `/api/penalty/` |
| ai | `/api/ai/` |
| support | `/api/support/` |
| dashboard | `/api/dashboard/` |
| admin | `/api/admin/` |

---

## 4. 데이터베이스 — PostgreSQL

### 설정 (`backend/studygroupmanager/settings.py`)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'studygroup_db',
        'USER': 'studygroup_user',
        'PASSWORD': 'psm97',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 데이터베이스 생성 SQL

```sql
CREATE DATABASE studygroup_db;
CREATE USER studygroup_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE studygroup_db TO studygroup_user;
```

---

## 5. 데이터베이스 테이블 정의

> Django migrations가 실제 테이블을 생성한다. 아래는 각 앱 `models.py` 기준 스키마이다.

### 5-1. `accounts_user` — 사용자

```sql
CREATE TABLE accounts_user (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(150) UNIQUE NOT NULL,
    email         VARCHAR(254) UNIQUE NOT NULL,
    password      VARCHAR(128) NOT NULL,
    nickname      VARCHAR(50),
    profile_image VARCHAR(500),
    role          VARCHAR(20)  NOT NULL DEFAULT 'member',  -- 항상 'member' (관리자는 admin 테이블에서 별도 관리)
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_staff      BOOLEAN      NOT NULL DEFAULT FALSE,
    date_joined   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/accounts/models.py`

---

### 5-2. `admin` — 관리자

> 관리자 전용 테이블. 암호는 **SHA2** 방식으로 해시하여 저장한다.

```sql
CREATE TABLE admin (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(150) UNIQUE NOT NULL,
    email         VARCHAR(254) UNIQUE NOT NULL,
    password      VARCHAR(256) NOT NULL,  -- SHA2-256 해시값
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/admin/`

**암호 정책**
- 해시 알고리즘: **SHA-256** (SHA2 계열)
- 평문 암호는 저장하지 않으며, 로그인 시 입력값을 SHA-256으로 해시한 뒤 저장값과 비교한다.

---

### 5-3. `groups_studygroup` — 스터디 그룹

> 리더 식별은 `groups_groupmembership.role = 'leader'` 단일 기준으로 한다. 별도 `leader_id` 컬럼 없음.

```sql
CREATE TABLE groups_studygroup (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    max_members INTEGER      NOT NULL DEFAULT 20,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/groups/models.py`

---

### 5-4. `groups_groupmembership` — 그룹 멤버십

```sql
CREATE TABLE groups_groupmembership (
    id         BIGSERIAL PRIMARY KEY,
    group_id   BIGINT      NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES accounts_user(id)    ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'leader' | 'member'
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE (group_id, user_id)
);
```

**참조 앱**: `backend/groups/models.py`

---

### 5-5. `attendance_attendancesession` — 출석 세션

```sql
CREATE TABLE attendance_attendancesession (
    id             BIGSERIAL PRIMARY KEY,
    group_id       BIGINT       NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    title          VARCHAR(200),
    session_date   DATE         NOT NULL,
    created_by_id  BIGINT       NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/attendance/models.py`

---

### 5-6. `attendance_attendancerecord` — 출석 기록

```sql
CREATE TABLE attendance_attendancerecord (
    id          BIGSERIAL PRIMARY KEY,
    session_id  BIGINT      NOT NULL REFERENCES attendance_attendancesession(id) ON DELETE CASCADE,
    user_id     BIGINT      NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'absent',  -- 'present' | 'absent' | 'late'
    checked_at  TIMESTAMPTZ,
    UNIQUE (session_id, user_id)
);
```

**참조 앱**: `backend/attendance/models.py`

---

### 5-7. `penalty_penalty` — 벌금

```sql
CREATE TABLE penalty_penalty (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES accounts_user(id)    ON DELETE CASCADE,
    group_id   BIGINT      NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    reason     TEXT        NOT NULL,
    amount     INTEGER     NOT NULL DEFAULT 0,
    is_paid    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/penalty/models.py`

---

### 5-8. `ai_attendanceriskanalysis` — 출석 위험도 분석

> `user_id = NULL` → 그룹 전체 분석 (리더 전용) / `user_id = NOT NULL` → 개인 분석
> `analyzed_at` 기준으로 레코드가 누적되어 위험도 변화 이력을 추적한다.

```sql
CREATE TABLE ai_attendanceriskanalysis (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            BIGINT      NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    user_id             BIGINT               REFERENCES accounts_user(id)     ON DELETE CASCADE,  -- NULL = 그룹 전체
    risk_score          FLOAT       NOT NULL,   -- 결석 위험도 0.0~1.0
    dropout_probability FLOAT       NOT NULL,   -- 탈퇴 예측 지표 0.0~1.0
    pattern_summary     TEXT        NOT NULL,   -- 출석 패턴 분석 내용
    analyzed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/ai/models.py`

---

### 5-9. `ai_monthlyreport` — 월간 보고서

> `user_id = NULL` → 그룹 보고서 (리더 전용) / `user_id = NOT NULL` → 개인 보고서
> 지난 한 달간 그룹 스터디 활동(출석, 자료, 일정 등)을 AI가 분석하여 생성한다.

```sql
CREATE TABLE ai_monthlyreport (
    id           BIGSERIAL PRIMARY KEY,
    group_id     BIGINT      NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    user_id      BIGINT               REFERENCES accounts_user(id)     ON DELETE CASCADE,  -- NULL = 그룹 보고서
    report_year  INTEGER     NOT NULL,
    report_month INTEGER     NOT NULL,  -- 1~12
    content      TEXT        NOT NULL,  -- AI 생성 보고서
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id, report_year, report_month)
);
```

**참조 앱**: `backend/ai/models.py`

---

### 5-10. `ai_studygoal` — 스터디 목표

> `user_id = NULL` → 그룹 목표 (리더 전용) / `user_id = NOT NULL` → 개인 목표

```sql
CREATE TABLE ai_studygoal (
    id                      BIGSERIAL PRIMARY KEY,
    group_id                BIGINT       NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    user_id                 BIGINT                REFERENCES accounts_user(id)     ON DELETE CASCADE,  -- NULL = 그룹 목표
    title                   VARCHAR(200) NOT NULL,
    description             TEXT,
    target_date             DATE         NOT NULL,
    achievement_probability FLOAT        NOT NULL,  -- AI 예측 달성 확률 0.0~1.0
    ai_suggestions          TEXT         NOT NULL,  -- AI 개선방안
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/ai/models.py`

---

### 5-11. `ai_weeklyprogress` — 주차별 성과 추이

```sql
CREATE TABLE ai_weeklyprogress (
    id                BIGSERIAL PRIMARY KEY,
    goal_id           BIGINT      NOT NULL REFERENCES ai_studygoal(id) ON DELETE CASCADE,
    year              INTEGER     NOT NULL,
    week_number       INTEGER     NOT NULL,  -- 1~53
    performance_score FLOAT       NOT NULL,  -- 주차별 성과 점수 0.0~1.0
    summary           TEXT,
    recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (goal_id, year, week_number)
);
```

**참조 앱**: `backend/ai/models.py`

---

### 5-12. `ai_plannerchathistory` — AI 플래너 챗봇 대화 이력

> 챗봇은 항상 개인 단위. `role`로 사용자 발화와 AI 응답을 구분한다.

```sql
CREATE TABLE ai_plannerchathistory (
    id       BIGSERIAL PRIMARY KEY,
    group_id BIGINT      NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    user_id  BIGINT      NOT NULL REFERENCES accounts_user(id)     ON DELETE CASCADE,
    role     VARCHAR(10) NOT NULL,  -- 'user' | 'ai'
    message  TEXT        NOT NULL,
    sent_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/ai/models.py`

---

### 5-13. `support_notice` — 공지사항

```sql
CREATE TABLE support_notice (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    author_id  BIGINT       NOT NULL REFERENCES accounts_user(id)     ON DELETE CASCADE,
    group_id   BIGINT                REFERENCES groups_studygroup(id)  ON DELETE CASCADE,  -- NULL = 전체 공지
    is_pinned  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/support/models.py`

---

### 5-14. `support_resource` — 학습 자료

```sql
CREATE TABLE support_resource (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT       NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    file_url        VARCHAR(500),
    uploaded_by_id  BIGINT       NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    uploaded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/support/models.py`

---

### 5-15. `support_calendarevent` — 캘린더 일정

```sql
CREATE TABLE support_calendarevent (
    id             BIGSERIAL PRIMARY KEY,
    group_id       BIGINT       NOT NULL REFERENCES groups_studygroup(id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    event_date     DATE         NOT NULL,
    created_by_id  BIGINT       NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**참조 앱**: `backend/support/models.py`

---

## 6. 테이블 관계 요약

```
accounts_user
    ├─ groups_groupmembership (user_id)
    ├─ attendance_attendancesession (created_by_id)
    ├─ attendance_attendancerecord (user_id)
    ├─ penalty_penalty (user_id)
    ├─ ai_attendanceriskanalysis (user_id, nullable — NULL=그룹 전체)
    ├─ ai_monthlyreport (user_id, nullable — NULL=그룹 보고서)
    ├─ ai_studygoal (user_id, nullable — NULL=그룹 목표)
    ├─ ai_plannerchathistory (user_id)
    ├─ support_notice (author_id)
    ├─ support_resource (uploaded_by_id)
    └─ support_calendarevent (created_by_id)

groups_studygroup
    ├─ groups_groupmembership (group_id)
    ├─ attendance_attendancesession (group_id)
    ├─ penalty_penalty (group_id)
    ├─ ai_attendanceriskanalysis (group_id)
    ├─ ai_monthlyreport (group_id)
    ├─ ai_studygoal (group_id)
    ├─ ai_plannerchathistory (group_id)
    ├─ support_notice (group_id)
    ├─ support_resource (group_id)
    └─ support_calendarevent (group_id)

attendance_attendancesession
    └─ attendance_attendancerecord (session_id)

ai_studygoal
    └─ ai_weeklyprogress (goal_id)
```

### 권한 접근 규칙 (AI 기능)

| user_id 값 | 데이터 범위 | 접근 가능 역할 |
|------------|------------|---------------|
| `NULL` | 그룹 전체 | 리더 (`GroupMembership.role = 'leader'`) |
| `NOT NULL` | 개인 본인 | 본인 또는 리더 |
