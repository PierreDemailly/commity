const { App } = require('./../app/app');
const _chai = require('chai');
_chai.should();

describe('App', () => {
  const app = new App();

  it('should be defined', () => { 
      app.should.be.not.undefined;
  });

  it('should initialize', async () => {
    const spy = jest.spyOn(app, 'isGitInitialized').mockReturnValue(() => Promise.resolve());
    await app.initialize();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
})
