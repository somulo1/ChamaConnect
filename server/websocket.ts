import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ChatMessage {
  type: 'chat';
  senderId: number;
  senderName: string;
  recipientId?: number;
  chamaId?: number;
  content: string;
  timestamp: string;
}

interface NotificationMessage {
  type: 'notification';
  userId: number;
  title: string;
  content: string;
  notificationType: string;
  timestamp: string;
}

type ClientMessage = ChatMessage | NotificationMessage;

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  console.log('WebSocket server initialized on path: /ws');
  
  // Track connected clients with their userId
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as {
          type: string;
          userId?: number;
          [key: string]: any;
        };

        // Handle authentication
        if (data.type === 'auth') {
          if (data.userId) {
            userId = data.userId;
            clients.set(userId, ws);
            console.log(`User ${userId} connected`);
          }
          return;
        }

        // Ensure user is authenticated
        if (!userId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required'
          }));
          return;
        }

        // Handle chat messages
        if (data.type === 'chat') {
          const chatData: Omit<ChatMessage, 'type' | 'senderName' | 'timestamp'> = {
            senderId: userId,
            content: data.content,
          };

          // Check if it's a direct message or group chat
          if (data.recipientId) {
            chatData.recipientId = data.recipientId;
          } else if (data.chamaId) {
            chatData.chamaId = data.chamaId;
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Message must have either recipientId or chamaId'
            }));
            return;
          }

          // Get sender info
          const sender = await storage.getUser(userId);
          if (!sender) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'User not found'
            }));
            return;
          }

          // Save message to database
          await storage.createMessage({
            senderId: chatData.senderId,
            recipientId: chatData.recipientId,
            chamaId: chatData.chamaId,
            content: chatData.content
          });

          const outgoingMessage: ChatMessage = {
            type: 'chat',
            senderId: chatData.senderId,
            senderName: sender.fullName,
            recipientId: chatData.recipientId,
            chamaId: chatData.chamaId,
            content: chatData.content,
            timestamp: new Date().toISOString()
          };

          // Send to recipient if it's a direct message
          if (chatData.recipientId) {
            const recipientWs = clients.get(chatData.recipientId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify(outgoingMessage));
            }
            // Also send back to sender
            ws.send(JSON.stringify(outgoingMessage));
          } 
          // Send to all chama members if it's a group chat
          else if (chatData.chamaId) {
            const chamaMembers = await storage.getChamaMembers(chatData.chamaId);
            for (const member of chamaMembers) {
              const memberWs = clients.get(member.userId);
              if (memberWs && memberWs.readyState === WebSocket.OPEN) {
                memberWs.send(JSON.stringify(outgoingMessage));
              }
            }
          }
        }

      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  // Function to broadcast notifications
  const broadcastNotification = async (notification: NotificationMessage) => {
    const client = clients.get(notification.userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  };

  return {
    broadcastNotification
  };
}
