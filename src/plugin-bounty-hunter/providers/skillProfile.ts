import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";

export const SKILL_PROFILE = `
DEVELOPER PROFILE
-----------------
Languages    : Rust (primary), TypeScript
Ecosystem    : Solana — Anchor framework, SPL tokens, PDAs, CPIs, account model
Domains      : On-chain programs, DeFi primitives, token standards (SPL/Token-2022),
               NFT programs (Metaplex/bubblegum), Typescript SDK/client development
Tooling      : Anchor, Solana CLI, Solana web3.js, @solana/spl-token, Bankrun, Litesvm
Experience   : Advanced — capable of writing, testing, and auditing production Solana programs
Not strong in: Move, EVM/Solidity, ZK circuits, frontend UI work
`.trim();

export const skillProfileProvider: Provider = {
  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State
  ): Promise<string> => {
    return `The developer's skill profile:\n${SKILL_PROFILE}`;
  },
};
