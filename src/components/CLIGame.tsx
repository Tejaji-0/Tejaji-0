import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Message {
  text: string;
  type: "system" | "user" | "error" | "success" | "warning" | "info" | "achievement";
  timestamp?: Date;
}

type GameState = "menu" | "number-guess" | "trivia" | "adventure" | "math-quiz" | "hangman" | "snake" | "rps" | "memory";

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  error: string;
  success: string;
  warning: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Stats {
  gamesPlayed: number;
  totalScore: number;
  highScores: Record<string, number>;
  achievements: Achievement[];
}

const CLIGame = () => {
  // Color Palettes
  const colorPalettes: ColorPalette[] = [
    {
      name: "Matrix",
      primary: "text-green-400",
      secondary: "text-green-600",
      accent: "text-green-300",
      bg: "bg-black",
      error: "text-red-400",
      success: "text-green-300",
      warning: "text-yellow-400",
    },
    {
      name: "Cyberpunk",
      primary: "text-cyan-400",
      secondary: "text-pink-600",
      accent: "text-pink-400",
      bg: "bg-purple-950",
      error: "text-red-400",
      success: "text-cyan-300",
      warning: "text-yellow-300",
    },
    {
      name: "Retro",
      primary: "text-orange-400",
      secondary: "text-amber-600",
      accent: "text-yellow-300",
      bg: "bg-slate-900",
      error: "text-red-400",
      success: "text-lime-400",
      warning: "text-yellow-400",
    },
    {
      name: "Ocean",
      primary: "text-blue-400",
      secondary: "text-teal-600",
      accent: "text-cyan-300",
      bg: "bg-slate-950",
      error: "text-red-400",
      success: "text-emerald-400",
      warning: "text-amber-400",
    },
    {
      name: "Sunset",
      primary: "text-rose-400",
      secondary: "text-purple-600",
      accent: "text-pink-300",
      bg: "bg-gray-900",
      error: "text-red-500",
      success: "text-green-400",
      warning: "text-orange-400",
    },
    {
      name: "Hacker",
      primary: "text-lime-400",
      secondary: "text-emerald-700",
      accent: "text-green-300",
      bg: "bg-black",
      error: "text-red-400",
      success: "text-lime-300",
      warning: "text-yellow-400",
    },
  ];

  const [currentPalette, setCurrentPalette] = useState(0);
  const palette = colorPalettes[currentPalette];

  const initialAchievements: Achievement[] = [
    { id: "first-game", name: "First Steps", description: "Play your first game", icon: "🎮", unlocked: false },
    { id: "score-100", name: "Century", description: "Score 100 points", icon: "💯", unlocked: false },
    { id: "score-500", name: "High Roller", description: "Score 500 points", icon: "🎰", unlocked: false },
    { id: "perfect-guess", name: "Mind Reader", description: "Guess the number in 1 try", icon: "🧠", unlocked: false },
    { id: "trivia-master", name: "Trivia Master", description: "Answer 5 trivia questions correctly", icon: "🎓", unlocked: false },
    { id: "explorer", name: "Explorer", description: "Complete the adventure game", icon: "🗺️", unlocked: false },
    { id: "palette-fan", name: "Colorful", description: "Try all color palettes", icon: "🎨", unlocked: false },
    { id: "speed-demon", name: "Speed Demon", description: "Complete any game in under 30 seconds", icon: "⚡", unlocked: false },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { text: "╔══════════════════════════════════════════════╗", type: "system" },
    { text: "║   🎮 ULTIMATE TERMINAL GAMES v2.0 🎮        ║", type: "system" },
    { text: "╚══════════════════════════════════════════════╝", type: "system" },
    { text: "", type: "system" },
    { text: "Type 'help' for commands or 'games' to start playing!", type: "info" },
  ]);
  const [input, setInput] = useState("");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [secretNumber, setSecretNumber] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    totalScore: 0,
    highScores: {},
    achievements: initialAchievements,
  });
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [triviaCorrectCount, setTriviaCorrectCount] = useState(0);
  const [palettesViewed, setPalettesViewed] = useState<Set<number>>(new Set([0]));
  
  const [adventureState, setAdventureState] = useState({
    room: "start",
    inventory: [] as string[],
    health: 100,
  });
  
  // Hangman state
  const [hangmanWord, setHangmanWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  
  // Math quiz state
  const [mathQuestion, setMathQuestion] = useState({ question: "", answer: 0 });
  const [mathStreak, setMathStreak] = useState(0);
  
  // Rock Paper Scissors state
  const [rpsWins, setRpsWins] = useState(0);
  const [rpsLosses, setRpsLosses] = useState(0);
  
  // Snake game state
  const [snake, setSnake] = useState<{x: number, y: number}[]>([{x: 5, y: 5}]);
  const [food, setFood] = useState({x: 10, y: 10});
  const [direction, setDirection] = useState("right");
  const [snakeGameActive, setSnakeGameActive] = useState(false);
  
  // Memory game state
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  
  // Command history
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, type: Message["type"] = "system") => {
    setMessages((prev) => [...prev, { text, type, timestamp: new Date() }]);
  };

  const unlockAchievement = (id: string) => {
    setStats((prev) => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        addMessage(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.icon} ${achievement.name}`, "achievement");
        addMessage(`   ${achievement.description}`, "achievement");
        return {
          ...prev,
          achievements: [...prev.achievements],
        };
      }
      return prev;
    });
  };

  const updateScore = (points: number) => {
    const newScore = score + points;
    setScore(newScore);
    setStats(prev => ({ ...prev, totalScore: prev.totalScore + points }));
    
    if (newScore >= 100 && !stats.achievements.find(a => a.id === "score-100")?.unlocked) {
      unlockAchievement("score-100");
    }
    if (newScore >= 500 && !stats.achievements.find(a => a.id === "score-500")?.unlocked) {
      unlockAchievement("score-500");
    }
  };

  const checkSpeedAchievement = () => {
    if (gameStartTime) {
      const elapsed = (new Date().getTime() - gameStartTime.getTime()) / 1000;
      if (elapsed < 30) {
        unlockAchievement("speed-demon");
      }
    }
  };

  const changePalette = (paletteIndex?: number) => {
    const newIndex = paletteIndex !== undefined ? paletteIndex : (currentPalette + 1) % colorPalettes.length;
    setCurrentPalette(newIndex);
    setPalettesViewed(prev => new Set([...prev, newIndex]));
    
    if (palettesViewed.size >= colorPalettes.length - 1) {
      unlockAchievement("palette-fan");
    }
    
    addMessage(`🎨 Color palette changed to: ${colorPalettes[newIndex].name}`, "success");
  };

  const startNumberGuess = () => {
    const num = Math.floor(Math.random() * 100) + 1;
    setSecretNumber(num);
    setAttempts(0);
    setGameState("number-guess");
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    if (stats.gamesPlayed === 0) {
      unlockAchievement("first-game");
    }
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🎲 NUMBER GUESSING GAME 🎲      ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("I'm thinking of a number between 1 and 100.", "info");
    addMessage("Can you guess it? (Type 'menu' to return)", "info");
  };

  const startMathQuiz = () => {
    setGameState("math-quiz");
    setMathStreak(0);
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🧮 MATH QUIZ CHALLENGE 🧮       ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("Solve math problems as fast as you can!", "info");
    generateMathQuestion();
  };

  const generateMathQuestion = () => {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    if (op === '*') {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
    } else {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      if (op === '+') {
        answer = num1 + num2;
      } else {
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
      }
    }
    
    setMathQuestion({ question: `${num1} ${op} ${num2}`, answer });
    addMessage(`❓ What is ${num1} ${op} ${num2}?`, "info");
  };

  const startHangman = () => {
    const words = ["JAVASCRIPT", "PYTHON", "DEVELOPER", "ALGORITHM", "FUNCTION", "VARIABLE", "COMPUTER", "TERMINAL", "KEYBOARD", "PROGRAMMING"];
    const word = words[Math.floor(Math.random() * words.length)];
    setHangmanWord(word);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameState("hangman");
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🎯 HANGMAN GAME 🎯              ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("Guess the word one letter at a time!", "info");
    addMessage("You have 6 wrong guesses before you lose.", "warning");
    displayHangman();
  };

  const displayHangman = () => {
    const stages = [
      "  +---+\n      |\n      |\n      |\n     ===",
      "  +---+\n  O   |\n      |\n      |\n     ===",
      "  +---+\n  O   |\n  |   |\n      |\n     ===",
      "  +---+\n  O   |\n /|   |\n      |\n     ===",
      "  +---+\n  O   |\n /|\\  |\n      |\n     ===",
      "  +---+\n  O   |\n /|\\  |\n /    |\n     ===",
      "  +---+\n  O   |\n /|\\  |\n / \\  |\n     ==="
    ];
    
    addMessage(stages[wrongGuesses], "system");
    
    const display = hangmanWord
      .split('')
      .map(letter => guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
    
    addMessage(`Word: ${display}`, "info");
    addMessage(`Guessed: ${guessedLetters.join(', ') || 'none'}`, "system");
  };

  const startRockPaperScissors = () => {
    setGameState("rps");
    setRpsWins(0);
    setRpsLosses(0);
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  ✊✋✌️ ROCK PAPER SCISSORS ✊✋✌️   ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("Best of 5! Type: rock, paper, or scissors", "info");
  };

  const startMemoryGame = () => {
    setGameState("memory");
    setMemoryLevel(1);
    setMemoryInput([]);
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🧠 MEMORY SEQUENCE GAME 🧠      ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("Memorize the sequence and repeat it!", "info");
    
    generateMemorySequence(1);
  };

  const generateMemorySequence = (level: number) => {
    const sequence = Array.from({ length: level + 2 }, () => Math.floor(Math.random() * 9) + 1);
    setMemorySequence(sequence);
    setMemoryInput([]);
    
    addMessage(`🎯 Level ${level}`, "info");
    addMessage(`Sequence: ${sequence.join(' ')}`, "warning");
    addMessage("(Memorize it! Type the numbers separated by spaces)", "system");
  };

  const startTrivia = () => {
    setGameState("trivia");
    setTriviaCorrectCount(0);
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🎓 TRIVIA CHALLENGE 🎓          ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("Answer programming questions! Type 'hint' for help.", "info");
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
    {
      question: "What does API stand for?",
      answer: "application programming interface",
      hints: ["programming", "interface", "application"],
    },
    {
      question: "What language is React based on?",
      answer: "javascript",
      hints: ["web", "scripting", "JS"],
    },
    {
      question: "What does SQL stand for?",
      answer: "structured query language",
      hints: ["database", "query", "structured"],
    },
    {
      question: "Who created Python?",
      answer: "guido van rossum",
      hints: ["Netherlands", "Benevolent Dictator", "snake"],
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
    setGameStartTime(new Date());
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    
    addMessage("╔═══════════════════════════════════╗", "system");
    addMessage("║  🗺️  TEXT ADVENTURE 🗺️           ║", "system");
    addMessage("╚═══════════════════════════════════╝", "system");
    addMessage("You wake up in a dark dungeon...", "info");
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
      addMessage("╔════════════════ COMMANDS ════════════════╗", "system");
      addMessage("║  help      - Show this help message     ║", "system");
      addMessage("║  clear     - Clear the terminal         ║", "system");
      addMessage("║  games     - List available games       ║", "system");
      addMessage("║  play [game] - Start a game             ║", "system");
      addMessage("║  score     - Show your score            ║", "system");
      addMessage("║  stats     - Show detailed statistics   ║", "system");
      addMessage("║  achievements - View achievements       ║", "system");
      addMessage("║  palette   - Change color theme         ║", "system");
      addMessage("║  palettes  - List all color palettes    ║", "system");
      addMessage("║  menu      - Return to main menu        ║", "system");
      addMessage("║  about     - About this game            ║", "system");
      addMessage("╚══════════════════════════════════════════╝", "system");
      return;
    }

    if (command === "clear") {
      setMessages([]);
      addMessage("Terminal cleared. Type 'help' for commands.", "info");
      return;
    }

    if (command === "games") {
      addMessage("╔════════════ AVAILABLE GAMES ═════════════╗", "system");
      addMessage("║  🎲 number    - Number guessing game     ║", "system");
      addMessage("║  🎓 trivia    - Programming trivia       ║", "system");
      addMessage("║  🗺️  adventure - Text adventure game     ║", "system");
      addMessage("║  🧮 math      - Math quiz challenge      ║", "system");
      addMessage("║  🎯 hangman   - Classic hangman          ║", "system");
      addMessage("║  ✊ rps       - Rock Paper Scissors      ║", "system");
      addMessage("║  🧠 memory    - Memory sequence game     ║", "system");
      addMessage("╚══════════════════════════════════════════╝", "system");
      addMessage("Type 'play [game]' to start (e.g., 'play number')", "info");
      return;
    }

    if (command === "score") {
      addMessage(`┌─────────────────────────────┐`, "system");
      addMessage(`│  💰 Current Score: ${score.toString().padStart(6)} │`, "success");
      addMessage(`│  🏆 Total Score:   ${stats.totalScore.toString().padStart(6)} │`, "success");
      addMessage(`│  🎮 Games Played:  ${stats.gamesPlayed.toString().padStart(6)} │`, "info");
      addMessage(`└─────────────────────────────┘`, "system");
      return;
    }

    if (command === "stats") {
      addMessage("╔════════════ STATISTICS ══════════════════╗", "system");
      addMessage(`║  Current Score:      ${score.toString().padStart(8)}         ║`, "success");
      addMessage(`║  Total Score:        ${stats.totalScore.toString().padStart(8)}         ║`, "success");
      addMessage(`║  Games Played:       ${stats.gamesPlayed.toString().padStart(8)}         ║`, "info");
      addMessage(`║  Achievements:       ${stats.achievements.filter(a => a.unlocked).length}/${stats.achievements.length}          ║`, "info");
      addMessage(`║  Current Palette:    ${colorPalettes[currentPalette].name.padEnd(8)}     ║`, "info");
      addMessage("╚══════════════════════════════════════════╝", "system");
      return;
    }

    if (command === "achievements") {
      addMessage("╔════════════ ACHIEVEMENTS ════════════════╗", "system");
      stats.achievements.forEach(ach => {
        const status = ach.unlocked ? "✅" : "🔒";
        addMessage(`${status} ${ach.icon} ${ach.name}`, ach.unlocked ? "success" : "system");
        addMessage(`   ${ach.description}`, "system");
      });
      addMessage("╚══════════════════════════════════════════╝", "system");
      return;
    }

    if (command === "palette" || command === "theme") {
      changePalette();
      return;
    }

    if (command === "palettes") {
      addMessage("╔════════════ COLOR PALETTES ══════════════╗", "system");
      colorPalettes.forEach((pal, idx) => {
        const current = idx === currentPalette ? "👉" : "  ";
        addMessage(`${current} ${idx + 1}. ${pal.name}`, "info");
      });
      addMessage("╚══════════════════════════════════════════╝", "system");
      addMessage("Type 'palette' to cycle or 'play [number]' to select", "system");
      return;
    }

    if (command.startsWith("palette ")) {
      const num = parseInt(command.substring(8));
      if (num > 0 && num <= colorPalettes.length) {
        changePalette(num - 1);
      } else {
        addMessage("Invalid palette number. Type 'palettes' to see available options.", "error");
      }
      return;
    }

    if (command === "about") {
      addMessage("╔════════════════════════════════════════════╗", "system");
      addMessage("║  🎮 ULTIMATE TERMINAL GAMES v2.0 🎮       ║", "system");
      addMessage("║                                            ║", "system");
      addMessage("║  A collection of fun CLI games with:      ║", "system");
      addMessage("║  • Multiple color themes                  ║", "system");
      addMessage("║  • Achievement system                     ║", "system");
      addMessage("║  • Statistics tracking                    ║", "system");
      addMessage("║  • 7 different games to play!             ║", "system");
      addMessage("║                                            ║", "system");
      addMessage("║  Made with ❤️ and TypeScript              ║", "system");
      addMessage("╚════════════════════════════════════════════╝", "system");
      return;
    }

    if (command === "menu") {
      setGameState("menu");
      addMessage("Returned to main menu. Type 'games' to see available games.", "info");
      return;
    }

    if (command.startsWith("play ")) {
      const game = command.substring(5).trim();
      if (game === "number") {
        startNumberGuess();
      } else if (game === "trivia") {
        startTrivia();
      } else if (game === "adventure") {
        startAdventure();
      } else if (game === "math") {
        startMathQuiz();
      } else if (game === "hangman") {
        startHangman();
      } else if (game === "rps") {
        startRockPaperScissors();
      } else if (game === "memory") {
        startMemoryGame();
      } else if (!isNaN(parseInt(game))) {
        changePalette(parseInt(game) - 1);
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
        updateScore(points);
        addMessage(`🎉 Correct! You guessed it in ${attempts + 1} attempts!`, "success");
        addMessage(`+${points} points! Total score: ${score + points}`, "success");
        
        if (attempts === 0) {
          unlockAchievement("perfect-guess");
        }
        
        checkSpeedAchievement();
        setGameState("menu");
        addMessage("Type 'play number' to play again!", "info");
      } else if (guess < secretNumber) {
        addMessage("📈 Too low! Try a higher number.", "warning");
      } else {
        addMessage("📉 Too high! Try a lower number.", "warning");
      }
      return;
    }

    if (gameState === "math-quiz") {
      const answer = parseInt(command);
      if (isNaN(answer)) {
        addMessage("Please enter a valid number!", "error");
        return;
      }

      if (answer === mathQuestion.answer) {
        const streak = mathStreak + 1;
        setMathStreak(streak);
        const points = 20 + (streak * 5);
        updateScore(points);
        addMessage(`✅ Correct! Streak: ${streak}x`, "success");
        addMessage(`+${points} points!`, "success");
        generateMathQuestion();
      } else {
        addMessage(`❌ Wrong! The answer was ${mathQuestion.answer}`, "error");
        addMessage(`Your streak was: ${mathStreak}`, "warning");
        setMathStreak(0);
        checkSpeedAchievement();
        setGameState("menu");
        addMessage("Type 'play math' to try again!", "info");
      }
      return;
    }

    if (gameState === "hangman") {
      if (command.length === 1 && /[a-z]/.test(command)) {
        const letter = command.toUpperCase();
        
        if (guessedLetters.includes(letter)) {
          addMessage("You already guessed that letter!", "warning");
          return;
        }

        setGuessedLetters(prev => [...prev, letter]);

        if (hangmanWord.includes(letter)) {
          addMessage(`✅ Good guess! '${letter}' is in the word!`, "success");
          
          const newGuessed = [...guessedLetters, letter];
          const won = hangmanWord.split('').every(l => newGuessed.includes(l));
          
          if (won) {
            const points = 100 - (wrongGuesses * 10);
            updateScore(points);
            addMessage(`🎉 You won! The word was ${hangmanWord}!`, "success");
            addMessage(`+${points} points!`, "success");
            checkSpeedAchievement();
            setGameState("menu");
            return;
          }
        } else {
          const newWrong = wrongGuesses + 1;
          setWrongGuesses(newWrong);
          addMessage(`❌ '${letter}' is not in the word!`, "error");
          
          if (newWrong >= 6) {
            addMessage(`� Game Over! The word was ${hangmanWord}`, "error");
            setGameState("menu");
            return;
          }
        }
        
        setTimeout(() => displayHangman(), 100);
      } else {
        addMessage("Please enter a single letter (a-z)", "error");
      }
      return;
    }

    if (gameState === "rps") {
      const choices = ["rock", "paper", "scissors"];
      if (!choices.includes(command)) {
        addMessage("Invalid choice! Type: rock, paper, or scissors", "error");
        return;
      }

      const computerChoice = choices[Math.floor(Math.random() * 3)];
      const emojis: Record<string, string> = { rock: "✊", paper: "✋", scissors: "✌️" };
      
      addMessage(`You chose: ${emojis[command]} ${command}`, "info");
      addMessage(`Computer chose: ${emojis[computerChoice]} ${computerChoice}`, "info");

      let result = "";
      if (command === computerChoice) {
        result = "It's a tie!";
        addMessage(result, "warning");
      } else if (
        (command === "rock" && computerChoice === "scissors") ||
        (command === "paper" && computerChoice === "rock") ||
        (command === "scissors" && computerChoice === "paper")
      ) {
        setRpsWins(prev => prev + 1);
        result = "You win this round!";
        addMessage(result, "success");
        updateScore(30);
      } else {
        setRpsLosses(prev => prev + 1);
        result = "Computer wins this round!";
        addMessage(result, "error");
      }

      const totalGames = rpsWins + rpsLosses + (result.includes("tie") ? 0 : 1);
      const currentWins = rpsWins + (result.includes("You win") ? 1 : 0);
      const currentLosses = rpsLosses + (result.includes("Computer wins") ? 1 : 0);
      
      addMessage(`Score - You: ${currentWins} | Computer: ${currentLosses}`, "info");

      if (currentWins >= 3) {
        addMessage("🏆 You won the best of 5!", "success");
        updateScore(100);
        checkSpeedAchievement();
        setGameState("menu");
      } else if (currentLosses >= 3) {
        addMessage("😔 Computer won the best of 5!", "error");
        setGameState("menu");
      }
      return;
    }

    if (gameState === "memory") {
      const numbers = command.split(/\s+/).map(n => parseInt(n));
      
      if (numbers.some(isNaN)) {
        addMessage("Please enter numbers separated by spaces!", "error");
        return;
      }

      if (numbers.length !== memorySequence.length) {
        addMessage(`Wrong length! The sequence had ${memorySequence.length} numbers.`, "error");
        addMessage(`The sequence was: ${memorySequence.join(' ')}`, "warning");
        setGameState("menu");
        return;
      }

      const correct = numbers.every((num, idx) => num === memorySequence[idx]);
      
      if (correct) {
        const points = 50 * memoryLevel;
        updateScore(points);
        addMessage(`✅ Perfect! Level ${memoryLevel} complete!`, "success");
        addMessage(`+${points} points!`, "success");
        
        const nextLevel = memoryLevel + 1;
        setMemoryLevel(nextLevel);
        
        if (nextLevel > 5) {
          addMessage("🎉 You're a memory master!", "success");
          checkSpeedAchievement();
          setGameState("menu");
        } else {
          setTimeout(() => generateMemorySequence(nextLevel), 1000);
        }
      } else {
        addMessage(`❌ Wrong sequence!`, "error");
        addMessage(`Correct was: ${memorySequence.join(' ')}`, "warning");
        addMessage(`You entered: ${numbers.join(' ')}`, "error");
        setGameState("menu");
      }
      return;
    }

    if (gameState === "trivia") {
      const q = triviaQuestions[currentQuestion % triviaQuestions.length];
      if (command === q.answer) {
        addMessage("✅ Correct!", "success");
        const newCount = triviaCorrectCount + 1;
        setTriviaCorrectCount(newCount);
        updateScore(50);
        setCurrentQuestion((prev) => prev + 1);
        addMessage(`+50 points! Total score: ${score + 50}`, "success");
        
        if (newCount >= 5) {
          unlockAchievement("trivia-master");
        }
        
        if (newCount >= triviaQuestions.length) {
          addMessage("🎉 You've answered all questions!", "success");
          checkSpeedAchievement();
          setGameState("menu");
        } else {
          setTimeout(() => askTriviaQuestion(), 500);
        }
      } else if (command === "hint") {
        const hint = q.hints[Math.floor(Math.random() * q.hints.length)];
        addMessage(`💡 Hint: ${hint}`, "info");
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
          addMessage(`Inventory: ${adventureState.inventory.join(", ")}`, "info");
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
          updateScore(200);
          addMessage("🏆 YOU WIN! +200 points!", "success");
          unlockAchievement("explorer");
          checkSpeedAchievement();
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
        addMessage("Unknown command. Try: north, south, east, west, look, inventory, take", "error");
      }
      return;
    }

    addMessage(`Unknown command: ${command}. Type 'help' for available commands.`, "error");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Add to command history
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      
      handleCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      <Card className={`${palette.bg}/95 backdrop-blur-sm border-2 border-${palette.primary.replace('text-', '')}/30 overflow-hidden shadow-2xl`}>
        <div className={`p-4 ${palette.primary.replace('text-', 'bg-')}/10 border-b-2 border-${palette.primary.replace('text-', '')}/30 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full bg-red-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <motion.div 
              className="w-3 h-3 rounded-full bg-yellow-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            ></motion.div>
            <motion.div 
              className="w-3 h-3 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            ></motion.div>
          </div>
          <span className={`${palette.primary} text-sm font-mono font-bold tracking-wider`}>
            🎮 {colorPalettes[currentPalette].name} Terminal
          </span>
          <div className="flex items-center gap-4">
            <span className={`${palette.accent} text-xs font-mono`}>
              💰 {score}
            </span>
            <span className={`${palette.secondary} text-xs font-mono`}>
              🏆 {stats.achievements.filter(a => a.unlocked).length}/{stats.achievements.length}
            </span>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-current scrollbar-track-transparent">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className={`mb-2 ${
                  msg.type === "user"
                    ? `${palette.accent} font-bold`
                    : msg.type === "error"
                    ? `${palette.error} animate-pulse`
                    : msg.type === "success"
                    ? `${palette.success} font-semibold`
                    : msg.type === "warning"
                    ? `${palette.warning}`
                    : msg.type === "achievement"
                    ? `${palette.accent} font-bold text-lg animate-bounce`
                    : msg.type === "info"
                    ? `${palette.accent}`
                    : palette.primary
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={`p-4 border-t-2 border-${palette.primary.replace('text-', '')}/30 ${palette.primary.replace('text-', 'bg-')}/5`}>
          <div className="flex items-center gap-2">
            <motion.span 
              className={`${palette.success} font-mono font-bold text-lg`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▶
            </motion.span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent ${palette.primary} font-mono outline-none placeholder-${palette.secondary.replace('text-', '')} text-lg focus:scale-[1.01] transition-transform`}
              placeholder="Type a command..."
              autoFocus
            />
          </div>
        </form>
      </Card>

      <motion.div 
        className="mt-6 text-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`${palette.primary} font-mono space-y-2`}>
          <p className="flex items-center justify-center gap-4 flex-wrap">
            <span className={palette.accent}>💡 Quick start:</span>
            <code className={`${palette.success} px-2 py-1 rounded ${palette.primary.replace('text-', 'bg-')}/10`}>help</code>
            <code className={`${palette.success} px-2 py-1 rounded ${palette.primary.replace('text-', 'bg-')}/10`}>games</code>
            <code className={`${palette.success} px-2 py-1 rounded ${palette.primary.replace('text-', 'bg-')}/10`}>palette</code>
          </p>
          <p className={palette.secondary}>
            Current theme: <span className={palette.accent}>{colorPalettes[currentPalette].name}</span> • 
            Press <code className={`${palette.accent} px-1`}>palette</code> to change
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CLIGame;
