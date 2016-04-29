'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.recursivePatternCapture = recursivePatternCapture;

require('es6-symbol/implement');

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _crypto = require('crypto');

var _doctrine = require('doctrine');

var doctrine = _interopRequireWildcard(_doctrine);

var _parse2 = require('./parse');

var _parse3 = _interopRequireDefault(_parse2);

var _resolve = require('./resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _ignore = require('./ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _hash = require('./hash');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var exportCache = new _es6Map2.default();

/**
 * detect exports without a full parse.
 * used primarily to ignore the import/ignore setting, iif it looks like
 * there might be something there (i.e., jsnext:main is set).
 * @type {RegExp}
 */
var hasExports = new RegExp('(^|[\\n;])\\s*export\\s[\\w{*]');

var ExportMap = function () {
  function ExportMap(path) {
    _classCallCheck(this, ExportMap);

    this.path = path;
    this.namespace = new _es6Map2.default();
    // todo: restructure to key on path, value is resolver + map of names
    this.reexports = new _es6Map2.default();
    this.dependencies = new _es6Map2.default();
    this.errors = [];
  }

  ExportMap.get = function get(source, context) {

    var path = (0, _resolve2.default)(source, context);
    if (path == null) return null;

    return ExportMap.for(path, context);
  };

  ExportMap.for = function _for(path, context) {
    var exportMap = void 0;

    var cacheKey = (0, _hash.hashObject)((0, _crypto.createHash)('sha256'), {
      settings: context.settings,
      parserPath: context.parserPath,
      parserOptions: context.parserOptions,
      path: path
    }).digest('hex');

    exportMap = exportCache.get(cacheKey);

    // return cached ignore
    if (exportMap === null) return null;

    var stats = fs.statSync(path);
    if (exportMap != null) {
      // date equality check
      if (exportMap.mtime - stats.mtime === 0) {
        return exportMap;
      }
      // future: check content equality?
    }

    var content = fs.readFileSync(path, { encoding: 'utf8' });

    // check for and cache ignore
    if ((0, _ignore2.default)(path, context) && !hasExports.test(content)) {
      exportCache.set(cacheKey, null);
      return null;
    }

    exportMap = ExportMap.parse(path, content, context);
    exportMap.mtime = stats.mtime;

    exportCache.set(cacheKey, exportMap);
    return exportMap;
  };

  ExportMap.parse = function parse(path, content, context) {
    var m = new ExportMap(path);

    try {
      var ast = (0, _parse3.default)(content, context);
    } catch (err) {
      m.errors.push(err);
      return m; // can't continue
    }

    // attempt to collect module doc
    ast.comments.some(function (c) {
      if (c.type !== 'Block') return false;
      try {
        var doc = doctrine.parse(c.value, { unwrap: true });
        if (doc.tags.some(function (t) {
          return t.title === 'module';
        })) {
          m.doc = doc;
          return true;
        }
      } catch (err) {/* ignore */}
      return false;
    });

    var namespaces = new _es6Map2.default();

    function remotePath(node) {
      return _resolve2.default.relative(node.source.value, path, context.settings);
    }

    function resolveImport(node) {
      var rp = remotePath(node);
      if (rp == null) return null;
      return ExportMap.for(rp, context);
    }

    function getNamespace(identifier) {
      if (!namespaces.has(identifier.name)) return;

      return function () {
        return resolveImport(namespaces.get(identifier.name));
      };
    }

    function addNamespace(object, identifier) {
      var nsfn = getNamespace(identifier);
      if (nsfn) {
        Object.defineProperty(object, 'namespace', { get: nsfn });
      }

      return object;
    }

    ast.body.forEach(function (n) {

      if (n.type === 'ExportDefaultDeclaration') {
        var exportMeta = captureDoc(n);
        if (n.declaration.type === 'Identifier') {
          addNamespace(exportMeta, n.declaration);
        }
        m.namespace.set('default', exportMeta);
        return;
      }

      if (n.type === 'ExportAllDeclaration') {
        var _ret = function () {
          var remoteMap = remotePath(n);
          if (remoteMap == null) return {
              v: void 0
            };
          m.dependencies.set(remoteMap, function () {
            return ExportMap.for(remoteMap, context);
          });
          return {
            v: void 0
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      // capture namespaces in case of later export
      if (n.type === 'ImportDeclaration') {
        var ns = void 0;
        if (n.specifiers.some(function (s) {
          return s.type === 'ImportNamespaceSpecifier' && (ns = s);
        })) {
          namespaces.set(ns.local.name, n);
        }
        return;
      }

      if (n.type === 'ExportNamedDeclaration') {
        // capture declaration
        if (n.declaration != null) {
          switch (n.declaration.type) {
            case 'FunctionDeclaration':
            case 'ClassDeclaration':
            case 'TypeAlias':
              // flowtype with babel-eslint parser
              m.namespace.set(n.declaration.id.name, captureDoc(n));
              break;
            case 'VariableDeclaration':
              n.declaration.declarations.forEach(function (d) {
                return recursivePatternCapture(d.id, function (id) {
                  return m.namespace.set(id.name, captureDoc(d, n));
                });
              });
              break;
          }
        }

        n.specifiers.forEach(function (s) {
          var exportMeta = {};
          var local = void 0;

          switch (s.type) {
            case 'ExportDefaultSpecifier':
              if (!n.source) return;
              local = 'default';
              break;
            case 'ExportNamespaceSpecifier':
              m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', {
                get: function get() {
                  return resolveImport(n);
                }
              }));
              return;
            case 'ExportSpecifier':
              if (!n.source) {
                m.namespace.set(s.exported.name, addNamespace(exportMeta, s.local));
                return;
              }
            // else falls through
            default:
              local = s.local.name;
              break;
          }

          // todo: JSDoc
          m.reexports.set(s.exported.name, { local: local, getImport: function getImport() {
              return resolveImport(n);
            } });
        });
      }
    });

    return m;
  };

  /**
   * Note that this does not check explicitly re-exported names for existence
   * in the base namespace, but it will expand all `export * from '...'` exports
   * if not found in the explicit namespace.
   * @param  {string}  name
   * @return {Boolean} true if `name` is exported by this module.
   */


  ExportMap.prototype.has = function has(name) {
    if (this.namespace.has(name)) return true;
    if (this.reexports.has(name)) return true;

    for (var _iterator = this.dependencies.values(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var dep = _ref;

      var innerMap = dep();

      // todo: report as unresolved?
      if (!innerMap) continue;

      if (innerMap.has(name)) return true;
    }

    return false;
  };

  /**
   * ensure that imported name fully resolves.
   * @param  {[type]}  name [description]
   * @return {Boolean}      [description]
   */


  ExportMap.prototype.hasDeep = function hasDeep(name) {
    if (this.namespace.has(name)) return { found: true, path: [this] };

    if (this.reexports.has(name)) {
      var _reexports$get = this.reexports.get(name);

      var local = _reexports$get.local;
      var getImport = _reexports$get.getImport;
      var imported = getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return { found: true, path: [this] };

      // safeguard against cycles, only if name matches
      if (imported.path === this.path && local === name) return { found: false, path: [this] };

      var deep = imported.hasDeep(local);
      deep.path.unshift(this);

      return deep;
    }

    for (var _iterator2 = this.dependencies.values(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var dep = _ref2;

      var innerMap = dep();
      // todo: report as unresolved?
      if (!innerMap) continue;

      // safeguard against cycles
      if (innerMap.path === this.path) continue;

      var innerValue = innerMap.hasDeep(name);
      if (innerValue.found) {
        innerValue.path.unshift(this);
        return innerValue;
      }
    }

    return { found: false, path: [this] };
  };

  ExportMap.prototype.get = function get(name) {
    if (this.namespace.has(name)) return this.namespace.get(name);

    if (this.reexports.has(name)) {
      var _reexports$get2 = this.reexports.get(name);

      var local = _reexports$get2.local;
      var getImport = _reexports$get2.getImport;
      var imported = getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return null;

      // safeguard against cycles, only if name matches
      if (imported.path === this.path && local === name) return undefined;

      return imported.get(local);
    }

    for (var _iterator3 = this.dependencies.values(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var dep = _ref3;

      var innerMap = dep();
      // todo: report as unresolved?
      if (!innerMap) continue;

      // safeguard against cycles
      if (innerMap.path === this.path) continue;

      var innerValue = innerMap.get(name);
      if (innerValue !== undefined) return innerValue;
    }

    return undefined;
  };

  ExportMap.prototype.forEach = function forEach(callback, thisArg) {
    var _this = this;

    this.namespace.forEach(function (v, n) {
      return callback.call(thisArg, v, n, _this);
    });

    this.reexports.forEach(function (_ref4, name) {
      var getImport = _ref4.getImport;
      var local = _ref4.local;
      return callback.call(thisArg, getImport().get(local), name, _this);
    });

    this.dependencies.forEach(function (dep) {
      return dep().forEach(function (v, n) {
        return callback.call(thisArg, v, n, _this);
      });
    });
  };

  // todo: keys, values, entries?

  ExportMap.prototype.reportErrors = function reportErrors(context, declaration) {
    context.report({
      node: declaration.source,
      message: 'Parse errors in imported module \'' + declaration.source.value + '\': ' + ('' + this.errors.map(function (e) {
        return e.message + ' (' + e.lineNumber + ':' + e.column + ')';
      }).join(', '))
    });
  };

  _createClass(ExportMap, [{
    key: 'hasDefault',
    get: function get() {
      return this.get('default') != null;
    } // stronger than this.has

  }, {
    key: 'size',
    get: function get() {
      var size = this.namespace.size + this.reexports.size;
      this.dependencies.forEach(function (dep) {
        return size += dep().size;
      });
      return size;
    }
  }]);

  return ExportMap;
}();

/**
 * parse JSDoc from the first node that has leading comments
 * @param  {...[type]} nodes [description]
 * @return {{doc: object}}
 */


exports.default = ExportMap;
function captureDoc() {
  var metadata = {};

  // 'some' short-circuits on first 'true'

  for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
    nodes[_key] = arguments[_key];
  }

  nodes.some(function (n) {
    if (!n.leadingComments) return false;

    // capture XSDoc
    n.leadingComments.forEach(function (comment) {
      // skip non-block comments
      if (comment.value.slice(0, 4) !== '*\n *') return;
      try {
        metadata.doc = doctrine.parse(comment.value, { unwrap: true });
      } catch (err) {
        /* don't care, for now? maybe add to `errors?` */
      }
    });
    return true;
  });

  return metadata;
}

/**
 * Traverse a pattern/identifier node, calling 'callback'
 * for each leaf identifier.
 * @param  {node}   pattern
 * @param  {Function} callback
 * @return {void}
 */
function recursivePatternCapture(pattern, callback) {
  switch (pattern.type) {
    case 'Identifier':
      // base case
      callback(pattern);
      break;

    case 'ObjectPattern':
      pattern.properties.forEach(function (_ref5) {
        var value = _ref5.value;

        recursivePatternCapture(value, callback);
      });
      break;

    case 'ArrayPattern':
      pattern.elements.forEach(function (element) {
        if (element == null) return;
        recursivePatternCapture(element, callback);
      });
      break;
  }
}
//# sourceMappingURL=data:application/json;base64,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QVQsR0FBZSxTQUFTLEtBQVQsQ0FBZSxRQUFRLEtBQXZCLEVBQThCLEVBQUUsUUFBUSxJQUFWLEVBQTlCLENBQWY7QUFDRCxPQUZELENBRUUsT0FBTyxHQUFQLEVBQVk7O0FBRWI7QUFDRixLQVJEO0FBU0EsV0FBTyxJQUFQO0FBQ0QsR0FkRDs7QUFnQkEsU0FBTyxRQUFQO0FBQ0Q7Ozs7Ozs7OztBQVNNLFNBQVMsdUJBQVQsQ0FBaUMsT0FBakMsRUFBMEMsUUFBMUMsRUFBb0Q7QUFDekQsVUFBUSxRQUFRLElBQWhCO0FBQ0UsU0FBSyxZQUFMOztBQUNFLGVBQVMsT0FBVDtBQUNBOztBQUVGLFNBQUssZUFBTDtBQUNFLGNBQVEsVUFBUixDQUFtQixPQUFuQixDQUEyQixpQkFBZTtBQUFBLFlBQVosS0FBWSxTQUFaLEtBQVk7O0FBQ3hDLGdDQUF3QixLQUF4QixFQUErQixRQUEvQjtBQUNELE9BRkQ7QUFHQTs7QUFFRixTQUFLLGNBQUw7QUFDRSxjQUFRLFFBQVIsQ0FBaUIsT0FBakIsQ0FBeUIsVUFBQyxPQUFELEVBQWE7QUFDcEMsWUFBSSxXQUFXLElBQWYsRUFBcUI7QUFDckIsZ0NBQXdCLE9BQXhCLEVBQWlDLFFBQWpDO0FBQ0QsT0FIRDtBQUlBO0FBaEJKO0FBa0JEIiwiZmlsZSI6ImNvcmUvZ2V0RXhwb3J0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnZXM2LXN5bWJvbC9pbXBsZW1lbnQnXG5pbXBvcnQgTWFwIGZyb20gJ2VzNi1tYXAnXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJ1xuXG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJ1xuaW1wb3J0ICogYXMgZG9jdHJpbmUgZnJvbSAnZG9jdHJpbmUnXG5cbmltcG9ydCBwYXJzZSBmcm9tICcuL3BhcnNlJ1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnLi9yZXNvbHZlJ1xuaW1wb3J0IGlzSWdub3JlZCBmcm9tICcuL2lnbm9yZSdcblxuaW1wb3J0IHsgaGFzaE9iamVjdCB9IGZyb20gJy4vaGFzaCdcblxuY29uc3QgZXhwb3J0Q2FjaGUgPSBuZXcgTWFwKClcblxuLyoqXG4gKiBkZXRlY3QgZXhwb3J0cyB3aXRob3V0IGEgZnVsbCBwYXJzZS5cbiAqIHVzZWQgcHJpbWFyaWx5IHRvIGlnbm9yZSB0aGUgaW1wb3J0L2lnbm9yZSBzZXR0aW5nLCBpaWYgaXQgbG9va3MgbGlrZVxuICogdGhlcmUgbWlnaHQgYmUgc29tZXRoaW5nIHRoZXJlIChpLmUuLCBqc25leHQ6bWFpbiBpcyBzZXQpLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xuY29uc3QgaGFzRXhwb3J0cyA9IG5ldyBSZWdFeHAoJyhefFtcXFxcbjtdKVxcXFxzKmV4cG9ydFxcXFxzW1xcXFx3eypdJylcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwb3J0TWFwIHtcbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5ldyBNYXAoKVxuICAgIC8vIHRvZG86IHJlc3RydWN0dXJlIHRvIGtleSBvbiBwYXRoLCB2YWx1ZSBpcyByZXNvbHZlciArIG1hcCBvZiBuYW1lc1xuICAgIHRoaXMucmVleHBvcnRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLmVycm9ycyA9IFtdXG4gIH1cblxuICBnZXQgaGFzRGVmYXVsdCgpIHsgcmV0dXJuIHRoaXMuZ2V0KCdkZWZhdWx0JykgIT0gbnVsbCB9IC8vIHN0cm9uZ2VyIHRoYW4gdGhpcy5oYXNcblxuICBnZXQgc2l6ZSgpIHtcbiAgICBsZXQgc2l6ZSA9IHRoaXMubmFtZXNwYWNlLnNpemUgKyB0aGlzLnJlZXhwb3J0cy5zaXplXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4gc2l6ZSArPSBkZXAoKS5zaXplKVxuICAgIHJldHVybiBzaXplXG4gIH1cblxuICBzdGF0aWMgZ2V0KHNvdXJjZSwgY29udGV4dCkge1xuXG4gICAgdmFyIHBhdGggPSByZXNvbHZlKHNvdXJjZSwgY29udGV4dClcbiAgICBpZiAocGF0aCA9PSBudWxsKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIEV4cG9ydE1hcC5mb3IocGF0aCwgY29udGV4dClcbiAgfVxuXG4gIHN0YXRpYyBmb3IocGF0aCwgY29udGV4dCkge1xuICAgIGxldCBleHBvcnRNYXBcblxuICAgIGNvbnN0IGNhY2hlS2V5ID0gaGFzaE9iamVjdChjcmVhdGVIYXNoKCdzaGEyNTYnKSwge1xuICAgICAgc2V0dGluZ3M6IGNvbnRleHQuc2V0dGluZ3MsXG4gICAgICBwYXJzZXJQYXRoOiBjb250ZXh0LnBhcnNlclBhdGgsXG4gICAgICBwYXJzZXJPcHRpb25zOiBjb250ZXh0LnBhcnNlck9wdGlvbnMsXG4gICAgICBwYXRoLFxuICAgIH0pLmRpZ2VzdCgnaGV4JylcblxuICAgIGV4cG9ydE1hcCA9IGV4cG9ydENhY2hlLmdldChjYWNoZUtleSlcblxuICAgIC8vIHJldHVybiBjYWNoZWQgaWdub3JlXG4gICAgaWYgKGV4cG9ydE1hcCA9PT0gbnVsbCkgcmV0dXJuIG51bGxcblxuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aClcbiAgICBpZiAoZXhwb3J0TWFwICE9IG51bGwpIHtcbiAgICAgIC8vIGRhdGUgZXF1YWxpdHkgY2hlY2tcbiAgICAgIGlmIChleHBvcnRNYXAubXRpbWUgLSBzdGF0cy5tdGltZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZXhwb3J0TWFwXG4gICAgICB9XG4gICAgICAvLyBmdXR1cmU6IGNoZWNrIGNvbnRlbnQgZXF1YWxpdHk/XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLCB7IGVuY29kaW5nOiAndXRmOCcgfSlcblxuICAgIC8vIGNoZWNrIGZvciBhbmQgY2FjaGUgaWdub3JlXG4gICAgaWYgKGlzSWdub3JlZChwYXRoLCBjb250ZXh0KSAmJiAhaGFzRXhwb3J0cy50ZXN0KGNvbnRlbnQpKSB7XG4gICAgICBleHBvcnRDYWNoZS5zZXQoY2FjaGVLZXksIG51bGwpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGV4cG9ydE1hcCA9IEV4cG9ydE1hcC5wYXJzZShwYXRoLCBjb250ZW50LCBjb250ZXh0KVxuICAgIGV4cG9ydE1hcC5tdGltZSA9IHN0YXRzLm10aW1lXG5cbiAgICBleHBvcnRDYWNoZS5zZXQoY2FjaGVLZXksIGV4cG9ydE1hcClcbiAgICByZXR1cm4gZXhwb3J0TWFwXG4gIH1cblxuICBzdGF0aWMgcGFyc2UocGF0aCwgY29udGVudCwgY29udGV4dCkge1xuICAgIHZhciBtID0gbmV3IEV4cG9ydE1hcChwYXRoKVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBhc3QgPSBwYXJzZShjb250ZW50LCBjb250ZXh0KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbS5lcnJvcnMucHVzaChlcnIpXG4gICAgICByZXR1cm4gbSAvLyBjYW4ndCBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIGF0dGVtcHQgdG8gY29sbGVjdCBtb2R1bGUgZG9jXG4gICAgYXN0LmNvbW1lbnRzLnNvbWUoYyA9PiB7XG4gICAgICBpZiAoYy50eXBlICE9PSAnQmxvY2snKSByZXR1cm4gZmFsc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IGRvY3RyaW5lLnBhcnNlKGMudmFsdWUsIHsgdW53cmFwOiB0cnVlIH0pXG4gICAgICAgIGlmIChkb2MudGFncy5zb21lKHQgPT4gdC50aXRsZSA9PT0gJ21vZHVsZScpKSB7XG4gICAgICAgICAgbS5kb2MgPSBkb2NcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHsgLyogaWdub3JlICovIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pXG5cbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IE1hcCgpXG5cbiAgICBmdW5jdGlvbiByZW1vdGVQYXRoKG5vZGUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlLnJlbGF0aXZlKG5vZGUuc291cmNlLnZhbHVlLCBwYXRoLCBjb250ZXh0LnNldHRpbmdzKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVJbXBvcnQobm9kZSkge1xuICAgICAgY29uc3QgcnAgPSByZW1vdGVQYXRoKG5vZGUpXG4gICAgICBpZiAocnAgPT0gbnVsbCkgcmV0dXJuIG51bGxcbiAgICAgIHJldHVybiBFeHBvcnRNYXAuZm9yKHJwLCBjb250ZXh0KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE5hbWVzcGFjZShpZGVudGlmaWVyKSB7XG4gICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGlkZW50aWZpZXIubmFtZSkpIHJldHVyblxuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZUltcG9ydChuYW1lc3BhY2VzLmdldChpZGVudGlmaWVyLm5hbWUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZE5hbWVzcGFjZShvYmplY3QsIGlkZW50aWZpZXIpIHtcbiAgICAgIGNvbnN0IG5zZm4gPSBnZXROYW1lc3BhY2UoaWRlbnRpZmllcilcbiAgICAgIGlmIChuc2ZuKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICduYW1lc3BhY2UnLCB7IGdldDogbnNmbiB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqZWN0XG4gICAgfVxuXG5cbiAgICBhc3QuYm9keS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG5cbiAgICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nKSB7XG4gICAgICAgIGNvbnN0IGV4cG9ydE1ldGEgPSBjYXB0dXJlRG9jKG4pXG4gICAgICAgIGlmIChuLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xuICAgICAgICAgIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBuLmRlY2xhcmF0aW9uKVxuICAgICAgICB9XG4gICAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGV4cG9ydE1ldGEpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAobi50eXBlID09PSAnRXhwb3J0QWxsRGVjbGFyYXRpb24nKSB7XG4gICAgICAgIGxldCByZW1vdGVNYXAgPSByZW1vdGVQYXRoKG4pXG4gICAgICAgIGlmIChyZW1vdGVNYXAgPT0gbnVsbCkgcmV0dXJuXG4gICAgICAgIG0uZGVwZW5kZW5jaWVzLnNldChyZW1vdGVNYXAsICgpID0+IEV4cG9ydE1hcC5mb3IocmVtb3RlTWFwLCBjb250ZXh0KSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIGNhcHR1cmUgbmFtZXNwYWNlcyBpbiBjYXNlIG9mIGxhdGVyIGV4cG9ydFxuICAgICAgaWYgKG4udHlwZSA9PT0gJ0ltcG9ydERlY2xhcmF0aW9uJykge1xuICAgICAgICBsZXQgbnNcbiAgICAgICAgaWYgKG4uc3BlY2lmaWVycy5zb21lKHMgPT4gcy50eXBlID09PSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJyAmJiAobnMgPSBzKSkpIHtcbiAgICAgICAgICBuYW1lc3BhY2VzLnNldChucy5sb2NhbC5uYW1lLCBuKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAobi50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicpe1xuICAgICAgICAvLyBjYXB0dXJlIGRlY2xhcmF0aW9uXG4gICAgICAgIGlmIChuLmRlY2xhcmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBzd2l0Y2ggKG4uZGVjbGFyYXRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XG4gICAgICAgICAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIGNhc2UgJ1R5cGVBbGlhcyc6IC8vIGZsb3d0eXBlIHdpdGggYmFiZWwtZXNsaW50IHBhcnNlclxuICAgICAgICAgICAgICBtLm5hbWVzcGFjZS5zZXQobi5kZWNsYXJhdGlvbi5pZC5uYW1lLCBjYXB0dXJlRG9jKG4pKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAnVmFyaWFibGVEZWNsYXJhdGlvbic6XG4gICAgICAgICAgICAgIG4uZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goKGQpID0+XG4gICAgICAgICAgICAgICAgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUoZC5pZCwgaWQgPT4gbS5uYW1lc3BhY2Uuc2V0KGlkLm5hbWUsIGNhcHR1cmVEb2MoZCwgbikpKSlcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuLnNwZWNpZmllcnMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICAgIGNvbnN0IGV4cG9ydE1ldGEgPSB7fVxuICAgICAgICAgIGxldCBsb2NhbFxuXG4gICAgICAgICAgc3dpdGNoIChzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInOlxuICAgICAgICAgICAgICBpZiAoIW4uc291cmNlKSByZXR1cm5cbiAgICAgICAgICAgICAgbG9jYWwgPSAnZGVmYXVsdCdcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ0V4cG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XG4gICAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUsIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRNZXRhLCAnbmFtZXNwYWNlJywge1xuICAgICAgICAgICAgICAgIGdldCgpIHsgcmV0dXJuIHJlc29sdmVJbXBvcnQobikgfSxcbiAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgY2FzZSAnRXhwb3J0U3BlY2lmaWVyJzpcbiAgICAgICAgICAgICAgaWYgKCFuLnNvdXJjZSkge1xuICAgICAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUsIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBzLmxvY2FsKSlcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBlbHNlIGZhbGxzIHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGxvY2FsID0gcy5sb2NhbC5uYW1lXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gdG9kbzogSlNEb2NcbiAgICAgICAgICBtLnJlZXhwb3J0cy5zZXQocy5leHBvcnRlZC5uYW1lLCB7IGxvY2FsLCBnZXRJbXBvcnQ6ICgpID0+IHJlc29sdmVJbXBvcnQobikgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG1cbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBjaGVjayBleHBsaWNpdGx5IHJlLWV4cG9ydGVkIG5hbWVzIGZvciBleGlzdGVuY2VcbiAgICogaW4gdGhlIGJhc2UgbmFtZXNwYWNlLCBidXQgaXQgd2lsbCBleHBhbmQgYWxsIGBleHBvcnQgKiBmcm9tICcuLi4nYCBleHBvcnRzXG4gICAqIGlmIG5vdCBmb3VuZCBpbiB0aGUgZXhwbGljaXQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBuYW1lXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYG5hbWVgIGlzIGV4cG9ydGVkIGJ5IHRoaXMgbW9kdWxlLlxuICAgKi9cbiAgaGFzKG5hbWUpIHtcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZVxuICAgIGlmICh0aGlzLnJlZXhwb3J0cy5oYXMobmFtZSkpIHJldHVybiB0cnVlXG5cbiAgICBmb3IgKGxldCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMudmFsdWVzKCkpIHtcbiAgICAgIGxldCBpbm5lck1hcCA9IGRlcCgpXG5cbiAgICAgIC8vIHRvZG86IHJlcG9ydCBhcyB1bnJlc29sdmVkP1xuICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcblxuICAgICAgaWYgKGlubmVyTWFwLmhhcyhuYW1lKSkgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBlbnN1cmUgdGhhdCBpbXBvcnRlZCBuYW1lIGZ1bGx5IHJlc29sdmVzLlxuICAgKiBAcGFyYW0gIHtbdHlwZV19ICBuYW1lIFtkZXNjcmlwdGlvbl1cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gICAgICBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBoYXNEZWVwKG5hbWUpIHtcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aDogW3RoaXNdIH1cblxuICAgIGlmICh0aGlzLnJlZXhwb3J0cy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHsgbG9jYWwsIGdldEltcG9ydCB9ID0gdGhpcy5yZWV4cG9ydHMuZ2V0KG5hbWUpXG4gICAgICAgICAgLCBpbXBvcnRlZCA9IGdldEltcG9ydCgpXG5cbiAgICAgIC8vIGlmIGltcG9ydCBpcyBpZ25vcmVkLCByZXR1cm4gZXhwbGljaXQgJ251bGwnXG4gICAgICBpZiAoaW1wb3J0ZWQgPT0gbnVsbCkgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IFt0aGlzXSB9XG5cbiAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlcywgb25seSBpZiBuYW1lIG1hdGNoZXNcbiAgICAgIGlmIChpbXBvcnRlZC5wYXRoID09PSB0aGlzLnBhdGggJiYgbG9jYWwgPT09IG5hbWUpIHJldHVybiB7IGZvdW5kOiBmYWxzZSwgcGF0aDogW3RoaXNdIH1cblxuICAgICAgY29uc3QgZGVlcCA9IGltcG9ydGVkLmhhc0RlZXAobG9jYWwpXG4gICAgICBkZWVwLnBhdGgudW5zaGlmdCh0aGlzKVxuXG4gICAgICByZXR1cm4gZGVlcFxuICAgIH1cblxuICAgIGZvciAobGV0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcy52YWx1ZXMoKSkge1xuICAgICAgbGV0IGlubmVyTWFwID0gZGVwKClcbiAgICAgIC8vIHRvZG86IHJlcG9ydCBhcyB1bnJlc29sdmVkP1xuICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcblxuICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzXG4gICAgICBpZiAoaW5uZXJNYXAucGF0aCA9PT0gdGhpcy5wYXRoKSBjb250aW51ZVxuXG4gICAgICBsZXQgaW5uZXJWYWx1ZSA9IGlubmVyTWFwLmhhc0RlZXAobmFtZSlcbiAgICAgIGlmIChpbm5lclZhbHVlLmZvdW5kKSB7XG4gICAgICAgIGlubmVyVmFsdWUucGF0aC51bnNoaWZ0KHRoaXMpXG4gICAgICAgIHJldHVybiBpbm5lclZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZm91bmQ6IGZhbHNlLCBwYXRoOiBbdGhpc10gfVxuICB9XG5cbiAgZ2V0KG5hbWUpIHtcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4gdGhpcy5uYW1lc3BhY2UuZ2V0KG5hbWUpXG5cbiAgICBpZiAodGhpcy5yZWV4cG9ydHMuaGFzKG5hbWUpKSB7XG4gICAgICBjb25zdCB7IGxvY2FsLCBnZXRJbXBvcnQgfSA9IHRoaXMucmVleHBvcnRzLmdldChuYW1lKVxuICAgICAgICAgICwgaW1wb3J0ZWQgPSBnZXRJbXBvcnQoKVxuXG4gICAgICAvLyBpZiBpbXBvcnQgaXMgaWdub3JlZCwgcmV0dXJuIGV4cGxpY2l0ICdudWxsJ1xuICAgICAgaWYgKGltcG9ydGVkID09IG51bGwpIHJldHVybiBudWxsXG5cbiAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlcywgb25seSBpZiBuYW1lIG1hdGNoZXNcbiAgICAgIGlmIChpbXBvcnRlZC5wYXRoID09PSB0aGlzLnBhdGggJiYgbG9jYWwgPT09IG5hbWUpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIGltcG9ydGVkLmdldChsb2NhbClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMudmFsdWVzKCkpIHtcbiAgICAgIGxldCBpbm5lck1hcCA9IGRlcCgpXG4gICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgIGlmICghaW5uZXJNYXApIGNvbnRpbnVlXG5cbiAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlc1xuICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWVcblxuICAgICAgbGV0IGlubmVyVmFsdWUgPSBpbm5lck1hcC5nZXQobmFtZSlcbiAgICAgIGlmIChpbm5lclZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBpbm5lclZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIHRoaXMubmFtZXNwYWNlLmZvckVhY2goKHYsIG4pID0+XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIG4sIHRoaXMpKVxuXG4gICAgdGhpcy5yZWV4cG9ydHMuZm9yRWFjaCgoeyBnZXRJbXBvcnQsIGxvY2FsIH0sIG5hbWUpID0+XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGdldEltcG9ydCgpLmdldChsb2NhbCksIG5hbWUsIHRoaXMpKVxuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4gZGVwKCkuZm9yRWFjaCgodiwgbikgPT5cbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdiwgbiwgdGhpcykpKVxuICB9XG5cbiAgLy8gdG9kbzoga2V5cywgdmFsdWVzLCBlbnRyaWVzP1xuXG4gIHJlcG9ydEVycm9ycyhjb250ZXh0LCBkZWNsYXJhdGlvbikge1xuICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgIG5vZGU6IGRlY2xhcmF0aW9uLnNvdXJjZSxcbiAgICAgIG1lc3NhZ2U6IGBQYXJzZSBlcnJvcnMgaW4gaW1wb3J0ZWQgbW9kdWxlICcke2RlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZX0nOiBgICtcbiAgICAgICAgICAgICAgICAgIGAke3RoaXMuZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGUgPT4gYCR7ZS5tZXNzYWdlfSAoJHtlLmxpbmVOdW1iZXJ9OiR7ZS5jb2x1bW59KWApXG4gICAgICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKX1gLFxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBwYXJzZSBKU0RvYyBmcm9tIHRoZSBmaXJzdCBub2RlIHRoYXQgaGFzIGxlYWRpbmcgY29tbWVudHNcbiAqIEBwYXJhbSAgey4uLlt0eXBlXX0gbm9kZXMgW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7e2RvYzogb2JqZWN0fX1cbiAqL1xuZnVuY3Rpb24gY2FwdHVyZURvYyguLi5ub2Rlcykge1xuICBjb25zdCBtZXRhZGF0YSA9IHt9XG5cbiAgLy8gJ3NvbWUnIHNob3J0LWNpcmN1aXRzIG9uIGZpcnN0ICd0cnVlJ1xuICBub2Rlcy5zb21lKG4gPT4ge1xuICAgIGlmICghbi5sZWFkaW5nQ29tbWVudHMpIHJldHVybiBmYWxzZVxuXG4gICAgLy8gY2FwdHVyZSBYU0RvY1xuICAgIG4ubGVhZGluZ0NvbW1lbnRzLmZvckVhY2goY29tbWVudCA9PiB7XG4gICAgICAvLyBza2lwIG5vbi1ibG9jayBjb21tZW50c1xuICAgICAgaWYgKGNvbW1lbnQudmFsdWUuc2xpY2UoMCwgNCkgIT09ICcqXFxuIConKSByZXR1cm5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1ldGFkYXRhLmRvYyA9IGRvY3RyaW5lLnBhcnNlKGNvbW1lbnQudmFsdWUsIHsgdW53cmFwOiB0cnVlIH0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLyogZG9uJ3QgY2FyZSwgZm9yIG5vdz8gbWF5YmUgYWRkIHRvIGBlcnJvcnM/YCAqL1xuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRydWVcbiAgfSlcblxuICByZXR1cm4gbWV0YWRhdGFcbn1cblxuLyoqXG4gKiBUcmF2ZXJzZSBhIHBhdHRlcm4vaWRlbnRpZmllciBub2RlLCBjYWxsaW5nICdjYWxsYmFjaydcbiAqIGZvciBlYWNoIGxlYWYgaWRlbnRpZmllci5cbiAqIEBwYXJhbSAge25vZGV9ICAgcGF0dGVyblxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUocGF0dGVybiwgY2FsbGJhY2spIHtcbiAgc3dpdGNoIChwYXR0ZXJuLnR5cGUpIHtcbiAgICBjYXNlICdJZGVudGlmaWVyJzogLy8gYmFzZSBjYXNlXG4gICAgICBjYWxsYmFjayhwYXR0ZXJuKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ09iamVjdFBhdHRlcm4nOlxuICAgICAgcGF0dGVybi5wcm9wZXJ0aWVzLmZvckVhY2goKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSh2YWx1ZSwgY2FsbGJhY2spXG4gICAgICB9KVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ0FycmF5UGF0dGVybic6XG4gICAgICBwYXR0ZXJuLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT0gbnVsbCkgcmV0dXJuXG4gICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGVsZW1lbnQsIGNhbGxiYWNrKVxuICAgICAgfSlcbiAgICAgIGJyZWFrXG4gIH1cbn1cbiJdfQ==