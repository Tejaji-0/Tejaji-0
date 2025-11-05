import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Message {
  text: string;
  type: "system" | "user" | "error" | "success";
}

type GameState = "menu" | "number-guess" | "trivia" | "adventure";

const CLIGame = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to Terminal Games v1.0", type: "system" },
    { text: "Type 'help' for available commands", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [secretNumber, setSecretNumber] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [adventureState, setAdventureState] = useState({
    room: "start",
    inventory: [] as string[],
    health: 100,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, type: Message["type"] = "system") => {
    setMessages((prev) => [...prev, { text, type }]);
  };

  const startNumberGuess = () => {
    const num = Math.floor(Math.random() * 100) + 1;
    setSecretNumber(num);
    setAttempts(0);
    setGameState("number-guess");
    addMessage("=== NUMBER GUESSING GAME ===", "system");
    addMessage("I'm thinking of a number between 1 and 100.", "system");
    addMessage("Try to guess it! (Type 'menu' to return)", "system");
  };

  const startTrivia = () => {
    setGameState("trivia");
    addMessage("=== TRIVIA GAME ===", "system");
    addMessage("Answer programming questions! (Type 'menu' to return)", "system");
    askTriviaQuestion();
  };

  const triviaQuestions = [
    {
      question: "What does HTML stand for?",
      answer: "hypertext markup language",
      hints: ["markup", "web", "structure"],
    },
    {
      question: "What year was JavaScript created?",
      answer: "1995",
      hints: ["1990s", "before 2000", "Netscape"],
    },
    {
      question: "What does CSS stand for?",
      answer: "cascading style sheets",
      hints: ["styling", "web", "design"],
    },
    {
      question: "Who created Linux?",
      answer: "linus torvalds",
      hints: ["Finnish", "penguin", "kernel"],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const askTriviaQuestion = () => {
    const q = triviaQuestions[currentQuestion % triviaQuestions.length];
    addMessage(`Question: ${q.question}`, "system");
  };

  const startAdventure = () => {
    setGameState("adventure");
    setAdventureState({ room: "start", inventory: [], health: 100 });
    addMessage("=== TEXT ADVENTURE ===", "system");
    addMessage("You wake up in a dark dungeon...", "system");
    addMessage("Commands: north, south, east, west, look, inventory, take [item]", "system");
    describeRoom("start");
  };

  const describeRoom = (room: string) => {
    const rooms: Record<string, { desc: string; exits: string[]; items?: string[] }> = {
      start: {
        desc: "You're in a damp cell. There's a rusty KEY on the floor.",
        exits: ["north"],
        items: ["key"],
      },
      hallway: {
        desc: "A long hallway with torches on the walls. You hear sounds from the east.",
        exits: ["south", "east", "west"],
      },
      treasure: {
        desc: "A room full of gold! You found the TREASURE! You win!",
        exits: ["west"],
      },
      monster: {
        desc: "A fierce monster blocks your path!",
        exits: ["west"],
      },
    };

    const r = rooms[room];
    if (r) {
      addMessage(r.desc, "system");
      addMessage(`Exits: ${r.exits.join(", ")}`, "system");
    }
  };

  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    addMessage(`> ${cmd}`, "user");

    if (command === "help") {
      addMessage("Available commands:", "system");
      addMessage("  help - Show this help message", "system");
      addMessage("  clear - Clear the terminal", "system");
      addMessage("  games - List available games", "system");
      addMessage("  play [game] - Start a game (number, trivia, adventure)", "system");
      addMessage("  score - Show your current score", "system");
      addMessage("  menu - Return to main menu", "system");
      return;
    }

    if (command === "clear") {
      setMessages([]);
      return;
    }

    if (command === "games") {
      addMessage("Available games:", "system");
      addMessage("  1. number - Number guessing game", "system");
      addMessage("  2. trivia - Programming trivia", "system");
      addMessage("  3. adventure - Text adventure", "system");
      addMessage("Type 'play [game]' to start", "system");
      return;
    }

    if (command === "score") {
      addMessage(`Your current score: ${score} points`, "success");
      return;
    }

    if (command === "menu") {
      setGameState("menu");
      addMessage("Returned to main menu. Type 'games' to see available games.", "system");
      return;
    }

    if (command.startsWith("play ")) {
      const game = command.substring(5);
      if (game === "number") {
        startNumberGuess();
      } else if (game === "trivia") {
        startTrivia();
      } else if (game === "adventure") {
        startAdventure();
      } else {
        addMessage(`Unknown game: ${game}. Type 'games' to see available games.`, "error");
      }
      return;
    }

    // Game-specific commands
    if (gameState === "number-guess") {
      const guess = parseInt(command);
      if (isNaN(guess)) {
        addMessage("Please enter a valid number!", "error");
        return;
      }

      setAttempts((prev) => prev + 1);

      if (guess === secretNumber) {
        const points = Math.max(100 - attempts * 5, 10);
        setScore((prev) => prev + points);
        addMessage(`🎉 Correct! You guessed it in ${attempts + 1} attempts!`, "success");
        addMessage(`+${points} points! Total score: ${score + points}`, "success");
        setGameState("menu");
        addMessage("Type 'play number' to play again!", "system");
      } else if (guess < secretNumber) {
        addMessage("📈 Too low! Try higher.", "system");
      } else {
        addMessage("📉 Too high! Try lower.", "system");
      }
      return;
    }

    if (gameState === "trivia") {
      const q = triviaQuestions[currentQuestion % triviaQuestions.length];
      if (command === q.answer) {
        addMessage("✅ Correct!", "success");
        setScore((prev) => prev + 50);
        setCurrentQuestion((prev) => prev + 1);
        addMessage(`+50 points! Total score: ${score + 50}`, "success");
        setTimeout(() => askTriviaQuestion(), 500);
      } else if (command === "hint") {
        const hint = q.hints[Math.floor(Math.random() * q.hints.length)];
        addMessage(`💡 Hint: ${hint}`, "system");
      } else {
        addMessage("❌ Incorrect. Try again or type 'hint' for a clue.", "error");
      }
      return;
    }

    if (gameState === "adventure") {
      if (command === "look") {
        describeRoom(adventureState.room);
      } else if (command === "inventory") {
        if (adventureState.inventory.length === 0) {
          addMessage("Your inventory is empty.", "system");
        } else {
          addMessage(`Inventory: ${adventureState.inventory.join(", ")}`, "system");
        }
      } else if (command.startsWith("take ")) {
        const item = command.substring(5);
        if (adventureState.room === "start" && item === "key") {
          setAdventureState((prev) => ({
            ...prev,
            inventory: [...prev.inventory, "key"],
          }));
          addMessage("You picked up the rusty key.", "success");
        } else {
          addMessage("There's no such item here.", "error");
        }
      } else if (["north", "south", "east", "west"].includes(command)) {
        // Simple room navigation
        if (adventureState.room === "start" && command === "north") {
          setAdventureState((prev) => ({ ...prev, room: "hallway" }));
          describeRoom("hallway");
        } else if (adventureState.room === "hallway" && command === "east") {
          setAdventureState((prev) => ({ ...prev, room: "treasure" }));
          describeRoom("treasure");
          setScore((prev) => prev + 200);
          addMessage("🏆 YOU WIN! +200 points!", "success");
          setGameState("menu");
        } else if (adventureState.room === "hallway" && command === "west") {
          setAdventureState((prev) => ({ ...prev, room: "monster" }));
          describeRoom("monster");
        } else if (adventureState.room === "hallway" && command === "south") {
          setAdventureState((prev) => ({ ...prev, room: "start" }));
          describeRoom("start");
        } else if (command === "west" && ["treasure", "monster"].includes(adventureState.room)) {
          setAdventureState((prev) => ({ ...prev, room: "hallway" }));
          describeRoom("hallway");
        } else {
          addMessage("You can't go that way.", "error");
        }
      } else {
        addMessage("Unknown command. Use: north, south, east, west, look, inventory, take", "error");
      }
      return;
    }

    addMessage(`Unknown command: ${command}. Type 'help' for available commands.`, "error");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      <Card className="bg-black/90 border-green-500/30 overflow-hidden">
        <div className="p-4 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-green-400 text-sm font-mono">Terminal Games</span>
          <span className="text-green-400/50 text-xs font-mono">Score: {score}</span>
        </div>

        <div className="h-96 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`mb-2 ${
                msg.type === "user"
                  ? "text-blue-400"
                  : msg.type === "error"
                  ? "text-red-400"
                  : msg.type === "success"
                  ? "text-green-300"
                  : "text-green-400"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-green-500/30">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-green-400 font-mono outline-none placeholder-green-700"
              placeholder="Type a command..."
              autoFocus
            />
          </div>
        </form>
      </Card>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Try commands: <span className="text-green-400 font-mono">help</span>, <span className="text-green-400 font-mono">games</span>, <span className="text-green-400 font-mono">play number</span></p>
      </div>
    </motion.div>
  );
};

export default CLIGame;
