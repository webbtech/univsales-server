/* cSpell:disable */
/**
 * Docs for libs are:
 * jose: https://github.com/cisco/node-jose
 * jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
 * to test, use: yarn test:w ./src/authorizer/validator.unit.test.js
 */

import validator from './validator'

import { COGNITO_CLIENT_ID as clientID } from './constants'

// eslint-disable-next-line quotes
const token = "eyJraWQiOiJGSEt3RW8yZkZKWFVUQjVTUjcwbjZQOGR2R2R2T216SWZ1cXBQV3ZXcU53PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MDYzNjY0Mi0zZTcxLTRjNTctOWQ2MS02YmYwNzFiYjg5ZTEiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmNhLWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9jYS1jZW50cmFsLTFfMURRam5VNmpkIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoicHVscGZyZWUiLCJhdWQiOiIyMDc1a2JiYmIzaGFkbXRhbGVkY25jZmJrMCIsImV2ZW50X2lkIjoiYzU4MzM1NzYtOGZlYy00MmYyLTkwYjEtNzY1NmNiMWE2NzRiIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1ODIxNTEwODIsIm5hbWUiOiJSb24gRHljayIsInBob25lX251bWJlciI6IisxOTA1OTg0OTM5MyIsImV4cCI6MTU4MjMwNjAzOCwiaWF0IjoxNTgyMzAyNDM4LCJlbWFpbCI6InJvbmRAd2ViYnRlY2gubmV0In0.PDsHqHHQb7b1r3YuvB8p0Dc_ZXOEwEWUJ19jwSNb6VoEwYMRkhfHaJaAB5xoagwO55gFQi-cj9pg9CfnNlK93NXqTqehnP7eg2cBRXE-qIa-7cX5VW559l4v7jC6o6FvR59gWRns2xjkg7ZDJ6htoSKgiYW5QbmUBcvBK38BqYz5y9ShU2lDRB5rx9jjNMID04Z96_J8M2N-OQenLplA1sJdI0zjjmh8CdYkrkp_G8byYaaP_5igesfmOaG0s5EElB7rgKUTtttfR8q8fxz8DBeArhuk_3uA-lrl3zqz8wxMO0mx02DdxFvK0PrDUJTKYf36Rexfq5M6ah3IVre2fw"
const expiredToken = 'eyJraWQiOiJGSEt3RW8yZkZKWFVUQjVTUjcwbjZQOGR2R2R2T216SWZ1cXBQV3ZXcU53PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MDYzNjY0Mi0zZTcxLTRjNTctOWQ2MS02YmYwNzFiYjg5ZTEiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmNhLWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9jYS1jZW50cmFsLTFfMURRam5VNmpkIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoicHVscGZyZWUiLCJhdWQiOiIyMDc1a2JiYmIzaGFkbXRhbGVkY25jZmJrMCIsImV2ZW50X2lkIjoiYzU4MzM1NzYtOGZlYy00MmYyLTkwYjEtNzY1NmNiMWE2NzRiIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1ODIxNTEwODIsIm5hbWUiOiJSb24gRHljayIsInBob25lX251bWJlciI6IisxOTA1OTg0OTM5MyIsImV4cCI6MTU4MjIzMjM0MCwiaWF0IjoxNTgyMjI4NzQwLCJlbWFpbCI6InJvbmRAd2ViYnRlY2gubmV0In0.moXgKaE4ZBZpkYuzy2NbVDQvIlnz4LETUOnzvIV2PdkAmFDGVVCxfXE8wPHlJC4v4Wu5b3xnHAb7pchAmhrW5EeGUUAofGpRPtp70FO_HD7ooDPhrn5SJh6415zZ4SyBTek1N8_-cxtScOlwO0eBLu35U6YYManiliJzubzTP_f-6plC61n5hFEzrO16G1VxKvAI3YzSvTd4q678AVFjlVBFz0R3ElLqc-Qa3t7aCtaWtCeglj8mKvGP17PyV488CuZG9pB652EINvFKEL1AY0CkAg0-CeCzz9rtgjWOchzG9ckvT9opibJYOIHRKtumC8eKgRGRBLan3_8XifobAw'

test('has correct return', async () => {
  const res = await validator(clientID, token)
  expect(res).toContain(clientID)
})

test('token has expired', async () => {
  let thrownError
  try {
    await validator(clientID, expiredToken)
  } catch (err) {
    thrownError = err
  }
  expect(thrownError).toEqual(expect.any(Error))
  expect(thrownError).toMatchObject({ message: 'Token is expired' })
})

test('validate has missing params', async () => {
  let thrownError
  try {
    await validator(null, token)
  } catch (err) {
    thrownError = err
  }
  expect(thrownError).toEqual(expect.any(Error))
  expect(thrownError).toMatchObject({ message: 'Missing clientID' })

  try {
    await validator(clientID)
  } catch (err) {
    thrownError = err
  }
  expect(thrownError).toEqual(expect.any(Error))
  expect(thrownError).toMatchObject({ message: 'Missing token' })
})

test('has invalid client id', async () => {
  const invalidClientID = '5n63nd473pv7ne2qskv30gkcbh'
  let thrownError
  try {
    await validator(invalidClientID, token)
  } catch (err) {
    thrownError = err
  }
  expect(thrownError).toEqual(expect.any(Error))
  expect(thrownError).toMatchObject({ message: 'Token was not issued for this audience' })
})
