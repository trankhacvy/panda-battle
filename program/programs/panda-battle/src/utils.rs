use anchor_lang::prelude::*;
use crate::state::MoveType;

/// Calculate base damage for a move
pub fn get_base_damage(move_type: MoveType) -> u16 {
    match move_type {
        MoveType::Attack => 20,
        MoveType::Defend => 0,
        MoveType::Technique => 30,
        MoveType::Special => 50,
    }
}

/// Calculate total damage including attribute bonuses and variance
/// damage = floor((base + attr_bonus) * (1 + variance) * defense_multiplier)
pub fn calculate_damage(
    attacker_move: MoveType,
    attacker_attr: u8,
    defender_move: MoveType,
    seed: &[u8; 32],
    turn_number: u32,
) -> u16 {
    let base_damage = get_base_damage(attacker_move);

    // Calculate attribute bonus (0-50% based on relevant attribute)
    let attr_bonus = ((attacker_attr as u16) / 100) * (base_damage / 2);

    // Calculate variance using seed (-10% to +10%)
    let variance = calculate_variance(seed, turn_number);

    let mut total_damage = (base_damage + attr_bonus) as f32 * (1.0 + variance);

    // Apply defense reduction if defender is defending
    if defender_move == MoveType::Defend {
        total_damage *= 0.5;
    }

    total_damage.floor() as u16
}

/// Calculate variance from seed (-0.1 to 0.1)
fn calculate_variance(seed: &[u8; 32], turn_number: u32) -> f32 {
    // Simple deterministic variance: mix seed with turn number
    let mut hasher = [0u8; 32];
    for i in 0..32 {
        hasher[i] = seed[i].wrapping_add((turn_number >> (i * 8)) as u8);
    }

    // Map first bytes to -0.1 to 0.1 range
    let value = (hasher[0] as f32 / 255.0) - 0.5; // -0.5 to 0.5
    value * 0.2 // -0.1 to 0.1
}

/// Simulate opponent's move deterministically based on battle state
pub fn get_opponent_move(
    opponent_hp: u16,
    player_hp: u16,
    opponent_special_cooldown: u32,
    seed: &[u8; 32],
    turn_number: u32,
) -> MoveType {
    // Simple AI logic: use hash of seed and turn to select move
    let mut hasher = seed.clone();
    for i in 0..32 {
        hasher[i] = hasher[i].wrapping_add((turn_number >> (i * 8)) as u8);
    }

    let hp_ratio = (opponent_hp as f32) / ((opponent_hp as f32) + (player_hp as f32));

    // Weighted move selection based on HP and cooldowns
    let move_value = hasher[0] as u32;

    if opponent_special_cooldown == 0 && move_value % 100 < 25 {
        // 25% chance to use special if available
        MoveType::Special
    } else if hp_ratio < 0.4 && move_value % 100 < 60 {
        // More likely to defend if low HP
        MoveType::Defend
    } else if move_value % 100 < 50 {
        MoveType::Attack
    } else {
        MoveType::Technique
    }
}

/// Calculate Elo rating delta (K-factor = 32)
pub fn calculate_rating_delta(
    player_rating: i32,
    opponent_rating: i32,
    player_won: bool,
) -> i32 {
    const K_FACTOR: f32 = 32.0;

    // Expected score based on rating difference
    let rating_diff = (opponent_rating - player_rating) as f32;
    let expected_score = 1.0 / (1.0 + 10.0_f32.powf(rating_diff / 400.0));

    let actual_score = if player_won { 1.0 } else { 0.0 };

    ((K_FACTOR * (actual_score - expected_score)).round()) as i32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base_damage() {
        assert_eq!(get_base_damage(MoveType::Attack), 20);
        assert_eq!(get_base_damage(MoveType::Defend), 0);
        assert_eq!(get_base_damage(MoveType::Technique), 30);
        assert_eq!(get_base_damage(MoveType::Special), 50);
    }

    #[test]
    fn test_damage_with_defense() {
        let seed = [1u8; 32];
        let damage = calculate_damage(
            MoveType::Attack,
            50,
            MoveType::Defend,
            &seed,
            1,
        );
        // Damage should be reduced by 50% due to defend
        assert!(damage < 20);
    }

    #[test]
    fn test_rating_delta() {
        // Equal rating, winner gains ~16 points
        let delta = calculate_rating_delta(1600, 1600, true);
        assert!(delta > 0 && delta <= 32);

        // Lower rated player wins, gains more
        let delta_upset = calculate_rating_delta(1400, 1600, true);
        assert!(delta_upset > calculate_rating_delta(1600, 1600, true));

        // Higher rated player loses, loses more
        let delta_loss = calculate_rating_delta(1600, 1400, false);
        assert!(delta_loss < calculate_rating_delta(1400, 1400, false));
    }
}
