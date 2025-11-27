use anchor_lang::prelude::*;
use crate::state::{BattleState, BattleStatus, MoveType, TurnOutcome};
use crate::events::TurnSubmitted;
use crate::error::ErrorCode;
use crate::utils::{calculate_damage, get_opponent_move, get_base_damage};
use crate::constants::SPECIAL_MOVE_COOLDOWN;

#[derive(Accounts)]
pub struct SubmitTurn<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    /// Battle state account
    #[account(mut)]
    pub battle_state: Account<'info, BattleState>,
}

pub fn handler(
    ctx: Context<SubmitTurn>,
    player_move: u8,
) -> Result<()> {
    let player = ctx.accounts.player.key();
    let battle_state = &mut ctx.accounts.battle_state;

    // Validate battle is in progress
    require!(
        battle_state.status == BattleStatus::InProgress,
        ErrorCode::BattleNotInProgress
    );

    // Validate player is participant
    let is_player1 = player == battle_state.player_pubkey;
    let is_player2 = player == battle_state.opponent_pubkey;
    require!(is_player1 || is_player2, ErrorCode::Unauthorized);

    // Validate move type
    let player_move_type = match player_move {
        0 => MoveType::Attack,
        1 => MoveType::Defend,
        2 => MoveType::Technique,
        3 => MoveType::Special,
        _ => return Err(ErrorCode::InvalidMove.into()),
    };

    // Check cooldowns for special move
    if player_move_type == MoveType::Special {
        if is_player1 {
            require!(
                battle_state.player_special_cooldown == 0,
                ErrorCode::MoveOnCooldown
            );
        } else {
            require!(
                battle_state.opponent_special_cooldown == 0,
                ErrorCode::MoveOnCooldown
            );
        }
    }

    // Generate opponent move deterministically
    let opponent_move_type = if is_player1 {
        get_opponent_move(
            battle_state.opponent_current_hp,
            battle_state.player_current_hp,
            battle_state.opponent_special_cooldown,
            &battle_state.battle_seed,
            battle_state.current_turn,
        )
    } else {
        get_opponent_move(
            battle_state.player_current_hp,
            battle_state.opponent_current_hp,
            battle_state.player_special_cooldown,
            &battle_state.battle_seed,
            battle_state.current_turn,
        )
    };

    // Calculate damage
    let (player_damage, opponent_damage) = if is_player1 {
        let p1_dmg = calculate_damage(
            player_move_type,
            75, // TODO: Get from player panda stats
            opponent_move_type,
            &battle_state.battle_seed,
            battle_state.current_turn,
        );
        let p2_dmg = calculate_damage(
            opponent_move_type,
            75, // TODO: Get from opponent panda stats
            player_move_type,
            &battle_state.battle_seed,
            battle_state.current_turn,
        );
        (p1_dmg, p2_dmg)
    } else {
        let p2_dmg = calculate_damage(
            player_move_type,
            75,
            opponent_move_type,
            &battle_state.battle_seed,
            battle_state.current_turn,
        );
        let p1_dmg = calculate_damage(
            opponent_move_type,
            75,
            player_move_type,
            &battle_state.battle_seed,
            battle_state.current_turn,
        );
        (p1_dmg, p2_dmg)
    };

    // Apply damage
    battle_state.player_current_hp = battle_state
        .player_current_hp
        .saturating_sub(opponent_damage);
    battle_state.opponent_current_hp = battle_state
        .opponent_current_hp
        .saturating_sub(player_damage);

    // Update cooldowns
    if is_player1 && player_move_type == MoveType::Special {
        battle_state.player_special_cooldown = SPECIAL_MOVE_COOLDOWN;
    } else if battle_state.player_special_cooldown > 0 {
        battle_state.player_special_cooldown -= 1;
    }

    if !is_player1 && opponent_move_type == MoveType::Special {
        battle_state.opponent_special_cooldown = SPECIAL_MOVE_COOLDOWN;
    } else if battle_state.opponent_special_cooldown > 0 {
        battle_state.opponent_special_cooldown -= 1;
    }

    // Record turn outcome
    let turn_outcome = TurnOutcome {
        turn_number: battle_state.current_turn,
        player_move: if is_player1 { player_move_type } else { opponent_move_type },
        opponent_move: if is_player1 { opponent_move_type } else { player_move_type },
        player_damage_dealt: if is_player1 { player_damage } else { opponent_damage },
        opponent_damage_dealt: if is_player1 { opponent_damage } else { player_damage },
        effects_applied: 0,
        player_hp_after: battle_state.player_current_hp,
        opponent_hp_after: battle_state.opponent_current_hp,
    };

    battle_state.turn_log.push(turn_outcome);
    battle_state.current_turn += 1;

    // Emit event
    emit!(TurnSubmitted {
        battle_id: battle_state.battle_id,
        turn_number: battle_state.current_turn - 1,
        player_move,
        opponent_move: match opponent_move_type {
            MoveType::Attack => 0,
            MoveType::Defend => 1,
            MoveType::Technique => 2,
            MoveType::Special => 3,
        },
        player_damage,
        opponent_damage,
        player_hp: battle_state.player_current_hp,
        opponent_hp: battle_state.opponent_current_hp,
        timestamp: Clock::get()?.unix_timestamp,
    });

    // Check if battle is over
    if battle_state.player_current_hp == 0 {
        battle_state.status = BattleStatus::OpponentWon;
        battle_state.ended_at = Clock::get()?.unix_timestamp;
        msg!("Battle ended - Opponent wins!");
    } else if battle_state.opponent_current_hp == 0 {
        battle_state.status = BattleStatus::PlayerWon;
        battle_state.ended_at = Clock::get()?.unix_timestamp;
        msg!("Battle ended - Player wins!");
    } else if battle_state.current_turn >= battle_state.max_turns {
        // Draw after max turns
        battle_state.status = BattleStatus::InProgress; // Consider as draw or continue logic
        battle_state.ended_at = Clock::get()?.unix_timestamp;
        msg!("Max turns reached - Battle is a draw");
    }

    Ok(())
}
