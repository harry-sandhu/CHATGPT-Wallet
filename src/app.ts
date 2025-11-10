// src/app.ts
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { createApp } from "./core/app";
import { runMCPServer } from "./core/mcp";
import { createCard } from "./ui/card";
import { createButton } from "./ui/button";
import {
  connectWallet as browserConnectWallet,
  sendTransaction as browserSendTransaction,
} from "./ui/wallet";

// ----------------------
// EXPRESS SERVER
// ----------------------
const appServer = express();
appServer.use(bodyParser.json());

// Manifest
appServer.get("/openai-app.json", (_, res) => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve("openai-app.json"), "utf-8"));
  res.json(manifest);
});

// OpenAPI Schema
appServer.get("/openapi.json", (_, res) => {
  const openapi = JSON.parse(fs.readFileSync(path.resolve("openapi.json"), "utf-8"));
  res.json(openapi);
});

// ----------------------
// FIRSTEMBER APP LOGIC
// ----------------------
const feApp = createApp({
  name: "Firstember Wallet",
  description: "Connect browser wallets and send ETH directly from ChatGPT.",
});

let connectedWallet: string | null = null;

function useConnectResult(result: { address: string; network?: string } | null) {
  if (!result) return null;
  const addr = result.address;
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    connectedWallet = addr;
    return { simulated: true, address: addr };
  } else {
    connectedWallet = addr;
    return { simulated: false, address: addr, network: result.network };
  }
}

feApp.on("show_wallets", async () => {
  const wallets = [
    {
      id: "metamask",
      icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
      title: "MetaMask",
      subtitle: "Browser-based wallet",
    },
    {
      id: "walletconnect",
      icon: "https://walletconnect.com/walletconnect-logo.svg",
      title: "WalletConnect",
      subtitle: "Connect via QR code (mobile wallets)",
    },
    {
      id: "coinbase",
      icon: "https://avatars.githubusercontent.com/u/188712?v=4",
      title: "Coinbase Wallet",
      subtitle: "Mobile or web wallet",
    },
  ];

  const blocks = wallets.map((wallet) => ({
    type: "wallet_row",
    icon: wallet.icon,
    title: wallet.title,
    subtitle: wallet.subtitle,
    button: createButton("Connect", {
      action: "connect_wallet",
      data: { provider: wallet.id },
    }),
  }));

  return createCard({
    title: "🔗 Connect Your Wallet",
    subtitle: "Choose a wallet to link with Firstember.",
    blocks,
  });
});

feApp.on("connect_wallet", async (params: any) => {
  const provider = params?.data?.provider || "unknown";
  const result = await browserConnectWallet();
  const info = useConnectResult(result);

  if (!info)
    return createCard({
      title: "❌ Wallet Connection Failed",
      subtitle: "User cancelled or no wallet available.",
    });

  return createCard({
    title: `${provider} Connected ${info.simulated ? "(Simulated)" : "✅"}`,
    subtitle: `Address: ${info.address}${info.network ? ` (${info.network})` : ""}`,
    buttons: [
      createButton("Send ETH", { action: "send_prompt" }),
      createButton("Disconnect", { action: "disconnect_wallet" }),
    ],
  });
});

feApp.on("disconnect_wallet", async () => {
  connectedWallet = null;
  return createCard({
    title: "🔌 Disconnected",
    subtitle: "You can reconnect anytime.",
    buttons: [createButton("Show Wallets", { action: "show_wallets" })],
  });
});

feApp.on("send_prompt", async () => {
  if (!connectedWallet) {
    return createCard({
      title: "❌ No Wallet Connected",
      subtitle: "Please connect a wallet first.",
      buttons: [createButton("Show Wallets", { action: "show_wallets" })],
    });
  }

  return createCard({
    title: "💸 Send ETH",
    subtitle: `Connected: ${connectedWallet}`,
    buttons: [
      createButton("Send 0.01 ETH", {
        action: "confirm_send",
        data: { to: "0x1234567890abcdef1234567890abcdef12345678", amount: "0.01" },
      }),
    ],
  });
});

feApp.on("confirm_send", async (params: { data: { to: string; amount: string } }) => {
  const { to, amount } = params.data;
  const tx = await browserSendTransaction(to, amount);
  const txHash = (tx && (tx as any).hash) || (tx && (tx as any).txHash) || "0xmock";

  return createCard({
    title: "✅ Transaction Sent",
    subtitle: `Sent ${amount} ETH to ${to}\nHash: ${txHash}`,
    buttons: [
      createButton("🔍 View on Etherscan", {
        action: "open_url",
        data: { url: `https://sepolia.etherscan.io/tx/${txHash}` },
      }),
    ],
  });
});

// ----------------------
// START SERVER (Unified)
// ----------------------
const PORT = 4000;
appServer.listen(PORT, () => {
  console.log(`🚀 Unified server running at http://localhost:${PORT}`);
  console.log(`📜 Manifest: http://localhost:${PORT}/openai-app.json`);
});


runMCPServer(feApp, appServer);
