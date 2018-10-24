/**
 * @fileOverview Ensures that an imported path exists, given resolution rules.
 * @author Ben Mosher
 */

import resolve, { CASE_SENSITIVE_FS, fileExistsWithCaseSync } from 'eslint-module-utils/resolve'
import ModuleCache from 'eslint-module-utils/ModuleCache'
import moduleVisitor, { makeOptionsSchema } from 'eslint-module-utils/moduleVisitor'
import docsUrl from '../docsUrl'

module.exports = {
  meta: {
    docs: {
      url: docsUrl('no-unresolved'),
    },

    schema: [ makeOptionsSchema({
      caseSensitive: { type: 'boolean', default: true },
    })],
  },

  create: function (context) {

    function checkSourceValue(source) {
      const shouldCheckCase = !CASE_SENSITIVE_FS &&
        (!context.options[0] || context.options[0].caseSensitive !== false)

      let handled = false
      function handleResolvedPath(error, resolvedPath) {
        if(handled) { return }
        handled = true

        if (resolvedPath === undefined) {
          context.report(source,
            `Unable to resolve path to module '${source.value}'.`)
        }

        else if (shouldCheckCase) {
          const cacheSettings = ModuleCache.getSettings(context.settings)
          if (!fileExistsWithCaseSync(resolvedPath, cacheSettings)) {
            context.report(source,
              `Casing of ${source.value} does not match the underlying filesystem.`)
          }

        }
      }

      const resolvedPath = resolve(source.value, context, handleResolvedPath)
      handleResolvedPath(null, resolvedPath)
    }

    return moduleVisitor(checkSourceValue, context.options[0])

  },
}
