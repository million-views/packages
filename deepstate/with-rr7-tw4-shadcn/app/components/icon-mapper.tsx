import {
  Activity,
  BarChart2,
  FileBarChart,
  FileText,
  Home,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from "lucide-react";

// Map of icon names to components
const iconMap = {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  BarChart2,
  FileBarChart,
  FileText,
  Mail,
  Activity,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const IconComponent = iconMap[name as keyof typeof iconMap];
  return IconComponent ? <IconComponent className={className} /> : null;
}
