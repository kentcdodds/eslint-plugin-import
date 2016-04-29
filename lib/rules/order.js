'use strict';

var _lodash = require('lodash.find');

var _lodash2 = _interopRequireDefault(_lodash);

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultGroups = ['builtin', 'external', 'parent', 'sibling', 'index'];

// REPORTING

function reverse(array) {
  return array.map(function (v) {
    return {
      name: v.name,
      rank: -v.rank,
      node: v.node
    };
  }).reverse();
}

function findOutOfOrder(imported) {
  if (imported.length === 0) {
    return [];
  }
  var maxSeenRankNode = imported[0];
  return imported.filter(function (importedModule) {
    var res = importedModule.rank < maxSeenRankNode.rank;
    if (maxSeenRankNode.rank < importedModule.rank) {
      maxSeenRankNode = importedModule;
    }
    return res;
  });
}

function report(context, imported, outOfOrder, order) {
  outOfOrder.forEach(function (imp) {
    var found = (0, _lodash2.default)(imported, function hasHigherRank(importedItem) {
      return importedItem.rank > imp.rank;
    });
    context.report(imp.node, '`' + imp.name + '` import should occur ' + order + ' import of `' + found.name + '`');
  });
}

function makeReport(context, imported) {
  var outOfOrder = findOutOfOrder(imported);
  if (!outOfOrder.length) {
    return;
  }
  // There are things to report. Try to minimize the number of reported errors.
  var reversedImported = reverse(imported);
  var reversedOrder = findOutOfOrder(reversedImported);
  if (reversedOrder.length < outOfOrder.length) {
    report(context, reversedImported, reversedOrder, 'after');
    return;
  }
  report(context, imported, outOfOrder, 'before');
}

// DETECTING

function computeRank(context, ranks, name, type) {
  return ranks[(0, _importType2.default)(name, context)] + (type === 'import' ? 0 : 100);
}

function registerNode(context, node, name, type, ranks, imported) {
  var rank = computeRank(context, ranks, name, type);
  if (rank !== -1) {
    imported.push({ name: name, rank: rank, node: node });
  }
}

function isInVariableDeclarator(node) {
  return node && (node.type === 'VariableDeclarator' || isInVariableDeclarator(node.parent));
}

var types = ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'];

// Creates an object with type-rank pairs.
// Example: { index: 0, sibling: 1, parent: 1, external: 1, builtin: 2, internal: 2 }
// Will throw an error if it contains a type that does not exist, or has a duplicate
function convertGroupsToRanks(groups) {
  var rankObject = groups.reduce(function (res, group, index) {
    if (typeof group === 'string') {
      group = [group];
    }
    group.forEach(function (groupItem) {
      if (types.indexOf(groupItem) === -1) {
        throw new Error('Incorrect configuration of the rule: Unknown type `' + JSON.stringify(groupItem) + '`');
      }
      if (res[groupItem] !== undefined) {
        throw new Error('Incorrect configuration of the rule: `' + groupItem + '` is duplicated');
      }
      res[groupItem] = index;
    });
    return res;
  }, {});

  var omittedTypes = types.filter(function (type) {
    return rankObject[type] === undefined;
  });

  return omittedTypes.reduce(function (res, type) {
    res[type] = groups.length;
    return res;
  }, rankObject);
}

module.exports = function importOrderRule(context) {
  var options = context.options[0] || {};
  var ranks = void 0;

  try {
    ranks = convertGroupsToRanks(options.groups || defaultGroups);
  } catch (error) {
    // Malformed configuration
    return {
      Program: function Program(node) {
        context.report(node, error.message);
      }
    };
  }
  var imported = [];
  var level = 0;

  function incrementLevel() {
    level++;
  }
  function decrementLevel() {
    level--;
  }

  return {
    ImportDeclaration: function handleImports(node) {
      if (node.specifiers.length) {
        // Ignoring unassigned imports
        var name = node.source.value;
        registerNode(context, node, name, 'import', ranks, imported);
      }
    },
    CallExpression: function handleRequires(node) {
      if (level !== 0 || !(0, _staticRequire2.default)(node) || !isInVariableDeclarator(node.parent)) {
        return;
      }
      var name = node.arguments[0].value;
      registerNode(context, node, name, 'require', ranks, imported);
    },
    'Program:exit': function reportAndReset() {
      makeReport(context, imported);
      imported = [];
    },
    FunctionDeclaration: incrementLevel,
    FunctionExpression: incrementLevel,
    ArrowFunctionExpression: incrementLevel,
    BlockStatement: incrementLevel,
    'FunctionDeclaration:exit': decrementLevel,
    'FunctionExpression:exit': decrementLevel,
    'ArrowFunctionExpression:exit': decrementLevel,
    'BlockStatement:exit': decrementLevel
  };
};

module.exports.schema = [{
  type: 'object',
  properties: {
    groups: {
      type: 'array'
    }
  },
  additionalProperties: false
}];
//# sourceMappingURL=data:application/json;base64,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QixFQUE0QixJQUE1QixFQUFrQyxTQUFsQyxFQUE2QyxLQUE3QyxFQUFvRCxRQUFwRDtBQUNELEtBYkk7QUFjTCxvQkFBZ0IsU0FBUyxjQUFULEdBQTBCO0FBQ3hDLGlCQUFXLE9BQVgsRUFBb0IsUUFBcEI7QUFDQSxpQkFBVyxFQUFYO0FBQ0QsS0FqQkk7QUFrQkwseUJBQXFCLGNBbEJoQjtBQW1CTCx3QkFBb0IsY0FuQmY7QUFvQkwsNkJBQXlCLGNBcEJwQjtBQXFCTCxvQkFBZ0IsY0FyQlg7QUFzQkwsZ0NBQTRCLGNBdEJ2QjtBQXVCTCwrQkFBMkIsY0F2QnRCO0FBd0JMLG9DQUFnQyxjQXhCM0I7QUF5QkwsMkJBQXVCO0FBekJsQixHQUFQO0FBMkJELENBbkREOztBQXFEQSxPQUFPLE9BQVAsQ0FBZSxNQUFmLEdBQXdCLENBQ3RCO0FBQ0UsUUFBTSxRQURSO0FBRUUsY0FBWTtBQUNWLFlBQVE7QUFDTixZQUFNO0FBREE7QUFERSxHQUZkO0FBT0Usd0JBQXNCO0FBUHhCLENBRHNCLENBQXhCIiwiZmlsZSI6InJ1bGVzL29yZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBmaW5kIGZyb20gJ2xvZGFzaC5maW5kJ1xuaW1wb3J0IGltcG9ydFR5cGUgZnJvbSAnLi4vY29yZS9pbXBvcnRUeXBlJ1xuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXG5cbmNvbnN0IGRlZmF1bHRHcm91cHMgPSBbJ2J1aWx0aW4nLCAnZXh0ZXJuYWwnLCAncGFyZW50JywgJ3NpYmxpbmcnLCAnaW5kZXgnXVxuXG4vLyBSRVBPUlRJTkdcblxuZnVuY3Rpb24gcmV2ZXJzZShhcnJheSkge1xuICByZXR1cm4gYXJyYXkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHYubmFtZSxcbiAgICAgIHJhbms6IC12LnJhbmssXG4gICAgICBub2RlOiB2Lm5vZGUsXG4gICAgfVxuICB9KS5yZXZlcnNlKClcbn1cblxuZnVuY3Rpb24gZmluZE91dE9mT3JkZXIoaW1wb3J0ZWQpIHtcbiAgaWYgKGltcG9ydGVkLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXVxuICB9XG4gIGxldCBtYXhTZWVuUmFua05vZGUgPSBpbXBvcnRlZFswXVxuICByZXR1cm4gaW1wb3J0ZWQuZmlsdGVyKGZ1bmN0aW9uIChpbXBvcnRlZE1vZHVsZSkge1xuICAgIGNvbnN0IHJlcyA9IGltcG9ydGVkTW9kdWxlLnJhbmsgPCBtYXhTZWVuUmFua05vZGUucmFua1xuICAgIGlmIChtYXhTZWVuUmFua05vZGUucmFuayA8IGltcG9ydGVkTW9kdWxlLnJhbmspIHtcbiAgICAgIG1heFNlZW5SYW5rTm9kZSA9IGltcG9ydGVkTW9kdWxlXG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVwb3J0KGNvbnRleHQsIGltcG9ydGVkLCBvdXRPZk9yZGVyLCBvcmRlcikge1xuICBvdXRPZk9yZGVyLmZvckVhY2goZnVuY3Rpb24gKGltcCkge1xuICAgIGNvbnN0IGZvdW5kID0gZmluZChpbXBvcnRlZCwgZnVuY3Rpb24gaGFzSGlnaGVyUmFuayhpbXBvcnRlZEl0ZW0pIHtcbiAgICAgIHJldHVybiBpbXBvcnRlZEl0ZW0ucmFuayA+IGltcC5yYW5rXG4gICAgfSlcbiAgICBjb250ZXh0LnJlcG9ydChpbXAubm9kZSwgJ2AnICsgaW1wLm5hbWUgKyAnYCBpbXBvcnQgc2hvdWxkIG9jY3VyICcgKyBvcmRlciArXG4gICAgICAnIGltcG9ydCBvZiBgJyArIGZvdW5kLm5hbWUgKyAnYCcpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIG1ha2VSZXBvcnQoY29udGV4dCwgaW1wb3J0ZWQpIHtcbiAgY29uc3Qgb3V0T2ZPcmRlciA9IGZpbmRPdXRPZk9yZGVyKGltcG9ydGVkKVxuICBpZiAoIW91dE9mT3JkZXIubGVuZ3RoKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgLy8gVGhlcmUgYXJlIHRoaW5ncyB0byByZXBvcnQuIFRyeSB0byBtaW5pbWl6ZSB0aGUgbnVtYmVyIG9mIHJlcG9ydGVkIGVycm9ycy5cbiAgY29uc3QgcmV2ZXJzZWRJbXBvcnRlZCA9IHJldmVyc2UoaW1wb3J0ZWQpXG4gIGNvbnN0IHJldmVyc2VkT3JkZXIgPSBmaW5kT3V0T2ZPcmRlcihyZXZlcnNlZEltcG9ydGVkKVxuICBpZiAocmV2ZXJzZWRPcmRlci5sZW5ndGggPCBvdXRPZk9yZGVyLmxlbmd0aCkge1xuICAgIHJlcG9ydChjb250ZXh0LCByZXZlcnNlZEltcG9ydGVkLCByZXZlcnNlZE9yZGVyLCAnYWZ0ZXInKVxuICAgIHJldHVyblxuICB9XG4gIHJlcG9ydChjb250ZXh0LCBpbXBvcnRlZCwgb3V0T2ZPcmRlciwgJ2JlZm9yZScpXG59XG5cbi8vIERFVEVDVElOR1xuXG5mdW5jdGlvbiBjb21wdXRlUmFuayhjb250ZXh0LCByYW5rcywgbmFtZSwgdHlwZSkge1xuICByZXR1cm4gcmFua3NbaW1wb3J0VHlwZShuYW1lLCBjb250ZXh0KV0gK1xuICAgICh0eXBlID09PSAnaW1wb3J0JyA/IDAgOiAxMDApXG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTm9kZShjb250ZXh0LCBub2RlLCBuYW1lLCB0eXBlLCByYW5rcywgaW1wb3J0ZWQpIHtcbiAgY29uc3QgcmFuayA9IGNvbXB1dGVSYW5rKGNvbnRleHQsIHJhbmtzLCBuYW1lLCB0eXBlKVxuICBpZiAocmFuayAhPT0gLTEpIHtcbiAgICBpbXBvcnRlZC5wdXNoKHtuYW1lLCByYW5rLCBub2RlfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0luVmFyaWFibGVEZWNsYXJhdG9yKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUgJiZcbiAgICAobm9kZS50eXBlID09PSAnVmFyaWFibGVEZWNsYXJhdG9yJyB8fCBpc0luVmFyaWFibGVEZWNsYXJhdG9yKG5vZGUucGFyZW50KSlcbn1cblxuY29uc3QgdHlwZXMgPSBbJ2J1aWx0aW4nLCAnZXh0ZXJuYWwnLCAnaW50ZXJuYWwnLCAncGFyZW50JywgJ3NpYmxpbmcnLCAnaW5kZXgnXVxuXG4vLyBDcmVhdGVzIGFuIG9iamVjdCB3aXRoIHR5cGUtcmFuayBwYWlycy5cbi8vIEV4YW1wbGU6IHsgaW5kZXg6IDAsIHNpYmxpbmc6IDEsIHBhcmVudDogMSwgZXh0ZXJuYWw6IDEsIGJ1aWx0aW46IDIsIGludGVybmFsOiAyIH1cbi8vIFdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgaXQgY29udGFpbnMgYSB0eXBlIHRoYXQgZG9lcyBub3QgZXhpc3QsIG9yIGhhcyBhIGR1cGxpY2F0ZVxuZnVuY3Rpb24gY29udmVydEdyb3Vwc1RvUmFua3MoZ3JvdXBzKSB7XG4gIGNvbnN0IHJhbmtPYmplY3QgPSBncm91cHMucmVkdWNlKGZ1bmN0aW9uKHJlcywgZ3JvdXAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBncm91cCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGdyb3VwID0gW2dyb3VwXVxuICAgIH1cbiAgICBncm91cC5mb3JFYWNoKGZ1bmN0aW9uKGdyb3VwSXRlbSkge1xuICAgICAgaWYgKHR5cGVzLmluZGV4T2YoZ3JvdXBJdGVtKSA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmNvcnJlY3QgY29uZmlndXJhdGlvbiBvZiB0aGUgcnVsZTogVW5rbm93biB0eXBlIGAnICtcbiAgICAgICAgICBKU09OLnN0cmluZ2lmeShncm91cEl0ZW0pICsgJ2AnKVxuICAgICAgfVxuICAgICAgaWYgKHJlc1tncm91cEl0ZW1dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmNvcnJlY3QgY29uZmlndXJhdGlvbiBvZiB0aGUgcnVsZTogYCcgKyBncm91cEl0ZW0gKyAnYCBpcyBkdXBsaWNhdGVkJylcbiAgICAgIH1cbiAgICAgIHJlc1tncm91cEl0ZW1dID0gaW5kZXhcbiAgICB9KVxuICAgIHJldHVybiByZXNcbiAgfSwge30pXG5cbiAgY29uc3Qgb21pdHRlZFR5cGVzID0gdHlwZXMuZmlsdGVyKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICByZXR1cm4gcmFua09iamVjdFt0eXBlXSA9PT0gdW5kZWZpbmVkXG4gIH0pXG5cbiAgcmV0dXJuIG9taXR0ZWRUeXBlcy5yZWR1Y2UoZnVuY3Rpb24ocmVzLCB0eXBlKSB7XG4gICAgcmVzW3R5cGVdID0gZ3JvdXBzLmxlbmd0aFxuICAgIHJldHVybiByZXNcbiAgfSwgcmFua09iamVjdClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbXBvcnRPcmRlclJ1bGUgKGNvbnRleHQpIHtcbiAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fVxuICBsZXQgcmFua3NcblxuICB0cnkge1xuICAgIHJhbmtzID0gY29udmVydEdyb3Vwc1RvUmFua3Mob3B0aW9ucy5ncm91cHMgfHwgZGVmYXVsdEdyb3VwcylcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBNYWxmb3JtZWQgY29uZmlndXJhdGlvblxuICAgIHJldHVybiB7XG4gICAgICBQcm9ncmFtOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsIGVycm9yLm1lc3NhZ2UpXG4gICAgICB9LFxuICAgIH1cbiAgfVxuICBsZXQgaW1wb3J0ZWQgPSBbXVxuICBsZXQgbGV2ZWwgPSAwXG5cbiAgZnVuY3Rpb24gaW5jcmVtZW50TGV2ZWwoKSB7XG4gICAgbGV2ZWwrK1xuICB9XG4gIGZ1bmN0aW9uIGRlY3JlbWVudExldmVsKCkge1xuICAgIGxldmVsLS1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgSW1wb3J0RGVjbGFyYXRpb246IGZ1bmN0aW9uIGhhbmRsZUltcG9ydHMobm9kZSkge1xuICAgICAgaWYgKG5vZGUuc3BlY2lmaWVycy5sZW5ndGgpIHsgLy8gSWdub3JpbmcgdW5hc3NpZ25lZCBpbXBvcnRzXG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLnNvdXJjZS52YWx1ZVxuICAgICAgICByZWdpc3Rlck5vZGUoY29udGV4dCwgbm9kZSwgbmFtZSwgJ2ltcG9ydCcsIHJhbmtzLCBpbXBvcnRlZClcbiAgICAgIH1cbiAgICB9LFxuICAgIENhbGxFeHByZXNzaW9uOiBmdW5jdGlvbiBoYW5kbGVSZXF1aXJlcyhub2RlKSB7XG4gICAgICBpZiAobGV2ZWwgIT09IDAgfHwgIWlzU3RhdGljUmVxdWlyZShub2RlKSB8fCAhaXNJblZhcmlhYmxlRGVjbGFyYXRvcihub2RlLnBhcmVudCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBuYW1lID0gbm9kZS5hcmd1bWVudHNbMF0udmFsdWVcbiAgICAgIHJlZ2lzdGVyTm9kZShjb250ZXh0LCBub2RlLCBuYW1lLCAncmVxdWlyZScsIHJhbmtzLCBpbXBvcnRlZClcbiAgICB9LFxuICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiByZXBvcnRBbmRSZXNldCgpIHtcbiAgICAgIG1ha2VSZXBvcnQoY29udGV4dCwgaW1wb3J0ZWQpXG4gICAgICBpbXBvcnRlZCA9IFtdXG4gICAgfSxcbiAgICBGdW5jdGlvbkRlY2xhcmF0aW9uOiBpbmNyZW1lbnRMZXZlbCxcbiAgICBGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxuICAgIEFycm93RnVuY3Rpb25FeHByZXNzaW9uOiBpbmNyZW1lbnRMZXZlbCxcbiAgICBCbG9ja1N0YXRlbWVudDogaW5jcmVtZW50TGV2ZWwsXG4gICAgJ0Z1bmN0aW9uRGVjbGFyYXRpb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICdGdW5jdGlvbkV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxuICAgICdBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXG4gICAgJ0Jsb2NrU3RhdGVtZW50OmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWEgPSBbXG4gIHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBncm91cHM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gIH0sXG5dXG4iXX0=