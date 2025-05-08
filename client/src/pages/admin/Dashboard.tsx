import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ActivitySquare, 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  MessageCircle,
  Calendar,
  ShoppingBag
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Chamas</CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 5.2M</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marketplace Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 430K</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: Users, text: "New user registered: James Kamau", time: "2 minutes ago" },
                { icon: DollarSign, text: "Contribution of KES 5,000 received by Umoja Chama", time: "15 minutes ago" },
                { icon: Calendar, text: "New meeting scheduled: Finance Planning, Tomorrow 3 PM", time: "1 hour ago" },
                { icon: MessageCircle, text: "10 new messages in Tujenge Pamoja Chama group", time: "2 hours ago" },
                { icon: TrendingUp, text: "Monthly financial report generated for Maendeleo Chama", time: "5 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
            <CardDescription>Overview of system performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: "System Uptime", value: "99.98%", description: "Last 30 days" },
                { label: "API Requests", value: "189,304", description: "Last 24 hours" },
                { label: "Average Response Time", value: "128ms", description: "Last hour" },
                { label: "Active Users", value: "642", description: "Currently online" },
                { label: "SMS Notifications Sent", value: "1,248", description: "Last 7 days" }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}