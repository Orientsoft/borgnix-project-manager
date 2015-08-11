// import $ from 'jquery'
var $ = require('jquery')

var Client = function (opt) {
  this.host = opt.host
  this.prefix = opt.prefix || ''
  this.endpoints = {
    newProject: '/project'
  , deleteProject: '/project'
  , listProject: '/projects'
  , saveFiles: '/project/files'
  , deleteFiles: '/project/files'
  , listTpls: '/templates'
  }
}

Client.prototype.newProject = function (opt, cb) {
  $.ajax({
    url: this.host + this.prefix + this.endpoints.newProject
  , method: 'PUT'
  , data: {
      uuid: opt.uuid
    , token: opt.token
    , type: opt.type
    , name: opt.name
    , tpl: opt.tpl
    }
  , success: cb
  })
}

Client.prototype.deleteProject = function (opt, cb) {
  $.ajax({
    url: this.host + this.prefix + this.endpoints.deleteProject
  , method: 'DELETE'
  , data: opt
  , success: cb
  })
}

Client.prototype.saveFiles = function (opt, cb) {
  console.log(opt.files)
  $.ajax({
    url: this.host + this.prefix + this.endpoints.saveFiles
  , method: 'POST'
  , data: {
      uuid: opt.uuid
    , token: opt.token
    , type: opt.type
    , name: opt.name
    , files: JSON.stringify(opt.files)
    }
  , success: cb
  })
}

Client.prototype.deleteFiles = function (opt, cb) {
  $.ajax({
    url: this.host + this.prefix + this.endpoints.deleteFiles
  , method: 'DELETE'
  , data: {
      uuid: opt.uuid
    , token: opt.token
    , type: opt.type
    , name: opt.name
    , files: JSON.stringify(opt.files)
    }
  })
}

Client.prototype.listProject = function (opt, cb) {
  $.ajax({
    url: this.host + this.prefix + this.endpoints.listProject
  , method: 'GET'
  , data:{
      uuid: opt.uuid
    , token: opt.token
    , type: opt.type
    }
  , success: cb
  })
}

Client.prototype.listTpls = function (type, cb) {
  $.ajax({
    url: this.host + this.prefix + this.endpoints.listTpls
  , method: 'GET'
  , data:{
      type: type
    }
  , success: cb
  })
}

// export default Client
module.exports = Client
