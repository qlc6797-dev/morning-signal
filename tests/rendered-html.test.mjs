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

test("server-renders the live semiconductor reader and navigation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(html, /<title>Morning Signal/);
  assert.match(html, /당일 반도체 뉴스/);
  assert.match(html, /기사 최대 30개/);
  assert.match(html, /삼성전자/);
  assert.match(html, /SK하이닉스/);
  assert.match(html, /부동산/);
  assert.match(html, /구리·남양주·하남·왕숙/);
});

test("renders refresh controls and avoids clustered live-news language", async () => {
  const html = await (await render()).text();

  assert.match(html, /아침판 고정/);
  assert.match(html, /최신 뉴스 반영하기/);
  assert.match(html, /1시간마다 자동 업데이트/);
  assert.doesNotMatch(html, /관련 기사 [^<]*건 통합/);
});

test("keeps the original-link and copyright disclaimer visible", async () => {
  const html = await (await render()).text();

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

test("renders the hourly article-by-article semiconductor feed shell", async () => {
  const html = await (await render()).text();

  assert.match(html, /당일 반도체 뉴스/);
  assert.match(html, /당일 기사 최대 30개/);
  assert.match(html, /1시간마다 자동 업데이트/);
  assert.match(html, /data-live-feed="semiconductor"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-pressed="true"[^>]*><span>반도체<\/span>/);
});

test("does not expose starter or excluded product features", async () => {
  const html = await (await render()).text();

  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Starter Project/i);
  assert.doesNotMatch(html, /회원가입|댓글 작성|실시간 거래|투자 예측/);
});
