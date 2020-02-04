import { ApolloServer } from 'apollo-server'

import config from './config/config'
import mongoose from './mongo/connect'

import schema from './schema'

let cfg
let db
const context = async ({ req }) => {
  // console.log('req:', req.headers.authorization)
  if (!db) {
    cfg = await config.load()
    db = await mongoose.connect(cfg)
  }
  return {
    cfg,
    db,
  }
}

const server = new ApolloServer(schema)
server.context = context

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`) // eslint-disable-line
})
