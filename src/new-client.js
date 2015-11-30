import $ from 'jquery'

class Client {
  constructor(opts) {
    this.host = opts.host || 'localhost'
    this.prefix = opts.prefix || ''
  }

  _url(action) {
    return this.prefix + Client.endpoints[action]
  }

  listProjects(opts) {
    return $.ajax({
      url: this._url('listProjects')
    , method: 'GET'
    , data: opts
    })
  }

  createProject(opts) {
    return $.ajax({
      url: this._url('createProject')
    , method: 'PUT'
    , data: JSON.stringify(opts)
    , contentType: 'application/json'
    })
  }

  deleteProject(opts) {
    return $.ajax({
      url: this._url('deleteProject')
    , method: 'DELETE'
    , data: JSON.stringify(opts)
    , contentType: 'application/json'
    })
  }

  createFile(opts) {
    return $.ajax({
      url: this._url('createFiles')
    , method: 'PUT'
    , data: JSON.stringify(opts)
    , contentType: 'application/json'
    })
  }
}

Client.endpoints = {
  createProject: '/project'
, deleteProject: '/project'
, listProjects: '/projects'
, createFiles: '/project/files'
, deleteFiles: '/project/files'
, updateFiles: '/project/files'
, createDirs: '/project/dirs'
, listTpls: '/templates'
}

export default Client
