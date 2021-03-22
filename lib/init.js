/* eslint-disable no-multi-assign */
const inquirer = require('inquirer');
const fs = require('fs');
const fsp = require('promise-fs');
const tricolors = require('tricolors');
const commity = require('./commity.json');

/**
 * CLI init (sub)command action
 */
const init = () => {
  const path = `${process.cwd()}/commity.json`;
  fs.access(path, fs.F_OK, async (err) => {
    if (!err) {
      const res = await inquirer.prompt({
        name: 'overwrite',
        type: 'confirm',
        message: 'commity.json already exists, overwrite ?',
      });
      if (res.overwrite) {
        fsp.writeFile(`${process.cwd()}/commity.json`, JSON.stringify(commity, null, 2)).then(() => {
        tricolors.greenLog(`Updated ${process.cwd()}/commity.json`);
        process.exit();
      }).catch((e) => {
        tricolors.redLog(e);
        process.exit();
      });
      } else {
        tricolors.redLog('')
        process.exit();
      }
    }
    fsp.writeFile(`${process.cwd()}/commity.json`, JSON.stringify(commity, null, 2)).then(() => {
      tricolors.greenLog(`Created ${process.cwd()}/commity.json`);
      process.exit();
    }).catch((e) => {
      tricolors.redLog(e);
      process.exit();
    });
  });
  
};

module.exports = { init };
