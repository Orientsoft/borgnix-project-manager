var path = require('path')


var ALM = require('./libraries')
  , Library = ALM.Library

var bpm = require('./project')(__dirname)

// bpm.getProjects('uuid', ['arduino'], function (projects) {
//   var project = bpm.findProject('uuid', 'arduino', 'sketch-example')
//   console.log(project)
//   project.getFiles(function (err, files) {
//     if (err) return console.error(err)
//     var newFile = files[0]
//     newFile.content = Date.now().toString()
//     project.saveFiles(newFile)
//   })
//   bpm.newProject('uuid', 'arduino', 'new-sketch', function (err) {
//     if (err) return console.error(err)
//   })
// })

// bpm.newProject('uuid', 'arduino', 'new-sketch', function (err, project) {
//   if (err) return console.error(err)
//   console.log(project)
// })

bpm.deleteProject('uuid', 'arduino', 'new-sketch', function (err) {
  if (err) console.error(err)
})
