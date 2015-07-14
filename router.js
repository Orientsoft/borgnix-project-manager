var express = require('express')
  , router = express.Router()
  , path = require('path')
  , _ = require('underscore')
  , BPM = require('./project')
  , bpm = new BPM(path.join(__dirname, 'temp'))
  , validation = function () {
      return true
    }

bpm.arduinoLibs = '/Users/eddie/Documents/Arduino/libraries'

// create new project
router.put('/project', function (req, res) {
  if (!validation(req.body.uuid, req.body.token))
    return res.send('unauthorized')
  bpm.newProject( req.body.uuid, req.body.type, req.body.name
                , function (err, project) {
    console.error('err', err)
    if (err) return res.json({status: 1, content: err.toString()})
    // console.log('proj', project.toJson())
    res.json(project.toJson())
  })
})

// delete project
router.delete('/project', function (req, res) {
  if (!validation(req.body.uuid, req.body.token))
    return res.send('unauthorized')
  bpm.deleteProject( req.body.uuid, req.body.type, req.body.name
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
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  bpm.getProjects(req.query.uuid, req.query.type, function (err, projects) {
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
  if (!validation(req.body.uuid, req.body.token))
    return res.send('unauthorized')
  // console.log(req.body.files, typeof req.body.files)
  var project = bpm.findProject(req.body.uuid, req.body.type, req.body.name)
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
  if (!validation(req.body.uuid, req.body.token))
    return res.send('unauthorized')
  console.log('***', req.body)
  var project = bpm.findProject(req.body.uuid, req.body.type, req.body.name)
  if (!project) return res.json({status: 1, content: 'Project not found'})
  project.deleteFiles(JSON.parse(req.body.files), function (err) {
    if (err) return res.json({status: 1, content: err.toString()})
    else return res.json({status: 0})
  })
})

module.exports = function (auth) {
  if (_.isFunction(auth)) validation = auth
  return router
}
