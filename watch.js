function Watch(vm, exp, cb) {
  this.cb = cb
  this.vm = vm
  this.exp = exp
  this.depIds = {}
  // 触发getter
  this.value = this.get()
}

Watch.prototype = {
  update: function() {
    this.run()
  },
  run: function() {
    var val = this.get()
    var oldVal = this.value
    if (val !== oldVal) {
      this.value = val
      // 执行Compile中绑定的回调，更新视图
      this.cb.call(this.vm, val, oldVal)
    }
  },
  //
  addDep: function(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.subscribe(this)
      this.depIds[dep.id] = dep
    }
  },
  get: function() {
    Dep.target = this
    var val = this.vm[this.exp]
    Dep.target = null
    return val
  },
  parseGetter: function(exp) {
    if (/[^\w.$]/.test(exp)) return
    var exps = exp.split('.')
    return (obj) => {
      for (var i = 0; i < exps.length; i++) {
        if (!obj) return
        obj = obj[exps[i]]
      }
      return obj
    }
  }
}
