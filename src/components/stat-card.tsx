import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "purple" | "amber" | "red";

const toneStyles: Record<Tone, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  purple: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  highlight?: boolean;
}

export function StatCard({ title, value, icon: Icon, tone = "blue", highlight = false }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            toneStyles[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </span>
          <span
            className={cn(
              "text-lg font-semibold tracking-tight sm:text-xl",
              highlight && "text-destructive"
            )}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
