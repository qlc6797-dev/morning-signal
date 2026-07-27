import BriefingApp from "./components/BriefingApp";
import { getMorningBriefing } from "./lib/briefing.mjs";

export default function Home() {
  return <BriefingApp initialBriefing={getMorningBriefing()} />;
}
