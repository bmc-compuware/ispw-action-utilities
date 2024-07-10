/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

const axios = require('axios').default;
const {JSDOM} = require('jsdom');
const createDOMPurify = require('dompurify');
const DOMPurify = createDOMPurify(new JSDOM('').window);

/**
 * Retrieves the action inputs from github core and returns them as a object
 * @param {core} core the GitHub actions core
 * @param {string []} inputFields an array holding the names of the input fields to read from core
 * @return {string []} a string array with all the input field names
 * (whether they are defined or not)
 */
function retrieveInputs(core, inputFields) {
  const inputs = {};
  inputFields.forEach((inputName) => inputs[inputName] = core.getInput(inputName));
  return inputs;
}

/**
 * Parses the given JSON string into an object
 * @param  {string} jsonString the string to parse
 * @return {any | undefined} parsed contents of the string. This will return undefined if the
 * string is empty.
 */
function parseStringAsJson(jsonString) {
  let parsedObj;
  if (stringHasContent(jsonString)) {
    parsedObj = JSON.parse(jsonString);
  }
  return parsedObj;
}

/**
 * Validates the given BuildParms object to ensure that all the required fields
 * are filled in.
 * @param  {BuildParms} buildParms the BuildParms object to check
 * @param {string []} requiredFields an array of field names for the required buildParms fields.
 * For example, ['containerId', 'taskLevel'] means that the "containerId" and "taskLevel" fields
 * are required to be specified in the given buildParms object
 * @return {boolean} boolean indicating whether the build parms are valid
 */
function validateBuildParms(buildParms, requiredFields) {
  let isValid = false;
  if (buildParms !== null && buildParms !== undefined) {
    isValid = true;

    requiredFields.forEach((field) => {
      if (!stringHasContent(buildParms[field])) {
        isValid = false;
        console.error(getMissingInputMessage(field));
      }
    });
  }
  return isValid;
}

/**
 * Gets a message which indicates that a required input field is missing.
 * @param {string} fieldName the name of the buildParms field which is required and not found
 * @return {string} a message telling the user that the required field must be specified. The
 * build parms field name has been replaced with a more meaningful name.
 */
function getMissingInputMessage(fieldName) {
  const fieldNameReplacement = {
    containerId: 'n assignment ID',
    releaseId: ' release ID',
    taskLevel: ' level',
    taskIds: ' list of task IDs',
  };

  return `Missing input: a${fieldNameReplacement[fieldName]} must be specified.`;
}

/**
 * Converts the given data object to a JSON string
 * @param  {any} data
 * @return {string} JSON representing the given object. Returns an empty
 * string if the object is null
 */
function convertObjectToJson(data) {
  let dataStr = '';
  if (data !== null && data != undefined) {
    dataStr = JSON.stringify(data);
  }
  return dataStr;
}

/**
 * Assembles the URL to use when sending the CES request.
 * @param  {string} cesUrl the base CES URL that was passed in the action
 * arguments
 * @param  {string} requestPath the action-specific request portion of the request url,
 * beginning with a slash. For example,
 * '/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=7bd249ba12&level=DEV2'
 * @return {URL} the url for the request
 */
function assembleRequestUrl(cesUrl, requestPath) {
  // remove trailing '/compuware' from url, if it exists
  let lowercaseUrl = cesUrl.toLowerCase();
  const cpwrIndex = lowercaseUrl.lastIndexOf('/compuware');
  if (cpwrIndex > 0) {
    cesUrl = cesUrl.substr(0, cpwrIndex);
  }

  // remove trailing '/ispw' from url, if it exists
  lowercaseUrl = cesUrl.toLowerCase();
  const ispwIndex = lowercaseUrl.lastIndexOf('/ispw');
  if (ispwIndex > 0) {
    cesUrl = cesUrl.substr(0, ispwIndex);
  }

  // remove trailing slash
  if (cesUrl.endsWith('/')) {
    cesUrl = cesUrl.substr(0, cesUrl.length - 1);
  }

  const tempUrlStr = cesUrl.concat(requestPath);
  const url = new URL(tempUrlStr);
  return url;
}

/**
 * Checks to make sure a string is not undefined, null, or empty
 * @param  {string | undefined} inputStr the string to check
 * @return {boolean} a boolean indicating whether the string has content
 */
function stringHasContent(inputStr) {
  let hasContent = true;
  if (inputStr === null || inputStr === undefined || inputStr.length === 0) {
    hasContent = false;
  }
  return hasContent;
}

/**
 * Gets a promise for sending an http POST request
 * @param {URL} requestUrl the URL to send hte request to
 * @param {string} token the token to use during authentication
 * @param {*} requestBody the request body object
 * @return {Promise} the Promise for the request
 */
function getHttpPostPromise(requestUrl, token, requestBody) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'authorization': token,
    },
  };
  console.log('url : ' + requestUrl.href);
  const cleanURL = DOMPurify.sanitize(requestUrl.href);
  console.log('cleanURL : ' + cleanURL);
  return axios.post(cleanURL, requestBody, options);
}

/**
 * Gets a promise for sending an http POST request with certi
 * @param {URL} requestUrl the URL to send hte request to
 * @param {string} certificate the certificate to use during authentication
 * @param {string} host the host
 * @param {string} port the port
 * @param {*} requestBody the request body object
 * @return {Promise} the Promise for the request
 */
function getHttpPostPromiseWithCert(requestUrl, certificate, host, port, requestBody) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'cpwr_hci_host': host,
      'cpwr_hci_port': port,
      'javax.servlet.request.X509Certificate': certificate,
    },
  };
  const cleanURL = DOMPurify.sanitize(requestUrl.href);
  return axios.post(cleanURL, requestBody, options);
}


/**
 * The status message in the awaitStatus coming back from CES may be a single string, or an array.
 * This method determines what the status contains and returns a single string.
 * @param {string | Array} statusMsg the statusMsg inside the awaitStatus in
 * the responseBody
 * @return {string} the statusMsg as a single string.
 */
function getStatusMessageToPrint(statusMsg) {
  let message = '';
  if (typeof statusMsg == 'string') {
    message = statusMsg;
  } else if (statusMsg instanceof Array) {
    statusMsg.forEach((line) => message = message + `${line}\n`);
  }
  return message;
}


module.exports = {
  retrieveInputs,
  parseStringAsJson,
  validateBuildParms,
  convertObjectToJson,
  assembleRequestUrl,
  stringHasContent,
  getStatusMessageToPrint,
  getHttpPostPromise,
  getHttpPostPromiseWithCert,
};
