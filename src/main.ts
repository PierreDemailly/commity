#!/usr/bin/env node

import {App} from './app/app';

async function main() {
  const app = new App();
  await app.initialize();
}

main();
