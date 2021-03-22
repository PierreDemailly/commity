#!/usr/bin/env node
/* eslint-disable prefer-destructuring */

const fs = require('fs');
const tricolors = require('tricolors');
const nezparser = require('nezparser');

const { init } = require('../lib/init');
const commity = require('../lib/commity');

/**
 * Define if there is commity.json in cwd.
 * If user run "commity init"
 * then this variable will be set falsy so commity will not run.
 */
let initialized = true;

/**
 * Check if current directory is a Git repository
 */
const path = `${process.cwd()}/.git`;
fs.access(path, fs.F_OK, (err) => {
  if (err) {
    tricolors.redLog('Current directory is not a Git repository.');
    process.exit();
  }
});

nezparser.setup({
  usage: 'commity <command> <options>',
  options: [
    {
      name: '--push',
      alias: '-p',
      description: 'push changes to current remote branch after commiting',
    },
    {
      name: '--addAll',
      alias: '-a',
      description: 'add all staged changes before commiting',
    },
  ],
  commands: [
    {
      name: 'init',
      description: 'inititialize Commity',
      options: [
        {
          name: '--overwrite',
          alias: '-o',
          description: 'overwrite existing commity.json (if exists)',
        },
      ],
    },
  ],
});
nezparser.parse();

nezparser.on('init').so(() => {
  initialized = false;
  init();
});

if (initialized) {
  commity(nezparser);
}
