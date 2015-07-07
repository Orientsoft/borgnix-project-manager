var fs = require('fs-extra')
  , path = require('path')
  , _ = require('underscore')
  , butil = require('./util')
  , ignore = require('ignore')
  , walk = require('walk')
  , deepcopy = require('deepcopy')

var Project = function (pm, uuid, type, name) {
  console.log('inside')
  var self = this

  self.dir = path.join(pm.root, uuid, type, name)
  self.configFile = path.join(self.dir, 'project.json')
  self.name = name
  self.type = type
  self.owner = uuid
  self.ignore = ['project.json']
  self.pm = pm

  if (!fs.existsSync(self.dir)) {
    fs.mkdirsSync(self.dir)
  }

  if (!fs.existsSync(self.configFile)) {
    fs.writeFileSync(self.configFile, self.toJsonString())
    self.init()
  }
  else {
    var config = require(self.configFile)
    _.extend(self, config)
    fs.writeFileSync(self.configFile, self.toJsonString())
  }

  self.files = self.getFileNames()
  self.getFiles(function (err, files) {
    // self.files = files
    if (err) console.error(err)
  })

  if (!pm.projects[uuid]) pm.projects[uuid] = {}
  if (!pm.projects[uuid][type]) pm.projects[uuid][type] = {}
  pm.projects[uuid][type][name] = self
}

Project.prototype.delete = function (cb) {
  this.pm.deleteProject(this.owner, this.type, this.name)
}

Project.prototype.toJson = function (cb) {
  return _.omit(this, ['dir', 'configFile', 'pm'])
}

Project.prototype.toJsonString = function () {
  return JSON.stringify(_.omit(this, ['dir', 'configFile', 'pm']))
}

Project.prototype.getFileNames = function (cb) {
  console.log(this.ignore)
  var self = this
    , ig = ignore().addPattern(self.ignore)
    , files = []
    , options = {
        listeners: {
          file: function (root, stat, next) {
            var relativePath = path.join( path.relative(self.dir, root)
                                        , stat.name)
            if (ig.filter([relativePath]).length === 0) return next()
            var file = {
              root: path.relative(self.dir, root)
            , name: stat.name
            }
            files.push(file)
            next()
          }
        , errors: function (root, nodeStatArray, next) {
            console.log('error in walking')
            next()
          }
        }
      }
    , walker = walk.walkSync(self.dir, options)

    return files
}

Project.prototype.getFiles = function (cb) {
  var self = this
    , files = deepcopy(self.files)

  for (var file of files) {
    file.content = fs.readFileSync(path.join(self.dir, file.root || '', file.name))
                     .toString()
  }
  self.files = files

  butil.call(cb, null, files)
}

Project.prototype.saveFiles = function (files, cb) {
  try {
    if (!_.isArray(files)) files = [files]
    for (var file of files) {
      var filePath = path.join(this.dir, file.root || '', file.name)
      fs.mkdirsSync(path.join(this.dir, file.root || ''))
      fs.writeFileSync(filePath, file.content)
    }
    // butil.call(cb, null)
    this.getFiles(cb)
  }
  catch (e) {
    butil.call(cb, e)
  }
}

Project.prototype.deleteFiles = function (files, cb) {
  try {
    if (!_.isArray(files)) files = [files]
    for (var file of files) {
      fs.deleteSync(path.join(this.dir, file.root || '', file.name))
    }
    this.files = this.getFileNames()
    // butil.call(cb, null)
    this.getFiles(cb)
  }
  catch (e) {
    butil.call(cb, e)
  }
}

Project.prototype.init = function () {
  console.log('INIT', this.type)
  switch (this.type) {
    case 'arduino':
      return this.initArduino()
      break
    default:
      return
      break
  }
}

Project.prototype.initArduino = function () {
  this.arduino = {}
  this.arduino.inoTpl = path.join(__dirname, 'test', 'tpl.ino')
  fs.copySync(this.arduino.inoTpl, path.join(this.dir, this.name+'.ino'))
  this.ignore.push('makefile')
  this.ignore.push('build*')
}

var BPM = function (root) {
  this.root = root ? root : __dirname
  this.projects = {}
}

BPM.prototype.Project = Project

BPM.prototype.loadConfig = function (cofigFile, cb) {
  try {
    var config = rquire(configFile)
    _.extends(this, config)
    butil.call(cb, null)
  }
  catch (e) {
    butil.call(cb, e)
  }
}

BPM.prototype.newProject = function (uuid, type, name, cb) {
  if (!uuid) return butil.call(cb, new Error('uuid required'))
  if (!type) return butil.call(cb, new Error('type required'))
  if (!name) return butil.call(cb, new Error('name required'))
  var dir = path.join(this.root, uuid, type, name)
  if (fs.existsSync(dir))
    return butil.call(cb, new Error('project already exists'))
  butil.call(cb, null, new Project(this, uuid, type, name))
}

BPM.prototype.deleteProject = function (uuid, type, name, cb) {
  if (!uuid) return butil.call(cb, new Error('uuid required'))
  if (!type) return butil.call(cb, new Error('type required'))
  if (!name) return butil.call(cb, new Error('name required'))
  var dir = path.join(this.root, uuid, type, name)
  var project = this.findProject(uuid, type, name)
  if (!project) return butil.call(cb, new Error('project not found'))
  fs.remove(project.dir, cb)
}

BPM.prototype.findProject = function (uuid, type, name) {
  try {
    if (this.projects[uuid][type][name])
      return this.projects[uuid][type][name]
  }
  catch (e) {
    if (fs.existsSync(path.join(this.root, uuid, type, name)))
      return new Project(this, uuid, type, name)
  }


}

BPM.prototype.getProjects = function (uuid, types, cb) {
  var self = this
  var projects = []
  if (!_.isArray(types)) types = [types]

  try {
    for (var type of types) {
      var root = path.join(this.root, uuid, type)
      fs.readdirSync(root).forEach(function (name) {
        if (fs.statSync(path.resolve(root, name)).isDirectory()) {
          if (self.findProject(uuid, type, name))
            projects.push(self.findProject(uuid, type, name))
          else
            projects.push(new Project(self, uuid, type, name))
        }
      })
    }
    butil.call(cb, null, projects)
  }
  catch (e) {
    butil.call(cb, e)
  }
}

module.exports = BPM
