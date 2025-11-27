# UI/UX Specifications
## Bamboo Panda Battles MVP

---

## 1. Design System

### 1.1 Color Palette

#### Primary Colors
| Color | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | #000000 | #FFFFFF | Buttons, links, emphasis |
| Secondary | #F5F5F5 | #1A1A1A | Backgrounds, cards |
| Accent | #4CAF50 | #81C784 | Success, highlights |

#### Game-Specific Colors
| Panda Type | Color | RGB | Background |
|-----------|-------|-----|-----------|
| **Bamboo** | #000000 | (0, 0, 0) | #F0F0F0 |
| **Red Panda** | #D32F2F | (211, 47, 47) | #FCE4EC |
| **Giant Panda** | #8D6E63 | (141, 110, 99) | #EFEBE9 |
| **Snow Panda** | #81C784 | (129, 199, 132) | #F1F8E9 |

#### Status Colors
| State | Color | Usage |
|-------|-------|-------|
| Success | #4CAF50 | Win, heal, positive |
| Danger | #F44336 | Loss, damage, negative |
| Warning | #FF9800 | Ability cooldown, caution |
| Info | #2196F3 | Stats, information |

### 1.2 Typography

```css
/* Font Stack */
font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Type Scale */
h1: 2.5rem (40px) - 700 weight - Hero titles, screen headers
h2: 2rem (32px) - 700 weight - Section headers
h3: 1.5rem (24px) - 600 weight - Sub-sections
h4: 1.25rem (20px) - 600 weight - Card titles
body: 1rem (16px) - 400 weight - Regular text
small: 0.875rem (14px) - 400 weight - Labels, captions
tiny: 0.75rem (12px) - 400 weight - Help text, metadata
```

### 1.3 Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

// Usage
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### 1.4 Component Shadows & Borders
```css
/* Shadows */
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow-md: 0 4px 6px rgba(0,0,0,0.1)
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)

/* Borders */
border-light: 1px solid #E0E0E0
border-dark: 1px solid #424242
border-radius: 8px (default), 4px (small), 12px (large)
```

### 1.5 Animation & Motion
```css
/* Timing Functions */
ease-in: cubic-bezier(0.4, 0, 1, 1)
ease-out: cubic-bezier(0, 0, 0.2, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

/* Durations */
fast: 100ms
normal: 300ms
slow: 500ms

/* Key Animations */
fade-in: 300ms ease-in
slide-in: 300ms ease-out
scale-in: 200ms ease-in-out
bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 2. Screen Wireframes & Layouts

### 2.1 Home / Landing Screen

**Route:** `/` (or `/app`)  
**Purpose:** Entry point, navigation hub, quick stats

#### Desktop Layout (1920x1080)
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Nav | Theme Toggle | Profile Icon       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │    Welcome back, {PlayerName}!                 │  │
│  │    Your Panda is ready to battle               │  │
│  │                                                 │  │
│  │    [Generate New Panda] [View My Pandas]       │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ Quick Stats    │  │ Recent Battle  │               │
│  │ Wins: 42       │  │ vs Red Panda   │               │
│  │ Win Rate: 64%  │  │ Result: Won +25│               │
│  │ Rating: 1850   │  │ Time: 2 hrs ago│               │
│  └────────────────┘  └────────────────┘               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Featured Content                                 │  │
│  │ [Battle Tutorial] [Top Players] [Leaderboard]  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer: © 2024 Bamboo Panda Battles | Privacy | Help  │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout (375x812)
```
┌──────────────────────┐
│ ☰ | Logo | ⚙️        │
├──────────────────────┤
│                      │
│ Welcome back,        │
│ {PlayerName}!        │
│                      │
│ [Gen Panda] [View]   │
│                      │
├──────────────────────┤
│ Quick Stats          │
│ ├─ Wins: 42         │
│ ├─ Rate: 64%        │
│ └─ Rating: 1850     │
│                      │
├──────────────────────┤
│ Recent Battle        │
│ vs Red Panda         │
│ Won +25 • 2h ago     │
│                      │
├──────────────────────┤
│ [Battle] [Top] [Leaderboard] │
│                      │
└──────────────────────┘
Bottom Nav: ⚔️ | 📋 | 👥 | 👤
```

**Key Components:**
- Welcome message with player name
- Primary CTA: "Battle Now" button
- Quick stats overview (wins, rate, rating)
- Recent battle card
- Navigation links to all screens

---

### 2.2 Panda Generation Screen

**Route:** `/panda-generator`  
**Purpose:** Create new panda with customizable traits

#### Desktop Layout (Two-Column)
```
┌─────────────────────────────────────────────────────────┐
│ Header: Panda Generator                   [Back]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │                  │  │ Form Section             │   │
│  │  Visual Preview  │  │                          │   │
│  │                  │  │ Name: [Input]            │   │
│  │  [Panda SVG]     │  │                          │   │
│  │                  │  │ Type: [Dropdown]         │   │
│  │  Attack: ▮▮▮░░   │  │  □ Bamboo                │   │
│  │  Defense:▮▮▮▮░░  │  │  □ Red Panda (selected) │   │
│  │  Speed:  ▮▮░░░░  │  │  □ Giant Panda          │   │
│  │  Intellect:▮▮▮░░ │  │  □ Snow Panda           │   │
│  │                  │  │                          │   │
│  │  Total HP: 120   │  │ Color Scheme:            │   │
│  │  Base HP: 120    │  │ Primary:   [Color Picker]│   │
│  │                  │  │ Secondary: [Color Picker]│   │
│  │                  │  │ Accent:    [Color Picker]│   │
│  │                  │  │                          │   │
│  │                  │  │ [Randomize] [Save Panda]│   │
│  └──────────────────┘  └──────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌──────────────────────┐
│ ← Panda Generator    │
├──────────────────────┤
│                      │
│   [Panda SVG]        │
│                      │
│ Stats:               │
│ ATK:▮▮▮░ DEF:▮▮▮▮░ │
│ SPD:▮▮░░ INT:▮▮▮░  │
│ HP: 120              │
│                      │
├──────────────────────┤
│ Name: [          ]   │
│ Type: [Red Panda ▼]  │
│ Color 1: [   ]       │
│ Color 2: [   ]       │
│ Color 3: [   ]       │
│                      │
│ [Randomize Attrs]    │
│ [Save Panda]         │
│                      │
└──────────────────────┘
```

**Key Components:**
- Real-time visual preview (SVG panda)
- Stat sliders (Attack, Defense, Speed, Intellect)
- Name input field
- Type selector (4 radio buttons with icons)
- Color pickers (3 primary colors)
- Randomize button
- Save/Create button
- Validation feedback

**Interaction:**
- Stat sliders update preview in real-time
- Type selector changes panda base color
- Color pickers update preview
- "Randomize" generates all random traits
- "Save" validates inputs and creates panda

---

### 2.3 Battle Arena Screen

**Route:** `/battle-arena`  
**Purpose:** Execute turn-based battle

#### Desktop Layout (Full-Screen Battle)
```
┌─────────────────────────────────────────────────────────┐
│ Header: Battle Arena | Opponent: Red Panda | [Forfeit]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Your Panda       │  │ Opponent Panda   │           │
│  │ ==================        ==================           │
│  │ Bamboo Panda     │  │ Red Panda        │           │
│  │ LVL 5            │  │ LVL 3            │           │
│  │                  │  │                  │           │
│  │ [Panda SVG]      │  │ [Panda SVG]      │           │
│  │                  │  │                  │           │
│  │ HP: 110/120      │  │ HP: 85/100       │           │
│  │ ▮▮▮▮▮▮▮▮░░ 92%   │  │ ▮▮▮▮▮▮▮░░░ 85%   │           │
│  │                  │  │                  │           │
│  │ ATK: 72  DEF: 65 │  │ ATK: 68  DEF: 58 │           │
│  │ SPD: 80  INT: 55 │  │ SPD: 75  INT: 62 │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Turn 3 Log                                       │  │
│  │ ─────────────────────────────────────────────    │  │
│  │ Bamboo Panda used Attack! Dealt 25 damage.      │  │
│  │ Red Panda used Defend! Reduced incoming dmg.    │  │
│  │ Bamboo Panda took 12 damage!                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Select Your Move:                                │  │
│  │ [Attack]     [Defend]                            │  │
│  │ Dmg: 18-28   Reduce: 50%                        │  │
│  │                                                   │  │
│  │ [Technique]  [Special] 🔄 2 turns               │  │
│  │ Dmg: 30-40   Dmg: 45-60                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌──────────────────────┐
│ Battle Arena | Forfeit│
├──────────────────────┤
│ Your Panda: LVL 5    │
│ [SVG] HP: 110/120    │
│  92% ▮▮▮▮▮▮▮▮░░      │
│                      │
│ vs                   │
│                      │
│ Opponent: LVL 3      │
│ [SVG] HP: 85/100     │
│  85% ▮▮▮▮▮▮▮░░░      │
│                      │
├──────────────────────┤
│ Turn 3: You attacked!│
│ Dealt 25 dmg         │
│ Opp used Defend      │
│ You took 12 dmg      │
│                      │
├──────────────────────┤
│ Your Move:           │
│ [Attack] [Defend]    │
│ [Technique] [Spec]   │
│ 🔄 2 turns cooldown  │
│                      │
└──────────────────────┘
```

**Key Components:**
- Two side-by-side panda panels with stats
- Real-time HP bars (color-coded: green → red)
- Animated damage/heal numbers floating above pandas
- Turn-by-turn battle log (scrollable)
- Move selector (4 buttons with damage/effect info)
- Cooldown indicators on Special moves

**Interactions:**
- Click move button → submit action → opponent counterattack resolves
- Animations: damage hit shake, heal sparkle, stat change glow
- Auto-scroll battle log to latest turn
- Disable move buttons while turn resolves

**End State:**
```
┌──────────────────────┐
│ Battle Complete!     │
├──────────────────────┤
│ You Won!             │
│                      │
│ Rewards:             │
│ +50 EXP              │
│ +25 Rating           │
│ Level Up! (lvl 6)    │
│                      │
│ [Battle Again]       │
│ [View Replay]        │
│ [Return to Home]     │
│                      │
└──────────────────────┘
```

---

### 2.4 Leaderboard Screen

**Route:** `/leaderboard`  
**Purpose:** Display global rankings

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Global Leaderboard                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Your Rank:                                             │
│ ┌─────────────────────────────────────────────────┐   │
│ │ #27 | You | LVL 8 | Wins: 89 | Rate: 1850      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Filters: [All Time ▼] [Global ▼] [Search: ___________] │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Rank │ Player      │ LVL │ Wins │ W/L % │ Rating │   │
│ ├──────┼─────────────┼─────┼──────┼───────┼────────┤   │
│ │ #1   │ 🏆 Panda Pro│ 15  │ 245  │ 78%   │ 2850   │   │
│ │ #2   │ Battle King │ 14  │ 212  │ 76%   │ 2790   │   │
│ │ #3   │ Red Fury    │ 13  │ 198  │ 74%   │ 2750   │   │
│ │ ...                                               │   │
│ │ #27  │ You         │ 8   │ 89   │ 68%   │ 1850   │   │
│ │ ...                                               │   │
│ │ #100 │ Bamboo Jack │ 6   │ 45   │ 55%   │ 1200   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Load More] or [Scroll]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌──────────────────────┐
│ Leaderboard          │
├──────────────────────┤
│ Your Rank: #27       │
│ 89 Wins • 68% • 1850 │
├──────────────────────┤
│ Filter: [All Time ▼] │
│ [Search ________] 🔍 │
├──────────────────────┤
│ #1 Panda Pro         │
│ LVL 15 • 245W • 2850 │
│ ━━━━━━━━━━━━━━━━━━  │
│                      │
│ #2 Battle King       │
│ LVL 14 • 212W • 2790 │
│ ━━━━━━━━━━━━━━━━━━  │
│                      │
│ #3 Red Fury          │
│ LVL 13 • 198W • 2750 │
│ ━━━━━━━━━━━━━━━━━━  │
│                      │
│ ... [Load More]      │
│                      │
└──────────────────────┘
Bottom Nav: ⚔️ | 📋 | 👥 | 👤
```

**Key Components:**
- "Your Rank" card (highlighted, sticky on mobile)
- Filter dropdowns (Time Period, Region)
- Search bar with autocomplete
- Leaderboard table/list
  - Rank with medal icon for top 3
  - Player name and avatar
  - Level, total wins, win rate, rating
- Pagination or infinite scroll
- Click row → view player profile

**Interactions:**
- Search debounced (300ms)
- Click player row → navigate to `/profile/[playerId]`
- Filters update table immediately
- "Your Rank" card scrolls into view on page load

---

### 2.5 User Profile Screen

**Route:** `/profile` or `/profile/[userId]`  
**Purpose:** View and manage user stats and pandas

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Player Profile                    [Back] [Edit] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ [Avatar]  Player Name (LVL 8)                 │   │
│  │           Joined: Nov 2024                    │   │
│  │           Wins: 89 | Losses: 42 | Rate: 1850 │   │
│  │           Win Rate: 68%                       │   │
│  │           Bio: "Panda enthusiast & strategist"│   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  Tabs: [Stats] [Pandas] [History]                     │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ Stats Section                                  │   │
│  │                                                │   │
│  │ All Time:        Recent (7 days):             │   │
│  │ Battles: 131     Battles: 12                  │   │
│  │ Wins: 89 (68%)   Wins: 8 (67%)                │   │
│  │ Losses: 42       Losses: 4                    │   │
│  │ Avg Rating: 1850 Avg Rating: 1875             │   │
│  │                                                │   │
│  │ Most Used Panda: Bamboo Champion (45 wins)    │   │
│  │ Favorite Opponent: Red Pandas (12W-5L)        │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ Recent Battles                                 │   │
│  │                                                │   │
│  │ 2h ago  vs Red Panda  WON +25 Rating          │   │
│  │ 5h ago  vs Giant    LOST -10 Rating           │   │
│  │ 1d ago  vs Snow      WON +18 Rating           │   │
│  │ 2d ago  vs Bamboo    WON +20 Rating           │   │
│  │                                                │   │
│  │ [Load More Battle History]                    │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌──────────────────────┐
│ ← Profile [Edit]     │
├──────────────────────┤
│ [Avatar]             │
│ Player Name          │
│ LVL 8 • 1850 Rating  │
│                      │
│ 89W • 42L • 68% WR   │
│ Joined: Nov 2024     │
│                      │
│ Bio: "Panda enthusiast│
│  & strategist"       │
│                      │
├──────────────────────┤
│ [Stats] [Pandas]     │
│ [History]            │
│                      │
├──────────────────────┤
│ All Time Stats:      │
│ Battles: 131         │
│ Wins: 89 (68%)       │
│                      │
│ Most Used:           │
│ Bamboo Champion      │
│ 45 wins              │
│                      │
├──────────────────────┤
│ Recent Battles:      │
│                      │
│ 2h ago vs Red Panda  │
│ WON +25              │
│                      │
│ 5h ago vs Giant      │
│ LOST -10             │
│                      │
│ [More History]       │
│                      │
└──────────────────────┘
```

**Key Components:**
- Header with player avatar, name, level, rating
- Quick stats (wins, losses, win rate, join date)
- Bio/description field
- Tabbed interface (Stats, Pandas, History)
- Stats breakdown (all-time, recent)
- Recent battles list (scrollable)
- Most-used panda highlight
- Edit button (self profile only)

**Interactions:**
- Click battle → view battle replay modal
- Click panda name → view panda details
- Edit button → unlock edit mode for own profile
- Mobile: Tabs become horizontal scroll

**Edit Mode (Self Profile Only):**
```
Dialog: Edit Profile
├─ Name: [Input]
├─ Bio: [TextArea]
├─ Avatar: [Upload/Selector]
├─ [Save] [Cancel]
```

---

## 3. User Flows

### 3.1 New Player Onboarding Flow
```
Home Screen
    ↓ Click "Start Playing"
Onboarding Tutorial (optional skip)
    ├─ Explain panda generation
    ├─ Show battle basics
    └─ Quick leaderboard intro
    ↓
Panda Generator Screen
    ├─ Generate first panda
    ├─ Customize traits
    └─ Save panda
    ↓
Battle Arena Screen
    ├─ First AI battle
    ├─ Win/Learn mechanics
    └─ Complete
    ↓
Home Screen
    └─ Show stats, encourage battle again
```

### 3.2 Generate & Battle Loop
```
Home Screen
    ├─ Option A: Generate New Panda
    │   ↓
    │   Panda Generator
    │   ↓
    │   Save → Back to Home
    │
    └─ Option B: Battle Now
        ↓
        Battle Arena
        ├─ Select opponent (random/list)
        ├─ Play battle
        └─ View result
        ↓
        [Battle Again] or [Home]
```

### 3.3 Competitive Player Flow
```
Home Screen (check recent stats)
    ↓
Leaderboard Screen
    ├─ View top 100
    ├─ Search for specific player
    └─ Click player → Profile
    ↓
Player Profile Screen (view opponent stats)
    ↓ [Challenge] button (Post-MVP)
    ↓
Battle Arena
    └─ Battle selected opponent (via AI)
    ↓
View Result
    ├─ Check rating change
    └─ Update leaderboard context
```

### 3.4 Profile View Flow
```
Leaderboard / Home
    ↓ Click player name
Profile Screen (user profile)
    ├─ Tabs: Stats | Pandas | History
    ├─ View all time stats
    ├─ Recent battles
    └─ Panda collection
    ↓
[Battle Similar] (Post-MVP) or [Back]
```

---

## 4. Responsive Design Specifications

### 4.1 Breakpoints & Layouts

#### Mobile (375px - 425px)
- Single column layout
- Bottom navigation bar
- Stacked cards
- Full-width inputs/buttons
- Collapsed menus

#### Tablet (768px - 1024px)
- 2-column layouts where appropriate
- Collapsible sidebar navigation
- Larger touch targets (48px min)
- Side-by-side panels (battle arena)

#### Desktop (1920px+)
- 3+ column layouts
- Full navigation bar (top)
- Spacious panels
- Optimized for mouse interaction
- Sidebar optional

### 4.2 Touch Targets
- Minimum 48px × 48px for mobile buttons
- 44px × 44px acceptable for secondary actions
- 8px minimum padding around clickable elements

### 4.3 Orientation Handling
- Mobile: Portrait default (optimized), landscape supported
- Tablet: Both portrait and landscape supported
- Desktop: Landscape assumed

---

## 5. Animation & Motion Specifications

### 5.1 Battle Animations
| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| **Damage Hit** | 300ms | ease-out | Move lands |
| **HP Bar Decrease** | 400ms | ease-in | After damage |
| **Heal Flash** | 500ms | ease-out | Healing move |
| **Stat Change Glow** | 200ms | ease-in-out | Stat modified |
| **Move Button Pulse** | 600ms | ease-in-out | Available to click |
| **Turn Fade In** | 200ms | ease-in | Battle log entry |

### 5.2 Micro-interactions
```css
/* Button Hover */
hover: scale(1.05), shadow increase
transition: 100ms ease-out

/* Card Hover */
hover: shadow increase, translate up 2px
transition: 200ms ease-out

/* Input Focus */
focus: border color change, ring glow
transition: 150ms ease-out

/* Loading Spinner */
rotate: 360deg
duration: 1s
timing: linear, infinite
```

### 5.3 Page Transitions
- Fade in: 300ms ease-in
- Fade out: 150ms ease-out
- Slide in: 300ms ease-out

### 5.4 Battle Replay Animations
- Replay each turn sequentially with delays
- Show move names and damage numbers
- HP bar updates smoothly
- Auto-advance or manual controls

---

## 6. Accessibility Specifications

### 6.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum on normal text (14px+)
- Large text (18px+): 3:1 minimum
- UI components and graphical objects: 3:1 minimum

**Example:**
- Black text (#000000) on white (#FFFFFF) = 21:1 ✓
- White text (#FFFFFF) on dark blue (#003A7F) = 8.59:1 ✓
- Light gray (#CCCCCC) on white = 1.45:1 ✗

### 6.2 Keyboard Navigation
- Tab order: logical (left-to-right, top-to-bottom)
- Focus indicators: visible outline (2px, high contrast color)
- Skip links: "Skip to main content" (first tab stop)
- Keyboard shortcuts:
  - `Tab` / `Shift+Tab`: navigate
  - `Enter` / `Space`: activate buttons
  - `Escape`: close modals
  - `←` / `→`: navigate between tabs

### 6.3 Screen Reader Support
```html
<!-- Panda Status -->
<div aria-live="polite" aria-label="Panda Health">
  HP: 110 / 120 (92%)
</div>

<!-- Move Buttons -->
<button aria-label="Attack: Deal 18-28 damage">
  Attack
</button>

<!-- Battle Log -->
<ul aria-label="Battle turn history" role="log">
  <li>Bamboo Panda used Attack! Dealt 25 damage.</li>
</ul>
```

### 6.4 Form Accessibility
```html
<label htmlFor="panda-name">Panda Name</label>
<input 
  id="panda-name"
  type="text"
  required
  aria-required="true"
  aria-describedby="name-error"
/>
<span id="name-error" role="alert">Name is required</span>
```

### 6.5 Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
}
```

---

## 7. Component Library Integration (shadcn/ui)

### 7.1 Components Used Per Screen

**Home Screen:**
- Button
- Card
- Badge (for level, rating)

**Panda Generator:**
- Input
- Select
- Slider
- Button
- Card

**Battle Arena:**
- Button (move selector)
- Card (panda stats)
- Progress (HP bar)
- AlertDialog (forfeit confirmation)

**Leaderboard:**
- Table or List
- Input (search)
- Select (filters)
- Badge (rank, level)
- Pagination

**Profile:**
- Avatar
- Card
- Badge
- Tabs
- Button (edit)

See `/docs/COMPONENT_INVENTORY.md` for full details.

---

## 8. Dark Mode Support

All screens must support light and dark modes seamlessly.

```css
/* Light Mode (default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #000000;
  --text-secondary: #666666;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --bg-secondary: #2D2D2D;
    --text-primary: #FFFFFF;
    --text-secondary: #AAAAAA;
  }
}
```

**Panda type backgrounds automatically invert:**
- Bamboo: light gray ↔ dark gray
- Red: light pink ↔ dark red
- Giant: light brown ↔ dark brown
- Snow: light green ↔ dark green

---

## 9. Performance & Loading States

### 9.1 Skeleton Screens
Display skeletons while loading:
- Panda card: 200ms simulated delay
- Battle stats: 150ms simulated delay
- Leaderboard: 300ms simulated delay

### 9.2 Loading Indicators
- Spinner in center of card
- Progress bar for battle turn resolution
- Pulse animation for stat updates

### 9.3 Optimistic Updates
- HP bar decreases immediately (optimistic)
- Turn log entry appears immediately
- Server confirms on resolution

---

## 10. Error States & Feedback

### 10.1 Error Messages
```
Format: "Error: [Action failed]. [Reason]. [Next step]"

Examples:
"Error: Battle failed to start. Server timeout. Please try again."
"Error: Panda name invalid. Use 1-20 alphanumeric characters."
"Error: Rating update failed. Changes not saved. Retry?"
```

### 10.2 Success Messages
```
Toast (top-right, 3s):
✓ "Panda created successfully!"
✓ "Battle won! +25 rating"
✓ "Profile updated"
```

### 10.3 Validation Feedback
- Real-time: Input turns red on error, green on valid
- Below field: "Name must be 1-20 characters"
- Submit button: Disabled until form valid

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Active
