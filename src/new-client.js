import $ from 'jquery'

class Client {
  constructor(opts) {
    this.host = opts.host || 'localhost'
    this.prefix = opts.prefix || ''
  }

  _jsonReq(method, name, opts) {
    return $.ajax({
      url: this._url(name)
    , method: method
    , data: JSON.stringify(opts)
    , contentType: 'application/json'
    })
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

  listTpls(opts) {
    return $.ajax({
      url: this._url('listTpls')
    , method: 'GET'
    , data: opts
    })
  }

  createProject(opts) {
    return this._jsonReq('PUT', 'createProject', opts)
  }

  deleteProject(opts) {
    return this._jsonReq('DELETE', 'deleteProject', opts)
  }

  createFile(opts) {
    return this._jsonReq('PUT', 'createFiles', opts)
  }

  updateFiles(opts) {
    return this._jsonReq('POST', 'updateFiles', opts)
  }

  deleteFiles(opts) {
    return this._jsonReq('DELETE', 'deleteFiles', opts)
  }

  createDirs(opts) {
    return this._jsonReq('PUT', 'createDirs', opts)
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
