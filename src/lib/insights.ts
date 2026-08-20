import type { Job } from "@/lib/types";

const FLAGSHIP = new Set([
  "openai",
  "anthropic",
  "nvidia",
  "stripe",
  "databricks",
  "cursor",
  "snowflake",
  "figma",
  "airbnb",
  "intel",
  "salesforce",
]);

const TAGS: { tag: string; pattern: RegExp }[] = [
  { tag: "Fresher", pattern: /\b(fresher|trainee|graduate|entry.?level|intern)\b/i },
  { tag: "Freelance", pattern: /\b(freelance|gig|part.?time|wfh)\b/i },
  { tag: "Typing", pattern: /\b(typing|typist|data entry|form filling)\b/i },
  { tag: "Excel", pattern: /\b(excel|spreadsheet|mis|vlookup|pivot)\b/i },
  { tag: "Staff+", pattern: /\b(staff|principal|distinguished|director|head of)\b/i },
  { tag: "Senior", pattern: /\b(senior|sr\.?)\b/i },
  { tag: "ML / AI", pattern: /\b(machine learning|deep learning|genai|llm|\bai\b|\bml\b)\b/i },
  { tag: "Backend", pattern: /\b(backend|back-end|java|python|golang|go engineer|node)\b/i },
  { tag: "Frontend", pattern: /\b(frontend|front-end|react|ios|android|mobile)\b/i },
  { tag: "Data", pattern: /\b(data engineer|analytics|analyst|warehouse)\b/i },
  { tag: "Security", pattern: /\b(security|sre|devops|infra|cloud)\b/i },
  { tag: "Product", pattern: /\b(product manager|product owner|\bpm\b)\b/i },
  { tag: "Sales", pattern: /\b(account executive|sales|gtm|customer engineer)\b/i },
  { tag: "Remote", pattern: /\bremote\b/i },
];

export function jobTags(job: Job): string[] {
  const blob = `${job.title} ${job.workplaceType ?? ""} ${job.location}`;
  const tags: string[] = [];
  for (const rule of TAGS) {
    if (rule.pattern.test(blob)) tags.push(rule.tag);
    if (tags.length >= 3) break;
  }
  if (!tags.includes(job.city) && job.city !== "India") tags.push(job.city);
  return tags.slice(0, 4);
}

export function recencyBoost(job: Job): number {
  if (!job.postedAt) {
    if (/today|hour/i.test(job.postedLabel ?? "")) return 12;
    if (/1 day|2 day/i.test(job.postedLabel ?? "")) return 8;
    return 4;
  }
  const age = Date.now() - Date.parse(job.postedAt);
  if (Number.isNaN(age)) return 4;
  if (age < 2 * 86_400_000) return 14;
  if (age < 7 * 86_400_000) return 10;
  if (age < 21 * 86_400_000) return 6;
  return 2;
}

export function fitScore(job: Job, query = ""): number {
  let score = 62 + recencyBoost(job);
  if (FLAGSHIP.has(job.companySlug)) score += 8;
  if (job.city !== "India") score += 5;
  if (job.city === "Remote India") score += 2;
  if (/\b(engineer|scientist|product|design)\b/i.test(job.title)) score += 3;

  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 2);
  if (tokens.length) {
    const haystack = `${job.title} ${job.company} ${job.city} ${job.department}`.toLowerCase();
    const hits = tokens.filter((token) => haystack.includes(token)).length;
    score += Math.round((hits / tokens.length) * 18);
  }

  return Math.max(54, Math.min(98, Math.round(score)));
}

export function fitWhy(job: Job, query = ""): string {
  const bits: string[] = [];
  if (recencyBoost(job) >= 10) bits.push("Fresh posting");
  if (FLAGSHIP.has(job.companySlug)) bits.push("Flagship global team");
  if (job.city !== "India") bits.push(`${job.city} hub`);
  else bits.push("India-based");
  if (query.trim()) bits.push("Matches your search");
  return bits.slice(0, 3).join(" · ");
}

export const PROMPTS = [
  "Fresher typing jobs",
  "Excel MIS Bengaluru",
  "Freelance data entry WFH",
  "B.Com fresher accounts",
  "B.Tech graduate trainee",
  "Part time typing Hyderabad",
  "12th pass office assistant",
  "MBA fresher marketing",
];
