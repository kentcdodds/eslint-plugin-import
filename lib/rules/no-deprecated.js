'use strict';

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

var _declaredScope = require('../core/declaredScope');

var _declaredScope2 = _interopRequireDefault(_declaredScope);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var deprecated = new _es6Map2.default(),
      namespaces = new _es6Map2.default();

  function checkSpecifiers(node) {
    if (node.type !== 'ImportDeclaration') return;
    if (node.source == null) return; // local export, ignore

    var imports = _getExports2.default.get(node.source.value, context);
    if (imports == null) return;

    var moduleDeprecation = void 0;
    if (imports.doc && imports.doc.tags.some(function (t) {
      return t.title === 'deprecated' && (moduleDeprecation = t);
    })) {
      context.report({ node: node, message: message(moduleDeprecation) });
    }

    if (imports.errors.length) {
      imports.reportErrors(context, node);
      return;
    }

    node.specifiers.forEach(function (im) {
      var imported = void 0,
          local = void 0;
      switch (im.type) {

        case 'ImportNamespaceSpecifier':
          {
            if (!imports.size) return;
            namespaces.set(im.local.name, imports);
            return;
          }

        case 'ImportDefaultSpecifier':
          imported = 'default';
          local = im.local.name;
          break;

        case 'ImportSpecifier':
          imported = im.imported.name;
          local = im.local.name;
          break;

        default:
          return; // can't handle this one
      }

      // unknown thing can't be deprecated
      if (!imports.has(imported)) return;

      // capture import of deep namespace

      var _imports$get = imports.get(imported);

      var namespace = _imports$get.namespace;

      if (namespace) namespaces.set(local, namespace);

      var deprecation = getDeprecation(imports.get(imported));
      if (!deprecation) return;

      context.report({ node: im, message: message(deprecation) });

      deprecated.set(local, deprecation);
    });
  }

  return {
    'Program': function Program(_ref) {
      var body = _ref.body;
      return body.forEach(checkSpecifiers);
    },

    'Identifier': function Identifier(node) {
      if (node.parent.type === 'MemberExpression' && node.parent.property === node) {
        return; // handled by MemberExpression
      }

      // ignore specifier identifiers
      if (node.parent.type.slice(0, 6) === 'Import') return;

      if (!deprecated.has(node.name)) return;

      if ((0, _declaredScope2.default)(context, node.name) !== 'module') return;
      context.report({
        node: node,
        message: message(deprecated.get(node.name))
      });
    },

    'MemberExpression': function MemberExpression(dereference) {
      if (dereference.object.type !== 'Identifier') return;
      if (!namespaces.has(dereference.object.name)) return;

      if ((0, _declaredScope2.default)(context, dereference.object.name) !== 'module') return;

      // go deep
      var namespace = namespaces.get(dereference.object.name);
      var namepath = [dereference.object.name];
      // while property is namespace and parent is member expression, keep validating
      while (namespace instanceof _getExports2.default && dereference.type === 'MemberExpression') {

        // ignore computed parts for now
        if (dereference.computed) return;

        var metadata = namespace.get(dereference.property.name);

        if (!metadata) break;
        var deprecation = getDeprecation(metadata);

        if (deprecation) {
          context.report({ node: dereference.property, message: message(deprecation) });
        }

        // stash and pop
        namepath.push(dereference.property.name);
        namespace = metadata.namespace;
        dereference = dereference.parent;
      }
    }
  };
};

function message(deprecation) {
  return 'Deprecated' + (deprecation.description ? ': ' + deprecation.description : '.');
}

function getDeprecation(metadata) {
  if (!metadata || !metadata.doc) return;

  var deprecation = void 0;
  if (metadata.doc.tags.some(function (t) {
    return t.title === 'deprecated' && (deprecation = t);
  })) {
    return deprecation;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWRlcHJlY2F0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUVBOzs7O0FBQ0E7Ozs7OztBQUVBLE9BQU8sT0FBUCxHQUFpQixVQUFVLE9BQVYsRUFBbUI7QUFDbEMsTUFBTSxhQUFhLHNCQUFuQjtNQUNNLGFBQWEsc0JBRG5COztBQUdBLFdBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQjtBQUM3QixRQUFJLEtBQUssSUFBTCxLQUFjLG1CQUFsQixFQUF1QztBQUN2QyxRQUFJLEtBQUssTUFBTCxJQUFlLElBQW5CLEVBQXlCLE87O0FBRXpCLFFBQU0sVUFBVSxxQkFBUSxHQUFSLENBQVksS0FBSyxNQUFMLENBQVksS0FBeEIsRUFBK0IsT0FBL0IsQ0FBaEI7QUFDQSxRQUFJLFdBQVcsSUFBZixFQUFxQjs7QUFFckIsUUFBSSwwQkFBSjtBQUNBLFFBQUksUUFBUSxHQUFSLElBQ0EsUUFBUSxHQUFSLENBQVksSUFBWixDQUFpQixJQUFqQixDQUFzQjtBQUFBLGFBQUssRUFBRSxLQUFGLEtBQVksWUFBWixLQUE2QixvQkFBb0IsQ0FBakQsQ0FBTDtBQUFBLEtBQXRCLENBREosRUFDcUY7QUFDbkYsY0FBUSxNQUFSLENBQWUsRUFBRSxVQUFGLEVBQVEsU0FBUyxRQUFRLGlCQUFSLENBQWpCLEVBQWY7QUFDRDs7QUFFRCxRQUFJLFFBQVEsTUFBUixDQUFlLE1BQW5CLEVBQTJCO0FBQ3pCLGNBQVEsWUFBUixDQUFxQixPQUFyQixFQUE4QixJQUE5QjtBQUNBO0FBQ0Q7O0FBRUQsU0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLFVBQVUsRUFBVixFQUFjO0FBQ3BDLFVBQUksaUJBQUo7VUFBYyxjQUFkO0FBQ0EsY0FBUSxHQUFHLElBQVg7O0FBR0UsYUFBSywwQkFBTDtBQUFnQztBQUM5QixnQkFBSSxDQUFDLFFBQVEsSUFBYixFQUFtQjtBQUNuQix1QkFBVyxHQUFYLENBQWUsR0FBRyxLQUFILENBQVMsSUFBeEIsRUFB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MUI7QUFDRDtBQUNGO0FBbERJLEdBQVA7QUFvREQsQ0FuSEQ7O0FBcUhBLFNBQVMsT0FBVCxDQUFpQixXQUFqQixFQUE4QjtBQUM1QixTQUFPLGdCQUFnQixZQUFZLFdBQVosR0FBMEIsT0FBTyxZQUFZLFdBQTdDLEdBQTJELEdBQTNFLENBQVA7QUFDRDs7QUFFRCxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsRUFBa0M7QUFDaEMsTUFBSSxDQUFDLFFBQUQsSUFBYSxDQUFDLFNBQVMsR0FBM0IsRUFBZ0M7O0FBRWhDLE1BQUksb0JBQUo7QUFDQSxNQUFJLFNBQVMsR0FBVCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdUI7QUFBQSxXQUFLLEVBQUUsS0FBRixLQUFZLFlBQVosS0FBNkIsY0FBYyxDQUEzQyxDQUFMO0FBQUEsR0FBdkIsQ0FBSixFQUFnRjtBQUM5RSxXQUFPLFdBQVA7QUFDRDtBQUNGIiwiZmlsZSI6InJ1bGVzL25vLWRlcHJlY2F0ZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTWFwIGZyb20gJ2VzNi1tYXAnXG5cbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL2NvcmUvZ2V0RXhwb3J0cydcbmltcG9ydCBkZWNsYXJlZFNjb3BlIGZyb20gJy4uL2NvcmUvZGVjbGFyZWRTY29wZSdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCBkZXByZWNhdGVkID0gbmV3IE1hcCgpXG4gICAgICAsIG5hbWVzcGFjZXMgPSBuZXcgTWFwKClcblxuICBmdW5jdGlvbiBjaGVja1NwZWNpZmllcnMobm9kZSkge1xuICAgIGlmIChub2RlLnR5cGUgIT09ICdJbXBvcnREZWNsYXJhdGlvbicpIHJldHVyblxuICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gLy8gbG9jYWwgZXhwb3J0LCBpZ25vcmVcblxuICAgIGNvbnN0IGltcG9ydHMgPSBFeHBvcnRzLmdldChub2RlLnNvdXJjZS52YWx1ZSwgY29udGV4dClcbiAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm5cblxuICAgIGxldCBtb2R1bGVEZXByZWNhdGlvblxuICAgIGlmIChpbXBvcnRzLmRvYyAmJlxuICAgICAgICBpbXBvcnRzLmRvYy50YWdzLnNvbWUodCA9PiB0LnRpdGxlID09PSAnZGVwcmVjYXRlZCcgJiYgKG1vZHVsZURlcHJlY2F0aW9uID0gdCkpKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IG1lc3NhZ2UobW9kdWxlRGVwcmVjYXRpb24pIH0pXG4gICAgfVxuXG4gICAgaWYgKGltcG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIG5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChpbSkge1xuICAgICAgbGV0IGltcG9ydGVkLCBsb2NhbFxuICAgICAgc3dpdGNoIChpbS50eXBlKSB7XG5cblxuICAgICAgICBjYXNlICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInOntcbiAgICAgICAgICBpZiAoIWltcG9ydHMuc2l6ZSkgcmV0dXJuXG4gICAgICAgICAgbmFtZXNwYWNlcy5zZXQoaW0ubG9jYWwubmFtZSwgaW1wb3J0cylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInOlxuICAgICAgICAgIGltcG9ydGVkID0gJ2RlZmF1bHQnXG4gICAgICAgICAgbG9jYWwgPSBpbS5sb2NhbC5uYW1lXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdJbXBvcnRTcGVjaWZpZXInOlxuICAgICAgICAgIGltcG9ydGVkID0gaW0uaW1wb3J0ZWQubmFtZVxuICAgICAgICAgIGxvY2FsID0gaW0ubG9jYWwubmFtZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIC8vIGNhbid0IGhhbmRsZSB0aGlzIG9uZVxuICAgICAgfVxuXG4gICAgICAvLyB1bmtub3duIHRoaW5nIGNhbid0IGJlIGRlcHJlY2F0ZWRcbiAgICAgIGlmICghaW1wb3J0cy5oYXMoaW1wb3J0ZWQpKSByZXR1cm5cblxuICAgICAgLy8gY2FwdHVyZSBpbXBvcnQgb2YgZGVlcCBuYW1lc3BhY2VcbiAgICAgIGNvbnN0IHsgbmFtZXNwYWNlIH0gPSBpbXBvcnRzLmdldChpbXBvcnRlZClcbiAgICAgIGlmIChuYW1lc3BhY2UpIG5hbWVzcGFjZXMuc2V0KGxvY2FsLCBuYW1lc3BhY2UpXG5cbiAgICAgIGNvbnN0IGRlcHJlY2F0aW9uID0gZ2V0RGVwcmVjYXRpb24oaW1wb3J0cy5nZXQoaW1wb3J0ZWQpKVxuICAgICAgaWYgKCFkZXByZWNhdGlvbikgcmV0dXJuXG5cbiAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZTogaW0sIG1lc3NhZ2U6IG1lc3NhZ2UoZGVwcmVjYXRpb24pIH0pXG5cbiAgICAgIGRlcHJlY2F0ZWQuc2V0KGxvY2FsLCBkZXByZWNhdGlvbilcblxuICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgICdQcm9ncmFtJzogKHsgYm9keSB9KSA9PiBib2R5LmZvckVhY2goY2hlY2tTcGVjaWZpZXJzKSxcblxuICAgICdJZGVudGlmaWVyJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLnBhcmVudC50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicgJiYgbm9kZS5wYXJlbnQucHJvcGVydHkgPT09IG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIC8vIGhhbmRsZWQgYnkgTWVtYmVyRXhwcmVzc2lvblxuICAgICAgfVxuXG4gICAgICAvLyBpZ25vcmUgc3BlY2lmaWVyIGlkZW50aWZpZXJzXG4gICAgICBpZiAobm9kZS5wYXJlbnQudHlwZS5zbGljZSgwLCA2KSA9PT0gJ0ltcG9ydCcpIHJldHVyblxuXG4gICAgICBpZiAoIWRlcHJlY2F0ZWQuaGFzKG5vZGUubmFtZSkpIHJldHVyblxuXG4gICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBub2RlLm5hbWUpICE9PSAnbW9kdWxlJykgcmV0dXJuXG4gICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgIG5vZGUsXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UoZGVwcmVjYXRlZC5nZXQobm9kZS5uYW1lKSksXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICAnTWVtYmVyRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChkZXJlZmVyZW5jZSkge1xuICAgICAgaWYgKGRlcmVmZXJlbmNlLm9iamVjdC50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVyblxuICAgICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkpIHJldHVyblxuXG4gICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm5cblxuICAgICAgLy8gZ28gZGVlcFxuICAgICAgdmFyIG5hbWVzcGFjZSA9IG5hbWVzcGFjZXMuZ2V0KGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKVxuICAgICAgdmFyIG5hbWVwYXRoID0gW2RlcmVmZXJlbmNlLm9iamVjdC5uYW1lXVxuICAgICAgLy8gd2hpbGUgcHJvcGVydHkgaXMgbmFtZXNwYWNlIGFuZCBwYXJlbnQgaXMgbWVtYmVyIGV4cHJlc3Npb24sIGtlZXAgdmFsaWRhdGluZ1xuICAgICAgd2hpbGUgKG5hbWVzcGFjZSBpbnN0YW5jZW9mIEV4cG9ydHMgJiZcbiAgICAgICAgICAgICBkZXJlZmVyZW5jZS50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicpIHtcblxuICAgICAgICAvLyBpZ25vcmUgY29tcHV0ZWQgcGFydHMgZm9yIG5vd1xuICAgICAgICBpZiAoZGVyZWZlcmVuY2UuY29tcHV0ZWQpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gbmFtZXNwYWNlLmdldChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKVxuXG4gICAgICAgIGlmICghbWV0YWRhdGEpIGJyZWFrXG4gICAgICAgIGNvbnN0IGRlcHJlY2F0aW9uID0gZ2V0RGVwcmVjYXRpb24obWV0YWRhdGEpXG5cbiAgICAgICAgaWYgKGRlcHJlY2F0aW9uKSB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlOiBkZXJlZmVyZW5jZS5wcm9wZXJ0eSwgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGlvbikgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0YXNoIGFuZCBwb3BcbiAgICAgICAgbmFtZXBhdGgucHVzaChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKVxuICAgICAgICBuYW1lc3BhY2UgPSBtZXRhZGF0YS5uYW1lc3BhY2VcbiAgICAgICAgZGVyZWZlcmVuY2UgPSBkZXJlZmVyZW5jZS5wYXJlbnRcbiAgICAgIH1cbiAgICB9LFxuICB9XG59XG5cbmZ1bmN0aW9uIG1lc3NhZ2UoZGVwcmVjYXRpb24pIHtcbiAgcmV0dXJuICdEZXByZWNhdGVkJyArIChkZXByZWNhdGlvbi5kZXNjcmlwdGlvbiA/ICc6ICcgKyBkZXByZWNhdGlvbi5kZXNjcmlwdGlvbiA6ICcuJylcbn1cblxuZnVuY3Rpb24gZ2V0RGVwcmVjYXRpb24obWV0YWRhdGEpIHtcbiAgaWYgKCFtZXRhZGF0YSB8fCAhbWV0YWRhdGEuZG9jKSByZXR1cm5cblxuICBsZXQgZGVwcmVjYXRpb25cbiAgaWYgKG1ldGFkYXRhLmRvYy50YWdzLnNvbWUodCA9PiB0LnRpdGxlID09PSAnZGVwcmVjYXRlZCcgJiYgKGRlcHJlY2F0aW9uID0gdCkpKSB7XG4gICAgcmV0dXJuIGRlcHJlY2F0aW9uXG4gIH1cbn1cbiJdfQ==