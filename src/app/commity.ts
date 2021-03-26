import { gitCommit } from './helpers/git/commit';
import { gitChangesCount } from './helpers/git/changesCount';
import { gitAddAll } from './helpers/git/addAll';
import { gitStagedCount } from './helpers/git/stagedCount';
import { Fields, fields } from './helpers/core/fields';
import tricolors from 'tricolors';
import nezbold from 'nezbold';
import { Inezparser, SetupOptions } from 'nezparser';
import { gitPush } from './helpers/git';
import { join } from 'path';
import { Conf } from './app';

export class Commity {
  nezparser: Inezparser;
  conf: Conf;
  finalMsg = '';
  stagedCount = 0;
  changesCount = 0;
  result: Fields;

  constructor(nezparser: Inezparser, conf: Conf) {
    this.nezparser = nezparser;
    this.conf = conf;
    this.result = null as unknown as Fields;
  }

  async run(): Promise<void> {
    await this.checkChangesCount();
    await this.handleAddAllOption();
    await this.checkStagedCount();
    await this.getFields();


    const render = this.conf.render;
    const values = this.result.values;
    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
      /\$\+(\w+)/gui,
      (whole: any, key: string) => hasOwn.call(values, key) ? values[key] : whole,
    );

    this.finalMsg += tricolors.green('Commited ' + this.stagedCount + ' files. ') + nezbold.bold(commitMsg);

    await this.commit(this.finalMsg);
    await this.handlePushOption();

    console.log(this.finalMsg);
    process.exit();
  }

  async checkChangesCount(): Promise<void> {
    try {
      this.changesCount = await gitChangesCount();
      if (this.changesCount < 1) {
        tricolors.redLog('No changes detected, cannot commit.');
        process.exit();
      }
    } catch (e) {
      tricolors.redLog('Error while count changes, cannot commit. ' + e,);
      process.exit();
    }
  }

  async handleAddAllOption(): Promise<void> {
    this.stagedCount = await gitStagedCount();
    if (this.nezparser.hasOption('addAll', 'a') && (this.changesCount - this.stagedCount) > 0) {
      try {
        await gitAddAll();
        tricolors.greenLog('Added ' + (this.changesCount - this.stagedCount) + ' files to staged changed \r\n');
        this.stagedCount += this.changesCount - this.stagedCount;
      } catch (e) {
        tricolors.redLog(e);
      }
    }
  }

  async checkStagedCount(): Promise<void> {
    try {
      if (this.stagedCount === 0 && !this.nezparser.hasOption('addAll', 'a')) {
        tricolors.redLog('Are you sure there are staged changes to commit ?');
        process.exit();
      }
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }
  }

  async getFields(): Promise<void> {
    try {
      this.result = await fields();
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }
  }

  async commit(msg: string): Promise<void> {
    try {
      await gitCommit(msg);
    } catch (e) {
      tricolors.redLog(e);
      process.exit();
    }
  }

  async handlePushOption(): Promise<void> {
    if (this.nezparser.hasOption('push', 'p')) {
      try {
        await gitPush();
        this.finalMsg += '\r\n' + nezbold.bold('Pushed commited changes');
      } catch (e) {
        tricolors.redLog(e);
      }
    }
  }
}
