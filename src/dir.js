'use strict'

let path = require('path')
  , fsp = require('fs-extra-promise')
  , fs = require('fs')
  , glob = require('glob')
  // , dirTree = require('directory-tree').directoryTree
  , ignore = require('ignore')

class DirMan {
  constructor(root) {
    this.root = root
    fsp.mkdirpSync(root)
  }

  select(selector, opts) {
    console.log('inside select', selector)
    opts = opts || {}
    opts.root = this.root
    console.log(opts.root)
    return glob.sync(selector, opts)
  }

  updateFile(filename, newContent, cb) {
    fsp.outputFile(path.join(this.root, filename), newContent, cb)
  }

  remove(selector, cb) {
    fsp.remove(path.join(this.root, selector), cb)
  }

  rename(oldName, newName, cb) {
    return fsp.moveAsync(
      path.resolve(this.root, oldName)
    , path.resolve(this.root, newName)
    )
  }

  createFile(filename, content, cb) {
    fsp.outputFile(path.join(this.root, filename), content, cb)
  }

  createDir(dirname, cb) {
    fsp.mkdirp(path.join(this.root, dirname), cb)
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
