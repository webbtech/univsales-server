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

  mongoose.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true })
  mongoose.set('useCreateIndex', true)
  mongoose.set('useNewUrlParser', true)
  mongoose.set('useFindAndModify', false)

  // see: https://medium.com/@vsvaibhav2016/best-practice-of-mongoose-connection-with-mongodb-c470608483f0
  // for info on best practices
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
  if (!this.cfg.mongoDBName || !this.cfg.mongoDBPort) {
    throw new Error('Missing mongoDBName')
  }

  /* if (this.cfg.nodeEnv === 'stage') {
    // we expect that username and password are set in config
    if (!this.cfg.mongoDBUsername || !this.cfg.mongoDBPassword) {
      throw new Error('Missing mongoDBUsername or mongoDBPassword in config')
    }
    this.uri = `mongodb+srv://${this.cfg.mongoDBUsername}:${this.cfg.mongoDBPassword}@${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}?retryWrites=true&w=majority`
  } else if (this.cfg.nodeEnv === 'prod') {
    if (!this.cfg.mongoDBUsername || !this.cfg.mongoDBPassword) {
      throw new Error('Missing mongoDBUsername or mongoDBPassword in config')
    }
    this.uri = `mongodb://${this.cfg.mongoDBUsername}:${this.cfg.mongoDBPassword}@${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}?retryWrites=true&authSource=admin&replicaSet=${this.cfg.mongoDBReplSet}`
  } else {
    this.uri = `mongodb://${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}`
  } */
  if (this.cfg.nodeEnv === 'prod' || this.cfg.nodeEnv === 'stage') {
    if (!this.cfg.mongoDBUsername || !this.cfg.mongoDBPassword) {
      throw new Error('Missing mongoDBUsername or mongoDBPassword in config')
    }
    // this.uri = `mongodb+srv://${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}?authSource=$external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`
    // "mongodb+srv://<AWS access key>:<AWS secret key>@peer0.mvx5f.mongodb.net/?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&authMechanismProperties=AWS_SESSION_TOKEN:<session token (for AWS IAM Roles)>"
    // this.uri = `mongodb://${this.cfg.mongoDBUsername}:${this.cfg.mongoDBPassword}@${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}?retryWrites=true&authSource=admin&replicaSet=${this.cfg.mongoDBReplSet}`

    // mongodb+srv://admin:<password>@peer0.mvx5f.mongodb.net/?retryWrites=true&w=majority

    // this is good for user/pass
    // this.uri = `mongodb+srv://admin:TYhbQPBzjt8LF29R9h74@${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}?retryWrites=true&w=majority`

    // "mongodb+srv://<AWS access key>:<AWS secret key>@peer0.mvx5f.mongodb.net/?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&authMechanismProperties=AWS_SESSION_TOKEN:<session token (for AWS IAM Roles)>"
    this.uri = `mongodb+srv://peer0.mvx5f.mongodb.net/${this.cfg.mongoDBName}?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`

    // above should work, see: https://stackoverflow.com/questions/67198660/why-cant-my-aws-lambda-node-js-app-access-my-mongodb-atlas-cluster
    // we may have to upgrade mongoose

    console.log('this.uri:  ', this.uri)
  } else {
    this.uri = `mongodb://${this.cfg.mongoDBHost}/${this.cfg.mongoDBName}`
  }
}

module.exports = db
