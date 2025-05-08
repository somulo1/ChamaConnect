import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Send,
  User,
  Loader2,
  ChevronDown,
  DollarSign,
  PiggyBank,
  TrendingUp,
  HelpCircle,
  Star
} from "lucide-react";
import { chatWithAI } from "@/services/api";
import { AIConversation } from "@/types";
import { useAuth } from "@/hooks/use-auth";

export default function AssistantPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("new");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: (message: string) => chatWithAI(message),
    onSuccess: (data, variables) => {
      const newMessage: AIConversation = {
        id: Date.now().toString(),
        userMessage: variables,
        aiResponse: data.response,
        timestamp: data.timestamp
      };
      
      if (currentConversationId === "new") {
        setCurrentConversationId(newMessage.id);
      }
      
      setConversations(prev => [...prev, newMessage]);
      setInput("");
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !chatMutation.isPending) {
      chatMutation.mutate(input);
    }
  };

  // Sample suggested questions
  const suggestedQuestions = [
    "How can I optimize my chama contributions?",
    "What's the best way to invest group savings?",
    "How do I handle late contributions?",
    "What investment options are good for short-term goals?",
    "How can we make our chama more efficient?",
    "What documentation should our chama keep?",
    "How to distribute profits fairly in a chama?"
  ];

  return (
    <UserLayout title="AI Financial Assistant">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Financial Assistant</h1>
        <p className="text-muted-foreground">Your AI financial advisor and chama guide</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Assistant</CardTitle>
              <CardDescription>Get personalized financial advice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setCurrentConversationId("new")}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Topics</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Personal Finance
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <PiggyBank className="mr-2 h-4 w-4" />
                    Savings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Investments
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Chama Guidelines
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Conversations</h3>
                <div className="space-y-1">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">
                      No recent conversations
                    </p>
                  ) : (
                    conversations.slice(0, 5).map((conv, index) => (
                      <Button
                        key={conv.id}
                        variant="ghost"
                        className="w-full justify-start text-left truncate"
                        onClick={() => setCurrentConversationId(conv.id)}
                      >
                        <Brain className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {conv.userMessage.substring(0, 25)}
                          {conv.userMessage.length > 25 ? "..." : ""}
                        </span>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Chat Area */}
        <Card className="md:col-span-3 flex flex-col h-[calc(100vh-15rem)]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Financial Assistant</CardTitle>
                  <CardDescription>Powered by AI</CardDescription>
                </div>
              </div>
              <Tabs defaultValue="chat">
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
            <ScrollArea className="flex-1 p-4">
              {/* Welcome Message */}
              {conversations.length === 0 && (
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-medium mb-2">Hello{user ? `, ${user.fullName}` : ''}! I'm your AI Financial Assistant.</p>
                      <p className="text-muted-foreground mb-3">
                        I can help you with personal finance, savings strategies, chama management, and investment advice.
                        What would you like to know about today?
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {suggestedQuestions.slice(0, 4).map((question, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="justify-start h-auto text-left py-2 px-3"
                            onClick={() => {
                              setInput(question);
                              setTimeout(() => handleSendMessage(), 100);
                            }}
                          >
                            <ChevronDown className="h-4 w-4 mr-2 rotate-270" />
                            <span className="truncate">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Conversation Messages */}
              <div className="space-y-6">
                {conversations.map((conv) => (
                  <div key={conv.id}>
                    <div className="flex items-start mb-4">
                      <div className="bg-muted rounded-full p-2 mr-3 flex-shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p>{conv.userMessage}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p>{conv.aiResponse}</p>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-xs text-muted-foreground">
                            {new Date(conv.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="xs">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Helpful
                            </Button>
                            <Button variant="ghost" size="xs">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Not helpful
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p>Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={endOfMessagesRef} />
              </div>
            </ScrollArea>
            
            <CardFooter className="border-t p-3">
              <form onSubmit={handleSendMessage} className="flex w-full">
                <Input
                  className="flex-1 mr-2"
                  placeholder="Ask a question about finance or chama management..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={chatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || chatMutation.isPending}
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="insights" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
            <ScrollArea className="flex-1 p-6">
              <h3 className="text-lg font-medium mb-4">Financial Insights</h3>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Savings Overview</CardTitle>
                      <Badge variant="outline">Auto-generated</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Based on your savings patterns over the last 3 months, here are some insights:
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <TrendingUp className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                        <span>Your savings rate is 15% of your income, which is good (recommended is at least 20%)</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-5 w-5 text-warning mr-2 flex-shrink-0" />
                        <span>Your chama contributions are consistent, with no late payments</span>
                      </li>
                      <li className="flex items-start">
                        <PiggyBank className="h-5 w-5 text-info mr-2 flex-shrink-0" />
                        <span>Your emergency fund covers approximately 2 months of expenses (recommended is 3-6 months)</span>
                      </li>
                    </ul>
                    
                    <p className="font-medium">Recommendations:</p>
                    <p className="text-muted-foreground">
                      Try to increase your savings rate by 5% to reach the recommended threshold.
                      Focus on building your emergency fund to at least 3 months of expenses.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Chama Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Based on your participation in "Umoja Investment Group":
                    </p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                        <span>The group has a healthy return rate of 12% annually</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-success mr-2 flex-shrink-0" />
                        <span>Your contribution cycle is well-structured</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-warning mr-2 flex-shrink-0" />
                        <span>The investment portfolio could be more diversified</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Card>
      </div>
    </UserLayout>
  );
}

function PlusIcon(props: any) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ThumbsUp(props: any) {
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
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDown(props: any) {
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
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function CheckIcon(props: any) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertTriangle(props: any) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
