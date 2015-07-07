import $ from 'jquery'

var Client = function (opt) {
  this.host = opt.host
  this.prefix = opt.prefix || ''
  this.endpoints = {
    newProject: '/project'
  , deleteProject: '/project'
  , listProject: '/projects'
  , saveFiles: '/project/files'
  , deleteFiles: '/project/files'
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
    }
  , success: cb
  })
}

Client.prototype.deleteProject = function (opt, cb) {
  // body...
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
  // body...
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

export default Client