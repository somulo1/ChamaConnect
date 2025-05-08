import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet model
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: numeric("balance").notNull().default("0"),
  currency: text("currency").notNull().default("KES"),
});

// Chama model
export const chamas = pgTable("chamas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  founded: timestamp("founded").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Chama members
export const chamaMembers = pgTable("chama_members", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // chairperson, treasurer, secretary, member
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => {
  return {
    uniqueMembership: uniqueIndex("unique_membership").on(table.chamaId, table.userId),
  };
});

// Contributions
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, transfer, contribution, loan_repayment
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  relatedId: integer("related_id"), // Could be contributionId, loanId, etc.
});

// Meetings
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  location: text("location"),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").references(() => users.id),
  chamaId: integer("chama_id").references(() => chamas.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  read: boolean("read").default(false),
});

// Chama Rules
export const chamaRules = pgTable("chama_rules", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  contributionAmount: numeric("contribution_amount").notNull(),
  contributionFrequency: text("contribution_frequency").notNull(), // daily, weekly, monthly
  latePaymentFine: numeric("late_payment_fine"),
  interestRate: numeric("interest_rate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // contribution_due, meeting_scheduled, loan_approved, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  relatedId: integer("related_id"), // Could reference a meeting, contribution, etc.
});

// Marketplace items
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  category: text("category"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("available"), // available, sold, reserved
  createdAt: timestamp("created_at").defaultNow(),
});

// User learning progress
export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: text("module_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").default(false),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  type: text("type").notNull(), // sendgrid, twilio, payment, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export const insertChamaSchema = createInsertSchema(chamas).omit({ id: true, founded: true });
export const insertChamaMemberSchema = createInsertSchema(chamaMembers).omit({ id: true, joinedAt: true });
export const insertContributionSchema = createInsertSchema(contributions).omit({ id: true, paidAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true, read: true });
export const insertChamaRuleSchema = createInsertSchema(chamaRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({ id: true, lastAccessed: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, lastUsedAt: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Chama = typeof chamas.$inferSelect;
export type InsertChama = z.infer<typeof insertChamaSchema>;

export type ChamaMember = typeof chamaMembers.$inferSelect;
export type InsertChamaMember = z.infer<typeof insertChamaMemberSchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ChamaRule = typeof chamaRules.$inferSelect;
export type InsertChamaRule = z.infer<typeof insertChamaRuleSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
