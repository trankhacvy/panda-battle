# Panda Battle Game Design

## Overview
- **Entry**: Pay $1.99 to join (buy Panda). Random STR/AGI/INT (5-15 uniform). Reroll $1, max 3x. Fees → prize pool.
- **Gameplay**: 3 attacks/hour (regen), buy packs of 10 for $0.10 base (+50%/pack, max 50/hour). Win=1pt (leaderboard), +3 XP. Target any non-own.
- **Timeline**: 24h rounds. 12h: reveal top20 leaderboard (targets). Post: hourly jackpot (0.5-1% pool, weighted top20). End: top20 80% pool, rest 20% equal.
- **No**: Boss, luck attr, idle decay, steal mechanics.

## Panda Attributes (u8, init 5-15 avg~10, max~15 w/levels)
| Attr | Role |
|------|------|
| STR | Dmg: base * (1 + crit_bonus) |
| AGI | Turn order (higher first, tie VRF), dodge (AGI_diff*10% cap100), crit (AGI*5% cap100) |
| INT | Mitigate: dmg - INT/2 |

- Power: STR+AGI+INT
- HP/battle: 100 + (STR+INT)*2 (120-240)

## Level System (max 10)
XP: win +3, loss 0.
| Level | XP to Next | Cum XP | Total Boost (+0.5 round-robin STR/AGI/INT, cap+5/attr) |
|-------|------------|--------|-------------------------------------------------------|
| 1     | 5          | 5      | +1                                                    |
| 2     | 10         | 15     | +1.5                                                  |
| ...   | ...        | ...    | ...                                                   |
| 10    | -          | 275    | +5                                                    |

Auto-upgrade in battle callback. Emit event.

## Battle Resolution (On-Chain VRF)
`initiate_battle(defender, client_seed[32])` → VRF → `callback_battle`.
- Reset HP.
- Turns (max10): AGI order (tie VRF u8==0). Dodge: VRF<AGI_diff*10%. Crit: VRF<AGI*5% (+50% dmg). Dmg=STR*(1+0.5crit) - INT/2 → u16.
- End: 0HP lose. Tie: higher rem HP or power.
- ~10-20 derive_u8 from seed.

## Accounts
- **GlobalConfig**: admin, base fees, token_mint.
- **Round**: per-round entry_fee/duration/attack_price/hourly_inc_pct=1, prize_pool, timestamps (start/end/leaderboard_reveal).
- **Player**: player/round, str/agi/int u8, level/xp/points u16, turns/max_turns=50 u8, rerolls_used u8<=3, packs_bought_hour u8, last_pack_hour i64, timestamps.

## Admin Instructions
- `init_global_config`
- `create_round(entry_fee, attack_pack_price=0.1$, duration=24h, hourly_inc=1%)`
- `end_round`

## Player/Crank Instructions
- `join_round`: fee=entry*(1+inc*hours_since), VRF attrs +2turns early.
- `reroll`: $1 fixed, <3x, VRF new attrs.
- `buy_attack_packs(num_packs1-5)`: price=pack_price*(1+0.5*packs_bought), +10*n turns, ++packs_bought_hour.
- `regenerate_turns`: +3 if 1h+ since last.
- `reset_packs_hourly`
- `initiate_battle` + `callback_battle` (sim, levelup)
- Cranks: `reveal_leaderboard` (top20), `hourly_jackpot`, `distribute_prizes`
- `claim_prize` post-end.