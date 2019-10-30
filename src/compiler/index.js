/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'
// 主要是把模板转为AST->render函数
// mark 编译步骤：解析、优化、生成，每步代码都有
// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// createCompiler 为返回的函数
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options) // 生成ast
  if (options.optimize !== false) {
    optimize(ast, options)  // 优化
  }
  const code = generate(ast, options) // mark 生成render代码
  console.log('html解析-最后结果：', JSON.stringify(code))
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
