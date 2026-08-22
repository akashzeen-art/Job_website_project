import type { Ats, Job } from "@/lib/types";

export type JobKind =
  | "survey"
  | "dataentry"
  | "typing"
  | "content"
  | "wfh"
  | "freelance"
  | "excel"
  | "fresher"
  | "global";

export const JOB_KINDS: { id: JobKind; label: string }[] = [
  { id: "survey", label: "Survey" },
  { id: "dataentry", label: "Data entry" },
  { id: "typing", label: "Typing" },
  { id: "content", label: "Content" },
  { id: "wfh", label: "WFH" },
  { id: "freelance", label: "Freelance" },
  { id: "excel", label: "Excel" },
  { id: "fresher", label: "Fresher" },
  { id: "global", label: "Global tech" },
];

export const STREAMS = [
  "Any Graduate",
  "B.Tech / BE",
  "B.Com",
  "BBA / BBM",
  "BA / Arts",
  "B.Sc",
  "Diploma",
  "MBA / PG",
  "12th Pass",
  "ITI / Polytechnic",
] as const;

const CITIES = [
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
  "Bhopal",
  "Patna",
  "Remote India",
] as const;

type Employer = {
  slug: string;
  name: string;
  industry: string;
  website: string;
};

const EMPLOYERS: Employer[] = [
  { slug: "work-from-home-desk", name: "Work From Home Desk", industry: "Remote / WFH", website: "https://in.indeed.com" },
  { slug: "india-office-network", name: "India Office Network", industry: "Office Support", website: "https://in.indeed.com" },
  { slug: "metro-bpo-hub", name: "Metro BPO Hub", industry: "BPO / KPO", website: "https://in.indeed.com" },
  { slug: "campus-hire-india", name: "Campus Hire India", industry: "Fresher Hiring", website: "https://in.indeed.com" },
  { slug: "freelance-india-board", name: "Freelance India Board", industry: "Freelance", website: "https://in.indeed.com" },
  { slug: "excel-talent-pool", name: "Excel Talent Pool", industry: "Data & Excel", website: "https://in.indeed.com" },
  { slug: "typing-speed-desk", name: "Typing Speed Desk", industry: "Typing", website: "https://in.indeed.com" },
  { slug: "data-entry-india", name: "Data Entry India", industry: "Data Entry", website: "https://in.indeed.com" },
  { slug: "survey-panel-india", name: "Survey Panel India", industry: "Surveys", website: "https://in.indeed.com" },
  { slug: "content-desk-india", name: "Content Desk India", industry: "Content", website: "https://in.indeed.com" },
  { slug: "graduate-first-desk", name: "Graduate First Desk", industry: "Entry Level", website: "https://in.indeed.com" },
  { slug: "skill-bridge-india", name: "Skill Bridge India", industry: "Skilling", website: "https://in.indeed.com" },
];

const TITLES: Record<Exclude<JobKind, "global" | "fresher">, string[]> = {
  survey: [
    "Online Survey Participant",
    "Paid Survey Associate",
    "Market Research Survey Caller",
    "Product Feedback Survey Taker",
    "App Review Survey Worker",
    "Customer Opinion Survey Executive",
    "WFH Survey Panel Member",
    "Part-Time Survey Jobs",
    "Focus Group Survey Assistant",
    "Brand Survey Data Collector",
    "Student Survey Associate",
    "Daily Survey Microtask Worker",
    "Field Survey Assistant",
    "Questionnaire Survey Operator",
  ],
  dataentry: [
    "Data Entry Operator",
    "Online Data Entry Executive",
    "Form Data Entry Associate",
    "Invoice Data Entry Clerk",
    "Catalog Data Entry Specialist",
    "Excel Data Entry Fresher",
    "WFH Data Entry Jobs",
    "Night Shift Data Entry",
    "Bank Data Entry Assistant",
    "Hospital Data Entry Operator",
    "E-commerce Listing Data Entry",
    "Numeric Data Entry Executive",
    "Copy-Paste Data Entry Associate",
    "Back Office Data Entry Staff",
  ],
  typing: [
    "Online Typing Operator",
    "English Typing Clerk",
    "Hindi Typing Operator",
    "Speed Typing Executive (40+ WPM)",
    "PDF Typing Specialist",
    "Medical Typing Operator",
    "Court Typing Assistant",
    "WFH Typing Jobs — Part Time",
    "Transcription Typing Freelancer",
    "Invoice Typing Executive",
    "Copy Typing Associate",
    "Form Filling & Typing",
    "Caption Typing Operator",
    "Document Typing Clerk",
  ],
  content: [
    "Content Writer Fresher",
    "Blog Content Writer",
    "Social Media Content Creator",
    "Product Description Writer",
    "SEO Content Writer",
    "Article Writing Freelancer",
    "Website Content Associate",
    "Copywriter Junior",
    "YouTube Script Writer",
    "Email Content Writer",
    "Academic Content Writer",
    "Hinglish Content Writer",
    "Content Editor Fresher",
    "Caption & Hashtag Writer",
  ],
  wfh: [
    "Work From Home Online Jobs",
    "WFH Customer Support",
    "WFH Chat Support Executive",
    "WFH Virtual Assistant",
    "WFH Part-Time Jobs",
    "WFH Form Filling Jobs",
    "WFH Email Handling",
    "WFH Lead Generation",
    "WFH Back Office Associate",
    "WFH Online Tutoring Assistant",
    "WFH Data Processing",
    "WFH Order Processing",
    "WFH Night Shift Support",
    "WFH Microtask Worker",
  ],
  freelance: [
    "Freelance Data Entry",
    "Freelance Typing Projects",
    "Freelance Content Writing",
    "Freelance Online Survey Work",
    "Freelance Excel Sheet Work",
    "Freelance Form Filling",
    "Freelance Virtual Assistant",
    "Freelance Social Media Posts",
    "Freelance Resume Formatting",
    "Freelance Caption Writing",
    "Freelance Catalog Listing",
    "Freelance Document Digitization",
    "Freelance Part-Time Desk Work",
    "Freelance Lead List Building",
  ],
  excel: [
    "MS Excel Data Analyst — Fresher",
    "Excel MIS Executive",
    "Advanced Excel Operator",
    "Excel & Google Sheets Associate",
    "VLOOKUP / Pivot Specialist",
    "Accounts Excel Assistant",
    "Inventory Excel Executive",
    "Excel Reporting Analyst",
    "HR Excel MIS Executive",
    "Sales Excel Tracker",
    "Excel Data Cleaning Associate",
    "Spreadsheet Fresher — WFH",
    "Excel Billing Executive",
    "Excel Dashboard Junior",
  ],
};

const FRESHER_BY_STREAM: Record<(typeof STREAMS)[number], string[]> = {
  "Any Graduate": ["Graduate Trainee", "Fresher Customer Support", "Office Assistant — Fresher", "Junior Operations Associate"],
  "B.Tech / BE": ["Graduate Engineer Trainee", "Junior Software Support Fresher", "IT Helpdesk Fresher", "QA / Testing Fresher"],
  "B.Com": ["Accounts Fresher", "Junior Accountant — B.Com", "Billing Executive Fresher", "Audit Support Fresher"],
  "BBA / BBM": ["Management Trainee — BBA", "Business Operations Fresher", "Sales Coordinator Fresher", "HR Coordinator Fresher"],
  "BA / Arts": ["Content Support Fresher — Arts", "Admin Executive Fresher", "Client Relation Fresher", "Documentation Fresher"],
  "B.Sc": ["Lab / Process Fresher — B.Sc", "Science Graduate Trainee", "Quality Check Fresher", "Research Assistant Fresher"],
  Diploma: ["Diploma Trainee — Technical", "Junior Technician Fresher", "CAD Support Fresher", "Field Fresher"],
  "MBA / PG": ["MBA Management Trainee", "Business Analyst Fresher — PG", "Marketing Associate Fresher", "Finance Analyst Fresher"],
  "12th Pass": ["Front Desk — 12th Pass", "Data Entry Fresher — 12th Pass", "Reception Assistant", "Store Assistant — Fresher"],
  "ITI / Polytechnic": ["ITI Apprentice / Trainee", "Polytechnic Fresher", "Machine Operator Trainee", "Maintenance Support Fresher"],
};

const KIND_EMPLOYERS: Record<Exclude<JobKind, "global">, string[]> = {
  survey: ["survey-panel-india", "work-from-home-desk", "freelance-india-board", "metro-bpo-hub", "skill-bridge-india"],
  dataentry: ["data-entry-india", "metro-bpo-hub", "work-from-home-desk", "india-office-network", "typing-speed-desk"],
  typing: ["typing-speed-desk", "data-entry-india", "work-from-home-desk", "metro-bpo-hub", "india-office-network"],
  content: ["content-desk-india", "freelance-india-board", "work-from-home-desk", "skill-bridge-india", "campus-hire-india"],
  wfh: ["work-from-home-desk", "freelance-india-board", "metro-bpo-hub", "data-entry-india", "survey-panel-india"],
  freelance: ["freelance-india-board", "work-from-home-desk", "content-desk-india", "typing-speed-desk", "excel-talent-pool"],
  excel: ["excel-talent-pool", "india-office-network", "skill-bridge-india", "data-entry-india", "work-from-home-desk"],
  fresher: ["campus-hire-india", "graduate-first-desk", "skill-bridge-india", "metro-bpo-hub", "india-office-network"],
};

const EMPLOYER_BY_SLUG = Object.fromEntries(EMPLOYERS.map((e) => [e.slug, e])) as Record<
  string,
  Employer
>;

const TARGET = 10_000;
const NOW = Date.UTC(2026, 7, 1);

function indeedUrl(title: string, city: string): string {
  const q = encodeURIComponent(`${title} India`);
  const l = encodeURIComponent(city === "Remote India" ? "India" : `${city}, India`);
  return `https://in.indeed.com/jobs?q=${q}&l=${l}`;
}

function departmentFor(kind: Exclude<JobKind, "global">, stream?: string): string {
  switch (kind) {
    case "survey":
      return "Survey & Research";
    case "dataentry":
      return "Data Entry";
    case "typing":
      return "Typing";
    case "content":
      return "Content Writing";
    case "wfh":
      return "Work From Home";
    case "freelance":
      return "Freelance";
    case "excel":
      return "Excel & MIS";
    case "fresher":
      return stream ? `Fresher · ${stream}` : "Fresher";
  }
}

function makeJob(
  index: number,
  kind: Exclude<JobKind, "global">,
  title: string,
  city: string,
  employer: Employer,
  stream?: string,
): Job {
  const sourceId = `${kind}-${index}`;
  const postedDays = (index * 3) % 28;
  return {
    id: `c:${employer.slug}:${sourceId}`,
    sourceId,
    ats: "catalog" as Ats,
    company: employer.name,
    companySlug: employer.slug,
    title: stream ? `${title} (${stream})` : title,
    location: `${city}, India`,
    city,
    department: departmentFor(kind, stream),
    url: indeedUrl(title, city),
    postedAt: new Date(NOW - postedDays * 86_400_000).toISOString(),
    postedLabel: postedDays === 0 ? "Posted today" : `Posted ${postedDays} days ago`,
    workplaceType:
      city === "Remote India" || kind === "wfh" || kind === "freelance" || kind === "survey"
        ? "Remote"
        : "On-site / Hybrid",
    kind,
    stream: stream ?? null,
  };
}

export const CATALOG_COMPANIES = EMPLOYERS.map((employer) => ({
  slug: employer.slug,
  name: employer.name,
  ats: "catalog" as const,
  website: employer.website,
  hq: "India",
  industry: employer.industry,
}));

let catalogCache: Job[] | null = null;

/** Builds ~10,000 India roles once per session (memoized). */
export function getCatalogJobs(): Job[] {
  if (catalogCache) return catalogCache;

  const jobs: Job[] = new Array(TARGET);
  let index = 0;

  function push(
    kind: Exclude<JobKind, "global">,
    title: string,
    city: (typeof CITIES)[number],
    employerSlug: string,
    stream?: string,
  ) {
    if (index >= TARGET) return;
    const employer = EMPLOYER_BY_SLUG[employerSlug];
    if (!employer) return;
    jobs[index] = makeJob(index, kind, title, city, employer, stream);
    index += 1;
  }

  const nonFresher = Object.keys(TITLES) as Array<keyof typeof TITLES>;

  // Pass 1: core categories × cities × employers
  while (index < TARGET) {
    const before = index;
    for (const kind of nonFresher) {
      for (const title of TITLES[kind]) {
        for (const city of CITIES) {
          for (const slug of KIND_EMPLOYERS[kind]) {
            push(kind, title, city, slug);
            if (index >= TARGET) break;
          }
          if (index >= TARGET) break;
        }
        if (index >= TARGET) break;
      }
      if (index >= TARGET) break;
    }
    for (const stream of STREAMS) {
      for (const title of FRESHER_BY_STREAM[stream]) {
        for (const city of CITIES) {
          for (const slug of KIND_EMPLOYERS.fresher) {
            push("fresher", title, city, slug, stream);
            if (index >= TARGET) break;
          }
          if (index >= TARGET) break;
        }
        if (index >= TARGET) break;
      }
      if (index >= TARGET) break;
    }
    if (index === before) break; // safety
  }

  catalogCache = index === TARGET ? jobs : jobs.slice(0, index);
  return catalogCache;
}

/** @deprecated use getCatalogJobs */
export function buildCatalogJobs(): Job[] {
  return getCatalogJobs();
}

export function inferKind(job: Job): JobKind {
  if (job.kind) return job.kind;
  if (job.ats === "catalog") {
    const id = job.sourceId;
    if (id.startsWith("survey")) return "survey";
    if (id.startsWith("dataentry")) return "dataentry";
    if (id.startsWith("typing")) return "typing";
    if (id.startsWith("content")) return "content";
    if (id.startsWith("wfh")) return "wfh";
    if (id.startsWith("freelance")) return "freelance";
    if (id.startsWith("excel")) return "excel";
    if (id.startsWith("fresher")) return "fresher";
  }
  const blob = `${job.title} ${job.department}`.toLowerCase();
  if (/\bsurvey\b/.test(blob)) return "survey";
  if (/\bdata entry\b/.test(blob)) return "dataentry";
  if (/\b(typist|typing)\b/.test(blob)) return "typing";
  if (/\b(content|copywriter|blog|seo writer)\b/.test(blob)) return "content";
  if (/\b(wfh|work from home)\b/.test(blob)) return "wfh";
  if (/\b(freelance|gig|virtual assistant)\b/.test(blob)) return "freelance";
  if (/\b(excel|spreadsheet|mis executive|vlookup|pivot)\b/.test(blob)) return "excel";
  if (/\b(fresher|trainee|graduate|entry.?level|intern)\b/.test(blob)) return "fresher";
  return "global";
}

export function kindLabel(kind: JobKind): string {
  return JOB_KINDS.find((item) => item.id === kind)?.label ?? kind;
}

/** Categories present in the loaded jobs, with live counts from data. */
export function categoriesFromJobs(jobs: Job[]): { id: JobKind; label: string; count: number }[] {
  const counts = new Map<JobKind, number>();
  for (const job of jobs) {
    const kind = job.kind ?? inferKind(job);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: kindLabel(id), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Streams present in the loaded jobs, with live counts from data. */
export function streamsFromJobs(jobs: Job[]): { id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const stream = job.stream?.trim();
    if (!stream) continue;
    counts.set(stream, (counts.get(stream) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
