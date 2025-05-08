import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, Wallet, School, ShoppingCart, MessageSquare, Brain, 
  Settings, LogOut, Users, Plus, UserCog 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chama } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const { data: chamas = [] } = useQuery<Chama[]>({
    queryKey: ["/api/chamas"],
    enabled: !!user
  });

  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const chamaRoleBadge = (role: string) => {
    const colorMap: Record<string, string> = {
      'chairperson': 'bg-success text-white',
      'treasurer': 'bg-info text-white',
      'secretary': 'bg-info text-white',
      'member': 'bg-secondary text-foreground'
    };
    
    const roleDisplay: Record<string, string> = {
      'chairperson': 'Chair',
      'treasurer': 'Treasurer',
      'secretary': 'Secretary',
      'member': 'Member'
    };
    
    return (
      <Badge className={`ml-auto text-xs ${colorMap[role] || 'bg-muted'}`}>
        {roleDisplay[role] || role}
      </Badge>
    );
  };

  const sidebarClasses = `
    bg-white w-64 flex-shrink-0 shadow-md md:h-full h-full fixed md:relative 
    md:translate-x-0 transition-transform duration-300 ease-in-out z-20
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col">
        {/* Profile section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={user?.fullName || "User"} />
              <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-muted rounded-md p-2">
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="font-mono text-sm font-medium">
                KES {wallet?.balance || "0.00"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2">
            <div className="space-y-1">
              <p className="px-2 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Dashboard
              </p>
              
              <Link to="/" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/wallet" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/wallet") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  My Wallet
                </Button>
              </Link>
              
              <Link to="/learning" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/learning") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <School className="mr-2 h-4 w-4" />
                  Learning Hub
                </Button>
              </Link>
              
              <Link to="/marketplace" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/marketplace") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Marketplace
                </Button>
              </Link>
              
              <Link to="/chat" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/chat") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                  <Badge className="ml-auto bg-accent text-white">2</Badge>
                </Button>
              </Link>
              
              <Link to="/assistant" onClick={handleLinkClick}>
                <Button 
                  variant={isActive("/assistant") ? "secondary" : "ghost"} 
                  className="w-full justify-start"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  AI Assistant
                </Button>
              </Link>
              
              {/* Chama Section */}
              <p className="px-2 pt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Chamas
              </p>
              
              {chamas.map((chama) => (
                <Link key={chama.id} to={`/chama/${chama.id}`} onClick={handleLinkClick}>
                  <Button 
                    variant={isActive(`/chama/${chama.id}`) ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span className="truncate">{chama.name}</span>
                    {chamaRoleBadge("chairperson")} {/* This would come from the member's role */}
                  </Button>
                </Link>
              ))}
              
              <Button variant="outline" className="w-full justify-start mt-2 border-dashed">
                <Plus className="mr-2 h-4 w-4 text-primary" />
                Create New Chama
              </Button>
              
              {/* Admin Section - Only for admin users */}
              {user?.role === "admin" && (
                <>
                  <p className="px-2 pt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </p>
                  <Link to="/admin" onClick={handleLinkClick}>
                    <Button 
                      variant={isActive("/admin") ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </ScrollArea>
        
        {/* Settings & Logout */}
        <div className="p-4 border-t border-border">
          <Link to="/settings" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
