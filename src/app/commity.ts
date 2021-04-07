import {gitCommit} from './helpers/git/commit';
import {gitChangesCount} from './helpers/git/changesCount';
import {gitAddAll} from './helpers/git/addAll';
import {gitStagedCount} from './helpers/git/stagedCount';
import {Fields, fields} from './helpers/core/fields';
import tricolors from 'tricolors';
import nezbold from 'nezbold';
import {Inezparser} from 'nezparser';
import {gitPush} from './helpers/git';
import {Conf} from './app';

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
    this.checkStagedCount();
    await this.getFields();
    const render = this.conf.render.split(' ');
    const values = this.result.values;
    const renderComponent = this.conf.renderComponents;
    const renderFinal: string[] = [];
    const renderLength = render.length;
    for(let i = 0; i < renderLength; i++) {
      if((values[render[i]] as string).length > 0) {
        const component = renderComponent.filter(comp => comp.name === render[i])[0];
        const message = component.message.replace(`$+${component.name}`, (values[render[i]] as string));
        renderFinal.push(message);
      }
    }
    const commitMsg = renderFinal.join(' ');
    this.finalMsg += tricolors.green('Commited ' + this.stagedCount + ' files. ') + nezbold.bold(commitMsg);
    await this.commit(commitMsg);
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
      tricolors.redLog('Error while count changes, cannot commit. ' + e);
      process.exit();
    }
  }

  async handleAddAllOption(): Promise<void> {
    this.stagedCount = await gitStagedCount();
    if (this.nezparser.hasOption('addAll', 'a') && (this.changesCount - this.stagedCount) > 0) {
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
    if (this.stagedCount === 0 && !this.nezparser.hasOption('addAll', 'a')) {
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
