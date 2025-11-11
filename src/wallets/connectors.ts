import { connectEvmWallet, sendEvmTransaction } from "./evm";
import { connectSolanaWallet, sendSolanaTransaction } from "./solana";

export type WalletChain = "ethereum" | "solana";

export interface WalletResult {
  address: string;
  network?: string;
  simulated?: boolean;
}

export interface TransactionResult {
  txHash: string;
  hash?: string;
  simulated?: boolean;
}

export async function connectWallet(chain: WalletChain): Promise<WalletResult | null> {
  if (chain === "solana") return await connectSolanaWallet();
  return await connectEvmWallet();
}

export async function sendTransaction(
  chain: WalletChain,
  to: string,
  amount: string
): Promise<TransactionResult> {
  if (chain === "solana") {
    const tx = await sendSolanaTransaction(to, amount);
    return { txHash: tx.txHash, hash: tx.txHash, simulated: tx.simulated };
  }
  const tx = await sendEvmTransaction(to, amount);
  return { txHash: tx.txHash, hash: tx.txHash, simulated: tx.simulated };
}
