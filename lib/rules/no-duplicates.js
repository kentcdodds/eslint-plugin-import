'use strict';

require('es6-symbol/implement');

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _resolve = require('../core/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var imported = new _es6Map2.default();
  return {
    'ImportDeclaration': function ImportDeclaration(n) {
      // resolved path will cover aliased duplicates
      var resolvedPath = (0, _resolve2.default)(n.source.value, context) || n.source.value;

      if (imported.has(resolvedPath)) {
        imported.get(resolvedPath).add(n.source);
      } else {
        imported.set(resolvedPath, new _es6Set2.default([n.source]));
      }
    },

    'Program:exit': function ProgramExit() {
      for (var _iterator = imported.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var _ref2 = _ref;
        var _module = _ref2[0];
        var nodes = _ref2[1];

        if (nodes.size > 1) {
          for (var _iterator2 = nodes, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref3 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref3 = _i2.value;
            }

            var node = _ref3;

            context.report(node, '\'' + _module + '\' imported multiple times.');
          }
        }
      }
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWR1cGxpY2F0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLE9BQVYsRUFBbUI7QUFDbEMsTUFBTSxXQUFXLHNCQUFqQjtBQUNBLFNBQU87QUFDTCx5QkFBcUIsMkJBQVUsQ0FBVixFQUFhOztBQUVoQyxVQUFJLGVBQWUsdUJBQVEsRUFBRSxNQUFGLENBQVMsS0FBakIsRUFBd0IsT0FBeEIsS0FBb0MsRUFBRSxNQUFGLENBQVMsS0FBaEU7O0FBRUEsVUFBSSxTQUFTLEdBQVQsQ0FBYSxZQUFiLENBQUosRUFBZ0M7QUFDOUIsaUJBQVMsR0FBVCxDQUFhLFlBQWIsRUFBMkIsR0FBM0IsQ0FBK0IsRUFBRSxNQUFqQztBQUNELE9BRkQsTUFFTztBQUNMLGlCQUFTLEdBQVQsQ0FBYSxZQUFiLEVBQTJCLHFCQUFRLENBQUMsRUFBRSxNQUFILENBQVIsQ0FBM0I7QUFDRDtBQUNGLEtBVkk7O0FBWUwsb0JBQWdCLHVCQUFZO0FBQzFCLDJCQUE0QixTQUFTLE9BQVQsRUFBNUIsa0hBQWdEO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLFlBQXRDLE9BQXNDO0FBQUEsWUFBOUIsS0FBOEI7O0FBQzlDLFlBQUksTUFBTSxJQUFOLEdBQWEsQ0FBakIsRUFBb0I7QUFDbEIsZ0NBQWlCLEtBQWpCLHlIQUF3QjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsZ0JBQWYsSUFBZTs7QUFDdEIsb0JBQVEsTUFBUixDQUFlLElBQWYsU0FBeUIsT0FBekI7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQXBCSSxHQUFQO0FBc0JELENBeEJEIiwiZmlsZSI6InJ1bGVzL25vLWR1cGxpY2F0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2VzNi1zeW1ib2wvaW1wbGVtZW50J1xuaW1wb3J0IE1hcCBmcm9tICdlczYtbWFwJ1xuaW1wb3J0IFNldCBmcm9tICdlczYtc2V0J1xuXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICcuLi9jb3JlL3Jlc29sdmUnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgY29uc3QgaW1wb3J0ZWQgPSBuZXcgTWFwKClcbiAgcmV0dXJuIHtcbiAgICAnSW1wb3J0RGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobikge1xuICAgICAgLy8gcmVzb2x2ZWQgcGF0aCB3aWxsIGNvdmVyIGFsaWFzZWQgZHVwbGljYXRlc1xuICAgICAgbGV0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUobi5zb3VyY2UudmFsdWUsIGNvbnRleHQpIHx8IG4uc291cmNlLnZhbHVlXG5cbiAgICAgIGlmIChpbXBvcnRlZC5oYXMocmVzb2x2ZWRQYXRoKSkge1xuICAgICAgICBpbXBvcnRlZC5nZXQocmVzb2x2ZWRQYXRoKS5hZGQobi5zb3VyY2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbXBvcnRlZC5zZXQocmVzb2x2ZWRQYXRoLCBuZXcgU2V0KFtuLnNvdXJjZV0pKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gKCkge1xuICAgICAgZm9yIChsZXQgW21vZHVsZSwgbm9kZXNdIG9mIGltcG9ydGVkLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAobm9kZXMuc2l6ZSA+IDEpIHtcbiAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgJyR7bW9kdWxlfScgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMuYClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG4iXX0=