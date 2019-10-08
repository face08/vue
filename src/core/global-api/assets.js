/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

// mark vue 全局函数:component、directive、filter函数:  https://cn.vuejs.org/v2/guide/custom-directive.html
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    /**
     *
     * @param id 自定义的字符串id
     * @param definition 自定义函数
     * @returns {Function|Object|*} 返回自定义
     */
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // 如果没有def，直接返回
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }

        // 如果是组件，调用继承extend
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        // 如果是指令
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // 全局的组件，指令和过滤器，统一挂在vue.options上。在init的时候利用mergeOptions合并策略侵入实例，供实例使用
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}

/*
  指令钩子函数：bind、inserted、update、componentUpdated、unbind
  指令参数：el、binding、vnode 和 oldVnode
 */
