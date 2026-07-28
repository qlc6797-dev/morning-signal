import { createSemiconductorNewsResponse } from "../../lib/semiconductor-news.mjs";

export const runtime = "edge";

export async function GET(request: Request) {
  return createSemiconductorNewsResponse(request);
}
