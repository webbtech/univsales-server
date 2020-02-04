import validator from './validator'

const clientID = '2075kbbbb3hadmtaledcncfbk0'
/*
** Adapted from https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html#api-gateway-lambda-authorizer-token-lambda-function-create
** A simple TOKEN authorizer example to demonstrate how to use an authorization token
** to allow or deny a request. In this example, the caller named 'user' is allowed to invoke
** a request if the client - supplied token value is 'allow'. The caller is not allowed to
** invoke the request if the token value is 'deny'. If the token value is 'Unauthorized',
** the function returns the 'Unauthorized' error with an HTTP status code of 401. For any
** other token value, the authorizer returns 'Error: Invalid token' as a 500 error.
*/

function generatePolicyDocument(effect, methodArn) {
  if (!effect || !methodArn) return null

  const policyDocument = {
    Version: '2012-10-17',
    Statement: [{
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: methodArn,
    }],
  }

  return policyDocument
}

function generateAuthResponse(principalId, effect, methodArn) {
  // If you need to provide additional information to your integration
  // endpoint (e.g. your Lambda Function), you can add it to `context`
  const context = {
    stringKey: 'stringVal',
    numberKey: 123,
    booleanKey: true,
  }
  const policyDocument = generatePolicyDocument(effect, methodArn)

  return {
    principalId,
    context,
    policyDocument,
  }
}

exports.handler = async (event) => {
  const token = event.authorizationToken
  const { methodArn } = event
  const validateResult = await validator(clientID, token)

  switch (validateResult.status) {
    case 'allow':
      return generateAuthResponse('user', 'Allow', methodArn)
    case 'deny':
      return generateAuthResponse('user', 'Deny', methodArn)
    case 'unauthorized':
      console.error('Error:', validateResult.error) // eslint-disable-line no-console
      return Promise.reject(new Error('Unauthorized')) // Returns 401 unauthorized
    default:
      console.error('Error:', validateResult.error) // eslint-disable-line no-console
      return Promise.reject(new Error('Invalid token')) // Returns 500 Internal Server Error
  }
}
