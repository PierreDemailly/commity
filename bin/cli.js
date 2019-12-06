#!/usr/bin/env node

// external libs
const chalk   = require('chalk');
const fs      = require('file-system');
const program = require('commander');

// internal libs
const init    = require('../lib/init');
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
const isGitInit = fs.existsSync(process.cwd() + '/.git')
if (!isGitInit) {
  console.log(chalk.red('Current directory is not a Git repository.'));
  process.exit();
}

/**
 * CLI (sub)commands
 *
 * example of use: commity init
 */
program
  .command('init')
  .description('init your workspace to make it commity friendly')
  .action(() => {
    initialized = false;
    init();
  })

/**
 * CLI available options
 *
 * example of use: commity -p --addAll
 */
program
  .option('-p, --push', 'push changes to current remote branch after commiting')
  .option('-a, --addAll', 'add all staged changes before commiting')

/**
 * Parse program arguments
 */
program.parse(process.argv);

if (initialized) {
  commity(program);
}

