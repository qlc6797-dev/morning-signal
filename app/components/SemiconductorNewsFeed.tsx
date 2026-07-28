"use client";

import { useEffect, useState } from "react";

type SemiconductorArticle = {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  publishedAt: string;
  url: string;
};

type FeedResponse = {
  articles: SemiconductorArticle[];
  updatedAt: string;
  date: string;
  status: "ok" | "partial" | "unavailable";
};

type SemiconductorNewsFeedProps = {
  refreshToken: number;
  onCountChange: (count: number) => void;
};

function formatKoreaTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시간 미상";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function SemiconductorNewsFeed({
  refreshToken,
  onCountChange,
}: SemiconductorNewsFeedProps) {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load(bypassCache = false) {
      setLoading(true);
      setError(false);
      try {
        const suffix = bypassCache ? `?refresh=${Date.now()}` : "";
        const response = await fetch(`/api/semiconductor-news${suffix}`);
        if (!response.ok) throw new Error(`Feed returned ${response.status}`);
        const nextFeed = await response.json() as FeedResponse;
        if (cancelled) return;
        setFeed(nextFeed);
        onCountChange(nextFeed.articles.length);
        setError(nextFeed.status === "unavailable");
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(refreshToken > 0);
    const interval = window.setInterval(() => void load(false), 60 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [onCountChange, refreshToken]);

  const updatedAt = feed?.updatedAt ? formatKoreaTime(feed.updatedAt) : null;

  return (
    <section className="live-news" data-live-feed="semiconductor" aria-labelledby="live-news-title">
      <div className="section-heading live-news__heading">
        <div>
          <p className="eyebrow">LIVE · ARTICLE BY ARTICLE</p>
          <h2 id="live-news-title">당일 반도체 뉴스</h2>
          <p>당일 기사 최대 30개 · 1시간마다 자동 업데이트</p>
        </div>
        <span>{feed ? `${feed.articles.length}개 기사` : "불러오는 중"}</span>
      </div>

      <div className="live-news__status" aria-live="polite">
        {loading
          ? "최신 기사를 확인하고 있습니다."
          : error
            ? "뉴스 수집이 지연되고 있습니다. 잠시 후 다시 확인해 주세요."
            : `마지막 업데이트 ${updatedAt}`}
      </div>

      {!loading && !error && feed?.articles.length === 0 && (
        <div className="empty-state">
          오늘 게시된 반도체 기사가 아직 없습니다. 지난 날짜 기사로 채우지 않습니다.
        </div>
      )}

      {feed && feed.articles.length > 0 && (
        <div className="live-news__list">
          {feed.articles.map((article, index) => (
            <article className="live-article" data-live-article key={article.id}>
              <div className="live-article__meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{article.source}</strong>
                <time dateTime={article.publishedAt}>{formatKoreaTime(article.publishedAt)}</time>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary ?? "출처에서 제공한 기사 요약이 없습니다."}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                원문 기사 보기 <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
