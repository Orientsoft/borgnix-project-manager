'use strict'

let path = require('path')
  , fsp = require('fs-extra-promise')
  , fs = require('fs')
  , glob = require('glob')
  , ignore = require('ignore')

class DirMan {
  constructor(root) {
    this.root = root
    fsp.mkdirpSync(root)
  }

  select(selector, opts) {
    opts = opts || {}
    opts.root = this.root
    return glob.sync(selector, opts)
  }

  update(filename, newContent) {
    return fsp.outputFileAsync(path.join(this.root, filename), newContent)
  }

  remove(selector) {
    return fsp.removeAsync(path.join(this.root, selector))
  }

  rename(oldName, newName) {
    return fsp.moveAsync(
      path.resolve(this.root, oldName)
    , path.resolve(this.root, newName)
    )
  }

  createFile(filename, content) {
    return fsp.outputFileAsync(path.join(this.root, filename), content)
  }

  createDir(dirname) {
    return fsp.mkdirpAsync(path.join(this.root, dirname))
  }

  getContent(filename) {
    return fs.readFileSync(filename).toString()
  }

  getJson(ignorePattern) {
    return directoryTree(this.root, [], ignorePattern)
  }
}

function directoryTree(basepath, extensions, ignorePattern) {
  var _directoryTree = function (name, extensions) {
    var stats = fs.statSync(name)
    var item = {
      path: path.relative(basepath, name),
      name: path.basename(name)
    }

    if (stats.isFile()) {
      if (extensions &&
        extensions.length > 0 &&
        extensions.indexOf(path.extname(name).toLowerCase()) == -1) {
        return null
      }
      item.type = 'file'
    } else {
      item.type = 'directory'
      item.children = fs.readdirSync(name)
      .filter(ignore({}).addPattern(ignorePattern).createFilter())
      .map(function (child) {
        return _directoryTree(path.join(name, child), extensions)
      })
    }

    return item
  }
  return _directoryTree(basepath, extensions)
}

module.exports = DirMan
