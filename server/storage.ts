import { db } from './db';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db';
import { 
  users, wallets, chamas, chamaMembers, contributions, 
  transactions, meetings, messages, chamaRules,
  notifications, products, learningProgress,
  type User, type InsertUser, type Wallet, type InsertWallet,
  type Chama, type InsertChama, type ChamaMember, type InsertChamaMember,
  type Contribution, type InsertContribution, type Transaction, type InsertTransaction,
  type Meeting, type InsertMeeting, type Message, type InsertMessage,
  type ChamaRule, type InsertChamaRule, type Notification, type InsertNotification,
  type Product, type InsertProduct, type LearningProgress
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

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
  
  // API Key operations
  getApiKeys(): Promise<ApiKey[]>;
  getApiKeyByType(type: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Wallet operations
  async getWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(walletData).returning();
    return wallet;
  }

  async updateWalletBalance(userId: number, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const currentBalance = parseFloat(wallet.balance);
    const newBalance = (currentBalance + amount).toFixed(2);
    
    const [updatedWallet] = await db
      .update(wallets)
      .set({ balance: newBalance })
      .where(eq(wallets.userId, userId))
      .returning();
    
    return updatedWallet;
  }

  // Chama operations
  async getChama(id: number): Promise<Chama | undefined> {
    const [chama] = await db.select().from(chamas).where(eq(chamas.id, id));
    return chama;
  }

  async getChamasByUser(userId: number): Promise<Chama[]> {
    // Get all chamas where the user is a member
    const chamaMemberships = await db
      .select()
      .from(chamaMembers)
      .where(eq(chamaMembers.userId, userId));
    
    // Get the details of each chama
    const chamaIds = chamaMemberships.map(membership => membership.chamaId);
    if (chamaIds.length === 0) return [];
    
    return await db
      .select()
      .from(chamas)
      .where(
        chamaIds.map(id => eq(chamas.id, id)).reduce((prev, curr) => prev || curr)
      );
  }

  async createChama(chamaData: InsertChama): Promise<Chama> {
    const [chama] = await db.insert(chamas).values(chamaData).returning();
    return chama;
  }

  // Chama member operations
  async getChamaMembers(chamaId: number): Promise<(ChamaMember & { user: User })[]> {
    const members = await db
      .select()
      .from(chamaMembers)
      .where(eq(chamaMembers.chamaId, chamaId));
    
    const membersWithUserDetails = [];
    
    for (const member of members) {
      const user = await this.getUser(member.userId);
      if (user) {
        membersWithUserDetails.push({
          ...member,
          user
        });
      }
    }
    
    return membersWithUserDetails;
  }

  async getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined> {
    const [member] = await db
      .select()
      .from(chamaMembers)
      .where(
        and(
          eq(chamaMembers.chamaId, chamaId),
          eq(chamaMembers.userId, userId)
        )
      );
    
    return member;
  }

  async addChamaMember(memberData: InsertChamaMember): Promise<ChamaMember> {
    const [member] = await db.insert(chamaMembers).values(memberData).returning();
    return member;
  }

  async updateChamaMemberRole(chamaId: number, userId: number, role: string): Promise<ChamaMember | undefined> {
    const [member] = await db
      .update(chamaMembers)
      .set({ role })
      .where(
        and(
          eq(chamaMembers.chamaId, chamaId),
          eq(chamaMembers.userId, userId)
        )
      )
      .returning();
    
    return member;
  }

  // Contribution operations
  async getContributions(chamaId: number): Promise<Contribution[]> {
    return await db
      .select()
      .from(contributions)
      .where(eq(contributions.chamaId, chamaId))
      .orderBy(desc(contributions.dueDate));
  }

  async getUserContributions(userId: number): Promise<Contribution[]> {
    return await db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId))
      .orderBy(desc(contributions.dueDate));
  }

  async createContribution(contributionData: InsertContribution): Promise<Contribution> {
    const [contribution] = await db.insert(contributions).values(contributionData).returning();
    return contribution;
  }

  async updateContributionStatus(id: number, status: string, paidAt?: Date): Promise<Contribution | undefined> {
    const [contribution] = await db
      .update(contributions)
      .set({ status, paidAt: paidAt ?? null })
      .where(eq(contributions.id, id))
      .returning();
    
    return contribution;
  }

  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  // Meeting operations
  async getChamaMeetings(chamaId: number): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.chamaId, chamaId))
      .orderBy(desc(meetings.scheduledFor));
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(meetingData).returning();
    return meeting;
  }

  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(desc(messages.sentAt));
  }

  async getChamaMessages(chamaId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chamaId, chamaId))
      .orderBy(desc(messages.sentAt));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    
    return message;
  }

  // Chama rule operations
  async getChamaRules(chamaId: number): Promise<ChamaRule | undefined> {
    const [rules] = await db
      .select()
      .from(chamaRules)
      .where(eq(chamaRules.chamaId, chamaId));
    
    return rules;
  }

  async createChamaRules(rulesData: InsertChamaRule): Promise<ChamaRule> {
    const [rules] = await db.insert(chamaRules).values(rulesData).returning();
    return rules;
  }

  async updateChamaRules(chamaId: number, rulesData: Partial<ChamaRule>): Promise<ChamaRule | undefined> {
    const [rules] = await db
      .update(chamaRules)
      .set({ ...rulesData, updatedAt: new Date() })
      .where(eq(chamaRules.chamaId, chamaId))
      .returning();
    
    return rules;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return notification;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProductStatus(id: number, status: string): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ status })
      .where(eq(products.id, id))
      .returning();
    
    return product;
  }

  // Learning progress operations
  async getUserLearningProgress(userId: number): Promise<LearningProgress[]> {
    return await db
      .select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));
  }

  async updateLearningProgress(userId: number, moduleId: string, progress: number, completed: boolean): Promise<LearningProgress> {
    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(learningProgress)
      .where(
        and(
          eq(learningProgress.userId, userId),
          eq(learningProgress.moduleId, moduleId)
        )
      );
    
    if (existingProgress.length > 0) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(learningProgress)
        .set({
          progress,
          completed,
          lastAccessed: new Date()
        })
        .where(
          and(
            eq(learningProgress.userId, userId),
            eq(learningProgress.moduleId, moduleId)
          )
        )
        .returning();
      
      return updatedProgress;
    } else {
      // Create new progress entry
      const [newProgress] = await db
        .insert(learningProgress)
        .values({
          userId,
          moduleId,
          progress,
          completed,
          lastAccessed: new Date()
        })
        .returning();
      
      return newProgress;
    }
  }
  
  // API Key operations
  async getApiKeys(): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .orderBy(apiKeys.name);
  }
  
  async getApiKeyByType(type: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.type, type),
          eq(apiKeys.isActive, true)
        )
      );
    
    return apiKey;
  }
  
  async createApiKey(apiKeyData: InsertApiKey): Promise<ApiKey> {
    // Check if a key with this type already exists
    const existingKeys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.type, apiKeyData.type));
    
    if (existingKeys.length > 0) {
      // Update the existing key instead of creating a new one
      const [updatedKey] = await db
        .update(apiKeys)
        .set({
          key: apiKeyData.key,
          name: apiKeyData.name,
          isActive: apiKeyData.isActive ?? true,
          lastUsedAt: new Date()
        })
        .where(eq(apiKeys.id, existingKeys[0].id))
        .returning();
      
      return updatedKey;
    }
    
    const [apiKey] = await db.insert(apiKeys).values(apiKeyData).returning();
    return apiKey;
  }
  
  async updateApiKey(id: number, apiKeyData: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .update(apiKeys)
      .set({
        ...apiKeyData,
        lastUsedAt: new Date()
      })
      .where(eq(apiKeys.id, id))
      .returning();
    
    return apiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id));
    
    return !!result;
  }
}

export const storage = new DatabaseStorage();