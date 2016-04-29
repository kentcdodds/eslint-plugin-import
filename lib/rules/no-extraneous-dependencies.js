'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pkgUp = require('pkg-up');

var _pkgUp2 = _interopRequireDefault(_pkgUp);

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDependencies(context) {
  var filepath = _pkgUp2.default.sync(context.getFilename());
  if (!filepath) {
    return null;
  }

  try {
    var packageContent = JSON.parse(_fs2.default.readFileSync(filepath, 'utf8'));
    return {
      dependencies: packageContent.dependencies || {},
      devDependencies: packageContent.devDependencies || {}
    };
  } catch (e) {
    return null;
  }
}

function missingErrorMessage(packageName) {
  return '\'' + packageName + '\' is not listed in the project\'s dependencies. ' + ('Run \'npm i -S ' + packageName + '\' to add it');
}

function devDepErrorMessage(packageName) {
  return '\'' + packageName + '\' is not listed in the project\'s dependencies, not devDependencies.';
}

function reportIfMissing(context, deps, allowDevDeps, node, name) {
  if ((0, _importType2.default)(name, context) !== 'external') {
    return;
  }
  var packageName = name.split('/')[0];

  if (deps.dependencies[packageName] === undefined) {
    if (!allowDevDeps) {
      context.report(node, devDepErrorMessage(packageName));
    } else if (deps.devDependencies[packageName] === undefined) {
      context.report(node, missingErrorMessage(packageName));
    }
  }
}

module.exports = function (context) {
  var options = context.options[0] || {};
  var allowDevDeps = options.devDependencies !== false;
  var deps = getDependencies(context);

  if (!deps) {
    return {};
  }

  // todo: use module visitor from module-utils core
  return {
    ImportDeclaration: function ImportDeclaration(node) {
      reportIfMissing(context, deps, allowDevDeps, node, node.source.value);
    },
    CallExpression: function handleRequires(node) {
      if ((0, _staticRequire2.default)(node)) {
        reportIfMissing(context, deps, allowDevDeps, node, node.arguments[0].value);
      }
    }
  };
};

module.exports.schema = [{
  'type': 'object',
  'properties': {
    'devDependencies': { 'type': 'boolean' }
  },
  'additionalProperties': false
}];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLFNBQVMsZUFBVCxDQUF5QixPQUF6QixFQUFrQztBQUNoQyxNQUFNLFdBQVcsZ0JBQU0sSUFBTixDQUFXLFFBQVEsV0FBUixFQUFYLENBQWpCO0FBQ0EsTUFBSSxDQUFDLFFBQUwsRUFBZTtBQUNiLFdBQU8sSUFBUDtBQUNEOztBQUVELE1BQUk7QUFDRixRQUFNLGlCQUFpQixLQUFLLEtBQUwsQ0FBVyxhQUFHLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsTUFBMUIsQ0FBWCxDQUF2QjtBQUNBLFdBQU87QUFDTCxvQkFBYyxlQUFlLFlBQWYsSUFBK0IsRUFEeEM7QUFFTCx1QkFBaUIsZUFBZSxlQUFmLElBQWtDO0FBRjlDLEtBQVA7QUFJRCxHQU5ELENBTUUsT0FBTyxDQUFQLEVBQVU7QUFDVixXQUFPLElBQVA7QUFDRDtBQUNGOztBQUVELFNBQVMsbUJBQVQsQ0FBNkIsV0FBN0IsRUFBMEM7QUFDeEMsU0FBTyxPQUFJLFdBQUosOEVBQ1UsV0FEVixrQkFBUDtBQUVEOztBQUVELFNBQVMsa0JBQVQsQ0FBNEIsV0FBNUIsRUFBeUM7QUFDdkMsZ0JBQVcsV0FBWDtBQUNEOztBQUVELFNBQVMsZUFBVCxDQUF5QixPQUF6QixFQUFrQyxJQUFsQyxFQUF3QyxZQUF4QyxFQUFzRCxJQUF0RCxFQUE0RCxJQUE1RCxFQUFrRTtBQUNoRSxNQUFJLDBCQUFXLElBQVgsRUFBaUIsT0FBakIsTUFBOEIsVUFBbEMsRUFBOEM7QUFDNUM7QUFDRDtBQUNELE1BQU0sY0FBYyxLQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLENBQWhCLENBQXBCOztBQUVBLE1BQUksS0FBSyxZQUFMLENBQWtCLFdBQWxCLE1BQW1DLFNBQXZDLEVBQWtEO0FBQ2hELFFBQUksQ0FBQyxZQUFMLEVBQW1CO0FBQ2pCLGNBQVEsTUFBUixDQUFlLElBQWYsRUFBcUIsbUJBQW1CLFdBQW5CLENBQXJCO0FBQ0QsS0FGRCxNQUVPLElBQUksS0FBSyxlQUFMLENBQXFCLFdBQXJCLE1BQXNDLFNBQTFDLEVBQXFEO0FBQzFELGNBQVEsTUFBUixDQUFlLElBQWYsRUFBcUIsb0JBQW9CLFdBQXBCLENBQXJCO0FBQ0Q7QUFDRjtBQUNGOztBQUVELE9BQU8sT0FBUCxHQUFpQixVQUFVLE9BQVYsRUFBbUI7QUFDbEMsTUFBTSxVQUFVLFFBQVEsT0FBUixDQUFnQixDQUFoQixLQUFzQixFQUF0QztBQUNBLE1BQU0sZUFBZSxRQUFRLGVBQVIsS0FBNEIsS0FBakQ7QUFDQSxNQUFNLE9BQU8sZ0JBQWdCLE9BQWhCLENBQWI7O0FBRUEsTUFBSSxDQUFDLElBQUwsRUFBVztBQUNULFdBQU8sRUFBUDtBQUNEOzs7QUFHRCxTQUFPO0FBQ0wsdUJBQW1CLDJCQUFVLElBQVYsRUFBZ0I7QUFDakMsc0JBQWdCLE9BQWhCLEVBQXlCLElBQXpCLEVBQStCLFlBQS9CLEVBQTZDLElBQTdDLEVBQW1ELEtBQUssTUFBTCxDQUFZLEtBQS9EO0FBQ0QsS0FISTtBQUlMLG9CQUFnQixTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEI7QUFDNUMsVUFBSSw2QkFBZ0IsSUFBaEIsQ0FBSixFQUEyQjtBQUN6Qix3QkFBZ0IsT0FBaEIsRUFBeUIsSUFBekIsRUFBK0IsWUFBL0IsRUFBNkMsSUFBN0MsRUFBbUQsS0FBSyxTQUFMLENBQWUsQ0FBZixFQUFrQixLQUFyRTtBQUNEO0FBQ0Y7QUFSSSxHQUFQO0FBVUQsQ0FwQkQ7O0FBc0JBLE9BQU8sT0FBUCxDQUFlLE1BQWYsR0FBd0IsQ0FDdEI7QUFDRSxVQUFRLFFBRFY7QUFFRSxnQkFBYztBQUNaLHVCQUFtQixFQUFFLFFBQVEsU0FBVjtBQURQLEdBRmhCO0FBS0UsMEJBQXdCO0FBTDFCLENBRHNCLENBQXhCIiwiZmlsZSI6InJ1bGVzL25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBrZ1VwIGZyb20gJ3BrZy11cCdcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSdcbmltcG9ydCBpc1N0YXRpY1JlcXVpcmUgZnJvbSAnLi4vY29yZS9zdGF0aWNSZXF1aXJlJ1xuXG5mdW5jdGlvbiBnZXREZXBlbmRlbmNpZXMoY29udGV4dCkge1xuICBjb25zdCBmaWxlcGF0aCA9IHBrZ1VwLnN5bmMoY29udGV4dC5nZXRGaWxlbmFtZSgpKVxuICBpZiAoIWZpbGVwYXRoKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFja2FnZUNvbnRlbnQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwgJ3V0ZjgnKSlcbiAgICByZXR1cm4ge1xuICAgICAgZGVwZW5kZW5jaWVzOiBwYWNrYWdlQ29udGVudC5kZXBlbmRlbmNpZXMgfHwge30sXG4gICAgICBkZXZEZXBlbmRlbmNpZXM6IHBhY2thZ2VDb250ZW50LmRldkRlcGVuZGVuY2llcyB8fCB7fSxcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmZ1bmN0aW9uIG1pc3NpbmdFcnJvck1lc3NhZ2UocGFja2FnZU5hbWUpIHtcbiAgcmV0dXJuIGAnJHtwYWNrYWdlTmFtZX0nIGlzIG5vdCBsaXN0ZWQgaW4gdGhlIHByb2plY3QncyBkZXBlbmRlbmNpZXMuIGAgK1xuICBgUnVuICducG0gaSAtUyAke3BhY2thZ2VOYW1lfScgdG8gYWRkIGl0YFxufVxuXG5mdW5jdGlvbiBkZXZEZXBFcnJvck1lc3NhZ2UocGFja2FnZU5hbWUpIHtcbiAgcmV0dXJuIGAnJHtwYWNrYWdlTmFtZX0nIGlzIG5vdCBsaXN0ZWQgaW4gdGhlIHByb2plY3QncyBkZXBlbmRlbmNpZXMsIG5vdCBkZXZEZXBlbmRlbmNpZXMuYFxufVxuXG5mdW5jdGlvbiByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgZGVwcywgYWxsb3dEZXZEZXBzLCBub2RlLCBuYW1lKSB7XG4gIGlmIChpbXBvcnRUeXBlKG5hbWUsIGNvbnRleHQpICE9PSAnZXh0ZXJuYWwnKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgcGFja2FnZU5hbWUgPSBuYW1lLnNwbGl0KCcvJylbMF1cblxuICBpZiAoZGVwcy5kZXBlbmRlbmNpZXNbcGFja2FnZU5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoIWFsbG93RGV2RGVwcykge1xuICAgICAgY29udGV4dC5yZXBvcnQobm9kZSwgZGV2RGVwRXJyb3JNZXNzYWdlKHBhY2thZ2VOYW1lKSlcbiAgICB9IGVsc2UgaWYgKGRlcHMuZGV2RGVwZW5kZW5jaWVzW3BhY2thZ2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBtaXNzaW5nRXJyb3JNZXNzYWdlKHBhY2thZ2VOYW1lKSlcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9XG4gIGNvbnN0IGFsbG93RGV2RGVwcyA9IG9wdGlvbnMuZGV2RGVwZW5kZW5jaWVzICE9PSBmYWxzZVxuICBjb25zdCBkZXBzID0gZ2V0RGVwZW5kZW5jaWVzKGNvbnRleHQpXG5cbiAgaWYgKCFkZXBzKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICAvLyB0b2RvOiB1c2UgbW9kdWxlIHZpc2l0b3IgZnJvbSBtb2R1bGUtdXRpbHMgY29yZVxuICByZXR1cm4ge1xuICAgIEltcG9ydERlY2xhcmF0aW9uOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmVwb3J0SWZNaXNzaW5nKGNvbnRleHQsIGRlcHMsIGFsbG93RGV2RGVwcywgbm9kZSwgbm9kZS5zb3VyY2UudmFsdWUpXG4gICAgfSxcbiAgICBDYWxsRXhwcmVzc2lvbjogZnVuY3Rpb24gaGFuZGxlUmVxdWlyZXMobm9kZSkge1xuICAgICAgaWYgKGlzU3RhdGljUmVxdWlyZShub2RlKSkge1xuICAgICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgZGVwcywgYWxsb3dEZXZEZXBzLCBub2RlLCBub2RlLmFyZ3VtZW50c1swXS52YWx1ZSlcbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAge1xuICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgJ3Byb3BlcnRpZXMnOiB7XG4gICAgICAnZGV2RGVwZW5kZW5jaWVzJzogeyAndHlwZSc6ICdib29sZWFuJyB9LFxuICAgIH0sXG4gICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXG4gIH0sXG5dXG4iXX0=