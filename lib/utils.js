const inquirer = require('inquirer');
const { exec } = require('child_process');
/**
 * Transform each field from commity.json into inquirer prompts.
 *
 * Prompt each and resolve results.
 */
const getFields = () => {
  return new Promise(async (resolve, reject) => {
    const conf = require(process.cwd() + '/commity.json');
    const inquirerPrompts = [];
    const fields = conf.fields;
    const fieldsNames = [];

    /**
     * Prepare each inquirer prompts needed.
     */
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

    const results = { fieldsNames, values: {} };

    /**
     * Make prompts and set results in results (above).
     */
    for (let i = 0; i < inquirerPrompts.length; i++) {
      try {
        const res = await inquirerPrompts[i]();
        prop = Object.keys(res)[0];
        val = Object.values(res)[0];
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

/**
 * Return all files that have uncommited changes.
 *
 * To retrieve count of files, use .split('\n').length - 1.
 */
const getGitStatus = () => {
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

/**
 * Returns staged files count
 */
const getStagedCount = () => {
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

/**
 * Run git add --all
 */
const gitAddAll = () => {
  return new Promise((resolve, reject) => {
    exec('git add --all', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout ? stdout : stderr);
    })
  })
}

/**
 * Commit all staged files with given message
 */
const gitCommit = (message) => {
  return new Promise((resolve, reject) => {
    exec('git commit -m "' + message + '"', (err, stdout, stderr) => {
      if (err) {
        reject('Could not commit. ' + err);
      } else {
        resolve(true);
      }
    });
  })
}

/**
 * Push commited files
 */
const gitpush = () => {
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

module.exports = { getFields, getStagedCount, gitAddAll, gitCommit, gitpush, getGitStatus };
