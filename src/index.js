import { ApolloServer } from 'apollo-server' // eslint-disable-line import/no-extraneous-dependencies

import config from './config/config'
import mongoose from './mongo/connect'

import schema from './schema'

let cfg
let db
// const context = async ({ event, req }) => {
const context = async ({ req }) => {
  const token = req.headers.authorization
  // console.log('req:', req.headers.authorization)
  // console.log('req.headers:', c.req.headers)
  // console.log('res:', c.res)
  // console.log('req:', req.body)
  if (!db) {
    cfg = await config.load()
    db = await mongoose.connect(cfg)
  }
  return {
    cfg,
    db,
    token,
  }
}

const server = new ApolloServer({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  engine: {
    apiKey: 'service:univsales:U9yMMmt7AZHlL8zmnB_NPw',
  },
})
server.context = context

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`) // eslint-disable-line
})
