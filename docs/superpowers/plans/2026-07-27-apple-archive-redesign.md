# Morning Signal Apple-style Archive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a monthly article archive, persistent keyword navigation, longer linked briefings, and a restrained Apple-style responsive interface to Morning Signal.

**Architecture:** Extend the deterministic briefing domain with article dates, long-form briefing fields, archive fixtures, and pure month/keyword selectors. Split the current large client component into an orchestration component, an article reader card, and a keyword navigation component; keep preferences and view state in the browser while server-rendering all essential labels and article content.

**Tech Stack:** TypeScript, React 19, vinext, CSS, Node test runner, ESLint, Cloudflare Workers, Codex Sites

## Global Constraints

- Provide `오늘 브리핑` and `월별 아카이브` as the only primary views.
- Provide archive months for May, June, and July 2026, sorted newest first.
- Desktop keyword navigation stays on the left; mobile converts it to a horizontal control.
- Keywords are 전체, AI, 반도체, 삼성전자, SK하이닉스, 부동산, 대출, 구리·남양주·하남·왕숙.
- Articles include `publishedAt`, `deck`, `body`, `takeaways`, and `primaryUrl`.
- Article text is personal briefing analysis, not copied article text.
- Every valid primary URL opens in a new tab with `noopener noreferrer`.
- Preserve three core conclusions, preference learning, source trust labels, and append-only manual refresh.
- Do not add live crawling, paid APIs, a database, authentication, cross-device sync, saves, notes, or push notifications.
- Maintain Cloudflare Worker-compatible vinext output and reuse the existing Sites `project_id`.

---

### Task 1: Monthly archive and keyword domain selectors

**Files:**
- Modify: `app/lib/briefing.mjs`
- Modify: `tests/briefing-domain.test.mjs`

**Interfaces:**
- Consumes: clustered `Issue[]` values with `publishedAt`, `topic`, `companies`, and `regions`
- Produces: `getArchiveIssues()`, `getArchiveMonths(issues)`, `filterIssues(issues, { month, keyword })`, `getKeywordCounts(issues)`

- [ ] **Step 1: Write failing archive tests**

```js
import {
  filterIssues,
  getArchiveIssues,
  getArchiveMonths,
  getKeywordCounts,
} from "../app/lib/briefing.mjs";

test("groups archive months newest first", () => {
  assert.deepEqual(getArchiveMonths(getArchiveIssues()), [
    "2026-07",
    "2026-06",
    "2026-05",
  ]);
});

test("combines month and configured keyword filters", () => {
  const result = filterIssues(getArchiveIssues(), {
    month: "2026-06",
    keyword: "삼성전자",
  });
  assert.ok(result.length > 0);
  assert.ok(result.every((issue) => issue.publishedAt.startsWith("2026-06")));
  assert.ok(result.every((issue) => issue.companies.includes("삼성전자")));
});

test("counts articles for every keyword navigation item", () => {
  const counts = getKeywordCounts(getArchiveIssues());
  assert.equal(counts["전체"], getArchiveIssues().length);
  assert.ok(counts["AI"] > 0);
  assert.ok(counts["구리·남양주·하남·왕숙"] > 0);
});
```

- [ ] **Step 2: Run domain tests and verify RED**

Run:

```powershell
node --test --test-isolation=none tests/briefing-domain.test.mjs
```

Expected: FAIL because the four archive selector exports do not exist.

- [ ] **Step 3: Add keyword matching and month selection**

```js
export const KEYWORDS = [
  "전체",
  "AI",
  "반도체",
  "삼성전자",
  "SK하이닉스",
  "부동산",
  "대출",
  "구리·남양주·하남·왕숙",
];

export function matchesKeyword(issue, keyword) {
  if (keyword === "전체") return true;
  if (keyword === "AI") return issue.topic === "AI" || issue.companies.some((name) => ["엔비디아", "Microsoft", "Google", "Amazon"].includes(name));
  if (keyword === "반도체") return issue.topic === "반도체" || issue.companies.some((name) => ["삼성전자", "SK하이닉스", "TSMC", "마이크론", "엔비디아"].includes(name));
  if (keyword === "부동산") return issue.topic === "부동산·대출" || issue.topic === "관심 지역";
  if (keyword === "대출") return issue.topic === "부동산·대출" && /대출|DSR|금리/.test(`${issue.title} ${issue.summary}`);
  if (keyword === "구리·남양주·하남·왕숙") return issue.regions.some((region) => ["구리", "남양주", "하남", "왕숙"].includes(region));
  return issue.companies.includes(keyword);
}

export function filterIssues(issues, { month = null, keyword = "전체" } = {}) {
  return issues.filter((issue) =>
    (!month || issue.publishedAt.startsWith(month)) &&
    matchesKeyword(issue, keyword),
  );
}

export function getArchiveMonths(issues) {
  return [...new Set(issues.map((issue) => issue.publishedAt.slice(0, 7)))]
    .sort()
    .reverse();
}

export function getKeywordCounts(issues) {
  return Object.fromEntries(
    KEYWORDS.map((keyword) => [
      keyword,
      filterIssues(issues, { keyword }).length,
    ]),
  );
}
```

- [ ] **Step 4: Add May–July archive fixtures**

Add at least two issues per month. Each fixture must contain literal values for:

```js
{
  publishedAt: "2026-06-18",
  deck: "AI 메모리 투자 판단을 위한 한 문장 설명",
  body: [
    "첫 문단은 사건과 배경을 설명합니다.",
    "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
  ],
  takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
  primaryUrl: "https://example-authoritative-source/",
}
```

`getArchiveIssues()` returns ranked clustered fixtures without mutating the morning edition.

- [ ] **Step 5: Run domain tests and verify GREEN**

Run:

```powershell
node --test --test-isolation=none tests/briefing-domain.test.mjs
```

Expected: all domain tests pass.

- [ ] **Step 6: Commit the archive domain**

```powershell
git add app/lib/briefing.mjs tests/briefing-domain.test.mjs
git commit -m "feat: add monthly archive selectors"
```

---

### Task 2: Long-form linked article reader

**Files:**
- Create: `app/components/ArticleCard.tsx`
- Modify: `app/components/BriefingApp.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `Issue` with `deck`, `body: string[]`, `takeaways: string[]`, `primaryUrl`, sources, analysis, and preference
- Produces: `ArticleCard({ issue, preference, onPreference, compact })`

- [ ] **Step 1: Add failing rendered article assertions**

```js
test("renders long briefing copy and direct original links", async () => {
  const html = await (await render()).text();
  assert.match(html, /article-deck/);
  assert.match(html, /article-body/);
  assert.match(html, /핵심 포인트/);
  assert.match(html, /원문 기사 보기/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});
```

- [ ] **Step 2: Build and verify RED**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: FAIL because the new article reader classes and primary link copy are absent.

- [ ] **Step 3: Extract `ArticleCard`**

```tsx
export function ArticleCard({ issue, preference, onPreference, compact = false }: ArticleCardProps) {
  return (
    <article className={compact ? "article-card article-card--compact" : "article-card"}>
      <header className="article-header">
        <time dateTime={issue.publishedAt}>{formatArticleDate(issue.publishedAt)}</time>
        <span>{issue.sources[0]?.name}</span>
      </header>
      <h3>{issue.title}</h3>
      <p className="article-deck">{issue.deck}</p>
      {!compact && (
        <div className="article-body">
          {issue.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      )}
      {!compact && issue.takeaways.length > 0 && (
        <section className="takeaways" aria-label="핵심 포인트">
          <strong>핵심 포인트</strong>
          <ul>{issue.takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
      {issue.primaryUrl && (
        <a className="primary-link" href={issue.primaryUrl} target="_blank" rel="noopener noreferrer">
          원문 기사 보기 <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}
```

Move existing source badges, analysis, tags, and preference buttons into this component without changing their behavior.

- [ ] **Step 4: Render morning, update, reference, and archive issues through `ArticleCard`**

Use `compact={issue.importance === "reference"}` only for reference news. Morning core issues and archive issues show the complete body and takeaways.

- [ ] **Step 5: Build and verify GREEN**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: rendered article test and prior regression tests pass.

- [ ] **Step 6: Commit the reader**

```powershell
git add app/components/ArticleCard.tsx app/components/BriefingApp.tsx tests/rendered-html.test.mjs
git commit -m "feat: add long-form linked article reader"
```

---

### Task 3: Primary tabs, keyword sidebar, and monthly archive view

**Files:**
- Create: `app/components/KeywordNavigation.tsx`
- Modify: `app/components/BriefingApp.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `KEYWORDS`, keyword counts, archive months, filtered archive issues
- Produces: `KeywordNavigation({ keywords, counts, activeKeyword, onSelect })`; primary `today | archive` view state

- [ ] **Step 1: Add failing navigation assertions**

```js
test("renders primary views, keyword navigation, and three archive months", async () => {
  const html = await (await render()).text();
  assert.match(html, /오늘 브리핑/);
  assert.match(html, /월별 아카이브/);
  assert.match(html, /aria-label="키워드별 기사"/);
  assert.match(html, /삼성전자/);
  assert.match(html, /SK하이닉스/);
  assert.match(html, /2026년 7월/);
  assert.match(html, /2026년 6월/);
  assert.match(html, /2026년 5월/);
});
```

- [ ] **Step 2: Build and verify RED**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: FAIL because primary tabs, sidebar label, and archive month buttons are absent.

- [ ] **Step 3: Create keyword navigation**

```tsx
export function KeywordNavigation({
  keywords,
  counts,
  activeKeyword,
  onSelect,
}: KeywordNavigationProps) {
  return (
    <nav className="keyword-nav" aria-label="키워드별 기사">
      <p>관심 키워드</p>
      {keywords.map((keyword) => (
        <button
          key={keyword}
          type="button"
          aria-pressed={activeKeyword === keyword}
          onClick={() => onSelect(keyword)}
        >
          <span>{keyword}</span>
          <small>{counts[keyword] ?? 0}</small>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Add primary and month view state**

```tsx
const [activeView, setActiveView] = useState<"today" | "archive">("today");
const [activeKeyword, setActiveKeyword] = useState("전체");
const archiveIssues = getArchiveIssues() as Issue[];
const archiveMonths = getArchiveMonths(archiveIssues);
const [activeMonth, setActiveMonth] = useState(archiveMonths[0]);
const visibleArchive = filterIssues(archiveIssues, {
  month: activeMonth,
  keyword: activeKeyword,
});
```

Render a `role="tablist"` for the two primary views and a second segmented list for month selection. Both views share `KeywordNavigation`.

- [ ] **Step 5: Add accessible empty state and focus transfer**

When `visibleArchive.length === 0`, render:

```tsx
<div className="empty-state">
  <p>이 월에는 선택한 키워드의 기사가 없습니다.</p>
  <button type="button" onClick={() => setActiveKeyword("전체")}>전체 기사 보기</button>
</div>
```

Place `tabIndex={-1}` on the active view heading and focus it after view or month changes.

- [ ] **Step 6: Build and verify GREEN**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: navigation assertions and prior rendered tests pass.

- [ ] **Step 7: Commit navigation**

```powershell
git add app/components/KeywordNavigation.tsx app/components/BriefingApp.tsx tests/rendered-html.test.mjs
git commit -m "feat: add keyword and monthly archive navigation"
```

---

### Task 4: Apple-style visual system and responsive behavior

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `public/og.png`

**Interfaces:**
- Consumes: `.app-shell`, `.keyword-nav`, `.view-tabs`, `.month-tabs`, `.article-card`, `.primary-link`
- Produces: desktop left navigation, mobile keyword rail, restrained light visual system, updated social metadata asset

- [ ] **Step 1: Add failing structural style assertions**

```js
test("uses the light reader shell and responsive navigation hooks", async () => {
  const html = await (await render()).text();
  assert.match(html, /class="app-shell"/);
  assert.match(html, /class="keyword-nav/);
  assert.match(html, /class="view-tabs"/);
  assert.match(html, /class="reader-column"/);
});
```

- [ ] **Step 2: Build and verify RED**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: FAIL until the new shell class names are rendered.

- [ ] **Step 3: Replace the current dark editorial CSS**

Define the visual tokens:

```css
:root {
  --page: #f5f5f7;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-solid: #ffffff;
  --ink: #1d1d1f;
  --muted: #6e6e73;
  --blue: #0071e3;
  --line: rgba(0, 0, 0, 0.08);
  --shadow: 0 18px 48px rgba(0, 0, 0, 0.08);
  --radius-large: 28px;
  --radius-medium: 18px;
}
```

Apply:

- translucent white sticky header with `backdrop-filter: saturate(180%) blur(20px)`
- 220px sticky sidebar on desktop
- reader width no greater than 820px
- white cards with thin borders and minimal shadow
- system font stack beginning with `-apple-system, BlinkMacSystemFont`
- blue reserved for selected controls and primary links
- no dark full-width panels, teal gradients, or heavy top borders

- [ ] **Step 4: Add responsive behavior**

At `max-width: 759px`:

```css
.app-shell { grid-template-columns: 1fr; }
.keyword-nav {
  position: static;
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
}
.keyword-nav > p { display: none; }
.keyword-nav button { flex: 0 0 auto; min-height: 44px; }
```

Respect `prefers-reduced-motion: reduce` and keep every button/link at least 44px tall.

- [ ] **Step 5: Generate one matching social preview**

Use the ImageGen skill once with exact text:

```text
Morning Signal
뉴스를 읽는 더 나은 아침.
```

Use the light gray, white, black, and Apple-blue palette; reject the result if either text line is incorrect. Save the accepted image to `public/og.png` and retain the existing host-derived Open Graph metadata.

- [ ] **Step 6: Build and verify GREEN**

Run:

```powershell
pnpm build
node --test --test-isolation=none tests/rendered-html.test.mjs
```

Expected: all structural and regression rendering tests pass.

- [ ] **Step 7: Commit the visual redesign**

```powershell
git add app/globals.css app/layout.tsx tests/rendered-html.test.mjs public/og.png
git commit -m "style: redesign Morning Signal as a light reader"
```

---

### Task 5: Documentation and full verification

**Files:**
- Modify: `README.md`
- Modify: `outputs/사용방법.md`

**Interfaces:**
- Consumes: completed archive and reader interface
- Produces: accurate user guidance and a fully verified feature branch ready for controller-owned integration and deployment

- [ ] **Step 1: Update user guidance**

Document these operations:

```md
1. 오늘 브리핑과 월별 아카이브를 상단 탭에서 전환합니다.
2. 왼쪽 키워드를 누르면 현재 화면의 기사만 필터링됩니다.
3. 월별 아카이브에서 2026년 5월, 6월, 7월을 선택합니다.
4. 원문 기사 보기를 누르면 공식 출처가 새 창에서 열립니다.
```

State clearly that the archive is sample briefing data and not live crawling.

- [ ] **Step 2: Run the complete verification command**

Run:

```powershell
pnpm test
pnpm lint
git diff --check
```

Expected: production build succeeds; all domain and rendered tests pass; ESLint and whitespace checks report zero errors.

- [ ] **Step 3: Inspect the final source state**

Run:

```powershell
git status --short
git diff --stat
```

Expected: only planned application, test, documentation, and social preview files are changed.

- [ ] **Step 4: Commit documentation**

```powershell
git add README.md outputs/사용방법.md
git commit -m "docs: explain archive and keyword navigation"
```

- [ ] **Step 5: Hand off the verified branch**

Record the current feature-branch SHA and final test count in the task report. GitHub main integration, exact-source Sites packaging, and private production deployment are controller-owned finalization steps performed only after the whole-branch review approves the implementation.
