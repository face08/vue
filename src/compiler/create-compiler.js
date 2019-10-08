/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

/**
 * 返回结果为fun，fun的在此返回结果为{}对象
 * @param baseCompile 参数为fun
 * @returns {function(CompilerOptions): {compile: (function(string, CompilerOptions=): *), compileToFunctions: Function}}
 */
export function createCompilerCreator (baseCompile: Function): Function {
  /**
   * baseOptions 编译参数
   */
  return function createCompiler (baseOptions: CompilerOptions) {

    // 下断点使用
    // let a = 'nxx'
    // console.log(a)

    // 准备返回函数，折叠起来看
    // 准备编译参数
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      const finalOptions = Object.create(baseOptions) // 最终编译参数
      const errors = []
      const tips = []
      finalOptions.warn = (msg, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        // merge custom modules 合并modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives  合并directive
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options 复制options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      // mark 调用参数baseCompile来编译
      const compiled = baseCompile(template, finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        errors.push.apply(errors, detectErrors(compiled.ast))
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
