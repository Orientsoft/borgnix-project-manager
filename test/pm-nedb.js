'use strict'

let ProjectManager = require('../src/project-manager')
  , NedbStore = require('../src/store/nedb')
  , path = require('path')
  , chai = require('chai')
  , expect = chai.expect

let pm, store

describe('Project manager with nedb store', () => {
  describe('init', () => {
    it('should init without error', (done) => {
      // console.log(done)
      store = new NedbStore('./nedb/pm-test')
      store.start(() => {
        pm = new ProjectManager({
          projectDir: path.join(__dirname, '../temp')
        , tplDir: path.join(__dirname, '../project-tpl')
        , store: store
        })
        done()
      })
    })
  })

  describe('add', () => {
    it('should create a project without error', (done) => {
      let project = {
        name: 'test'
      , type: 'arduino'
      , owner: 'uuid'
      , tpl: 'default'
      }
      pm.createProject(project, (err) => {
        console.log('done')
        expect(err).to.not.exists
        done()
      })
    })
  })

  describe('delete', () => {
    it('should delete the project test', (done) => {
      let project = {
        name: 'test'
      , type: 'arduino'
      , owner: 'uuid'
      }
      pm.deleteProject(project, (err) => {
        expect(err).to.not.exists
        console.log('finishing delete', err)
        done()
      })
    })
  })

  after(() => {
    store.delete({})
  })
})
