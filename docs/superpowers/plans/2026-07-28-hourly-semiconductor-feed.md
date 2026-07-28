# Hourly Semiconductor Article Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 당일 반도체 기사 최대 30개를 기사별로 나열하고 한 시간마다 자동 갱신하는 라이브 피드를 Morning Signal에 추가한다.

**Architecture:** 서버 API가 한국어 뉴스 RSS를 읽어 한국시간 당일 기사만 최신순으로 정규화하고 CDN에 한 시간 캐시한다. 클라이언트 피드는 반도체 키워드 화면에서 API를 한 시간마다 다시 요청하며, 각 항목을 합치지 않고 제목·출처 설명 기반 요약·언론사·시각·원문 링크로 렌더링한다.

**Tech Stack:** Next.js 16 route handler, React 19 client component, vinext/Cloudflare Workers, Node test runner

## Global Constraints

- 한국시간 당일 기사만 허용하고 최대 30개로 제한한다.
- 동일 URL 또는 완전히 동일한 제목만 제거하며 유사 기사 클러스터링은 하지 않는다.
- 기사 설명이 없으면 내용을 생성하지 않고 요약 없음 상태를 표시한다.
- `http`와 `https` 링크만 렌더링한다.
- 기사 전문, OpenAI API, 유료 뉴스 API, 데이터베이스를 추가하지 않는다.
- API 응답은 한 시간 캐시하고 수동 갱신 요청은 캐시를 우회한다.

---

### Task 1: RSS 정규화와 당일 필터

**Files:**
- Create: `app/lib/semiconductor-news.mjs`
- Create: `tests/semiconductor-news.test.mjs`

**Interfaces:**
- Produces: `parseNewsRss(xml: string): RawNewsItem[]`
- Produces: `normalizeDailyArticles(items, options): SemiconductorArticle[]`
- Produces: `fetchDailySemiconductorNews({ fetchImpl, now, bypassCache }): Promise<FeedResult>`

- [ ] **Step 1: 실패 테스트 작성**

`tests/semiconductor-news.test.mjs`에 한국시간 자정 경계, 최신순, 30개 제한, 정확한 제목/URL 중복만 제거, 설명 없음, 비 HTTP 링크 제거 테스트를 작성한다.

- [ ] **Step 2: RED 확인**

Run:

```powershell
node --test --test-isolation=none tests/semiconductor-news.test.mjs
```

Expected: `app/lib/semiconductor-news.mjs`가 없어 실패한다.

- [ ] **Step 3: 최소 구현**

`parseNewsRss`는 `<item>`별 `title`, `description`, `link`, `pubDate`, `source`를 추출하고 XML/HTML 엔티티와 태그를 제거한다. `normalizeDailyArticles`는 `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" })` 날짜 키로 당일만 남긴 뒤 최신순으로 최대 30개를 반환한다. `fetchDailySemiconductorNews`는 반도체·HBM·메모리·삼성전자·SK하이닉스 검색 RSS를 요청하고 실패 시 명시적 오류 결과를 반환한다.

- [ ] **Step 4: GREEN 확인**

Run:

```powershell
node --test --test-isolation=none tests/semiconductor-news.test.mjs
```

Expected: 모든 정규화 테스트가 통과한다.

---

### Task 2: 한 시간 캐시 API

**Files:**
- Create: `app/api/semiconductor-news/route.ts`
- Modify: `tests/semiconductor-news.test.mjs`

**Interfaces:**
- Consumes: `fetchDailySemiconductorNews`
- Produces: `GET(request: Request): Promise<Response>`

- [ ] **Step 1: API 계약 테스트 추가**

응답 구조 `{ articles, updatedAt, date, status }`, 정상 응답의 `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=300`, `refresh` 쿼리의 `no-store` 요청 동작을 테스트한다.

- [ ] **Step 2: RED 확인**

Run:

```powershell
node --test --test-isolation=none tests/semiconductor-news.test.mjs
```

Expected: API 계약 또는 캐시 헤더 테스트가 실패한다.

- [ ] **Step 3: route handler 구현**

일반 요청은 한 시간 캐시 헤더를 반환한다. `?refresh=`가 있으면 업스트림 fetch를 `cache: "no-store"`로 호출한다. 수집 실패 시 HTTP 200과 `status: "unavailable"` 및 빈 배열을 반환해 화면이 깨지지 않게 한다.

- [ ] **Step 4: GREEN 확인**

Run:

```powershell
node --test --test-isolation=none tests/semiconductor-news.test.mjs
```

Expected: 데이터 및 캐시 계약 테스트가 통과한다.

---

### Task 3: 기사별 라이브 피드 화면

**Files:**
- Create: `app/components/SemiconductorNewsFeed.tsx`
- Modify: `app/components/BriefingApp.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `/api/semiconductor-news`
- Produces: `SemiconductorNewsFeed({ refreshToken: number })`

- [ ] **Step 1: 렌더링 실패 테스트 추가**

반도체 키워드가 기본 선택되고, `당일 반도체 뉴스`, `최대 30개`, 갱신 상태 영역이 SSR 결과에 존재하며 `관련 기사 N건 통합` 문구가 라이브 피드 컴포넌트에 없음을 확인한다.

- [ ] **Step 2: RED 확인**

Run:

```powershell
vinext build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: 라이브 피드 마크업이 없어 실패한다.

- [ ] **Step 3: 컴포넌트 구현**

`SemiconductorNewsFeed`는 로딩 후 기사마다 별도 `<article>`을 렌더링한다. 제목, 출처, 한국시간 게시 시각, 제공 설명 기반 요약, `target="_blank"`와 `rel="noopener noreferrer"` 원문 링크를 보여준다. 한 시간 타이머와 `refreshToken` 변경 시 재요청하며, 로딩·기사 없음·수집 실패 상태를 분리한다.

- [ ] **Step 4: 기존 화면에 연결**

`BriefingApp`의 기본 키워드를 `반도체`로 바꾸고, 오늘 화면에서 반도체 선택 시 라이브 피드를 보여준다. 상단 새로고침 버튼은 `refreshToken`을 증가시킨다. 다른 키워드와 월별 아카이브는 기존 동작을 유지한다.

- [ ] **Step 5: GREEN 확인**

Run:

```powershell
vinext build
node --test --test-isolation=none tests/briefing-domain.test.mjs tests/semiconductor-news.test.mjs tests/rendered-html.test.mjs
pnpm lint
```

Expected: 전체 테스트와 린트가 통과한다.

- [ ] **Step 6: 커밋**

```powershell
git add app/api/semiconductor-news/route.ts app/lib/semiconductor-news.mjs app/components/SemiconductorNewsFeed.tsx app/components/BriefingApp.tsx app/globals.css tests/semiconductor-news.test.mjs tests/rendered-html.test.mjs
git commit -m "feat: add hourly daily semiconductor feed"
```

---

### Task 4: 배포

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 안내 갱신**

당일 기사, 최대 30개, 한 시간 캐시, 기사별 나열, 출처 설명 기반 요약의 한계를 README에 기록한다.

- [ ] **Step 2: 최종 검증**

```powershell
vinext build
node --test --test-isolation=none tests/briefing-domain.test.mjs tests/semiconductor-news.test.mjs tests/rendered-html.test.mjs
pnpm lint
git diff --check
```

- [ ] **Step 3: GitHub main과 기존 Sites 프로젝트 배포**

검증된 HEAD를 GitHub 및 기존 Sites 소스 브랜치에 푸시하고, 동일 커밋 빌드를 패키징해 비공개 프로덕션 버전으로 배포한다.
