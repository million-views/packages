import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function DashboardAnalytics() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Analytics</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-lg">Page Views</span>
              <div className="flex items-center">
                <span className="font-semibold mr-2">12,543</span>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg">Conversion Rate</span>
              <div className="flex items-center">
                <span className="font-semibold mr-2">3.2%</span>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-lg">Bounce Rate</span>
              <div className="flex items-center">
                <span className="font-semibold mr-2">42.1%</span>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Direct</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Organic Search</span>
                  <span className="font-medium">28%</span>
                </div>
                <Progress value={28} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Referral</span>
                  <span className="font-medium">22%</span>
                </div>
                <Progress value={22} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Social</span>
                  <span className="font-medium">15%</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-1">Age Distribution</h4>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>18-24</span>
                  <span>25-34</span>
                  <span>35-44</span>
                  <span>45-54</span>
                  <span>55+</span>
                </div>
                <div className="flex h-16">
                  <div className="w-1/5 bg-blue-400 rounded-l-sm"></div>
                  <div className="w-1/5 bg-blue-500"></div>
                  <div className="w-1/5 bg-blue-600"></div>
                  <div className="w-1/5 bg-blue-700"></div>
                  <div className="w-1/5 bg-blue-800 rounded-r-sm"></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Device Usage</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-2">
                    <div className="text-center">
                      <div className="text-xl font-bold">58%</div>
                      <div className="text-xs text-muted-foreground">
                        Mobile
                      </div>
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="text-center">
                      <div className="text-xl font-bold">32%</div>
                      <div className="text-xs text-muted-foreground">
                        Desktop
                      </div>
                    </div>
                  </Card>
                  <Card className="p-2">
                    <div className="text-center">
                      <div className="text-xl font-bold">10%</div>
                      <div className="text-xs text-muted-foreground">
                        Tablet
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
