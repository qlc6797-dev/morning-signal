const PRIORITY_COMPANIES = new Set(["삼성전자", "SK하이닉스"]);
const PRIORITY_REGIONS = new Set(["구리", "남양주", "하남", "왕숙"]);

export const KEYWORDS = [
  "전체",
  "AI",
  "반도체",
  "삼성전자",
  "SK하이닉스",
  "부동산",
  "대출",
  "구리·남양주·하남·왕숙",
];

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
    deck: "증설 뉴스보다 중요한 것은 고객사의 AI 서버 확장이 실제 HBM 공급 계약과 출하로 전환되는 속도입니다.",
    body: [
      "가속기 증설의 핵심은 단기 주문량보다 고객사의 램프업 계획이 메모리 공급 계약으로 이어지는 속도입니다.",
      "삼성전자와 SK하이닉스는 생산능력 확대 자체보다 인증을 통과한 제품 비중과 안정적인 수율로 수익성을 가늠해야 합니다.",
    ],
    takeaways: [
      "HBM 출하량과 고객 인증 일정을 함께 확인하세요.",
      "공급 확대가 가격 경쟁보다 고부가 제품 비중 상승으로 이어지는지 점검하세요.",
    ],
    primaryUrl: "https://news.skhynix.co.kr/",
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
    deck: "AI 인프라 지출은 메모리뿐 아니라 패키징과 전력 설비의 병목을 함께 확인해야 하는 신호입니다.",
    body: [
      "클라우드 사업자의 투자 계획은 가속기 조달과 데이터센터 가동 시점에 따라 부품 수요로 전달되는 속도가 달라집니다.",
      "메모리 공급사는 고객별 증설 시차를 고려해 단일 발표보다 분기별 출하 흐름을 비교하는 편이 유용합니다.",
    ],
    takeaways: [
      "클라우드 기업의 설비투자 가이던스를 분기별로 비교하세요.",
      "가속기 출하와 HBM 공급의 시차를 구분해 보세요.",
    ],
    primaryUrl: "https://www.reuters.com/technology/",
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
    deck: "HBM 호조가 전체 실적으로 이어지는지는 범용 제품 가격과 재고 흐름이 함께 결정합니다.",
    body: [
      "고부가 AI 메모리 수요가 강해도 범용 DRAM과 NAND의 가격 반등이 약하면 전사 이익 추정치는 제한될 수 있습니다.",
      "공급사의 감산 완화 시점과 재고일수 변화는 업황 회복이 지속 가능한지 판단하는 보조 지표입니다.",
    ],
    takeaways: [
      "HBM과 범용 메모리의 가격 흐름을 분리해 보세요.",
      "재고일수와 감산 계획 변화가 회복 속도를 확인하는 단서입니다.",
    ],
    primaryUrl: "https://dart.fss.or.kr/",
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
    deck: "정책 headline보다 개인 조건에서 달라지는 승인 한도와 월 상환액이 실수요 판단의 출발점입니다.",
    body: [
      "대출 규정은 기준금리뿐 아니라 스트레스 금리, 만기, 소득 인정 방식에 따라 실제 한도를 다르게 만들 수 있습니다.",
      "수도권 매수 판단에서는 관심 단지의 가격 변화와 함께 은행별 사전 한도와 상환 부담을 다시 계산해야 합니다.",
    ],
    takeaways: [
      "정책 발표 뒤에는 본인 조건의 승인 한도를 다시 확인하세요.",
      "거래량과 월 상환액을 함께 보며 매수 여력을 판단하세요.",
    ],
    primaryUrl: "https://www.fsc.go.kr/",
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
    deck: "관심 지역의 주거 판단은 공급 발표보다 입주·교통 일정의 확실성과 생활권 연결성을 먼저 봐야 합니다.",
    body: [
      "왕숙의 공급 물량은 주변 선택지를 늘리지만 청약과 입주 시점이 멀면 단기 매매 수요에 미치는 영향은 제한적일 수 있습니다.",
      "교통 계획은 발표 여부보다 개통 시점과 환승 편의가 실제 생활권 선호를 바꾸는지 확인하는 것이 중요합니다.",
    ],
    takeaways: [
      "공급 공고와 실제 입주 시점을 구분해서 확인하세요.",
      "교통 계획은 개통 가능성과 생활권 연결성을 함께 점검하세요.",
    ],
    primaryUrl: "https://www.molit.go.kr/",
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
    deck: "AI 투자 규모만으로는 부족하며 전력과 네트워크 병목이 서버 증설 속도를 늦출 수 있습니다.",
    body: [
      "대형 기술기업의 투자 계획은 반도체 수요의 방향을 보여주지만, 전력 확보와 냉각 설비 조달은 실제 가동 시점의 변수입니다.",
      "참고 뉴스로는 자본지출 규모보다 병목 해소 일정이 투자 계획과 맞물리는지를 보는 편이 좋습니다.",
    ],
    takeaways: [
      "전력과 냉각 인프라가 서버 증설의 제약인지 확인하세요.",
      "자본지출 발표와 실제 가동 일정의 차이를 점검하세요.",
    ],
    primaryUrl: null,
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
    deck: "가격 headline보다 거래량과 전세가의 동행 여부가 수도권 주택 흐름을 읽는 데 더 유용합니다.",
    body: [
      "신고가 사례는 시장의 일부를 보여줄 수 있으므로 매물 소진 속도와 거래량이 같은 방향인지 함께 확인해야 합니다.",
      "지역별 전세가가 매매가를 뒷받침하는지 살피면 단기 가격 변화가 실수요인지 판단하는 데 도움이 됩니다.",
    ],
    takeaways: [
      "매매가와 거래량이 함께 움직이는지 보세요.",
      "전세가 흐름이 실수요의 뒷받침인지 확인하세요.",
    ],
    primaryUrl: "javascript:alert('invalid-link')",
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
        url: "javascript:alert('invalid-link')",
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
    deck: "수출 규제는 발표 제목보다 적용 품목과 시행 시점이 공급망 영향을 가르는 기준입니다.",
    body: [
      "규제 후속 논의는 대상 품목과 예외 조건이 확정되기 전까지 고객사의 조달 계획을 보수적으로 만들 수 있습니다.",
      "메모리 업체에는 최종 수요 위축보다 고객 재고 조정과 주문 시점 변화가 먼저 나타날 수 있습니다.",
    ],
    takeaways: [
      "공식 문안에서 적용 품목과 시행일을 확인하세요.",
      "고객 재고와 주문 시점 변화를 수요 신호로 보세요.",
    ],
    primaryUrl: "https://www.commerce.gov/",
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
    deck: "기준금리보다 은행별 가산금리와 우대 조건이 실제 월 상환액을 더 크게 바꿀 수 있습니다.",
    body: [
      "은행권의 대출 금리는 같은 기준금리 환경에서도 상품별 가산금리와 우대 조건에 따라 차이가 납니다.",
      "관심 지역의 매수 계획은 기사상 평균 금리 대신 본인 조건의 한도와 상환액을 다시 계산해 보는 것이 안전합니다.",
    ],
    takeaways: [
      "은행별 가산금리와 우대 조건을 비교하세요.",
      "월 상환액과 승인 한도를 함께 재계산하세요.",
    ],
    primaryUrl: "https://portal.kfb.or.kr/",
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

const archiveStories = [
  {
    id: "archive-july-hbm",
    clusterKey: "archive-july-hbm",
    publishedAt: "2026-07-18",
    title: "HBM 공급 계획을 점검하는 7월 샘플 브리핑",
    summary: "AI 서버용 메모리 수요와 공급 계획을 검토하는 예시 항목입니다.",
    deck: "AI 메모리 투자 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://news.skhynix.co.kr/",
    importance: "core",
    sentiment: "positive",
    relevance: 97,
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
    id: "archive-july-wangsuk",
    clusterKey: "archive-july-wangsuk",
    publishedAt: "2026-07-09",
    title: "왕숙 교통 계획을 검토하는 7월 샘플 브리핑",
    summary: "경기 동부 공급 및 교통 계획을 검토하는 예시 항목입니다.",
    deck: "관심 지역 실거주 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://www.molit.go.kr/",
    importance: "important",
    sentiment: "neutral",
    relevance: 90,
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
    ],
  },
  {
    id: "archive-june-samsung",
    clusterKey: "archive-june-samsung",
    publishedAt: "2026-06-18",
    title: "삼성전자 메모리 전략을 검토하는 6월 샘플 브리핑",
    summary: "AI 메모리 투자 판단에 활용할 수 있는 예시 항목입니다.",
    deck: "AI 메모리 투자 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://www.samsung.com/sec/",
    importance: "core",
    sentiment: "positive",
    relevance: 96,
    topic: "반도체",
    companies: ["삼성전자", "SK하이닉스"],
    regions: [],
    impact: "직접 영향",
    sources: [
      {
        name: "삼성전자",
        type: "기업 공식자료",
        trust: "높음",
        url: "https://www.samsung.com/sec/",
      },
    ],
  },
  {
    id: "archive-june-loan",
    clusterKey: "archive-june-loan",
    publishedAt: "2026-06-04",
    title: "주택담보대출 한도를 검토하는 6월 샘플 브리핑",
    summary: "DSR과 금리 조건을 확인하는 예시 항목입니다.",
    deck: "대출 가능액 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://www.fsc.go.kr/",
    importance: "important",
    sentiment: "caution",
    relevance: 89,
    topic: "부동산·대출",
    companies: [],
    regions: ["서울", "구리", "남양주"],
    impact: "대출 영향",
    sources: [
      {
        name: "금융위원회",
        type: "정부·공공기관",
        trust: "높음",
        url: "https://www.fsc.go.kr/",
      },
    ],
  },
  {
    id: "archive-may-ai",
    clusterKey: "archive-may-ai",
    publishedAt: "2026-05-22",
    title: "클라우드 AI 투자 흐름을 검토하는 5월 샘플 브리핑",
    summary: "AI 인프라 투자 흐름을 비교하는 예시 항목입니다.",
    deck: "AI 수요 방향 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://www.microsoft.com/en-us/investor",
    importance: "important",
    sentiment: "positive",
    relevance: 87,
    topic: "AI",
    companies: ["Microsoft", "Google", "Amazon"],
    regions: [],
    impact: "간접 영향",
    sources: [
      {
        name: "Microsoft",
        type: "기업 공식자료",
        trust: "높음",
        url: "https://www.microsoft.com/en-us/investor",
      },
    ],
  },
  {
    id: "archive-may-hanam",
    clusterKey: "archive-may-hanam",
    publishedAt: "2026-05-11",
    title: "하남 주거 공급을 검토하는 5월 샘플 브리핑",
    summary: "관심 지역 공급 일정과 실수요 조건을 점검하는 예시 항목입니다.",
    deck: "관심 지역 공급 판단을 위한 한 문장 설명",
    body: [
      "첫 문단은 사건과 배경을 설명합니다.",
      "둘째 문단은 삼성전자·SK하이닉스 또는 부동산 판단에 미치는 의미를 설명합니다.",
    ],
    takeaways: ["기억할 포인트 1", "기억할 포인트 2"],
    primaryUrl: "https://www.lh.or.kr/",
    importance: "important",
    sentiment: "neutral",
    relevance: 86,
    topic: "관심 지역",
    companies: [],
    regions: ["하남", "구리"],
    impact: "실거주 영향",
    sources: [
      {
        name: "LH",
        type: "공공기관",
        trust: "높음",
        url: "https://www.lh.or.kr/",
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

export function matchesKeyword(issue, keyword) {
  if (keyword === "전체") return true;
  if (keyword === "AI") {
    return (
      issue.topic === "AI" ||
      issue.companies.some((name) =>
        ["엔비디아", "Microsoft", "Google", "Amazon"].includes(name),
      )
    );
  }
  if (keyword === "반도체") {
    return (
      issue.topic === "반도체" ||
      issue.companies.some((name) =>
        ["삼성전자", "SK하이닉스", "TSMC", "마이크론", "엔비디아"].includes(
          name,
        ),
      )
    );
  }
  if (keyword === "부동산") {
    return issue.topic === "부동산·대출" || issue.topic === "관심 지역";
  }
  if (keyword === "대출") {
    return (
      issue.topic === "부동산·대출" &&
      /대출|DSR|금리/.test(`${issue.title} ${issue.summary}`)
    );
  }
  if (keyword === "구리·남양주·하남·왕숙") {
    return issue.regions.some((region) =>
      ["구리", "남양주", "하남", "왕숙"].includes(region),
    );
  }
  return issue.companies.includes(keyword);
}

export function filterIssues(issues, { month = null, keyword = "전체" } = {}) {
  return issues.filter(
    (issue) =>
      (!month || issue.publishedAt.startsWith(month)) &&
      matchesKeyword(issue, keyword),
  );
}

export function getArchiveMonths(issues) {
  return [...new Set(issues.map((issue) => issue.publishedAt.slice(0, 7)))]
    .sort()
    .reverse();
}

export function getKeywordCounts(issues) {
  return Object.fromEntries(
    KEYWORDS.map((keyword) => [keyword, filterIssues(issues, { keyword }).length]),
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

export function getArchiveIssues() {
  return rankIssues(clusterStories(archiveStories), {});
}
