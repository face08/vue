/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// 函数返回值
// return {
//   compile,
//   compileToFunctions: createCompileToFunctionFn(compile)
// }
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
