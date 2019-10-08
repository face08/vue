/* @flow */

import { mergeOptions } from '../util/index'

// mark vue mixin功能
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
