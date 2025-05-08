import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ApiSettings from "@/pages/admin/ApiSettings";
import AdminDashboard from "@/pages/admin/Dashboard";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* Auth Page - Redirect to home if already logged in */}
        <Route path="/auth">
          {user ? <Redirect to="/" /> : <AuthPage />}
        </Route>
        
        {/* Home Page - Redirect to auth if not logged in */}
        <Route path="/">
          {user ? <HomePage /> : <Redirect to="/auth" />}
        </Route>
        
        {/* Admin Dashboard - Require admin role */}
        <Route path="/admin">
          {user && user.role === 'admin' ? <AdminDashboard /> : <Redirect to="/auth" />}
        </Route>
        
        {/* API Settings - Require admin role */}
        <Route path="/admin/api-settings">
          {user && user.role === 'admin' ? <ApiSettings /> : <Redirect to="/auth" />}
        </Route>
        
        {/* Not Found - Default fallback */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </TooltipProvider>
  );
}

export default App;
