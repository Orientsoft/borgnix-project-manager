var request = require('request')
  , _ = require('underscore')
  , $ = require('jquery')

function Client(opts) {
  if (opts.jar) this.jar = opts.jar
  this.host = opts.host || ''
  this.prefix = opts.prefix || ''
  this.endpoints = {
    newProject: '/project'
  , deleteProject: '/project'
  , listProject: '/projects'
  , saveFiles: '/project/files'
  , deleteFiles: '/project/files'
  , listTpls: '/templates'
  }
}

Client.prototype.url = function (endpoint) {
  return this.host + this.prefix + this.endpoints[endpoint]
}

Client.prototype.newProject = function (opt, cb) {
  var reqParam = {
    url: this.url('newProject')
  , json: true
  , body: {
      type: opt.type
    , name: opt.name
    , tpl: opt.tpl
    }
  }
  if (this.jar) reqParam.jar = this.jar
  request.put(reqParam, function (e, r, body) {
    if (_.isFunction(cb)) cb(body)
  })
}

Client.prototype.deleteProject = function (opt, cb) {
  var reqParam = {
    url: this.url('deleteProject')
  , json: true
  , body: opt
  }
  if (this.jar) reqParam.jar = this.jar
  request.del(reqParam, function (e, r, body) {
    if (_.isFunction(cb)) cb(body)
  })
}

// Client.prototype.saveFiles = function (opt, cb) {
//   console.log(opt.files)
//   $.ajax({
//     url: this.host + this.prefix + this.endpoints.saveFiles
//   , method: 'POST'
//   , data: {
//       uuid: opt.uuid
//     , token: opt.token
//     , type: opt.type
//     , name: opt.name
//     , files: JSON.stringify(opt.files)
//     }
//   , success: cb
//   })
// }

// Client.prototype.deleteFiles = function (opt, cb) {
//   $.ajax({
//     url: this.host + this.prefix + this.endpoints.deleteFiles
//   , method: 'DELETE'
//   , data: {
//       uuid: opt.uuid
//     , token: opt.token
//     , type: opt.type
//     , name: opt.name
//     , files: JSON.stringify(opt.files)
//     }
//   })
// }

Client.prototype.listProject = function (opt, cb) {
  var reqParam = {
    url: this.url('listProject')
  , qs: {type: opt.type}
  , json: true
  }
  if (this.jar) reqParam.jar = this.jar
  request.get(reqParam, function (e, r, body) {
    if (_.isFunction(cb)) cb(body)
  })
}

// Client.prototype.listTpls = function (type, cb) {
//   $.ajax({
//     url: this.host + this.prefix + this.endpoints.listTpls
//   , method: 'GET'
//   , data:{
//       type: type
//     }
//   , success: cb
//   })
// }

module.exports = Client
