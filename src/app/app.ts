export interface Conf extends SetupOptions {
  render: string;
  fields: any[];
}

import tricolors from 'tricolors';
import fs from 'fs';
import clargs, {Iclargs, SetupOptions} from '@clinjs/clargs';
import {Commity} from './commity.js';
import {join} from 'path';
import {InitCommandHandler} from './commands/init.js';

export class App {
  conf: Conf | undefined;

  constructor() {
  }

  async initialize(): Promise<void> {
    await this.isGitInitialized();
    this.setupParser();

    if (clargs.commandUsed('init')) {
      const initCommandHandler = new InitCommandHandler(clargs as Iclargs);

      try {
        await initCommandHandler.run();
      } catch (e) {
        throw e;
      }

      return;
    }

    await this.isCommityFriendly();

    const commity = new Commity(clargs as Iclargs, this.conf as Conf);

    try {
      await commity.run();
    } catch (e) {
      throw e;
    }
  }

  async isCommityFriendly(): Promise<void> {
    try {
      const { default: { fields, render } } = await import(join(process.cwd(), 'commity.json'), {
        assert: { type: 'json' }
      });
      this.conf = { fields, render } as any;
    } catch (error) {
      console.log(error);
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
    clargs.setup({
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
    clargs.parse();
  }
}
