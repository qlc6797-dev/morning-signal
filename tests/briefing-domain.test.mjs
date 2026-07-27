import assert from "node:assert/strict";
import test from "node:test";

import {
  clusterStories,
  getMorningBriefing,
  getRefreshIssues,
  rankIssues,
  scoreIssue,
} from "../app/lib/briefing.mjs";

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
