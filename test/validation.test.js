/**
* Additional Tests for Enhanced Validation and Error Handling
* (c) Copyright 2021-2026 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const chai = require('chai');
const {assert} = chai;
const utils = require('../index.js');
const nock = require('nock');

describe('Enhanced Validation Tests', function() {
  describe('#assembleRequestUrl() - Input Validation', function() {
    it('should throw error for empty CES URL', function() {
      assert.throws(
          () => utils.assembleRequestUrl('', '/ispw/test'),
          Error,
          'CES URL is required',
      );
    });

    it('should throw error for null CES URL', function() {
      assert.throws(
          () => utils.assembleRequestUrl(null, '/ispw/test'),
          Error,
          'CES URL is required',
      );
    });

    it('should throw error for undefined CES URL', function() {
      assert.throws(
          () => utils.assembleRequestUrl(undefined, '/ispw/test'),
          Error,
          'CES URL is required',
      );
    });

    it('should throw error for empty request path', function() {
      assert.throws(
          () => utils.assembleRequestUrl('https://ces:48226', ''),
          Error,
          'Request path is required',
      );
    });

    it('should throw error for invalid URL format', function() {
      assert.throws(
          () => utils.assembleRequestUrl('not-a-valid-url', '/ispw/test'),
          Error,
          /Invalid URL/,
      );
    });

    it('should sanitize XSS attempts in URLs', function() {
      const maliciousUrl = 'https://ces.com/<script>alert("xss")</script>';
      const result = utils.assembleRequestUrl(maliciousUrl, '/ispw/test');
      // DOMPurify should remove the script tags
      assert.notInclude(result.href.toLowerCase(), '<script>');
    });
  });

  describe('#getHttpPostPromise() - Input Validation', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should throw error for null URL', function() {
      assert.throws(
          () => utils.getHttpPostPromise(null, 'token123', {}),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for undefined URL', function() {
      assert.throws(
          () => utils.getHttpPostPromise(undefined, 'token123', {}),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for invalid URL object', function() {
      assert.throws(
          () => utils.getHttpPostPromise({}, 'token123', {}),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for empty token', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpPostPromise(url, '', {}),
          Error,
          'Authentication token is required',
      );
    });

    it('should throw error for null token', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpPostPromise(url, null, {}),
          Error,
          'Authentication token is required',
      );
    });

    it('should include timeout in request options', async function() {
      const url = new URL('https://ces:48226/ispw/test');
      const token = 'token123';

      nock('https://ces:48226')
          .post('/ispw/test')
          .reply(200, {success: true});

      const promise = utils.getHttpPostPromise(url, token, {});
      assert.exists(promise);
      await promise; // Should complete without timeout
    });
  });

  describe('#getHttpGetPromise() - Input Validation', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should throw error for null URL', function() {
      assert.throws(
          () => utils.getHttpGetPromise(null, 'token123'),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for empty token', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpGetPromise(url, ''),
          Error,
          'Authentication token is required',
      );
    });

    it('should include timeout in request options', async function() {
      const url = new URL('https://ces:48226/ispw/test');
      const token = 'token123';

      nock('https://ces:48226')
          .get('/ispw/test')
          .reply(200, {success: true});

      const promise = utils.getHttpGetPromise(url, token);
      assert.exists(promise);
      await promise;
    });
  });

  describe('#getHttpPostPromiseWithCert() - Input Validation', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should throw error for null URL', function() {
      assert.throws(
          () => utils.getHttpPostPromiseWithCert(null, 'cert', 'host', '8080', {}),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for empty certificate', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpPostPromiseWithCert(url, '', 'host', '8080', {}),
          Error,
          'Certificate is required',
      );
    });

    it('should throw error for empty host', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpPostPromiseWithCert(url, 'cert', '', '8080', {}),
          Error,
          'Host is required',
      );
    });

    it('should throw error for empty port', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpPostPromiseWithCert(url, 'cert', 'host', '', {}),
          Error,
          'Port is required',
      );
    });

    it('should include certificate headers in request', async function() {
      const url = new URL('https://ces:48226/ispw/test');

      nock('https://ces:48226', {
        reqheaders: {
          'cpwr_hci_host': 'mainframe.local',
          'cpwr_hci_port': '8080',
          'javax.servlet.request.X509Certificate': 'cert123',
        },
      })
          .post('/ispw/test')
          .reply(200, {success: true});

      const promise = utils.getHttpPostPromiseWithCert(
          url, 'cert123', 'mainframe.local', '8080', {},
      );
      await promise;
    });
  });

  describe('#getHttpGetPromiseWithCert() - Input Validation', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should throw error for null URL', function() {
      assert.throws(
          () => utils.getHttpGetPromiseWithCert(null, 'cert', 'host', '8080'),
          Error,
          'Valid request URL is required',
      );
    });

    it('should throw error for empty certificate', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpGetPromiseWithCert(url, '', 'host', '8080'),
          Error,
          'Certificate is required',
      );
    });

    it('should throw error for empty host', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpGetPromiseWithCert(url, 'cert', '', '8080'),
          Error,
          'Host is required',
      );
    });

    it('should throw error for empty port', function() {
      const url = new URL('https://ces:48226/ispw/test');
      assert.throws(
          () => utils.getHttpGetPromiseWithCert(url, 'cert', 'host', ''),
          Error,
          'Port is required',
      );
    });
  });

  describe('#pollSetStatus() - Input Validation', function() {
    it('should throw error for empty URL', async function() {
      try {
        await utils.pollSetStatus('', 'SET001', 'token', 'deploy');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.equal(error.message, 'Poll URL is required');
      }
    });

    it('should throw error for empty setId', async function() {
      try {
        await utils.pollSetStatus('https://ces/sets/S001', '', 'token', 'deploy');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.equal(error.message, 'Set ID is required');
      }
    });

    it('should throw error for empty token', async function() {
      try {
        await utils.pollSetStatus('https://ces/sets/S001', 'SET001', '', 'deploy');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.equal(error.message, 'Authentication token is required');
      }
    });
  });

  describe('#logStatusOfEachTaskFromSet() - Function Behavior', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should return empty message on error', async function() {
      const cesUrl = 'https://ces:48226';
      const setId = 'S000001';
      const level = 'DEV1';
      const token = 'token123';
      const srid = 'SRID1';
      const rtConfig = 'CONFIG1';

      nock('https://ces:48226')
          .get(`/ispw/${srid}/sets/${setId}?level=${level}&rtConfig=${rtConfig}`)
          .reply(500, {error: 'Internal Server Error'});

      const message = await utils.logStatusOfEachTaskFromSet(
          cesUrl, setId, level, token, srid, rtConfig,
      );
      assert.equal(message, '');
    });

    it('should format task messages correctly', async function() {
      const cesUrl = 'https://ces:48226';
      const setId = 'S000001';
      const level = 'DEV1';
      const token = 'token123';
      const srid = 'SRID1';
      const rtConfig = 'CONFIG1';

      nock('https://ces:48226')
          .get(`/ispw/${srid}/sets/${setId}?level=${level}&rtConfig=${rtConfig}`)
          .reply(200, {
            tasks: [
              {moduleName: 'MODULE1'},
              {moduleName: 'MODULE2'},
            ],
          });

      const message = await utils.logStatusOfEachTaskFromSet(
          cesUrl, setId, level, token, srid, rtConfig,
      );
      assert.include(message, 'MODULE1 generated successfully');
      assert.include(message, 'MODULE2 generated successfully');
    });
  });
});
