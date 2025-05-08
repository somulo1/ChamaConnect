import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  User,
  Users,
  PhoneCall,
  Video,
  MoreVertical,
  PlusCircle,
  Image,
  Paperclip,
  Smile,
  CheckCheck
} from "lucide-react";
import { Chama, User as UserType } from "@shared/schema";
import { ChatMessage } from "@/types";
import { getUserMessages, getChamaMessages } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<{ type: 'user' | 'chama', id: number, name: string } | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: chamas = [] } = useQuery<Chama[]>({
    queryKey: ["/api/chamas"],
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    // Connect to WebSocket server
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      
      // Authenticate with userId
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      }
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat') {
          setMessages(prev => [...prev, {
            id: Date.now(), // Temporary ID until we get the real one
            senderId: data.senderId,
            senderName: data.senderName,
            recipientId: data.recipientId,
            chamaId: data.chamaId,
            content: data.content,
            timestamp: data.timestamp,
            read: false
          }]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    
    const loadMessages = async () => {
      try {
        if (selectedChat.type === 'user') {
          // Direct messages would require a specific API endpoint
          // For now, we'll filter the general messages
          const allMessages = await getUserMessages();
          const directMessages = allMessages.filter(msg => 
            (msg.senderId === user?.id && msg.recipientId === selectedChat.id) ||
            (msg.senderId === selectedChat.id && msg.recipientId === user?.id)
          );
          
          setMessages(directMessages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: "User", // This would come from user data
            recipientId: msg.recipientId,
            content: msg.content,
            timestamp: msg.sentAt.toString(),
            read: msg.read
          })));
        } else {
          // Chama group messages
          const chamaMessages = await getChamaMessages(selectedChat.id);
          
          setMessages(chamaMessages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: "User", // This would come from user data
            chamaId: msg.chamaId,
            content: msg.content,
            timestamp: msg.sentAt.toString(),
            read: msg.read
          })));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    
    loadMessages();
  }, [selectedChat, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat || !wsConnected || !ws.current) return;
    
    // Send message through WebSocket
    const chatMessage = {
      type: 'chat',
      content: message,
      ...(selectedChat.type === 'user' 
          ? { recipientId: selectedChat.id }
          : { chamaId: selectedChat.id })
    };
    
    ws.current.send(JSON.stringify(chatMessage));
    setMessage("");
  };

  // Mock data for contacts and recent chats
  const mockContacts = [
    { id: 1, name: "John Doe", status: "online", lastMessage: "Hey, how are you?", unread: 2 },
    { id: 2, name: "Jane Smith", status: "offline", lastMessage: "See you tomorrow!", unread: 0 },
    { id: 3, name: "Mike Johnson", status: "away", lastMessage: "Thanks for the info.", unread: 0 },
  ];

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChamas = chamas.filter(chama =>
    chama.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <UserLayout title="Messages">
      <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] mb-6 overflow-hidden">
        {/* Contacts Sidebar */}
        <Card className="w-full max-w-xs flex-shrink-0 mr-0 md:mr-4 overflow-hidden flex flex-col">
          <CardHeader className="px-3 py-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="flex-1">Direct</Button>
              <Button variant="ghost" size="sm" className="flex-1">Groups</Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Chats</h4>
              <div className="space-y-1">
                {filteredContacts.map(contact => (
                  <button
                    key={`user-${contact.id}`}
                    className={`w-full flex items-center p-2 rounded-md text-left hover:bg-muted ${
                      selectedChat?.type === 'user' && selectedChat.id === contact.id 
                        ? 'bg-muted' 
                        : ''
                    }`}
                    onClick={() => setSelectedChat({ type: 'user', id: contact.id, name: contact.name })}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={contact.name} />
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                        contact.status === 'online' ? 'bg-success' : 
                        contact.status === 'away' ? 'bg-warning' : 
                        'bg-muted'
                      }`} />
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium truncate">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">12:45</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <Badge className="ml-2 bg-primary">{contact.unread}</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Chama Groups</h4>
              <div className="space-y-1">
                {filteredChamas.map(chama => (
                  <button
                    key={`chama-${chama.id}`}
                    className={`w-full flex items-center p-2 rounded-md text-left hover:bg-muted ${
                      selectedChat?.type === 'chama' && selectedChat.id === chama.id 
                        ? 'bg-muted' 
                        : ''
                    }`}
                    onClick={() => setSelectedChat({ type: 'chama', id: chama.id, name: chama.name })}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium truncate">{chama.name}</p>
                        <p className="text-xs text-muted-foreground">10:30</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">Group chat</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
          
          <CardFooter className="flex justify-center border-t p-3">
            <Button variant="outline" size="sm" className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </CardFooter>
        </Card>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <Card className="flex flex-col h-full">
              {/* Chat Header */}
              <CardHeader className="px-6 py-3 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      {selectedChat.type === 'user' ? (
                        <>
                          <AvatarImage src="" alt={selectedChat.name} />
                          <AvatarFallback>{getInitials(selectedChat.name)}</AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="bg-secondary">
                          <Users className="h-5 w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedChat.name}</CardTitle>
                      <CardDescription>
                        {selectedChat.type === 'user' ? 'Online' : '12 members'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <PhoneCall className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="bg-muted rounded-full p-3 mb-4">
                        {selectedChat.type === 'user' ? (
                          <User className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Users className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {selectedChat.type === 'user'
                          ? `Start a conversation with ${selectedChat.name}`
                          : `Be the first to send a message to ${selectedChat.name}`}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end max-w-[80%]">
                            {!isMe && (
                              <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                                <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`rounded-lg p-3 ${
                              isMe 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {selectedChat.type === 'chama' && !isMe && (
                                <p className="text-xs font-medium mb-1">{msg.senderName}</p>
                              )}
                              <p className="text-sm">{msg.content}</p>
                              <div className={`text-xs mt-1 flex items-center justify-end ${
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                                {isMe && (
                                  <CheckCheck className="h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <CardFooter className="p-3 border-t">
                <div className="flex items-center w-full">
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    className="mx-2"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button onClick={sendMessage} disabled={!message.trim() || !wsConnected}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="bg-muted rounded-full p-3 mx-auto mb-4 w-fit">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a contact or group from the sidebar to start chatting
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SmileEmoji(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
