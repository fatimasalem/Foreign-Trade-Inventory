import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Activity,
  ChevronRight,
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat2,
  Package,
  Gem,
  Box,
  Droplets,
  Factory,
  FlaskConical,
  Car,
  Cpu,
  Atom,
  Pill,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { SectionIcon } from "../components/section-icon";
import {
  ALL_CATEGORY_ANALYSIS_ROWS,
  classificationArticleLeavesInOrder,
  findCategoryAnalysisRowByName,
  hsClassificationChapterOptions,
  parseClassificationParam,
  shortClassificationOptionLabel,
  type ArticleMetric,
  type ClassificationKind,
} from "../data/observe-categories-analysis";

function goodsDescriptionFromLeaf(m: ArticleMetric): string {
  const parts = m.label.split(" — ");
  if (parts.length >= 2) return parts.slice(1).join(" — ").trim();
  return m.label;
}

const COUNTRY_OPTIONS = ["All Countries", "China", "India", "USA", "Saudi Arabia", "Japan", "Germany"];

function strSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iconForCategoryName(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("section 1:") || n.includes("live animal")) return Package;
  if (n.includes("section 2:") || n.includes("vegetable product")) return Box;
  if (n.includes("section 3:") || n.includes("fats and oils")) return Droplets;
  if (n.includes("section 4:") || n.includes("foodstuff")) return Factory;
  if (n.includes("section 5:") || n.includes("mineral product")) return Box;
  if (n.includes("section 6:") || n.includes("chemical")) return FlaskConical;
  if (n.includes("section 7:") || n.includes("plastic")) return Droplets;
  if (n.includes("section 8:") || n.includes("leather")) return Package;
  if (n.includes("section 9:") || n.includes("wood")) return Box;
  if (n.includes("section 10:") || n.includes("pulp") || n.includes("paper")) return FileText;
  if (n.includes("section 11:") || n.includes("textile")) return Package;
  if (n.includes("section 12:") || n.includes("footwear")) return Package;
  if (n.includes("section 13:") || n.includes("stone") || n.includes("ceramic") || n.includes("glass")) return Gem;
  if (n.includes("section 14:") || n.includes("pearl") || n.includes("precious")) return Gem;
  if (n.includes("section 15:") || n.includes("base metal")) return Factory;
  if (n.includes("section 16:") || n.includes("machinery") || n.includes("electrical")) return Cpu;
  if (n.includes("section 17:") || n.includes("vehicle") || n.includes("aircraft") || n.includes("vessel")) return Car;
  if (n.includes("section 18:") || n.includes("optical") || n.includes("medical instrument")) return Atom;
  if (n.includes("section 19:") || n.includes("arms")) return Package;
  if (n.includes("section 20:") || n.includes("miscellaneous manufactured")) return Package;
  if (n.includes("section 21:") || n.includes("works of art")) return Gem;
  if (n.includes("aluminum")) return Box;
  if (n.includes("precious") || n.includes("stone") || n.includes("metal")) return Gem;
  if (n.includes("plastic")) return Droplets;
  if (n.includes("iron") || n.includes("steel")) return Factory;
  if (n.includes("organic") || n.includes("chemical")) return FlaskConical;
  if (n.includes("vehicle")) return Car;
  if (n.includes("electrical") || n.includes("machinery")) return Cpu;
  if (n.includes("nuclear")) return Atom;
  if (n.includes("pharmaceutical")) return Pill;
  return Package;
}

function getRelatedCategories(current: string): string[] {
  return ALL_CATEGORY_ANALYSIS_ROWS.map((r) => r.category).filter((c) => c !== current).slice(0, 4);
}

type TradeKind = "import" | "export" | "reexport";

function topCountriesForCategory(
  categoryName: string,
  kind: TradeKind,
  filterKey: string,
): { country: string; share: number }[] {
  const base = ["China", "India", "USA", "Saudi Arabia", "Japan", "Germany", "UK", "Singapore", "Netherlands", "South Korea"];
  const rand = mulberry32(strSeed(`${categoryName}|${kind}|${filterKey}`));
  const weights = base.map(() => 0.4 + rand() * 1.6);
  const sum = weights.reduce((a, b) => a + b, 0);
  const ranked = base
    .map((country, i) => ({ country, w: weights[i] }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 5)
    .map(({ country, w }) => ({
      country,
      share: (w / sum) * 100,
    }));
  const total = ranked.reduce((a, r) => a + r.share, 0);
  return ranked.map((r) => ({ ...r, share: (r.share / total) * 100 }));
}

function buildTrendPoints(
  categoryName: string,
  articleLabel: string | undefined,
  month: string,
  year: string,
  cls: ClassificationKind,
  trendCountries: string[],
  productLabel: string,
): { month: string; imports: number; exports: number; reexports: number }[] {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const seed = strSeed(`${categoryName}|${articleLabel ?? ""}|${month}|${year}|${cls}|${productLabel}`);
  const rand = mulberry32(seed);
  const hasAll = trendCountries.includes("All Countries") || trendCountries.length === 0;
  const n = hasAll ? 4 : Math.max(1, trendCountries.filter((c) => c !== "All Countries").length);
  const partnerFactor = hasAll ? 1 : Math.min(1, 0.18 * n + rand() * 0.08);

  return months.map((m) => {
    const jitter = () => (rand() - 0.5) * 2;
    return {
      month: m,
      imports: +(42 + rand() * 8 + jitter() + (seed % 7) * 0.01).toFixed(1) * partnerFactor,
      exports: +(24 + rand() * 7 + jitter() + (seed % 5) * 0.01).toFixed(1) * partnerFactor,
      reexports: +(27 + rand() * 6 + jitter() + (seed % 6) * 0.01).toFixed(1) * partnerFactor,
    };
  });
}

export function CategoryTradeDetailPage() {
  const navigate = useNavigate();
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug?: string }>();
  const [searchParams] = useSearchParams();

  const categoryName = useMemo(() => {
    if (!categorySlug) return "Category";
    try {
      return decodeURIComponent(categorySlug);
    } catch {
      return categorySlug;
    }
  }, [categorySlug]);

  const articleName = useMemo(() => {
    if (!articleSlug) return undefined;
    try {
      return decodeURIComponent(articleSlug);
    } catch {
      return articleSlug;
    }
  }, [articleSlug]);

  const cls = parseClassificationParam(searchParams.get("cls"));

  const categoryRow = useMemo(() => findCategoryAnalysisRowByName(categoryName), [categoryName]);
  const articleOptions = useMemo(
    () => (categoryRow ? classificationArticleLeavesInOrder(categoryRow, cls) : []),
    [categoryRow, cls],
  );

  const hsChapterOptions = useMemo(
    () => (categoryRow ? hsClassificationChapterOptions(categoryRow) : []),
    [categoryRow],
  );

  const classificationFilterLabel =
    cls === "HS" ? "HS Classification" : cls === "BEC" ? "BEC Classification" : "SITC Classification";

  const hsSelectValue = useMemo(() => {
    if (cls !== "HS") return null;
    if (!articleName) return "__category__";
    const hit = hsChapterOptions.find((o) => articleName.toUpperCase().startsWith(o.code.toUpperCase()));
    return hit?.code ?? articleName;
  }, [cls, articleName, hsChapterOptions]);

  const productOptions = useMemo(() => {
    if (!categoryRow) return ["All goods in this category"];
    const leaves = classificationArticleLeavesInOrder(categoryRow, cls);

    if (cls === "HS") {
      if (articleName) {
        const baseGoods = articleName.includes(" — ") ? articleName.split(" — ")[1]! : "Goods under this heading";
        const six = articleName.match(/^HS\d{6}/i)?.[0] ?? "";
        return [
          "All goods in this HS code",
          ...Array.from({ length: 6 }, (_, i) => `${six ? `${six} — ` : ""}${baseGoods} (product line ${i + 1})`),
        ];
      }
      return ["All goods in this category", ...leaves.map(goodsDescriptionFromLeaf).slice(0, 12)];
    }

    if (articleName) {
      const base =
        articleName.includes(" — ") ? articleName.split(" — ").slice(1).join(" — ").trim() : articleName;
      return [
        "All goods in this classification line",
        ...Array.from({ length: 5 }, (_, i) => `${base} — goods variant ${i + 1}`),
      ];
    }
    return ["All goods in this category", ...leaves.map(goodsDescriptionFromLeaf).slice(0, 12)];
  }, [categoryRow, cls, articleName]);

  const defaultProductLabel = useMemo(() => {
    if (!categoryRow) return "All goods in this category";
    if (cls === "HS") {
      return articleName ? "All goods in this HS code" : "All goods in this category";
    }
    return articleName ? "All goods in this classification line" : "All goods in this category";
  }, [categoryRow, cls, articleName]);

  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2026");
  const [trendCountries, setTrendCountries] = useState<string[]>(["All Countries"]);
  const [selectedProduct, setSelectedProduct] = useState(defaultProductLabel);

  useEffect(() => {
    setSelectedProduct(defaultProductLabel);
  }, [defaultProductLabel]);

  const filterKey = `${month}|${year}|${cls}|${articleName ?? ""}|${selectedProduct}`;

  const topImport = useMemo(
    () => topCountriesForCategory(categoryName, "import", filterKey),
    [categoryName, filterKey],
  );
  const topExport = useMemo(
    () => topCountriesForCategory(categoryName, "export", filterKey),
    [categoryName, filterKey],
  );
  const topReexport = useMemo(
    () => topCountriesForCategory(categoryName, "reexport", filterKey),
    [categoryName, filterKey],
  );

  const trendData = useMemo(
    () => buildTrendPoints(categoryName, articleName, month, year, cls, trendCountries, selectedProduct),
    [categoryName, articleName, month, year, cls, trendCountries, selectedProduct],
  );

  const related = useMemo(() => getRelatedCategories(categoryName), [categoryName]);

  const handleTrendCountryToggle = (country: string) => {
    if (country === "All Countries") {
      setTrendCountries(["All Countries"]);
    } else {
      const next = trendCountries.includes(country)
        ? trendCountries.filter((c) => c !== country)
        : [...trendCountries.filter((c) => c !== "All Countries"), country];
      setTrendCountries(next.length > 0 ? next : ["All Countries"]);
    }
  };

  const goToCategory = (name: string) => {
    const qs = new URLSearchParams({ cls });
    navigate(`/observe/category/${encodeURIComponent(name)}?${qs.toString()}`);
  };

  const goToArticle = (label: string) => {
    const qs = new URLSearchParams({ cls });
    navigate(
      `/observe/category/${encodeURIComponent(categoryName)}/article/${encodeURIComponent(label)}?${qs.toString()}`,
    );
  };

  const TitleIcon = iconForCategoryName(categoryName);
  const displayTitle = articleName ?? categoryName;
  const classificationLabel = cls === "HS" ? "Harmonized System" : cls === "BEC" ? "Broad Economic Categories" : "SITC Rev.4";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1 text-gray-600"
            onClick={() => navigate("/observe")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Observe
          </Button>
          <div className="flex gap-3">
            <SectionIcon icon={TitleIcon} tone="violet" size="lg" />
            <div className="min-w-0">
              {articleName ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{categoryName}</p>
                  <h1 className="text-2xl font-semibold text-gray-900">{articleName}</h1>
                </>
              ) : (
                <h1 className="text-2xl font-semibold text-gray-900">{displayTitle}</h1>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Non-oil trade partners and trends
                {articleName ? " for this article" : " for this HS section"}. Article list uses {classificationLabel}{" "}
                lines ({cls}) from Observe.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January">January</SelectItem>
                <SelectItem value="February">February</SelectItem>
                <SelectItem value="March">March</SelectItem>
                <SelectItem value="April">April</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">{classificationFilterLabel}</label>
            {cls === "HS" ? (
              <Select
                value={hsSelectValue ?? "__category__"}
                onValueChange={(v) => {
                  if (v === "__category__") {
                    const qs = new URLSearchParams({ cls });
                    navigate(`/observe/category/${encodeURIComponent(categoryName)}?${qs.toString()}`);
                    return;
                  }
                  const byCode = hsChapterOptions.find((o) => o.code === v);
                  if (byCode) {
                    goToArticle(byCode.leafLabel);
                    return;
                  }
                  goToArticle(v);
                }}
              >
                <SelectTrigger className="min-w-[220px] max-w-[min(100vw-2rem,420px)]">
                  <SelectValue placeholder="Choose HS code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__category__">Section overview (no HS code)</SelectItem>
                  {hsChapterOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={articleName ?? "__category__"}
                onValueChange={(v) => {
                  if (v === "__category__") {
                    const qs = new URLSearchParams({ cls });
                    navigate(`/observe/category/${encodeURIComponent(categoryName)}?${qs.toString()}`);
                    return;
                  }
                  goToArticle(v);
                }}
              >
                <SelectTrigger className="min-w-[220px] max-w-[min(100vw-2rem,420px)]">
                  <SelectValue placeholder="Choose classification line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__category__">Section overview (no line)</SelectItem>
                  {articleOptions.map((a) => (
                    <SelectItem key={a.label} value={a.label}>
                      {shortClassificationOptionLabel(cls, a.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Filter by Goods</label>
            <Select
              value={productOptions.includes(selectedProduct) ? selectedProduct : productOptions[0] ?? "All products"}
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger className="min-w-[220px] max-w-[min(100vw-2rem,420px)]">
                <SelectValue placeholder="Choose product" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!categoryRow && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This category name is not in the current Observe HS section list. Open Observe and pick a row from Categories
          Analysis.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <SectionIcon icon={ArrowDownToLine} tone="red" />
            <div>
              <h2 className="font-semibold text-gray-900">Top countries — non-oil import</h2>
              <p className="text-xs text-gray-500">Share of category imports</p>
            </div>
          </div>
          <ol className="space-y-3">
            {topImport.map((row, i) => (
              <li key={row.country} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="mr-2 font-medium text-gray-400">{i + 1}.</span>
                  {row.country}
                </span>
                <span className="font-medium tabular-nums text-gray-900">{row.share.toFixed(1)}%</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <SectionIcon icon={ArrowUpFromLine} tone="emerald" />
            <div>
              <h2 className="font-semibold text-gray-900">Top countries — non-oil export</h2>
              <p className="text-xs text-gray-500">Share of category exports</p>
            </div>
          </div>
          <ol className="space-y-3">
            {topExport.map((row, i) => (
              <li key={row.country} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="mr-2 font-medium text-gray-400">{i + 1}.</span>
                  {row.country}
                </span>
                <span className="font-medium tabular-nums text-gray-900">{row.share.toFixed(1)}%</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <SectionIcon icon={Repeat2} tone="blue" />
            <div>
              <h2 className="font-semibold text-gray-900">Top countries — non-oil re-export</h2>
              <p className="text-xs text-gray-500">Share of category re-exports</p>
            </div>
          </div>
          <ol className="space-y-3">
            {topReexport.map((row, i) => (
              <li key={row.country} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="mr-2 font-medium text-gray-400">{i + 1}.</span>
                  {row.country}
                </span>
                <span className="font-medium tabular-nums text-gray-900">{row.share.toFixed(1)}%</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <SectionIcon icon={Activity} tone="slate" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Foreign trade trend</h3>
              <p className="mt-1 text-xs text-gray-500">
                Non-oil import, export, and re-export (billions AED). Filter by partner country for the series below.
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Countries (chart)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between text-sm">
                  {trendCountries.length === 1
                    ? trendCountries[0]
                    : `${trendCountries.length} countries selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-3">
                <div className="space-y-2">
                  {COUNTRY_OPTIONS.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trend-${country}`}
                        checked={trendCountries.includes(country)}
                        onCheckedChange={() => handleTrendCountryToggle(country)}
                      />
                      <label
                        htmlFor={`trend-${country}`}
                        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis label={{ value: "AED Billions", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}B AED`}
              contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="imports"
              stroke="#ef4444"
              strokeWidth={2}
              name="Non-Oil Imports"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="exports"
              stroke="#10b981"
              strokeWidth={2}
              name="Non-Oil Exports"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="reexports"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Non-Oil Re-Exports"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <SectionIcon icon={LayoutGrid} tone="amber" />
          <h3 className="text-lg font-semibold text-gray-900">Related categories</h3>
        </div>
        <p className="mb-4 text-sm text-gray-500">Open another HS section to see the same breakdown.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((name) => {
            const CardCategoryIcon = iconForCategoryName(name);
            return (
              <Card
                key={name}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => goToCategory(name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToCategory(name);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <CardHeader className="pb-2">
                  <div className="flex gap-3">
                    <SectionIcon icon={CardCategoryIcon} tone="primary" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-snug">{name}</CardTitle>
                      <CardDescription className="mt-1">View trade partners and trends</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0 text-sm text-primary">
                  <span>Open detail</span>
                  <ChevronRight className="h-4 w-4" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
