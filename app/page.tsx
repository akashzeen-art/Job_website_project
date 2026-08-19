import { Suspense } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { JobCard } from "@/components/JobCard";
import { ForYou } from "@/components/ForYou";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { fitScore, PROMPTS } from "@/lib/insights";
import { getJobs } from "@/lib/jobs";

export default async function HomePage() {
  const jobs = await getJobs();
  const companies = new Set(jobs.map((job) => job.companySlug));
  const cities = new Set(jobs.map((job) => job.city));
  const picks = [...jobs].sort((a, b) => fitScore(b) - fitScore(a)).slice(0, 4);
  const topCompanies = [...companies]
    .map((slug) => ({
      slug,
      name: COMPANY_BY_SLUG[slug]?.name ?? slug,
      count: jobs.filter((job) => job.companySlug === slug).length,
      hq: COMPANY_BY_SLUG[slug]?.hq ?? "",
      industry: COMPANY_BY_SLUG[slug]?.industry ?? "",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <p className="text-[11px] tracking-[0.28em] text-gold uppercase">
            Live · {jobs.length} roles · {companies.size} houses
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.6rem] leading-[1.08] text-text sm:text-6xl lg:text-7xl">
            A private board for global houses hiring in India.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Stripe, NVIDIA, OpenAI, Databricks, and forty more — read from their own career pages,
            kept only when the desk is here.
          </p>
          <div className="mt-8 max-w-2xl">
            <Suspense fallback={<div className="h-14 shimmer" />}>
              <SearchBar jobs={jobs} />
            </Suspense>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {PROMPTS.slice(0, 4).map((prompt) => (
                <Link
                  key={prompt}
                  href={`/jobs?q=${encodeURIComponent(prompt)}`}
                  className="shrink-0 border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-text"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </div>
          <dl className="mt-10 flex max-w-xl divide-x divide-line border-y border-line">
            <Stat value={jobs.length} label="Roles" />
            <Stat value={companies.size} label="Houses" />
            <Stat value={cities.size} label="Cities" />
          </dl>
        </div>
      </section>

      <ForYou jobs={jobs} />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Selected</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl">Worth opening first</h2>
          </div>
          <Link href="/jobs" className="shrink-0 text-sm text-gold">
            The board
          </Link>
        </div>
        <div className="grid gap-3">
          {picks.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Houses</p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">Abroad at home</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="card-hover border border-line bg-surface p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl">{company.name}</h3>
                  <span className="text-sm text-gold">{company.count}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {company.industry} · {company.hq}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3 md:gap-10">
        <Step
          n="I"
          title="Ask plainly"
          body="A city, a house, a craft. Meridian reads the sentence and keeps India-based desks."
        />
        <Step
          n="II"
          title="Open with taste"
          body="Fit is recency, hub, and house — a quiet score, not a résumé theatre."
        />
        <Step
          n="III"
          title="Apply at source"
          body="Greenhouse, Ashby, Workday. No second account. No résumé left here."
        />
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 px-3 py-3 sm:px-5 sm:py-4">
      <dt className="text-[10px] tracking-[0.18em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-2xl sm:text-3xl">{value}</dd>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-gold">{n}</p>
      <h3 className="mt-3 font-display text-2xl sm:text-3xl">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
    </div>
  );
}
