import { useParams, Link } from "react-router";
import { Calendar, User, Download, Share2, ArrowLeft, Table2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { publications } from "../data/publications";
import { cn } from "../components/ui/utils";

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
      <div className="space-y-6 py-8 text-slate-100">
        <div className="rounded-2xl border border-[#2f476f] bg-[#0d2747] px-6 py-10 sm:px-10">
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            Publication not found
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            <Link
              to="/publications"
              className="font-medium text-cyan-300 underline-offset-4 transition-colors hover:text-cyan-200 hover:underline"
            >
              Back to publications
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const defaultSheet = publication.sheets[0]?.name ?? "sheet";

  return (
    <div className="space-y-8 text-slate-100">
      <article className="w-full">
        <Link
          to="/publications"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          All publications
        </Link>

        <div className="rounded-2xl border border-[#2f476f] bg-[#0d2747] p-6 shadow-sm sm:p-8">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">
            {publication.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
              <span>{publication.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-slate-500" />
              <span>{publication.author}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="gap-2 rounded-xl bg-[#1f4f84] text-white hover:bg-[#29639f]"
              onClick={() => void downloadExcel(publication.excelFileName, publication.sheets)}
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl border-[#365985] bg-[#112d4c] text-slate-100 hover:bg-[#143359] hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Excel preview — same workbook as download */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-[#2f476f] bg-[#0d2747] shadow-sm">
          <div className="border-b border-[#2a3f61] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-[#173a63]/90 p-2">
                <Table2 className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Data tables preview
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  These sheets match the Excel file you get from{" "}
                  <span className="font-medium text-slate-200">Download Excel</span>.
                  Switch tabs to review each worksheet before downloading.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <Tabs defaultValue={defaultSheet} className="w-full">
              <TabsList
                className={cn(
                  "mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-[#2f476f] bg-[#091a31] p-1.5",
                )}
              >
                {publication.sheets.map((s) => (
                  <TabsTrigger
                    key={s.name}
                    value={s.name}
                    className={cn(
                      "shrink-0 rounded-lg px-3 text-xs text-slate-400 sm:text-sm",
                      "data-[state=active]:border data-[state=active]:border-[#365985] data-[state=active]:bg-[#132f56] data-[state=active]:text-slate-50",
                      "data-[state=inactive]:border-transparent",
                    )}
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
                    <ScrollArea className="max-h-[min(480px,70vh)] w-full rounded-xl border border-[#2f476f] bg-[#071626]">
                      <div className="min-w-max p-1">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#2a3f61] bg-[#112d4c]">
                              {head.map((cell, i) => (
                                <th
                                  key={i}
                                  className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-slate-200"
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
                                className="border-b border-[#2a3f61]/70 odd:bg-[#0d2747]/80 even:bg-[#0a1f35]/90"
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="whitespace-nowrap px-3 py-2 text-slate-300"
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
