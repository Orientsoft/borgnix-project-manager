"use strict"

let fs = require('fs-extra')
  , _ = require('lodash')
  , path = require('path')
  , walk = require('walk')
  , utils = require('./utils')
  , ignore = require('ignore')
  , EventEmitter = require('events').EventEmitter

class ProjectManager extends EventEmitter {
  constructor(info) {
    super()
    this.projectDir = info.projectDir
    this.tplDir = info.tplDir
    this.store = info.store
    // this._loadProjects()
  }

  createProject(info, cb) {
    console.log('inside create')
    this.store.find(_.pick(info, ['name', 'owner', 'type']), (err, found) => {
      // console.log(err, found)
      if (found.length > 0) utils.error('Project already exists', cb)
    })

    let project = {
      name: info.name
    , owner: info.owner
    , type: info.type
    , dir: path.join(this.projectDir, info.owner, info.type, info.name)
    , ignore: fs.readFileSync(
                path.join(this.tplDir, info.type, 'project.ignore')
              ).toString().split('\n').filter((pattern)=>{
                return pattern.length > 0
              })
    , files: []
    }

    let tplDir = path.join(this.tplDir, info.type, info.tpl || 'default')
    // console.log(tplDir)
    walk.walk(tplDir, {})
    .on('file', (root, fileStats, next)=>{
      let fileRoot = path.relative(root, tplDir)
        , fileName = fileStats.name.replace(info.tpl, project.name)
      // console.log(fileRoot, fileName, path.join(root, fileStats.name), path.join( project.dir, fileRoot, fileName))
      fs.copy(
        path.join(root, fileStats.name)
      , path.join( project.dir, fileRoot, fileName)
      , (err)=>{
          console.log('copy finished')
          if (!err) {
            project.files.push({
              root: fileRoot
            , name: fileName
            })
            next()
          }
          else utils.error(err, cb)
        }
      )
    })
    .on('end', ()=>{
      console.log('walking end')
      console.log(_.pick(project, 'name', 'type', 'owner', 'files'))
      fs.writeJson(
        path.join(project.dir, 'project.json')
      , _.pick(project, 'name', 'type', 'owner', 'ignore')
      , ()=>{
          this.store.add(project, cb)
        }
      )
    })
  }

  findProject(info, cb) {
    this.store.find(info, cb)
  }

  renameProject(info, newName, cb) {
    if (!utils.checkKeys(info, ['name', 'owner', 'type'])) {
      return utils.error('Missing parameters', cb)
    }
    if (this._findProject({name: newName})) {
      return utils.error('The new name is already taken', cb)
    }

    let project = this._findProject({name: info.name})
    if (!project) return utils.error('Project does not exists', cb)

    let newDir = path.join(project.dir, '..', newName)
    fs.rename(project.dir, newDir, function (err) {
      if (!err) {
        project.name = newName
        project.dir = newDir
        if (_.isFunction(cb)) cb(null)
      }
      else utils.error(err, cb)
    })
  }

  deleteProject(info, cb) {
    console.log('inside delete')
    let project = this.findProject(info)
    if (!project) return utils.error('Project does not exists', cb)
    console.log('to delete', project)
    fs.remove(project.dir, (err)=>{
      if (err) return utils.error(err, cb)
      // _.remove(this.projects, project)
      this.store.delete(info)
      console.log('removed')
      if (_.isFunction(cb)) cb(null)
      console.log(this.projects)
    })
  }

  getJson(info, cb) {
    let project = this._findProject(info)
    if (!project) return utils.error('Project does not exists')

    if (_.isFunction(cb)) cb (_.pick(project, ['name', 'type', 'owner', 'files']))
  }

  createFiles(info, files) {

  }

  deleteFiles(info, files) {

  }

  updateFiles(info, files) {

  }

  _findTpl(type, name) {

  }

  _findProject(info) {
    return utils.checkKeys(info, ['name', 'owner', 'type']) ?
               _.find(this.projects, info) : null
  }

  _loadProjects() {
    walk.walk(this.projectDir, {})
    .on('file', (root, fileStats, next)=>{
      if (fileStats.name === 'project.json') {
        this._loadProject(root, next)
      }
      else next()
    })
    .on('end', ()=>{
      this.emit('ready')
    })
  }

  _loadProject(dir, cb) {
    let project = fs.readJsonSync(path.join(dir, 'project.json'))
    project.files = []
    project.dir = dir
    let ig = ignore().addPattern(project.ignore)
    walk.walk(dir, {})
    .on('files', (root, fileStats, next)=>{
      project.files.concat(
        ig.filter(
          fileStats.map((file)=>{
            return path.relative(dir, path.join(root, file.name))
          })
        ).map((file)=>{
          return {
            name: path.basename(file)
          , root: path.dirname(file)
          }
        })
      )
      next()
    })
    .on('end', ()=>{
      this.projects.push(project)
      if (_.isFunction(cb)) cb()
    })
  }
}

module.exports = ProjectManager
