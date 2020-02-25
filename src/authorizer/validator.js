import jose from 'node-jose'
import jwt from 'jsonwebtoken'

import jwtSet from './jwks.json'

const validator = async (clientID, token) => {
  if (!clientID) {
    throw new Error('Missing clientID')
  }
  if (!token) {
    throw new Error('Missing token')
  }

  let keyStore = jose.JWK.createKeyStore(jwtSet)

  const decoded = jwt.decode(token, { complete: true })
  const { kid } = decoded.header

  try {
    keyStore = await jose.JWK.asKeyStore(jwtSet)
  } catch (err) {
    throw new Error(err)
  }

  const key = keyStore.get(kid, { kty: 'RSA' })

  // verify the signature
  const verifyRes = await jose.JWS.createVerify(key).verify(token)

  // extract claims
  const claims = JSON.parse(verifyRes.payload)

  const tokenClientID = claims.aud || claims.client_id
  const username = claims['cognito:username'] || claims.username
  if (!tokenClientID || !username) {
    throw new Error('Failed to set either tokenClientID or username')
  }
  if (tokenClientID !== clientID) {
    // eslint-disable-next-line no-console
    console.log('failed to match tokenClientID to clientID: ', tokenClientID, clientID)
    throw new Error('Token was not issued for this audience')
  }

  // ensure token is not expired
  const currentTs = Math.floor(new Date() / 1000)
  if (currentTs > claims.exp) {
    throw new Error('Token is expired')
  }

  const principalID = `${username}|${tokenClientID}`

  return principalID
}

export default validator
