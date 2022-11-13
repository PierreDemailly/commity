import tricolors from 'tricolors';
import nezbold from 'nezbold';
import {Iclargs} from '@clinjs/clargs';
import {fields, Fields} from './helpers/index.js';
import {Conf} from './app.js';

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
    console.log('conf', this.conf);
    const values = this.result.values;
    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
        /{{\s*([^}]+)\s*}}/g,
        (whole: any, key: string) => hasOwn.call(values, key) ? (() => {
          const field = this.conf.fields.find((field) => field[key])[key];
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
    const {changesCount} = await import('@pierred/node-git');
    try {
      this.changesCount = await changesCount();
      if (this.changesCount < 1) {
        throw new Error('No changes detected, cannot commit');
      }
    } catch (e) {
      throw e;
    }
  }

  async handleAddAllOption(): Promise<void> {
    const {indexAll, stagedCount} = await import('@pierred/node-git');
    this.stagedCount = await stagedCount();
    if (this.clargs.hasOption('addAll', 'a') && (this.changesCount - this.stagedCount) > 0) {
      try {
        await indexAll({omitNewFiles: false});
        tricolors.greenLog('Added ' + (this.changesCount - this.stagedCount) + ' files to staged changes \r\n');
        this.stagedCount += this.changesCount - this.stagedCount;
      } catch (e) {
        throw e;
      }
    }
  }

  checkStagedCount(): void {
    if (this.stagedCount === 0 && !this.clargs.hasOption('addAll', 'a')) {
      throw new Error('Are you sure there are staged changes to commit ?');
    }
  }

  async getFields(): Promise<void> {
    try {
      this.result = await fields();
    } catch (e) {
      throw e;
    }
  }

  async commit(msg: string): Promise<void> {
    const {commit} = await import('@pierred/node-git');
    try {
      await commit(msg);
    } catch (e) {
      throw e;
    }
  }

  async handlePushOption(): Promise<void> {
    if (this.clargs.hasOption('push', 'p')) {
      const {push} = await import('@pierred/node-git');
      try {
        await push();
        this.finalMsg += '\r\n' + nezbold.bold('Pushed commited changes');
      } catch (e) {
        throw e;
      }
    }
  }
}
