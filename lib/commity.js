const chalk    = require('chalk');
const utils    = require('./utils');
const { exec } = require('child_process');
let conf;
try {
  conf = require(process.cwd() + '/commity.json');
} catch (error) {
}

module.exports = commity = (program) => {
  /**
   * Check that commity.json file exist in current working directory
   */
  try {
    require(process.cwd() + '/commity.json');
  } catch (error) {
    console.log(chalk.red('Commity is not initialized. Please run "commity init" to init your workspace.'));
    process.exit();
  }

  utils.getStagedCount((count) => {
    if (count === 0) {
      console.log(chalk.red('Are you sure there are staged changes to commit ?'));
      process.exit();
    }

    /**
     * Handle unknown arguments
     */
    const unknownArgs = program.rawArgs.filter((v) => v.startsWith('-'));
    if (unknownArgs.length > 0) {
      console.log(chalk.red('Unkown(s) options(s): ' + unknownArgs.join(', ')));
      console.log(`
        You can use two arguments:

        1. --push (alias -p)   -- used for push to current remote branch after commiting.
        2. --addAll (alias -a) -- used for add all staged changes before commiting.
      `);
      process.exit();
    }

    /**
     * commitParts() will prompt to user all the needed parts of the commit
     */
    utils.commitParts((result) => {
      const render = conf.render;
      const values = result.values;
      const hasOwn = Object.prototype.hasOwnProperty;
      const commitMsg = render.replace(
        /\$\+(\w+)/gui,
        (whole, key) => hasOwn.call(values, key) ? values[key] : whole,
      );

      /**
       * getStagedCount returns the number of staged files
       */
      utils.getStagedCount((count) => {
        const finalMsg = chalk.greenBright('Commited ' + count + ' files. ') + chalk.blueBright(commitMsg);

        // try to commit
        exec('git commit -m "' + commitMsg + '"', (err, stdout, stderr) => {
          if (err) {
            console.log(chalk.red('Could not commit. ' + err));
            process.exit();
          } else {
            // END SCRIPT :)
            console.log(finalMsg);
            process.exit();
          }
        });
      });
    });
  });
}
