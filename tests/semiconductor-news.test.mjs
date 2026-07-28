import assert from "node:assert/strict";
import test from "node:test";

import {
  createSemiconductorNewsResponse,
  normalizeDailyArticles,
  parseNewsRss,
} from "../app/lib/semiconductor-news.mjs";

test("parses article fields and cleans XML and HTML markup", () => {
  const xml = `<?xml version="1.0"?><rss><channel><item>
    <title>HBM &amp; 메모리 투자 확대</title>
    <link>https://example.com/hbm?a=1&amp;b=2</link>
    <description><![CDATA[<b>공급사가</b> 신규 투자 계획을 발표했습니다.]]></description>
    <pubDate>Tue, 28 Jul 2026 02:20:00 GMT</pubDate>
    <News:Source>테스트경제</News:Source>
  </item></channel></rss>`;

  assert.deepEqual(parseNewsRss(xml), [{
    title: "HBM & 메모리 투자 확대",
    url: "https://example.com/hbm?a=1&b=2",
    description: "공급사가 신규 투자 계획을 발표했습니다.",
    publishedAt: "Tue, 28 Jul 2026 02:20:00 GMT",
    source: "테스트경제",
  }]);
});

test("keeps only articles published today in Asia/Seoul", () => {
  const now = new Date("2026-07-28T04:00:00.000Z");
  const articles = normalizeDailyArticles([
    {
      title: "오늘 기사",
      url: "https://example.com/today",
      description: "오늘 설명",
      publishedAt: "Mon, 27 Jul 2026 23:30:00 GMT",
      source: "오늘신문",
    },
    {
      title: "어제 기사",
      url: "https://example.com/yesterday",
      description: "어제 설명",
      publishedAt: "Mon, 27 Jul 2026 14:30:00 GMT",
      source: "어제신문",
    },
  ], { now });

  assert.deepEqual(articles.map((article) => article.title), ["오늘 기사"]);
});

test("sorts newest first, limits to 30, and never clusters similar articles", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");
  const items = Array.from({ length: 32 }, (_, index) => ({
    title: index === 1 ? "HBM 공급 확대 전망" : `반도체 기사 ${index}`,
    url: `https://example.com/article-${index}`,
    description: `기사 ${index}의 개별 설명`,
    publishedAt: new Date(Date.UTC(2026, 6, 28, 11, 59 - index)).toUTCString(),
    source: `언론사 ${index}`,
  }));
  items[2].title = "HBM 공급 확대 전망 후속";
  items.push({ ...items[0] });

  const articles = normalizeDailyArticles(items, { now, limit: 30 });

  assert.equal(articles.length, 30);
  assert.equal(articles[0].url, "https://example.com/article-0");
  assert.ok(articles.some((article) => article.title === "HBM 공급 확대 전망"));
  assert.ok(articles.some((article) => article.title === "HBM 공급 확대 전망 후속"));
  assert.equal(articles.filter((article) => article.url === items[0].url).length, 1);
});

test("rejects unsafe links and preserves an honest missing-summary state", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");
  const articles = normalizeDailyArticles([
    {
      title: "안전한 기사",
      url: "https://example.com/safe",
      description: "",
      publishedAt: "Tue, 28 Jul 2026 08:00:00 GMT",
      source: "안전신문",
    },
    {
      title: "위험한 기사",
      url: "javascript:alert(1)",
      description: "표시하면 안 됩니다.",
      publishedAt: "Tue, 28 Jul 2026 09:00:00 GMT",
      source: "위험신문",
    },
  ], { now });

  assert.equal(articles.length, 1);
  assert.equal(articles[0].summary, null);
});

test("serves the live feed with a one-hour shared cache", async () => {
  let bypassCache;
  const response = await createSemiconductorNewsResponse(
    new Request("https://morning-signal.test/api/semiconductor-news"),
    {
      getFeed: async (options) => {
        bypassCache = options.bypassCache;
        return {
          articles: [{ id: "one", title: "개별 기사" }],
          updatedAt: "2026-07-28T04:00:00.000Z",
          date: "2026-07-28",
          status: "ok",
        };
      },
    },
  );

  assert.equal(bypassCache, false);
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=300",
  );
  assert.equal((await response.json()).articles.length, 1);
});

test("manual refresh bypasses upstream cache", async () => {
  let bypassCache;
  const response = await createSemiconductorNewsResponse(
    new Request("https://morning-signal.test/api/semiconductor-news?refresh=123"),
    {
      getFeed: async (options) => {
        bypassCache = options.bypassCache;
        return {
          articles: [],
          updatedAt: "2026-07-28T04:00:00.000Z",
          date: "2026-07-28",
          status: "ok",
        };
      },
    },
  );

  assert.equal(bypassCache, true);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("returns a stable unavailable state when every news source fails", async () => {
  const response = await createSemiconductorNewsResponse(
    new Request("https://morning-signal.test/api/semiconductor-news"),
    { getFeed: async () => { throw new Error("offline"); } },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "unavailable");
  assert.deepEqual(body.articles, []);
});
