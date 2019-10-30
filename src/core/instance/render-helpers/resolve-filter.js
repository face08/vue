/* @flow */
// 过滤功能

import { identity, resolveAsset } from 'core/util/index'

/**
 * Runtime helper for resolving filters  filter:过滤器
 */
export function resolveFilter (id: string): Function {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
