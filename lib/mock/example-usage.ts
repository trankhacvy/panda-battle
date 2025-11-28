/**
 * Example Usage of Mock Data Layer
 * This file demonstrates how to use the mock data layer and game store
 */

import { useGameStore } from "../store/game-store";
import { calculateBattleScore, simulateBattle } from "./battle-logic";
import { calculateRankings, getTop20Players } from "./leaderboard-logic";
import { generateAttributes, calculateTotalPower } from "./data";

// ============================================================================
// Example 1: Basic Player Information
// ============================================================================

export function exampleGetPlayerInfo() {
  const store = useGameStore.getState();
  const player = store.currentPlayer;

  console.log("Player Information:");
  console.log(`Name: ${player.pandaName}`);
  console.log(`Rank: ${player.rank}`);
  console.log(`Turns: ${player.turns}`);
  console.log(`Attributes:`, player.attributes);
  console.log(`Total Power: ${calculateTotalPower(player.attributes)}`);
  console.log(`Win/Loss: ${player.winCount}/${player.lossCount}`);
  console.log(`In Top 20: ${player.inTop20}`);
}

// ============================================================================
// Example 2: Initiate a Battle
// ============================================================================

export async function exampleInitiateBattle() {
  const store = useGameStore.getState();

  // Get an opponent
  const opponents = store.opponents;
  const targetOpponent = opponents[0]; // Challenge the first opponent

  console.log(
    `Challenging ${targetOpponent.pandaName} (Rank ${targetOpponent.rank})`
  );
  console.log(`Your turns before battle: ${store.currentPlayer.turns}`);

  // Initiate battle
  const result = await store.initiateBattle(targetOpponent.wallet);

  if (result) {
    console.log("Battle Result:");
    console.log(`Winner: ${result.winner}`);
    console.log(`Attacker Score: ${result.attackerScore}`);
    console.log(`Defender Score: ${result.defenderScore}`);
    console.log(`Attribute Stolen: ${result.attributeStolen}`);
    console.log(`Amount Stolen: ${result.amountStolen}`);
    console.log(`Your turns after battle: ${store.currentPlayer.turns}`);
  } else {
    console.log("Battle failed - check turns or opponent availability");
  }
}

// ============================================================================
// Example 3: View Leaderboard
// ============================================================================

export async function exampleViewLeaderboard() {
  const store = useGameStore.getState();
  const leaderboard = store.getLeaderboard();

  console.log("Leaderboard (Top 10):");
  leaderboard.slice(0, 10).forEach((player) => {
    const power = calculateTotalPower(player.attributes);
    console.log(
      `#${player.rank} - ${player.pandaName} - Power: ${power} - W/L: ${player.winCount}/${player.lossCount}`
    );
  });

  // Get Top 20
  const top20 = store.getTop20();
  console.log(`\nTotal players in Top 20: ${top20.length}`);
}

// ============================================================================
// Example 4: View Leaderboard with Visibility Rules
// ============================================================================

export async function exampleViewLeaderboardWithVisibility() {
  const store = useGameStore.getState();
  const currentPlayer = store.currentPlayer;

  // Get leaderboard with visibility rules applied
  const leaderboard = await store.getLeaderboardWithVisibility(
    currentPlayer.wallet
  );

  console.log("Leaderboard with Visibility Rules:");
  leaderboard.slice(0, 30).forEach((player) => {
    if (player.rank <= 20) {
      // Top 20 - full visibility
      const power = calculateTotalPower(player.attributes);
      console.log(
        `#${player.rank} - ${player.pandaName} - Power: ${power} - Str: ${player.attributes.strength}, Spd: ${player.attributes.speed}`
      );
    } else if (player.rank <= 100) {
      // Mid-tier - partial visibility
      console.log(
        `#${player.rank} - ${player.pandaName} - Str: ~${player.attributes.strength}, Spd: ~${player.attributes.speed}`
      );
    } else {
      // Bottom-tier - hidden
      console.log(`#${player.rank} - Hidden Player`);
    }
  });
}

// ============================================================================
// Example 5: Turn Regeneration
// ============================================================================

export function exampleTurnRegeneration() {
  const store = useGameStore.getState();

  console.log(`Current turns: ${store.currentPlayer.turns}`);

  // Simulate turn regeneration (for testing)
  store.simulateTurnRegeneration();

  console.log(`Turns after regeneration: ${store.currentPlayer.turns}`);
}

// ============================================================================
// Example 6: Battle Score Calculation
// ============================================================================

export function exampleBattleScoreCalculation() {
  const store = useGameStore.getState();
  const player = store.currentPlayer;
  const opponent = store.opponents[0];

  // Calculate battle scores
  const playerScore = calculateBattleScore(player.attributes, false, false);
  const opponentScore = calculateBattleScore(
    opponent.attributes,
    true,
    opponent.inTop20
  );

  console.log("Battle Score Calculation:");
  console.log(`${player.pandaName} Score: ${playerScore}`);
  console.log(`${opponent.pandaName} Score: ${opponentScore}`);
  console.log(
    `Predicted Winner: ${
      playerScore > opponentScore ? player.pandaName : opponent.pandaName
    }`
  );

  if (opponent.inTop20) {
    console.log(
      `Note: ${opponent.pandaName} is in Top 20 and has -20% vulnerability modifier`
    );
  }
}

// ============================================================================
// Example 7: Generate Random Attributes
// ============================================================================

export function exampleGenerateAttributes() {
  console.log("Generating 5 random panda attribute sets:");

  for (let i = 0; i < 5; i++) {
    const attributes = generateAttributes();
    const power = calculateTotalPower(attributes);

    console.log(`\nPanda ${i + 1}:`);
    console.log(`  Strength: ${attributes.strength}`);
    console.log(`  Speed: ${attributes.speed}`);
    console.log(`  Endurance: ${attributes.endurance}`);
    console.log(`  Luck: ${attributes.luck}`);
    console.log(`  Total Power: ${power}`);
  }
}

// ============================================================================
// Example 8: Battle History
// ============================================================================

export function exampleBattleHistory() {
  const store = useGameStore.getState();
  const history = store.battleHistory;

  console.log(`Total battles in history: ${history.length}`);
  console.log("\nRecent battles (last 5):");

  history.slice(0, 5).forEach((battle, index) => {
    console.log(`\nBattle ${index + 1}:`);
    console.log(`  Attacker: ${battle.attacker}`);
    console.log(`  Defender: ${battle.defender}`);
    console.log(`  Winner: ${battle.winner}`);
    console.log(`  Scores: ${battle.attackerScore} vs ${battle.defenderScore}`);
    console.log(`  Stolen: ${battle.amountStolen} ${battle.attributeStolen}`);
    console.log(`  Time: ${battle.timestamp.toLocaleString()}`);
  });
}

// ============================================================================
// Example 9: Update Leaderboard After Multiple Battles
// ============================================================================

export async function exampleMultipleBattles() {
  const store = useGameStore.getState();

  console.log(`Starting rank: ${store.currentPlayer.rank}`);
  console.log(
    `Starting power: ${calculateTotalPower(store.currentPlayer.attributes)}`
  );

  // Simulate 3 battles
  for (let i = 0; i < 3; i++) {
    const opponent = store.opponents[i];
    console.log(`\nBattle ${i + 1} vs ${opponent.pandaName}`);

    const result = await store.initiateBattle(opponent.wallet);

    if (result) {
      const won = result.winner === store.currentPlayer.wallet;
      console.log(`  Result: ${won ? "WON" : "LOST"}`);
      console.log(
        `  Attribute stolen: ${result.attributeStolen} (${result.amountStolen})`
      );
    }

    // Wait a bit between battles
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\nFinal rank: ${store.currentPlayer.rank}`);
  console.log(
    `Final power: ${calculateTotalPower(store.currentPlayer.attributes)}`
  );
  console.log(
    `Record: ${store.currentPlayer.winCount}W - ${store.currentPlayer.lossCount}L`
  );
}

// ============================================================================
// Example 10: Reset Game State
// ============================================================================

export function exampleResetGame() {
  const store = useGameStore.getState();

  console.log("Resetting game state...");
  store.reset();
  console.log("Game state reset to initial values");

  const player = store.currentPlayer;
  console.log(`Player: ${player.pandaName}`);
  console.log(`Rank: ${player.rank}`);
  console.log(`Turns: ${player.turns}`);
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
  console.log("=".repeat(80));
  console.log("PANDA BATTLE MOCK DATA LAYER - EXAMPLES");
  console.log("=".repeat(80));

  console.log("\n--- Example 1: Player Information ---");
  exampleGetPlayerInfo();

  console.log("\n--- Example 2: Battle Score Calculation ---");
  exampleBattleScoreCalculation();

  console.log("\n--- Example 3: Generate Random Attributes ---");
  exampleGenerateAttributes();

  console.log("\n--- Example 4: View Leaderboard ---");
  await exampleViewLeaderboard();

  console.log("\n--- Example 5: Turn Regeneration ---");
  exampleTurnRegeneration();

  console.log("\n--- Example 6: Initiate Battle ---");
  await exampleInitiateBattle();

  console.log("\n--- Example 7: Battle History ---");
  exampleBattleHistory();

  console.log("\n--- Example 8: View Leaderboard with Visibility ---");
  await exampleViewLeaderboardWithVisibility();

  console.log("\n=".repeat(80));
}
