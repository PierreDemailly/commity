
jest.mock("fs", () => ({
  access: jest.fn().mockResolvedValue(Promise.resolve()),
  constants: {
    F_OK: 0,
  }
}));
jest.mock("./../app/commity");
jest.mock('./../app/commands/init', () => ({
  InitCommandHandler: jest.fn().mockReturnValue({
    run: jest.fn().mockResolvedValue(true),
  }),
}));
jest.mock('nezparser', () => ({
  commandUsed: jest.fn().mockReturnValue(false),
  setup: jest.fn(),
  parse: jest.fn(),
}));

import nezparser from 'nezparser';

import path from 'path';
import { join } from 'path';
import fs from 'fs';
import tricolors from 'tricolors';

import { App } from './../app/app';

describe('App', () => {
  beforeAll(() => {
    spyOn(process, 'exit').and.callFake(() => { });
  });

  let app = new App();

  it('should be defined', () => { 
      expect(app).toBeTruthy();
  });

  it('should initialize', async () => {
    process.argv = ['1', '1', '1'];
    spyOn(app, 'isGitInitialized').and.callFake(() => Promise.resolve());
    spyOn(app, 'setupParser');
    spyOn(app, 'isCommityFriendly').and.callFake(() => Promise.resolve());
    await app.initialize();
    expect(app.setupParser).toHaveBeenCalled();
    expect(app.isCommityFriendly).toHaveBeenCalled();
  });

  it('should have init command', async () => {
    (nezparser.commandUsed as any).mockReturnValue(true);
    (nezparser.setup as any).mockReturnValue(true);
    spyOn(app, 'isCommityFriendly');
    await app.initialize();
    expect(app.isCommityFriendly).not.toHaveBeenCalled();
  })
})
