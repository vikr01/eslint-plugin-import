const namedExports = require('./named-exports-es5')
// module.exports = {
//   __esModule: true,
//   foo: namedExports.a,
//   bar: namedExports.b,
//   baz: 'will it blend?',
// }

module.exports.__esModule = true
module.exports.foo = namedExports.a
module.exports.bar = namedExports.b
module.exports.baz = 'will it blend?'
