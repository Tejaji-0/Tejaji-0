# CLI Game Feature 🎮

A retro terminal-style gaming experience built into the website with multiple interactive games.

## Features

### 🎯 Available Games

1. **Number Guessing Game**
   - Guess a random number between 1 and 100
   - Receive hints (too high/too low)
   - Score based on number of attempts
   - Command: `play number`

2. **Programming Trivia**
   - Test your programming knowledge
   - Multiple choice questions about web development
   - Hint system available
   - Command: `play trivia`

3. **Text Adventure**
   - Navigate through a dungeon
   - Collect items and find treasure
   - Room-based exploration
   - Command: `play adventure`

### 💻 CLI Commands

- `help` - Display available commands
- `clear` - Clear the terminal screen
- `games` - List all available games
- `play [game]` - Start a specific game (number, trivia, adventure)
- `score` - View your current score
- `menu` - Return to main menu
- `hint` - Get a hint (in trivia game)
- `look` - Examine your surroundings (in adventure game)
- `inventory` - Check your items (in adventure game)
- `take [item]` - Pick up an item (in adventure game)
- `north/south/east/west` - Move in directions (in adventure game)

## Access

- Main website: Click "Play Games" button on the hero section
- Direct URL: `/games` or `/cli-game`

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

## Game States

The CLI maintains different game states:
- `menu` - Main menu with command help
- `number-guess` - Active number guessing game
- `trivia` - Active trivia game
- `adventure` - Active text adventure game

## Scoring System

- Number Guess: 100 points - (5 × attempts)
- Trivia: 50 points per correct answer
- Adventure: 200 points for completing the game

## Styling

The terminal features:
- Green monospace text on black background
- Retro terminal window decorations
- Smooth message animations
- Color-coded message types (system, user, error, success)
- Auto-scrolling to latest messages
- Persistent score display

## Future Enhancements

Potential additions:
- More game types (hangman, word search, etc.)
- Leaderboard system
- Multiplayer capabilities
- Save/load game progress
- More complex adventure storylines
- Sound effects
- Achievements system

## Development

The game is composed of:
- `src/components/CLIGame.tsx` - Main game component
- `src/pages/CLIGamePage.tsx` - Dedicated game page
- Integrated with React Router for navigation

Enjoy the retro gaming experience! 🕹️
