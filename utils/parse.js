"use strict"
exports.__esModule = true

const assign = require('object-assign')
const moduleRequire = require('./module-require').default

exports.default = function parse(content, context) {

  if (context == null) throw new Error("need context to parse properly")

  let parserOptions = context.parserOptions
    , parserPath = context.parserPath

  if (!parserPath) throw new Error("parserPath is required!")

  // hack: espree blows up with frozen options
  parserOptions = assign({}, parserOptions)
  parserOptions.ecmaFeatures = assign({}, parserOptions.ecmaFeatures)

  // always attach comments
  parserOptions.attachComment = true

  // require the parser relative to the main module (i.e., ESLint)
  const parser = moduleRequire(parserPath)

  return parser.parse(content, parserOptions)
}
