const utils = require('./utils');
const tricolors = require('tricolors');

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
    tricolors.redLog('Commity is not initialized. Please run "commity init" to init your workspace.');
    process.exit();
  }

  /**
   * Check there are changes to commit
   */
  try {
    const status = await utils.getGitStatus();
    changesCount = status.split('\n').length - 1;
    if (changesCount < 1) {
      tricolors.redLog('No changes detected, cannot commit.');
      process.exit();
    }
  } catch (e) {
    tricolors.redLog('Error while count changes, cannot commit.', e);
    process.exit();
  }

  /**
   * Get number of staged files
   */
  try {
    stagedCount = await utils.getStagedCount();
    if (stagedCount === 0 && !program.addAll) {
      tricolors.redLog('Are you sure there are staged changes to commit ?');
      process.exit();
    }
  } catch (e) {
    tricolors.redLog(e);
    process.exit();
  }

  /**
   * Handle options --addAll, -a
   */
  if (program.addAll && (changesCount - stagedCount) > 0) {
    try {
      await utils.gitAddAll();
      tricolors.greenLog('Added ' + (changesCount - stagedCount) + ' files to staged changed \r\n');
      stagedCount += changesCount - stagedCount;
    } catch (e) {
      tricolors.redLog(e);
    }
  }

  /**
   * commitParts() will prompt to user all the needed parts of the commit
   */
  let result;
  try {
    result = await utils.getFields();
  } catch (e) {
    tricolors.redLog(e);
    process.exit();
  }

  const render = conf.render;
  const values = result.values;
  const hasOwn = Object.prototype.hasOwnProperty;
  const commitMsg = render.replace(
    /\$\+(\w+)/gui,
    (whole, key) => hasOwn.call(values, key) ? values[key] : whole,
  );

  finalMsg += tricolors.green('Commited ' + stagedCount + ' files. ') + tricolors.blue(commitMsg);

  /**
   * Try to commit
   */
  try {
    await utils.gitCommit(commitMsg);
  } catch (e) {
    tricolors.redLog(e);
    process.emit();
  }

  /**
   * Handle options --push, -p
   */
  if (program.push) {
    try {
      await utils.gitpush();
      finalMsg += '\r\n' + tricolors.blue('Pushed commited changes');
    } catch (e) {
      tricolors.redLog(e);
    }
  }

  console.log(finalMsg);
  process.exit();
}
