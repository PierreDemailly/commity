import { exec } from 'child_process';

export const gitChangesCount = (): Promise<number> => {
  try {
    return new Promise((resolve, reject) => {
      exec('git status -s', (err, stdout, stderr) => {
        console.log(process.env);

        if (err) {
          resolve(0);
        } else {
          resolve(stdout.split('\n').length - 1);
        }
      });
    });
  } catch (error) {
    throw new Error(error);
  }
}