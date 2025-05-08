import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  footer?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  action?: ReactNode;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  footer, 
  trend, 
  className = "",
  iconClassName = "text-primary",
  action
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-muted-foreground">{title}</h3>
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        
        {trend && (
          <div className="flex mt-2 text-xs">
            <span className={`flex items-center ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              <span className="material-icons text-sm mr-1">
                {trend.isPositive ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {trend.value}
            </span>
          </div>
        )}
        
        {action && (
          <div className="mt-4 flex space-x-2">
            {action}
          </div>
        )}
      </CardContent>
      
      {footer && (
        <CardFooter className="border-t pt-4 pb-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
