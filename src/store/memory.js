'use strict'

let _ = require('lodash')
  , EventEmitter = require('events').EventEmitter

let projects = []

class MemoryStore extends EventEmitter {
  constructor() {
    super()
  }

  add(project, cb) {
    projects.push(project)
    if (_.isFunction(cb)) cb(null)
  }

  delete(param, cb) {
    _.remove(projects, param)
    if (_.isFunction(cb)) cb(null)
  }

  update(param, newVal, cb) {
    _.assign(this.find(param), newVal)
    if (_.isFunction(cb)) cb(null)
  }

  find(param, cb) {
    let res = _.find(projects, param)
    if (_.isFunction(cb)) cb(res)
    return res
  }

  get projects() {
    return projects
  }
}

module.exports = MemoryStore
