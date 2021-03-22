import { exec } from 'child_process';
import inquirer from 'inquirer';

export class Helper {
  static getFields(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const conf = require(process.cwd() + '/commity.json');
      const inquirerPrompts = [];
      const fields = conf.fields;
      const fieldsNames = [];

      for (const field in fields) {
        const fieldName = Object.keys(fields[field]).join();
        fieldsNames.push(fieldName);

        const fieldObject = fields[field][fieldName];
        const prompt = () => {
          return inquirer.prompt({
            name: fieldName,
            type: fieldObject['type'] === 'select' ? 'list' : 'input',
            message: fieldObject['label'],
            choices: fieldObject['selectOptions'] || null,
          })
        };
        inquirerPrompts.push(prompt);
      }

      const results: any = { fieldsNames, values: {} };

      /**
       * Make prompts and set results in results (above).
       */
      for (let i = 0; i < inquirerPrompts.length; i++) {
        try {
          const res = await inquirerPrompts[i]();
          const prop = Object.keys(res)[0];
          const val = Object.values(res)[0];
          results['values'][prop] = val;
        } catch (e) {
          reject(e);
          process.exit();
        }
      }

      /**
       * Send results to the callback.
       */
      resolve(results);
    });
  }

  static getGitStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      exec('git status -s', (err, stdout, stderr) => {
        if (err) {
          reject('Error git status. ' + err);
        } else {
          resolve(stdout ? stdout : stderr);
        }
      });
    })
  }

  static getStagedCount(): Promise<any> {
    return new Promise((resolve, reject) => {
      exec('git diff --cached --numstat | wc -l', (err, stdout, stderr) => {
        if (err) {
          reject('Error git diff. ' + err);
        } else {
          resolve(Number(stdout.trim()));
        }
      });
    });
  }

  static gitAddAll() {
    return new Promise((resolve, reject) => {
      exec('git add --all', (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        resolve(stdout ? stdout : stderr);
      })
    })
  }

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

  static gitPush() {
    return new Promise((resolve, reject) => {
      exec('git push', (err, stdout, stderr) => {
        if (err) {
          reject('Could not push. ' + err);
        } else {
          resolve(true);
        }
      });
    });
  }
}