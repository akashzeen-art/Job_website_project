import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PROMPTS } from "@/lib/insights";
import type { Job } from "@/lib/types";
import { scrollToBoard } from "@/utils/scrollToBoard";

type Props = {
  defaultQuery?: string;
  compact?: boolean;
  jobs?: Job[];
};

export function SearchBar({ defaultQuery = "", compact = false, jobs = [] }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const out: Job[] = [];
    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      if (`${job.title} ${job.company} ${job.city}`.toLowerCase().includes(needle)) {
        out.push(job);
        if (out.length >= 5) break;
      }
    }
    return out;
  }, [jobs, query]);

  function go(nextQuery: string, href?: string) {
    const value = nextQuery.trim();
    if (value) window.localStorage.setItem("meridian:intent", value);
    if (href) {
      navigate(href);
      setOpen(false);
      return;
    }
    const params = compact
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    if (value) params.set("q", value);
    else params.delete("q");
    const base = pathname === "/" ? "/" : "/jobs";
    const queryString = params.toString() ? `?${params}` : "";
    navigate(`${base}${queryString}`);
    if (base === "/") scrollToBoard();
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
        className={
          compact
            ? "relative flex items-center"
            : "flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        }
      >
        <label className="sr-only" htmlFor={compact ? "board-search" : "job-search"}>
          Search roles
        </label>
        <input
          id={compact ? "board-search" : "job-search"}
          value={query}
          enterKeyHint="search"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={compact ? "Search the board" : "Role, city, or house"}
          className={`w-full border border-line bg-surface text-base text-text outline-none placeholder:text-muted/70 focus:border-gold ${
            compact ? "h-12 pr-[4.75rem] pl-4" : "h-14 px-4 sm:text-[15px]"
          }`}
        />
        <button
          type="submit"
          className={
            compact
              ? "absolute top-1 right-1 h-10 px-3 text-xs tracking-[0.14em] text-text uppercase bg-wine"
              : "h-12 w-full bg-wine text-sm tracking-[0.16em] text-text uppercase sm:h-auto sm:w-auto sm:min-w-32 sm:px-7"
          }
        >
          Search
        </button>
      </form>

      {open && (compact ? query.trim().length >= 2 : true) && (
        <div className="absolute z-40 mt-2 max-h-[min(18rem,45vh)] w-full overflow-y-auto border border-line bg-bg-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => go(job.title, `/jobs/${job.id}`)}
                    className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-white/5"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm leading-snug text-text">{job.title}</span>
                      <span className="text-xs text-muted">
                        {job.company} · {job.city}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : compact ? (
            <p className="px-3 py-3 text-sm text-muted">No live matches for that phrase.</p>
          ) : (
            <div className="px-2 py-2">
              <p className="px-1 pb-2 text-[10px] tracking-[0.18em] text-muted uppercase">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setQuery(prompt);
                      go(prompt);
                    }}
                    className="border border-line px-3 py-2 text-left text-xs text-muted hover:border-gold hover:text-text"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
