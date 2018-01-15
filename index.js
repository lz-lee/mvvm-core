function Vue(options) {
  console.log(options)
  this.$options = options || {}
  var data = this._data = this.$options.data
  // 数据代理
  Object.keys(data).forEach((key) => {
    this.proxyData(key)
  })
  this.initComputed()
  observe(data)
  new Compile(options.el, this)
}

Vue.prototype = {
  proxyData: function(key) {
    var self = this
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        return self._data[key]
      },
      set: function(val) {
        self._data[key] = val
      }
    })
  },
  initComputed: function() {
    var computed = this.$options.computed
    var self = this
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(function(key) {
        Object.defineProperty(self, key, {
          get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
          set: function() {}
        })
      })
    }
  }
}