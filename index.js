function Vue(options) {

}

function Watch() {

}

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
  node2Fragment(el) {
    // 使用文档片段（DocumentFragment是DOM节点，不是真实DOM树的一部分，存在于内存中，将子元素插入到文档片段时不会引起页面回流）作为参数，append的操作是一次性将片段的所有子节点（而不是片段本身）插入到文档中，仅发生一次重渲染操作，性能优化。
    var fragment = document.createDocumentFragment()
    var child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  },
  compileElement(el) {
    var childNodes = el.childNodes

    [].slice.call(childNodes).forEach((node) => {
      var text = node.textContent
      // 表达式文本
      var reg = /\{\{(.*)\}\}/
      // 按元素节点方式编译
      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        compileUtil.text(node, this.vm, RegExp.$1)
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  },
  compile(node) {
    var nodeAttrs = node.attributes
    [].slice.call(nodeAttrs).forEach((attr) => {
      var name = attr.name
      if (this.isDirective(name)) {
        var exp = attr.value
        var dir = name.substr(2)

      }
    })
  },
  isDirective(name) {
    return name.indexOf('v-') === 0
  },
  isElementNode(node) {
    return node.nodeType === 1
  },
  isTextNode(node) {
    return node.nodeType === 3
  }
}
/**
 * 观察数据变化，数据变化通知订阅者后执行更新视图方法
 * @param {Object} data 
 */
function Observer(data) {
  this.data = data
  this.init(data)
}

Observer.prototype = {
  init: function(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key])
    })
  },
  defineReactive: function(data, key, val) {
    var dep = new dep()
    var childObj = observe(val)

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function() {
        // 使用target属性，暂存watcher
        if (Dep.target) {
          dep.subscribe(Dep.target)
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

function Dep() {
  this.listners = []
}

Dep.prototype = {
  // 订阅
  subscribe: function(listner) {
    this.listners.push(listner)
    return () => {
      this.listners = this.listners.filter(v => v !== listner)
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

var compileUtil = {
  text: function(node, vm, reg) {
    this.bind(node, vm, reg, 'text')
  },
  bind: function(node, vm, reg, dir) {

  }
}