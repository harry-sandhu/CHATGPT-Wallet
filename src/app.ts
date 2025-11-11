import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { createApp } from "./core/app";
import { runMCPServer } from "./core/mcp";
import { createCard } from "./ui/card";
import { createButton } from "./ui/button";
import { connectWallet, sendTransaction } from "./wallets/connectors";

const appServer = express();
appServer.use(bodyParser.json());


// MANIFEST + OPENAPI SERVING

appServer.get("/openai-app.json", (_, res) => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve("openai-app.json"), "utf-8"));
  res.json(manifest);
});

appServer.get("/openapi.json", (_, res) => {
  const openapi = JSON.parse(fs.readFileSync(path.resolve("openapi.json"), "utf-8"));
  res.json(openapi);
});


//  CREATE APP INSTANCE

const feApp = createApp({
  name: "Firstember Wallet",
  description: "Connect wallets (EVM or Solana) and send transactions directly from ChatGPT.",
});

let connectedWallet: { chain: string; address: string } | null = null;


//  SHOW WALLETS

feApp.on("show_wallets", async () => {
  const wallets = [
    {
      id: "metamask",
      chain: "ethereum",
      icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
      title: "MetaMask (Ethereum)",
      subtitle: "Browser-based wallet for Ethereum & EVM chains",
    },
    {
      id: "phantom",
      chain: "solana",
      icon: "https://avatars.githubusercontent.com/u/78782331?s=200&v=4",
      title: "Phantom (Solana)",
      subtitle: "Popular Solana wallet (also supports EVM)",
    },
    {
      id: "walletconnect",
      chain: "ethereum",
      icon: "https://walletconnect.com/walletconnect-logo.svg",
      title: "WalletConnect",
      subtitle: "Connect via QR code (mobile wallets)",
    },
    {
      id: "coinbase",
      chain: "ethereum",
      icon: "https://avatars.githubusercontent.com/u/188712?v=4",
      title: "Coinbase Wallet",
      subtitle: "Multi-chain web wallet",
    },
  ];

  const blocks = wallets.map((wallet) => ({
    type: "wallet_row",
    icon: wallet.icon,
    title: wallet.title,
    subtitle: wallet.subtitle,
    button: createButton("Connect", {
      action: "connect_wallet",
      data: { chain: wallet.chain, provider: wallet.id },
    }),
  }));

  return createCard({
    title: " Connect Your Wallet",
    subtitle: "Choose a wallet to link with Firstember.",
    blocks,
    footer: "Supports MetaMask (EVM) and Phantom (Solana).",
  });
});


//  CONNECT WALLET

feApp.on("connect_wallet", async (params: any) => {
  const chain = params?.data?.chain || "ethereum";
  const result = await connectWallet(chain);
  if (!result)
    return createCard({
      title: " Wallet Connection Failed",
      subtitle: "User cancelled or no wallet available.",
    });

  connectedWallet = { chain, address: result.address };
  const chainName = chain === "solana" ? "Solana" : "Ethereum";

  return createCard({
    title: `${chainName} Wallet Connected `,
    subtitle: `Address: ${result.address}${result.network ? ` (${result.network})` : ""}`,
    buttons: [
      createButton(`Send ${chain === "solana" ? "SOL" : "ETH"}`, { action: "send_prompt", data: { chain } }),
      createButton("Disconnect", { action: "disconnect_wallet" }),
    ],
  });
});


// DISCONNECT

feApp.on("disconnect_wallet", async () => {
  connectedWallet = null;
  return createCard({
    title: "🔌 Disconnected",
    subtitle: "You can reconnect anytime.",
    buttons: [createButton("Show Wallets", { action: "show_wallets" })],
  });
});


// SEND PROMPT

feApp.on("send_prompt", async (params: any) => {
  const chain = params?.data?.chain || connectedWallet?.chain || "ethereum";

  if (!connectedWallet) {
    return createCard({
      title: " No Wallet Connected",
      subtitle: "Please connect a wallet first.",
      buttons: [createButton("Show Wallets", { action: "show_wallets" })],
    });
  }

  const tokenSymbol = chain === "solana" ? "SOL" : "ETH";

  return createCard({
    title: ` Send ${tokenSymbol}`,
    subtitle: `Connected: ${connectedWallet.address}\nChoose amount to send.`,
    buttons: [
      createButton(`Send 0.01 ${tokenSymbol}`, {
        action: "confirm_send",
        data: {
          chain,
          to: "0x1234567890abcdef1234567890abcdef12345678",
          amount: "0.01",
        },
      }),
    ],
  });
});


// CONFIRM SEND

feApp.on("confirm_send", async (params: any) => {
  const { chain = "ethereum", to, amount } = params.data;
  try {
    const tx = await sendTransaction(chain, to, amount);
    const txHash = tx.txHash || tx.hash || "0xmock";

    return createCard({
      title: "Transaction Sent",
      subtitle: `Sent ${amount} ${chain === "solana" ? "SOL" : "ETH"} to ${to}\nHash: ${txHash}`,
      buttons: [
        createButton("🔍 View Transaction", {
          action: "open_url",
          data: {
            url:
              chain === "solana"
                ? `https://explorer.solana.com/tx/${txHash}?cluster=mainnet`
                : `https://sepolia.etherscan.io/tx/${txHash}`,
          },
        }),
      ],
    });
  } catch (err: any) {
    return createCard({
      title: "Transaction Failed",
      subtitle: err?.message || "Something went wrong.",
    });
  }
});


// SERVER START

const PORT = 4000;
appServer.listen(PORT, () => {
  console.log(` Firstember Wallet running at http://localhost:${PORT}`);
  console.log(`Manifest: http://localhost:${PORT}/openai-app.json`);
});

runMCPServer(feApp, appServer);
