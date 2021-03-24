import { exec } from 'child_process';

export const gitChangesCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    exec('git status -s', (err, stdout, stderr) => {
      if (err || stderr) {
        resolve(0);
      } else {
        resolve(stdout.split('\n').length - 1);
      }
    });
  });
}