import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Search,
  DollarSign,
  Plus,
  Filter,
  BarChart4,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { getChamaContributions, getChamaMembers, createContribution, payContribution } from "@/services/api";
import { Contribution } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Form schema for creating a new contribution
const contributionSchema = z.object({
  memberId: z.string().min(1, { message: "Please select a member" }),
  amount: z.string().min(1, { message: "Please enter an amount" })
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  dueDate: z.string().min(1, { message: "Please select a due date" }),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

export default function ChamaContributions() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openNewContributionDialog, setOpenNewContributionDialog] = useState(false);
  
  const { data: contributions = [], isLoading: isContributionsLoading } = useQuery<Contribution[]>({
    queryKey: [`/api/chamas/${chamaId}/contributions`],
    enabled: !isNaN(chamaId)
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: [`/api/chamas/${chamaId}/members`],
    enabled: !isNaN(chamaId)
  });

  // Form for adding new contribution
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberId: "",
      amount: "",
      dueDate: new Date().toISOString().split('T')[0], // Today's date as default
    },
  });

  // Mutation for creating a new contribution
  const createContributionMutation = useMutation({
    mutationFn: async (data: ContributionFormValues) => {
      return createContribution(
        chamaId,
        parseInt(data.memberId),
        parseFloat(data.amount),
        new Date(data.dueDate)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/contributions`] });
      toast({
        title: "Contribution created",
        description: "The contribution has been successfully created.",
      });
      setOpenNewContributionDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create contribution",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for paying a contribution
  const payContributionMutation = useMutation({
    mutationFn: (contributionId: number) => {
      return payContribution(contributionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/contributions`] });
      toast({
        title: "Payment successful",
        description: "The contribution has been marked as paid.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onNewContributionSubmit = (data: ContributionFormValues) => {
    createContributionMutation.mutate(data);
  };

  // Filter contributions based on search query and status filter
  const filteredContributions = contributions.filter(contribution => {
    // In a real app, we would have member information readily available
    // Here we're using placeholder data
    const memberName = members.find((m: any) => m.userId === contribution.userId)?.user?.fullName || "Member";
    
    const matchesSearch = 
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contribution.amount.toString().includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === "all" || 
      contribution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate contribution statistics
  const totalContributions = contributions.length;
  const paidContributions = contributions.filter(c => c.status === "paid").length;
  const pendingContributions = contributions.filter(c => c.status === "pending").length;
  const overdueContributions = contributions.filter(c => c.status === "overdue").length;
  
  const totalAmount = contributions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
  const paidAmount = contributions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
  const pendingAmount = contributions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
  const overdueAmount = contributions
    .filter(c => c.status === "overdue")
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <ChamaLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Contributions</h2>
            <p className="text-muted-foreground">
              Manage and track chama contributions
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={openNewContributionDialog} onOpenChange={setOpenNewContributionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Contribution
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Contribution</DialogTitle>
                  <DialogDescription>
                    Add a new contribution for a member.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onNewContributionSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="memberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {members.map((member: any) => (
                                <SelectItem 
                                  key={member.userId} 
                                  value={member.userId.toString()}
                                >
                                  {member.user.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (KES)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpenNewContributionDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createContributionMutation.isPending}
                      >
                        {createContributionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Create Contribution
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Contributions</h3>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{totalContributions} contributions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Paid</h3>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">KES {paidAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{paidContributions} contributions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">KES {pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{pendingContributions} contributions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Overdue</h3>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">KES {overdueAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{overdueContributions} contributions</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Contribution Listing */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                All contributions for this chama
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <div className="relative w-full md:w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contributions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isContributionsLoading || isMembersLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContributions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No Contributions Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" ? 
                  "No contributions match your search criteria." : 
                  "There are no contributions recorded yet."}
              </p>
              {searchQuery || statusFilter !== "all" ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setOpenNewContributionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Contribution
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-muted text-xs font-medium">
                <div className="col-span-5 md:col-span-3">Member</div>
                <div className="col-span-3 md:col-span-2 text-center">Amount</div>
                <div className="col-span-4 md:col-span-2 text-center">Due Date</div>
                <div className="hidden md:block md:col-span-2 text-center">Payment Date</div>
                <div className="col-span-3 text-center">Status</div>
                <div className="hidden md:block md:col-span-1"></div>
              </div>
              
              {filteredContributions.map((contribution) => {
                // Find member details - in a real app this would be properly joined
                const member = members.find((m: any) => m.userId === contribution.userId);
                const memberName = member?.user?.fullName || "Member";
                
                return (
                  <div key={contribution.id} className="grid grid-cols-12 p-3 border-t hover:bg-muted/50">
                    <div className="col-span-5 md:col-span-3 flex items-center">
                      <Avatar className="h-8 w-8 mr-2 hidden md:block">
                        <AvatarFallback>{getInitials(memberName)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm truncate">{memberName}</p>
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 flex justify-center items-center">
                      <p className="text-sm font-medium">KES {parseFloat(contribution.amount.toString()).toLocaleString()}</p>
                    </div>
                    
                    <div className="col-span-4 md:col-span-2 flex justify-center items-center">
                      <p className="text-sm">
                        {new Date(contribution.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="hidden md:flex md:col-span-2 justify-center items-center">
                      <p className="text-sm">
                        {contribution.paidAt 
                          ? new Date(contribution.paidAt).toLocaleDateString() 
                          : "-"}
                      </p>
                    </div>
                    
                    <div className="col-span-3 flex justify-center items-center">
                      <Badge className={getStatusBadgeStyles(contribution.status)}>
                        {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="hidden md:flex md:col-span-1 justify-end items-center">
                      {contribution.status === "pending" || contribution.status === "overdue" ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => payContributionMutation.mutate(contribution.id)}
                          disabled={payContributionMutation.isPending}
                        >
                          {payContributionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-5">
          <div className="text-sm text-muted-foreground">
            Showing {filteredContributions.length} of {totalContributions} contributions
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <BarChart4 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ChamaLayout>
  );
}
