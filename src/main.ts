#!/usr/bin/env node

import { App } from "./app/app.js";

async function main() {
  const app = new App();
  await app.initialize();
}

main();
