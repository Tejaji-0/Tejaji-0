import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ScrollProgress from "@/components/animations/ScrollProgress";
import CursorTrail from "@/components/animations/CursorTrail";
import { blogPosts } from "@/data/blogPosts";
import ReactMarkdown from 'react-markdown';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <ScrollProgress />
      <CursorTrail />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4 md:px-6">
            <Link to="/blog">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </header>

        <main className="container px-4 md:px-6 py-12 max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Hero Image */}
            {post.image && (
              <motion.div 
                className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Title */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {post.title}
            </motion.h1>

            {/* Meta Information */}
            <motion.div 
              className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {post.author}</span>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </motion.div>

            <Separator className="mb-8" />

            {/* Content */}
            <motion.div 
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-base prose-p:leading-7 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-primary prose-a:text-primary hover:prose-a:underline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </motion.div>

            <Separator className="my-12" />

            {/* Related Posts CTA */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4">Want to read more?</h3>
              <Link to="/blog">
                <Button size="lg">
                  View All Posts
                </Button>
              </Link>
            </motion.div>
          </motion.article>
        </main>
      </div>
    </>
  );
};

export default BlogPost;
