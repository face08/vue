import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 默认空函数，构造函数
function Vue (options) {
  console.log('hello vue source');
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // init.js
  this._init(options)
}

// 将 Vue 作为参数传递给导入的五个方法：初始化、状态、事件、生命周期、render
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

/*
  每个mixin函数都有init函数，脱离了注入
 */
