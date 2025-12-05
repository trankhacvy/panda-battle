import { Badge, type BadgeProps } from "@/components/ui/badge";

interface AttributeCardProps {
  label: string;
  value: number;
  icon: string;
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "warning"
    | "info"
    | "pink";
  size?: BadgeProps["size"];
}

export function AttributeCard({
  label,
  value,
  icon,
  variant = "primary",
  size = "md",
}: AttributeCardProps) {
  return (
    <Badge variant={variant} size={size}>
      <span className="mr-1">{icon}</span>
      {label}: {value}
    </Badge>
  );
}
