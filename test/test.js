var path = require('path')
  , request = require('request')
  , querystring = require('querystring')

// request.put({ url: 'http://127.0.0.1:3000/p/project'
//             , qs: {
//                 uuid: 'uuid'
//               , token: 'token'
//               , type: 'arduino'
//               , name: 'remote-sketch2'
//             }}, function (err, res, body) {
//   console.log(body)
// })

// var newFile = {
//   root: ''
// , name: 'newFile.cpp'
// , content: 'hello world'
// }
// request.post({ url: 'http://127.0.0.1:3000/p/project'
//             , qs: {
//                 uuid: 'uuid'
//               , token: 'token'
//               , type: 'arduino'
//               , name: 'remote-sketch3'
//               }
//             , body: newFile
//             , json: true}, function (err, res, body) {
//
// })

// request.get({ url: 'http://127.0.0.1:3000/p/projects'
//             , qs: {
//                 uuid: 'uuid'
//               , token: 'token'
//               , type: 'arduino'
//               , name: 'remote-sketch2'
//             }}, function (err, res, body) {
//   console.log(body)
// })

var delFile = {
  root: ''
, name: 'newFile.cpp'
}
request.del({ url: 'http://127.0.0.1:3000/p/project/files'
            , qs: {
                uuid: 'uuid'
              , token: 'token'
              , type: 'arduino'
              , name: 'remote-sketch3'
            }
            ,body: delFile
            , json: true}, function (err, res, body) {
  console.log(body)
})


// request.del({ url: 'http://127.0.0.1:3000/p/project/files'
//             , qs: {
//                 uuid: 'uuid'
//               , token: 'token'
//               , type: 'arduino'
//               , name: 'remote-sketch2'
//             }}, function (err, res, body) {
//   console.log(body)
// })

// var bpm = require('../project')(path.join(__dirname, '..', 'temp'))
