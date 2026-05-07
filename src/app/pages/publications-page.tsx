import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { SectionIcon } from "../components/section-icon";
import { publicationSummaries } from "../data/publications";
import { cn } from "../components/ui/utils";

export function PublicationsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicationSummaries;
    return publicationSummaries.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-cyan-300 md:text-3xl">
          Publications
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
          Browse foreign trade reports and download supporting data.
        </p>
      </header>

      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by title or date…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "h-11 rounded-xl border-[#3b5b82] bg-[#112d4c] pl-10 text-slate-100 shadow-sm",
            "placeholder:text-slate-500 focus-visible:border-[#4a6fa0]",
          )}
          aria-label="Search publications"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-[#2f476f] bg-[#0d2747] px-6 py-12 text-center text-slate-400">
          No publications match your search.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pub) => (
            <li key={pub.id} className="min-w-0">
              <Link
                to={`/publication/${pub.id}`}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-[#2f476f] bg-[#0d2747] p-5 shadow-sm transition-all",
                  "hover:border-[#365985] hover:bg-[#102744] hover:shadow-md",
                )}
              >
                <div className="mb-4 flex items-start gap-3">
                  <SectionIcon icon={FileText} tone="primary" size="lg" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-snug text-slate-50 transition-colors group-hover:text-cyan-200">
                      {pub.title}
                    </h2>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#2a3f61] pt-4">
                  <span className="text-sm text-slate-400">{pub.date}</span>
                  <span className="rounded-full border border-[#345279] bg-[#102744] px-2.5 py-0.5 text-xs font-medium text-slate-300">
                    Foreign trade
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300/90 transition-colors group-hover:text-cyan-200">
                  Open report
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
