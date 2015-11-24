'use strict'
// var _ = require('lodash')
let EventEmitter = require('events').EventEmitter

module.exports.error = function (err, cb) {
  if (err)
    err = err instanceof Error ? err : new Error(err.toString())
  if (cb instanceof Function)
    cb(err)
  else
    throw err
}

module.exports.checkKeys = function (obj, keys) {
  return keys.reduce((valid, key)=>{
    return valid && obj[key]
  }, true)
}

module.exports.Counter = class Counter extends EventEmitter {
  constructor(limit) {
    super()
    this.limit = limit || 0
    this.count = 0
    this.ready = true
    this.on('add', () => {
      if (this.ready)
        this.count++
      if (this.count >= limit) {
        this.emit('finish')
        this.ready = false
      }
    })
  }

  set(limit) {
    this.limit = limit
    if (limit === 0) {
      this.emit('finish')
      this.count = 0
    }

  }

  start() {
    this.ready = true
  }

  stop() {
    this.ready = false
  }
}
