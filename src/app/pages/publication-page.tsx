import { useParams, Link } from "react-router";
import { Calendar, User, Download, Share2, ArrowLeft, Table2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { publications } from "../data/publications";

const EXCEL_SHEET_NAME_MAX = 31;

function truncateSheetName(name: string): string {
  if (name.length <= EXCEL_SHEET_NAME_MAX) return name;
  return name.slice(0, EXCEL_SHEET_NAME_MAX);
}

async function downloadExcel(
  fileName: string,
  sheets: { name: string; rows: (string | number)[][] }[],
) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, truncateSheetName(s.name));
  }
  XLSX.writeFile(wb, fileName);
}

export function PublicationPage() {
  const { id } = useParams();
  const publication = publications[id || ""];

  if (!publication) {
    return (
      <div className="w-full py-12">
        <h1 className="text-2xl font-bold">Publication not found</h1>
        <p className="mt-2 text-muted-foreground">
          <Link to="/publications" className="text-primary underline-offset-4 hover:underline">
            Back to publications
          </Link>
        </p>
      </div>
    );
  }

  const defaultSheet = publication.sheets[0]?.name ?? "sheet";

  return (
    <div className="min-h-screen bg-muted/20">
      <article className="w-full py-10">
        <div className="mb-8">
          <Link
            to="/publications"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All publications
          </Link>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {publication.title}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{publication.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" />
                <span>{publication.author}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                className="gap-2"
                onClick={() => void downloadExcel(publication.excelFileName, publication.sheets)}
              >
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
              <Button variant="outline" className="gap-2" type="button">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Markdown-style document body */}
        <div className="rounded-xl border border-border bg-card px-5 py-8 shadow-sm sm:px-10 sm:py-10">
          <div
            className="prose prose-neutral max-w-none font-sans text-[15px] leading-relaxed text-foreground
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:mt-10 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-xl
              prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-lg
              prose-p:text-foreground/90 prose-p:leading-7
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-1 prose-li:text-foreground/90
              prose-strong:text-foreground prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: publication.content }}
          />
        </div>

        {/* Excel preview — same workbook as download */}
        <section className="mt-10 rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
                <Table2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Data tables preview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These sheets match the Excel file you get from{" "}
                  <span className="font-medium text-foreground">Download Excel</span>.
                  Switch tabs to review each worksheet before downloading.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <Tabs defaultValue={defaultSheet} className="w-full">
              <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1.5">
                {publication.sheets.map((s) => (
                  <TabsTrigger
                    key={s.name}
                    value={s.name}
                    className="shrink-0 px-3 text-xs sm:text-sm"
                  >
                    {s.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {publication.sheets.map((s) => {
                const rows = s.rows;
                const head = rows[0];
                const body = rows.slice(1);
                return (
                  <TabsContent key={s.name} value={s.name} className="mt-0">
                    <ScrollArea className="max-h-[min(480px,70vh)] w-full rounded-lg border border-border">
                      <div className="min-w-max p-1">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              {head.map((cell, i) => (
                                <th
                                  key={i}
                                  className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-foreground"
                                >
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {body.map((row, ri) => (
                              <tr
                                key={ri}
                                className="border-b border-border/80 odd:bg-background even:bg-muted/20"
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="whitespace-nowrap px-3 py-2 text-foreground/90"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>
      </article>
    </div>
  );
}
