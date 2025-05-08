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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  MoreHorizontal,
  DollarSign,
  PiggyBank,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  BanknoteIcon,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewTransactionDialogOpen, setViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Query for transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });
  
  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm);
    
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get total amounts for different transaction types
  const getTotalAmount = (type: string) => {
    return transactions
      .filter(t => t.type === type && t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  };

  const transactionStatusBadge = (status: string) => {
    switch(status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const transactionTypeIcon = (type: string) => {
    switch(type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "contribution":
        return <PiggyBank className="h-4 w-4 text-blue-600" />;
      case "loan":
        return <BanknoteIcon className="h-4 w-4 text-purple-600" />;
      case "fee":
        return <ReceiptText className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewTransactionDialogOpen(true);
  };

  return (
    <AdminLayout title="Transaction Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Transaction Management</h2>
          <p className="text-muted-foreground">View and manage all financial transactions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {getTotalAmount("deposit").toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {getTotalAmount("withdrawal").toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {getTotalAmount("contribution").toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="w-[200px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="contribution">Contributions</SelectItem>
              <SelectItem value="loan">Loans</SelectItem>
              <SelectItem value="fee">Fees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>#{transaction.id}</TableCell>
                    <TableCell>{transaction.userId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transactionTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className={
                      transaction.type === "deposit" || transaction.type === "contribution" 
                        ? "text-green-600 font-medium" 
                        : "text-red-600 font-medium"
                    }>
                      {transaction.type === "deposit" || transaction.type === "contribution" ? "+" : "-"}
                      KES {parseFloat(transaction.amount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell>{format(new Date(transaction.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{transactionStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewTransactionDetails(transaction)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {transaction.status === "pending" && (
                            <>
                              <DropdownMenuItem>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
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
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardFooter>
      </Card>
      
      {/* View Transaction Details Dialog */}
      <Dialog open={viewTransactionDialogOpen} onOpenChange={setViewTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className={`p-4 rounded-full ${
                  selectedTransaction.status === "completed" 
                    ? "bg-green-100" 
                    : selectedTransaction.status === "pending" 
                      ? "bg-amber-100" 
                      : "bg-red-100"
                }`}>
                  {transactionTypeIcon(selectedTransaction.type)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p>#{selectedTransaction.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedTransaction.type}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className={
                    selectedTransaction.type === "deposit" || selectedTransaction.type === "contribution"
                      ? "text-green-600 font-medium" 
                      : "text-red-600 font-medium"
                  }>
                    KES {parseFloat(selectedTransaction.amount.toString()).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{transactionStatusBadge(selectedTransaction.status)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p>{format(new Date(selectedTransaction.createdAt), "MMMM d, yyyy HH:mm")}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p>{selectedTransaction.userId}</p>
                </div>
              </div>
              
              {selectedTransaction.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p>{selectedTransaction.description}</p>
                </div>
              )}
              
              {selectedTransaction.referenceId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference ID</p>
                  <p>{selectedTransaction.referenceId}</p>
                </div>
              )}
              
              {selectedTransaction.status === "failed" && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Transaction Failed</h4>
                      <p className="text-sm text-red-600">
                        {selectedTransaction.failureReason || "No failure reason provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTransactionDialogOpen(false)}>
              Close
            </Button>
            {selectedTransaction?.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="destructive">
                  Reject
                </Button>
                <Button>
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}