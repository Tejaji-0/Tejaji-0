import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import VideoReplit from "./pages/VideoReplit";
import CLIGamePage from "./pages/CLIGamePage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/video_replit" element={<VideoReplit />} />
          <Route path="/games" element={<CLIGamePage />} />
          <Route path="/cli-game" element={<CLIGamePage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          {/* Redirects to /video_replit */}
          <Route path="/videos_replit" element={<Navigate to="/video_replit" replace />} />
          <Route path="/video" element={<Navigate to="/video_replit" replace />} />
          <Route path="/videos" element={<Navigate to="/video_replit" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
