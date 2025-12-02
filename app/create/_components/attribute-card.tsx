import type { LucideIcon } from "lucide-react";

interface AttributeCardProps {
  label: string;
  value: number;
  icon: string;
  textColor: string;
}

export function AttributeCard({
  label,
  value,
  icon,
  textColor,
}: AttributeCardProps) {
  return (
    <div className="bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl px-2 py-2 flex items-center justify-center gap-1.5 border border-white/10">
      <div className="text-lg grayscale opacity-80">
        {icon}
      </div>
      <span className="font-bold text-xs whitespace-nowrap text-white">
        {label}: <span className={textColor}>{value}</span>
      </span>
    </div>
  );
}
