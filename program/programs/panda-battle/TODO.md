# Implementation Tasks

## Phase 1: Cleanup (No deps) ✅ COMPLETED
- [x] Remove luck attr from PlayerState/battle_score (program/programs/panda-battle/src/state/mod.rs, instructions/player.rs)
- [x] Remove endurance → map to INT (u8), update PlayerState/battles.
- [x] Remove steal mechanic: drop AttributeType enum/use, steal logic in initiate_battle.
- [x] Remove idle_decay: delete apply_idle_decay instr/crank.rs, config field, last_decay field.
- [x] Remove min_battles=5 for claim_reward.

## Phase 2: State Updates (After cleanup) ✅ COMPLETED
- [x] Rename GameConfig → GlobalConfig (fields: admin, token_mint, base configs sans steal/decay).
- [x] Round (GameRound): add entry_fee u64, attack_pack_price u64, duration_secs i64, entry_hourly_inc_pct u8=1, leaderboard_reveal_ts i64.
- [x] PlayerState: str/agi/int u8 (24B), level u8=0, xp u32=0, points u16=0, rerolls_used u8=0, packs_bought_hour u8=0, last_pack_hour i64=-1. max_turns=50. Drop luck/endurance/steal-related.
- [x] Update Cargo.toml deps if needed (anchor-spl, vrf).
- [x] Added Leaderboard state for Phase 5 (top 20 entries).

## Phase 3: Core Updates (After states) ✅ COMPLETED
- [x] Update `request_join_round`+callback: continuous fee=entry*(1+inc/100 * hours_since_start).ceil(). VRF: 3*u8%11+5. Early +2 turns <6h.
- [x] New `reroll_attributes`: fixed $1 fee (hardcode/config), rerolls_used<3, VRF overwrite attrs.
- [x] Update `purchase_turns` → `buy_attack_packs(num_packs: u8 1-5)`: calc price=pack_price*(1+0.5*packs_bought_hour), transfer, +10*num turns (cap50), ++packs_bought_hour, update last_pack_hour=Clock.get()?.unix_timestamp.
- [x] Crank `reset_packs_if_new_hour`: if Clock >= last+3600, packs_bought=0.

## Phase 4: Battle & Progression (After states) ✅ COMPLETED
- [x] Replace `initiate_battle`: no sim, just --turn, VRF request callback_resolve_battle (accounts: attacker_state mut, defender_state mut, round).
- [x] New `callback_resolve_battle`: full sim (HP calc, loop max10: derive_u8 turn_tie/dodge/crit/dmg, f32→u16). Update pts/xp, check_levelup (thresholds const array, round-robin boost level%3→str/agi/int +=1 (for +0.5 equiv), cap15). Events: battle_result, level_up.

## Phase 5: Advanced Features (After battle) ✅ COMPLETED
- [x] Crank `reveal_leaderboard` (after reveal_ts): compute/sort top20 points → store Leaderboard PDA vec<(player_pubkey, points)>[20].
- [x] Crank `hourly_jackpot` (post-reveal, hourly?): VRF weighted pick (inv rank odds), rand pct 0.5-1%, transfer %pool to winner.
- [x] Off-chain leaderboard query alternative (scan PDAs via remaining_accounts).

## Phase 6: Endgame (After prizes logic) ✅ COMPLETED
- [x] Update `end_round`: set inactive.
- [x] Crank `distribute_prizes`: if !processed && inactive: calc top20 80% prop(points/sum_top), rest 20%/player_count. Store shares in PlayerState `prize_share u64`. Set processed.
- [x] Update `claim_reward` → `claim_prize`: transfer share if unclaimed.

## Phase 7: Polish/Tests
- [ ] Add events everywhere (Anchor #[event]).
- [x] Anchor tests: Organized into admin.test.ts, player.test.ts, crank.test.ts with 1-2 test cases per instruction.
- [x] Update admin instr: create_round takes per-round params (entry_fee, attack_pack_price, duration_secs, entry_hourly_inc_pct).

**Notes**: VRF: ephemeral_vrf_sdk, client_seed[32]. Token: SPL ATA vault PDA-signed. Security: PDA seeds [round_num, player], reentrancy turn pre-deduct. Gas: tight loops, u8/f32 careful.

Prioritize Phase 1-2 → build/test → 3-4 (core loop).