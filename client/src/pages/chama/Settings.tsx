import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Users, Ban, LogOut, Save, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Chama, ChamaRule } from "@shared/schema";

// Form schema for chama details
const chamaFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

// Form schema for contribution rules
const ruleFormSchema = z.object({
  contributionAmount: z.string().min(1, "Amount is required"),
  contributionFrequency: z.string().min(1, "Frequency is required"),
  latePaymentFine: z.string().optional(),
  interestRate: z.string().optional(),
});

export default function ChamaSettings() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  
  // Queries
  const { data: chama, isLoading: isChamaLoading } = useQuery<Chama>({
    queryKey: [`/api/chamas/${chamaId}`],
    enabled: !isNaN(chamaId)
  });
  
  const { data: chamaRules, isLoading: isRulesLoading } = useQuery<ChamaRule>({
    queryKey: [`/api/chamas/${chamaId}/rules`],
    enabled: !isNaN(chamaId)
  });
  
  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: [`/api/chamas/${chamaId}/members`],
    enabled: !isNaN(chamaId)
  });

  // Chama details form
  const chamaForm = useForm<z.infer<typeof chamaFormSchema>>({
    resolver: zodResolver(chamaFormSchema),
    defaultValues: {
      name: chama?.name || "",
      description: chama?.description || "",
    },
  });
  
  // Contribution rules form
  const rulesForm = useForm<z.infer<typeof ruleFormSchema>>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      contributionAmount: chamaRules?.contributionAmount || "",
      contributionFrequency: chamaRules?.contributionFrequency || "",
      latePaymentFine: chamaRules?.latePaymentFine || "",
      interestRate: chamaRules?.interestRate || "",
    },
  });

  // Update forms when data is loaded
  if (chama && chamaForm.getValues().name !== chama.name) {
    chamaForm.reset({
      name: chama.name,
      description: chama.description || "",
    });
  }
  
  if (chamaRules && rulesForm.getValues().contributionAmount !== chamaRules.contributionAmount) {
    rulesForm.reset({
      contributionAmount: chamaRules.contributionAmount,
      contributionFrequency: chamaRules.contributionFrequency,
      latePaymentFine: chamaRules.latePaymentFine || "",
      interestRate: chamaRules.interestRate || "",
    });
  }

  // Mutations
  const updateChamaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof chamaFormSchema>) => {
      // Mock API call
      return { ...chama, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}`] });
      toast({
        title: "Chama updated",
        description: "The chama details have been updated successfully",
      });
    },
  });
  
  const updateRulesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ruleFormSchema>) => {
      // Mock API call
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chamas/${chamaId}/rules`] });
      toast({
        title: "Rules updated",
        description: "The contribution rules have been updated successfully",
      });
    },
  });
  
  const leaveChamaMutation = useMutation({
    mutationFn: async () => {
      // Mock API call
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Left chama",
        description: "You have successfully left the chama",
      });
      // Redirect to home page after leaving
      window.location.href = "/";
    },
  });

  // Form submission handlers
  const onChamaSubmit = (data: z.infer<typeof chamaFormSchema>) => {
    updateChamaMutation.mutate(data);
  };
  
  const onRulesSubmit = (data: z.infer<typeof ruleFormSchema>) => {
    updateRulesMutation.mutate(data);
  };
  
  const handleLeaveChama = () => {
    leaveChamaMutation.mutate();
  };

  // Simple function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <ChamaLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Chama Settings</h2>
        <p className="text-muted-foreground">Manage your chama's configuration</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members & Roles
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Info className="mr-2 h-4 w-4" />
            Contribution Rules
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chama Details</CardTitle>
                <CardDescription>
                  Update your chama's basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...chamaForm}>
                  <form onSubmit={chamaForm.handleSubmit(onChamaSubmit)} className="space-y-4">
                    <FormField
                      control={chamaForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chama Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={chamaForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ""} 
                              placeholder="Describe the purpose of your chama"
                            />
                          </FormControl>
                          <FormDescription>
                            This description will be shown to all members.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateChamaMutation.isPending || !chamaForm.formState.isDirty}
                      >
                        {updateChamaMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Contribution Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get notified before contributions are due</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Meeting Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming meetings</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-destructive">
              <CardHeader className="text-destructive">
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription className="text-destructive/80">
                  Irreversible actions that affect your membership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog 
                  open={leaveDialogOpen} 
                  onOpenChange={setLeaveDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Chama
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove your membership from the chama. You will lose access to all chama resources and activities. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={handleLeaveChama}
                      >
                        Yes, Leave Chama
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Members & Roles Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Members & Roles</CardTitle>
              <CardDescription>
                Manage member roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member: any) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt={member.user.fullName} />
                        <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chairperson">Chairperson</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* If no members or loading */}
                {(members.length === 0 || isMembersLoading) && (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">
                      {isMembersLoading ? "Loading members..." : "No members found"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                {members.length} members in total
              </div>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contribution Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Rules</CardTitle>
              <CardDescription>
                Set up rules for contributions and financial operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRulesLoading ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">Loading rules...</p>
                </div>
              ) : (
                <Form {...rulesForm}>
                  <form onSubmit={rulesForm.handleSubmit(onRulesSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={rulesForm.control}
                        name="contributionAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contribution Amount (KES)</FormLabel>
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                            <FormDescription>
                              The amount each member contributes per cycle
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={rulesForm.control}
                        name="contributionFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contribution Frequency</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How often members contribute
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={rulesForm.control}
                        name="latePaymentFine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Late Payment Fine (KES)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="text" />
                            </FormControl>
                            <FormDescription>
                              Fine for late contributions (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={rulesForm.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} type="text" />
                            </FormControl>
                            <FormDescription>
                              For internal loans (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-md border mt-6">
                      <div className="flex gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium mb-1">Important Note</h4>
                          <p className="text-sm text-muted-foreground">
                            Changing these rules requires approval from the chairperson and will only apply to future contributions.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateRulesMutation.isPending || !rulesForm.formState.isDirty}
                      >
                        {updateRulesMutation.isPending ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Rules
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ChamaLayout>
  );
}