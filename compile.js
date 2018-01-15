function Compile(el, vm) {
  this.$el = document.querySelector(el)
  this.vm = vm
  this.init()
}

Compile.prototype = {
  init: function() {
    if (this.$el) {
      this.fragment = this.node2Fragment(this.$el)
      this.compileElement(this.fragment)
      this.$el.appendChild(this.fragment)
    }
  },
  node2Fragment: function(el) {
    // 使用文档片段（DocumentFragment是DOM节点，不是真实DOM树的一部分，存在于内存中，将子元素插入到文档片段时不会引起页面回流）作为参数，append的操作是一次性将片段的所有子节点（而不是片段本身）插入到文档中，仅发生一次重渲染操作，性能优化。
    var fragment = document.createDocumentFragment()
    var child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  },
  compileElement: function(el) {
    var childNodes = el.childNodes
    var self = this;
    [].slice.call(childNodes).forEach(function(node) {
      var text = node.textContent
      // 表达式文本
      var reg = /\{\{(.*)\}\}/
      // 按元素节点方式编译
      if (self.isElementNode(node)) {
        self.compile(node)
      } else if (self.isTextNode(node) && reg.test(text)) {
        compileUtil.text(node, self.vm, RegExp.$1)
      }

      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node)
      }
    })
  },
  compile: function(node) {
    var nodeAttrs = node.attributes
    var self = this;
    [].slice.call(nodeAttrs).forEach(function(attr) {
      var name = attr.name
      // 指令判断，指令以'v-'开头
      if (self.isDirective(name)) {
        var exp = attr.value
        var dir = name.substr(2)
        // 事件指令
        if (self.isEventDirective(dir)) {
          compileUtil.eventHandler(node, self.vm, exp, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, self.vm, exp)
        }
        node.removeAttribute(name)
      }
    })
  },
  isEventDirective: function(dir){
    return dir.indexOf('on') === 0
  },
  isDirective: function(name) {
    return name.indexOf('v-') === 0
  },
  isElementNode: function(node) {
    return node.nodeType === 1
  },
  isTextNode: function(node) {
    return node.nodeType === 3
  }
}

var compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  html: function(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model: function(node, vm, exp) {
    this.bind(node, vm, exp, 'model')
    var val = this.getVMVal(vm, exp)
    node.addEventListener('input', (e) => {
      var newVal = e.target.value
      if (val === newVal) return
      this.setVMVal(vm, exp, newVal)
      val = newVal
    }, false)
  },
  class: function(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },
  bind: function(node, vm, exp, dir) {
    var updateFn = update[dir + 'Update']
    updateFn && updateFn(node, this.getVMVal(vm, exp))

    new Watch(vm, exp, (val, oldVal) => {
      updateFn && updateFn(node, value, oldVal)
    })
  },
  eventHandler: function(node, vm, exp, dir) {
    var eventType = dir.split(':')[1]
    var fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  getVMVal: function(vm, exp) {
    var val = vm
    exp = exp.split('.')
    exp.forEach((v) => {
      val = val[v]
    })
    return val
  },
  setVMVal: function(vm, exp, val) {
    var val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = val
      }
    })
  }
}

var update = {
  textUpdate: function(node, val) {
    node.textContent = typeof value === 'undefined' ? '' : val
  },
  htmlUpdate: function(node, val) {
    node.innerHtml = typeof val === 'undefined' ? '' :val
  },
  classUpdate: function(node, val, oldVal) {
    var className = node.className
    className = className.replace(oldVal, '').replace(/\s$/, '')
    var space = className && String(value) ? ' ' : ''
    node.className = className + space + value
  },
  modelUpdate: function(node, val, oldVal) {
    node.value = typeof value === 'undefined' ? '' : val
  }
}