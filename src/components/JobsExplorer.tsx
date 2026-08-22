import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { categoriesFromJobs, inferKind, streamsFromJobs } from "@/lib/catalog";
import { CITIES } from "@/lib/india";
import { parseIntent } from "@/lib/intent";
import { fitScore } from "@/lib/insights";
import type { Job } from "@/lib/types";
import { JobCard } from "@/components/JobCard";
import { SearchBar } from "@/components/SearchBar";

const PAGE_SIZES = [12, 24, 48, 100, 250] as const;

type Props = {
  jobs: Job[];
  companies: { slug: string; name: string; count: number }[];
  departments: string[];
};

export function JobsExplorer({ jobs, companies, departments }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(24);
  const [pageDraft, setPageDraft] = useState("1");
  const [sort, setSort] = useState<"fit" | "new">("fit");

  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const company = searchParams.get("company") ?? "";
  const department = searchParams.get("department") ?? "";
  const kind = searchParams.get("kind") ?? "";
  const stream = searchParams.get("stream") ?? "";
  const intent = useMemo(() => parseIntent(q), [q]);
  const deferredQ = useDeferredValue(q);
  const deferredCity = useDeferredValue(city);
  const deferredCompany = useDeferredValue(company);
  const deferredDepartment = useDeferredValue(department);
  const deferredKind = useDeferredValue(kind);
  const deferredStream = useDeferredValue(stream);
  const deferredIntent = useDeferredValue(intent);

  useEffect(() => {
    setPage(1);
  }, [q, city, company, department, kind, stream, sort, pageSize]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = sheetOpen ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [sheetOpen]);

  const filtered = useMemo(() => {
    // URL params win; intent only fills gaps. Text is always the cleaned leftover from q.
    const cityFilter = deferredCity || deferredIntent.city || "";
    const companyFilter = deferredCompany || deferredIntent.company || "";
    const departmentFilter = deferredDepartment || deferredIntent.department || "";
    const kindFilter = deferredKind || deferredIntent.kind || "";
    const streamFilter = deferredStream || deferredIntent.stream || "";
    const text = deferredIntent.q.trim().toLowerCase();
    const tokens = text ? text.split(/\s+/).filter((token) => token.length > 1) : [];

    const next: Job[] = [];
    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      if (kindFilter && (job.kind ?? inferKind(job)) !== kindFilter) continue;
      if (cityFilter && job.city !== cityFilter) continue;
      if (companyFilter && job.companySlug !== companyFilter) continue;
      if (departmentFilter && job.department !== departmentFilter) continue;
      if (streamFilter) {
        const blob = `${job.stream ?? ""} ${job.title} ${job.department}`;
        if (!blob.toLowerCase().includes(streamFilter.toLowerCase())) continue;
      }
      if (tokens.length) {
        const haystack =
          `${job.title} ${job.company} ${job.location} ${job.department} ${job.stream ?? ""}`.toLowerCase();
        if (!tokens.every((token) => haystack.includes(token))) continue;
      }
      next.push(job);
    }

    if (sort === "new") {
      return next.sort(
        (a, b) => (Date.parse(b.postedAt ?? "") || 0) - (Date.parse(a.postedAt ?? "") || 0),
      );
    }
    if (!deferredQ.trim()) return next;
    return next.sort((a, b) => fitScore(b, deferredQ) - fitScore(a, deferredQ));
  }, [
    jobs,
    deferredQ,
    deferredCity,
    deferredCompany,
    deferredDepartment,
    deferredKind,
    deferredStream,
    deferredIntent,
    sort,
  ]);

  const activeKind = kind || intent.kind || "";
  const activeCity = city || intent.city || "";
  const activeStream = stream || intent.stream || "";
  const activeCompany = company || intent.company || "";
  const activeDepartment = department || intent.department || "";

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  useEffect(() => {
    setPageDraft(String(currentPage));
  }, [currentPage]);

  function goToPage(next: number) {
    const clamped = Math.max(1, Math.min(pages, Math.floor(next) || 1));
    setPage(clamped);
    setPageDraft(String(clamped));
    const board = document.getElementById("board");
    if (board) board.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function commitPageDraft() {
    goToPage(Number(pageDraft));
  }

  const understood = [
    activeKind,
    activeStream,
    activeCity,
    companies.find((item) => item.slug === activeCompany)?.name,
  ]
    .filter(Boolean)
    .join(" · ");
  const categories = useMemo(() => categoriesFromJobs(jobs), [jobs]);
  const streamOptions = useMemo(() => streamsFromJobs(jobs), [jobs]);
  const cityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) counts.set(job.city, (counts.get(job.city) ?? 0) + 1);
    return CITIES.filter((item) => (counts.get(item) ?? 0) > 0).map((item) => ({
      id: item,
      count: counts.get(item) ?? 0,
    }));
  }, [jobs]);
  const activeFilters = [activeCity, activeCompany, activeDepartment, activeKind, activeStream].filter(
    Boolean,
  ).length;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    // Structured filters replace free-text so leftover intent words cannot zero out results.
    if (key === "kind" || key === "city" || key === "stream" || key === "company" || key === "department") {
      params.delete("q");
    }
    const query = params.toString();
    navigate(query ? `${pathname}?${query}` : pathname, { replace: true });
  }

  function clearFilters() {
    setPage(1);
    navigate(pathname, { replace: true });
    setSheetOpen(false);
  }

  const filters = (
    <div className="space-y-6">
      <FilterGroup label="Category">
        <FilterChip active={!activeKind} onClick={() => setParam("kind", "")} label="All" />
        {categories.map((item) => (
          <FilterChip
            key={item.id}
            active={activeKind === item.id}
            onClick={() => setParam("kind", activeKind === item.id ? "" : item.id)}
            label={`${item.label} (${item.count.toLocaleString("en-IN")})`}
          />
        ))}
      </FilterGroup>
      {streamOptions.length > 0 ? (
        <FilterGroup label="Stream">
          <FilterChip active={!activeStream} onClick={() => setParam("stream", "")} label="All streams" />
          {streamOptions.map((item) => (
            <FilterChip
              key={item.id}
              active={activeStream === item.id}
              onClick={() => setParam("stream", activeStream === item.id ? "" : item.id)}
              label={`${item.id} (${item.count.toLocaleString("en-IN")})`}
            />
          ))}
        </FilterGroup>
      ) : null}
      <FilterGroup label="City">
        <FilterChip active={!activeCity} onClick={() => setParam("city", "")} label="All India" />
        {cityOptions.map((item) => (
          <FilterChip
            key={item.id}
            active={activeCity === item.id}
            onClick={() => setParam("city", activeCity === item.id ? "" : item.id)}
            label={`${item.id} (${item.count.toLocaleString("en-IN")})`}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Function">
        <FilterChip active={!activeDepartment} onClick={() => setParam("department", "")} label="All" />
        {departments.map((item) => (
          <FilterChip
            key={item}
            active={activeDepartment === item}
            onClick={() => setParam("department", activeDepartment === item ? "" : item)}
            label={item}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Employer">
        <select
          value={activeCompany}
          onChange={(event) => setParam("company", event.target.value)}
          className="h-12 w-full max-w-full border border-line bg-bg px-3 text-sm text-text outline-none"
        >
          <option value="">All employers</option>
          {companies.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name} ({item.count})
            </option>
          ))}
        </select>
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border border-line bg-surface p-5">
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        <SearchBar defaultQuery={q} compact jobs={jobs} />

        <div className="-mx-4 mt-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 snap-x">
            <FilterChip active={!activeKind} onClick={() => setParam("kind", "")} label="All" />
            {categories.map((item) => (
              <FilterChip
                key={item.id}
                active={activeKind === item.id}
                onClick={() => setParam("kind", activeKind === item.id ? "" : item.id)}
                label={`${item.label} · ${item.count.toLocaleString("en-IN")}`}
              />
            ))}
          </div>
        </div>

        <div className="-mx-4 mt-2 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 snap-x">
            <FilterChip active={!activeCity} onClick={() => setParam("city", "")} label="All India" />
            {cityOptions.map((item) => (
              <FilterChip
                key={item.id}
                active={activeCity === item.id}
                onClick={() => setParam("city", activeCity === item.id ? "" : item.id)}
                label={item.id}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm text-muted">
            <span className="text-text">{filtered.length.toLocaleString("en-IN")}</span> roles
          </p>
          <div className="flex shrink-0 items-center gap-3 text-[11px] tracking-[0.12em] uppercase">
            <button
              type="button"
              onClick={() => setSort("fit")}
              className={sort === "fit" ? "text-gold" : "text-muted"}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setSort("new")}
              className={sort === "new" ? "text-gold" : "text-muted"}
            >
              New
            </button>
            <button
              type="button"
              className="border border-line px-2.5 py-1.5 lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              Filter{activeFilters ? ` · ${activeFilters}` : ""}
            </button>
          </div>
        </div>

        {understood && q ? (
          <p className="mt-3 text-sm text-gold">
            {understood}
            {intent.q ? ` · ${intent.q}` : ""}
          </p>
        ) : null}

        {sheetOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close filters"
              onClick={() => setSheetOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col border-t border-line bg-bg">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="font-display text-2xl">Refine</h2>
                <button type="button" className="text-sm text-gold" onClick={() => setSheetOpen(false)}>
                  Done
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5">{filters}</div>
              <div
                className="flex gap-2 border-t border-line px-4 pt-3"
                style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom))" }}
              >
                <button
                  type="button"
                  className="h-11 flex-1 border border-line text-sm"
                  onClick={clearFilters}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="h-11 flex-1 bg-wine text-sm tracking-[0.12em] uppercase"
                  onClick={() => setSheetOpen(false)}
                >
                  Show {filtered.length.toLocaleString("en-IN")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {visible.length === 0 ? (
          <div className="mt-4 border border-dashed border-line px-4 py-12 text-center">
            <p className="text-muted">Nothing matched for these filters.</p>
            <button type="button" className="mt-4 text-sm text-gold" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {visible.map((job) => (
              <JobCard key={job.id} job={job} query={q} dense />
            ))}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="mt-6 mb-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <p>
                Showing{" "}
                <span className="text-text">
                  {rangeStart.toLocaleString("en-IN")}–{rangeEnd.toLocaleString("en-IN")}
                </span>{" "}
                of {filtered.length.toLocaleString("en-IN")}
              </p>
              <label className="flex items-center gap-2">
                <span className="text-[11px] tracking-[0.12em] uppercase">Per page</span>
                <select
                  value={pageSize}
                  onChange={(event) =>
                    setPageSize(Number(event.target.value) as (typeof PAGE_SIZES)[number])
                  }
                  className="h-9 border border-line bg-bg px-2 text-sm text-text outline-none"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {pages > 1 ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="h-11 border border-line text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <form
                  className="flex items-center gap-1.5 text-sm text-muted"
                  onSubmit={(event) => {
                    event.preventDefault();
                    commitPageDraft();
                  }}
                >
                  <input
                    type="number"
                    min={1}
                    max={pages}
                    inputMode="numeric"
                    value={pageDraft}
                    onChange={(event) => setPageDraft(event.target.value)}
                    onBlur={commitPageDraft}
                    aria-label="Page number"
                    className="h-11 w-14 border border-line bg-bg text-center text-text outline-none"
                  />
                  <span>/ {pages.toLocaleString("en-IN")}</span>
                </form>
                <button
                  type="button"
                  disabled={currentPage === pages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="h-11 border border-line text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[10px] tracking-[0.2em] text-muted uppercase">{label}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 snap-start px-3 text-xs ${
        active ? "bg-text text-bg" : "border border-line text-muted"
      }`}
    >
      {label}
    </button>
  );
}
