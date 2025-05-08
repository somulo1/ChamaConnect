import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";

// User Dashboard Pages
import UserDashboard from "@/pages/user/Dashboard";
import UserWallet from "@/pages/user/Wallet";
import UserLearning from "@/pages/user/Learning";
import UserMarketplace from "@/pages/user/Marketplace";
import UserChat from "@/pages/user/Chat";
import UserAssistant from "@/pages/user/Assistant";
import UserSettings from "@/pages/user/Settings";

// Chama Dashboard Pages
import ChamaDashboard from "@/pages/chama/Dashboard";
import ChamaMembers from "@/pages/chama/Members";
import ChamaContributions from "@/pages/chama/Contributions";
import ChamaMeetings from "@/pages/chama/Meetings";
import ChamaDocuments from "@/pages/chama/Documents";
import ChamaSettings from "@/pages/chama/Settings";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminChamas from "@/pages/admin/Chamas";
import AdminReports from "@/pages/admin/Reports";
import AdminTransactions from "@/pages/admin/Transactions";
import ApiSettings from "@/pages/admin/ApiSettings";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        
        {/* User Routes */}
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/wallet" component={UserWallet} />
        <Route path="/learning" component={UserLearning} />
        <Route path="/marketplace" component={UserMarketplace} />
        <Route path="/chat" component={UserChat} />
        <Route path="/assistant" component={UserAssistant} />
        <Route path="/settings" component={UserSettings} />
        
        {/* Chama Routes */}
        <Route path="/chama/:id" component={ChamaDashboard} />
        <Route path="/chama/:id/members" component={ChamaMembers} />
        <Route path="/chama/:id/contributions" component={ChamaContributions} />
        <Route path="/chama/:id/meetings" component={ChamaMeetings} />
        <Route path="/chama/:id/documents" component={ChamaDocuments} />
        <Route path="/chama/:id/settings" component={ChamaSettings} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/chamas" component={AdminChamas} />
        <Route path="/admin/reports" component={AdminReports} />
        <Route path="/admin/transactions" component={AdminTransactions} />
        <Route path="/admin/api-settings" component={ApiSettings} />
        
        {/* Not Found */}
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
