import assert from "node:assert/strict";
import test from "node:test";

import {
  clusterStories,
  filterIssues,
  getArchiveIssues,
  getArchiveMonths,
  getKeywordCounts,
  getMorningBriefing,
  getRefreshIssues,
  rankIssues,
  scoreIssue,
} from "../app/lib/briefing.mjs";
import { formatBriefingDate } from "../app/lib/date.mjs";

test("formats briefing dates in Korea time so server and mobile hydrate identically", () => {
  assert.equal(formatBriefingDate("2026-08-18"), "2026년 8월 18일 화");
});

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

test("clusters duplicate stories into one issue without losing source counts", () => {
  const clustered = clusterStories([
    {
      id: "hbm-official",
      clusterKey: "hbm-demand",
      title: "HBM 수요 확대",
      sources: [{ name: "SK하이닉스", type: "기업 공식자료", trust: "높음" }],
    },
    {
      id: "hbm-press",
      clusterKey: "hbm-demand",
      title: "HBM 수요 확대 전망",
      sources: [{ name: "Reuters", type: "해외 원문", trust: "높음" }],
    },
  ]);

  assert.equal(clustered.length, 1);
  assert.equal(clustered[0].storyCount, 2);
  assert.deepEqual(
    clustered[0].sources.map((source) => source.name),
    ["SK하이닉스", "Reuters"],
  );
});

test("ranks direct Samsung and SK hynix impact above a generic AI story", () => {
  const ranked = rankIssues(
    [
      {
        id: "generic-ai",
        importance: "important",
        relevance: 78,
        companies: ["Microsoft"],
        regions: [],
      },
      {
        id: "memory-direct",
        importance: "important",
        relevance: 78,
        companies: ["삼성전자", "SK하이닉스"],
        regions: [],
      },
    ],
    {},
  );

  assert.equal(ranked[0].id, "memory-direct");
});

test("prioritizes selected eastern Gyeonggi regions within housing coverage", () => {
  const ranked = rankIssues(
    [
      {
        id: "nationwide-housing",
        importance: "important",
        relevance: 80,
        companies: [],
        regions: ["전국"],
      },
      {
        id: "wangsuk-housing",
        importance: "important",
        relevance: 80,
        companies: [],
        regions: ["남양주", "왕숙"],
      },
    ],
    {},
  );

  assert.equal(ranked[0].id, "wangsuk-housing");
});

test("uses feedback as a secondary score without overpowering configured priorities", () => {
  const configured = {
    id: "configured",
    importance: "core",
    relevance: 98,
    companies: ["삼성전자"],
    regions: [],
  };
  const generic = {
    id: "generic",
    importance: "reference",
    relevance: 50,
    companies: [],
    regions: [],
  };

  assert.ok(
    scoreIssue(generic, { generic: "interested" }) > scoreIssue(generic, {}),
  );
  assert.equal(
    rankIssues(
      [configured, generic],
      { configured: "not-interested", generic: "interested" },
    )[0].id,
    "configured",
  );
});

test("keeps manual refresh issues separate from the fixed morning briefing", () => {
  const morningIds = new Set(
    getMorningBriefing().issues.map((issue) => issue.id),
  );
  const refresh = getRefreshIssues();

  assert.ok(refresh.length > 0);
  assert.ok(refresh.every((issue) => !morningIds.has(issue.id)));
});
