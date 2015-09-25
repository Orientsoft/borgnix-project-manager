// var _ = require('lodash')

module.exports.error = function (err, cb) {
  err = err instanceof Error ? err : new Error(err.toString())
  if (cb instanceof Function)
    cb(err)
  else
    throw err
}

module.exports.checkKeys = function (obj, keys) {
  return keys.reduce((valid, key)=>{
    return valid && obj[key]
  }, true)
}
