# UI Polish Components

This document describes the UI polish and micro-interaction components added to the Panda Battle game.

## Loading States

### Skeleton

Basic skeleton loader for content placeholders.

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-32" />;
```

### Spinner

Loading spinner with size variants.

```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner size="md" />;
// Sizes: "sm" | "md" | "lg"
```

### Battle Progress

Progress indicator specifically for battle animations.

```tsx
import { BattleProgress } from "@/components/ui/battle-progress";

<BattleProgress value={75} label="Battle Progress" />;
```

### Pre-built Skeleton Loaders

Ready-to-use skeleton loaders for common game components.

```tsx
import {
  PandaCardSkeleton,
  OpponentCardSkeleton,
  LeaderboardSkeleton,
  StatsSkeleton,
} from "@/components/ui/loading-states"

<PandaCardSkeleton />
<OpponentCardSkeleton />
<LeaderboardSkeleton />
<StatsSkeleton />
```

## Animations and Transitions

### Page Transition

Smooth fade-in and slide-up animation for page content.

```tsx
import { PageTransition } from "@/components/ui/page-transition";

<PageTransition>
  <YourPageContent />
</PageTransition>;
```

### Attribute Change Animation

Shows visual feedback when attributes change with trending indicators.

```tsx
import { AttributeChangeAnimation } from "@/components/ui/attribute-change-animation";

<AttributeChangeAnimation value={85} previousValue={80} label="Strength" />;
```

### Turn Regeneration Animation

Animated turn counter with regeneration effects.

```tsx
import { TurnRegenerationAnimation } from "@/components/ui/turn-regeneration-animation";

<TurnRegenerationAnimation turns={5} maxTurns={10} />;
```

### Rank Change Celebration

Celebratory animation for rank changes with confetti effects.

```tsx
import { RankChangeCelebration } from "@/components/ui/rank-change-celebration";

<RankChangeCelebration currentRank={15} previousRank={20} isTop20={true} />;
```

## Toast Notifications

### Basic Usage

The toast system is already set up in the root layout. Use the `useGameNotifications` hook for game-specific notifications.

```tsx
import { useGameNotifications } from "@/lib/hooks/use-game-notifications";

function MyComponent() {
  const { notifyBattleWin, notifyRankUp } = useGameNotifications();

  const handleBattleWin = () => {
    notifyBattleWin("OpponentName", "Strength");
  };

  const handleRankChange = () => {
    notifyRankUp(15);
  };

  return (
    <div>
      <button onClick={handleBattleWin}>Win Battle</button>
      <button onClick={handleRankChange}>Rank Up</button>
    </div>
  );
}
```

### Available Notification Methods

- `notifyBattleWin(opponentName, attributeStolen)` - Victory notification
- `notifyBattleLoss(attackerName, attributeLost)` - Defeat notification
- `notifyTurnRegeneration(turnsAdded)` - Turn regeneration alert
- `notifyRankUp(newRank)` - Rank improvement celebration
- `notifyRankDown(newRank)` - Rank decrease warning
- `notifyTop20Entry()` - Entered Top 20 celebration
- `notifyTop20Exit()` - Dropped from Top 20 warning
- `notifyAttacked(attackerName)` - Under attack alert
- `notifyTurnsFull()` - Turns at maximum alert
- `notifyIdleWarning(hoursIdle)` - Idle decay warning

### Custom Toast

For custom notifications, use the `useToast` hook directly:

```tsx
import { useToast } from "@/lib/hooks/use-toast";

function MyComponent() {
  const { addToast } = useToast();

  const showCustomToast = () => {
    addToast({
      title: "Custom Title",
      description: "Custom description",
      variant: "success", // "default" | "success" | "error" | "warning"
      duration: 5000, // milliseconds
    });
  };

  return <button onClick={showCustomToast}>Show Toast</button>;
}
```

## Testing Notifications

A demo component is available to test all notification types:

```tsx
import { NotificationExamples } from "@/components/ui/notification-examples";

<NotificationExamples />;
```

## Integration Examples

### Battle Flow with Notifications

```tsx
import { useGameNotifications } from "@/lib/hooks/use-game-notifications";

function BattleComponent() {
  const { notifyBattleWin, notifyRankUp } = useGameNotifications();

  const handleBattle = async () => {
    const result = await performBattle();

    if (result.won) {
      notifyBattleWin(result.opponent, result.attributeStolen);

      if (result.rankImproved) {
        notifyRankUp(result.newRank);
      }
    }
  };

  return <button onClick={handleBattle}>Battle</button>;
}
```

### Loading States in Data Fetching

```tsx
import { PandaCardSkeleton } from "@/components/ui/loading-states";

function PandaDisplay() {
  const [loading, setLoading] = useState(true);
  const [panda, setPanda] = useState(null);

  useEffect(() => {
    fetchPanda().then((data) => {
      setPanda(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PandaCardSkeleton />;

  return <PandaCard data={panda} />;
}
```

## Styling Notes

All components use Tailwind CSS and follow the game's design system:

- Animations use the `tw-animate-css` package
- Custom animations are defined in `globals.css`
- Components support dark mode automatically
- All interactive elements have proper hover and focus states
