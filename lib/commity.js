const chalk    = require('chalk');
const utils    = require('./utils');
const { exec } = require('child_process');
let conf;
try {
  conf = require(process.cwd() + '/commity.json');
} catch (error) {
}

module.exports = commity = (program) => {
  let finalMsg = '';

  /**
   * Check that commity.json file exist in current working directory
   */
  try {
    require(process.cwd() + '/commity.json');
  } catch (error) {
    console.log(chalk.red('Commity is not initialized. Please run "commity init" to init your workspace.'));
    process.exit();
  }

  utils.getStagedCount(async (count) => {
    if (count === 0) {
      console.log(chalk.red('Are you sure there are staged changes to commit ?'));
      process.exit();
    }

    /**
     * Handle options --addAll, -a
     */
    if (program.addAll) {
      try {
        await utils.gitAddAll();
        finalMsg += chalk.greenBright('Added ' + count + ' files to staged changed \r\n');
      } catch (e) {
        console.log(chalk.red(e));
      }
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
        finalMsg += chalk.greenBright('Commited ' + count + ' files. ') + chalk.blueBright(commitMsg);

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
