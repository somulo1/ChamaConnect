import { apiRequest } from "@/lib/queryClient";
import { 
  User, Wallet, Chama, ChamaMember, 
  Contribution, Transaction, Meeting, 
  Message, ChamaRule, Notification,
  Product, InsertProduct 
} from "@shared/schema";
import { AIConversation, LearningModule } from "@/types";

// Wallet API
export const getWallet = async (): Promise<Wallet> => {
  const res = await apiRequest("GET", "/api/wallet");
  return res.json();
};

export const updateWalletBalance = async (amount: number, type: string, description: string): Promise<Transaction> => {
  const res = await apiRequest("POST", "/api/transactions", {
    userId: 0, // Will be set by server from authenticated user
    type,
    amount: amount.toString(),
    status: "completed",
    description
  });
  return res.json();
};

// Transactions API
export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await apiRequest("GET", "/api/transactions");
  return res.json();
};

// Chama API
export const getChamas = async (): Promise<Chama[]> => {
  const res = await apiRequest("GET", "/api/chamas");
  return res.json();
};

export const getChama = async (chamaId: number): Promise<Chama> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}`);
  return res.json();
};

export const createChama = async (name: string, description: string): Promise<Chama> => {
  const res = await apiRequest("POST", "/api/chamas", {
    name,
    description
  });
  return res.json();
};

// Chama Members API
export const getChamaMembers = async (chamaId: number): Promise<ChamaMember[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/members`);
  return res.json();
};

export const addChamaMember = async (chamaId: number, userId: number, role: string): Promise<ChamaMember> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/members`, {
    userId,
    role
  });
  return res.json();
};

// Contributions API
export const getContributions = async (): Promise<Contribution[]> => {
  const res = await apiRequest("GET", `/api/contributions`);
  return res.json();
};

export const getChamaContributions = async (chamaId: number): Promise<Contribution[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/contributions`);
  return res.json();
};

export const createContribution = async (chamaId: number, userId: number, amount: number, dueDate: Date): Promise<Contribution> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/contributions`, {
    userId,
    amount: amount.toString(),
    dueDate: dueDate.toISOString(),
    status: "pending"
  });
  return res.json();
};

export const payContribution = async (contributionId: number): Promise<Contribution> => {
  const res = await apiRequest("POST", `/api/contributions/${contributionId}/pay`);
  return res.json();
};

// Meetings API
export const getChamaMeetings = async (chamaId: number): Promise<Meeting[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/meetings`);
  return res.json();
};

export const createMeeting = async (chamaId: number, title: string, description: string, scheduledFor: Date, location: string): Promise<Meeting> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/meetings`, {
    title,
    description,
    scheduledFor: scheduledFor.toISOString(),
    location
  });
  return res.json();
};

// Chama Rules API
export const getChamaRules = async (chamaId: number): Promise<ChamaRule> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/rules`);
  return res.json();
};

export const createChamaRules = async (chamaId: number, rules: Omit<ChamaRule, 'id' | 'chamaId' | 'createdAt' | 'updatedAt'>): Promise<ChamaRule> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/rules`, {
    ...rules,
    chamaId
  });
  return res.json();
};

// Notifications API
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await apiRequest("GET", "/api/notifications");
  return res.json();
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const res = await apiRequest("POST", `/api/notifications/${notificationId}/read`);
  return res.json();
};

// Marketplace API
export const getProducts = async (): Promise<Product[]> => {
  const res = await apiRequest("GET", "/api/products");
  return res.json();
};

export const getUserProducts = async (): Promise<Product[]> => {
  const res = await apiRequest("GET", "/api/products/my");
  return res.json();
};

export const createProduct = async (productData: Omit<InsertProduct, 'sellerId'>): Promise<Product> => {
  const res = await apiRequest("POST", "/api/products", productData);
  return res.json();
};

// Messages API
export const getUserMessages = async (): Promise<Message[]> => {
  const res = await apiRequest("GET", "/api/messages");
  return res.json();
};

export const getChamaMessages = async (chamaId: number): Promise<Message[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/messages`);
  return res.json();
};

// AI Assistant API
export const chatWithAI = async (message: string): Promise<{response: string, timestamp: string}> => {
  const res = await apiRequest("POST", "/api/assistant/chat", { message });
  return res.json();
};

// Learning modules - these would be fetched from API in a real app
export const getLearningModules = async (): Promise<LearningModule[]> => {
  // Static data until backend implements learning modules
  return [
    {
      id: "module-1",
      title: "Introduction to Personal Finance",
      description: "Learn the basics of personal finance and budgeting to build a solid financial foundation.",
      tags: ["beginner", "finance"],
      duration: "30 min",
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80",
      progress: 100,
      completed: true
    },
    {
      id: "module-2",
      title: "Savings Strategies for Groups",
      description: "Discover effective strategies for group savings and investment clubs.",
      tags: ["intermediate", "chama"],
      duration: "45 min",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
      progress: 60,
      completed: false
    },
    {
      id: "module-3",
      title: "Investment Basics",
      description: "Learn about different investment vehicles and how to build a balanced portfolio.",
      tags: ["intermediate", "investment"],
      duration: "60 min",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
      progress: 0,
      completed: false
    },
    {
      id: "module-4",
      title: "Managing Chama Operations",
      description: "Best practices for running successful chama groups including governance and conflict resolution.",
      tags: ["advanced", "chama"],
      duration: "50 min",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      progress: 0,
      completed: false
    }
  ];
};
