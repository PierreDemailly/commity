import { gitCommit } from './../app/helpers/git/commit';
import { gitChangesCount } from './../app/helpers/git/changesCount';
import { gitAddAll } from './../app/helpers/git/addAll';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, err, stdout, stderr) => err(null)),
}));

import { exec } from 'child_process';
import { gitPush, gitStagedCount } from '../app/helpers/git';

describe('git helpers', () => {
  it('should add All', async () => {
    let error = false;
    try {
      await gitAddAll();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });
  
  it('should changes count', async () => {
    let error = false;
    try {
      await gitChangesCount();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should commit ', async () => {
    let error = false;
    try {
      await gitCommit('msg');
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should push', async () => {
    let error = false;
    try {
      await gitPush();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should count staged changes', async () => {
    let error = false;
    try {
      await gitStagedCount();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });
});