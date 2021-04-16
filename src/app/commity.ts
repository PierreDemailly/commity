import tricolors from 'tricolors';
import nezbold from 'nezbold';
import {Iclargs} from '@clinjs/clargs';
import {gitAddAll, gitChangesCount, gitCommit, gitPush, gitStagedCount, fields, Fields} from './helpers';
import {Conf} from './app';

export class Commity {
  clargs: Iclargs;
  conf: Conf; 
  finalMsg = '';
  stagedCount = 0;
  changesCount = 0;
  result: Fields;

  constructor(clargs: Iclargs, conf: Conf) {
    this.clargs = clargs;
    this.conf = conf;
    this.result = null as unknown as Fields;
  }

  async run(): Promise<void> {
    await this.checkChangesCount();
    await this.handleAddAllOption();
    this.checkStagedCount();
    await this.getFields();

    const render = this.conf.render;
    const values = this.result.values;
    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
      /{{\s*([^}]+)\s*}}/g,
      (whole: any, key: string) => hasOwn.call(values, key) ? (() => {
        const field = this.conf.fields.find(field => field[key])[key];
        if (!values[key] && field.required === false) {
          return '';
        }
        const prefix = field.decorations?.prefix;
        if (prefix) {
          values[key] = prefix + values[key];
        }
        return values[key];
      })() : whole,
    );

    await this.commit(commitMsg);
    await this.handlePushOption();
    this.finalMsg += tricolors.green('Commited ' + this.stagedCount + ' files. ') + nezbold.bold(commitMsg);

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
      tricolors.redLog('Error while count changes, cannot commit. ' + e);
      process.exit();
    }
  }

  async handleAddAllOption(): Promise<void> {
    this.stagedCount = await gitStagedCount();
    if (this.clargs.hasOption('addAll', 'a') && (this.changesCount - this.stagedCount) > 0) {
      try {
        await gitAddAll();
        tricolors.greenLog('Added ' + (this.changesCount - this.stagedCount) + ' files to staged changes \r\n');
        this.stagedCount += this.changesCount - this.stagedCount;
      } catch (e) {
        tricolors.redLog(e);
      }
    }
  }

  checkStagedCount(): void {
    if (this.stagedCount === 0 && !this.clargs.hasOption('addAll', 'a')) {
      tricolors.redLog('Are you sure there are staged changes to commit ?');
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
    if (this.clargs.hasOption('push', 'p')) {
      try {
        await gitPush();
        this.finalMsg += '\r\n' + nezbold.bold('Pushed commited changes');
      } catch (e) {
        tricolors.redLog(e);
      }
    }
  }
}
