import {InitCommandHandler} from './../app/commands/init';
import inquirer from 'inquirer';
import nezparser, { Inezparser } from 'nezparser';

jest.mock('fs', () => ({
  access: jest.fn((path: string, mode: number, err) => err(null)),
  writeFile: jest.fn((path: string, mode: number, err) => err(null)),
  constants: {
    F_OK: 0,
  },
}));
jest.mock('./../app/commity');
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue(Promise.resolve({overwrite: true})),
}));
jest.mock('tricolors', () => ({
  redLog: jest.fn().mockReturnValue(true),
  greenLog: jest.fn().mockReturnValue(true),
}));

import tricolors from 'tricolors';
nezparser.setup({
  usage: 'fake',
  options: [],
  commands: [],
});
nezparser.parse();
describe('InitCommandHandler', () => {
  const initCommandHandler = new InitCommandHandler(nezparser as Inezparser);

  it('should run', async () => {
    spyOn(initCommandHandler, 'fileExist').and.callFake(() => Promise.resolve(true));
    spyOn(initCommandHandler, 'createJson').and.callFake(() => Promise.resolve());
    spyOn(tricolors, 'greenLog');
    spyOn(process, 'exit').and.callFake(() => { });
    await initCommandHandler.run();
    expect(tricolors.greenLog).toHaveBeenCalledWith(`Updated ${process.cwd()}/commity.json`);
    expect(initCommandHandler.commityFileExist).toBeTruthy();
  });

  it('inquirer should throw', () => {
    spyOn(initCommandHandler, 'fileExist').and.callFake(() => Promise.resolve(true));
    (inquirer as any).prompt.mockRejectedValue('fake error');
    initCommandHandler.run().catch((e) => {
      expect(e).toEqual(new Error('fake error'));
    });
  });

  it('create json should throw', async () => {
    spyOn(initCommandHandler, 'fileExist').and.callFake(() => Promise.resolve(true));
    spyOn(tricolors, 'redLog');
    spyOn(initCommandHandler, 'createJson').and.callFake(() => Promise.reject(new Error()));
    spyOn(process, 'exit').and.callFake(() => { });
    (inquirer as any).prompt.mockResolvedValue({overwrite: true});
    await initCommandHandler.run();
    expect(tricolors.redLog).toHaveBeenCalledWith(`Could not update ${process.cwd()}/commity.json`);
  });

  it('createJson should not have been called', async () => {
    spyOn(initCommandHandler, 'fileExist').and.callFake(() => Promise.resolve(true));
    (inquirer as any).prompt.mockResolvedValue({overwrite: false});
    spyOn(initCommandHandler, 'createJson');
    await initCommandHandler.run();
    expect(initCommandHandler.createJson).not.toHaveBeenCalled();
  });

  it('should create json', async () => {
    expect(await initCommandHandler.createJson('any', {})).toBeTruthy();
  });

  it('file should exist', async () => {
    expect(await initCommandHandler.fileExist('anything')).toBeTruthy();
  });
});
