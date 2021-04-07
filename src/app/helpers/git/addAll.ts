import {exec} from 'child_process';

export const gitAddAll = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec('git add --all', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
