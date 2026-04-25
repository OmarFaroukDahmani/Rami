Rami — Tunisian Card Game (Web App)

A high-quality, modern web implementation of Rami (رامي) — the popular Tunisian/Mediterranean card game.
Designed for smooth gameplay, elegant visuals, and a near real-life card table experience.

Built with performance and UX in mind using Next.js, Zustand, and Framer Motion.

✨ Highlights
🎨 Premium UI/UX
Dark mode interface with glassmorphism effects, smooth animations, and clean typography.
⚡ Ultra-Smooth Gameplay
Instant interactions, zero-lag card movement, and optimized rendering.
🤖 Smart Bot AI
Play solo against bots that respect real Rami rules and make strategic decisions.
🧩 Advanced Build Mode
Organize, test, and validate your melds before committing — like playing on a real table.
📊 Live Validation & Scoring
Real-time feedback on meld validity and point calculation.
📱 Fully Responsive
Seamless experience across desktop, tablet, and mobile.
🧠 Game Overview

Rami is a strategic card game where players aim to organize their hand into valid combinations (melds) and be the first to finish.

📜 Rules (Simplified)
🎯 Objective

Form valid melds and empty your hand by playing all your cards.

🔄 Turn Flow
Draw
Pick one card from:
🂠 Stock pile (face-down), or
🂡 Discard pile (face-up)
⚠️ You can only take from discard if you can immediately use it
Build (Optional)
Lay down cards if you meet the Frash conditions
Discard
End your turn by discarding one card
❌ You cannot discard a Joker
🧩 Valid Melds
Sets (Groups)
3–4 cards of the same rank, different suits

Sequences
3+ consecutive cards of the same suit

Rules:

Ace can be:
Low → A-2-3
High → J-Q-K-A
❌ K-A-2 is invalid
Joker
Can replace any card in a meld
🏁 First Play (Frash)

To place your cards on the table for the first time:

✅ Reach 51 or 71 points (room setting)
✅ Include at least one valid sequence
💯 Scoring
Card	Value
Ace	1
Also Ace can be 10 when is after J Q K or In a Aces groupe 
J, Q, K	10
2 – 10	Face value
Joker	Variable
🎮 Controls
🛠 Build Mode
Redesbuit (Frich) — Round Reset System

The game includes a Redesbuit (also called “Frich”) feature:

A player can request a Redesbuit (round reset)
🗳️ All players must vote to accept it
✅ The reset only happens if everyone agrees
❌ If one player refuses, the game continues normally

👉 This feature is useful when:

The round is blocked
Players agree to restart for fairness or strategy
🎮 Controls (Updated)
🛠 Build Mode
Click the Build button (🔨) to enter Build Mode
In this mode, you can safely organize your cards before playing them

Actions inside Build Mode:

Click → Move cards between hand and build area
Drag & Drop → Reorder cards freely
Prepare and validate melds before committing
🔁 Redesbuit Button (Frich)
A dedicated “Redesbuit” button is available in the UI
Pressing it will:
Send a vote request to all players
Trigger a reset only if all players accept
⚡ Quick Actions
Double-click → Discard card (only outside Build Mode)
Click pile → Draw card
Sort button → Auto-organize hand
🧱 Tech Stack
Framework: Next.js 15 (App Router), React 19
State Management: Zustand
Animations: Framer Motion
Drag & Drop: @dnd-kit
Styling: Tailwind CSS
Icons: Lucide React
🚀 Getting Started
# Clone the project
git clone <your-repo-url>

# Install dependencies
npm install

# Start development server
npm run dev

Then open:
👉 http://localhost:3000

🔮 Roadmap

Planned improvements:

🌐 Online multiplayer (real players)
🧑‍🤝‍🧑 Private rooms with friends
🏆 Ranking & leaderboard system
💬 In-game chat
🎵 Sound effects & table ambiance
🇹🇳 Tunisian-specific rule customization