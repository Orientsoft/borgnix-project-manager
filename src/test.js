'use strict'

var NedbStore = require('./store/nedb')
  , ProjectManager = require('./project-manager')
  , path = require('path')

var store = new NedbStore('../test/nedb/api-test')


var pm = new ProjectManager({
  projectDir: path.join(__dirname, '../temp')
, tplDir: path.join(__dirname, '../project-tpl')
, store: store
})

async function Main() {
  try {
    await pm.deleteProject({
      name: 'atest', 'type': 'arduino', 'owner': 'uuid'
    })
    await pm.createProject({
      name: 'atest', type: 'arduino', 'owner': 'uuid', tpl: 'default'
    })

    var doc = await pm.findProject({
      name: 'atest', 'type': 'arduino', 'owner': 'uuid'
    })

    console.log('OH', doc)
  } catch (e) {
    console.log('ERROR', e)
  }






}

Main()
