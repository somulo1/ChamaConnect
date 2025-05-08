import { 
  User, Wallet, Chama, ChamaMember, 
  Contribution, Transaction, Meeting, 
  Message, ChamaRule, Notification,
  Product, LearningProgress 
} from "@shared/schema";

export interface ChamaWithMemberRole extends Chama {
  userRole: string;
}

export interface WalletWithTransactions extends Wallet {
  recentTransactions: Transaction[];
}

export interface ChamaStats {
  balance: string;
  shares: string;
  sharesPercentage: string;
  nextContribution?: {
    amount: string;
    dueDate: string;
    status: "pending" | "paid" | "overdue";
  };
  lastPayout?: {
    amount: string;
    date: string;
  };
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  recipientId?: number;
  chamaId?: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AIConversation {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  imageUrl?: string;
  completed?: boolean;
  progress?: number;
}

export interface ProductWithSeller extends Product {
  seller: {
    id: number;
    name: string;
  };
}
