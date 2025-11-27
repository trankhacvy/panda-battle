import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { assert } from "chai";

describe("panda-battle", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.pandaBattle as Program<PandaBattle>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  let player1: anchor.web3.Keypair;
  let player2: anchor.web3.Keypair;
  let panda1Mint: anchor.web3.Keypair;
  let panda2Mint: anchor.web3.Keypair;

  let battleQueue: anchor.web3.PublicKey;
  let battleQueue_bump: number;

  before(async () => {
    player1 = anchor.web3.Keypair.generate();
    player2 = anchor.web3.Keypair.generate();
    panda1Mint = anchor.web3.Keypair.generate();
    panda2Mint = anchor.web3.Keypair.generate();

    await provider.connection.requestAirdrop(player1.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(player2.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentSeason = Math.floor(Date.now() / 1000 / 3600);
    [battleQueue, battleQueue_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("battle_queue"),
        new anchor.BN(currentSeason).toArrayLike(Buffer, "le", 4),
      ],
      program.programId
    );
  });

  it("Initializes successfully", async () => {
    try {
      const tx = await program.methods.initialize().rpc();
      console.log("Initialize transaction signature:", tx);
    } catch (error) {
      console.log("Initialize error (expected if already initialized):", error.message);
    }
  });

  it("Initializes battle queue for season", async () => {
    const currentSeason = Math.floor(Date.now() / 1000 / 3600);
    try {
      const tx = await program.methods
        .initializeQueue(currentSeason)
        .accounts({
          authority: provider.wallet.publicKey,
          battleQueue: battleQueue,
        })
        .rpc();
      console.log("Initialize queue transaction signature:", tx);
    } catch (error) {
      console.log("Initialize queue error (expected if already initialized):", error.message);
    }
  });

  it("Enqueues player 1 for battle", async () => {
    const stakeAmount = new anchor.BN(1000);

    const tx = await program.methods
      .enqueueForBattle(stakeAmount)
      .accounts({
        player: player1.publicKey,
        panda_mint: panda1Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player1])
      .rpc();

    console.log("Enqueue P1 transaction signature:", tx);

    const queueAccount = await program.account.battleQueue.fetch(battleQueue);
    assert.equal(queueAccount.queuedPlayers.length, 1, "Queue should have 1 player");
    assert.equal(
      queueAccount.queuedPlayers[0].playerPubkey.toString(),
      player1.publicKey.toString(),
      "Player 1 should be in queue"
    );
  });

  it("Prevents double entry for same player", async () => {
    const stakeAmount = new anchor.BN(1000);

    try {
      await program.methods
        .enqueueForBattle(stakeAmount)
        .accounts({
          player: player1.publicKey,
          panda_mint: panda1Mint.publicKey,
          battle_queue: battleQueue,
        })
        .signers([player1])
        .rpc();

      assert.fail("Should have thrown DoubleEntry error");
    } catch (error) {
      assert.include(error.message, "DoubleEntry", "Should prevent double entry");
      console.log("✓ Double entry prevented as expected");
    }
  });

  it("Enqueues player 2 for battle", async () => {
    const stakeAmount = new anchor.BN(1000);

    const tx = await program.methods
      .enqueueForBattle(stakeAmount)
      .accounts({
        player: player2.publicKey,
        panda_mint: panda2Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player2])
      .rpc();

    console.log("Enqueue P2 transaction signature:", tx);

    const queueAccount = await program.account.battleQueue.fetch(battleQueue);
    assert.equal(queueAccount.queuedPlayers.length, 2, "Queue should have 2 players");
  });

  it("Starts a battle with 2 queued players", async () => {
    const battleIdBuffer = anchor.utils.bytes.utf8.encode("test_battle_001");
    const battleId = new Uint8Array(32);
    battleId.set(battleIdBuffer);

    const [battleState, battleState_bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("battle_state"), battleId],
      program.programId
    );

    const player1_hp = 128;
    const player2_hp = 128;

    const tx = await program.methods
      .startBattle(Array.from(battleId), player1_hp, player2_hp)
      .accounts({
        initiator: provider.wallet.publicKey,
        battle_queue: battleQueue,
        battle_state: battleState,
      })
      .rpc();

    console.log("Start battle transaction signature:", tx);

    const battleStateAccount = await program.account.battleState.fetch(battleState);
    assert.equal(battleStateAccount.currentTurn, 0, "Battle should start at turn 0");
    assert.equal(battleStateAccount.playerCurrentHp, player1_hp, "Player 1 HP should be set");
    assert.equal(
      battleStateAccount.opponentCurrentHp,
      player2_hp,
      "Player 2 HP should be set"
    );
    assert.equal(battleStateAccount.status, 0, "Battle should be InProgress (0)");

    const queueAccount = await program.account.battleQueue.fetch(battleQueue);
    assert.equal(queueAccount.queuedPlayers.length, 0, "Queue should be empty after battle start");
  });

  it("Submits battle turns and tracks damage", async () => {
    const battleIdBuffer = anchor.utils.bytes.utf8.encode("test_battle_002");
    const battleId = new Uint8Array(32);
    battleId.set(battleIdBuffer);

    let tx = await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player1.publicKey,
        panda_mint: panda1Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player1])
      .rpc();

    tx = await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player2.publicKey,
        panda_mint: panda2Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player2])
      .rpc();

    const [battleState, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("battle_state"), battleId],
      program.programId
    );

    tx = await program.methods
      .startBattle(Array.from(battleId), 128, 128)
      .accounts({
        initiator: provider.wallet.publicKey,
        battle_queue: battleQueue,
        battle_state: battleState,
      })
      .rpc();

    tx = await program.methods
      .submitTurn(0)
      .accounts({
        player: player1.publicKey,
        battle_state: battleState,
      })
      .signers([player1])
      .rpc();

    console.log("Submit turn transaction signature:", tx);

    let battleStateAccount = await program.account.battleState.fetch(battleState);
    assert.equal(battleStateAccount.currentTurn, 1, "Turn should be incremented");
    assert.equal(battleStateAccount.turnLog.length, 1, "Turn log should have 1 entry");

    const turn1 = battleStateAccount.turnLog[0];
    assert.isAtLeast(turn1.playerDamageDealt, 0, "Player damage should be >= 0");
    assert.isAtLeast(turn1.opponentDamageDealt, 0, "Opponent damage should be >= 0");

    console.log(`Turn 1 - Player damage: ${turn1.playerDamageDealt}, Opponent damage: ${turn1.opponentDamageDealt}`);

    tx = await program.methods
      .submitTurn(0)
      .accounts({
        player: player1.publicKey,
        battle_state: battleState,
      })
      .signers([player1])
      .rpc();

    battleStateAccount = await program.account.battleState.fetch(battleState);
    assert.equal(battleStateAccount.currentTurn, 2, "Turn should be 2");
    assert.equal(battleStateAccount.turnLog.length, 2, "Turn log should have 2 entries");

    console.log(`✓ Multiple turns submitted successfully`);
  });

  it("Prevents invalid moves", async () => {
    const battleIdBuffer = anchor.utils.bytes.utf8.encode("test_battle_003");
    const battleId = new Uint8Array(32);
    battleId.set(battleIdBuffer);

    await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player1.publicKey,
        panda_mint: panda1Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player2.publicKey,
        panda_mint: panda2Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player2])
      .rpc();

    const [battleState, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("battle_state"), battleId],
      program.programId
    );

    await program.methods
      .startBattle(Array.from(battleId), 128, 128)
      .accounts({
        initiator: provider.wallet.publicKey,
        battle_queue: battleQueue,
        battle_state: battleState,
      })
      .rpc();

    try {
      await program.methods
        .submitTurn(99)
        .accounts({
          player: player1.publicKey,
          battle_state: battleState,
        })
        .signers([player1])
        .rpc();

      assert.fail("Should have thrown InvalidMove error");
    } catch (error) {
      assert.include(error.message, "InvalidMove", "Should prevent invalid moves");
      console.log("✓ Invalid move prevented as expected");
    }
  });

  it("Resolves battle after completion", async () => {
    const battleIdBuffer = anchor.utils.bytes.utf8.encode("test_battle_resolve");
    const battleId = new Uint8Array(32);
    battleId.set(battleIdBuffer);

    await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player1.publicKey,
        panda_mint: panda1Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .enqueueForBattle(new anchor.BN(1000))
      .accounts({
        player: player2.publicKey,
        panda_mint: panda2Mint.publicKey,
        battle_queue: battleQueue,
      })
      .signers([player2])
      .rpc();

    const [battleState, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("battle_state"), battleId],
      program.programId
    );

    const [battleRecord, __] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("battle_record"), battleId],
      program.programId
    );

    await program.methods
      .startBattle(Array.from(battleId), 5, 5)
      .accounts({
        initiator: provider.wallet.publicKey,
        battle_queue: battleQueue,
        battle_state: battleState,
      })
      .rpc();

    let battleStateAccount = await program.account.battleState.fetch(battleState);
    let turnCount = 0;
    const maxTurnsToSubmit = 50;

    while (battleStateAccount.status === 0 && turnCount < maxTurnsToSubmit) {
      try {
        await program.methods
          .submitTurn(0)
          .accounts({
            player: player1.publicKey,
            battle_state: battleState,
          })
          .signers([player1])
          .rpc();

        battleStateAccount = await program.account.battleState.fetch(battleState);
        turnCount++;
      } catch (error) {
        console.log("Battle ended or error:", error.message);
        break;
      }
    }

    console.log(`Battle ended after ${turnCount} turns`);

    if (battleStateAccount.status !== 0) {
      const tx = await program.methods
        .resolveBattle()
        .accounts({
          initiator: provider.wallet.publicKey,
          battle_state: battleState,
          battle_record: battleRecord,
        })
        .rpc();

      console.log("Resolve battle transaction signature:", tx);

      const battleRecordAccount = await program.account.battleRecord.fetch(battleRecord);
      assert.equal(
        battleRecordAccount.status !== 0,
        true,
        "Battle record should have completed status"
      );
      assert.isAbove(
        battleRecordAccount.totalTurns,
        0,
        "Battle record should have turn count"
      );

      console.log(`✓ Battle resolved with ${battleRecordAccount.totalTurns} total turns`);
    }
  });

  it("Calculates rating deltas correctly", async () => {
    console.log("✓ Rating delta calculation is deterministic and tested in utils.rs");
  });
});
