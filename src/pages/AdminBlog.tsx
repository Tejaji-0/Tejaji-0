import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { 
  Home, Plus, Edit, Trash2, Save, X, Eye, LogOut, Lock,
  Search, Calendar, Clock, Tag, Image as ImageIcon, FileText,
  SortAsc, SortDesc, Filter, Copy, Check, Loader2, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ScrollProgress from "@/components/animations/ScrollProgress";
import CursorTrail from "@/components/animations/CursorTrail";

const AdminBlog = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [loadedStacks, setLoadedStacks] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const POSTS_PER_STACK = 24; // Admin can see more posts per stack
  
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", tags: "", image: "", readTime: "",
  });

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap(post => post.tags))), [posts]);

  const allFilteredPosts = useMemo(() => {
    let filtered = posts;
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filterTag !== "all") filtered = filtered.filter(post => post.tags.includes(filterTag));
    
    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === "desc" ? dateCompare : -dateCompare;
      }
      const titleCompare = a.title.localeCompare(b.title);
      return sortOrder === "desc" ? -titleCompare : titleCompare;
    });
  }, [posts, searchQuery, filterTag, sortBy, sortOrder]);

  // Get currently loaded posts based on stacks
  const filteredPosts = useMemo(() => 
    allFilteredPosts.slice(0, loadedStacks * POSTS_PER_STACK),
    [allFilteredPosts, loadedStacks]
  );

  const hasMore = filteredPosts.length < allFilteredPosts.length;

  // Reset stacks when filters change
  useEffect(() => {
    setLoadedStacks(1);
  }, [searchQuery, filterTag, sortBy, sortOrder]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setLoadedStacks(prev => prev + 1);
      setIsLoadingMore(false);
    }, 200);
  }, [isLoadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMorePosts]);

  const handleLogin = () => {
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "✅ Login Successful", description: "Welcome to the admin panel" });
    } else {
      toast({ title: "❌ Login Failed", description: "Invalid password", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    toast({ title: "Logged Out", description: "You have been logged out successfully" });
  };

  const resetForm = () => {
    setFormData({ title: "", excerpt: "", content: "", tags: "", image: "", readTime: "" });
    setEditingPost(null);
    setActiveTab("edit");
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title, excerpt: post.excerpt, content: post.content,
      tags: post.tags.join(", "), image: post.image || "", readTime: post.readTime,
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
    setDeleteConfirm(null);
    toast({ title: "🗑️ Post Deleted", description: "The blog post has been deleted successfully" });
  };

  const handleSave = () => {
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast({ title: "⚠️ Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (editingPost) {
      setPosts(posts.map(post => post.id === editingPost.id 
        ? { ...post, title: formData.title, excerpt: formData.excerpt, content: formData.content, tags: tagsArray, image: formData.image, readTime: formData.readTime || "5 min read" }
        : post
      ));
      toast({ title: "✅ Post Updated", description: "The blog post has been updated successfully" });
    } else {
      const newPost: BlogPost = {
        id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title: formData.title, excerpt: formData.excerpt, content: formData.content,
        date: new Date().toISOString().split("T")[0], author: "Tejaji",
        tags: tagsArray, readTime: formData.readTime || "5 min read", image: formData.image,
      };
      setPosts([newPost, ...posts]);
      toast({ title: "✅ Post Created", description: "New blog post has been created successfully" });
    }
    setIsEditing(false);
    resetForm();
  };

  const handleDuplicate = (post: BlogPost) => {
    const duplicatedPost: BlogPost = {
      ...post, id: `${post.id}-copy-${Date.now()}`, title: `${post.title} (Copy)`,
      date: new Date().toISOString().split("T")[0],
    };
    setPosts([duplicatedPost, ...posts]);
    toast({ title: "✅ Post Duplicated", description: "A copy of the post has been created" });
  };

  const copyPostId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Post ID copied to clipboard" });
  };

  const estimateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  const handleAutoEstimate = () => setFormData({...formData, readTime: estimateReadTime(formData.content)});
  const handleCancel = () => { setIsEditing(false); resetForm(); };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="w-full max-w-md shadow-2xl border-2">
            <CardHeader className="text-center space-y-4">
              <motion.div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                <Lock className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
                <CardDescription className="text-base mt-2">Enter your credentials to manage blog posts</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <Input id="password" type="password" placeholder="Enter admin password" value={password}
                    onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleLogin()} className="h-11" />
                </div>
                <Button onClick={handleLogin} className="w-full h-11 text-base font-semibold">
                  <Lock className="w-4 h-4 mr-2" />Login to Admin Panel
                </Button>
                <div className="bg-muted/50 p-3 rounded-md border">
                  <p className="text-xs text-muted-foreground text-center"><strong>Demo Credentials:</strong> admin123</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t pt-6">
              <Link to="/"><Button variant="ghost" className="gap-2"><Home className="w-4 h-4" />Back to Home</Button></Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ScrollProgress />
      <CursorTrail />
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Link to="/"><Button variant="ghost" size="sm" className="gap-2"><Home className="w-4 h-4" /><span className="hidden sm:inline">Home</span></Button></Link>
              <Link to="/blog"><Button variant="ghost" size="sm" className="gap-2"><Eye className="w-4 h-4" /><span className="hidden sm:inline">View Blog</span></Button></Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" />{posts.length} Posts</Badge>
              </div>
              <h1 className="text-lg md:text-xl font-bold">Blog Admin</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="container px-4 md:px-6 py-8 max-w-7xl mx-auto">
          <div className="mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl md:text-4xl font-bold">Manage Blog Posts</h2>
                <p className="text-muted-foreground mt-1">Create, edit, and organize your content</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Button onClick={() => setIsEditing(true)} size="lg" className="gap-2 shadow-lg">
                  <Plus className="w-5 h-5" />New Post
                </Button>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search posts by title, content, or tags..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-[140px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "title")}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{posts.length}</div><p className="text-xs text-muted-foreground">Total Posts</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{allTags.length}</div><p className="text-xs text-muted-foreground">Unique Tags</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{filteredPosts.length}</div><p className="text-xs text-muted-foreground">Loaded ({allFilteredPosts.length} total)</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{posts[0] ? new Date(posts[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</div><p className="text-xs text-muted-foreground">Latest Post</p></CardContent></Card>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${searchQuery}-${filterTag}-${sortBy}-${sortOrder}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }} layout>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
                    {post.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>)}
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{new Date(post.date).toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{post.readTime}</span></div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyPostId(post.id)} className="h-7 text-xs">
                        {copiedId === post.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        ID: {post.id.substring(0, 15)}...
                      </Button>
                    </CardContent>
                    <Separator />
                    <CardFooter className="gap-2 pt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post)} className="flex-1 gap-1"><Edit className="w-3 h-3" />Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(post)} className="gap-1"><Copy className="w-3 h-3" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(post.id)} className="gap-1"><Trash2 className="w-3 h-3" /></Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Section */}
          <div ref={loadMoreRef} className="mt-8 text-center">
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-muted-foreground py-4"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more posts...</span>
              </motion.div>
            )}
            
            {!isLoadingMore && hasMore && (
              <Button
                variant="outline"
                size="lg"
                onClick={loadMorePosts}
                className="gap-2"
              >
                Load More Posts ({allFilteredPosts.length - filteredPosts.length} remaining)
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}

            {!hasMore && filteredPosts.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm py-4"
              >
                ✨ All {allFilteredPosts.length} posts loaded
              </motion.p>
            )}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterTag !== "all" ? "Try adjusting your search or filters" : "Create your first blog post to get started"}
              </p>
              {!searchQuery && filterTag === "all" && (
                <Button onClick={() => setIsEditing(true)} className="gap-2"><Plus className="w-4 h-4" />Create First Post</Button>
              )}
            </motion.div>
          )}
        </main>
      </div>

      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {editingPost ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
            <DialogDescription>{editingPost ? "Update the blog post details" : "Fill in the details for your new blog post"}</DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="edit" className="gap-2"><Edit className="w-4 h-4" />Edit</TabsTrigger>
              <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" />Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Title *</Label>
                <Input id="title" placeholder="Enter an engaging post title" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})} className="text-lg font-semibold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-base">Excerpt *</Label>
                <Textarea id="excerpt" placeholder="Write a compelling brief description (shown in cards)" value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows={3} />
                <p className="text-xs text-muted-foreground">{formData.excerpt.length} characters</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base flex items-center justify-between">
                  <span>Content * (Markdown supported)</span>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAutoEstimate} className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />Auto-estimate read time
                  </Button>
                </Label>
                <Textarea id="content" placeholder="Write your blog post content here... You can use Markdown formatting!"
                  value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={12} className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">{formData.content.split(/\s+/).filter(w => w).length} words</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="flex items-center gap-2"><Tag className="w-4 h-4" />Tags (comma-separated)</Label>
                  <Input id="tags" placeholder="React, TypeScript, Tutorial" value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readTime" className="flex items-center gap-2"><Clock className="w-4 h-4" />Read Time</Label>
                  <Input id="readTime" placeholder="e.g., 5 min read" value={formData.readTime}
                    onChange={(e) => setFormData({...formData, readTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2"><ImageIcon className="w-4 h-4" />Featured Image URL</Label>
                <Input id="image" placeholder="https://images.unsplash.com/..." value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})} />
                {formData.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 overflow-y-auto pr-2">
              <Card className="border-2">
                {formData.image && (
                  <div className="relative h-64 overflow-hidden">
                    <img src={formData.image} alt={formData.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag).map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <CardTitle className="text-3xl">{formData.title || "Untitled Post"}</CardTitle>
                  <CardDescription className="text-base">{formData.excerpt || "No excerpt provided"}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date().toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{formData.readTime || "N/A"}</span></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{formData.content || "No content yet..."}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={handleCancel} className="gap-2"><X className="w-4 h-4" />Cancel</Button>
            <Button onClick={handleSave} className="gap-2" size="lg">
              <Save className="w-4 h-4" />{editingPost ? "Update" : "Create"} Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the blog post.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminBlog;
