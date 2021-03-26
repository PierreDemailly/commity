const { App } = require('./../app/app');
const _chai = require('chai');
_chai.should();

describe('Options tests', () => { // the tests container
  it('checking default options', () => { 
      const app = new App();
      app.should.be.not.undefined;
  })
})
