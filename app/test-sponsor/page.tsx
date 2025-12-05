"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useWallets } from "@privy-io/react-auth/solana";
import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { sendSponsoredTransactionToBackend } from "@/lib/tx/sponsor-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

export default function TestSponsorPage() {
  const { wallet, standardWallet } = useWallet();
  const { wallets } = useWallets();
  const [feePayerAddress, setFeePayerAddress] = useState("");
  const [memoText, setMemoText] = useState("Test sponsored transaction");
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<"whitelisted" | "non-whitelisted">(
    "whitelisted"
  );
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
    details?: string;
  } | null>(null);

  // Find embedded wallet
  const embeddedWallet = wallets.find((w) => w.standardWallet.name === "Privy");

  const handleTestSponsoredTransaction = async () => {
    if (!embeddedWallet || !feePayerAddress) {
      setResult({
        success: false,
        message: "Missing embedded wallet or fee payer address",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Create connection to Solana (using devnet for testing)
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
      );
      const { blockhash } = await connection.getLatestBlockhash();

      // Choose program ID based on test mode
      const programId =
        testMode === "whitelisted"
          ? "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr" // Memo Program (whitelisted)
          : "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"; // Jupiter Program (not whitelisted - for testing)

      // Create a simple memo instruction for testing
      // We need to add the user wallet to the keys so it can sign the transaction
      const userWalletPubkey = new PublicKey(embeddedWallet.address);
      const memoInstruction = {
        keys: [
          {
            pubkey: userWalletPubkey,
            isSigner: true,
            isWritable: false,
          },
        ],
        programId: new PublicKey(programId),
        data: Buffer.from(memoText, "utf-8"),
      };

      // Create the transaction message with fee payer set to the backend wallet
      const message = new TransactionMessage({
        payerKey: new PublicKey(feePayerAddress),
        recentBlockhash: blockhash,
        instructions: [memoInstruction],
      }).compileToV0Message();

      // Create transaction
      const transaction = new VersionedTransaction(message);

      // Serialize message for signing (as Uint8Array)
      const serializedMessage = transaction.message.serialize();

      // Get provider and sign
      // Privy's signMessage accepts Uint8Array and returns Uint8Array
      const { signature: userSignature } = await embeddedWallet.signMessage({
        message: serializedMessage,
      });

      // Add user signature to transaction
      // signature is already Uint8Array, no need to convert
      transaction.addSignature(
        new PublicKey(embeddedWallet.address),
        userSignature
      );

      // Serialize the transaction to send to backend
      const serializedTransaction = Buffer.from(
        transaction.serialize()
      ).toString("base64");

      // Send to backend
      const transactionHash = await sendSponsoredTransactionToBackend(
        serializedTransaction
      );

      setResult({
        success: true,
        message: "Transaction sent successfully!",
        txHash: transactionHash,
      });
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Unknown error occurred";
      let errorDetails: string | undefined;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Check if error has details property (from sponsor-backend.ts)
        if ("details" in error && typeof error.details === "string") {
          errorDetails = error.details;
        }
      }

      setResult({
        success: false,
        message: errorMessage,
        details: errorDetails,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Sponsored Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Typography variant="small" className="text-muted-foreground">
              Wallet Status
            </Typography>
            {embeddedWallet ? (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-400">
                  ✓ Embedded wallet connected: {embeddedWallet.address}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-400">
                  ✗ No embedded wallet found. Please connect your wallet.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="feePayer" className="text-sm font-medium">
              Fee Payer Address
            </label>
            <Input
              id="feePayer"
              type="text"
              placeholder="Enter fee payer wallet address"
              value={feePayerAddress}
              onChange={(e) => setFeePayerAddress(e.target.value)}
              className="font-mono text-xs"
            />
            <Typography variant="small" className="text-muted-foreground">
              This should be the address of your backend fee payer wallet
            </Typography>
          </div>

          <div className="space-y-2">
            <label htmlFor="memo" className="text-sm font-medium">
              Memo Text (for testing)
            </label>
            <Input
              id="memo"
              type="text"
              placeholder="Enter memo text"
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Mode</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setTestMode("whitelisted")}
                variant={testMode === "whitelisted" ? "primary" : "secondary"}
                className="flex-1"
                disabled={isLoading}
              >
                Whitelisted Program
              </Button>
              <Button
                onClick={() => setTestMode("non-whitelisted")}
                variant={
                  testMode === "non-whitelisted" ? "destructive" : "secondary"
                }
                className="flex-1"
                disabled={isLoading}
              >
                Non-Whitelisted Program
              </Button>
            </div>
            <Typography variant="small" className="text-muted-foreground">
              {testMode === "whitelisted"
                ? "Using Memo Program (whitelisted) - should succeed"
                : "Using Jupiter Program (not whitelisted) - should fail with 'Program ID not whitelisted'"}
            </Typography>
          </div>

          <Button
            onClick={handleTestSponsoredTransaction}
            disabled={!embeddedWallet || !feePayerAddress || isLoading}
            className="w-full"
            variant={testMode === "whitelisted" ? "primary" : "destructive"}
          >
            {isLoading
              ? "Processing..."
              : testMode === "whitelisted"
              ? "Send Sponsored Transaction (Whitelisted)"
              : "Test Non-Whitelisted Program (Should Fail)"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md border ${
                result.success
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <Typography
                variant="small"
                className={result.success ? "text-green-400" : "text-red-400"}
              >
                {result.success ? "✓ " : "✗ "}
                {result.message}
              </Typography>
              {result.details && (
                <div className="mt-2">
                  <Typography variant="small" className="text-muted-foreground">
                    Details:
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-muted-foreground break-all"
                  >
                    {result.details}
                  </Typography>
                </div>
              )}
              {result.txHash && (
                <div className="mt-2">
                  <Typography variant="small" className="text-muted-foreground">
                    Transaction Hash:
                  </Typography>
                  <a
                    href={`https://solscan.io/tx/${result.txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all text-xs font-mono"
                  >
                    {result.txHash}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <Typography variant="small" className="text-blue-400 mb-2">
              Instructions:
            </Typography>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Make sure you have set FEE_PAYER_ADDRESS in your .env file
              </li>
              <li>Enter the fee payer address in the input field above</li>
              <li>Enter a memo text (optional)</li>
              <li>
                Choose test mode:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    <strong>Whitelisted Program</strong>: Uses Memo Program
                    (should succeed)
                  </li>
                  <li>
                    <strong>Non-Whitelisted Program</strong>: Uses Jupiter
                    Program (should fail with "Program ID not whitelisted")
                  </li>
                </ul>
              </li>
              <li>Click the test button to send transaction</li>
              <li>Check the result - should show success or error message</li>
              <li>
                If successful, check the transaction on Solscan using the link
                above
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
