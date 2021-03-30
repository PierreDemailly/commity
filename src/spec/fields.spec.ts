import inquirer from 'inquirer';
import { fields } from './../app/helpers/core/fields';

jest.mock(process.cwd() + '/commity.json', () => ({
  fields: [
    {
      "message": {
        "label": "Choose the commit message"
      }
    },
    {
      "ticket": {
        "label": "What is the issue id"
      }
    },
  ],
}));
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue(Promise.resolve({ message: 'foo', ticket: 'bar' })),
}));


describe('fields', () => {
  beforeAll(() => {
    spyOn(process, 'exit').and.callFake(() => { });
  });
  it('should resolve', async () => {
    const f = await fields();
    expect(f).toEqual({
      fieldsNames: ['message', 'ticket'],
      values: {
        message: 'foo',
      },
    });
  });

  it('should reject', () => {
    (inquirer as any).prompt.mockRejectedValue('fake error');
    fields().catch((e) => {
      expect(e).toEqual(new Error('fake error'));
      expect(process.exit).toHaveBeenCalled();
    })
  });
});
