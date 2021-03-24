import { exec } from 'child_process';

export const gitStagedCount = (): Promise<number> => {
  try {
    let str: string;

    if (process.platform === 'win32') {
      str = 'git diff --cached --numstat | find /c /v ""';
    } else if (['linux', 'darwin'].includes(process.platform)) {
      str = 'git diff --cached --numstat | wc -l'
    } else {
      throw 'unknown OS'
    }

    return new Promise((resolve, reject) => {
      exec(str, (err, stdout, stderr) => {
        if (err) {
          resolve(0);
        } else {
          if (process.platform === 'win32') {
            resolve(Number.parseInt(stdout.trim()));
          } else {
            // à voir selon la réponse de linux et apple
            resolve(Number.parseInt(stdout.trim()));
          }
        }
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};
