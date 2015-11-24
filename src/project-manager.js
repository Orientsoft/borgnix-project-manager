"use strict"

let fs = require('fs-extra-promise')
  , _ = require('lodash')
  , path = require('path')
  , walk = require('walk')
  , utils = require('./utils')
  , ignore = require('ignore')
  , EventEmitter = require('events').EventEmitter
  , debug = require('debug')('debug')
  , DirMan = require('./dir')

const ERROR = {
  PROJECT_EXISTS: new Error('Project already exists')
, MISSING_PARAMETER: new Error('Missing parameters')
, PROJECT_NOT_FOUND: new Error('Project Not Found')
}

class ProjectManager extends EventEmitter {
  constructor(info) {
    super()
    this.projectDir = info.projectDir
    this.tplDir = info.tplDir
    this.store = info.store
    // this._loadProjects()
  }

  async _projectExists(info) {
    return await this.store.find(_.pick(info, ['name', 'owner', 'type']))
  }

  async createProject(info) {
    debug('inside create')
    if (await this._projectExists(info))
      throw ERROR.PROJECT_EXISTS

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
    , layout: {}
    }

    await fs.copyAsync(
      path.join(this.tplDir, info.type, info.tpl || 'default')
    , project.dir
    )

    let d = new DirMan(project.dir)
    for (var file of d.select(`/**/*${info.tpl}*`)) {
      await d.rename(file, file.replace(info.tpl, project.name))
    }
    project.layout = d.getJson(project.ignore)

    await fs.writeJsonAsync(
      path.join(project.dir, 'project.json')
    , _.pick(project, ['name', 'type', 'dir', 'owner', 'layout'])
    )

    return await this.store.add(project)
  }

  findProject(info) {
    return this.store.findOne(info)
  }

  async renameProject(info, newName) {
    if (!utils.checkKeys(info, ['name', 'owner', 'type']))
      throw ERROR.MISSING_PARAMETER

    if (await this._projectExists({name: newName, owner: info.owner, type: info.type}))
      throw ERROR.PROJECT_EXISTS

    let project = await this.findProject({name: info.name})
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    // let newDir = path.join(project.dir, '..', newName)
    // fs.rename(project.dir, newDir, function (err) {
    //   if (!err) {
    //     project.name = newName
    //     project.dir = newDir
    //   }
    //   utils.error(err, cb)
    // })
  }

  async deleteProject(info) {
    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    await fs.removeAsync(project.dir)
    return await this.store.delete(info)
  }
}

module.exports = ProjectManager
