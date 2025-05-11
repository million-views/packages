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
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldQuestion,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

// Map of icon names to components
const iconMap = {
  Home,
  LayoutDashboard,
  Dashboard: LayoutDashboard,
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
  Search,
  Shield,
  ShieldAlert,
  Edit,
  Eye,
  ChevronRight,
  ChevronDown,
  Menu,
  ShieldQuestion,
  X,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = "h-6 w-6" }: IconProps) {
  // Get the icon component from the map
  const IconComponent = iconMap[name as keyof typeof iconMap];

  // Return the icon if it exists, otherwise null
  return IconComponent ? <IconComponent className={className} /> : null;
}

/**
 * Given an array of icon names, return an object mapping those names to their components
 */
export function mapIcons(names: Array<keyof typeof iconMap>) {
  // console.log("mapIcons: ", names);
  return names.reduce((acc, name) => {
    const comp = iconMap[name];
    if (comp) acc[name] = comp;
    return acc;
  }, {} as Partial<typeof iconMap>);
}
