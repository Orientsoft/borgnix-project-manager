'use strict'

let ProjectManager = require('../lib/project-manager')
  , NedbStore = require('../lib/store/nedb')
  , path = require('path')
  , chai = require('chai')
  , expect = chai.expect
  , debug = require('debug')('debug')

let pm, store

describe('Project manager with nedb store', () => {
  describe('init', () => {
    it('should init without error', (done) => {
      // debug(done)
      store = new NedbStore('./nedb/pm-test')
      pm = new ProjectManager({
        projectDir: path.join(__dirname, '../temp')
      , tplDir: path.join(__dirname, '../project-tpl')
      , store: store
      })
      done()
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
      pm.createProject(project).then(() => {
        done()
      }).catch((err) => {
        throw err
        done()
      })
    })
  })

  describe('find', () => {
    it('should find the project named test', (done) => {
      pm.findProject({name: 'test', type: 'arduino', owner: 'uuid'}).then((res) => {
        expect(res).to.exists
        done()
      }).catch((err) => {
        throw err
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
      pm.deleteProject(project).then((res) => {
        console.log('delete finished', res)
        done()
      }).catch((err) => {
        throw err
        done()
      })
    })
  })

  after(() => {
    store.delete({})
  })
})
