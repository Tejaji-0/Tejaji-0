import { motion } from "framer-motion";

const VideoReplit = () => {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold mb-6 text-center">Video: Replit</h1>

        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <iframe
            title="Replit Video"
            src="https://www.youtube.com/embed/BlKHb8ASSh0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-md shadow-lg"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Original video: <a href="https://www.youtube.com/watch?v=BlKHb8ASSh0" className="underline text-blue-500">YouTube link</a>
        </p>
      </div>
    </motion.div>
  );
};

export default VideoReplit;
