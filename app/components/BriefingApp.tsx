"use client";

import { useEffect, useMemo, useState } from "react";
import { getRefreshIssues, rankIssues } from "../lib/briefing.mjs";

type Source = {
  name: string;
  type: string;
  trust: string;
  url: string;
};

type Issue = {
  id: string;
  title: string;
  summary: string;
  why?: string;
  analysis?: {
    positive: string;
    negative: string;
    watch: string;
  };
  importance: "core" | "important" | "reference";
  sentiment: "positive" | "caution" | "neutral";
  topic: string;
  companies: string[];
  regions: string[];
  impact?: string;
  sources: Source[];
  storyCount: number;
};

type Briefing = {
  date: string;
  generatedAt: string;
  status: string;
  conclusions: Array<{ topic: string; text: string }>;
  issues: Issue[];
};

type Preference = "interested" | "not-interested";
type PreferenceMap = Record<string, Preference>;

const PREFERENCE_KEY = "news-briefing-preferences-v1";
const filters = ["전체", "AI·글로벌 기술주", "삼성전자·SK하이닉스", "부동산·대출", "구리·남양주·하남·왕숙"];

function matchesFilter(issue: Issue, filter: string) {
  if (filter === "전체") return true;
  if (filter === "AI·글로벌 기술주") {
    return issue.topic === "AI" || issue.topic === "반도체";
  }
  if (filter === "삼성전자·SK하이닉스") {
    return issue.companies.some((company) =>
      ["삼성전자", "SK하이닉스"].includes(company),
    );
  }
  if (filter === "부동산·대출") {
    return issue.topic === "부동산·대출";
  }
  return issue.regions.some((region) =>
    ["구리", "남양주", "하남", "왕숙"].includes(region),
  );
}

function IssueCard({
  issue,
  preference,
  onPreference,
}: {
  issue: Issue;
  preference?: Preference;
  onPreference: (id: string, value: Preference) => void;
}) {
  const sentimentLabel = {
    positive: "긍정",
    caution: "주의",
    neutral: "중립",
  }[issue.sentiment];

  return (
    <article className={`issue-card issue-card--${issue.importance}`}>
      <div className="issue-card__meta">
        <span className={`sentiment sentiment--${issue.sentiment}`}>
          {sentimentLabel}
        </span>
        <span>{issue.impact ?? "흐름 참고"}</span>
        {issue.storyCount > 1 && <span>관련 기사 {issue.storyCount}건 통합</span>}
      </div>
      <h3>{issue.title}</h3>
      <p className="issue-card__summary">{issue.summary}</p>
      {issue.why && (
        <div className="why-box">
          <strong>왜 중요한가</strong>
          <p>{issue.why}</p>
        </div>
      )}
      {issue.analysis && (
        <details className="analysis">
          <summary>상세 분석 펼치기</summary>
          <div className="analysis__grid">
            <p><strong>긍정 시나리오</strong>{issue.analysis.positive}</p>
            <p><strong>주의 시나리오</strong>{issue.analysis.negative}</p>
            <p><strong>앞으로 볼 지표</strong>{issue.analysis.watch}</p>
          </div>
        </details>
      )}
      {(issue.companies.length > 0 || issue.regions.length > 0) && (
        <div className="tags" aria-label="관련 종목과 지역">
          {[...issue.companies, ...issue.regions].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <div className="source-list" aria-label="출처">
        {issue.sources.map((source) => (
          <a
            key={`${source.name}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            <span>{source.type}</span>
            <strong>{source.name}</strong>
            <small>{`신뢰도 ${source.trust}`}</small>
          </a>
        ))}
      </div>
      <div className="feedback" aria-label="추천 반응">
        <button
          type="button"
          className={preference === "interested" ? "is-selected" : ""}
          aria-pressed={preference === "interested"}
          onClick={() => onPreference(issue.id, "interested")}
        >
          관심 있음
        </button>
        <button
          type="button"
          className={preference === "not-interested" ? "is-selected" : ""}
          aria-pressed={preference === "not-interested"}
          onClick={() => onPreference(issue.id, "not-interested")}
        >
          관심 없음
        </button>
      </div>
    </article>
  );
}

export default function BriefingApp({
  initialBriefing,
}: {
  initialBriefing: Briefing;
}) {
  const [activeFilter, setActiveFilter] = useState("전체");
  const [preferences, setPreferences] = useState<PreferenceMap>({});
  const [updates, setUpdates] = useState<Issue[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREFERENCE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PreferenceMap;
        queueMicrotask(() => setPreferences(parsed));
      }
    } catch {
      // Storage can be disabled; the briefing still works without persistence.
    }
  }, []);

  const ranked = useMemo(
    () => rankIssues(initialBriefing.issues, preferences) as Issue[],
    [initialBriefing.issues, preferences],
  );
  const coreIssues = ranked.filter(
    (issue) =>
      issue.importance !== "reference" && matchesFilter(issue, activeFilter),
  );
  const referenceIssues = ranked.filter(
    (issue) =>
      issue.importance === "reference" && matchesFilter(issue, activeFilter),
  );

  function updatePreference(id: string, value: Preference) {
    const next = { ...preferences, [id]: value };
    setPreferences(next);
    try {
      window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(next));
    } catch {
      // Keep device-local interaction available even if persistence is blocked.
    }
  }

  function refreshBriefing() {
    setUpdates(getRefreshIssues() as Issue[]);
    document.getElementById("updates")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${initialBriefing.date}T00:00:00+09:00`));

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Morning Signal 홈">
          <span className="brand__mark">MS</span>
          <span><strong>Morning Signal</strong><small>개인 뉴스 브리핑</small></span>
        </a>
        <button className="refresh-button" type="button" onClick={refreshBriefing}>
          <span aria-hidden="true">↻</span> 최신 뉴스 반영하기
        </button>
      </header>

      <div className="page-shell" id="top">
        <section className="hero">
          <div>
            <p className="eyebrow">DAILY INTELLIGENCE</p>
            <h1>중요한 신호만,<br />아침에 한 번.</h1>
            <p className="hero__copy">
              AI·반도체 투자와 부동산 정책에서 오늘 판단에 필요한 변화만 압축했습니다.
            </p>
          </div>
          <div className="edition">
            <span>{formattedDate}</span>
            <strong>{initialBriefing.status}</strong>
            <small>최초 생성 오전 {initialBriefing.generatedAt}</small>
          </div>
        </section>

        <section className="conclusions" aria-labelledby="conclusion-title">
          <div className="section-heading section-heading--light">
            <p className="eyebrow">30-SECOND VIEW</p>
            <h2 id="conclusion-title">오늘의 핵심 결론 3개</h2>
          </div>
          <ol>
            {initialBriefing.conclusions.map((conclusion, index) => (
              <li key={conclusion.topic} data-conclusion={index + 1}>
                <span>0{index + 1}</span>
                <strong>{conclusion.topic}</strong>
                <p>{conclusion.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <nav className="filters" aria-label="뉴스 주제 필터">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "is-active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </nav>

        <div className="content-grid">
          <section className="main-column" aria-labelledby="must-read-title">
            <div className="section-heading">
              <div><p className="eyebrow">MUST READ</p><h2 id="must-read-title">오늘 꼭 볼 뉴스</h2></div>
              <span>중요도순 · {coreIssues.length}개</span>
            </div>
            <div className="issue-stack">
              {coreIssues.length ? coreIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  preference={preferences[issue.id]}
                  onPreference={updatePreference}
                />
              )) : <p className="empty-state">이 필터에 해당하는 핵심 뉴스가 없습니다.</p>}
            </div>

            <section id="updates" className="updates" aria-labelledby="updates-title">
              <div className="section-heading">
                <div><p className="eyebrow">MANUAL UPDATE</p><h2 id="updates-title">새로 추가된 주요 뉴스</h2></div>
                <span>{updates.length ? `${updates.length}개 추가` : "아침판과 분리"}</span>
              </div>
              {updates.length ? (
                <div className="issue-stack">
                  {updates.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      preference={preferences[issue.id]}
                      onPreference={updatePreference}
                    />
                  ))}
                </div>
              ) : (
                <div className="update-placeholder">
                  아침 브리핑은 그대로 유지됩니다. 상단의 ‘최신 뉴스 반영하기’를 누르면 이후 이슈만 여기에 추가됩니다.
                </div>
              )}
            </section>
          </section>

          <aside className="side-column">
            <section className="priority-panel">
              <p className="eyebrow">MY PRIORITIES</p>
              <h2>내 관심 축</h2>
              <dl>
                <div><dt>최우선 종목</dt><dd>삼성전자·SK하이닉스</dd></div>
                <div><dt>글로벌 흐름</dt><dd>AI·HBM·엔비디아·TSMC</dd></div>
                <div><dt>주거 판단</dt><dd>부동산 정책·대출·집값</dd></div>
                <div><dt>관심 지역</dt><dd>구리·남양주·하남·왕숙</dd></div>
              </dl>
            </section>

            <details className="reference-news" open>
              <summary>
                <span><small>REFERENCE</small>참고 뉴스</span>
                <span>{referenceIssues.length}</span>
              </summary>
              <div className="issue-stack">
                {referenceIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    preference={preferences[issue.id]}
                    onPreference={updatePreference}
                  />
                ))}
              </div>
            </details>
          </aside>
        </div>
      </div>

      <footer>
        <strong>판단을 돕는 브리핑, 판단을 대신하지 않는 정보.</strong>
        <p>기사 전문은 저장하지 않고 공식 원문 링크만 제공합니다. 투자·부동산 의사결정의 참고 자료로 사용하세요.</p>
      </footer>
    </main>
  );
}
