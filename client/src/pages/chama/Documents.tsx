import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ChamaLayout from "@/components/layout/ChamaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, FileArchive, Plus, MoreVertical, Download, Trash2, Edit, File, FileCog, PlusCircle } from "lucide-react";

// Mock types - replace with actual schema types later
interface Document {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

export default function ChamaDocuments() {
  const { id } = useParams<{ id: string }>();
  const chamaId = parseInt(id);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Mock data for documents
  const documents: Document[] = [
    {
      id: 1,
      name: "Constitution.pdf",
      type: "PDF",
      uploadedBy: "John Doe",
      uploadedAt: "2023-06-15",
      size: "1.2 MB"
    },
    {
      id: 2,
      name: "Meeting Minutes - January.docx",
      type: "DOCX",
      uploadedBy: "Jane Smith",
      uploadedAt: "2023-01-25",
      size: "856 KB"
    },
    {
      id: 3,
      name: "Financial Report Q1.xlsx",
      type: "XLSX",
      uploadedBy: "Michael Johnson",
      uploadedAt: "2023-04-05",
      size: "725 KB"
    },
    {
      id: 4,
      name: "Loan Agreement Template.pdf",
      type: "PDF",
      uploadedBy: "Sarah Williams",
      uploadedAt: "2022-11-18",
      size: "1.4 MB"
    }
  ];
  
  const categories = {
    all: documents,
    legal: documents.filter(doc => doc.name.includes("Constitution") || doc.name.includes("Agreement")),
    financial: documents.filter(doc => doc.name.includes("Financial") || doc.name.includes("Report")),
    minutes: documents.filter(doc => doc.name.includes("Minutes")),
  };

  // Handle file upload
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement file upload logic
    setIsUploadDialogOpen(false);
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch(type) {
      case "PDF":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "DOCX":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "XLSX":
        return <FileText className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <ChamaLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Documents</h2>
          <p className="text-muted-foreground">Manage important chama documents and files</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload a document to share with chama members.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFileUpload}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input 
                    id="file"
                    type="file"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category"
                    placeholder="E.g. Legal, Financial, Minutes"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description"
                    placeholder="Brief description of the document"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center border-b mb-4 pb-2">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="minutes">Meeting Minutes</TabsTrigger>
              </TabsList>
              
              <Input 
                placeholder="Search documents..." 
                className="max-w-xs"
              />
            </div>
            
            <TabsContent value="all">
              <DocumentTable documents={categories.all} />
            </TabsContent>
            
            <TabsContent value="legal">
              <DocumentTable documents={categories.legal} />
            </TabsContent>
            
            <TabsContent value="financial">
              <DocumentTable documents={categories.financial} />
            </TabsContent>
            
            <TabsContent value="minutes">
              <DocumentTable documents={categories.minutes} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Document Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <FileCog className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-medium mb-2">Chama Constitution</h4>
                <p className="text-sm text-muted-foreground mb-4">Standard template for creating your chama's constitution and bylaws.</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <FileCog className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-medium mb-2">Meeting Minutes</h4>
                <p className="text-sm text-muted-foreground mb-4">Template for recording meeting minutes in a structured format.</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <FileCog className="h-10 w-10 text-primary mb-4" />
                <h4 className="font-medium mb-2">Loan Agreement</h4>
                <p className="text-sm text-muted-foreground mb-4">Template for creating loan agreements between the chama and borrowers.</p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ChamaLayout>
  );
}

function DocumentTable({ documents }: { documents: Document[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length > 0 ? (
            documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {document.type === "PDF" ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : document.type === "DOCX" ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                    <span>{document.name}</span>
                  </div>
                </TableCell>
                <TableCell>{document.uploadedBy}</TableCell>
                <TableCell>{document.uploadedAt}</TableCell>
                <TableCell>{document.size}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileArchive className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No documents found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {/* trigger upload dialog */}}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}