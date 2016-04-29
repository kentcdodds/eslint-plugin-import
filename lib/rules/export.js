'use strict';

require('es6-symbol/implement');

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var named = new _es6Map2.default();

  function addNamed(name, node) {
    var nodes = named.get(name);

    if (nodes == null) {
      nodes = new _es6Set2.default();
      named.set(name, nodes);
    }

    nodes.add(node);
  }

  return {
    'ExportDefaultDeclaration': function ExportDefaultDeclaration(node) {
      return addNamed('default', node);
    },

    'ExportSpecifier': function ExportSpecifier(node) {
      addNamed(node.exported.name, node.exported);
    },

    'ExportNamedDeclaration': function ExportNamedDeclaration(node) {
      if (node.declaration == null) return;

      if (node.declaration.id != null) {
        addNamed(node.declaration.id.name, node.declaration.id);
      }

      if (node.declaration.declarations != null) {
        for (var _iterator = node.declaration.declarations, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var declaration = _ref;

          (0, _getExports.recursivePatternCapture)(declaration.id, function (v) {
            return addNamed(v.name, v);
          });
        }
      }
    },

    'ExportAllDeclaration': function ExportAllDeclaration(node) {
      if (node.source == null) return; // not sure if this is ever true

      var remoteExports = _getExports2.default.get(node.source.value, context);
      if (remoteExports == null) return;

      if (remoteExports.errors.length) {
        remoteExports.reportErrors(context, node);
        return;
      }
      var any = false;
      remoteExports.forEach(function (v, name) {
        return (any = true) && addNamed(name, node);
      });

      if (!any) {
        context.report(node.source, 'No named exports found in module \'' + node.source.value + '\'.');
      }
    },

    'Program:exit': function ProgramExit() {
      for (var _iterator2 = named, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var _ref3 = _ref2;
        var name = _ref3[0];
        var nodes = _ref3[1];

        if (nodes.size <= 1) continue;

        for (var _iterator3 = nodes, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref4;

          if (_isArray3) {
            if (_i3 >= _iterator3.length) break;
            _ref4 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) break;
            _ref4 = _i3.value;
          }

          var node = _ref4;

          if (name === 'default') {
            context.report(node, 'Multiple default exports.');
          } else context.report(node, 'Multiple exports of name \'' + name + '\'.');
        }
      }
    }
  };
};
//# sourceMappingURL=data:application/json;base64,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QUFlLElBQWYsRUFBcUIsMkJBQXJCO0FBQ0QsV0FGRCxNQUVPLFFBQVEsTUFBUixDQUFlLElBQWYsa0NBQWtELElBQWxEO0FBQ1I7QUFDRjtBQUNGO0FBbERJLEdBQVA7QUFvREQsQ0FsRUQiLCJmaWxlIjoicnVsZXMvZXhwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdlczYtc3ltYm9sL2ltcGxlbWVudCdcbmltcG9ydCBNYXAgZnJvbSAnZXM2LW1hcCdcbmltcG9ydCBTZXQgZnJvbSAnZXM2LXNldCdcblxuaW1wb3J0IEV4cG9ydE1hcCwgeyByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSB9IGZyb20gJy4uL2NvcmUvZ2V0RXhwb3J0cydcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCBuYW1lZCA9IG5ldyBNYXAoKVxuXG4gIGZ1bmN0aW9uIGFkZE5hbWVkKG5hbWUsIG5vZGUpIHtcbiAgICBsZXQgbm9kZXMgPSBuYW1lZC5nZXQobmFtZSlcblxuICAgIGlmIChub2RlcyA9PSBudWxsKSB7XG4gICAgICBub2RlcyA9IG5ldyBTZXQoKVxuICAgICAgbmFtZWQuc2V0KG5hbWUsIG5vZGVzKVxuICAgIH1cblxuICAgIG5vZGVzLmFkZChub2RlKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJzogKG5vZGUpID0+IGFkZE5hbWVkKCdkZWZhdWx0Jywgbm9kZSksXG5cbiAgICAnRXhwb3J0U3BlY2lmaWVyJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGFkZE5hbWVkKG5vZGUuZXhwb3J0ZWQubmFtZSwgbm9kZS5leHBvcnRlZClcbiAgICB9LFxuXG4gICAgJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24gPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcbiAgICAgICAgYWRkTmFtZWQobm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lLCBub2RlLmRlY2xhcmF0aW9uLmlkKVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKGxldCBkZWNsYXJhdGlvbiBvZiBub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucykge1xuICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGRlY2xhcmF0aW9uLmlkLCB2ID0+IGFkZE5hbWVkKHYubmFtZSwgdikpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgJ0V4cG9ydEFsbERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gLy8gbm90IHN1cmUgaWYgdGhpcyBpcyBldmVyIHRydWVcblxuICAgICAgY29uc3QgcmVtb3RlRXhwb3J0cyA9IEV4cG9ydE1hcC5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXG4gICAgICBpZiAocmVtb3RlRXhwb3J0cyA9PSBudWxsKSByZXR1cm5cblxuICAgICAgaWYgKHJlbW90ZUV4cG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICByZW1vdGVFeHBvcnRzLnJlcG9ydEVycm9ycyhjb250ZXh0LCBub2RlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxldCBhbnkgPSBmYWxzZVxuICAgICAgcmVtb3RlRXhwb3J0cy5mb3JFYWNoKCh2LCBuYW1lKSA9PiAoYW55ID0gdHJ1ZSkgJiYgYWRkTmFtZWQobmFtZSwgbm9kZSkpXG5cbiAgICAgIGlmICghYW55KSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUuc291cmNlLFxuICAgICAgICAgIGBObyBuYW1lZCBleHBvcnRzIGZvdW5kIGluIG1vZHVsZSAnJHtub2RlLnNvdXJjZS52YWx1ZX0nLmApXG4gICAgICB9XG4gICAgfSxcblxuICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICBmb3IgKGxldCBbbmFtZSwgbm9kZXNdIG9mIG5hbWVkKSB7XG4gICAgICAgIGlmIChub2Rlcy5zaXplIDw9IDEpIGNvbnRpbnVlXG5cbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICAgIGlmIChuYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsICdNdWx0aXBsZSBkZWZhdWx0IGV4cG9ydHMuJylcbiAgICAgICAgICB9IGVsc2UgY29udGV4dC5yZXBvcnQobm9kZSwgYE11bHRpcGxlIGV4cG9ydHMgb2YgbmFtZSAnJHtuYW1lfScuYClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH1cbn1cbiJdfQ==