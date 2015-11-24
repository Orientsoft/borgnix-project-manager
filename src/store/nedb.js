'use strict'

// let EventEmitter = require('events').EventEmitter
//   , DataStore = require('nedb')
//   , _ = require('lodash')
//
// class NedbStore extends EventEmitter {
//   constructor(dataFilePath) {
//     super()
//     this.db = new DataStore({filename: dataFilePath})
//   }
//
//   start(cb) {
//     this.db.loadDatabase(() => {
//       if (_.isFunction(cb)) cb()
//       this.emit('ready')
//     })
//   }
//
//   add(project, cb) {
//     this.db.insert(project, cb)
//   }
//
//   delete(cond, cb) {
//     this.db.remove(cond, {multi: true}, cb)
//   }
//
//   update(cond, newVal, cb) {
//     this.db.update(cond, newVal, {}, cb)
//   }
//
//   find(cond, cb) {
//     this.db.find(cond, cb)
//   }
// }

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
    // this.db.find(cond, db)
    let result = this.db.findOneAsync(cond, {_id: 0})
    return result
  }

  findOne(cond) {
    let result = this.db.findOneAsync(cond, {_id: 0})
    return result
  }

  delete(cond) {
    return this.db.removeAsync(cond, {multi: true})
  }
}

module.exports = NedbStore
