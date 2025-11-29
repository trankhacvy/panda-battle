import type { LucideIcon } from "lucide-react";

interface AttributeCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "red" | "orange" | "green" | "blue";
}

const colorStyles = {
  red: {
    gradient: "from-red-500/90 to-red-600/90",
    border: "border-red-400/50",
    iconBg: "bg-red-600",
  },
  orange: {
    gradient: "from-orange-500/90 to-orange-600/90",
    border: "border-orange-400/50",
    iconBg: "bg-orange-600",
  },
  green: {
    gradient: "from-green-500/90 to-green-600/90",
    border: "border-green-400/50",
    iconBg: "bg-green-600",
  },
  blue: {
    gradient: "from-blue-500/90 to-blue-600/90",
    border: "border-blue-400/50",
    iconBg: "bg-blue-600",
  },
};

export function AttributeCard({
  label,
  value,
  icon: Icon,
  color,
}: AttributeCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={`bg-linear-to-br ${styles.gradient} rounded-xl p-2 flex items-center gap-2 border-2 ${styles.border} shadow-lg`}
    >
      <div className={`${styles.iconBg} rounded-full p-2`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-white/80 text-sm font-semibold">{label}:</div>
        <div className="text-white text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
