# ispw-action-utilities

This module include various utility functions that are useful when developing ISPW actions for GitHub actions. Having functions that are common across all ISPW actions will prevent duplicate code and will enforce a more consistent program flow.

## Available functions

### retrieveInputs

Retrieves the action inputs from github core and returns them as a object

* @param {core} core the GitHub actions core
* @param {string []} inputFields an array holding the names of the input fields to read from core
* @return {string []} a string array with all the input field names (whether they are defined or not)

### parseStringAsJson

Parses the given JSON string into an object

* @param  {string} jsonString the string to parse
* @return {any | undefined} parsed contents of the string. This will return undefined if the string is empty.

### validateBuildParms

Validates the given BuildParms object to ensure that all the required fields are filled in.

* @param  {BuildParms} buildParms the BuildParms object to check
* @param {string []} requiredFields an array of field names for the required buildParms fields. For example, ['containerId', 'taskLevel'] means that the "containerId" and "taskLevel" fields are required to be specified in the given buildParms object
* @return {boolean} boolean indicating whether the build parms are valid

### convertObjectToJson

Converts the given data object to a JSON string

* @param {any} data
* @return {string} JSON representing the given object. Returns an empty string if the object is null

### assembleRequestUrl

Assembles the URL to use when sending the CES request.

* @param  {string} cesUrl the base CES URL that was passed in the action arguments
* @param  {string} requestPath the action-specific request portion of the request url, beginning with a slash. For example, '/ispw/srid/assignments/assignment345/taskIds/generate-await?taskId=7bd249ba12&level=DEV2'
* @return {URL} the url for the request

### stringHasContent

Checks to make sure a string is not undefined, null, or empty

* @param  {string | undefined} inputStr the string to check
* @return {boolean} a boolean indicating whether the string has content

### getStatusMessageToPrint

The status message in the awaitStatus coming back fro CES may be a single string, or an array. This method determines what the status contains and returns a single string.

* @param {string | Array} statusMsg the statusMsg inside the awaitStatus in the responseBody
* @return {string} the statusMsg as a single string.

### getHttpPostPromise

Gets a promise for sending an http POST request

* @param {URL} requestUrl the URL to send hte request to
* @param {string} token the token to use during authentication
* @param {*} requestBody the request body
* @return {Promise} the Promise for the request

## Making changes

To make changes to the functions in this library:

1. Clone the code from [here](https://github.com/Compuware-ISPW/ispw-action-utilities)
2. Add or modify the function you need in `index.js`
3. If adding a function, also add it to the module exports at the bottom of the file
4. Write a test for the new behavior. Tests are located in `test/index.test.js`. To run the tests run `npm run test` from the command line.
5. To test your changes locally:
   1. Open the command line and run `npm pack` - this will create a `.tgz` file (called a tarball)
   2. Navigate to the folder of the ISPW GitHub action you are making the changes for. Open a command line and run `npm install [path-to-.tgz-file]`. This will update your package.json to point directly to the tarball path. **This change is for local testing only, do not commit to the main branch!**
   3. Continue making changes to the utilities functions and running `npm pack` to update the tarball file.
6. To publish and use a new version of the utility:
   1. Once your utility methods are working the way you want them to, update the version in `package.json`
   2. Commit all changes to the repository and run `npm publish --access public`. This will run linting, automated tests, and check the code coverage.
   3. If everything passes, then a new version of the library will be published to npm.
   4. In your GitHub action that needs the new functionality, update the `package.json` to point to the new version you just published.
   5. For more information on publishing, see the [npm doc](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)

**It is crucial that you do not make any breaking changes to existing functions (including changing method signatures) unless you are prepared to update all of the github actions to point to the latest version**
