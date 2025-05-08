import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Chama App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, <span className="font-medium">{user?.fullName}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Wallet</h2>
            <div className="text-3xl font-bold text-primary mb-2">KES 15,000</div>
            <p className="text-muted-foreground text-sm mb-4">Available Balance</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
                Deposit
              </button>
              <button className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
                Withdraw
              </button>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Chamas</h2>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span>Umoja Savings</span>
                <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded">Active</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Business Investment Group</span>
                <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded">Active</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Family Education Fund</span>
                <span className="text-sm bg-yellow-100 text-yellow-800 py-1 px-2 rounded">Pending</span>
              </li>
            </ul>
            <button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
              Create New Chama
            </button>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Contributions</h2>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <div>
                  <p className="font-medium">Umoja Savings</p>
                  <p className="text-sm text-muted-foreground">Due: May 15, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">KES 5,000</p>
                  <p className="text-sm text-red-500">3 days left</p>
                </div>
              </li>
              <li className="flex justify-between">
                <div>
                  <p className="font-medium">Business Investment</p>
                  <p className="text-sm text-muted-foreground">Due: May 20, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">KES 10,000</p>
                  <p className="text-sm text-yellow-500">8 days left</p>
                </div>
              </li>
            </ul>
            <button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
              View All Contributions
            </button>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <ul className="space-y-4">
              {[
                { type: "Deposit", amount: "KES 5,000", date: "May 5, 2025", status: "completed" },
                { type: "Contribution", amount: "KES 3,000", date: "May 3, 2025", status: "completed" },
                { type: "Withdrawal", amount: "KES 2,000", date: "Apr 28, 2025", status: "completed" },
                { type: "Contribution", amount: "KES 3,000", date: "Apr 20, 2025", status: "completed" }
              ].map((transaction, index) => (
                <li key={index} className="flex justify-between items-center pb-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === "Withdrawal" ? "text-red-500" : "text-green-500"}`}>
                      {transaction.type === "Withdrawal" ? "-" : "+"}{transaction.amount}
                    </p>
                    <p className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">
                      {transaction.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
              View All Transactions
            </button>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
            <ul className="space-y-4">
              {[
                { 
                  chama: "Umoja Savings", 
                  title: "Monthly Review Meeting", 
                  date: "May 17, 2025", 
                  time: "2:00 PM",
                  location: "Virtual (Zoom)" 
                },
                { 
                  chama: "Business Investment", 
                  title: "Quarterly Investment Planning", 
                  date: "May 25, 2025", 
                  time: "10:00 AM",
                  location: "Community Hall, Nairobi" 
                }
              ].map((meeting, index) => (
                <li key={index} className="bg-muted p-3 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-primary">{meeting.chama}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                      {meeting.date}
                    </span>
                  </div>
                  <p className="font-medium">{meeting.title}</p>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{meeting.time}</span>
                    <span>{meeting.location}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded text-sm">
              View All Meetings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}