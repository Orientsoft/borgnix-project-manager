// 'use strict'
//
// // process.exit(0)
//
// let ProjectManager = require('../src/project-manager')
//   , path = require('path')
//   , MemoryStore = require('../src/store/memory')
//   , expect = require('chai').expect
//   , _ = require('lodash')
//
// let ms = new MemoryStore()
//
// describe('Store', function () {
//   describe('init', function () {
//     it('should have an empty projects list', function () {
//       expect(ms.projects).to.be.empty
//     })
//   })
//
//   describe('add', function () {
//     it('should add 4 new projects', function () {
//       let projects = _.range(4).map(function (i) {
//         let project = {
//           name: 'test-' + i
//         , type: 'arduino'
//         , owner: 'uuid'
//         , content: Date.now()
//         }
//         ms.add(project)
//         return project
//       })
//
//       for (let project of projects)
//         expect(ms.projects).to.include(project)
//
//       expect(ms.projects.length).to.be.equal(4)
//     })
//   })
//
//   describe('find', function () {
//     it('should find a project named test-2', function () {
//       expect(ms.find({name: 'test-2'})).to.not.be.undefined
//     })
//     it('should not find a project test-2 with the wrong type', function () {
//       expect(ms.find({name: 'test-2', 'type': 'js'})).to.be.undefined
//     })
//   })
//
//   describe('update', function () {
//     it('should change the type of project test-2', function () {
//       ms.update({name: 'test-2'}, {type: 'changed'})
//       expect(ms.find({name: 'test-2'}).type).to.be.equal('changed')
//     })
//   })
//
//   describe('delete', function () {
//     it('should delete a project named test-2', function () {
//       ms.delete({name: 'test-2'})
//       expect(ms.find({name: 'test-2'})).to.be.undefined
//       expect(ms.projects.length).to.be.equal(3)
//     })
//   })
// })
