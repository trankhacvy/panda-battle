import { z } from "zod";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const configSchema = z.object({
  PRIVY_APP_ID: z.string(),
  PRIVY_AUTH_ID: z.string(),
  PRIVY_AUTH_PRIVATE_KEY: z.string(),

  SOLANA_RPC_URL: z.string(),
  SOLANA_RPC_SUBSCRIPTIONS_URL: z.string(),
  MAGIC_RPC_URL: z.string(),
  MAGIC_RPC_SUBSCRIPTIONS_URL: z.string(),

  IS_DEVELOPMENT: z.boolean(),
});

const configProject = configSchema.safeParse({
  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  PRIVY_AUTH_ID: process.env.NEXT_PUBLIC_PRIVY_AUTH_ID,
  PRIVY_AUTH_PRIVATE_KEY: process.env.PRIVY_AUTH_PRIVATE_KEY,

  SOLANA_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  SOLANA_RPC_SUBSCRIPTIONS_URL: process.env.NEXT_PUBLIC_RPC_SUBSCRIPTIONS_URL,
  MAGIC_RPC_URL: process.env.NEXT_PUBLIC_MAGIC_RPC_URL,
  MAGIC_RPC_SUBSCRIPTIONS_URL:
    process.env.NEXT_PUBLIC_MAGIC_RPC_SUBSCRIPTIONS_URL,

  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configProject.data;
console.log("envConfig", envConfig);

export default envConfig;
