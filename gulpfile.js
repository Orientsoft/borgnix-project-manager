var gulp = require('gulp')
  , minimist = require('minimist')
  , request = require('request')

var argv = minimist(process.argv.slice(2))

console.log(argv)

gulp.task('test', function () {
  switch (argv.m) {
    case 'new-project':
      console.log('TEST: create new project')
      request.put({ url: 'http://127.0.0.1:3000/p/project'
                  , qs: {
                      uuid: argv.u || 'uuid'
                    , token: 'token'
                    , type: argv.t || 'arduino'
                    , name: argv.n || 'remote-sketch2'
                  }}, function (err, res, body) {
        if (err) return console.error(err)
        console.log(body)
      })
      break
    case 'del-project':
      request.del({ url: 'http://127.0.0.1:3000/p/project'
                  , qs: {
                      uuid: 'uuid'
                    , token: 'token'
                    , type: 'arduino'
                    , name: argv.n || 'remote-sketch2'
                  }}, function (err, res, body) {
        console.log(body)
      })
      break
    default:
      console.log('unknown test')
      break
  }
})
