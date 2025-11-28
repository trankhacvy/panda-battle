import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BattleProgressProps {
  value: number;
  label?: string;
  className?: string;
}

function BattleProgress({ value, label, className }: BattleProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}

export { BattleProgress };
