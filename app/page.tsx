"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button3D } from "@/components/ui/button-3d";
import { useWallet } from "@/hooks/use-wallet";
import { useLogin } from "@privy-io/react-auth";

const DURATION = 1000;

export default function Home() {
  const router = useRouter();
  const { ready } = useWallet();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/create");
    },
  });

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, DURATION / 50);

    // Auto complete after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        // onComplete?.();
      }, 500);
    }, DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Animated background particles */}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo Text */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"
            style={{
              textShadow:
                "4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(255,255,255,0.3)",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke fill",
            }}
          >
            PANDA
          </h1>
          <h2
            className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            style={{
              textShadow:
                "4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(200,200,200,0.3)",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke fill",
            }}
          >
            CHAOS
          </h2>
        </div>

        {/* Panda Character */}
        <div className="relative animate-bounce-slow">
          <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"></div>
          <img
            src="/images/sample-panda.png"
            alt="Panda Warrior"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 drop-shadow-2xl"
          />
        </div>

        {/* Loading Section */}
        {/* <div className="hidden flex flex-col items-center space-y-4 w-full max-w-xs">
          <div className="text-5xl animate-pulse">🐾</div>

          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border-2 border-yellow-900/50">
            <div
              className="h-full bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(250,204,21,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-gray-300 text-lg font-semibold tracking-widest animate-pulse">
            Loading...
          </p>
        </div> */}

        <Button3D className="max-w-md w-full" disabled={!ready} onClick={login}>
          Play
        </Button3D>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
      {/* <div className="text-center space-y-4 sm:space-y-6">
        <div className="text-6xl sm:text-8xl">🐼</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-2">
          Bamboo Panda Battles
        </h1>
        <Button3D disabled={!ready} onClick={login}>
          Play
        </Button3D>
      </div> */}
    </div>
  );
}
