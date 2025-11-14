import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Home, Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScrollProgress from "@/components/animations/ScrollProgress";
import CursorTrail from "@/components/animations/CursorTrail";
import { blogPosts } from "@/data/blogPosts";
import { useState, useEffect, useRef, useCallback } from "react";

const POSTS_PER_STACK = 12; // Load 12 posts per stack

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadedStacks, setLoadedStacks] = useState(1); // Start with 1 stack
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  // Filter posts by selected tag
  const allFilteredPosts = selectedTag
    ? blogPosts.filter(post => post.tags.includes(selectedTag))
    : blogPosts;

  // Get currently loaded posts (based on stacks)
  const filteredPosts = allFilteredPosts.slice(0, loadedStacks * POSTS_PER_STACK);
  const hasMore = filteredPosts.length < allFilteredPosts.length;
  const totalPosts = allFilteredPosts.length;

  // Reset stacks when tag changes
  useEffect(() => {
    setLoadedStacks(1);
  }, [selectedTag]);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setLoadedStacks(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
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

  return (
    <>
      <ScrollProgress />
      <CursorTrail />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Blog</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </header>

        <main className="container px-4 md:px-6 py-12 max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Blog Posts
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-4">
              Insights, tutorials, and thoughts on web development, design, and technology
            </p>
            <p className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {totalPosts} posts
            </p>
          </motion.div>

          {/* Tags Filter */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              All Posts
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </motion.div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <Link to={`/blog/${post.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
                      {post.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="group/btn">
                          Read More 
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Section */}
          <div ref={loadMoreRef} className="mt-12 text-center">
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-muted-foreground"
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
                Load More Posts
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}

            {!hasMore && filteredPosts.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground"
              >
                🎉 You've reached the end! All {totalPosts} posts loaded.
              </motion.p>
            )}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground text-lg">
                No posts found with the selected tag.
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default Blog;
