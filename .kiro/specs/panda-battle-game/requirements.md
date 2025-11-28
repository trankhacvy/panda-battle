# Requirements Document

## Introduction

Panda Battle is a turn-based PvP mobile game built on Solana blockchain that combines strategic combat with play-to-earn economics. Players control pandas with randomized attributes, engage in battles to steal opponent attributes, and compete for positions on a dynamic leaderboard to earn rewards from a communal prize pool. The game emphasizes short session lengths (under 10 minutes), fair competition through daily resets, and social interaction through alliances and negotiations.

## Glossary

- **Panda Battle System**: The core game system managing all game state, combat, and economic transactions
- **Player**: A user who has entered the game by paying an entry fee and received a randomized panda
- **Panda**: A player's game character with four attributes (Strength, Speed, Endurance, Luck)
- **Attribute**: A numeric stat that determines combat effectiveness and can be stolen through battles
- **Turn**: A consumable resource required to initiate battles, regenerated hourly
- **Battle**: A combat encounter between two pandas where the winner steals an attribute from the loser
- **Leaderboard**: A ranking system that displays player positions and determines reward eligibility
- **Prize Pool**: A communal fund accumulated from entry fees and purchases, distributed to top performers
- **Steal**: The mechanic where a battle winner takes a percentage of one attribute from the loser
- **Entry Fee**: The initial payment required to join a game round
- **Round**: A daily game cycle that resets attributes and distributes prizes
- **Idle Decay**: Automatic attribute reduction applied to inactive players
- **Top 20**: The highest-ranked players who are visible on the leaderboard and eligible for hourly rewards

## Requirements

### Requirement 1: Player Entry and Initialization

**User Story:** As a new player, I want to enter the game by paying an entry fee, so that I receive a panda with randomized attributes and can start competing.

#### Acceptance Criteria

1. WHEN a player submits an entry fee within the first 6 hours of a round, THEN the Panda Battle System SHALL accept the base entry fee amount and create a player account
2. WHEN a player submits an entry fee between 6-12 hours into a round, THEN the Panda Battle System SHALL require a 25% increased entry fee and reduce starting attributes by 10%
3. WHEN a player submits an entry fee after 12 hours into a round, THEN the Panda Battle System SHALL require a 50% increased entry fee, reduce starting attributes by 20%, and reduce starting turns by 1
4. WHEN a player account is created, THEN the Panda Battle System SHALL generate four randomized attributes (Strength, Speed, Endurance, Luck) within defined ranges
5. WHEN a player successfully enters, THEN the Panda Battle System SHALL add 100% of the entry fee to the prize pool
6. WHEN a player enters within the first 6 hours, THEN the Panda Battle System SHALL grant bonus starting turns

### Requirement 2: Turn Economy and Regeneration

**User Story:** As a player, I want to receive free turns periodically and have the option to purchase additional turns, so that I can engage in battles throughout the day.

#### Acceptance Criteria

1. WHEN one hour passes since the last turn regeneration, THEN the Panda Battle System SHALL add 3 turns to each active player's turn balance
2. WHEN turn regeneration occurs, THEN the Panda Battle System SHALL enforce a maximum turn storage cap to prevent unlimited accumulation
3. WHEN a player purchases the first extra turn, THEN the Panda Battle System SHALL deduct the base purchase price and add 100% to the prize pool
4. WHEN a player purchases the second extra turn, THEN the Panda Battle System SHALL deduct 1.5 times the base price and add 100% to the prize pool
5. WHEN a player purchases the third or subsequent extra turn, THEN the Panda Battle System SHALL deduct 2 times or more the base price and add 100% to the prize pool
6. WHEN turn regeneration completes, THEN the Panda Battle System SHALL send a notification to the player

### Requirement 3: Combat System and Battle Resolution

**User Story:** As a player, I want to initiate battles against other players and have combat resolved based on our attributes, so that I can compete strategically.

#### Acceptance Criteria

1. WHEN a player initiates a battle, THEN the Panda Battle System SHALL deduct 1 turn from the player's turn balance
2. WHEN combat is resolved, THEN the Panda Battle System SHALL calculate a battle score for each panda using the formula: (Strength × weight) + (Speed × weight) + (Endurance × weight) + (Luck modifier)
3. WHEN battle scores are calculated, THEN the Panda Battle System SHALL determine the winner as the panda with the higher battle score, with randomness applied to allow occasional upsets
4. WHEN a battle winner is determined, THEN the Panda Battle System SHALL update both players' win/loss records
5. WHEN a battle completes, THEN the Panda Battle System SHALL display the battle results to both players within 1 minute
6. WHEN a player in the Top 20 is attacked, THEN the Panda Battle System SHALL apply a 20% vulnerability modifier to their defensive calculations

### Requirement 4: Attribute Stealing Mechanism

**User Story:** As a battle winner, I want to steal a percentage of one attribute from my opponent, so that I can strengthen my panda and weaken competitors.

#### Acceptance Criteria

1. WHEN a battle is won, THEN the Panda Battle System SHALL allow the winner to select one attribute (Strength, Speed, Endurance, or Luck) from the loser
2. WHEN an attribute is selected for stealing, THEN the Panda Battle System SHALL transfer 10-20% of that attribute value from the loser to the winner
3. WHEN an attribute steal occurs, THEN the Panda Battle System SHALL enforce a maximum steal cap per attribute per battle to prevent excessive losses
4. WHEN an attribute is stolen, THEN the Panda Battle System SHALL update both pandas' attribute values immediately
5. WHEN a player's attribute is stolen, THEN the Panda Battle System SHALL send a notification to the affected player

### Requirement 5: Leaderboard System and Rankings

**User Story:** As a player, I want to see my ranking compared to other players, so that I can track my progress and identify strategic targets.

#### Acceptance Criteria

1. WHEN a battle completes, THEN the Panda Battle System SHALL recalculate player rankings based on total attribute sum or win/loss ratio
2. WHEN 4 hours pass since the last leaderboard reveal, THEN the Panda Battle System SHALL publicly display the current Top 20 player positions
3. WHEN a player enters the Top 20, THEN the Panda Battle System SHALL send a notification to that player
4. WHEN a player falls out of the Top 20, THEN the Panda Battle System SHALL send a notification to that player
5. WHEN the leaderboard is displayed, THEN the Panda Battle System SHALL show cosmetic flair for top positions without revealing mid-tier and bottom player identities
6. WHEN a player views the leaderboard, THEN the Panda Battle System SHALL display each visible player's current attributes to enable strategic targeting

### Requirement 6: Prize Pool Management and Distribution

**User Story:** As a competitive player, I want to earn rewards from the prize pool based on my performance, so that I am incentivized to play strategically.

#### Acceptance Criteria

1. WHEN an hour passes, THEN the Panda Battle System SHALL randomly select one player from the Top 20 and distribute 0.1% of the prize pool to that player
2. WHEN a daily round ends, THEN the Panda Battle System SHALL distribute the remaining prize pool percentage to players based on their final rankings
3. WHEN prize distribution occurs, THEN the Panda Battle System SHALL only include players who completed the minimum activity requirement of 5 battles per day
4. WHEN a player receives a prize, THEN the Panda Battle System SHALL transfer the reward amount to the player's wallet
5. WHEN all distributions complete, THEN the Panda Battle System SHALL reset the prize pool to zero for the new round

### Requirement 7: Anti-Idle System and Attribute Decay

**User Story:** As an active player, I want inactive players to be penalized, so that the competition remains fair and engaged.

#### Acceptance Criteria

1. WHEN one hour passes without a player initiating any battles, THEN the Panda Battle System SHALL reduce all of that player's attributes by 5%
2. WHEN attribute decay is applied, THEN the Panda Battle System SHALL send a notification to the affected player warning them of inactivity
3. WHEN a daily round ends, THEN the Panda Battle System SHALL check each player's battle count against the minimum requirement of 5 battles
4. WHEN a player fails to meet the minimum activity requirement, THEN the Panda Battle System SHALL forfeit that player's entry fee back to the prize pool
5. WHEN a player fails to meet the minimum activity requirement, THEN the Panda Battle System SHALL exclude that player from prize distribution eligibility

### Requirement 8: Daily Round Reset and Cycle Management

**User Story:** As a player, I want the game to reset daily with fresh attributes, so that I have equal opportunities each day regardless of previous performance.

#### Acceptance Criteria

1. WHEN a daily round ends, THEN the Panda Battle System SHALL reset all player attributes to new randomized values
2. WHEN a daily round ends, THEN the Panda Battle System SHALL distribute prizes to eligible players before resetting
3. WHEN a new daily round begins, THEN the Panda Battle System SHALL reset the leaderboard rankings
4. WHEN a new daily round begins, THEN the Panda Battle System SHALL begin accepting new entry fees for the prize pool
5. WHEN a daily round reset occurs, THEN the Panda Battle System SHALL preserve player win/loss records for historical tracking

### Requirement 9: Opponent Selection and Visibility

**User Story:** As a player, I want to scout and select my battle opponents strategically, so that I can maximize my chances of winning and climbing the leaderboard.

#### Acceptance Criteria

1. WHEN a player views available opponents, THEN the Panda Battle System SHALL display all Top 20 players with their current attributes
2. WHEN a player views available opponents, THEN the Panda Battle System SHALL display mid-tier players with partial visibility of their attributes
3. WHEN a player views available opponents, THEN the Panda Battle System SHALL hide bottom-tier player identities and attributes
4. WHEN a player selects an opponent, THEN the Panda Battle System SHALL allow the player to initiate a battle if they have available turns
5. WHEN a player is attacked, THEN the Panda Battle System SHALL send a notification to the defender with the attacker's identity

### Requirement 10: Attribute Upgrade and Modification System

**User Story:** As a player, I want to purchase attribute modifications, so that I can adjust my strategy and improve my competitive position.

#### Acceptance Criteria

1. WHEN a player purchases an attribute reroll, THEN the Panda Battle System SHALL randomize one selected attribute within defined ranges
2. WHEN a player purchases a temporary shield, THEN the Panda Battle System SHALL block steal attempts on protected attributes for a specified number of battles
3. WHEN a player purchases an upgrade, THEN the Panda Battle System SHALL deduct the purchase price from the player's wallet
4. WHEN a player purchases an upgrade, THEN the Panda Battle System SHALL contribute a percentage of the purchase price to the prize pool
5. WHEN a temporary shield expires, THEN the Panda Battle System SHALL notify the player that protection has ended

### Requirement 11: Social Features and Communication

**User Story:** As a player, I want to communicate with other players and form alliances, so that I can coordinate strategies and enhance the social experience.

#### Acceptance Criteria

1. WHEN a player sends a chat message, THEN the Panda Battle System SHALL deliver the message to the intended recipient within 5 seconds
2. WHEN a player pokes an idle friend, THEN the Panda Battle System SHALL send a notification to the idle player
3. WHEN a player receives a poke, THEN the Panda Battle System SHALL grant a small revive buff to that player's attributes
4. WHEN players form an informal alliance, THEN the Panda Battle System SHALL allow them to coordinate through the chat system
5. WHEN a player views another player's profile, THEN the Panda Battle System SHALL display that player's win/loss record and current leaderboard position

### Requirement 12: Notification System

**User Story:** As a player, I want to receive timely notifications about game events, so that I can respond to threats and opportunities.

#### Acceptance Criteria

1. WHEN a player is attacked, THEN the Panda Battle System SHALL send a push notification with the attacker's identity and battle outcome
2. WHEN a player's turns regenerate to full, THEN the Panda Battle System SHALL send a notification indicating turns are available
3. WHEN a leaderboard reveal occurs every 4 hours, THEN the Panda Battle System SHALL send notifications to all Top 20 players
4. WHEN a player enters or exits the Top 20, THEN the Panda Battle System SHALL send an immediate notification with the position change
5. WHEN a player has been idle for 2 hours, THEN the Panda Battle System SHALL send a warning notification about impending attribute decay

### Requirement 13: Match Betting System

**User Story:** As a spectator, I want to wager on other players' battles, so that I can participate in the game economy even when not fighting.

#### Acceptance Criteria

1. WHEN a player places a bet on another player's battle, THEN the Panda Battle System SHALL deduct the wager amount from the bettor's wallet
2. WHEN a bet is placed, THEN the Panda Battle System SHALL hold the wager amount until the battle resolves
3. WHEN a battle with active bets completes, THEN the Panda Battle System SHALL distribute winnings to correct bettors
4. WHEN winnings are distributed, THEN the Panda Battle System SHALL deduct a commission percentage and add it to the prize pool
5. WHEN a player wins a bet, THEN the Panda Battle System SHALL transfer the winnings to the player's wallet

### Requirement 14: Mini-Events and Special Activities

**User Story:** As a player, I want to participate in hourly mini-events, so that I can earn temporary buffs and additional rewards.

#### Acceptance Criteria

1. WHEN a mini-event starts, THEN the Panda Battle System SHALL notify all active players of the event availability
2. WHEN a player enters a mini-event, THEN the Panda Battle System SHALL deduct the entry fee and add 100% to the prize pool
3. WHEN a mini-event completes, THEN the Panda Battle System SHALL determine winners based on event-specific criteria
4. WHEN a mini-event winner is determined, THEN the Panda Battle System SHALL grant temporary attribute buffs or small prize pool percentages
5. WHEN a mini-event ends, THEN the Panda Battle System SHALL notify all participants of the results

### Requirement 15: Wallet Integration and Transaction Management

**User Story:** As a player, I want secure wallet integration for all financial transactions, so that my funds and rewards are safely managed.

#### Acceptance Criteria

1. WHEN a player connects their wallet, THEN the Panda Battle System SHALL verify the wallet signature and establish a secure session
2. WHEN a transaction is initiated, THEN the Panda Battle System SHALL request wallet approval before executing
3. WHEN a transaction completes, THEN the Panda Battle System SHALL update the player's balance and transaction history
4. WHEN a prize is distributed, THEN the Panda Battle System SHALL transfer SOL tokens to the player's connected wallet address
5. WHEN a transaction fails, THEN the Panda Battle System SHALL notify the player with a clear error message and rollback any partial state changes
