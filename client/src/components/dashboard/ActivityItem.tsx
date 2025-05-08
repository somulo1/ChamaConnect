import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  amount?: string;
  amountColor?: string;
  timestamp: string;
}

export default function ActivityItem({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  amount,
  amountColor = "text-foreground",
  timestamp
}: ActivityItemProps) {
  return (
    <li className="p-4 hover:bg-muted/50">
      <div className="flex items-start">
        <div className={`mr-3 p-2 ${iconBgColor} rounded-full`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="text-sm font-medium">{title}</p>
            {amount && (
              <p className={`text-sm font-mono ${amountColor}`}>{amount}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground/60 mt-1">{timestamp}</p>
    </li>
  );
}
