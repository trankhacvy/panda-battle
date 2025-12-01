/**
 * Main test entry point
 * 
 * This file imports all test suites to ensure they run in order:
 * 1. Admin tests - Initialize game and manage rounds
 * 2. Player tests - Join rounds, battle, claim prizes
 * 3. Crank tests - Automated maintenance operations
 */

import "./admin.test";
import "./player.test";
import "./crank.test";
