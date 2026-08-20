import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { JobCard } from "@/components/JobCard";
import { JobsExplorer } from "@/components/JobsExplorer";
import { ForYou } from "@/components/ForYou";
import { LoadingPanel } from "@/components/LoadingPanel";
import { JOB_KINDS, inferKind } from "@/lib/catalog";
import { COMPANY_BY_SLUG } from "@/lib/companies";
import { fitScore, PROMPTS } from "@/lib/insights";
import { useJobs } from "@/context/JobsContext";

export function HomePage() {
  const { jobs, loading } = useJobs();
  if (loading) return <LoadingPanel />;

  const companies = new Set(jobs.map((job) => job.companySlug));
  const cities = new Set(jobs.map((job) => job.city));
  const fresherCount = jobs.filter((job) => inferKind(job) === "fresher").length;
  const picks = [...jobs]
    .filter((job) => ["fresher", "freelance", "typing", "excel"].includes(inferKind(job)))
    .sort((a, b) => fitScore(b) - fitScore(a))
    .slice(0, 4);
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

  const companyCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const job of jobs) {
    const current = companyCounts.get(job.companySlug);
    if (current) current.count += 1;
    else companyCounts.set(job.companySlug, { slug: job.companySlug, name: job.company, count: 1 });
  }
  const boardCompanies = [...companyCounts.values()].sort((a, b) => b.count - a.count);
  const departments = [...new Set(jobs.map((job) => job.department))].sort();

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <p className="text-[11px] tracking-[0.28em] text-gold uppercase">
            India · {jobs.length.toLocaleString("en-IN")}+ roles · fresher to freelance
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.6rem] leading-[1.08] text-text sm:text-6xl lg:text-7xl">
            Freelancing, typing, Excel, and fresher jobs — every stream.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            B.Tech, B.Com, BBA, Arts, Diploma, 12th pass, ITI — plus WFH typing, Excel MIS, and
            freelance desk work. Live global tech boards sit beside them.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar jobs={jobs} />
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {JOB_KINDS.filter((item) => item.id !== "global").map((item) => (
                <Link
                  key={item.id}
                  to={`/?kind=${item.id}#board`}
                  className="shrink-0 border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-text"
                >
                  {item.label}
                </Link>
              ))}
              {PROMPTS.slice(0, 3).map((prompt) => (
                <Link
                  key={prompt}
                  to={`/?q=${encodeURIComponent(prompt)}#board`}
                  className="shrink-0 border border-line px-3 py-2 text-xs text-muted hover:border-gold hover:text-text"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </div>
          <dl className="mt-10 flex max-w-2xl divide-x divide-line border-y border-line">
            <Stat value={jobs.length} label="Roles" />
            <Stat value={fresherCount} label="Fresher" />
            <Stat value={companies.size} label="Desks" />
            <Stat value={cities.size} label="Cities" />
          </dl>
        </div>
      </section>

      <section id="board" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="text-[11px] tracking-[0.24em] text-gold uppercase">The board</p>
          <h2 className="mt-1 font-display text-[2rem] leading-tight sm:text-5xl">
            {jobs.length.toLocaleString("en-IN")}+ India roles
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Freelance · typing · Excel · fresher (all streams) · plus live global tech hiring in India.
          </p>
          <div className="mt-5 sm:mt-8">
            <JobsExplorer jobs={jobs} companies={boardCompanies} departments={departments} />
          </div>
        </div>
      </section>

      <ForYou jobs={jobs} />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Start here</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl">Typing · Excel · Fresher</h2>
          </div>
          <Link to="/?kind=fresher#board" className="shrink-0 text-sm text-gold">
            Open fresher board
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
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Desks</p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">Where openings cluster</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company) => (
              <Link
                key={company.slug}
                to={`/companies/${company.slug}`}
                className="card-hover border border-line bg-surface p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl">{company.name}</h3>
                  <span className="text-sm text-gold">{company.count.toLocaleString("en-IN")}</span>
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
          title="Pick a lane"
          body="Fresher by stream, freelance WFH, typing desks, or Excel MIS — filter once and browse thousands."
        />
        <Step
          n="II"
          title="Every stream"
          body="B.Tech, B.Com, BBA, Arts, Science, Diploma, MBA, 12th pass, ITI — campus and office paths together."
        />
        <Step
          n="III"
          title="Apply outward"
          body="Open the listing and continue on the employer or India job board. Nothing stays on Meridian."
        />
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 px-2 py-3 sm:px-4 sm:py-4">
      <dt className="text-[10px] tracking-[0.18em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-xl sm:text-3xl">{value.toLocaleString("en-IN")}</dd>
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
