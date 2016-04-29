'use strict';

exports.__esModule = true;
exports.CASE_SENSITIVE_FS = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.relative = relative;
exports.default = resolve;

require('es6-symbol/implement');

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _crypto = require('crypto');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CASE_SENSITIVE_FS = exports.CASE_SENSITIVE_FS = !_fs2.default.existsSync((0, _path.join)(__dirname, 'reSOLVE.js'));

var fileExistsCache = new _es6Map2.default();

function cachePath(cacheKey, result) {
  fileExistsCache.set(cacheKey, { result: result, lastSeen: Date.now() });
}

function checkCache(cacheKey, _ref) {
  var lifetime = _ref.lifetime;

  if (fileExistsCache.has(cacheKey)) {
    var _fileExistsCache$get = fileExistsCache.get(cacheKey);

    var result = _fileExistsCache$get.result;
    var lastSeen = _fileExistsCache$get.lastSeen;
    // check fresness

    if (Date.now() - lastSeen < lifetime * 1000) return result;
  }
  // cache miss
  return undefined;
}

// http://stackoverflow.com/a/27382838
function fileExistsWithCaseSync(filepath, cacheSettings) {
  // don't care if the FS is case-sensitive
  if (CASE_SENSITIVE_FS) return true;

  // null means it resolved to a builtin
  if (filepath === null) return true;

  var dir = (0, _path.dirname)(filepath);

  var result = checkCache(filepath, cacheSettings);
  if (result != null) return result;

  // base case
  if (dir === '/' || dir === '.' || /^[A-Z]:\\$/i.test(dir)) {
    result = true;
  } else {
    var filenames = _fs2.default.readdirSync(dir);
    if (filenames.indexOf((0, _path.basename)(filepath)) === -1) {
      result = false;
    } else {
      result = fileExistsWithCaseSync(dir, cacheSettings);
    }
  }
  cachePath(filepath, result);
  return result;
}

function relative(modulePath, sourceFile, settings) {

  var sourceDir = (0, _path.dirname)(sourceFile),
      cacheKey = sourceDir + hashObject(settings) + modulePath;

  var cacheSettings = (0, _objectAssign2.default)({
    lifetime: 30 }, // seconds
  settings['import/cache']);

  // parse infinity
  if (cacheSettings.lifetime === '∞' || cacheSettings.lifetime === 'Infinity') {
    cacheSettings.lifetime = Infinity;
  }

  var cachedPath = checkCache(cacheKey, cacheSettings);
  if (cachedPath !== undefined) return cachedPath;

  function cache(path) {
    cachePath(cacheKey, path);
    return path;
  }

  function withResolver(resolver, config) {

    function v1() {
      try {
        var path = resolver.resolveImport(modulePath, sourceFile, config);
        if (path === undefined) return { found: false };
        return { found: true, path: path };
      } catch (err) {
        return { found: false };
      }
    }

    function v2() {
      return resolver.resolve(modulePath, sourceFile, config);
    }

    switch (resolver.interfaceVersion) {
      case 2:
        return v2();

      default:
      case 1:
        return v1();
    }
  }

  var configResolvers = settings['import/resolver'] || { 'node': settings['import/resolve'] }; // backward compatibility

  var resolvers = resolverReducer(configResolvers, new _es6Map2.default());

  for (var _iterator = resolvers, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref2 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref2 = _i.value;
    }

    var _ref3 = _ref2;
    var name = _ref3[0];
    var config = _ref3[1];

    var resolver = requireResolver(name);

    var _withResolver = withResolver(resolver, config);

    var fullPath = _withResolver.path;
    var found = _withResolver.found;

    // resolvers imply file existence, this double-check just ensures the case matches

    if (fullPath !== null && found && !fileExistsWithCaseSync(fullPath, cacheSettings)) {
      // reject resolved path
      fullPath = undefined;
    }

    if (found) return cache(fullPath);
  }

  return cache(undefined);
}

function resolverReducer(resolvers, map) {
  if (resolvers instanceof Array) {
    resolvers.forEach(function (r) {
      return resolverReducer(r, map);
    });
    return map;
  }

  if (typeof resolvers === 'string') {
    map.set(resolvers, null);
    return map;
  }

  if ((typeof resolvers === 'undefined' ? 'undefined' : _typeof(resolvers)) === 'object') {
    for (var key in resolvers) {
      map.set(key, resolvers[key]);
    }
    return map;
  }

  throw new Error('invalid resolver config');
}

function requireResolver(name) {
  try {
    return require('eslint-import-resolver-' + name);
  } catch (err) {
    throw new Error('unable to load resolver "' + name + '".');
  }
}

var erroredContexts = new _es6Set2.default();

/**
 * Given
 * @param  {string} p - module path
 * @param  {object} context - ESLint context
 * @return {string} - the full module filesystem path;
 *                    null if package is core;
 *                    undefined if not found
 */
function resolve(p, context) {
  try {
    return relative(p, context.getFilename(), context.settings);
  } catch (err) {
    if (!erroredContexts.has(context)) {
      context.report({
        message: 'Resolve error: ' + err.message,
        loc: { line: 1, col: 0 }
      });
      erroredContexts.add(context);
    }
  }
}
resolve.relative = relative;

function hashObject(object) {
  var settingsShasum = (0, _crypto.createHash)('sha1');
  settingsShasum.update(JSON.stringify(object));
  return settingsShasum.digest('hex');
}
//# sourceMappingURL=data:application/json;base64,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LENBQW9CLE9BQXBCLENBQUwsRUFBbUM7QUFDakMsY0FBUSxNQUFSLENBQWU7QUFDYixxQ0FBMkIsSUFBSSxPQURsQjtBQUViLGFBQUssRUFBRSxNQUFNLENBQVIsRUFBVyxLQUFLLENBQWhCO0FBRlEsT0FBZjtBQUlBLHNCQUFnQixHQUFoQixDQUFvQixPQUFwQjtBQUNEO0FBQ0Y7QUFDRjtBQUNELFFBQVEsUUFBUixHQUFtQixRQUFuQjs7QUFJQSxTQUFTLFVBQVQsQ0FBb0IsTUFBcEIsRUFBNEI7QUFDMUIsTUFBTSxpQkFBaUIsd0JBQVcsTUFBWCxDQUF2QjtBQUNBLGlCQUFlLE1BQWYsQ0FBc0IsS0FBSyxTQUFMLENBQWUsTUFBZixDQUF0QjtBQUNBLFNBQU8sZUFBZSxNQUFmLENBQXNCLEtBQXRCLENBQVA7QUFDRCIsImZpbGUiOiJjb3JlL3Jlc29sdmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2VzNi1zeW1ib2wvaW1wbGVtZW50J1xuaW1wb3J0IE1hcCBmcm9tICdlczYtbWFwJ1xuaW1wb3J0IFNldCBmcm9tICdlczYtc2V0J1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgeyBkaXJuYW1lLCBiYXNlbmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBjb25zdCBDQVNFX1NFTlNJVElWRV9GUyA9ICFmcy5leGlzdHNTeW5jKGpvaW4oX19kaXJuYW1lLCAncmVTT0xWRS5qcycpKVxuXG5jb25zdCBmaWxlRXhpc3RzQ2FjaGUgPSBuZXcgTWFwKClcblxuZnVuY3Rpb24gY2FjaGVQYXRoKGNhY2hlS2V5LCByZXN1bHQpIHtcbiAgZmlsZUV4aXN0c0NhY2hlLnNldChjYWNoZUtleSwgeyByZXN1bHQsIGxhc3RTZWVuOiBEYXRlLm5vdygpIH0pXG59XG5cbmZ1bmN0aW9uIGNoZWNrQ2FjaGUoY2FjaGVLZXksIHsgbGlmZXRpbWUgfSkge1xuICBpZiAoZmlsZUV4aXN0c0NhY2hlLmhhcyhjYWNoZUtleSkpIHtcbiAgICBjb25zdCB7IHJlc3VsdCwgbGFzdFNlZW4gfSA9IGZpbGVFeGlzdHNDYWNoZS5nZXQoY2FjaGVLZXkpXG4gICAgLy8gY2hlY2sgZnJlc25lc3NcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RTZWVuIDwgKGxpZmV0aW1lICogMTAwMCkpIHJldHVybiByZXN1bHRcbiAgfVxuICAvLyBjYWNoZSBtaXNzXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjczODI4MzhcbmZ1bmN0aW9uIGZpbGVFeGlzdHNXaXRoQ2FzZVN5bmMoZmlsZXBhdGgsIGNhY2hlU2V0dGluZ3MpIHtcbiAgLy8gZG9uJ3QgY2FyZSBpZiB0aGUgRlMgaXMgY2FzZS1zZW5zaXRpdmVcbiAgaWYgKENBU0VfU0VOU0lUSVZFX0ZTKSByZXR1cm4gdHJ1ZVxuXG4gIC8vIG51bGwgbWVhbnMgaXQgcmVzb2x2ZWQgdG8gYSBidWlsdGluXG4gIGlmIChmaWxlcGF0aCA9PT0gbnVsbCkgcmV0dXJuIHRydWVcblxuICBjb25zdCBkaXIgPSBkaXJuYW1lKGZpbGVwYXRoKVxuXG4gIGxldCByZXN1bHQgPSBjaGVja0NhY2hlKGZpbGVwYXRoLCBjYWNoZVNldHRpbmdzKVxuICBpZiAocmVzdWx0ICE9IG51bGwpIHJldHVybiByZXN1bHRcblxuICAvLyBiYXNlIGNhc2VcbiAgaWYgKGRpciA9PT0gJy8nIHx8IGRpciA9PT0gJy4nIHx8IC9eW0EtWl06XFxcXCQvaS50ZXN0KGRpcikpIHtcbiAgICByZXN1bHQgPSB0cnVlXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZmlsZW5hbWVzID0gZnMucmVhZGRpclN5bmMoZGlyKVxuICAgIGlmIChmaWxlbmFtZXMuaW5kZXhPZihiYXNlbmFtZShmaWxlcGF0aCkpID09PSAtMSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gZmlsZUV4aXN0c1dpdGhDYXNlU3luYyhkaXIsIGNhY2hlU2V0dGluZ3MpXG4gICAgfVxuICB9XG4gIGNhY2hlUGF0aChmaWxlcGF0aCwgcmVzdWx0KVxuICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxhdGl2ZShtb2R1bGVQYXRoLCBzb3VyY2VGaWxlLCBzZXR0aW5ncykge1xuXG4gIGNvbnN0IHNvdXJjZURpciA9IGRpcm5hbWUoc291cmNlRmlsZSlcbiAgICAgICwgY2FjaGVLZXkgPSBzb3VyY2VEaXIgKyBoYXNoT2JqZWN0KHNldHRpbmdzKSArIG1vZHVsZVBhdGhcblxuICBjb25zdCBjYWNoZVNldHRpbmdzID0gYXNzaWduKHtcbiAgICBsaWZldGltZTogMzAsICAvLyBzZWNvbmRzXG4gIH0sIHNldHRpbmdzWydpbXBvcnQvY2FjaGUnXSlcblxuICAvLyBwYXJzZSBpbmZpbml0eVxuICBpZiAoY2FjaGVTZXR0aW5ncy5saWZldGltZSA9PT0gJ+KInicgfHwgY2FjaGVTZXR0aW5ncy5saWZldGltZSA9PT0gJ0luZmluaXR5Jykge1xuICAgIGNhY2hlU2V0dGluZ3MubGlmZXRpbWUgPSBJbmZpbml0eVxuICB9XG5cbiAgY29uc3QgY2FjaGVkUGF0aCA9IGNoZWNrQ2FjaGUoY2FjaGVLZXksIGNhY2hlU2V0dGluZ3MpXG4gIGlmIChjYWNoZWRQYXRoICE9PSB1bmRlZmluZWQpIHJldHVybiBjYWNoZWRQYXRoXG5cbiAgZnVuY3Rpb24gY2FjaGUocGF0aCkge1xuICAgIGNhY2hlUGF0aChjYWNoZUtleSwgcGF0aClcbiAgICByZXR1cm4gcGF0aFxuICB9XG5cbiAgZnVuY3Rpb24gd2l0aFJlc29sdmVyKHJlc29sdmVyLCBjb25maWcpIHtcblxuICAgIGZ1bmN0aW9uIHYxKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlc29sdmVyLnJlc29sdmVJbXBvcnQobW9kdWxlUGF0aCwgc291cmNlRmlsZSwgY29uZmlnKVxuICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm4geyBmb3VuZDogZmFsc2UgfVxuICAgICAgICByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aCB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHsgZm91bmQ6IGZhbHNlIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2MigpIHtcbiAgICAgIHJldHVybiByZXNvbHZlci5yZXNvbHZlKG1vZHVsZVBhdGgsIHNvdXJjZUZpbGUsIGNvbmZpZylcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHJlc29sdmVyLmludGVyZmFjZVZlcnNpb24pIHtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHYyKClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHYxKClcbiAgICB9XG4gIH1cblxuICBjb25zdCBjb25maWdSZXNvbHZlcnMgPSAoc2V0dGluZ3NbJ2ltcG9ydC9yZXNvbHZlciddXG4gICAgfHwgeyAnbm9kZSc6IHNldHRpbmdzWydpbXBvcnQvcmVzb2x2ZSddIH0pIC8vIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcblxuICBjb25zdCByZXNvbHZlcnMgPSByZXNvbHZlclJlZHVjZXIoY29uZmlnUmVzb2x2ZXJzLCBuZXcgTWFwKCkpXG5cbiAgZm9yIChsZXQgW25hbWUsIGNvbmZpZ10gb2YgcmVzb2x2ZXJzKSB7XG4gICAgY29uc3QgcmVzb2x2ZXIgPSByZXF1aXJlUmVzb2x2ZXIobmFtZSlcblxuICAgIGxldCB7IHBhdGg6IGZ1bGxQYXRoLCBmb3VuZCB9ID0gd2l0aFJlc29sdmVyKHJlc29sdmVyLCBjb25maWcpXG5cbiAgICAvLyByZXNvbHZlcnMgaW1wbHkgZmlsZSBleGlzdGVuY2UsIHRoaXMgZG91YmxlLWNoZWNrIGp1c3QgZW5zdXJlcyB0aGUgY2FzZSBtYXRjaGVzXG4gICAgaWYgKGZ1bGxQYXRoICE9PSBudWxsICYmIGZvdW5kICYmICFmaWxlRXhpc3RzV2l0aENhc2VTeW5jKGZ1bGxQYXRoLCBjYWNoZVNldHRpbmdzKSkge1xuICAgICAgLy8gcmVqZWN0IHJlc29sdmVkIHBhdGhcbiAgICAgIGZ1bGxQYXRoID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKSByZXR1cm4gY2FjaGUoZnVsbFBhdGgpXG4gIH1cblxuICByZXR1cm4gY2FjaGUodW5kZWZpbmVkKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlclJlZHVjZXIocmVzb2x2ZXJzLCBtYXApIHtcbiAgaWYgKHJlc29sdmVycyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgcmVzb2x2ZXJzLmZvckVhY2gociA9PiByZXNvbHZlclJlZHVjZXIociwgbWFwKSlcbiAgICByZXR1cm4gbWFwXG4gIH1cblxuICBpZiAodHlwZW9mIHJlc29sdmVycyA9PT0gJ3N0cmluZycpIHtcbiAgICBtYXAuc2V0KHJlc29sdmVycywgbnVsbClcbiAgICByZXR1cm4gbWFwXG4gIH1cblxuICBpZiAodHlwZW9mIHJlc29sdmVycyA9PT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gcmVzb2x2ZXJzKSB7XG4gICAgICBtYXAuc2V0KGtleSwgcmVzb2x2ZXJzW2tleV0pXG4gICAgfVxuICAgIHJldHVybiBtYXBcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZXNvbHZlciBjb25maWcnKVxufVxuXG5mdW5jdGlvbiByZXF1aXJlUmVzb2x2ZXIobmFtZSkge1xuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGBlc2xpbnQtaW1wb3J0LXJlc29sdmVyLSR7bmFtZX1gKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYHVuYWJsZSB0byBsb2FkIHJlc29sdmVyIFwiJHtuYW1lfVwiLmApXG4gIH1cbn1cblxuY29uc3QgZXJyb3JlZENvbnRleHRzID0gbmV3IFNldCgpXG5cbi8qKlxuICogR2l2ZW5cbiAqIEBwYXJhbSAge3N0cmluZ30gcCAtIG1vZHVsZSBwYXRoXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbnRleHQgLSBFU0xpbnQgY29udGV4dFxuICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBmdWxsIG1vZHVsZSBmaWxlc3lzdGVtIHBhdGg7XG4gKiAgICAgICAgICAgICAgICAgICAgbnVsbCBpZiBwYWNrYWdlIGlzIGNvcmU7XG4gKiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNvbHZlKHAsIGNvbnRleHQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVsYXRpdmUoIHBcbiAgICAgICAgICAgICAgICAgICAsIGNvbnRleHQuZ2V0RmlsZW5hbWUoKVxuICAgICAgICAgICAgICAgICAgICwgY29udGV4dC5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgIClcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFlcnJvcmVkQ29udGV4dHMuaGFzKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgIG1lc3NhZ2U6IGBSZXNvbHZlIGVycm9yOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgIGxvYzogeyBsaW5lOiAxLCBjb2w6IDAgfSxcbiAgICAgIH0pXG4gICAgICBlcnJvcmVkQ29udGV4dHMuYWRkKGNvbnRleHQpXG4gICAgfVxuICB9XG59XG5yZXNvbHZlLnJlbGF0aXZlID0gcmVsYXRpdmVcblxuXG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJ1xuZnVuY3Rpb24gaGFzaE9iamVjdChvYmplY3QpIHtcbiAgY29uc3Qgc2V0dGluZ3NTaGFzdW0gPSBjcmVhdGVIYXNoKCdzaGExJylcbiAgc2V0dGluZ3NTaGFzdW0udXBkYXRlKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpXG4gIHJldHVybiBzZXR0aW5nc1NoYXN1bS5kaWdlc3QoJ2hleCcpXG59XG4iXX0=