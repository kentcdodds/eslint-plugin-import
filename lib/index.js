'use strict';

exports.__esModule = true;
var rules = exports.rules = {
  'no-unresolved': require('./rules/no-unresolved'),
  'named': require('./rules/named'),
  'default': require('./rules/default'),
  'namespace': require('./rules/namespace'),
  'no-namespace': require('./rules/no-namespace'),
  'export': require('./rules/export'),
  'extensions': require('./rules/extensions'),

  'no-named-as-default': require('./rules/no-named-as-default'),
  'no-named-as-default-member': require('./rules/no-named-as-default-member'),

  'no-commonjs': require('./rules/no-commonjs'),
  'no-amd': require('./rules/no-amd'),
  'no-duplicates': require('./rules/no-duplicates'),
  'imports-first': require('./rules/imports-first'),
  'no-extraneous-dependencies': require('./rules/no-extraneous-dependencies'),
  'no-nodejs-modules': require('./rules/no-nodejs-modules'),
  'order': require('./rules/order'),

  // metadata-based
  'no-deprecated': require('./rules/no-deprecated')
};

var configs = exports.configs = {
  'errors': require('../config/errors'),
  'warnings': require('../config/warnings'),

  // shhhh... work in progress "secret" rules
  'stage-0': require('../config/stage-0')
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLElBQU0sd0JBQVE7QUFDbkIsbUJBQWlCLFFBQVEsdUJBQVIsQ0FERTtBQUVuQixXQUFTLFFBQVEsZUFBUixDQUZVO0FBR25CLGFBQVcsUUFBUSxpQkFBUixDQUhRO0FBSW5CLGVBQWEsUUFBUSxtQkFBUixDQUpNO0FBS25CLGtCQUFnQixRQUFRLHNCQUFSLENBTEc7QUFNbkIsWUFBVSxRQUFRLGdCQUFSLENBTlM7QUFPbkIsZ0JBQWMsUUFBUSxvQkFBUixDQVBLOztBQVNuQix5QkFBdUIsUUFBUSw2QkFBUixDQVRKO0FBVW5CLGdDQUE4QixRQUFRLG9DQUFSLENBVlg7O0FBWW5CLGlCQUFlLFFBQVEscUJBQVIsQ0FaSTtBQWFuQixZQUFVLFFBQVEsZ0JBQVIsQ0FiUztBQWNuQixtQkFBaUIsUUFBUSx1QkFBUixDQWRFO0FBZW5CLG1CQUFpQixRQUFRLHVCQUFSLENBZkU7QUFnQm5CLGdDQUE4QixRQUFRLG9DQUFSLENBaEJYO0FBaUJuQix1QkFBcUIsUUFBUSwyQkFBUixDQWpCRjtBQWtCbkIsV0FBUyxRQUFRLGVBQVIsQ0FsQlU7OztBQXFCbkIsbUJBQWlCLFFBQVEsdUJBQVI7QUFyQkUsQ0FBZDs7QUF3QkEsSUFBTSw0QkFBVTtBQUNyQixZQUFVLFFBQVEsa0JBQVIsQ0FEVztBQUVyQixjQUFZLFFBQVEsb0JBQVIsQ0FGUzs7O0FBS3JCLGFBQVcsUUFBUSxtQkFBUjtBQUxVLENBQWhCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHJ1bGVzID0ge1xuICAnbm8tdW5yZXNvbHZlZCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tdW5yZXNvbHZlZCcpLFxuICAnbmFtZWQnOiByZXF1aXJlKCcuL3J1bGVzL25hbWVkJyksXG4gICdkZWZhdWx0JzogcmVxdWlyZSgnLi9ydWxlcy9kZWZhdWx0JyksXG4gICduYW1lc3BhY2UnOiByZXF1aXJlKCcuL3J1bGVzL25hbWVzcGFjZScpLFxuICAnbm8tbmFtZXNwYWNlJzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lc3BhY2UnKSxcbiAgJ2V4cG9ydCc6IHJlcXVpcmUoJy4vcnVsZXMvZXhwb3J0JyksXG4gICdleHRlbnNpb25zJzogcmVxdWlyZSgnLi9ydWxlcy9leHRlbnNpb25zJyksXG5cbiAgJ25vLW5hbWVkLWFzLWRlZmF1bHQnOiByZXF1aXJlKCcuL3J1bGVzL25vLW5hbWVkLWFzLWRlZmF1bHQnKSxcbiAgJ25vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyJzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlcicpLFxuXG4gICduby1jb21tb25qcyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tY29tbW9uanMnKSxcbiAgJ25vLWFtZCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tYW1kJyksXG4gICduby1kdXBsaWNhdGVzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1kdXBsaWNhdGVzJyksXG4gICdpbXBvcnRzLWZpcnN0JzogcmVxdWlyZSgnLi9ydWxlcy9pbXBvcnRzLWZpcnN0JyksXG4gICduby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMnKSxcbiAgJ25vLW5vZGVqcy1tb2R1bGVzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1ub2RlanMtbW9kdWxlcycpLFxuICAnb3JkZXInOiByZXF1aXJlKCcuL3J1bGVzL29yZGVyJyksXG5cbiAgLy8gbWV0YWRhdGEtYmFzZWRcbiAgJ25vLWRlcHJlY2F0ZWQnOiByZXF1aXJlKCcuL3J1bGVzL25vLWRlcHJlY2F0ZWQnKSxcbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZ3MgPSB7XG4gICdlcnJvcnMnOiByZXF1aXJlKCcuLi9jb25maWcvZXJyb3JzJyksXG4gICd3YXJuaW5ncyc6IHJlcXVpcmUoJy4uL2NvbmZpZy93YXJuaW5ncycpLFxuXG4gIC8vIHNoaGhoLi4uIHdvcmsgaW4gcHJvZ3Jlc3MgXCJzZWNyZXRcIiBydWxlc1xuICAnc3RhZ2UtMCc6IHJlcXVpcmUoJy4uL2NvbmZpZy9zdGFnZS0wJyksXG59XG4iXX0=