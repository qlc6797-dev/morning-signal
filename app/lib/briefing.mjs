const PRIORITY_COMPANIES = new Set(["삼성전자", "SK하이닉스"]);
const PRIORITY_REGIONS = new Set(["구리", "남양주", "하남", "왕숙"]);

const importanceScore = {
  core: 36,
  important: 22,
  reference: 6,
};

const morningStories = [
  {
    id: "hbm-demand-official",
    clusterKey: "hbm-demand",
    title: "AI 가속기 증설이 HBM 수요의 장기 가시성을 높인다",
    summary:
      "글로벌 클라우드 기업의 AI 인프라 투자가 이어지며 고대역폭메모리 수요가 구조적으로 확대되는 흐름입니다.",
    why:
      "HBM 공급 능력과 수율이 삼성전자·SK하이닉스의 메모리 수익성을 가르는 핵심 변수가 됩니다.",
    analysis: {
      positive: "수요 증가와 제품 믹스 개선은 평균판매가격과 이익률에 긍정적입니다.",
      negative: "고객사 인증 지연이나 공급 과잉 전환은 기대치를 낮출 수 있습니다.",
      watch: "HBM 출하량, 고객 인증, DRAM 가격과 설비투자 계획을 확인하세요.",
    },
    importance: "core",
    sentiment: "positive",
    relevance: 98,
    topic: "반도체",
    companies: ["삼성전자", "SK하이닉스", "엔비디아"],
    regions: [],
    impact: "직접 영향",
    sources: [
      {
        name: "SK하이닉스",
        type: "기업 공식자료",
        trust: "높음",
        url: "https://news.skhynix.co.kr/",
      },
    ],
  },
  {
    id: "hbm-demand-global",
    clusterKey: "hbm-demand",
    title: "글로벌 AI 서버 투자 확대",
    summary: "AI 데이터센터 투자가 메모리와 첨단 패키징 수요를 끌어올리고 있습니다.",
    importance: "core",
    sentiment: "positive",
    relevance: 94,
    topic: "AI",
    companies: ["엔비디아", "TSMC"],
    regions: [],
    sources: [
      {
        name: "Reuters",
        type: "해외 원문",
        trust: "높음",
        url: "https://www.reuters.com/technology/",
      },
    ],
  },
  {
    id: "memory-cycle",
    clusterKey: "memory-cycle",
    title: "메모리 가격 회복과 공급 discipline이 실적 눈높이를 지지",
    summary:
      "메모리 업체들의 공급 조절과 AI 서버 중심의 고부가 수요가 범용 메모리 업황에도 우호적으로 작용하고 있습니다.",
    why:
      "삼성전자와 SK하이닉스의 실적 추정치는 HBM뿐 아니라 범용 DRAM·NAND 가격 변화에도 민감합니다.",
    analysis: {
      positive: "가격 상승이 이어지면 재고평가와 수익성 개선 속도가 빨라질 수 있습니다.",
      negative: "PC·스마트폰 수요가 약하면 범용 제품 회복이 제한될 수 있습니다.",
      watch: "DRAM 고정거래가격, 재고일수, 감산 완화 시점을 살펴보세요.",
    },
    importance: "core",
    sentiment: "positive",
    relevance: 96,
    topic: "관심 종목",
    companies: ["삼성전자", "SK하이닉스", "마이크론"],
    regions: [],
    impact: "직접 영향",
    sources: [
      {
        name: "DART",
        type: "기업 공시",
        trust: "높음",
        url: "https://dart.fss.or.kr/",
      },
      {
        name: "TrendForce",
        type: "시장 조사",
        trust: "보통",
        url: "https://www.trendforce.com/",
      },
    ],
  },
  {
    id: "housing-loan-policy",
    clusterKey: "housing-loan-policy",
    title: "대출 규제 변화가 수도권 실수요자의 구매력을 좌우",
    summary:
      "주택담보대출 한도와 스트레스 DSR 적용 방식은 같은 소득에서도 실제 매수 가능 금액을 크게 바꿀 수 있습니다.",
    why:
      "서울과 경기 동부의 매수 수요, 거래량, 가격 상승 속도에 가장 빠르게 전달되는 정책 변수입니다.",
    analysis: {
      positive: "실수요자 보완책이나 공급 금융 지원은 거래 회복에 도움을 줄 수 있습니다.",
      negative: "한도 축소와 금리 상승이 겹치면 매수 대기와 거래 위축이 나타날 수 있습니다.",
      watch: "금융위원회 발표, 은행권 가산금리, 주담대 승인액을 확인하세요.",
    },
    importance: "core",
    sentiment: "caution",
    relevance: 97,
    topic: "부동산·대출",
    companies: [],
    regions: ["전국", "서울", "구리", "남양주", "하남"],
    impact: "대출 영향",
    sources: [
      {
        name: "금융위원회",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.fsc.go.kr/",
      },
      {
        name: "한국은행",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.bok.or.kr/",
      },
    ],
  },
  {
    id: "wangsuk-supply",
    clusterKey: "wangsuk-supply",
    title: "왕숙 공급 일정과 교통 계획이 경기 동부 기대를 형성",
    summary:
      "남양주 왕숙의 공급 일정과 광역교통 계획은 인근 구리·하남의 청약 수요와 중장기 주거 선호에 영향을 줍니다.",
    why:
      "관심 지역에서는 전국 평균보다 실제 입주 시점과 교통 개통의 확실성이 더 중요한 판단 기준입니다.",
    importance: "important",
    sentiment: "neutral",
    relevance: 91,
    topic: "관심 지역",
    companies: [],
    regions: ["남양주", "왕숙", "구리", "하남"],
    impact: "실거주 영향",
    sources: [
      {
        name: "국토교통부",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.molit.go.kr/",
      },
      {
        name: "LH",
        type: "공공기관",
        trust: "높음",
        url: "https://www.lh.or.kr/",
      },
    ],
  },
  {
    id: "ai-capex-reference",
    clusterKey: "ai-capex-reference",
    title: "빅테크 AI 투자 확대, 전력과 네트워크 병목도 함께 부각",
    summary:
      "AI 투자는 반도체 수요를 늘리지만 전력·냉각·네트워크 제약이 실제 증설 속도를 제한할 수 있습니다.",
    importance: "reference",
    sentiment: "neutral",
    relevance: 76,
    topic: "AI",
    companies: ["Microsoft", "Google", "Amazon"],
    regions: [],
    impact: "간접 영향",
    sources: [
      {
        name: "기업 실적발표",
        type: "기업 공식자료",
        trust: "높음",
        url: "https://www.sec.gov/edgar/search/",
      },
    ],
  },
  {
    id: "housing-outlook-reference",
    clusterKey: "housing-outlook-reference",
    title: "서울·수도권 매물과 거래량이 가격 방향의 선행 신호",
    summary:
      "신고가 기사보다 실제 거래량, 매물 감소 속도, 지역별 전세가 흐름을 함께 보는 것이 유용합니다.",
    importance: "reference",
    sentiment: "neutral",
    relevance: 79,
    topic: "부동산·대출",
    companies: [],
    regions: ["서울", "수도권"],
    impact: "집값 영향",
    sources: [
      {
        name: "한국부동산원",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.reb.or.kr/",
      },
    ],
  },
];

const refreshStories = [
  {
    id: "refresh-export-policy",
    clusterKey: "refresh-export-policy",
    title: "반도체 수출 규제 후속 논의, 공급망 영향 점검 필요",
    summary:
      "규제 대상과 시행 시점에 따라 AI 가속기 판매와 메모리 수요 경로가 달라질 수 있어 공식 문안 확인이 필요합니다.",
    why:
      "삼성전자·SK하이닉스에는 최종 고객 수요와 중국 사업 불확실성으로 연결될 수 있습니다.",
    importance: "important",
    sentiment: "caution",
    relevance: 90,
    topic: "반도체",
    companies: ["삼성전자", "SK하이닉스", "엔비디아"],
    regions: [],
    impact: "간접 영향",
    sources: [
      {
        name: "미국 상무부",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.commerce.gov/",
      },
    ],
  },
  {
    id: "refresh-housing-rate",
    clusterKey: "refresh-housing-rate",
    title: "은행권 주담대 금리 변화, 실수요 월 상환액 재계산 필요",
    summary:
      "기준금리가 같아도 은행별 가산금리와 우대 조건에 따라 실제 상환 부담이 달라질 수 있습니다.",
    why:
      "관심 지역 매수 판단에서는 기사상 평균 금리보다 본인 조건의 승인 한도와 월 상환액이 중요합니다.",
    importance: "important",
    sentiment: "neutral",
    relevance: 88,
    topic: "부동산·대출",
    companies: [],
    regions: ["구리", "남양주", "하남", "왕숙"],
    impact: "대출 영향",
    sources: [
      {
        name: "은행연합회",
        type: "공공기관",
        trust: "높음",
        url: "https://portal.kfb.or.kr/",
      },
    ],
  },
];

function uniqueBy(items, keyOf) {
  return [...new Map(items.map((item) => [keyOf(item), item])).values()];
}

export function clusterStories(stories) {
  const clusters = new Map();

  for (const story of stories) {
    const key = story.clusterKey ?? story.id;
    const current = clusters.get(key);

    if (!current) {
      clusters.set(key, {
        ...story,
        companies: [...(story.companies ?? [])],
        regions: [...(story.regions ?? [])],
        sources: [...(story.sources ?? [])],
        storyCount: 1,
        storyIds: [story.id],
      });
      continue;
    }

    clusters.set(key, {
      ...current,
      importance:
        importanceScore[story.importance] > importanceScore[current.importance]
          ? story.importance
          : current.importance,
      relevance: Math.max(current.relevance ?? 0, story.relevance ?? 0),
      companies: uniqueBy(
        [...current.companies, ...(story.companies ?? [])],
        (company) => company,
      ),
      regions: uniqueBy(
        [...current.regions, ...(story.regions ?? [])],
        (region) => region,
      ),
      sources: uniqueBy(
        [...current.sources, ...(story.sources ?? [])],
        (source) => `${source.name}:${source.url ?? ""}`,
      ),
      storyCount: current.storyCount + 1,
      storyIds: [...current.storyIds, story.id],
    });
  }

  return [...clusters.values()];
}

export function scoreIssue(issue, preferences = {}) {
  const directCompanyBoost = (issue.companies ?? []).some((company) =>
    PRIORITY_COMPANIES.has(company),
  )
    ? 24
    : 0;
  const regionalBoost = (issue.regions ?? []).some((region) =>
    PRIORITY_REGIONS.has(region),
  )
    ? 16
    : 0;
  const preferenceBoost =
    preferences[issue.id] === "interested"
      ? 5
      : preferences[issue.id] === "not-interested"
        ? -5
        : 0;

  return (
    (issue.relevance ?? 0) +
    (importanceScore[issue.importance] ?? 0) +
    directCompanyBoost +
    regionalBoost +
    preferenceBoost
  );
}

export function rankIssues(issues, preferences = {}) {
  return [...issues].sort(
    (left, right) =>
      scoreIssue(right, preferences) - scoreIssue(left, preferences),
  );
}

export function getMorningBriefing() {
  const issues = rankIssues(clusterStories(morningStories), {});

  return {
    date: "2026-07-27",
    generatedAt: "06:30",
    status: "아침판 고정",
    conclusions: [
      {
        topic: "AI·반도체",
        text: "AI 인프라 투자가 이어지는 동안 HBM 수요와 고객 인증이 가장 중요한 실적 신호입니다.",
      },
      {
        topic: "삼성전자·SK하이닉스",
        text: "고부가 메모리 비중과 범용 DRAM 가격을 함께 봐야 두 종목의 실적 눈높이를 판단할 수 있습니다.",
      },
      {
        topic: "부동산·대출",
        text: "수도권 집값 기사보다 대출 가능액, 거래량, 왕숙 공급·교통 일정의 확실성을 먼저 확인하세요.",
      },
    ],
    issues,
  };
}

export function getRefreshIssues() {
  return rankIssues(clusterStories(refreshStories), {});
}
