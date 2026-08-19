import { COMPANIES } from "@/lib/companies";

export type ParsedIntent = {
  q: string;
  city?: string;
  company?: string;
  department?: string;
};

const CITY_ALIASES: { city: string; pattern: RegExp }[] = [
  { city: "Bengaluru", pattern: /\b(bengaluru|bangalore|blr)\b/i },
  { city: "Hyderabad", pattern: /\b(hyderabad|hyd)\b/i },
  { city: "Mumbai", pattern: /\b(mumbai|bombay)\b/i },
  { city: "Delhi NCR", pattern: /\b(delhi|gurgaon|gurugram|noida|ncr)\b/i },
  { city: "Pune", pattern: /\bpune\b/i },
  { city: "Chennai", pattern: /\b(chennai|madras)\b/i },
  { city: "Kolkata", pattern: /\b(kolkata|calcutta)\b/i },
  { city: "Remote India", pattern: /\bremote\b/i },
];

const DEPARTMENTS: { department: string; pattern: RegExp }[] = [
  { department: "Engineering", pattern: /\b(engineer|developer|software|backend|frontend|sre)\b/i },
  { department: "Data & AI", pattern: /\b(data|ml|ai|machine learning|scientist)\b/i },
  { department: "Product", pattern: /\b(product manager|product)\b/i },
  { department: "Sales", pattern: /\b(sales|account executive|gtm)\b/i },
  { department: "Design", pattern: /\b(design|designer|ux|ui)\b/i },
  { department: "Marketing", pattern: /\b(marketing|brand|growth)\b/i },
];

export function parseIntent(raw: string): ParsedIntent {
  let q = raw.trim();
  let city: string | undefined;
  let company: string | undefined;
  let department: string | undefined;

  for (const rule of CITY_ALIASES) {
    if (rule.pattern.test(q)) {
      city = rule.city;
      q = q.replace(rule.pattern, " ");
      break;
    }
  }

  const companyHit = COMPANIES.find((item) =>
    new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q),
  ) ?? COMPANIES.find((item) => new RegExp(`\\b${item.slug}\\b`, "i").test(q));
  if (companyHit) {
    company = companyHit.slug;
    q = q.replace(new RegExp(companyHit.name, "i"), " ");
    q = q.replace(new RegExp(companyHit.slug.replace(/-/g, "[- ]?"), "i"), " ");
  }

  for (const rule of DEPARTMENTS) {
    if (rule.pattern.test(q)) {
      department = rule.department;
      break;
    }
  }

  q = q.replace(/\b(in|at|for|jobs?|roles?|india)\b/gi, " ").replace(/\s+/g, " ").trim();
  return { q, city, company, department };
}
