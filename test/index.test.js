/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
const chai = require('chai');
const { utils } = require('mocha');
var assert = chai.assert;
var expect = chai.expect;

describe('Testing index.js', function () {

  describe('#retrieveInputs(core, inputFields = [])', function () {
    var utils = require('../index.js');
    let core = {
      getInput: function (inputName) {
        return inputName;
      }
    };
    it('should return inputs', function () {
      let inputFields = ['generate_automatically',
        'assignment_id', 'level', 'task_id', 'ces_url',
        'ces_token', 'srid', 'runtime_configuration', 'change_type',
        'execution_status', 'auto_deploy'];
      let output = utils.retrieveInputs(core, inputFields);
      assert.strictEqual(output.generate_automatically, 'generate_automatically');
      assert.strictEqual(output.assignment_id, 'assignment_id');
      assert.strictEqual(output.level, 'level');
      assert.strictEqual(output.task_id, 'task_id');
      assert.strictEqual(output.ces_url, 'ces_url');
      assert.strictEqual(output.ces_token, 'ces_token');
      assert.strictEqual(output.srid, 'srid');
      assert.strictEqual(output.runtime_configuration, 'runtime_configuration');
      assert.strictEqual(output.change_type, 'change_type');
      assert.strictEqual(output.execution_status, 'execution_status');
      assert.strictEqual(output.auto_deploy, 'auto_deploy');
      assert.strictEqual(output.other, undefined);
    });
  });


  describe('#parseStringAsJson(jsonString)', function () {
    it('should return empty buildparms', function () {
      var utils = require('../index.js');
      let output = utils.parseStringAsJson(JSON.stringify({}));
      assert.strictEqual(output.containerId, undefined);
      assert.strictEqual(output.releaseId, undefined);
      assert.strictEqual(output.taksIds, undefined);
      assert.strictEqual(output.taskLevel, undefined);
    });

    it('should return undefined', function () {
      var utils = require('../index.js');
      let output = utils.parseStringAsJson('');
      assert.strictEqual(output, undefined);
    });

    it('should return buildParms object with fields filled in', function () {
      var utils = require('../index.js');
      let output = utils.parseStringAsJson(JSON.stringify({
        containerId: 'PLAY003736',
        releaseId: ' ',
        taskLevel: 'DEV1',
        taskIds: ['7E45E3087494']
      }));
      assert.strictEqual(output.containerId, 'PLAY003736');
      assert.strictEqual(output.releaseId, ' ');
      assert.strictEqual(output.taskLevel, 'DEV1');
      assert.deepEqual(output.taskIds, ['7E45E3087494']);
    });
  });


  describe('#validateBuildParms(buildParms, requiredFields = [])', function () {
    var utils = require('../index.js');
    it('should return false - no parms defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = {};
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - buildParms are null', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let output = utils.validateBuildParms(null, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - buildParms are undefined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let output = utils.validateBuildParms(undefined, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - taskLevel & taskIds not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { containerId: null };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { containerId: undefined };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { containerId: '' };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { containerId: 'assignment1' };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskIds not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { taskLevel: null };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskLevel: undefined };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskLevel: '' };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskLevel: 'level1' };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - containerId & taskLevel not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { taskIds: null };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskIds: undefined };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskIds: [] };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);

      buildParms = { taskIds: ['task1', 'task2'] };
      output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - containerId not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { taskLevel: 'level2', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - taskLevel not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { containerId: 'assignment2', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return false - taskIds not defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { containerId: 'assignment2', taskLevel: 'level3' };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isFalse(output);
    });

    it('should return true - everything defined', function () {
      let requiredFields = ['containerId', 'taskLevel', 'taskIds'];
      let buildParms = { containerId: 'assignment2', taskLevel: 'level3', taskIds: ['task1', 'task2'] };
      let output = utils.validateBuildParms(buildParms, requiredFields);
      assert.isTrue(output);
    });
  });


  describe('#convertObjectToJson(data)', function () {
    it('should return empty string - null input', function () {
      let data = null;
      var utils = require('../index.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '');
    });

    it('should return empty string - undefined input', function () {
      let data = undefined;
      var utils = require('../index.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '');
    });

    it('should return brackets - empty object input', function () {
      let data = {};
      var utils = require('../index.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '{}');
    });

    it('should return object serialization', function () {
      let data = { field1: 'value1', field2: 'value2' };
      var utils = require('../index.js');
      let output = utils.convertObjectToJson(data);
      assert.strictEqual(output, '{"field1":"value1","field2":"value2"}');
    });

  });


  describe('#assembleRequestUrl(CESUrl, buildParms)', function () {
    it('should use CES url as it is', function () {
      var utils = require('../index.js');
      let path = '/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2'
      let cesUrl = 'https://ces:48226'
      let output = utils.assembleRequestUrl(cesUrl, path);
      assert.equal(output.href, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove Compuware', function () {
      var utils = require('../index.js');
      let path = '/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2'
      let cesUrl = 'https://ces:48226/Compuware'
      let output = utils.assembleRequestUrl(cesUrl, path);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');

    });

    it('should modify CES url to remove ispw', function () {
      var utils = require('../index.js');
      let path = '/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2'
      let cesUrl = 'https://ces:48226/isPw'
      let output = utils.assembleRequestUrl(cesUrl, path);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });

    it('should modify CES url to remove trailing slash', function () {
      var utils = require('../index.js');
      let path = '/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2'
      let cesUrl = 'https://ces:48226/'
      let output = utils.assembleRequestUrl(cesUrl, path);
      assert.strictEqual(output.href, 'https://ces:48226/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
    });
  });


  describe('#getHttpPromise(cesUrl, token, requestBody)', function () {
    const nock = require('nock');
    var utils = require('../index.js');

    afterEach(() => {
      assert.strictEqual(nock.pendingMocks.length, 0);
    });

    it('should be resolved', async function () {
      let reqUrl = new URL('http://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2');
      let token = '10987654321';
      let reqBody = {
        runtimeConfig: 'CONFIG1',
        changeType: 'E',
        execStat: 'H',
        autoDeploy: false
      };
      nock('http://ces:48226')
        .post('/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=DEV2')
        .reply(200, {
          setId: 'S000241246',
          url: 'http://10.100.12.250:48226/ispw/cw09-47623/sets/S000241246',
          awaitStatus: {
            generateFailedCount: 0,
            generateSuccessCount: 1,
            hasFailures: false,
            statusMsg: 'ISPW: Set S000241246 - The generate request completed successfully for KEEPRG2 in PLAY004799. Job ID and name: J0861367 AMIKEE0G',
            taskCount: 1
          }
        });

      await utils.getHttpPromise(reqUrl, token, reqBody).then((resBody) => {
        console.log('verifying body');
        assert.strictEqual(resBody.data.setId, 'S000241246');
        assert.strictEqual(resBody.data.url, 'http://10.100.12.250:48226/ispw/cw09-47623/sets/S000241246');
        assert.strictEqual(resBody.data.awaitStatus.generateFailedCount, 0);
        assert.strictEqual(resBody.data.awaitStatus.generateSuccessCount, 1);
        assert.strictEqual(resBody.data.awaitStatus.hasFailures, false);
        assert.strictEqual(resBody.data.awaitStatus.taskCount, 1);
      }, (error) => {
        assert.fail('should not reach here');
      });

    });

    it('should be rejected', async function () {
      let reqUrl = new URL('http://ces:48226/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=reject');
      let token = '10987654321';
      let reqBody = {
        runtimeConfig: 'CONFIG1',
        changeType: 'E',
        execStat: 'H',
        autoDeploy: false
      };
      nock('http://ces:48226')
        .post('/ispw/ISPW/assignments/assignment345/taskIds/generate-await?taskId=a37b46c2&taskId=7bd249ba12&level=reject')
        .replyWithError('A error occurred when connecting to ISPW');

      await utils.getHttpPromise(reqUrl, token, reqBody).then(() => {
        assert.fail('should not reach here');
      }, (error) => {
        console.log('verifying body');
        assert.strictEqual(error.message, 'A error occurred when connecting to ISPW');
      });

    });
  });


  describe('#getStatusMessageToPrint(statusMsg)', function () {
    var utils = require('../index.js');
    it('should return empty', function () {
      let output = utils.getStatusMessageToPrint('');
      assert.strictEqual(output, '');
      output = utils.getStatusMessageToPrint({ field: 'value' });
      assert.strictEqual(output, '');
    });

    it('should merge array into single string', function () {
      let output = utils.getStatusMessageToPrint(['string1', 'string2', 'string3']);
      assert.strictEqual(output, 'string1\nstring2\nstring3\n');
    });

    it('should handle single string', function () {
      let output = utils.getStatusMessageToPrint('string message');
      assert.strictEqual(output, 'string message');
    });
  });

});