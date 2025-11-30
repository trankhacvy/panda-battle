/**
 * Sound System Usage Examples
 * 
 * This file contains examples of how to use the sound system
 * throughout your Panda Battle application.
 */

import { useSound } from "@/hooks/use-sound";
import { useSoundStore, useVolumeSettings, useMuteSettings } from "@/lib/store/sound-store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

// ============================================================================
// Example 1: Basic Sound Usage
// ============================================================================

export function Example1_BasicSound() {
  const { playWin, playLose } = useSound();

  return (
    <div>
      <Button onClick={() => playWin()}>Play Win Sound</Button>
      <Button onClick={() => playLose()}>Play Lose Sound</Button>
    </div>
  );
}

// ============================================================================
// Example 2: Conditional Sound Based on Game State
// ============================================================================

export function Example2_ConditionalSound() {
  const { playWin, playLose } = useSound();

  const handleBattleEnd = (isVictory: boolean) => {
    if (isVictory) {
      playWin();
      // Show victory UI
    } else {
      playLose();
      // Show defeat UI
    }
  };

  return (
    <div>
      <Button onClick={() => handleBattleEnd(true)}>Simulate Win</Button>
      <Button onClick={() => handleBattleEnd(false)}>Simulate Loss</Button>
    </div>
  );
}

// ============================================================================
// Example 3: Sound on Component Mount
// ============================================================================

export function Example3_SoundOnMount() {
  const { playGameStart } = useSound();

  useEffect(() => {
    // Play sound when component mounts
    playGameStart();
  }, [playGameStart]);

  return <div>Game Started! (Sound played on mount)</div>;
}

// ============================================================================
// Example 4: Sound with Custom Volume
// ============================================================================

export function Example4_CustomVolume() {
  const { play } = useSound();

  return (
    <div>
      <Button onClick={() => play("win", 0.3)}>Quiet Win</Button>
      <Button onClick={() => play("win", 0.6)}>Medium Win</Button>
      <Button onClick={() => play("win", 1.0)}>Loud Win</Button>
    </div>
  );
}

// ============================================================================
// Example 5: Button without Sound
// ============================================================================

export function Example5_SilentButton() {
  const handleImportantAction = () => {
    // Some important action that shouldn't have click sound
    console.log("Important action executed");
  };

  return (
    <Button onClick={handleImportantAction} disableSound>
      Silent Button (No Click Sound)
    </Button>
  );
}

// ============================================================================
// Example 6: Background Music Control
// ============================================================================

export function Example6_MusicControl() {
  const { startBackgroundMusic, stopBackgroundMusic } = useSound();

  return (
    <div>
      <Button onClick={startBackgroundMusic}>Start Music</Button>
      <Button onClick={stopBackgroundMusic}>Stop Music</Button>
    </div>
  );
}

// ============================================================================
// Example 7: Access Volume Settings
// ============================================================================

export function Example7_VolumeDisplay() {
  const { masterVolume, musicVolume, sfxVolume } = useVolumeSettings();

  return (
    <div>
      <p>Master Volume: {Math.round(masterVolume * 100)}%</p>
      <p>Music Volume: {Math.round(musicVolume * 100)}%</p>
      <p>SFX Volume: {Math.round(sfxVolume * 100)}%</p>
    </div>
  );
}

// ============================================================================
// Example 8: Check Mute Status
// ============================================================================

export function Example8_MuteStatus() {
  const { isMusicMuted, isSfxMuted, isMasterMuted } = useMuteSettings();

  return (
    <div>
      <p>Music: {isMusicMuted ? "🔇 Muted" : "🔊 Playing"}</p>
      <p>SFX: {isSfxMuted ? "🔇 Muted" : "🔊 Playing"}</p>
      <p>Master: {isMasterMuted ? "🔇 Muted" : "🔊 Playing"}</p>
    </div>
  );
}

// ============================================================================
// Example 9: Custom Volume Slider
// ============================================================================

export function Example9_CustomVolumeSlider() {
  const setMasterVolume = useSoundStore((state) => state.setMasterVolume);
  const masterVolume = useSoundStore((state) => state.masterVolume);

  return (
    <div>
      <label>Master Volume: {Math.round(masterVolume * 100)}%</label>
      <input
        type="range"
        min="0"
        max="100"
        value={masterVolume * 100}
        onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
      />
    </div>
  );
}

// ============================================================================
// Example 10: Sound Sequence
// ============================================================================

export function Example10_SoundSequence() {
  const { playDiceRoll, playDiceLand, playMoneyReceive } = useSound();

  const playSequence = async () => {
    playDiceRoll();
    
    // Wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    playDiceLand();
    
    // Wait 0.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 500));
    playMoneyReceive();
  };

  return (
    <Button onClick={playSequence}>
      Play Sound Sequence
    </Button>
  );
}

// ============================================================================
// Example 11: Sound Based on User Action Result
// ============================================================================

export function Example11_ActionResult() {
  const { playMoneyReceive, playMoneyPay, playPropertyBuy } = useSound();

  const handleTransaction = (type: "buy" | "receive" | "pay") => {
    switch (type) {
      case "buy":
        playPropertyBuy();
        break;
      case "receive":
        playMoneyReceive();
        break;
      case "pay":
        playMoneyPay();
        break;
    }
  };

  return (
    <div>
      <Button onClick={() => handleTransaction("buy")}>Buy Property</Button>
      <Button onClick={() => handleTransaction("receive")}>Receive Money</Button>
      <Button onClick={() => handleTransaction("pay")}>Pay Money</Button>
    </div>
  );
}

// ============================================================================
// Example 12: Toggle Mute
// ============================================================================

export function Example12_ToggleMute() {
  const toggleSfxMute = useSoundStore((state) => state.toggleSfxMute);
  const toggleMusicMute = useSoundStore((state) => state.toggleMusicMute);
  const isSfxMuted = useSoundStore((state) => state.isSfxMuted);
  const isMusicMuted = useSoundStore((state) => state.isMusicMuted);

  return (
    <div>
      <Button onClick={toggleSfxMute}>
        {isSfxMuted ? "🔇 Unmute SFX" : "🔊 Mute SFX"}
      </Button>
      <Button onClick={toggleMusicMute}>
        {isMusicMuted ? "🔇 Unmute Music" : "🔊 Mute Music"}
      </Button>
    </div>
  );
}

// ============================================================================
// Example 13: Play Sound on Hover (Not Recommended for All Elements)
// ============================================================================

export function Example13_HoverSound() {
  const { play } = useSound();

  return (
    <div
      onMouseEnter={() => play("button-click", 0.3)}
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Hover over me for sound (subtle)
    </div>
  );
}

// ============================================================================
// Example 14: Error/Warning Sound
// ============================================================================

export function Example14_ErrorSound() {
  const { playGlassBreak } = useSound();

  const handleError = () => {
    playGlassBreak();
    // Show error message
    alert("Error occurred!");
  };

  return (
    <Button onClick={handleError} variant="destructive">
      Trigger Error
    </Button>
  );
}

// ============================================================================
// Example 15: Success Sound Chain
// ============================================================================

export function Example15_SuccessChain() {
  const { playUpHouse, playMoneyReceive, playWin } = useSound();

  const celebrateSuccess = async () => {
    playUpHouse();
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    playMoneyReceive();
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    playWin();
  };

  return (
    <Button onClick={celebrateSuccess}>
      🎉 Celebrate Big Win
    </Button>
  );
}

// ============================================================================
// Example 16: Cleanup on Unmount
// ============================================================================

export function Example16_CleanupOnUnmount() {
  const stopAllSounds = useSoundStore((state) => state.stopAllSounds);

  useEffect(() => {
    return () => {
      // Cleanup: stop all sounds when component unmounts
      stopAllSounds();
    };
  }, [stopAllSounds]);

  return <div>Component with sound cleanup</div>;
}

// ============================================================================
// Example 17: Conditional Music Based on Game Mode
// ============================================================================

export function Example17_ConditionalMusic() {
  const { startBackgroundMusic, stopBackgroundMusic } = useSound();
  const gameMode = "battle"; // or "menu", "shop", etc.

  useEffect(() => {
    if (gameMode === "battle") {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [gameMode, startBackgroundMusic, stopBackgroundMusic]);

  return <div>Current mode: {gameMode}</div>;
}

// ============================================================================
// Example 18: Play Different Sounds Based on Rank
// ============================================================================

export function Example18_RankBasedSound() {
  const { playWin, playUpHouse, playMoneyReceive } = useSound();

  const celebrateRank = (rank: number) => {
    if (rank <= 10) {
      playWin(); // Top 10 gets special sound
    } else if (rank <= 20) {
      playUpHouse(); // Top 20 gets upgrade sound
    } else {
      playMoneyReceive(); // Others get regular sound
    }
  };

  return (
    <div>
      <Button onClick={() => celebrateRank(5)}>Rank 5 (Top 10)</Button>
      <Button onClick={() => celebrateRank(15)}>Rank 15 (Top 20)</Button>
      <Button onClick={() => celebrateRank(50)}>Rank 50</Button>
    </div>
  );
}

// ============================================================================
// Real-World Example: Battle Component
// ============================================================================

export function RealWorldExample_BattleComponent() {
  const { playGameStart, playWin, playLose, playUpHouse } = useSound();

  // Simulate battle flow
  const startBattle = () => {
    playGameStart();
    console.log("Battle started!");
  };

  const endBattle = async (isVictory: boolean, hasSteal: boolean) => {
    if (isVictory) {
      playWin();
      
      if (hasSteal) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        playUpHouse(); // Play steal sound after victory
      }
    } else {
      playLose();
    }
  };

  return (
    <div className="space-y-4">
      <h2>Battle Simulation</h2>
      <div className="space-x-2">
        <Button onClick={startBattle}>Start Battle</Button>
        <Button onClick={() => endBattle(true, false)}>Win (No Steal)</Button>
        <Button onClick={() => endBattle(true, true)}>Win (With Steal)</Button>
        <Button onClick={() => endBattle(false, false)}>Lose</Button>
      </div>
    </div>
  );
}

