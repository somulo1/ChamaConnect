import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layout/UserLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Tag,
  ShoppingBag,
  Star,
  ShoppingCart,
  Plus,
  Store
} from "lucide-react";
import { getProducts, getUserProducts } from "@/services/api";
import { Product } from "@shared/schema";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: activeTab === "browse"
  });

  const { data: userProducts = [], isLoading: isUserProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/my"],
    enabled: activeTab === "my-listings"
  });

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (categoryFilter === "all") return matchesSearch;
    return matchesSearch && product.category === categoryFilter;
  });

  // Categories extracted from products
  const categories = ["all", ...new Set(products.map(p => p.category || "uncategorized"))];

  return (
    <UserLayout title="Marketplace">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Chama Marketplace</h1>
        <p className="text-muted-foreground">Buy and sell products within the community</p>
      </div>
      
      <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="cart">My Cart</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="browse">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" 
                      ? "All Categories" 
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
                  <div className="h-6 bg-muted rounded mb-2 w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try a different search term or check another category."
                : "There are no products available at the moment."}
            </p>
            {(searchQuery || categoryFilter !== "all") && (
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 bg-muted relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-12 w-12" />
                    </div>
                  )}
                  {product.category && (
                    <Badge className="absolute top-2 right-2">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description || "No description provided"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">KES {product.price.toString()}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{product.status}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted border-t px-6 py-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="my-listings">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">My Product Listings</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>
        
        {isUserProductsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-24 bg-muted"></div>
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't listed any products for sale. Start selling to the community!
            </p>
            <Button>Create Your First Listing</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col md:flex-row">
                <div className="h-32 md:w-1/3 bg-muted relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 right-2 ${
                    product.status === 'available' ? 'bg-success' : 
                    product.status === 'sold' ? 'bg-destructive' : 'bg-secondary'
                  }`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col">
                  <CardContent className="pt-6 flex-1">
                    <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                    <p className="text-lg font-bold mb-1">KES {product.price.toString()}</p>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description || "No description provided"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Listed on {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="bg-muted border-t px-6 py-3 flex justify-between">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant={product.status === 'available' ? "destructive" : "secondary"} size="sm">
                      {product.status === 'available' ? 'Remove' : 'Relist'}
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="cart">
        <Card className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Browse the marketplace and add products to your cart.
          </p>
          <Button onClick={() => setActiveTab("browse")}>Start Shopping</Button>
        </Card>
      </TabsContent>
    </UserLayout>
  );
}
