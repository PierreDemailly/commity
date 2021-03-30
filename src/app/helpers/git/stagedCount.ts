import {exec} from 'child_process';

export const gitStagedCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    exec('git diff --cached --numstat', (err, stdout, stderr) => {
      if (err || stderr) {
        resolve(0);
      } else {
        resolve(stdout.split('\n').length - 1);
      }
    });
  });
};
