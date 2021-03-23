import { exec } from 'child_process';

export const gitCommit = (msg: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec('git commit -m "' + msg + '"', (err, stdout, stderr) => {
      if (err) {
        reject('Could not push. ' + err);
      } else {
        resolve();
      }
    });
  });
}