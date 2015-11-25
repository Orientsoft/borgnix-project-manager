'use strict'

let EventEmitter = require('events').EventEmitter
  , DataStore = require('nedb-promise').datastore
  , _ = require('lodash')

class NedbStore extends EventEmitter {
  constructor(dataFilePath) {
    super()
    this.db = new DataStore({
      filename: dataFilePath
    , autoload: true
    })
  }

  add(project) {
    return this.db.insertAsync(project)
  }

  find(cond) {
    return this.db.findAsync(cond, {_id: 0})
  }

  findOne(cond) {
    return this.db.findOneAsync(cond, {_id: 0})
  }

  delete(cond) {
    return this.db.removeAsync(cond, {multi: true})
  }

  update(query, newVal) {
    return this.db.updateAsync(query, newVal)
  }
}

module.exports = NedbStore
