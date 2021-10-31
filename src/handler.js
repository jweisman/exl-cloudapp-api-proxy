require('dotenv').config();
const utils = require('./utils');
const { auth } = require('./authorizer/index');
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const sm = new AWS.SecretsManager();
const secretName = process.env.API_KEYS_SECRET_NAME || 'ExlApiProxy/ApiKeys';
const forInstCode = (process.env.FOR_INSTCODE_HEADER_NAME || 'X-For-InstCode').toLowerCase();

const regionMap = {
  us: 'na',
}

let _keys;

const handler = async (event, context) => {
  let result;
  if (event.requestContext && event.requestContext.http.method == 'OPTIONS') {
    result = { statusCode: 204 };
    return utils.cors(result, event);
  }
  /* Validate token */
  const token = auth(event.headers.authorization);
  if (!token) {
    result = utils.responses.unauthorized();
    return utils.cors(result, event);
  }
  const keys = await getKeys();

  /* Support management API */
  if (event.rawPath.startsWith('/.manage')) {
    switch (event.rawPath) {
      case '/.manage/inst-codes':
        result = utils.responses.success(Object.keys(keys));
        return utils.cors(result, event);
    }
  }
  const region = (process.env.AWS_REGION && process.env.AWS_REGION.slice(0,2)) || 'us';
  const host = `api-${regionMap[region] || region}.hosted.exlibrisgroup.com`;
  let customRequestHeader;
  try {
    if ( event.headers ) {
      customRequestHeader = event.headers;
    }
    if (event.headers[forInstCode] && keys) {
      const key = keys[event.headers[forInstCode]];
      customRequestHeader['authorization'] = `apikey ${key}`;
    }
    customRequestHeader['host'] = host;
    const params = {
      method: event.requestContext.http.method,
      headers: customRequestHeader,
      body: event.body
    };
    const url = `https://${host}${event.rawPath}?${event.rawQueryString}`;
    const response = await fetch(url, params);
    const textResponse = await response.text();
    let responseHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      if (key != 'content-encoding') {
        responseHeaders[key] = value;
      }
    }
    result = {
      statusCode: response.status, 
      body: textResponse,
      headers: responseHeaders
    }
  } catch (e) {
    console.error('error', e);
    result = utils.responses.error(e.message);
  }
  return utils.cors(result, event);
};

const getKeys = async () => {
  if (!_keys) {
    const resp = await sm.getSecretValue({SecretId: secretName}).promise();
    _keys = JSON.parse(resp.SecretString)
  }
  return _keys;
}

module.exports = { handler };