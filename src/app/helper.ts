import { exec } from 'child_process';
import inquirer from 'inquirer';

export class Helper {

  static gitCommit(commit: string) {
    return new Promise((resolve, reject) => {
      exec('git commit -m "' + commit + '"', (err, stdout, stderr) => {
        if (err) {
          reject('Could not commit. ' + err);
        } else {
          resolve(true);
        }
      });
    })
  }
}