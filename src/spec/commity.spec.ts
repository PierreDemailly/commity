import {Inezparser} from 'nezparser';
import {Conf} from '../app/app';
import {fields} from '../app/helpers/core/fields';
import {Commity} from './../app/commity';
import nezbold from 'nezbold';
import tricolors from 'tricolors';
import {gitChangesCount} from '../app/helpers/git/changesCount';
import {gitStagedCount} from '../app/helpers/git/stagedCount';
import {gitAddAll} from '../app/helpers/git/addAll';
import {gitCommit} from '../app/helpers/git/commit';
import {gitPush} from '../app/helpers/git/push';

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
jest.mock('../app/helpers/git/commit', () => ({
  gitCommit: jest.fn().mockResolvedValue(Promise.resolve()),
}));
jest.mock('../app/helpers/git/push', () => ({
  gitPush: jest.fn().mockResolvedValue(Promise.resolve()),
}));
jest.mock('../app/helpers/git/stagedCount', () => ({
  gitStagedCount: jest.fn().mockResolvedValue(Promise.resolve(0)),
}));
jest.mock('../app/helpers/git/changesCount', () => ({
  gitChangesCount: jest.fn().mockResolvedValue(Promise.resolve(748)),
}));
jest.mock('../app/helpers/git/addAll', () => ({
  gitAddAll: jest.fn().mockResolvedValue(Promise.resolve()),
}));
describe('Commity', () => {
  const commity = new Commity({hasOption: (opt: string, alias: string) => true} as Inezparser, {} as Conf);

  it('should be defined', () => {
    expect(commity).toBeTruthy();
  });

  it('should have 748 changes', async () => {
    commity.result = {
      values: {
        foo: 'bar',
      },
    } as any;
    commity.conf = {
      render: 'foo',
      renderComponents: [{name: 'foo', message: '$+foo'}],
    } as any;
    spyOn(commity.nezparser, 'hasOption').and.callFake(() => Promise.resolve()),
    spyOn(commity, 'handleAddAllOption').and.callFake(() => Promise.resolve());
    spyOn(commity, 'getFields').and.callFake(() => Promise.resolve());
    spyOn(commity, 'checkStagedCount').and.callFake(() => Promise.resolve());
    spyOn(commity, 'commit').and.callFake(() => Promise.resolve());
    spyOn(commity, 'handlePushOption').and.callFake(() => Promise.resolve());
    spyOn(process, 'exit').and.callFake(() => {});
    spyOn(console, 'log').and.callFake(() => {});
    await commity.run();
    const res = `${tricolors.green('Commited 0 files. ')}${nezbold.bold('bar')}`;
    expect(console.log).toHaveBeenCalledWith(res);
    expect(commity.changesCount).toEqual(748);
  });

  it('should check changes count', async () => {
    (gitChangesCount as any).mockResolvedValue(Promise.resolve(0));
    spyOn(tricolors, 'redLog').and.callFake(() => {});
    spyOn(process, 'exit').and.callFake(() => {});
    await commity.checkChangesCount();
    expect(commity.changesCount).toEqual(0);
    expect(tricolors.redLog).toHaveBeenCalledWith('No changes detected, cannot commit.');
  });

  it('check changes count should throw', async () => {
    (gitChangesCount as any).mockResolvedValue(Promise.reject(new Error('Fake Error')));
    spyOn(tricolors, 'redLog').and.callFake(() => {});
    spyOn(process, 'exit').and.callFake(() => {});
    commity.checkChangesCount().catch((e) => {
      expect(commity.changesCount).toEqual(0);
      expect(tricolors.redLog).toHaveBeenCalledWith('Error while count changes, cannot commit. Fake Error');
    });
  });

  it('should handle add all option', async () => {
    (gitStagedCount as any).mockResolvedValue(Promise.resolve(1));
    (gitAddAll as any).mockResolvedValue(Promise.resolve());
    process.argv = ['1', '1', '--addAll'];
    commity.changesCount = 5;
    spyOn(tricolors, 'greenLog');
    await commity.handleAddAllOption();
    expect(tricolors.greenLog).toHaveBeenCalledWith('Added 4 files to staged changes \r\n');
  });

  it('handle add all option should throw', () => {
    (gitAddAll as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(tricolors, 'redLog');
    commity.handleAddAllOption().catch((e) => {
      expect(e).toEqual('fake error');
      expect(tricolors.redLog).toHaveBeenCalledOnceWith(e);
    });
  });

  it('should check staged count', async () => {
    process.argv = ['1', '1', '1'];
    spyOn(commity.nezparser, 'hasOption').and.callFake(() => false);
    spyOn(process, 'exit').and.callFake(() => {});
    commity.stagedCount = 0;
    spyOn(tricolors, 'redLog');
    commity.checkStagedCount();
    expect(tricolors.redLog).toHaveBeenCalledWith('Are you sure there are staged changes to commit ?');
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
    spyOn(tricolors, 'redLog');
    spyOn(process, 'exit').and.callFake(() => {});
    commity.getFields().catch((e) => {
      expect(e).toEqual('fake error');
      expect(tricolors.redLog).toHaveBeenCalledWith(e);
    });
  });

  it('commit should not throw', async () => {
    spyOn(tricolors, 'redLog');
    await commity.commit('fake');
    expect(tricolors.redLog).not.toHaveBeenCalled();
  });

  it('commit should throw', () => {
    (gitCommit as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(tricolors, 'redLog');
    spyOn(process, 'exit').and.callFake(() => {});
    commity.commit('fake').catch((e) => {
      expect(e).toEqual('fake error');
      expect(tricolors.redLog).toHaveBeenCalledWith(e);
    });
  });

  it('should handle push option', async () => {
    process.argv = ['1', '1', '--push'];
    commity.finalMsg = '';
    await commity.handlePushOption();
    expect(commity.finalMsg).toEqual('\r\n' + nezbold.bold('Pushed commited changes'));
  });

  it('handle push option should throw', () => {
    (gitPush as any).mockResolvedValue(Promise.reject(new Error('fake error')));
    spyOn(tricolors, 'redLog');
    spyOn(process, 'exit').and.callFake(() => {});
    commity.handlePushOption().catch((e) => {
      expect(e).toEqual('fake error');
      expect(tricolors.redLog).toHaveBeenCalledWith(e);
    });
  });
});
