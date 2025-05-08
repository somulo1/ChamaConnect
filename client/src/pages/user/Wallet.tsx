import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, AlertTriangle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { updateWalletBalance } from "@/services/api";
import { Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Transaction schema
const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  description: z.string().optional(),
  type: z.enum(["deposit", "withdrawal"]),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function WalletPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("transactions");
  
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      description: "",
      type: "deposit",
    },
  });

  const transactionMutation = useMutation({
    mutationFn: (data: TransactionFormValues) => {
      return updateWalletBalance(
        parseFloat(data.amount), 
        data.type, 
        data.description || `${data.type === "deposit" ? "Added to" : "Withdrawn from"} wallet`
      );
    },
    onSuccess: () => {
      toast({
        title: "Transaction successful",
        description: form.getValues().type === "deposit" 
          ? "Money added to your wallet" 
          : "Money withdrawn from your wallet",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormValues) => {
    // Check if it's a withdrawal and there are sufficient funds
    if (data.type === "withdrawal" && wallet && parseFloat(data.amount) > parseFloat(wallet.balance.toString())) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    transactionMutation.mutate(data);
  };

  return (
    <UserLayout title="My Wallet">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Wallet</h1>
        <p className="text-muted-foreground">Manage your finances and transactions</p>
      </div>
      
      {/* Wallet Balance Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Available Balance</h3>
            <Badge variant="outline">Personal Wallet</Badge>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-3xl font-semibold">KES</span>
            <span className="text-4xl font-bold ml-2">
              {isWalletLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                wallet?.balance || "0.00"
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button onClick={() => {
              form.setValue("type", "deposit");
              setActiveTab("add-money");
            }}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Add Money
            </Button>
            <Button variant="outline" onClick={() => {
              form.setValue("type", "withdrawal");
              setActiveTab("add-money");
            }}>
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="add-money">Add/Withdraw Money</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions found</p>
                  <Button onClick={() => setActiveTab("add-money")}>Make Your First Transaction</Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((transaction) => {
                    const isDeposit = transaction.type === "deposit";
                    const isContribution = transaction.type === "contribution";
                    const isWithdrawal = transaction.type === "withdrawal";
                    
                    let icon, iconColor, iconBgColor;
                    if (isDeposit) {
                      icon = <ArrowUpRight className="h-4 w-4" />;
                      iconColor = "text-success";
                      iconBgColor = "bg-success/10";
                    } else if (isWithdrawal) {
                      icon = <ArrowDownLeft className="h-4 w-4" />;
                      iconColor = "text-destructive";
                      iconBgColor = "bg-destructive/10";
                    } else if (isContribution) {
                      icon = <CreditCard className="h-4 w-4" />;
                      iconColor = "text-primary";
                      iconBgColor = "bg-primary/10";
                    } else {
                      icon = <Clock className="h-4 w-4" />;
                      iconColor = "text-muted-foreground";
                      iconBgColor = "bg-muted";
                    }
                    
                    return (
                      <div key={transaction.id} className="py-4 flex items-start">
                        <div className={`${iconBgColor} ${iconColor} p-2 rounded-full mr-3`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.description || "Transaction"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-mono font-medium ${isDeposit ? 'text-success' : isWithdrawal ? 'text-destructive' : ''}`}>
                                {isDeposit ? '+' : isWithdrawal ? '-' : ''} KES {transaction.amount}
                              </p>
                              <p className="text-xs text-muted-foreground/60">
                                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add/Withdraw Money Tab */}
        <TabsContent value="add-money">
          <Card>
            <CardHeader>
              <CardTitle>{form.watch("type") === "deposit" ? "Add Money" : "Withdraw Money"}</CardTitle>
              <CardDescription>
                {form.watch("type") === "deposit" 
                  ? "Add funds to your wallet" 
                  : "Withdraw funds from your wallet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
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
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Enter amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Brief description of transaction"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={transactionMutation.isPending}
                  >
                    {transactionMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : form.watch("type") === "deposit" ? (
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="mr-2 h-4 w-4" />
                    )}
                    {transactionMutation.isPending
                      ? "Processing..."
                      : form.watch("type") === "deposit"
                      ? "Add Money"
                      : "Withdraw Money"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Mobile Money (M-Pesa)</h4>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                    <div className="bg-success/10 text-success p-2 rounded-full">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">Manage</Button>
                </div>
                
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Card Payment</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                    <div className="bg-muted text-muted-foreground p-2 rounded-full">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">Add Card</Button>
                </div>
                
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Bank Account</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                    <div className="bg-muted text-muted-foreground p-2 rounded-full">
                      <Landmark className="h-5 w-5" />
                    </div>
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">Link Account</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted border-t p-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <p>Your payment information is securely stored and encrypted</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}

function Landmark(props: any) {
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
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M7 8V6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
      <line x1="12" y1="16" x2="12" y2="16.01" />
    </svg>
  );
}
