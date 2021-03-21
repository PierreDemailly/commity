const fsp = require('promise-fs');
const chalk = require('chalk');
const commity = require('./commity.json');

/**
 * CLI init (sub)command action
 */
module.exports = init = () => {
  fsp.writeFile(process.cwd() + '/commity.json', JSON.stringify(commity, null, 2)).then(() => {
    console.log(chalk.greenBright(`Created ${process.cwd()}/commity.json`));
    process.exit();
  }).catch((e) => {
    console.log(chalk.red(e));
    process.exit();
  });
}
