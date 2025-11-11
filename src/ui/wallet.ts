// src/ui/wallet.ts
import { ethers } from "ethers";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
}


export async function connectWallet(): Promise<{ address: string; network?: string } | null> {
  if (!isBrowser()) {
    
    return { address: "0x0000000000000000000000000000000000000000", network: "mock" };
  }

  const anyWindow = window as any;

  if (!anyWindow.ethereum) {
    
    alert(" No wallet detected. Please install MetaMask or another wallet.");
    return null;
  }

  try {
    
    await anyWindow.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = (await provider.getNetwork()).name;
    console.log(`[Firstember Wallet] Connected: ${address} on ${network}`);
    return { address, network };
  } catch (err: any) {
    if (err?.code === 4001) {
      
      console.warn("[Firstember Wallet] User rejected connection request.");
      alert("Wallet connection request rejected.");
    } else {
      console.error("[Firstember Wallet] connectWallet error:", err);
      alert(` Wallet connection failed: ${err?.message || err}`);
    }
    return null;
  }
}

export async function sendTransaction(to: string, amount: string) {
  if (!isBrowser()) {
    
    const mockHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
    console.log("[Firstember Wallet] Simulating tx:", { to, amount, mockHash });
    return {
      hash: mockHash,
      simulated: true,
      from: "0x0000000000000000000000000000000000000000",
      to,
      value: amount
    };
  }

  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    throw new Error("No wallet extension detected. Please install MetaMask or compatible wallet.");
  }

  try {
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);
    const signer = await provider.getSigner();

   
    const value = ethers.parseEther(amount);

    
    try {
      await provider.estimateGas({ to, value });
    } catch (estimateErr) {
      console.warn("[Firstember Wallet] gas estimate failed (continuing):", estimateErr);
      
    }

   
    const tx = await signer.sendTransaction({ to, value });

    
    console.log("[Firstember Wallet] Transaction sent:", tx.hash);
    return tx;
  } catch (err: any) {
    
    if (err?.code === 4001) {
      console.warn("[Firstember Wallet] Transaction rejected by user.");
      alert("Transaction rejected in wallet.");
    } else if (err?.code === "INSUFFICIENT_FUNDS") {
      console.error("[Firstember Wallet] Insufficient funds.");
      alert("Insufficient funds to complete transaction.");
    } else {
      console.error("[Firstember Wallet] sendTransaction error:", err);
      alert(`Transaction failed: ${err?.message || err}`);
    }
    throw err;
  }
}
