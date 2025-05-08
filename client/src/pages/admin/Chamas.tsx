import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Search, 
  MoreHorizontal, 
  Users, 
  Eye, 
  Edit, 
  Settings,
  Ban,
  PiggyBank,
  Calendar,
  TrendingUp,
  UserPlus
} from "lucide-react";
import { Chama } from "@shared/schema";
import { format } from "date-fns";

export default function AdminChamas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewChamaDialogOpen, setViewChamaDialogOpen] = useState(false);
  const [selectedChama, setSelectedChama] = useState<Chama | null>(null);
  
  // Query for chamas
  const { data: chamas = [], isLoading } = useQuery<Chama[]>({
    queryKey: ["/api/admin/chamas"],
  });
  
  // Filter chamas based on search term
  const filteredChamas = chamas.filter(chama => 
    chama.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chama.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chamaCategoryBadge = (category: string) => {
    switch(category) {
      case "investment":
        return <Badge className="bg-green-100 text-green-800">Investment</Badge>;
      case "savings":
        return <Badge className="bg-blue-100 text-blue-800">Savings</Badge>;
      case "social":
        return <Badge className="bg-purple-100 text-purple-800">Social</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{category || "General"}</Badge>;
    }
  };

  const chamaStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-amber-100 text-amber-800">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status || "Unknown"}</Badge>;
    }
  };

  const viewChamaDetails = (chama: Chama) => {
    setSelectedChama(chama);
    setViewChamaDialogOpen(true);
  };

  return (
    <AdminLayout title="Chama Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Chama Management</h2>
          <p className="text-muted-foreground">View and manage all chamas in the platform</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chamas..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <PiggyBank className="mr-2 h-4 w-4" />
            Create Chama
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Chamas</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chamas.length}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,426</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 14.2M</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meetings Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Founded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Contributions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading chamas...
                  </TableCell>
                </TableRow>
              ) : filteredChamas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No chamas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredChamas.map((chama) => (
                  <TableRow key={chama.id}>
                    <TableCell className="font-medium">{chama.name}</TableCell>
                    <TableCell>{chamaCategoryBadge(chama.category || "general")}</TableCell>
                    <TableCell>{chama.memberCount || "0"}</TableCell>
                    <TableCell>{format(new Date(chama.founded), "MMM d, yyyy")}</TableCell>
                    <TableCell>{chamaStatusBadge(chama.status || "active")}</TableCell>
                    <TableCell>KES {chama.totalContributions || "0"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewChamaDetails(chama)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Chama
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="border-t px-6 py-3">
          <div className="text-sm text-muted-foreground">
            Showing {filteredChamas.length} of {chamas.length} chamas
          </div>
        </CardFooter>
      </Card>
      
      {/* View Chama Details Dialog */}
      <Dialog open={viewChamaDialogOpen} onOpenChange={setViewChamaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chama Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected chama.
            </DialogDescription>
          </DialogHeader>
          
          {selectedChama && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedChama.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChama.description}</p>
                  </div>
                  <div>
                    {chamaStatusBadge(selectedChama.status || "active")}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Founded</h4>
                  <p>{format(new Date(selectedChama.founded), "MMMM d, yyyy")}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p>{chamaCategoryBadge(selectedChama.category || "general")}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Total Members</h4>
                  <p>{selectedChama.memberCount || "0"} members</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Total Contributions</h4>
                  <p>KES {selectedChama.totalContributions || "0"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Meeting Frequency</h4>
                  <p>{selectedChama.meetingFrequency || "Monthly"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                  <p>{selectedChama.location || "Not specified"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Leadership</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">Chairperson</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        JS
                      </div>
                      <div>
                        <p className="text-sm font-medium">Jane Smith</p>
                        <p className="text-xs text-muted-foreground">Treasurer</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setViewChamaDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                View Members
              </Button>
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}