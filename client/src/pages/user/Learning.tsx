import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  LockIcon,
  Video,
  FileText,
  PieChart,
  Award,
  PlayCircle
} from "lucide-react";
import { getLearningModules } from "@/services/api";
import { LearningModule } from "@/types";

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: modules = [], isLoading } = useQuery<LearningModule[]>({
    queryKey: ["learning-modules"],
    queryFn: getLearningModules
  });

  // Filter modules based on search query and active tab
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "in-progress") return matchesSearch && module.progress && module.progress > 0 && !module.completed;
    if (activeTab === "completed") return matchesSearch && module.completed;
    
    return matchesSearch;
  });

  return (
    <UserLayout title="Learning Hub">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Financial Learning Hub</h1>
        <p className="text-muted-foreground">Improve your financial knowledge and skills</p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for modules..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Featured Module */}
      <Card className="mb-8 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/80 to-primary flex items-center">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative p-6 md:p-8 text-white">
            <Badge className="bg-white/20 hover:bg-white/40 text-white mb-2">Featured</Badge>
            <h2 className="text-2xl font-bold mb-2">Financial Mastery for Chama Groups</h2>
            <p className="mb-4 max-w-xl">Learn advanced strategies for managing group savings, investments, and governance to maximize returns.</p>
            <div className="flex items-center gap-4">
              <Button variant="secondary" className="gap-2">
                <PlayCircle className="h-4 w-4" />
                Start Learning
              </Button>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                3 hours
              </div>
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-1" />
                Certificate
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Learning Paths */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-primary p-2 w-fit rounded-full bg-primary/10 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Beginner's Guide</h3>
              <p className="text-muted-foreground text-sm mb-4">Start your journey to financial literacy with these foundational modules.</p>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>3/5 modules</span>
              </div>
              <Progress value={60} className="h-2" />
            </CardContent>
            <CardFooter className="border-t bg-muted px-6 py-4">
              <Button variant="outline" className="w-full">Continue Learning</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-secondary p-2 w-fit rounded-full bg-secondary/10 mb-3">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Chama Management</h3>
              <p className="text-muted-foreground text-sm mb-4">Learn how to effectively manage and grow your chama group.</p>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>1/7 modules</span>
              </div>
              <Progress value={15} className="h-2" />
            </CardContent>
            <CardFooter className="border-t bg-muted px-6 py-4">
              <Button variant="outline" className="w-full">Continue Learning</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="pt-6 flex flex-col h-full">
              <div className="text-muted-foreground p-2 w-fit rounded-full bg-muted mb-3">
                <LockIcon className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Advanced Investments</h3>
              <p className="text-muted-foreground text-sm mb-4">Master complex investment strategies for long-term wealth building.</p>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">Complete Beginner's Guide to unlock</p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted px-6 py-4">
              <Button variant="outline" className="w-full" disabled>Locked</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* All Learning Modules */}
      <div>
        <h2 className="text-xl font-medium mb-4">Learning Modules</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted"></div>
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded mb-1 w-full"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No modules found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try a different search term or check back later for new content."
                : "We're adding new content regularly. Check back soon!"}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="overflow-hidden">
                <div className="h-40 bg-muted relative">
                  {module.imageUrl && (
                    <img
                      src={module.imageUrl}
                      alt={module.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {module.completed && (
                    <div className="absolute top-2 right-2 bg-success rounded-full p-1">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-2">{module.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {module.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {module.duration}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        5 lessons
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {module.progress !== undefined && !module.completed && (
                        <span className="text-xs mr-2">{module.progress}%</span>
                      )}
                      <Button variant="ghost" size="sm" className="text-primary">
                        {module.completed 
                          ? "Review" 
                          : module.progress && module.progress > 0 
                            ? "Continue" 
                            : "Start"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
