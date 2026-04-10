import type { Plugin } from "@elizaos/core";
import { analyzeBountyAction } from "./actions/analyzeBounty.js";
import { skillProfileProvider } from "./providers/skillProfile.js";

export const bountyHunterPlugin: Plugin = {
  name: "plugin-bounty-hunter",
  description:
    "Analyzes pasted bounty descriptions against a hardcoded Rust/Solana/TypeScript developer profile. Returns match score, requirements, effort estimate, red flags, and a verdict.",
  actions: [analyzeBountyAction],
  providers: [skillProfileProvider],
  evaluators: [],
};
