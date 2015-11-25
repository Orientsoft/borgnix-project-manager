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

    var project = await pm.findProject({
      name: 'atest', 'type': 'arduino', 'owner': 'uuid'
    })

    var files = [
      {name: 'in_root.ino', content: ''}
    , {name: 'sub/in_sub.ino', content: ''}
    , {name: 'to_delete.ino', content: ''}
    ]

    await pm.createFiles(project, files)

    await pm.updateFiles(project, {
      name: 'in_root.ino'
    , content: 'changed'
    })
    await pm.createDirs(project, ['new_dir', 'dir_to_delete'])

    await pm.deleteFiles(project, ['to_delete.ino', 'dir_to_delete'])
  } catch (e) {
    console.log('ERROR', e)
  }






}

Main()
