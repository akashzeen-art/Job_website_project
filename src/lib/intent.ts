import { COMPANIES } from "@/lib/companies";
import { JOB_KINDS, type JobKind } from "@/lib/catalog";

export type ParsedIntent = {
  q: string;
  city?: string;
  company?: string;
  department?: string;
  kind?: JobKind;
  stream?: string;
};

const CITY_ALIASES: { city: string; pattern: RegExp }[] = [
  { city: "Bengaluru", pattern: /\b(bengaluru|bangalore|blr)\b/i },
  { city: "Hyderabad", pattern: /\b(hyderabad|hyd)\b/i },
  { city: "Mumbai", pattern: /\b(mumbai|bombay)\b/i },
  { city: "Delhi NCR", pattern: /\b(delhi|gurgaon|gurugram|noida|ncr)\b/i },
  { city: "Pune", pattern: /\bpune\b/i },
  { city: "Chennai", pattern: /\b(chennai|madras)\b/i },
  { city: "Kolkata", pattern: /\b(kolkata|calcutta)\b/i },
  { city: "Remote India", pattern: /\b(remote|wfh|work from home)\b/i },
];

const KIND_ALIASES: { kind: JobKind; pattern: RegExp }[] = [
  { kind: "typing", pattern: /\b(typing|typist|data entry|form filling)\b/i },
  { kind: "excel", pattern: /\b(excel|spreadsheet|mis|vlookup|pivot)\b/i },
  { kind: "freelance", pattern: /\b(freelance|freelancer|gig)\b/i },
  { kind: "fresher", pattern: /\b(fresher|freshers|trainee|campus|graduate trainee)\b/i },
  { kind: "global", pattern: /\b(global tech|greenhouse|nvidia|stripe)\b/i },
];

const STREAM_ALIASES: { stream: string; pattern: RegExp }[] = [
  { stream: "B.Tech / BE", pattern: /\b(b\.?\s*tech|be\b|engineering graduate)\b/i },
  { stream: "B.Com", pattern: /\b(b\.?\s*com|commerce)\b/i },
  { stream: "BBA / BBM", pattern: /\b(bba|bbm)\b/i },
  { stream: "BA / Arts", pattern: /\b(b\.?\s*a\b|arts graduate)\b/i },
  { stream: "B.Sc", pattern: /\b(b\.?\s*sc|science graduate)\b/i },
  { stream: "Diploma", pattern: /\bdiploma\b/i },
  { stream: "MBA / PG", pattern: /\b(mba|post ?graduate|pgdm)\b/i },
  { stream: "12th Pass", pattern: /\b(12th|hsc|intermediate)\b/i },
  { stream: "ITI / Polytechnic", pattern: /\b(iti|polytechnic)\b/i },
  { stream: "Any Graduate", pattern: /\bany graduate\b/i },
];

const DEPARTMENTS: { department: string; pattern: RegExp }[] = [
  { department: "Typing & Data Entry", pattern: /\b(typing|data entry)\b/i },
  { department: "Excel & MIS", pattern: /\b(excel|mis)\b/i },
  { department: "Freelance / WFH", pattern: /\b(freelance|wfh)\b/i },
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
  let kind: JobKind | undefined;
  let stream: string | undefined;

  for (const rule of CITY_ALIASES) {
    if (rule.pattern.test(q)) {
      city = rule.city;
      q = q.replace(rule.pattern, " ");
      break;
    }
  }

  for (const rule of KIND_ALIASES) {
    if (rule.pattern.test(q)) {
      kind = rule.kind;
      break;
    }
  }

  for (const rule of STREAM_ALIASES) {
    if (rule.pattern.test(q)) {
      stream = rule.stream;
      if (!kind) kind = "fresher";
      break;
    }
  }

  const companyHit =
    COMPANIES.find((item) =>
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

  q = q
    .replace(/\b(in|at|for|jobs?|roles?|india|related|all stream|streams?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { q, city, company, department, kind, stream };
}

export function kindLabel(kind: JobKind): string {
  return JOB_KINDS.find((item) => item.id === kind)?.label ?? kind;
}
