import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import UserLayout from "@/components/layout/UserLayout";
import StatCard from "@/components/dashboard/StatCard";
import ChamaCard from "@/components/dashboard/ChamaCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import AIAssistant from "@/components/dashboard/AIAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Wallet,
  Landmark,
  AlertTriangle,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { Chama } from "@shared/schema";
import { ChamaStats } from "@/types";

export default function UserDashboard() {
  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: chamas = [] } = useQuery<Chama[]>({
    queryKey: ["/api/chamas"],
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ["/api/contributions"],
  });

  // Mock data for stats and activities based on the design
  // In a real app, this would come from the API
  const mockStats = {
    walletBalance: wallet?.balance || "0",
    totalSavings: "342,980",
    pendingContributions: "5,000",
  };

  // Get pending contributions amount
  const pendingContributionsAmount = contributions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0)
    .toFixed(2);

  // Mock chama data including role and statistics
  const chamaWithStats = chamas.map((chama) => {
    // In a real app, this would be fetched from the API
    const stats: ChamaStats = {
      balance: chama.id % 2 === 0 ? "458,200" : "124,500",
      shares: chama.id % 2 === 0 ? "34" : "12",
      sharesPercentage: chama.id % 2 === 0 ? "22%" : "15%",
      nextContribution: {
        amount: "2,500",
        dueDate: "3 days",
        status: chama.id % 2 === 0 ? "pending" : "paid",
      },
      lastPayout: chama.id % 2 === 0 
        ? { amount: "12,000", date: "Apr 15" }
        : undefined,
    };

    return {
      chama,
      role: chama.id % 2 === 0 ? "chairperson" : "member",
      stats,
      nextMeeting: {
        date: chama.id % 2 === 0 ? "Sat, May 5" : "Sun, May 13",
        time: chama.id % 2 === 0 ? "2:00 PM" : "4:00 PM",
      },
    };
  });

  // Get recent transactions/activities
  const recentActivities = transactions
    .slice(0, 4)
    .map(transaction => {
      const activityTypeMap: Record<string, {
        icon: any,
        iconColor: string,
        iconBgColor: string,
        title: string,
        amountColor?: string
      }> = {
        deposit: {
          icon: Wallet,
          iconColor: "text-success",
          iconBgColor: "bg-success/10",
          title: "Deposit",
          amountColor: "text-success"
        },
        withdrawal: {
          icon: Wallet,
          iconColor: "text-destructive",
          iconBgColor: "bg-destructive/10",
          title: "Withdrawal",
          amountColor: "text-destructive"
        },
        contribution: {
          icon: Landmark,
          iconColor: "text-success",
          iconBgColor: "bg-success/10",
          title: "Contribution Paid",
        },
        late_fee: {
          icon: AlertTriangle,
          iconColor: "text-error",
          iconBgColor: "bg-error/10",
          title: "Late Payment Fine",
          amountColor: "text-destructive"
        },
      };

      const typeInfo = activityTypeMap[transaction.type] || {
        icon: Wallet,
        iconColor: "text-primary",
        iconBgColor: "bg-primary/10",
        title: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
      };

      return {
        id: transaction.id,
        icon: typeInfo.icon,
        iconColor: typeInfo.iconColor,
        iconBgColor: typeInfo.iconBgColor,
        title: typeInfo.title,
        description: transaction.description || `Transaction of KES ${transaction.amount}`,
        amount: `KES ${transaction.amount}`,
        amountColor: typeInfo.amountColor,
        timestamp: formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true }),
      };
    });

  return (
    <UserLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Welcome!</h2>
        <p className="text-muted-foreground">Here's your financial overview.</p>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Card */}
        <StatCard
          title="My Wallet"
          value={`KES ${mockStats.walletBalance}`}
          icon={Wallet}
          trend={{ value: "8% from last month", isPositive: true }}
          action={
            <>
              <Button className="flex-1">Add Money</Button>
              <Button variant="outline" className="flex-1">Send Money</Button>
            </>
          }
        />
        
        {/* Total Savings Card */}
        <StatCard
          title="Total Savings"
          value={`KES ${mockStats.totalSavings}`}
          icon={Landmark}
          iconClassName="text-secondary"
          trend={{ value: "12% from last month", isPositive: true }}
          footer={
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Goal: KES 500,000</span>
                <span className="text-primary font-medium">68.6%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "68.6%" }}></div>
              </div>
            </div>
          }
        />
        
        {/* Pending Contributions Card */}
        <StatCard
          title="Pending Contributions"
          value={`KES ${pendingContributionsAmount || mockStats.pendingContributions}`}
          icon={AlertTriangle}
          iconClassName="text-warning"
          trend={{ value: "Due in 3 days", isPositive: false }}
          action={
            <Button className="w-full">Pay Now</Button>
          }
        />
      </div>
      
      {/* My Chamas Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">My Chamas</h3>
          <Button variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4 text-primary" />
            Create New
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chamaWithStats.length > 0 ? (
            chamaWithStats.map(({ chama, role, stats, nextMeeting }) => (
              <ChamaCard
                key={chama.id}
                chama={chama}
                role={role}
                stats={stats}
                nextMeeting={nextMeeting}
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <h4 className="font-medium mb-2">No Chamas Yet</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  You haven't joined any chamas yet. Create your first chama or join an existing one.
                </p>
                <Button>Create a Chama</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Activities</h3>
          <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
        </div>
        
        <Card>
          <ul className="divide-y divide-border">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  icon={activity.icon}
                  iconColor={activity.iconColor}
                  iconBgColor={activity.iconBgColor}
                  title={activity.title}
                  description={activity.description}
                  amount={activity.amount}
                  amountColor={activity.amountColor}
                  timestamp={activity.timestamp}
                />
              ))
            ) : (
              <li className="p-6 text-center">
                <p className="text-muted-foreground">No recent activities</p>
              </li>
            )}
          </ul>
          {recentActivities.length > 0 && (
            <CardFooter className="bg-muted p-4 justify-center">
              <Button variant="ghost" size="sm">Load More</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* AI Assistant Preview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">AI Financial Assistant</h3>
          <Button asChild variant="link" className="p-0 h-auto gap-1">
            <Link to="/assistant">
              Open Full Assistant
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <AIAssistant
          suggestion="Based on your saving patterns, I've noticed you could optimize your contributions to reach your goal faster. Want some tips?"
          preview={true}
        />
      </div>
    </UserLayout>
  );
}
