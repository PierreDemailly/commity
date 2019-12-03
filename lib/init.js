const fsp   = require('promise-fs')
const chalk = require('chalk');

/**
 * CLI init (sub)command action
 */
module.exports = init = () => {
  const defaultOptions = {
    commitsParts: [
      {
        scope: {
          label: 'Choose the commit scope',
          type: 'select',
          selectOptions: [
            'spec',
            'feat',
            'fix'
          ]
        }
      },
      {
        message: {
          label: 'Choose the commit message'
        }
      }
    ],
    "render": "$+scope: $+message"
  };

  fsp.writeFile(process.cwd() + '/commity.json', JSON.stringify(defaultOptions, null, 2)).then(() => {
    console.log(chalk.greenBright('Created ' + process.cwd() + '/commity.json'));
    process.exit();
  }).catch((e) => {
    console.log(chalk.red(e));
  });
}
