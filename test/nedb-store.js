'use strict'

let NedbStore = require('../src/store/nedb')
  , _ = require('lodash')
  , sinon = require('sinon')
  , chai = require('chai')
  , expect = chai.expect

let store

describe('NeDB Store', () => {
  describe('init', () => {
    it('should create a nedb store without error', () => {
      store = new NedbStore('./nedb/store-test')
    })
  })

  describe('add', () => {
    let projects = _.range(4).map((i)=>{
      return {
        name: 'test-' + i
      , type: 'arduino'
      , owner: 'uuid'
      , content: Date.now()
      }
    })
    it('should add 4 new projects without error', () => {
      store.add(projects, (err) => {
        expect(err).to.not.exists
      })
    })
  })

  describe('find', () => {
    it('should find a project named test-2', () => {
      store.find({name: 'test-2'}, (err, found) => {
        expect(err).to.not.exists
        expect(found).to.be.an.instanceof(Array)
        expect(found).to.have.length(1)
      })
    })

    it('should not find test-2 with wrong user', () => {
      store.find({name: 'test-2', user: 'wrong'}, (err, found) => {
        expect(err).to.not.exists
        expect(found).to.be.an.instanceof(Array)
        expect(found).to.have.length(0)
      })
    })
  })

  describe('update', () => {
    it('should update content of project test-2', () => {
      store.update({name: 'test-2'}, {content: 'changed'}, (err) => {
        expect(err).to.not.exists
        store.find({name: 'test-2'}, (findErr, found) => {
          expect(findErr).to.be.undefined
          expect(found).to.be.an.instanceof(Array)
          expect(found).to.have.length(1)
          expect(found[0].content).to.not.equal(projects[2].content)
        })
      })
    })

    it('should fail to update a non-existing project', () => {
      let wrongUpdate = {content: 'wrong_change'}
      store.update({name: 'test-2', user: 'wrong'}, wrongUpdate, (updateErr) => {
        expect(updateErr).to.not.exists
        store.find({name: 'test-2'}, (findErr, found) => {
          expect(findErr).to.be.undefined
          expect(found).to.be.an.instanceof(Array)
          expect(found).to.have.length(1)
          expect(found[0].content).to.not.equal(wrongUpdate.content)
        })
      })
    })
  })

  after(() => {
    store.delete({})
  })
})
