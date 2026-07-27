type KeywordNavigationProps = {
  keywords: readonly string[];
  counts: Record<string, number>;
  activeKeyword: string;
  onSelect: (keyword: string) => void;
};

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
