import {Iclargs} from '@clinjs/clargs';
import {Conf} from '../app/app';
import {fields} from '../app/helpers/core/fields';
import {Commity} from './../app/commity';
import nezbold from 'nezbold';
import tricolors from 'tricolors';
import {changesCount, commit, indexAll, push, stagedCount} from '@pierred/node-git';

jest.mock('tricolors', () => ({
  redLog: jest.fn().mockReturnValue(true),
  greenLog: jest.fn().mockReturnValue(true),
  green: jest.fn().mockReturnValue(true),
}));
jest.mock('../app/helpers/core/fields', () => ({
  fields: jest.fn().mockResolvedValue(Promise.resolve({
    values: {
      foo: 'bar',
    },
    fieldsNames: ['foo'],
  })),
}));
jest.mock('@pierred/node-git', () => ({
  commit: jest.fn().mockResolvedValue(Promise.resolve()),
  push: jest.fn().mockResolvedValue(Promise.resolve()),
  stagedCount: jest.fn().mockResolvedValue(Promise.resolve(0)),
  changesCount: jest.fn().mockResolvedValue(Promise.resolve(748)),
  indexAll: jest.fn().mockResolvedValue(Promise.resolve()),
}));

describe('Commity', () => {
  const commity = new Commity({hasOption: (opt: string, alias: string) => true} as Iclargs, {} as Conf);

  it('should be defined', () => {
    expect(commity).toBeTruthy();
  });

  it('should have 748 changes', async () => {
    commity.result = {
      render: 'render',
      values: {
        foo: 'bar',
      },
    } as any;
    commity.conf = {
      fields: [{foo: {}}],
      render: 'foo {{foo}} {{bar}}',
    } as any;
    spyOn(commity.clargs, 'hasOption').and.callFake(() => Promise.resolve()),
    spyOn(commity, 'handleAddAllOption').and.callFake(() => Promise.resolve());
    spyOn(commity, 'getFields').and.callFake(() => Promise.resolve());
    spyOn(commity, 'checkStagedCount').and.callFake(() => Promise.resolve());
    spyOn(commity, 'commit').and.callFake(() => Promise.resolve());
    spyOn(commity, 'handlePushOption').and.callFake(() => Promise.resolve());
    spyOn(process, 'exit').and.callFake(() => {});
    spyOn(console, 'log').and.callFake(() => {});
    await commity.run();
    const res = `${tricolors.green('Commited 0 files. ')}${nezbold.bold('foo bar {{bar}}')}`;
    expect(console.log).toHaveBeenCalledWith(res);
    expect(commity.changesCount).toEqual(748);
  });

  it('check changes count should throw', async () => {
    commity.changesCount = 0;
    (changesCount as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    commity.checkChangesCount().catch((e) => {
      expect(commity.changesCount).toEqual(0);
      expect(e.message).toEqual('fake error');
    });
  });

  it('should handle add all option', async () => {
    (stagedCount as any).mockResolvedValue(Promise.resolve(1));
    (indexAll as any).mockResolvedValue(Promise.resolve());
    process.argv = ['1', '1', '--addAll'];
    commity.changesCount = 5;
    spyOn(tricolors, 'greenLog');
    await commity.handleAddAllOption();
    expect(tricolors.greenLog).toHaveBeenCalledWith('Added 4 files to staged changes \r\n');
  });

  it('handle add all option should throw', () => {
    (indexAll as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    commity.handleAddAllOption().catch((e) => {
      expect(e.message).toEqual('fake error');
    });
  });

  it('should check staged count', async () => {
    process.argv = ['1', '1', '1'];
    spyOn(commity.clargs, 'hasOption').and.callFake(() => false);
    spyOn(process, 'exit').and.callFake(() => {});
    commity.stagedCount = 0;
    try {
      commity.checkStagedCount();
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toEqual('Are you sure there are staged changes to commit ?');
      }
    }
  });

  it('should get fields', async () => {
    await commity.getFields();
    expect(commity.result).toEqual({
      values: {
        foo: 'bar',
      },
      fieldsNames: ['foo'],
    });
  });

  it('get fields should throw', () => {
    (fields as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(process, 'exit').and.callFake(() => {});
    commity.getFields().catch((e) => {
      expect(e.message).toEqual('fake error');
    });
  });

  it('commit should throw', () => {
    (commit as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(process, 'exit').and.callFake(() => {});
    commity.commit('fake').catch((e) => {
      expect(e.message).toEqual('fake error');
    });
  });

  it('should handle push option', async () => {
    process.argv = ['1', '1', '--push'];
    commity.finalMsg = '';
    await commity.handlePushOption();
    expect(commity.finalMsg).toEqual('\r\n' + nezbold.bold('Pushed commited changes'));
  });

  it('handle push option should throw', () => {
    (push as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(process, 'exit').and.callFake(() => {});
    commity.handlePushOption().catch((e) => {
      expect(e.message).toEqual('fake error');
    });
  });
});
