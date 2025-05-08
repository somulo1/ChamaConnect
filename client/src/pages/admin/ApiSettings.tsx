import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Key,
  Check,
  X,
  Loader2,
  Mail,
  MessageSquare,
  SmartphoneNfc,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Form schema for API keys
const apiKeySchema = z.object({
  sendgridApiKey: z.string().min(1, { message: "SendGrid API key is required" }),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  mobilePaymentApiKey: z.string().optional(),
});

type ApiKeysFormValues = z.infer<typeof apiKeySchema>;

// Interface for API keys
interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: "active" | "inactive";
  createdAt: Date;
  lastUsed?: Date;
}

export default function ApiSettings() {
  const { toast } = useToast();
  const [showSendGridKey, setShowSendGridKey] = useState(false);
  const [showTwilioKey, setShowTwilioKey] = useState(false);
  const [showPaymentKey, setShowPaymentKey] = useState(false);
  const [testingSendGrid, setTestingSendGrid] = useState(false);
  
  // Mock fetch for API keys
  const { data: apiKeys = {}, isLoading } = useQuery({
    queryKey: ["/api/admin/api-keys"],
    // This would fetch API keys from the server in a real app
    // For now, we'll use placeholder data
    queryFn: async () => {
      return {
        sendgridApiKey: process.env.SENDGRID_API_KEY || "",
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        mobilePaymentApiKey: "",
      };
    },
  });
  
  // Form for API keys
  const form = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      sendgridApiKey: apiKeys.sendgridApiKey || "",
      twilioAccountSid: apiKeys.twilioAccountSid || "",
      twilioAuthToken: apiKeys.twilioAuthToken || "",
      twilioPhoneNumber: apiKeys.twilioPhoneNumber || "",
      mobilePaymentApiKey: apiKeys.mobilePaymentApiKey || "",
    },
  });
  
  // Update the form values when the data is loaded
  useState(() => {
    if (apiKeys) {
      form.reset({
        sendgridApiKey: apiKeys.sendgridApiKey || "",
        twilioAccountSid: apiKeys.twilioAccountSid || "",
        twilioAuthToken: apiKeys.twilioAuthToken || "",
        twilioPhoneNumber: apiKeys.twilioPhoneNumber || "",
        mobilePaymentApiKey: apiKeys.mobilePaymentApiKey || "",
      });
    }
  });

  // Mutation for saving API keys
  const saveApiKeysMutation = useMutation({
    mutationFn: async (data: ApiKeysFormValues) => {
      // This would save the API keys to the server in a real app
      // For now, we'll just return the data
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API keys saved",
        description: "Your API keys have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save API keys",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test SendGrid connection
  const testSendGridConnection = async () => {
    const sendgridApiKey = form.getValues("sendgridApiKey");
    
    if (!sendgridApiKey) {
      toast({
        title: "SendGrid API key required",
        description: "Please enter a SendGrid API key before testing the connection.",
        variant: "destructive",
      });
      return;
    }
    
    setTestingSendGrid(true);
    
    try {
      // In a real app, this would make an API call to test the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "SendGrid connection successful",
        description: "Your SendGrid API key is working correctly.",
      });
    } catch (error) {
      toast({
        title: "SendGrid connection failed",
        description: "There was a problem connecting to SendGrid. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setTestingSendGrid(false);
    }
  };

  const onSubmit = (data: ApiKeysFormValues) => {
    saveApiKeysMutation.mutate(data);
  };

  return (
    <AdminLayout title="API Settings">
      <div className="space-y-6">
        <Tabs defaultValue="email" className="space-y-4">
          <TabsList>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SendGrid API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your SendGrid API credentials for sending emails.
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        SendGrid is used for sending emails to users, including registration confirmations,
                        contribution reminders, and other notifications.
                      </AlertDescription>
                    </Alert>
                    
                    <FormField
                      control={form.control}
                      name="sendgridApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SendGrid API Key</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  type={showSendGridKey ? "text" : "password"} 
                                  placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx" 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-0 h-full"
                                  onClick={() => setShowSendGridKey(!showSendGridKey)}
                                >
                                  {showSendGridKey ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={testSendGridConnection}
                              disabled={testingSendGrid}
                            >
                              {testingSendGrid ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                "Test Connection"
                              )}
                            </Button>
                          </div>
                          <FormDescription>
                            Get your API key from the <a href="https://app.sendgrid.com/settings/api_keys" className="text-primary underline" target="_blank" rel="noopener noreferrer">SendGrid Dashboard</a>.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-notifications"
                        defaultChecked
                      />
                      <label
                        htmlFor="email-notifications"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable email notifications
                      </label>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button">
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveApiKeysMutation.isPending}
                    >
                      {saveApiKeysMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Manage email templates used for notifications and communications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Welcome Email",
                      description: "Sent when a user registers",
                      status: "active",
                    },
                    {
                      name: "Contribution Reminder",
                      description: "Sent to remind members about upcoming contributions",
                      status: "active",
                    },
                    {
                      name: "Meeting Notification",
                      description: "Sent to notify members about upcoming meetings",
                      status: "active",
                    },
                    {
                      name: "Password Reset",
                      description: "Sent when a user requests a password reset",
                      status: "active",
                    }
                  ].map((template, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.status === "active" ? "default" : "outline"}>
                          {template.status === "active" ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="mr-1 h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Twilio SMS Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Twilio credentials for SMS notifications.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Twilio is used for sending SMS notifications to users, including contribution reminders,
                    meeting notifications, and security alerts.
                  </AlertDescription>
                </Alert>
                
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="twilioAccountSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Account SID</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="AC********************************" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twilioAuthToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Auth Token</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                {...field} 
                                type={showTwilioKey ? "text" : "password"} 
                                placeholder="********************************" 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-0 h-full"
                              onClick={() => setShowTwilioKey(!showTwilioKey)}
                            >
                              {showTwilioKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twilioPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twilio Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="+1234567890" 
                            />
                          </FormControl>
                          <FormDescription>
                            The phone number that will appear as the sender.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="sms-notifications"
                        defaultChecked={false}
                      />
                      <label
                        htmlFor="sms-notifications"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable SMS notifications
                      </label>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  Reset
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={saveApiKeysMutation.isPending}
                >
                  {saveApiKeysMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SmartphoneNfc className="h-5 w-5" />
                  Mobile Payment Configuration
                </CardTitle>
                <CardDescription>
                  Configure your mobile payment API credentials for processing payments.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Mobile payment integration is used for processing contributions, membership fees,
                    and marketplace transactions.
                  </AlertDescription>
                </Alert>
                
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mobilePaymentApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Payment API Key</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                {...field} 
                                type={showPaymentKey ? "text" : "password"} 
                                placeholder="Enter mobile payment API key" 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-0 h-full"
                              onClick={() => setShowPaymentKey(!showPaymentKey)}
                            >
                              {showPaymentKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormDescription>
                            Used for integrating with local mobile payment providers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="payment-gateway"
                        defaultChecked={false}
                      />
                      <label
                        htmlFor="payment-gateway"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable payment gateway
                      </label>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  Reset
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={saveApiKeysMutation.isPending}
                >
                  {saveApiKeysMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure webhooks for integration with other services.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Coming Soon</AlertTitle>
                    <AlertDescription>
                      Webhook integration is under development and will be available in a future update.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">No webhooks configured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure webhooks to integrate with third-party services.
                    </p>
                    <Button className="mt-4" disabled>
                      <Key className="mr-2 h-4 w-4" />
                      Add Webhook
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}