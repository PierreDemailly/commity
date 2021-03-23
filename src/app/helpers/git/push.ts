import { exec } from 'child_process';

export const gitPush = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec('git push', (err, stdout, stderr) => {
      if (err) {
        reject('Could not push. ' + err);
      } else {
        resolve();
      }
    });
  });
}