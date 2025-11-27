export default function BattlePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">⚔️ Battle Arena</h1>
          <p className="text-lg text-muted-foreground">
            Engage in turn-based battles with other pandas.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-muted/50 border border-border space-y-4">
          <p className="text-center text-muted-foreground">
            This is where battles would take place. Features will be built here.
          </p>
        </div>
      </div>
    </div>
  );
}
