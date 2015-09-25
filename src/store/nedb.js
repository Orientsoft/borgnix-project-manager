'use strict'

let EventEmitter = require('events').EventEmitter
  , DataStore = require('nedb')
  , _ = require('lodash')

class NedbStore extends EventEmitter {
  constructor(dataFilePath) {
    super()
    this.db = new DataStore({filename: dataFilePath})
  }

  start(cb) {
    this.db.loadDatabase(() => {
      if (_.isFunction(cb)) cb()
      this.emit('ready')
    })
  }

  add(project, cb) {
    this.db.insert(project, cb)
  }

  delete(cond, cb) {
    this.db.remove(cond, {multi: true}, cb)
  }

  update(cond, newVal, cb) {
    this.db.update(cond, newVal, {}, cb)
  }

  find(cond, cb) {
    this.db.find(cond, cb)
  }
}

module.exports = NedbStore
