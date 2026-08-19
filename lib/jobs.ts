import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { COMPANIES, COMPANY_BY_SLUG } from "@/lib/companies";
import { encodeJobId } from "@/lib/ids";
import { decodeGreenhouseHtml, sanitizeHtml } from "@/lib/html";
import { inferDepartment, mentionsIndia, normalizeCity } from "@/lib/india";
import type { Company, Job, JobDetail } from "@/lib/types";

const CACHE_PATH = path.join(process.cwd(), ".cache", "jobs.json");
const CACHE_MS = 30 * 60 * 1000;
const USER_AGENT = "MeridianJobs/1.0 (+https://localhost; India hiring aggregator)";

type CachedPayload = {
  fetchedAt: number;
  jobs: Job[];
};

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const method = (init?.method ?? "GET").toUpperCase();
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(18_000),
    cache: method === "GET" ? "force-cache" : "no-store",
    next: method === "GET" ? { revalidate: 1800 } : undefined,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

function makeJob(partial: Omit<Job, "id" | "city" | "department"> & { department?: string | null }): Job {
  return {
    id: encodeJobId(partial.ats, partial.companySlug, partial.sourceId),
    sourceId: partial.sourceId,
    ats: partial.ats,
    company: partial.company,
    companySlug: partial.companySlug,
    title: partial.title.trim(),
    location: partial.location.trim() || "India",
    city: normalizeCity(partial.location),
    department: inferDepartment(partial.title, partial.department),
    url: partial.url,
    postedAt: partial.postedAt,
    postedLabel: partial.postedLabel,
    workplaceType: partial.workplaceType,
  };
}

function greenhouseLocation(job: {
  location?: { name?: string };
  offices?: { name?: string; location?: string }[];
}): string {
  const loc = job.location?.name ?? "";
  const offices = (job.offices ?? [])
    .map((office) => [office.name, office.location].filter(Boolean).join(" "))
    .join(" · ");
  return [loc, offices].filter(Boolean).join(" · ");
}

async function fetchGreenhouse(company: Company): Promise<Job[]> {
  const token = company.token;
  if (!token) return [];
  const data = (await getJson(
    `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`,
  )) as {
    jobs?: {
      id: number;
      title: string;
      absolute_url: string;
      first_published?: string;
      updated_at?: string;
      location?: { name?: string };
      offices?: { name?: string; location?: string }[];
      departments?: { name?: string }[];
    }[];
  };
  return (data.jobs ?? [])
    .map((job) => {
      const location = greenhouseLocation(job);
      if (!mentionsIndia(location)) return null;
      return makeJob({
        sourceId: String(job.id),
        ats: "greenhouse",
        company: company.name,
        companySlug: company.slug,
        title: job.title,
        location,
        department: job.departments?.[0]?.name,
        url: job.absolute_url,
        postedAt: job.first_published ?? job.updated_at ?? null,
        postedLabel: null,
        workplaceType: /remote/i.test(location) ? "Remote" : null,
      });
    })
    .filter((job): job is Job => job !== null);
}

async function fetchAshby(company: Company): Promise<Job[]> {
  const token = company.token;
  if (!token) return [];
  const data = (await getJson(
    `https://api.ashbyhq.com/posting-api/job-board/${token}`,
  )) as {
    jobs?: {
      id: string;
      title: string;
      department?: string;
      location?: string;
      secondaryLocations?: { location?: string }[];
      workplaceType?: string;
      employmentType?: string;
      publishedAt?: string;
      jobUrl?: string;
      applyUrl?: string;
    }[];
  };
  return (data.jobs ?? [])
    .map((job) => {
      const locations = [
        job.location ?? "",
        ...(job.secondaryLocations ?? []).map((item) => item.location ?? ""),
      ];
      if (!locations.some((location) => mentionsIndia(location))) return null;
      const indiaLocations = locations.filter((location) => mentionsIndia(location));
      return makeJob({
        sourceId: job.id,
        ats: "ashby",
        company: company.name,
        companySlug: company.slug,
        title: job.title,
        location: indiaLocations.join(" · ") || locations.join(" · "),
        department: job.department,
        url: job.jobUrl || job.applyUrl || "",
        postedAt: job.publishedAt ?? null,
        postedLabel: null,
        workplaceType: job.workplaceType ?? null,
      });
    })
    .filter((job): job is Job => job !== null);
}

async function fetchWorkday(company: Company): Promise<Job[]> {
  const board = company.workday;
  if (!board) return [];
  const endpoint = `https://${board.host}/wday/cxs/${board.tenant}/${board.site}/jobs`;
  const collected: Job[] = [];
  const pageSize = 20;
  const maxPages = 12;
  let offset = 0;
  for (let page = 0; page < maxPages; page += 1) {
    const data = (await getJson(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        limit: pageSize,
        offset,
        searchText: "India",
      }),
    })) as {
      total?: number;
      jobPostings?: {
        title?: string;
        locationsText?: string;
        postedOn?: string;
        externalPath?: string;
        timeType?: string;
        bulletFields?: string[];
      }[];
    };
    const postings = data.jobPostings ?? [];
    for (const posting of postings) {
      const location = posting.locationsText || (posting.bulletFields ?? []).join(" · ");
      const pathName = posting.externalPath ?? "";
      const blob = `${location} ${pathName} ${posting.title ?? ""}`;
      if (!mentionsIndia(blob)) continue;
      if (!pathName) continue;
      collected.push(
        makeJob({
          sourceId: pathName,
          ats: "workday",
          company: company.name,
          companySlug: company.slug,
          title: posting.title ?? "Open role",
          location: location || "India",
          department: null,
          url: `https://${board.host}/${board.site}${pathName}`,
          postedAt: null,
          postedLabel: posting.postedOn ?? null,
          workplaceType: posting.timeType ?? null,
        }),
      );
    }
    offset += pageSize;
    if (postings.length < pageSize || (typeof data.total === "number" && offset >= data.total)) {
      break;
    }
  }
  return collected;
}

async function fetchCompanyJobs(company: Company): Promise<Job[]> {
  try {
    if (company.ats === "greenhouse") return await fetchGreenhouse(company);
    if (company.ats === "ashby") return await fetchAshby(company);
    return await fetchWorkday(company);
  } catch (error) {
    console.warn(`[meridian] skipped ${company.name}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

function recency(job: Job): number {
  if (job.postedAt) {
    const time = Date.parse(job.postedAt);
    if (!Number.isNaN(time)) return time;
  }
  const label = (job.postedLabel ?? "").toLowerCase();
  const days = label.match(/(\d+)\s+day/);
  if (days) return Date.now() - Number(days[1]) * 86_400_000;
  const hours = label.match(/(\d+)\s+hour/);
  if (hours) return Date.now() - Number(hours[1]) * 3_600_000;
  if (/today|just posted|posted today/.test(label)) return Date.now();
  return 0;
}

function uniqueJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  const unique: Job[] = [];
  for (const job of jobs) {
    const key = `${job.companySlug}:${job.title}:${job.city}`.toLowerCase();
    if (seen.has(key) || seen.has(job.id)) continue;
    seen.add(key);
    seen.add(job.id);
    unique.push(job);
  }
  return unique.sort((a, b) => recency(b) - recency(a));
}

async function readFileCache(): Promise<CachedPayload | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.jobs || !parsed.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeFileCache(jobs: Job[]): Promise<void> {
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  const payload: CachedPayload = { fetchedAt: Date.now(), jobs };
  await writeFile(CACHE_PATH, JSON.stringify(payload));
}

async function fetchAllJobs(): Promise<Job[]> {
  const groups = await mapPool(COMPANIES, 8, fetchCompanyJobs);
  const jobs = uniqueJobs(groups.flat());
  console.info(`[meridian] fetched ${jobs.length} India roles from ${COMPANIES.length} companies`);
  await writeFileCache(jobs);
  return jobs;
}

export const getJobs = cache(async (): Promise<Job[]> => {
  const cached = await readFileCache();
  if (cached) return cached.jobs;
  return fetchAllJobs();
});

export async function getJob(id: string): Promise<JobDetail | null> {
  const jobs = await getJobs();
  const job = jobs.find((item) => item.id === id);
  if (!job) return null;
  const company = COMPANY_BY_SLUG[job.companySlug];
  const descriptionHtml = company ? await fetchDescription(job, company) : "";
  return { ...job, descriptionHtml };
}

async function fetchDescription(job: Job, company: Company): Promise<string> {
  try {
    if (job.ats === "greenhouse" && company.token) {
      const data = (await getJson(
        `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs/${job.sourceId}`,
      )) as { content?: string };
      return sanitizeHtml(decodeGreenhouseHtml(data.content ?? ""));
    }
    if (job.ats === "ashby" && company.token) {
      const data = (await getJson(
        `https://api.ashbyhq.com/posting-api/job-board/${company.token}`,
      )) as { jobs?: { id: string; descriptionHtml?: string }[] };
      const match = data.jobs?.find((item) => item.id === job.sourceId);
      return sanitizeHtml(match?.descriptionHtml ?? "");
    }
    if (job.ats === "workday" && company.workday) {
      const board = company.workday;
      const data = (await getJson(
        `https://${board.host}/wday/cxs/${board.tenant}/${board.site}${job.sourceId}`,
      )) as {
        jobPostingInfo?: { jobDescription?: string };
      };
      return sanitizeHtml(data.jobPostingInfo?.jobDescription ?? "");
    }
  } catch (error) {
    console.warn(
      `[meridian] description skipped for ${job.company} ${job.title}:`,
      error instanceof Error ? error.message : error,
    );
  }
  return "";
}

export function filterJobs(
  jobs: Job[],
  query: {
    q?: string;
    city?: string;
    company?: string;
    department?: string;
  },
): Job[] {
  const q = query.q?.trim().toLowerCase();
  return jobs.filter((job) => {
    if (q) {
      const haystack = `${job.title} ${job.company} ${job.location} ${job.department}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (query.city && job.city !== query.city) return false;
    if (query.company && job.companySlug !== query.company) return false;
    if (query.department && job.department !== query.department) return false;
    return true;
  });
}
