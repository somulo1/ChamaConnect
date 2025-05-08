import { Link, useLocation } from "wouter";
import { 
  Home, Wallet, Users, ShoppingCart, MessageSquare 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="md:hidden bg-white border-t border-border fixed bottom-0 w-full z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around">
        <Link to="/">
          <button 
            className={`flex flex-col items-center justify-center p-3 ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
        </Link>
        
        <Link to="/wallet">
          <button 
            className={`flex flex-col items-center justify-center p-3 ${
              isActive("/wallet") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Wallet</span>
          </button>
        </Link>
        
        <Link to="/chama">
          <button 
            className={`flex flex-col items-center justify-center p-3 ${
              isActive("/chama") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Chamas</span>
          </button>
        </Link>
        
        <Link to="/marketplace">
          <button 
            className={`flex flex-col items-center justify-center p-3 ${
              isActive("/marketplace") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Market</span>
          </button>
        </Link>
        
        <Link to="/chat">
          <button 
            className={`flex flex-col items-center justify-center p-3 relative ${
              isActive("/chat") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <Badge className="absolute top-2 right-5 h-4 w-4 flex items-center justify-center bg-accent text-white text-xs p-0">2</Badge>
            <span className="text-xs mt-1">Chat</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
