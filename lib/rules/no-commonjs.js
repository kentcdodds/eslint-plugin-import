'use strict';

/**
 * @fileoverview Rule to prefer ES6 to CJS
 * @author Jamund Ferguson
 */

var EXPORT_MESSAGE = 'Expected "export" or "export default"',
    IMPORT_MESSAGE = 'Expected "import" instead of "require()"';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

  return {

    'MemberExpression': function MemberExpression(node) {

      // module.exports
      if (node.object.name === 'module' && node.property.name === 'exports') {
        if (allowPrimitive(node, context)) return;
        context.report({ node: node, message: EXPORT_MESSAGE });
      }

      // exports.
      if (node.object.name === 'exports') {
        context.report({ node: node, message: EXPORT_MESSAGE });
      }
    },
    'CallExpression': function CallExpression(call) {
      if (context.getScope().type !== 'module') return;

      if (call.callee.type !== 'Identifier') return;
      if (call.callee.name !== 'require') return;

      if (call.arguments.length !== 1) return;
      var module = call.arguments[0];

      if (module.type !== 'Literal') return;
      if (typeof module.value !== 'string') return;

      // keeping it simple: all 1-string-arg `require` calls are reported
      context.report({
        node: call.callee,
        message: IMPORT_MESSAGE
      });
    }
  };
};

// allow non-objects as module.exports
function allowPrimitive(node, context) {
  if (context.options.indexOf('allow-primitive-modules') < 0) return false;
  if (node.parent.type !== 'AssignmentExpression') return false;
  return node.parent.right.type !== 'ObjectExpression';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWNvbW1vbmpzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFLQSxJQUFNLGlCQUFpQix1Q0FBdkI7SUFDTSxpQkFBaUIsMENBRHZCOzs7Ozs7QUFRQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxPQUFWLEVBQW1COztBQUVsQyxTQUFPOztBQUVMLHdCQUFvQiwwQkFBVSxJQUFWLEVBQWdCOzs7QUFHbEMsVUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLEtBQXFCLFFBQXJCLElBQWlDLEtBQUssUUFBTCxDQUFjLElBQWQsS0FBdUIsU0FBNUQsRUFBdUU7QUFDckUsWUFBSSxlQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FBSixFQUFtQztBQUNuQyxnQkFBUSxNQUFSLENBQWUsRUFBRSxVQUFGLEVBQVEsU0FBUyxjQUFqQixFQUFmO0FBQ0Q7OztBQUdELFVBQUksS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixTQUF6QixFQUFvQztBQUNsQyxnQkFBUSxNQUFSLENBQWUsRUFBRSxVQUFGLEVBQVEsU0FBUyxjQUFqQixFQUFmO0FBQ0Q7QUFFRixLQWZJO0FBZ0JMLHNCQUFrQix3QkFBVSxJQUFWLEVBQWdCO0FBQ2hDLFVBQUksUUFBUSxRQUFSLEdBQW1CLElBQW5CLEtBQTRCLFFBQWhDLEVBQTBDOztBQUUxQyxVQUFJLEtBQUssTUFBTCxDQUFZLElBQVosS0FBcUIsWUFBekIsRUFBdUM7QUFDdkMsVUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLEtBQXFCLFNBQXpCLEVBQW9DOztBQUVwQyxVQUFJLEtBQUssU0FBTCxDQUFlLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7QUFDakMsVUFBSSxTQUFTLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBYjs7QUFFQSxVQUFJLE9BQU8sSUFBUCxLQUFnQixTQUFwQixFQUErQjtBQUMvQixVQUFJLE9BQU8sT0FBTyxLQUFkLEtBQXdCLFFBQTVCLEVBQXNDOzs7QUFHdEMsY0FBUSxNQUFSLENBQWU7QUFDYixjQUFNLEtBQUssTUFERTtBQUViLGlCQUFTO0FBRkksT0FBZjtBQUlEO0FBakNJLEdBQVA7QUFvQ0QsQ0F0Q0Q7OztBQXlDQSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsT0FBOUIsRUFBdUM7QUFDckMsTUFBSSxRQUFRLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBd0IseUJBQXhCLElBQXFELENBQXpELEVBQTRELE9BQU8sS0FBUDtBQUM1RCxNQUFJLEtBQUssTUFBTCxDQUFZLElBQVosS0FBcUIsc0JBQXpCLEVBQWlELE9BQU8sS0FBUDtBQUNqRCxTQUFRLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsSUFBbEIsS0FBMkIsa0JBQW5DO0FBQ0QiLCJmaWxlIjoicnVsZXMvbm8tY29tbW9uanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBwcmVmZXIgRVM2IHRvIENKU1xuICogQGF1dGhvciBKYW11bmQgRmVyZ3Vzb25cbiAqL1xuXG5jb25zdCBFWFBPUlRfTUVTU0FHRSA9ICdFeHBlY3RlZCBcImV4cG9ydFwiIG9yIFwiZXhwb3J0IGRlZmF1bHRcIidcbiAgICAsIElNUE9SVF9NRVNTQUdFID0gJ0V4cGVjdGVkIFwiaW1wb3J0XCIgaW5zdGVhZCBvZiBcInJlcXVpcmUoKVwiJ1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcblxuICByZXR1cm4ge1xuXG4gICAgJ01lbWJlckV4cHJlc3Npb24nOiBmdW5jdGlvbiAobm9kZSkge1xuXG4gICAgICAvLyBtb2R1bGUuZXhwb3J0c1xuICAgICAgaWYgKG5vZGUub2JqZWN0Lm5hbWUgPT09ICdtb2R1bGUnICYmIG5vZGUucHJvcGVydHkubmFtZSA9PT0gJ2V4cG9ydHMnKSB7XG4gICAgICAgIGlmIChhbGxvd1ByaW1pdGl2ZShub2RlLCBjb250ZXh0KSkgcmV0dXJuXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogRVhQT1JUX01FU1NBR0UgfSlcbiAgICAgIH1cblxuICAgICAgLy8gZXhwb3J0cy5cbiAgICAgIGlmIChub2RlLm9iamVjdC5uYW1lID09PSAnZXhwb3J0cycpIHtcbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBFWFBPUlRfTUVTU0FHRSB9KVxuICAgICAgfVxuXG4gICAgfSxcbiAgICAnQ2FsbEV4cHJlc3Npb24nOiBmdW5jdGlvbiAoY2FsbCkge1xuICAgICAgaWYgKGNvbnRleHQuZ2V0U2NvcGUoKS50eXBlICE9PSAnbW9kdWxlJykgcmV0dXJuXG5cbiAgICAgIGlmIChjYWxsLmNhbGxlZS50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVyblxuICAgICAgaWYgKGNhbGwuY2FsbGVlLm5hbWUgIT09ICdyZXF1aXJlJykgcmV0dXJuXG5cbiAgICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHJldHVyblxuICAgICAgdmFyIG1vZHVsZSA9IGNhbGwuYXJndW1lbnRzWzBdXG5cbiAgICAgIGlmIChtb2R1bGUudHlwZSAhPT0gJ0xpdGVyYWwnKSByZXR1cm5cbiAgICAgIGlmICh0eXBlb2YgbW9kdWxlLnZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuXG5cbiAgICAgIC8vIGtlZXBpbmcgaXQgc2ltcGxlOiBhbGwgMS1zdHJpbmctYXJnIGByZXF1aXJlYCBjYWxscyBhcmUgcmVwb3J0ZWRcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgbm9kZTogY2FsbC5jYWxsZWUsXG4gICAgICAgIG1lc3NhZ2U6IElNUE9SVF9NRVNTQUdFLFxuICAgICAgfSlcbiAgICB9LFxuICB9XG5cbn1cblxuICAvLyBhbGxvdyBub24tb2JqZWN0cyBhcyBtb2R1bGUuZXhwb3J0c1xuZnVuY3Rpb24gYWxsb3dQcmltaXRpdmUobm9kZSwgY29udGV4dCkge1xuICBpZiAoY29udGV4dC5vcHRpb25zLmluZGV4T2YoJ2FsbG93LXByaW1pdGl2ZS1tb2R1bGVzJykgPCAwKSByZXR1cm4gZmFsc2VcbiAgaWYgKG5vZGUucGFyZW50LnR5cGUgIT09ICdBc3NpZ25tZW50RXhwcmVzc2lvbicpIHJldHVybiBmYWxzZVxuICByZXR1cm4gKG5vZGUucGFyZW50LnJpZ2h0LnR5cGUgIT09ICdPYmplY3RFeHByZXNzaW9uJylcbn1cbiJdfQ==