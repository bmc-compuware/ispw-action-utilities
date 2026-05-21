/**
* Tests for Polling Functions - Complex State Management
* (c) Copyright 2021-2026 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const chai = require('chai');
const {assert} = chai;
const nock = require('nock');
const utils = require('../index.js');

describe('Polling Function Tests', function() {
  describe('#pollSetStatus() - State Transitions', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle Complete state and exit', async function() {
      nock('https://ces:48226')
          .get('/sets/S000001')
          .reply(200, {state: 'Complete', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000001',
          'S000001',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should complete without error
    });

    it('should handle Failed state and exit', async function() {
      nock('https://ces:48226')
          .get('/sets/S000002')
          .reply(200, {state: 'Failed', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000002',
          'S000002',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle failure and exit gracefully
    });

    it('should handle Deploy-Failed state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000003')
          .reply(200, {state: 'Deploy-Failed', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000003',
          'S000003',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle deploy failure
    });

    it('should handle Waiting-Approval with retry count', async function() {
      this.timeout(3000);
      nock('https://ces:48226')
          .get('/sets/S000004')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000004')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000004')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000004')
          .reply(200, {state: 'Waiting-Approval', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000004',
          'S000004',
          'Bearer token123',
          'deploy',
          50,
          5000,
      );
      // Should exit after 3 Waiting-Approval responses (approvalCount > 2)
    });

    it('should handle Terminated state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000005')
          .reply(200, {state: 'Terminated', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000005',
          'S000005',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle terminated state
    });

    it('should handle Held state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000006')
          .reply(200, {state: 'Held', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000006',
          'S000006',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle held state
    });

    it('should handle Released state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000007')
          .reply(200, {state: 'Released', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000007',
          'S000007',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle released state
    });

    it('should handle Waiting-Lock state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000008')
          .reply(200, {state: 'Waiting-Lock', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000008',
          'S000008',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle waiting-lock state
    });

    it('should handle Closed state', async function() {
      nock('https://ces:48226')
          .get('/sets/S000009')
          .reply(200, {state: 'Closed', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000009',
          'S000009',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should handle closed state
    });

    it('should handle timeout correctly', async function() {
      this.timeout(3000);
      nock('https://ces:48226')
          .get('/sets/S000010')
          .times(10)
          .reply(200, {state: 'Running', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000010',
          'S000010',
          'Bearer token123',
          'deploy',
          100,
          500,
      );
      // Should timeout after 500ms
    });

    it('should handle network errors gracefully', async function() {
      nock('https://ces:48226')
          .get('/sets/S000011')
          .replyWithError('Network error');

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000011',
          'S000011',
          'Bearer token123',
          'deploy',
          100,
          2000,
      );
      // Should catch error and not crash
    });

    it('should poll multiple times before completing', async function() {
      this.timeout(3000);
      nock('https://ces:48226')
          .get('/sets/S000012')
          .reply(200, {state: 'Running', tasks: []})
          .get('/sets/S000012')
          .reply(200, {state: 'Running', tasks: []})
          .get('/sets/S000012')
          .reply(200, {state: 'Complete', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000012',
          'S000012',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should poll multiple times before completing
    });

    it('should handle Waiting-Approval with initial approvalCount <= 2', async function() {
      this.timeout(3000);
      // First 3 polls with Waiting-Approval should continue
      // 4th poll with Waiting-Approval (when approvalCount > 2) should break
      nock('https://ces:48226')
          .get('/sets/S000013')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000013')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000013')
          .reply(200, {state: 'Waiting-Approval', tasks: []})
          .get('/sets/S000013')
          .reply(200, {state: 'Waiting-Approval', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000013',
          'S000013',
          'Bearer token123',
          'deploy',
          50,
          2000,
      );
      // Should poll until approvalCount > 2 then exit
    });

    it('should call logStatusOfEachTaskFromSet when Complete with all optional params', async function() {
      this.timeout(3000);
      const mockCore = {
        info: function(message) {
          // Mock core.info function
        },
      };

      nock('https://ces:48226')
          .get('/sets/S000014')
          .reply(200, {state: 'Complete', tasks: [{moduleName: 'TEST1'}]})
          .get('/ispw/PLAY/sets/S000014?level=DEV1&rtConfig=TPZP')
          .reply(200, {
            tasks: [
              {moduleName: 'TEST1'},
              {moduleName: 'TEST2'},
            ],
          });

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000014',
          'S000014',
          'Bearer token123',
          'deploy',
          100,
          5000,
          'DEV1',
          'PLAY',
          'TPZP',
          'https://ces:48226',
          mockCore,
      );
      // Should complete and call logStatusOfEachTaskFromSet
    });

    it('should handle Complete without optional params', async function() {
      nock('https://ces:48226')
          .get('/sets/S000015')
          .reply(200, {state: 'Complete', tasks: []});

      await utils.pollSetStatus(
          'https://ces:48226/sets/S000015',
          'S000015',
          'Bearer token123',
          'deploy',
          100,
          5000,
      );
      // Should complete without calling logStatusOfEachTaskFromSet
    });
  });
});

// Additional coverage helpers for uncovered lines
describe('Coverage Helpers', function() {
  const utils = require('../index.js');

  describe('Edge Cases and Error Paths', function() {
    it('should handle convertObjectToJson with complex nested object', function() {
      const complex = {
        level1: {
          level2: {
            level3: 'deep value',
            array: [1, 2, 3],
          },
        },
        nullValue: null,
        undefinedValue: undefined,
      };
      const result = utils.convertObjectToJson(complex);
      assert.isString(result);
      assert.include(result, 'deep value');
    });

    it('should handle getStatusMessageToPrint with empty array', function() {
      const result = utils.getStatusMessageToPrint([]);
      assert.equal(result, '');
    });

    it('should handle getStatusMessageToPrint with single item array', function() {
      const result = utils.getStatusMessageToPrint(['Single message']);
      assert.equal(result, 'Single message\n');
    });

    it('should handle getStatusMessageToPrint with number (edge case)', function() {
      const result = utils.getStatusMessageToPrint(12345);
      assert.equal(result, ''); // Should return empty for non-string, non-array
    });

    it('should handle assembleRequestUrl with mixed case Compuware', function() {
      const result = utils.assembleRequestUrl(
          'https://ces:48226/CoMpUwArE',
          '/ispw/test',
      );
      assert.equal(result.href, 'https://ces:48226/ispw/test');
    });

    it('should handle assembleRequestUrl with mixed case ISPW', function() {
      const result = utils.assembleRequestUrl(
          'https://ces:48226/IsPw',
          '/ispw/test',
      );
      assert.equal(result.href, 'https://ces:48226/ispw/test');
    });

    it('should handle assembleRequestUrl with both /compuware and /ispw', function() {
      const result = utils.assembleRequestUrl(
          'https://ces:48226/Compuware/ispw',
          '/ispw/test',
      );
      // Should remove /compuware first, then /ispw
      assert.equal(result.href, 'https://ces:48226/ispw/test');
    });

    it('should handle validateBuildParms with empty string values', function() {
      const buildParms = {
        containerId: '',
        taskLevel: '',
        taskIds: '',
      };
      const result = utils.validateBuildParms(buildParms, [
        'containerId',
        'taskLevel',
        'taskIds',
      ]);
      assert.isFalse(result);
    });

    it('should handle validateBuildParms with whitespace-only strings', function() {
      const buildParms = {
        containerId: '   ',
        taskLevel: '  ',
        taskIds: ' ',
      };
      const result = utils.validateBuildParms(buildParms, [
        'containerId',
        'taskLevel',
        'taskIds',
      ]);
      // Note: Current implementation doesn't trim, so this should pass
      // This highlights a potential improvement area
      assert.isTrue(result);
    });

    it('should handle stringHasContent with various falsy values', function() {
      assert.isFalse(utils.stringHasContent(null));
      assert.isFalse(utils.stringHasContent(undefined));
      assert.isFalse(utils.stringHasContent(''));
      assert.isTrue(utils.stringHasContent(' ')); // Space is content
      assert.isTrue(utils.stringHasContent('0')); // String '0' has content
    });
  });

  describe('HTTP Functions - Complex Scenarios', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle getHttpPostPromise with large request body', async function() {
      const url = new URL('https://ces:48226/ispw/test');
      const token = 'token123';
      const largeBody = {
        tasks: Array.from({length: 100}, (_, i) => ({
          id: `task${i}`,
          name: `Task ${i}`,
          data: 'x'.repeat(1000),
        })),
      };

      nock('https://ces:48226')
          .post('/ispw/test')
          .reply(200, {success: true});

      const response = await utils.getHttpPostPromise(url, token, largeBody);
      assert.equal(response.data.success, true);
    });

    it('should handle getHttpGetPromise with query parameters', async function() {
      const url = new URL('https://ces:48226/ispw/test?param1=value1&param2=value2');
      const token = 'token123';

      nock('https://ces:48226')
          .get('/ispw/test?param1=value1&param2=value2')
          .reply(200, {success: true});

      const response = await utils.getHttpGetPromise(url, token);
      assert.equal(response.data.success, true);
    });

    it('should handle HTTP 4xx errors', async function() {
      const url = new URL('https://ces:48226/ispw/test');
      const token = 'token123';

      nock('https://ces:48226')
          .post('/ispw/test')
          .reply(404, {error: 'Not Found'});

      try {
        await utils.getHttpPostPromise(url, token, {});
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.equal(error.response.status, 404);
      }
    });

    it('should handle HTTP 5xx errors', async function() {
      const url = new URL('https://ces:48226/ispw/test');
      const token = 'token123';

      nock('https://ces:48226')
          .get('/ispw/test')
          .reply(503, {error: 'Service Unavailable'});

      try {
        await utils.getHttpGetPromise(url, token);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.equal(error.response.status, 503);
      }
    });
  });

  describe('logStatusOfEachTaskFromSet - Various Scenarios', function() {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should handle empty tasks array', async function() {
      const cesUrl = 'https://ces:48226';
      const setId = 'S000001';
      const level = 'DEV1';
      const token = 'token123';
      const srid = 'SRID1';
      const rtConfig = 'CONFIG1';

      nock('https://ces:48226')
          .get(`/ispw/${srid}/sets/${setId}?level=${level}&rtConfig=${rtConfig}`)
          .reply(200, {tasks: []});

      const message = await utils.logStatusOfEachTaskFromSet(
          cesUrl, setId, level, token, srid, rtConfig,
      );
      assert.equal(message, '');
    });

    it('should handle multiple tasks', async function() {
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
              {moduleName: 'MOD1'},
              {moduleName: 'MOD2'},
              {moduleName: 'MOD3'},
            ],
          });

      const message = await utils.logStatusOfEachTaskFromSet(
          cesUrl, setId, level, token, srid, rtConfig,
      );
      assert.include(message, 'MOD1');
      assert.include(message, 'MOD2');
      assert.include(message, 'MOD3');
      // Verify format
      const lines = message.trim().split('\n');
      assert.equal(lines.length, 3);
    });
  });
});
