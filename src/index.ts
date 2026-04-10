import { AgentRuntime, ModelProviderName, elizaLogger } from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { character } from "./character.js";
import { bountyHunterPlugin } from "./plugin-bounty-hunter/index.js";

const DB_PATH = process.env.SQLITE_DB_PATH ?? "./data/choso.db";

function createRuntime(): AgentRuntime {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  const adapter = new SqliteDatabaseAdapter(db);

  return new AgentRuntime({
    token: process.env.OPENAI_API_KEY ?? "nosana",
    modelProvider: ModelProviderName.OPENAI,
    character: {
      ...character,
      settings: {
        ...character.settings,
        secrets: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "nosana",
          OPENAI_API_BASE_URL: process.env.OPENAI_API_BASE_URL ?? "",
        },
      },
    },
    databaseAdapter: adapter,
    plugins: [bootstrapPlugin, bountyHunterPlugin],
    evaluators: [],
    providers: [],
    actions: [],
    services: [],
    managers: [],
  });
}

async function main() {
  elizaLogger.info("Starting Choso...");

  const runtime = createRuntime();
  await runtime.initialize();

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    elizaLogger.warn("TELEGRAM_BOT_TOKEN not set — Telegram client will not start");
  } else {
    await TelegramClientInterface.start(runtime);
    elizaLogger.success("Choso is live on Telegram");
  }

  elizaLogger.success("Choso ready");
}

main().catch((err) => {
  elizaLogger.error("Fatal error", err);
  process.exit(1);
});
