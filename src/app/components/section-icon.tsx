import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/utils";

const toneClass = {
  slate: "bg-slate-100 text-slate-700",
  muted: "bg-muted/80 text-foreground",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-100 text-violet-700",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-700",
  yellow: "bg-yellow-50 text-yellow-700",
  red: "bg-red-50 text-red-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  primary: "bg-primary/10 text-primary",
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
