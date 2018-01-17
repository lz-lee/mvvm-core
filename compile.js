function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  if (this.el) {
    this.fragment = this.nodeToFragment(this.el);
    this.init();
    this.el.appendChild(this.fragment);
  }
}

Compile.prototype = {
  nodeToFragment: function(el) {
    var fragment = document.createDocumentFragment();
    var child;
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },
  init: function() {
    this.compileElement(this.fragment);
  },
  compileElement: function(el) {
    var childNodes = el.childNodes;
    var self = this;
    Array.prototype.slice.call(childNodes).forEach(function(node) {
      var text = node.textContent;
      var reg = /\{\{(.*)\}\}/;
      if (self.isElementNode(node)) {
        self.compile(node);
      } else if (self.isTextNode(node) && reg.test(text)) {
        compileUtil.text(node, self.vm, RegExp.$1);
      }

      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node);
      }
    })
  },
  compile: function(node) {
    var attrs = node.attributes;
    var self = this;
    Array.prototype.slice.call(attrs).forEach(function(attr) {
      var attrName = attr.name;   // v-text="someText"
      if (self.isDirective(attrName)) {
        var attrValue = attr.value; // someText
        var dir = attrName.substr(2); // text
        if (self.isEvent(dir)) {
          compileUtil.eventHandler(node, self.vm, attrValue, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, self.vm, attrValue)
        }
        node.removeAttribute(attrName)
      }
    })
  },
  isEvent: function(dir) {
    return dir.indexOf('on') === 0;
  },
  isDirective: function(attr) {
    return attr.indexOf('v-') === 0;
  },
  isElementNode: function(node) {
    return node.nodeType === 1;
  },
  isTextNode: function(node) {
    return node.nodeType === 3;
  }
}

var compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },
  html: function(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },
  model: function(node, vm, exp) {
    this.bind(node, vm, exp, 'model');
    var self = this;
    var val = this.getVal(vm, exp);
    node.addEventListener('input', function(e) {
      var newVal = e.target.value;
      if (val === newVal) {
        return;
      }
      self.setVal(vm, exp, newVal);
      val = newVal;
    });
  },
  class: function(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },
  bind: function(node, vm, exp, dir) {
    var fn = Fn[dir + 'Fn'];
    // 初始化视图
    fn && fn(node, this.getVal(vm, exp));

    new Watch(vm, exp, function(value, oldValue) {
      fn && fn(node, value, oldValue);
    })
  },
  eventHandler: function(node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var fn = vm.$options.methods && vm.$options.methods[exp];
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },
  getVal: function(vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function(k) {
      val = val[k];
    })
    return val;
  },
  setVal: function(vm, exp, value) {
    var val = vm;
    exp = exp.split('.')
    exp.forEach(function(k, i) {
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
}

var Fn = {
  textFn: function(node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  htmlFn: function(node, value) {
    node.html = typeof value == 'undefined' ? '' : value;
  },
  classFn: function(node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '')
    var space = className && String(value) ? ' ' : ''
    node.className = className + space + value;
  },
  modelFn: function(node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
}