var express = require('express')
  , router = express.Router()
  , path = require('path')
  , _ = require('underscore')
  , bpm = require('./project')(path.join(__dirname, 'temp'))
  , validation = function () {
      return true
    }

// create new project
router.put('/project', function (req, res) {
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  bpm.newProject( req.query.uuid, req.query.type, req.query.name
                , function (err, project) {
    console.log('err', err)
    if (err) return res.json({status: 1, content: err.toString()})
    console.log('proj', project.toJson())
    res.json(project.toJson())
  })
})

// delete project
router.delete('/project', function (req, res) {
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  bpm.deleteProject( req.query.uuid, req.query.type, req.query.name
                , function (err) {
    console.log('err', err)
    if (err) return res.json({status: 1, content: err.toString()})
    else return res.json({status: 0})
  })
})

// get projects list
router.get('/projects', function (req, res) {
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  bpm.getProjects(req.query.uuid, req.query.type, function (err, projects) {
    console.log(err, projects)
    if (err) return res.json({status: 1, content: err})
    var send = projects.map(function (project) {
      return project.toJson()
    }, [])
    res.json(send)
  })
})

// save project files
router.post('/project/files', function (req, res) {
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  console.log(req.body, typeof req.body)
  var project = bpm.findProject(req.query.uuid, req.query.type, req.query.name)
  if (!project) return res.json({status: 1, content: 'Project not found'})
  console.log(project)
  project.saveFiles(req.body, function (err) {
    if (err) return res.json({status: 1, content: err})
    else return res.json({status: 0})
  })
})

router.delete('/project/files', function (req, res) {
  if (!validation(req.query.uuid, req.query.token))
    return res.send('unauthorized')
  var project = bpm.findProject(req.query.uuid, req.query.type, req.query.name)
  if (!project) return res.json({status: 1, content: 'Project not found'})
  project.deleteFiles(req.body, function (err) {
    if (err) return res.json({status: 1, content: err.toString()})
    else return res.json({status: 0})
  })
})

module.exports = function (auth) {
  if (_.isFunction(auth)) validation = auth
  return router
}
