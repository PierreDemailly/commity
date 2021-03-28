jest.mock("fs", () => ({
  promises: {
    open: jest.fn().mockResolvedValue(Promise.resolve({
      stat: () => ({ blocks: 0 }),
      appendFile: () => {},
      close: jest.fn().mockResolvedValue(Promise.resolve()),
    })),
  },
  constants: {
    F_OK: 0,
  }
}));
jest.mock("./../app/commity");

import tricolors from 'tricolors';
import { Init } from '../app/commands/init';

describe('Init', () => {
  it('should init', async () => {
    spyOn(tricolors, 'greenLog');
    spyOn(process, 'exit').and.callFake(() => {});
    await Init.initialize();
    expect(tricolors.greenLog).toHaveBeenCalledOnceWith('ook');
  });
});
