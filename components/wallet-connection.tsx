"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { type UiWalletAccount } from "@wallet-standard/react";
import {
  pipe,
  createTransactionMessage,
  appendTransactionMessageInstruction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
  type Signature,
} from "@solana/kit";
import { getAddMemoInstruction } from "@solana-program/memo";
import { useSolana } from "./providers/solana-provider";

import {
  useConnect,
  useDisconnect,
  type UiWallet,
} from "@wallet-standard/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Wallet, LogOut } from "lucide-react";
import { SimpleProgress } from "./ui/progress";


function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function WalletIcon({
  wallet,
  className,
}: {
  wallet: UiWallet;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {wallet.icon && (
        <AvatarImage src={wallet.icon} alt={`${wallet.name} icon`} />
      )}
      <AvatarFallback>{wallet.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

function WalletMenuItem({
  wallet,
  onConnect,
}: {
  wallet: UiWallet;
  onConnect: () => void;
}) {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;

    try {
      const accounts = await connect();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setWalletAndAccount(wallet, account);
        onConnect();
      }
    } catch (err) {
      console.error(`Failed to connect ${wallet.name}:`, err);
    }
  };

  return (
    <button
      className="flex w-full items-center justify-between px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <div className="flex items-center gap-2">
        <WalletIcon wallet={wallet} className="h-6 w-6" />
        <span className="font-medium">{wallet.name}</span>
      </div>
    </button>
  );
}

function DisconnectButton({
  wallet,
  onDisconnect,
}: {
  wallet: UiWallet;
  onDisconnect: () => void;
}) {
  const { setWalletAndAccount } = useSolana();
  const [isDisconnecting, disconnect] = useDisconnect(wallet);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletAndAccount(null, null);
      onDisconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive cursor-pointer"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Disconnect
    </DropdownMenuItem>
  );
}

export function WalletConnectButton() {
  const { wallets, selectedWallet, selectedAccount, isConnected } = useSolana();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px] justify-between">
          {isConnected && selectedWallet && selectedAccount ? (
            <>
              <div className="flex items-center gap-2">
                <WalletIcon wallet={selectedWallet} className="h-4 w-4" />
                <span className="font-mono text-sm">
                  {truncateAddress(selectedAccount.address)}
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Connect Wallet</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px]">
        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">
            No wallets detected
          </p>
        ) : (
          <>
            {!isConnected ? (
              <>
                <DropdownMenuLabel>Available Wallets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {wallets.map((wallet, index) => (
                  <WalletMenuItem
                    key={`${wallet.name}-${index}`}
                    wallet={wallet}
                    onConnect={() => setDropdownOpen(false)}
                  />
                ))}
              </>
            ) : (
              selectedWallet &&
              selectedAccount && (
                <>
                  <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <WalletIcon wallet={selectedWallet} className="h-6 w-6" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {selectedWallet.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(selectedAccount.address)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DisconnectButton
                    wallet={selectedWallet}
                    onDisconnect={() => setDropdownOpen(false)}
                  />
                </>
              )
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Component that only renders when wallet is connected
function ConnectedMemoCard({ account }: { account: UiWalletAccount }) {
  const { rpc, chain } = useSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [txSignature, setTxSignature] = useState("");

  const signer = useWalletAccountTransactionSendingSigner(account, chain);

  const sendMemo = async () => {
    if (!signer) return;

    setIsLoading(true);
    try {
      const { value: latestBlockhash } = await rpc
        .getLatestBlockhash({ commitment: "confirmed" })
        .send();

      const memoInstruction = getAddMemoInstruction({ memo: memoText });

      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(signer, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(memoInstruction, m)
      );

      const signature = await signAndSendTransactionMessageWithSigners(message);
      const signatureStr = getBase58Decoder().decode(signature) as Signature;

      setTxSignature(signatureStr);
      setMemoText("");
    } catch (error) {
      console.error("Memo failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Memo Message</label>
        <textarea
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="Enter your memo message"
          className="w-full p-2 border rounded min-h-[100px]"
          maxLength={566}
        />
      </div>

      <button
        onClick={sendMemo}
        disabled={isLoading || !memoText.trim()}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Sending..." : "Send Memo"}
      </button>

      {txSignature && (
        <div className="p-2 border rounded text-sm">
          <p className="mb-1">Memo Sent</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on Solana Explorer →
          </a>
        </div>
      )}
    </div>
  );
}

// Main memo component
export function MemoCard() {
  const { selectedAccount, isConnected } = useSolana();

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Send Memo</h3>
      {isConnected && selectedAccount ? (
        <ConnectedMemoCard account={selectedAccount} />
      ) : (
        <p className="text-gray-500 text-center py-4">
          Connect your wallet to send a memo
        </p>
      )}
    </div>
  );
}
