// src/types/solana-web3.d.ts
declare module "@solana/web3.js" {
  export class PublicKey {
    constructor(value: string | Uint8Array);
    toBase58(): string;
    toString(): string;
  }

  export class Transaction {
    recentBlockhash: string;
    feePayer: PublicKey | null;
    add(...items: any[]): this;
    serialize(): Uint8Array;
  }

  export namespace SystemProgram {
    function transfer(params: {
      fromPubkey: PublicKey;
      toPubkey: PublicKey;
      lamports: number;
    }): any;
  }

  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getLatestBlockhash(): Promise<{ blockhash: string }>;
    sendRawTransaction(tx: Uint8Array): Promise<string>;
  }

  export const clusterApiUrl: (cluster: string) => string;
}
