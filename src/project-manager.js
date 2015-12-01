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
  }

  async _projectExists(info) {
    return await this.store.findOne(_.pick(info, ['name', 'owner', 'type']))
  }

  async _updateProjectJson(project) {
    debug('inside _updateProjectJson', path.join(project.dir, 'project.json'))
    await fs.writeJsonAsync(
      path.join(project.dir, 'project.json')
    , _.pick(project, ['name', 'type', 'dir', 'owner', 'layout'])
    )
  }

  async _updateProject(project) {
    debug('inside _updateProject', project)
    let d = new DirMan(project.dir)
    project.layout = d.getJson(project.ignore)
    this._updateProjectJson(project)
    await this.store.update(
      _.pick(project, ['name', 'type', 'owner'])
    , project
    )
  }

  async createProject(info) {
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
    for (var file of d.select(`/**/*${info.tpl}*`))
      await d.rename(file, file.replace(info.tpl, project.name))

    project.layout = d.getJson(project.ignore)

    await this._updateProjectJson(project)

    return await this.store.add(project)
  }

  findProject(info) {
    info = _.pick(info, ['name', 'type', 'owner'])
    return this.store.findOne(info)
  }

  findProjects(info) {
    info = _.pick(info, ['name', 'type', 'owner'])
    return this.store.find(info)
  }

  async deleteProject(info) {
    debug('inside delete')
    info = _.pick(info, ['name', 'type', 'owner'])
    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    await fs.removeAsync(project.dir)
    return await this.store.delete(info)
  }

  // TODO: Add renameProject(info, newName)

  async createFiles(info, files) {
    info = _.pick(info, ['name', 'type', 'owner'])
    files = files instanceof Array ? files : [files]

    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    let d = new DirMan(project.dir)
    for (var file of files)
      await d.createFile(file.path, file.content)

    await this._updateProject(project)
  }

  async createDirs(info, dirs) {
    info = _.pick(info, ['name', 'type', 'owner'])
    dirs = dirs instanceof Array ? dirs : [dirs]

    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    let d = new DirMan(project.dir)
    for (var dir of dirs)
      await d.createDir(dir)

    await this._updateProject(project)
  }

  async deleteFiles(info, files) {
    info = _.pick(info, ['name', 'type', 'owner'])
    files = files instanceof Array ? files : [files]

    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    let d = new DirMan(project.dir)
    for (var file of files)
      await d.remove(file)

    await this._updateProject(project)
  }

  async updateFiles(info, files) {
    info = _.pick(info, ['name', 'type', 'owner'])
    files = files instanceof Array ? files : [files]

    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    let d = new DirMan(project.dir)
    for (var file of files)
      await d.update(file.path, file.content)
  }

  async getFiles(info) {
    info = _.pick(info, ['name', 'type', 'owner'])
    let project = await this.findProject(info)
    if (!project)
      throw ERROR.PROJECT_NOT_FOUND

    let d = new DirMan(project.dir)
    return d.select('/**', {nodir: true})
      .filter(ignore().addPattern(project.ignore).createFilter())
      .map((filename) => {
        return {
          path: path.relative(project.dir, filename)
          , content: d.getContent(filename)
        }
      })
  }

  getTemplates(type) {
    return fs.readdirSync(path.join(this.tplDir, type)).filter((dir) => {
      return dir !== 'project.ignore'
    })
  }

  // TODO: Add renameFile(info, file, newName)
}

module.exports = ProjectManager
