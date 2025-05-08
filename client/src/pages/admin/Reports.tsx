import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from "lucide-react";

// Sample data for charts
const monthlyContributionsData = [
  { name: "Jan", amount: 240000 },
  { name: "Feb", amount: 310000 },
  { name: "Mar", amount: 280000 },
  { name: "Apr", amount: 350000 },
  { name: "May", amount: 420000 },
  { name: "Jun", amount: 390000 },
  { name: "Jul", amount: 450000 },
  { name: "Aug", amount: 520000 },
  { name: "Sep", amount: 490000 },
  { name: "Oct", amount: 570000 },
  { name: "Nov", amount: 620000 },
  { name: "Dec", amount: 680000 }
];

const userGrowthData = [
  { name: "Jan", users: 120 },
  { name: "Feb", users: 150 },
  { name: "Mar", users: 190 },
  { name: "Apr", users: 240 },
  { name: "May", users: 300 },
  { name: "Jun", users: 370 },
  { name: "Jul", users: 450 },
  { name: "Aug", users: 520 },
  { name: "Sep", users: 600 },
  { name: "Oct", users: 690 },
  { name: "Nov", users: 780 },
  { name: "Dec", users: 880 }
];

const chamaDistributionData = [
  { name: "Savings", value: 45 },
  { name: "Investment", value: 30 },
  { name: "Social", value: 15 },
  { name: "Other", value: 10 }
];

const chamaDistributionColors = ["#3498DB", "#2ECC71", "#9B59B6", "#F1C40F"];

const transactionTypeData = [
  { name: "Deposit", value: 35 },
  { name: "Withdrawal", value: 25 },
  { name: "Contribution", value: 30 },
  { name: "Loan", value: 10 }
];

const transactionTypeColors = ["#2ECC71", "#E74C3C", "#3498DB", "#9B59B6"];

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState("year");
  
  return (
    <AdminLayout title="Reports & Analytics">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
          <p className="text-muted-foreground">View platform performance metrics and generate reports</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 4.8M</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+18%</span>
              <span className="text-xs text-muted-foreground ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,256</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+12%</span>
              <span className="text-xs text-muted-foreground ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Chamas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+24%</span>
              <span className="text-xs text-muted-foreground ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 286K</div>
            <div className="flex items-center pt-1">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs text-red-500 font-medium">-3%</span>
              <span className="text-xs text-muted-foreground ml-1">from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="contributions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Contributions
          </TabsTrigger>
          <TabsTrigger value="chamas">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Chama Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Contributions</CardTitle>
                <CardDescription>
                  Total contributions collected each month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyContributionsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="amount" name="Contribution Amount" fill="#3498DB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userGrowthData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        name="Registered Users" 
                        stroke="#2ECC71" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chama Distribution by Type</CardTitle>
                <CardDescription>
                  Breakdown of chama by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chamaDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chamaDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chamaDistributionColors[index % chamaDistributionColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of transactions by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {transactionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={transactionTypeColors[index % transactionTypeColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>
                User registration and activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userGrowthData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      name="Total Users" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                <FileText className="mr-2 h-4 w-4" />
                Generate User Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of contributions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyContributionsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="amount" name="Contribution Amount" fill="#3498DB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                <FileText className="mr-2 h-4 w-4" />
                Generate Contribution Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Chama Analytics Tab */}
        <TabsContent value="chamas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chama Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of chamas by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chamaDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chamaDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chamaDistributionColors[index % chamaDistributionColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Chama Activity</CardTitle>
                <CardDescription>
                  Most active chamas by transaction volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: "Prosperity Investors", transactions: 245 },
                        { name: "Upendo Savings", transactions: 183 },
                        { name: "Youth Empowerment", transactions: 142 },
                        { name: "Future Leaders", transactions: 126 },
                        { name: "Women's Guild", transactions: 97 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transactions" name="Transactions" fill="#9B59B6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Chama Growth Over Time</CardTitle>
              <CardDescription>
                New chamas registered per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", chamas: 5 },
                      { month: "Feb", chamas: 7 },
                      { month: "Mar", chamas: 3 },
                      { month: "Apr", chamas: 9 },
                      { month: "May", chamas: 12 },
                      { month: "Jun", chamas: 8 },
                      { month: "Jul", chamas: 10 },
                      { month: "Aug", chamas: 14 },
                      { month: "Sep", chamas: 11 },
                      { month: "Oct", chamas: 15 },
                      { month: "Nov", chamas: 17 },
                      { month: "Dec", chamas: 19 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="chamas" 
                      name="New Chamas" 
                      stroke="#F39C12" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                <FileText className="mr-2 h-4 w-4" />
                Generate Chama Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}