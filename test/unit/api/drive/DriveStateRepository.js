const chai = require('chai');
const sinon = require('sinon');
const cbor = require('cbor');

const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');

const DriveStateRepository = require('../../../../lib/externalApis/drive/DriveStateRepository');

const RPCError = require('../../../../lib/rpcServer/RPCError');
const AbciResponseError = require('../../../../lib/errors/AbciResponseError');

chai.use(chaiAsPromised);
chai.use(dirtyChai);

const { expect } = chai;

describe('DriveStateRepository', () => {
  describe('constructor', () => {
    it('Should create drive client with given options', () => {
      const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

      expect(drive.client.options.host).to.be.equal('127.0.0.1');
      expect(drive.client.options.port).to.be.equal(3000);
    });
  });

  it('should throw RPCError if JSON RPC call failed', async () => {
    const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

    const error = new Error('Some RPC error');

    sinon.stub(drive.client, 'request')
      .resolves({ error });

    try {
      await drive.fetchDataContract('someId');
    } catch (e) {
      expect(e).to.be.an.instanceOf(RPCError);
      expect(e.message).to.be.equal(error.message);
      expect(e.code).to.be.equal(-32602);
    }
  });

  it('should throw ABCI error response have one', async () => {
    const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

    const abciError = {
      message: 'Some ABCI error',
      data: {
        name: 'someData',
      },
    };

    const responseLog = JSON.stringify({
      error: abciError,
    });

    sinon.stub(drive.client, 'request')
      .resolves({
        result: {
          response: {
            code: 42,
            log: responseLog,
          },
        },
      });

    try {
      await drive.fetchDataContract('someId');
    } catch (e) {
      expect(e).to.be.an.instanceOf(AbciResponseError);
      expect(e.getErrorCode()).to.equal(42);
      expect(e.getMessage()).to.equal(abciError.message);
      expect(e.getData()).to.deep.equal(abciError.data);
    }
  });

  describe('#fetchDataContract', () => {
    it('Should call \'fetchContract\' RPC with the given parameters', async () => {
      const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

      const contractId = 'someId';
      const buffer = Buffer.from('someData');

      sinon.stub(drive.client, 'request')
        .resolves({
          result: {
            response: { code: 0, value: buffer.toString('base64') },
          },
        });

      const result = await drive.fetchDataContract(contractId);

      expect(drive.client.request).to.have.been.calledOnceWithExactly('abci_query', {
        path: `/dataContracts/${contractId}`,
        data: cbor.encode({}).toString('hex'), // cbor encoded empty object
      });
      expect(result).to.be.deep.equal(buffer);
    });
  });

  describe('#fetchDocuments', () => {
    it('Should call \'fetchDocuments\' RPC with the given parameters', async () => {
      const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

      const contractId = 'someId';
      const type = 'object';
      const options = {
        where: 'id === someId',
      };
      const buffer = cbor.encode([]);

      sinon.stub(drive.client, 'request')
        .resolves({
          result: {
            response: { code: 0, value: buffer.toString('base64') },
          },
        });

      const result = await drive.fetchDocuments(contractId, type, options);

      expect(drive.client.request).to.have.been.calledOnceWithExactly('abci_query', {
        path: `/dataContracts/${contractId}/documents/${type}`,
        data: cbor.encode(options).toString('hex'), // cbor encoded empty object
      });
      expect(result).to.be.deep.equal([]);
    });
  });

  describe('#fetchIdentity', () => {
    it('Should call \'fetchIdentity\' RPC with the given parameters', async () => {
      const drive = new DriveStateRepository({ host: '127.0.0.1', port: 3000 });

      const identityId = 'someId';
      const buffer = Buffer.from('someData');

      sinon.stub(drive.client, 'request')
        .resolves({
          result: {
            response: { code: 0, value: buffer.toString('base64') },
          },
        });

      const result = await drive.fetchIdentity(identityId);

      expect(drive.client.request).to.have.been.calledOnceWithExactly('abci_query', {
        path: `/identities/${identityId}`,
        data: cbor.encode({}).toString('hex'), // cbor encoded empty object
      });
      expect(result).to.be.deep.equal(buffer);
    });
  });
});
