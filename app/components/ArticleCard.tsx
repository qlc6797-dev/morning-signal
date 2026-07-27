export type Source = {
  name: string;
  type: string;
  trust: string;
  url?: string;
};

export type Preference = "interested" | "not-interested";

export type Issue = {
  id: string;
  title: string;
  summary: string;
  deck: string;
  body: string[];
  takeaways: string[];
  primaryUrl?: string;
  publishedAt?: string;
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

type ArticleCardProps = {
  issue: Issue;
  preference?: Preference;
  onPreference: (id: string, value: Preference) => void;
  compact?: boolean;
};

export function formatArticleDate(publishedAt?: string) {
  if (!publishedAt) return "오늘의 브리핑";

  const date = new Date(`${publishedAt}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return "오늘의 브리핑";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function isValidExternalUrl(value?: string) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function ArticleCard({
  issue,
  preference,
  onPreference,
  compact = false,
}: ArticleCardProps) {
  const sentimentLabel = {
    positive: "긍정",
    caution: "주의",
    neutral: "중립",
  }[issue.sentiment];
  const validSources = issue.sources.filter((source) =>
    isValidExternalUrl(source.url),
  );
  const primaryUrl = isValidExternalUrl(issue.primaryUrl) ? issue.primaryUrl : undefined;

  return (
    <article
      className={`article-card issue-card issue-card--${issue.importance}${compact ? " article-card--compact" : ""}`}
    >
      <header className="article-header">
        <time dateTime={issue.publishedAt}>{formatArticleDate(issue.publishedAt)}</time>
        <span>{validSources[0]?.name}</span>
      </header>
      <div className="issue-card__meta">
        <span className={`sentiment sentiment--${issue.sentiment}`}>
          {sentimentLabel}
        </span>
        <span>{issue.impact ?? "흐름 참고"}</span>
        {issue.storyCount > 1 && <span>관련 기사 {issue.storyCount}건 통합</span>}
      </div>
      <h3>{issue.title}</h3>
      <p className="article-deck">{issue.deck}</p>
      {issue.why && (
        <div className="why-box">
          <strong>왜 중요한가</strong>
          <p>{issue.why}</p>
        </div>
      )}
      {!compact && (
        <div className="article-body">
          {issue.body.map((paragraph, index) => <p key={`${issue.id}-body-${index}`}>{paragraph}</p>)}
        </div>
      )}
      {!compact && issue.takeaways.length > 0 && (
        <section className="takeaways" aria-label="핵심 포인트">
          <strong>핵심 포인트</strong>
          <ul>{issue.takeaways.map((item, index) => <li key={`${issue.id}-takeaway-${index}`}>{item}</li>)}</ul>
        </section>
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
      {primaryUrl && (
        <a className="primary-link" href={primaryUrl} target="_blank" rel="noopener noreferrer">
          원문 기사 보기 <span aria-hidden="true">↗</span>
        </a>
      )}
      <div className="source-list" aria-label="출처">
        {validSources.map((source) => (
          <a
            key={`${source.name}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
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
