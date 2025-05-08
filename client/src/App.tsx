import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        {/* Landing Page - Public */}
        <Route path="/" component={LandingPage} />
        
        {/* Auth Page - Login/Register */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Not Found Page */}
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
