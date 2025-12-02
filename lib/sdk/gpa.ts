import {
  Account,
  Address,
  getBase58Decoder,
  Rpc,
  SolanaRpcApi,
  type Instruction,
  type GetProgramAccountsMemcmpFilter,
  type ReadonlyUint8Array,
  MaybeEncodedAccount,
  fetchEncodedAccount,
  getBase64Encoder,
  some,
  none,
  GetProgramAccountsApi,
  VariableSizeDecoder,
  getAddressEncoder,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
  getProgramDerivedAddress,
  WritableAccount,
  AccountRole,
  address,
} from "@solana/kit";
import {
  getPlayerStateDecoder,
  PANDA_BATTLE_PROGRAM_ADDRESS,
  PLAYER_STATE_DISCRIMINATOR,
  PlayerState,
} from "./generated";

async function fetchDecodedProgramAccounts<T extends object>(
  rpc: Rpc<GetProgramAccountsApi>,
  programAddress: Address,
  filters: GetProgramAccountsMemcmpFilter[],
  decoder: VariableSizeDecoder<T>
): Promise<Account<T>[]> {
  const accountInfos = await rpc
    .getProgramAccounts(programAddress, {
      encoding: "base64",
      filters,
    })
    .send();

  const encoder = getBase64Encoder();

  const datas = accountInfos.map((x) => encoder.encode(x.account.data[0]));

  const decoded = datas.map((x) => {
    try {
      return decoder.decode(x);
    } catch (error) {
      return null;
    }
  });

  return decoded
    .filter((x) => !!x)
    .map((data, i) => ({
      ...accountInfos[i]!.account,
      address: accountInfos[i]!.pubkey,
      programAddress: programAddress,
      data,
    }));
}

export async function getPlayerStateAccounts(
  rpc: Rpc<SolanaRpcApi>,
  round: Address
): Promise<PlayerState[]> {
  const discriminator = getBase58Decoder().decode(PLAYER_STATE_DISCRIMINATOR);
  const discriminatorFilter: GetProgramAccountsMemcmpFilter = {
    memcmp: {
      offset: BigInt(0),
      // @ts-expect-error
      bytes: discriminator,
      encoding: "base58",
    },
  };

  const roundFilter: GetProgramAccountsMemcmpFilter = {
    memcmp: {
      offset: BigInt(40),
      // @ts-expect-error
      bytes: getBase58Decoder().decode(getAddressEncoder().encode(round)),
      encoding: "base58",
    },
  };

  const playerStateAccounts = await fetchDecodedProgramAccounts(
    rpc,
    PANDA_BATTLE_PROGRAM_ADDRESS,
    [discriminatorFilter, roundFilter],
    getPlayerStateDecoder()
  );

  return playerStateAccounts.map((acc) => acc.data);
}
