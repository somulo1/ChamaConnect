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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  UserPlus,
  Send,
  MoreHorizontal,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getChamaMembers, addChamaMember } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Form schema for adding a new member
const addMemberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string().min(1, { message: "Please select a role" }),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export default function ChamaMembers() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: [`/api/chamas/${chamaId}/members`],
    enabled: !isNaN(chamaId)
  });

  // Form for adding new member
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  // Mutation for adding a new member
  const addMemberMutation = useMutation({
    mutationFn: async (data: AddMemberFormValues) => {
      // In a real app, we'd first fetch the user ID by email
      // Here we're mocking it with a placeholder ID of 999
      const userId = 999; // This would be fetched from the API in a real app
      
      return addChamaMember(chamaId, userId, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/members`] });
      toast({
        title: "Member added",
        description: "The member has been successfully added to the chama.",
      });
      setOpenAddMemberDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter members based on search query
  const filteredMembers = members.filter((member: any) => {
    const name = member.user.fullName.toLowerCase();
    const email = member.user.email.toLowerCase();
    const role = member.role.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  const onAddMemberSubmit = (data: AddMemberFormValues) => {
    addMemberMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Role badge styling
  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "chairperson":
        return "bg-success text-success-foreground";
      case "treasurer":
      case "secretary":
        return "bg-info text-info-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Contribution stats for member details
  const getMemberContributionStats = (memberId: number) => {
    // In a real app, this would come from API data
    return {
      total: 48000,
      paid: 45000,
      pending: 3000,
      rate: 94,
      timely: true
    };
  };
  
  // Attendance stats for member details
  const getMemberAttendanceStats = (memberId: number) => {
    // In a real app, this would come from API data
    return {
      total: 12,
      attended: 10,
      rate: 83
    };
  };

  return (
    <ChamaLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Chama Members</h2>
            <p className="text-muted-foreground">
              Manage members and their roles in your chama
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={openAddMemberDialog} onOpenChange={setOpenAddMemberDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to join this chama group.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddMemberSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter email address" 
                              {...field} 
                              type="email"
                            />
                          </FormControl>
                          <FormDescription>
                            The person will receive an invitation email.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="member">Regular Member</SelectItem>
                              <SelectItem value="secretary">Secretary</SelectItem>
                              <SelectItem value="treasurer">Treasurer</SelectItem>
                              <SelectItem value="chairperson">Chairperson</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The member's role determines their permissions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpenAddMemberDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={addMemberMutation.isPending}
                      >
                        {addMemberMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Member List</CardTitle>
          <CardDescription>{members.length} members in this chama</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No Members Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 
                  "No members match your search query." : 
                  "This chama doesn't have any members yet."}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => setOpenAddMemberDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 bg-muted text-xs font-medium">
                <div className="col-span-5 md:col-span-4">Member</div>
                <div className="col-span-5 md:col-span-3 hidden md:block">Contact</div>
                <div className="col-span-3 md:col-span-2 text-center">Role</div>
                <div className="col-span-3 md:col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right"></div>
              </div>
              
              {filteredMembers.map((member: any) => (
                <div 
                  key={member.id} 
                  className="grid grid-cols-12 p-3 border-t hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsDetailsOpen(true);
                  }}
                >
                  <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={member.user.fullName} />
                      <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-medium text-sm truncate">{member.user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate hidden md:block">
                        @{member.user.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-5 md:col-span-3 items-center hidden md:flex">
                    <p className="text-sm truncate">{member.user.email}</p>
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 flex justify-center items-center">
                    <Badge className={getRoleBadgeStyles(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="col-span-3 md:col-span-2 flex justify-center items-center">
                    <Badge variant="outline" className="bg-success/10 text-success">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="col-span-1 flex justify-end items-center">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Member Details Dialog */}
      {selectedMember && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src="" alt={selectedMember.user.fullName} />
                            <AvatarFallback className="text-2xl">{getInitials(selectedMember.user.fullName)}</AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-semibold">{selectedMember.user.fullName}</h3>
                          <Badge className={`mt-2 ${getRoleBadgeStyles(selectedMember.role)}`}>
                            {selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)}
                          </Badge>
                          <p className="text-muted-foreground mt-2">
                            Member since {new Date(selectedMember.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="md:w-2/3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMember.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedMember.user.phoneNumber || "Not provided"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="mt-4">
                      <CardHeader className="pb-3">
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-muted rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-1">Total Contribution</h4>
                            <p className="text-xl font-bold">
                              KES {getMemberContributionStats(selectedMember.id).total.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Contribution Rate: {getMemberContributionStats(selectedMember.id).rate}%</p>
                          </div>
                          
                          <div className="bg-muted rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-1">Meeting Attendance</h4>
                            <p className="text-xl font-bold">
                              {getMemberAttendanceStats(selectedMember.id).attended}/{getMemberAttendanceStats(selectedMember.id).total}
                            </p>
                            <p className="text-xs text-muted-foreground">Attendance Rate: {getMemberAttendanceStats(selectedMember.id).rate}%</p>
                          </div>
                          
                          <div className="bg-muted rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-1">Payment Status</h4>
                            <div className="flex items-center gap-1 mb-1">
                              {getMemberContributionStats(selectedMember.id).timely ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-warning" />
                              )}
                              <p className="text-sm font-medium">
                                {getMemberContributionStats(selectedMember.id).timely ? 
                                  "Always On Time" : 
                                  "Some Late Payments"}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getMemberContributionStats(selectedMember.id).pending > 0 ? 
                                `KES ${getMemberContributionStats(selectedMember.id).pending} pending payment` : 
                                "No pending payments"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contributions">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Contribution History</CardTitle>
                    <CardDescription>
                      Complete history of member's contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-3 bg-muted text-xs font-medium">
                        <div className="col-span-3">Date</div>
                        <div className="col-span-3">Type</div>
                        <div className="col-span-3">Amount</div>
                        <div className="col-span-3 text-right">Status</div>
                      </div>
                      
                      {/* Mock contribution data */}
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="grid grid-cols-12 p-3 border-t">
                          <div className="col-span-3 text-sm">
                            {new Date(2023, 5 - index, 15).toLocaleDateString()}
                          </div>
                          <div className="col-span-3 text-sm">
                            Monthly Contribution
                          </div>
                          <div className="col-span-3 text-sm font-medium">
                            KES 3,000
                          </div>
                          <div className="col-span-3 text-right">
                            <Badge className={`
                              ${index < 4 ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
                            `}>
                              {index < 4 ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attendance">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Meeting Attendance</CardTitle>
                    <CardDescription>
                      Record of member's attendance at chama meetings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-3 bg-muted text-xs font-medium">
                        <div className="col-span-3">Date</div>
                        <div className="col-span-5">Meeting</div>
                        <div className="col-span-4 text-right">Status</div>
                      </div>
                      
                      {/* Mock attendance data */}
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className="grid grid-cols-12 p-3 border-t">
                          <div className="col-span-3 text-sm">
                            {new Date(2023, 6 - index, 15).toLocaleDateString()}
                          </div>
                          <div className="col-span-5 text-sm">
                            {index % 2 === 0 ? "Monthly General Meeting" : "Special Investment Meeting"}
                          </div>
                          <div className="col-span-4 text-right">
                            <Badge className={`
                              ${index !== 2 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}
                            `}>
                              {index !== 2 ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="permissions">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Role & Permissions</CardTitle>
                    <CardDescription>
                      Manage member's role and access rights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Current Role</h3>
                        <Select defaultValue={selectedMember.role}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Regular Member</SelectItem>
                            <SelectItem value="secretary">Secretary</SelectItem>
                            <SelectItem value="treasurer">Treasurer</SelectItem>
                            <SelectItem value="chairperson">Chairperson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Permissions</h3>
                        <div className="space-y-4">
                          {[
                            {
                              name: "View Financial Reports",
                              icon: <BarChart4 className="h-4 w-4" />,
                              allowed: true
                            },
                            {
                              name: "Manage Contributions",
                              icon: <DollarSign className="h-4 w-4" />,
                              allowed: selectedMember.role === "treasurer" || selectedMember.role === "chairperson"
                            },
                            {
                              name: "Schedule Meetings",
                              icon: <Calendar className="h-4 w-4" />,
                              allowed: selectedMember.role === "secretary" || selectedMember.role === "chairperson"
                            },
                            {
                              name: "Manage Members",
                              icon: <Users className="h-4 w-4" />,
                              allowed: selectedMember.role === "chairperson"
                            },
                            {
                              name: "Access Admin Settings",
                              icon: <ShieldAlert className="h-4 w-4" />,
                              allowed: selectedMember.role === "chairperson"
                            }
                          ].map((permission, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {permission.icon}
                                <span>{permission.name}</span>
                              </div>
                              <Badge variant={permission.allowed ? "default" : "secondary"}>
                                {permission.allowed ? "Allowed" : "Restricted"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline">
                      Reset to Default
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ChamaLayout>
  );
}

function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
