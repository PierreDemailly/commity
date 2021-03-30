import {gitCommit} from './../app/helpers/git/commit';
import {gitChangesCount} from './../app/helpers/git/changesCount';
import {gitAddAll} from './../app/helpers/git/addAll';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, err, stdout, stderr) => err(null)),
}));

import {gitPush, gitStagedCount} from '../app/helpers/git';

describe('git helpers', () => {
  it('should add All', async () => {
    const error = false;
    try {
      await gitAddAll();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should changes count', async () => {
    const error = false;
    try {
      await gitChangesCount();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should commit ', async () => {
    const error = false;
    try {
      await gitCommit('msg');
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should push', async () => {
    const error = false;
    try {
      await gitPush();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });

  it('should count staged changes', async () => {
    const error = false;
    try {
      await gitStagedCount();
    } catch (error) {
      error = true;
    }
    expect(error).not.toBeTruthy();
  });
});
