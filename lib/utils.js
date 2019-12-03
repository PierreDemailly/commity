const inquirer = require('inquirer');
const { exec } = require('child_process');
const chalk    = require('chalk');
let conf;
try {
  conf = require(process.cwd() + '/commity.json');
} catch (error) {
}
/**
 * Transform each commitsPart from commity.json
 * into inquirer prompts.
 *
 * Prompt each prompts and return the result in callback.
 */
const commitParts = async (result) => {
  const inquirerPrompts = [];
  const commitsParts = conf.commitsParts;
  const partNames = [];

  /**
   * Prepare each inquirer prompts needed.
   */
  for (const part in commitsParts) {
    const partName = Object.keys(commitsParts[part]).join();
    partNames.push(partName);
    const prompt = () => { return inquirer.prompt({
      name: partName,
      type: commitsParts[part][partName]['type'] === 'select' ? 'list' : 'input',
      message: commitsParts[part][partName]['label'],
      choices: commitsParts[part][partName]['selectOptions'] || null
    })};
    inquirerPrompts.push(prompt);
  }

  const results = { partNames: partNames, values : {} };

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
      console.log(chalk.red(e));
      process.exit();
    }
  }

  /**
   * Send results to the callback.
   */
  result(results);
}

/**
 * Returns staged files count.
 */
const getStagedCount = (callback) => {
  exec('git diff --cached --numstat | wc -l', (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red('Are you sure there are staged changes to commit ?'));
      process.exit();
    } else {
      callback(Number(stdout.trim()));
    }
  });
}

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
module.exports = { commitParts, getStagedCount, gitAddAll };
