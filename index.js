const axios = require('axios').default;

/**
 * Retrieves the action inputs from github core and returns them as a object
 * @param {core} core
 * @return {string []} a string array with all the input field names
 * (whether they are defined or not)
 */
function retrieveInputs(core, inputFields) {
  let inputs = {};
  inputFields.forEach(inputName => inputs[inputName] = core.getInput(inputName));
  return inputs;
}

/**
 * Reads the contents of the file at the given path and returns the contents as
 * an object
 * @param  {string} jsonString absolute path to the file to read
 * @return {any | undefined} parsed contents of the file,
 * or undefined if the file is empty
 */
function parseStringAsJson(jsonString) {
  let parsedObj;
  if (stringHasContent(jsonString)) {
    parsedObj = JSON.parse(jsonString);
  }
  return parsedObj;
}

/**
 * Validates the given BuildParms object to ensure that all the fields
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

    requiredFields.forEach(field => {
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
 * @returns {string} a message telling the user that the required field must be specified. The 
 * build parms field name has been replaced with a more meaningful name.
 */
function getMissingInputMessage(fieldName) {
  let fieldNameReplacement = {
    containerId: 'n assignment ID',
    releaseId: ' release ID',
    taskLevel: ' level',
    taskIds: ' list of task IDs'
  }

  return `Missing input: a${fieldNameReplacement[fieldName]} must be specified.`
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
 * Assembles the URL to use when sending the generate request.
 * @param  {string} cesUrl the base CES URL that was passed in the action
 * arguments
 * @param  {string} requestPath the action-specific request portion of the request url, beginning with a slash.
 * For example, '/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=7bd249ba12&level=DEV2'
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

  let tempUrlStr = cesUrl.concat(requestPath);
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
 * Gets a promise for sending an http request
 * @param {URL} requestUrl the URL to send hte request to
 * @param {string} token the token to use during authentication
 * @param {string} requestBody the request body
 * @return {Promise} the Promise for the request
 */
function getHttpPromise(requestUrl, token, requestBody) {

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'authorization': token,
    }
  };
  return axios.post(requestUrl.href, requestBody, options);
}


/**
 * The status message in the awaitStatus may be a single string, or an array.
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
  getHttpPromise,
};
