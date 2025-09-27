// apps/backend/src/ai/utils/responseParser.ts

export function parseJsonFromMarkdown(aiResponse: string): any {
  let cleanResponse = aiResponse.trim();

  if (cleanResponse.startsWith("```json")) {
    cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanResponse.startsWith("```")) {
    cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(cleanResponse);
}
