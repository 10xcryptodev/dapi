const chai = require('chai');
const sinon = require('sinon');
const getBlockHeadersFactory = require('../../../lib/rpcServer/commands/getBlockHeaders');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const { expect } = chai;
let spy;

describe('getBlockHeaders', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getBlockHeaders = getBlockHeadersFactory(coreAPIFixture);
      expect(getBlockHeaders).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getBlocks');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return array of blocks', async () => {
    const getBlockHeaders = getBlockHeadersFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    let blockHeaders = await getBlockHeaders([1, 2]);
    expect(blockHeaders).to.be.an('array');
    expect(spy.callCount).to.be.equal(1);
    blockHeaders = await getBlockHeaders({ limit: 2, offset: 1 });
    expect(blockHeaders).to.be.an('array');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw an error if arguments is not valid', async () => {
    const getBlocks = getBlockHeadersFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({ limit: -1, offset: 10 })).to.be.rejectedWith('limit should be >= 0');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({ limit: 1, offset: '123' })).to.be.rejectedWith('offset should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({ limit: 0.5, offset: 10 })).to.be.rejectedWith('limit should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({ limit: 27, offset: 10 })).to.be.rejectedWith('limit should be <= 25');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks()).to.be.rejectedWith('should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks({ limit: 'string', offset: '123' })).to.be.rejectedWith('should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks([1, '12'])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlocks(['10', 1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });
});
