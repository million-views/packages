import {
  Activity,
  BarChart,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Edit,
  Eye,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  PieChart,
  Settings,
  Shield,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

// Map of icon names to components
const iconMap = {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  BarChart,
  FileText,
  CircleDot,
  TrendingUp,
  Clock,
  Activity,
  PieChart,
  Calendar,
  CalendarDays,
  CalendarRange,
  UserCheck,
  UserMinus,
  Shield,
  ShieldAlert,
  Edit,
  Eye,
  ChevronRight,
  ChevronDown,
  Menu,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  // Get the icon component from the map
  const IconComponent = iconMap[name as keyof typeof iconMap];

  // Return the icon if it exists, otherwise null
  return IconComponent ? <IconComponent className={className} /> : null;
}
