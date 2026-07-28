const NEWS_QUERIES = [
  "반도체",
  "HBM 메모리",
  "삼성전자 반도체",
  "SK하이닉스",
  "엔비디아 TSMC ASML",
];

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function cleanText(value = "") {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(item, tagPattern) {
  const match = item.match(new RegExp(`<${tagPattern}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagPattern}>`, "i"));
  return match?.[1] ?? "";
}

function validHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function unwrapNewsUrl(value) {
  if (!validHttpUrl(value)) return value;

  const parsed = new URL(value);
  if (parsed.hostname.endsWith("bing.com")) {
    const direct = parsed.searchParams.get("url");
    if (direct && validHttpUrl(direct)) return direct;
  }
  return value;
}

function koreaDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function articleId(url) {
  let hash = 2166136261;
  for (const character of url) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `semiconductor-${(hash >>> 0).toString(36)}`;
}

export function parseNewsRss(xml) {
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];

  return items.map((item) => ({
    title: cleanText(tagValue(item, "title")),
    url: decodeEntities(tagValue(item, "link")).trim(),
    description: cleanText(tagValue(item, "description")),
    publishedAt: cleanText(tagValue(item, "pubDate")),
    source: cleanText(tagValue(item, "(?:News:Source|source)")),
  }));
}

export function normalizeDailyArticles(items, {
  now = new Date(),
  limit = 30,
} = {}) {
  const today = koreaDateKey(now);
  const seenUrls = new Set();
  const seenTitles = new Set();

  return items
    .map((item) => {
      const url = unwrapNewsUrl(decodeEntities(item.url ?? "").trim());
      const title = cleanText(item.title);
      const publishedDate = new Date(item.publishedAt);
      const rawSummary = cleanText(item.description);
      const summary = rawSummary && rawSummary !== title ? rawSummary : null;

      return {
        id: articleId(url),
        title,
        summary,
        source: cleanText(item.source) || "출처 미상",
        publishedAt: Number.isNaN(publishedDate.getTime()) ? "" : publishedDate.toISOString(),
        url,
      };
    })
    .filter((article) =>
      article.title
      && validHttpUrl(article.url)
      && koreaDateKey(article.publishedAt) === today)
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .filter((article) => {
      if (seenUrls.has(article.url) || seenTitles.has(article.title)) return false;
      seenUrls.add(article.url);
      seenTitles.add(article.title);
      return true;
    })
    .slice(0, limit);
}

export async function fetchDailySemiconductorNews({
  fetchImpl = fetch,
  now = new Date(),
  bypassCache = false,
} = {}) {
  const requestOptions = bypassCache
    ? { cache: "no-store" }
    : { next: { revalidate: 3600 } };

  const responses = await Promise.allSettled(NEWS_QUERIES.map(async (query) => {
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&mkt=ko-KR`;
    const response = await fetchImpl(url, requestOptions);
    if (!response.ok) throw new Error(`News feed returned ${response.status}`);
    return parseNewsRss(await response.text());
  }));
  const items = responses.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const successfulFeeds = responses.filter((result) => result.status === "fulfilled").length;

  return {
    articles: normalizeDailyArticles(items, { now, limit: 30 }),
    updatedAt: now.toISOString(),
    date: koreaDateKey(now),
    status: successfulFeeds === 0 ? "unavailable" : successfulFeeds < NEWS_QUERIES.length ? "partial" : "ok",
  };
}

export async function createSemiconductorNewsResponse(request, {
  getFeed = fetchDailySemiconductorNews,
} = {}) {
  const requestUrl = new URL(request.url);
  const bypassCache = requestUrl.searchParams.has("refresh");
  const cacheControl = bypassCache
    ? "no-store"
    : "public, max-age=0, s-maxage=3600, stale-while-revalidate=300";

  let body;
  try {
    body = await getFeed({ bypassCache });
  } catch {
    const now = new Date();
    body = {
      articles: [],
      updatedAt: now.toISOString(),
      date: koreaDateKey(now),
      status: "unavailable",
    };
  }

  return Response.json(body, {
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
