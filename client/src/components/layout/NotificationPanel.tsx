import { X, BellRing, AlertCircle, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  isOpen: boolean;
  closeNotifications: () => void;
}

export default function NotificationPanel({ isOpen, closeNotifications }: NotificationPanelProps) {
  const { toast } = useToast();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const promises = notifications
        .filter(notification => !notification.read)
        .map(notification => markAsReadMutation.mutateAsync(notification.id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting_scheduled":
        return <Users className="text-info p-2 bg-info/10 rounded-full" />;
      case "contribution_due":
        return <CreditCard className="text-warning p-2 bg-warning/10 rounded-full" />;
      case "payment_received":
        return <CreditCard className="text-success p-2 bg-success/10 rounded-full" />;
      default:
        return <BellRing className="text-primary p-2 bg-primary/10 rounded-full" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const panelClasses = `
    fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-lg z-30 
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  return (
    <div className={panelClasses}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-medium">Notifications</h3>
          <Button variant="ghost" size="icon" onClick={closeNotifications}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 p-4">
              <BellRing className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatTime(notification.createdAt.toString())}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || notifications.every(n => n.read)}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
