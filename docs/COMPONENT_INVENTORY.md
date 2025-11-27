# Component Inventory
## shadcn/ui Components & Implementation Guide

---

## 1. Overview

This document outlines all shadcn/ui components required for the Bamboo Panda Battles MVP, organized by screen/feature. Each component includes installation instructions and usage rationale.

**Installation Command Template:**
```bash
pnpm dlx shadcn-ui@latest add [component-name]
```

---

## 2. Core Layout Components

### 2.1 Button
**Status:** Already available (basic HTML button)  
**Usage:** All interactive actions (battle moves, form submissions, navigation)

**Screens:** All

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add button
```

**Variants Needed:**
- `primary` (default action)
- `secondary` (alternative action)
- `destructive` (danger actions like forfeit)
- `outline` (ghost, minimal style)
- `disabled` (unavailable actions)

**Example Usage:**
```tsx
<Button onClick={handleBattle}>Battle Now</Button>
<Button variant="destructive">Forfeit Battle</Button>
<Button disabled>Special (cooldown)</Button>
```

---

### 2.2 Card
**Status:** Basic Tailwind, may need shadcn wrapper  
**Usage:** Container for content sections (panda stats, battle log, profile sections)

**Screens:** All

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add card
```

**Rationale:** Provides consistent card styling with shadow, border, and padding.

**Example Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Bamboo Champion</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Level 9 | 45 Wins | 128 HP</p>
  </CardContent>
</Card>
```

---

### 2.3 Input
**Status:** Custom inputs exist, standardize with shadcn  
**Usage:** Text fields (panda name, search queries)

**Screens:** Panda Generator, Leaderboard (search)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add input
```

**Example Usage:**
```tsx
<Input 
  type="text" 
  placeholder="Enter panda name"
  maxLength={20}
  onChange={(e) => setPandaName(e.target.value)}
/>
```

---

### 2.4 Select / SelectValue
**Status:** Dropdown selector  
**Usage:** Panda type selection, difficulty selection, filter dropdowns

**Screens:** Panda Generator, Battle Arena (opponent select), Leaderboard (filters)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add select
```

**Example Usage:**
```tsx
<Select value={pandaType} onValueChange={setPandaType}>
  <SelectTrigger>
    <SelectValue placeholder="Choose panda type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="bamboo">Bamboo</SelectItem>
    <SelectItem value="red">Red Panda</SelectItem>
    <SelectItem value="giant">Giant Panda</SelectItem>
    <SelectItem value="snow">Snow Panda</SelectItem>
  </SelectContent>
</Select>
```

---

## 3. Data Display Components

### 3.1 Table / TableHeader / TableBody / TableRow / TableCell
**Status:** Not yet installed  
**Usage:** Display leaderboard rankings, battle history

**Screens:** Leaderboard, Profile (battle history)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add table
```

**Rationale:** Provides accessible, responsive table structure.

**Example Usage:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Rank</TableHead>
      <TableHead>Player</TableHead>
      <TableHead>Wins</TableHead>
      <TableHead>Rating</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {leaderboard.map(entry => (
      <TableRow key={entry.rank}>
        <TableCell>#{entry.rank}</TableCell>
        <TableCell>{entry.playerName}</TableCell>
        <TableCell>{entry.totalWins}</TableCell>
        <TableCell>{entry.rating}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 3.2 Badge
**Status:** Small label/status indicator  
**Usage:** Level badges, win rate tags, status indicators (e.g., "Legendary", "Top 10")

**Screens:** Leaderboard, Profile, Panda cards

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add badge
```

**Example Usage:**
```tsx
<Badge variant="default">Level 8</Badge>
<Badge variant="secondary">68% Win Rate</Badge>
<Badge variant="outline">Top 100</Badge>
```

---

### 3.3 Progress
**Status:** HP bars, stat visualization  
**Usage:** Display panda HP during battle, attribute bars during generation

**Screens:** Battle Arena, Panda Generator

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add progress
```

**Example Usage:**
```tsx
<Progress value={currentHP} max={maxHP} />
// Shows HP: 110/120 (92%)

<Progress value={attackStat} max={100} />
// Shows Attack: 72/100 (72%)
```

---

## 4. Form Components

### 4.1 Slider
**Status:** For attribute adjustment  
**Usage:** Randomize/adjust panda attributes during generation

**Screens:** Panda Generator

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add slider
```

**Example Usage:**
```tsx
<div className="space-y-4">
  <label>Attack: {attack}</label>
  <Slider
    value={[attack]}
    onValueChange={(val) => setAttack(val[0])}
    min={1}
    max={100}
    step={1}
  />
</div>
```

---

### 4.2 Label
**Status:** Form labels  
**Usage:** Associated with inputs, sliders, checkboxes

**Screens:** Panda Generator, Profile Edit, Leaderboard Search

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add label
```

**Example Usage:**
```tsx
<Label htmlFor="panda-name">Panda Name</Label>
<Input id="panda-name" />
```

---

### 4.3 Checkbox
**Status:** Multi-select options  
**Usage:** Filter options (if implemented)

**Screens:** Leaderboard (optional filters)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add checkbox
```

---

### 4.4 RadioGroup / RadioGroupItem
**Status:** Single-select options  
**Usage:** Panda type selection (mutually exclusive)

**Screens:** Panda Generator

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add radio-group
```

**Example Usage:**
```tsx
<RadioGroup value={pandaType} onValueChange={setPandaType}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="bamboo" id="bamboo" />
    <Label htmlFor="bamboo">Bamboo</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="red" id="red" />
    <Label htmlFor="red">Red Panda</Label>
  </div>
  {/* ... */}
</RadioGroup>
```

---

## 5. Dialog & Modal Components

### 5.1 Dialog / DialogTrigger / DialogContent / DialogHeader / DialogTitle / DialogClose
**Status:** For modals  
**Usage:** Confirm actions, show battle replay, edit profile

**Screens:** Battle Arena (forfeit confirmation), Profile (edit modal), Battle Result (detailed view)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add dialog
```

**Example Usage:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Forfeit Battle</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Forfeit Battle?</DialogTitle>
    </DialogHeader>
    <p>Are you sure? You will lose rating.</p>
    <div className="flex gap-2">
      <Button variant="destructive" onClick={handleForfeit}>
        Forfeit
      </Button>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### 5.2 AlertDialog / AlertDialogAction / AlertDialogCancel / AlertDialogContent / AlertDialogDescription / AlertDialogHeader / AlertDialogTitle / AlertDialogTrigger
**Status:** For critical confirmations  
**Usage:** Destructive actions (forfeit battle, delete panda)

**Screens:** Battle Arena (forfeit), Profile (if delete option added)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add alert-dialog
```

**Example Usage:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Forfeit</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Forfeit Battle?</AlertDialogTitle>
      <AlertDialogDescription>
        This will end the battle and you'll lose rating.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="flex gap-2">
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleForfeit}>
        Forfeit
      </AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

---

## 6. Navigation Components

### 6.1 Tabs / TabsList / TabsTrigger / TabsContent
**Status:** For tabbed interfaces  
**Usage:** Profile screen sections (Stats, Pandas, History), Leaderboard filters

**Screens:** Profile, Leaderboard (optional)

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add tabs
```

**Example Usage:**
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="stats">Stats</TabsTrigger>
    <TabsTrigger value="pandas">Pandas</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="stats">
    {/* Stats content */}
  </TabsContent>
  <TabsContent value="pandas">
    {/* Pandas content */}
  </TabsContent>
  <TabsContent value="history">
    {/* History content */}
  </TabsContent>
</Tabs>
```

---

## 7. Feedback Components

### 7.1 Toast / useToast
**Status:** For success/error notifications  
**Usage:** Battle won/lost, panda created, profile updated, errors

**Screens:** All

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add sonner
```

**Note:** shadcn/ui uses `sonner` for toast notifications.

**Example Usage:**
```tsx
import { useToast } from "@/components/ui/use-toast";

export function MyComponent() {
  const { toast } = useToast();

  const handleWin = () => {
    toast({
      title: "Battle Won!",
      description: "+25 rating",
      variant: "default"
    });
  };

  const handleError = () => {
    toast({
      title: "Error",
      description: "Battle failed to start.",
      variant: "destructive"
    });
  };
}
```

---

### 7.2 Loading Spinner (Skeleton)
**Status:** For loading states  
**Usage:** Show placeholders while data loads

**Screens:** All

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add skeleton
```

**Example Usage:**
```tsx
{isLoading ? (
  <Card>
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="mt-2 h-4 w-3/4" />
  </Card>
) : (
  // Actual content
)}
```

---

## 8. Utility Components

### 8.1 Avatar / AvatarImage / AvatarFallback
**Status:** For user/panda avatars  
**Usage:** Display player avatars, panda portraits

**Screens:** Leaderboard, Profile, Battle Arena, Home

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add avatar
```

**Example Usage:**
```tsx
<Avatar>
  <AvatarImage src="https://api.example.com/avatars/user.png" />
  <AvatarFallback>PM</AvatarFallback>
</Avatar>
```

---

### 8.2 Separator
**Status:** Visual divider  
**Usage:** Separate sections (battle log entries, leaderboard rows)

**Screens:** Battle Arena, Profile, Leaderboard

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add separator
```

**Example Usage:**
```tsx
<div>
  <p>Turn 1 Log</p>
  <Separator />
  <p>Turn 2 Log</p>
</div>
```

---

### 8.3 Scroll Area
**Status:** Scrollable content with style  
**Usage:** Battle log (many turns), leaderboard (many entries)

**Screens:** Battle Arena, Profile, Leaderboard

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add scroll-area
```

**Example Usage:**
```tsx
<ScrollArea className="h-96 w-full">
  {battleLog.map(turn => (
    <div key={turn.turnNumber}>
      Turn {turn.turnNumber}: {turn.description}
    </div>
  ))}
</ScrollArea>
```

---

## 9. Optional Enhancements

### 9.1 Popover / PopoverContent / PopoverTrigger
**Purpose:** Tooltip-like help text for battle moves  
**Status:** Optional for MVP

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add popover
```

---

### 9.2 Collapsible
**Purpose:** Expandable sections (advanced stats, battle replay details)  
**Status:** Optional for MVP

**Installation:**
```bash
pnpm dlx shadcn-ui@latest add collapsible
```

---

## 10. Component Installation Checklist

**Essential Components (Install in this order):**

```bash
# 1. Button (foundation)
pnpm dlx shadcn-ui@latest add button

# 2. Card (layout)
pnpm dlx shadcn-ui@latest add card

# 3. Input (forms)
pnpm dlx shadcn-ui@latest add input

# 4. Select (dropdowns)
pnpm dlx shadcn-ui@latest add select

# 5. Progress (HP bars, stats)
pnpm dlx shadcn-ui@latest add progress

# 6. Slider (attribute adjustment)
pnpm dlx shadcn-ui@latest add slider

# 7. RadioGroup (panda type selection)
pnpm dlx shadcn-ui@latest add radio-group

# 8. Label (form labels)
pnpm dlx shadcn-ui@latest add label

# 9. Badge (status badges)
pnpm dlx shadcn-ui@latest add badge

# 10. Dialog (modals)
pnpm dlx shadcn-ui@latest add dialog

# 11. AlertDialog (destructive actions)
pnpm dlx shadcn-ui@latest add alert-dialog

# 12. Tabs (tabbed interfaces)
pnpm dlx shadcn-ui@latest add tabs

# 13. Table (leaderboard, history)
pnpm dlx shadcn-ui@latest add table

# 14. Avatar (user/panda portraits)
pnpm dlx shadcn-ui@latest add avatar

# 15. Separator (dividers)
pnpm dlx shadcn-ui@latest add separator

# 16. ScrollArea (scrollable content)
pnpm dlx shadcn-ui@latest add scroll-area

# 17. Toast (notifications)
pnpm dlx shadcn-ui@latest add sonner

# 18. Skeleton (loading placeholders)
pnpm dlx shadcn-ui@latest add skeleton

# 19. Checkbox (optional filters)
pnpm dlx shadcn-ui@latest add checkbox
```

---

## 11. Component Usage by Screen

### Home Screen
- Button (primary actions)
- Card (quick stats, recent battle)
- Badge (level, rating)

### Panda Generator
- Input (name)
- Select (panda type)
- Slider (attributes)
- Label (for inputs)
- Button (randomize, save)
- RadioGroup (type selection alternative)
- Card (preview)
- Progress (stat visualization)

### Battle Arena
- Card (panda stats panels)
- Button (move selection - 4 buttons)
- Progress (HP bars)
- ScrollArea (battle log)
- Dialog/AlertDialog (forfeit confirmation)
- Badge (cooldown indicators)
- Separator (turn dividers)

### Leaderboard
- Table (rankings)
- Input (search bar)
- Select (filters: time period, region)
- Badge (rank, top 10 indicator)
- Button (pagination if needed)
- Avatar (player avatars)

### Profile
- Avatar (user avatar)
- Card (stats cards, recent battles)
- Badge (level, win rate)
- Tabs (Stats, Pandas, History)
- Table (battle history)
- Button (edit profile)
- Dialog (edit modal)

---

## 12. Color & Styling Integration

All shadcn components use:
- **CSS Variables** for theming (light/dark mode)
- **Tailwind Utilities** for customization
- **Default New York Style** (configured in `components.json`)

Example customization:
```tsx
// Using Tailwind + shadcn
<Button className="bg-panda-bamboo hover:bg-panda-bamboo/80">
  Attack
</Button>

// With custom colors from Tailwind config
<Card className="border-panda-red bg-panda-red/10">
  {/* Content */}
</Card>
```

---

## 13. Accessibility Defaults

All shadcn/ui components include:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus indicators
- Semantic HTML

No additional accessibility work needed beyond component usage.

---

## 14. Performance Considerations

- **Tree-shaking:** Only used components are bundled
- **Code splitting:** Components lazy-loaded per page
- **CSS-in-JS:** Tailwind generates only used utilities
- **Bundle size estimate:** ~15KB additional (all components)

---

## Appendix A: Quick Reference

| Component | Purpose | Screens |
|-----------|---------|---------|
| Button | Actions | All |
| Card | Containers | All |
| Input | Text entry | PandaGen, Leaderboard |
| Select | Dropdowns | PandaGen, Battle, Leaderboard |
| Table | Data grids | Leaderboard, Profile |
| Badge | Status labels | All |
| Progress | Bars (HP, stats) | Battle, PandaGen |
| Slider | Range input | PandaGen |
| Dialog | Modals | Battle, Profile |
| Avatar | Portraits | Profile, Leaderboard, Battle |
| Tabs | Sections | Profile |
| Toast | Notifications | All |
| Skeleton | Loading | All |

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Active
