import { exec } from 'child_process';

export const gitChangesCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    return new Promise((resolve, reject) => {
      exec('git diff --cached --numstat | wc -l', (err, stdout, stderr) => {
        if (err) {
          reject('Error git diff. ' + err);
        } else {
          resolve(stdout.trim().split('\n').length - 1);
        }
      });
    });
  });
}