#!/usr/bin/env node
import { createInterface } from "node:readline";

import { App } from "./app/app.js";

// force exit with CTRL + C
// because `prompts` handle it as a return value
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on("SIGINT", () => {
  process.exit();
});

async function main() {
  const app = new App();
  await app.initialize();
}

main();
