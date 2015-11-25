'use strict'

var express = require('express')
  , path = require('path')
  , _ = require('lodash')
  , NedbStore = require('./store/nedb')

  , ProjectManager = require('./project-manager')

var router = express.Router()
  , pm
  , validation = function () {
      return true
    }

// TODO: add template response

// create new project
router.put('/project', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  , tpl: req.body.tpl
  }
  try {
    let project = await pm.createProject(info)
    project.files = await pm.getFiles(project)
    res.json({status: 0, content: _.omit(project, ['_id', 'dir', 'ignore'])})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }

})

// delete project
router.delete('/project', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    await pm.deleteProject(info)
    res.json({status: 0})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// get projects list
router.get('/projects', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  }
  try {
    let projects = await pm.findProjects(info)
    for (let project of projects) {
      project.files = await pm.getFiles(project)
    }
    res.json({status: 0, content: projects})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// create new files
router.put('/project/files', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    await pm.createFiles(info, req.body.files)
    res.json({status: 0})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// create new directories
router.put('/project/dirs', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    await pm.createDirs(info, req.body.dirs)
    res.json({status: 0})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// update files
router.post('/project/files', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    await pm.updateFiles(info, req.body.dirs)
    res.json({status: 0})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// delete files/directory
router.delete('/project/files', async function (req, res) {
  let info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    await pm.deleteFiles(info, req.body.dirs)
    res.json({status: 0})
  } catch (e) {
    console.log(e.stack)
    res.json({status: 1, content: e.toString()})
  }
})

// get templates
router.get('/templates', function (req, res) {
  // IMPORTTANT
  // TODO: check req.body.type to prevent insertion attack
  if (req.body.type) {
    res.json({status: 0, content: pm.getTemplates(req.body.type)})
  } else {
    res.json({status: 1})
  }
})

module.exports = function (config) {
  var opt = {}
  if (config.projectRoot)
    opt.root = config.projectRoot
  else
    throw new Error('config.projectRoot is missing')

  if (config.arduinoLibs)
    opt.arduinoLibs = config.arduinoLibs
  else
    throw new Error('config.arduinoLibs is missing')

  var store = new NedbStore('nedb/projects')

  pm = new ProjectManager({
    projectDir: config.projectRoot
  , tplDir: path.join(__dirname, '../project-tpl')
  , store: store
  })

  if (_.isFunction(opt.auth)) validation = config.auth
  return router
}
