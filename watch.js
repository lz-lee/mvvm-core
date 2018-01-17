function Watch(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  this.depIds = {};
  this.getter = this.parseGetter(exp);
  this.value = this.get();
}

Watch.prototype = {
  update: function() {
    this.run();
  },
  run: function() {
    var value = this.get();
    var oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  },
  addDep: function(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.subscribe(this);
      this.depIds[dep.id] = dep;
    }
  },
  get: function() {
    Dep.target = this;
    var value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  },
  parseGetter: function(exp) {
    if (/[^\w.$]/.test(exp)) return;

    var exps = exp.split('.');

    return function(obj) {
      for (var i = 0, len = exps.length; i < len; i++) {
        if (!obj) return;
        obj = obj[exps[i]];
      }
      return obj;
    }
  }
}