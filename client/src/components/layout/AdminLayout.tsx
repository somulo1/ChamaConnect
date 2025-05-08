import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logoutMutation, user } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Chamas",
      href: "/admin/chamas",
      icon: Users,
    },
    {
      title: "Transactions",
      href: "/admin/transactions",
      icon: FileText,
    },
    {
      title: "Marketplace",
      href: "/admin/marketplace",
      icon: ShoppingBag,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      title: "API Settings",
      href: "/admin/api-settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-56 border-r bg-background lg:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg text-primary">Chama Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start gap-2",
                location === item.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "justify-start gap-2 mt-auto text-muted-foreground hover:text-foreground"
            )}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex flex-1 flex-col lg:pl-56">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Logged in as:</span>
                  <span className="font-medium">{user.fullName}</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}