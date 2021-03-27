import { Inezparser } from 'nezparser';
import { Conf } from '../app/app';
import { fields } from '../app/helpers/core/fields';
import { Commity } from './../app/commity';

jest.mock('../app/helpers/core/fields');
jest.mock("../app/helpers/git/changesCount", () => ({
  gitChangesCount: jest.fn().mockResolvedValue(Promise.resolve(748)),
}));
describe('Commity', () => {
  const commity = new Commity({ hasOption: (opt: string, alias: string) => true } as Inezparser, {} as Conf);

  it('should be defined', () => {
    expect(commity).toBeTruthy();
  });

  it('should have 748 changes', async () => {
    commity.result = {
      render: 'render',
      values: [{
        foo: 'bar',
      }],
    } as any;
    commity.conf = {
      render: 'foo bar',
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
    expect(commity.changesCount).toEqual(748);
  });
});