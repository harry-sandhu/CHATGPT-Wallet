import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";


// Connect to a Solana wallet (Phantom, Solflare, etc.)
 
export async function connectSolanaWallet(): Promise<{ address: string; network?: string; simulated?: boolean }> {
  if (typeof window === "undefined") {
    return { address: "11111111111111111111111111111111", simulated: true, network: "mock" };
  }

  const w = window as any;
  const provider = w?.solana;
  if (!provider) {
    alert("⚠️ No Solana wallet detected (Phantom, Solflare, Backpack, etc.)");
    return { address: "11111111111111111111111111111111", simulated: true };
  }

  try {
    const res = await provider.connect();
    const pubKey = res.publicKey?.toString();
    console.log(`[Firstember] Connected Solana wallet ${pubKey}`);
    return { address: pubKey, network: "mainnet-beta" };
  } catch (err) {
    console.error("Solana connect error:", err);
    return { address: "11111111111111111111111111111111", simulated: true };
  }
}

// Send SOL from the connected wallet to another address.

export async function sendSolanaTransaction(to: string, amount: string) {
  if (typeof window === "undefined") {
    return {
      simulated: true,
      txHash: Math.random().toString(16).slice(2).padEnd(64, "0"),
    };
  }

  const w = window as any;
  const provider = w?.solana;
  if (!provider) throw new Error("No Solana wallet found. Please install Phantom or compatible wallet.");

  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  const from = new PublicKey(provider.publicKey);
  const toPubkey = new PublicKey(to);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey,
      lamports: parseFloat(amount) * 1e9, // convert SOL → lamports
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = from;

  const signed = await provider.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());

  console.log(`[Firstember] Sent ${amount} SOL to ${to}, tx: ${sig}`);
  return { txHash: sig, hash: sig };

}
