import inquirer from 'inquirer';
import fs from 'fs';
import tricolors from 'tricolors';
import commity from '../../commity.json';
import { join } from 'path';

export class Init {
  static async initialize(): Promise<void> {
    const path = join(process.cwd(), '/commity.json');

    try {
      // await fs.promises.access(path, fs.constants.F_OK);
      const commityJson = await fs.promises.open(path, 'a');
      const stat = await commityJson.stat();

      if (stat.blocks === 0) {
        await commityJson.appendFile(JSON.stringify(commity, null, 2));
        await commityJson.close();
        
        tricolors.greenLog(`Created ${path}`);
        process.exit();
      }

      const res = await inquirer.prompt({
        name: 'overwrite',
        type: 'confirm',
        message: 'file commity.json already exists, overwrite ?',
      });

      if (!res.overwrite) {
        await commityJson.close();
        tricolors.blueLog(`${path} already exists and has not been updated.`);
        process.exit();
      }
      await fs.promises.rm(path);
      await commityJson.close();

      const newCommityJson = await fs.promises.open(path, 'a');

      await newCommityJson.appendFile(JSON.stringify(commity, null, 2));
      await newCommityJson.close();

      tricolors.greenLog(`Updated ${path}`);
      process.exit();
    } catch (error) {
      throw new Error(error);
    }
  }
}