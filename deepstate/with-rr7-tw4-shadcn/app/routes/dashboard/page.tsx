import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, ArrowUpRight, Users } from "lucide-react";
import { NavLink, Outlet, Route, Routes, useLocation } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
}

// export default function DashboardOverview() {
//   return (
//     <div>
//       <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>

//       <div className="grid gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>System Performance</CardTitle>
//             <CardDescription>Key performance indicators</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p>Performance metrics content goes here...</p>
//           </CardContent>
//         </Card>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Activity</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-4">
//                 <li className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
//                       <Users className="h-4 w-4 text-primary" />
//                     </div>
//                     <span>User login</span>
//                   </div>
//                   <span className="text-muted-foreground text-sm">
//                     2 minutes ago
//                   </span>
//                 </li>
//                 <li className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
//                       <Activity className="h-4 w-4 text-primary" />
//                     </div>
//                     <span>System update</span>
//                   </div>
//                   <span className="text-muted-foreground text-sm">
//                     1 hour ago
//                   </span>
//                 </li>
//                 <li className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
//                       <Users className="h-4 w-4 text-primary" />
//                     </div>
//                     <span>New user registered</span>
//                   </div>
//                   <span className="text-muted-foreground text-sm">
//                     3 hours ago
//                   </span>
//                 </li>
//               </ul>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>System Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span>Server Uptime</span>
//                   <span className="text-green-500 font-medium flex items-center">
//                     99.9%
//                     <ArrowUpRight className="ml-1 h-4 w-4" />
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>API Response Time</span>
//                   <span className="text-green-500 font-medium flex items-center">
//                     120ms
//                     <ArrowUpRight className="ml-1 h-4 w-4" />
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Database Load</span>
//                   <span className="text-yellow-500 font-medium">45%</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
