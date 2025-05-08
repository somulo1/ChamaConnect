import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import ChamaLayout from "@/components/layout/ChamaLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PiggyBank,
  Users,
  Calendar,
  TrendingUp,
  BarChart4,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Edit3
} from "lucide-react";
import { Chama, Contribution, Meeting } from "@shared/schema";
import { getChama, getChamaMembers, getChamaContributions, getChamaMeetings } from "@/services/api";

export default function ChamaDashboard() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  
  const { data: chama, isLoading: isChamaLoading } = useQuery<Chama>({
    queryKey: [`/api/chamas/${chamaId}`],
    enabled: !isNaN(chamaId)
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: [`/api/chamas/${chamaId}/members`],
    enabled: !isNaN(chamaId)
  });

  const { data: contributions = [], isLoading: isContributionsLoading } = useQuery<Contribution[]>({
    queryKey: [`/api/chamas/${chamaId}/contributions`],
    enabled: !isNaN(chamaId)
  });

  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery<Meeting[]>({
    queryKey: [`/api/chamas/${chamaId}/meetings`],
    enabled: !isNaN(chamaId)
  });

  // Calculate chama statistics
  const totalMembers = members.length;
  
  const totalContributions = contributions.reduce((sum, contrib) => {
    if (contrib.status === 'paid') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0);
  
  const pendingContributions = contributions.reduce((sum, contrib) => {
    if (contrib.status === 'pending') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0);
  
  const overdueContributions = contributions.reduce((sum, contrib) => {
    if (contrib.status === 'overdue') {
      return sum + parseFloat(contrib.amount.toString());
    }
    return sum;
  }, 0);

  // Next meeting
  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  
  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  // Mock data for investments and distributions
  const investmentData = [
    { name: "Real Estate", amount: 150000, percentage: 45 },
    { name: "Business Loans", amount: 100000, percentage: 30 },
    { name: "Fixed Deposit", amount: 50000, percentage: 15 },
    { name: "Emergency Fund", amount: 33000, percentage: 10 },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ChamaLayout>
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Group Balance"
          value={`KES ${totalContributions.toLocaleString()}`}
          icon={PiggyBank}
          trend={{ value: "12% from last month", isPositive: true }}
        />
        
        <StatCard
          title="Total Members"
          value={totalMembers.toString()}
          icon={Users}
          iconClassName="text-secondary"
          footer={
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Active members</span>
                <span className="text-primary font-medium">{totalMembers}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          }
        />
        
        <StatCard
          title="Next Meeting"
          value={nextMeeting 
            ? new Date(nextMeeting.scheduledFor).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            : "No upcoming meetings"}
          icon={Calendar}
          iconClassName="text-accent"
          footer={
            nextMeeting ? (
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-muted-foreground">
                  {new Date(nextMeeting.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Button variant="link" size="sm" className="text-primary p-0">
                  View Details
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full">
                Schedule Meeting
              </Button>
            )
          }
        />
      </div>
      
      {/* Contributions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contributions Overview</CardTitle>
            <CardDescription>
              Summary of all member contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Collected</h4>
                <p className="text-xl font-bold">KES {totalContributions.toLocaleString()}</p>
              </div>
              
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending</h4>
                <p className="text-xl font-bold text-warning">KES {pendingContributions.toLocaleString()}</p>
              </div>
              
              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Overdue</h4>
                <p className="text-xl font-bold text-destructive">KES {overdueContributions.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Contribution Status</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Paid</span>
                    <span>{Math.round((totalContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(totalContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Pending</span>
                    <span>{Math.round((pendingContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(pendingContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Overdue</span>
                    <span>{Math.round((overdueContributions / (totalContributions + pendingContributions + overdueContributions)) * 100)}%</span>
                  </div>
                  <Progress value={(overdueContributions / (totalContributions + pendingContributions + overdueContributions)) * 100} className="h-2 bg-muted" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href={`/chama/${chamaId}/contributions`}>
                <BarChart4 className="mr-2 h-4 w-4" />
                View All Contributions
              </a>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Investment Allocations</CardTitle>
            <CardDescription>
              How the group funds are allocated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investmentData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">KES {item.amount.toLocaleString()}</span>
                      <Badge variant="outline" className="ml-2">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Growth Projection</h4>
                <Badge variant="outline" className="bg-success/10 text-success border-success">+12.5% Annual</Badge>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-lg font-bold">KES 333,000</p>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                  <div>
                    <p className="text-sm text-muted-foreground">Projected EOY</p>
                    <p className="text-lg font-bold text-success">KES 374,625</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Investment Reports
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Members & Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Active Members</CardTitle>
                <CardDescription>
                  {totalMembers} total members
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/chama/${chamaId}/members`}>View All</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-2">
                      <AvatarImage src="" alt={member.user.fullName} />
                      <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    member.role === "chairperson" ? "bg-success/10 text-success border-success" :
                    member.role === "treasurer" ? "bg-info/10 text-info border-info" :
                    member.role === "secretary" ? "bg-info/10 text-info border-info" :
                    "bg-secondary/50"
                  }>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                <CardDescription>
                  Next {upcomingMeetings.length} scheduled meetings
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No Upcoming Meetings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There are no meetings scheduled. Click below to schedule one.
                </p>
                <Button>Schedule a Meeting</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <Badge>{formatDistanceToNow(new Date(meeting.scheduledFor), { addSuffix: true })}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {meeting.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(meeting.scheduledFor).toLocaleDateString()}{' '}
                          {new Date(meeting.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <a href="#" className="text-primary font-medium">View</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Action Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-warning/10 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pending Contributions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    5 members have pending contributions totaling KES {pendingContributions.toLocaleString()}
                  </p>
                  <Button size="sm">Send Reminders</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-info/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-info/10 rounded-full p-2">
                  <Edit3 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Meeting Minutes Pending</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Minutes from the last meeting need to be uploaded and shared
                  </p>
                  <Button size="sm">Upload Minutes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-success/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-success/10 rounded-full p-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Quarterly Report Ready</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Q2 2023 financial report is ready for review
                  </p>
                  <Button size="sm">View Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ChamaLayout>
  );
}
