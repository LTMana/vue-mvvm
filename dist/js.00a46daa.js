// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"js/CompileUtil.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var CompileUtil = {
  getVal: function getVal(vm, exp) {
    // 获取实例上对应的数据
    exp = exp.split('.');
    return exp.reduce(function (prev, next) {
      return prev[next];
    }, vm.$data);
  },
  setVal: function setVal(vm, exp, newVal) {
    // 设置实例上对应的数据
    exp = exp.split('.');
    return exp.reduce(function (prev, next, currentIndex) {
      if (currentIndex === exp.length - 1) {
        return prev[next] = newVal;
      }

      return prev[next];
    }, vm.$data);
  },
  getTextVal: function getTextVal(vm, exp) {
    var _this = this;

    // 获取编译文本后的结果
    return exp.replace(/\{\{([^}]+)\}\}/g, function () {
      return _this.getVal(vm, arguments.length <= 1 ? undefined : arguments[1]);
    });
  },
  text: function text(node, vm, exp) {
    //文本处理
    var updateFn = this.updater['textUpdater'];
    var value = this.getTextVal(vm, exp);
    exp.replace(/\{\{([^}]+)\}\}/g, function () {
      new Watcher(vm, arguments.length <= 1 ? undefined : arguments[1], function (newValue) {
        // 如果数据变化了，文本节点应该重新获取依赖的数据更新文本中的内容
        updateFn && updateFn(node, newValue);
      });
    });
    updateFn && updateFn(node, value);
  },
  model: function model(node, vm, exp) {
    var _this2 = this;

    // 输入框处理
    var updateFn = this.updater['modelUpdater'];
    var value = this.getVal(vm, exp); // 这里应该加一个监控，数据变化了，应该调用 watch 的回调

    new Watcher(vm, exp, function (newValue) {
      updateFn && updateFn(node, newValue);
    }); // 添加输入框事件实现双向绑定

    node.addEventListener('input', function (e) {
      var newValue = e.target.value;

      _this2.setVal(vm, exp, newValue);
    }); // 防止没有的指令解析时报错

    updateFn && updateFn(node, value);
  },
  updater: {
    // 文本更新
    textUpdater: function textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新
    modelUpdater: function modelUpdater(node, value) {
      node.value = value;
    }
  }
};
var _default = CompileUtil;
exports.default = _default;
},{}],"js/Compile.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompileUtil = _interopRequireDefault(require("./CompileUtil"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Compile =
/*#__PURE__*/
function () {
  function Compile(el, vm) {
    _classCallCheck(this, Compile);

    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      // 如果这个元素能获取到，我们才开始编译
      // 1.先把这些真实的 DOM 移动到内存种 fragment
      var fragment = this.nodeToFragment(this.el); // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{message}}

      this.compile(fragment); // 把编译好的 fragment再塞回到页面中去

      this.el.appendChild(fragment);
    }
  }
  /* 专门写一些辅助方法 */


  _createClass(Compile, [{
    key: "isElementNode",
    value: function isElementNode(node) {
      // 是不是 dom 节点
      return node.nodeType === 1;
    }
  }, {
    key: "isDirective",
    value: function isDirective(name) {
      // 是不是指令
      return name.includes('v-');
    }
    /* 核心方法 */

  }, {
    key: "nodeToFragment",
    value: function nodeToFragment(el) {
      // 需要将 el 中的内容全部放到内存中
      // 文档碎片 内存中的 dom 节点
      var fragment = document.createDocumentFragment();
      var firstChild;

      while (firstChild = el.firstChild) {
        fragment.appendChild(firstChild);
      }

      return fragment; // 内存中的节点
    }
  }, {
    key: "compile",
    value: function compile(fragment) {
      var _this = this;

      // 编译文档碎片方法
      // 需要递归
      var childNodes = fragment.childNodes;
      Array.from(childNodes).forEach(function (node) {
        if (_this.isElementNode(node)) {
          // 是元素节点，还需要继续深入的检查
          // console.log('element', node);
          _this.compile(node); // 这里需要编译元素


          _this.compileElement(node);
        } else {
          // 是文本节点
          // console.log('text', node);
          // 这里需要编译文本
          _this.compileText(node);
        }
      });
    }
  }, {
    key: "compileElement",
    value: function compileElement(node) {
      var _this2 = this;

      // 编译元素节点
      // 带 v-model 的
      var attrs = node.attributes; // 取出当前节点的属性

      Array.from(attrs).forEach(function (attr) {
        // 判断属性名字是不是包含 v-
        var attrName = attr.name;

        if (_this2.isDirective(attrName)) {
          // 取到对应的值，放在节点中
          var exp = attr.value;

          var _attrName$split = attrName.split('-'),
              _attrName$split2 = _slicedToArray(_attrName$split, 2),
              type = _attrName$split2[1]; // node this.vm.$date exp


          _CompileUtil.default[type](node, _this2.vm, exp);
        }
      });
    }
  }, {
    key: "compileText",
    value: function compileText(node) {
      // 编译文本节点
      // 带 {{}} 的
      var exp = node.textContent; // 获取文本中的内容

      var reg = /\{\{([^}]+)\}\}/g; // {{a}} {{b}} {{c}}

      if (reg.test(exp)) {
        // node this.vm.$date exp
        _CompileUtil.default['text'](node, this.vm, exp);
      }
    }
  }]);

  return Compile;
}();

exports.default = Compile;
},{"./CompileUtil":"js/CompileUtil.js"}],"js/Observer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Observer =
/*#__PURE__*/
function () {
  function Observer(data) {
    _classCallCheck(this, Observer);

    this.observe(data);
  }

  _createClass(Observer, [{
    key: "observe",
    value: function observe(data) {
      var _this2 = this;

      // 验证 data
      if (!data || _typeof(data) !== 'object') {
        return;
      } // 要对这个 data 数据将原有的属性改成 set 和 get 的形式
      // 要将数据一一劫持，先获取到 data 的 key 和 value


      Object.keys(data).forEach(function (key) {
        // 劫持（实现数据响应式）
        _this2.defineReactive(data, key, data[key]);

        _this2.observe(data[key]); // 深度劫持

      });
    }
  }, {
    key: "defineReactive",
    value: function defineReactive(object, key, value) {
      // 响应式
      var _this = this; // 每个变化的数据都会对应一个数组，这个数组是存放所有更新的操作


      var dep = new Dep(); // 获取某个值被监听到

      Object.defineProperty(object, key, {
        enumerable: true,
        configurable: true,
        get: function get() {
          // 当取值时调用的方法
          Dep.target && dep.addSub(Dep.target);
          return value;
        },
        set: function set(newValue) {
          // 当给 data 属性中设置的值适合，更改获取的属性的值
          if (newValue !== value) {
            _this.observe(newValue); // 重新赋值如果是对象进行深度劫持


            value = newValue;
            dep.notify(); // 通知所有人数据更新了
          }
        }
      });
    }
  }]);

  return Observer;
}();

exports.default = Observer;
},{}],"js/MVVM.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Compile = _interopRequireDefault(require("./Compile"));

var _Observer = _interopRequireDefault(require("./Observer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MVVM =
/*#__PURE__*/
function () {
  function MVVM(options) {
    _classCallCheck(this, MVVM);

    // 先把 el 和 data 挂在 MVVM 实例上
    this.$el = options.el;
    this.$data = options.data; // 如果有要编译的模板就开始编译

    if (this.$el) {
      // 数据劫持，就是把对象所有的属性添加 get 和 set
      new _Compile.default(this.$data); // 将数据代理到实例上

      this.proxyData(this.$data); // 用数据和元素进行编译

      new _Observer.default(this.$el, this);
    }
  }

  _createClass(MVVM, [{
    key: "proxyData",
    value: function proxyData(data) {
      var _this = this;

      // 代理数据的方法
      Object.keys(data).forEach(function (key) {
        Object.defineProperty(_this, key, {
          get: function get() {
            return data[key];
          },
          set: function set(newVal) {
            data[key] = newVal;
          }
        });
      });
    }
  }]);

  return MVVM;
}();

exports.default = MVVM;
},{"./Compile":"js/Compile.js","./Observer":"js/Observer.js"}],"js/index.js":[function(require,module,exports) {
"use strict";

var _MVVM = _interopRequireDefault(require("./MVVM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vm = new _MVVM.default({
  el: '#app',
  data: {
    message: 'hello world!'
  }
});
},{"./MVVM":"js/MVVM.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53768" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/index.js"], null)
//# sourceMappingURL=/js.00a46daa.map