jest.mock("fs", () => ({
  promises: {
    access: jest.fn().mockResolvedValue(Promise.resolve()),
  },
  constants: {
    F_OK: 0,
  }
}));

import path from 'path';
import { join } from 'path';
import fs from 'fs';
import tricolors from 'tricolors';

import { Init } from './../app/commands/init';
import { Commity } from './../app/commity';
import { App } from './../app/app';

describe('App', () => {
  let app = new App();

  it('should be defined', () => { 
      expect(app).toBeTruthy();
  });

  it('should initialize', async () => {
    const spy = jest.spyOn(app, 'isGitInitialized').mockReturnValue(Promise.resolve());
    const spyB = jest.spyOn(Commity, 'run').mockReturnValue(Promise.resolve());
    await app.initialize();
    expect(spy).toHaveBeenCalled();
    expect(spyB).toHaveBeenCalled();
    spy.mockRestore();
    spyB.mockRestore();
  });

  it('should run Init.initialize()', async () => {
    process.argv = ['1', '1', 'init'];
    jest.spyOn(app, 'isGitInitialized').mockReturnValue(Promise.resolve());
    const spy = jest.spyOn(Init, 'initialize').mockReturnValue(Promise.resolve());
    await app.initialize();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not be commity friendly', async () => {
    app = new App();
    process.argv = ['1', '1', '1'];
    spyOn(process, 'exit').and.callFake(() => {});
    spyOn(path, 'join').and.callFake(() => Promise.reject());
    jest.spyOn(tricolors, 'redLog').mockReturnValue(void null);
    await app.isCommityFriendly();
    expect(process.exit).toHaveBeenCalled();
    expect(tricolors.redLog).toHaveBeenCalledWith('Commity is not initialized. Please run "commity init" to init your workspace.');
  });

  it('repo should be git initialized', async () => {
    app = new App();
    process.argv = ['1', '1', '1'];
    await app.isGitInitialized();
    expect(fs.promises.access).toHaveBeenCalledWith(`${join(process.cwd(), '/.git')}`, fs.constants.F_OK);
  });

  it('repo should not be git initialized', async () => {
    app = new App();
    jest.spyOn(fs.promises, 'access').mockRejectedValue('err');
    jest.spyOn(tricolors, 'redLog').mockReturnValue(void null);
    spyOn(process, 'exit').and.callFake(() => {});
    await app.isGitInitialized();
    expect(process.exit).toHaveBeenCalled();
    expect(tricolors.redLog).toHaveBeenCalledWith('Current directory is not a Git repository.');
  });
})
