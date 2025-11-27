export default function HubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">👥 Panda Hub</h1>
          <p className="text-lg text-muted-foreground">
            View leaderboards and connect with other players.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">🏆 Leaderboard</h2>
            <p className="text-sm text-muted-foreground">
              View top players and their rankings.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-3">
            <h2 className="text-xl font-semibold">👤 Profile</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your player profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
