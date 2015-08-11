var fs = require('fs-extra')
  , path = require('path')
  , _ = require('lodash')
  , butil = require('./util')
  , ignore = require('ignore')
  , walk = require('walk')
  , deepcopy = require('deepcopy')

require('shelljs/global')

var Project = function (pm, uuid, type, name, tpl) {
  var self = this

  _.assign(self, {
    dir: path.join(pm.root, uuid, type, name)
  , configFile: path.join(pm.root, uuid, type, name, 'project.json')
  , name: name
  , type: type
  , owner: uuid
  , ignore: ['project.json']
  , pm: pm
  })

  if (!fs.existsSync(self.dir)) {
    // console.log('tpl is', tpl)
    tpl = _.isString(tpl) ? tpl : 'default'
    if (tpl !== 'default')
      tpl = fs.existsSync(path.join(pm.tplDir, type, tpl)) ? tpl : 'default'

    var tplDir = path.join(pm.tplDir, type, tpl)

    // console.log('tpldir is', tplDir)
    fs.copySync(tplDir, self.dir)
    // fs.renameSync(path.join(tplDir))
    fs.readdirSync(self.dir).map(function(filename) {
      if (_.contains(filename, tpl))
        fs.renameSync( path.join(self.dir, filename)
                     , path.join(self.dir, filename.replace(tpl, name)))
    })
  }

  if (!fs.existsSync(self.configFile)) {
    self.init()
    fs.writeFileSync(self.configFile, self.toJsonString())
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

  _.set(pm, 'projects.' + uuid + '.' + type + '.' + name, self)
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
    file.root = file.root || ''
    file.content = fs.readFileSync(path.join(self.dir, file.root, file.name))
                     .toString()
  }
  self.files = files

  butil.call(cb, null, files)
}

Project.prototype.saveFiles = function (files, cb) {
  try {
    if (!_.isArray(files)) files = [files]
    var oldFiles = this.files.map(function (file) {
      return file.name
    }, [])
    for (var file of files) {
      file.root = file.root || ''
      var filePath = path.join(this.dir, file.root, file.name)
      // this.files.push(file)
      if (oldFiles.indexOf(file.name) === -1) {
        // console.log(oldFiles, file.name)
        this.files.push(file)
      }
      fs.mkdirsSync(path.join(this.dir, file.root))
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
      console.log('*** DELETE', path.join(this.dir, file.root || '', file.name))
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

Project.prototype.init = function (tpl) {
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

Project.prototype.initArduino = function (tpl) {
  this.arduino = {}
  // this.arduino.inoTpl = path.join(__dirname, 'test', 'tpl.ino')
  // fs.copySync(this.arduino.inoTpl, path.join(this.dir, this.name+'.ino'))
  this.ignore.push('makefile')
  this.ignore.push('build*')
}

var BPM = function (opt) {
  _.extend(this, opt)
  this.root = opt.root ? opt.root : path.join(__dirname, 'temp')
  this.tplDir = opt.tplDir ? opt.tplDir : path.join(__dirname, 'project-tpl')
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

BPM.prototype.newProject = function (uuid, type, name, tpl, cb) {
  if (!uuid) return butil.call(cb, new Error('uuid required'))
  if (!type) return butil.call(cb, new Error('type required'))
  if (!name) return butil.call(cb, new Error('name required'))
  if (_.isFunction(tpl)) cb = tpl
  var dir = path.join(this.root, uuid, type, name)

  if (fs.existsSync(dir))
    return butil.call(cb, new Error('project already exists'))
  butil.call(cb, null, new Project(this, uuid, type, name, tpl))
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
    if (this.projects[uuid][type][name]) {
      return this.projects[uuid][type][name]
    }
  }
  catch (e) {}

  if (fs.existsSync(path.join(this.root, uuid, type, name))) {
    return new Project(this, uuid, type, name)
  }
  else {
    return null
  }
}

BPM.prototype.getProjects = function (uuid, types, cb) {
  var self = this
  var projects = []
  if (!_.isArray(types)) types = [types]

  try {
    for (var type of types) {
      var root = path.join(this.root, uuid, type)

      if (type === 'arduino') {
        if (!fs.existsSync(path.join(root, 'libraries'))) {
          this.initArduinoDir(uuid)
        }
      }

      fs.readdirSync(root).forEach(function (name) {
        if (fs.statSync(path.resolve(root, name)).isDirectory()) {
          if (type === 'arduino' && name === 'libraries') return null
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
    console.error(e)
    butil.call(cb, e)
  }
}

BPM.prototype.deleteFiles = function (uuid, type, name, files, cb) {
  var project = this.findProject(uuid, type, name)
  project.deleteFiles(files, cb)
}

BPM.prototype.initArduinoDir = function (uuid) {
  var self = this

  var root = path.join(this.root, uuid, 'arduino/libraries')
  fs.mkdirsSync(root)
  fs.readdirSync(this.arduinoLibs).map(function (file) {
    if (fs.statSync(path.join(self.arduinoLibs, file)).isDirectory()) {
      if (file[0] === '.') return null
      ln('-s', path.join(self.arduinoLibs, file), path.join(root, file))
    }
  })
  return null
}

BPM.prototype.getTpls = function (type) {
  var tpls = fs.readdirSync(path.join(this.tplDir, type)).map(function (dir) {
    return { name: dir }
  })
  return tpls
}

module.exports = BPM
