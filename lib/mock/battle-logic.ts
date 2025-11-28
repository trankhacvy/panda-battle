/**
 * Mock Battle Logic for Panda Battle Game
 * Implements battle score calculation, winner determination, and attribute stealing
 * Requirements: 3.2, 3.3, 4.2
 */

import {
  Attributes,
  AttributeType,
  Player,
  BattleRecord,
  calculateTotalPower,
} from "./data";

// ============================================================================
// Constants (from design.md)
// ============================================================================

const BATTLE_SCORE_WEIGHTS = {
  strength: 0.35,
  speed: 0.25,
  endurance: 0.25,
  luck: 0.15,
};

const TOP_20_VULNERABILITY = 0.8; // 20% vulnerability (Requirement 3.6)
const RANDOMNESS_FACTOR = 0.2; // ±10% randomness for upsets
const MIN_STEAL_PERCENTAGE = 0.1; // 10% minimum steal
const MAX_STEAL_PERCENTAGE = 0.2; // 20% maximum steal

// ============================================================================
// Battle Score Calculation (Requirement 3.2)
// ============================================================================

/**
 * Calculate battle score for a panda
 * Formula: (Strength × weight) + (Speed × weight) + (Endurance × weight) + (Luck modifier)
 *
 * @param attributes - Panda attributes
 * @param isDefender - Whether this panda is defending
 * @param inTop20 - Whether this panda is in Top 20 (applies vulnerability)
 * @returns Battle score
 */
export function calculateBattleScore(
  attributes: Attributes,
  isDefender: boolean,
  inTop20: boolean
): number {
  // Calculate base score using weighted attributes
  let baseScore =
    attributes.strength * BATTLE_SCORE_WEIGHTS.strength +
    attributes.speed * BATTLE_SCORE_WEIGHTS.speed +
    attributes.endurance * BATTLE_SCORE_WEIGHTS.endurance +
    attributes.luck * BATTLE_SCORE_WEIGHTS.luck;

  // Apply Top 20 vulnerability modifier (Requirement 3.6)
  if (isDefender && inTop20) {
    baseScore *= TOP_20_VULNERABILITY;
  }

  // Add randomness for upsets (±10%)
  const randomFactor =
    1 - RANDOMNESS_FACTOR / 2 + Math.random() * RANDOMNESS_FACTOR;
  const finalScore = baseScore * randomFactor;

  return Math.round(finalScore * 100) / 100;
}

// ============================================================================
// Winner Determination (Requirement 3.3)
// ============================================================================

/**
 * Determine battle winner based on scores
 * Higher score wins, with randomness allowing occasional upsets
 *
 * @param attackerScore - Attacker's battle score
 * @param defenderScore - Defender's battle score
 * @returns "attacker" or "defender"
 */
export function determineWinner(
  attackerScore: number,
  defenderScore: number
): "attacker" | "defender" {
  // Simple comparison - higher score wins
  // Randomness is already built into the score calculation
  return attackerScore > defenderScore ? "attacker" : "defender";
}

// ============================================================================
// Attribute Stealing (Requirement 4.2)
// ============================================================================

/**
 * Calculate steal amount for an attribute
 * Steals 10-20% of the loser's attribute value
 *
 * @param loserAttributeValue - Value of the attribute to steal
 * @returns Amount to steal
 */
export function calculateStealAmount(loserAttributeValue: number): number {
  const stealPercentage =
    MIN_STEAL_PERCENTAGE +
    Math.random() * (MAX_STEAL_PERCENTAGE - MIN_STEAL_PERCENTAGE);

  const stealAmount = Math.floor(loserAttributeValue * stealPercentage);

  // Ensure at least 1 point is stolen if attribute > 0
  return Math.max(1, stealAmount);
}

/**
 * Apply attribute steal from loser to winner
 *
 * @param winnerAttributes - Winner's attributes (will be modified)
 * @param loserAttributes - Loser's attributes (will be modified)
 * @param attributeToSteal - Which attribute to steal
 * @returns Amount stolen
 */
export function applyAttributeSteal(
  winnerAttributes: Attributes,
  loserAttributes: Attributes,
  attributeToSteal: AttributeType
): number {
  const stealAmount = calculateStealAmount(loserAttributes[attributeToSteal]);

  // Transfer attribute points
  winnerAttributes[attributeToSteal] += stealAmount;
  loserAttributes[attributeToSteal] = Math.max(
    0,
    loserAttributes[attributeToSteal] - stealAmount
  );

  return stealAmount;
}

/**
 * Randomly select an attribute to steal
 * In a real game, the winner would choose, but for mock we randomize
 */
export function selectRandomAttributeToSteal(): AttributeType {
  const attributes: AttributeType[] = [
    "strength",
    "speed",
    "endurance",
    "luck",
  ];
  return attributes[Math.floor(Math.random() * attributes.length)];
}

// ============================================================================
// Complete Battle Simulation
// ============================================================================

/**
 * Simulate a complete battle between attacker and defender
 *
 * @param attacker - Attacking player
 * @param defender - Defending player
 * @param roundId - Current round ID
 * @returns Battle record with results
 */
export function simulateBattle(
  attacker: Player,
  defender: Player,
  roundId: string
): BattleRecord {
  // Calculate battle scores (Requirement 3.2)
  const attackerScore = calculateBattleScore(
    attacker.attributes,
    false,
    attacker.inTop20
  );

  const defenderScore = calculateBattleScore(
    defender.attributes,
    true,
    defender.inTop20
  );

  // Determine winner (Requirement 3.3)
  const winnerSide = determineWinner(attackerScore, defenderScore);
  const winner = winnerSide === "attacker" ? attacker : defender;
  const loser = winnerSide === "attacker" ? defender : attacker;

  // Select attribute to steal
  const attributeToSteal = selectRandomAttributeToSteal();

  // Calculate steal amount (Requirement 4.2)
  const stealAmount = calculateStealAmount(loser.attributes[attributeToSteal]);

  // Create battle record
  const battleRecord: BattleRecord = {
    id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roundId,
    attacker: attacker.wallet,
    defender: defender.wallet,
    winner: winner.wallet,
    attackerScore,
    defenderScore,
    attributeStolen: attributeToSteal,
    amountStolen: stealAmount,
    timestamp: new Date(),
  };

  return battleRecord;
}

/**
 * Apply battle results to player objects
 * Updates attributes, win/loss counts, and activity times
 *
 * @param attacker - Attacking player (will be modified)
 * @param defender - Defending player (will be modified)
 * @param battleRecord - Battle results
 */
export function applyBattleResults(
  attacker: Player,
  defender: Player,
  battleRecord: BattleRecord
): void {
  const winner = battleRecord.winner === attacker.wallet ? attacker : defender;
  const loser = battleRecord.winner === attacker.wallet ? defender : attacker;

  // Apply attribute steal
  if (battleRecord.attributeStolen) {
    winner.attributes[battleRecord.attributeStolen] +=
      battleRecord.amountStolen;
    loser.attributes[battleRecord.attributeStolen] = Math.max(
      0,
      loser.attributes[battleRecord.attributeStolen] - battleRecord.amountStolen
    );
  }

  // Update battle counts
  attacker.battleCount++;
  defender.battleCount++;

  if (winner === attacker) {
    attacker.winCount++;
    defender.lossCount++;
  } else {
    defender.winCount++;
    attacker.lossCount++;
  }

  // Update activity times
  const now = new Date();
  attacker.lastBattleTime = now;
  attacker.lastActivityTime = now;
  defender.lastBattleTime = now;
  defender.lastActivityTime = now;
}

// ============================================================================
// Battle Validation
// ============================================================================

/**
 * Validate if a battle can be initiated
 *
 * @param attacker - Attacking player
 * @param defender - Defending player
 * @returns Validation result with error message if invalid
 */
export function validateBattle(
  attacker: Player,
  defender: Player
): { valid: boolean; error?: string } {
  // Check if attacker has turns
  if (attacker.turns <= 0) {
    return { valid: false, error: "Insufficient turns" };
  }

  // Check if attacking self
  if (attacker.wallet === defender.wallet) {
    return { valid: false, error: "Cannot battle yourself" };
  }

  // Check if defender exists
  if (!defender) {
    return { valid: false, error: "Defender not found" };
  }

  return { valid: true };
}

// ============================================================================
// Battle Statistics
// ============================================================================

/**
 * Calculate win probability based on attributes
 * This is an estimate, actual battles have randomness
 */
export function calculateWinProbability(
  attacker: Attributes,
  defender: Attributes,
  defenderInTop20: boolean
): number {
  const attackerScore = calculateBattleScore(attacker, false, false);
  const defenderScore = calculateBattleScore(defender, true, defenderInTop20);

  // Simple probability based on score difference
  const scoreDiff = attackerScore - defenderScore;
  const probability = 0.5 + scoreDiff / 100;

  // Clamp between 0.1 and 0.9 (always some chance)
  return Math.max(0.1, Math.min(0.9, probability));
}

/**
 * Get battle difficulty rating
 */
export function getBattleDifficulty(
  attacker: Attributes,
  defender: Attributes
): "easy" | "medium" | "hard" | "extreme" {
  const attackerPower = calculateTotalPower(attacker);
  const defenderPower = calculateTotalPower(defender);
  const powerDiff = defenderPower - attackerPower;

  if (powerDiff < -20) return "easy";
  if (powerDiff < 0) return "medium";
  if (powerDiff < 20) return "hard";
  return "extreme";
}
