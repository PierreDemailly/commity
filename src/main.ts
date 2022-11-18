#!/usr/bin/env node

import { App } from "./app/app.js";

async function main() {
  const app = new App();
  await app.initialize();
}

main();

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled rejection at ", promise, `reason: ${reason}`);
  process.exit(1);
});
