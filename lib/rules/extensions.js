'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('../core/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _lodash = require('lodash.endswith');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var configuration = context.options[0] || 'never';

  function isUseOfExtensionEnforced(extension) {
    if ((typeof configuration === 'undefined' ? 'undefined' : _typeof(configuration)) === 'object') {
      return configuration[extension] === 'always';
    }

    return configuration === 'always';
  }

  function isResolvableWithoutExtension(file) {
    var extension = _path2.default.extname(file);
    var fileWithoutExtension = file.slice(0, -extension.length);
    var resolvedFileWithoutExtension = (0, _resolve2.default)(fileWithoutExtension, context);

    return resolvedFileWithoutExtension === (0, _resolve2.default)(file, context);
  }

  function checkFileExtension(node) {
    var source = node.source;

    var importPath = source.value;
    var resolvedPath = (0, _resolve2.default)(importPath, context);
    var extension = _path2.default.extname(resolvedPath).substring(1);

    if (!(0, _lodash2.default)(importPath, extension)) {
      if (isUseOfExtensionEnforced(extension)) {
        context.report({
          node: source,
          message: 'Missing file extension "' + extension + '" for "' + importPath + '"'
        });
      }
    } else {
      if (!isUseOfExtensionEnforced(extension) && isResolvableWithoutExtension(importPath)) {
        context.report({
          node: source,
          message: 'Unexpected use of file extension "' + extension + '" for "' + importPath + '"'
        });
      }
    }
  }

  return {
    ImportDeclaration: checkFileExtension
  };
};

module.exports.schema = [{
  oneOf: [{
    enum: ['always', 'never']
  }, {
    type: 'object',
    patternProperties: {
      '.*': { enum: ['always', 'never'] }
    }
  }]
}];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2V4dGVuc2lvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsT0FBVixFQUFtQjtBQUNsQyxNQUFNLGdCQUFnQixRQUFRLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsT0FBNUM7O0FBRUEsV0FBUyx3QkFBVCxDQUFrQyxTQUFsQyxFQUE2QztBQUMzQyxRQUFJLFFBQU8sYUFBUCx5Q0FBTyxhQUFQLE9BQXlCLFFBQTdCLEVBQXVDO0FBQ3JDLGFBQU8sY0FBYyxTQUFkLE1BQTZCLFFBQXBDO0FBQ0Q7O0FBRUQsV0FBTyxrQkFBa0IsUUFBekI7QUFDRDs7QUFFRCxXQUFTLDRCQUFULENBQXNDLElBQXRDLEVBQTRDO0FBQzFDLFFBQU0sWUFBWSxlQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWxCO0FBQ0EsUUFBTSx1QkFBdUIsS0FBSyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQUMsVUFBVSxNQUF6QixDQUE3QjtBQUNBLFFBQU0sK0JBQStCLHVCQUFRLG9CQUFSLEVBQThCLE9BQTlCLENBQXJDOztBQUVBLFdBQU8saUNBQWlDLHVCQUFRLElBQVIsRUFBYyxPQUFkLENBQXhDO0FBQ0Q7O0FBRUQsV0FBUyxrQkFBVCxDQUE0QixJQUE1QixFQUFrQztBQUFBLFFBQ3hCLE1BRHdCLEdBQ2IsSUFEYSxDQUN4QixNQUR3Qjs7QUFFaEMsUUFBTSxhQUFhLE9BQU8sS0FBMUI7QUFDQSxRQUFNLGVBQWUsdUJBQVEsVUFBUixFQUFvQixPQUFwQixDQUFyQjtBQUNBLFFBQU0sWUFBWSxlQUFLLE9BQUwsQ0FBYSxZQUFiLEVBQTJCLFNBQTNCLENBQXFDLENBQXJDLENBQWxCOztBQUVBLFFBQUksQ0FBQyxzQkFBUyxVQUFULEVBQXFCLFNBQXJCLENBQUwsRUFBc0M7QUFDcEMsVUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUN2QyxnQkFBUSxNQUFSLENBQWU7QUFDYixnQkFBTSxNQURPO0FBRWIsZ0RBQW9DLFNBQXBDLGVBQXVELFVBQXZEO0FBRmEsU0FBZjtBQUlEO0FBQ0YsS0FQRCxNQU9PO0FBQ0wsVUFBSSxDQUFDLHlCQUF5QixTQUF6QixDQUFELElBQXdDLDZCQUE2QixVQUE3QixDQUE1QyxFQUFzRjtBQUNwRixnQkFBUSxNQUFSLENBQWU7QUFDYixnQkFBTSxNQURPO0FBRWIsMERBQThDLFNBQTlDLGVBQWlFLFVBQWpFO0FBRmEsU0FBZjtBQUlEO0FBQ0Y7QUFDRjs7QUFFRCxTQUFPO0FBQ0wsdUJBQW1CO0FBRGQsR0FBUDtBQUdELENBN0NEOztBQStDQSxPQUFPLE9BQVAsQ0FBZSxNQUFmLEdBQXdCLENBQ3RCO0FBQ0UsU0FBTyxDQUNMO0FBQ0UsVUFBTSxDQUFFLFFBQUYsRUFBWSxPQUFaO0FBRFIsR0FESyxFQUlMO0FBQ0UsVUFBTSxRQURSO0FBRUUsdUJBQW1CO0FBQ2pCLFlBQU0sRUFBRSxNQUFNLENBQUUsUUFBRixFQUFZLE9BQVosQ0FBUjtBQURXO0FBRnJCLEdBSks7QUFEVCxDQURzQixDQUF4QiIsImZpbGUiOiJydWxlcy9leHRlbnNpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCByZXNvbHZlIGZyb20gJy4uL2NvcmUvcmVzb2x2ZSdcbmltcG9ydCBlbmRzV2l0aCBmcm9tICdsb2Rhc2guZW5kc3dpdGgnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IGNvbnRleHQub3B0aW9uc1swXSB8fCAnbmV2ZXInXG5cbiAgZnVuY3Rpb24gaXNVc2VPZkV4dGVuc2lvbkVuZm9yY2VkKGV4dGVuc2lvbikge1xuICAgIGlmICh0eXBlb2YgY29uZmlndXJhdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBjb25maWd1cmF0aW9uW2V4dGVuc2lvbl0gPT09ICdhbHdheXMnXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZ3VyYXRpb24gPT09ICdhbHdheXMnXG4gIH1cblxuICBmdW5jdGlvbiBpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uKGZpbGUpIHtcbiAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSlcbiAgICBjb25zdCBmaWxlV2l0aG91dEV4dGVuc2lvbiA9IGZpbGUuc2xpY2UoMCwgLWV4dGVuc2lvbi5sZW5ndGgpXG4gICAgY29uc3QgcmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiA9IHJlc29sdmUoZmlsZVdpdGhvdXRFeHRlbnNpb24sIGNvbnRleHQpXG5cbiAgICByZXR1cm4gcmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiA9PT0gcmVzb2x2ZShmaWxlLCBjb250ZXh0KVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tGaWxlRXh0ZW5zaW9uKG5vZGUpIHtcbiAgICBjb25zdCB7IHNvdXJjZSB9ID0gbm9kZVxuICAgIGNvbnN0IGltcG9ydFBhdGggPSBzb3VyY2UudmFsdWVcbiAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKGltcG9ydFBhdGgsIGNvbnRleHQpXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKHJlc29sdmVkUGF0aCkuc3Vic3RyaW5nKDEpXG5cbiAgICBpZiAoIWVuZHNXaXRoKGltcG9ydFBhdGgsIGV4dGVuc2lvbikpIHtcbiAgICAgIGlmIChpc1VzZU9mRXh0ZW5zaW9uRW5mb3JjZWQoZXh0ZW5zaW9uKSkge1xuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgbm9kZTogc291cmNlLFxuICAgICAgICAgIG1lc3NhZ2U6IGBNaXNzaW5nIGZpbGUgZXh0ZW5zaW9uIFwiJHtleHRlbnNpb259XCIgZm9yIFwiJHtpbXBvcnRQYXRofVwiYCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFpc1VzZU9mRXh0ZW5zaW9uRW5mb3JjZWQoZXh0ZW5zaW9uKSAmJiBpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uKGltcG9ydFBhdGgpKSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICBub2RlOiBzb3VyY2UsXG4gICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgdXNlIG9mIGZpbGUgZXh0ZW5zaW9uIFwiJHtleHRlbnNpb259XCIgZm9yIFwiJHtpbXBvcnRQYXRofVwiYCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIEltcG9ydERlY2xhcmF0aW9uOiBjaGVja0ZpbGVFeHRlbnNpb24sXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICB7XG4gICAgb25lT2Y6IFtcbiAgICAgIHtcbiAgICAgICAgZW51bTogWyAnYWx3YXlzJywgJ25ldmVyJyBdLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHBhdHRlcm5Qcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgJy4qJzogeyBlbnVtOiBbICdhbHdheXMnLCAnbmV2ZXInIF0gfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbl1cbiJdfQ==