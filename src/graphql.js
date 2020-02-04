import { ApolloServer } from 'apollo-server-lambda'

import config from './config/config'
import mongoose from './mongo/connect'

import schema from './schema'

const thundra = require('@thundra/core')()

let cfg
let db
const context = async ({ event }) => {
  // console.log('event.headers:', event.headers)
  const token = event.headers.Authorization
  if (!db) {
    console.log('initializing db and cfg') // eslint-disable-line no-console
    cfg = await config.load()
    db = await mongoose.connect(cfg)
  }
  return {
    cfg,
    db,
    token,
  }
}

const server = new ApolloServer(schema)
server.context = context

/* exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  },
}) */

exports.graphqlHandler = thundra(server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  },
}))
