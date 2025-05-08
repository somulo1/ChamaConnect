import {
  User, InsertUser, Wallet, InsertWallet,
  Chama, InsertChama, ChamaMember, InsertChamaMember,
  Contribution, InsertContribution, Transaction, InsertTransaction,
  Meeting, InsertMeeting, Message, InsertMessage,
  ChamaRule, InsertChamaRule, Notification, InsertNotification,
  Product, InsertProduct, LearningProgress, InsertLearningProgress
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Wallet operations
  getWallet(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined>;
  
  // Chama operations
  getChama(id: number): Promise<Chama | undefined>;
  getChamasByUser(userId: number): Promise<Chama[]>;
  createChama(chama: InsertChama): Promise<Chama>;
  
  // Chama member operations
  getChamaMembers(chamaId: number): Promise<(ChamaMember & { user: User })[]>;
  getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined>;
  addChamaMember(member: InsertChamaMember): Promise<ChamaMember>;
  updateChamaMemberRole(chamaId: number, userId: number, role: string): Promise<ChamaMember | undefined>;
  
  // Contribution operations
  getContributions(chamaId: number): Promise<Contribution[]>;
  getUserContributions(userId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  updateContributionStatus(id: number, status: string, paidAt?: Date): Promise<Contribution | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Meeting operations
  getChamaMeetings(chamaId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  
  // Message operations
  getUserMessages(userId: number): Promise<Message[]>;
  getChamaMessages(chamaId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Chama rule operations
  getChamaRules(chamaId: number): Promise<ChamaRule | undefined>;
  createChamaRules(rules: InsertChamaRule): Promise<ChamaRule>;
  updateChamaRules(chamaId: number, rules: Partial<ChamaRule>): Promise<ChamaRule | undefined>;
  
  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getUserProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStatus(id: number, status: string): Promise<Product | undefined>;
  
  // Learning progress operations
  getUserLearningProgress(userId: number): Promise<LearningProgress[]>;
  updateLearningProgress(userId: number, moduleId: string, progress: number, completed: boolean): Promise<LearningProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private chamas: Map<number, Chama>;
  private chamaMembers: Map<number, ChamaMember>;
  private contributions: Map<number, Contribution>;
  private transactions: Map<number, Transaction>;
  private meetings: Map<number, Meeting>;
  private messages: Map<number, Message>;
  private chamaRules: Map<number, ChamaRule>;
  private notifications: Map<number, Notification>;
  private products: Map<number, Product>;
  private learningProgress: Map<number, LearningProgress>;
  
  sessionStore: session.Store;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.chamas = new Map();
    this.chamaMembers = new Map();
    this.contributions = new Map();
    this.transactions = new Map();
    this.meetings = new Map();
    this.messages = new Map();
    this.chamaRules = new Map();
    this.notifications = new Map();
    this.products = new Map();
    this.learningProgress = new Map();
    
    this.currentId = {
      users: 1,
      wallets: 1,
      chamas: 1,
      chamaMembers: 1,
      contributions: 1,
      transactions: 1,
      meetings: 1,
      messages: 1,
      chamaRules: 1,
      notifications: 1,
      products: 1,
      learningProgress: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Wallet operations
  async getWallet(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.currentId.wallets++;
    const newWallet: Wallet = { ...wallet, id };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const balance = parseFloat(wallet.balance.toString()) + amount;
    const updatedWallet = { ...wallet, balance: balance.toString() };
    this.wallets.set(wallet.id, updatedWallet);
    return updatedWallet;
  }

  // Chama operations
  async getChama(id: number): Promise<Chama | undefined> {
    return this.chamas.get(id);
  }

  async getChamasByUser(userId: number): Promise<Chama[]> {
    const memberRecords = Array.from(this.chamaMembers.values())
      .filter(member => member.userId === userId);
    
    return memberRecords.map(member => 
      this.chamas.get(member.chamaId)
    ).filter((chama): chama is Chama => chama !== undefined);
  }

  async createChama(chama: InsertChama): Promise<Chama> {
    const id = this.currentId.chamas++;
    const newChama: Chama = { ...chama, id, founded: new Date() };
    this.chamas.set(id, newChama);
    return newChama;
  }

  // Chama member operations
  async getChamaMembers(chamaId: number): Promise<(ChamaMember & { user: User })[]> {
    const members = Array.from(this.chamaMembers.values())
      .filter(member => member.chamaId === chamaId);
    
    return members.map(member => {
      const user = this.users.get(member.userId);
      if (!user) throw new Error(`User not found for member ${member.id}`);
      return { ...member, user };
    });
  }

  async getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined> {
    return Array.from(this.chamaMembers.values()).find(
      member => member.chamaId === chamaId && member.userId === userId
    );
  }

  async addChamaMember(member: InsertChamaMember): Promise<ChamaMember> {
    const id = this.currentId.chamaMembers++;
    const newMember: ChamaMember = { ...member, id, joinedAt: new Date() };
    this.chamaMembers.set(id, newMember);
    return newMember;
  }

  async updateChamaMemberRole(chamaId: number, userId: number, role: string): Promise<ChamaMember | undefined> {
    const member = await this.getChamaMember(chamaId, userId);
    if (!member) return undefined;
    
    const updatedMember = { ...member, role };
    this.chamaMembers.set(member.id, updatedMember);
    return updatedMember;
  }

  // Contribution operations
  async getContributions(chamaId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values())
      .filter(contribution => contribution.chamaId === chamaId);
  }

  async getUserContributions(userId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values())
      .filter(contribution => contribution.userId === userId);
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const id = this.currentId.contributions++;
    const newContribution: Contribution = { ...contribution, id, paidAt: undefined };
    this.contributions.set(id, newContribution);
    return newContribution;
  }

  async updateContributionStatus(id: number, status: string, paidAt?: Date): Promise<Contribution | undefined> {
    const contribution = this.contributions.get(id);
    if (!contribution) return undefined;
    
    const updatedContribution = { ...contribution, status, paidAt };
    this.contributions.set(id, updatedContribution);
    return updatedContribution;
  }

  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date() };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Meeting operations
  async getChamaMeetings(chamaId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.chamaId === chamaId)
      .sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime());
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentId.meetings++;
    const newMeeting: Meeting = { ...meeting, id };
    this.meetings.set(id, newMeeting);
    return newMeeting;
  }

  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.senderId === userId || 
        message.recipientId === userId
      )
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async getChamaMessages(chamaId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chamaId === chamaId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const newMessage: Message = { ...message, id, sentAt: new Date(), read: false };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Chama rule operations
  async getChamaRules(chamaId: number): Promise<ChamaRule | undefined> {
    return Array.from(this.chamaRules.values())
      .find(rule => rule.chamaId === chamaId);
  }

  async createChamaRules(rules: InsertChamaRule): Promise<ChamaRule> {
    const id = this.currentId.chamaRules++;
    const now = new Date();
    const newRules: ChamaRule = { ...rules, id, createdAt: now, updatedAt: now };
    this.chamaRules.set(id, newRules);
    return newRules;
  }

  async updateChamaRules(chamaId: number, rulesData: Partial<ChamaRule>): Promise<ChamaRule | undefined> {
    const rules = await this.getChamaRules(chamaId);
    if (!rules) return undefined;
    
    const updatedRules = { ...rules, ...rulesData, updatedAt: new Date() };
    this.chamaRules.set(rules.id, updatedRules);
    return updatedRules;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: new Date(), 
      read: false 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.status === "available")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.sellerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct: Product = { ...product, id, createdAt: new Date() };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProductStatus(id: number, status: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, status };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Learning progress operations
  async getUserLearningProgress(userId: number): Promise<LearningProgress[]> {
    return Array.from(this.learningProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async updateLearningProgress(userId: number, moduleId: string, progress: number, completed: boolean): Promise<LearningProgress> {
    const existingProgress = Array.from(this.learningProgress.values())
      .find(p => p.userId === userId && p.moduleId === moduleId);
    
    if (existingProgress) {
      const updatedProgress = { 
        ...existingProgress, 
        progress, 
        completed, 
        lastAccessed: new Date() 
      };
      this.learningProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.currentId.learningProgress++;
      const newProgress: LearningProgress = {
        id,
        userId,
        moduleId,
        progress,
        completed,
        lastAccessed: new Date()
      };
      this.learningProgress.set(id, newProgress);
      return newProgress;
    }
  }
}

export const storage = new MemStorage();
