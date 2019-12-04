const chalk    = require('chalk');
const utils    = require('./utils');

module.exports = commity = async (program) => {
  let finalMsg = '';
  let stagedCount;
  let changesCount
  let conf;

  /**
   * Check that commity.json file exist in current working directory
   */
  try {
    conf = require(process.cwd() + '/commity.json');
  } catch (error) {
    console.log(chalk.red('Commity is not initialized. Please run "commity init" to init your workspace.'));
    process.exit();
  }

  /**
   * Check there are changes to commit
   */
  try {
    const status = await utils.getGitStatus();
    changesCount = status.split('\n').length - 1;
    if (changesCount < 1) {
      console.log(chalk.red('No changes detected, cannot commit.'));
      process.exit();
    }
  } catch (e) {
    console.log(chalk.red('Error while count changes, cannot commit.'));
    process.exit();
  }

  /**
   * Get number of staged files
   */
  try {
    stagedCount = await utils.getStagedCount();
    if (stagedCount === 0 && !program.addAll) {
      console.log(chalk.red('Are you sure there are staged changes to commit ?'));
      process.exit();
  }
  } catch (e) {
    console.log(chalk.red(e));
    process.exit();
  }

  /**
   * Handle options --addAll, -a
   */
  if (program.addAll && (changesCount - stagedCount) > 0) {
    try {
      await utils.gitAddAll();
      finalMsg += chalk.greenBright('Added ' + (changesCount - stagedCount) + ' files to staged changed \r\n');
      stagedCount += changesCount - stagedCount;
      console.log('staged count 2 : ' + stagedCount);
    } catch (e) {
      console.log(chalk.red(e));
    }
  }

  /**
   * commitParts() will prompt to user all the needed parts of the commit
   */
  let result;
  try {
    result = await utils.commitParts();
  } catch (e) {
    console.log(chalk.red(e));
    process.exit();
  }

  const render = conf.render;
  const values = result.values;
  const hasOwn = Object.prototype.hasOwnProperty;
  const commitMsg = render.replace(
    /\$\+(\w+)/gui,
    (whole, key) => hasOwn.call(values, key) ? values[key] : whole,
  );

  finalMsg += chalk.greenBright('Commited ' + stagedCount + ' files. ') + chalk.blueBright(commitMsg);

  /**
   * Try to commit
   */
  try {
    await utils.gitCommit(commitMsg);
  } catch (e) {
    console.log(chalk.red(e));
    process.emit();
  }

  /**
   * Handle options --push, -p
   */
  if (program.push) {
    try {
      await utils.gitpush();
      finalMsg += '\r\n' + chalk+blueBright('Pushed commited changes');
    } catch (e) {
      console.log(chalk.red(e));
    }
  }

  console.log(finalMsg);
  process.exit();
}
