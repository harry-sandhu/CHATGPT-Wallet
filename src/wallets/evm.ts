import { ethers } from "ethers";

/**
 * Connect to an EVM-compatible wallet (MetaMask, Coinbase, etc.)
 */
export async function connectEvmWallet(): Promise<{ address: string; network?: string; simulated?: boolean }> {
  if (typeof window === "undefined") {
    console.warn("[Firstember] connectEvmWallet() called on server — returning mock data");
    return { address: "0x0000000000000000000000000000000000000000", simulated: true, network: "mock" };
  }

  const anyWindow = window as any;
  const ethereum = anyWindow.ethereum;
  if (!ethereum) {
    alert("⚠️ No EVM wallet found (MetaMask, Coinbase, etc.)");
    return { address: "0x0000000000000000000000000000000000000000", simulated: true };
  }

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(ethereum);
    const network = (await provider.getNetwork()).name;
    const address = accounts[0];
    console.log(`[Firstember] Connected EVM wallet ${address} (${network})`);
    return { address, network };
  } catch (err: any) {
    console.error("EVM wallet connection failed:", err);
    return { address: "0x0000000000000000000000000000000000000000", simulated: true };
  }
}


// Send an EVM transaction via connected wallet

export async function sendEvmTransaction(to: string, amount: string) {
  if (typeof window === "undefined") {
    return {
      simulated: true,
      txHash: "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"),
    };
  }

  const anyWindow = window as any;
  const ethereum = anyWindow.ethereum;
  if (!ethereum) throw new Error("No EVM wallet found");

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  try {
    const value = ethers.parseEther(amount);
    const tx = await signer.sendTransaction({ to, value });
    console.log(`[Firstember] Sent ${amount} ETH to ${to}, tx: ${tx.hash}`);
    return { txHash: tx.hash, hash: tx.hash };

  } catch (err: any) {
    console.error("Transaction failed:", err);
    throw new Error(err?.message || "Failed to send transaction");
  }
}
