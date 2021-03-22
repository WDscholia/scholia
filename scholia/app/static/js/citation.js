require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const async = function (data, options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = undefined;
  }

  const promise = (0, _index.default)().setAsync(data, options);

  if (typeof callback === 'function') {
    promise.then(callback);
    return undefined;
  } else {
    return promise;
  }
};

var _default = async;
exports.default = _default;
},{"./index":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIds = getIds;
exports.format = format;
exports.get = get;

var _static = require("./static");

var _output = require("../plugins/output");

var _csl = require("../plugins/input/csl");

function getIds() {
  return this.data.map(entry => entry.id);
}

function format(format, ...options) {
  return (0, _output.format)(format, (0, _csl.clean)(this.data), ...options);
}

function get(options = {}) {
  (0, _static.validateOutputOptions)(options);
  const parsedOptions = Object.assign({}, this.defaultOptions, this._options.output, options);
  const {
    type,
    style
  } = parsedOptions;
  const [styleType, styleFormat] = style.split('-');
  const newStyle = styleType === 'citation' ? 'bibliography' : styleType === 'csl' ? 'data' : styleType;
  const newType = type === 'string' ? 'text' : type === 'json' ? 'object' : type;
  let formatOptions;

  switch (newStyle) {
    case 'bibliography':
      {
        const {
          lang,
          append,
          prepend
        } = parsedOptions;
        formatOptions = {
          template: styleFormat,
          lang,
          format: newType,
          append,
          prepend
        };
        break;
      }

    case 'data':
    case 'bibtex':
    case 'bibtxt':
    case 'ndjson':
    case 'ris':
      formatOptions = {
        type: newType
      };
      break;

    default:
      throw new Error(`Invalid style "${newStyle}"`);
  }

  const result = this.format(newStyle, Object.assign(formatOptions, options._newOptions));
  const {
    format
  } = parsedOptions;

  if (format === 'real' && newType === 'html' && typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const tmp = document.createElement('div');
    tmp.innerHTML = result;
    return tmp.firstChild;
  } else if (format === 'string' && typeof result === 'object') {
    return JSON.stringify(result);
  } else {
    return result;
  }
}
},{"../plugins/input/csl":25,"../plugins/output":33,"./static":8}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var log = _interopRequireWildcard(require("./log"));

var options = _interopRequireWildcard(require("./options"));

var set = _interopRequireWildcard(require("./set"));

var sort = _interopRequireWildcard(require("./sort"));

var get = _interopRequireWildcard(require("./get"));

var staticMethods = _interopRequireWildcard(require("./static"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function Cite(data, options = {}) {
  if (!(this instanceof Cite)) {
    return new Cite(data, options);
  }

  this._options = options;
  this.log = [];
  this.data = [];
  this.set(data, options);
  this.options(options);
  this.save();
  return this;
}

Object.assign(Cite.prototype, log, options, set, sort, get);

Cite.prototype[Symbol.iterator] = function* () {
  yield* this.data;
};

Object.assign(Cite, staticMethods);
var _default = Cite;
exports.default = _default;
},{"./get":2,"./log":4,"./options":5,"./set":6,"./sort":7,"./static":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.undo = exports.retrieveLastVersion = exports.retrieveVersion = exports.currentVersion = void 0;

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const currentVersion = function () {
  return this.log.length;
};

exports.currentVersion = currentVersion;

const retrieveVersion = function (versnum = 1) {
  if (versnum <= 0 || versnum > this.currentVersion()) {
    return null;
  } else {
    const [data, options] = this.log[versnum - 1];
    const image = new _index.default(JSON.parse(data), JSON.parse(options));
    image.log = this.log.slice(0, versnum);
    return image;
  }
};

exports.retrieveVersion = retrieveVersion;

const undo = function (number = 1) {
  return this.retrieveVersion(this.currentVersion() - number);
};

exports.undo = undo;

const retrieveLastVersion = function () {
  return this.retrieveVersion(this.currentVersion());
};

exports.retrieveLastVersion = retrieveLastVersion;

const save = function () {
  this.log.push([JSON.stringify(this.data), JSON.stringify(this._options)]);
  return this;
};

exports.save = save;
},{"./index":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = exports.options = void 0;

var _validate = require("./validate");

const defaultOptions = {
  format: 'real',
  type: 'json',
  style: 'csl',
  lang: 'en-US'
};
exports.defaultOptions = defaultOptions;

const options = function (options, log) {
  (0, _validate.validateOutputOptions)(options);

  if (log) {
    this.save();
  }

  Object.assign(this._options, options);
  return this;
};

exports.options = options;
},{"./validate":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reset = exports.setAsync = exports.set = exports.addAsync = exports.add = void 0;

var _input = require("../plugins/input/");

var _fetchId = _interopRequireDefault(require("../util/fetchId"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const add = function (data, options = {}, log = false) {
  if (options === true || log === true) {
    this.save();
  }

  this.data.push(...(0, _input.chain)(data, options));
  this.data.filter(entry => !Object.prototype.hasOwnProperty.call(entry, 'id')).forEach(entry => {
    entry.id = (0, _fetchId.default)(this.getIds(), 'temp_id_');
  });
  return this;
};

exports.add = add;

const addAsync = async function (data, options = {}, log = false) {
  if (options === true || log === true) {
    this.save();
  }

  this.data.push(...(await (0, _input.chainAsync)(data, options)));
  this.data.filter(entry => !Object.prototype.hasOwnProperty.call(entry, 'id')).forEach(entry => {
    entry.id = (0, _fetchId.default)(this.getIds(), 'temp_id_');
  });
  return this;
};

exports.addAsync = addAsync;

const set = function (data, options = {}, log = false) {
  if (options === true || log === true) {
    this.save();
  }

  this.data = [];
  return typeof options !== 'boolean' ? this.add(data, options) : this.add(data);
};

exports.set = set;

const setAsync = async function (data, options = {}, log = false) {
  if (options === true || log === true) {
    this.save();
  }

  this.data = [];
  return typeof options !== 'boolean' ? this.addAsync(data, options) : this.addAsync(data);
};

exports.setAsync = setAsync;

const reset = function (log) {
  if (log) {
    this.save();
  }

  this.data = [];
  this._options = {};
  return this;
};

exports.reset = reset;
},{"../plugins/input/":29,"../util/fetchId":36}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sort = void 0;

var _label = require("../plugin-common/output/label");

var _name = require("@citation-js/name");

const getComparisonValue = function (obj, prop, label = prop === 'label') {
  let value = label ? (0, _label.getLabel)(obj) : obj[prop];

  switch (prop) {
    case 'author':
    case 'editor':
      return value.map(name => name.literal || name.family || (0, _name.format)(name));

    case 'accessed':
    case 'issued':
      return value['date-parts'][0];

    case 'page':
      return value.split('-').map(num => parseInt(num));

    case 'edition':
    case 'issue':
    case 'volume':
      value = parseInt(value);
      return !isNaN(value) ? value : -Infinity;

    default:
      return value || -Infinity;
  }
};

const compareProp = function (entryA, entryB, prop, flip = /^!/.test(prop)) {
  prop = prop.replace(/^!/, '');
  const a = getComparisonValue(entryA, prop);
  const b = getComparisonValue(entryB, prop);
  return (flip ? -1 : 1) * (a > b ? 1 : a < b ? -1 : 0);
};

const getSortCallback = function (...props) {
  return (a, b) => {
    const keys = props.slice();
    let output = 0;

    while (!output && keys.length) {
      output = compareProp(a, b, keys.shift());
    }

    return output;
  };
};

const sort = function (method = [], log) {
  if (log) {
    this.save();
  }

  this.data.sort(typeof method === 'function' ? method : getSortCallback(...method, 'label'));
  return this;
};

exports.sort = sort;
},{"../plugin-common/output/label":20,"@citation-js/name":46}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  async: true
};
Object.defineProperty(exports, "async", {
  enumerable: true,
  get: function () {
    return _async.default;
  }
});

var _async = _interopRequireDefault(require("./async"));

var _validate = require("./validate");

Object.keys(_validate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _validate[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validate[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./async":1,"./validate":9}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateOutputOptions = validateOutputOptions;
exports.validateOptions = validateOptions;
const formats = ['real', 'string'];
const types = ['json', 'html', 'string', 'rtf'];
const styles = ['csl', 'bibtex', 'bibtxt', 'citation-*', 'ris', 'ndjson'];
const wrapperTypes = ['string', 'function'];

function validateOutputOptions(options) {
  if (typeof options !== 'object') {
    throw new TypeError('Options not an object!');
  }

  const {
    format,
    type,
    style,
    lang,
    append,
    prepend
  } = options;

  if (format && !formats.includes(format)) {
    throw new TypeError(`Option format ("${format}") should be one of: ${formats}`);
  } else if (type && !types.includes(type)) {
    throw new TypeError(`Option type ("${type}") should be one of: ${types}`);
  } else if (style && !styles.includes(style) && !/^citation/.test(style)) {
    throw new TypeError(`Option style ("${style}") should be one of: ${styles}`);
  } else if (lang && typeof lang !== 'string') {
    throw new TypeError(`Option lang should be a string, but is a ${typeof lang}`);
  } else if (prepend && !wrapperTypes.includes(typeof prepend)) {
    throw new TypeError(`Option prepend should be a string or a function, but is a ${typeof prepend}`);
  } else if (append && !wrapperTypes.includes(typeof append)) {
    throw new TypeError(`Option append should be a string or a function, but is a ${typeof append}`);
  }

  if (/^citation/.test(style) && type === 'json') {
    throw new Error(`Combination type/style of json/citation-* is not valid: ${type}/${style}`);
  }

  return true;
}

function validateOptions(options) {
  if (typeof options !== 'object') {
    throw new TypeError('Options should be an object');
  }

  if (options.output) {
    validateOutputOptions(options.output);
  } else if (options.maxChainLength && typeof options.maxChainLength !== 'number') {
    throw new TypeError('Option maxChainLength should be a number');
  } else if (options.forceType && typeof options.forceType !== 'string') {
    throw new TypeError('Option forceType should be a string');
  } else if (options.generateGraph != null && typeof options.generateGraph !== 'boolean') {
    throw new TypeError('Option generateGraph should be a boolean');
  } else if (options.strict != null && typeof options.strict !== 'boolean') {
    throw new TypeError('Option strict should be a boolean');
  } else if (options.target != null && typeof options.target !== 'string') {
    throw new TypeError('Option target should be a boolean');
  }

  return true;
}
},{}],10:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const logger = {
  _output(level, scope, msg) {
    this._log.push(scope, msg);

    if (this._levels.indexOf(level) < this._levels.indexOf(this.level)) {
      return;
    }

    this._console.log(scope, ...msg);
  },

  _console: null,
  _log: [],
  _levels: ['http', 'debug', 'unmapped', 'info', 'warn', 'error', 'silent'],
  level: 'silent'
};

for (const level of logger._levels) {
  logger[level] = (scope, ...msg) => logger._output(level, scope, msg);
}

if (typeof console.Console === 'function') {
  logger._console = new console.Console(process.stderr);
} else {
  logger._console = console;
}

var _default = logger;
exports.default = _default;
}).call(this)}).call(this,require('_process'))
},{"_process":98}],11:[function(require,module,exports){
"use strict";

var plugins = _interopRequireWildcard(require("../plugins"));

var _input = require("./input/");

var _output = _interopRequireDefault(require("./output/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

plugins.add(_input.ref, {
  input: _input.formats,
  output: _output.default
});
},{"../plugins":23,"./input/":14,"./output/":18}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = void 0;

const parse = () => [];

exports.parse = parse;
},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

function parse(input) {
  return input.value || input.textContent;
}
},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.parsers = exports.ref = void 0;

var empty = _interopRequireWildcard(require("./empty"));

var url = _interopRequireWildcard(require("./url"));

var json = _interopRequireWildcard(require("./json"));

var jquery = _interopRequireWildcard(require("./jquery"));

var html = _interopRequireWildcard(require("./html"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ref = '@else';
exports.ref = ref;
const parsers = {
  empty,
  url,
  json,
  jquery,
  html
};
exports.parsers = parsers;
const formats = {
  '@empty/text': {
    parse: empty.parse,
    parseType: {
      dataType: 'String',
      predicate: input => input === ''
    }
  },
  '@empty/whitespace+text': {
    parse: empty.parse,
    parseType: {
      dataType: 'String',
      predicate: /^\s+$/
    }
  },
  '@empty': {
    parse: empty.parse,
    parseType: {
      dataType: 'Primitive',
      predicate: input => input == null
    }
  },
  '@else/json': {
    parse: json.parse,
    parseType: {
      dataType: 'String',
      predicate: /^\s*(\{[\S\s]*\}|\[[\S\s]*\])\s*$/
    }
  },
  '@else/url': {
    parse: url.parse,
    parseAsync: url.parseAsync,
    parseType: {
      dataType: 'String',
      predicate: /^https?:\/\/(([\w-]+\.)*[\w-]+)(:\d+)?(\/[^?/]*)*(\?[^#]*)?(#.*)?$/i
    }
  },
  '@else/jquery': {
    parse: jquery.parse,
    parseType: {
      dataType: 'ComplexObject',

      predicate(input) {
        return typeof jQuery !== 'undefined' && input instanceof jQuery;
      }

    }
  },
  '@else/html': {
    parse: html.parse,
    parseType: {
      dataType: 'ComplexObject',

      predicate(input) {
        return typeof HTMLElement !== 'undefined' && input instanceof HTMLElement;
      }

    }
  }
};
exports.formats = formats;
},{"./empty":12,"./html":13,"./jquery":15,"./json":16,"./url":17}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

function parse(input) {
  return input.val() || input.text() || input.html();
}
},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _logger = _interopRequireDefault(require("../../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const substituters = [[/((?:\[|:|,)\s*)'((?:\\'|[^'])*?[^\\])?'(?=\s*(?:\]|}|,))/g, '$1"$2"'], [/((?:(?:"|]|}|\/[gmiuys]|\.|(?:\d|\.|-)*\d)\s*,|{)\s*)(?:"([^":\n]+?)"|'([^":\n]+?)'|([^":\n]+?))(\s*):/g, '$1"$2$3$4"$5:']];

const parseJSON = function (str) {
  if (typeof str !== 'string') {
    return JSON.parse(str);
  }

  try {
    return JSON.parse(str);
  } catch (e) {
    _logger.default.debug('[plugin-common]', 'Invalid JSON, switching to experimental parser');

    substituters.forEach(([regex, subst]) => {
      str = str.replace(regex, subst);
    });
    return JSON.parse(str);
  }
};

exports.default = exports.parse = parseJSON;
},{"../../logger":10}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function () {
    return _util.fetchFile;
  }
});
Object.defineProperty(exports, "parseAsync", {
  enumerable: true,
  get: function () {
    return _util.fetchFileAsync;
  }
});

var _util = require("../../util/");
},{"../../util/":38}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _json = _interopRequireDefault(require("./json"));

var _label = _interopRequireDefault(require("./label"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = Object.assign({}, _json.default, _label.default);

exports.default = _default;
},{"./json":19,"./label":20}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJsonWrapper = getJsonWrapper;
exports.default = void 0;

var plugins = _interopRequireWildcard(require("../../plugins/"));

var util = _interopRequireWildcard(require("../../util/"));

var _logger = _interopRequireDefault(require("../../logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const appendCommas = (string, index, array) => string + (index < array.length - 1 ? ',' : '');

const getJsonObject = function (src, dict) {
  const isArray = Array.isArray(src);
  let entries;

  if (isArray) {
    entries = src.map(entry => getJsonValue(entry, dict));
  } else {
    entries = Object.keys(src).filter(prop => JSON.stringify(src[prop])).map(prop => `"${prop}": ${getJsonValue(src[prop], dict)}`);
  }

  entries = entries.map(appendCommas).map(entry => dict.listItem.join(entry));
  entries = dict.list.join(entries.join(''));
  return isArray ? `[${entries}]` : `{${entries}}`;
};

const getJsonValue = function (src, dict) {
  if (typeof src === 'object' && src !== null) {
    if (src.length === 0) {
      return '[]';
    } else if (Object.keys(src).length === 0) {
      return '{}';
    } else {
      return getJsonObject(src, dict);
    }
  } else {
    return JSON.stringify(src);
  }
};

const getJson = function (src, dict) {
  let entries = src.map(entry => getJsonObject(entry, dict));
  entries = entries.map(appendCommas).map(entry => dict.entry.join(entry));
  entries = entries.join('');
  return dict.bibliographyContainer.join(`[${entries}]`);
};

function getJsonWrapper(src) {
  return getJson(src, plugins.dict.get('html'));
}

var _default = {
  data(data, {
    type,
    format = type || 'text'
  } = {}) {
    if (format === 'object') {
      return util.deepCopy(data);
    } else if (format === 'text') {
      return JSON.stringify(data, null, 2);
    } else {
      _logger.default.warn('[core]', 'This feature (JSON output with special formatting) is unstable. See https://github.com/larsgw/citation.js/issues/144');

      return getJson(data, plugins.dict.get(format));
    }
  },

  ndjson(data) {
    return data.map(entry => JSON.stringify(entry)).join('\n');
  }

};
exports.default = _default;
},{"../../logger":10,"../../plugins/":23,"../../util/":38}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getLabel = void 0;

const getLabel = entry => {
  if ('citation-label' in entry) {
    return entry['citation-label'];
  }

  let res = '';

  if (entry.author) {
    res += entry.author[0].family || entry.author[0].literal;
  }

  if (entry.issued && entry.issued['date-parts'] && entry.issued['date-parts'][0]) {
    res += entry.issued['date-parts'][0][0];
  }

  if (entry['year-suffix']) {
    res += entry['year-suffix'];
  } else if (entry.title) {
    res += entry.title.replace(/<\/?.*?>/g, '').match(/^(?:(?:the|a|an)\s+)?(\S+)/i)[1];
  }

  return res;
};

exports.getLabel = getLabel;
var _default = {
  label(data) {
    return data.reduce((object, entry) => {
      object[entry.id] = getLabel(entry);
      return object;
    }, {});
  }

};
exports.default = _default;
},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = exports.remove = exports.has = exports.get = exports.add = void 0;
const configs = {};

const add = (ref, config) => {
  configs[ref] = config;
};

exports.add = add;

const get = ref => configs[ref];

exports.get = get;

const has = ref => Object.prototype.hasOwnProperty.call(configs, ref);

exports.has = has;

const remove = ref => {
  delete configs[ref];
};

exports.remove = remove;

const list = () => Object.keys(configs);

exports.list = list;
},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textDict = exports.htmlDict = exports.get = exports.list = exports.has = exports.remove = exports.add = exports.register = void 0;

var _register = _interopRequireDefault(require("../util/register"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validate = (name, dict) => {
  if (typeof name !== 'string') {
    throw new TypeError(`Invalid dict name, expected string, got ${typeof name}`);
  } else if (typeof dict !== 'object') {
    throw new TypeError(`Invalid dict, expected object, got ${typeof dict}`);
  }

  for (const entryName in dict) {
    const entry = dict[entryName];

    if (!Array.isArray(entry) || entry.some(part => typeof part !== 'string')) {
      throw new TypeError(`Invalid dict entry "${entryName}", expected array of strings`);
    }
  }
};

const register = new _register.default({
  html: {
    bibliographyContainer: ['<div class="csl-bib-body">', '</div>'],
    entry: ['<div class="csl-entry">', '</div>'],
    list: ['<ul style="list-style-type:none">', '</ul>'],
    listItem: ['<li>', '</li>']
  },
  text: {
    bibliographyContainer: ['', '\n'],
    entry: ['', '\n'],
    list: ['\n', ''],
    listItem: ['\t', '\n']
  }
});
exports.register = register;

const add = (name, dict) => {
  validate(name, dict);
  register.set(name, dict);
};

exports.add = add;

const remove = name => {
  register.remove(name);
};

exports.remove = remove;

const has = name => {
  return register.has(name);
};

exports.has = has;

const list = () => {
  return register.list();
};

exports.list = list;

const get = name => {
  if (!register.has(name)) {
    throw new Error(`Dict "${name}" unavailable`);
  }

  return register.get(name);
};

exports.get = get;
const htmlDict = {
  wr_start: '<div class="csl-bib-body">',
  wr_end: '</div>',
  en_start: '<div class="csl-entry">',
  en_end: '</div>',
  ul_start: '<ul style="list-style-type:none">',
  ul_end: '</ul>',
  li_start: '<li>',
  li_end: '</li>'
};
exports.htmlDict = htmlDict;
const textDict = {
  wr_start: '',
  wr_end: '\n',
  en_start: '',
  en_end: '\n',
  ul_start: '\n',
  ul_end: '',
  li_start: '\t',
  li_end: '\n'
};
exports.textDict = textDict;
},{"../util/register":39}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.dict = exports.output = exports.input = exports.list = exports.has = exports.remove = exports.add = void 0;

var input = _interopRequireWildcard(require("./input/"));

exports.input = input;

var output = _interopRequireWildcard(require("./output"));

exports.output = output;

var dict = _interopRequireWildcard(require("./dict"));

exports.dict = dict;

var config = _interopRequireWildcard(require("./config"));

exports.config = config;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const registers = {
  input,
  output,
  dict,
  config
};
const indices = {};

const add = (ref, plugins = {}) => {
  const mainIndex = indices[ref] = {};

  for (const type in plugins) {
    if (type === 'config') {
      mainIndex.config = {
        [ref]: plugins.config
      };
      registers.config.add(ref, plugins.config);
      continue;
    }

    const typeIndex = mainIndex[type] = {};
    const typePlugins = plugins[type];

    for (const name in typePlugins) {
      const typePlugin = typePlugins[name];
      typeIndex[name] = true;
      registers[type].add(name, typePlugin);
    }
  }
};

exports.add = add;

const remove = ref => {
  const mainIndex = indices[ref];

  for (const type in mainIndex) {
    const typeIndex = mainIndex[type];

    for (const name in typeIndex) {
      registers[type].remove(name);
    }
  }

  delete indices[ref];
};

exports.remove = remove;

const has = ref => ref in indices;

exports.has = has;

const list = () => Object.keys(indices);

exports.list = list;
},{"./config":21,"./dict":22,"./input/":29,"./output":33}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chainLinkAsync = exports.chainAsync = exports.chainLink = exports.chain = void 0;

var _deepCopy = _interopRequireDefault(require("../../util/deepCopy"));

var _logger = _interopRequireDefault(require("../../logger"));

var _register = require("./register");

var _type = require("./type");

var _data = require("./data");

var _graph = require("./graph");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepareParseGraph(graph) {
  return graph.reduce((array, next) => {
    const last = array[array.length - 1];

    if (last && last.type === next.type) {
      last.count = last.count + 1 || 2;
    } else {
      array.push(next);
    }

    return array;
  }, []).map(element => (element.count > 1 ? element.count + 'x ' : '') + element.type).join(' -> ');
}

class ChainParser {
  constructor(input, options = {}) {
    this.options = Object.assign({
      generateGraph: true,
      forceType: (0, _type.type)(input),
      maxChainLength: 10,
      strict: true,
      target: '@csl/list+object'
    }, options);
    this.type = this.options.forceType;
    this.data = typeof input === 'object' ? (0, _deepCopy.default)(input) : input;
    this.graph = [{
      type: this.type,
      data: input
    }];
    this.iteration = 0;
  }

  iterate() {
    if (this.iteration !== 0) {
      const typeInfo = (0, _register.get)(this.type);

      if (typeInfo && typeInfo.outputs) {
        this.type = typeInfo.outputs;
      } else {
        this.type = (0, _type.type)(this.data);
      }

      this.graph.push({
        type: this.type
      });
    }

    if (this.error || this.type === this.options.target) {
      return false;
    } else if (this.iteration >= this.options.maxChainLength) {
      this.error = new RangeError(`Max. number of parsing iterations reached (${prepareParseGraph(this.graph)})`);
      return false;
    } else {
      this.iteration++;
      return true;
    }
  }

  end() {
    if (this.error) {
      _logger.default.error('[core]', this.error.message);

      if (this.options.strict !== false) {
        throw this.error;
      } else {
        return [];
      }
    } else if (this.options.target === '@csl/list+object') {
      return this.data.map(this.options.generateGraph ? entry => (0, _graph.applyGraph)(entry, this.graph) : _graph.removeGraph);
    } else {
      return this.data;
    }
  }

}

const chain = (...args) => {
  const chain = new ChainParser(...args);

  while (chain.iterate()) {
    try {
      chain.data = (0, _data.data)(chain.data, chain.type);
    } catch (e) {
      chain.error = e;
    }
  }

  return chain.end();
};

exports.chain = chain;

const chainLink = input => {
  const type = (0, _type.type)(input);
  const output = type.match(/array|object/) ? (0, _deepCopy.default)(input) : input;
  return (0, _data.data)(output, type);
};

exports.chainLink = chainLink;

const chainAsync = async (...args) => {
  const chain = new ChainParser(...args);

  while (chain.iterate()) {
    chain.data = await (0, _data.dataAsync)(chain.data, chain.type).catch(e => {
      chain.error = e;
    });
  }

  return chain.end();
};

exports.chainAsync = chainAsync;

const chainLinkAsync = async input => {
  const type = (0, _type.type)(input);
  const output = type.match(/array|object/) ? (0, _deepCopy.default)(input) : input;
  return (0, _data.dataAsync)(output, type);
};

exports.chainLinkAsync = chainLinkAsync;
},{"../../logger":10,"../../util/deepCopy":34,"./data":26,"./graph":28,"./register":31,"./type":32}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clean = void 0;

var _name = require("@citation-js/name");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const NAME = 1;
const NAME_LIST = 2;
const DATE = 3;
const fieldTypes = {
  author: NAME_LIST,
  'collection-editor': NAME_LIST,
  composer: NAME_LIST,
  'container-author': NAME_LIST,
  editor: NAME_LIST,
  'editorial-director': NAME_LIST,
  director: NAME_LIST,
  interviewer: NAME_LIST,
  illustrator: NAME_LIST,
  'original-author': NAME_LIST,
  'reviewed-author': NAME_LIST,
  recipient: NAME_LIST,
  translator: NAME_LIST,
  accessed: DATE,
  container: DATE,
  'event-date': DATE,
  issued: DATE,
  'original-date': DATE,
  submitted: DATE,
  categories: 'object',
  id: ['string', 'number'],
  type: 'string',
  language: 'string',
  journalAbbreviation: 'string',
  shortTitle: 'string',
  abstract: 'string',
  annote: 'string',
  archive: 'string',
  archive_location: 'string',
  'archive-place': 'string',
  authority: 'string',
  'call-number': 'string',
  'chapter-number': 'string',
  'citation-number': 'string',
  'citation-label': 'string',
  'collection-number': 'string',
  'collection-title': 'string',
  'container-title': 'string',
  'container-title-short': 'string',
  dimensions: 'string',
  DOI: 'string',
  edition: ['string', 'number'],
  event: 'string',
  'event-place': 'string',
  'first-reference-note-number': 'string',
  genre: 'string',
  ISBN: 'string',
  ISSN: 'string',
  issue: ['string', 'number'],
  jurisdiction: 'string',
  keyword: 'string',
  locator: 'string',
  medium: 'string',
  note: 'string',
  number: ['string', 'number'],
  'number-of-pages': 'string',
  'number-of-volumes': ['string', 'number'],
  'original-publisher': 'string',
  'original-publisher-place': 'string',
  'original-title': 'string',
  page: 'string',
  'page-first': 'string',
  PMCID: 'string',
  PMID: 'string',
  publisher: 'string',
  'publisher-place': 'string',
  references: 'string',
  'reviewed-title': 'string',
  scale: 'string',
  section: 'string',
  source: 'string',
  status: 'string',
  title: 'string',
  'title-short': 'string',
  URL: 'string',
  version: 'string',
  volume: ['string', 'number'],
  'year-suffix': 'string'
};

const correctName = function (name, bestGuessConversions) {
  if (typeof name === 'object' && name !== null && (name.literal || name.given || name.family)) {
    return name;
  } else if (!bestGuessConversions) {
    return undefined;
  } else if (typeof name === 'string') {
    return (0, _name.parse)(name);
  }
};

const correctNameList = function (nameList, bestGuessConversions) {
  if (nameList instanceof Array) {
    const names = nameList.map(name => correctName(name, bestGuessConversions)).filter(Boolean);
    return names.length ? names : undefined;
  }
};

const correctDateParts = function (dateParts, bestGuessConversions) {
  if (dateParts.every(part => typeof part === 'number')) {
    return dateParts;
  } else if (!bestGuessConversions || dateParts.some(part => isNaN(parseInt(part)))) {
    return undefined;
  } else {
    return dateParts.map(part => parseInt(part));
  }
};

const correctDate = function (date, bestGuessConversions) {
  const dp = 'date-parts';

  if (typeof date !== 'object' || date === null) {
    return undefined;
  } else if (date[dp] instanceof Array && date[dp].every(part => part instanceof Array)) {
    const range = date[dp].map(dateParts => correctDateParts(dateParts, bestGuessConversions)).filter(Boolean);
    return range.length ? _objectSpread(_objectSpread({}, date), {}, {
      'date-parts': range
    }) : undefined;
  } else if (date instanceof Array && date.every(part => part[dp] instanceof Array)) {
    const range = date.map(dateParts => correctDateParts(dateParts[dp], bestGuessConversions)).filter(Boolean);
    return range.length ? {
      'date-parts': range
    } : undefined;
  } else if ('literal' in date || 'raw' in date) {
    return date;
  }
};

const correctField = function (fieldName, value, bestGuessConversions) {
  const fieldType = [].concat(fieldTypes[fieldName]);

  switch (fieldTypes[fieldName]) {
    case NAME:
      return correctName(value, bestGuessConversions);

    case NAME_LIST:
      return correctNameList(value, bestGuessConversions);

    case DATE:
      return correctDate(value, bestGuessConversions);
  }

  if (/^_/.test(fieldName)) {
    return value;
  } else if (bestGuessConversions) {
    if (typeof value === 'string' && fieldType.includes('number') && !isNaN(+value)) {
      return parseFloat(value);
    } else if (typeof value === 'number' && fieldType.includes('string') && !fieldType.includes('number')) {
      return value.toString();
    } else if (Array.isArray(value) && value.length) {
      return correctField(fieldName, value[0], bestGuessConversions);
    }
  }

  if (fieldType.includes(typeof value)) {
    return value;
  }
};

const parseCsl = function (data, bestGuessConversions = true) {
  return data.map(function (entry) {
    const clean = {};

    for (const field in entry) {
      const correction = correctField(field, entry[field], bestGuessConversions);

      if (correction !== undefined) {
        clean[field] = correction;
      }
    }

    return clean;
  });
};

exports.clean = parseCsl;
},{"@citation-js/name":46}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listDataParser = exports.removeDataParser = exports.hasDataParser = exports.addDataParser = exports.dataAsync = exports.data = void 0;

var _chain = require("./chain");

const flatten = array => [].concat(...array);

const parsers = {};
const asyncParsers = {};
const nativeParsers = {
  '@csl/object': input => [input],
  '@csl/list+object': input => input,
  '@else/list+object': input => flatten(input.map(_chain.chain)),
  '@invalid': () => {
    throw new Error('This format is not supported or recognized');
  }
};
const nativeAsyncParsers = {
  '@else/list+object': async input => flatten(await Promise.all(input.map(_chain.chainAsync)))
};

const data = (input, type) => {
  if (typeof parsers[type] === 'function') {
    return parsers[type](input);
  } else if (typeof nativeParsers[type] === 'function') {
    return nativeParsers[type](input);
  } else {
    throw new TypeError(`No synchronous parser found for ${type}`);
  }
};

exports.data = data;

const dataAsync = async (input, type) => {
  if (typeof asyncParsers[type] === 'function') {
    return asyncParsers[type](input);
  } else if (typeof nativeAsyncParsers[type] === 'function') {
    return nativeAsyncParsers[type](input);
  } else if (hasDataParser(type, false)) {
    return data(input, type);
  } else {
    throw new TypeError(`No parser found for ${type}`);
  }
};

exports.dataAsync = dataAsync;

const addDataParser = (format, {
  parser,
  async
}) => {
  if (async) {
    asyncParsers[format] = parser;
  } else {
    parsers[format] = parser;
  }
};

exports.addDataParser = addDataParser;

const hasDataParser = (type, async) => async ? asyncParsers[type] || nativeAsyncParsers[type] : parsers[type] || nativeParsers[type];

exports.hasDataParser = hasDataParser;

const removeDataParser = (type, async) => {
  delete (async ? asyncParsers : parsers)[type];
};

exports.removeDataParser = removeDataParser;

const listDataParser = async => Object.keys(async ? asyncParsers : parsers);

exports.listDataParser = listDataParser;
},{"./chain":24}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dataTypeOf = exports.typeOf = void 0;

const typeOf = thing => {
  switch (thing) {
    case undefined:
      return 'Undefined';

    case null:
      return 'Null';

    default:
      return thing.constructor.name;
  }
};

exports.typeOf = typeOf;

const dataTypeOf = thing => {
  switch (typeof thing) {
    case 'string':
      return 'String';

    case 'object':
      if (Array.isArray(thing)) {
        return 'Array';
      } else if (typeOf(thing) === 'Object') {
        return 'SimpleObject';
      } else if (typeOf(thing) !== 'Null') {
        return 'ComplexObject';
      }

    default:
      return 'Primitive';
  }
};

exports.dataTypeOf = dataTypeOf;
},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeGraph = exports.applyGraph = void 0;

const applyGraph = (entry, graph) => {
  if (entry._graph) {
    const index = graph.findIndex(({
      type
    }) => type === '@else/list+object');

    if (index !== -1) {
      graph.splice(index + 1, 0, ...entry._graph.slice(0, -1));
    }
  }

  entry._graph = graph;
  return entry;
};

exports.applyGraph = applyGraph;

const removeGraph = entry => {
  delete entry._graph;
  return entry;
};

exports.removeGraph = removeGraph;
},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  util: true
};
exports.util = void 0;

var dataType = _interopRequireWildcard(require("./dataType"));

var graph = _interopRequireWildcard(require("./graph"));

var parser = _interopRequireWildcard(require("./parser"));

var csl = _interopRequireWildcard(require("./csl"));

var _register = require("./register");

Object.keys(_register).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _register[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _register[key];
    }
  });
});

var _chain = require("./chain");

Object.keys(_chain).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _chain[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _chain[key];
    }
  });
});

var _type = require("./type");

Object.keys(_type).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _type[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _type[key];
    }
  });
});

var _data = require("./data");

Object.keys(_data).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _data[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _data[key];
    }
  });
});

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const util = Object.assign({}, dataType, graph, parser, csl);
exports.util = util;
},{"./chain":24,"./csl":25,"./data":26,"./dataType":27,"./graph":28,"./parser":30,"./register":31,"./type":32}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatParser = exports.DataParser = exports.TypeParser = void 0;

var _type = require("./type");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TypeParser {
  constructor(data) {
    _defineProperty(this, "validDataTypes", ['String', 'Array', 'SimpleObject', 'ComplexObject', 'Primitive']);

    this.data = data;
  }

  validateDataType() {
    const dataType = this.data.dataType;

    if (dataType && !this.validDataTypes.includes(dataType)) {
      throw new RangeError(`dataType was ${dataType}; expected one of ${this.validDataTypes}`);
    }
  }

  validateParseType() {
    const predicate = this.data.predicate;

    if (predicate && !(predicate instanceof RegExp || typeof predicate === 'function')) {
      throw new TypeError(`predicate was ${typeof predicate}; expected RegExp or function`);
    }
  }

  validateTokenList() {
    const tokenList = this.data.tokenList;

    if (tokenList && typeof tokenList !== 'object') {
      throw new TypeError(`tokenList was ${typeof tokenList}; expected object or RegExp`);
    }
  }

  validatePropertyConstraint() {
    const propertyConstraint = this.data.propertyConstraint;

    if (propertyConstraint && typeof propertyConstraint !== 'object') {
      throw new TypeError(`propertyConstraint was ${typeof propertyConstraint}; expected array or object`);
    }
  }

  validateElementConstraint() {
    const elementConstraint = this.data.elementConstraint;

    if (elementConstraint && typeof elementConstraint !== 'string') {
      throw new TypeError(`elementConstraint was ${typeof elementConstraint}; expected string`);
    }
  }

  validateExtends() {
    const extend = this.data.extends;

    if (extend && typeof extend !== 'string') {
      throw new TypeError(`extends was ${typeof extend}; expected string`);
    }
  }

  validate() {
    if (this.data === null || typeof this.data !== 'object') {
      throw new TypeError(`typeParser was ${typeof this.data}; expected object`);
    }

    this.validateDataType();
    this.validateParseType();
    this.validateTokenList();
    this.validatePropertyConstraint();
    this.validateElementConstraint();
    this.validateExtends();
  }

  parseTokenList() {
    let tokenList = this.data.tokenList;

    if (!tokenList) {
      return [];
    } else if (tokenList instanceof RegExp) {
      tokenList = {
        token: tokenList
      };
    }

    const {
      token,
      split = /\s+/,
      trim = true,
      every = true
    } = tokenList;

    const trimInput = input => trim ? input.trim() : input;

    const testTokens = every ? 'every' : 'some';

    const predicate = input => trimInput(input).split(split)[testTokens](part => token.test(part));

    return [predicate];
  }

  parsePropertyConstraint() {
    const constraints = [].concat(this.data.propertyConstraint || []);
    return constraints.map(({
      props,
      match = 'every',
      value
    }) => {
      props = [].concat(props);

      switch (match) {
        case 'every':
          return input => props.every(prop => prop in input && (!value || value(input[prop])));

        case 'any':
        case 'some':
          return input => props.some(prop => prop in input && (!value || value(input[prop])));

        case 'none':
          return input => !props.some(prop => prop in input && (!value || value(input[prop])));
      }
    });
  }

  parseElementConstraint() {
    const constraint = this.data.elementConstraint;
    return !constraint ? [] : [input => input.every(entry => (0, _type.type)(entry) === constraint)];
  }

  parsePredicate() {
    if (this.data.predicate instanceof RegExp) {
      return [this.data.predicate.test.bind(this.data.predicate)];
    } else if (this.data.predicate) {
      return [this.data.predicate];
    } else {
      return [];
    }
  }

  getCombinedPredicate() {
    const predicates = [...this.parsePredicate(), ...this.parseTokenList(), ...this.parsePropertyConstraint(), ...this.parseElementConstraint()];

    if (predicates.length === 0) {
      return () => true;
    } else if (predicates.length === 1) {
      return predicates[0];
    } else {
      return input => predicates.every(predicate => predicate(input));
    }
  }

  getDataType() {
    if (this.data.dataType) {
      return this.data.dataType;
    } else if (this.data.predicate instanceof RegExp) {
      return 'String';
    } else if (this.data.tokenList) {
      return 'String';
    } else if (this.data.elementConstraint) {
      return 'Array';
    } else {
      return 'Primitive';
    }
  }

  get dataType() {
    return this.getDataType();
  }

  get predicate() {
    return this.getCombinedPredicate();
  }

  get extends() {
    return this.data.extends;
  }

}

exports.TypeParser = TypeParser;

class DataParser {
  constructor(parser, {
    async
  } = {}) {
    this.parser = parser;
    this.async = async;
  }

  validate() {
    const parser = this.parser;

    if (typeof parser !== 'function') {
      throw new TypeError(`parser was ${typeof parser}; expected function`);
    }
  }

}

exports.DataParser = DataParser;

class FormatParser {
  constructor(format, parsers = {}) {
    this.format = format;

    if (parsers.parseType) {
      this.typeParser = new TypeParser(parsers.parseType);
    }

    if (parsers.parse) {
      this.dataParser = new DataParser(parsers.parse, {
        async: false
      });
    }

    if (parsers.parseAsync) {
      this.asyncDataParser = new DataParser(parsers.parseAsync, {
        async: true
      });
    }
  }

  validateFormat() {
    const format = this.format;

    if (!_type.typeMatcher.test(format)) {
      throw new TypeError(`format name was "${format}"; didn't match expected pattern`);
    }
  }

  validate() {
    this.validateFormat();

    if (this.typeParser) {
      this.typeParser.validate();
    }

    if (this.dataParser) {
      this.dataParser.validate();
    }

    if (this.asyncDataParser) {
      this.asyncDataParser.validate();
    }
  }

}

exports.FormatParser = FormatParser;
},{"./type":32}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = exports.has = exports.remove = exports.get = exports.add = void 0;

var _parser = require("./parser");

var _type = require("./type");

var _data = require("./data");

const formats = {};

const add = (format, parsers) => {
  const formatParser = new _parser.FormatParser(format, parsers);
  formatParser.validate();
  const index = formats[format] || (formats[format] = {});

  if (formatParser.typeParser) {
    (0, _type.addTypeParser)(format, formatParser.typeParser);
    index.type = true;
  }

  if (formatParser.dataParser) {
    (0, _data.addDataParser)(format, formatParser.dataParser);
    index.data = true;
  }

  if (formatParser.asyncDataParser) {
    (0, _data.addDataParser)(format, formatParser.asyncDataParser);
    index.asyncData = true;
  }

  if (parsers.outputs) {
    index.outputs = parsers.outputs;
  }
};

exports.add = add;

const get = format => {
  return formats[format];
};

exports.get = get;

const remove = format => {
  const index = formats[format];

  if (!index) {
    return;
  }

  if (index.type) {
    (0, _type.removeTypeParser)(format);
  }

  if (index.data) {
    (0, _data.removeDataParser)(format);
  }

  if (index.asyncData) {
    (0, _data.removeDataParser)(format, true);
  }

  delete formats[format];
};

exports.remove = remove;

const has = format => format in formats;

exports.has = has;

const list = () => Object.keys(formats);

exports.list = list;
},{"./data":26,"./parser":30,"./type":32}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeMatcher = exports.treeTypeParser = exports.listTypeParser = exports.removeTypeParser = exports.hasTypeParser = exports.addTypeParser = exports.type = void 0;

var _logger = _interopRequireDefault(require("../../logger"));

var _dataType = require("./dataType");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const types = {};
const dataTypes = {};
const unregExts = {};

const parseNativeTypes = (input, dataType) => {
  switch (dataType) {
    case 'Array':
      if (input.length === 0 || input.every(entry => type(entry) === '@csl/object')) {
        return '@csl/list+object';
      } else {
        return '@else/list+object';
      }

    case 'SimpleObject':
    case 'ComplexObject':
      return '@csl/object';

    default:
      return '@invalid';
  }
};

const matchType = (typeList = [], data) => {
  for (const type of typeList) {
    if (types[type].predicate(data)) {
      return matchType(types[type].extensions, data) || type;
    }
  }
};

const type = input => {
  const dataType = (0, _dataType.dataTypeOf)(input);

  if (dataType === 'Array' && input.length === 0) {
    return parseNativeTypes(input, dataType);
  }

  const match = matchType(dataTypes[dataType], input);
  return match || parseNativeTypes(input, dataType);
};

exports.type = type;

const addTypeParser = (format, {
  dataType,
  predicate,
  extends: extend
}) => {
  let extensions = [];

  if (format in unregExts) {
    extensions = unregExts[format];
    delete unregExts[format];

    _logger.default.debug('[core]', `Subclasses "${extensions}" finally registered to parent type "${format}"`);
  }

  const object = {
    predicate,
    extensions
  };
  types[format] = object;

  if (extend) {
    const parentTypeParser = types[extend];

    if (parentTypeParser) {
      parentTypeParser.extensions.push(format);
    } else {
      if (!unregExts[extend]) {
        unregExts[extend] = [];
      }

      unregExts[extend].push(format);

      _logger.default.debug('[core]', `Subclass "${format}" is waiting on parent type "${extend}"`);
    }
  } else {
    const typeList = dataTypes[dataType] || (dataTypes[dataType] = []);
    typeList.push(format);
  }
};

exports.addTypeParser = addTypeParser;

const hasTypeParser = type => Object.prototype.hasOwnProperty.call(types, type);

exports.hasTypeParser = hasTypeParser;

const removeTypeParser = type => {
  delete types[type];
  const typeLists = [...Object.keys(dataTypes).map(key => dataTypes[key]), ...Object.keys(types).map(type => types[type].extensions).filter(list => list.length > 0)];
  typeLists.forEach(typeList => {
    const index = typeList.indexOf(type);

    if (index > -1) {
      typeList.splice(index, 1);
    }
  });
};

exports.removeTypeParser = removeTypeParser;

const listTypeParser = () => Object.keys(types);

exports.listTypeParser = listTypeParser;

const treeTypeParser = () => {
  const attachNode = name => ({
    name,
    children: types[name].extensions.map(attachNode)
  });

  return {
    name: 'Type tree',
    children: Object.keys(dataTypes).map(name => ({
      name,
      children: dataTypes[name].map(attachNode)
    }))
  };
};

exports.treeTypeParser = treeTypeParser;
const typeMatcher = /^(?:@(.+?))(?:\/(?:(.+?)\+)?(?:(.+)))?$/;
exports.typeMatcher = typeMatcher;
},{"../../logger":10,"./dataType":27}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = exports.list = exports.has = exports.remove = exports.add = exports.register = void 0;

var _register = _interopRequireDefault(require("../util/register"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const validate = (name, formatter) => {
  if (typeof name !== 'string') {
    throw new TypeError(`Invalid output format name, expected string, got ${typeof name}`);
  } else if (typeof formatter !== 'function') {
    throw new TypeError(`Invalid formatter, expected function, got ${typeof formatter}`);
  }
};

const register = new _register.default();
exports.register = register;

const add = (name, formatter) => {
  validate(name, formatter);
  register.set(name, formatter);
};

exports.add = add;

const remove = name => {
  register.remove(name);
};

exports.remove = remove;

const has = name => {
  return register.has(name);
};

exports.has = has;

const list = () => {
  return register.list();
};

exports.list = list;

const format = (name, data, ...options) => {
  if (!register.has(name)) {
    throw new Error(`Output format "${name}" unavailable`);
  }

  return register.get(name)(data, ...options);
};

exports.format = format;
},{"../util/register":39}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepCopy = deepCopy;
exports.default = void 0;

function deepCopy(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || value.constructor !== Object && value.constructor !== Array) {
    return value;
  }

  if (seen.has(value)) {
    throw new TypeError('Recursively copying circular structure');
  }

  seen.add(value);
  let copy;

  if (value.constructor === Array) {
    copy = value.map(value => deepCopy(value, seen));
  } else {
    const object = {};

    for (const key in value) {
      object[key] = deepCopy(value[key], seen);
    }

    copy = object;
  }

  seen.delete(value);
  return copy;
}

var _default = deepCopy;
exports.default = _default;
},{}],35:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchFile = fetchFile;
exports.fetchFileAsync = fetchFileAsync;
exports.setUserAgent = setUserAgent;
exports.default = void 0;

var _syncFetch = _interopRequireDefault(require("sync-fetch"));

require("isomorphic-fetch");

var _logger = _interopRequireDefault(require("../logger"));

var _package = require("../../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const corsEnabled = typeof location !== 'undefined' && typeof document !== 'undefined';
let userAgent = `Citation.js/${_package.version} Node.js/${process.version}`;

function normaliseHeaders(headers) {
  const result = {};
  const entries = headers instanceof Headers || headers instanceof _syncFetch.default.Headers ? Array.from(headers) : Object.entries(headers);

  for (const [name, header] of entries) {
    result[name.toLowerCase()] = header.toString();
  }

  return result;
}

function parseOpts(opts = {}) {
  const reqOpts = {
    headers: {
      accept: '*/*'
    },
    method: 'GET',
    checkContentType: opts.checkContentType
  };

  if (userAgent && !corsEnabled) {
    reqOpts.headers['user-agent'] = userAgent;
  }

  if (opts.body) {
    reqOpts.method = 'POST';
    const isJson = typeof opts.body !== 'string';
    reqOpts.body = isJson ? JSON.stringify(opts.body) : opts.body;
    reqOpts.headers['content-type'] = isJson ? 'application/json' : 'text/plain';
  }

  if (opts.headers) {
    Object.assign(reqOpts.headers, normaliseHeaders(opts.headers));
  }

  return reqOpts;
}

function sameType(request, response) {
  if (!request.accept || request.accept === '*/*' || !response['content-type']) {
    return true;
  }

  const [a, b] = response['content-type'].split(';')[0].trim().split('/');
  return request.accept.split(',').map(type => type.split(';')[0].trim().split('/')).some(([c, d]) => (c === a || c === '*') && (d === b || d === '*'));
}

function checkResponse(response, opts) {
  const {
    status,
    headers
  } = response;
  let error;

  if (status >= 400) {
    error = new Error(`Server responded with status code ${status}`);
  } else if (opts.checkContentType === true && !sameType(opts.headers, normaliseHeaders(headers))) {
    error = new Error(`Server responded with content-type ${headers.get('content-type')}`);
  }

  if (error) {
    error.status = status;
    error.headers = headers;
    error.body = response.body;
    throw error;
  }

  return response;
}

function fetchFile(url, opts) {
  const reqOpts = parseOpts(opts);

  _logger.default.http('[core]', reqOpts.method, url, reqOpts);

  const response = checkResponse((0, _syncFetch.default)(url, reqOpts), reqOpts);
  return response.text();
}

async function fetchFileAsync(url, opts) {
  const reqOpts = parseOpts(opts);

  _logger.default.http('[core]', reqOpts.method, url, reqOpts);

  return fetch(url, reqOpts).then(response => checkResponse(response, reqOpts)).then(response => response.text());
}

function setUserAgent(newUserAgent) {
  userAgent = newUserAgent;
}

var _default = fetchFile;
exports.default = _default;
}).call(this)}).call(this,require('_process'))
},{"../../package.json":42,"../logger":10,"_process":98,"isomorphic-fetch":96,"sync-fetch":102}],36:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const fetchId = function (list, prefix) {
  let id;

  while (id === undefined || list.includes(id)) {
    id = `${prefix}${Math.random().toString().slice(2)}`;
  }

  return id;
};

var _default = fetchId;
exports.default = _default;
},{}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grammar = void 0;

class Grammar {
  constructor(rules, state) {
    this.rules = rules;
    this.state = state;
    this.mainRule = Object.keys(rules)[0];
    this.log = [];
  }

  parse(iterator) {
    this.lexer = iterator;
    this.token = this.lexer.next();
    return this.consumeRule(this.mainRule);
  }

  matchEndOfFile() {
    return !this.token;
  }

  matchToken(type) {
    return this.token && type === this.token.type;
  }

  consumeToken(type, optional) {
    const token = this.token;

    if (!type || token && token.type === type) {
      this.token = this.lexer.next();
      return token;
    } else if (optional) {
      return undefined;
    } else {
      const got = token ? `"${token.type}"` : 'EOF';
      const error = new SyntaxError(this.lexer.formatError(token, `expected "${type}", got ${got}`));
      error.message += ` (${this.log.join('->')})`;
      throw error;
    }
  }

  consumeRule(rule) {
    this.log.push(rule);
    const result = this.rules[rule].call(this);
    this.log.pop();
    return result;
  }

}

exports.Grammar = Grammar;
},{}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "deepCopy", {
  enumerable: true,
  get: function () {
    return _deepCopy.default;
  }
});
Object.defineProperty(exports, "fetchFile", {
  enumerable: true,
  get: function () {
    return _fetchFile.fetchFile;
  }
});
Object.defineProperty(exports, "fetchFileAsync", {
  enumerable: true,
  get: function () {
    return _fetchFile.fetchFileAsync;
  }
});
Object.defineProperty(exports, "setUserAgent", {
  enumerable: true,
  get: function () {
    return _fetchFile.setUserAgent;
  }
});
Object.defineProperty(exports, "fetchId", {
  enumerable: true,
  get: function () {
    return _fetchId.default;
  }
});
Object.defineProperty(exports, "TokenStack", {
  enumerable: true,
  get: function () {
    return _stack.default;
  }
});
Object.defineProperty(exports, "Register", {
  enumerable: true,
  get: function () {
    return _register.default;
  }
});
Object.defineProperty(exports, "Grammar", {
  enumerable: true,
  get: function () {
    return _grammar.Grammar;
  }
});
Object.defineProperty(exports, "Translator", {
  enumerable: true,
  get: function () {
    return _translator.Translator;
  }
});

var _deepCopy = _interopRequireDefault(require("./deepCopy"));

var _fetchFile = require("./fetchFile");

var _fetchId = _interopRequireDefault(require("./fetchId"));

var _stack = _interopRequireDefault(require("./stack"));

var _register = _interopRequireDefault(require("./register"));

var _grammar = require("./grammar");

var _translator = require("./translator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./deepCopy":34,"./fetchFile":35,"./fetchId":36,"./grammar":37,"./register":39,"./stack":40,"./translator":41}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Register {
  constructor(data = {}) {
    this.data = data;
  }

  set(key, value) {
    this.data[key] = value;
    return this;
  }

  add(...args) {
    return this.set(...args);
  }

  delete(key) {
    delete this.data[key];
    return this;
  }

  remove(...args) {
    return this.delete(...args);
  }

  get(key) {
    return this.data[key];
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  list() {
    return Object.keys(this.data);
  }

}

var _default = Register;
exports.default = _default;
},{}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class TokenStack {
  constructor(array) {
    this.stack = array;
    this.index = 0;
    this.current = this.stack[this.index];
  }

  static getPatternText(pattern) {
    return `"${pattern instanceof RegExp ? pattern.source : pattern}"`;
  }

  static getMatchCallback(pattern) {
    if (Array.isArray(pattern)) {
      const matches = pattern.map(TokenStack.getMatchCallback);
      return token => matches.some(matchCallback => matchCallback(token));
    } else if (pattern instanceof Function) {
      return pattern;
    } else if (pattern instanceof RegExp) {
      return token => pattern.test(token);
    } else {
      return token => pattern === token;
    }
  }

  tokensLeft() {
    return this.stack.length - this.index;
  }

  matches(pattern) {
    return TokenStack.getMatchCallback(pattern)(this.current, this.index, this.stack);
  }

  matchesSequence(sequence) {
    const part = this.stack.slice(this.index, this.index + sequence.length).join('');
    return typeof sequence === 'string' ? part === sequence : sequence.every((pattern, index) => TokenStack.getMatchCallback(pattern)(part[index]));
  }

  consumeToken(pattern = /^[\s\S]$/, {
    inverse = false,
    spaced = true
  } = {}) {
    if (spaced) {
      this.consumeWhitespace();
    }

    const token = this.current;
    const match = TokenStack.getMatchCallback(pattern)(token, this.index, this.stack);

    if (match) {
      this.current = this.stack[++this.index];
    } else {
      throw new SyntaxError(`Unexpected token at index ${this.index}: Expected ${TokenStack.getPatternText(pattern)}, got "${token}"`);
    }

    if (spaced) {
      this.consumeWhitespace();
    }

    return token;
  }

  consumeWhitespace(pattern = /^\s$/, {
    optional = true
  } = {}) {
    return this.consume(pattern, {
      min: +!optional
    });
  }

  consumeN(length) {
    if (this.tokensLeft() < length) {
      throw new SyntaxError('Not enough tokens left');
    }

    const start = this.index;

    while (length--) {
      this.current = this.stack[++this.index];
    }

    return this.stack.slice(start, this.index).join('');
  }

  consumeSequence(sequence) {
    if (this.matchesSequence(sequence)) {
      return this.consumeN(sequence.length);
    } else {
      throw new SyntaxError(`Expected "${sequence}", got "${this.consumeN(sequence.length)}"`);
    }
  }

  consume(pattern = /^[\s\S]$/, {
    min = 0,
    max = Infinity,
    inverse = false,
    tokenMap,
    tokenFilter
  } = {}) {
    const start = this.index;
    const match = TokenStack.getMatchCallback(pattern);

    while (match(this.current, this.index, this.stack) !== inverse) {
      this.current = this.stack[++this.index];
    }

    let consumed = this.stack.slice(start, this.index);

    if (consumed.length < min) {
      throw new SyntaxError(`Not enough ${TokenStack.getPatternText(pattern)}`);
    } else if (consumed.length > max) {
      throw new SyntaxError(`Too many ${TokenStack.getPatternText(pattern)}`);
    }

    if (tokenMap) {
      consumed = consumed.map(tokenMap);
    }

    if (tokenFilter) {
      consumed = consumed.filter(tokenFilter);
    }

    return consumed.join('');
  }

}

var _default = TokenStack;
exports.default = _default;
},{}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Translator = void 0;

function createConditionEval(condition) {
  return function conditionEval(input) {
    if (typeof condition === 'boolean') {
      return condition;
    }

    return Object.keys(condition).every(prop => {
      const value = condition[prop];

      if (value === true) {
        return prop in input;
      } else if (value === false) {
        return !(prop in input);
      } else if (typeof value === 'function') {
        return value(input[prop]);
      } else if (Array.isArray(value)) {
        return value.includes(input[prop]);
      } else {
        return input[prop] === value;
      }
    });
  };
}

function parsePropStatement(prop, toSource) {
  let inputProp;
  let outputProp;
  let convert;
  let condition;

  if (typeof prop === 'string') {
    inputProp = outputProp = prop;
  } else if (prop) {
    inputProp = toSource ? prop.target : prop.source;
    outputProp = toSource ? prop.source : prop.target;

    if (prop.convert) {
      convert = toSource ? prop.convert.toSource : prop.convert.toTarget;
    }

    if (prop.when) {
      condition = toSource ? prop.when.target : prop.when.source;

      if (condition != null) {
        condition = createConditionEval(condition);
      }
    }
  } else {
    return null;
  }

  inputProp = [].concat(inputProp).filter(Boolean);
  outputProp = [].concat(outputProp).filter(Boolean);
  return {
    inputProp,
    outputProp,
    convert,
    condition
  };
}

function createConverter(props, toSource) {
  toSource = toSource === Translator.CONVERT_TO_SOURCE;
  props = props.map(prop => parsePropStatement(prop, toSource)).filter(Boolean);
  return function converter(input) {
    const output = {};

    for (const {
      inputProp,
      outputProp,
      convert,
      condition
    } of props) {
      if (outputProp.length === 0) {
        continue;
      } else if (condition && !condition(input)) {
        continue;
      } else if (inputProp.length !== 0 && inputProp.every(prop => !(prop in input))) {
        continue;
      }

      let outputData = inputProp.map(prop => input[prop]);

      if (convert) {
        const converted = convert.apply(input, outputData);
        outputData = outputProp.length === 1 ? [converted] : converted;
      }

      outputProp.forEach((prop, index) => {
        const value = outputData[index];

        if (value !== undefined) {
          output[prop] = value;
        }
      });
    }

    return output;
  };
}

class Translator {
  constructor(props) {
    this.convertToSource = createConverter(props, Translator.CONVERT_TO_SOURCE);
    this.convertToTarget = createConverter(props, Translator.CONVERT_TO_TARGET);
  }

}

exports.Translator = Translator;
Translator.CONVERT_TO_SOURCE = Symbol('convert to source');
Translator.CONVERT_TO_TARGET = Symbol('convert to target');
},{}],42:[function(require,module,exports){
module.exports={
  "name": "@citation-js/core",
  "version": "0.5.0-alpha.9",
  "description": "Convert different bibliographic metadata sources",
  "keywords": [
    "citation-js",
    "citation",
    "bibliography"
  ],
  "author": "Lars Willighagen <lars.willighagen@gmail.com>",
  "license": "MIT",
  "main": "lib/index.js",
  "module": "lib-mjs/index.js",
  "directories": {
    "lib": "src",
    "test": "__tests__"
  },
  "homepage": "https://citation.js.org/",
  "repository": "https://github.com/citation-js/citation-js/tree/master/packages/core",
  "bugs": {
    "url": "https://github.com/citation-js/citation-js/issues"
  },
  "engines": {
    "node": ">=8"
  },
  "files": [
    "lib",
    "lib-mjs"
  ],
  "scripts": {
    "test": "mocha -c -R dot test/*.spec.js"
  },
  "dependencies": {
    "@citation-js/date": "^0.4.4",
    "@citation-js/name": "^0.4.2",
    "isomorphic-fetch": "^3.0.0",
    "sync-fetch": "^0.2.0"
  },
  "devDependencies": {
    "@babel/plugin-proposal-class-properties": "^7.12.1"
  },
  "gitHead": "ebcf91e8aa39c6230df76192ce5b1ed5147a7a0f"
}

},{}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function get() {
    return _input.default;
  }
});
Object.defineProperty(exports, "format", {
  enumerable: true,
  get: function get() {
    return _output.default;
  }
});

var _input = _interopRequireDefault(require("./input"));

var _output = _interopRequireDefault(require("./output"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./input":44,"./output":45}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const monthMap = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
};

const getMonth = monthName => monthMap[monthName.toLowerCase().slice(0, 3)];

const parseEpoch = function parseEpoch(date) {
  let epoch = new Date(date);

  if (typeof date === 'number' && !isNaN(epoch.valueOf())) {
    return [epoch.getFullYear(), epoch.getMonth() + 1, epoch.getDate()];
  } else {
    return null;
  }
};

const parseIso8601 = function parseIso8601(date) {
  const pattern = /^(\d{4}|[-+]\d{6,})-(\d{2})(?:-(\d{2}))?/;

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null;
  }

  let _date$match = date.match(pattern),
      _date$match2 = _slicedToArray(_date$match, 4),
      year = _date$match2[1],
      month = _date$match2[2],
      day = _date$match2[3];

  if (!+month) {
    return [year];
  } else if (!+day) {
    return [year, month];
  } else {
    return [year, month, day];
  }
};

const parseRfc2822 = function parseRfc2822(date) {
  const pattern = /^(?:[a-z]{3},\s*)?(\d{1,2}) ([a-z]{3}) (\d{4,})/i;

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null;
  }

  let _date$match3 = date.match(pattern),
      _date$match4 = _slicedToArray(_date$match3, 4),
      day = _date$match4[1],
      month = _date$match4[2],
      year = _date$match4[3];

  month = getMonth(month);

  if (!month) {
    return null;
  }

  return [year, month, day];
};

const parseAmericanDay = function parseAmericanDay(date) {
  const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2}(?:\d{2})?)/;

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null;
  }

  let _date$match5 = date.match(pattern),
      _date$match6 = _slicedToArray(_date$match5, 4),
      month = _date$match6[1],
      day = _date$match6[2],
      year = _date$match6[3];

  let check = new Date(year, month, day);

  if (check.getMonth() === parseInt(month)) {
    return [year, month, day];
  } else {
    return null;
  }
};

const parseDay = function parseDay(date) {
  const pattern = /^(\d{1,2})[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](-?\d+)/i;
  const reversePattern = /^(-?\d+)[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](\d{1,2})/i;
  let year;
  let month;
  let day;

  if (typeof date !== 'string') {
    return null;
  } else if (pattern.test(date)) {
    var _date$match7 = date.match(pattern);

    var _date$match8 = _slicedToArray(_date$match7, 4);

    day = _date$match8[1];
    month = _date$match8[2];
    year = _date$match8[3];
  } else if (reversePattern.test(date)) {
    var _date$match9 = date.match(reversePattern);

    var _date$match10 = _slicedToArray(_date$match9, 4);

    year = _date$match10[1];
    month = _date$match10[2];
    day = _date$match10[3];
  } else {
    return null;
  }

  if (getMonth(month)) {
    month = getMonth(month);
  } else if (isNaN(month)) {
    return null;
  }

  return [year, month, day];
};

const parseMonth = function parseMonth(date) {
  const pattern = /^([a-z]{3,10}|-?\d+)[^\w-]+([a-z]{3,10}|-?\d+)$/i;

  if (typeof date === 'string' && pattern.test(date)) {
    let values = date.match(pattern).slice(1, 3);
    let month;

    if (getMonth(values[1])) {
      month = getMonth(values.pop());
    } else if (getMonth(values[0])) {
      month = getMonth(values.shift());
    } else if (values.some(isNaN) || values.every(value => +value < 0)) {
      return null;
    } else if (+values[0] < 0) {
      month = values.pop();
    } else if (+values[0] > +values[1] && +values[1] > 0) {
      month = values.pop();
    } else {
      month = values.shift();
    }

    let year = values.pop();
    return [year, month];
  } else {
    return null;
  }
};

const parseYear = function parseYear(date) {
  if (typeof date === 'string' && /^-?\d+$/.test(date)) {
    return [date];
  } else {
    return null;
  }
};

const parseDate = function parseDate(value) {
  let dateParts = parseEpoch(value) || parseIso8601(value) || parseRfc2822(value) || parseAmericanDay(value) || parseDay(value) || parseMonth(value) || parseYear(value);

  if (dateParts) {
    dateParts = dateParts.map(string => parseInt(string));
    return {
      'date-parts': [dateParts]
    };
  } else {
    return {
      raw: value
    };
  }
};

var _default = parseDate;
exports.default = _default;
},{}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function padStart(str, len, chr) {
  if (str.length >= len) {
    return str;
  }

  while (str.length < len) {
    str = chr + str;
  }

  return str.slice(-len);
}

const getDate = function getDate(date, delimiter = '-') {
  if (!date['date-parts']) {
    return date.raw;
  }

  let dateParts = date['date-parts'][0].map(part => part.toString());

  switch (dateParts.length) {
    case 3:
      dateParts[2] = padStart(dateParts[2], 2, '0');

    case 2:
      dateParts[1] = padStart(dateParts[1], 2, '0');

    case 1:
      dateParts[0] = padStart(dateParts[0], 4, '0');
      break;
  }

  return dateParts.join(delimiter);
};

var _default = getDate;
exports.default = _default;
},{}],46:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"./input":47,"./output":48,"dup":43}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = exports.types = exports.scope = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const punctutationMatcher = string => string.replace(/$|( )|(?!^)(?=[A-Z])/g, '\\.?$1');

const getListMatcher = list => `(?:${list.join('|')})\\b`;

const getSplittingRegex = (matcher, flags) => new RegExp(`(?:^| )(${matcher}$)`, flags);

const titles = ['mr', 'mrs', 'ms', 'miss', 'dr', 'herr', 'monsieur', 'hr', 'frau', 'a v m', 'admiraal', 'admiral', 'air cdre', 'air commodore', 'air marshal', 'air vice marshal', 'alderman', 'alhaji', 'ambassador', 'baron', 'barones', 'brig', 'brig gen', 'brig general', 'brigadier', 'brigadier general', 'brother', 'canon', 'capt', 'captain', 'cardinal', 'cdr', 'chief', 'cik', 'cmdr', 'coach', 'col', 'col dr', 'colonel', 'commandant', 'commander', 'commissioner', 'commodore', 'comte', 'comtessa', 'congressman', 'conseiller', 'consul', 'conte', 'contessa', 'corporal', 'councillor', 'count', 'countess', 'crown prince', 'crown princess', 'dame', 'datin', 'dato', 'datuk', 'datuk seri', 'deacon', 'deaconess', 'dean', 'dhr', 'dipl ing', 'doctor', 'dott', 'dott sa', 'dr', 'dr ing', 'dra', 'drs', 'embajador', 'embajadora', 'en', 'encik', 'eng', 'eur ing', 'exma sra', 'exmo sr', 'f o', 'father', 'first lieutient', 'first officer', 'flt lieut', 'flying officer', 'fr', 'frau', 'fraulein', 'fru', 'gen', 'generaal', 'general', 'governor', 'graaf', 'gravin', 'group captain', 'grp capt', 'h e dr', 'h h', 'h m', 'h r h', 'hajah', 'haji', 'hajim', 'her highness', 'her majesty', 'herr', 'high chief', 'his highness', 'his holiness', 'his majesty', 'hon', 'hr', 'hra', 'ing', 'ir', 'jonkheer', 'judge', 'justice', 'khun ying', 'kolonel', 'lady', 'lcda', 'lic', 'lieut', 'lieut cdr', 'lieut col', 'lieut gen', 'lord', 'm', 'm l', 'm r', 'madame', 'mademoiselle', 'maj gen', 'major', 'master', 'mevrouw', 'miss', 'mlle', 'mme', 'monsieur', 'monsignor', 'mr', 'mrs', 'ms', 'mstr', 'nti', 'pastor', 'president', 'prince', 'princess', 'princesse', 'prinses', 'prof', 'prof dr', 'prof sir', 'professor', 'puan', 'puan sri', 'rabbi', 'rear admiral', 'rev', 'rev canon', 'rev dr', 'rev mother', 'reverend', 'rva', 'senator', 'sergeant', 'sheikh', 'sheikha', 'sig', 'sig na', 'sig ra', 'sir', 'sister', 'sqn ldr', 'sr', 'sr d', 'sra', 'srta', 'sultan', 'tan sri', 'tan sri dato', 'tengku', 'teuku', 'than puying', 'the hon dr', 'the hon justice', 'the hon miss', 'the hon mr', 'the hon mrs', 'the hon ms', 'the hon sir', 'the very rev', 'toh puan', 'tun', 'vice admiral', 'viscount', 'viscountess', 'wg cdr'];
const suffixes = ['I', 'II', 'III', 'IV', 'V', 'Senior', 'Junior', 'Jr', 'Sr', 'PhD', 'Ph\\.D', 'APR', 'RPh', 'PE', 'MD', 'MA', 'DMD', 'CME', 'BVM', 'CFRE', 'CLU', 'CPA', 'CSC', 'CSJ', 'DC', 'DD', 'DDS', 'DO', 'DVM', 'EdD', 'Esq', 'JD', 'LLD', 'OD', 'OSB', 'PC', 'Ret', 'RGS', 'RN', 'RNC', 'SHCJ', 'SJ', 'SNJM', 'SSMO', 'USA', 'USAF', 'USAFR', 'USAR', 'USCG', 'USMC', 'USMCR', 'USN', 'USNR'];
const particles = ['Vere', 'Von', 'Van', 'De', 'Del', 'Della', 'Di', 'Da', 'Pietro', 'Vanden', 'Du', 'St.', 'St', 'La', 'Lo', 'Ter', 'O', 'O\'', 'Mac', 'Fitz'];
const titleMatcher = getListMatcher(titles.map(punctutationMatcher));
const suffixMatcher = getListMatcher(suffixes.map(punctutationMatcher));
const particleMatcher = getListMatcher(particles);
const titleSplitter = new RegExp(`^((?:${titleMatcher} )*)(.*)$`, 'i');
const suffixSplitter = getSplittingRegex(`(?:${suffixMatcher}, )*(?:${suffixMatcher})`, 'i');
const particleSplitter = getSplittingRegex(`${/(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89])/.source}.*`);
const endSplitter = getSplittingRegex(`(?:${/(?:[a-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02B8\u02C0\u02C1\u02E0-\u02E4\u0345\u0371\u0373\u0377\u037A-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1DBF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u2071\u207F\u2090-\u209C\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2170-\u217F\u2184\u24D0-\u24E9\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA69D\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7F8-\uA7FA\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43])/.source}.*|${particleMatcher}.*|\\S*)`);

const parseName = function parseName(name = '') {
  if (typeof name !== 'string') {
    name = name + '';
  }

  let start = '';
  let mid = '';
  let end = '';

  if (/[^.], /.test(name)) {
    const parts = name.split(', ');
    end = parts.shift();
    const suffixMatch = RegExp(suffixMatcher).exec(parts.join(', '));
    start = parts.splice(suffixMatch && suffixMatch.index !== 0 ? 0 : -1, 1)[0];
    mid = parts.join(', ');
  } else {
    const parts = name.split(suffixSplitter, 2);
    const main = parts.shift().split(endSplitter, 2);
    start = main[0];
    end = main[1];
    mid = parts.pop();
  }

  const _start$match = start.match(titleSplitter),
        _start$match2 = _slicedToArray(_start$match, 3),
        droppingParticle = _start$match2[1],
        given = _start$match2[2];

  const suffix = mid;

  const _end$split$reverse = end.split(particleSplitter, 2).reverse(),
        _end$split$reverse2 = _slicedToArray(_end$split$reverse, 2),
        family = _end$split$reverse2[0],
        nonDroppingParticle = _end$split$reverse2[1];

  if (!given && family) {
    return family.includes(' ') ? {
      literal: family
    } : {
      family
    };
  } else if (family) {
    const nameObject = {
      'dropping-particle': droppingParticle,
      given,
      suffix,
      'non-dropping-particle': nonDroppingParticle,
      family
    };
    Object.keys(nameObject).forEach(key => {
      if (!nameObject[key]) {
        delete nameObject[key];
      }
    });
    return nameObject;
  } else {
    return {
      literal: name
    };
  }
};

exports.default = exports.parse = parseName;
const scope = '@name';
exports.scope = scope;
const types = '@name';
exports.types = types;
},{}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const startParts = ['dropping-particle', 'given'];
const suffixParts = ['suffix'];
const endParts = ['non-dropping-particle', 'family'];

const getName = function getName(name, reversed = false) {
  const get = parts => parts.map(entry => name[entry] || '').filter(Boolean).join(' ');

  if (name.literal) {
    return name.literal;
  } else if (reversed) {
    const suffixPart = get(suffixParts) ? `, ${get(suffixParts)}` : '';
    const startPart = get(startParts) ? `, ${get(startParts)}` : '';
    return get(endParts) + suffixPart + startPart;
  } else {
    return `${get([...startParts, ...suffixParts, ...endParts])}`;
  }
};

var _default = getName;
exports.default = _default;
},{}],49:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _input = require("./input/");

var _output = _interopRequireDefault(require("./output/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core.plugins.add(_input.ref, {
  input: _input.formats,
  output: _output.default
});
},{"./input/":52,"./output/":58,"@citation-js/core":"citation-js"}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textEntry = exports.text = exports.parse = void 0;
const bibTxtRegex = {
  splitEntries: /\n\s*(?=\[)/g,
  parseEntry: /^\[(.+?)\]\s*(?:\n([\s\S]+))?$/,
  splitPairs: /((?=.)\s)*\n\s*/g,
  splitPair: /:(.*)/
};

const parseBibTxtEntry = entry => {
  const [, label, pairs] = entry.match(bibTxtRegex.parseEntry) || [];

  if (!label || !pairs) {
    return {};
  } else {
    const out = {
      type: 'book',
      label,
      properties: {}
    };
    pairs.trim().split(bibTxtRegex.splitPairs).filter(v => v).forEach(pair => {
      let [key, value] = pair.split(bibTxtRegex.splitPair);

      if (value) {
        key = key.trim();
        value = value.trim();

        if (key === 'type') {
          out.type = value;
        } else {
          out.properties[key] = value;
        }
      }
    });
    return out;
  }
};

exports.textEntry = parseBibTxtEntry;

const parseBibTxt = src => src.trim().split(bibTxtRegex.splitEntries).map(parseBibTxtEntry);

exports.text = exports.parse = parseBibTxt;
},{}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mathScripts = exports.ligatures = exports.ligaturePattern = exports.commands = exports.diacritics = exports.defaultStrings = void 0;
const defaultStrings = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
  acmcs: 'ACM Computing Surveys',
  acta: 'Acta Informatica',
  cacm: 'Communications of the ACM',
  ibmjrd: 'IBM Journal of Research and Development',
  ibmsj: 'IBM Systems Journal',
  ieeese: 'IEEE Transactions on Software Engineering',
  ieeetc: 'IEEE Transactions on Computers',
  ieeetcad: 'IEEE Transactions on Computer-Aided Design of Integrated Circuits',
  ipl: 'Information Processing Letters',
  jacm: 'Journal of the ACM',
  jcss: 'Journal of Computer and System Sciences',
  scp: 'Science of Computer Programming',
  sicomp: 'SIAM Journal on Computing',
  tocs: 'ACM Transactions on Computer Systems',
  tods: 'ACM Transactions on Database Systems',
  tog: 'ACM Transactions on Graphics',
  toms: 'ACM Transactions on Mathematical Software',
  toois: 'ACM Transactions on Office Information Systems',
  toplas: 'ACM Transactions on Programming Languages and Systems',
  tcs: 'Theoretical Computer Science'
};
exports.defaultStrings = defaultStrings;
const diacritics = {
  '`': '\u0300',
  "'": '\u0301',
  '^': '\u0302',
  '~': '\u0303',
  '=': '\u0304',
  '"': '\u0308',
  c: '\u0327',
  b: '\u0331',
  u: '\u0306',
  v: '\u030C',
  '.': '\u0307',
  d: '\u0323',
  r: '\u030A',
  H: '\u030B',
  k: '\u0328'
};
exports.diacritics = diacritics;
const commands = {
  _: '\u005f',
  '{': '\u007B',
  '}': '\u007D',
  'c\\ ': '\u00B8',
  href: '',
  url: '',
  AE: '\u00C6',
  ae: '\u00E6',
  DH: '\u00D0',
  dh: '\u00F0',
  i: '\u0131',
  j: '\u0237',
  NG: '\u014A',
  ng: '\u014B',
  O: '\u00D8',
  o: '\u00F8',
  OE: '\u0152',
  oe: '\u0153',
  ss: '\u00DF',
  TH: '\u00DE',
  th: '\u00FE',
  copyright: '\u00A9',
  guillemotleft: '\u00AB',
  guillemotright: '\u00BB',
  guilsinglleft: '\u2039',
  guilsinglright: '\u203A',
  quotedblbase: '\u201E',
  quotesinglbase: '\u201A',
  textacutedbl: '\u02DD',
  textasciiacute: '\u00B4',
  textasciicircum: '\u02C6',
  textasciidieresis: '\u00A8',
  textasciimacron: '\u00AF',
  textasciitilde: '\u223C',
  textbackslash: '\u005C',
  textbardbl: '\u2016',
  textbrokenbar: '\u00A6',
  textbullet: '\u2022',
  textcelsius: '\u2103',
  textcent: '\u00A2',
  textcircledP: '\u2117',
  textcopyright: '\u00A9',
  textdagger: '\u2020',
  textdaggerdbl: '\u2021',
  textdegree: '\u00B0',
  textdiv: '\u00F7',
  textellipsis: '\u2026',
  textemdash: '\u2014',
  textendash: '\u2013',
  textestimated: '\u212E',
  texteuro: '\u20AC',
  textexclamdown: '\u00A1',
  textfractionsolidus: '\u2044',
  textlnot: '\u00AC',
  textmu: '\u00B5',
  textnumero: '\u2116',
  textohm: '\u2126',
  textonehalf: '\u00BD',
  textonequarter: '\u00BC',
  textonesuperior: '\u00B9',
  textordfeminine: '\u00AA',
  textordmasculine: '\u00BA',
  textparagraph: '\u00B6',
  textperiodcentered: '\u00B7',
  textperthousand: '\u2030',
  textpm: '\u00B1',
  textquestiondown: '\u00BF',
  textquotedblleft: '\u201C',
  textquotedblright: '\u201D',
  textquoteleft: '\u2018',
  textquoteright: '\u2019',
  textregistered: '\u00AE',
  textsection: '\u00A7',
  textservicemark: '\u2120',
  textsterling: '\u00A3',
  textthreequarters: '\u00BE',
  textthreesuperior: '\u00B3',
  texttimes: '\u00D7',
  texttrademark: '\u2122',
  texttwosuperior: '\u00B2',
  textunderscore: '\u2017',
  textyen: '\u00A5',
  Gamma: '\u0393',
  Delta: '\u0394',
  Theta: '\u0398',
  Lambda: '\u039B',
  Xi: '\u039E',
  Pi: '\u03A0',
  Sigma: '\u03A3',
  Phi: '\u03A6',
  Psi: '\u03A8',
  Omega: '\u03A9',
  alpha: '\u03B1',
  beta: '\u03B2',
  gamma: '\u03B3',
  delta: '\u03B4',
  varepsilon: '\u03B5',
  zeta: '\u03B6',
  eta: '\u03B7',
  theta: '\u03B8',
  iota: '\u03B9',
  kappa: '\u03BA',
  lambda: '\u03BB',
  mu: '\u03BC',
  nu: '\u03BD',
  xi: '\u03BE',
  pi: '\u03C0',
  rho: '\u03C1',
  varsigma: '\u03C2',
  sigma: '\u03C3',
  tau: '\u03C4',
  upsilon: '\u03C5',
  varphi: '\u03C6',
  chi: '\u03C7',
  psi: '\u03C8',
  omega: '\u03C9',
  vartheta: '\u03D1',
  Upsilon: '\u03D2',
  phi: '\u03D5',
  varpi: '\u03D6',
  varrho: '\u03F1',
  epsilon: '\u03F5'
};
exports.commands = commands;
const ligaturePattern = /---?|'''?|```?|!!|\?!|!\?|\bTEL\b|~/g;
exports.ligaturePattern = ligaturePattern;
const ligatures = {
  '---': '\u2014',
  '--': '\u2013',
  "'''": '\u2034',
  "'": '\u201D',
  '```': '\u2037',
  '``': '\u201C',
  '!!': '\u203C',
  '?!': '\u2048',
  '!?': '\u2049',
  TEL: '\u2121',
  '~': '\u00A0'
};
exports.ligatures = ligatures;
const mathScripts = {
  '^': {
    0: '\u2070',
    1: '\u00B9',
    2: '\u00B2',
    3: '\u00B3',
    4: '\u2074',
    5: '\u2075',
    6: '\u2076',
    7: '\u2077',
    8: '\u2078',
    9: '\u2079',
    '+': '\u207A',
    '-': '\u207B',
    '=': '\u207C',
    '(': '\u207D',
    ')': '\u207E',
    i: '\u2071',
    n: '\u207F'
  },
  _: {
    0: '\u2080',
    1: '\u2081',
    2: '\u2082',
    3: '\u2083',
    4: '\u2084',
    5: '\u2085',
    6: '\u2086',
    7: '\u2087',
    8: '\u2088',
    9: '\u2089',
    '+': '\u208A',
    '-': '\u208B',
    '=': '\u208C',
    '(': '\u208D',
    ')': '\u208E',
    a: '\u2090',
    e: '\u2091',
    o: '\u2092',
    x: '\u2093',
    '\u0259': '\u2094',
    h: '\u2095',
    k: '\u2096',
    l: '\u2097',
    m: '\u2098',
    n: '\u2099',
    s: '\u209A',
    p: '\u209B',
    t: '\u209C'
  }
};
exports.mathScripts = mathScripts;
},{}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.parsers = exports.ref = void 0;

var text = _interopRequireWildcard(require("./text"));

var json = _interopRequireWildcard(require("./json"));

var prop = _interopRequireWildcard(require("./prop"));

var type = _interopRequireWildcard(require("./type"));

var bibtxt = _interopRequireWildcard(require("./bibtxt"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ref = '@bibtex';
exports.ref = ref;
const parsers = {
  text,
  json,
  prop,
  type,
  bibtxt
};
exports.parsers = parsers;
const formats = {
  '@bibtex/text': {
    parse: text.parse,
    parseType: {
      dataType: 'String',
      predicate: /@\s{0,5}[A-Za-z]{1,13}\s{0,5}\{\s{0,5}[^@{}"=,\\\s]{0,100}\s{0,5},[\s\S]*\}/
    }
  },
  '@bibtxt/text': {
    parse: bibtxt.parse,
    parseType: {
      dataType: 'String',
      predicate: /^\s*(\[(?!\s*[{[]).*?\]\s*(\n\s*[^[]((?!:)\S)+\s*:\s*.+?\s*)*\s*)+$/
    }
  },
  '@bibtex/object': {
    parse: json.parse,
    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: {
        props: ['type', 'label', 'properties']
      }
    }
  },
  '@bibtex/prop': {
    parse: prop.parse
  },
  '@bibtex/type': {
    parse: type.parse
  }
};
exports.formats = formats;
},{"./bibtxt":50,"./json":53,"./prop":54,"./text":55,"./type":56}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _prop = _interopRequireDefault(require("./prop"));

var _type = _interopRequireDefault(require("./type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parseBibTeXJSON = function (data) {
  return [].concat(data).map(entry => {
    const newEntry = {};
    const toMerge = [];

    for (const prop in entry.properties) {
      const oldValue = entry.properties[prop];
      const [cslField, cslValue] = (0, _prop.default)(prop, oldValue) || [];

      if (cslField) {
        if (/^[^:\s]+?:[^.\s]+(\.[^.\s]+)*$/.test(cslField)) {
          toMerge.push([cslField, cslValue]);
        } else {
          newEntry[cslField] = cslValue;
        }
      }
    }

    newEntry.type = (0, _type.default)(entry.type);
    newEntry.id = newEntry['citation-label'] = entry.label;

    if (/\d(\D+)$/.test(entry.label)) {
      newEntry['year-suffix'] = entry.label.match(/\d(\D+)$/)[1];
    }

    toMerge.forEach(([cslField, value]) => {
      const props = cslField.split(/:|\./g);
      let cursor = newEntry;

      while (props.length > 0) {
        const prop = props.shift();
        cursor = cursor[prop] || (cursor[prop] = !props.length ? value : isNaN(+props[0]) ? {} : []);
      }
    });
    return newEntry;
  });
};

exports.default = exports.parse = parseBibTeXJSON;
},{"./prop":54,"./type":56}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _core = require("@citation-js/core");

var _name = require("@citation-js/name");

var _date = require("@citation-js/date");

const months = [/jan(uary)?\.?/i, /feb(ruary)?\.?/i, /mar(ch)?\.?/i, /apr(il)?\.?/i, /may\.?/i, /jun(e)?\.?/i, /jul(y)?\.?/i, /aug(ust)?\.?/i, /sep(tember)?\.?/i, /oct(ober)?\.?/i, /nov(ember)?\.?/i, /dec(ember)?\.?/i];

const parseBibtexDate = function (value) {
  if (/{|}/.test(value)) {
    return {
      literal: value.replace(/[{}]/g, '')
    };
  } else if (/[â€”â€“]/.test(value)) {
    return {
      'date-parts': value.split(/[â€”â€“]/).map(part => (0, _date.parse)(part)['date-parts'][0])
    };
  } else {
    return (0, _date.parse)(value);
  }
};

const parseBibtexName = function (name) {
  if (/{|}/.test(name)) {
    return {
      literal: name.replace(/[{}]/g, '')
    };
  } else {
    return (0, _name.parse)(name);
  }
};

const parseBibtexNameList = function (list) {
  const literals = [];
  list = list.replace(/%/g, '%0').replace(/{.*?}/g, m => `%[${literals.push(m) - 1}]`);
  return list.split(' and ').map(name => name.replace(/%\[(\d+)\]/g, (_, i) => literals[+i]).replace(/%0/g, '%')).map(parseBibtexName);
};

const richTextMappings = {
  textit: 'i',
  textbf: 'b',
  textsc: 'sc',
  textsuperscript: 'sup',
  textsubscript: 'sub'
};

const parseBibtexRichText = function (text) {
  let tokens = text.split(/((?:\\[a-z]+)?{|})/);
  const closingTags = [];
  let hasTopLevelTag = text[0] === '{' && text[text.length - 1] === '}';
  tokens = tokens.map((token, index) => {
    if (index % 2 === 0) {
      return token;
    } else if (token[0] === '\\') {
      const tag = richTextMappings[token.slice(1, -1)];

      if (tag) {
        closingTags.push(`</${tag}>`);
        return `<${tag}>`;
      } else {
        closingTags.push('');
        return '';
      }
    } else if (token === '{') {
      closingTags.push('</span>');
      return '<span class="nocase">';
    } else if (token === '}') {
      if (closingTags.length === 1 && index !== tokens.length - 2) {
        hasTopLevelTag = false;
      }

      return closingTags.pop();
    }
  });

  if (hasTopLevelTag) {
    tokens.splice(0, 2);
    tokens.splice(-2, 2);
  }

  return tokens.join('');
};

const propMap = {
  address: 'publisher-place',
  author: true,
  booktitle: 'container-title',
  chapter: 'chapter-number',
  doi: 'DOI',
  date: 'issued',
  edition: true,
  editor: true,
  type: 'genre',
  howpublished: 'publisher',
  institution: 'publisher',
  isbn: 'ISBN',
  issn: 'ISSN',
  issue: 'issue',
  journal: 'container-title',
  language: true,
  location: 'publisher-place',
  note: true,
  number: 'issue',
  numpages: 'number-of-pages',
  pages: 'page',
  pmid: 'PMID',
  pmcid: 'PMCID',
  publisher: true,
  school: 'publisher',
  series: 'collection-title',
  title: true,
  url: 'URL',
  volume: true,
  year: 'issued:date-parts.0.0',
  month: 'issued:date-parts.0.1',
  day: 'issued:date-parts.0.2',
  crossref: false,
  keywords: false
};

const parseBibTeXProp = function (name, value) {
  if (propMap[name] == null) {
    _core.logger.unmapped('[plugin-bibtex]', 'property', name);

    return undefined;
  } else if (propMap[name] === false) {
    return undefined;
  }

  const cslProp = propMap[name] === true ? name : propMap[name];

  const cslValue = ((name, value) => {
    switch (name) {
      case 'author':
      case 'editor':
        return parseBibtexNameList(value);

      case 'issued':
        return parseBibtexDate(value);

      case 'edition':
        return value;

      case 'issued:date-parts.0.1':
        return parseFloat(value) ? value : months.findIndex(month => month.test(value)) + 1;

      case 'page':
        return value.replace(/[â€”â€“]/, '-');

      case 'title':
        return parseBibtexRichText(value);

      default:
        return value.replace(/[{}]/g, '');
    }
  })(cslProp, value);

  return [cslProp, cslValue];
};

exports.default = exports.parse = parseBibTeXProp;
},{"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.default = exports.bibtexGrammar = void 0;

var _core = require("@citation-js/core");

var _moo = _interopRequireDefault(require("moo"));

var constants = _interopRequireWildcard(require("./constants"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const identifier = /[a-zA-Z][a-zA-Z0-9_-]*/;
const whitespace = {
  comment: /%.*/,
  whitespace: {
    match: /\s+/,
    lineBreaks: true
  }
};
const text = {
  command: /\\(?:[a-z]+|.) */,
  lbrace: {
    match: '{',
    push: 'bracedLiteral'
  },
  mathShift: {
    match: '$',
    push: 'mathLiteral'
  },
  whitespace: {
    match: /\s+/,
    lineBreaks: true
  }
};

const lexer = _moo.default.states({
  main: {
    junk: {
      match: /@[cC][oO][mM][mM][eE][nN][tT].+|[^@]+/,
      lineBreaks: true
    },
    at: {
      match: '@',
      push: 'entry'
    }
  },
  entry: _objectSpread(_objectSpread({}, whitespace), {}, {
    otherEntryType: {
      match: /[sS][tT][rR][iI][nN][gG]|[pP][rR][eE][aA][mM][bB][lL][eE]/,
      next: 'otherEntryContents'
    },
    dataEntryType: {
      match: identifier,
      next: 'dataEntryContents'
    }
  }),
  otherEntryContents: _objectSpread(_objectSpread({}, whitespace), {}, {
    lbrace: {
      match: /[{(]/,
      next: 'fields'
    }
  }),
  dataEntryContents: _objectSpread(_objectSpread({}, whitespace), {}, {
    lbrace: {
      match: /[{(]/,
      next: 'dataEntryContents'
    },
    label: /[^,\s]+/,
    comma: {
      match: ',',
      next: 'fields'
    }
  }),
  fields: _objectSpread(_objectSpread({}, whitespace), {}, {
    identifier,
    number: /-?\d+/,
    hash: '#',
    equals: '=',
    comma: ',',
    quote: {
      match: '"',
      push: 'quotedLiteral'
    },
    lbrace: {
      match: '{',
      push: 'bracedLiteral'
    },
    rbrace: {
      match: /[})]/,
      pop: true
    }
  }),
  quotedLiteral: _objectSpread(_objectSpread({}, text), {}, {
    quote: {
      match: '"',
      pop: true
    },
    text: /[^{$"\s\\]+/
  }),
  bracedLiteral: _objectSpread(_objectSpread({}, text), {}, {
    rbrace: {
      match: '}',
      pop: true
    },
    text: /[^{$}\s\\]+/
  }),
  mathLiteral: _objectSpread(_objectSpread({}, text), {}, {
    mathShift: {
      match: '$',
      pop: true
    },
    script: /[\^_]/,
    text: /[^{$}\s\\^_]+/
  })
});

const delimiters = {
  '(': ')',
  '{': '}'
};
const bibtexGrammar = new _core.util.Grammar({
  Main() {
    const entries = [];

    while (true) {
      while (this.matchToken('junk')) {
        this.consumeToken('junk');
      }

      if (this.matchEndOfFile()) {
        break;
      }

      entries.push(this.consumeRule('Entry'));
    }

    return entries.filter(Boolean);
  },

  _() {
    let oldToken;

    while (oldToken !== this.token) {
      oldToken = this.token;
      this.consumeToken('whitespace', true);
      this.consumeToken('comment', true);
    }
  },

  Entry() {
    this.consumeToken('at');
    this.consumeRule('_');
    const type = (this.matchToken('otherEntryType') ? this.consumeToken('otherEntryType') : this.consumeToken('dataEntryType')).value.toLowerCase();
    this.consumeRule('_');
    const openBrace = this.consumeToken('lbrace').value;
    this.consumeRule('_');
    let result;

    if (type === 'string') {
      const [key, value] = this.consumeRule('Field');
      this.state.strings[key] = value;
    } else if (type === 'preamble') {
      this.consumeRule('Expression');
    } else {
      const label = this.consumeToken('label').value;
      this.consumeRule('_');
      this.consumeToken('comma');
      this.consumeRule('_');
      const properties = this.consumeRule('EntryBody');
      result = {
        type,
        label,
        properties
      };
    }

    this.consumeRule('_');
    const closeBrace = this.consumeToken('rbrace');

    if (closeBrace !== delimiters[openBrace]) {
      _core.logger.warn('[plugin-bibtex]', `entry started with "${openBrace}", but ends with "${closeBrace}"`);
    }

    return result;
  },

  EntryBody() {
    const properties = {};

    while (this.matchToken('identifier')) {
      const [field, value] = this.consumeRule('Field');
      properties[field] = value;
      this.consumeRule('_');

      if (this.consumeToken('comma', true)) {
        this.consumeRule('_');
      } else {
        break;
      }
    }

    return properties;
  },

  Field() {
    const field = this.consumeToken('identifier');
    this.consumeRule('_');
    this.consumeToken('equals');
    this.consumeRule('_');
    const value = this.consumeRule('Expression');
    return [field, value];
  },

  Expression() {
    let output = this.consumeRule('ExpressionPart');
    this.consumeRule('_');

    while (this.matchToken('hash')) {
      this.consumeToken('hash');
      this.consumeRule('_');
      output += this.consumeRule('ExpressionPart').toString();
      this.consumeRule('_');
    }

    return output;
  },

  ExpressionPart() {
    if (this.matchToken('identifier')) {
      return this.state.strings[this.consumeToken('identifier').value] || '';
    } else if (this.matchToken('number')) {
      return this.consumeToken('number').value;
    } else if (this.matchToken('quote')) {
      return this.consumeRule('QuoteString');
    } else if (this.matchToken('lbrace')) {
      return this.consumeRule('BracketString');
    }
  },

  QuoteString() {
    let output = '';
    this.consumeToken('quote');

    while (!this.matchToken('quote')) {
      output += this.consumeRule('Text');
    }

    this.consumeToken('quote');
    return output;
  },

  BracketString() {
    let output = '';
    this.consumeToken('lbrace');

    while (!this.matchToken('rbrace')) {
      output += this.consumeRule('Text');
    }

    this.consumeToken('rbrace');
    return output;
  },

  BracketText() {
    let output = '';
    this.consumeToken('lbrace');

    while (this.matchToken('command')) {
      output += this.consumeRule('Command');
    }

    if (!this.matchToken('rbrace')) {
      do {
        output += this.consumeRule('Text');
      } while (!this.matchToken('rbrace'));

      output = `{${output}}`;
    }

    this.consumeToken('rbrace');
    return output;
  },

  MathString() {
    let output = '';
    this.consumeToken('mathShift');

    while (!this.matchToken('mathShift')) {
      if (this.matchToken('script')) {
        const script = this.consumeToken('script').value;
        const text = this.consumeRule('Text').replace(/^{|}$/g, '');
        output += constants.mathScripts[script][text[0]] + text.slice(1);
      } else {
        output += this.consumeRule('Text');
      }
    }

    this.consumeToken('mathShift');
    return output;
  },

  Text() {
    let raw;

    if (this.matchToken('lbrace')) {
      raw = this.consumeRule('BracketText');
    } else if (this.matchToken('mathShift')) {
      raw = this.consumeRule('MathString');
    } else if (this.matchToken('whitespace')) {
      this.consumeToken('whitespace');
      raw = ' ';
    } else if (this.matchToken('command')) {
      raw = this.consumeRule('Command');
    } else {
      raw = this.consumeToken('text').value.replace(constants.ligaturePattern, ligature => constants.ligatures[ligature]);
    }

    return raw.normalize();
  },

  Command() {
    const command = this.consumeToken('command').value.slice(1).trim();

    if (command in constants.commands) {
      return constants.commands[command];
    } else if (command in constants.diacritics && !this.matchEndOfFile()) {
      if (this.matchToken('text')) {
        const text = this.consumeToken('text').value;
        return text[0] + constants.diacritics[command] + text.slice(1);
      } else {
        return this.consumeRule('Text').replace(/^{|}$/g, '') + constants.diacritics[command];
      }
    } else if (/^\W$/.test(command)) {
      return command;
    } else {
      return '\\' + command;
    }
  }

}, {
  strings: Object.assign({}, constants.defaultStrings)
});
exports.bibtexGrammar = bibtexGrammar;

function parse(text) {
  return bibtexGrammar.parse(lexer.reset(text));
}

var _default = parse;
exports.default = _default;
},{"./constants":51,"@citation-js/core":"citation-js","moo":97}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _core = require("@citation-js/core");

const typeMap = {
  article: 'article-journal',
  book: 'book',
  booklet: 'book',
  proceedings: 'book',
  manual: false,
  mastersthesis: 'thesis',
  misc: false,
  inbook: 'chapter',
  incollection: 'chapter',
  conference: 'paper-conference',
  inproceedings: 'paper-conference',
  online: 'website',
  patent: 'patent',
  phdthesis: 'thesis',
  techreport: 'report',
  unpublished: 'manuscript'
};

const parseBibTeXType = function (pubType) {
  if (typeMap[pubType] == null) {
    _core.logger.unmapped('[plugin-bibtex]', 'publication type', pubType);

    return 'book';
  } else if (typeMap[pubType] === false) {
    return 'book';
  } else {
    return typeMap[pubType];
  }
};

exports.default = exports.parse = parseBibTeXType;
},{"@citation-js/core":"citation-js"}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getBibtxt = void 0;

var _json = _interopRequireDefault(require("./json"));

var _core = require("@citation-js/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getBibtxt = function (src, dict, opts) {
  const entries = src.map(entry => {
    const bib = (0, _json.default)(entry, opts);
    bib.properties.type = bib.type;
    const properties = Object.keys(bib.properties).map(prop => dict.listItem.join(`${prop}: ${bib.properties[prop]}`)).join('');
    return dict.entry.join(`[${bib.label}]${dict.list.join(properties)}`);
  }).join('\n');
  return dict.bibliographyContainer.join(entries);
};

exports.getBibtxt = getBibtxt;

const getBibtxtWrapper = function (src, html) {
  const dict = _core.plugins.dict.get(html ? 'html' : 'text');

  return getBibtxt(src, dict);
};

var _default = getBibtxtWrapper;
exports.default = _default;
},{"./json":59,"@citation-js/core":"citation-js"}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@citation-js/core");

var _json = _interopRequireDefault(require("./json"));

var _text = require("./text");

var _bibtxt = require("./bibtxt");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const factory = function (formatter) {
  return function (data, opts = {}) {
    const {
      type,
      format = type || 'text'
    } = opts;

    if (format === 'object') {
      return data.map(_json.default);
    } else if (_core.plugins.dict.has(format)) {
      return formatter(data, _core.plugins.dict.get(format), opts);
    } else {
      return '';
    }
  };
};

var _default = {
  bibtex: factory(_text.getBibtex),
  bibtxt: factory(_bibtxt.getBibtxt)
};
exports.default = _default;
},{"./bibtxt":57,"./json":59,"./text":61,"@citation-js/core":"citation-js"}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

var _label = _interopRequireDefault(require("./label"));

var _name = require("@citation-js/name");

var _date = require("@citation-js/date");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getNames(names) {
  return names.map(name => (0, _name.format)(name, true)).join(' and ');
}

const getBibTeXJSON = function (src, opts) {
  const res = {
    label: (0, _label.default)(src, opts),
    type: (0, _type.default)(src.type)
  };
  const props = {};
  const simple = {
    'collection-title': 'series',
    'container-title': ['chapter', 'inproceedings'].includes(src.type) ? 'booktitle' : 'journal',
    edition: 'edition',
    event: 'organization',
    DOI: 'doi',
    ISBN: 'isbn',
    ISSN: 'issn',
    issue: 'number',
    language: 'language',
    note: 'note',
    'number-of-pages': 'numpages',
    PMID: 'pmid',
    PMCID: 'pmcid',
    publisher: 'publisher',
    'publisher-place': 'address',
    title: 'title',
    URL: 'url',
    volume: 'volume'
  };

  for (const prop in simple) {
    if (src[prop] != null) {
      props[simple[prop]] = src[prop] + '';
    }
  }

  if (src.author) {
    props.author = getNames(src.author);
  }

  if (src.editor) {
    props.editor = getNames(src.editor);
  }

  if (!src.note && src.accessed) {
    props.note = `[Online; accessed ${(0, _date.format)(src.accessed)}]`;
  }

  if (src.page) {
    props.pages = src.page.replace('-', '--');
  }

  if (src.issued && src.issued['date-parts']) {
    const dateParts = src.issued['date-parts'][0];

    if (dateParts.length > 0) {
      props.date = (0, _date.format)(src.issued);
      props.year = dateParts[0].toString();
    }

    if (dateParts.length > 1) {
      props.month = dateParts[1].toString();
    }

    if (dateParts.length > 2) {
      props.day = dateParts[2].toString();
    }
  }

  res.properties = props;
  return res;
};

var _default = getBibTeXJSON;
exports.default = _default;
},{"./label":60,"./type":62,"@citation-js/date":43,"@citation-js/name":46}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const stopWords = ['the', 'a', 'an'];

const safeSlug = text => {
  return !text ? '' : text.replace(/<\/?.*?>/g, '').split(/[\u0020-\u002F\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007F]+/).find(word => word.length && !stopWords.includes(word.toLowerCase()));
};

const getBibTeXLabel = function (entry = {}, opts = {}) {
  const {
    generateLabel = true
  } = opts;

  if (entry['citation-label']) {
    return entry['citation-label'];
  } else if (!generateLabel) {
    return entry.id;
  }

  let res = '';

  if (entry.author) {
    res += safeSlug(entry.author[0].family || entry.author[0].literal);
  }

  if (entry.issued && entry.issued['date-parts'] && entry.issued['date-parts'][0]) {
    res += entry.issued['date-parts'][0][0];
  }

  if (entry['year-suffix']) {
    res += entry['year-suffix'];
  } else if (entry.title) {
    res += safeSlug(entry.title);
  }

  return res || entry.id;
};

var _default = getBibTeXLabel;
exports.default = _default;
},{}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getBibtex = void 0;

var _json = _interopRequireDefault(require("./json"));

var _core = require("@citation-js/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const syntaxTokens = {
  '|': '{\\textbar}',
  '<': '{\\textless}',
  '>': '{\\textgreater}',
  '~': '{\\textasciitilde}',
  '^': '{\\textasciicircum}',
  '\\': '{\\textbackslash}',
  '{': '\\{\\vphantom{\\}}',
  '}': '\\vphantom{\\{}\\}'
};

function escapeValue(value) {
  return value.replace(/[|<>~^\\{}]/g, match => syntaxTokens[match]);
}

const richTextMappings = {
  i: '\\textit{',
  b: '\\textbf{',
  sc: '\\textsc{',
  sup: '\\textsuperscript{',
  sub: '\\textsubscript{',
  'span style="font-variant:small-caps;"': '\\textsc{',
  'span class="nocase"': '{'
};

function serializeRichTextValue(value) {
  const closingTags = [];
  let tokens = value.split(/<(\/?(?:i|b|sc|sup|sub|span)|span .*?)>/g);
  tokens = tokens.map((token, index) => {
    if (index % 2 === 0) {
      return escapeValue(token);
    } else if (token in richTextMappings) {
      closingTags.push('/' + token.split(' ')[0]);
      return richTextMappings[token];
    } else if (token === closingTags[closingTags.length - 1]) {
      closingTags.pop();
      return '}';
    } else {
      return '';
    }
  });
  return tokens.join('');
}

const richTextFields = ['title'];

function serializeValue(prop, value, dict) {
  if (richTextFields.includes(prop)) {
    value = serializeRichTextValue(value);
  } else {
    value = escapeValue(value);
  }

  return dict.listItem.join(`${prop} = {${value}},`);
}

function serializeEntry(entry, dict, opts) {
  let {
    type,
    label,
    properties
  } = (0, _json.default)(entry, opts);
  properties = Object.keys(properties).map(prop => serializeValue(prop, properties[prop], dict)).join('');
  return dict.entry.join(`@${type}{${label},${dict.list.join(properties)}}`);
}

const getBibtex = function (src, dict, opts) {
  const entries = src.map(entry => serializeEntry(entry, dict, opts)).join('');
  return dict.bibliographyContainer.join(entries);
};

exports.getBibtex = getBibtex;

const getBibTeXWrapper = function (src, html) {
  const dict = _core.plugins.dict.get(html ? 'html' : 'text');

  return getBibtex(src, dict);
};

var _default = getBibTeXWrapper;
exports.default = _default;
},{"./json":59,"@citation-js/core":"citation-js"}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@citation-js/core");

const bibtexTypes = {
  article: 'article',
  'article-journal': 'article',
  'article-magazine': 'article',
  'article-newspaper': 'article',
  book: 'book',
  chapter: 'incollection',
  graphic: 'misc',
  interview: 'misc',
  manuscript: 'unpublished',
  motion_picture: 'misc',
  'paper-conference': 'inproceedings',
  patent: 'patent',
  personal_communication: 'misc',
  report: 'techreport',
  thesis: 'phdthesis',
  webpage: 'misc'
};

const fetchBibTeXType = function (pubType) {
  if (pubType in bibtexTypes) {
    return bibtexTypes[pubType];
  } else {
    _core.logger.unmapped('[plugin-bibtex]', 'publication type', pubType);

    return 'misc';
  }
};

var _default = fetchBibTeXType;
exports.default = _default;
},{"@citation-js/core":"citation-js"}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseAsync = exports.parse = void 0;

var _json = _interopRequireDefault(require("./json"));

var _core = require("@citation-js/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const apiOptions = {
  checkContentType: true,
  headers: {
    Accept: 'application/vnd.citationstyles.csl+json'
  }
};

const fetchDoiApiAsync = async function (url) {
  const result = await _core.util.fetchFileAsync(url, apiOptions);
  return result === '[]' ? {} : JSON.parse(result);
};

const parseDoiApiAsync = async function (data) {
  const doiJsonList = await Promise.all([].concat(data).map(fetchDoiApiAsync));
  return doiJsonList.map(_json.default);
};

exports.parseAsync = parseDoiApiAsync;

const fetchDoiApi = function (url) {
  const result = _core.util.fetchFile(url, apiOptions);

  return result === '[]' ? {} : JSON.parse(result);
};

const parseDoiApi = data => [].concat(data).map(fetchDoiApi).map(_json.default);

exports.parse = parseDoiApi;
},{"./json":66,"@citation-js/core":"citation-js"}],64:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

const parseDoi = data => {
  const list = Array.isArray(data) ? data : data.trim().split(/(?:\s+)/g);
  return list.map(doi => `https://doi.org/${doi}`);
};

exports.default = exports.parse = parseDoi;
},{}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.parsers = exports.ref = void 0;

var _core = require("@citation-js/core");

var id = _interopRequireWildcard(require("./id"));

var api = _interopRequireWildcard(require("./api"));

var json = _interopRequireWildcard(require("./json"));

var type = _interopRequireWildcard(require("./type"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ref = '@doi';
exports.ref = ref;
const parsers = {
  id,
  api,
  json,
  type
};
exports.parsers = parsers;
const formats = {
  '@doi/api': {
    parse: api.parse,
    parseAsync: api.parseAsync,
    parseType: {
      dataType: 'String',
      predicate: /^\s*(https?:\/\/(?:dx\.)?doi\.org\/(10.\d{4,9}\/[-._;()/:A-Z0-9]+))\s*$/i,
      extends: '@else/url'
    }
  },
  '@doi/id': {
    parse: id.parse,
    parseType: {
      dataType: 'String',
      predicate: /^\s*(10.\d{4,9}\/[-._;()/:A-Z0-9]+)\s*$/i
    }
  },
  '@doi/list+text': {
    parse: id.parse,
    parseType: {
      dataType: 'String',
      tokenList: /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i
    }
  },
  '@doi/list+object': {
    parse: id.parse,
    parseType: {
      dataType: 'Array',
      elementConstraint: '@doi/id'
    }
  },
  '@doi/type': {
    parse: type.parse
  }
};
exports.formats = formats;

_core.plugins.add(ref, {
  input: formats
});
},{"./api":63,"./id":64,"./json":66,"./type":67,"@citation-js/core":"citation-js"}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _type = _interopRequireDefault(require("./type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parseDoiJson = function (data) {
  const res = {
    type: (0, _type.default)(data.type)
  };
  const dateFields = ['submitted', 'issued', 'event-date', 'original-date', 'container', 'accessed'];
  dateFields.forEach(field => {
    const value = data[field];

    if (value && value['date-parts'] && typeof value['date-parts'][0] === 'number') {
      value['date-parts'] = [value['date-parts']];
    }
  });
  return Object.assign({}, data, res);
};

exports.default = exports.parse = parseDoiJson;
},{"./type":67}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;
const varDoiTypes = {
  'journal-article': 'article-journal',
  'book-chapter': 'chapter',
  'posted-content': 'manuscript',
  'proceedings-article': 'paper-conference'
};

const fetchDoiType = value => varDoiTypes[value] || value;

exports.default = exports.parse = fetchDoiType;
},{}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;
exports.GOOGLE_BOOKS_API_VERSION = void 0;

var name = _interopRequireWildcard(require("@citation-js/name"));

var date = _interopRequireWildcard(require("@citation-js/date"));

var _translator = require("./translator");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const GOOGLE_PROPS = [{
  source: 'printType',
  target: 'type',
  convert: {
    toTarget(type) {
      return {
        BOOK: 'book',
        MAGAZINE: 'article-magazine'
      }[type];
    },

    toSource(type) {
      if (type.slice(0, 7) === 'article') {
        return 'MAGAZINE';
      } else {
        return 'BOOK';
      }
    }

  }
}, {
  source: 'authors',
  target: 'author',
  convert: {
    toTarget(authors) {
      return authors.map(name.parse);
    },

    toSource(authors) {
      return authors.map(name.format);
    }

  }
}, {
  source: 'canonicalVolumeLink',
  target: 'URL'
}, {
  source: 'categories',
  target: 'keyword',
  convert: {
    toTarget(array) {
      return array.join(',');
    },

    toSource(list) {
      return list.split(',');
    }

  }
}, {
  source: 'description',
  target: 'abstract'
}, {
  source: 'dimensions',
  target: 'dimensions',
  convert: {
    toTarget({
      height,
      width,
      thickness
    }) {
      return `${height} x ${width} x ${thickness} cm`;
    },

    toSource(list) {}

  }
}, {
  source: 'industryIdentifiers',
  target: ['ISBN', 'ISSN', 'DOI', 'PMID', 'PMCID'],
  convert: {
    toTarget(ids) {
      return ['ISBN_13', 'ISSN'].map(id => (ids.find(({
        type
      }) => type === id) || {}).identifier);
    },

    toSource(isbn, issn, ...other) {
      return [isbn && {
        type: isbn.length === 13 ? 'ISBN_13' : 'ISBN_10',
        identifier: isbn
      }, issn && {
        type: 'ISSN',
        identifier: issn
      }, ...other.map(identifier => ({
        type: 'OTHER',
        identifier
      }))].filter(Boolean);
    }

  }
}, 'language', {
  source: 'pageCount',
  target: 'number-of-pages'
}, 'publisher', 'title', {
  source: 'publishedDate',
  target: 'issued',
  convert: {
    toTarget: date.parse,
    toSource: date.format
  }
}];
const translator = new _translator.Translator(GOOGLE_PROPS);

function parse(volume) {
  return translator.convertToTarget(volume.volumeInfo);
}

function format(records) {
  return {
    kind: 'books#volumes',
    totalItems: records.length,
    items: records.map(translator.convertToSource)
  };
}

const GOOGLE_BOOKS_API_VERSION = 'v1';
exports.GOOGLE_BOOKS_API_VERSION = GOOGLE_BOOKS_API_VERSION;
},{"./translator":72,"@citation-js/date":43,"@citation-js/name":46}],69:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _input = require("./input");

_core.plugins.add(_input.ref, {
  input: _input.formats
});
},{"./input":70,"@citation-js/core":"citation-js"}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.ref = void 0;

var _core = require("@citation-js/core");

var google = _interopRequireWildcard(require("./google-books.js"));

var ol = _interopRequireWildcard(require("./open-library.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function getUrls(isbn) {
  isbn = isbn.replace(/-/g, '');
  return [[`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, json => json.totalItems], [`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, json => Object.keys(json).length]];
}

function getResponse(isbn) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = getUrls(isbn)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let _step$value = _slicedToArray(_step.value, 2),
          url = _step$value[0],
          check = _step$value[1];

      let json = JSON.parse(_core.util.fetchFile(url));

      if (check(json)) {
        return json;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  throw new Error(`Cannot find resource for ISBN: ${isbn}`);
}

function getResponseAsync(_x) {
  return _getResponseAsync.apply(this, arguments);
}

function _getResponseAsync() {
  _getResponseAsync = _asyncToGenerator(function* (isbn) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = getUrls(isbn)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let _step2$value = _slicedToArray(_step2.value, 2),
            url = _step2$value[0],
            check = _step2$value[1];

        let json = JSON.parse((yield _core.util.fetchFileAsync(url)));

        if (check(json)) {
          return json;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    throw new Error(`Cannot find resource for ISBN: ${isbn}`);
  });
  return _getResponseAsync.apply(this, arguments);
}

const ref = '@isbn';
exports.ref = ref;
const formats = {
  '@isbn/isbn-10': {
    parse: getResponse,
    parseAsync: getResponseAsync,
    parseType: {
      dataType: 'String',

      predicate(id) {
        return /^\d{10}$/.test(id.replace(/-/g, ''));
      }

    }
  },
  '@isbn/isbn-13': {
    parse: getResponse,
    parseAsync: getResponseAsync,
    parseType: {
      dataType: 'String',

      predicate(id) {
        return /^(978|979)\d{10}$/.test(id.replace(/-/g, ''));
      }

    }
  },
  '@isbn/isbn-a': {
    parse: doi => doi.slice(3).replace(/\D/g, ''),
    parseType: {
      dataType: 'String',
      predicate: /^10\.(978|979)\.\d{2,8}\/\d{2,7}$/
    },
    outputs: '@isbn/isbn-13'
  },
  '@isbn/number': {
    parse: number => number.toString(),
    parseType: {
      dataType: 'Primitive',
      predicate: number => [10, 13].includes(number.toString().length)
    },
    outputs: '@isbn/isbn-13'
  },
  '@isbn/vnd.google.books.volumes+object': {
    parse(record) {
      return record.items;
    },

    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: [{
        props: 'kind',
        value: kind => kind === 'books#volumes'
      }, {
        props: ['totalItems', 'items']
      }]
    }
  },
  '@isbn/vnd.google.books.volume+object': {
    parse: google.parse,
    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: [{
        props: 'kind',
        value: kind => kind === 'books#volume'
      }, {
        props: ['volumeInfo', 'id']
      }]
    },
    outputs: '@csl/object'
  },
  '@isbn/vnd.archive.openlibrary.books+object': {
    parse: ol.parse,
    parseType: {
      dataType: 'SimpleObject',

      predicate(response) {
        return Object.keys(response).every(key => key.slice(0, 5) === 'ISBN:');
      }

    },
    outputs: '@csl/list+object'
  }
};
exports.formats = formats;
},{"./google-books.js":68,"./open-library.js":71,"@citation-js/core":"citation-js"}],71:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;

var name = _interopRequireWildcard(require("@citation-js/name"));

var date = _interopRequireWildcard(require("@citation-js/date"));

var _translator = require("./translator");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const CONVERT_ARRAY_OF_OBJECTS = {
  toTarget: ([{
    name
  }]) => name,
  toSource: name => [{
    name
  }]
};
const OL_PROPS = [{
  target: 'type',
  convert: {
    toTarget: () => 'book'
  }
}, {
  source: 'authors',
  target: 'author',
  convert: {
    toTarget(authors) {
      return authors.map(({
        name: author,
        url
      }) => {
        author = name.parse(author);
        author._url = url;
        return author;
      });
    },

    toSource: authors => authors.map(author => ({
      name: name.format(author)
    }))
  }
}, {
  source: 'identifiers',
  target: ['ISBN', 'ISSN', 'DOI', 'PMID', 'PMCID'],
  convert: {
    toTarget: identifiers => identifiers.isbn_13 || identifiers.isbn_10,

    toSource(...identifiers) {
      const ids = [identifiers[0] && `isbn_${identifiers[0].length}`, 'issn', 'doi', 'pmid', 'pmcid'];
      return identifiers.reduce((acc, id, i) => {
        if (id) {
          acc[ids[i]] = id;
        }

        return acc;
      }, {});
    }

  }
}, {
  source: 'number_of_pages',
  target: 'number-of-pages'
}, {
  source: 'publishers',
  target: 'publisher',
  convert: CONVERT_ARRAY_OF_OBJECTS
}, {
  source: 'publish_date',
  target: 'issued',
  convert: {
    toTarget: date.parse,
    toSource: date.format
  }
}, {
  source: 'publish_places',
  target: 'publisher-place',
  convert: CONVERT_ARRAY_OF_OBJECTS
}, {
  source: ['subjects', 'subject_places', 'subject_people', 'subject_times'],
  target: 'keyword',
  convert: {
    toTarget: (...subjects) => [].concat(...subjects).filter(Boolean).map(({
      name
    }) => name).join(),
    toSource: keywords => [keywords.split(',').map(name => ({
      name,
      url: 'https://openlibrary.org/subjects/' + name.toLowerCase().replace(/\W+/g, '_')
    }))]
  }
}, 'title', {
  source: 'url',
  target: 'URL'
}];
const translator = new _translator.Translator(OL_PROPS);

function parse(response) {
  return Object.keys(response).map(id => {
    return translator.convertToTarget(response[id]);
  });
}

function format(records) {
  const output = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let record = _step.value;

      if (!record.ISBN) {
        output[`ISBN:${record.ISBN}`] = translator.convertToSource(record);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return output;
}
},{"./translator":72,"@citation-js/date":43,"@citation-js/name":46}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Translator = void 0;

function createConditionEval(condition) {
  return function conditionEval(input) {
    if (typeof condition === 'boolean') {
      return condition;
    }

    return Object.entries(condition).every(([prop, value]) => {
      if (value === true) {
        return prop in input;
      } else if (value === false) {
        return !(prop in input);
      } else if (typeof value === 'function') {
        return value(input[prop]);
      } else if (Array.isArray(value)) {
        return value.includes(input[prop]);
      } else {
        return input[prop] === value;
      }
    });
  };
}

function parsePropStatement(prop, toSource) {
  let inputProp;
  let outputProp;
  let convert;
  let condition;

  if (typeof prop === 'string') {
    inputProp = outputProp = prop;
  } else if (prop) {
    inputProp = toSource ? prop.target : prop.source;
    outputProp = toSource ? prop.source : prop.target;

    if (prop.convert) {
      convert = toSource ? prop.convert.toSource : prop.convert.toTarget;
    }

    if (prop.when) {
      condition = toSource ? prop.when.target : prop.when.source;

      if (condition != null) {
        condition = createConditionEval(condition);
      }
    }
  } else {
    return null;
  }

  inputProp = [].concat(inputProp).filter(Boolean);
  outputProp = [].concat(outputProp).filter(Boolean);
  return {
    inputProp,
    outputProp,
    convert,
    condition
  };
}

function createConverter(props, toSource) {
  toSource = toSource === Translator.CONVERT_TO_SOURCE;
  props = props.map(prop => parsePropStatement(prop, toSource)).filter(Boolean);
  return function converter(input) {
    let output = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let _step$value = _step.value,
            inputProp = _step$value.inputProp,
            outputProp = _step$value.outputProp,
            convert = _step$value.convert,
            condition = _step$value.condition;

        if (outputProp.length === 0) {
          continue;
        } else if (condition && !condition(input)) {
          continue;
        } else if (inputProp.length !== 0 && inputProp.every(prop => !(prop in input))) {
          continue;
        }

        let outputData = inputProp.map(prop => input[prop]);

        if (convert) {
          let converted = convert.apply(input, outputData);
          outputData = outputProp.length === 1 ? [converted] : converted;
        }

        outputProp.forEach((prop, index) => {
          let value = outputData[index];

          if (value !== undefined) {
            output[prop] = value;
          }
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return output;
  };
}

class Translator {
  constructor(props) {
    this.convertToSource = createConverter(props, Translator.CONVERT_TO_SOURCE);
    this.convertToTarget = createConverter(props, Translator.CONVERT_TO_TARGET);
  }

}

exports.Translator = Translator;
Translator.CONVERT_TO_SOURCE = Symbol('convert to source');
Translator.CONVERT_TO_TARGET = Symbol('convert to target');
},{}],73:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"./input":74,"@citation-js/core":"citation-js","dup":69}],74:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.ref = void 0;

var _core = require("@citation-js/core");

const ref = '@pubmed';
exports.ref = ref;
const formats = {
  '@pubmed/id': {
    parseAsync(id) {
      id = id.replace('pmid:', '');
      const url = `https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=csl&id=${id}`;
      const headers = {};
      return _core.util.fetchFileAsync(url, {
        headers
      });
    },

    parseType: {
      dataType: 'String',
      predicate: /^pmid:\d+$/
    }
  },
  '@pubmed/pmcid': {
    parseAsync(id) {
      id = id.replace('PMC', '');
      const url = `https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${id}`;
      const headers = {};
      return _core.util.fetchFileAsync(url, {
        headers
      });
    },

    parseType: {
      dataType: 'String',
      predicate: /^PMC\d+$/
    }
  }
};
exports.formats = formats;
},{"@citation-js/core":"citation-js"}],75:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _output = _interopRequireDefault(require("./output"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ref = '@quickstatements';

_core.plugins.add(ref, {
  output: _output.default
});
},{"./output":76,"@citation-js/core":"citation-js"}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _date = require("@citation-js/date");

var _name = require("@citation-js/name");

var _core = require("@citation-js/core");

var _wikidataSdk = _interopRequireDefault(require("wikidata-sdk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const caches = {
  issn(items) {
    const issns = items.map(item => item.ISSN).filter((value, index, array) => array.indexOf(value) === index).join('" "');
    return `VALUES ?key { "${issns}" } . ?value wdt:P236 ?key .`;
  },

  orcid(items) {
    const orcids = [].concat(...items.map(item => item.author ? item.author.map(author => author.ORCID && author.ORCID.replace(/^https?:\/\/orcid\.org\//, '')) : undefined)).filter((value, index, array) => value && array.indexOf(value) === index).join('" "');
    return `VALUES ?key { "${orcids}" } . ?value wdt:P496 ?key .`;
  },

  language(items) {
    const languages = [].concat(...items.map(item => item.language)).filter((value, index, array) => value && array.indexOf(value) === index).join('" "');
    return `VALUES ?key { "${languages}" } . ?value wdt:P218 ?key .`;
  }

};
const props = {
  P50: 'author',
  P212: 'ISBN',
  P304: 'page',
  P356: 'DOI',
  P407: 'language',
  P433: 'issue',
  P478: 'volume',
  P577: 'issued',
  P496: 'ORCID',
  P698: 'PMID',
  P856: 'URL',
  P932: 'PMCID',
  P1104: 'number-of-pages',
  P1433: 'ISSN',
  P1476: 'title',
  P2093: 'author'
};
const types = {
  dataset: 'Q1172284',
  book: 'Q3331189',
  'article-journal': 'Q13442814',
  article: 'Q191067',
  chapter: 'Q1980247',
  review: 'Q265158',
  'paper-conference': 'Q23927052'
};

function formatDateForWikidata(dateStr) {
  const isoDate = (0, _date.format)(dateStr);

  switch (isoDate.length) {
    case 4:
      return '+' + isoDate + '-01-01T00:00:00Z/9';

    case 7:
      return '+' + isoDate + '-01T00:00:00Z/10';

    case 10:
      return '+' + isoDate + 'T00:00:00Z/11';

    default:
      return '+' + dateStr;
  }
}

function serialize(prop, value, wd, cslType) {
  switch (prop) {
    case 'page':
      return `"${value.replace('--', '-')}"`;

    case 'issued':
      return `${formatDateForWikidata(value)}`;

    case 'author':
      if (wd === 'P50') {
        return value.map((author, index) => {
          if (author.ORCID) {
            const orcid = author.ORCID.replace(/^https?:\/\/orcid\.org\//, '');
            const authorQID = caches.orcid[orcid];

            if (authorQID) {
              const name = (0, _name.format)(author);
              return name ? `${authorQID}\tP1932\t"${name}"\tP1545\t"${index + 1}"` : `${authorQID}\tP1545\t"${index + 1}"`;
            }
          }
        }).filter(Boolean);
      } else {
        return value.map((author, index) => {
          if (author.ORCID) {
            const orcid = author.ORCID.replace(/^https?:\/\/orcid\.org\//, '');
            const authorQID = caches.orcid[orcid];

            if (authorQID) {
              return undefined;
            } else {
              const name = (0, _name.format)(author);
              return name ? `"${name}"\tP496\t"${orcid}"\tP1545\t"${index + 1}"` : undefined;
            }
          } else {
            const name = (0, _name.format)(author);
            return name ? `"${name}"\tP1545\t"${index + 1}"` : undefined;
          }
        }).filter(Boolean);
      }

    case 'ISSN':
      return caches.issn[value];

    case 'DOI':
      return `"${value.toUpperCase()}"`;

    case 'ISBN':
      return cslType === 'chapter' ? undefined : `"${value}"`;

    case 'URL':
      return cslType === 'article-journal' || cslType === 'chapter' ? undefined : value;

    case 'language':
      return caches.language[value];

    case 'number-of-pages':
      return value;

    case 'title':
      return `en:"${value}"`;

    default:
      return `"${value}"`;
  }
}

var _default = {
  quickstatements(csl) {
    const queries = Object.keys(caches).map(cache => {
      const makeQuery = caches[cache];
      caches[cache] = {};
      return `{ ${makeQuery(csl)} BIND("${cache}" AS ?cache) }`;
    }).join(' UNION ');
    const query = `SELECT ?key ?value ?cache WHERE { ${queries} }`;

    try {
      const url = _wikidataSdk.default.sparqlQuery(query);

      const response = JSON.parse(_core.util.fetchFile(url));

      const results = _wikidataSdk.default.simplify.sparqlResults(response);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = results[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const _step$value = _step.value,
                key = _step$value.key,
                value = _step$value.value,
                cache = _step$value.cache;
          caches[cache][key] = value;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    let output = '';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = csl[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const item = _step2.value;
        var prov = '';

        if (item.source) {
          if (item.source === 'PubMed') {
            prov = prov + '\tS248\tQ180686';
          } else if (item.source === 'Crossref') {
            prov = prov + '\tS248\tQ5188229';
          }

          if (item.accessed) {
            prov = prov + '\tS813\t' + formatDateForWikidata(item.accessed);
          } else {
            prov = prov + '\tS813\t+' + new Date().toISOString().substring(0, 10) + 'T00:00:00Z/11';
          }

          if (item._graph && item._graph[0] && item._graph[0].type === '@pubmed/pmcid' && item._graph[0].data) {
            prov = prov + '\tS932\t"' + item._graph[0].data + '"';
          }
        }

        if (types[item.type]) {
          const wdType = types[item.type];
          output = output + '\tCREATE\n\n\tLAST\tP31\t' + wdType + prov + '\n';
          output = output + '\tLAST\tLen\t"' + item.title + '"\n';

          for (const wd in props) {
            const prop = props[wd];
            const value = item[prop];
            if (value == null) continue;
            const serializedValue = serialize(prop, value, wd, item.type);
            if (serializedValue == null) continue;
            output += [].concat(serializedValue).map(value => `\tLAST\t${wd}\t${value}${prov}\n`).join('');
          }

          output = output + '\n';
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return output;
  }

};
exports.default = _default;
},{"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46,"wikidata-sdk":133}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;
exports.CFF_VERSION = void 0;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TYPES_TO_TARGET = {
  art: 'graphic',
  article: 'article',
  audiovisual: 'motion_picture',
  bill: 'bill',
  blog: 'post-weblog',
  book: 'book',
  catalogue: 'entry',
  conference: 'paper-conference',
  'conference-paper': 'paper-conference',
  data: 'dataset',
  database: 'dataset',
  dictionary: 'entry-dictionary',
  'edited-work': 'book',
  encyclopedia: 'entry-encyclopedia',
  'film-broadcast': 'broadcast',
  generic: 'book',
  'government-document': 'bill',
  grant: 'bill',
  hearing: 'interview',
  'historical-work': 'manuscript',
  'legal-case': 'legal_case',
  'legal-rule': 'legislation',
  'magazine-article': 'article-magazine',
  manual: 'article',
  map: 'map',
  multimedia: 'motion_picture',
  music: 'musical_score',
  'newspaper-article': 'article-newspaper',
  pamphlet: 'pamphlet',
  patent: 'patent',
  'personal-communication': 'personal_communication',
  proceedings: 'paper-conference',
  report: 'report',
  serial: 'post',
  slides: 'speech',
  software: 'book',
  'software-code': 'book',
  'software-container': 'book',
  'software-executable': 'book',
  'software-virtual-machine': 'book',
  'sound-recording': 'song',
  standard: 'article',
  statute: 'legislation',
  thesis: 'thesis',
  unpublished: 'article',
  video: 'motion_picture',
  website: 'webpage'
};
const TYPES_TO_SOURCE = {
  article: 'article',
  'article-journal': 'article',
  'article-magazine': 'magazine-article',
  'article-newspaper': 'newspaper-article',
  bill: 'bill',
  book: 'book',
  broadcast: 'film-broadcast',
  chapter: 'serial',
  dataset: 'data',
  entry: 'catalogue',
  'entry-dictionary': 'dictionary',
  'entry-encyclopedia': 'encyclopedia',
  figure: 'art',
  graphic: 'art',
  interview: 'sound-recording',
  legal_case: 'legal-case',
  legislation: 'legal-rule',
  manuscript: 'historical-work',
  map: 'map',
  motion_picture: 'film-broadcast',
  musical_score: 'music',
  pamphlet: 'pamphlet',
  'paper-conference': 'conference-paper',
  patent: 'patent',
  personal_communication: 'personal-communication',
  post: 'serial',
  'post-weblog': 'blog',
  report: 'report',
  review: 'article',
  'review-book': 'book',
  song: 'sound-recording',
  speech: 'sound-recording',
  thesis: 'thesis',
  treaty: 'generic',
  webpage: 'website'
};
const ENTITY_PROPS = [{
  source: 'family-names',
  target: 'family'
}, {
  source: 'given-names',
  target: 'given'
}, {
  source: 'name-particle',
  target: 'non-dropping-particle'
}, {
  source: 'name-suffix',
  target: 'suffix'
}, {
  source: 'name',
  target: 'literal'
}];
const entity = new _core.util.Translator(ENTITY_PROPS);
const PROP_CONVERTERS = {
  names: {
    toTarget(names) {
      return names.map(entity.convertToTarget);
    },

    toSource(names) {
      return names.map(entity.convertToSource);
    }

  },
  name: {
    toTarget({
      name
    }) {
      return name;
    },

    toSource(name) {
      return {
        name
      };
    }

  },
  date: {
    toTarget(date) {
      return (0, _date.parse)(date.toISOString());
    },

    toSource(date) {
      if (date.raw) {
        return date.raw;
      }

      const [year, month, day] = date['date-parts'][0];

      if (day) {
        return new Date(Date.UTC(year, month - 1, day));
      } else if (month) {
        return new Date(Date.UTC(year, month - 1));
      } else {
        return new Date(Date.UTC(year));
      }
    }

  }
};
const MAIN_PROPS = ['abstract', {
  source: 'authors',
  target: 'author',
  convert: PROP_CONVERTERS.names
}, {
  source: 'date-released',
  target: 'issued',
  convert: PROP_CONVERTERS.date
}, {
  source: 'doi',
  target: 'DOI'
}, 'keywords', 'title', {
  source: 'url',
  target: 'URL'
}, 'version'];
const REF_PROPS = [...MAIN_PROPS, {
  source: 'abbreviation',
  target: 'title-short'
}, {
  source: 'abbreviation',
  target: 'shortTitle'
}, 'collection-title', {
  source: 'recipients',
  target: 'recipient',
  convert: PROP_CONVERTERS.names
}, {
  source: 'conference',
  target: 'event',
  convert: PROP_CONVERTERS.name
}, {
  source: 'date-accessed',
  target: 'accessed',
  convert: PROP_CONVERTERS.date
}, {
  source: 'date-downloaded',
  target: 'accessed',
  convert: PROP_CONVERTERS.date,
  when: {
    source: {
      'date-accessed': false
    },
    target: false
  }
}, {
  source: 'date-published',
  target: 'issued',
  convert: PROP_CONVERTERS.date,
  when: {
    source: {
      'date-released': false
    },
    target: false
  }
}, {
  source: ['year', 'month'],
  target: 'issued',
  when: {
    source: {
      'date-published': false,
      'date-released': false,
      year: true
    }
  },
  convert: {
    toTarget(year, month) {
      const date = month ? [year, month] : [year];
      return {
        'date-parts': [date]
      };
    },

    toSource(issued) {
      const [year, month] = issued['date-parts'][0];
      return [year, month];
    }

  }
}, {
  source: 'year-original',
  target: 'original-date',
  convert: {
    toTarget(year) {
      return {
        'date-parts': [[year]]
      };
    },

    toSource(date) {
      return date['date-parts'][0][0];
    }

  }
}, 'edition', {
  source: 'editors',
  target: 'editor',
  convert: PROP_CONVERTERS.names
}, {
  source: 'editors-series',
  target: 'collection-editor',
  convert: PROP_CONVERTERS.names
}, 'medium', {
  source: 'isbn',
  target: 'ISBN'
}, {
  source: 'issn',
  target: 'ISSN'
}, {
  source: 'pmcid',
  target: 'PMCID'
}, 'issue', {
  source: 'languages',
  target: 'language',
  when: {
    target: true,
    source: {
      language(code) {
        return /[a-z]{2,3}/.test(code);
      }

    }
  },
  convert: {
    toSource(language) {
      return [language];
    },

    toTarget(languages) {
      return languages[0];
    }

  }
}, {
  source: 'notes',
  target: 'note'
}, 'number', {
  source: 'publisher',
  target: 'publisher',
  convert: PROP_CONVERTERS.name
}, 'section', {
  source: 'status',
  target: 'status',
  when: {
    source: true,
    target: {
      status: ['in-preparation', 'abstract', 'submitted', 'in-press', 'advance-online', 'preprint']
    }
  }
}, {
  source: 'start',
  target: 'page-first'
}, {
  source: ['start', 'end'],
  target: 'page',
  convert: {
    toTarget(start, end) {
      return `${start}-${end}`;
    },

    toSource(page) {
      const [start, end] = page.split('-');
      return [start, end];
    }

  }
}, {
  source: 'pages',
  target: 'number-of-pages'
}, {
  source: 'translators',
  target: 'translator',
  convert: PROP_CONVERTERS.names
}, {
  source: 'type',
  target: 'type',
  convert: {
    toSource(type) {
      return TYPES_TO_SOURCE[type] || 'generic';
    },

    toTarget(type) {
      return TYPES_TO_TARGET[type] || 'book';
    }

  }
}, 'volume', 'number-of-volumes'];
const mainTranslator = new _core.util.Translator(MAIN_PROPS);
const refTranslator = new _core.util.Translator(REF_PROPS);

function parse(input) {
  const output = mainTranslator.convertToTarget(input);
  const refs = (input.references || []).map(refTranslator.convertToTarget);
  output.type = TYPES_TO_TARGET.software;
  output._cff_mainReference = true;
  return [output, ...refs];
}

function format(input, {
  main
} = {}) {
  let mainIndex = input.findIndex(entry => main ? entry.id === main : entry._cff_mainReference);
  mainIndex = mainIndex > 0 ? mainIndex : 0;
  const mainRef = mainTranslator.convertToSource(input.splice(mainIndex, 1)[0] || {});
  const references = input.map(refTranslator.convertToSource);
  return _objectSpread(_objectSpread({
    'cff-version': CFF_VERSION
  }, mainRef), {}, {
    references
  });
}

const CFF_VERSION = '1.0.3';
exports.CFF_VERSION = CFF_VERSION;
},{"@citation-js/core":"citation-js","@citation-js/date":43}],78:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.json = json;
exports.api = api;
exports.url = url;
exports.config = void 0;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

var _name = require("@citation-js/name");

const propMaps = {
  name: 'title-short',
  full_name: 'title',
  description: 'abstract',
  html_url: 'URL',
  pushed_at: 'issued',
  contributors_url: 'author'
};

async function parseValue(prop, value) {
  switch (prop) {
    case 'contributors_url':
      {
        let contributors = await api(value);
        contributors = await Promise.all(contributors.map(({
          url
        }) => api(url)));
        return contributors.map(({
          name,
          login
        }) => name ? (0, _name.parse)(name) : {
          literal: login
        });
      }

    case 'pushed_at':
      return (0, _date.parse)(value);

    default:
      return value;
  }
}

const config = {
  apiToken: null
};
exports.config = config;

async function json(input) {
  const output = {
    type: 'book'
  };

  for (const prop in propMaps) {
    if (prop in input) {
      output[propMaps[prop]] = await parseValue(prop, input[prop]);
    }
  }

  return output;
}

async function api(input) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'citation.js.org'
  };

  if (config.apiToken) {
    headers.Authorization = `token ${config.apiToken}`;
  }

  const output = await _core.util.fetchFileAsync(input, {
    headers
  });
  return JSON.parse(output);
}

function url(input) {
  const [, user, repo] = input.match(/^https?:\/\/github.com\/([^/]+)\/([^/]+)/);
  return `https://api.github.com/repos/${user}/${repo}`;
}
},{"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46}],79:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _yamljs = _interopRequireDefault(require("yamljs"));

var cff = _interopRequireWildcard(require("./cff"));

var gh = _interopRequireWildcard(require("./gh"));

var npm = _interopRequireWildcard(require("./npm"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core.plugins.add('@else', {
  input: {
    '@else/yaml': {
      parseType: {
        dataType: 'String',
        tokenList: {
          split: /\n(\s{2})*(-\s)?/,
          token: /^[\w-]*: /,
          every: false
        }
      },
      parse: _yamljs.default.parse
    }
  }
});

_core.plugins.add('@cff', {
  input: {
    '@cff/object': {
      parseType: {
        dataType: 'SimpleObject',
        propertyConstraint: {
          props: 'cff-version',

          value(version) {
            return version.startsWith('1.0.');
          }

        }
      },
      parse: cff.parse
    }
  },
  output: {
    cff(data, options = {}) {
      const output = cff.format(data, options);

      if (options.type === 'object') {
        return output;
      } else {
        return _yamljs.default.stringify(output, Infinity, 2);
      }
    }

  }
});

_core.plugins.add('@github', {
  config: gh.config,
  input: {
    '@github/url': {
      parseType: {
        dataType: 'String',
        predicate: /^https?:\/\/github.com\/[^/]+\//,
        extends: '@else/url'
      },
      parse: gh.url
    },
    '@github/api': {
      parseType: {
        dataType: 'String',
        predicate: /^https?:\/\/api.github.com\/repos\/[^/]+\//,
        extends: '@else/url'
      },
      parseAsync: gh.api
    },
    '@github/object': {
      parseType: {
        dataType: 'SimpleObject',
        propertyConstraint: {
          props: 'url',

          value(url) {
            return /^https?:\/\/api.github.com\/repos\/[^/]+\//.test(url);
          }

        }
      },
      parseAsync: gh.json
    }
  }
});

_core.plugins.add('npm', {
  input: {
    '@npm/url': {
      parseType: {
        dataType: 'String',
        predicate: /^https?:\/\/(www\.)?(npmjs\.com|npmjs\.org|npm\.im)\/(package)?/,
        extends: '@else/url'
      },
      parse: npm.url
    },
    '@npm/api': {
      parseType: {
        dataType: 'String',
        predicate: /^https?:\/\/registry.npmjs.org\//,
        extends: '@else/url'
      },
      parseAsync: npm.api
    },
    '@npm/object': {
      parseType: {
        dataType: 'SimpleObject',
        propertyConstraint: {
          props: 'versions',

          value(versions) {
            for (const version in versions) {
              if ('_npmUser' in versions[version] || '_npmVersion' in versions[version]) {
                return true;
              }
            }

            return false;
          }

        }
      },
      parseAsync: npm.json
    }
  }
});
},{"./cff":77,"./gh":78,"./npm":80,"@citation-js/core":"citation-js","yamljs":144}],80:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.json = json;
exports.api = api;
exports.url = url;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

var _name = require("@citation-js/name");

const propMaps = {
  name: 'title',
  description: 'abstract',
  homepage: 'URL',
  author: 'author'
};

async function parseValue(prop, value) {
  switch (prop) {
    case 'author':
      return [(0, _name.parse)(value.name)];

    default:
      return value;
  }
}

async function json(input) {
  const output = {
    type: 'book'
  };

  for (const prop in propMaps) {
    if (prop in input) {
      output[propMaps[prop]] = await parseValue(prop, input[prop]);
    }

    const {
      latest
    } = input['dist-tags'];
    output.version = latest;
    output.issued = (0, _date.parse)(input.time[latest]);
  }

  return output;
}

async function api(input) {
  const output = await _core.util.fetchFileAsync(input);
  return JSON.parse(output);
}

function url(input) {
  const [, pkg] = input.match(/((@[^/]+\/)?[^/]+)$/);
  return `https://registry.npmjs.org/${pkg}`;
}
},{"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46}],81:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.parseAsync = parseAsync;

var _core = require("@citation-js/core");

const {
  fetchFile,
  fetchFileAsync
} = _core.util;

function parse(urls) {
  return [].concat(urls).map(fetchFile);
}

function parseAsync(urls) {
  return Promise.all([].concat(urls).map(fetchFileAsync));
}
},{"@citation-js/core":"citation-js"}],82:[function(require,module,exports){
module.exports={
  "langs": ["en"]
}

},{}],83:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEntity = parseEntity;
exports.parseAsync = exports.parseEntitiesAsync = parseEntitiesAsync;
exports.default = exports.parse = exports.parseEntities = parseEntities;

var _core = require("@citation-js/core");

var response = _interopRequireWildcard(require("./response"));

var _prop = require("./prop");

var _props = require("./props");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function resolveProp(prop_, entity, unkown) {
  function resolve([prop, ...parts], {
    claims
  }) {
    if (!parts.length) {
      return claims[prop];
    } else if (claims[prop] && claims[prop].length) {
      return resolve(parts, claims[prop][0].value);
    }
  }

  const parts = prop_.split('.');
  unkown.delete(parts[0]);
  return resolve(parts, entity);
}

function prepareValue(statement, entity, unkown) {
  if (typeof statement !== 'object') {
    const value = resolveProp(statement, entity, unkown);
    return value && value[0].value;
  }

  const values = [].concat(...statement.props.map(prop => resolveProp(prop, entity, unkown)).filter(Boolean));

  if (statement.values === 'all') {
    return values[0] && values;
  } else {
    return values[0] && values[0].value;
  }
}

function parseEntity(entity) {
  const data = {
    id: entity.id,
    _wikiId: entity.id,
    source: 'Wikidata'
  };
  const unkown = new Set(Object.keys(entity.claims));

  for (const prop in _props.props) {
    const input = prepareValue(_props.props[prop], entity, unkown);

    if (input) {
      const output = (0, _prop.parseProp)(prop, input, entity);

      if (output) {
        data[prop] = output;
      }
    }
  }

  for (const prop of unkown) {
    if (prop in _props.ignoredProps) {
      continue;
    }

    _core.logger.unmapped('[plugin-wikidata]', 'property', prop);
  }

  if (!data.title) {
    data.title = (0, _prop.getLabel)(entity);
  }

  if (data['reviewed-title'] || data['reviewed-author']) {
    if (data.type.slice(0, 6) !== 'review') {
      data.type = 'review';
    }

    delete data.keyword;
  }

  if (data.recipient) {
    data.type = 'personal_communication';
  }

  if (data.event) {
    data.type = 'paper-conference';
  }

  return data;
}

async function parseEntitiesAsync({
  entities
}) {
  return (await response.parseAsync(entities)).map(parseEntity);
}

function parseEntities({
  entities
}) {
  return response.parse(entities).map(parseEntity);
}
},{"./prop":86,"./props":87,"./response":88,"@citation-js/core":"citation-js"}],84:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = void 0;

var _wikidataSdk = _interopRequireDefault(require("wikidata-sdk"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parseWikidata = function (data, langs) {
  const list = [].concat(data);
  return [].concat(_wikidataSdk.default.getManyEntities(list, langs || _config.default.langs));
};

exports.default = exports.parse = parseWikidata;
},{"./config":82,"wikidata-sdk":133}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.parsers = exports.ref = void 0;

var _core = require("@citation-js/core");

var id = _interopRequireWildcard(require("./id"));

var entity = _interopRequireWildcard(require("./entity"));

var prop = _interopRequireWildcard(require("./prop"));

var url = _interopRequireWildcard(require("./url"));

var api = _interopRequireWildcard(require("./api"));

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ref = '@wikidata';
exports.ref = ref;
const parsers = {
  id,
  entity,
  prop,
  url,
  api
};
exports.parsers = parsers;
const formats = {
  '@wikidata/id': {
    parse: id.parse,
    parseType: {
      dataType: 'String',
      predicate: /^Q\d+$/
    }
  },
  '@wikidata/list+text': {
    parse(data) {
      return data.trim().split(/(?:[\s,]\s*)/g);
    },

    parseType: {
      dataType: 'String',
      predicate: /^\s*((?:Q\d+(?:[\s,]\s*))*Q\d+)\s*$/
    }
  },
  '@wikidata/api': {
    parse: api.parse,
    parseAsync: api.parseAsync,
    parseType: {
      dataType: 'String',
      predicate: /^(https?:\/\/(?:www\.)?wikidata.org\/w\/api\.php(?:\?.*)?)$/,
      extends: '@else/url'
    }
  },
  '@wikidata/array+api': {
    parse: api.parse,
    parseAsync: api.parseAsync,
    parseType: {
      dataType: 'Array',
      elementConstraint: '@wikidata/api'
    }
  },
  '@wikidata/url': {
    parse: url.parse,
    parseType: {
      dataType: 'String',
      predicate: /\/(Q\d+)(?:[#?/]|\s*$)/,
      extends: '@else/url'
    }
  },
  '@wikidata/list+object': {
    parse: id.parse,
    parseType: {
      dataType: 'Array',
      elementConstraint: '@wikidata/id'
    }
  },
  '@wikidata/object': {
    parse: entity.parse,
    parseAsync: entity.parseAsync,
    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: {
        props: 'entities'
      }
    }
  },
  '@wikidata/array+object': {
    parse(responses) {
      return responses.reduce((combined, {
        success,
        entities
      }) => {
        combined.success &= success;
        Object.assign(combined.entities, entities);
        return combined;
      }, {});
    },

    parseType: {
      dataType: 'Array',
      elementConstraint: '@wikidata/object'
    },
    outputs: '@wikidata/object'
  },
  '@wikidata/prop': {
    parse: prop.parseProp
  },
  '@wikidata/type': {
    parse: prop.parseType
  }
};
exports.formats = formats;

_core.plugins.add(ref, {
  input: formats,
  config: _config.default
});
},{"./api":81,"./config":82,"./entity":83,"./id":84,"./prop":86,"./url":90,"@citation-js/core":"citation-js"}],86:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parse = exports.parseProp = parseProp;
exports.parseType = parseType;
exports.getLabel = getLabel;

var _core = require("@citation-js/core");

var _name = require("@citation-js/name");

var _date = require("@citation-js/date");

var _config = _interopRequireDefault(require("./config"));

var _types = _interopRequireDefault(require("./types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getSeriesOrdinal = ({
  P1545
}) => P1545 ? parseInt(P1545[0]) : -1;

const getStatedAs = qualifiers => [].concat(...[qualifiers.P1932, qualifiers.P1810].filter(Boolean));

const parseName = ({
  value,
  qualifiers
}) => {
  let [name] = getStatedAs(qualifiers);

  if (!name) {
    name = typeof value === 'string' ? value : getLabel(value);
  }

  name = name ? (0, _name.parse)(name) : {
    literal: name
  };
  name._ordinal = getSeriesOrdinal(qualifiers);
  return name;
};

const parseNames = values => {
  return values.map(parseName).sort((a, b) => a._ordinal - b._ordinal);
};

const getPlace = value => {
  const country = value.claims.P17[0].value;
  const shortNames = country.claims.P1813.filter(({
    qualifiers: {
      P31
    }
  }) => !P31 || P31[0] !== 'Q28840786');
  return getLabel(value) + ', ' + (shortNames[0] || country.claims.P1448[0]).value;
};

const getTitle = value => {
  return value.claims.P1476 ? value.claims.P1476[0].value : getLabel(value);
};

const parseKeywords = values => {
  return values.map(({
    value
  }) => getLabel(value)).join(',');
};

const parseDateRange = dates => ({
  'date-parts': dates.map(date => (0, _date.parse)(date.value)).filter(date => date && date['date-parts']).map(date => date['date-parts'][0])
});

function parseProp(prop, value, entity) {
  switch (prop) {
    case 'type':
      return parseType(value);

    case 'author':
    case 'director':
    case 'container-author':
    case 'collection-editor':
    case 'composer':
    case 'editor':
    case 'illustrator':
    case 'original-author':
    case 'recipient':
    case 'reviewed-author':
    case 'translator':
      return parseNames(value);

    case 'issued':
    case 'original-date':
      return (0, _date.parse)(value);

    case 'event-date':
      return parseDateRange(value);

    case 'keyword':
      return parseKeywords(value);

    case 'container-title':
    case 'collection-title':
    case 'event':
    case 'medium':
    case 'publisher':
    case 'original-publisher':
      return getTitle(value);

    case 'event-place':
    case 'original-publisher-place':
    case 'publisher-place':
      return getPlace(value);

    case 'collection-number':
      return getSeriesOrdinal(value[0].qualifiers);

    case 'number-of-volumes':
      return value.length;

    default:
      return value;
  }
}

function parseType(type) {
  if (!_types.default[type]) {
    _core.logger.unmapped('[plugin-wikidata]', 'publication type', type);

    return 'book';
  }

  return _types.default[type];
}

function getLabel(entity) {
  if (!entity) {
    return undefined;
  }

  const lang = _config.default.langs.find(lang => entity.labels[lang]);

  return entity.labels[lang];
}
},{"./config":82,"./types":89,"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46}],87:[function(require,module,exports){
module.exports={
  "props": {
    "author": {
      "values": "all",
      "props": ["P50", "P2093"]
    },
    "composer": {
      "values": "all",
      "props": ["P86"]
    },

    "collection-editor": {
      "values": "all",
      "props": ["P179.P98"]
    },
    "collection-number": {
      "values": "all",
      "props": ["P179"]
    },
    "collection-title": "P179",

    "container-author": {
      "values": "all",
      "props": ["P1433.P50", "P1433.P2093", "P361.P50", "P361.P2093"]
    },
    "container-title": { "values": "any", "props": ["P1433", "P361"] },
    "container-title-short": { "values": "any", "props": ["P1433.P1813", "P1433.P1160"] },

    "director": {
      "values": "all",
      "props": ["P57"]
    },
    "DOI": "P356",
    "edition": "P393",
    "editor": {
      "values": "all",
      "props": ["P98"]
    },

    "event": "P1433.P4745",
    "event-date": {
      "values": "all",
      "props": ["P1433.P4745.P580", "P1433.P4745.P582"]
    },
    "event-place": "P1433.P4745.P276",

    "illustrator": {
      "values": "all",
      "props": ["P110"]
    },
    "ISBN": {
      "values": "any",
      "props": ["P212", "P957"]
    },
    "ISSN": "P1433.P236",
    "issue": "P433",
    "issued": "P577",
    "journalAbbreviation": { "values": "any", "props": ["P1433.P1813", "P1433.P1160"] },
    "keyword": {
      "values": "all",
      "props": ["P921"]
    },
    "language": {
      "values": "any",
      "props": ["P407.P218", "P364.P218"]
    },
    "medium": { "values": "any", "props": ["P437", "P186"] },
    "number-of-pages": "P1104",
    "number-of-volumes": {
      "values": "all",
      "props": ["P179.P527"]
    },

    "original-author": {
      "values": "all",
      "props": ["P629.P50", "P629.P2093"]
    },
    "original-date": "P629.P577",
    "original-publisher": "P629.P123",
    "original-publisher-place": {
      "values": "any",
      "props": ["P629.P123.P740", "P629.P123.P159"]
    },
    "original-title": "P629.P1476",

    "page": "P304",
    "PMID": "P698",
    "PMCID": "P932",

    "publisher": "P123",
    "publisher-place": { "values": "any", "props": ["P123.P740", "P123.P159"]},

    "recipient": {
      "values": "all",
      "props": ["P1817"]
    },

    "reviewed-title": "P921.P1476",
    "reviewed-author": {
      "values": "all",
      "props": ["P921.P50", "P921.P2093"]
    },

    "scale": "P1752",
    "title": "P1476",
    "translator": {
      "values": "all",
      "props": ["P655"]
    },
    "type": "P31",
    "version": "P348",
    "volume": "P478",
    "URL": {
      "values": "any",
      "props": ["P856", "P953", "P973", "P2699"]
    }
  },
  "ignoredProps": {
    "P2860": "Cites",
    "P921": "Main subject",
    "P3181": "OpenCitations bibliographic resource ID",
    "P364": "Original language of work"
  }
}

},{}],88:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fillCache = fillCache;
exports.parse = parse;
exports.fillCacheAsync = fillCacheAsync;
exports.parseAsync = parseAsync;

var _wikidataSdk = require("wikidata-sdk");

var _api = require("./api");

var _id = require("./id");

const SIMPLIFY_OPTS = {
  keepQualifiers: true,
  timeConverter: 'simple-day'
};
const FETCH_PLACE = {
  P17: null
};
const FETCH_PUBLISHER = {
  P740: FETCH_PLACE,
  P159: FETCH_PLACE
};
const FETCH_ADDITIONAL = {
  P50: null,
  P57: null,
  P86: null,
  P98: null,
  P110: null,
  P655: null,
  P1817: null,
  P921: {
    P50: null
  },
  P407: null,
  P364: null,
  P123: FETCH_PUBLISHER,
  P629: {
    P50: null,
    P123: FETCH_PUBLISHER
  },
  P437: null,
  P186: null,
  P179: {
    P98: null
  },
  P1433: {
    P4745: {
      P276: FETCH_PLACE
    }
  },
  P361: {
    P50: null
  }
};

function flat(array, part) {
  array.push(...part);
  return array;
}

function collectAdditionalIds(entity, needed) {
  if (!needed) {
    return [];
  }

  entity._needed = Object.assign(entity._needed || {}, needed);
  return Object.keys(entity.claims).filter(prop => prop in needed).map(prop => entity.claims[prop].map(({
    value
  }) => value.id || value)).reduce(flat, []);
}

function completeResponse(entities, old) {
  if (!old) {
    const allIds = [];

    for (const id in entities) {
      const ids = collectAdditionalIds(entities[id], FETCH_ADDITIONAL);

      for (const id of ids) {
        if (!allIds.includes(id)) {
          allIds.push(id);
        }
      }
    }

    return allIds;
  }

  const ids = [];

  for (var id of old) {
    var entity = entities[id];

    if (!entity._needed) {
      continue;
    }

    for (var prop in entity.claims) {
      if (prop in entity._needed) {
        for (const claim of entity.claims[prop]) {
          if (claim.value && claim.value.id) {
            continue;
          }

          claim.value = entities[claim.value];
          ids.push(...collectAdditionalIds(claim.value, entity._needed[prop]));
        }
      }
    }

    delete entity._needed;
  }

  return ids;
}

function simplifyEntities(entities) {
  return _wikidataSdk.simplify.entities(entities, SIMPLIFY_OPTS);
}

function initLoopState(entities, cache) {
  return {
    needed: completeResponse(cache),
    incomplete: Object.keys(entities)
  };
}

function filterIdsAndGetUrls(needed, cache) {
  const shouldFetch = needed.filter((id, i) => !(id in cache) && needed.indexOf(id) === i);
  return (0, _id.parse)(shouldFetch);
}

function addItemsToCache(response, cache) {
  const {
    entities
  } = JSON.parse(response);
  Object.assign(cache, simplifyEntities(entities));
}

function updateLoopState(state, cache) {
  return {
    needed: completeResponse(cache, state.incomplete),
    incomplete: state.needed
  };
}

function finalizeItems(entities, cache) {
  return Object.keys(entities).map(id => cache[id]);
}

function fillCache(entities) {
  const cache = simplifyEntities(entities);
  let state = initLoopState(entities, cache);

  while (state.needed.length) {
    const urls = filterIdsAndGetUrls(state.needed, cache);
    urls.map(url => addItemsToCache((0, _api.parse)(url), cache));
    state = updateLoopState(state, cache);
  }

  return cache;
}

function parse(entities) {
  const cache = fillCache(entities);
  return finalizeItems(entities, cache);
}

async function fillCacheAsync(entities) {
  const cache = simplifyEntities(entities);
  let state = initLoopState(entities, cache);

  while (state.needed.length) {
    const urls = filterIdsAndGetUrls(state.needed, cache);
    await Promise.all(urls.map(async url => addItemsToCache(await (0, _api.parseAsync)(url), cache)));
    state = updateLoopState(state, cache);
  }

  return cache;
}

async function parseAsync(entities) {
  const cache = await fillCacheAsync(entities);
  return finalizeItems(entities, cache);
}
},{"./api":81,"./id":84,"wikidata-sdk":133}],89:[function(require,module,exports){
module.exports={"Q191067":"article","Q1266946":"thesis","Q187685":"thesis","Q265158":"review","Q1172284":"dataset","Q2352616":"dataset","Q367035":"dataset","Q4006":"map","Q133792":"map","Q842617":"map","Q1425895":"map","Q2334719":"legal_case","Q36774":"webpage","Q15474042":"webpage","Q58494026":"webpage","Q17379835":"webpage","Q17442446":"webpage","Q21281405":"webpage","Q16222597":"webpage","Q653848":"map","Q21944833":"map","Q11424":"motion_picture","Q157443":"motion_picture","Q571":"book","Q87167":"manuscript","Q131569":"treaty","Q216665":"book","Q686822":"bill","Q10870555":"report","Q3099732":"report","Q252550":"treaty","Q3536928":"treaty","Q5707594":"article-newspaper","Q59908":"article","Q1164267":"book","Q18011172":"motion_picture","Q19389637":"article","Q11578774":"broadcast","Q15416":"broadcast","Q1555508":"broadcast","Q26260507":"broadcast","Q580922":"article","Q651270":"article","Q759838":"article","Q1580166":"entry-dictionary","Q1809676":"article","Q2106255":"article","Q1004391":"report","Q2438528":"article","Q6646525":"article","Q7216866":"post","Q7318358":"article","Q7582241":"article","Q10389811":"entry","Q13442814":"article-journal","Q17518557":"article","Q19917774":"article","Q30070590":"article-magazine","Q37974534":"article","Q637866":"review-book","Q5196473":"review","Q5251247":"review","Q42350535":"article","Q51282711":"thesis","Q51282766":"thesis","Q51282798":"thesis","Q51282875":"thesis","Q51282918":"thesis","Q51282969":"thesis","Q51282999":"thesis","Q51283026":"thesis","Q51283053":"thesis","Q51283145":"thesis","Q51283327":"thesis","Q55399605":"thesis","Q58010711":"article","Q60559362":"article","Q480498":"legal_case","Q697327":"legal_case","Q1469824":"dataset","Q2055205":"legal_case","Q162827":"map","Q460214":"map","Q2259701":"map","Q253623":"patent","Q22909582":"review","Q1172480":"dataset","Q45941145":"dataset","Q56515249":"review","Q61992233":"review","Q16968990":"book","Q21191270":"broadcast","Q26225677":"motion_picture","Q56753859":"map","Q57933693":"book","Q2823677":"legal_case","Q2865639":"legal_case","Q7307130":"legal_case","Q8016240":"legal_case","Q11827307":"legal_case","Q16738832":"legal_case","Q18146819":"legal_case","Q18536127":"legal_case","Q20917517":"legal_case","Q7366":"song","Q7302866":"song","Q25203386":"song","Q30637971":"legal_case","Q52768654":"map","Q56123235":"song","Q56612794":"song","Q60566516":"song","Q60809954":"song","Q61221204":"legal_case","Q24634210":"broadcast","Q61855877":"broadcast","Q1006160":"dataset","Q1980247":"chapter","Q19692072":"legal_case","Q23927052":"paper-conference","Q178651":"interview","Q861911":"speech","Q216526":"map","Q2940514":"map","Q3391101":"map","Q55089312":"dataset","Q56704157":"legal_case","Q26205359":"webpage","Q28326484":"webpage","Q28326490":"webpage","Q57312861":"webpage","Q106833":"book","Q128093":"book","Q20540385":"book","Q7433672":"book","Q193495":"book","Q3831846":"book","Q203490":"book","Q254554":"book","Q448980":"book","Q604219":"book","Q605076":"book","Q642946":"book","Q48498":"manuscript","Q727715":"book","Q747381":"book","Q855753":"book","Q890239":"book","Q913554":"book","Q918038":"book","Q922203":"book","Q944359":"book","Q1009641":"book","Q1631107":"dataset","Q26876682":"dataset","Q47114558":"dataset","Q1050259":"book","Q1062404":"book","Q1106827":"book","Q1173065":"book","Q1184488":"book","Q1238720":"book","Q1414013":"book","Q1415108":"book","Q162206":"map","Q191072":"map","Q320228":"map","Q352416":"map","Q441903":"map","Q573980":"map","Q602481":"map","Q715789":"map","Q728502":"map","Q1403728":"map","Q1410020":"map","Q1496857":"book","Q1528894":"book","Q1609706":"book","Q1616547":"book","Q1650727":"book","Q1760610":"book","Q1785330":"book","Q1870591":"book","Q1883939":"book","Q1977520":"book","Q1986787":"book","Q2069066":"book","Q2072218":"book","Q2104296":"book","Q2122442":"book","Q2128336":"book","Q2135225":"book","Q2208044":"book","Q2314679":"book","Q2331348":"book","Q2363145":"book","Q2374324":"book","Q2377289":"book","Q2396513":"book","Q2514954":"book","Q2537127":"book","Q2787237":"book","Q2831984":"book","Q3045706":"book","Q3831821":"book","Q3831847":"book","Q3915339":"book","Q4067007":"book","Q4224691":"book","Q4515179":"book","Q4677625":"book","Q4686085":"book","Q4931288":"book","Q5073531":"book","Q5093328":"book","Q5159310":"book","Q6675210":"book","Q8275050":"book","Q10666342":"book","Q11396303":"book","Q11750596":"book","Q12308638":"book","Q12410152":"book","Q12731131":"book","Q13137339":"book","Q13430107":"book","Q13636757":"book","Q13751595":"book","Q16046027":"book","Q16385949":"book","Q16507688":"book","Q16736578":"book","Q17134316":"book","Q21598767":"book","Q21662746":"book","Q22988237":"book","Q25679217":"book","Q12912091":"motion_picture","Q1453402":"map","Q1502030":"map","Q1664468":"map","Q1783108":"map","Q1787111":"dataset","Q1875628":"map","Q2089517":"map","Q2127425":"map","Q2353983":"map","Q2368091":"map","Q2426254":"map","Q2470969":"map","Q2471702":"map","Q2620815":"map","Q2656361":"map","Q2940478":"map","Q3509676":"map","Q3515498":"map","Q4505959":"map","Q4845530":"map","Q26267321":"book","Q26271823":"book","Q27560760":"book","Q29154430":"book","Q29586870":"book","Q31946409":"book","Q38143661":"book","Q52005090":"book","Q52153485":"book","Q55610842":"book","Q56552233":"book","Q57790812":"book","Q58142059":"book","Q58211632":"book","Q58807269":"book","Q60226001":"book","Q60475414":"book","Q60475468":"book","Q60627667":"book","Q61696018":"book","Q5047387":"map","Q5177325":"map","Q5434353":"map","Q6017843":"map","Q6664848":"map","Q7104865":"map","Q10544122":"map","Q11426259":"map","Q11618908":"map","Q14321585":"map","Q15877105":"map","Q17047956":"map","Q21935483":"map","Q22125384":"map","Q59457513":"map","Q60054914":"map","Q846662":"broadcast","Q5778924":"motion_picture","Q8513":"dataset","Q178376":"dataset","Q1675302":"map","Q267628":"article","Q871232":"article","Q3694604":"article","Q3719255":"article","Q19375673":"article","Q442919":"interview","Q850171":"interview","Q1384479":"interview","Q1477475":"interview","Q1067324":"motion_picture","Q1941707":"motion_picture","Q3055290":"interview","Q3055291":"interview","Q450873":"patent","Q681875":"patent","Q913351":"patent","Q5465504":"patent","Q2049275":"manuscript","Q213924":"manuscript","Q274076":"manuscript","Q597695":"manuscript","Q720106":"manuscript","Q865595":"manuscript","Q1067768":"manuscript","Q1266076":"manuscript","Q2209578":"manuscript","Q2217259":"manuscript","Q2531964":"manuscript","Q2816501":"manuscript","Q19787436":"patent","Q19787437":"patent","Q35639987":"patent","Q43305660":"patent","Q59818481":"dataset","Q1949797":"legal_case","Q18918145":"article-journal","Q2782326":"article-journal","Q3149408":"legal_case","Q18342738":"speech","Q3228788":"speech","Q3731370":"legal_case","Q17123524":"book","Q336144":"motion_picture","Q867242":"book","Q1093720":"treaty","Q193170":"treaty","Q625298":"treaty","Q837144":"treaty","Q864737":"treaty","Q931855":"treaty","Q1242841":"treaty","Q1414340":"treaty","Q1414472":"treaty","Q1498487":"treaty","Q1646218":"treaty","Q1671773":"treaty","Q1711115":"treaty","Q2290707":"treaty","Q2300991":"treaty","Q2465017":"treaty","Q3125472":"manuscript","Q3220177":"manuscript","Q3240926":"manuscript","Q3252544":"manuscript","Q3560324":"manuscript","Q3749265":"manuscript","Q3824506":"treaty","Q3960554":"manuscript","Q4426710":"treaty","Q4475654":"manuscript","Q4872029":"treaty","Q4985043":"treaty","Q7012086":"manuscript","Q7452368":"manuscript","Q9026959":"manuscript","Q11613006":"manuscript","Q13430250":"manuscript","Q17143154":"manuscript","Q21089188":"manuscript","Q22669850":"manuscript","Q22948347":"manuscript","Q25351420":"manuscript","Q31078443":"manuscript","Q33308141":"manuscript","Q11122":"treaty","Q451584":"legal_case","Q876477":"bill","Q1006544":"bill","Q1288220":"legal_case","Q2206565":"legal_case","Q2783852":"legal_case","Q5500839":"legal_case","Q7246224":"bill","Q7257705":"bill","Q7885007":"bill","Q859161":"dataset","Q1650567":"webpage","Q11439":"webpage","Q16602140":"bill","Q16821677":"bill","Q28457660":"bill","Q2261569":"webpage","Q2641220":"webpage","Q2737701":"webpage","Q14204246":"webpage","Q21025364":"webpage","Q23691297":"webpage","Q58040463":"webpage","Q44873079":"interview","Q4202018":"interview","Q4317093":"interview","Q7256239":"interview","Q7625207":"interview","Q8776455":"interview","Q45933791":"interview","Q60723716":"interview","Q6908053":"treaty","Q6934728":"treaty","Q6944158":"treaty","Q9160460":"treaty","Q9557810":"treaty","Q11455760":"treaty","Q11637357":"treaty","Q16567729":"treaty","Q19357149":"book","Q184528":"speech","Q203737":"speech","Q261197":"speech","Q554211":"speech","Q749054":"speech","Q787020":"speech","Q805093":"speech","Q960189":"speech","Q1346967":"speech","Q1840948":"speech","Q1980740":"speech","Q2183050":"speech","Q2895132":"speech","Q3030189":"speech","Q3040417":"speech","Q4329077":"speech","Q4388316":"speech","Q5152362":"speech","Q200092":"motion_picture","Q224700":"motion_picture","Q248583":"motion_picture","Q457832":"motion_picture","Q622548":"motion_picture","Q624771":"motion_picture","Q16835935":"treaty","Q16956642":"treaty","Q19958750":"treaty","Q27768121":"treaty","Q29526855":"treaty","Q29527278":"treaty","Q29527544":"treaty","Q29883540":"treaty","Q30921722":"treaty","Q38653134":"treaty","Q39234269":"treaty","Q41535471":"treaty","Q50192946":"treaty","Q57205857":"treaty","Q1194534":"dataset","Q7979513":"speech","Q11261492":"speech","Q11496736":"speech","Q11504413":"speech","Q13611058":"speech","Q13632631":"speech","Q15853847":"speech","Q18907443":"speech","Q19776345":"speech","Q28472611":"speech","Q56191193":"speech","Q56192445":"speech","Q60061482":"speech","Q60780612":"speech","Q47123453":"report","Q1054574":"motion_picture","Q860626":"motion_picture","Q959790":"motion_picture","Q1788980":"motion_picture","Q2331945":"motion_picture","Q188473":"motion_picture","Q2678111":"motion_picture","Q2991560":"motion_picture","Q2484376":"motion_picture","Q16950433":"motion_picture","Q18331260":"motion_picture","Q19952560":"motion_picture","Q5428822":"broadcast","Q13582719":"song","Q388480":"song","Q950683":"book","Q39825":"dataset","Q49918":"dataset","Q82753":"dataset","Q186588":"dataset","Q15706459":"article-journal","Q59387148":"report","Q6960620":"book","Q7094076":"dataset","Q367680":"dataset","Q857354":"dataset","Q1503133":"book","Q3219655":"dataset","Q3304360":"dataset","Q5227330":"dataset","Q7943567":"dataset","Q17305522":"dataset","Q18814183":"dataset","Q21264512":"dataset","Q43570203":"dataset","Q44106130":"dataset","Q50826803":"dataset","Q55387750":"dataset","Q593744":"dataset","Q83790":"book","Q539662":"dataset","Q605175":"dataset","Q550089":"dataset","Q36524":"dataset","Q1673963":"dataset","Q17152639":"dataset","Q20088085":"entry-dictionary","Q15633587":"webpage","Q15138389":"webpage","Q20088089":"entry-dictionary","Q5398426":"broadcast","Q1259759":"broadcast","Q7724161":"broadcast","Q21664088":"broadcast","Q234262":"chapter","Q21481766":"chapter","Q26989423":"chapter","Q29154515":"chapter","Q43148525":"chapter","Q43180447":"chapter","Q53460949":"chapter","Q327349":"dataset","Q1394657":"dataset","Q1988927":"dataset","Q201456":"dataset","Q220393":"dataset","Q3071343":"dataset","Q254213":"dataset","Q319949":"dataset","Q672598":"dataset","Q780605":"dataset","Q815410":"dataset","Q819688":"dataset","Q854459":"dataset","Q897682":"dataset","Q1114135":"dataset","Q1147639":"dataset","Q1400059":"dataset","Q1665882":"dataset","Q1754061":"dataset","Q1915979":"dataset","Q1991865":"dataset","Q2038458":"dataset","Q2249973":"dataset","Q2597555":"dataset","Q3346024":"dataset","Q5141544":"dataset","Q5146094":"dataset","Q5962346":"dataset","Q6941730":"dataset","Q7096331":"dataset","Q10413470":"dataset","Q15194024":"dataset","Q11722865":"dataset","Q273057":"dataset","Q16832380":"dataset","Q20820424":"dataset","Q22692845":"dataset","Q52666561":"dataset","Q59209277":"dataset","Q59977151":"dataset","Q60686104":"dataset","Q2262868":"dataset","Q7449052":"dataset","Q596138":"motion_picture","Q3464665":"broadcast","Q24862":"motion_picture","Q7751682":"motion_picture","Q187044":"article-newspaper","Q22812458":"broadcast","Q170238":"broadcast","Q309481":"article-newspaper","Q2495037":"article-newspaper","Q2602337":"article-newspaper","Q5149212":"article-newspaper","Q17628188":"article-newspaper","Q17633526":"article-newspaper","Q17928402":"post-weblog","Q50081413":"webpage","Q20136634":"article","Q43290228":"article","Q57988118":"post","Q40745":"legal_case","Q245072":"legal_case","Q321568":"legal_case","Q375727":"legal_case","Q699735":"report","Q836925":"report","Q788874":"legal_case","Q830689":"report","Q1668727":"report","Q1498464":"legal_case","Q1926270":"report","Q2070370":"legal_case","Q2145003":"legal_case","Q2307704":"report","Q2309880":"report","Q2677586":"report","Q3000100":"report","Q3922396":"legal_case","Q4343952":"report","Q4690599":"report","Q6451276":"report","Q7968600":"legal_case","Q7918438":"report","Q12038591":"legal_case","Q13433827":"entry","Q15629444":"report","Q17090395":"report","Q17329259":"entry-encyclopedia","Q19355445":"report","Q61704031":"broadcast","Q27027169":"report","Q41274869":"report","Q47126552":"report","Q56013707":"report","Q58089619":"legal_case","Q157394":"motion_picture","Q207601":"broadcast","Q1504425":"article-journal","Q1241826":"broadcast","Q2155186":"broadcast","Q2435927":"broadcast","Q2774197":"article-journal","Q3588923":"broadcast","Q5177022":"broadcast","Q7316896":"article-journal","Q7551315":"motion_picture","Q10709386":"broadcast","Q622812":"broadcast","Q11079003":"broadcast","Q10885494":"article-journal","Q11293915":"broadcast","Q11325507":"broadcast","Q11334197":"broadcast","Q11351206":"broadcast","Q11378697":"broadcast","Q187947":"musical_score","Q11451968":"broadcast","Q11483878":"broadcast","Q11491683":"broadcast","Q12183006":"article-journal","Q18458820":"broadcast","Q56478376":"article-journal","Q58038936":"article-journal","Q58898396":"article-journal","Q58900805":"article-journal","Q58901470":"article-journal","Q58902427":"article-journal","Q59458414":"article-journal","Q4249087":"legal_case","Q5710433":"legal_case","Q60456691":"legal_case","Q17074865":"map","Q18609332":"legal_case","Q29197":"broadcast","Q18011171":"motion_picture","Q506240":"motion_picture","Q653916":"motion_picture","Q240862":"motion_picture","Q914242":"motion_picture","Q5287435":"broadcast","Q5338721":"motion_picture","Q13359539":"broadcast","Q21191265":"broadcast","Q26225765":"motion_picture","Q29555881":"broadcast","Q50062923":"broadcast","Q50914552":"broadcast","Q61220733":"broadcast","Q1924747":"dataset","Q26868375":"dataset","Q61782522":"dataset","Q2033233":"dataset","Q39086821":"review","Q595971":"dataset","Q3539533":"dataset","Q276":"broadcast","Q182415":"broadcast","Q336181":"broadcast","Q356055":"broadcast","Q358942":"broadcast","Q431102":"broadcast","Q661436":"broadcast","Q677466":"motion_picture","Q854995":"broadcast","Q986699":"broadcast","Q1261214":"broadcast","Q1358344":"broadcast","Q1366112":"broadcast","Q1407240":"broadcast","Q1407245":"broadcast","Q1472288":"broadcast","Q1619206":"broadcast","Q1684600":"broadcast","Q1819008":"broadcast","Q1962634":"broadcast","Q1857766":"broadcast","Q1924371":"broadcast","Q1948292":"broadcast","Q2081003":"broadcast","Q2231383":"broadcast","Q2304946":"broadcast","Q3744532":"broadcast","Q5455086":"broadcast","Q6626746":"broadcast","Q7697093":"broadcast","Q14623351":"broadcast","Q3511312":"broadcast","Q10676514":"broadcast","Q202866":"motion_picture","Q1107":"motion_picture","Q581714":"broadcast","Q21191019":"broadcast","Q11086742":"motion_picture","Q11504513":"broadcast","Q14942329":"broadcast","Q15836186":"broadcast","Q16068806":"broadcast","Q16206641":"broadcast","Q17145545":"broadcast","Q18640746":"broadcast","Q19845560":"broadcast","Q19973797":"broadcast","Q21217315":"broadcast","Q25090976":"broadcast","Q27912070":"broadcast","Q28664032":"broadcast","Q34682961":"broadcast","Q46706005":"broadcast","Q118171":"dataset","Q192588":"dataset","Q193351":"dataset","Q212805":"dataset","Q333761":"dataset","Q702448":"dataset","Q1869909":"motion_picture","Q29982285":"broadcast","Q780524":"dataset","Q989016":"dataset","Q1172362":"dataset","Q1235236":"dataset","Q1373925":"dataset","Q1391125":"dataset","Q1393704":"dataset","Q1414426":"dataset","Q1494224":"dataset","Q1519460":"dataset","Q1787017":"dataset","Q1957894":"dataset","Q2599456":"dataset","Q2274762":"dataset","Q2302053":"dataset","Q2404903":"dataset","Q2532732":"dataset","Q2881060":"dataset","Q2912944":"dataset","Q3133368":"dataset","Q3454922":"dataset","Q4117139":"dataset","Q4501235":"dataset","Q4677551":"dataset","Q5062195":"dataset","Q5322831":"dataset","Q5473309":"dataset","Q5572370":"dataset","Q7246853":"dataset","Q7702836":"dataset","Q9067653":"dataset","Q14806568":"dataset","Q15097084":"dataset","Q15100572":"dataset","Q16155335":"dataset","Q17014602":"dataset","Q22811662":"dataset","Q24579448":"dataset","Q28146196":"dataset","Q33270056":"dataset","Q36570165":"dataset","Q45028176":"dataset","Q54933017":"dataset","Q55341040":"dataset","Q59157251":"dataset","Q13406463":"webpage","Q60856733":"dataset","Q521414":"dataset","Q883895":"dataset","Q986756":"dataset","Q1345528":"dataset","Q3404855":"dataset","Q3405306":"dataset","Q3518943":"dataset","Q3664416":"dataset","Q4127466":"dataset","Q4350734":"dataset","Q60557971":"dataset","Q4350735":"dataset","Q4350754":"dataset","Q5058966":"dataset","Q5058970":"dataset","Q5058971":"dataset","Q5058968":"dataset","Q5058969":"dataset","Q5058974":"dataset","Q5058975":"dataset","Q5058972":"dataset","Q5058978":"dataset","Q5058977":"dataset","Q5058981":"dataset","Q5058989":"dataset","Q5334384":"dataset","Q7015254":"dataset","Q10497456":"dataset","Q12058091":"dataset","Q16056280":"dataset","Q19894430":"dataset","Q24934691":"dataset","Q25383554":"dataset","Q26207721":"dataset","Q28730356":"dataset","Q29795177":"dataset","Q8025448":"book","Q1114458":"book","Q3027814":"book","Q3268307":"book","Q3491290":"book","Q4955683":"book","Q5197887":"book","Q6071891":"book","Q5296":"webpage","Q57819011":"legal_case","Q57821094":"legal_case","Q218013":"dataset","Q283579":"dataset","Q426674":"dataset","Q479833":"dataset","Q721795":"dataset","Q838281":"dataset","Q843670":"dataset","Q877809":"dataset","Q900856":"dataset","Q949532":"dataset","Q1265166":"dataset","Q1571814":"dataset","Q2025786":"book","Q2250844":"book","Q4034405":"book","Q5227352":"dataset","Q2115":"dataset","Q14679":"dataset","Q577697":"map","Q5150048":"map","Q16840211":"book","Q21032630":"book","Q8034663":"book","Q11191558":"book","Q13769783":"dataset","Q14902318":"dataset","Q24063789":"dataset","Q25975660":"dataset","Q26260540":"dataset","Q11266439":"webpage","Q26267864":"dataset","Q26987229":"dataset","Q27198004":"dataset","Q28948553":"dataset","Q29053519":"dataset","Q29694587":"dataset","Q41709380":"dataset","Q47459830":"dataset","Q57936091":"book","Q58902997":"book","Q7572716":"dataset","Q59913845":"song","Q2143665":"motion_picture","Q1957385":"motion_picture","Q5769663":"motion_picture","Q5855976":"motion_picture","Q1441669":"broadcast","Q1441929":"broadcast","Q16943561":"broadcast","Q19858063":"broadcast","Q19858074":"broadcast","Q19858077":"broadcast","Q19858082":"broadcast","Q19858080":"broadcast","Q19858086":"broadcast","Q19858087":"broadcast","Q19858088":"broadcast","Q19858095":"broadcast","Q19858093":"broadcast","Q19858098":"broadcast","Q19858107":"broadcast","Q19858110":"broadcast","Q19858108":"broadcast","Q19858123":"broadcast","Q19858126":"broadcast","Q19858124":"broadcast","Q19858125":"broadcast","Q19858142":"broadcast","Q19858143":"broadcast","Q19858140":"broadcast","Q19858141":"broadcast","Q19859744":"broadcast","Q19859780":"broadcast","Q1271915":"dataset","Q2250805":"map","Q2359829":"map","Q2415383":"map","Q2869471":"map","Q4816871":"map","Q5135690":"map","Q11025270":"map","Q21936815":"map","Q21938018":"map","Q26885495":"map","Q333779":"map","Q640492":"map","Q690851":"manuscript","Q1105486":"manuscript","Q1501880":"map","Q1501945":"map","Q1550537":"map","Q1974665":"map","Q2915844":"map","Q54298448":"map","Q21188110":"broadcast","Q918098":"broadcast","Q4765080":"broadcast","Q17113138":"broadcast","Q856314":"manuscript","Q928128":"manuscript","Q19969434":"manuscript","Q5647631":"manuscript","Q1190781":"manuscript","Q1620808":"manuscript","Q1675712":"manuscript","Q3637297":"manuscript","Q18558914":"manuscript","Q492264":"musical_score","Q10590726":"motion_picture","Q60259696":"manuscript","Q60323106":"manuscript","Q60325498":"manuscript","Q60363009":"manuscript","Q2552822":"musical_score","Q7452061":"musical_score","Q3962157":"map","Q16825889":"map","Q1826720":"map","Q3935817":"dataset","Q18616720":"dataset","Q7601206":"dataset","Q7620972":"map","Q1353555":"dataset","Q22961568":"book","Q93204":"motion_picture","Q7832972":"motion_picture","Q312083":"map","Q322943":"treaty","Q459435":"motion_picture","Q587240":"manuscript","Q595819":"treaty","Q850950":"dataset","Q1003870":"treaty","Q1688818":"map","Q1048515":"map","Q1473669":"manuscript","Q1667520":"map","Q2723202":"map","Q2941628":"dataset","Q2981686":"manuscript","Q2981685":"manuscript","Q7551149":"motion_picture","Q2933856":"book","Q266680":"map","Q1702772":"map","Q2035351":"map","Q2073537":"manuscript","Q2204393":"map","Q2325507":"map","Q5469880":"report","Q5469893":"report","Q5469912":"report","Q10438653":"map","Q42793629":"speech","Q2678443":"dataset","Q1923776":"book","Q2981450":"book","Q1413174":"dataset","Q185529":"motion_picture","Q16254232":"motion_picture","Q31803237":"treaty","Q32945468":"dataset","Q59825643":"dataset","Q934552":"dataset","Q200562":"broadcast","Q303064":"broadcast","Q1484397":"broadcast","Q2049337":"broadcast","Q2123557":"broadcast","Q2308891":"report","Q2665960":"report","Q5227671":"broadcast","Q18030695":"report","Q18385907":"broadcast","Q21190411":"broadcast","Q47512784":"report","Q56330488":"book","Q33111614":"motion_picture","Q484692":"song","Q1033831":"song","Q1497584":"book","Q19705":"book","Q628080":"book","Q1535505":"book","Q2333573":"book","Q3357101":"book","Q12041885":"book","Q5151497":"motion_picture","Q7999883":"article","Q18398246":"motion_picture","Q56309057":"manuscript","Q61314299":"dataset","Q234280":"chapter","Q234300":"chapter","Q862334":"book","Q2973181":"motion_picture","Q3072049":"motion_picture","Q1747837":"motion_picture","Q12029612":"dataset","Q50380591":"book","Q51881567":"book","Q60029764":"book","Q914229":"article","Q5465451":"article","Q20135338":"motion_picture","Q1541065":"report","Q2594143":"dataset","Q16664076":"report","Q441261":"dataset","Q457843":"dataset","Q783287":"dataset","Q1115961":"dataset","Q1713174":"dataset","Q3327521":"dataset","Q151":"dataset","Q17123180":"motion_picture","Q15982056":"article-newspaper","Q59191021":"dataset","Q59248059":"dataset","Q59248072":"dataset","Q1371849":"dataset","Q17438413":"dataset","Q61914117":"dataset","Q3352071":"motion_picture","Q25051296":"webpage","Q25054829":"dataset","Q267136":"dataset","Q488053":"book","Q914881":"book","Q1397073":"dataset","Q1662581":"dataset","Q2268965":"dataset","Q3292731":"book","Q3406872":"dataset","Q5033354":"dataset","Q5227322":"dataset","Q5532670":"dataset","Q7515656":"book","Q7598341":"dataset","Q7995661":"dataset","Q14523803":"book","Q17146953":"dataset","Q25110279":"book","Q30008669":"book","Q30009376":"book","Q41623316":"dataset","Q38647918":"book","Q249697":"speech","Q1428914":"dataset","Q255135":"book","Q471894":"book","Q586744":"book","Q956165":"book","Q1569753":"book","Q2939758":"book","Q12040484":"book","Q13583784":"book","Q59351530":"book","Q61020892":"book","Q17086104":"map","Q17147147":"map","Q19393521":"map","Q58884":"broadcast","Q2635894":"broadcast","Q193842":"map","Q261468":"map","Q943929":"song","Q1123037":"song","Q336822":"song","Q336371":"map","Q459798":"map","Q831939":"map","Q865144":"map","Q889561":"map","Q1152543":"map","Q1187667":"broadcast","Q1281814":"map","Q1674401":"map","Q1742009":"broadcast","Q1778220":"map","Q1800237":"map","Q2126801":"map","Q2125867":"broadcast","Q2298569":"map","Q2940627":"map","Q4903803":"map","Q5687679":"map","Q10480692":"map","Q10604395":"map","Q10916116":"book","Q11960416":"map","Q12008992":"map","Q58901209":"dataset","Q19969268":"broadcast","Q20741385":"book","Q21009694":"book","Q24879310":"dataset","Q56028349":"book","Q56240541":"broadcast","Q56697520":"book","Q60586493":"dataset","Q183169":"webpage","Q825914":"book","Q1391116":"dataset","Q1516252":"book","Q1569406":"dataset","Q1609353":"dataset","Q1609504":"dataset","Q1862738":"book","Q2110197":"dataset","Q3237931":"broadcast","Q3956369":"broadcast","Q3962380":"dataset","Q4769616":"dataset","Q4804740":"book","Q5051330":"dataset","Q5615468":"dataset","Q6822329":"dataset","Q6912943":"broadcast","Q7144753":"dataset","Q10688394":"book","Q12331427":"dataset","Q15961983":"broadcast","Q18311760":"broadcast","Q1499601":"dataset","Q5374928":"map","Q7444356":"motion_picture","Q6729489":"motion_picture","Q7444692":"map","Q8036547":"map","Q1383152":"dataset","Q3564515":"speech","Q3890208":"dataset","Q21050458":"dataset","Q21050912":"dataset","Q26721650":"dataset","Q31841013":"dataset","Q1865123":"dataset","Q206290":"dataset","Q1088118":"dataset","Q7502102":"dataset","Q17121221":"map","Q23888763":"book","Q46992920":"speech","Q52506277":"dataset","Q51719975":"broadcast","Q19364663":"book","Q22938710":"book","Q193977":"motion_picture","Q59032066":"song","Q1989725":"song","Q2135500":"manuscript","Q3153927":"speech","Q526877":"broadcast","Q742157":"article-newspaper","Q6899707":"map","Q725377":"book","Q10541153":"book","Q21198407":"book","Q369074":"dataset","Q3249257":"motion_picture","Q4373044":"motion_picture","Q172067":"motion_picture","Q1046788":"motion_picture","Q24886171":"broadcast","Q53746253":"broadcast","Q16709869":"book","Q16960707":"book","Q19941906":"book","Q21660824":"book","Q21818614":"book","Q57987419":"interview","Q57987455":"interview","Q57987589":"interview","Q61725752":"book","Q225672":"book","Q263790":"book","Q284465":"book","Q431193":"book","Q608971":"book","Q634123":"book","Q817063":"book","Q833590":"book","Q1027825":"book","Q1385360":"book","Q1754581":"book","Q2114246":"book","Q2144117":"book","Q2732056":"book","Q2955456":"book","Q4203401":"book","Q7163040":"book","Q7603925":"broadcast","Q12765421":"book","Q15276670":"book","Q15627042":"book","Q6548306":"book","Q12046416":"map","Q472298":"legal_case","Q1261319":"map","Q5563391":"map","Q26644852":"broadcast","Q29167422":"dataset","Q7211":"dataset","Q48473":"dataset","Q217327":"legal_case","Q951437":"dataset","Q636033":"dataset","Q672593":"dataset","Q739047":"dataset","Q891854":"legal_case","Q1207369":"dataset","Q1391014":"dataset","Q1642648":"dataset","Q2859990":"dataset","Q3307317":"dataset","Q4330194":"dataset","Q6813020":"legal_case","Q6901292":"legal_case","Q7251471":"dataset","Q18711682":"legal_case","Q20057286":"dataset","Q23015465":"dataset","Q24243801":"dataset","Q24249534":"dataset","Q25917186":"legal_case","Q27214933":"dataset","Q28934204":"legal_case","Q39740866":"dataset","Q59495116":"dataset","Q60208424":"dataset","Q61037469":"legal_case","Q40426579":"map","Q43037778":"map","Q47008743":"map","Q26225493":"book","Q29043181":"dataset","Q55850593":"song","Q55850643":"song","Q58885732":"song","Q58885754":"song","Q927803":"song","Q430010":"song","Q2292588":"song","Q2499178":"dataset","Q2560570":"dataset","Q3077240":"dataset","Q3491832":"dataset","Q1235234":"dataset","Q7096323":"dataset","Q7831478":"song","Q1564816":"legal_case","Q2698974":"legal_case","Q20089346":"motion_picture","Q5366020":"motion_picture","Q11526166":"speech","Q4167410":"webpage","Q845159":"motion_picture","Q1003021":"dataset","Q4167836":"webpage","Q1249224":"report","Q11382506":"webpage","Q15475226":"webpage","Q15475319":"webpage","Q1991869":"book","Q11690026":"book","Q31209114":"webpage","Q35243371":"webpage","Q48781895":"motion_picture","Q56005592":"webpage","Q17586363":"book","Q20043999":"book","Q59738577":"webpage","Q61033232":"webpage","Q61033736":"dataset","Q61034350":"webpage","Q29573701":"dataset","Q645928":"motion_picture","Q3209941":"report","Q5165404":"bill","Q11078958":"report","Q45182324":"article-journal","Q56119332":"post-weblog","Q60797":"speech","Q1474597":"speech","Q2069352":"book","Q2983424":"motion_picture","Q19359000":"report","Q24067746":"post-weblog","Q51844620":"dataset","Q51539995":"webpage","Q55422400":"broadcast","Q130232":"motion_picture","Q635115":"dataset","Q1553078":"dataset","Q1784036":"book","Q1813223":"book","Q2326951":"book","Q2500820":"book","Q3423635":"dataset","Q4363806":"book","Q14605760":"webpage","Q21875313":"book","Q24633474":"broadcast","Q28136925":"broadcast","Q28135032":"broadcast","Q28472638":"speech","Q28472722":"speech","Q1011299":"broadcast","Q3276244":"broadcast","Q29883647":"treaty","Q42214612":"treaty","Q60215679":"broadcast","Q60215966":"broadcast","Q7033567":"treaty","Q8576":"treaty","Q3257212":"book","Q5166307":"treaty","Q7865023":"treaty","Q8187836":"treaty","Q16923948":"treaty","Q17211914":"treaty","Q20874666":"treaty","Q39233713":"treaty","Q8041497":"patent","Q50823049":"report","Q61715571":"book","Q193934":"book","Q193955":"book","Q990683":"book","Q12047175":"book","Q1250520":"dataset","Q2334774":"song","Q22001389":"dataset","Q61782519":"dataset","Q112762":"song","Q177771":"song","Q178122":"song","Q207683":"song","Q216860":"song","Q261434":"song","Q318894":"song","Q319448":"song","Q380233":"song","Q493169":"song","Q502658":"song","Q523896":"song","Q591990":"song","Q608253":"song","Q744327":"song","Q758422":"song","Q783874":"song","Q784074":"song","Q820119":"song","Q844450":"song","Q873000":"song","Q944800":"song","Q959583":"song","Q988502":"song","Q1009280":"song","Q2281713":"song","Q1033810":"song","Q1033813":"song","Q1151663":"song","Q1195253":"song","Q1195630":"song","Q1228189":"song","Q20477577":"dataset","Q1972954":"dataset","Q842256":"motion_picture","Q643684":"motion_picture","Q1033573":"dataset","Q1205607":"dataset","Q1971947":"dataset","Q2145124":"dataset","Q2819247":"dataset","Q4685824":"dataset","Q7002108":"dataset","Q7200622":"dataset","Q8267601":"dataset","Q9732903":"webpage","Q11002482":"webpage","Q12096573":"webpage","Q16059585":"webpage","Q16059613":"webpage","Q16059624":"webpage","Q19208935":"webpage","Q21450877":"webpage","Q31936067":"dataset","Q47500192":"dataset","Q1229479":"song","Q1232283":"song","Q1236108":"song","Q1288193":"song","Q1372064":"song","Q1382036":"song","Q1779217":"song","Q1779319":"song","Q1899706":"song","Q1905727":"song","Q1942905":"song","Q1956166":"song","Q1963108":"song","Q1966622":"song","Q2038845":"song","Q2058312":"song","Q2108499":"song","Q2165184":"song","Q2235992":"song","Q2298624":"song","Q2312959":"song","Q2358279":"song","Q2544997":"song","Q2707688":"song","Q2737175":"song","Q2891357":"song","Q2894096":"song","Q2956164":"song","Q2956172":"song","Q3033130":"song","Q3246270":"song","Q3299089":"song","Q3482281":"song","Q3562031":"song","Q3843655":"song","Q3889661":"song","Q3918025":"song","Q4056436":"song","Q4130112":"song","Q4528554":"song","Q4770819":"song","Q4797274":"song","Q5031532":"song","Q5037289":"song","Q5747946":"song","Q5766029":"song","Q6109162":"song","Q7148059":"song","Q7314000":"song","Q7561608":"song","Q7824869":"song","Q8053529":"song","Q8261762":"song","Q10677514":"song","Q21653344":"song","Q56572789":"song","Q503354":"song","Q11214531":"song","Q12115862":"song","Q12135013":"song","Q12313565":"song","Q13829124":"song","Q15810872":"song","Q15907187":"song","Q16084298":"song","Q16194930":"song","Q16912992":"song","Q17118203":"song","Q17150323":"song","Q18012876":"song","Q18406550":"song","Q19607140":"song","Q20087039":"song","Q20107778":"song","Q20980372":"song","Q21127215":"song","Q22086714":"song","Q23072435":"song","Q25022242":"song","Q27981708":"song","Q27981857":"song","Q29051387":"song","Q37731261":"song","Q42681239":"song","Q46863086":"song","Q55596270":"song","Q56425213":"song","Q56425237":"song","Q61688673":"song","Q229390":"motion_picture","Q319221":"motion_picture","Q369747":"motion_picture","Q370630":"motion_picture","Q421719":"motion_picture","Q430525":"motion_picture","Q455315":"motion_picture","Q459290":"motion_picture","Q505119":"motion_picture","Q517386":"motion_picture","Q652256":"motion_picture","Q663106":"motion_picture","Q790192":"motion_picture","Q848512":"motion_picture","Q1060398":"motion_picture","Q1146335":"motion_picture","Q1200678":"motion_picture","Q1251417":"motion_picture","Q1320115":"motion_picture","Q1361932":"motion_picture","Q1397462":"motion_picture","Q1933746":"motion_picture","Q1935609":"motion_picture","Q2125170":"motion_picture","Q2156835":"motion_picture","Q2165644":"motion_picture","Q2301591":"motion_picture","Q4382232":"broadcast","Q2321734":"motion_picture","Q2553613":"motion_picture","Q2903140":"motion_picture","Q3072043":"motion_picture","Q3250548":"motion_picture","Q3585697":"motion_picture","Q3648909":"motion_picture","Q3677141":"motion_picture","Q3677185":"motion_picture","Q3745400":"motion_picture","Q3745430":"motion_picture","Q4220915":"motion_picture","Q4484381":"motion_picture","Q5145881":"motion_picture","Q5378150":"motion_picture","Q7130449":"motion_picture","Q7858343":"motion_picture","Q9259727":"motion_picture","Q12309044":"motion_picture","Q12377598":"motion_picture","Q16721823":"motion_picture","Q16909344":"motion_picture","Q19799105":"motion_picture","Q19799133":"motion_picture","Q20442589":"motion_picture","Q20650540":"motion_picture","Q21182682":"motion_picture","Q24887738":"motion_picture","Q28735856":"motion_picture","Q29017630":"motion_picture","Q30070675":"motion_picture","Q30897819":"motion_picture","Q33373157":"motion_picture","Q43079104":"motion_picture","Q54086290":"motion_picture","Q54344007":"motion_picture","Q56192069":"motion_picture","Q58415294":"motion_picture","Q58903570":"motion_picture","Q61283808":"motion_picture","Q219557":"motion_picture","Q226730":"motion_picture","Q24865":"motion_picture","Q24869":"motion_picture","Q31235":"motion_picture","Q3956596":"book","Q20012720":"book","Q27070652":"book","Q738826":"speech","Q2623953":"speech","Q2781658":"speech","Q3479856":"speech","Q7454995":"speech","Q735478":"motion_picture","Q124922":"motion_picture","Q472637":"motion_picture","Q1092621":"motion_picture","Q1323308":"motion_picture","Q1352102":"motion_picture","Q1464369":"motion_picture","Q1474387":"motion_picture","Q1480924":"motion_picture","Q1760864":"motion_picture","Q1800833":"motion_picture","Q2084909":"motion_picture","Q27697957":"motion_picture","Q2670855":"motion_picture","Q3566966":"motion_picture","Q4765076":"motion_picture","Q20732395":"motion_picture","Q1684595":"dataset","Q7168625":"motion_picture","Q8192124":"motion_picture","Q5008290":"dataset","Q220399":"dataset","Q285745":"dataset","Q542475":"motion_picture","Q846544":"motion_picture","Q3072039":"motion_picture","Q23739":"broadcast","Q338632":"broadcast","Q288608":"broadcast","Q3421644":"broadcast","Q5465514":"broadcast","Q5812300":"broadcast","Q18340550":"webpage","Q21232614":"broadcast","Q1224870":"dataset","Q79715":"broadcast","Q278425":"dataset","Q548206":"motion_picture","Q632149":"motion_picture","Q996838":"motion_picture","Q1147986":"motion_picture","Q2258523":"map","Q2514870":"dataset","Q2559958":"broadcast","Q4342538":"map","Q15518544":"broadcast","Q15518777":"broadcast","Q20707560":"dataset","Q20871935":"motion_picture","Q55960075":"motion_picture","Q1224984":"dataset","Q5227308":"dataset","Q12328550":"dataset","Q20089094":"motion_picture","Q21040941":"dataset","Q668312":"motion_picture","Q30047053":"dataset","Q18493502":"legal_case","Q1067692":"motion_picture","Q18655723":"motion_picture","Q844993":"song","Q4763437":"book","Q19894488":"book","Q262533":"speech","Q591055":"speech","Q1851305":"speech","Q3588034":"speech","Q20669604":"speech","Q29642901":"dataset","Q1061420":"map","Q2914518":"map","Q186286":"broadcast","Q940462":"broadcast","Q15823625":"map","Q54328426":"broadcast","Q1713326":"motion_picture","Q4453959":"motion_picture","Q5905221":"musical_score","Q23368955":"motion_picture","Q55848868":"motion_picture","Q3072024":"motion_picture","Q965136":"map","Q3546572":"broadcast","Q5449041":"motion_picture","Q6645282":"broadcast","Q25360500":"broadcast","Q376820":"dataset","Q2422383":"dataset","Q14552560":"article-newspaper","Q219897":"dataset","Q787397":"map","Q14943256":"book","Q15715669":"map","Q3196335":"book","Q4700148":"book","Q11669289":"map","Q56683168":"map","Q6749508":"dataset","Q13039854":"dataset","Q19354904":"legal_case","Q25917154":"legal_case","Q25456031":"dataset","Q47484674":"dataset","Q948454":"dataset","Q1734165":"dataset","Q5441632":"book","Q7321644":"book","Q7890265":"book","Q28406796":"dataset","Q46130774":"dataset","Q54820068":"book","Q17146139":"map","Q23691":"song","Q54251760":"motion_picture","Q851995":"map","Q25336664":"dataset","Q11310550":"dataset","Q18086661":"dataset","Q18086666":"dataset","Q18086667":"dataset","Q18086665":"dataset","Q18086671":"dataset","Q18089574":"dataset","Q18089575":"dataset","Q18099930":"dataset","Q18100125":"dataset","Q18889352":"dataset","Q18922463":"dataset","Q20005020":"dataset","Q798134":"thesis","Q1414362":"thesis","Q30749496":"thesis","Q46629343":"thesis","Q51282441":"thesis","Q52823264":"thesis","Q58210330":"thesis","Q1907875":"thesis","Q23745":"broadcast","Q399811":"broadcast","Q775344":"broadcast","Q1658957":"broadcast","Q1786567":"broadcast","Q4783297":"broadcast","Q5219865":"broadcast","Q7185299":"broadcast","Q7731786":"broadcast","Q7892363":"broadcast","Q11086745":"broadcast","Q20986817":"broadcast","Q60393504":"broadcast","Q16342":"dataset","Q632285":"dataset","Q1751819":"dataset","Q2560532":"dataset","Q6517465":"dataset","Q1898445":"map","Q41436524":"book","Q50310598":"dataset","Q5366501":"broadcast","Q9018710":"broadcast","Q11935070":"broadcast","Q688869":"manuscript","Q962741":"manuscript","Q7797194":"dataset","Q1662452":"motion_picture","Q4499034":"song","Q6009879":"book","Q595801":"book","Q894351":"map","Q1352815":"broadcast","Q1569955":"dataset","Q2538131":"book","Q3348148":"dataset","Q5535082":"dataset","Q7574095":"dataset","Q47214765":"broadcast","Q61990518":"broadcast","Q2933978":"broadcast","Q6537693":"dataset","Q6888313":"book","Q12270042":"book","Q21292860":"broadcast","Q350514":"map","Q357674":"map","Q5191437":"dataset","Q24265951":"dataset","Q25110971":"book","Q29966258":"dataset","Q25894883":"dataset","Q2093973":"book","Q1711400":"broadcast","Q3071014":"broadcast","Q61029068":"webpage","Q61996773":"webpage","Q175902":"dataset","Q1295532":"webpage","Q1474116":"webpage","Q1501313":"dataset","Q1916557":"dataset","Q5333554":"dataset","Q7247749":"dataset","Q4330198":"dataset","Q5570651":"dataset","Q7251500":"dataset","Q7277178":"dataset","Q7689673":"dataset","Q15407973":"webpage","Q15647814":"webpage","Q16335141":"dataset","Q18392279":"dataset","Q15623926":"webpage","Q22808320":"webpage","Q24571879":"webpage","Q24574745":"webpage","Q17362920":"webpage","Q28065731":"webpage","Q28208970":"dataset","Q30432511":"webpage","Q54662266":"webpage","Q56428020":"webpage","Q58036154":"webpage","Q58181524":"webpage","Q58423626":"webpage","Q59541917":"webpage","Q59542487":"webpage","Q5227321":"dataset","Q178840":"broadcast","Q482612":"broadcast","Q662197":"broadcast","Q1054760":"broadcast","Q1273568":"broadcast","Q1676730":"broadcast","Q1802588":"broadcast","Q2388283":"broadcast","Q3189895":"broadcast","Q3951815":"broadcast","Q5778915":"broadcast","Q7050677":"broadcast","Q7135559":"broadcast","Q9335577":"broadcast","Q9671105":"broadcast","Q20061443":"broadcast","Q20220309":"broadcast","Q20267837":"broadcast","Q21233490":"broadcast","Q21191068":"broadcast","Q27868077":"broadcast","Q30939244":"broadcast","Q55082620":"broadcast","Q56320653":"broadcast","Q45787211":"dataset","Q1799894":"broadcast","Q19220511":"dataset","Q7841716":"motion_picture","Q5987970":"book","Q7864671":"motion_picture","Q21504449":"broadcast","Q61896850":"motion_picture","Q61911910":"motion_picture","Q15184295":"webpage","Q29581299":"book","Q3507630":"dataset","Q5571730":"webpage","Q13231199":"webpage","Q15851373":"webpage","Q19692233":"webpage","Q2921195":"book","Q20009925":"webpage","Q21167233":"webpage","Q25456482":"webpage","Q26884324":"webpage","Q28197061":"webpage","Q30032916":"webpage","Q33532284":"webpage","Q37152856":"webpage","Q19887878":"webpage","Q30044873":"report","Q11664270":"broadcast","Q1852859":"map","Q2297927":"motion_picture","Q2188827":"manuscript","Q4922471":"broadcast","Q16247289":"broadcast","Q25381170":"book","Q25696292":"dataset","Q11398":"dataset","Q210918":"dataset","Q267474":"dataset","Q1062352":"dataset","Q548492":"dataset","Q732744":"dataset","Q1520859":"dataset","Q1744559":"dataset","Q2748242":"dataset","Q3445240":"dataset","Q3518464":"dataset","Q3546241":"dataset","Q5172500":"dataset","Q6857882":"dataset","Q7398671":"dataset","Q22808060":"song","Q22298551":"dataset","Q22935148":"dataset","Q23014490":"dataset","Q23015153":"dataset","Q185867":"motion_picture","Q192625":"dataset","Q784969":"dataset","Q917904":"dataset","Q3546232":"dataset","Q4382932":"dataset","Q2357684":"dataset","Q2490652":"dataset","Q562667":"treaty","Q11510761":"treaty","Q39234115":"treaty","Q39235586":"treaty","Q39236188":"treaty","Q39236506":"treaty","Q39237589":"treaty","Q691836":"dataset","Q2299775":"dataset","Q2584888":"dataset","Q934210":"dataset","Q16355541":"dataset","Q57560929":"song","Q59826893":"dataset","Q478216":"dataset","Q1138178":"dataset","Q2621880":"dataset","Q2859969":"dataset","Q2964498":"dataset","Q4223049":"dataset","Q4421014":"dataset","Q16549505":"dataset","Q21441341":"dataset","Q26975748":"dataset","Q5366097":"motion_picture","Q1137588":"song","Q6022825":"broadcast","Q15977715":"broadcast","Q24906243":"broadcast","Q471839":"motion_picture","Q1794431":"motion_picture","Q3080071":"broadcast","Q6942568":"motion_picture","Q11900986":"motion_picture","Q16677772":"motion_picture","Q17517379":"motion_picture","Q20667187":"motion_picture","Q29168811":"motion_picture","Q34487266":"broadcast","Q47486001":"motion_picture","Q57780531":"motion_picture","Q223770":"motion_picture","Q4836991":"motion_picture","Q212781":"motion_picture","Q41270":"song","Q383904":"song","Q564848":"song","Q721644":"song","Q5158512":"song","Q6037387":"song","Q3962943":"motion_picture","Q21759196":"motion_picture","Q60630702":"motion_picture","Q222639":"motion_picture","Q1033891":"motion_picture","Q1535153":"motion_picture","Q1740789":"motion_picture","Q1776156":"motion_picture","Q1894374":"motion_picture","Q2421031":"motion_picture","Q332564":"motion_picture","Q853630":"motion_picture","Q909586":"motion_picture","Q987831":"motion_picture","Q1341051":"motion_picture","Q1342372":"motion_picture","Q1696148":"motion_picture","Q2584671":"motion_picture","Q4174664":"motion_picture","Q883179":"motion_picture","Q4925568":"motion_picture","Q5551875":"motion_picture","Q13377551":"motion_picture","Q16247268":"motion_picture","Q18089587":"motion_picture","Q18355406":"motion_picture","Q18648407":"motion_picture","Q4840473":"motion_picture","Q20656232":"motion_picture","Q23044991":"motion_picture","Q25110269":"motion_picture","Q27959357":"motion_picture","Q28968258":"motion_picture","Q28968511":"motion_picture","Q43911809":"motion_picture","Q1276148":"dataset","Q3546236":"dataset","Q819652":"motion_picture","Q1433443":"motion_picture","Q2096633":"motion_picture","Q10654943":"motion_picture","Q15898171":"motion_picture","Q1502766":"motion_picture","Q22981906":"motion_picture","Q33218678":"dataset","Q33219080":"dataset","Q1502102":"dataset","Q290066":"dataset","Q21473954":"dataset","Q884257":"map","Q1136047":"song","Q3442060":"motion_picture","Q6722594":"motion_picture","Q22802898":"dataset","Q1147354":"song","Q541947":"song","Q762917":"song","Q896981":"song","Q1329536":"song","Q1523875":"song","Q1802243":"song","Q4666464":"song","Q5419334":"song","Q5956747":"song","Q5956766":"song","Q10288496":"song","Q13142456":"song","Q54932319":"broadcast","Q16523070":"book","Q1345076":"dataset","Q1331138":"dataset","Q4984974":"motion_picture","Q5442753":"motion_picture","Q59688552":"motion_picture","Q1030329":"motion_picture","Q2560052":"motion_picture","Q50306849":"dataset","Q9351310":"dataset","Q17093751":"motion_picture","Q55616422":"motion_picture","Q5400070":"motion_picture","Q7097859":"motion_picture","Q2518205":"motion_picture","Q39774781":"song","Q40039114":"song","Q496523":"motion_picture","Q586250":"motion_picture","Q658334":"song","Q1206090":"song","Q2642760":"motion_picture","Q2956178":"song","Q3656521":"song","Q4184716":"song","Q4400497":"song","Q5897543":"motion_picture","Q10743749":"song","Q11989328":"song","Q12623540":"song","Q19367312":"motion_picture","Q47011432":"broadcast","Q61057707":"broadcast","Q1192644":"broadcast","Q1193356":"broadcast","Q1193877":"broadcast","Q1193889":"broadcast","Q1198546":"broadcast","Q1200102":"broadcast","Q1200891":"broadcast","Q1203502":"broadcast","Q1328971":"broadcast","Q15548228":"broadcast","Q18611586":"broadcast","Q27986339":"broadcast","Q16984663":"motion_picture","Q535518":"motion_picture","Q583768":"motion_picture","Q1377546":"motion_picture","Q2254193":"motion_picture","Q2292320":"motion_picture","Q3677202":"motion_picture","Q4044177":"motion_picture","Q4075563":"motion_picture","Q731194":"motion_picture","Q5578091":"motion_picture","Q5768328":"motion_picture","Q6926334":"motion_picture","Q7116678":"motion_picture","Q2527949":"dataset","Q6410349":"song","Q58006100":"dataset","Q1065413":"dataset","Q1334294":"dataset","Q5281480":"dataset","Q14806579":"dataset","Q21629439":"broadcast","Q27965091":"broadcast","Q27965088":"broadcast","Q27965089":"broadcast","Q1117103":"motion_picture","Q15077373":"song","Q21848887":"song","Q42525933":"song","Q1246452":"song","Q1564657":"song","Q1786016":"song","Q4138449":"song","Q26211803":"dataset","Q28107644":"dataset","Q438958":"dataset","Q893182":"dataset","Q1361620":"dataset","Q1744558":"dataset","Q2558761":"broadcast","Q3663344":"dataset","Q5837451":"dataset","Q17080472":"dataset","Q18762344":"dataset","Q22936940":"dataset","Q51282626":"thesis","Q51283070":"thesis","Q51283092":"thesis","Q51283110":"thesis","Q51283164":"thesis","Q51283181":"thesis","Q51283199":"thesis","Q51283219":"thesis","Q51283231":"thesis","Q51283362":"thesis","Q1789476":"dataset","Q1741854":"broadcast","Q11396323":"motion_picture","Q1428162":"song","Q4440575":"song","Q2137852":"motion_picture","Q20443008":"motion_picture","Q9049284":"song","Q2976573":"dataset","Q7247163":"dataset","Q18327786":"dataset","Q18327800":"dataset","Q28444881":"song","Q47009776":"motion_picture","Q4078107":"song","Q12242979":"broadcast","Q1308255":"dataset","Q828962":"dataset","Q2976602":"dataset","Q881912":"broadcast","Q16861376":"dataset","Q59784758":"broadcast","Q829147":"song","Q6457531":"motion_picture","Q28030321":"broadcast","Q28225717":"broadcast","Q4663261":"webpage","Q15145755":"webpage","Q18707678":"webpage","Q18711811":"webpage","Q20160182":"webpage","Q20870830":"webpage","Q22676729":"webpage","Q26214208":"webpage","Q28801937":"webpage","Q30279428":"webpage","Q55510433":"webpage","Q59259626":"webpage","Q20769287":"webpage","Q23894233":"webpage","Q24046192":"webpage","Q24514938":"webpage","Q30330522":"webpage","Q38084761":"webpage","Q58118449":"webpage","Q2886579":"dataset","Q21623879":"webpage","Q28092864":"webpage","Q52147067":"webpage","Q18043430":"webpage","Q18810260":"dataset","Q18889371":"dataset","Q18889411":"dataset","Q20893947":"legal_case","Q43096126":"motion_picture","Q56876503":"webpage","Q58408484":"webpage","Q58492747":"webpage","Q61984657":"webpage","Q3309896":"motion_picture","Q5864844":"motion_picture","Q6190581":"webpage","Q25826840":"webpage","Q220898":"motion_picture","Q2513417":"dataset","Q56885002":"webpage","Q179600":"dataset","Q714750":"dataset","Q15101896":"dataset","Q56558180":"song","Q845648":"webpage","Q58310010":"book","Q16937368":"song","Q28135297":"song","Q50309914":"dataset","Q57560968":"song","Q61740934":"song","Q61729725":"song","Q1047299":"motion_picture","Q2281511":"motion_picture","Q4292083":"motion_picture","Q11446446":"motion_picture","Q11464558":"motion_picture","Q11620244":"motion_picture","Q11673786":"motion_picture","Q16000226":"motion_picture","Q43069510":"motion_picture","Q8066387":"motion_picture","Q16824564":"motion_picture","Q52631698":"song","Q20589414":"song","Q20621902":"song","Q19659229":"song","Q2997685":"song","Q5124548":"song","Q512410":"song","Q23978249":"song","Q6647160":"webpage","Q18170752":"song","Q5881246":"song","Q1723850":"motion_picture","Q169672":"motion_picture","Q622310":"motion_picture","Q3072042":"motion_picture","Q5104880":"motion_picture","Q193605":"song","Q20818018":"dataset","Q1065444":"motion_picture","Q5258881":"motion_picture","Q856638":"dataset","Q5769583":"motion_picture","Q5769580":"motion_picture","Q5769586":"motion_picture","Q5769589":"motion_picture","Q5769592":"motion_picture","Q34848596":"motion_picture","Q2145099":"motion_picture","Q43082648":"broadcast","Q21441352":"dataset","Q2976563":"dataset","Q4680764":"dataset","Q4936202":"dataset","Q4992609":"dataset","Q5281190":"dataset","Q5281191":"dataset","Q5281189":"dataset","Q5281192":"dataset","Q5281193":"dataset","Q5465786":"dataset","Q5575198":"dataset","Q7133628":"dataset","Q7133619":"dataset","Q7133626":"dataset","Q7133625":"dataset","Q7133631":"dataset","Q7133632":"dataset","Q7133633":"dataset","Q7135076":"dataset","Q7136196":"dataset","Q7532102":"dataset","Q7539622":"dataset","Q7539620":"dataset","Q7992082":"dataset","Q7992083":"dataset","Q7992119":"dataset","Q7992116":"dataset","Q7992128":"dataset","Q7992164":"dataset","Q17145514":"dataset","Q28130146":"dataset","Q28130147":"dataset","Q28130145":"dataset","Q28134034":"dataset","Q28134060":"dataset","Q28134100":"dataset","Q28134126":"dataset","Q4179738":"song","Q26829682":"webpage","Q22870229":"webpage","Q22875692":"webpage","Q22876063":"webpage","Q22876332":"webpage","Q25737003":"webpage","Q25830508":"webpage","Q57971242":"webpage","Q5611964":"webpage","Q5613278":"webpage","Q5615491":"webpage","Q5618337":"webpage","Q5620523":"webpage","Q5621344":"webpage","Q5622928":"webpage","Q5624848":"webpage","Q5626725":"webpage","Q5636579":"webpage","Q5827463":"webpage","Q5904431":"webpage","Q5911510":"webpage","Q6072180":"webpage","Q6232685":"webpage","Q6305829":"webpage","Q6372354":"webpage","Q6419146":"webpage","Q6499145":"webpage","Q6584170":"webpage","Q6584434":"webpage","Q6606549":"webpage","Q6622740":"webpage","Q6632234":"webpage","Q7241821":"webpage","Q7485705":"webpage","Q8784047":"webpage","Q10560362":"webpage","Q10584970":"webpage","Q10712699":"webpage","Q10730006":"webpage","Q10805463":"webpage","Q10992965":"webpage","Q11011669":"webpage","Q11052053":"webpage","Q11223110":"webpage","Q11839555":"webpage","Q12930680":"webpage","Q13383621":"webpage","Q13394564":"webpage","Q13492790":"webpage","Q13512760":"webpage","Q13763959":"webpage","Q14335223":"webpage","Q14336297":"webpage","Q14336339":"webpage","Q14358273":"webpage","Q14358335":"webpage","Q14358826":"webpage","Q14358898":"webpage","Q14358899":"webpage","Q14396951":"webpage","Q14404469":"webpage","Q14445515":"webpage","Q22867433":"webpage","Q15709178":"webpage","Q17615621":"webpage","Q18340985":"webpage","Q18881752":"webpage","Q22668105":"webpage","Q22706969":"webpage","Q22830149":"webpage","Q22834716":"webpage","Q22834726":"webpage","Q22838914":"webpage","Q22844738":"webpage","Q22846593":"webpage","Q22846942":"webpage","Q22846954":"webpage","Q22846964":"webpage","Q22858302":"webpage","Q22862005":"webpage","Q22867722":"webpage","Q22869003":"webpage","Q33130924":"motion_picture","Q30415057":"webpage","Q55648788":"webpage","Q4663903":"webpage","Q21528878":"webpage","Q22247630":"webpage","Q249083":"dataset","Q1750705":"dataset","Q955185":"dataset","Q1326107":"dataset","Q1520639":"dataset","Q2943040":"dataset","Q6404298":"dataset","Q7248117":"dataset","Q7674850":"dataset","Q29057009":"webpage","Q35250433":"webpage","Q35779580":"webpage","Q47382471":"webpage","Q47524402":"webpage","Q54734643":"webpage","Q58573615":"webpage","Q61866692":"webpage","Q8615872":"webpage","Q21286738":"webpage","Q21469493":"webpage","Q21479588":"webpage","Q23841178":"webpage","Q24571886":"webpage","Q26211786":"dataset","Q28368760":"webpage","Q28373483":"webpage","Q849666":"motion_picture","Q18089617":"motion_picture","Q18889701":"dataset","Q20010800":"webpage","Q163126":"dataset","Q1967745":"dataset","Q2122972":"dataset","Q2565860":"dataset","Q3516420":"dataset","Q13331174":"webpage","Q15088954":"dataset","Q15885744":"dataset","Q16069643":"dataset","Q17146890":"dataset","Q18435139":"dataset","Q20107258":"dataset","Q23894246":"webpage","Q57733325":"dataset","Q17175676":"motion_picture","Q26196748":"motion_picture","Q21484471":"webpage","Q265147":"song","Q56558213":"song","Q627181":"song","Q1151259":"song","Q7023411":"song","Q190635":"dataset","Q526334":"dataset","Q1982918":"dataset","Q2362354":"dataset","Q22842824":"webpage","Q3129804":"motion_picture","Q22677515":"webpage","Q48552277":"webpage","Q56876519":"webpage","Q11753321":"webpage","Q15671253":"webpage","Q20769160":"webpage","Q24731821":"webpage","Q26142649":"webpage","Q36330215":"webpage","Q6306272":"webpage","Q14385296":"webpage","Q14403646":"webpage","Q20107493":"dataset","Q20743001":"webpage","Q14460829":"webpage","Q11643859":"song","Q16141944":"song","Q17990546":"song","Q20043946":"song","Q44292661":"webpage","Q29075123":"webpage","Q40218570":"webpage","Q910144":"dataset","Q5622823":"webpage","Q13565583":"webpage","Q19648608":"webpage","Q19915239":"dataset","Q21278897":"webpage","Q21441359":"dataset","Q21441363":"dataset","Q23841351":"webpage","Q26932615":"webpage","Q26961029":"webpage","Q27949687":"webpage","Q27949697":"webpage","Q28858528":"webpage","Q29075121":"webpage","Q922853":"song","Q3879286":"song","Q3368338":"dataset","Q10997407":"webpage","Q19842659":"webpage","Q56062113":"webpage"}

},{}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = void 0;

const parse = input => input.match(/\/(Q\d+)(?:[#?/]|\s*$)/)[1];

exports.parse = parse;
},{}],91:[function(require,module,exports){
"use strict";

require("whatwg-fetch");

var _core = require("@citation-js/core");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const CSL_BASE_URL = 'cdn.jsdelivr.net/gh/citation-style-language';
const CONFIG = document.currentScript.dataset;

async function get(url) {
  return (await fetch(url)).text();
}

function getOpts(options, prefix) {
  return Object.keys(options).reduce((output, key) => {
    if (key.slice(0, prefix.length) === prefix) {
      let option = key.slice(prefix.length);
      option = option[0].toLowerCase() + option.slice(1);
      output[option] = options[key] === 'false' ? false : options[key];
    }

    return output;
  }, {});
}

window.addEventListener('load', function () {
  const inputOptions = getOpts(CONFIG, 'input');
  const pluginConfig = getOpts(CONFIG, 'plugin');

  for (let plugin of _core.plugins.list()) {
    const config = _core.plugins.config.get(plugin);

    if (config) {
      Object.assign(config, getOpts(pluginConfig, plugin.slice(1)));
    }
  }

  const elements = document.getElementsByClassName('citation-js');
  Array.prototype.map.call(elements, async function (element) {
    const format = element.dataset.outputFormat || 'bibliography';

    const options = _objectSpread({}, getOpts(element.dataset, 'output'), {
      format: 'html'
    });

    try {
      const csl = _core.plugins.config.get('@csl');

      if (options.template && !csl.templates.has(options.template)) {
        csl.templates.add(options.template, (await get(`https://${CSL_BASE_URL}/styles@master/${options.template}.csl`)));
      }

      if (options.lang && !csl.locales.has(options.lang)) {
        csl.locales.add(options.lang, (await get(`https://${CSL_BASE_URL}/locales@master/${options.lang}.csl`)));
      }
    } catch (e) {
      console.error(e);
    }

    const data = await _core.Cite.async(element.dataset.input || element, inputOptions);
    const output = data.format(format, options); // Only remove children after all other code has run, so that if there's an error
    // the DOM still has the 'fallback', whatever that is

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    element.insertAdjacentHTML('beforeend', output);
  });
});
},{"@citation-js/core":"citation-js","whatwg-fetch":103}],92:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],93:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":92,"buffer":93,"ieee754":95}],94:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    var copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        Buffer.from(buf).copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (var i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":92,"buffer":93,"ieee754":95}],95:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],96:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":104}],97:[function(require,module,exports){
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory) /* global define */
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.moo = factory()
  }
}(this, function() {
  'use strict';

  var hasOwnProperty = Object.prototype.hasOwnProperty
  var toString = Object.prototype.toString
  var hasSticky = typeof new RegExp().sticky === 'boolean'

  /***************************************************************************/

  function isRegExp(o) { return o && toString.call(o) === '[object RegExp]' }
  function isObject(o) { return o && typeof o === 'object' && !isRegExp(o) && !Array.isArray(o) }

  function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
  function reGroups(s) {
    var re = new RegExp('|' + s)
    return re.exec('').length - 1
  }
  function reCapture(s) {
    return '(' + s + ')'
  }
  function reUnion(regexps) {
    if (!regexps.length) return '(?!)'
    var source =  regexps.map(function(s) {
      return "(?:" + s + ")"
    }).join('|')
    return "(?:" + source + ")"
  }

  function regexpOrLiteral(obj) {
    if (typeof obj === 'string') {
      return '(?:' + reEscape(obj) + ')'

    } else if (isRegExp(obj)) {
      // TODO: consider /u support
      if (obj.ignoreCase) throw new Error('RegExp /i flag not allowed')
      if (obj.global) throw new Error('RegExp /g flag is implied')
      if (obj.sticky) throw new Error('RegExp /y flag is implied')
      if (obj.multiline) throw new Error('RegExp /m flag is implied')
      return obj.source

    } else {
      throw new Error('Not a pattern: ' + obj)
    }
  }

  function objectToRules(object) {
    var keys = Object.getOwnPropertyNames(object)
    var result = []
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var thing = object[key]
      var rules = [].concat(thing)
      if (key === 'include') {
        for (var j = 0; j < rules.length; j++) {
          result.push({include: rules[j]})
        }
        continue
      }
      var match = []
      rules.forEach(function(rule) {
        if (isObject(rule)) {
          if (match.length) result.push(ruleOptions(key, match))
          result.push(ruleOptions(key, rule))
          match = []
        } else {
          match.push(rule)
        }
      })
      if (match.length) result.push(ruleOptions(key, match))
    }
    return result
  }

  function arrayToRules(array) {
    var result = []
    for (var i = 0; i < array.length; i++) {
      var obj = array[i]
      if (obj.include) {
        var include = [].concat(obj.include)
        for (var j = 0; j < include.length; j++) {
          result.push({include: include[j]})
        }
        continue
      }
      if (!obj.type) {
        throw new Error('Rule has no type: ' + JSON.stringify(obj))
      }
      result.push(ruleOptions(obj.type, obj))
    }
    return result
  }

  function ruleOptions(type, obj) {
    if (!isObject(obj)) {
      obj = { match: obj }
    }
    if (obj.include) {
      throw new Error('Matching rules cannot also include states')
    }

    // nb. error and fallback imply lineBreaks
    var options = {
      defaultType: type,
      lineBreaks: !!obj.error || !!obj.fallback,
      pop: false,
      next: null,
      push: null,
      error: false,
      fallback: false,
      value: null,
      type: null,
      shouldThrow: false,
    }

    // Avoid Object.assign(), so we support IE9+
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        options[key] = obj[key]
      }
    }

    // type transform cannot be a string
    if (typeof options.type === 'string' && type !== options.type) {
      throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
    }

    // convert to array
    var match = options.match
    options.match = Array.isArray(match) ? match : match ? [match] : []
    options.match.sort(function(a, b) {
      return isRegExp(a) && isRegExp(b) ? 0
           : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
    })
    return options
  }

  function toRules(spec) {
    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
  }

  var defaultErrorRule = ruleOptions('error', {lineBreaks: true, shouldThrow: true})
  function compileRules(rules, hasStates) {
    var errorRule = null
    var fast = Object.create(null)
    var fastAllowed = true
    var unicodeFlag = null
    var groups = []
    var parts = []

    // If there is a fallback rule, then disable fast matching
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].fallback) {
        fastAllowed = false
      }
    }

    for (var i = 0; i < rules.length; i++) {
      var options = rules[i]

      if (options.include) {
        // all valid inclusions are removed by states() preprocessor
        throw new Error('Inheritance is not allowed in stateless lexers')
      }

      if (options.error || options.fallback) {
        // errorRule can only be set once
        if (errorRule) {
          if (!options.fallback === !errorRule.fallback) {
            throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
          } else {
            throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
          }
        }
        errorRule = options
      }

      var match = options.match.slice()
      if (fastAllowed) {
        while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
          var word = match.shift()
          fast[word.charCodeAt(0)] = options
        }
      }

      // Warn about inappropriate state-switching options
      if (options.pop || options.push || options.next) {
        if (!hasStates) {
          throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
        }
        if (options.fallback) {
          throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
        }
      }

      // Only rules with a .match are included in the RegExp
      if (match.length === 0) {
        continue
      }
      fastAllowed = false

      groups.push(options)

      // Check unicode flag is used everywhere or nowhere
      for (var j = 0; j < match.length; j++) {
        var obj = match[j]
        if (!isRegExp(obj)) {
          continue
        }

        if (unicodeFlag === null) {
          unicodeFlag = obj.unicode
        } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
          throw new Error('If one rule is /u then all must be')
        }
      }

      // convert to RegExp
      var pat = reUnion(match.map(regexpOrLiteral))

      // validate
      var regexp = new RegExp(pat)
      if (regexp.test("")) {
        throw new Error("RegExp matches empty string: " + regexp)
      }
      var groupCount = reGroups(pat)
      if (groupCount > 0) {
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: â€¦ ) instead")
      }

      // try and detect rules matching newlines
      if (!options.lineBreaks && regexp.test('\n')) {
        throw new Error('Rule should declare lineBreaks: ' + regexp)
      }

      // store regex
      parts.push(reCapture(pat))
    }


    // If there's no fallback rule, use the sticky flag so we only look for
    // matches at the current index.
    //
    // If we don't support the sticky flag, then fake it using an irrefutable
    // match (i.e. an empty pattern).
    var fallbackRule = errorRule && errorRule.fallback
    var flags = hasSticky && !fallbackRule ? 'ym' : 'gm'
    var suffix = hasSticky || fallbackRule ? '' : '|'

    if (unicodeFlag === true) flags += "u"
    var combined = new RegExp(reUnion(parts) + suffix, flags)
    return {regexp: combined, groups: groups, fast: fast, error: errorRule || defaultErrorRule}
  }

  function compile(rules) {
    var result = compileRules(toRules(rules))
    return new Lexer({start: result}, 'start')
  }

  function checkStateGroup(g, name, map) {
    var state = g && (g.push || g.next)
    if (state && !map[state]) {
      throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
    }
    if (g && g.pop && +g.pop !== 1) {
      throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
    }
  }
  function compileStates(states, start) {
    var all = states.$all ? toRules(states.$all) : []
    delete states.$all

    var keys = Object.getOwnPropertyNames(states)
    if (!start) start = keys[0]

    var ruleMap = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      ruleMap[key] = toRules(states[key]).concat(all)
    }
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var rules = ruleMap[key]
      var included = Object.create(null)
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j]
        if (!rule.include) continue
        var splice = [j, 1]
        if (rule.include !== key && !included[rule.include]) {
          included[rule.include] = true
          var newRules = ruleMap[rule.include]
          if (!newRules) {
            throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
          }
          for (var k = 0; k < newRules.length; k++) {
            var newRule = newRules[k]
            if (rules.indexOf(newRule) !== -1) continue
            splice.push(newRule)
          }
        }
        rules.splice.apply(rules, splice)
        j--
      }
    }

    var map = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      map[key] = compileRules(ruleMap[key], true)
    }

    for (var i = 0; i < keys.length; i++) {
      var name = keys[i]
      var state = map[name]
      var groups = state.groups
      for (var j = 0; j < groups.length; j++) {
        checkStateGroup(groups[j], name, map)
      }
      var fastKeys = Object.getOwnPropertyNames(state.fast)
      for (var j = 0; j < fastKeys.length; j++) {
        checkStateGroup(state.fast[fastKeys[j]], name, map)
      }
    }

    return new Lexer(map, start)
  }

  function keywordTransform(map) {
    var reverseMap = Object.create(null)
    var byLength = Object.create(null)
    var types = Object.getOwnPropertyNames(map)
    for (var i = 0; i < types.length; i++) {
      var tokenType = types[i]
      var item = map[tokenType]
      var keywordList = Array.isArray(item) ? item : [item]
      keywordList.forEach(function(keyword) {
        (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword)
        if (typeof keyword !== 'string') {
          throw new Error("keyword must be string (in keyword '" + tokenType + "')")
        }
        reverseMap[keyword] = tokenType
      })
    }

    // fast string lookup
    // https://jsperf.com/string-lookups
    function str(x) { return JSON.stringify(x) }
    var source = ''
    source += 'switch (value.length) {\n'
    for (var length in byLength) {
      var keywords = byLength[length]
      source += 'case ' + length + ':\n'
      source += 'switch (value) {\n'
      keywords.forEach(function(keyword) {
        var tokenType = reverseMap[keyword]
        source += 'case ' + str(keyword) + ': return ' + str(tokenType) + '\n'
      })
      source += '}\n'
    }
    source += '}\n'
    return Function('value', source) // type
  }

  /***************************************************************************/

  var Lexer = function(states, state) {
    this.startState = state
    this.states = states
    this.buffer = ''
    this.stack = []
    this.reset()
  }

  Lexer.prototype.reset = function(data, info) {
    this.buffer = data || ''
    this.index = 0
    this.line = info ? info.line : 1
    this.col = info ? info.col : 1
    this.queuedToken = info ? info.queuedToken : null
    this.queuedThrow = info ? info.queuedThrow : null
    this.setState(info ? info.state : this.startState)
    this.stack = info && info.stack ? info.stack.slice() : []
    return this
  }

  Lexer.prototype.save = function() {
    return {
      line: this.line,
      col: this.col,
      state: this.state,
      stack: this.stack.slice(),
      queuedToken: this.queuedToken,
      queuedThrow: this.queuedThrow,
    }
  }

  Lexer.prototype.setState = function(state) {
    if (!state || this.state === state) return
    this.state = state
    var info = this.states[state]
    this.groups = info.groups
    this.error = info.error
    this.re = info.regexp
    this.fast = info.fast
  }

  Lexer.prototype.popState = function() {
    this.setState(this.stack.pop())
  }

  Lexer.prototype.pushState = function(state) {
    this.stack.push(this.state)
    this.setState(state)
  }

  var eat = hasSticky ? function(re, buffer) { // assume re is /y
    return re.exec(buffer)
  } : function(re, buffer) { // assume re is /g
    var match = re.exec(buffer)
    // will always match, since we used the |(?:) trick
    if (match[0].length === 0) {
      return null
    }
    return match
  }

  Lexer.prototype._getGroup = function(match) {
    var groupCount = this.groups.length
    for (var i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return this.groups[i]
      }
    }
    throw new Error('Cannot find token type for matched text')
  }

  function tokenToString() {
    return this.value
  }

  Lexer.prototype.next = function() {
    var index = this.index

    // If a fallback token matched, we don't need to re-run the RegExp
    if (this.queuedGroup) {
      var token = this._token(this.queuedGroup, this.queuedText, index)
      this.queuedGroup = null
      this.queuedText = ""
      return token
    }

    var buffer = this.buffer
    if (index === buffer.length) {
      return // EOF
    }

    // Fast matching for single characters
    var group = this.fast[buffer.charCodeAt(index)]
    if (group) {
      return this._token(group, buffer.charAt(index), index)
    }

    // Execute RegExp
    var re = this.re
    re.lastIndex = index
    var match = eat(re, buffer)

    // Error tokens match the remaining buffer
    var error = this.error
    if (match == null) {
      return this._token(error, buffer.slice(index, buffer.length), index)
    }

    var group = this._getGroup(match)
    var text = match[0]

    if (error.fallback && match.index !== index) {
      this.queuedGroup = group
      this.queuedText = text

      // Fallback tokens contain the unmatched portion of the buffer
      return this._token(error, buffer.slice(index, match.index), index)
    }

    return this._token(group, text, index)
  }

  Lexer.prototype._token = function(group, text, offset) {
    // count line breaks
    var lineBreaks = 0
    if (group.lineBreaks) {
      var matchNL = /\n/g
      var nl = 1
      if (text === '\n') {
        lineBreaks = 1
      } else {
        while (matchNL.exec(text)) { lineBreaks++; nl = matchNL.lastIndex }
      }
    }

    var token = {
      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
      value: typeof group.value === 'function' ? group.value(text) : text,
      text: text,
      toString: tokenToString,
      offset: offset,
      lineBreaks: lineBreaks,
      line: this.line,
      col: this.col,
    }
    // nb. adding more props to token object will make V8 sad!

    var size = text.length
    this.index += size
    this.line += lineBreaks
    if (lineBreaks !== 0) {
      this.col = size - nl + 1
    } else {
      this.col += size
    }

    // throw, if no rule with {error: true}
    if (group.shouldThrow) {
      throw new Error(this.formatError(token, "invalid syntax"))
    }

    if (group.pop) this.popState()
    else if (group.push) this.pushState(group.push)
    else if (group.next) this.setState(group.next)

    return token
  }

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    var LexerIterator = function(lexer) {
      this.lexer = lexer
    }

    LexerIterator.prototype.next = function() {
      var token = this.lexer.next()
      return {value: token, done: !token}
    }

    LexerIterator.prototype[Symbol.iterator] = function() {
      return this
    }

    Lexer.prototype[Symbol.iterator] = function() {
      return new LexerIterator(this)
    }
  }

  Lexer.prototype.formatError = function(token, message) {
    if (token == null) {
      // An undefined token indicates EOF
      var text = this.buffer.slice(this.index)
      var token = {
        text: text,
        offset: this.index,
        lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
        line: this.line,
        col: this.col,
      }
    }
    var start = Math.max(0, token.offset - token.col + 1)
    var eol = token.lineBreaks ? token.text.indexOf('\n') : token.text.length
    var firstLine = this.buffer.substring(start, token.offset + eol)
    message += " at line " + token.line + " col " + token.col + ":\n\n"
    message += "  " + firstLine + "\n"
    message += "  " + Array(token.col).join(" ") + "^"
    return message
  }

  Lexer.prototype.clone = function() {
    return new Lexer(this.states, this.state)
  }

  Lexer.prototype.has = function(tokenType) {
    return true
  }


  return {
    compile: compile,
    states: compileStates,
    error: Object.freeze({error: true}),
    fallback: Object.freeze({fallback: true}),
    keywords: keywordTransform,
  }

}));

},{}],98:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],99:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],100:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],101:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":99,"./encode":100}],102:[function(require,module,exports){
/* eslint-env browser */

const { Buffer } = require('buffer/')

function syncFetch (...args) {
  const [url, opts] = parseArgs(...args)

  const xhr = new XMLHttpRequest()
  xhr.withCredentials = opts.credentials === 'include'
  xhr.timeout = opts.timeout

  // Request
  xhr.open(opts.method || 'GET', url, false)

  try {
    xhr.responseType = 'arraybuffer'
  } catch (e) {
    // not in Worker scope
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType#Synchronous_XHR_restrictions
  }

  for (const header of opts.headers) {
    xhr.setRequestHeader(...header)
  }

  xhr.send(opts.body || null)

  // Response
  let headers = xhr.getAllResponseHeaders()
  headers = headers && headers.split('\r\n').filter(Boolean).map(header => header.split(': ', 2))

  return new syncFetch.Response(xhr.response, {
    url: xhr.responseURL,
    status: xhr.status,
    statusText: xhr.statusText,
    headers,
    redirected: xhr.responseURL !== url
  })
}

function parseArgs (resource, init) {
  const request = []

  if (resource instanceof syncFetch.Request) {
    request.push(resource.url)
    request.push({
      method: resource.method,
      headers: resource.headers,
      body: resource.body
    })
  } else {
    request.push(resource, {})
  }

  Object.assign(request[1], init)

  request[1].headers = new syncFetch.Headers(request[1].headers || {})

  return request
}

const INTERNALS = Symbol('SyncFetch Internals')

class SyncRequest extends Request {
  constructor (resource, init = {}, body = init.body) {
    super(resource, init)
    this[INTERNALS] = {
      body: body ? Buffer.from(body) : null
    }
  }

  clone () {
    checkBody(this)
    return new SyncRequest(this.url, this)
  }
}

class SyncResponse extends Response {
  constructor (body, init = {}) {
    body = body ? Buffer.from(body) : null
    super(createStream(body), init)
    this[INTERNALS] = {
      url: init.url,
      redirected: init.redirected,
      body
    }
  }

  get url () {
    return this[INTERNALS].url
  }

  get redirected () {
    return this[INTERNALS].redirected
  }

  clone () {
    checkBody(this)
    return new SyncResponse(this[INTERNALS].body, {
      url: this.url,
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
      redirected: this.redirected
    })
  }
}

class Body {
  constructor (body) {
    this[INTERNALS] = {
      body: Buffer.from(body)
    }
  }

  static mixin (prototype) {
    for (const name of Object.getOwnPropertyNames(Body.prototype)) {
      if (name === 'constructor') { continue }
      const desc = Object.getOwnPropertyDescriptor(Body.prototype, name)
      Object.defineProperty(prototype, name, { ...desc, enumerable: true })
    }
  }

  arrayBuffer () {
    checkBody(this)
    const buffer = consumeBody(this)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }

  blob () {
    checkBody(this)
    const type = this.headers && this.headers.get('content-type')
    return new Blob([consumeBody(this)], type && { type })
  }

  text () {
    checkBody(this)
    return consumeBody(this).toString()
  }

  json () {
    checkBody(this)
    try {
      return JSON.parse(consumeBody(this).toString())
    } catch (err) {
      throw new TypeError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
    }
  }

  buffer () {
    checkBody(this)
    return consumeBody(this).clone()
  }
}

function checkBody (body) {
  if (body.bodyUsed) {
    throw new TypeError(`body used already for: ${body.url}`)
  }
}

function consumeBody (body) {
  _super(body, 'arrayBuffer')()
  return body[INTERNALS].body || Buffer.alloc(0)
}

function _super (self, method) {
  return Object.getPrototypeOf(Object.getPrototypeOf(self))[method].bind(self)
}

function createStream (body) {
  return new ReadableStream({
    start (controller) {
      controller.enqueue(body)
      controller.close()
    }
  })
}

Body.mixin(SyncRequest.prototype)
Body.mixin(SyncResponse.prototype)

syncFetch.Headers = self.Headers
syncFetch.Request = SyncRequest
syncFetch.Response = SyncResponse
module.exports = syncFetch

},{"buffer/":94}],103:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],104:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof self !== 'undefined' && self) ||
    (typeof global !== 'undefined' && global);

  var support = {
    searchParams: 'URLSearchParams' in global,
    iterable: 'Symbol' in global && 'iterator' in Symbol,
    blob:
      'FileReader' in global &&
      'Blob' in global &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in global,
    arrayBuffer: 'ArrayBuffer' in global
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      /*
        fetch-mock wraps the Response object in an ES6 Proxy to
        provide useful test harness features such as flush. However, on
        ES5 browsers without fetch or Proxy support pollyfills must be used;
        the proxy-pollyfill is unable to proxy an attribute unless it exists
        on the object before the Proxy is created. This change ensures
        Response.bodyUsed exists on the instance, while maintaining the
        semantic of setting Request.bodyUsed in the constructor before
        _initBody is called.
      */
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          var isConsumed = consumed(this);
          if (isConsumed) {
            return isConsumed
          }
          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(
              this._bodyArrayBuffer.buffer.slice(
                this._bodyArrayBuffer.byteOffset,
                this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
              )
            )
          } else {
            return Promise.resolve(this._bodyArrayBuffer)
          }
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }

    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        // Search for a '_' parameter in the query string
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          // If it already exists then set the value with the current time
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          // Otherwise add a new '_' parameter to the end with the current time
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
    // https://github.com/github/fetch/issues/748
    // https://github.com/zloirock/core-js/issues/751
    preProcessedHeaders
      .split('\r')
      .map(function(header) {
        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
      })
      .forEach(function(line) {
        var parts = line.split(':');
        var key = parts.shift().trim();
        if (key) {
          var value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
    }
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : '';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = global.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          resolve(new Response(body, options));
        }, 0);
      };

      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError('Network request failed'));
        }, 0);
      };

      xhr.onabort = function() {
        setTimeout(function() {
          reject(new exports.DOMException('Aborted', 'AbortError'));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && global.location.href ? global.location.href : url
        } catch (e) {
          return url
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (
          support.arrayBuffer &&
          request.headers.get('Content-Type') &&
          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
        ) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
      } else {
        request.headers.forEach(function(value, name) {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],105:[function(require,module,exports){
const toDateObject = require('./wikibase_time_to_date_object')

const helpers = {}
helpers.isNumericId = id => /^[1-9][0-9]*$/.test(id)
helpers.isEntityId = id => /^((Q|P|L)[1-9][0-9]*|L[1-9][0-9]*-(F|S)[1-9][0-9]*)$/.test(id)
helpers.isItemId = id => /^Q[1-9][0-9]*$/.test(id)
helpers.isPropertyId = id => /^P[1-9][0-9]*$/.test(id)
helpers.isLexemeId = id => /^L[1-9][0-9]*$/.test(id)
helpers.isFormId = id => /^L[1-9][0-9]*-F[1-9][0-9]*$/.test(id)
helpers.isSenseId = id => /^L[1-9][0-9]*-S[1-9][0-9]*$/.test(id)
helpers.isGuid = guid => /^((Q|P|L)[1-9][0-9]*|L[1-9][0-9]*-(F|S)[1-9][0-9]*)\$[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guid)
helpers.isHash = hash => /^[0-9a-f]{40}$/.test(hash)
helpers.isPropertyClaimsId = id => {
  const [ entityId, propertyId ] = id.split('#')
  return helpers.isEntityId(entityId) && helpers.isPropertyId(propertyId)
}
helpers.isRevisionId = id => /^\d+$/.test(id)

helpers.isEntityPageTitle = title => {
  if (typeof title !== 'string') return false
  var [ namespace, id ] = title.split(':')
  if (namespace && id) {
    return isEntityNamespace(namespace) && helpers[`is${namespace}Id`](id)
  } else {
    id = namespace
    return helpers.isItemId(id)
  }
}

const entityNamespaces = [ 'Item', 'Property', 'Lexeme' ]

const isEntityNamespace = str => entityNamespaces.includes(str)

const isNonNestedEntityId = id => /^(Q|P|L)[1-9][0-9]*$/.test(id)

helpers.getNumericId = id => {
  if (!isNonNestedEntityId(id)) throw new Error(`invalid entity id: ${id}`)
  return id.replace(/^(Q|P|L)/, '')
}

helpers.wikibaseTimeToDateObject = toDateObject

// Try to parse the date or return the input
const bestEffort = fn => value => {
  try {
    return fn(value)
  } catch (err) {
    value = value.time || value

    const sign = value[0]
    let [ yearMonthDay, withinDay ] = value.slice(1).split('T')
    yearMonthDay = yearMonthDay.replace(/-00/g, '-01')

    return `${sign}${yearMonthDay}T${withinDay}`
  }
}

const toEpochTime = wikibaseTime => toDateObject(wikibaseTime).getTime()
const toISOString = wikibaseTime => toDateObject(wikibaseTime).toISOString()

// A date format that knows just three precisions:
// 'yyyy', 'yyyy-mm', and 'yyyy-mm-dd' (including negative and non-4 digit years)
// Should be able to handle the old and the new Wikidata time:
// - in the old one, units below the precision where set to 00
// - in the new one, those months and days are set to 01 in those cases,
//   so when we can access the full claim object, we check the precision
//   to recover the old format
const toSimpleDay = wikibaseTime => {
  // Also accept claim datavalue.value objects, and actually prefer those,
  // as we can check the precision
  if (typeof wikibaseTime === 'object') {
    const { time, precision } = wikibaseTime
    // Year precision
    if (precision === 9) wikibaseTime = time.replace('-01-01T', '-00-00T')
    // Month precision
    else if (precision === 10) wikibaseTime = time.replace('-01T', '-00T')
    else wikibaseTime = time
  }

  return wikibaseTime.split('T')[0]
  // Remove positive years sign
  .replace(/^\+/, '')
  // Remove years padding zeros
  .replace(/^(-?)0+/, '$1')
  // Remove days if not included in the Wikidata date precision
  .replace(/-00$/, '')
  // Remove months if not included in the Wikidata date precision
  .replace(/-00$/, '')
}

helpers.wikibaseTimeToEpochTime = bestEffort(toEpochTime)
helpers.wikibaseTimeToISOString = bestEffort(toISOString)
helpers.wikibaseTimeToSimpleDay = bestEffort(toSimpleDay)

helpers.getImageUrl = (filename, width) => {
  var url = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`
  if (typeof width === 'number') url += `?width=${width}`
  return url
}

helpers.getEntityIdFromGuid = guid => guid.split('$')[0].toUpperCase()

module.exports = helpers

},{"./wikibase_time_to_date_object":120}],106:[function(require,module,exports){
const { wikibaseTimeToISOString, wikibaseTimeToEpochTime, wikibaseTimeToSimpleDay } = require('./helpers')

const simple = datavalue => datavalue.value

const monolingualtext = (datavalue, options) => {
  return options.keepRichValues ? datavalue.value : datavalue.value.text
}

const entity = (datavalue, options) => prefixedId(datavalue, options.entityPrefix)

const entityLetter = {
  item: 'Q',
  lexeme: 'L',
  property: 'P'
}

const prefixedId = (datavalue, prefix) => {
  const { value } = datavalue
  const id = value.id || entityLetter[value['entity-type']] + value['numeric-id']
  return typeof prefix === 'string' ? `${prefix}:${id}` : id
}

const quantity = (datavalue, options) => {
  const { value } = datavalue
  const amount = parseFloat(value.amount)
  if (options.keepRichValues) {
    const richValue = {
      amount: parseFloat(value.amount),
      // ex: http://www.wikidata.org/entity/
      unit: value.unit.replace(/^https?:\/\/.*\/entity\//, '')
    }
    if (value.upperBound != null) richValue.upperBound = parseFloat(value.upperBound)
    if (value.lowerBound != null) richValue.lowerBound = parseFloat(value.lowerBound)
    return richValue
  } else {
    return amount
  }
}

const coordinate = (datavalue, options) => {
  if (options.keepRichValues) {
    return datavalue.value
  } else {
    return [ datavalue.value.latitude, datavalue.value.longitude ]
  }
}

const time = (datavalue, options) => {
  var timeValue
  if (typeof options.timeConverter === 'function') {
    timeValue = options.timeConverter(datavalue.value)
  } else {
    timeValue = getTimeConverter(options.timeConverter)(datavalue.value)
  }
  if (options.keepRichValues) {
    const { timezone, before, after, precision, calendarmodel } = datavalue.value
    return { time: timeValue, timezone, before, after, precision, calendarmodel }
  } else {
    return timeValue
  }
}

const getTimeConverter = (key = 'iso') => {
  const converter = timeConverters[key]
  if (!converter) throw new Error(`invalid converter key: ${JSON.stringify(key).substring(0, 100)}`)
  return converter
}

// Each time converter should be able to accept 2 keys of arguments:
// - either datavalue.value objects (prefered as it gives access to the precision)
// - or the time string (datavalue.value.time)
const timeConverters = {
  iso: wikibaseTimeToISOString,
  epoch: wikibaseTimeToEpochTime,
  'simple-day': wikibaseTimeToSimpleDay,
  none: wikibaseTime => wikibaseTime.time || wikibaseTime
}

const parsers = {
  commonsMedia: simple,
  'external-id': simple,
  'geo-shape': simple,
  'globe-coordinate': coordinate,
  math: simple,
  monolingualtext,
  'musical-notation': simple,
  quantity,
  string: simple,
  'tabular-data': simple,
  time,
  url: simple,
  'wikibase-entityid': entity,
  'wikibase-form': entity,
  'wikibase-item': entity,
  'wikibase-lexeme': entity,
  'wikibase-property': entity,
  'wikibase-sense': entity
}

module.exports = {
  parsers,
  parse: (datatype, datavalue, options, claimId) => {
    // Known case of missing datatype: form.claims, sense.claims
    datatype = datatype || datavalue.type

    try {
      return parsers[datatype](datavalue, options)
    } catch (err) {
      if (err.message === 'parsers[datatype] is not a function') {
        err.message = `${datatype} claim parser isn't implemented
        Claim id: ${claimId}
        Please report to https://github.com/maxlath/wikibase-sdk/issues`
      }
      throw err
    }
  }
}

},{"./helpers":105}],107:[function(require,module,exports){
const { simplifyEntity } = require('./simplify_entity')

module.exports = {
  wd: {
    entities: res => {
      res = res.body || res
      const { entities } = res
      Object.keys(entities).forEach(entityId => {
        entities[entityId] = simplifyEntity(entities[entityId])
      })
      return entities
    }
  }
}

},{"./simplify_entity":111}],108:[function(require,module,exports){
const truthyPropertyClaims = propClaims => {
  const aggregate = propClaims.reduce(aggregatePerRank, {})
  // on truthyness: https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#Truthy_statements
  return aggregate.preferred || aggregate.normal || []
}

const aggregatePerRank = (aggregate, claim) => {
  const { rank } = claim
  aggregate[rank] || (aggregate[rank] = [])
  aggregate[rank].push(claim)
  return aggregate
}

const truthyClaims = claims => {
  const truthClaimsOnly = {}
  Object.keys(claims).forEach(property => {
    truthClaimsOnly[property] = truthyPropertyClaims(claims[property])
  })
  return truthClaimsOnly
}

module.exports = { truthyClaims, truthyPropertyClaims }

},{}],109:[function(require,module,exports){
const { labels, descriptions, aliases, lemmas, glosses } = require('./simplify_text_attributes')

const {
  simplifyClaim: claim,
  simplifyPropertyClaims: propertyClaims,
  simplifyClaims: claims,
  simplifyQualifier: qualifier,
  simplifyPropertyQualifiers: propertyQualifiers,
  simplifyQualifiers: qualifiers
} = require('./simplify_claims')

const { simplifyForm: form, simplifyForms: forms } = require('./simplify_forms')
const { simplifySense: sense, simplifySenses: senses } = require('./simplify_senses')

const sitelinks = require('./simplify_sitelinks')
const sparqlResults = require('./simplify_sparql_results')

module.exports = {
  labels,
  descriptions,
  aliases,
  claim,
  propertyClaims,
  claims,
  qualifier,
  propertyQualifiers,
  qualifiers,
  sitelinks,

  // Aliases
  snak: claim,
  propertySnaks: propertyClaims,
  snaks: claims,

  // Lexemes
  lemmas,
  glosses,
  form,
  forms,
  sense,
  senses,

  sparqlResults

  // Set in ./simplify_entity
  // entity,
  // entities,
}

},{"./simplify_claims":110,"./simplify_forms":112,"./simplify_senses":113,"./simplify_sitelinks":114,"./simplify_sparql_results":115,"./simplify_text_attributes":116}],110:[function(require,module,exports){
const { parse: parseClaim } = require('./parse_claim')
const { uniq } = require('../utils/utils')
const { truthyPropertyClaims } = require('./rank')

// Expects an entity 'claims' object
// Ex: entity.claims
const simplifyClaims = (claims, ...options) => {
  const { propertyPrefix } = parseOptions(options)
  const simpleClaims = {}
  for (let id in claims) {
    const propClaims = claims[id]
    if (propertyPrefix) {
      id = propertyPrefix + ':' + id
    }
    simpleClaims[id] = simplifyPropertyClaims(propClaims, ...options)
  }
  return simpleClaims
}

// Expects the 'claims' array of a particular property
// Ex: entity.claims.P369
const simplifyPropertyClaims = (propClaims, ...options) => {
  // Avoid to throw on empty inputs to allow to simplify claims array
  // without having to know if the entity as claims for this property
  // Ex: simplifyPropertyClaims(entity.claims.P124211616)
  if (propClaims == null || propClaims.length === 0) return []

  const { keepNonTruthy, areSubSnaks } = parseOptions(options)
  if (!(keepNonTruthy || areSubSnaks)) {
    propClaims = truthyPropertyClaims(propClaims)
  }

  propClaims = propClaims
    .map(claim => simplifyClaim(claim, ...options))
    // Filter-out novalue and somevalue claims,
    // unless a novalueValue or a somevalueValue is passed in options
    .filter(defined)

  // Deduplicate values unless we return a rich value object
  if (propClaims[0] && typeof propClaims[0] !== 'object') {
    return uniq(propClaims)
  } else {
    return propClaims
  }
}

// Considers null as defined
const defined = obj => obj !== undefined

// Expects a single claim object
// Ex: entity.claims.P369[0]
const simplifyClaim = (claim, ...options) => {
  options = parseOptions(options)
  const { keepQualifiers, keepReferences, keepIds, keepHashes, keepTypes, keepSnaktypes, keepRanks } = parseKeepOptions(options)

  // tries to replace wikidata deep claim object by a simple value
  // e.g. a string, an entity Qid or an epoch time number
  const { mainsnak, rank } = claim

  var value, datatype, datavalue, snaktype, isQualifierSnak, isReferenceSnak
  if (mainsnak) {
    datatype = mainsnak.datatype
    datavalue = mainsnak.datavalue
    snaktype = mainsnak.snaktype
  } else {
    // Qualifiers have no mainsnak, and define datatype, datavalue on claim
    datavalue = claim.datavalue
    datatype = claim.datatype
    snaktype = claim.snaktype
    // Duck typing the sub-snak type
    if (claim.hash) isQualifierSnak = true
    else isReferenceSnak = true
  }

  if (datavalue) {
    value = parseClaim(datatype, datavalue, options, claim.id)
  } else {
    if (snaktype === 'somevalue') value = options.somevalueValue
    else if (snaktype === 'novalue') value = options.novalueValue
    else throw new Error('no datavalue or special snaktype found')
  }

  // Qualifiers should not attempt to keep sub-qualifiers or references
  if (isQualifierSnak) {
    if (!(keepHashes || keepTypes || keepSnaktypes)) return value

    const valueObj = { value }

    if (keepHashes) valueObj.hash = claim.hash
    if (keepTypes) valueObj.type = datatype
    if (keepSnaktypes) valueObj.snaktype = snaktype

    return valueObj
  }
  if (isReferenceSnak) {
    if (!keepTypes) return value

    return { type: datatype, value }
  }
  // No need to test keepHashes as it has no effect if neither
  // keepQualifiers or keepReferences is true
  if (!(keepQualifiers || keepReferences || keepIds || keepTypes || keepSnaktypes || keepRanks)) {
    return value
  }

  // When keeping qualifiers or references, the value becomes an object
  // instead of a direct value
  const valueObj = { value }

  if (keepTypes) valueObj.type = datatype

  if (keepSnaktypes) valueObj.snaktype = snaktype

  if (keepRanks) valueObj.rank = rank

  const subSnaksOptions = getSubSnakOptions(options)
  subSnaksOptions.keepHashes = keepHashes

  if (keepQualifiers) {
    valueObj.qualifiers = simplifyClaims(claim.qualifiers, subSnaksOptions)
  }

  if (keepReferences) {
    claim.references = claim.references || []
    valueObj.references = claim.references.map(refRecord => {
      const snaks = simplifyClaims(refRecord.snaks, subSnaksOptions)
      if (keepHashes) return { snaks, hash: refRecord.hash }
      else return snaks
    })
  }

  if (keepIds) valueObj.id = claim.id

  return valueObj
}

const parseOptions = options => {
  if (options == null) return {}

  if (options[0] && typeof options[0] === 'object') return options[0]

  // Legacy interface
  var [ entityPrefix, propertyPrefix, keepQualifiers ] = options
  return { entityPrefix, propertyPrefix, keepQualifiers }
}

const simplifyQualifiers = (claims, options) => {
  return simplifyClaims(claims, getSubSnakOptions(options))
}

const simplifyPropertyQualifiers = (propClaims, options) => {
  return simplifyPropertyClaims(propClaims, getSubSnakOptions(options))
}

// Using a new object so that the original options object isn't modified
const getSubSnakOptions = options => {
  return Object.assign({}, options, { areSubSnaks: true })
}

const keepOptions = [ 'keepQualifiers', 'keepReferences', 'keepIds', 'keepHashes', 'keepTypes', 'keepSnaktypes', 'keepRanks', 'keepRichValues' ]

const parseKeepOptions = options => {
  if (options.keepAll) {
    keepOptions.forEach(optionName => {
      if (options[optionName] == null) options[optionName] = true
    })
  }
  return options
}

module.exports = {
  simplifyClaims,
  simplifyPropertyClaims,
  simplifyClaim,
  simplifyQualifiers,
  simplifyPropertyQualifiers,
  simplifyQualifier: simplifyClaim
}

},{"../utils/utils":131,"./parse_claim":106,"./rank":108}],111:[function(require,module,exports){
const simplify = require('./simplify')

const simplifyEntity = (entity, options) => {
  const { type } = entity
  const simplified = {
    id: entity.id,
    type,
    modified: entity.modified
  }

  if (entity.datatype) simplified.datatype = entity.datatype

  if (type === 'item') {
    simplifyIfDefined(entity, simplified, 'labels')
    simplifyIfDefined(entity, simplified, 'descriptions')
    simplifyIfDefined(entity, simplified, 'aliases')
    simplifyIfDefined(entity, simplified, 'claims', options)
    simplifyIfDefined(entity, simplified, 'sitelinks', options)
  } else if (type === 'property') {
    simplified.datatype = entity.datatype
    simplifyIfDefined(entity, simplified, 'labels')
    simplifyIfDefined(entity, simplified, 'descriptions')
    simplifyIfDefined(entity, simplified, 'aliases')
    simplifyIfDefined(entity, simplified, 'claims', options)
  } else if (type === 'lexeme') {
    simplifyIfDefined(entity, simplified, 'lemmas')
    simplified.lexicalCategory = entity.lexicalCategory
    simplified.language = entity.language
    simplifyIfDefined(entity, simplified, 'claims', options)
    simplifyIfDefined(entity, simplified, 'forms', options)
    simplifyIfDefined(entity, simplified, 'senses', options)
  }

  return simplified
}

const simplifyIfDefined = (entity, simplified, attribute, options) => {
  if (entity[attribute] != null) {
    simplified[attribute] = simplify[attribute](entity[attribute], options)
  }
}

const simplifyEntities = (entities, options = {}) => {
  if (entities.entities) entities = entities.entities
  const { entityPrefix } = options
  return Object.keys(entities).reduce((obj, key) => {
    const entity = entities[key]
    if (entityPrefix) key = `${entityPrefix}:${key}`
    obj[key] = simplifyEntity(entity, options)
    return obj
  }, {})
}

// Set those here instead of in ./simplify to avoid a circular dependency
simplify.entity = simplifyEntity
simplify.entities = simplifyEntities

module.exports = { simplifyEntity, simplifyEntities }

},{"./simplify":109}],112:[function(require,module,exports){
const { isFormId } = require('./helpers')
const { representations: simplifyRepresentations } = require('./simplify_text_attributes')
const { simplifyClaims } = require('./simplify_claims')

const simplifyForm = (form, options) => {
  const { id, representations, grammaticalFeatures, claims } = form
  if (!isFormId(id)) throw new Error('invalid form object')
  return {
    id,
    representations: simplifyRepresentations(representations),
    grammaticalFeatures,
    claims: simplifyClaims(claims, options)
  }
}

const simplifyForms = (forms, options) => forms.map(form => simplifyForm(form, options))

module.exports = { simplifyForm, simplifyForms }

},{"./helpers":105,"./simplify_claims":110,"./simplify_text_attributes":116}],113:[function(require,module,exports){
const { isSenseId } = require('./helpers')
const { glosses: simplifyGlosses } = require('./simplify_text_attributes')
const { simplifyClaims } = require('./simplify_claims')

const simplifySense = (sense, options) => {
  const { id, glosses, claims } = sense
  if (!isSenseId(id)) throw new Error('invalid sense object')
  return {
    id,
    glosses: simplifyGlosses(glosses),
    claims: simplifyClaims(claims, options)
  }
}

const simplifySenses = (senses, options) => senses.map(sense => simplifySense(sense, options))

module.exports = { simplifySense, simplifySenses }

},{"./helpers":105,"./simplify_claims":110,"./simplify_text_attributes":116}],114:[function(require,module,exports){
const { getSitelinkUrl } = require('./sitelinks')

module.exports = (sitelinks, options = {}) => {
  const { addUrl } = options
  return Object.keys(sitelinks).reduce(aggregateValues(sitelinks, addUrl), {})
}

const aggregateValues = (sitelinks, addUrl) => (index, key) => {
  const { title } = sitelinks[key]
  if (addUrl) {
    index[key] = { title, url: getSitelinkUrl(key, title) }
  } else {
    index[key] = title
  }
  return index
}

},{"./sitelinks":117}],115:[function(require,module,exports){
module.exports = (input, options = {}) => {
  if (typeof input === 'string') input = JSON.parse(input)

  const { vars } = input.head
  const results = input.results.bindings

  if (vars.length === 1 && options.minimize === true) {
    const varName = vars[0]
    return results
    .map(result => parseValue(result[varName]))
    // filtering-out bnodes
    .filter(result => result != null)
  }

  const { richVars, associatedVars, standaloneVars } = identifyVars(vars)
  return results.map(getSimplifiedResult(richVars, associatedVars, standaloneVars))
}

const parseValue = valueObj => {
  if (!(valueObj)) return
  var { datatype } = valueObj
  datatype = datatype && datatype.replace('http://www.w3.org/2001/XMLSchema#', '')
  const parser = parsers[valueObj.type] || getDatatypesParsers(datatype)
  return parser(valueObj)
}

const parsers = {
  uri: valueObj => parseUri(valueObj.value),
  // blank nodes will be filtered-out in order to get things simple
  bnode: () => null
}

const numberParser = valueObj => parseFloat(valueObj.value)

const getDatatypesParsers = datatype => {
  datatype = datatype && datatype.replace('http://www.w3.org/2001/XMLSchema#', '')
  return datatypesParsers[datatype] || passValue
}

const datatypesParsers = {
  decimal: numberParser,
  integer: numberParser,
  float: numberParser,
  double: numberParser,
  boolean: valueObj => valueObj.value === 'true'
}

// return the raw value if the datatype is missing
const passValue = valueObj => valueObj.value

const parseUri = uri => {
  // ex: http://www.wikidata.org/entity/statement/
  if (uri.match(/http.*\/entity\/statement\//)) {
    return convertStatementUriToGuid(uri)
  }

  return uri
  // ex: http://www.wikidata.org/entity/
  .replace(/^https?:\/\/.*\/entity\//, '')
  // ex: http://www.wikidata.org/prop/direct/
  .replace(/^https?:\/\/.*\/prop\/direct\//, '')
}

const convertStatementUriToGuid = uri => {
  // ex: http://www.wikidata.org/entity/statement/
  uri = uri.replace(/^https?:\/\/.*\/entity\/statement\//, '')
  const parts = uri.split('-')
  return parts[0] + '$' + parts.slice(1).join('-')
}

const identifyVars = vars => {
  const richVars = vars.filter(varName => vars.some(isAssociatedVar(varName)))
  const associatedVarPattern = new RegExp(`^(${richVars.join('|')})[A-Z]`)
  const associatedVars = vars.filter(varName => associatedVarPattern.test(varName))
  const standaloneVars = vars.filter(varName => {
    return !richVars.includes(varName) && !associatedVarPattern.test(varName)
  })
  return { richVars, associatedVars, standaloneVars }
}

const isAssociatedVar = varNameA => {
  const pattern = new RegExp(`^${varNameA}[A-Z]\\w+`)
  return pattern.test.bind(pattern)
}

const getSimplifiedResult = (richVars, associatedVars, standaloneVars) => result => {
  const simplifiedResult = {}
  for (const varName of richVars) {
    const richVarData = {}
    const value = parseValue(result[varName])
    if (value != null) richVarData.value = value
    for (const associatedVarName of associatedVars) {
      if (associatedVarName.startsWith(varName)) addAssociatedValue(result, varName, associatedVarName, richVarData)
    }
    if (Object.keys(richVarData).length > 0) simplifiedResult[varName] = richVarData
  }
  for (const varName of standaloneVars) {
    simplifiedResult[varName] = parseValue(result[varName])
  }
  return simplifiedResult
}

const addAssociatedValue = (result, varName, associatedVarName, richVarData) => {
  // ex: propertyType => Type
  var shortAssociatedVarName = associatedVarName.split(varName)[1]
  // ex: Type => type
  shortAssociatedVarName = shortAssociatedVarName[0].toLowerCase() + shortAssociatedVarName.slice(1)
  // ex: altLabel => aliases
  shortAssociatedVarName = specialNames[shortAssociatedVarName] || shortAssociatedVarName
  const associatedVarData = result[associatedVarName]
  if (associatedVarData != null) richVarData[shortAssociatedVarName] = associatedVarData.value
}

const specialNames = {
  altLabel: 'aliases'
}

},{}],116:[function(require,module,exports){
const simplifyTextAttributes = multivalue => data => {
  const simplified = {}
  Object.keys(data).forEach(lang => {
    const obj = data[lang]
    if (obj != null) {
      simplified[lang] = multivalue ? obj.map(getValue) : obj.value
    } else {
      simplified[lang] = multivalue ? [] : null
    }
  })
  return simplified
}

const getValue = obj => obj.value

const singleValue = simplifyTextAttributes(false)

module.exports = {
  labels: singleValue,
  descriptions: singleValue,
  aliases: simplifyTextAttributes(true),
  lemmas: singleValue,
  representations: singleValue,
  glosses: singleValue
}

},{}],117:[function(require,module,exports){
const { fixedEncodeURIComponent, replaceSpaceByUnderscores, isPlainObject } = require('../utils/utils')
const { isPropertyId } = require('./helpers')
const wikidataBase = 'https://www.wikidata.org/wiki/'
const languages = require('./sitelinks_languages')

const getSitelinkUrl = (site, title) => {
  if (isPlainObject(site)) {
    title = site.title
    site = site.site
  }

  if (!site) throw new Error('missing a site')
  if (!title) throw new Error('missing a title')

  const shortSiteKey = site.replace(/wiki$/, '')
  const specialUrlBuilder = siteUrlBuilders[shortSiteKey] || siteUrlBuilders[site]
  if (specialUrlBuilder) return specialUrlBuilder(title)

  const { lang, project } = getSitelinkData(site)
  title = fixedEncodeURIComponent(replaceSpaceByUnderscores(title))
  return `https://${lang}.${project}.org/wiki/${title}`
}

const wikimediaSite = subdomain => title => `https://${subdomain}.wikimedia.org/wiki/${title}`

const siteUrlBuilders = {
  commons: wikimediaSite('commons'),
  mediawiki: title => `https://www.mediawiki.org/wiki/${title}`,
  meta: wikimediaSite('meta'),
  species: wikimediaSite('species'),
  wikidata: title => {
    if (isPropertyId(title)) return `${wikidataBase}Property:${title}`
    return `${wikidataBase}${title}`
  },
  wikimania: wikimediaSite('wikimania')
}

const sitelinkUrlPattern = /^https?:\/\/([\w-]{2,10})\.(\w+)\.org\/\w+\/(.*)/

const getSitelinkData = site => {
  if (site.startsWith('http')) {
    const url = site
    const matchData = url.match(sitelinkUrlPattern)
    if (!matchData) throw new Error(`invalid sitelink url: ${url}`)
    let [ lang, project, title ] = matchData.slice(1)
    title = decodeURIComponent(title)
    let key
    // Known case: wikidata, mediawiki
    if (lang === 'www') {
      lang = 'en'
      key = project
    } else if (lang === 'commons') {
      lang = 'en'
      project = key = 'commons'
    } else {
      key = `${lang}${project}`.replace('wikipedia', 'wiki')
    }
    return { lang, project, key, title, url }
  } else {
    const key = site
    const specialProjectName = specialSites[key]
    if (specialProjectName) return { lang: 'en', project: specialProjectName, key }

    const [ lang, projectSuffix, rest ] = key.split('wik')

    // Detecting cases like 'frwikiwiki' that would return [ 'fr', 'i', 'i' ]
    if (rest != null) throw new Error(`invalid sitelink key: ${key}`)

    if (languages.indexOf(lang) === -1) {
      throw new Error(`sitelink lang not found: ${lang}`)
    }

    const project = projectsBySuffix[projectSuffix]
    if (!project) throw new Error(`sitelink project not found: ${project}`)

    return { lang, project, key }
  }
}

const specialSites = {
  commonswiki: 'commons',
  mediawikiwiki: 'mediawiki',
  metawiki: 'meta',
  specieswiki: 'specieswiki',
  wikidatawiki: 'wikidata',
  wikimaniawiki: 'wikimania'
}

const isSitelinkKey = site => {
  try {
    // relies on getSitelinkData validation
    getSitelinkData(site)
    return true
  } catch (err) {
    return false
  }
}

const projectsBySuffix = {
  i: 'wikipedia',
  isource: 'wikisource',
  iquote: 'wikiquote',
  tionary: 'wiktionary',
  ibooks: 'wikibooks',
  iversity: 'wikiversity',
  ivoyage: 'wikivoyage',
  inews: 'wikinews'
}

module.exports = { getSitelinkUrl, getSitelinkData, isSitelinkKey }

},{"../utils/utils":131,"./helpers":105,"./sitelinks_languages":118}],118:[function(require,module,exports){
// Generated by 'npm run update-sitelinks-languages'
module.exports = [ 'aa', 'ab', 'ace', 'ady', 'af', 'ak', 'als', 'am', 'ang', 'an', 'arc', 'ar', 'ary', 'arz', 'ast', 'as', 'atj', 'avk', 'av', 'awa', 'ay', 'azb', 'az', 'ban', 'bar', 'bat_smg', 'ba', 'bcl', 'be_x_old', 'be', 'bg', 'bh', 'bi', 'bjn', 'bm', 'bn', 'bo', 'bpy', 'br', 'bs', 'bug', 'bxr', 'ca', 'cbk_zam', 'cdo', 'ceb', 'ce', 'cho', 'chr', 'ch', 'chy', 'ckb', 'co', 'crh', 'cr', 'csb', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'din', 'diq', 'dsb', 'dty', 'dv', 'dz', 'ee', 'el', 'eml', 'en', 'eo', 'es', 'et', 'eu', 'ext', 'fa', 'ff', 'fiu_vro', 'fi', 'fj', 'fo', 'frp', 'frr', 'fr', 'fur', 'fy', 'gag', 'gan', 'ga', 'gcr', 'gd', 'glk', 'gl', 'gn', 'gom', 'gor', 'got', 'gu', 'gv', 'hak', 'ha', 'haw', 'he', 'hif', 'hi', 'ho', 'hr', 'hsb', 'ht', 'hu', 'hy', 'hyw', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'ilo', 'inh', 'io', 'is', 'it', 'iu', 'jam', 'ja', 'jbo', 'jv', 'kaa', 'kab', 'ka', 'kbd', 'kbp', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'koi', 'ko', 'krc', 'kr', 'ksh', 'ks', 'ku', 'kv', 'kw', 'ky', 'lad', 'la', 'lbe', 'lb', 'lez', 'lfn', 'lg', 'lij', 'li', 'lld', 'lmo', 'ln', 'lo', 'lrc', 'ltg', 'lt', 'lv', 'mai', 'map_bms', 'mdf', 'mg', 'mhr', 'mh', 'min', 'mi', 'mk', 'ml', 'mn', 'mnw', 'mo', 'mrj', 'mr', 'ms', 'mt', 'mus', 'mwl', 'myv', 'my', 'mzn', 'nah', 'nap', 'na', 'nds_nl', 'nds', 'ne', 'new', 'ng', 'nl', 'nn', 'nov', 'no', 'nqo', 'nrm', 'nso', 'nv', 'ny', 'oc', 'olo', 'om', 'or', 'os', 'pag', 'pam', 'pap', 'pa', 'pcd', 'pdc', 'pfl', 'pih', 'pi', 'pl', 'pms', 'pnb', 'pnt', 'ps', 'pt', 'qu', 'rm', 'rmy', 'rn', 'roa_rup', 'roa_tara', 'ro', 'rue', 'ru', 'rw', 'sah', 'sat', 'sa', 'scn', 'sco', 'sc', 'sd', 'se', 'sg', 'shn', 'sh', 'shy', 'simple', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'srn', 'sr', 'ss', 'stq', 'st', 'su', 'sv', 'sw', 'szl', 'szy', 'ta', 'tcy', 'tet', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tpi', 'tr', 'ts', 'tt', 'tum', 'tw', 'tyv', 'ty', 'udm', 'ug', 'uk', 'ur', 'uz', 'vec', 'vep', 've', 'vi', 'vls', 'vo', 'war', 'wa', 'wo', 'wuu', 'xal', 'xh', 'xmf', 'yi', 'yo', 'yue', 'za', 'zea', 'zh_classical', 'zh_min_nan', 'zh_yue', 'zh', 'zu' ]

},{}],119:[function(require,module,exports){
const helpers = require('./helpers')

const validate = (name, testName) => value => {
  if (!helpers[testName](value)) throw new Error(`invalid ${name}: ${value}`)
}

module.exports = {
  entityId: validate('entity id', 'isEntityId'),
  propertyId: validate('property id', 'isPropertyId'),
  entityPageTitle: validate('entity page title', 'isEntityPageTitle'),
  revisionId: validate('revision id', 'isRevisionId')
}

},{"./helpers":105}],120:[function(require,module,exports){
module.exports = wikibaseTime => {
  // Also accept claim datavalue.value objects
  if (typeof wikibaseTime === 'object') {
    wikibaseTime = wikibaseTime.time
  }

  const sign = wikibaseTime[0]
  var [ yearMonthDay, withinDay ] = wikibaseTime.slice(1).split('T')

  // Wikidata generates invalid ISO dates to indicate precision
  // ex: +1990-00-00T00:00:00Z to indicate 1990 with year precision
  yearMonthDay = yearMonthDay.replace(/-00/g, '-01')
  const rest = `${yearMonthDay}T${withinDay}`

  return fullDateData(sign, rest)
}

const fullDateData = (sign, rest) => {
  const year = rest.split('-')[0]
  const needsExpandedYear = sign === '-' || year.length > 4

  return needsExpandedYear ? expandedYearDate(sign, rest, year) : new Date(rest)
}

const expandedYearDate = (sign, rest, year) => {
  var date
  // Using ISO8601 expanded notation for negative years or positive
  // years with more than 4 digits: adding up to 2 leading zeros
  // when needed. Can't find the documentation again, but testing
  // with `new Date(date)` gives a good clue of the implementation
  if (year.length === 4) {
    date = `${sign}00${rest}`
  } else if (year.length === 5) {
    date = `${sign}0${rest}`
  } else {
    date = sign + rest
  }
  return new Date(date)
}

},{}],121:[function(require,module,exports){
const { isPlainObject, forceArray, shortLang } = require('../utils/utils')
const validate = require('../helpers/validate')

module.exports = buildUrl => (ids, languages, props, format, redirects) => {
  // Polymorphism: arguments can be passed as an object keys
  if (isPlainObject(ids)) {
    ({ ids, languages, props, format, redirects } = ids)
  }

  format = format || 'json'

  // ids can't be let empty
  if (!(ids && ids.length > 0)) throw new Error('no id provided')

  // Allow to pass ids as a single string
  ids = forceArray(ids)

  ids.forEach(validate.entityId)

  if (ids.length > 50) {
    console.warn(`getEntities accepts 50 ids max to match Wikidata API limitations:
      this request won't get all the desired entities.
      You can use getManyEntities instead to generate several request urls
      to work around this limitation`)
  }

  // Properties can be either one property as a string
  // or an array or properties;
  // either case me just want to deal with arrays

  const query = {
    action: 'wbgetentities',
    ids: ids.join('|'),
    format
  }

  if (redirects === false) query.redirects = 'no'

  if (languages) {
    languages = forceArray(languages).map(shortLang)
    query.languages = languages.join('|')
  }

  if (props && props.length > 0) query.props = forceArray(props).join('|')

  return buildUrl(query)
}

},{"../helpers/validate":119,"../utils/utils":131}],122:[function(require,module,exports){
const { isPlainObject, forceArray, shortLang } = require('../utils/utils')

module.exports = buildUrl => (titles, sites, languages, props, format, redirects) => {
  // polymorphism: arguments can be passed as an object keys
  if (isPlainObject(titles)) {
    // Not using destructuring assigment there as it messes with both babel and standard
    const params = titles
    titles = params.titles
    sites = params.sites
    languages = params.languages
    props = params.props
    format = params.format
    redirects = params.redirects
  }

  format = format || 'json'

  // titles cant be let empty
  if (!(titles && titles.length > 0)) throw new Error('no titles provided')
  // default to the English Wikipedia
  if (!(sites && sites.length > 0)) sites = [ 'enwiki' ]

  // Properties can be either one property as a string
  // or an array or properties;
  // either case me just want to deal with arrays
  titles = forceArray(titles)
  sites = forceArray(sites).map(parseSite)
  props = forceArray(props)

  const query = {
    action: 'wbgetentities',
    titles: titles.join('|'),
    sites: sites.join('|'),
    format
  }

  // Normalizing only works if there is only one site and title
  if (sites.length === 1 && titles.length === 1) {
    query.normalize = true
  }

  if (languages) {
    languages = forceArray(languages).map(shortLang)
    query.languages = languages.join('|')
  }

  if (props && props.length > 0) query.props = props.join('|')

  if (redirects === false) query.redirects = 'no'

  return buildUrl(query)
}

// convert 2 letters language code to Wikipedia sitelinks code
const parseSite = site => site.length === 2 ? `${site}wiki` : site

},{"../utils/utils":131}],123:[function(require,module,exports){
const validate = require('../helpers/validate')
const { isPlainObject } = require('../utils/utils')

module.exports = instance => (id, revision) => {
  if (isPlainObject(id)) {
    revision = id.revision
    id = id.id
  }
  validate.entityId(id)
  validate.revisionId(revision)
  return `${instance}/w/index.php?title=Special:EntityData/${id}.json&revision=${revision}`
}

},{"../helpers/validate":119,"../utils/utils":131}],124:[function(require,module,exports){
const { isPlainObject } = require('../utils/utils')

module.exports = buildUrl => {
  const getEntities = require('./get_entities')(buildUrl)
  return (ids, languages, props, format, redirects) => {
    // Polymorphism: arguments can be passed as an object keys
    if (isPlainObject(ids)) {
      ({ ids, languages, props, format, redirects } = ids)
    }

    if (!(ids instanceof Array)) throw new Error('getManyEntities expects an array of ids')

    return getIdsGroups(ids)
    .map(idsGroup => getEntities(idsGroup, languages, props, format, redirects))
  }
}

const getIdsGroups = ids => {
  const groups = []
  while (ids.length > 0) {
    const group = ids.slice(0, 50)
    ids = ids.slice(50)
    groups.push(group)
  }
  return groups
}

},{"../utils/utils":131,"./get_entities":121}],125:[function(require,module,exports){
const { forceArray } = require('../utils/utils')
const { isItemId } = require('../helpers/helpers')
const validate = require('../helpers/validate')

// Fiter-out properties. Can't be filtered by
// `?subject a wikibase:Item`, as those triples are omitted
// https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#WDQS_data_differences
const itemsOnly = 'FILTER NOT EXISTS { ?subject rdf:type wikibase:Property . } '

module.exports = sparqlEndpoint => {
  const sparqlQuery = require('./sparql_query')(sparqlEndpoint)
  return (property, value, options = {}) => {
    var { limit, caseInsensitive, keepProperties } = options
    const valueFn = caseInsensitive ? caseInsensitiveValueQuery : directValueQuery
    const filter = keepProperties ? '' : itemsOnly

    // Allow to request values for several properties at once
    var properties = forceArray(property)
    properties.forEach(validate.propertyId)
    properties = properties.map(prefixifyProperty).join('|')

    const valueBlock = getValueBlock(value, valueFn, properties, filter)
    var sparql = `SELECT DISTINCT ?subject WHERE { ${valueBlock} }`
    if (limit) sparql += ` LIMIT ${limit}`
    return sparqlQuery(sparql)
  }
}

const getValueBlock = (value, valueFn, properties, filter) => {
  if (!(value instanceof Array)) {
    return valueFn(properties, getValueString(value), filter)
  }

  const valuesBlocks = value
    .map(getValueString)
    .map(valStr => valueFn(properties, valStr, filter))

  return '{ ' + valuesBlocks.join('} UNION {') + ' }'
}

const getValueString = value => {
  if (isItemId(value)) {
    value = `wd:${value}`
  } else if (typeof value === 'string') {
    value = `'${value}'`
  }
  return value
}

const directValueQuery = (properties, value, filter, limit) => {
  return `?subject ${properties} ${value} .
    ${filter}`
}

// Discussion on how to make this query optimal:
// http://stackoverflow.com/q/43073266/3324977
const caseInsensitiveValueQuery = (properties, value, filter, limit) => {
  return `?subject ${properties} ?value .
    FILTER (lcase(?value) = ${value.toLowerCase()})
    ${filter}`
}

const prefixifyProperty = property => 'wdt:' + property

},{"../helpers/helpers":105,"../helpers/validate":119,"../utils/utils":131,"./sparql_query":128}],126:[function(require,module,exports){
const { forceArray } = require('../utils/utils')
const validate = require('../helpers/validate')

module.exports = buildUrl => (ids, options = {}) => {
  ids = forceArray(ids)
  ids.forEach(validate.entityPageTitle)

  const uniqueId = ids.length === 1
  const query = {
    action: 'query',
    prop: 'revisions'
  }

  query.titles = ids.join('|')
  query.format = options.format || 'json'
  if (uniqueId) query.rvlimit = options.limit || 'max'
  if (uniqueId && options.start) query.rvstart = getEpochSeconds(options.start)
  if (uniqueId && options.end) query.rvend = getEpochSeconds(options.end)

  const { prop, user, excludeuser, tag } = options
  if (prop) query.rvprop = forceArray(prop).join('|')
  if (user) query.rvuser = user
  if (excludeuser) query.rvexcludeuser = excludeuser
  if (tag) query.rvtag = tag

  return buildUrl(query)
}

const getEpochSeconds = date => {
  // Return already formatted epoch seconds:
  // if a date in milliseconds appear to be earlier than 2000-01-01, that's probably
  // already seconds actually
  if (typeof date === 'number' && date < earliestPointInMs) return date
  return Math.trunc(new Date(date).getTime() / 1000)
}

const earliestPointInMs = new Date('2000-01-01').getTime()

},{"../helpers/validate":119,"../utils/utils":131}],127:[function(require,module,exports){
const { isPlainObject } = require('../utils/utils')
const types = [ 'item', 'property', 'lexeme', 'form', 'sense' ]

module.exports = buildUrl => (search, language, limit, format, uselang) => {
  // Using the variable 'offset' instead of 'continue' as the later is a reserved word
  var type, offset

  // polymorphism: arguments can be passed as an object keys
  if (isPlainObject(search)) {
    // Not using destructuring assigment there as it messes with both babel and standard
    const params = search
    search = params.search
    language = params.language
    limit = params.limit
    offset = params.continue
    format = params.format
    uselang = params.uselang
    type = params.type
  }

  if (!(search && search.length > 0)) throw new Error("search can't be empty")

  language = language || 'en'
  uselang = uselang || language
  limit = limit || '20'
  format = format || 'json'
  type = type || 'item'
  offset = offset || '0'

  if (!types.includes(type)) throw new Error(`invalid type: ${type}`)

  return buildUrl({
    action: 'wbsearchentities',
    search,
    language,
    limit,
    continue: offset,
    format,
    uselang,
    type
  })
}

},{"../utils/utils":131}],128:[function(require,module,exports){
const { fixedEncodeURIComponent } = require('../utils/utils')

module.exports = sparqlEndpoint => sparql => {
  const query = fixedEncodeURIComponent(sparql)
  return `${sparqlEndpoint}?format=json&query=${query}`
}

},{"../utils/utils":131}],129:[function(require,module,exports){
const isBrowser = typeof location !== 'undefined' && typeof document !== 'undefined'
const qs = isBrowser ? require('./querystring_lite') : require('querystring')

module.exports = instanceApiEndpoint => queryObj => {
  // Request CORS headers if the request is made from a browser
  // See https://www.wikidata.org/w/api.php ('origin' parameter)
  if (isBrowser) queryObj.origin = '*'
  return instanceApiEndpoint + '?' + qs.stringify(queryObj)
}

},{"./querystring_lite":130,"querystring":101}],130:[function(require,module,exports){
module.exports = {
  stringify: queryObj => {
    var qstring = ''
    for (const key in queryObj) {
      const value = queryObj[key]
      if (value) qstring += `&${key}=${value}`
    }

    qstring = qstring.slice(1)

    // encodeURI should be accessible in a browser environment
    // otherwise if neither node.js querystring nor encodeURI
    // are accessible, just return the string
    if (encodeURI) return encodeURI(qstring)
    return qstring
  }
}

},{}],131:[function(require,module,exports){
module.exports = {
  // Ex: keep only 'fr' in 'fr_FR'
  shortLang: language => language.toLowerCase().split('_')[0],

  // a polymorphism helper:
  // accept either a string or an array and return an array
  forceArray: array => {
    if (typeof array === 'string') array = [ array ]
    return array || []
  },

  // simplistic implementation to filter-out arrays
  isPlainObject: obj => {
    if (!obj || typeof obj !== 'object' || obj instanceof Array) return false
    return true
  },

  // encodeURIComponent ignores !, ', (, ), and *
  // cf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Description
  fixedEncodeURIComponent: str => {
    return encodeURIComponent(str).replace(/[!'()*]/g, encodeCharacter)
  },

  replaceSpaceByUnderscores: str => str.replace(/\s/g, '_'),

  uniq: array => Array.from(new Set(array))
}

const encodeCharacter = char => '%' + char.charCodeAt(0).toString(16)

},{}],132:[function(require,module,exports){
const { isPlainObject } = require('./utils/utils')

const simplify = require('./helpers/simplify')
const parse = require('./helpers/parse_responses')
const helpers = require('./helpers/helpers')
const sitelinksHelpers = require('../lib/helpers/sitelinks')
const rankHelpers = require('../lib/helpers/rank')
const tip = `Tip: if you just want to access functions that don't need an instance or a sparqlEndpoint,
those are also exposed directly on the module object. Exemple:
const { isItemId, simplify } = require('wikibase-sdk')`

const common = Object.assign({ simplify, parse }, helpers, sitelinksHelpers, rankHelpers)

const WBK = function (config) {
  if (!isPlainObject(config)) throw new Error('invalid config')
  const { instance, sparqlEndpoint } = config

  if (!(instance || sparqlEndpoint)) {
    throw new Error(`one of instance or sparqlEndpoint should be set at initialization.\n${tip}`)
  }

  var wikibaseApiFunctions, instanceRoot, instanceApiEndpoint
  if (instance) {
    validateEndpoint('instance', instance)

    instanceRoot = instance
      .replace(/\/$/, '')
      .replace('/w/api.php', '')

    instanceApiEndpoint = `${instanceRoot}/w/api.php`

    const buildUrl = require('./utils/build_url')(instanceApiEndpoint)

    wikibaseApiFunctions = {
      searchEntities: require('./queries/search_entities')(buildUrl),
      getEntities: require('./queries/get_entities')(buildUrl),
      getManyEntities: require('./queries/get_many_entities')(buildUrl),
      getRevisions: require('./queries/get_revisions')(buildUrl),
      getEntityRevision: require('./queries/get_entity_revision')(instance),
      getEntitiesFromSitelinks: require('./queries/get_entities_from_sitelinks')(buildUrl)
    }
  } else {
    wikibaseApiFunctions = {
      searchEntities: missingInstance('searchEntities'),
      getEntities: missingInstance('getEntities'),
      getManyEntities: missingInstance('getManyEntities'),
      getRevisions: missingInstance('getRevisions'),
      getEntityRevision: missingInstance('getEntityRevision'),
      getEntitiesFromSitelinks: missingInstance('getEntitiesFromSitelinks')
    }
  }

  var wikibaseQueryServiceFunctions
  if (sparqlEndpoint) {
    validateEndpoint('sparqlEndpoint', sparqlEndpoint)
    wikibaseQueryServiceFunctions = {
      sparqlQuery: require('./queries/sparql_query')(sparqlEndpoint),
      getReverseClaims: require('./queries/get_reverse_claims')(sparqlEndpoint)
    }
  } else {
    wikibaseQueryServiceFunctions = {
      sparqlQuery: missingSparqlEndpoint('sparqlQuery'),
      getReverseClaims: missingSparqlEndpoint('getReverseClaims')
    }
  }

  const parsedData = {
    instance: {
      root: instanceRoot,
      apiEndpoint: instanceApiEndpoint
    }
  }

  return Object.assign(parsedData, common, wikibaseApiFunctions, wikibaseQueryServiceFunctions)
}

// Make heplpers that don't require an instance to be specified available
// directly on the exported function object
Object.assign(WBK, common)

const validateEndpoint = (name, url) => {
  if (!(typeof url === 'string' && url.startsWith('http'))) {
    throw new Error(`invalid ${name}: ${url}`)
  }
}

const missingConfig = missingParameter => name => () => {
  throw new Error(`${name} requires ${missingParameter} to be set at initialization`)
}

const missingSparqlEndpoint = missingConfig('a sparqlEndpoint')
const missingInstance = missingConfig('an instance')

module.exports = WBK

},{"../lib/helpers/rank":108,"../lib/helpers/sitelinks":117,"./helpers/helpers":105,"./helpers/parse_responses":107,"./helpers/simplify":109,"./queries/get_entities":121,"./queries/get_entities_from_sitelinks":122,"./queries/get_entity_revision":123,"./queries/get_many_entities":124,"./queries/get_reverse_claims":125,"./queries/get_revisions":126,"./queries/search_entities":127,"./queries/sparql_query":128,"./utils/build_url":129,"./utils/utils":131}],133:[function(require,module,exports){
module.exports = require('wikibase-sdk')({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})

},{"wikibase-sdk":132}],134:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var i, key, len, output, prefix, value, willBeInlined;
    if (inline == null) {
      inline = 0;
    }
    if (indent == null) {
      indent = 0;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    output = '';
    prefix = (indent ? Utils.strRepeat(' ', indent) : '');
    if (inline <= 0 || typeof input !== 'object' || input instanceof Date || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      if (input instanceof Array) {
        for (i = 0, len = input.length; i < len; i++) {
          value = input[i];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + '-' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      } else {
        for (key in input) {
          value = input[key];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      }
    }
    return output;
  };

  return Dumper;

})();

module.exports = Dumper;

},{"./Inline":139,"./Utils":143}],135:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Escaper, Pattern;

Pattern = require('./Pattern');

Escaper = (function() {
  var ch;

  function Escaper() {}

  Escaper.LIST_ESCAPEES = ['\\', '\\\\', '\\"', '"', "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", (ch = String.fromCharCode)(0x0085), ch(0x00A0), ch(0x2028), ch(0x2029)];

  Escaper.LIST_ESCAPED = ['\\\\', '\\"', '\\"', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];

  Escaper.MAPPING_ESCAPEES_TO_ESCAPED = (function() {
    var i, j, mapping, ref;
    mapping = {};
    for (i = j = 0, ref = Escaper.LIST_ESCAPEES.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      mapping[Escaper.LIST_ESCAPEES[i]] = Escaper.LIST_ESCAPED[i];
    }
    return mapping;
  })();

  Escaper.PATTERN_CHARACTERS_TO_ESCAPE = new Pattern('[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9');

  Escaper.PATTERN_MAPPING_ESCAPEES = new Pattern(Escaper.LIST_ESCAPEES.join('|').split('\\').join('\\\\'));

  Escaper.PATTERN_SINGLE_QUOTING = new Pattern('[\\s\'":{}[\\],&*#?]|^[-?|<>=!%@`]');

  Escaper.requiresDoubleQuoting = function(value) {
    return this.PATTERN_CHARACTERS_TO_ESCAPE.test(value);
  };

  Escaper.escapeWithDoubleQuotes = function(value) {
    var result;
    result = this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
    return '"' + result + '"';
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace(/'/g, "''") + "'";
  };

  return Escaper;

})();

module.exports = Escaper;

},{"./Pattern":141}],136:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var DumpException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DumpException = (function(superClass) {
  extend(DumpException, superClass);

  function DumpException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  DumpException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<DumpException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<DumpException> ' + this.message;
    }
  };

  return DumpException;

})(Error);

module.exports = DumpException;

},{}],137:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var ParseException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseException = (function(superClass) {
  extend(ParseException, superClass);

  function ParseException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseException> ' + this.message;
    }
  };

  return ParseException;

})(Error);

module.exports = ParseException;

},{}],138:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var ParseMore,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseMore = (function(superClass) {
  extend(ParseMore, superClass);

  function ParseMore(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseMore.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseMore> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseMore> ' + this.message;
    }
  };

  return ParseMore;

})(Error);

module.exports = ParseMore;

},{}],139:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var DumpException, Escaper, Inline, ParseException, ParseMore, Pattern, Unescaper, Utils,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Pattern = require('./Pattern');

Unescaper = require('./Unescaper');

Escaper = require('./Escaper');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

DumpException = require('./Exception/DumpException');

Inline = (function() {
  function Inline() {}

  Inline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

  Inline.PATTERN_TRAILING_COMMENTS = new Pattern('^\\s*#.*$');

  Inline.PATTERN_QUOTED_SCALAR = new Pattern('^' + Inline.REGEX_QUOTED_STRING);

  Inline.PATTERN_THOUSAND_NUMERIC_SCALAR = new Pattern('^(-|\\+)?[0-9,]+(\\.[0-9]+)?$');

  Inline.PATTERN_SCALAR_BY_DELIMITERS = {};

  Inline.settings = {};

  Inline.configure = function(exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = null;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
  };

  Inline.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var context, result;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
    if (value == null) {
      return '';
    }
    value = Utils.trim(value);
    if (0 === value.length) {
      return '';
    }
    context = {
      exceptionOnInvalidType: exceptionOnInvalidType,
      objectDecoder: objectDecoder,
      i: 0
    };
    switch (value.charAt(0)) {
      case '[':
        result = this.parseSequence(value, context);
        ++context.i;
        break;
      case '{':
        result = this.parseMapping(value, context);
        ++context.i;
        break;
      default:
        result = this.parseScalar(value, null, ['"', "'"], context);
    }
    if (this.PATTERN_TRAILING_COMMENTS.replace(value.slice(context.i), '') !== '') {
      throw new ParseException('Unexpected characters near "' + value.slice(context.i) + '".');
    }
    return result;
  };

  Inline.dump = function(value, exceptionOnInvalidType, objectEncoder) {
    var ref, result, type;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    if (value == null) {
      return 'null';
    }
    type = typeof value;
    if (type === 'object') {
      if (value instanceof Date) {
        return value.toISOString();
      } else if (objectEncoder != null) {
        result = objectEncoder(value);
        if (typeof result === 'string' || (result != null)) {
          return result;
        }
      }
      return this.dumpObject(value);
    }
    if (type === 'boolean') {
      return (value ? 'true' : 'false');
    }
    if (Utils.isDigits(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseInt(value)));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseFloat(value)));
    }
    if (type === 'number') {
      return (value === 2e308 ? '.Inf' : (value === -2e308 ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return Escaper.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((ref = value.toLowerCase()) === 'null' || ref === '~' || ref === 'true' || ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var j, key, len1, output, val;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (j = 0, len1 = value.length; j < len1; j++) {
        val = value[j];
        output.push(this.dump(val));
      }
      return '[' + output.join(', ') + ']';
    } else {
      output = [];
      for (key in value) {
        val = value[key];
        output.push(this.dump(key) + ': ' + this.dump(val));
      }
      return '{' + output.join(', ') + '}';
    }
  };

  Inline.parseScalar = function(scalar, delimiters, stringDelimiters, context, evaluate) {
    var i, joinedDelimiters, match, output, pattern, ref, ref1, strpos, tmp;
    if (delimiters == null) {
      delimiters = null;
    }
    if (stringDelimiters == null) {
      stringDelimiters = ['"', "'"];
    }
    if (context == null) {
      context = null;
    }
    if (evaluate == null) {
      evaluate = true;
    }
    if (context == null) {
      context = {
        exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
        objectDecoder: this.settings.objectDecoder,
        i: 0
      };
    }
    i = context.i;
    if (ref = scalar.charAt(i), indexOf.call(stringDelimiters, ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(ref1 = tmp.charAt(0), indexOf.call(delimiters, ref1) >= 0)) {
          throw new ParseException('Unexpected characters (' + scalar.slice(i) + ').');
        }
      }
    } else {
      if (!delimiters) {
        output = scalar.slice(i);
        i += output.length;
        strpos = output.indexOf(' #');
        if (strpos !== -1) {
          output = Utils.rtrim(output.slice(0, strpos));
        }
      } else {
        joinedDelimiters = delimiters.join('|');
        pattern = this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters];
        if (pattern == null) {
          pattern = new Pattern('^(.+?)(' + joinedDelimiters + ')');
          this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters] = pattern;
        }
        if (match = pattern.exec(scalar.slice(i))) {
          output = match[1];
          i += output.length;
        } else {
          throw new ParseException('Malformed inline YAML string (' + scalar + ').');
        }
      }
      if (evaluate) {
        output = this.evaluateScalar(output, context);
      }
    }
    context.i = i;
    return output;
  };

  Inline.parseQuotedScalar = function(scalar, context) {
    var i, match, output;
    i = context.i;
    if (!(match = this.PATTERN_QUOTED_SCALAR.exec(scalar.slice(i)))) {
      throw new ParseMore('Malformed inline YAML string (' + scalar.slice(i) + ').');
    }
    output = match[0].substr(1, match[0].length - 2);
    if ('"' === scalar.charAt(i)) {
      output = Unescaper.unescapeDoubleQuotedString(output);
    } else {
      output = Unescaper.unescapeSingleQuotedString(output);
    }
    i += match[0].length;
    context.i = i;
    return output;
  };

  Inline.parseSequence = function(sequence, context) {
    var e, i, isQuoted, len, output, ref, value;
    output = [];
    len = sequence.length;
    i = context.i;
    i += 1;
    while (i < len) {
      context.i = i;
      switch (sequence.charAt(i)) {
        case '[':
          output.push(this.parseSequence(sequence, context));
          i = context.i;
          break;
        case '{':
          output.push(this.parseMapping(sequence, context));
          i = context.i;
          break;
        case ']':
          return output;
        case ',':
        case ' ':
        case "\n":
          break;
        default:
          isQuoted = ((ref = sequence.charAt(i)) === '"' || ref === "'");
          value = this.parseScalar(sequence, [',', ']'], ['"', "'"], context);
          i = context.i;
          if (!isQuoted && typeof value === 'string' && (value.indexOf(': ') !== -1 || value.indexOf(":\n") !== -1)) {
            try {
              value = this.parseMapping('{' + value + '}');
            } catch (error) {
              e = error;
            }
          }
          output.push(value);
          --i;
      }
      ++i;
    }
    throw new ParseMore('Malformed inline YAML string ' + sequence);
  };

  Inline.parseMapping = function(mapping, context) {
    var done, i, key, len, output, shouldContinueWhileLoop, value;
    output = {};
    len = mapping.length;
    i = context.i;
    i += 1;
    shouldContinueWhileLoop = false;
    while (i < len) {
      context.i = i;
      switch (mapping.charAt(i)) {
        case ' ':
        case ',':
        case "\n":
          ++i;
          context.i = i;
          shouldContinueWhileLoop = true;
          break;
        case '}':
          return output;
      }
      if (shouldContinueWhileLoop) {
        shouldContinueWhileLoop = false;
        continue;
      }
      key = this.parseScalar(mapping, [':', ' ', "\n"], ['"', "'"], context, false);
      i = context.i;
      done = false;
      while (i < len) {
        context.i = i;
        switch (mapping.charAt(i)) {
          case '[':
            value = this.parseSequence(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case '{':
            value = this.parseMapping(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case ':':
          case ' ':
          case "\n":
            break;
          default:
            value = this.parseScalar(mapping, [',', '}'], ['"', "'"], context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            --i;
        }
        ++i;
        if (done) {
          break;
        }
      }
    }
    throw new ParseMore('Malformed inline YAML string ' + mapping);
  };

  Inline.evaluateScalar = function(scalar, context) {
    var cast, date, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
    scalar = Utils.trim(scalar);
    scalarLower = scalar.toLowerCase();
    switch (scalarLower) {
      case 'null':
      case '':
      case '~':
        return null;
      case 'true':
        return true;
      case 'false':
        return false;
      case '.inf':
        return 2e308;
      case '.nan':
        return 0/0;
      case '-.inf':
        return 2e308;
      default:
        firstChar = scalarLower.charAt(0);
        switch (firstChar) {
          case '!':
            firstSpace = scalar.indexOf(' ');
            if (firstSpace === -1) {
              firstWord = scalarLower;
            } else {
              firstWord = scalarLower.slice(0, firstSpace);
            }
            switch (firstWord) {
              case '!':
                if (firstSpace !== -1) {
                  return parseInt(this.parseScalar(scalar.slice(2)));
                }
                return null;
              case '!str':
                return Utils.ltrim(scalar.slice(4));
              case '!!str':
                return Utils.ltrim(scalar.slice(5));
              case '!!int':
                return parseInt(this.parseScalar(scalar.slice(5)));
              case '!!bool':
                return Utils.parseBoolean(this.parseScalar(scalar.slice(6)), false);
              case '!!float':
                return parseFloat(this.parseScalar(scalar.slice(7)));
              case '!!timestamp':
                return Utils.stringToDate(Utils.ltrim(scalar.slice(11)));
              default:
                if (context == null) {
                  context = {
                    exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                    objectDecoder: this.settings.objectDecoder,
                    i: 0
                  };
                }
                objectDecoder = context.objectDecoder, exceptionOnInvalidType = context.exceptionOnInvalidType;
                if (objectDecoder) {
                  trimmedScalar = Utils.rtrim(scalar);
                  firstSpace = trimmedScalar.indexOf(' ');
                  if (firstSpace === -1) {
                    return objectDecoder(trimmedScalar, null);
                  } else {
                    subValue = Utils.ltrim(trimmedScalar.slice(firstSpace + 1));
                    if (!(subValue.length > 0)) {
                      subValue = null;
                    }
                    return objectDecoder(trimmedScalar.slice(0, firstSpace), subValue);
                  }
                }
                if (exceptionOnInvalidType) {
                  throw new ParseException('Custom object support when parsing a YAML file has been disabled.');
                }
                return null;
            }
            break;
          case '0':
            if ('0x' === scalar.slice(0, 2)) {
              return Utils.hexDec(scalar);
            } else if (Utils.isDigits(scalar)) {
              return Utils.octDec(scalar);
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else {
              return scalar;
            }
            break;
          case '+':
            if (Utils.isDigits(scalar)) {
              raw = scalar;
              cast = parseInt(raw);
              if (raw === String(cast)) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === String(cast)) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          default:
            if (date = Utils.stringToDate(scalar)) {
              return date;
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
        }
    }
  };

  return Inline;

})();

module.exports = Inline;

},{"./Escaper":135,"./Exception/DumpException":136,"./Exception/ParseException":137,"./Exception/ParseMore":138,"./Pattern":141,"./Unescaper":142,"./Utils":143}],140:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Inline, ParseException, ParseMore, Parser, Pattern, Utils;

Inline = require('./Inline');

Pattern = require('./Pattern');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

Parser = (function() {
  Parser.prototype.PATTERN_FOLDED_SCALAR_ALL = new Pattern('^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_END = new Pattern('(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_SEQUENCE_ITEM = new Pattern('^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_ANCHOR_VALUE = new Pattern('^&(?<ref>[^ ]+) *(?<value>.*)');

  Parser.prototype.PATTERN_COMPACT_NOTATION = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_MAPPING_ITEM = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_DECIMAL = new Pattern('\\d+');

  Parser.prototype.PATTERN_INDENT_SPACES = new Pattern('^ +');

  Parser.prototype.PATTERN_TRAILING_LINES = new Pattern('(\n*)$');

  Parser.prototype.PATTERN_YAML_HEADER = new Pattern('^\\%YAML[: ][\\d\\.]+.*\n', 'm');

  Parser.prototype.PATTERN_LEADING_COMMENTS = new Pattern('^(\\#.*?\n)+', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_START = new Pattern('^\\-\\-\\-.*?\n', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_END = new Pattern('^\\.\\.\\.\\s*$', 'm');

  Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};

  Parser.prototype.CONTEXT_NONE = 0;

  Parser.prototype.CONTEXT_SEQUENCE = 1;

  Parser.prototype.CONTEXT_MAPPING = 2;

  function Parser(offset) {
    this.offset = offset != null ? offset : 0;
    this.lines = [];
    this.currentLineNb = -1;
    this.currentLine = '';
    this.refs = {};
  }

  Parser.prototype.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, j, k, key, l, lastKey, len, len1, len2, len3, lineCount, m, matches, mergeNode, n, name, parsed, parsedItem, parser, ref, ref1, ref2, refName, refValue, val, values;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.currentLineNb = -1;
    this.currentLine = '';
    this.lines = this.cleanup(value).split("\n");
    data = null;
    context = this.CONTEXT_NONE;
    allowOverwrite = false;
    while (this.moveToNextLine()) {
      if (this.isCurrentLineEmpty()) {
        continue;
      }
      if ("\t" === this.currentLine[0]) {
        throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      isRef = mergeNode = false;
      if (values = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
        if (this.CONTEXT_MAPPING === context) {
          throw new ParseException('You cannot define a sequence item when in a mapping');
        }
        context = this.CONTEXT_SEQUENCE;
        if (data == null) {
          data = [];
        }
        if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            data.push(parser.parse(this.getNextEmbedBlock(null, true), exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(null);
          }
        } else {
          if (((ref = values.leadspaces) != null ? ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
            c = this.getRealCurrentLineNb();
            parser = new Parser(c);
            parser.refs = this.refs;
            block = values.value;
            indent = this.getCurrentLineIndentation();
            if (this.isNextLineIndented(false)) {
              block += "\n" + this.getNextEmbedBlock(indent + values.leadspaces.length + 1, true);
            }
            data.push(parser.parse(block, exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(this.parseValue(values.value, exceptionOnInvalidType, objectDecoder));
          }
        }
      } else if ((values = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && values.key.indexOf(' #') === -1) {
        if (this.CONTEXT_SEQUENCE === context) {
          throw new ParseException('You cannot define a mapping item when in a sequence');
        }
        context = this.CONTEXT_MAPPING;
        if (data == null) {
          data = {};
        }
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        try {
          key = Inline.parseScalar(values.key);
        } catch (error) {
          e = error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
        if ('<<' === key) {
          mergeNode = true;
          allowOverwrite = true;
          if (((ref1 = values.value) != null ? ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = j = 0, len = refValue.length; j < len; i = ++j) {
                value = refValue[i];
                if (data[name = String(i)] == null) {
                  data[name] = value;
                }
              }
            } else {
              for (key in refValue) {
                value = refValue[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          } else {
            if ((values.value != null) && values.value !== '') {
              value = values.value;
            } else {
              value = this.getNextEmbedBlock();
            }
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            parsed = parser.parse(value, exceptionOnInvalidType);
            if (typeof parsed !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (parsed instanceof Array) {
              for (l = 0, len1 = parsed.length; l < len1; l++) {
                parsedItem = parsed[l];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = m = 0, len2 = parsedItem.length; m < len2; i = ++m) {
                    value = parsedItem[i];
                    k = String(i);
                    if (!data.hasOwnProperty(k)) {
                      data[k] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (!data.hasOwnProperty(key)) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (!data.hasOwnProperty(key)) {
                  data[key] = value;
                }
              }
            }
          }
        } else if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (mergeNode) {

        } else if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (!(this.isNextLineIndented()) && !(this.isNextLineUnIndentedCollection())) {
            if (allowOverwrite || data[key] === void 0) {
              data[key] = null;
            }
          } else {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            val = parser.parse(this.getNextEmbedBlock(), exceptionOnInvalidType, objectDecoder);
            if (allowOverwrite || data[key] === void 0) {
              data[key] = val;
            }
          }
        } else {
          val = this.parseValue(values.value, exceptionOnInvalidType, objectDecoder);
          if (allowOverwrite || data[key] === void 0) {
            data[key] = val;
          }
        }
      } else {
        lineCount = this.lines.length;
        if (1 === lineCount || (2 === lineCount && Utils.isEmpty(this.lines[1]))) {
          try {
            value = Inline.parse(this.lines[0], exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
          if (typeof value === 'object') {
            if (value instanceof Array) {
              first = value[0];
            } else {
              for (key in value) {
                first = value[key];
                break;
              }
            }
            if (typeof first === 'string' && first.indexOf('*') === 0) {
              data = [];
              for (n = 0, len3 = value.length; n < len3; n++) {
                alias = value[n];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((ref2 = Utils.ltrim(value).charAt(0)) === '[' || ref2 === '{') {
          try {
            return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
        throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      if (isRef) {
        if (data instanceof Array) {
          this.refs[isRef] = data[data.length - 1];
        } else {
          lastKey = null;
          for (key in data) {
            lastKey = key;
          }
          this.refs[isRef] = data[lastKey];
        }
      }
    }
    if (Utils.isEmpty(data)) {
      return null;
    } else {
      return data;
    }
  };

  Parser.prototype.getRealCurrentLineNb = function() {
    return this.currentLineNb + this.offset;
  };

  Parser.prototype.getCurrentLineIndentation = function() {
    return this.currentLine.length - Utils.ltrim(this.currentLine, ' ').length;
  };

  Parser.prototype.getNextEmbedBlock = function(indentation, includeUnindentedCollection) {
    var data, indent, isItUnindentedCollection, newIndent, removeComments, removeCommentsPattern, unindentedEmbedBlock;
    if (indentation == null) {
      indentation = null;
    }
    if (includeUnindentedCollection == null) {
      includeUnindentedCollection = false;
    }
    this.moveToNextLine();
    if (indentation == null) {
      newIndent = this.getCurrentLineIndentation();
      unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);
      if (!(this.isCurrentLineEmpty()) && 0 === newIndent && !unindentedEmbedBlock) {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    } else {
      newIndent = indentation;
    }
    data = [this.currentLine.slice(newIndent)];
    if (!includeUnindentedCollection) {
      isItUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);
    }
    removeCommentsPattern = this.PATTERN_FOLDED_SCALAR_END;
    removeComments = !removeCommentsPattern.test(this.currentLine);
    while (this.moveToNextLine()) {
      indent = this.getCurrentLineIndentation();
      if (indent === newIndent) {
        removeComments = !removeCommentsPattern.test(this.currentLine);
      }
      if (removeComments && this.isCurrentLineComment()) {
        continue;
      }
      if (this.isCurrentLineBlank()) {
        data.push(this.currentLine.slice(newIndent));
        continue;
      }
      if (isItUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && indent === newIndent) {
        this.moveToPreviousLine();
        break;
      }
      if (indent >= newIndent) {
        data.push(this.currentLine.slice(newIndent));
      } else if (Utils.ltrim(this.currentLine).charAt(0) === '#') {

      } else if (0 === indent) {
        this.moveToPreviousLine();
        break;
      } else {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    }
    return data.join("\n");
  };

  Parser.prototype.moveToNextLine = function() {
    if (this.currentLineNb >= this.lines.length - 1) {
      return false;
    }
    this.currentLine = this.lines[++this.currentLineNb];
    return true;
  };

  Parser.prototype.moveToPreviousLine = function() {
    this.currentLine = this.lines[--this.currentLineNb];
  };

  Parser.prototype.parseValue = function(value, exceptionOnInvalidType, objectDecoder) {
    var e, foldedIndent, matches, modifiers, pos, ref, ref1, val;
    if (0 === value.indexOf('*')) {
      pos = value.indexOf('#');
      if (pos !== -1) {
        value = value.substr(1, pos - 2);
      } else {
        value = value.slice(1);
      }
      if (this.refs[value] === void 0) {
        throw new ParseException('Reference "' + value + '" does not exist.', this.currentLine);
      }
      return this.refs[value];
    }
    if (matches = this.PATTERN_FOLDED_SCALAR_ALL.exec(value)) {
      modifiers = (ref = matches.modifiers) != null ? ref : '';
      foldedIndent = Math.abs(parseInt(modifiers));
      if (isNaN(foldedIndent)) {
        foldedIndent = 0;
      }
      val = this.parseFoldedScalar(matches.separator, this.PATTERN_DECIMAL.replace(modifiers, ''), foldedIndent);
      if (matches.type != null) {
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        return Inline.parseScalar(matches.type + ' ' + val);
      } else {
        return val;
      }
    }
    if ((ref1 = value.charAt(0)) === '[' || ref1 === '{' || ref1 === '"' || ref1 === "'") {
      while (true) {
        try {
          return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
        } catch (error) {
          e = error;
          if (e instanceof ParseMore && this.moveToNextLine()) {
            value += "\n" + Utils.trim(this.currentLine, ' ');
          } else {
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
      }
    } else {
      if (this.isNextLineIndented()) {
        value += "\n" + this.getNextEmbedBlock();
      }
      return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
    }
  };

  Parser.prototype.parseFoldedScalar = function(separator, indicator, indentation) {
    var isCurrentLineBlank, j, len, line, matches, newText, notEOF, pattern, ref, text;
    if (indicator == null) {
      indicator = '';
    }
    if (indentation == null) {
      indentation = 0;
    }
    notEOF = this.moveToNextLine();
    if (!notEOF) {
      return '';
    }
    isCurrentLineBlank = this.isCurrentLineBlank();
    text = '';
    while (notEOF && isCurrentLineBlank) {
      if (notEOF = this.moveToNextLine()) {
        text += "\n";
        isCurrentLineBlank = this.isCurrentLineBlank();
      }
    }
    if (0 === indentation) {
      if (matches = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
        indentation = matches[0].length;
      }
    }
    if (indentation > 0) {
      pattern = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation];
      if (pattern == null) {
        pattern = new Pattern('^ {' + indentation + '}(.*)$');
        Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation] = pattern;
      }
      while (notEOF && (isCurrentLineBlank || (matches = pattern.exec(this.currentLine)))) {
        if (isCurrentLineBlank) {
          text += this.currentLine.slice(indentation);
        } else {
          text += matches[1];
        }
        if (notEOF = this.moveToNextLine()) {
          text += "\n";
          isCurrentLineBlank = this.isCurrentLineBlank();
        }
      }
    } else if (notEOF) {
      text += "\n";
    }
    if (notEOF) {
      this.moveToPreviousLine();
    }
    if ('>' === separator) {
      newText = '';
      ref = text.split("\n");
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText = Utils.rtrim(newText, ' ') + line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    if ('+' !== indicator) {
      text = Utils.rtrim(text);
    }
    if ('' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, "\n");
    } else if ('-' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, '');
    }
    return text;
  };

  Parser.prototype.isNextLineIndented = function(ignoreComments) {
    var EOF, currentIndentation, ret;
    if (ignoreComments == null) {
      ignoreComments = true;
    }
    currentIndentation = this.getCurrentLineIndentation();
    EOF = !this.moveToNextLine();
    if (ignoreComments) {
      while (!EOF && this.isCurrentLineEmpty()) {
        EOF = !this.moveToNextLine();
      }
    } else {
      while (!EOF && this.isCurrentLineBlank()) {
        EOF = !this.moveToNextLine();
      }
    }
    if (EOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() > currentIndentation) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isCurrentLineEmpty = function() {
    var trimmedLine;
    trimmedLine = Utils.trim(this.currentLine, ' ');
    return trimmedLine.length === 0 || trimmedLine.charAt(0) === '#';
  };

  Parser.prototype.isCurrentLineBlank = function() {
    return '' === Utils.trim(this.currentLine, ' ');
  };

  Parser.prototype.isCurrentLineComment = function() {
    var ltrimmedLine;
    ltrimmedLine = Utils.ltrim(this.currentLine, ' ');
    return ltrimmedLine.charAt(0) === '#';
  };

  Parser.prototype.cleanup = function(value) {
    var count, i, indent, j, l, len, len1, line, lines, ref, ref1, ref2, smallestIndent, trimmedValue;
    if (value.indexOf("\r") !== -1) {
      value = value.split("\r\n").join("\n").split("\r").join("\n");
    }
    count = 0;
    ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = ref[0], count = ref[1];
    this.offset += count;
    ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = ref1[0], count = ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = ref2[0], count = ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    lines = value.split("\n");
    smallestIndent = -1;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (Utils.trim(line, ' ').length === 0) {
        continue;
      }
      indent = line.length - Utils.ltrim(line).length;
      if (smallestIndent === -1 || indent < smallestIndent) {
        smallestIndent = indent;
      }
    }
    if (smallestIndent > 0) {
      for (i = l = 0, len1 = lines.length; l < len1; i = ++l) {
        line = lines[i];
        lines[i] = line.slice(smallestIndent);
      }
      value = lines.join("\n");
    }
    return value;
  };

  Parser.prototype.isNextLineUnIndentedCollection = function(currentIndentation) {
    var notEOF, ret;
    if (currentIndentation == null) {
      currentIndentation = null;
    }
    if (currentIndentation == null) {
      currentIndentation = this.getCurrentLineIndentation();
    }
    notEOF = this.moveToNextLine();
    while (notEOF && this.isCurrentLineEmpty()) {
      notEOF = this.moveToNextLine();
    }
    if (false === notEOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem(this.currentLine)) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isStringUnIndentedCollectionItem = function() {
    return this.currentLine === '-' || this.currentLine.slice(0, 2) === '- ';
  };

  return Parser;

})();

module.exports = Parser;

},{"./Exception/ParseException":137,"./Exception/ParseMore":138,"./Inline":139,"./Pattern":141,"./Utils":143}],141:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Pattern;

Pattern = (function() {
  Pattern.prototype.regex = null;

  Pattern.prototype.rawRegex = null;

  Pattern.prototype.cleanedRegex = null;

  Pattern.prototype.mapping = null;

  function Pattern(rawRegex, modifiers) {
    var _char, capturingBracketNumber, cleanedRegex, i, len, mapping, name, part, subChar;
    if (modifiers == null) {
      modifiers = '';
    }
    cleanedRegex = '';
    len = rawRegex.length;
    mapping = null;
    capturingBracketNumber = 0;
    i = 0;
    while (i < len) {
      _char = rawRegex.charAt(i);
      if (_char === '\\') {
        cleanedRegex += rawRegex.slice(i, +(i + 1) + 1 || 9e9);
        i++;
      } else if (_char === '(') {
        if (i < len - 2) {
          part = rawRegex.slice(i, +(i + 2) + 1 || 9e9);
          if (part === '(?:') {
            i += 2;
            cleanedRegex += part;
          } else if (part === '(?<') {
            capturingBracketNumber++;
            i += 2;
            name = '';
            while (i + 1 < len) {
              subChar = rawRegex.charAt(i + 1);
              if (subChar === '>') {
                cleanedRegex += '(';
                i++;
                if (name.length > 0) {
                  if (mapping == null) {
                    mapping = {};
                  }
                  mapping[name] = capturingBracketNumber;
                }
                break;
              } else {
                name += subChar;
              }
              i++;
            }
          } else {
            cleanedRegex += _char;
            capturingBracketNumber++;
          }
        } else {
          cleanedRegex += _char;
        }
      } else {
        cleanedRegex += _char;
      }
      i++;
    }
    this.rawRegex = rawRegex;
    this.cleanedRegex = cleanedRegex;
    this.regex = new RegExp(this.cleanedRegex, 'g' + modifiers.replace('g', ''));
    this.mapping = mapping;
  }

  Pattern.prototype.exec = function(str) {
    var index, matches, name, ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      ref = this.mapping;
      for (name in ref) {
        index = ref[name];
        matches[name] = matches[index];
      }
    }
    return matches;
  };

  Pattern.prototype.test = function(str) {
    this.regex.lastIndex = 0;
    return this.regex.test(str);
  };

  Pattern.prototype.replace = function(str, replacement) {
    this.regex.lastIndex = 0;
    return str.replace(this.regex, replacement);
  };

  Pattern.prototype.replaceAll = function(str, replacement, limit) {
    var count;
    if (limit == null) {
      limit = 0;
    }
    this.regex.lastIndex = 0;
    count = 0;
    while (this.regex.test(str) && (limit === 0 || count < limit)) {
      this.regex.lastIndex = 0;
      str = str.replace(this.regex, replacement);
      count++;
    }
    return [str, count];
  };

  return Pattern;

})();

module.exports = Pattern;

},{}],142:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Pattern, Unescaper, Utils;

Utils = require('./Utils');

Pattern = require('./Pattern');

Unescaper = (function() {
  function Unescaper() {}

  Unescaper.PATTERN_ESCAPED_CHARACTER = new Pattern('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');

  Unescaper.unescapeSingleQuotedString = function(value) {
    return value.replace(/\'\'/g, '\'');
  };

  Unescaper.unescapeDoubleQuotedString = function(value) {
    if (this._unescapeCallback == null) {
      this._unescapeCallback = (function(_this) {
        return function(str) {
          return _this.unescapeCharacter(str);
        };
      })(this);
    }
    return this.PATTERN_ESCAPED_CHARACTER.replace(value, this._unescapeCallback);
  };

  Unescaper.unescapeCharacter = function(value) {
    var ch;
    ch = String.fromCharCode;
    switch (value.charAt(1)) {
      case '0':
        return ch(0);
      case 'a':
        return ch(7);
      case 'b':
        return ch(8);
      case 't':
        return "\t";
      case "\t":
        return "\t";
      case 'n':
        return "\n";
      case 'v':
        return ch(11);
      case 'f':
        return ch(12);
      case 'r':
        return ch(13);
      case 'e':
        return ch(27);
      case ' ':
        return ' ';
      case '"':
        return '"';
      case '/':
        return '/';
      case '\\':
        return '\\';
      case 'N':
        return ch(0x0085);
      case '_':
        return ch(0x00A0);
      case 'L':
        return ch(0x2028);
      case 'P':
        return ch(0x2029);
      case 'x':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 2)));
      case 'u':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 4)));
      case 'U':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 8)));
      default:
        return '';
    }
  };

  return Unescaper;

})();

module.exports = Unescaper;

},{"./Pattern":141,"./Utils":143}],143:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Pattern, Utils,
  hasProp = {}.hasOwnProperty;

Pattern = require('./Pattern');

Utils = (function() {
  function Utils() {}

  Utils.REGEX_LEFT_TRIM_BY_CHAR = {};

  Utils.REGEX_RIGHT_TRIM_BY_CHAR = {};

  Utils.REGEX_SPACES = /\s+/g;

  Utils.REGEX_DIGITS = /^\d+$/;

  Utils.REGEX_OCTAL = /[^0-7]/gi;

  Utils.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;

  Utils.PATTERN_DATE = new Pattern('^' + '(?<year>[0-9][0-9][0-9][0-9])' + '-(?<month>[0-9][0-9]?)' + '-(?<day>[0-9][0-9]?)' + '(?:(?:[Tt]|[ \t]+)' + '(?<hour>[0-9][0-9]?)' + ':(?<minute>[0-9][0-9])' + ':(?<second>[0-9][0-9])' + '(?:\.(?<fraction>[0-9]*))?' + '(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)' + '(?::(?<tz_minute>[0-9][0-9]))?))?)?' + '$', 'i');

  Utils.LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

  Utils.trim = function(str, _char) {
    var regexLeft, regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexLeft, '').replace(regexRight, '');
  };

  Utils.ltrim = function(str, _char) {
    var regexLeft;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    return str.replace(regexLeft, '');
  };

  Utils.rtrim = function(str, _char) {
    var regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexRight, '');
  };

  Utils.isEmpty = function(value) {
    return !value || value === '' || value === '0' || (value instanceof Array && value.length === 0) || this.isEmptyObject(value);
  };

  Utils.isEmptyObject = function(value) {
    var k;
    return value instanceof Object && ((function() {
      var results;
      results = [];
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        results.push(k);
      }
      return results;
    })()).length === 0;
  };

  Utils.subStrCount = function(string, subString, start, length) {
    var c, i, j, len, ref, sublen;
    c = 0;
    string = '' + string;
    subString = '' + subString;
    if (start != null) {
      string = string.slice(start);
    }
    if (length != null) {
      string = string.slice(0, length);
    }
    len = string.length;
    sublen = subString.length;
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (subString === string.slice(i, sublen)) {
        c++;
        i += sublen - 1;
      }
    }
    return c;
  };

  Utils.isDigits = function(input) {
    this.REGEX_DIGITS.lastIndex = 0;
    return this.REGEX_DIGITS.test(input);
  };

  Utils.octDec = function(input) {
    this.REGEX_OCTAL.lastIndex = 0;
    return parseInt((input + '').replace(this.REGEX_OCTAL, ''), 8);
  };

  Utils.hexDec = function(input) {
    this.REGEX_HEXADECIMAL.lastIndex = 0;
    input = this.trim(input);
    if ((input + '').slice(0, 2) === '0x') {
      input = (input + '').slice(2);
    }
    return parseInt((input + '').replace(this.REGEX_HEXADECIMAL, ''), 16);
  };

  Utils.utf8chr = function(c) {
    var ch;
    ch = String.fromCharCode;
    if (0x80 > (c %= 0x200000)) {
      return ch(c);
    }
    if (0x800 > c) {
      return ch(0xC0 | c >> 6) + ch(0x80 | c & 0x3F);
    }
    if (0x10000 > c) {
      return ch(0xE0 | c >> 12) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
    }
    return ch(0xF0 | c >> 18) + ch(0x80 | c >> 12 & 0x3F) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
  };

  Utils.parseBoolean = function(input, strict) {
    var lowerInput;
    if (strict == null) {
      strict = true;
    }
    if (typeof input === 'string') {
      lowerInput = input.toLowerCase();
      if (!strict) {
        if (lowerInput === 'no') {
          return false;
        }
      }
      if (lowerInput === '0') {
        return false;
      }
      if (lowerInput === 'false') {
        return false;
      }
      if (lowerInput === '') {
        return false;
      }
      return true;
    }
    return !!input;
  };

  Utils.isNumeric = function(input) {
    this.REGEX_SPACES.lastIndex = 0;
    return typeof input === 'number' || typeof input === 'string' && !isNaN(input) && input.replace(this.REGEX_SPACES, '') !== '';
  };

  Utils.stringToDate = function(str) {
    var date, day, fraction, hour, info, minute, month, second, tz_hour, tz_minute, tz_offset, year;
    if (!(str != null ? str.length : void 0)) {
      return null;
    }
    info = this.PATTERN_DATE.exec(str);
    if (!info) {
      return null;
    }
    year = parseInt(info.year, 10);
    month = parseInt(info.month, 10) - 1;
    day = parseInt(info.day, 10);
    if (info.hour == null) {
      date = new Date(Date.UTC(year, month, day));
      return date;
    }
    hour = parseInt(info.hour, 10);
    minute = parseInt(info.minute, 10);
    second = parseInt(info.second, 10);
    if (info.fraction != null) {
      fraction = info.fraction.slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = parseInt(fraction, 10);
    } else {
      fraction = 0;
    }
    if (info.tz != null) {
      tz_hour = parseInt(info.tz_hour, 10);
      if (info.tz_minute != null) {
        tz_minute = parseInt(info.tz_minute, 10);
      } else {
        tz_minute = 0;
      }
      tz_offset = (tz_hour * 60 + tz_minute) * 60000;
      if ('-' === info.tz_sign) {
        tz_offset *= -1;
      }
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (tz_offset) {
      date.setTime(date.getTime() - tz_offset);
    }
    return date;
  };

  Utils.strRepeat = function(str, number) {
    var i, res;
    res = '';
    i = 0;
    while (i < number) {
      res += str;
      i++;
    }
    return res;
  };

  Utils.getStringFromFile = function(path, callback) {
    var data, fs, j, len1, name, ref, req, xhr;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
          try {
            xhr = new ActiveXObject(name);
          } catch (error) {}
        }
      }
    }
    if (xhr != null) {
      if (callback != null) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              return callback(xhr.responseText);
            } else {
              return callback(null);
            }
          }
        };
        xhr.open('GET', path, true);
        return xhr.send(null);
      } else {
        xhr.open('GET', path, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          return xhr.responseText;
        }
        return null;
      }
    } else {
      req = require;
      fs = req('fs');
      if (callback != null) {
        return fs.readFile(path, function(err, data) {
          if (err) {
            return callback(null);
          } else {
            return callback(String(data));
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return String(data);
        }
        return null;
      }
    }
  };

  return Utils;

})();

module.exports = Utils;

},{"./Pattern":141}],144:[function(require,module,exports){
// Generated by CoffeeScript 1.12.4
var Dumper, Parser, Utils, Yaml;

Parser = require('./Parser');

Dumper = require('./Dumper');

Utils = require('./Utils');

Yaml = (function() {
  function Yaml() {}

  Yaml.parse = function(input, exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    return new Parser().parse(input, exceptionOnInvalidType, objectDecoder);
  };

  Yaml.parseFile = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    var input;
    if (callback == null) {
      callback = null;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    if (callback != null) {
      return Utils.getStringFromFile(path, (function(_this) {
        return function(input) {
          var result;
          result = null;
          if (input != null) {
            result = _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          callback(result);
        };
      })(this));
    } else {
      input = Utils.getStringFromFile(path);
      if (input != null) {
        return this.parse(input, exceptionOnInvalidType, objectDecoder);
      }
      return null;
    }
  };

  Yaml.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var yaml;
    if (inline == null) {
      inline = 2;
    }
    if (indent == null) {
      indent = 4;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    yaml = new Dumper();
    yaml.indentation = indent;
    return yaml.dump(input, inline, 0, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

if (typeof window === "undefined" || window === null) {
  this.YAML = Yaml;
}

module.exports = Yaml;

},{"./Dumper":134,"./Parser":140,"./Utils":143}],"citation-js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Cite", {
  enumerable: true,
  get: function () {
    return _Cite.default;
  }
});
Object.defineProperty(exports, "logger", {
  enumerable: true,
  get: function () {
    return _logger.default;
  }
});
Object.defineProperty(exports, "version", {
  enumerable: true,
  get: function () {
    return _package.version;
  }
});
exports.util = exports.plugins = void 0;

var _Cite = _interopRequireDefault(require("./Cite/"));

var plugins = _interopRequireWildcard(require("./plugins/"));

exports.plugins = plugins;

var util = _interopRequireWildcard(require("./util/"));

exports.util = util;

var _logger = _interopRequireDefault(require("./logger"));

var _package = require("../package.json");

require("./plugin-common");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"../package.json":42,"./Cite/":3,"./logger":10,"./plugin-common":11,"./plugins/":23,"./util/":38}]},{},[49,65,69,73,75,79,85,91]);
