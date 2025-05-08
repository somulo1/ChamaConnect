import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Mail,
  Building,
  Info,
  Globe,
  Phone,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Store,
  AlertCircle,
  PenBox,
  Bell,
  CreditCard,
  Eye,
  EyeOff
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

// Form schema for general settings
const generalSettingsSchema = z.object({
  appName: z.string().min(1, "App name is required"),
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Must be a valid email"),
  contactPhone: z.string().optional(),
  supportEmail: z.string().email("Must be a valid email"),
  defaultLanguage: z.string(),
  defaultCurrency: z.string(),
  timezone: z.string(),
  maintenanceMode: z.boolean(),
});

// Form schema for email settings
const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.string().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  senderEmail: z.string().email("Must be a valid email"),
  senderName: z.string().min(1, "Sender name is required"),
  enableSsl: z.boolean(),
});

// Form schema for notification settings
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  systemNotifications: z.boolean(),
  adminAlerts: z.boolean(),
  userActivityDigest: z.boolean(),
  financialReportInterval: z.string(),
});

// Form schema for payment settings
const paymentSettingsSchema = z.object({
  mobilePaymentProvider: z.string(),
  mpesaShortcode: z.string().optional(),
  mpesaConsumerKey: z.string().optional(),
  mpesaConsumerSecret: z.string().optional(),
  paypalEnabled: z.boolean(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  stripeEnabled: z.boolean(),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  transactionFee: z.string(),
});

export default function AdminSettings() {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<"success" | "error" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  // Forms for different settings sections
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      appName: "Chama App",
      companyName: "Your Company Ltd",
      contactEmail: "contact@example.com",
      contactPhone: "+254 712 345 678",
      supportEmail: "support@example.com",
      defaultLanguage: "en",
      defaultCurrency: "KES",
      timezone: "Africa/Nairobi",
      maintenanceMode: false,
    },
  });
  
  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: "smtp.example.com",
      smtpPort: "587",
      smtpUsername: "smtp_user@example.com",
      smtpPassword: "••••••••",
      senderEmail: "noreply@example.com",
      senderName: "Chama App",
      enableSsl: true,
    },
  });
  
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      systemNotifications: true,
      adminAlerts: true,
      userActivityDigest: true,
      financialReportInterval: "weekly",
    },
  });
  
  const paymentForm = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      mobilePaymentProvider: "mpesa",
      mpesaShortcode: "123456",
      mpesaConsumerKey: "••••••••",
      mpesaConsumerSecret: "••••••••",
      paypalEnabled: false,
      paypalClientId: "",
      paypalClientSecret: "",
      stripeEnabled: false,
      stripePublishableKey: "",
      stripeSecretKey: "",
      transactionFee: "2.5",
    },
  });

  // Mutations
  const saveGeneralSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof generalSettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "General settings have been updated successfully.",
      });
    },
  });
  
  const saveEmailSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Email settings have been updated successfully.",
      });
    },
  });
  
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      });
    },
  });
  
  const savePaymentSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentSettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Payment settings have been updated successfully.",
      });
    },
  });
  
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      setIsTestingEmail(true);
      // Simulate API call with success/failure based on random outcome
      return new Promise<boolean>((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% chance of success
          setIsTestingEmail(false);
          setEmailTestResult(success ? "success" : "error");
          if (success) {
            resolve(true);
          } else {
            reject(new Error("Failed to send test email"));
          }
        }, 2000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "The test email was sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Failed to send test email. Please check your SMTP settings.",
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onGeneralSubmit = (data: z.infer<typeof generalSettingsSchema>) => {
    saveGeneralSettingsMutation.mutate(data);
  };
  
  const onEmailSubmit = (data: z.infer<typeof emailSettingsSchema>) => {
    saveEmailSettingsMutation.mutate(data);
  };
  
  const onNotificationSubmit = (data: z.infer<typeof notificationSettingsSchema>) => {
    saveNotificationSettingsMutation.mutate(data);
  };
  
  const onPaymentSubmit = (data: z.infer<typeof paymentSettingsSchema>) => {
    savePaymentSettingsMutation.mutate(data);
  };
  
  const handleTestEmail = () => {
    testEmailMutation.mutate();
  };

  return (
    <AdminLayout title="System Settings">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">System Settings</h2>
          <p className="text-muted-foreground">Configure application-wide settings</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic application settings and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="appName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Name displayed throughout the application
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your organization's legal name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Primary contact email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Support phone number (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Email for user support inquiries
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="sw">Swahili</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Default language for the application
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                              <SelectItem value="USD">US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Default currency for transactions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                              <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                              <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            System timezone for dates and times
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Maintenance Mode</FormLabel>
                          <FormDescription>
                            When enabled, only administrators can access the site
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={saveGeneralSettingsMutation.isPending || !generalForm.formState.isDirty}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveGeneralSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                SMTP server settings for sending system emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            e.g. smtp.gmail.com, smtp.sendgrid.net
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Common ports: 25, 465, 587
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Login username for SMTP server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Hide" : "Show"} password
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Password for SMTP authentication
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="senderEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            "From" email address for system emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Display name for system emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={emailForm.control}
                    name="enableSsl"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable SSL/TLS</FormLabel>
                          <FormDescription>
                            Use secure connection for SMTP (recommended)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {emailTestResult && (
                    <Alert className={
                      emailTestResult === "success" 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    }>
                      {emailTestResult === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertTitle>
                        {emailTestResult === "success" 
                          ? "Test Email Sent Successfully" 
                          : "Failed to Send Test Email"}
                      </AlertTitle>
                      <AlertDescription>
                        {emailTestResult === "success" 
                          ? "The test email was sent successfully. Please check your inbox." 
                          : "There was an error sending the test email. Please verify your SMTP settings."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={isTestingEmail || saveEmailSettingsMutation.isPending}
                    >
                      {isTestingEmail ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={saveEmailSettingsMutation.isPending || !emailForm.formState.isDirty}
                    >
                      {saveEmailSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                            </div>
                            <FormDescription>
                              Send notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">SMS Notifications</FormLabel>
                            </div>
                            <FormDescription>
                              Send notifications via SMS
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                            </div>
                            <FormDescription>
                              Send notifications to mobile devices
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="systemNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">In-App Notifications</FormLabel>
                            </div>
                            <FormDescription>
                              Show notifications within the app
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Administrator Notifications</h3>
                    
                    <FormField
                      control={notificationForm.control}
                      name="adminAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">Admin Alert Notifications</FormLabel>
                            </div>
                            <FormDescription>
                              Notify admins about important system events
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="userActivityDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <FormLabel className="text-base">User Activity Digest</FormLabel>
                            </div>
                            <FormDescription>
                              Send regular reports of platform activity
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="financialReportInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Report Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often to send financial reports to admins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={saveNotificationSettingsMutation.isPending || !notificationForm.formState.isDirty}
                    >
                      {saveNotificationSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
              <CardDescription>
                Configure payment providers and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Mobile Payment</h3>
                    
                    <FormField
                      control={paymentForm.control}
                      name="mobilePaymentProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Payment Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mpesa">M-Pesa</SelectItem>
                              <SelectItem value="airtel">Airtel Money</SelectItem>
                              <SelectItem value="tkash">T-Kash</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Primary mobile payment system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("mobilePaymentProvider") === "mpesa" && (
                      <div className="space-y-4 border rounded-md p-4">
                        <h4 className="font-medium">M-Pesa Configuration</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="mpesaShortcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>M-Pesa Shortcode</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="mpesaConsumerKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Consumer Key</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="mpesaConsumerSecret"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Consumer Secret</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">International Payment Options</h3>
                    
                    <FormField
                      control={paymentForm.control}
                      name="paypalEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">PayPal</FormLabel>
                            <FormDescription>
                              Enable PayPal payment processing
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("paypalEnabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PayPal Client ID</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PayPal Client Secret</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <FormField
                      control={paymentForm.control}
                      name="stripeEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between border-b pb-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Stripe</FormLabel>
                            <FormDescription>
                              Enable Stripe payment processing
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("stripeEnabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                        <FormField
                          control={paymentForm.control}
                          name="stripePublishableKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Publishable Key</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Secret Key</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Transaction Settings</h3>
                    
                    <FormField
                      control={paymentForm.control}
                      name="transactionFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Fee (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0" max="100" />
                          </FormControl>
                          <FormDescription>
                            Percentage fee charged for each transaction (0 for no fee)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={savePaymentSettingsMutation.isPending || !paymentForm.formState.isDirty}
                    >
                      {savePaymentSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}