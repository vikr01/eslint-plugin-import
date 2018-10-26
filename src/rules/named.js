import * as path from 'path'
import Exports from '../ExportMap'
import docsUrl from '../docsUrl'

module.exports = {
  meta: {
    docs: {
      url: docsUrl('named'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          commonjs: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function (context) {
    const options = context.options[0] || {}

    function checkSpecifiers(key, type, node) {
      // ignore local exports and type imports
      if (node.source == null || node.importKind === 'type') return

      if (!node.specifiers
            .some(function (im) { return im.type === type })) {
        return // no named imports/exports
      }

      const imports = Exports.get(node.source.value, context)
      if (imports == null) return

      if (imports.errors.length) {
        imports.reportErrors(context, node)
        return
      }

      node.specifiers.forEach(function (im) {
        if (im.type !== type) return

        // ignore type imports
        if (im.importKind === 'type') return

        const deepLookup = imports.hasDeep(im[key].name)

        if (!deepLookup.found) {
          if (deepLookup.path.length > 1) {
            const deepPath = deepLookup.path
              .map(i => path.relative(path.dirname(context.getFilename()), i.path))
              .join(' -> ')

            context.report(im[key],
              `${im[key].name} not found via ${deepPath}`)
          } else {
            context.report(im[key],
              im[key].name + ' not found in \'' + node.source.value + '\'')
          }
        }
      })
    }

    function checkRequire(node) {
        if (!options.commonjs) return

        if (node.type !== 'VariableDeclarator') return

        if (!node.id || node.id.type !== 'ObjectPattern' || node.id.properties.length === 0) {
          // return if it's not an object destructure or it's an empty object destructure
          return
        }

        if (!node.init || node.init.type !== 'CallExpression') {
          // return if there is no call expression on the right side
          return
        }

        const call = node.init
        const source = call.arguments[0]
        const variableImports = node.id.properties
        const variableExports = Exports.get(source.value, context)

        // return if it's not a commonjs require statement
        if (call.callee.type !== 'Identifier') return
        if (call.callee.name !== 'require') return
        if (call.arguments.length !== 1) return

        // return if it's not a string source
        if (source.type !== 'Literal') return

        if (variableExports == null) return

        if (variableExports.errors.length) {
          variableExports.reportErrors(context, node)
          return
        }

        variableImports.forEach(function (im) {
          if (im.type !== 'Property') return
          if (!im.key || im.key.type !== 'Identifier') return

          const deepLookup = variableExports.hasDeep(im.key.name)

          if (!deepLookup.found) {
            if (deepLookup.path.length > 1) {
              const deepPath = deepLookup.path
                .map(i => path.relative(path.dirname(context.getFilename()), i.path))
                .join(' -> ')

              context.report(im.key,
                `${im.key.name} not found via ${deepPath}`)
            } else {
              context.report(im.key,
                im.key.name + ' not found in \'' + source.value + '\'')
            }
          }
        })
    }

    return {
      'ImportDeclaration': checkSpecifiers.bind( null
                                               , 'imported'
                                               , 'ImportSpecifier'
                                               ),

      'ExportNamedDeclaration': checkSpecifiers.bind( null
                                                    , 'local'
                                                    , 'ExportSpecifier'
                                                    ),

      'VariableDeclarator': checkRequire,
    }

  },
}
