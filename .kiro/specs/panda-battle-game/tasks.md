# Implementation Plan

## Phase 1: UI Foundation and Game Layout

- [x] 1. Setup game layout structure

  - Create mobile-first responsive container (centered on desktop with max-width)
  - Implement game viewport wrapper that constrains content to mobile dimensions
  - Add empty space styling for desktop views
  - Create base layout component with proper spacing and padding
  - _Requirements: N/A (UI Foundation)_

- [x] 2. Update base components for game aesthetic
  - Modify shadcn Button component with game-style variants (primary, secondary, danger)
  - Update Card component with game-themed borders, shadows, and backgrounds
  - Enhance Input components with game-style focus states and animations
  - Create game-themed Badge and Tag components for stats display
  - Add game-style transitions and hover effects to interactive elements
  - _Requirements: N/A (UI Foundation)_

## Phase 2: Core Screens Implementation

- [ ] 3. Implement splash screen

  - [x] 3.1 Create splash screen component with game logo/branding
    - Design animated panda logo or game title
    - Add loading animation or progress indicator
    - Implement auto-navigation to connect wallet after delay
    - _Requirements: N/A (UI)_

- [x] 4. Implement wallet connection screen

  - [x] 4.1 Create wallet connection UI

    - Design wallet selection interface (Phantom, Solflare, etc.)
    - Add wallet connection buttons with icons
    - Create mock wallet connection handler (returns success)
    - Implement navigation to panda creation after connection
    - _Requirements: 15.1_

  - [x] 4.2 Add connection status feedback
    - Show loading state during connection
    - Display success/error messages
    - Add retry functionality for failed connections
    - _Requirements: 15.1_

- [x] 5. Implement panda creation/mint screen

  - [x] 5.1 Create panda generation UI

    - Design attribute display cards (Strength, Speed, Endurance, Luck)
    - Add randomize/reroll button for attributes
    - Create visual panda representation (avatar/image)
    - Show entry fee information
    - _Requirements: 1.4_

  - [x] 5.2 Implement mock attribute generation
    - Create function to generate random attributes within ranges
    - Display generated attributes with visual bars/indicators
    - Add "Mint Panda" button to confirm and proceed
    - Navigate to home screen after minting
    - _Requirements: 1.4_

## Phase 3: Main Game Navigation

- [x] 6. Implement tabbed navigation layout

  - [x] 6.1 Create bottom tab navigation

    - Design tab bar with icons for Home, Battle, Leaderboard
    - Implement tab switching logic
    - Add active tab highlighting
    - Ensure mobile-friendly touch targets
    - _Requirements: N/A (UI Navigation)_

  - [x] 6.2 Setup tab content containers
    - Create content area for each tab
    - Implement smooth transitions between tabs
    - Add proper scroll handling per tab
    - _Requirements: N/A (UI Navigation)_

## Phase 4: Home Screen Tab

- [x] 7. Implement home screen

  - [x] 7.1 Create main panda display

    - Show player's panda with visual representation
    - Display all four attributes with styled cards/bars
    - Add panda name or identifier
    - Show current rank/position
    - _Requirements: 1.4, 5.1_

  - [x] 7.2 Add turn counter display

    - Create turn balance indicator with icon
    - Show current turns / max turns
    - Add visual indicator for full turns
    - Display time until next turn regeneration
    - _Requirements: 2.1, 2.2_

  - [x] 7.3 Create quick stats panel

    - Display win/loss record
    - Show total battles count
    - Add prize pool ticker/display
    - Show player's current earnings
    - _Requirements: 3.4, 6.1_

  - [x] 7.4 Add quick action buttons
    - "Quick Battle" button to jump to battle tab
    - "Buy Turns" button with pricing info
    - "View Leaderboard" button
    - _Requirements: 2.3, 3.1_

## Phase 5: Battle Screen Tab

- [x] 8. Implement battle screen

  - [x] 8.1 Create opponent selection interface

    - Design opponent list/carousel with cards
    - Show opponent attributes and rank
    - Display opponent visibility based on rank (Top 20, mid-tier, hidden)
    - Add filter/sort options for opponents
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 8.2 Add battle initiation UI

    - Create "Challenge" button for each opponent
    - Show turn cost indicator
    - Add confirmation dialog before battle
    - Display warning if challenging Top 20 player
    - _Requirements: 3.1, 9.4_

  - [x] 8.3 Implement stance selector (if applicable)
    - Create stance selection UI (aggressive, defensive, balanced)
    - Show stance effects on battle stats
    - Add visual indicators for selected stance
    - _Requirements: 3.2_

## Phase 6: Fighting Screen

- [x] 9. Implement battle animation screen

  - [x] 9.1 Create battle arena UI

    - Design split-screen layout showing both pandas
    - Display attacker on left, defender on right
    - Show attributes for both pandas
    - Add battle progress indicator
    - _Requirements: 3.5_

  - [x] 9.2 Implement battle animation sequence

    - Create attack animations (simple transitions/effects)
    - Show score calculation visualization
    - Display winner announcement
    - Add celebration effects for winner
    - _Requirements: 3.3, 3.5_

  - [x] 9.3 Create attribute steal selection

    - Show steal selection UI after battle win
    - Display loser's attributes with steal percentages
    - Allow winner to select attribute to steal
    - Show before/after attribute comparison
    - _Requirements: 4.1, 4.2_

  - [x] 9.4 Add battle results screen
    - Display final battle outcome
    - Show attribute changes for both players
    - Display updated rank/position
    - Add "Battle Again" and "Return Home" buttons
    - _Requirements: 3.5, 4.4_

## Phase 7: Leaderboard Screen Tab

- [x] 10. Implement leaderboard screen

  - [x] 10.1 Create leaderboard table

    - Design ranked list with player cards
    - Show rank, player identifier, total power/attributes
    - Highlight Top 20 with special styling
    - Add cosmetic flair for top positions (crowns, badges)
    - _Requirements: 5.2, 5.5_

  - [x] 10.2 Add player visibility rules

    - Show full details for Top 20 players
    - Display partial info for mid-tier players
    - Hide bottom-tier player identities
    - Highlight current player's position
    - _Requirements: 5.5, 5.6, 9.1, 9.2, 9.3_

  - [x] 10.3 Implement leaderboard interactions
    - Add "Challenge" button for visible players
    - Show player profile on card tap
    - Display win/loss record in profile
    - Add refresh/update indicator
    - _Requirements: 9.4, 11.5_

## Phase 8: Mock Data and State Management

- [x] 11. Create mock data layer

  - [x] 11.1 Setup mock data structure

    - Create mock player data with attributes
    - Generate mock opponent list (20-30 players)
    - Create mock battle history
    - Setup mock leaderboard rankings
    - _Requirements: N/A (Mock Data)_

  - [x] 11.2 Implement mock game state

    - Create Zustand store for game state
    - Add player state (attributes, turns, rank)
    - Implement turn regeneration simulation
    - Add battle result simulation
    - _Requirements: N/A (Mock Data)_

  - [x] 11.3 Create mock battle logic

    - Implement battle score calculation with mock data
    - Simulate winner determination
    - Calculate attribute steal amounts
    - Update player and opponent attributes after battle
    - _Requirements: 3.2, 3.3, 4.2_

  - [x] 11.4 Add mock leaderboard updates
    - Recalculate rankings after battles
    - Update player position in leaderboard
    - Simulate Top 20 changes
    - _Requirements: 5.1_

## Phase 9: Polish and Animations

- [x] 12. Add UI polish and micro-interactions

  - [x] 12.1 Implement loading states

    - Add skeleton loaders for data fetching
    - Create loading spinners for actions
    - Add progress indicators for battles
    - _Requirements: N/A (UI Polish)_

  - [x] 12.2 Add animations and transitions

    - Implement page transition animations
    - Add attribute change animations
    - Create turn regeneration animation
    - Add rank change celebration effects
    - _Requirements: N/A (UI Polish)_

  - [x] 12.3 Implement toast notifications
    - Create notification system for game events
    - Add battle result notifications
    - Show turn regeneration alerts
    - Display rank change notifications
    - _Requirements: 12.1, 12.2, 12.4_

- [x] 13. Responsive design refinement

  - [x] 13.1 Test and fix mobile layouts

    - Verify all screens work on small mobile (320px+)
    - Test on medium mobile (375px+)
    - Ensure touch targets are adequate (44px+)
    - _Requirements: N/A (UI Polish)_

  - [x] 13.2 Optimize desktop centered layout
    - Ensure proper centering on large screens
    - Style empty space areas
    - Add max-width constraints
    - Test on various desktop resolutions
    - _Requirements: N/A (UI Polish)_

## Phase 10: Final Integration and Testing

- [ ] 14. Integration and testing

  - [ ] 14.1 Connect all screens with navigation

    - Verify all navigation flows work correctly
    - Test back button behavior
    - Ensure state persists across navigation
    - _Requirements: N/A (Integration)_

  - [ ] 14.2 Test complete user flows

    - Test splash → wallet → mint → home flow
    - Test battle initiation → fight → results flow
    - Test leaderboard → challenge → battle flow
    - Verify all mock data updates correctly
    - _Requirements: N/A (Integration)_

  - [ ] 14.3 Performance optimization
    - Optimize component re-renders
    - Lazy load heavy components
    - Optimize images and assets
    - Test animation performance
    - _Requirements: N/A (Performance)_

- [ ] 15. Final checkpoint
  - Ensure all screens are implemented and functional
  - Verify mobile-first responsive design works
  - Test all user interactions and flows
  - Confirm game aesthetic is consistent across components
  - Ask the user if questions arise
