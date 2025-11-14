import { motion } from "framer-motion";
import CLIGame from "@/components/CLIGame";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import CursorTrail from "@/components/animations/CursorTrail";

const CLIGamePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <CursorTrail />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-400 font-mono">
            🎮 Terminal Games
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        <CLIGame />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-green-400/60 text-sm font-mono"
        >
          <p>Retro terminal gaming experience built with React</p>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default CLIGamePage;
