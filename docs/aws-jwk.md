# Decode and Verify

See: [Verifying a JSON Web Token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

To fetch the public key of the user pool:  
region: 'ca-central-1',
userPoolId: 'ca-central-1_1DQjnU6jd',

format: https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json  
do: wget https://cognito-idp.ca-central-1.amazonaws.com/ca-central-1_1DQjnU6jd/.well-known/jwks.json > outputFile
