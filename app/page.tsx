export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">🐼 Bamboo Panda Battles</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the ultimate panda battle arena!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">🔨 Forge</h2>
            <p className="text-sm text-muted-foreground">
              Create and customize your unique panda with special abilities.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">⚔️ Battle</h2>
            <p className="text-sm text-muted-foreground">
              Engage in turn-based battles against AI opponents.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">👥 Hub</h2>
            <p className="text-sm text-muted-foreground">
              View global rankings and compete on the leaderboard.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">📊 Stats</h2>
            <p className="text-sm text-muted-foreground">
              Track your progress and view your battle history.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Use the navigation to explore different sections of the app.
          </p>
        </div>
      </div>
    </div>
  );
}
