import inquirer from 'inquirer';
import fs from 'fs';
import tricolors from 'tricolors';
import commity from '../../commity.json' assert { type: 'json' };
import {Iclargs} from '@clinjs/clargs';

export class InitCommandHandler {
  clargs: Iclargs
  commityFileExist = false;

  constructor(clargs: Iclargs) {
    this.clargs = clargs;
  }

  async run(): Promise<void> {
    const path = `${process.cwd()}/commity.json`;

    this.commityFileExist = await this.fileExist(path);
    if (this.commityFileExist) {
      if (!this.clargs.hasOption('overwrite', 'o')) {
        const overwriteResult = await inquirer.prompt({
          name: 'overwrite',
          type: 'confirm',
          message: 'file commity.json already exists, overwrite ?',
        });
        if (!overwriteResult.overwrite) {
          return;
        }
      }
      try {
        await this.createJson(path, commity);
        tricolors.greenLog(`Updated ${process.cwd()}/commity.json`);
      } catch (error) {
        tricolors.redLog(`Could not update ${process.cwd()}/commity.json`);
      } finally {
        process.exit();
      }
    }

    try {
      await this.createJson(path, commity);
      tricolors.greenLog(`Created ${process.cwd()}/commity.json`);
    } catch (error) {
      tricolors.redLog(`Could not create ${process.cwd()}/commity.json`);
    } finally {
      process.exit();
    }
  };

  async createJson(path: string, json: object): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(json, null, 2), (err) => {
        resolve(!!!err);
      });
    });
  }

  async fileExist(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.constants.F_OK, (err) => {
        resolve(!!!err);
      });
    });
  }
}
