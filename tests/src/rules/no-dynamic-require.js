import { test } from '../utils'

import { RuleTester } from 'eslint'

const ruleTester = new RuleTester()
    , rule = require('rules/no-dynamic-require')

const error = {
  ruleId: 'no-dynamic-require',
  message: 'Calls to require() should use string literals',
}

const dynamicImportError = {
  ruleId: 'no-dynamic-require',
  message: 'Calls to import() should use string literals',
}

ruleTester.run('no-dynamic-require', rule, {
  valid: [
    test({ code: 'import _ from "lodash"'}),
    test({ code: 'require("foo")'}),
    test({ code: 'require(`foo`)'}),
    test({ code: 'require("./foo")'}),
    test({ code: 'require("@scope/foo")'}),
    test({ code: 'require()'}),
    test({ code: 'require("./foo", "bar" + "okay")'}),
    test({ code: 'var foo = require("foo")'}),
    test({ code: 'var foo = require(`foo`)'}),
    test({ code: 'var foo = require("./foo")'}),
    test({ code: 'var foo = require("@scope/foo")'}),

    //dynamic import
    test({
      code: 'import("foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import(`foo`)',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import("./foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import("@scope/foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'var foo = import("foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'var foo = import(`foo`)',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'var foo = import("./foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'var foo = import("@scope/foo")',
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import("../" + name)',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
      options: [{esmodule: false}],
    }),
    test({
      code: 'import(`../${name}`)',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
    }),
  ],
  invalid: [
    test({
      code: 'require("../" + name)',
      errors: [error],
    }),
    test({
      code: 'require(`../${name}`)',
      errors: [error],
    }),
    test({
      code: 'require(name)',
      errors: [error],
    }),
    test({
      code: 'require(name())',
      errors: [error],
    }),
    test({
      code: 'require(name + "foo", "bar")',
      errors: [error],
      options: [{esmodule: true}],
    }),

    // dynamic import
    test({
      code: 'import("../" + name)',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import(`../${name}`)',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import(name)',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
    test({
      code: 'import(name())',
      errors: [dynamicImportError],
      parser: 'babel-eslint',
      options: [{esmodule: true}],
    }),
  ],
})
