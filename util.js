var _ = require('underscore')

module.exports.call = function (fn) {
  var args = Array.prototype.slice.call(arguments).slice(1)
  if (_.isFunction(fn)) fn.apply(fn, args)
}
