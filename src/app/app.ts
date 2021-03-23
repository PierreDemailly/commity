import tricolors from 'tricolors';
import fs from 'fs';
import nezparser, { Inezparser } from 'nezparser';
import { Init } from './commands/init';
import { Commity } from './commity';

class App {
  initialized = true;
  conf: any;

  constructor() {
    this.initialize();
  }

  initialize(): void {
    this.isGitInitialized();
    this.isCommityFriendly();
    this.setupParser();

    nezparser.on('init').so(() => {
      this.initialized = false;
      Init.initialize();
    });

    if (this.initialized) {
      Commity.run(nezparser as Inezparser);
    }
  }

  isCommityFriendly(): void {
    try {
      this.conf = require(`${process.cwd()}/commity.json`);
    } catch (error) {
      tricolors.redLog('Commity is not initialized. Please run "commity init" to init your workspace.');
      process.exit();
    }
  }

  isGitInitialized(): void {
    const path = `${process.cwd()}/.git`;
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        tricolors.redLog('Current directory is not a Git repository.');
        process.exit();
      }
    });
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

new App();
