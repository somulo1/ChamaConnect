import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chama } from "@shared/schema";

interface ChamaCardProps {
  chama: Chama;
  role: string;
  stats: {
    balance: string;
    shares: string;
    sharesPercentage: string;
    nextContribution?: {
      amount: string;
      dueDate: string;
      status: "pending" | "paid" | "overdue";
    };
    lastPayout?: {
      amount: string;
      date: string;
    };
  };
  nextMeeting?: {
    date: string;
    time: string;
  };
}

export default function ChamaCard({ chama, role, stats, nextMeeting }: ChamaCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "chairperson":
        return "bg-success text-white";
      case "treasurer":
      case "secretary":
        return "bg-info text-white";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const getContributionStatusColor = (status?: "pending" | "paid" | "overdue") => {
    switch (status) {
      case "paid":
        return "text-success";
      case "overdue":
        return "text-destructive";
      case "pending":
        return "text-warning";
      default:
        return "text-neutral-300";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <h4 className="font-medium text-lg">{chama.name}</h4>
          <Badge className={getRoleBadgeColor(role)}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {/* This would come from members count and founded date */}
          12 members • Founded {new Date(chama.founded).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-muted-foreground text-xs">Group Balance</p>
            <p className="font-medium">KES {stats.balance}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Your Shares</p>
            <p className="font-medium">{stats.shares} ({stats.sharesPercentage})</p>
          </div>
          
          {stats.nextContribution && (
            <div>
              <p className="text-muted-foreground text-xs">Next Contribution</p>
              <p className="font-medium">
                KES {stats.nextContribution.amount}{" "}
                <span className={getContributionStatusColor(stats.nextContribution.status)}>
                  {stats.nextContribution.status === "paid" ? "Paid" : 
                   stats.nextContribution.status === "overdue" ? "Overdue" : 
                   `Due in ${stats.nextContribution.dueDate}`}
                </span>
              </p>
            </div>
          )}
          
          <div>
            <p className="text-muted-foreground text-xs">Last Payout</p>
            <p className="font-medium">
              {stats.lastPayout ? (
                <>
                  KES {stats.lastPayout.amount}{" "}
                  <span className="text-muted-foreground text-xs">{stats.lastPayout.date}</span>
                </>
              ) : (
                <span className="text-muted-foreground text-xs">None yet</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted p-4 flex justify-between">
        <Button variant="link" className="text-primary p-0" asChild>
          <Link to={`/chama/${chama.id}`}>
            View Dashboard
          </Link>
        </Button>
        
        {nextMeeting && (
          <div>
            <span className="text-sm text-muted-foreground">Next Meeting:</span>
            <span className="text-sm font-medium ml-1">
              {nextMeeting.date}, {nextMeeting.time}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
