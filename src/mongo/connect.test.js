import main from './connect'
import cfg from '../config/config'

let config

// to test just this file, run: yarn test:w src/mongo/connect.test.js
// to test just this file once, run: yarn test src/mongo/connect.test.js

test('ensure config path', async () => {
  process.env.Stage = 'test'
  config = await cfg.load()
  main.cfg = config
  expect(main.cfg.mongoDBHost).toBeDefined()
})

test('local environment connects', async () => {
  process.env.Stage = 'test'
  config = await cfg.load()
  const db = await main.connect(config)
  expect(db.readyState).toEqual(1)
})

test('production environment uri to match', async () => {
  process.env.Stage = 'prod'
  config = await cfg.load()
  const uri = `mongodb://${config.mongoDBUsername}:${config.mongoDBPassword}@${config.mongoDBHost}/${config.mongoDBName}?retryWrites=true&authSource=admin&replicaSet=repl-1`
  main.cfg = config
  main.setUri()
  expect(main.uri).toEqual(uri)
})

/*
Cannot access VPN here
test('production environment connects', async () => {
  process.env.Stage = 'prod'
  config = await cfg.load()
  console.log('config:', config)

  const db = await main.connect(config)
  expect(db.readyState).toEqual(1)
}) */
