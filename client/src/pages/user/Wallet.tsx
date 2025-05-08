import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownLeft, Plus, Clock, CheckCircle2 } from "lucide-react";

export default function UserWallet() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  
  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
  });
  
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Handle deposit money
  const handleDeposit = () => {
    // API call would happen here
    console.log("Depositing:", depositAmount);
    setIsDepositDialogOpen(false);
    setDepositAmount("");
  };

  // Handle withdraw money
  const handleWithdraw = () => {
    // API call would happen here
    console.log("Withdrawing:", withdrawAmount);
    setIsWithdrawDialogOpen(false);
    setWithdrawAmount("");
  };

  return (
    <UserLayout title="My Wallet">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Wallet</h2>
        <p className="text-muted-foreground">Manage your funds securely</p>
      </div>
      
      {/* Wallet Balance Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Current Balance</h3>
            <p className="text-4xl font-bold mb-6">KES {wallet?.balance || "0.00"}</p>
            
            <div className="flex space-x-4">
              <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Money to Wallet</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to deposit to your wallet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="deposit-amount">Amount (KES)</Label>
                    <Input
                      id="deposit-amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="1,000"
                      type="number"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDeposit}>Add Money</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Money</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to withdraw from your wallet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="withdraw-amount">Amount (KES)</Label>
                    <Input
                      id="withdraw-amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="1,000"
                      type="number"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleWithdraw}>Withdraw</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-4 px-6">
                      <div className="flex items-center gap-3">
                        {transaction.type === "deposit" ? (
                          <div className="bg-green-100 p-2 rounded-full">
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-blue-100 p-2 rounded-full">
                            <ArrowUpRight className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === "deposit" ? "text-green-600" : ""}`}>
                          {transaction.type === "deposit" ? "+" : "-"}KES {transaction.amount}
                        </p>
                        <div className="flex items-center text-sm gap-1">
                          {transaction.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-amber-600" />
                              <span className="text-amber-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deposits" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions.filter(t => t.type === "deposit").length > 0 ? (
                  transactions
                    .filter(t => t.type === "deposit")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Deposit</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            +KES {transaction.amount}
                          </p>
                          <div className="flex items-center text-sm gap-1">
                            {transaction.status === "completed" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 text-amber-600" />
                                <span className="text-amber-600">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No deposits yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {transactions.filter(t => t.type === "withdrawal").length > 0 ? (
                  transactions
                    .filter(t => t.type === "withdrawal")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <ArrowUpRight className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Withdrawal</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            -KES {transaction.amount}
                          </p>
                          <div className="flex items-center text-sm gap-1">
                            {transaction.status === "completed" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span className="text-green-600">Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 text-amber-600" />
                                <span className="text-amber-600">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No withdrawals yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}