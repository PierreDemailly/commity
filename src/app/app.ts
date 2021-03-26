#!/usr/bin/env node

import tricolors from 'tricolors';
import fs from 'fs';
import nezparser, { Inezparser, SetupOptions } from 'nezparser';
import { Init } from './commands/init';
import { Commity } from './commity';
import { join } from 'path';

export class App {
  initialized = true;
  conf: SetupOptions | undefined;

  constructor() {
  }

  async initialize(): Promise<void> {
    try {
      await this.isGitInitialized();
      this.setupParser();

      nezparser.on('init').so(async () => {
        this.initialized = false;
        Init.initialize();
      });

      if (this.initialized) {
        await this.isCommityFriendly();
        Commity.run(nezparser as Inezparser);
      }
    } catch (error) {
      process.exit();
    }
  }

  async isCommityFriendly(): Promise<void> {
    try {
      this.conf = await import(join(process.cwd(), 'commity.json'));
    } catch (error) {
      tricolors.redLog('Commity is not initialized. Please run "commity init" to init your workspace.');
      process.exit();
    }
  }

  async isGitInitialized(): Promise<void> {
    try {
      const path = join(process.cwd(), '/.git');
      await fs.promises.access(path, fs.constants.F_OK);
      return;
    } catch (error) {
      tricolors.redLog('Current directory is not a Git repository.');
      process.exit();
    }
  }

  setupParser(): void {
    nezparser.setup({
      usage: 'commity <command> <options>',
      options: [
        {
          name: '--push',
          alias: '-p',
          description: 'push changes to current remote branch after commiting',
        },
        {
          name: '--addAll',
          alias: '-a',
          description: 'add all staged changes before commiting',
        },
      ],
      commands: [
        {
          name: 'init',
          description: 'inititialize Commity',
          options: [
            {
              name: '--overwrite',
              alias: '-o',
              description: 'overwrite existing commity.json (if exists)',
            },
          ],
        },
      ],
    });
    nezparser.parse();
  }
}
