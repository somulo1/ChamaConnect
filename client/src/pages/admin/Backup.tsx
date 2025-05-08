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
  Progress
} from "@/components/ui/progress";
import {
  AlertCircle,
  Database,
  Download,
  Upload,
  RefreshCcw,
  Calendar,
  Save,
  Clock,
  Archive,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  File,
  Trash2,
  Settings,
  HardDrive,
  FileDown,
  FileUp,
  RotateCcw,
  X
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Form schema for backup settings
const backupSettingsSchema = z.object({
  scheduledBackup: z.boolean(),
  frequency: z.string().min(1, "Please select a frequency"),
  backupTime: z.string().min(1, "Please select a time"),
  retentionPeriod: z.string().min(1, "Please select a retention period"),
  includeUserData: z.boolean(),
  includeTransactions: z.boolean(),
  includeChamaData: z.boolean(),
  includeSystemSettings: z.boolean(),
});

// Mock backup history data
const backupHistory = [
  {
    id: 1,
    timestamp: new Date(2023, 10, 15, 2, 30),
    type: "automated",
    status: "success",
    size: "42.3 MB",
    location: "Google Drive",
  },
  {
    id: 2,
    timestamp: new Date(2023, 10, 14, 2, 30),
    type: "automated",
    status: "success",
    size: "41.8 MB",
    location: "Google Drive",
  },
  {
    id: 3,
    timestamp: new Date(2023, 10, 13, 15, 45),
    type: "manual",
    status: "success",
    size: "41.5 MB",
    location: "Local Storage",
  },
  {
    id: 4,
    timestamp: new Date(2023, 10, 12, 2, 30),
    type: "automated",
    status: "failed",
    size: "0 MB",
    location: "Google Drive",
  },
  {
    id: 5,
    timestamp: new Date(2023, 10, 11, 2, 30),
    type: "automated",
    status: "success",
    size: "40.9 MB",
    location: "Google Drive",
  },
];

export default function Backup() {
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedBackupData, setSelectedBackupData] = useState<any>(null);
  const { toast } = useToast();
  
  // Get cloud connection status
  const { data: cloudConnectionStatus = "connected" } = useQuery({
    queryKey: ["/api/admin/backup/cloud-status"],
  });

  // Form for backup settings
  const form = useForm<z.infer<typeof backupSettingsSchema>>({
    resolver: zodResolver(backupSettingsSchema),
    defaultValues: {
      scheduledBackup: true,
      frequency: "daily",
      backupTime: "02:30",
      retentionPeriod: "30days",
      includeUserData: true,
      includeTransactions: true,
      includeChamaData: true,
      includeSystemSettings: true,
    },
  });

  // Mutations
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof backupSettingsSchema>) => {
      // Simulating API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Backup settings have been updated successfully.",
      });
    },
  });

  const backupNowMutation = useMutation({
    mutationFn: async () => {
      setIsBackupInProgress(true);
      setBackupProgress(0);
      
      // Simulate backup process with progress updates
      return new Promise<void>(resolve => {
        const interval = setInterval(() => {
          setBackupProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsBackupInProgress(false);
                resolve();
              }, 500);
              return 100;
            }
            return newProgress;
          });
        }, 500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Backup successful",
        description: "System backup has been created successfully.",
      });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: number) => {
      setIsRestoreInProgress(true);
      setRestoreProgress(0);
      
      // Simulate restore process
      return new Promise<void>(resolve => {
        const interval = setInterval(() => {
          setRestoreProgress(prev => {
            const newProgress = prev + 5;
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsRestoreInProgress(false);
                resolve();
              }, 500);
              return 100;
            }
            return newProgress;
          });
        }, 300);
      });
    },
    onSuccess: () => {
      toast({
        title: "Restore successful",
        description: "System has been restored successfully.",
      });
      setShowRestoreConfirm(false);
    },
  });

  // Form submission
  const onSubmit = (data: z.infer<typeof backupSettingsSchema>) => {
    saveSettingsMutation.mutate(data);
  };

  // View backup details
  const viewBackupDetails = (backupId: number) => {
    const backup = backupHistory.find(b => b.id === backupId);
    if (backup) {
      setSelectedBackupData(backup);
    }
  };

  // Initiate restore process
  const handleRestore = (backupId: number) => {
    setSelectedBackupId(backupId);
    setShowRestoreConfirm(true);
  };

  // Confirm restore
  const confirmRestore = () => {
    if (selectedBackupId) {
      restoreBackupMutation.mutate(selectedBackupId);
    }
  };

  return (
    <AdminLayout title="Backup & Restore">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Backup & Restore</h2>
          <p className="text-muted-foreground">Manage system backups and restore data</p>
        </div>
        
        <div className="flex items-center gap-2">
          {cloudConnectionStatus === "connected" ? (
            <div className="flex items-center text-green-600 text-sm">
              <Cloud className="h-4 w-4 mr-1" />
              <span>Connected to Google Drive</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-sm">
              <CloudOff className="h-4 w-4 mr-1" />
              <span>Cloud storage disconnected</span>
            </div>
          )}
          
          <Button 
            onClick={() => backupNowMutation.mutate()}
            disabled={isBackupInProgress || backupNowMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Backup Now
          </Button>
        </div>
      </div>
      
      {/* Backup in progress indicator */}
      {isBackupInProgress && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Backup in progress...</h3>
                <span className="text-sm">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Creating system backup. This may take a few minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Restore in progress indicator */}
      {isRestoreInProgress && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Restore in progress...</h3>
                <span className="text-sm">{restoreProgress}%</span>
              </div>
              <Progress value={restoreProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Restoring system from backup. Please do not close this window.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Backup History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Backup Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Backup History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                View and manage previous system backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Storage Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        {format(backup.timestamp, "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="capitalize">{backup.type}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.location}</TableCell>
                      <TableCell>
                        {backup.status === "success" ? (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-600 text-sm">Success</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-red-600 text-sm">Failed</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewBackupDetails(backup.id)}
                            disabled={backup.status !== "success"}
                          >
                            <File className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(backup.id)}
                            disabled={backup.status !== "success"}
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Restore</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Dialog for Backup Details */}
          <Dialog open={!!selectedBackupData} onOpenChange={(open) => !open && setSelectedBackupData(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Backup Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected backup
                </DialogDescription>
              </DialogHeader>
              
              {selectedBackupData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Backup ID</p>
                      <p>#{selectedBackupData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                      <p>{format(selectedBackupData.timestamp, "MMMM d, yyyy HH:mm")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="capitalize">{selectedBackupData.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="capitalize">{selectedBackupData.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Size</p>
                      <p>{selectedBackupData.size}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Storage Location</p>
                      <p>{selectedBackupData.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Included Data</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">User Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Transaction Records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Chama Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">System Settings</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedBackupData(null)}>
                      Close
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={() => {
                        handleRestore(selectedBackupData.id);
                        setSelectedBackupData(null);
                      }}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Confirm Restore Dialog */}
          <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm System Restore</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Warning: This is a major system operation</span>
                    </div>
                    <p>
                      You are about to restore the system to a previous backup state. 
                      This will replace all current data with the data from the backup.
                    </p>
                    <p className="font-medium">
                      This action cannot be undone and will require system downtime.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmRestore}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Yes, Restore System
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
        
        {/* Backup Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>
                Configure automated backup settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="scheduledBackup"
                      render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                          <div>
                            <FormLabel>Scheduled Backup</FormLabel>
                            <FormDescription>
                              Enable automatic scheduled backups
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
                    
                    {form.watch("scheduledBackup") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Backup Frequency</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
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
                                How often the system should create backups
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="backupTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Backup Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Time of day when the backup should run (24h format)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="retentionPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retention Period</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="7days">7 days</SelectItem>
                                  <SelectItem value="14days">14 days</SelectItem>
                                  <SelectItem value="30days">30 days</SelectItem>
                                  <SelectItem value="90days">90 days</SelectItem>
                                  <SelectItem value="365days">1 year</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How long to keep backups before deletion
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Backup Data Selection</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select which data to include in the backups
                      </p>
                      
                      <FormField
                        control={form.control}
                        name="includeUserData"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0">
                            <FormLabel>User Data</FormLabel>
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
                        control={form.control}
                        name="includeTransactions"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0">
                            <FormLabel>Transaction Records</FormLabel>
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
                        control={form.control}
                        name="includeChamaData"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0">
                            <FormLabel>Chama Data</FormLabel>
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
                        control={form.control}
                        name="includeSystemSettings"
                        render={({ field }) => (
                          <FormItem className="flex justify-between items-center space-y-0">
                            <FormLabel>System Settings</FormLabel>
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
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="font-medium">Storage Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <Label htmlFor="google-drive">Google Drive</Label>
                            <p className="text-sm text-muted-foreground">
                              Store backups in Google Drive
                            </p>
                          </div>
                          <Switch id="google-drive" checked={true} />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <Label htmlFor="local-storage">Local Storage</Label>
                            <p className="text-sm text-muted-foreground">
                              Keep a copy in local storage
                            </p>
                          </div>
                          <Switch id="local-storage" checked={true} />
                        </div>
                        
                        <div className="mt-2">
                          <Button variant="outline" className="w-full" type="button">
                            <Cloud className="mr-2 h-4 w-4" />
                            Configure Cloud Storage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={saveSettingsMutation.isPending || !form.formState.isDirty}
                    >
                      {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
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