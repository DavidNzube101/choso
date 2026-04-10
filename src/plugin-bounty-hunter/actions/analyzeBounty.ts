import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  ModelClass,
  generateText,
  elizaLogger,
} from "@elizaos/core";
import { SKILL_PROFILE } from "../providers/skillProfile.js";

const BOUNTY_KEYWORDS = [
  "bounty",
  "reward",
  "prize",
  "usdc",
  "sol",
  "deliverable",
  "submission",
  "deadline",
  "scope",
  "requirements",
  "eligible",
  "$",
];

function looksLikeBounty(text: string): boolean {
  const lower = text.toLowerCase();
  const matchCount = BOUNTY_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return text.length > 100 && matchCount >= 2;
}

function buildPrompt(bountyText: string): string {
  return `You are Choso, a bounty analysis agent for an experienced Solana/Rust developer.

${SKILL_PROFILE}

The developer has pasted the following bounty description:

---
${bountyText}
---

Analyze this bounty and respond in exactly this format (no extra text before or after):

**MATCH SCORE**: X/100
**REWARD**: [extract reward amount and token, or "Not specified"]
**DEADLINE**: [extract deadline, or "Not specified"]
**REQUIREMENTS**: [bullet list of the key technical requirements]
**EFFORT ESTIMATE**: [rough estimate: e.g. "2-3 days", "1 week", "2+ weeks"]
**RED FLAGS**: [bullet list of concerns — vague scope, low payout, unrealistic timeline, non-Solana stack, etc. Write "None" if clean]
**VERDICT**: [GO / MAYBE / SKIP] — [one sentence rationale]`;
}

export const analyzeBountyAction: Action = {
  name: "ANALYZE_BOUNTY",
  similes: [
    "REVIEW_BOUNTY",
    "CHECK_BOUNTY",
    "EVALUATE_BOUNTY",
    "ASSESS_BOUNTY",
    "BOUNTY_ANALYSIS",
  ],
  description:
    "Analyzes a pasted bounty description against the developer's Rust/Solana/TypeScript skill profile. Returns match score, requirements, effort estimate, red flags, and a go/no-go verdict.",

  validate: async (
    _runtime: IAgentRuntime,
    message: Memory
  ): Promise<boolean> => {
    const text = message.content.text ?? "";
    return looksLikeBounty(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    const bountyText = message.content.text ?? "";

    elizaLogger.info("[choso] Analyzing bounty...");

    await callback?.({ text: "Analyzing..." });

    let analysis: string;
    try {
      analysis = await generateText({
        runtime,
        context: buildPrompt(bountyText),
        modelClass: ModelClass.LARGE,
      });
    } catch (err) {
      elizaLogger.error("[choso] LLM call failed", err);
      await callback?.({ text: "Failed to analyze bounty. Check your OPENAI_API_BASE_URL and key." });
      return false;
    }

    await callback?.({ text: analysis });
    return true;
  },

  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Bounty: Build a Solana token swap program using Anchor. Reward: 2000 USDC. Deadline: 2 weeks. Requirements: Anchor v0.30, SPL token support, unit tests with Bankrun.",
        },
      },
      {
        user: "Choso",
        content: {
          text: "**MATCH SCORE**: 95/100\n**REWARD**: 2000 USDC\n**DEADLINE**: 2 weeks\n**REQUIREMENTS**:\n- Anchor v0.30\n- SPL token integration\n- Bankrun unit tests\n**EFFORT ESTIMATE**: 3-5 days\n**RED FLAGS**: None\n**VERDICT**: GO — Clean scope, strong skill match, reasonable reward for the effort.",
        },
      },
    ],
  ],
};
