import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth } from "./auth";
import { setupWebSocketServer } from "./websocket";
import { insertChamaSchema, insertChamaMemberSchema, 
         insertContributionSchema, insertTransactionSchema,
         insertMeetingSchema, insertChamaRuleSchema,
         insertProductSchema, insertApiKeySchema,
         users, chamas, apiKeys } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Helper function to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Helper function to verify chama membership
  const verifyChamaMembership = async (req: any, res: any, next: any) => {
    const chamaId = parseInt(req.params.chamaId);
    if (isNaN(chamaId)) {
      return res.status(400).json({ message: "Invalid chama ID" });
    }

    const member = await storage.getChamaMember(chamaId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: "Not a member of this chama" });
    }

    req.chamaMember = member;
    next();
  };

  // Helper function to verify chama admin role
  const verifyChamaAdmin = async (req: any, res: any, next: any) => {
    if (!req.chamaMember) {
      return res.status(500).json({ message: "Chama membership not verified" });
    }

    const adminRoles = ["chairperson", "treasurer", "secretary"];
    if (!adminRoles.includes(req.chamaMember.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };

  // Helper function to verify app admin role
  const verifyAppAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // USER WALLET API
  app.get("/api/wallet", requireAuth, async (req, res) => {
    try {
      const wallet = await storage.getWallet(req.user.id);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // TRANSACTIONS API
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Ensure the user can only create transactions for themselves
      if (transactionData.userId !== req.user.id) {
        return res.status(403).json({ message: "Cannot create transactions for other users" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Update wallet balance for the user
      if (transaction.status === "completed") {
        const amount = parseFloat(transaction.amount.toString());
        let updateAmount = 0;
        
        switch (transaction.type) {
          case "deposit":
            updateAmount = amount;
            break;
          case "withdrawal":
          case "transfer":
            updateAmount = -amount;
            break;
          // Other types might need special handling
        }
        
        if (updateAmount !== 0) {
          await storage.updateWalletBalance(req.user.id, updateAmount);
        }
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // CHAMA API
  app.get("/api/chamas", requireAuth, async (req, res) => {
    try {
      const chamas = await storage.getChamasByUser(req.user.id);
      res.json(chamas);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas", requireAuth, async (req, res) => {
    try {
      const chamaData = insertChamaSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const chama = await storage.createChama(chamaData);
      
      // Add creator as chairperson
      await storage.addChamaMember({
        chamaId: chama.id,
        userId: req.user.id,
        role: "chairperson"
      });
      
      res.status(201).json(chama);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/chamas/:chamaId", requireAuth, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      if (isNaN(chamaId)) {
        return res.status(400).json({ message: "Invalid chama ID" });
      }
      
      const chama = await storage.getChama(chamaId);
      if (!chama) {
        return res.status(404).json({ message: "Chama not found" });
      }
      
      // Check if user is a member
      const member = await storage.getChamaMember(chamaId, req.user.id);
      if (!member) {
        return res.status(403).json({ message: "Not a member of this chama" });
      }
      
      res.json(chama);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // CHAMA MEMBERS API
  app.get("/api/chamas/:chamaId/members", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const members = await storage.getChamaMembers(chamaId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:chamaId/members", requireAuth, verifyChamaMembership, verifyChamaAdmin, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      
      const memberData = insertChamaMemberSchema.parse({
        ...req.body,
        chamaId
      });
      
      // Check if user exists
      const user = await storage.getUser(memberData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if already a member
      const existingMember = await storage.getChamaMember(chamaId, memberData.userId);
      if (existingMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
      
      const member = await storage.addChamaMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // CONTRIBUTIONS API
  app.get("/api/contributions", requireAuth, async (req, res) => {
    try {
      const contributions = await storage.getUserContributions(req.user.id);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/chamas/:chamaId/contributions", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const contributions = await storage.getContributions(chamaId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:chamaId/contributions", requireAuth, verifyChamaMembership, verifyChamaAdmin, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      
      // Can create contributions for all members at once
      const contributionsData = Array.isArray(req.body) ? req.body : [req.body];
      
      const createdContributions = [];
      
      for (const data of contributionsData) {
        const contributionData = insertContributionSchema.parse({
          ...data,
          chamaId
        });
        
        // Verify the user is a member
        const member = await storage.getChamaMember(chamaId, contributionData.userId);
        if (!member) {
          return res.status(400).json({ 
            message: `User ${contributionData.userId} is not a member of this chama` 
          });
        }
        
        const contribution = await storage.createContribution(contributionData);
        createdContributions.push(contribution);
        
        // Create a notification for the user
        await storage.createNotification({
          userId: contributionData.userId,
          type: "contribution_due",
          title: "New Contribution Due",
          content: `You have a new contribution of ${contributionData.amount} due by ${new Date(contributionData.dueDate).toLocaleDateString()}`,
          relatedId: contribution.id
        });
      }
      
      res.status(201).json(createdContributions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.post("/api/contributions/:contributionId/pay", requireAuth, async (req, res) => {
    try {
      const contributionId = parseInt(req.params.contributionId);
      if (isNaN(contributionId)) {
        return res.status(400).json({ message: "Invalid contribution ID" });
      }
      
      // Get the contribution
      const contribution = await storage.getContributions(0) // Get all contributions
        .then(contributions => contributions.find(c => c.id === contributionId));
      
      if (!contribution) {
        return res.status(404).json({ message: "Contribution not found" });
      }
      
      // Check if it's the user's contribution
      if (contribution.userId !== req.user.id) {
        return res.status(403).json({ message: "Cannot pay another user's contribution" });
      }
      
      // Check if already paid
      if (contribution.status === "paid") {
        return res.status(400).json({ message: "Contribution already paid" });
      }
      
      // Update contribution status
      const updatedContribution = await storage.updateContributionStatus(
        contributionId, 
        "paid", 
        new Date()
      );
      
      // Create a transaction for this payment
      await storage.createTransaction({
        userId: req.user.id,
        type: "contribution",
        amount: contribution.amount,
        status: "completed",
        description: `Contribution payment for ${contribution.chamaId}`,
        relatedId: contributionId
      });
      
      res.json(updatedContribution);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // MEETINGS API
  app.get("/api/chamas/:chamaId/meetings", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const meetings = await storage.getChamaMeetings(chamaId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:chamaId/meetings", requireAuth, verifyChamaMembership, verifyChamaAdmin, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        chamaId,
        createdBy: req.user.id
      });
      
      const meeting = await storage.createMeeting(meetingData);
      
      // Create notifications for all members
      const members = await storage.getChamaMembers(chamaId);
      for (const member of members) {
        await storage.createNotification({
          userId: member.userId,
          type: "meeting_scheduled",
          title: "New Meeting Scheduled",
          content: `A new meeting "${meetingData.title}" has been scheduled for ${new Date(meetingData.scheduledFor).toLocaleString()}`,
          relatedId: meeting.id
        });
      }
      
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // CHAMA RULES API
  app.get("/api/chamas/:chamaId/rules", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const rules = await storage.getChamaRules(chamaId);
      
      if (!rules) {
        return res.status(404).json({ message: "Rules not found" });
      }
      
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:chamaId/rules", requireAuth, verifyChamaMembership, verifyChamaAdmin, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      
      // Check if rules already exist
      const existingRules = await storage.getChamaRules(chamaId);
      if (existingRules) {
        return res.status(400).json({ 
          message: "Rules already exist. Use PUT to update" 
        });
      }
      
      const rulesData = insertChamaRuleSchema.parse({
        ...req.body,
        chamaId
      });
      
      const rules = await storage.createChamaRules(rulesData);
      res.status(201).json(rules);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // NOTIFICATIONS API
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/notifications/:notificationId/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      // Mark as read
      const notification = await storage.markNotificationAsRead(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // MARKETPLACE API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/my", requireAuth, async (req, res) => {
    try {
      const products = await storage.getUserProducts(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: req.user.id
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // MESSAGES API
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getUserMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/chamas/:chamaId/messages", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const messages = await storage.getChamaMessages(chamaId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // AI ASSISTANT API
  app.post("/api/assistant/chat", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Simple rule-based responses for demo
      let response = "I'm sorry, I don't understand that question.";
      
      if (message.toLowerCase().includes("how to save")) {
        response = "To save effectively, consider setting aside a fixed percentage of your income each month. The 50/30/20 rule suggests 50% for needs, 30% for wants, and 20% for savings and debt repayment.";
      } else if (message.toLowerCase().includes("what is a chama")) {
        response = "A chama is a group savings and investment club, popular in Kenya and other parts of Africa. Members contribute regularly and can use the pooled funds for investments, loans, or rotating payouts.";
      } else if (message.toLowerCase().includes("investment")) {
        response = "For investments, diversification is key. Consider a mix of stocks, bonds, real estate, and other vehicles based on your risk tolerance and financial goals.";
      } else if (message.toLowerCase().includes("loan") || message.toLowerCase().includes("borrow")) {
        response = "When considering loans, always compare interest rates, terms, and total cost. Borrow only what you can afford to repay, and prioritize paying off high-interest debt first.";
      }
      
      res.json({ 
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ADMIN ROUTES
  app.get("/api/admin/users", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      // In a real app, we'd use pagination
      // For now, we'll query all users from the DB but remove the password
      const allUsers = await db.select().from(users);
      
      // Remove password field from each user
      const usersWithoutPassword = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/chamas", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      // In a real app, we'd use pagination
      const allChamas = await db.select().from(chamas);
      res.json(allChamas);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // API KEYS ROUTES
  app.get("/api/admin/api-keys", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Error fetching API keys", error: error.message });
    }
  });

  app.post("/api/admin/api-keys", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      // Create a basic validation schema for the API key
      const apiKeySchema = z.object({
        name: z.string().min(3),
        key: z.string().min(5),
        type: z.string().min(3),
        isActive: z.boolean().optional().default(true)
      });
      
      const apiKeyData = apiKeySchema.parse(req.body);
      const newApiKey = await storage.createApiKey(apiKeyData);
      
      res.status(201).json(newApiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Error creating API key", error: error.message });
      }
    }
  });

  app.put("/api/admin/api-keys/:id", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid API key ID" });
      }

      // Create a basic validation schema for updating the API key
      const updateApiKeySchema = z.object({
        name: z.string().min(3).optional(),
        key: z.string().min(5).optional(),
        type: z.string().min(3).optional(),
        isActive: z.boolean().optional()
      });
      
      const apiKeyData = updateApiKeySchema.parse(req.body);
      const updatedApiKey = await storage.updateApiKey(id, apiKeyData);
      
      if (!updatedApiKey) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      res.json(updatedApiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.format() });
      } else {
        res.status(500).json({ message: "Error updating API key", error: error.message });
      }
    }
  });

  app.delete("/api/admin/api-keys/:id", requireAuth, verifyAppAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid API key ID" });
      }
      
      const result = await storage.deleteApiKey(id);
      
      if (!result) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting API key", error: error.message });
    }
  });

  // Create HTTP server and setup WebSockets
  const httpServer = createServer(app);
  const wsServer = setupWebSocketServer(httpServer);

  return httpServer;
}
