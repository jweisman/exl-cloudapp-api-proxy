const jwt = require('jsonwebtoken');
const algorithm = process.env.CLOUDAPP_AUTHORIZER_ALGORITHM || 'RS256';
const ignoreExpiration = (process.env.CLOUDAPP_AUTHORIZER_IGNORE_EXPIRATION=='true');
const allowLocalhost = (process.env.CLOUDAPP_AUTHORIZER_ALLOW_LOCALHOST=='true');
const allowedApps = process.env.CLOUDAPP_AUTHORIZER_ALLOWED_APPS;
const allowedInstCodes = process.env.CLOUDAPP_AUTHORIZER_ALLOWED_INST_CODES;
const JWT_ISS_PREFIX = 'ExlCloudApp'.toLowerCase();

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

module.exports.authorizer = (event, context, callback) => {
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  try {
    //const verified = jwt.verify(tokenValue, publicKey, {ignoreExpiration, algorithm});
    const verified = verify(event.authorizationToken);
    let policy = generatePolicy(verified.sub, 'Allow', '*');
    policy.context = {
      instCode: verified.inst_code,
      userId: verified.sub
    }
    return callback(null, policy);
  } catch (e) {
    console.log('invalid token', e.message);
    return callback('Unauthorized');
  }   
};

module.exports.auth = header => {
  try {
    return verify(header);
  } catch (e) {
    console.log('invalid token', e.message);
    return false;
  }

}

const verify = auth => {
  if (!auth) {
    return false;
  }
  const tokenParts = auth.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    throw new Error('No token');
  }
  const publicKey = require('fs').readFileSync(__dirname + '/public-key.pem');
  const verified = jwt.verify(tokenValue, publicKey, {ignoreExpiration, algorithm});

  /* Verify issuer */
  const issuer = (verified.aud || verified.iss).replace(allowLocalhost ? /:!~/ : /:/, ':').toLowerCase();
  const validIssuer = allowedApps 
    ? allowedApps.toLowerCase().split(',').map(v=>`${JWT_ISS_PREFIX}:${v.trim()}`).includes(issuer) 
    : issuer.startsWith(JWT_ISS_PREFIX);
  if (!validIssuer) {
    throw new Error('Invalid issuer.');
  }

  /* Verify Inst Code */
  const validInstCode = allowedInstCodes
    ? allowedInstCodes.toUpperCase().split(',').map(v=>v.trim()).includes(verified.inst_code)
    : true
  if (!validInstCode) {
    throw new Error('Invalid Inst Code.');
  }

  return verified;
}