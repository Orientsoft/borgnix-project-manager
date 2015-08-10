var express = require('express')
  , router = express.Router()
  , path = require('path')
  , _ = require('underscore')
  , BPM = require('./project')
  , bpm
  , validation = function () {
      return true
    }

// create new project
router.put('/project', function (req, res) {
  bpm.newProject( req.session.user.uid, req.body.type, req.body.name
                , function (err, project) {
    console.error('err', err)
    if (err) return res.json({status: 1, content: err.toString()})
    res.json(project.toJson())
  })
})

// delete project
router.delete('/project', function (req, res) {
  bpm.deleteProject( req.session.user.uid, req.body.type, req.body.name
                , function (err) {
    console.log('err', err)
    if (err) return res.json({status: 1, content: err.toString()})
    else return res.json({status: 0})
  })
})

// get projects list
router.get('/projects', function (req, res) {
  // console.log(req.body)
  res.setHeader('Last-Modified', (new Date()).toUTCString())
  bpm.getProjects(req.session.user.uid, req.query.type, function (err, projects) {
    // console.log(err, projects)
    if (err) return res.json({status: 1, content: err})
    var send = projects.map(function (project) {
      return project.toJson()
    }, [])
    // console.log(send)
    res.json(send)
  })
})

// save project files
router.post('/project/files', function (req, res) {
  // console.log(req.body.files, typeof req.body.files)
  var project = bpm.findProject(req.session.user.uid, req.body.type, req.body.name)
  if (!project) return res.json({status: 1, content: 'Project not found'})
  // console.log(project)
  // console.log(req.body)
  req.body.files = JSON.parse(req.body.files)
  // console.log(req.body.files)
  project.saveFiles(req.body.files, function (err, files) {
    project.files = files
    if (err) {
      console.error(err.stack)
      return res.json({status: 1, content: err.toString()})
    }
    else return res.json({status: 0})
  })
})

// delete project files
router.delete('/project/files', function (req, res) {
  console.log('***', req.body)
  var project = bpm.findProject(req.session.user.uid, req.body.type, req.body.name)
  if (!project) return res.json({status: 1, content: 'Project not found'})
  project.deleteFiles(JSON.parse(req.body.files), function (err) {
    if (err) return res.json({status: 1, content: err.toString()})
    else return res.json({status: 0})
  })
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

  bpm = new BPM(opt)
  if (_.isFunction(opt.auth)) validation = config.auth
  return router
}
