const CITY_RULES: { city: string; pattern: RegExp }[] = [
  { city: "Bengaluru", pattern: /\bbengaluru\b|\bbangalore\b|\bblr\b/i },
  { city: "Hyderabad", pattern: /\bhyderabad\b|\bhyd\b/i },
  { city: "Mumbai", pattern: /\bmumbai\b|\bbombay\b/i },
  { city: "Delhi NCR", pattern: /\bnew delhi\b|\bdelhi\b|\bgurgaon\b|\bgurugram\b|\bnoida\b|\bfaridabad\b|\bghaziabad\b|\bncr\b/i },
  { city: "Pune", pattern: /\bpune\b/i },
  { city: "Chennai", pattern: /\bchennai\b|\bmadras\b/i },
  { city: "Kolkata", pattern: /\bkolkata\b|\bcalcutta\b/i },
  { city: "Ahmedabad", pattern: /\bahmedabad\b/i },
  { city: "Jaipur", pattern: /\bjaipur\b/i },
  { city: "Indore", pattern: /\bindore\b/i },
  { city: "Kochi", pattern: /\bkochi\b|\bcochin\b/i },
  { city: "Coimbatore", pattern: /\bcoimbatore\b/i },
  { city: "Chandigarh", pattern: /\bchandigarh\b|\bmohali\b/i },
  { city: "Lucknow", pattern: /\blucknow\b/i },
  { city: "Nagpur", pattern: /\bnagpur\b/i },
  { city: "Remote India", pattern: /\bremote[^\n]{0,40}india\b|\bindia[^\n]{0,20}remote\b|\bremote - india\b|\bremote, india\b/i },
];

const INDIA_HINT =
  /\bindia\b|\bbharat\b|\bbengaluru\b|\bbangalore\b|\bhyderabad\b|\bmumbai\b|\bdelhi\b|\bgurgaon\b|\bgurugram\b|\bnoida\b|\bpune\b|\bchennai\b|\bkolkata\b|\bahmedabad\b|\bkochi\b|\bcoimbatore\b|\bjaipur\b|\bchandigarh\b|\bmohali\b|\bindore\b|\btrivandrum\b|\bthiruvananthapuram\b|\bremote india\b|\bin\s*-\s*ka\b|\bin\s*-\s*mh\b|\bin\s*-\s*ts\b|\bin\s*-\s*tn\b|\bind\b/i;

export const CITIES = [
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Indore",
  "Kochi",
  "Coimbatore",
  "Chandigarh",
  "Lucknow",
  "Nagpur",
  "Remote India",
  "India",
] as const;

export function mentionsIndia(text: string): boolean {
  return INDIA_HINT.test(text);
}

export function normalizeCity(location: string): string {
  for (const rule of CITY_RULES) {
    if (rule.pattern.test(location)) return rule.city;
  }
  if (mentionsIndia(location)) return "India";
  return "India";
}

export function inferDepartment(title: string, given?: string | null): string {
  if (given && given.trim() && given.toLowerCase() !== "unspecified") {
    return given.trim();
  }
  const t = title.toLowerCase();
  if (/\b(typist|typing|data entry|form filling|copy typing)\b/.test(t)) return "Typing & Data Entry";
  if (/\b(excel|spreadsheet|mis |vlookup|pivot)\b/.test(t)) return "Excel & MIS";
  if (/\b(freelance|gig|virtual assistant)\b/.test(t)) return "Freelance / WFH";
  if (/\b(fresher|trainee|graduate|apprentice|entry.?level)\b/.test(t)) return "Fresher";
  if (/\b(account executive|sales|business development|go-to-market|gtm|customer engineer|solutions consultant)\b/.test(t)) {
    return "Sales";
  }
  if (/\b(recruiter|talent|people|hr |human resources|sourc)\b/.test(t)) return "People";
  if (/\b(marketing|brand|communications|content|growth)\b/.test(t)) return "Marketing";
  if (/\b(finance|accounting|controller|fp&a|tax|audit)\b/.test(t)) return "Finance";
  if (/\b(legal|counsel|compliance|privacy)\b/.test(t)) return "Legal";
  if (/\b(support|success|operations|ops|program manager|project manager)\b/.test(t)) {
    return "Operations";
  }
  if (/\b(design|product designer|ux|ui)\b/.test(t)) return "Design";
  if (/\b(product manager|product owner|pm\b)\b/.test(t)) return "Product";
  if (/\b(data scientist|machine learning|ml engineer|ai engineer|research|analyst)\b/.test(t)) {
    return "Data & AI";
  }
  if (/\b(engineer|developer|sre|devops|security|software|frontend|backend|full.?stack|android|ios|qa|quality)\b/.test(t)) {
    return "Engineering";
  }
  return "Other";
}
