use crate::*;
use anchor_lang::prelude::*;

/// Generates a random u8 value between min and max (inclusive)
/// Uses ephemeral VRF for entropy
pub fn generate_random_stat(min: u8, max: u8, seed_index: u8) -> Result<u8> {
    require!(min <= max, ErrorCode::InvalidStatValue);
    
    let range = (max - min + 1) as u32;
    
    // Simple deterministic randomization for stats using seed_index
    // In production, this would use ephemeral-vrf-sdk for true VRF
    let clock = Clock::get()?;
    let seed = clock.unix_timestamp.wrapping_add(seed_index as i64);
    let random = ((seed as u32).wrapping_mul(1103515245).wrapping_add(12345)) % range;
    
    Ok(min + random as u8)
}

/// Inherits and mutates parent stats to create offspring traits
pub fn inherit_traits(
    parent_male_attack: u8,
    parent_male_defense: u8,
    parent_male_speed: u8,
    parent_male_intellect: u8,
    parent_female_attack: u8,
    parent_female_defense: u8,
    parent_female_speed: u8,
    parent_female_intellect: u8,
) -> Result<(u8, u8, u8, u8)> {
    // Average parent stats
    let avg_attack = ((parent_male_attack as u16 + parent_female_attack as u16) / 2) as u8;
    let avg_defense = ((parent_male_defense as u16 + parent_female_defense as u16) / 2) as u8;
    let avg_speed = ((parent_male_speed as u16 + parent_female_speed as u16) / 2) as u8;
    let avg_intellect = ((parent_male_intellect as u16 + parent_female_intellect as u16) / 2) as u8;

    // Add mutation with ±5 variance
    let attack = apply_mutation(avg_attack, 5)?;
    let defense = apply_mutation(avg_defense, 5)?;
    let speed = apply_mutation(avg_speed, 5)?;
    let intellect = apply_mutation(avg_intellect, 5)?;

    Ok((attack, defense, speed, intellect))
}

/// Applies ±variance mutation to a stat value
fn apply_mutation(stat: u8, variance: u8) -> Result<u8> {
    let clock = Clock::get()?;
    let random_factor = ((clock.unix_timestamp as u32).wrapping_mul(1103515245) % 100) as i16;
    
    let mutation = if random_factor < 50 {
        -(random_factor as i16 % (variance as i16 + 1))
    } else {
        (random_factor as i16 % (variance as i16 + 1))
    };

    let mutated = (stat as i16 + mutation).max(1).min(100) as u8;
    Ok(mutated)
}

/// Calculates base HP from stats
pub fn calculate_base_hp(attack: u8, defense: u8) -> u16 {
    let base = 100u32;
    let attack_bonus = (attack as u32 * 2) / 10;
    let defense_bonus = (defense as u32 * 3) / 10;
    (base + attack_bonus + defense_bonus).min(150) as u16
}

/// Generates a deterministic breeding session ID from parents and timestamp
pub fn generate_breeding_session_id(
    player: &Pubkey,
    parent_male: &Pubkey,
    parent_female: &Pubkey,
    timestamp: i64,
) -> [u8; 32] {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    player.hash(&mut hasher);
    parent_male.hash(&mut hasher);
    parent_female.hash(&mut hasher);
    timestamp.hash(&mut hasher);
    
    let hash = hasher.finish();
    let mut result = [0u8; 32];
    result[0..8].copy_from_slice(&hash.to_le_bytes());
    result
}

/// Validates panda name constraints
pub fn validate_panda_name(name: &str) -> Result<()> {
    require!(
        name.len() > 0 && name.len() <= 20,
        ErrorCode::InvalidPandaName
    );
    require!(
        name.chars().all(|c| c.is_alphanumeric() || c == ' '),
        ErrorCode::InvalidPandaName
    );
    Ok(())
}

/// Validates stat values are within acceptable range
pub fn validate_stats(attack: u8, defense: u8, speed: u8, intellect: u8) -> Result<()> {
    for stat in &[attack, defense, speed, intellect] {
        require!(*stat > 0 && *stat <= 100, ErrorCode::InvalidStatValue);
    }
    Ok(())
}
