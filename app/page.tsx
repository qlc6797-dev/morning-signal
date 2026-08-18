import BriefingApp from "./components/BriefingApp";
import { getMorningBriefing } from "./lib/briefing.mjs";
import { fetchDailySemiconductorNews } from "./lib/semiconductor-news.mjs";

export default async function Home() {
  const initialBriefing = getMorningBriefing();
  const initialSemiconductorFeed = await fetchDailySemiconductorNews();

  return (
    <BriefingApp
      initialBriefing={initialBriefing}
      initialSemiconductorFeed={initialSemiconductorFeed}
    />
  );
}
