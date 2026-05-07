import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/utils";

const toneClass = {
  slate: "bg-[#163454] text-slate-200",
  muted: "bg-[#163454] text-slate-200",
  blue: "bg-[#173a63] text-cyan-200",
  green: "bg-[#174a4a] text-emerald-200",
  violet: "bg-[#3f2c5e] text-violet-200",
  purple: "bg-[#3f2c5e] text-violet-200",
  amber: "bg-[#5a441e] text-amber-200",
  yellow: "bg-[#5a441e] text-amber-200",
  red: "bg-[#5e2a3f] text-rose-200",
  emerald: "bg-[#174a4a] text-emerald-200",
  sky: "bg-[#173a63] text-cyan-200",
  primary: "bg-[#173a63] text-cyan-200",
} as const;

export type SectionIconTone = keyof typeof toneClass;

type SectionIconSize = "sm" | "md" | "lg";

const sizeBox: Record<SectionIconSize, string> = {
  sm: "h-8 w-8 rounded-md",
  md: "h-9 w-9 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

const sizeIcon: Record<SectionIconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function SectionIcon({
  icon: Icon,
  tone = "slate",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: SectionIconTone;
  size?: SectionIconSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        sizeBox[size],
        toneClass[tone],
        className,
      )}
      aria-hidden
    >
      <Icon className={sizeIcon[size]} />
    </span>
  );
}
