let MongoClient = require('mongo').MongoClient
  , _ = require('lodash')
class MongoStore {
  constructor(mongoConfig) {
    let auth = ''
    if (mongoConfig.password && mongoConfig.username)
      auth += `${mongoConfig.username}:${mongoConfig.password}@`

    let host = mongoConfig.host || 'localhost'
      , port = mongoConfig.port || '27017'

    let url = `mongodb://${auth}${host}:${port}/${mongoConfig.db}`
    MongoClient.connect(url).then((db) => {
      this.db = db
      this.ready = true
    }).catch((err) => {
      console.error(err)
      this.ready = false
      this.error = err
    })
  }
}

module.exports = MongoStore
