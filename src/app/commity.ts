import tricolors from 'tricolors';
import nezbold from 'nezbold';
import { Helper } from './helper'
import { Inezparser, SetupOptions } from 'nezparser';

interface Conf extends SetupOptions {
  render: string;
}

export class Commity {
  static async run(nezparser: Inezparser): Promise<void> {
    let finalMsg = '';
    let stagedCount: number;
    let changesCount: number;
    let conf: Conf;

    /**
     * Check that commity.json file exist in current working directory
     */
    try {
      conf = require(process.cwd() + '/commity.json');
    } catch (error) {
      tricolors.redLog('Commity is not initialized. Please run "commity init" to init your workspace.');
      process.exit();
    }

    /**
     * Check there are changes to commit
     */
    try {
      const status = await Helper.getGitStatus();
      changesCount = status.split('\n').length - 1;
      if (changesCount < 1) {
        tricolors.redLog('No changes detected, cannot commit.');
        process.exit();
      }
    } catch (e) {
      tricolors.redLog('Error while count changes, cannot commit. ' + e,);
      process.exit();
    }

    /**
     * Get number of staged files
     */
    try {
      stagedCount = await Helper.getStagedCount();
      if (stagedCount === 0 && !nezparser.hasOption('addAll', 'a')) {
        tricolors.redLog('Are you sure there are staged changes to commit ?');
        process.exit();
      }
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }

    /**
     * Handle options --addAll, -a
     */
    if (nezparser.hasOption('addAll', 'a') && (changesCount - stagedCount) > 0) {
      try {
        await Helper.gitAddAll();
        tricolors.greenLog('Added ' + (changesCount - stagedCount) + ' files to staged changed \r\n');
        stagedCount += changesCount - stagedCount;
      } catch (e) {
        tricolors.redLog(e);
      }
    }

    /**
     * commitParts() will prompt to user all the needed parts of the commit
     */
    let result;
    try {
      result = await Helper.getFields();
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }

    const render = conf.render;
    const values = result.values;
    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
      /\$\+(\w+)/gui,
      (whole: any, key: PropertyKey) => hasOwn.call(values, key) ? values[key] : whole,
    );

    finalMsg += tricolors.green('Commited ' + stagedCount + ' files. ') + nezbold.bold(commitMsg);
    /**
     * Try to commit
     */
    try {
      await Helper.gitCommit(commitMsg);
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }

    /**
     * Handle options --push, -p
     */
    if (nezparser.hasOption('push', 'p')) {
      try {
        await Helper.gitPush();
        finalMsg += '\r\n' + nezbold.bold('Pushed commited changes');
      } catch (e) {
        tricolors.redLog(e);
      }
    }

    console.log(finalMsg);
    process.exit();
  }
} 
