import 'es6-symbol/implement'
import Map from 'es6-map'
import Set from 'es6-set'

import resolve from 'eslint-module-utils/resolve'

module.exports = function (context) {
  const imported = new Map()
  return {
    'ImportDeclaration': function (n) {
      // resolved path will cover aliased duplicates
      let resolvedPath = resolve(n.source.value, context) || n.source.value

      if (imported.has(resolvedPath)) {
        imported.get(resolvedPath).add(n.source)
      } else {
        imported.set(resolvedPath, new Set([n.source]))
      }
    },

    'Program:exit': function () {
      for (let [module, nodes] of imported.entries()) {
        if (nodes.size > 1) {
          for (let node of nodes) {
            context.report(node, `'${module}' imported multiple times.`)
          }
        }
      }
    },
  }
}
