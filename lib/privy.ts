"use server";

// import { generateAuthorizationSignature } from "@privy-io/react-auth";
import {
  formatRequestForAuthorizationSignature,
  generateAuthorizationSignature,
} from "@privy-io/server-auth/wallet-api";
import canonicalize from "canonicalize"; // Support JSON canonicalization
import crypto from "crypto";

interface SignTransactionParams {
  transaction: string;
  encoding: "base64";
}

interface SignTransactionRequest {
  method: "signTransaction";
  params: SignTransactionParams;
}

interface SignTransactionResponse {
  method: "signTransaction";
  data: {
    signed_transaction: string;
    encoding: "base64";
  };
}

function getAuthorizationSignature({
  url,
  transaction,
}: {
  url: string;
  transaction: string;
}) {
  const payload = {
    version: 1,
    method: "POST",
    url,
    body: {
      method: "signTransaction",
      params: {
        transaction,
        encoding: "base64",
      },
    },
    headers: {
      "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    },
  };

  // JSON-canonicalize the payload and convert it to a buffer
  const serializedPayload = canonicalize(payload) as string;
  const serializedPayloadBuffer = Buffer.from(serializedPayload);

  // Replace this with your user or authorization key. We remove the 'wallet-auth:' prefix
  // from authorization keys before using it to sign requests
  const privateKeyAsString = process.env
    .PRIVY_AUTH_PRIVATE_KEY!.split(String.raw`\n`)
    .join("\n")
    .replace("wallet-auth:", "");

  // Convert your private key to PEM format, and instantiate a node crypto KeyObject for it
  const privateKeyAsPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyAsString}\n-----END PRIVATE KEY-----`;
  const privateKey = crypto.createPrivateKey({
    key: privateKeyAsPem,
    format: "pem",
  });

  // Sign the payload buffer with your private key and serialize the signature to a base64 string
  const signatureBuffer = crypto.sign(
    "sha256",
    serializedPayloadBuffer,
    privateKey
  );
  const signature = signatureBuffer.toString("base64");
  return signature;
}

export async function signTransactionWithPrivy(
  walletId: string,
  transaction: string
): Promise<SignTransactionResponse> {
  const url = `https://api.privy.io/v1/wallets/${walletId}/rpc`;

  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PRIVY_APP_ID!}:${process.env.PRIVY_APP_SECRET!}`
  ).toString("base64");

  const input = {
    version: 1,
    url: url,
    method: "POST",
    headers: {
      "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    },
    body: {
      method: "signTransaction",
      params: {
        transaction,
        encoding: "base64",
      },
    },
  } as const;

  console.log("input", input);

  const authorizationSignature = generateAuthorizationSignature({
    input,
    authorizationPrivateKey: process.env.PRIVY_AUTH_PRIVATE_KEY!,
  });

  console.log("authorizationSignature", authorizationSignature);

  const response = await fetch(input.url, {
    method: input.method,
    // @ts-expect-error
    headers: {
      ...input.headers,
      Authorization: `Basic ${credentials}`,
      "privy-authorization-signature": authorizationSignature,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input.body),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<SignTransactionResponse>;
}
