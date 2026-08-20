import { encodeJobId } from "@/lib/ids";
import type { Ats, Job } from "@/lib/types";

export type JobKind = "fresher" | "freelance" | "typing" | "excel" | "global";

export const JOB_KINDS: { id: JobKind; label: string }[] = [
  { id: "fresher", label: "Fresher" },
  { id: "freelance", label: "Freelance" },
  { id: "typing", label: "Typing" },
  { id: "excel", label: "Excel" },
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
  { slug: "typing-speed-desk", name: "Typing Speed Desk", industry: "Data Entry", website: "https://in.indeed.com" },
  { slug: "graduate-first-desk", name: "Graduate First Desk", industry: "Entry Level", website: "https://in.indeed.com" },
  { slug: "skill-bridge-india", name: "Skill Bridge India", industry: "Skilling", website: "https://in.indeed.com" },
  { slug: "city-ops-collective", name: "City Ops Collective", industry: "Operations", website: "https://in.indeed.com" },
];

const TYPING_TITLES = [
  "Online Typing Operator",
  "Data Entry Typing Executive",
  "English Typing Clerk",
  "Hindi Typing Operator",
  "Form Filling & Typing Associate",
  "PDF Typing Specialist",
  "Court Typing Assistant",
  "Medical Typing Operator",
  "WFH Typing Jobs — Part Time",
  "Night Shift Typing Executive",
  "Copy Typing Associate",
  "Transcription & Typing Freelancer",
  "Speed Typing Operator (40+ WPM)",
  "Back Office Typing Staff",
  "Invoice Typing Executive",
];

const EXCEL_TITLES = [
  "MS Excel Data Analyst — Fresher",
  "Excel MIS Executive",
  "Advanced Excel Operator",
  "Excel & Google Sheets Associate",
  "VLOOKUP / Pivot Table Specialist",
  "Accounts Excel Assistant",
  "Inventory Excel Executive",
  "Excel Reporting Analyst",
  "HR Excel MIS Executive",
  "Sales Excel Tracker Executive",
  "Excel Data Cleaning Associate",
  "Spreadsheet Fresher — WFH",
  "Excel Billing Executive",
  "Financial Excel Assistant",
  "Excel Dashboard Junior Analyst",
];

const FREELANCE_TITLES = [
  "Freelance Data Entry",
  "Freelance Typing Projects",
  "Freelance Excel Sheet Work",
  "Freelance Form Filling",
  "Freelance Content Typing",
  "Freelance Virtual Assistant",
  "Freelance Online Survey Work",
  "Freelance Caption / Subtitle Typing",
  "Freelance Invoice Processing",
  "Freelance Catalog Data Entry",
  "Freelance Resume Formatting (Word/Excel)",
  "Freelance Back Office Support",
  "Freelance Lead List Typing",
  "Freelance Part-Time Excel Work",
  "Freelance Document Digitization",
];

const FRESHER_BY_STREAM: Record<(typeof STREAMS)[number], string[]> = {
  "Any Graduate": [
    "Graduate Trainee",
    "Fresher Customer Support",
    "Office Assistant — Fresher",
    "Junior Operations Associate",
  ],
  "B.Tech / BE": [
    "Graduate Engineer Trainee",
    "Junior Software Support Fresher",
    "IT Helpdesk Fresher",
    "QA / Testing Fresher",
  ],
  "B.Com": [
    "Accounts Fresher",
    "Junior Accountant — B.Com",
    "Billing Executive Fresher",
    "Audit Support Fresher",
  ],
  "BBA / BBM": [
    "Management Trainee — BBA",
    "Business Operations Fresher",
    "Sales Coordinator Fresher",
    "HR Coordinator Fresher",
  ],
  "BA / Arts": [
    "Content Support Fresher — Arts",
    "Admin Executive Fresher",
    "Client Relation Fresher",
    "Library / Documentation Fresher",
  ],
  "B.Sc": [
    "Lab / Process Fresher — B.Sc",
    "Science Graduate Trainee",
    "Quality Check Fresher",
    "Research Assistant Fresher",
  ],
  Diploma: [
    "Diploma Trainee — Technical",
    "Junior Technician Fresher",
    "CAD Support Fresher",
    "Workshop / Field Fresher",
  ],
  "MBA / PG": [
    "MBA Management Trainee",
    "Business Analyst Fresher — PG",
    "Marketing Associate Fresher",
    "Finance Analyst Fresher — MBA",
  ],
  "12th Pass": [
    "Office Boy / Front Desk — 12th Pass",
    "Data Entry Fresher — 12th Pass",
    "Reception Assistant",
    "Store Assistant — Fresher",
  ],
  "ITI / Polytechnic": [
    "ITI Apprentice / Trainee",
    "Polytechnic Diploma Fresher",
    "Machine Operator Trainee",
    "Maintenance Support Fresher",
  ],
};

const KIND_EMPLOYERS: Record<Exclude<JobKind, "global">, string[]> = {
  typing: ["typing-speed-desk", "metro-bpo-hub", "work-from-home-desk", "india-office-network"],
  excel: ["excel-talent-pool", "india-office-network", "skill-bridge-india", "city-ops-collective"],
  freelance: ["freelance-india-board", "work-from-home-desk", "typing-speed-desk", "excel-talent-pool"],
  fresher: ["campus-hire-india", "graduate-first-desk", "skill-bridge-india", "metro-bpo-hub", "city-ops-collective"],
};

function indeedUrl(title: string, city: string): string {
  const q = encodeURIComponent(`${title} India`);
  const l = encodeURIComponent(city === "Remote India" ? "India" : `${city}, India`);
  return `https://in.indeed.com/jobs?q=${q}&l=${l}`;
}

function departmentFor(kind: Exclude<JobKind, "global">, stream?: string): string {
  if (kind === "typing") return "Typing & Data Entry";
  if (kind === "excel") return "Excel & MIS";
  if (kind === "freelance") return "Freelance / WFH";
  return stream ? `Fresher · ${stream}` : "Fresher";
}

function makeCatalogJob(input: {
  index: number;
  kind: Exclude<JobKind, "global">;
  title: string;
  city: string;
  employer: Employer;
  stream?: string;
}): Job & { kind: JobKind; stream: string | null } {
  const sourceId = `${input.kind}-${input.index}`;
  const postedDays = (input.index * 7) % 28;
  const postedAt = new Date(Date.now() - postedDays * 86_400_000).toISOString();
  return {
    id: encodeJobId("catalog", input.employer.slug, sourceId),
    sourceId,
    ats: "catalog" as Ats,
    company: input.employer.name,
    companySlug: input.employer.slug,
    title: input.stream ? `${input.title} (${input.stream})` : input.title,
    location: `${input.city}, India`,
    city: input.city,
    department: departmentFor(input.kind, input.stream),
    url: indeedUrl(input.title, input.city),
    postedAt,
    postedLabel: postedDays === 0 ? "Posted today" : `Posted ${postedDays} days ago`,
    workplaceType: input.city === "Remote India" || input.kind === "freelance" ? "Remote" : "On-site / Hybrid",
    kind: input.kind,
    stream: input.stream ?? null,
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

/** Builds 3000+ fresher / freelance / typing / Excel roles across India. */
export function buildCatalogJobs(): Array<Job & { kind: JobKind; stream: string | null }> {
  const jobs: Array<Job & { kind: JobKind; stream: string | null }> = [];
  const employerBySlug = Object.fromEntries(EMPLOYERS.map((e) => [e.slug, e]));
  let index = 0;

  function push(
    kind: Exclude<JobKind, "global">,
    title: string,
    city: string,
    employerSlug: string,
    stream?: string,
  ) {
    const employer = employerBySlug[employerSlug];
    if (!employer) return;
    jobs.push(makeCatalogJob({ index: index++, kind, title, city, employer, stream }));
  }

  for (const title of TYPING_TITLES) {
    for (const city of CITIES) {
      for (const slug of KIND_EMPLOYERS.typing) {
        push("typing", title, city, slug);
      }
    }
  }

  for (const title of EXCEL_TITLES) {
    for (const city of CITIES) {
      for (const slug of KIND_EMPLOYERS.excel) {
        push("excel", title, city, slug);
      }
    }
  }

  for (const title of FREELANCE_TITLES) {
    for (const city of CITIES) {
      for (const slug of KIND_EMPLOYERS.freelance) {
        push("freelance", title, city, slug);
      }
    }
  }

  for (const stream of STREAMS) {
    for (const title of FRESHER_BY_STREAM[stream]) {
      for (const city of CITIES) {
        for (const slug of KIND_EMPLOYERS.fresher.slice(0, 3)) {
          push("fresher", title, city, slug, stream);
        }
      }
    }
  }

  return jobs;
}

export function inferKind(job: Job): JobKind {
  const withKind = job as Job & { kind?: JobKind };
  if (withKind.kind) return withKind.kind;
  if (job.ats === "catalog") {
    const id = job.sourceId;
    if (id.startsWith("typing")) return "typing";
    if (id.startsWith("excel")) return "excel";
    if (id.startsWith("freelance")) return "freelance";
    if (id.startsWith("fresher")) return "fresher";
  }
  const blob = `${job.title} ${job.department}`.toLowerCase();
  if (/\b(typist|typing|data entry|form filling)\b/.test(blob)) return "typing";
  if (/\b(excel|spreadsheet|mis executive|vlookup|pivot)\b/.test(blob)) return "excel";
  if (/\b(freelance|gig|part.?time wfh|virtual assistant)\b/.test(blob)) return "freelance";
  if (/\b(fresher|trainee|graduate|entry.?level|intern)\b/.test(blob)) return "fresher";
  return "global";
}
