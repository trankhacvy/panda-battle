"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useLogin } from "@privy-io/react-auth";
import { motion } from "motion/react";

export default function Home() {
  const router = useRouter();
  const { ready } = useWallet();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/create");
    },
  });

  return (
    <div className="size-full p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-20 right-20 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 right-32 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="relative size-full flex flex-col items-center justify-center space-y-8">
        <motion.div
          className="text-center space-y-2"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] game-title-text">
            PANDA
          </h1>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] game-title-text">
            CHAOS
          </h2>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"></div>
          <img
            src="/images/sample-panda.png"
            alt="Panda Warrior"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          className="max-w-md w-full"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
        >
          <Button
            variant="game"
            size="lg"
            className="w-full"
            disabled={!ready}
            onClick={login}
          >
            Play
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
