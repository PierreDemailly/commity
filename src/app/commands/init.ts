import inquirer from 'inquirer';
import fs from 'fs';
import fsp from 'promise-fs';
import tricolors from 'tricolors';
import commity from '../../commity.json';

export class Init {
  static initialize(): void {
    const path = `${process.cwd()}/commity.json`;
    fs.access(path, fs.F_OK, async (err) => {
      if (!err) {
        const res = await inquirer.prompt({
          name: 'overwrite',
          type: 'confirm',
          message: 'file commity.json already exists, overwrite ?',
        });
        if (res.overwrite) {
          fsp.writeFile(`${process.cwd()}/commity.json`, JSON.stringify(commity, null, 2)).then(() => {
            tricolors.greenLog(`Updated ${process.cwd()}/commity.json`);
            process.exit();
          }).catch((e) => {
            tricolors.redLog(e);
            process.exit();
          });
        } else {
          process.exit();
        }
      }
      fsp.writeFile(`${process.cwd()}/commity.json`, JSON.stringify(commity, null, 2)).then(() => {
        tricolors.greenLog(`Created ${process.cwd()}/commity.json`);
        process.exit();
      }).catch((e) => {
        tricolors.redLog(e);
        process.exit();
      });
    });
  }
}