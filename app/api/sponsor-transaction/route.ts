"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

const FEE_PAYER_PRIVATE_KEY = process.env.FEE_PAYER_PRIVATE_KEY;
const FEE_PAYER_ADDRESS = process.env.FEE_PAYER_ADDRESS;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");

// Whitelist of allowed program IDs
// Format: comma-separated list of program addresses
// Default includes system programs and memo program for testing
const DEFAULT_WHITELIST = [
  "11111111111111111111111111111111", // System Program
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // Token Program
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", // Memo Program (for testing)
  "2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG", // Panda Battle Program
];

const getWhitelistedProgramIds = (): Set<string> => {
  const envWhitelist = process.env.SPONSOR_PROGRAM_WHITELIST;
  if (envWhitelist) {
    // Parse comma-separated list from environment variable
    const programIds = envWhitelist.split(",").map((id) => id.trim());
    return new Set([...DEFAULT_WHITELIST, ...programIds]);
  }
  return new Set(DEFAULT_WHITELIST);
};

const WHITELISTED_PROGRAM_IDS = getWhitelistedProgramIds();

const connection = new Connection(SOLANA_RPC_URL, "confirmed");

const feePayerKeypair =
  FEE_PAYER_PRIVATE_KEY != null && FEE_PAYER_PRIVATE_KEY.length > 0
    ? Keypair.fromSecretKey(bs58.decode(FEE_PAYER_PRIVATE_KEY))
    : null;

export async function POST(req: NextRequest) {
  try {
    if (!feePayerKeypair || !FEE_PAYER_ADDRESS) {
      return NextResponse.json(
        { error: "Fee payer is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const serializedTransaction = body?.transaction;

    if (typeof serializedTransaction !== "string") {
      return NextResponse.json(
        { error: "Missing transaction data" },
        { status: 400 }
      );
    }

    // Deserialize the transaction sent from the client
    const transactionBuffer = Buffer.from(serializedTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Basic verification of the transaction contents before signing
    const message = transaction.message;
    const accountKeys = message.getAccountKeys();

    // Fee payer is always the first account key
    const feePayerIndex = 0;
    const feePayer = accountKeys.get(feePayerIndex);

    if (!feePayer || feePayer.toBase58() !== FEE_PAYER_ADDRESS) {
      return NextResponse.json(
        { error: "Invalid fee payer in transaction" },
        { status: 403 }
      );
    }

    // Validate all instructions use whitelisted program IDs
    const usedProgramIds = new Set<string>();
    for (const instruction of message.compiledInstructions) {
      const programId = accountKeys.get(instruction.programIdIndex);
      if (!programId) {
        return NextResponse.json(
          { error: "Invalid instruction: missing program ID" },
          { status: 403 }
        );
      }

      const programIdString = programId.toBase58();
      usedProgramIds.add(programIdString);

      // Check if program ID is in whitelist
      if (!WHITELISTED_PROGRAM_IDS.has(programIdString)) {
        return NextResponse.json(
          {
            error: `Program ID not whitelisted: ${programIdString}`,
            details: `Only the following program IDs are allowed: ${Array.from(
              WHITELISTED_PROGRAM_IDS
            ).join(", ")}`,
          },
          { status: 403 }
        );
      }

      // System Program (native SOL transfers) - additional security check
      if (programIdString === "11111111111111111111111111111111") {
        // Transfer instruction discriminator = 2
        if (instruction.data[0] === 2) {
          const senderIndex = instruction.accountKeyIndexes[0];
          const senderAddress = accountKeys.get(senderIndex);

          if (senderAddress && senderAddress.toBase58() === FEE_PAYER_ADDRESS) {
            return NextResponse.json(
              {
                error: "Transaction attempts to transfer funds from fee payer",
              },
              { status: 403 }
            );
          }
        }
      }
    }

    // Sign with the server-side fee payer keypair
    transaction.sign([feePayerKeypair]);

    // Broadcast the transaction
    const signature = await connection.sendTransaction(transaction);

    return NextResponse.json(
      {
        transactionHash: signature,
        message: "Transaction sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing sponsored transaction:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to process transaction",
        details: message,
      },
      { status: 500 }
    );
  }
}
