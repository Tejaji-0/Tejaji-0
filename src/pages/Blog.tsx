import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScrollProgress from "@/components/animations/ScrollProgress";
import CursorTrail from "@/components/animations/CursorTrail";
import { blogPosts } from "@/data/blogPosts";
import { useState } from "react";

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? blogPosts.filter(post => post.tags.includes(selectedTag))
    : blogPosts;

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
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Insights, tutorials, and thoughts on web development, design, and technology
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
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription>{post.excerpt}</CardDescription>
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
