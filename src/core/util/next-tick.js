/* @flow */
/* globals MessageChannel */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIOS, isNative } from './env'


const callbacks = []  // 回调函数队列
let pending = false // 待定

// 全部调用
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

/**
 * mark 默认微任务，公开宏任务（v-on）
 * https://github.com/vuejs/vue/issues/4521
 * https://github.com/vuejs/vue/issues/6690
 *
 * https://github.com/vuejs/vue/issues/6813
 * 无法选中单选框：https://codepen.io/qbaty/pen/NboZoz?editors=1111
 * 在vue2.5之前的版本中，nextTick基本上基于 micro task 来实现的，但是在某些情况下 micro task 具有太高的优先级，
 * 并且可能在连续顺序事件之间（例如＃4521，＃6690）或者甚至在同一事件的事件冒泡过程中之间触发（＃6566）。
 * 但是如果全部都改成 macro task，对一些有重绘和动画的场景也会有性能影响，如 issue #6813。
 * vue2.5之后版本提供的解决办法是默认使用 micro task，但在需要时（例如在v-on附加的事件处理程序中）强制使用 macro task。
 */


// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// 微任务问题：sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// 宏任务问题： when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
let microTimerFunc  // 微任务
let macroTimerFunc  // 宏任务
let useMacroTask = false  // 是否使用宏任务

// 确定使用宏任务
// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  // web 进入这里
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks  // todo 执行回调？什么原理
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 微任务
// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 进入这里
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}

/**
 * 包裹成宏任务执行
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
export function withMacroTask (fn: Function): Function {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}

/**
 * mark 添加下一帧回调
 * @param cb
 * @param ctx
 * @returns {Promise<*>}
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 存入箭头函数
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 执行任务
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}


/*
setImmediate、MessageChannel VS setTimeout 区别
  我们是优先定义setImmediate、MessageChannel为什么要优先用他们创建macroTask而不是setTimeout？
  HTML5中规定setTimeout的最小时间延迟是4ms，也就是说理想环境下异步回调最快也是4ms才能触发。
  Vue使用这么多函数来模拟异步任务，其目的只有一个，就是让回调异步且尽早调用。
  而MessageChannel 和 setImmediate 的延迟明显是小于setTimeout的。

 */
