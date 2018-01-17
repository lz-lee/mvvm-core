var uid = 0;

function Observer(data) {
  this.data = data;
  this.init(data);
}

Observer.prototype = {
  init: function(data) {
    var self = this;
    Object.keys(data).forEach(function(key) {
      self.defineReactive(data, key, data[key])
    });
  },
  defineReactive: function(data, key, val) {
    var dep = new Dep();
    var obj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        if (Dep.target) {
          dep.depend();
        }
        return val;
      },
      set: function(newVal) {
        if (val === newVal) {
          return;
        }
        val = newVal;
        obj = observe(newVal);
        dep.notify();
      }
    })
  }
}

function observe(obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  return new Observer(obj);
}

function Dep() {
  this.id = uid++;
  this.listeners = [];
}

Dep.prototype = {
  subscribe: function(listener) {
    this.listeners.push(listener);
  },
  depend: function() {
    Dep.target.addDep(this);
  },
  notify: function() {
    this.listeners.forEach(function(v) {
      v.update();
    })
  }
}

Dep.target = null