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
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lock,
  Shield,
  User,
  Key,
  Fingerprint,
  ShieldAlert,
  AlertTriangle,
  Eye,
  EyeOff,
  UserCheck,
  Users,
  Activity,
  LogOut,
  RefreshCw,
  Smartphone,
  Mail,
  CheckCircle2,
  Settings,
  XCircle,
  Info,
  Save,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Form schema for security settings
const securitySettingsSchema = z.object({
  passwordMinLength: z.string().min(1, "Required"),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSymbols: z.boolean(),
  passwordExpiryDays: z.string().min(1, "Required"),
  sessionTimeoutMinutes: z.string().min(1, "Required"),
  maxLoginAttempts: z.string().min(1, "Required"),
  twoFactorAuthRequired: z.boolean(),
  ipRestrictionEnabled: z.boolean(),
  allowedIpAddresses: z.string().optional(),
});

// Form schema for role permissions
const rolePermissionsSchema = z.object({
  roleName: z.string().min(1, "Required"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

// Mock security log data
const securityLogs = [
  {
    id: 1,
    eventType: "login",
    user: "admin@example.com",
    timestamp: new Date(2023, 10, 15, 14, 32),
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    status: "success",
  },
  {
    id: 2,
    eventType: "login",
    user: "john.doe@example.com",
    timestamp: new Date(2023, 10, 15, 13, 18),
    ipAddress: "192.168.1.108",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    status: "failed",
  },
  {
    id: 3,
    eventType: "password_change",
    user: "jane.smith@example.com",
    timestamp: new Date(2023, 10, 15, 11, 45),
    ipAddress: "192.168.1.115",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    status: "success",
  },
  {
    id: 4,
    eventType: "role_change",
    user: "admin@example.com",
    timestamp: new Date(2023, 10, 14, 16, 22),
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    status: "success",
    details: "Changed role of user john.doe@example.com from 'Member' to 'Admin'",
  },
  {
    id: 5,
    eventType: "login",
    user: "alice@example.com",
    timestamp: new Date(2023, 10, 14, 9, 12),
    ipAddress: "192.168.1.120",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    status: "success",
  },
];

// Mock roles data
const rolesData = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access and control",
    userCount: 2,
    permissionCount: 24,
  },
  {
    id: 2,
    name: "Admin",
    description: "System management without security settings",
    userCount: 5,
    permissionCount: 18,
  },
  {
    id: 3,
    name: "Finance Manager",
    description: "Access to financial data and reports",
    userCount: 8,
    permissionCount: 12,
  },
  {
    id: 4,
    name: "Chama Manager",
    description: "Can manage chama groups",
    userCount: 15,
    permissionCount: 10,
  },
  {
    id: 5,
    name: "Customer Support",
    description: "Limited access for support tasks",
    userCount: 10,
    permissionCount: 8,
  },
];

// Mock available permissions
const availablePermissions = [
  { id: "user_view", category: "Users", name: "View Users" },
  { id: "user_create", category: "Users", name: "Create Users" },
  { id: "user_edit", category: "Users", name: "Edit Users" },
  { id: "user_delete", category: "Users", name: "Delete Users" },
  
  { id: "chama_view", category: "Chamas", name: "View Chamas" },
  { id: "chama_create", category: "Chamas", name: "Create Chamas" },
  { id: "chama_edit", category: "Chamas", name: "Edit Chamas" },
  { id: "chama_delete", category: "Chamas", name: "Delete Chamas" },
  
  { id: "transaction_view", category: "Transactions", name: "View Transactions" },
  { id: "transaction_create", category: "Transactions", name: "Create Transactions" },
  { id: "transaction_approve", category: "Transactions", name: "Approve Transactions" },
  { id: "transaction_cancel", category: "Transactions", name: "Cancel Transactions" },
  
  { id: "report_view", category: "Reports", name: "View Reports" },
  { id: "report_export", category: "Reports", name: "Export Reports" },
  
  { id: "settings_view", category: "Settings", name: "View Settings" },
  { id: "settings_edit", category: "Settings", name: "Edit Settings" },
  
  { id: "security_view", category: "Security", name: "View Security Settings" },
  { id: "security_edit", category: "Security", name: "Edit Security Settings" },
  { id: "roles_manage", category: "Security", name: "Manage Roles & Permissions" },
  { id: "logs_view", category: "Security", name: "View Security Logs" },
  
  { id: "backup_view", category: "Backup", name: "View Backups" },
  { id: "backup_create", category: "Backup", name: "Create Backups" },
  { id: "backup_restore", category: "Backup", name: "Restore from Backup" },
  { id: "backup_settings", category: "Backup", name: "Configure Backup Settings" },
];

export default function Security() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState<number | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [creatingNewRole, setCreatingNewRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Form for security settings
  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      passwordMinLength: "8",
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      passwordExpiryDays: "90",
      sessionTimeoutMinutes: "30",
      maxLoginAttempts: "5",
      twoFactorAuthRequired: true,
      ipRestrictionEnabled: false,
      allowedIpAddresses: "",
    },
  });
  
  // Form for role permissions
  const roleForm = useForm<z.infer<typeof rolePermissionsSchema>>({
    resolver: zodResolver(rolePermissionsSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  // Mutations
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof securitySettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Security settings have been updated successfully.",
      });
    },
  });
  
  const saveRoleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof rolePermissionsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: creatingNewRole 
          ? "New role has been created successfully." 
          : "Role permissions have been updated successfully.",
      });
      setIsEditingRole(false);
      setCreatingNewRole(false);
    },
  });

  // Form submission handlers
  const onSecuritySubmit = (data: z.infer<typeof securitySettingsSchema>) => {
    saveSettingsMutation.mutate(data);
  };
  
  const onRoleSubmit = (data: z.infer<typeof rolePermissionsSchema>) => {
    saveRoleMutation.mutate(data);
  };

  // Role management
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    roleForm.reset({
      roleName: role.name,
      description: role.description,
      permissions: ["user_view", "chama_view"], // Mock permissions
    });
    setIsEditingRole(true);
    setCreatingNewRole(false);
  };
  
  const handleCreateRole = () => {
    setSelectedRole(null);
    roleForm.reset({
      roleName: "",
      description: "",
      permissions: [],
    });
    setIsEditingRole(true);
    setCreatingNewRole(true);
  };
  
  const handleViewRole = (role: any) => {
    setSelectedRole(role);
    setActiveRole(role.id);
  };
  
  const handleToggleLog = (logId: number) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  // Group permissions by category
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <AdminLayout title="Security Settings">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Security & Permissions</h2>
          <p className="text-muted-foreground">Manage system security settings and user roles</p>
        </div>
      </div>
      
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">
            <Shield className="h-4 w-4 mr-2" />
            Security Settings
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Security Logs
          </TabsTrigger>
        </TabsList>
        
        {/* Security Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure system-wide security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  {/* Password Policy */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="passwordMinLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Password Length</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min="6" max="30" />
                            </FormControl>
                            <FormDescription>
                              Minimum number of characters required
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordExpiryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min="0" max="365" />
                            </FormControl>
                            <FormDescription>
                              Days before password expires (0 = never)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormField
                          control={securityForm.control}
                          name="passwordRequireUppercase"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Require uppercase letters
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="passwordRequireLowercase"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Require lowercase letters
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <FormField
                          control={securityForm.control}
                          name="passwordRequireNumbers"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Require numbers
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="passwordRequireSymbols"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Require special characters
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Session Security */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Session Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeoutMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (Minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min="5" max="1440" />
                            </FormControl>
                            <FormDescription>
                              Minutes of inactivity before auto logout
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="maxLoginAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Login Attempts</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} min="3" max="10" />
                            </FormControl>
                            <FormDescription>
                              Number of failed attempts before account lockout
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuthRequired"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center border p-3 rounded-md">
                          <div>
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <FormDescription>
                              Require 2FA for all admin users
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
                  
                  {/* IP Restrictions */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">IP Restrictions</h3>
                    
                    <FormField
                      control={securityForm.control}
                      name="ipRestrictionEnabled"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center border p-3 rounded-md">
                          <div>
                            <FormLabel className="text-base">IP Address Restrictions</FormLabel>
                            <FormDescription>
                              Limit admin access to specific IP addresses
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
                    
                    {securityForm.watch("ipRestrictionEnabled") && (
                      <FormField
                        control={securityForm.control}
                        name="allowedIpAddresses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed IP Addresses</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter IP addresses, one per line" 
                                rows={3}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter one IP address per line. Use CIDR notation for ranges (e.g. 192.168.1.0/24)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={saveSettingsMutation.isPending || !securityForm.formState.isDirty}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          {isEditingRole ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {creatingNewRole ? "Create New Role" : `Edit Role: ${selectedRole?.name}`}
                </CardTitle>
                <CardDescription>
                  {creatingNewRole 
                    ? "Define a new user role and its permissions" 
                    : "Modify permissions for this role"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={roleForm.control}
                        name="roleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Finance Manager" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={roleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ""} 
                                placeholder="Brief description of this role"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={roleForm.control}
                        name="permissions"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base">Permissions</FormLabel>
                            <FormDescription>
                              Select the permissions for this role
                            </FormDescription>
                            
                            <div className="space-y-4 mt-2">
                              {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <Collapsible key={category} className="border rounded-md">
                                  <CollapsibleTrigger className="flex justify-between items-center w-full p-3 hover:bg-muted/50">
                                    <div className="font-medium">{category}</div>
                                    <ChevronDown className="h-4 w-4" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-3 pt-0 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {perms.map((permission) => (
                                        <FormField
                                          key={permission.id}
                                          control={roleForm.control}
                                          name="permissions"
                                          render={({ field }) => {
                                            return (
                                              <FormItem
                                                key={permission.id}
                                                className="flex items-center space-y-0 space-x-2"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(permission.id)}
                                                    onCheckedChange={(checked) => {
                                                      return checked
                                                        ? field.onChange([...field.value, permission.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                              (value) => value !== permission.id
                                                            )
                                                          )
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                  {permission.name}
                                                </FormLabel>
                                              </FormItem>
                                            )
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                            
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingRole(false);
                          setCreatingNewRole(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={saveRoleMutation.isPending}
                      >
                        {saveRoleMutation.isPending 
                          ? "Saving..." 
                          : creatingNewRole ? "Create Role" : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : activeRole ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveRole(null)}
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Back to Roles
                </Button>
                <Button onClick={() => handleEditRole(selectedRole)}>
                  Edit Role
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedRole?.name}</CardTitle>
                      <CardDescription>
                        {selectedRole?.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {selectedRole?.userCount} Users
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <Collapsible key={category} className="border rounded-md">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-3 hover:bg-muted/50">
                            <div className="font-medium">{category}</div>
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {perms.map((permission) => {
                                // Simulating whether permission is granted
                                const isGranted = Math.random() > 0.5;
                                
                                return (
                                  <div 
                                    key={permission.id} 
                                    className="flex items-center gap-2"
                                  >
                                    {isGranted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className={!isGranted ? "text-muted-foreground" : ""}>
                                      {permission.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Users with this Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">John Doe</TableCell>
                        <TableCell>john.doe@example.com</TableCell>
                        <TableCell>Oct 15, 2023</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Change Role</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Jane Smith</TableCell>
                        <TableCell>jane.smith@example.com</TableCell>
                        <TableCell>Sep 22, 2023</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Change Role</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Roles</h3>
                <Button onClick={handleCreateRole}>
                  Create New Role
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rolesData.map((role) => (
                  <Card key={role.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleViewRole(role)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-medium">{role.userCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Permissions</p>
                          <p className="font-medium">{role.permissionCount}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRole(role);
                        }}
                      >
                        Edit Role
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Security Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>
                Review security events and user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="login">Login Attempts</SelectItem>
                      <SelectItem value="password">Password Changes</SelectItem>
                      <SelectItem value="role">Role Changes</SelectItem>
                      <SelectItem value="settings">Settings Changes</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    Export Logs
                  </Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <div 
                        className="p-3"
                        onClick={() => handleToggleLog(log.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {log.eventType === "login" ? (
                              log.status === "success" ? (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )
                            ) : log.eventType === "password_change" ? (
                              <Key className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Users className="h-4 w-4 text-purple-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {log.eventType === "login" 
                                  ? `Login ${log.status === "success" ? "successful" : "failed"}`
                                  : log.eventType === "password_change"
                                    ? "Password changed"
                                    : "Role change"}
                              </p>
                              <p className="text-sm text-muted-foreground">{log.user}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(log.timestamp, "MMM d, yyyy HH:mm")}
                          </div>
                        </div>
                        
                        {expandedLog === log.id && (
                          <div className="mt-3 pt-3 border-t text-sm space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-muted-foreground">IP Address</p>
                                <p>{log.ipAddress}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">User Agent</p>
                                <p className="truncate">{log.userAgent}</p>
                              </div>
                            </div>
                            
                            {log.details && (
                              <div>
                                <p className="text-muted-foreground">Details</p>
                                <p>{log.details}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 5 of 128 events
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}