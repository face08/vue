/* @flow */

/**
 * 检测一个字符串是否已$或者_开头
 * Check if a string starts with $ or _
 */
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * 定义 a property.默认可写、可配置
 * @param obj 拦截对象 Array
 * @param key 拦截属性 push
 * @param val 值，拦截函数fun
 * @param enumerable
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * 解析一个路径，变量访问要watch的属性
 * Parse simple path.
 * ("a.hello")({ a: { hello: 'world' } }) 返回为world
 */
const bailRE = /[^\w.$]/
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
