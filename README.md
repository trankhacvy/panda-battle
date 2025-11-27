# Bamboo Panda Battles

A turn-based panda battle game built with Next.js 15, React 19, and Solana smart contracts. Features panda generation, breeding, and blockchain-enabled gameplay.

## Project Overview

Bamboo Panda Battles is a full-stack Web3 game combining:

- **Frontend**: Next.js 15 App Router with React 19 and Tailwind CSS 4
- **Blockchain**: Solana smart contracts with Anchor framework
- **Features**: Panda creation, breeding, battles, leaderboards, and Bamboo token economy

## Quick Start

### Frontend Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build --turbopack

# Run linting
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Smart Contract Development

```bash
cd program

# Install dependencies
pnpm install

# Build program
anchor build

# Run tests
anchor test

# Deploy to Devnet
anchor deploy --provider.cluster devnet
```

## Project Structure

```
.
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                # Root layout with AppShell
│   ├── page.tsx                  # Home page
│   ├── forge/page.tsx            # Panda generation
│   ├── battle/page.tsx           # Battle arena
│   └── hub/page.tsx              # Leaderboard & community
├── components/                    # React components
│   ├── layout/                   # AppShell, Navigation, Theme
│   ├── forge/                    # Panda generation UI
│   ├── battle/                   # Battle UI components
│   └── ui/                       # Shared UI components
├── lib/                          # Utilities & helpers
│   ├── mock/pandas.ts            # Mock panda data & helpers
│   └── utils.ts                  # Utility functions
├── program/                      # Solana smart contracts
│   ├── programs/panda-battle/src/
│   │   ├── lib.rs               # Program entry
│   │   ├── state/               # Account structures
│   │   │   ├── panda.rs         # PandaNFT account
│   │   │   └── breeding.rs      # BreedingSession account
│   │   ├── instructions/        # Program instructions
│   │   │   ├── forge_panda.rs   # Create panda
│   │   │   ├── start_breeding.rs
│   │   │   └── complete_breeding.rs
│   │   ├── constants.rs         # Economic parameters
│   │   ├── error.rs             # Error codes
│   │   └── utils.rs             # Utility functions
│   └── tests/panda-battle.ts    # Integration tests
└── docs/                        # Documentation
    ├── PRD.md                   # Product requirements
    ├── SYSTEM_DESIGN.md         # System architecture
    ├── MOCK_DATA.md             # Data structures
    ├── UI_SPECS.md              # UI specifications
    ├── SOLANA_CONTRACTS.md      # Smart contract architecture
    └── PANDA_BREEDING_IMPLEMENTATION.md  # Breeding details
```

## Features

### Panda Generation (Forge)
- Create custom pandas with name and traits
- 4 panda types: Bamboo, Red, Giant, Snow
- Attribute stats: Attack, Defense, Speed, Intellect (1-100)
- Rarity system: Common → Rare → Epic → Legendary
- Dynamic stat meter animations

### Panda Breeding
- Breed two compatible pandas to create offspring
- Trait inheritance with genetic variation (±5 mutation)
- Generation tracking (max 10 generations)
- Breeding cooldowns (7 days between breedings)
- Limited breed count per panda (max 5)
- Offspring rarity boost (0-10%)

### Battles
- Turn-based panda combat
- 4 move types: Attack, Defend, Technique, Special
- Move cooldowns and damage calculation
- Battle history and replay
- Rating system (Elo-based)

### Leaderboard
- Global player rankings
- Win/loss statistics
- Rating progression
- Player profiles

### Economy
- Bamboo token rewards
- Transaction costs for panda operations
- Battle rewards distribution

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 15 |
| **Runtime** | React | 19 |
| **Language** | TypeScript | 5.9+ |
| **Styling** | Tailwind CSS | 4 (@tailwindcss/postcss) |
| **Blockchain** | Solana | - |
| **Smart Contracts** | Anchor | 0.31.0 |
| **Package Manager** | pnpm | Latest |

## Documentation

- **[BREEDING_README.md](./BREEDING_README.md)** - Panda breeding system guide
- **[PANDA_BREEDING_IMPLEMENTATION.md](./docs/PANDA_BREEDING_IMPLEMENTATION.md)** - Detailed breeding implementation
- **[SOLANA_CONTRACTS.md](./docs/SOLANA_CONTRACTS.md)** - Smart contract architecture
- **[SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md)** - System architecture overview
- **[MOCK_DATA.md](./docs/MOCK_DATA.md)** - Data structure definitions
- **[UI_SPECS.md](./docs/UI_SPECS.md)** - UI specifications
- **[PRD.md](./docs/PRD.md)** - Product requirements

## Smart Contract Instructions

### Forge Panda
Create a new generation-0 panda with specified traits.

```rust
forge_panda(
    name: String,              // 1-20 chars
    panda_type: PandaType,     // bamboo | red | giant | snow
    attack: u8,                // 1-100
    defense: u8,               // 1-100
    speed: u8,                 // 1-100
    intellect: u8,             // 1-100
    primary_color: [u8; 3],    // RGB
    secondary_color: [u8; 3],  // RGB
    accent_color: [u8; 3],     // RGB
)
```

### Start Breeding
Initiate a breeding session between two pandas.

```rust
start_breeding(breeding_id: [u8; 32])
```

### Complete Breeding
Finalize breeding and create offspring.

```rust
complete_breeding(
    offspring_name: String,
    offspring_rarity_boost: u8  // 0-10
)
```

## Key Constants

| Parameter | Value | Notes |
|-----------|-------|-------|
| Forge Cost | 100 Bamboo | Create new panda |
| Breeding Cost | 50 Bamboo | Start breeding session |
| Offspring Mint Cost | 25 Bamboo | Complete breeding |
| Breeding Cooldown | 7 days | Between breedings |
| Session Timeout | 48 hours | Complete breeding window |
| Max Breed Count | 5 | Per panda |
| Max Generations | 10 | Lineage depth |
| Max Pandas/Player | 100 | Player collection limit |
| Max Total Pandas | 10,000 | Global supply cap |

## Events

The smart contract emits three main events:

### PandaForged
Emitted when a new panda is created.

```rust
pub struct PandaForged {
    pub panda_mint: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub panda_type: PandaType,
    pub rarity: Rarity,
    pub timestamp: i64,
}
```

### BreedingStarted
Emitted when a breeding session begins.

```rust
pub struct BreedingStarted {
    pub breeding_id: [u8; 32],
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub player: Pubkey,
    pub timestamp: i64,
}
```

### OffspringCreated
Emitted when breeding completes and offspring is created.

```rust
pub struct OffspringCreated {
    pub breeding_id: [u8; 32],
    pub offspring_mint: Pubkey,
    pub offspring_name: String,
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub offspring_generation: u8,
    pub owner: Pubkey,
    pub timestamp: i64,
}
```

## Testing

### Frontend Tests
```bash
pnpm test
```

### Smart Contract Tests
```bash
cd program
anchor test
```

Test coverage includes:
- Panda creation and validation
- Breeding session management
- Trait inheritance accuracy
- Constraint enforcement
- Error handling
- Event emission
- Utility functions

## Error Handling

The smart contract includes comprehensive error codes for:
- Panda ownership validation
- Breeding constraint violations
- Generation/breed count limits
- Session expiration
- Supply cap enforcement
- Token transfer failures
- Invalid input validation

See [error.rs](./program/programs/panda-battle/src/error.rs) for complete error list.

## Deployment

### Local Development
```bash
# Frontend
pnpm dev

# Smart contracts (in separate terminal)
cd program
anchor test
```

### Devnet
```bash
cd program
anchor deploy --provider.cluster devnet
```

### Testnet
```bash
cd program
anchor deploy --provider.cluster testnet
```

### Mainnet
- Security audit required
- Multisig governance setup
- Production deployment

## Contributing

1. Create feature branch: `git checkout -b feat-feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feat-feature-name`
4. Submit pull request

## Code Standards

- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- No commented-out code without justification
- Use TypeScript for type safety
- Follow Rust naming conventions (snake_case for functions)

## Performance

- Frontend: Optimized with Next.js built-in features
- Smart Contracts: Anchor framework for efficient bytecode
- Database: Mock data in MVP, blockchain state in production

## Security

- Input validation on all user inputs
- Authorization checks on all state-modifying operations
- PDAs for unforgeable account derivation
- No hardcoded addresses (except program IDs)
- Comprehensive error handling

## License

MIT

## Support

For issues and questions:
1. Check documentation in `/docs`
2. Review existing tests for examples
3. Submit issue with reproduction steps

## Roadmap

### Phase 1 ✅
- [x] Panda creation (forge)
- [x] Panda breeding system
- [x] Trait inheritance
- [x] Smart contract implementation
- [x] Test coverage

### Phase 2 (Planned)
- [ ] Battle engine on-chain
- [ ] Leaderboard system
- [ ] Player profiles
- [ ] Reward distribution

### Phase 3 (Future)
- [ ] Marketplace
- [ ] Breeding guilds
- [ ] Seasonal events
- [ ] Advanced genetics

## Related Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Anchor Framework](https://www.anchor-lang.com)
- [Solana Documentation](https://docs.solana.com)
