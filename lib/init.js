/* eslint-disable no-multi-assign */
const fsp = require('promise-fs');
const tricolors = require('tricolors');
const commity = require('./commity.json');

/**
 * CLI init (sub)command action
 */
const init = () => {
  fsp.writeFile(`${process.cwd()}/commity.json`, JSON.stringify(commity, null, 2)).then(() => {
    tricolors.greenLog(`Created ${process.cwd()}/commity.json`);
    process.exit();
  }).catch((e) => {
    tricolors.redLog(e);
    process.exit();
  });
};

module.exports = { init };
