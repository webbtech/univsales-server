import mongoose from 'mongoose'

const db = {
  cfg: {},
  uri: '',
}

const logToConsole = process.env.NODE_ENV === 'production'
const isTestEnv = process.env.NODE_ENV === 'test'

db.connect = async function connect(cfg) {
  this.cfg = cfg
  this.setUri()

  mongoose.connect(this.uri)

  const dbConn = mongoose.connection

  dbConn.on('error', (ee) => {
    if (!isTestEnv) {
      console.error('Mongoose connection error: ', ee.message) // eslint-disable-line
    }
  })
  if (logToConsole) {
    dbConn.once('open', () => {
      console.log('Mongoose open to ', this.uri) // eslint-disable-line
    })
    dbConn.on('disconnected', () => {
      console.log('Mongoose disconnected') // eslint-disable-line
    })
    process.on('SIGINT', () => {
      dbConn.close(() => {
        console.log('Mongoose disconnected due to application termination') // eslint-disable-line
        process.exit(0)
      })
    })
  }

  return dbConn
}

db.setUri = function setUri() {
  if (!this.cfg.mongoDBName) {
    throw new Error('Missing mongoDBName')
  }

  if (this.cfg.nodeEnv === 'prod' || this.cfg.nodeEnv === 'stage') {
    this.uri = `mongodb+srv://peer0.mvx5f.mongodb.net/${this.cfg.mongoDBName}?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`
  } else {
    this.uri = `mongodb://${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}`
  }
}

module.exports = db
