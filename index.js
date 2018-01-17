function Vuue(options) {
  this.$options = options || {};
  var data = this._data = options.data;
  var self = this;
  Object.keys(data).forEach(function(key) {
    self.proxyData(key);
  });
  this.initComputed();
  observe(data, this);
  this.$compile = new Compile(options.el || document.body, this)
}

Vuue.prototype = {
  proxyData: function(key) {
    var self = this;
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        return self._data[key];
      },
      set: function(val) {
        self._data[key] = val;
      }
    });
  },
  initComputed: function() {
    var self = this;
    var computed = this.$options.computed;
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
