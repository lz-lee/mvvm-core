/**
 * 观察数据变化，数据变化通知订阅者后执行更新视图方法
 * @param {Object} data
 */
function Observer(data) {
  this.data = data
  debugger
  this.init(data)
}

Observer.prototype = {
  init: function(data) {
    var self = this
    Object.keys(data).forEach(function(key) {
      self.defineReactive(data, key, data[key])
    })
  },
  defineReactive: function(data, key, val) {
    var dep = new Dep()
    var childObj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        // 使用target属性，暂存watcher
        if (Dep.target) {
          // dep.subscribe(Dep.target)
          Dep.target.addDep(dep)
        }
        return val
      },
      set: function(newVal) {
        if (newVal === val) return
        val = newVal
        // 新值为对象时，继续监听
        childObj = observe(newVal)
        // 执行订阅的事件
        dep.notify()
      }
    })
  }
}

var uid = 0

function Dep() {
  this.id = uid++
  this.listeners = []
}

Dep.prototype = {
  // 订阅
  subscribe: function(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(v => v !== listener)
    }
  },

  notify: function() {
    // 订阅的事件实现一个update方法
    this.listners.forEach(v => v.update())
  }
}

Dep.target = null

function observe(obj) {
  if (!obj || typeof obj !== 'object') return
  return new Observer(obj)
}