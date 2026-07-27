import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the morning briefing hierarchy and priority topics", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(html, /<title>Morning Signal/);
  assert.match(html, /오늘의 핵심 결론 3개/);
  assert.equal((html.match(/data-conclusion=/g) ?? []).length, 3);
  assert.match(html, /오늘 꼭 볼 뉴스/);
  assert.match(html, /삼성전자·SK하이닉스/);
  assert.match(html, /부동산·대출/);
  assert.match(html, /구리·남양주·하남·왕숙/);
  assert.match(html, /참고 뉴스/);
});

test("renders trustworthy sources and separates the fixed edition from updates", async () => {
  const html = await (await render()).text();

  assert.match(html, /아침판 고정/);
  assert.match(html, /최신 뉴스 반영하기/);
  assert.match(html, /새로 추가된 주요 뉴스/);
  assert.match(html, /정부·공공기관/);
  assert.match(html, /기업 공식자료/);
  assert.match(html, /신뢰도 높음/);
  assert.match(html, /관심 있음/);
  assert.match(html, /관심 없음/);
});

test("renders long briefing copy and direct original links", async () => {
  const html = await (await render()).text();

  assert.match(html, /article-deck/);
  assert.match(html, /article-body/);
  assert.match(html, /가속기 증설의 핵심은 단기 주문량보다 고객사의 램프업 계획이 메모리 공급 계약으로 이어지는 속도입니다/);
  assert.match(html, /핵심 포인트/);
  assert.match(html, /HBM 출하량과 고객 인증 일정을 함께 확인하세요/);
  assert.match(html, /class="why-box"/);
  assert.match(html, /왜 중요한가/);
  assert.match(
    html,
    /<a class="primary-link" href="https:\/\/news\.skhynix\.co\.kr\/" target="_blank" rel="noopener noreferrer">/,
  );
  assert.equal((html.match(/class="primary-link"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.match(html, /기사 전문은 저장하지 않고 공식 원문 링크만 제공합니다/);
});

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

test("uses the light reader shell and responsive navigation hooks", async () => {
  const html = await (await render()).text();
  assert.match(html, /class="briefing-workspace app-shell"/);
  assert.match(html, /class="keyword-nav"/);
  assert.match(html, /class="primary-tabs view-tabs"/);
  assert.match(html, /class="briefing-content reader-column"/);
  assert.match(html, /class="archive-months month-tabs"/);
});

test("does not expose starter or excluded product features", async () => {
  const html = await (await render()).text();

  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Starter Project/i);
  assert.doesNotMatch(html, /회원가입|댓글 작성|실시간 거래|투자 예측/);
});
