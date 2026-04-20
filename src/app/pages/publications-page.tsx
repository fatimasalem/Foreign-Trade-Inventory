import { useMemo, useState } from "react";
import { Link } from "react-router";
import { FileText, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { SectionIcon } from "../components/section-icon";
import { publicationSummaries } from "../data/publications";

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
    <div className="min-h-screen bg-muted/30">
      <div className="w-full py-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            Publications
          </h1>
          <p className="text-muted-foreground">
            Browse foreign trade reports and download supporting data.
          </p>
        </div>

        <div className="relative mb-8">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by title or date…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 bg-background pl-10 shadow-sm"
            aria-label="Search publications"
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No publications match your search.
            </p>
          ) : (
            filtered.map((pub) => (
              <Link
                key={pub.id}
                to={`/publication/${pub.id}`}
                className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <SectionIcon icon={FileText} tone="primary" size="lg" />
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                      {pub.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {pub.date}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Foreign trade
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
