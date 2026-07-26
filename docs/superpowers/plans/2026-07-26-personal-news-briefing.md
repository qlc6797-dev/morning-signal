# Personal News Briefing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive personal morning news briefing MVP that prioritizes AI investing, Samsung Electronics, SK hynix, housing policy, loans, and the selected eastern Gyeonggi regions.

**Architecture:** A vinext single-page application renders deterministic briefing fixtures through a small domain module. A client component owns filters, expandable analysis, refresh additions, and device-local preference signals; server-rendered HTML keeps the first view fast and testable.

**Tech Stack:** TypeScript, React 19, Next-compatible vinext, CSS, Node test runner, Cloudflare Workers deployment

## Global Constraints

- Personal use only; no authentication or multi-user behavior.
- Mobile-first with a useful desktop layout.
- Morning briefing remains fixed; manual refresh appends a separate update section.
- Core conclusions count is exactly three.
- Core and reference news remain visibly separate.
- Samsung Electronics and SK hynix receive highest investment priority.
- Housing policy, loans, Guri, Namyangju, Hanam, and Wangsuk are explicit priorities.
- Source type and trust level are visible.
- Duplicate stories form one issue cluster.
- Summary depth follows importance.
- Interest feedback is a secondary local signal and never removes configured topics.
- Exclude email, push, saves, notes, community, and real-time trading.

---

### Task 1: Briefing domain model and ranking

**Files:**
- Create: `app/lib/briefing.ts`
- Create: `tests/briefing-domain.test.mjs`

**Interfaces:**
- Produces: `clusterStories(stories)`, `rankIssues(issues, preferences)`, `getMorningBriefing()`, `getRefreshIssues()`
- Consumes: none

- [ ] **Step 1: Write failing domain tests**

```js
test("clusters duplicate stories into one issue", () => {
  const result = clusterStories([
    { id: "a", clusterKey: "hbm", title: "A" },
    { id: "b", clusterKey: "hbm", title: "B" },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].storyCount, 2);
});
```

- [ ] **Step 2: Run tests and confirm the module is missing**

Run: `node --test tests/briefing-domain.test.mjs`
Expected: FAIL because `app/lib/briefing.js` does not exist.

- [ ] **Step 3: Implement immutable fixtures, clustering, and scoring**

```ts
export function rankIssues(issues: Issue[], preferences: PreferenceMap) {
  return [...issues].sort((a, b) => scoreIssue(b, preferences) - scoreIssue(a, preferences));
}
```

- [ ] **Step 4: Run the domain tests**

Run: `node --test tests/briefing-domain.test.mjs`
Expected: PASS for clustering, direct-priority ranking, regional ranking, feedback weighting, and refresh separation.

- [ ] **Step 5: Commit the domain slice**

Run: `git add app/lib/briefing.ts tests/briefing-domain.test.mjs && git commit -m "feat: add briefing domain model"`

### Task 2: Responsive briefing interface

**Files:**
- Create: `app/components/BriefingApp.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`
- Modify: `package.json`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `getMorningBriefing()`, `rankIssues()`, `getRefreshIssues()`
- Produces: accessible server-rendered briefing and client interactions

- [ ] **Step 1: Replace starter assertions with failing product assertions**

```js
assert.match(html, /오늘의 핵심 결론/);
assert.match(html, /삼성전자·SK하이닉스/);
assert.match(html, /부동산·대출/);
assert.match(html, /참고 뉴스/);
```

- [ ] **Step 2: Build and run rendering tests to confirm failure**

Run: `pnpm exec vinext build && node --test tests/rendered-html.test.mjs`
Expected: FAIL because the starter page does not contain the briefing.

- [ ] **Step 3: Implement the page and design system**

```tsx
export default function Home() {
  return <BriefingApp initialBriefing={getMorningBriefing()} />;
}
```

- [ ] **Step 4: Rebuild and run rendering tests**

Run: `pnpm exec vinext build && node --test tests/rendered-html.test.mjs`
Expected: PASS with Korean metadata, three conclusions, priority topics, source badges, and separate reference news.

- [ ] **Step 5: Commit the interface slice**

Run: `git add app package.json tests/rendered-html.test.mjs && git commit -m "feat: build mobile news briefing interface"`

### Task 3: Local learning and manual refresh

**Files:**
- Modify: `app/components/BriefingApp.tsx`
- Modify: `app/lib/briefing.ts`
- Modify: `tests/briefing-domain.test.mjs`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: `rankIssues`, `getRefreshIssues`
- Produces: persisted `news-briefing-preferences-v1` preference map and appended update section

- [ ] **Step 1: Add failing behavior tests for feedback scoring and update isolation**

```js
assert.ok(scoreIssue(issue, { [issue.id]: "interested" }) > scoreIssue(issue, {}));
assert.ok(getRefreshIssues().every((issue) => !morningIds.has(issue.id)));
```

- [ ] **Step 2: Run tests and verify expected failures**

Run: `node --test tests/briefing-domain.test.mjs`
Expected: FAIL for the missing feedback and refresh contracts.

- [ ] **Step 3: Implement preference persistence and append-only refresh UI**

```tsx
localStorage.setItem(PREFERENCE_KEY, JSON.stringify(nextPreferences));
setUpdates(getRefreshIssues());
```

- [ ] **Step 4: Run all tests**

Run: `pnpm exec vinext build && node --test tests/briefing-domain.test.mjs tests/rendered-html.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit interaction behavior**

Run: `git add app tests && git commit -m "feat: add local preference learning and refresh"`

### Task 4: Usage, deployment, and final verification

**Files:**
- Modify: `README.md`
- Create: `outputs/사용방법.md`

**Interfaces:**
- Consumes: completed application
- Produces: local usage and Sites deployment instructions

- [ ] **Step 1: Document user-facing operation and developer deployment**

```md
1. 오늘의 핵심 결론을 먼저 읽습니다.
2. 관심 주제로 필터링합니다.
3. 최신 뉴스 반영하기를 누르면 아침판 아래에 추가 이슈가 나타납니다.
```

- [ ] **Step 2: Run complete verification**

Run: `pnpm exec vinext build && node --test tests/briefing-domain.test.mjs tests/rendered-html.test.mjs && pnpm exec eslint . --ignore-pattern dist --ignore-pattern .next`
Expected: zero failures and zero lint errors.

- [ ] **Step 3: Inspect requirements and repository state**

Run: `git status --short && git diff --check`
Expected: only intended project files are changed and no whitespace errors exist.

- [ ] **Step 4: Commit documentation**

Run: `git add README.md outputs/사용방법.md docs && git commit -m "docs: add news briefing usage and deployment guide"`

