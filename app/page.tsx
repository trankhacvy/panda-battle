"use client";

import { useRouter } from "next/navigation";
import { Button3D } from "@/components/ui/button-3d";
import { useWallet } from "@/hooks/use-wallet";
import { useLogin } from "@privy-io/react-auth";

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

        <div className="relative animate-bounce-slow">
          <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"></div>
          <img
            src="/images/sample-panda.png"
            alt="Panda Warrior"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 drop-shadow-2xl"
          />
        </div>

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
    </div>
  );
}
