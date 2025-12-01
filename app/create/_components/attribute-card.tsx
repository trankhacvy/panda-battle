import type { LucideIcon } from "lucide-react";

interface AttributeCardProps {
  label: string;
  value: number;
  icon: string; // Changed from LucideIcon to string (image path)
  color: "red" | "orange" | "green" | "blue";
}

const colorStyles = {
  red: {
    gradient: "from-red-500/90 to-red-600/90",
    border: "border-red-400/50",
    iconBg: "bg-red-600",
    shadow: "shadow-[0_4px_20px_rgba(239,68,68,0.5)]",
  },
  orange: {
    gradient: "from-orange-500/90 to-orange-600/90",
    border: "border-orange-400/50",
    iconBg: "bg-orange-600",
    shadow: "shadow-[0_4px_20px_rgba(249,115,22,0.5)]",
  },
  green: {
    gradient: "from-green-500/90 to-green-600/90",
    border: "border-green-400/50",
    iconBg: "bg-green-600",
    shadow: "shadow-[0_4px_20px_rgba(34,197,94,0.5)]",
  },
  blue: {
    gradient: "from-blue-500/90 to-blue-600/90",
    border: "border-blue-400/50",
    iconBg: "bg-blue-600",
    shadow: "shadow-[0_4px_20px_rgba(59,130,246,0.5)]",
  },
};

export function AttributeCard({
  label,
  value,
  icon,
  color,
}: AttributeCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={`bg-linear-to-br ${styles.gradient} rounded-xl p-2 flex items-center gap-2 border-2 ${styles.border} ${styles.shadow}`}
    >
      <div className="rounded-lg shrink-0 overflow-hidden size-8">
        <img src={icon} alt={label} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-white/80 text-sm font-semibold">{label}:</div>
        <div className="text-white text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
