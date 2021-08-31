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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function Cite(data, options = {}) {
  if (!(this instanceof Cite)) {
    return new Cite(data, options);
  }

  this._options = options;
  this.log = [];
  this.data = [];
  this.set(data, options);
  this.options(options);
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
},{"_process":141}],11:[function(require,module,exports){
"use strict";

var plugins = _interopRequireWildcard(require("../plugins"));

var _input = require("./input/");

var _output = _interopRequireDefault(require("./output/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const NAME = 1;
const NAME_LIST = 2;
const DATE = 3;
const TYPE = 4;
const entryTypes = {
  article: true,
  'article-journal': true,
  'article-magazine': true,
  'article-newspaper': true,
  bill: true,
  book: true,
  broadcast: true,
  chapter: true,
  classic: true,
  collection: true,
  dataset: true,
  document: true,
  entry: true,
  'entry-dictionary': true,
  'entry-encyclopedia': true,
  event: true,
  figure: true,
  graphic: true,
  hearing: true,
  interview: true,
  legal_case: true,
  legislation: true,
  manuscript: true,
  map: true,
  motion_picture: true,
  musical_score: true,
  pamphlet: true,
  'paper-conference': true,
  patent: true,
  performance: true,
  periodical: true,
  personal_communication: true,
  post: true,
  'post-weblog': true,
  regulation: true,
  report: true,
  review: true,
  'review-book': true,
  software: true,
  song: true,
  speech: true,
  standard: true,
  thesis: true,
  treaty: true,
  webpage: true,
  'journal-article': 'article-journal',
  'book-chapter': 'chapter',
  'posted-content': 'manuscript',
  'proceedings-article': 'paper-conference'
};
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
  type: TYPE,
  categories: 'object',
  id: ['string', 'number'],
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
  } else if (date[dp] instanceof Array) {
    const dateParts = correctDateParts(date[dp], bestGuessConversions);
    return dateParts && {
      'date-parts': [dateParts]
    };
  } else if ('literal' in date || 'raw' in date) {
    return date;
  }
};

const correctType = function (type, bestGuessConversions) {
  type = correctField('language', type, bestGuessConversions);

  if (entryTypes[type] === true) {
    return type;
  } else if (bestGuessConversions && type in entryTypes) {
    return entryTypes[type];
  } else {
    return undefined;
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

    case TYPE:
      return correctType(value, bestGuessConversions);
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
},{"../../package.json":42,"../logger":10,"_process":141,"isomorphic-fetch":114,"sync-fetch":145}],36:[function(require,module,exports){
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

var _deepCopy = require("./deepCopy");

class Grammar {
  constructor(rules, state) {
    this.rules = rules;
    this.defaultState = state;
    this.mainRule = Object.keys(rules)[0];
    this.log = [];
  }

  parse(iterator, mainRule) {
    this.lexer = iterator;
    this.token = this.lexer.next();
    this.state = (0, _deepCopy.deepCopy)(this.defaultState);
    this.log = [];
    return this.consumeRule(mainRule || this.mainRule);
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
},{"./deepCopy":34}],38:[function(require,module,exports){
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
  "_args": [
    [
      "@citation-js/core@0.5.1",
      "/home/egonw/tmp/bundle/bundle-tool"
    ]
  ],
  "_development": true,
  "_from": "@citation-js/core@0.5.1",
  "_id": "@citation-js/core@0.5.1",
  "_inBundle": false,
  "_integrity": "sha512-2t4qcDJ/egb+PodvjaZUA6sm3j4mfx8YQV+duB19e/kcuNvEZ+trQrqWvFUp4lPolHF/YufEs81gSs2N3Dc5xA==",
  "_location": "/@citation-js/core",
  "_phantomChildren": {},
  "_requested": {
    "type": "version",
    "registry": true,
    "raw": "@citation-js/core@0.5.1",
    "name": "@citation-js/core",
    "escapedName": "@citation-js%2fcore",
    "scope": "@citation-js",
    "rawSpec": "0.5.1",
    "saveSpec": null,
    "fetchSpec": "0.5.1"
  },
  "_requiredBy": [
    "#DEV:/"
  ],
  "_resolved": "https://registry.npmjs.org/@citation-js/core/-/core-0.5.1.tgz",
  "_spec": "0.5.1",
  "_where": "/home/egonw/tmp/bundle/bundle-tool",
  "author": {
    "name": "Lars Willighagen",
    "email": "lars.willighagen@gmail.com"
  },
  "bugs": {
    "url": "https://github.com/citation-js/citation-js/issues"
  },
  "dependencies": {
    "@citation-js/date": "^0.4.4",
    "@citation-js/name": "^0.4.2",
    "isomorphic-fetch": "^3.0.0",
    "sync-fetch": "^0.2.0"
  },
  "description": "Convert different bibliographic metadata sources",
  "devDependencies": {
    "@babel/plugin-proposal-class-properties": "^7.12.1"
  },
  "directories": {
    "lib": "src",
    "test": "__tests__"
  },
  "engines": {
    "node": ">=8"
  },
  "files": [
    "lib",
    "lib-mjs"
  ],
  "gitHead": "3f3eee0813c7d578a454c34e402fa342d0693cfa",
  "homepage": "https://citation.js.org/",
  "keywords": [
    "citation-js",
    "citation",
    "bibliography"
  ],
  "license": "MIT",
  "main": "lib/index.js",
  "module": "lib-mjs/index.js",
  "name": "@citation-js/core",
  "repository": {
    "type": "git",
    "url": "https://github.com/citation-js/citation-js/tree/master/packages/core"
  },
  "scripts": {
    "test": "mocha -c -R dot test/*.spec.js"
  },
  "version": "0.5.1"
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var biblatex = _interopRequireWildcard(require("./mapping/biblatexTypes"));

var bibtex = _interopRequireWildcard(require("./mapping/bibtexTypes"));

var constants = _interopRequireWildcard(require("./input/constants"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = {
  constants,
  types: {
    biblatex,
    bibtex
  },
  parse: {
    biblatex: true,
    strict: false,
    sentenceCase: 'never'
  },
  format: {
    useIdAsLabel: false
  }
};
exports.default = _default;
},{"./input/constants":52,"./mapping/biblatexTypes":62,"./mapping/bibtexTypes":64}],50:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _input = require("./input/");

var _config = _interopRequireDefault(require("./config"));

var _output = _interopRequireDefault(require("./output/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core.plugins.add(_input.ref, {
  input: _input.formats,
  output: _output.default,
  config: _config.default
});
},{"./config":49,"./input/":56,"./output/":70,"@citation-js/core":"citation-js"}],51:[function(require,module,exports){
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
},{}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "required", {
  enumerable: true,
  get: function () {
    return _required.default;
  }
});
Object.defineProperty(exports, "fieldTypes", {
  enumerable: true,
  get: function () {
    return _fieldTypes.default;
  }
});
Object.defineProperty(exports, "diacritics", {
  enumerable: true,
  get: function () {
    return _unicode.diacritics;
  }
});
Object.defineProperty(exports, "commands", {
  enumerable: true,
  get: function () {
    return _unicode.commands;
  }
});
exports.sentenceCaseLanguages = exports.mathScripts = exports.mathScriptFormatting = exports.ligatures = exports.ligaturePattern = exports.argumentCommands = exports.formatting = exports.formattingCommands = exports.formattingEnvs = exports.defaultStrings = void 0;

var _required = _interopRequireDefault(require("./required.json"));

var _fieldTypes = _interopRequireDefault(require("./fieldTypes.json"));

var _unicode = require("./unicode.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const formattingEnvs = {
  it: 'italics',
  itshape: 'italics',
  sl: 'italics',
  slshape: 'italics',
  em: 'italics',
  bf: 'bold',
  bfseries: 'bold',
  sc: 'smallcaps',
  scshape: 'smallcaps',
  rm: undefined,
  sf: undefined,
  tt: undefined
};
exports.formattingEnvs = formattingEnvs;
const formattingCommands = {
  textit: 'italics',
  textsl: 'italics',
  emph: 'italics',
  mkbibitalic: 'italics',
  mkbibemph: 'italics',
  textbf: 'bold',
  strong: 'bold',
  mkbibbold: 'bold',
  textsc: 'smallcaps',
  textsuperscript: 'superscript',
  textsubscript: 'subscript',
  enquote: 'quotes',
  mkbibquote: 'quotes',
  textmd: undefined,
  textrm: undefined,
  textsf: undefined,
  texttt: undefined,
  textup: undefined
};
exports.formattingCommands = formattingCommands;
const formatting = {
  italics: ['<i>', '</i>'],
  bold: ['<b>', '</b>'],
  superscript: ['<sup>', '</sup>'],
  subscript: ['<sub>', '</sub>'],
  smallcaps: ['<span style="font-variant:small-caps;">', '</span>'],
  nocase: ['<span class="nocase">', '</span>'],
  quotes: ['\u201C', '\u201D']
};
exports.formatting = formatting;
const argumentCommands = {
  ElsevierGlyph(glyph) {
    return String.fromCharCode(parseInt(glyph, 16));
  },

  href(url, text) {
    return url;
  },

  url(url) {
    return url;
  }

};
exports.argumentCommands = argumentCommands;
const ligaturePattern = /---?|''|``|~/g;
exports.ligaturePattern = ligaturePattern;
const ligatures = {
  '--': '\u2013',
  '---': '\u2014',
  '``': '\u201C',
  "''": '\u201D',
  '~': '\u00A0'
};
exports.ligatures = ligatures;
const mathScriptFormatting = {
  '^': 'superscript',
  sp: 'superscript',
  _: 'subscript',
  sb: 'subscript',
  mathrm: undefined
};
exports.mathScriptFormatting = mathScriptFormatting;
const mathScripts = {
  '^': {
    '0': '\u2070',
    '1': '\u00B9',
    '2': '\u00B2',
    '3': '\u00B3',
    '4': '\u2074',
    '5': '\u2075',
    '6': '\u2076',
    '7': '\u2077',
    '8': '\u2078',
    '9': '\u2079',
    '+': '\u207A',
    '-': '\u207B',
    '=': '\u207C',
    '(': '\u207D',
    ')': '\u207E',
    'i': '\u2071',
    'n': '\u207F'
  },
  '_': {
    '0': '\u2080',
    '1': '\u2081',
    '2': '\u2082',
    '3': '\u2083',
    '4': '\u2084',
    '5': '\u2085',
    '6': '\u2086',
    '7': '\u2087',
    '8': '\u2088',
    '9': '\u2089',
    '+': '\u208A',
    '-': '\u208B',
    '=': '\u208C',
    '(': '\u208D',
    ')': '\u208E',
    'a': '\u2090',
    'e': '\u2091',
    'o': '\u2092',
    'x': '\u2093',
    '\u0259': '\u2094',
    'h': '\u2095',
    'k': '\u2096',
    'l': '\u2097',
    'm': '\u2098',
    'n': '\u2099',
    's': '\u209A',
    'p': '\u209B',
    't': '\u209C'
  }
};
exports.mathScripts = mathScripts;
const sentenceCaseLanguages = ['american', 'british', 'canadian', 'english', 'australian', 'newzealand', 'usenglish', 'ukenglish', 'en', 'eng', 'en-au', 'en-bz', 'en-ca', 'en-cb', 'en-gb', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-tt', 'en-us', 'en-za', 'en-zw', 'anglais'];
exports.sentenceCaseLanguages = sentenceCaseLanguages;
},{"./fieldTypes.json":54,"./required.json":58,"./unicode.json":59}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.parseBibtex = parseBibtex;

var _config = _interopRequireDefault(require("../config"));

var _mapping = require("../mapping");

var _value = require("./value");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function validate(entries, requirements) {
  const problems = [];

  for (const {
    type,
    label,
    properties
  } of entries) {
    if (type in requirements) {
      const missing = [];

      for (const field of requirements[type]) {
        if (Array.isArray(field) && !field.some(field => field in properties)) {
          missing.push(field.join('/'));
        } else if (typeof field === 'string' && !(field in properties)) {
          missing.push(field);
        }
      }

      if (missing.length) {
        problems.push([label, `missing fields: ${missing.join(', ')}`]);
      }
    } else {
      problems.push([label, `invalid type: "${type}"`]);
    }
  }

  if (problems.length) {
    throw new RangeError(['Invalid entries:'].concat(problems.map(([label, problem]) => `  - ${label} has ${problem}`)).join('\n'));
  }
}

function parseEntryValues(entry) {
  const output = {};

  if ('language' in entry.properties) {
    output.language = (0, _value.parse)(entry.properties.language, 'language');
  }

  for (const property in entry.properties) {
    const value = entry.properties[property];
    output[property] = (0, _value.parse)(value + '', property, output.language);
  }

  return _objectSpread(_objectSpread({}, entry), {}, {
    properties: output
  });
}

function parse(entries) {
  if (_config.default.parse.strict) {
    validate(entries, _constants.required.biblatex);
  }

  return (0, _mapping.parse)(entries.map(parseEntryValues));
}

function parseBibtex(entries) {
  if (_config.default.parse.strict) {
    validate(entries, _constants.required.bibtex);
  }

  return (0, _mapping.parseBibtex)(entries.map(parseEntryValues));
}
},{"../config":49,"../mapping":65,"./constants":52,"./value":60}],54:[function(require,module,exports){
module.exports={
  "abstract": ["field", "literal"],
  "addendum": ["field", "literal"],
  "afterword": ["list", "name"],
  "annotation": ["field", "literal"],
  "annotator": ["list", "name"],
  "author": ["list", "name"],
  "authortype": ["field", "key"],
  "bookauthor": ["list", "name"],
  "bookpagination": ["field", "key"],
  "booksubtitle": ["field", "literal"],
  "booktitle": ["field", "title"],
  "booktitleaddon": ["field", "literal"],
  "chapter": ["field", "literal"],
  "commentator": ["list", "name"],
  "date": ["field", "date"],
  "doi": ["field", "verbatim"],
  "edition": ["field", "literal"],
  "editor": ["list", "name"],
  "editora": ["list", "name"],
  "editorb": ["list", "name"],
  "editorc": ["list", "name"],
  "editortype": ["field", "key"],
  "editoratype": ["field", "key"],
  "editorbtype": ["field", "key"],
  "editorctype": ["field", "key"],
  "eid": ["field", "literal"],
  "entrysubtype": ["field", "literal"],
  "eprint": ["field", "verbatim"],
  "eprintclass": ["field", "literal"],
  "eprinttype": ["field", "literal"],
  "eventdate": ["field", "date"],
  "eventtitle": ["field", "title"],
  "eventtitleaddon": ["field", "literal"],
  "file": ["field", "verbatim"],
  "foreword": ["list", "name"],
  "holder": ["list", "name"],
  "howpublished": ["field", "literal"],
  "indextitle": ["field", "literal"],
  "institution": ["list", "literal"],
  "introduction": ["list", "name"],
  "isan": ["field", "literal"],
  "isbn": ["field", "literal"],
  "ismn": ["field", "literal"],
  "isrn": ["field", "literal"],
  "issn": ["field", "literal"],
  "issue": ["field", "literal"],
  "issuesubtitle": ["field", "literal"],
  "issuetitle": ["field", "literal"],
  "iswc": ["field", "literal"],
  "journalsubtitle": ["field", "literal"],
  "journaltitle": ["field", "literal"],
  "label": ["field", "literal"],
  "language": ["list", "key"],
  "library": ["field", "literal"],
  "location": ["list", "literal"],
  "mainsubtitle": ["field", "literal"],
  "maintitle": ["field", "title"],
  "maintitleaddon": ["field", "literal"],
  "month": ["field", "literal"],
  "nameaddon": ["field", "literal"],
  "note": ["field", "literal"],
  "number": ["field", "literal"],
  "organization": ["list", "literal"],
  "origdate": ["field", "date"],
  "origlanguage": ["list", "key"],
  "origlocation": ["list", "literal"],
  "origpublisher": ["list", "literal"],
  "origtitle": ["field", "title"],
  "pages": ["field", "range"],
  "pagetotal": ["field", "literal"],
  "pagination": ["field", "key"],
  "part": ["field", "literal"],
  "publisher": ["list", "literal"],
  "pubstate": ["field", "key"],
  "reprinttitle": ["field", "literal"],
  "series": ["field", "title"],
  "shortauthor": ["list", "name"],
  "shorteditor": ["list", "name"],
  "shorthand": ["field", "literal"],
  "shorthandintro": ["field", "literal"],
  "shortjournal": ["field", "literal"],
  "shortseries": ["field", "literal"],
  "shorttitle": ["field", "title"],
  "subtitle": ["field", "literal"],
  "title": ["field", "title"],
  "titleaddon": ["field", "literal"],
  "translator": ["list", "name"],
  "type": ["field", "title"],
  "url": ["field", "uri"],
  "urldate": ["field", "date"],
  "venue": ["field", "literal"],
  "version": ["field", "literal"],
  "volume": ["field", "integer"],
  "volumes": ["field", "integer"],
  "year": ["field", "literal"],
  "crossref": ["field", "entry key"],
  "entryset": ["separated", "literal"],
  "execute": ["field", "code"],
  "gender": ["field", "gender"],
  "langid": ["field", "identifier"],
  "langidopts": ["field", "literal"],
  "ids": ["separated", "entry key"],
  "indexsorttitle": ["field", "literal"],
  "keywords": ["separated", "literal"],
  "options": ["separated", "options"],
  "presort": ["field", "string"],
  "related": ["separated", "literal"],
  "relatedoptions": ["separated", "literal"],
  "relatedtype": ["field", "identifier"],
  "relatedstring": ["field", "literal"],
  "sortkey": ["field", "literal"],
  "sortname": ["list", "name"],
  "sortshorthand": ["field", "literal"],
  "sorttitle": ["field", "literal"],
  "sortyear": ["field", "integer"],
  "xdata": ["separated", "entry key"],
  "xref": ["field", "entry key"],
  "namea": ["list", "name"],
  "nameb": ["list", "name"],
  "namec": ["list", "name"],
  "nameatype": ["field", "key"],
  "namebtype": ["field", "key"],
  "namectype": ["field", "key"],
  "lista": ["list", "literal"],
  "listb": ["list", "literal"],
  "listc": ["list", "literal"],
  "listd": ["list", "literal"],
  "liste": ["list", "literal"],
  "listf": ["list", "literal"],
  "usera": ["field", "literal"],
  "userb": ["field", "literal"],
  "userc": ["field", "literal"],
  "userd": ["field", "literal"],
  "usere": ["field", "literal"],
  "userf": ["field", "literal"],
  "verba": ["field", "literal"],
  "verbb": ["field", "literal"],
  "verbc": ["field", "literal"],
  "address": ["list", "literal"],
  "annote": ["field", "literal"],
  "archiveprefix": ["field", "literal"],
  "journal": ["field", "literal"],
  "key": ["field", "literal"],
  "pdf": ["field", "verbatim"],
  "primaryclass": ["field", "literal"],
  "school": ["list", "literal"],
  "numpages": ["field", "integer"],
  "pmid": ["field", "literal"],
  "pmcid": ["field", "literal"]
}

},{}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.bibtexGrammar = void 0;

var _core = require("@citation-js/core");

var _moo = _interopRequireDefault(require("moo"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const identifier = /[a-zA-Z_][a-zA-Z0-9_:-]*/;
const whitespace = {
  comment: /%.*/,
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
  quotedLiteral: {
    lbrace: {
      match: '{',
      push: 'bracedLiteral'
    },
    quote: {
      match: '"',
      pop: true
    },
    text: {
      match: /(?:\\[\\{]|[^{"])+/,
      lineBreaks: true
    }
  },
  bracedLiteral: {
    lbrace: {
      match: '{',
      push: 'bracedLiteral'
    },
    rbrace: {
      match: '}',
      pop: true
    },
    text: {
      match: /(?:\\[\\{}]|[^{}])+/,
      lineBreaks: true
    }
  }
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
    const closeBrace = this.consumeToken('rbrace').value;

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
    const field = this.consumeToken('identifier').value.toLowerCase();
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
      return this.state.strings[this.consumeToken('identifier').value.toLowerCase()] || '';
    } else if (this.matchToken('number')) {
      return parseInt(this.consumeToken('number'));
    } else if (this.matchToken('quote')) {
      return this.consumeRule('QuoteString');
    } else {
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

  Text() {
    if (this.matchToken('lbrace')) {
      return `{${this.consumeRule('BracketString')}}`;
    } else {
      return this.consumeToken('text').value;
    }
  }

}, {
  strings: _constants.defaultStrings
});
exports.bibtexGrammar = bibtexGrammar;

function parse(text) {
  return bibtexGrammar.parse(lexer.reset(text));
}
},{"./constants":52,"@citation-js/core":"citation-js","moo":140}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.ref = void 0;

var _file = require("./file");

var _bibtxt = require("./bibtxt");

var _entries = require("./entries");

const ref = '@bibtex';
exports.ref = ref;
const formats = {
  '@biblatex/text': {
    parse: _file.parse,
    parseType: {
      dataType: 'String',
      predicate: /@\s{0,5}[A-Za-z]{1,13}\s{0,5}\{\s{0,5}[^@{}"=,\\\s]{0,100}\s{0,5},[\s\S]*\}/
    }
  },
  '@biblatex/entry+object': {
    parse(input) {
      return (0, _entries.parse)([input]);
    },

    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: {
        props: ['type', 'label', 'properties']
      }
    }
  },
  '@biblatex/entries+list': {
    parse: _entries.parse,
    parseType: {
      elementConstraint: '@biblatex/entry+object'
    }
  },
  '@bibtex/text': {
    parse: _file.parse,
    outputs: '@bibtex/entries+list'
  },
  '@bibtex/entry+object': {
    parse(input) {
      return (0, _entries.parseBibtex)([input]);
    }

  },
  '@bibtex/entries+list': {
    parse: _entries.parseBibtex
  },
  '@bibtxt/text': {
    parse: _bibtxt.parse,
    parseType: {
      dataType: 'String',
      predicate: /^\s*(\[(?!\s*[{[]).*?\]\s*(\n\s*[^[]((?!:)\S)+\s*:\s*.+?\s*)*\s*)+$/
    }
  }
};
exports.formats = formats;
},{"./bibtxt":51,"./entries":53,"./file":55}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStringCase = getStringCase;
exports.formatNameParts = formatNameParts;
exports.orderNameParts = orderNameParts;
exports.orderNamePieces = orderNamePieces;

function getStringCase(string) {
  const a = string.toUpperCase();
  const b = string.toLowerCase();

  for (let i = 0; i < string.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] === string[i];
    }
  }

  return null;
}

function formatNameParts(parts) {
  if (parts.length === 0) {
    return undefined;
  }

  let piece = '';

  while (parts.length > 1) {
    const {
      value,
      hyphenated
    } = parts.shift();
    piece += value + (hyphenated ? '-' : ' ');
  }

  const output = piece + parts[0].value;
  return output[0] && output;
}

function orderNameParts(parts, orderGiven = true) {
  const given = [];
  const undecided = [];

  if (orderGiven) {
    while (parts.length > 1 && parts[0].upperCase !== false) {
      given.push(...undecided);
      undecided.length = 0;

      while (parts.length > 1 && parts[0].upperCase !== false && !parts[0].hyphenated) {
        given.push(parts.shift());
      }

      while (parts.length > 0 && parts[0].upperCase !== false && parts[0].hyphenated) {
        undecided.push(parts.shift());
      }
    }
  }

  const prefix = [];
  const family = [];

  while (parts.length > 1) {
    prefix.push(...family);
    family.length = 0;

    while (parts.length > 1 && parts[0].upperCase === false) {
      prefix.push(parts.shift());
    }

    while (parts.length > 0 && parts[0].upperCase !== false) {
      family.push(parts.shift());
    }
  }

  if (undecided.length) {
    family.unshift(...undecided);
  }

  if (parts.length) {
    family.push(parts[0]);
  }

  return [formatNameParts(given), formatNameParts(prefix), formatNameParts(family)];
}

function orderNamePieces(pieces) {
  if (pieces[0][0].label) {
    const name = {};

    for (const [{
      value,
      label
    }] of pieces) {
      name[label] = value;
    }

    return name;
  }

  const name = {};
  const [given, prefix, family] = orderNameParts(pieces[0], pieces.length === 1);

  if (family) {
    name.family = family;
  }

  if (prefix) {
    name.prefix = prefix;
  }

  if (pieces.length === 3) {
    name.given = formatNameParts(pieces[2]);
    name.suffix = formatNameParts(pieces[1]);
  } else if (pieces.length === 2) {
    name.given = formatNameParts(pieces[1]);
  } else if (given) {
    name.given = given;
  }

  return name;
}
},{}],58:[function(require,module,exports){
module.exports={"biblatex":{"article":["author","title","journaltitle",["year","date"]],"book":["author","title",["year","date"]],"mvbook":["author","title",["year","date"]],"inbook":["author","title","booktitle",["year","date"]],"booklet":[["author","editor"],"title",["year","date"]],"collection":["editor","title",["year","date"]],"mvcollection":["editor","title",["year","date"]],"incollection":["author","title","booktitle",["year","date"]],"dataset":[["author","editor"],"title",["year","date"]],"online":[["author","editor"],"title",["year","date"],["doi","eprint","url"]],"patent":["author","title","number",["year","date"]],"periodical":["editor","title",["year","date"]],"proceedings":["title",["year","date"]],"mvproceedings":["title",["year","date"]],"inproceedings":["author","title","booktitle",["year","date"]],"report":["author","title","type","institution",["year","date"]],"thesis":["author","title","type","institution",["year","date"]],"unpublished":["author","title",["year","date"]],"conference":["author","title","booktitle",["year","date"]],"electronic":[["author","editor"],"title",["year","date"],["doi","eprint","url"]],"mastersthesis":["author","title","institution",["year","date"]],"phdthesis":["author","title","institution",["year","date"]],"techreport":["author","title","institution",["year","date"]],"www":[["author","editor"],"title",["year","date"],["doi","eprint","url"]]},"bibtex":{"article":["author","title","journal","year"],"book":[["author","editor"],"title","publisher","year"],"booklet":["title"],"inbook":[["author","editor"],"title",["chapter","pages"],"publisher","year"],"incollection":["author","title","booktitle","publisher","year"],"inproceedings":["author","title","booktitle","year"],"mastersthesis":["author","title","school","year"],"phdthesis":["author","title","school","year"],"proceedings":["title","year"],"techreport":["author","title","institution","year"],"unpublished":["author","title","note"]}}
},{}],59:[function(require,module,exports){
module.exports={"diacritics":{"`":"̀","'":"́","^":"̂","~":"̃","=":"̄","u":"̆",".":"̇","\"":"̈","r":"̊","H":"̋","v":"̌","b":"̲","d":"̣","c":"̧","k":"̨","t":"͡","textcommabelow":"̦"},"commands":{"textquotesingle":"'","textasciigrave":"`","textquotedbl":"\"","textdollar":"$","textless":"<","textgreater":">","textbackslash":"\\","textasciicircum":"^","textunderscore":"_","textbraceleft":"{","textbar":"|","textbraceright":"}","textasciitilde":"~","textexclamdown":"¡","textcent":"¢","textsterling":"£","textcurrency":"¤","textyen":"¥","textbrokenbar":"¦","textsection":"§","textasciidieresis":"¨","textcopyright":"©","textordfeminine":"ª","guillemetleft":"«","guillemotleft":"«","textlnot":"¬","textregistered":"®","textasciimacron":"¯","textdegree":"°","textpm":"±","texttwosuperior":"²","textthreesuperior":"³","textasciiacute":"´","textmu":"µ","textparagraph":"¶","textperiodcentered":"·","textonesuperior":"¹","textordmasculine":"º","guillemetright":"»","guillemotright":"»","textonequarter":"¼","textonehalf":"½","textthreequarters":"¾","textquestiondown":"¿","AE":"Æ","DH":"Ð","texttimes":"×","O":"Ø","TH":"Þ","ss":"ß","ae":"æ","dh":"ð","textdiv":"÷","o":"ø","th":"þ","DJ":"Đ","dj":"đ","i":"ı","IJ":"Ĳ","ij":"ĳ","L":"Ł","l":"ł","NG":"Ŋ","ng":"ŋ","OE":"Œ","oe":"œ","textflorin":"ƒ","j":"ȷ","textasciicaron":"ˇ","textasciibreve":"˘","textacutedbl":"˝","textgravedbl":"˵","texttildelow":"˷","textbaht":"฿","SS":"ẞ","textcompwordmark":"‌","textendash":"–","textemdash":"—","textbardbl":"‖","textquoteleft":"‘","textquoteright":"’","quotesinglbase":"‚","textquotedblleft":"“","textquotedblright":"”","quotedblbase":"„","textdagger":"†","textdaggerdbl":"‡","textbullet":"•","textellipsis":"…","textperthousand":"‰","textpertenthousand":"‱","guilsinglleft":"‹","guilsinglright":"›","textreferencemark":"※","textinterrobang":"‽","textfractionsolidus":"⁄","textlquill":"⁅","textrquill":"⁆","textdiscount":"⁒","textcolonmonetary":"₡","textlira":"₤","textnaira":"₦","textwon":"₩","textdong":"₫","texteuro":"€","textpeso":"₱","textcelsius":"℃","textnumero":"№","textcircledP":"℗","textrecipe":"℞","textservicemark":"℠","texttrademark":"™","textohm":"Ω","textmho":"℧","textestimated":"℮","textleftarrow":"←","textuparrow":"↑","textrightarrow":"→","textdownarrow":"↓","textminus":"−","Hwithstroke":"Ħ","hwithstroke":"ħ","textasteriskcentered":"∗","textsurd":"√","textlangle":"〈","textrangle":"〉","textblank":"␢","textvisiblespace":"␣","textopenbullet":"◦","textbigcircle":"◯","textmusicalnote":"♪","textmarried":"⚭","textdivorced":"⚮","textinterrobangdown":"⸘","textcommabelow":null,"copyright":"©","Gamma":"Γ","Delta":"Δ","Theta":"Θ","Lambda":"Λ","Xi":"Ξ","Pi":"Π","Sigma":"Σ","Phi":"Φ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","varepsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","pi":"π","rho":"ρ","varsigma":"ς","sigma":"σ","tau":"τ","upsilon":"υ","varphi":"φ","chi":"χ","psi":"ψ","omega":"ω","vartheta":"ϑ","Upsilon":"ϒ","phi":"ϕ","varpi":"ϖ","varrho":"ϱ","epsilon":"ϵ"}}
},{}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.valueGrammar = void 0;

var _core = require("@citation-js/core");

var _moo = _interopRequireDefault(require("moo"));

var _config = _interopRequireDefault(require("../config"));

var constants = _interopRequireWildcard(require("./constants"));

var _name = require("./name");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const text = {
  command: {
    match: /\\(?:[a-zA-Z]+|.) */,
    type: _moo.default.keywords({
      commandBegin: '\\begin',
      commandEnd: '\\end'
    }),
    value: s => s.slice(1).trim()
  },
  lbrace: {
    match: '{',
    push: 'bracedLiteral'
  },
  mathShift: {
    match: '$',
    push: 'mathLiteral'
  },
  whitespace: {
    match: /[\s]+|~/,
    lineBreaks: true,

    value(token) {
      return token === '~' ? '\xa0' : ' ';
    }

  }
};

const lexer = _moo.default.states({
  stringLiteral: _objectSpread(_objectSpread({}, text), {}, {
    text: /[^{$}\s~\\]+/
  }),
  namesLiteral: _objectSpread(_objectSpread({
    and: /\s+and\s+/,
    comma: ',',
    hyphen: '-',
    equals: '='
  }, text), {}, {
    text: /[^{$}\s~\\,=-]+/
  }),
  listLiteral: _objectSpread(_objectSpread({
    and: /\s+and\s+/
  }, text), {}, {
    text: /[^{$}\s~\\]+/
  }),
  separatedLiteral: _objectSpread(_objectSpread({
    comma: ','
  }, text), {}, {
    text: /[^{$}\s~\\,]+/
  }),
  bracedLiteral: _objectSpread(_objectSpread({}, text), {}, {
    rbrace: {
      match: '}',
      pop: true
    },
    text: /[^{$}\s~\\]+/
  }),
  mathLiteral: _objectSpread(_objectSpread({}, text), {}, {
    mathShift: {
      match: '$',
      pop: true
    },
    script: /[\^_]/,
    text: /[^{$}\s~\\^_]+/
  })
});

function flattenConsString(string) {
  string[0];
  return string;
}

function applyFormatting(text, format) {
  if (format in constants.formatting) {
    return text && constants.formatting[format].join(text);
  } else {
    return text;
  }
}

const valueGrammar = new _core.util.Grammar({
  String() {
    let output = '';

    while (!this.matchEndOfFile()) {
      output += this.consumeRule('Text');
    }

    return flattenConsString(output);
  },

  StringNames() {
    const list = [];

    while (true) {
      this.consumeToken('whitespace', true);
      list.push(this.consumeRule('Name'));
      this.consumeToken('whitespace', true);

      if (this.matchEndOfFile()) {
        return list;
      } else {
        this.consumeToken('and');
      }
    }
  },

  Name() {
    const pieces = [];

    while (true) {
      pieces.push(this.consumeRule('NamePiece'));

      if (this.matchEndOfFile() || this.matchToken('and')) {
        return (0, _name.orderNamePieces)(pieces);
      } else {
        this.consumeToken('comma');
        this.consumeToken('whitespace', true);
      }
    }
  },

  NamePiece() {
    const parts = [];

    while (true) {
      const part = this.consumeRule('NameToken');

      if (part.label) {
        part.label = (0, _name.formatNameParts)([...parts, {
          value: part.label
        }]);
        return [part];
      }

      parts.push(part);

      if (this.matchEndOfFile() || this.matchToken('and') || this.matchToken('comma')) {
        return parts;
      } else {
        while (this.matchToken('hyphen') || this.matchToken('whitespace')) {
          this.consumeToken();
        }
      }
    }
  },

  NameToken() {
    let upperCase = null;
    let value = '';

    while (true) {
      if (upperCase === null && this.matchToken('text')) {
        const text = this.consumeToken().value;
        value += text;
        upperCase = (0, _name.getStringCase)(text);
      } else if (this.matchEndOfFile() || this.matchToken('and') || this.matchToken('comma') || this.matchToken('whitespace')) {
        return {
          value,
          upperCase
        };
      } else if (this.matchToken('hyphen')) {
        return {
          value,
          upperCase,
          hyphenated: true
        };
      } else if (this.matchToken('equals')) {
        this.consumeToken('equals');
        const text = this.consumeRule('NamePiece');

        if (text[0].label) {
          value += '=' + text[0].label;
        }

        return {
          value: (0, _name.formatNameParts)(text),
          label: value
        };
      } else {
        value += this.consumeRule('Text');
      }
    }
  },

  StringList() {
    const list = [];

    while (!this.matchEndOfFile()) {
      let output = '';

      while (!this.matchEndOfFile() && !this.matchToken('and')) {
        output += this.consumeRule('Text');
      }

      list.push(flattenConsString(output));
      this.consumeToken('and', true);
    }

    return list.length === 1 ? list[0] : list;
  },

  StringSeparated() {
    const list = [];

    while (!this.matchEndOfFile()) {
      let output = '';

      while (!this.matchEndOfFile() && !this.matchToken('comma')) {
        output += this.consumeRule('Text');
      }

      list.push(output.trim());
      this.consumeToken('comma', true);
      this.consumeToken('whitespace', true);
    }

    return list;
  },

  StringVerbatim() {
    let output = '';

    while (!this.matchEndOfFile()) {
      output += this.consumeToken().text;
    }

    return flattenConsString(output);
  },

  StringUri() {
    const uri = this.consumeRule('StringVerbatim');

    try {
      if (decodeURI(uri) === uri) {
        return encodeURI(uri);
      } else {
        return uri;
      }
    } catch (e) {
      return encodeURI(uri);
    }
  },

  StringTitleCase() {
    this.state.sentenceCase = true;
    let output = '';

    while (!this.matchEndOfFile()) {
      output += this.consumeRule('Text');
    }

    return flattenConsString(output);
  },

  BracketString() {
    var _this$state;

    let output = '';
    this.consumeToken('lbrace');
    const sentenceCase = this.state.sentenceCase;
    this.state.sentenceCase = sentenceCase && this.matchToken('command');
    (_this$state = this.state).partlyLowercase && (_this$state.partlyLowercase = this.state.sentenceCase);

    while (!this.matchToken('rbrace')) {
      output += this.consumeRule('Text');
    }

    const topLevel = sentenceCase && !this.state.sentenceCase;
    const protectCase = topLevel && this.state.partlyLowercase;
    this.state.sentenceCase = sentenceCase;
    this.consumeToken('rbrace');
    return protectCase ? applyFormatting(output, 'nocase') : output;
  },

  MathString() {
    let output = '';
    this.consumeToken('mathShift');

    while (!this.matchToken('mathShift')) {
      if (this.matchToken('script')) {
        const script = this.consumeToken('script').value;
        const text = this.consumeRule('Text').split('');

        if (text.every(char => char in constants.mathScripts[script])) {
          output += text.map(char => constants.mathScripts[script][char]).join('');
        } else {
          const formatName = constants.mathScriptFormatting[script];
          output += constants.formatting[formatName].join(text.join(''));
        }

        continue;
      }

      if (this.matchToken('command')) {
        const command = this.token.value;

        if (command in constants.mathScriptFormatting) {
          this.consumeToken('command');
          const text = this.consumeRule('BracketString');
          output += applyFormatting(text, constants.mathScriptFormatting[command]);
          continue;
        }
      }

      output += this.consumeRule('Text');
    }

    this.consumeToken('mathShift');
    return output;
  },

  Text() {
    if (this.matchToken('lbrace')) {
      return this.consumeRule('BracketString');
    } else if (this.matchToken('mathShift')) {
      return this.consumeRule('MathString');
    } else if (this.matchToken('whitespace')) {
      return this.consumeToken('whitespace').value;
    } else if (this.matchToken('commandBegin')) {
      return this.consumeRule('EnclosedEnv');
    } else if (this.matchToken('command')) {
      return this.consumeRule('Command');
    }

    const text = this.consumeToken('text').value.replace(constants.ligaturePattern, ligature => constants.ligatures[ligature]);
    const afterPunctuation = this.state.afterPunctuation;
    this.state.afterPunctuation = /[?!.:]$/.test(text);

    if (!this.state.sentenceCase) {
      var _this$state2;

      (_this$state2 = this.state).partlyLowercase || (_this$state2.partlyLowercase = text === text.toLowerCase() && text !== text.toUpperCase());
      return text;
    }

    const [first, ...otherCharacters] = text;
    const rest = otherCharacters.join('');
    const restLowerCase = rest.toLowerCase();

    if (rest !== restLowerCase) {
      return text;
    }

    if (!afterPunctuation) {
      return text.toLowerCase();
    }

    return first + restLowerCase;
  },

  Command() {
    const commandToken = this.consumeToken('command');
    const command = commandToken.value;

    if (command in constants.formattingEnvs) {
      const text = this.consumeRule('Env');
      const format = constants.formattingEnvs[command];
      return applyFormatting(text, format);
    } else if (command in constants.formattingCommands) {
      const text = this.consumeRule('BracketString');
      const format = constants.formattingCommands[command];
      return applyFormatting(text, format);
    } else if (command in constants.commands) {
      return constants.commands[command];
    } else if (command in constants.diacritics && !this.matchEndOfFile()) {
      const text = this.consumeRule('Text');
      const diacritic = text[0] + constants.diacritics[command];
      return diacritic.normalize('NFC') + text.slice(1);
    } else if (command in constants.argumentCommands) {
      const func = constants.argumentCommands[command];
      const args = [];
      let arity = func.length;

      while (arity-- > 0) {
        this.consumeToken('whitespace', true);
        args.push(this.consumeRule('BracketString'));
      }

      return func(...args);
    } else if (/^[&%$#_{}]$/.test(command)) {
      return commandToken.text.slice(1);
    } else {
      return commandToken.text;
    }
  },

  Env() {
    let output = '';

    while (!this.matchEndOfFile() && !this.matchToken('rbrace')) {
      output += this.consumeRule('Text');
    }

    return output;
  },

  EnclosedEnv() {
    this.consumeToken('commandBegin');
    const beginEnv = this.consumeRule('BracketString');
    let output = '';

    while (!this.matchToken('commandEnd')) {
      output += this.consumeRule('Text');
    }

    const end = this.consumeToken('commandEnd');
    const endEnv = this.consumeRule('BracketString');

    if (beginEnv !== endEnv) {
      throw new SyntaxError(this.lexer.formatError(end, `environment started with "${beginEnv}", ended with "${endEnv}"`));
    }

    return applyFormatting(output, constants.formattingEnvs[beginEnv]);
  }

}, {
  sentenceCase: false,
  partlyLowercase: false,
  afterPunctuation: true
});
exports.valueGrammar = valueGrammar;

function singleLanguageIsEnglish(language) {
  return constants.sentenceCaseLanguages.includes(language.toLowerCase());
}

function isEnglish(languages) {
  if (Array.isArray(languages)) {
    return languages.every(singleLanguageIsEnglish);
  }

  return singleLanguageIsEnglish(languages);
}

function getMainRule(fieldType, languages) {
  if (fieldType[1] === 'name') {
    return fieldType[0] === 'list' ? 'StringNames' : 'Name';
  }

  if (fieldType[1] === 'title') {
    const option = _config.default.parse.sentenceCase;

    if (option === 'always' || option === 'english' && isEnglish(languages)) {
      return 'StringTitleCase';
    } else {
      return 'String';
    }
  }

  switch (fieldType[0] === 'field' ? fieldType[1] : fieldType[0]) {
    case 'list':
      return 'StringList';

    case 'separated':
      return 'StringSeparated';

    case 'verbatim':
      return 'StringVerbatim';

    case 'uri':
      return 'StringUri';

    case 'title':
    case 'literal':
    default:
      return 'String';
  }
}

function getLexerState(fieldType) {
  if (fieldType[1] === 'name') {
    return 'namesLiteral';
  }

  switch (fieldType[0]) {
    case 'list':
      return 'listLiteral';

    case 'separated':
      return 'separatedLiteral';

    case 'field':
    default:
      return 'stringLiteral';
  }
}

function parse(text, field, languages = []) {
  const fieldType = constants.fieldTypes[field] || [];
  return valueGrammar.parse(lexer.reset(text, {
    state: getLexerState(fieldType),
    line: 0,
    col: 0
  }), getMainRule(fieldType, languages));
}
},{"../config":49,"./constants":52,"./name":57,"@citation-js/core":"citation-js","moo":140}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

var _biblatexTypes = _interopRequireDefault(require("./biblatexTypes"));

var _shared = require("./shared");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const nonSpec = [{
  source: 'note',
  target: 'accessed',
  when: {
    source: false,
    target: {
      note: false
    }
  },
  convert: {
    toSource(accessed) {
      return `[Online; accessed ${(0, _date.format)(accessed)}]`;
    }

  }
}, {
  source: 'numpages',
  target: 'number-of-pages',
  when: {
    source: {
      pagetotal: false
    },
    target: false
  }
}, {
  source: 'pmid',
  target: 'PMID',
  when: {
    source: {
      eprinttype(type) {
        return type !== 'pmid';
      },

      archiveprefix(type) {
        return type !== 'pmid';
      }

    },
    target: false
  }
}, {
  source: 'pmcid',
  target: 'PMCID',
  when: {
    target: false
  }
}];
const aliases = [{
  source: 'annote',
  target: 'annote',
  when: {
    source: {
      annotation: false
    },
    target: false
  }
}, {
  source: 'address',
  target: 'publisher-place',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      location: false
    },
    target: false
  }
}, {
  source: ['eprint', 'archiveprefix'],
  target: 'PMID',
  convert: _shared.Converters.EPRINT,
  when: {
    source: {
      eprinttype: false
    },
    target: false
  }
}, {
  source: 'journal',
  target: 'container-title',
  when: {
    source: {
      maintitle: false,
      booktitle: false,
      journaltitle: false
    },
    target: false
  }
}, {
  source: 'school',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      institution: false,
      organization: false,
      publisher: false
    },
    target: false
  }
}];

var _default = new _core.util.Translator([...aliases, ...nonSpec, {
  source: 'abstract',
  target: 'abstract'
}, {
  source: 'urldate',
  target: 'accessed',
  convert: _shared.Converters.DATE
}, {
  source: 'annotation',
  target: 'annote'
}, {
  source: 'author',
  target: 'author',
  convert: _shared.Converters.NAMES
}, {
  source: 'library',
  target: 'call-number'
}, {
  source: 'chapter',
  target: 'chapter-number'
}, {
  source: 'bookauthor',
  target: 'container-author',
  convert: _shared.Converters.NAMES
}, {
  source: ['maintitle', 'mainsubtitle', 'maintitleaddon'],
  target: 'container-title',
  when: {
    source: true,
    target: {
      'number-of-volumes': true
    }
  },
  convert: _shared.Converters.TITLE
}, {
  source: ['booktitle', 'booksubtitle', 'booktitleaddon'],
  target: 'container-title',
  when: {
    source: {
      maintitle: false
    },
    target: {
      'number-of-volumes': false,

      type(type) {
        return !type.startsWith('article');
      }

    }
  },
  convert: _shared.Converters.TITLE
}, {
  source: ['journaltitle', 'journalsubtitle', 'journaltitleaddon'],
  target: 'container-title',
  when: {
    source: {
      [_shared.TYPE]: 'article'
    },
    target: {
      type: ['article', 'article-newspaper', 'article-journal', 'article-magazine']
    }
  },
  convert: _shared.Converters.TITLE
}, {
  source: 'shortjournal',
  target: 'container-title-short',
  when: {
    source: {
      [_shared.TYPE]: 'article'
    },
    target: {
      type: ['article', 'article-newspaper', 'article-journal', 'article-magazine']
    }
  }
}, {
  source: 'shortjournal',
  target: 'journalAbbreviation',
  when: {
    source: false,
    target: {
      'container-title-short': false
    }
  }
}, {
  source: 'number',
  target: 'collection-number',
  when: {
    source: {
      [_shared.TYPE]: ['book', 'mvbook', 'inbook', 'bookinbook', 'suppbook', 'collection', 'mvcollection', 'incollection', 'suppcollection', 'manual', 'suppperiodical', 'proceedings', 'mvproceedings', 'refererence']
    },
    target: {
      type: ['bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legislation', 'legal_case', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'post', 'post-weblog', 'personal_communication', 'review', 'review-book', 'song', 'speech', 'thesis', 'treaty', 'webpage']
    }
  }
}, {
  source: 'series',
  target: 'collection-title'
}, {
  source: 'shortseries',
  target: 'collection-title-short'
}, {
  source: 'doi',
  target: 'DOI'
}, {
  source: 'edition',
  target: 'edition'
}, {
  source: 'editor',
  target: 'editor',
  convert: _shared.Converters.NAMES
}, {
  source: [_shared.TYPE, 'entrysubtype', 'type'],
  target: ['type', 'genre'],
  convert: {
    toTarget(type, subtype, typeKey) {
      if (!typeKey) {
        if (type === 'masterthesis') {
          typeKey = 'mathesis';
        }

        if (type === 'phdthesis') {
          typeKey = 'phdthesis';
        }

        if (type === 'techreport') {
          typeKey = 'techreport';
        }
      }

      return [_biblatexTypes.default.source[type] || 'book', typeKey || subtype];
    },

    toSource(type, genre) {
      const sourceType = _biblatexTypes.default.target[type] || 'misc';
      return genre in _shared.TYPE_KEYS ? [sourceType, undefined, genre] : [sourceType, genre];
    }

  }
}, {
  source: _shared.TYPE,
  when: {
    target: {
      type: false
    }
  },
  convert: {
    toSource() {
      return 'misc';
    }

  }
}, {
  source: 'eventdate',
  target: 'event-date',
  convert: _shared.Converters.DATE
}, {
  source: 'venue',
  target: 'event-place'
}, {
  source: 'eventtitle',
  target: 'event'
}, {
  source: _shared.LABEL,
  target: ['id', 'citation-label', 'author', 'issued', 'year-suffix', 'title'],
  convert: _shared.Converters.LABEL
}, {
  source: 'isbn',
  target: 'ISBN'
}, {
  source: 'issn',
  target: 'ISSN'
}, {
  source: 'issue',
  target: 'issue',
  when: {
    source: {
      number: false,
      [_shared.TYPE]: ['article', 'periodical']
    },
    target: {
      issue(issue) {
        return typeof issue === 'string' && !issue.match(/\d+/);
      },

      type: ['article', 'article-journal', 'article-newspaper', 'article-magazine']
    }
  }
}, {
  source: 'number',
  target: 'issue',
  when: {
    source: {
      [_shared.TYPE]: ['article', 'periodical', 'inproceedings']
    },
    target: {
      issue(issue) {
        return issue && (typeof issue === 'number' || issue.match(/\d+/));
      },

      type: ['article', 'article-journal', 'article-newspaper', 'article-magazine', 'paper-conference']
    }
  }
}, {
  source: 'date',
  target: 'issued',
  convert: _shared.Converters.DATE
}, {
  source: ['year', 'month'],
  target: 'issued',
  convert: _shared.Converters.YEAR_MONTH,
  when: {
    source: {
      date: false
    },
    target: false
  }
}, {
  source: 'location',
  target: 'jurisdiction',
  when: {
    source: {
      type: 'patent'
    },
    target: {
      type: 'patent'
    }
  }
}, {
  source: 'keywords',
  target: 'keyword',
  convert: _shared.Converters.KEYWORDS
}, {
  source: 'language',
  target: 'language',
  convert: _shared.Converters.PICK
}, {
  source: 'note',
  target: 'note'
}, {
  source: ['isan', 'ismn', 'isrn', 'iswc'],
  target: 'number',
  convert: _shared.Converters.STANDARD_NUMBERS,
  when: {
    source: {
      [_shared.TYPE](type) {
        return type !== 'patent';
      }

    },
    target: {
      type(type) {
        return type !== 'patent';
      }

    }
  }
}, {
  source: 'number',
  target: 'number',
  when: {
    source: {
      [_shared.TYPE]: ['patent', 'report', 'techreport', 'legislation']
    },
    target: {
      type: ['patent', 'report', 'legislation']
    }
  }
}, {
  source: 'origdate',
  target: 'original-date',
  convert: _shared.Converters.DATE
}, {
  source: 'origlocation',
  target: 'original-publisher-place',
  convert: _shared.Converters.PICK
}, {
  source: 'origpublisher',
  target: 'original-publisher',
  convert: _shared.Converters.PICK
}, {
  source: 'origtitle',
  target: 'original-title'
}, {
  source: ['pages', 'eid'],
  target: 'page',
  convert: {
    toTarget(pages, eid) {
      return eid ? eid.replace(/^e?/i, 'e') : pages.replace(/[–—]/, '-');
    },

    toSource(page) {
      return /^e/i.test(page) ? [page, page] : [page.replace('-', '--')];
    }

  }
}, {
  source: 'pagetotal',
  target: 'number-of-pages'
}, {
  source: ['eprint', 'eprinttype'],
  target: 'PMID',
  convert: _shared.Converters.EPRINT
}, {
  source: 'location',
  target: 'publisher-place',
  convert: _shared.Converters.PICK
}, {
  source: 'publisher',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: true,
    target: {
      type: ['article', 'article-journal', 'article-magazine', 'article-newspaper', 'bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legal_case', 'legislation', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'paper-conference', 'patent', 'personal_communication', 'post', 'post-weblog', 'regulation', 'review', 'review-book', 'song', 'speech', 'treaty']
    }
  }
}, {
  source: 'organization',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false
    },
    target: {
      type: 'webpage'
    }
  }
}, {
  source: 'institution',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false
    },
    target: {
      type: ['report', 'thesis']
    }
  }
}, {
  source: 'howpublished',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false,
      institution: false
    },
    target: {
      type: 'manuscript'
    }
  }
}, {
  source: ['pages', 'bookpagination'],
  target: 'section',
  when: {
    source: {
      bookpagination: 'section'
    },
    target: {
      page: false
    }
  },
  convert: {
    toTarget(section) {
      return section;
    },

    toSource(section) {
      return [section, 'section'];
    }

  }
}, {
  source: 'pubstate',
  target: 'status',
  convert: _shared.Converters.STATUS
}, {
  source: 'shorttitle',
  target: 'title-short'
}, {
  source: ['title', 'subtitle', 'titleaddon'],
  target: 'title',
  convert: _shared.Converters.TITLE
}, {
  source: 'translator',
  target: 'translator',
  convert: _shared.Converters.NAMES
}, {
  source: 'url',
  target: 'URL'
}, {
  source: 'howpublished',
  target: 'URL',
  convert: _shared.Converters.HOW_PUBLISHED,
  when: {
    source: {
      url: false
    },
    target: false
  }
}, {
  source: 'version',
  target: 'version'
}, {
  source: 'volume',
  target: 'volume'
}, {
  source: 'volumes',
  target: 'number-of-volumes'
}]);

exports.default = _default;
},{"./biblatexTypes":62,"./shared":66,"@citation-js/core":"citation-js","@citation-js/date":43}],62:[function(require,module,exports){
module.exports={
  "source": {
    "article": "article-journal",
    "book": "book",
    "mvbook": "book",
    "inbook": "chapter",
    "bookinbook": "book",
    "booklet": "book",
    "collection": "book",
    "mvcollection": "book",
    "incollection": "chapter",
    "dataset": "dataset",
    "online": "webpage",
    "patent": "patent",
    "periodical": "article-journal",
    "proceedings": "book",
    "mvproceedings": "book",
    "inproceedings": "paper-conference",
    "reference": "book",
    "mvreference": "book",
    "inreference": "entry",
    "report": "report",
    "software": "book",
    "thesis": "thesis",
    "unpublished": "manuscript",
    "artwork": "graphic",
    "audio": "song",
    "image": "figure",
    "jurisdiction": "legal_case",
    "legislation": "legislation",
    "legal": "treaty",
    "letter": "personal_communication",
    "movie": "motion_picture",
    "music": "musical_score",
    "review": "review",
    "video": "motion_picture",
    "conference": "paper-conference",
    "electronic": "webpage",
    "mastersthesis": "thesis",
    "phdthesis": "thesis",
    "techreport": "report",
    "www": "webpage"
  },
  "target": {
    "article": "article",
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    "bill": "legislation",
    "book": "book",
    "broadcast": "audio",
    "chapter": "inbook",
    "dataset": "dataset",
    "entry": "inreference",
    "entry-dictionary": "inreference",
    "entry-encyclopedia": "inreference",
    "figure": "artwork",
    "graphic": "artwork",
    "interview": "audio",
    "legal_case": "jurisdiction",
    "legislation": "legislation",
    "manuscript": "unpublished",
    "motion_picture": "movie",
    "musical_score": "music",
    "paper-conference": "inproceedings",
    "patent": "patent",
    "personal_communication": "letter",
    "post": "online",
    "post-weblog": "online",
    "report": "report",
    "review": "review",
    "review-book": "review",
    "song": "music",
    "speech": "audio",
    "thesis": "thesis",
    "treaty": "legal",
    "webpage": "online"
  }
}

},{}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

var _bibtexTypes = _interopRequireDefault(require("./bibtexTypes"));

var _shared = require("./shared");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = new _core.util.Translator([{
  source: 'note',
  target: 'accessed',
  when: {
    source: false,
    target: {
      note: false
    }
  },
  convert: {
    toSource(accessed) {
      return `[Online; accessed ${(0, _date.format)(accessed)}]`;
    }

  }
}, {
  source: 'annote',
  target: 'annote'
}, {
  source: 'address',
  target: 'publisher-place',
  convert: _shared.Converters.PICK
}, {
  source: 'author',
  target: 'author',
  convert: _shared.Converters.NAMES
}, {
  source: 'chapter',
  target: 'chapter-number'
}, {
  source: 'number',
  target: 'collection-number',
  when: {
    source: {
      [_shared.TYPE]: ['book', 'mvbook', 'inbook', 'collection', 'mvcollection', 'incollection', 'suppcollection', 'manual', 'suppperiodical', 'proceedings', 'mvproceedings', 'refererence']
    },
    target: {
      type: ['bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legislation', 'legal_case', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'post', 'post-weblog', 'personal_communication', 'review', 'review-book', 'song', 'speech', 'thesis', 'treaty', 'webpage']
    }
  }
}, {
  source: 'series',
  target: 'collection-title'
}, {
  source: 'booktitle',
  target: 'container-title',
  when: {
    target: {
      type: ['chapter', 'paper-conference']
    }
  }
}, {
  source: 'journal',
  target: 'container-title',
  when: {
    source: {
      [_shared.TYPE]: 'article'
    },
    target: {
      type: ['article', 'article-newspaper', 'article-journal', 'article-magazine']
    }
  }
}, {
  source: 'edition',
  target: 'edition'
}, {
  source: 'editor',
  target: 'editor',
  convert: _shared.Converters.NAMES
}, {
  source: _shared.LABEL,
  target: ['id', 'citation-label', 'author', 'issued', 'year-suffix', 'title'],
  convert: _shared.Converters.LABEL
}, {
  source: 'number',
  target: 'issue',
  when: {
    source: {
      [_shared.TYPE]: ['article', 'periodical', 'inproceedings']
    },
    target: {
      issue(issue) {
        return typeof issue === 'number' || typeof issue === 'string' && issue.match(/\d+/);
      },

      type: ['article', 'article-journal', 'article-newspaper', 'article-magazine', 'paper-conference']
    }
  }
}, {
  source: ['year', 'month'],
  target: 'issued',
  convert: _shared.Converters.YEAR_MONTH
}, {
  source: 'note',
  target: 'note'
}, {
  source: 'number',
  target: 'number',
  when: {
    source: {
      [_shared.TYPE]: ['patent', 'report', 'techreport']
    },
    target: {
      type: ['patent', 'report']
    }
  }
}, {
  source: 'pages',
  target: 'page',
  convert: {
    toTarget(text) {
      return text.replace(/[–—]/, '-');
    },

    toSource(text) {
      return text.replace('-', '--');
    }

  }
}, {
  source: 'publisher',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    target: {
      type: ['article', 'article-journal', 'article-magazine', 'article-newspaper', 'bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legal_case', 'legislation', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'patent', 'personal_communication', 'post', 'post-weblog', 'review', 'review-book', 'song', 'speech', 'treaty', 'webpage']
    }
  }
}, {
  source: 'organization',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false
    },
    target: {
      type: 'paper-conference'
    }
  }
}, {
  source: 'institution',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false
    },
    target: {
      type: 'report'
    }
  }
}, {
  source: 'school',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      institution: false,
      organization: false,
      publisher: false
    },
    target: {
      type: 'thesis'
    }
  }
}, {
  source: 'howpublished',
  target: 'publisher',
  convert: _shared.Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false,
      institution: false,
      school: false
    },
    target: {
      type: 'manuscript'
    }
  }
}, {
  source: 'title',
  target: 'title'
}, {
  source: [_shared.TYPE, 'type'],
  target: ['type', 'genre'],
  convert: {
    toTarget(sourceType, subType) {
      const type = _bibtexTypes.default.source[sourceType] || 'book';

      if (subType) {
        return [type, subType];
      } else if (sourceType === 'mastersthesis') {
        return [type, 'Master\'s thesis'];
      } else if (sourceType === 'phdthesis') {
        return [type, 'PhD thesis'];
      } else {
        return [type];
      }
    },

    toSource(targetType, genre) {
      const type = _bibtexTypes.default.target[targetType] || 'misc';

      if (/^(master'?s|diploma) thesis$/i.test(genre)) {
        return ['mastersthesis'];
      } else if (/^(phd|doctoral) thesis$/i.test(genre)) {
        return ['phdthesis'];
      } else {
        return [type, genre];
      }
    }

  }
}, {
  source: _shared.TYPE,
  when: {
    target: {
      type: false
    }
  },
  convert: {
    toSource() {
      return 'misc';
    }

  }
}, {
  source: 'howpublished',
  target: 'URL',
  convert: _shared.Converters.HOW_PUBLISHED,
  when: {
    target: {
      publisher: false
    }
  }
}, {
  source: 'volume',
  target: 'volume'
}]);

exports.default = _default;
},{"./bibtexTypes":64,"./shared":66,"@citation-js/core":"citation-js","@citation-js/date":43}],64:[function(require,module,exports){
module.exports={
  "source": {
    "article": "article-journal",
    "book": "book",
    "booklet": "book",
    "conference": "paper-conference",
    "inbook": "chapter",
    "incollection": "chapter",
    "inproceedings": "paper-conference",
    "mastersthesis": "thesis",
    "phdthesis": "thesis",
    "proceedings": "book",
    "techreport": "report",
    "unpublished": "manuscript"
  },
  "target": {
    "article": "article",
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    "book": "book",
    "chapter": "inbook",
    "manuscript": "unpublished",
    "paper-conference": "inproceedings",
    "report": "techreport",
    "review": "article",
    "review-book": "article"
  }
}

},{}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBibtex = parseBibtex;
exports.formatBibtex = formatBibtex;
exports.parse = parse;
exports.format = format;

var _shared = require("./shared");

var _biblatex = _interopRequireDefault(require("./biblatex"));

var _bibtex = _interopRequireDefault(require("./bibtex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function crossref(entry, registry) {
  if (entry.crossref in registry) {
    const parent = registry[entry.crossref].properties;

    if (parent === entry) {
      return entry;
    }

    return Object.assign({}, crossref(parent, registry), entry);
  }

  return entry;
}

function _parse(input, spec) {
  const registry = {};

  for (const entry of input) {
    registry[entry.label] = entry;
  }

  return input.map(({
    type,
    label,
    properties
  }) => spec.convertToTarget(_objectSpread({
    [_shared.TYPE]: type,
    [_shared.LABEL]: label
  }, crossref(properties, registry))));
}

function _format(input, spec) {
  return input.map(entry => {
    const _spec$convertToSource = spec.convertToSource(entry),
          {
      [_shared.TYPE]: type,
      [_shared.LABEL]: label
    } = _spec$convertToSource,
          properties = _objectWithoutProperties(_spec$convertToSource, [_shared.TYPE, _shared.LABEL].map(_toPropertyKey));

    return {
      type,
      label,
      properties
    };
  });
}

function parseBibtex(input) {
  return _parse(input, _bibtex.default);
}

function formatBibtex(input) {
  return _format(input, _bibtex.default);
}

function parse(input) {
  return _parse(input, _biblatex.default);
}

function format(input) {
  return _format(input, _biblatex.default);
}
},{"./biblatex":61,"./bibtex":63,"./shared":66}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDate = parseDate;
exports.parseMonth = parseMonth;
exports.formatLabel = formatLabel;
exports.Converters = exports.STANDARD_NUMBERS_PATTERN = exports.TYPE_KEYS = exports.MONTHS = exports.LABEL = exports.TYPE = void 0;

var _core = require("@citation-js/core");

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const stopWords = new Set(['the', 'a', 'an']);
const unsafeChars = /(?:<\/?.*?>|[\u0020-\u002F\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007F])+/g;
const unicode = /[^\u0020-\u007F]+/g;

function firstWord(text) {
  if (!text) {
    return '';
  } else {
    return text.normalize('NFKD').replace(unicode, '').split(unsafeChars).find(word => word.length && !stopWords.has(word.toLowerCase()));
  }
}

const name = new _core.util.Translator([{
  source: 'given',
  target: 'given'
}, {
  source: 'family',
  target: 'family'
}, {
  source: 'suffix',
  target: 'suffix'
}, {
  source: 'prefix',
  target: 'non-dropping-particle'
}, {
  source: 'family',
  target: 'literal',
  when: {
    source: false,
    target: {
      family: false,
      given: false
    }
  }
}]);
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const TYPE = 'BibTeX type';
exports.TYPE = TYPE;
const LABEL = 'BibTeX label';
exports.LABEL = LABEL;
const MONTHS = {
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
  dec: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
};
exports.MONTHS = MONTHS;
const TYPE_KEYS = {
  bathesis: 'Bachelor\'s thesis',
  mathesis: 'Master\'s thesis',
  phdthesis: 'PhD thesis',
  candthesis: 'Candidate thesis',
  techreport: 'technical report',
  resreport: 'research report',
  software: 'computer software',
  datacd: 'data cd',
  audiocd: 'audio cd',
  patent: 'patent',
  patentde: 'German patent',
  patenteu: 'European patent',
  patentfr: 'French patent',
  patentuk: 'British patent',
  patentus: 'U.S. patent',
  patreq: 'patent request',
  patreqde: 'German patent request',
  patreqeu: 'European patent request',
  patreqfr: 'French patent request',
  patrequk: 'British patent request',
  patrequs: 'U.S. patent request'
};
exports.TYPE_KEYS = TYPE_KEYS;
const STANDARD_NUMBERS_PATTERN = /(^(?:ISAN )?(?:[0-9a-f]{4}-){4}[0-9a-z](?:-(?:[0-9a-f]{4}-){2}[0-9a-z])?$)|(^(?:979-?0-?|M-?)(?:\d{9}|(?=[\d-]{11}$)\d+-\d+-\d)$)|(^ISRN .{1,36}$)|(^(?:ISWC )?T-?\d{9}-?\d$)/i;
exports.STANDARD_NUMBERS_PATTERN = STANDARD_NUMBERS_PATTERN;

function parseDate(date) {
  const parts = date.split('T')[0].replace(/[?~%]$/, '').split('-');
  const year = +parts[0].replace(/^Y(?=-?\d{4}\d+)/, '').replace(/X/g, '0');
  const month = +parts[1];
  const day = +parts[2];

  if (!month || month > 20) {
    return [year];
  } else if (!day) {
    return [year, month];
  } else {
    return [year, month, day];
  }
}

function parseMonth(value) {
  if (value == null) {
    return [];
  }

  if (+value) {
    return [parseInt(value, 10)];
  }

  value = value.trim().toLowerCase();

  if (value in MONTHS) {
    return [MONTHS[value]];
  }

  const parts = value.split(/\s+/);
  let month;
  let day;

  if (parts[0] in MONTHS) {
    month = MONTHS[parts[0]];
    day = parseInt(parts[1]);
  } else if (parts[1] in MONTHS) {
    month = MONTHS[parts[1]];
    day = parseInt(parts[0]);
  }

  return day ? [month, day] : month ? [month] : [];
}

function formatLabel(author, issued, suffix, title) {
  let label = '';

  if (author && author[0]) {
    label += firstWord(author[0].family || author[0].literal);
  }

  if (issued && issued['date-parts'] && issued['date-parts'][0]) {
    label += issued['date-parts'][0][0];
  }

  if (suffix) {
    label += suffix;
  } else if (title) {
    label += firstWord(title);
  }

  return label;
}

const Converters = {
  PICK: {
    toTarget(...args) {
      return args.find(Boolean);
    },

    toSource(value) {
      return [value];
    }

  },
  DATE: {
    toTarget(date) {
      const parts = date.split('/').map(part => part && part !== '..' ? parseDate(part) : undefined);
      return isNaN(parts[0][0]) ? {
        literal: date
      } : {
        'date-parts': parts
      };
    },

    toSource(date) {
      if ('date-parts' in date) {
        return date['date-parts'].map(datePart => datePart.map(datePart => datePart.toString().padStart(2, '0')).join('-')).join('/');
      }
    }

  },
  YEAR_MONTH: {
    toTarget(year, month) {
      if (isNaN(+year)) {
        return {
          literal: year
        };
      } else {
        return {
          'date-parts': [[+year, ...parseMonth(month)]]
        };
      }
    },

    toSource(date) {
      if ('date-parts' in date) {
        const [year, month, day] = date['date-parts'][0];
        return [year.toString(), month ? day ? `${months[month - 1]} ${day}` : month : undefined];
      }
    }

  },
  EPRINT: {
    toTarget(id, type) {
      if (type === 'pubmed') {
        return id;
      }
    },

    toSource(id) {
      return [id, 'pubmed'];
    }

  },
  HOW_PUBLISHED: {
    toTarget(howPublished) {
      if (howPublished.startsWith('http')) {
        return howPublished;
      }
    }

  },
  KEYWORDS: {
    toTarget(list) {
      return list.join(',');
    },

    toSource(list) {
      return list.split(',');
    }

  },
  LABEL: {
    toTarget(label) {
      return [label, label];
    },

    toSource(id, label, author, issued, suffix, title) {
      const safeId = id && id.replace(unsafeChars, '') || 'undefined';

      if (_config.default.format.useIdAsLabel) {
        return safeId;
      }

      if (label && !unsafeChars.test(label)) {
        return label;
      } else {
        return formatLabel(author, issued, suffix, title) || safeId;
      }
    }

  },
  NAMES: {
    toTarget(list) {
      return list.map(name.convertToTarget);
    },

    toSource(list) {
      return list.map(name.convertToSource);
    }

  },
  STANDARD_NUMBERS: {
    toTarget(...args) {
      return args.find(Boolean);
    },

    toSource(number) {
      const match = number.toString().match(STANDARD_NUMBERS_PATTERN);
      return match ? match.slice(1, 5) : [];
    }

  },
  STATUS: {
    toSource(state) {
      if (/^(inpreparation|submitted|forthcoming|inpress|prepublished)$/i.test(state)) {
        return state;
      }
    }

  },
  TITLE: {
    toTarget(title, subtitle, addon) {
      if (subtitle) {
        title += ': ' + subtitle;
      }

      return title;
    },

    toSource(title) {
      return [title];
    }

  }
};
exports.Converters = Converters;
},{"../config":49,"@citation-js/core":"citation-js"}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function formatEntry({
  type,
  label,
  properties
}, dict) {
  const fields = Object.entries(properties).map(([field, value]) => dict.listItem.join(`${field} = {${value}},`));
  return dict.entry.join(`@${type}{${label},${dict.list.join(fields.join(''))}}`);
}

function format(src, dict) {
  const entries = src.map(entry => formatEntry(entry, dict)).join('');
  return dict.bibliographyContainer.join(entries);
}
},{}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

function formatEntry({
  type,
  label,
  properties
}, dict) {
  const fields = Object.entries(properties).concat([['type', type]]).map(([field, value]) => dict.listItem.join(`${field}: ${value}`));
  return dict.entry.join(`[${label}]${dict.list.join(fields.join(''))}`);
}

function format(src, dict) {
  const entries = src.map(entry => formatEntry(entry, dict)).join('\n');
  return dict.bibliographyContainer.join(entries);
}
},{}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;
exports.formatBibtex = formatBibtex;

var _mapping = require("../mapping");

var _value = require("./value");

function formatEntryValues({
  type,
  label,
  properties
}) {
  const output = {};

  for (const property in properties) {
    const value = properties[property];
    output[property] = (0, _value.format)(property, value);
  }

  return {
    type,
    label,
    properties: output
  };
}

function format(entries) {
  return (0, _mapping.format)(entries).map(formatEntryValues);
}

function formatBibtex(entries) {
  return (0, _mapping.formatBibtex)(entries).map(formatEntryValues);
}
},{"../mapping":65,"./value":71}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@citation-js/core");

var _entries = require("./entries");

var _bibtex = require("./bibtex");

var _bibtxt = require("./bibtxt");

const factory = function (mapper, formatter) {
  return function (data, opts = {}) {
    const {
      type,
      format = type || 'text'
    } = opts;
    data = mapper(data);

    if (format === 'object') {
      return data;
    } else if (_core.plugins.dict.has(format)) {
      return formatter(data, _core.plugins.dict.get(format), opts);
    } else {
      throw new RangeError(`Output dictionary "${format}" not available`);
    }
  };
};

var _default = {
  bibtex: factory(_entries.formatBibtex, _bibtex.format),
  biblatex: factory(_entries.format, _bibtex.format),
  bibtxt: factory(_entries.formatBibtex, _bibtxt.format)
};
exports.default = _default;
},{"./bibtex":67,"./bibtxt":68,"./entries":69,"@citation-js/core":"citation-js"}],71:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.format = format;

var _constants = require("../input/constants");

const unicode = {};

for (const command in _constants.commands) {
  unicode[_constants.commands[command]] = command;
}

for (const diacritic in _constants.diacritics) {
  unicode[_constants.diacritics[diacritic]] = diacritic;
}

for (const ligature in _constants.ligatures) {
  unicode[_constants.ligatures[ligature]] = ligature;
}

const UNSAFE_UNICODE = /[^a-zA-Z0-9\s!"#%&'()*+,\-./:;=?@[\]{}\u0300-\u0308\u030a-\u030c\u0332\u0323\u0327\u0328\u0361\u0326]/g;
const DIACRITIC_PATTERN = /.[\u0300-\u0308\u030a-\u030c\u0332\u0323\u0327\u0328\u0361\u0326]+/g;
const listDelimiters = {
  separated: ',',
  list: ' and '
};
const richTextMappings = {
  i: '\\textit{',
  b: '\\textbf{',
  sc: '\\textsc{',
  sup: '\\textsuperscript{',
  sub: '\\textsubscript{',
  'span style="font-variant:small-caps;"': '\\textsc{',
  'span class="nocase"': '{'
};

function escapeValue(value) {
  return value.normalize('NFKD').replace(UNSAFE_UNICODE, char => char in unicode ? unicode[char] in _constants.ligatures ? unicode[char] : `\\${unicode[char]}{}` : '').replace(DIACRITIC_PATTERN, match => Array.from(match).reduce((subject, diacritic) => `{\\${unicode[diacritic]} ${subject}}`));
}

function formatRichText(value) {
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

function formatName(name) {
  if (name.family && !name.prefix && !name.given & !name.suffix) {
    return name.family.includes(listDelimiters.list) ? name.family : `{${name.family}}`;
  }

  const parts = [''];

  if (name.prefix && name.family) {
    parts[0] += name.prefix + ' ';
  }

  if (name.family) {
    parts[0] += name.family;
  }

  if (name.suffix) {
    parts.push(name.suffix);
    parts.push(name.given || '');
  } else {
    parts.push(name.given);
  }

  return escapeValue(parts.join(', ').trim());
}

function formatTitle(title) {
  return formatRichText(title).split(/(:\s*)/).map((part, i) => i % 2 ? part : part.replace(/(?!^)\b[a-z]*[A-Z].*?\b/g, '{$&}')).join('');
}

function formatSingleValue(value, valueType) {
  switch (valueType) {
    case 'title':
      return formatTitle(value);

    case 'literal':
      return formatRichText(value.toString());

    case 'name':
      return formatName(value);

    case 'verbatim':
    case 'uri':
      return value.toString();

    default:
      return escapeValue(value.toString());
  }
}

function formatList(values, valueType, listType) {
  const delimiter = listDelimiters[listType];
  return values.map(value => {
    const formatted = formatSingleValue(value, valueType);
    return formatted.includes(delimiter) ? `{${formatted}}` : formatted;
  }).join(delimiter);
}

function format(field, value) {
  if (!(field in _constants.fieldTypes)) {
    return formatSingleValue(value, 'verbatim');
  }

  const [listType, valueType] = _constants.fieldTypes[field];

  if (listType in listDelimiters) {
    return formatList(value, valueType, listType);
  } else {
    return formatSingleValue(value, valueType);
  }
}
},{"../input/constants":52}],72:[function(require,module,exports){
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
},{"./json":75,"@citation-js/core":"citation-js"}],73:[function(require,module,exports){
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
},{}],74:[function(require,module,exports){
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
},{"./api":72,"./id":73,"./json":75,"./type":76,"@citation-js/core":"citation-js"}],75:[function(require,module,exports){
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
},{"./type":76}],76:[function(require,module,exports){
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
},{}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;
exports.GOOGLE_BOOKS_API_VERSION = void 0;

var _core = require("@citation-js/core");

var name = _interopRequireWildcard(require("@citation-js/name"));

var date = _interopRequireWildcard(require("@citation-js/date"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
const translator = new _core.util.Translator(GOOGLE_PROPS);

function parse(volume) {
  if (volume.volumeInfo.language === 'un') {
    delete volume.volumeInfo.language;
  }

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
},{"@citation-js/core":"citation-js","@citation-js/date":81,"@citation-js/name":46}],78:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _input = require("./input");

_core.plugins.add(_input.ref, {
  input: _input.formats
});
},{"./input":79,"@citation-js/core":"citation-js"}],79:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formats = exports.ref = void 0;

var _core = require("@citation-js/core");

var google = _interopRequireWildcard(require("./google-books.js"));

var ol = _interopRequireWildcard(require("./open-library.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function getUrls(isbn) {
  isbn = isbn.replace(/-/g, '');
  return [[`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, json => json.totalItems], [`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, json => Object.keys(json).length]];
}

function getResponse(isbn) {
  var _iterator = _createForOfIteratorHelper(getUrls(isbn)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const _step$value = _slicedToArray(_step.value, 2),
            url = _step$value[0],
            check = _step$value[1];

      const json = JSON.parse(_core.util.fetchFile(url));

      if (check(json)) {
        return json;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  throw new Error(`Cannot find resource for ISBN: ${isbn}`);
}

function getResponseAsync(_x) {
  return _getResponseAsync.apply(this, arguments);
}

function _getResponseAsync() {
  _getResponseAsync = _asyncToGenerator(function* (isbn) {
    var _iterator2 = _createForOfIteratorHelper(getUrls(isbn)),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        const _step2$value = _slicedToArray(_step2.value, 2),
              url = _step2$value[0],
              check = _step2$value[1];

        const json = JSON.parse(yield _core.util.fetchFileAsync(url));

        if (check(json)) {
          return json;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
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
},{"./google-books.js":77,"./open-library.js":80,"@citation-js/core":"citation-js"}],80:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;

var _core = require("@citation-js/core");

var name = _interopRequireWildcard(require("@citation-js/name"));

var date = _interopRequireWildcard(require("@citation-js/date"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

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
const translator = new _core.util.Translator(OL_PROPS);

function parse(response) {
  return Object.keys(response).map(id => {
    return translator.convertToTarget(response[id]);
  });
}

function format(records) {
  const output = {};

  var _iterator = _createForOfIteratorHelper(records),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const record = _step.value;

      if (!record.ISBN) {
        output[`ISBN:${record.ISBN}`] = translator.convertToSource(record);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return output;
}
},{"@citation-js/core":"citation-js","@citation-js/date":81,"@citation-js/name":46}],81:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"./input":82,"./output":83,"dup":43}],82:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

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
const dateRangeDelimiters = / (?:to|[-/]) | ?(?:--|[–—]) ?|(?<=\d{4}-\d{2}-\d{2})\/(?=\d{4}-\d{2}-\d{2})/;

function getMonth(monthName) {
  return monthMap[monthName.toLowerCase().slice(0, 3)];
}

function parseEpoch(date) {
  const epoch = new Date(date);

  if (typeof date === 'number' && !isNaN(epoch.valueOf())) {
    return [epoch.getFullYear(), epoch.getMonth() + 1, epoch.getDate()];
  } else {
    return null;
  }
}

const parseIso8601 = function parseIso8601(date) {
  const pattern = /^(\d{4}|[-+]\d{6,})-(\d{2})(?:-(\d{2}))?/;

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null;
  }

  const _date$match = date.match(pattern),
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

function parseAmericanDay(date) {
  const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2}(?:\d{2})?)/;

  if (typeof date !== 'string' || !pattern.test(date)) {
    return null;
  }

  const _date$match5 = date.match(pattern),
        _date$match6 = _slicedToArray(_date$match5, 4),
        month = _date$match6[1],
        day = _date$match6[2],
        year = _date$match6[3];

  const check = new Date(year, month, day);

  if (check.getMonth() === parseInt(month)) {
    return [year, month, day];
  } else {
    return null;
  }
}

function parseDay(date) {
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
}

function parseMonth(date) {
  const pattern = /^([a-z]{3,10}|-?\d+)[^\w-]+([a-z]{3,10}|-?\d+)$/i;

  if (typeof date === 'string' && pattern.test(date)) {
    const values = date.match(pattern).slice(1, 3);
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

    const year = values.pop();
    return [year, month];
  } else {
    return null;
  }
}

function parseYear(date) {
  if (typeof date !== 'string') {
    return null;
  }

  const adBc = date.match(/^(\d+) ?(a\.?d\.?|b\.?c\.?)$/i);

  if (adBc) {
    const _adBc$slice = adBc.slice(1),
          _adBc$slice2 = _slicedToArray(_adBc$slice, 2),
          date = _adBc$slice2[0],
          suffix = _adBc$slice2[1];

    return [date * (suffix.toLowerCase()[0] === 'a' ? 1 : -1)];
  } else if (/^-?\d+$/.test(date)) {
    return [date];
  } else {
    return null;
  }
}

function parseDateParts(value) {
  const dateParts = parseEpoch(value) || parseIso8601(value) || parseRfc2822(value) || parseAmericanDay(value) || parseDay(value) || parseMonth(value) || parseYear(value);
  return dateParts && dateParts.map(string => parseInt(string));
}

function parseDate(rangeStart, rangeEnd) {
  const range = [];
  const rangeStartAsRange = typeof rangeStart === 'string' && rangeStart.split(dateRangeDelimiters);

  if (rangeEnd) {
    range.push(rangeStart, rangeEnd);
  } else if (rangeStartAsRange && rangeStartAsRange.length === 2) {
    range.push(...rangeStartAsRange);
  } else {
    range.push(rangeStart);
  }

  const dateParts = range.map(parseDateParts);

  if (dateParts.filter(Boolean).length === range.length) {
    return {
      'date-parts': dateParts
    };
  } else {
    return {
      raw: rangeEnd ? range.join('/') : rangeStart
    };
  }
}

var _default = parseDate;
exports.default = _default;
},{}],83:[function(require,module,exports){
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

  const dateParts = date['date-parts'][0].map(part => part.toString());

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
},{}],84:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"./input":85,"@citation-js/core":"citation-js","dup":78}],85:[function(require,module,exports){
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
},{"@citation-js/core":"citation-js"}],86:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _output = _interopRequireDefault(require("./output"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ref = '@quickstatements';

_core.plugins.add(ref, {
  output: _output.default
});
},{"./output":87,"@citation-js/core":"citation-js"}],87:[function(require,module,exports){
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

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

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
  article: 'Q191067',
  'article-journal': 'Q13442814',
  'article-magazine': 'Q30070590',
  'article-newspaper': 'Q5707594',
  bill: 'Q686822',
  broadcast: 'Q11578774',
  chapter: 'Q1980247',
  dataset: 'Q1172284',
  entry: 'Q10389811',
  'entry-dictionary': 'Q1580166',
  'entry-encyclopedia': 'Q13433827',
  figure: 'Q30070753',
  interview: 'Q178651',
  legal_case: 'Q2334719',
  legislation: 'Q49371',
  manuscript: 'Q87167',
  map: 'Q4006',
  motion_picture: 'Q11424',
  musical_score: 'Q187947',
  'paper-conference': 'Q23927052',
  patent: 'Q253623',
  post: 'Q7216866',
  'post-weblog': 'Q17928402',
  report: 'Q10870555',
  review: 'Q265158',
  'review-book': 'Q637866',
  song: 'Q7366',
  speech: 'Q861911',
  thesis: 'Q1266946',
  treaty: 'Q131569',
  webpage: 'Q36774',
  book: 'Q3331189',
  graphic: 'Q4502142',
  pamphlet: 'Q190399',
  personal_communication: 'Q628523'
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

          return undefined;
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
      return cslType === 'article-journal' || cslType === 'chapter' ? undefined : `"${value}"`;

    case 'language':
      return caches.language[value];

    case 'number-of-pages':
      return value;

    case 'title':
      return `en:"${value.replace(/\s+/g, ' ')}"`;

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

      var _iterator = _createForOfIteratorHelper(results),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          const _step$value = _step.value,
                key = _step$value.key,
                value = _step$value.value,
                cache = _step$value.cache;
          caches[cache][key] = value;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } catch (e) {
      console.error(e);
    }

    let output = '';

    var _iterator2 = _createForOfIteratorHelper(csl),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        const item = _step2.value;
        let prov = '';

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
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return output;
  }

};
exports.default = _default;
},{"@citation-js/core":"citation-js","@citation-js/date":88,"@citation-js/name":46,"wikidata-sdk":176}],88:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"./input":89,"./output":90,"dup":43}],89:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"dup":82}],90:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"dup":83}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CFF_SCHEMA = void 0;

var _jsYaml = _interopRequireDefault(require("js-yaml"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const timestampTag = 'tag:yaml.org,2002:timestamp';
const timestamp = _jsYaml.default.DEFAULT_SCHEMA.compiledTypeMap.scalar[timestampTag];
const date = new _jsYaml.default.Type(timestampTag, {
  kind: 'scalar',
  resolve: timestamp.resolve,
  construct: timestamp.construct,
  instanceOf: Date,

  represent(object) {
    return object.toISOString().split('T')[0];
  }

});

const CFF_SCHEMA = _jsYaml.default.DEFAULT_SCHEMA.extend({
  implicit: [date],
  explicit: []
});

exports.CFF_SCHEMA = CFF_SCHEMA;
},{"js-yaml":115}],92:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;
exports.CFF_VERSION = void 0;

var _core = require("@citation-js/core");

var _date = require("@citation-js/date");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TYPES_TO_TARGET = {
  art: 'graphic',
  article: 'article-journal',
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
}, {
  source: 'orcid',
  target: '_orcid'
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
  publisher: {
    toTarget({
      name,
      city,
      region,
      country
    }) {
      const place = [city, region, country].filter(Boolean).join(', ');
      return [name, place || undefined];
    },

    toSource(name, place) {
      const entity = {
        name
      };

      if (place) {
        const parts = place.split(', ');
        entity.country = parts.pop();

        if (parts.length === 2) {
          entity.region = parts.pop();
        }

        if (parts.length === 1) {
          entity.city = parts.pop();
        }
      }

      return entity;
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
  when: {
    target: {
      type: 'book',
      version: true
    }
  },
  convert: PROP_CONVERTERS.date
}, {
  source: 'doi',
  target: 'DOI'
}, {
  source: 'identifiers',
  target: ['DOI', 'ISBN', 'ISSN', 'PMCID', 'PMID', 'URL'],
  convert: {
    toTarget(identifiers) {
      const newIdentifiers = Array(6).fill(undefined);

      for (const {
        type,
        value
      } of identifiers) {
        if (!this.doi && type === 'doi') {
          newIdentifiers[0] = value;
        }

        if (!this.url && type === 'url') {
          newIdentifiers[5] = value;
        }

        if (type === 'other' && value.startsWith('urn:isbn:')) {
          newIdentifiers[1] = value.slice(9);
        }

        if (type === 'other' && value.startsWith('urn:issn:')) {
          newIdentifiers[2] = value.slice(9);
        }

        if (type === 'other' && value.startsWith('pmcid:')) {
          newIdentifiers[3] = value.slice(6);
        }

        if (type === 'other' && value.startsWith('pmid:')) {
          newIdentifiers[4] = value.slice(5);
        }
      }

      return newIdentifiers;
    },

    toSource(doi, isbn, issn, pmcid, pmid, url) {
      return [doi && {
        type: 'doi',
        value: doi
      }, url && {
        type: 'url',
        value: url
      }, isbn && {
        type: 'other',
        value: `urn:isbn:${isbn}`
      }, issn && {
        type: 'other',
        value: `urn:issn:${issn}`
      }, pmcid && {
        type: 'other',
        value: `pmcid:${pmcid}`
      }, pmid && {
        type: 'other',
        value: `pmid:${pmid}`
      }].filter(Boolean);
    }

  }
}, {
  source: 'keywords',
  target: 'keyword',
  convert: {
    toTarget(keywords) {
      return keywords.join(',');
    },

    toSource(keywords) {
      return keywords.split(/,\s*/g);
    }

  }
}, {
  source: 'title',
  target: 'title',
  when: {
    source: {
      term: false,
      entry: false
    },
    target: {
      type: ['article', 'article-journal', 'article-magazine', 'article-newspaper', 'bill', 'book', 'broadcast', 'chapter', 'dataset', 'figure', 'graphic', 'interview', 'legal_case', 'legislation', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'paper-conference', 'patent', 'personal_communication', 'post', 'post-weblog', 'report', 'review', 'review-book', 'song', 'speech', 'thesis', 'treaty', 'webpage']
    }
  }
}, {
  source: 'title',
  target: 'container-title',
  when: {
    source: {
      entry: true,
      journal: false
    },
    target: {
      type: ['entry']
    }
  }
}, {
  source: 'title',
  target: 'container-title',
  when: {
    source: {
      term: true,
      journal: false
    },
    target: {
      type: ['entry-dictionary', 'entry-encyclopedia']
    }
  }
}, {
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
  source: 'senders',
  target: 'authors',
  convert: PROP_CONVERTERS.names
}, {
  source: 'conference',
  target: ['event', 'event-date', 'event-place'],
  convert: {
    toSource(name, date, place) {
      const entity = {
        name
      };

      if (place) {
        entity.location = place;
      }

      if (date) {
        entity['date-start'] = PROP_CONVERTERS.date.toSource(date);

        if (date['date-parts'] && date['date-parts'].length === 2) {
          entity['date-end'] = PROP_CONVERTERS.date.toSource({
            'date-parts': [date['date-parts'][1]]
          });
        }
      }

      return entity;
    },

    toTarget(event) {
      return [event.name, (0, _date.parse)(event['date-start'].toISOString(), event['date-end'].toISOString()), event.location];
    }

  }
}, {
  source: 'database',
  target: 'source'
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

    target() {
      return this.type !== 'book' || !this.version;
    }

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
}, {
  source: 'entry',
  target: 'title',
  when: {
    source: {
      term: false
    },
    target: {
      type: 'entry'
    }
  }
}, {
  source: 'term',
  target: 'title',
  when: {
    target: {
      type: ['entry-dictionary', 'entry-encyclopedia']
    }
  }
}, {
  source: 'format',
  target: 'dimensions'
}, 'medium', {
  source: 'data-type',
  target: 'genre',
  when: {
    target: {
      type: ['article', 'article-journal', 'article-magazine', 'article-newspaper', 'bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legal_case', 'legislation', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'paper-conference', 'patent', 'personal_communication', 'post', 'post-weblog', 'report', 'review', 'review-book', 'song', 'speech', 'treaty', 'webpage']
    }
  }
}, {
  source: 'thesis-type',
  target: 'genre',
  when: {
    source: {
      'data-type': false
    },
    target: {
      type: 'thesis'
    }
  }
}, {
  source: 'isbn',
  target: 'ISBN'
}, {
  source: 'issn',
  target: 'ISSN'
}, {
  source: 'pmcid',
  target: 'PMCID'
}, 'issue', {
  source: 'journal',
  target: 'container-title'
}, {
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
  source: 'location',
  target: ['archive', 'archive-place'],
  convert: PROP_CONVERTERS.publisher
}, {
  source: 'notes',
  target: 'note',
  when: {
    source: {
      scope: false
    }
  }
}, {
  source: 'scope',
  target: 'note',
  when: {
    target: false
  }
}, 'number', {
  source: 'patent-states',
  target: 'jurisdiction',
  when: {
    target: false
  },
  convert: {
    toTarget(states) {
      return states.join(', ');
    }

  }
}, {
  source: ['institution', 'department'],
  target: ['publisher', 'publisher-place'],
  when: {
    source: {
      publisher: false
    },
    target: {
      type: 'thesis'
    }
  },
  convert: {
    toTarget(institution, department) {
      const [name, place] = PROP_CONVERTERS.publisher.toTarget(institution);
      return [department ? `${department}, ${name}` : name, place];
    },

    toSource(name, place) {
      return [PROP_CONVERTERS.publisher.toSource(name, place)];
    }

  }
}, {
  source: 'publisher',
  target: ['publisher', 'publisher-place'],
  when: {
    target: {
      type: ['article', 'article-journal', 'article-magazine', 'article-newspaper', 'bill', 'book', 'broadcast', 'chapter', 'dataset', 'entry', 'entry-dictionary', 'entry-encyclopedia', 'figure', 'graphic', 'interview', 'legal_case', 'legislation', 'manuscript', 'map', 'motion_picture', 'musical_score', 'pamphlet', 'paper-conference', 'patent', 'personal_communication', 'post', 'post-weblog', 'report', 'review', 'review-book', 'song', 'speech', 'treaty', 'webpage']
    }
  },
  convert: PROP_CONVERTERS.publisher
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
  target: 'page-first',
  when: {
    target: {
      page: false
    }
  }
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
      const output = TYPES_TO_TARGET[type] || 'book';
      return output === 'book' && this.version ? 'software' : output;
    }

  }
}, 'volume', {
  source: 'number-volumes',
  target: 'number-of-volumes'
}];
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
  main,
  message
} = {}) {
  let mainIndex = input.findIndex(entry => main ? entry.id === main : entry._cff_mainReference);
  mainIndex = mainIndex > 0 ? mainIndex : 0;
  const mainRef = mainTranslator.convertToSource(input.splice(mainIndex, 1)[0] || {});

  const cff = _objectSpread({
    'cff-version': CFF_VERSION,
    message: message || 'Please cite the following works when using this software.'
  }, mainRef);

  if (input.length) {
    cff.references = input.map(refTranslator.convertToSource);
  }

  return cff;
}

const CFF_VERSION = '1.1.0';
exports.CFF_VERSION = CFF_VERSION;
},{"@citation-js/core":"citation-js","@citation-js/date":97}],93:[function(require,module,exports){
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

let API_TOKEN = null;
const propMaps = {
  name: 'title-short',
  full_name: 'title',
  description: 'abstract',
  html_url: 'URL',
  pushed_at: 'issued',
  contributors_url: 'author',
  tags_url: 'version'
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

    case 'tags_url':
      {
        const tags = await api(value);
        return tags.length ? tags[0].name : undefined;
      }

    case 'pushed_at':
      return (0, _date.parse)(value);

    default:
      return value;
  }
}

const config = {
  setApiToken(token) {
    API_TOKEN = token;
  }

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
    Accept: 'application/vnd.github.v3+json'
  };

  if (API_TOKEN) {
    headers.Authorization = `token ${API_TOKEN}`;
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
},{"@citation-js/core":"citation-js","@citation-js/date":97,"@citation-js/name":46}],94:[function(require,module,exports){
"use strict";

var _core = require("@citation-js/core");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _cffYaml = require("./cff-yaml");

var cff = _interopRequireWildcard(require("./cff"));

var gh = _interopRequireWildcard(require("./gh"));

var npm = _interopRequireWildcard(require("./npm"));

var zenodo = _interopRequireWildcard(require("./zenodo"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

      parse(file) {
        return _jsYaml.default.load(file, {
          json: true
        });
      }

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
            return version.startsWith('1.');
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
        return _jsYaml.default.dump(output, {
          schema: _cffYaml.CFF_SCHEMA
        });
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

_core.plugins.add('@npm', {
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

_core.plugins.add('@zenodo', {
  input: {
    '@zenodo/metadata+object': {
      parseType: {
        dataType: 'SimpleObject',
        propertyConstraint: {
          props: 'upload_type'
        }
      },
      parse: zenodo.parse
    }
  },
  output: {
    '.zenodo.json'(data, options = {}) {
      const output = zenodo.format(data);

      if (options.type === 'object') {
        return output;
      } else {
        return JSON.stringify(output, null, 2);
      }
    }

  }
});
},{"./cff":92,"./cff-yaml":91,"./gh":93,"./npm":95,"./zenodo":96,"@citation-js/core":"citation-js","js-yaml":115}],95:[function(require,module,exports){
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
},{"@citation-js/core":"citation-js","@citation-js/date":97,"@citation-js/name":46}],96:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.format = format;
exports.VERSION = void 0;

var _core = require("@citation-js/core");

var _name = require("@citation-js/name");

var _date = require("@citation-js/date");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TYPES_TO_TARGET = {
  poster: 'speech',
  presentation: 'speech',
  dataset: 'dataset',
  video: 'motion_picture',
  other: 'book'
};
const PUBLICATION_TYPES_TO_TARGET = {
  book: 'book',
  section: 'chapter',
  conferencepaper: 'paper-conference',
  article: 'article-journal',
  patent: 'patent',
  preprint: 'manuscript',
  report: 'report',
  thesis: 'thesis',
  workingpaper: 'manuscript',
  other: 'article'
};
const IMAGE_TYPES_TO_TARGET = {
  figure: 'figure',
  plot: 'figure',
  drawing: 'graphic',
  diagram: 'figure',
  photo: 'graphic',
  other: 'graphic'
};
const TYPES_TO_SOURCE = {
  article: ['publication', 'article'],
  'article-magazine': ['publication', 'article'],
  'article-newspaper': ['publication', 'article'],
  'article-journal': ['publication', 'article'],
  bill: ['publication', 'other'],
  book: ['publication', 'book'],
  broadcast: ['video'],
  chapter: ['publication', 'section'],
  dataset: ['dataset'],
  entry: ['publication', 'other'],
  'entry-dictionary': ['publication', 'other'],
  'entry-encyclopedia': ['publication', 'other'],
  figure: ['image', 'figure'],
  graphic: ['image', 'other'],
  interview: ['publication', 'other'],
  legislation: ['publication', 'other'],
  legal_case: ['publication', 'other'],
  manuscript: ['publication', 'other'],
  map: ['image', 'other'],
  motion_picture: ['video'],
  musical_score: ['video'],
  pamphlet: ['publication', 'other'],
  'paper-conference': ['publication', 'conferencepaper'],
  patent: ['publication', 'patent'],
  post: ['publication', 'other'],
  'post-weblog': ['publication', 'other'],
  personal_communication: ['publication', 'other'],
  report: ['publication', 'report'],
  review: ['publication', 'article'],
  'review-book': ['publication', 'article'],
  song: ['video'],
  speech: ['presentation'],
  thesis: ['publication', 'thesis'],
  treaty: ['publication', 'other'],
  webpage: ['publication', 'other']
};
const CONVERT = {
  DATE: {
    toTarget(iso) {
      return (0, _date.parse)(iso);
    },

    toSource(date) {
      return (0, _date.format)(date);
    }

  },
  AUTHORS: {
    toTarget(authors) {
      return authors.map(author => _objectSpread(_objectSpread({}, (0, _name.parse)(author.name)), {}, {
        _affiliation: author.affiliation,
        _orcid: author.orcid
      }));
    },

    toSource(authors) {
      return authors.map(author => ({
        name: (0, _name.format)(author, true),
        affiliation: author._affiliation,
        orcid: author._orcid
      }));
    }

  }
};
const WHEN = {
  ARTICLE: {
    source: {
      upload_type: 'publication',
      publication_type: 'article'
    },
    target: {
      type: ['article', 'article-newspaper', 'article-magazine', 'article-journal']
    }
  },
  BOOK: {
    source: {
      upload_type: 'publication',
      publication_type: 'book'
    },
    target: {
      type: 'book'
    }
  },
  CHAPTER: {
    source: {
      upload_type: 'publication',
      publication_type: 'section'
    },
    target: {
      type: 'chapter'
    }
  },
  THESIS: {
    source: {
      upload_type: 'publication',
      publication_type: 'thesis'
    },
    target: {
      type: 'thesis'
    }
  },
  PAPER_CONFERENCE: {
    source: {
      upload_type: 'publication',
      publication_type: 'conferencepaper'
    },
    target: {
      type: 'paper-conference'
    }
  }
};
const METADATA_PROPS = [{
  source: ['upload_type', 'publication_type', 'image_type'],
  target: 'type',
  convert: {
    toTarget(uploadType, publicationType, imageType) {
      if (uploadType === 'publication' && publicationType) {
        return PUBLICATION_TYPES_TO_TARGET[publicationType] || PUBLICATION_TYPES_TO_TARGET.other;
      } else if (uploadType === 'image' && imageType) {
        return IMAGE_TYPES_TO_TARGET[imageType] || IMAGE_TYPES_TO_TARGET.other;
      } else {
        return TYPES_TO_TARGET[uploadType] || TYPES_TO_TARGET.other;
      }
    },

    toSource(type) {
      const [uploadType, secondaryType] = TYPES_TO_SOURCE[type] || ['other'];

      if (uploadType === 'publication') {
        return [uploadType, secondaryType, undefined];
      } else if (uploadType === 'image') {
        return [uploadType, undefined, secondaryType];
      } else {
        return [uploadType, undefined, undefined];
      }
    }

  }
}, {
  source: 'publication_date',
  target: 'issued',
  convert: CONVERT.DATE
}, 'title', {
  source: 'creators',
  target: 'author',
  convert: CONVERT.AUTHORS
}, {
  source: 'description',
  target: 'abstract'
}, {
  source: 'doi',
  target: 'DOI'
}, {
  source: 'keywords',
  target: 'keyword',
  convert: {
    toTarget(keywords) {
      return keywords.map(keyword => keyword.includes(',') ? `"${keyword}"` : keyword).join(',');
    },

    toSource(keywords) {
      return keywords.match(/("(\\[\\"]|[^\\"])"|[^,]+)(?=,|$)/g).map(keyword => keyword.replace(/^"|"$/g, ''));
    }

  }
}, {
  source: 'notes',
  target: 'annote'
}, {
  source: 'contributors',
  target: ['editor', 'producer'],
  convert: {
    toTarget(contributors) {
      const byType = contributors.reduce((byType, contributor) => {
        if (!byType[contributor.type]) byType[contributor.type] = [];
        byType[contributor.type].push(_objectSpread(_objectSpread({}, (0, _name.parse)(contributor.name)), {}, {
          _affiliation: contributor.affiliation,
          _orcid: contributor.orcid
        }));
        return byType;
      }, {});
      return [byType.Editors, byType.Producers];
    },

    toSource(editors, producers) {
      return [...editors.map(name => ['Editors', name]), ...producers.map(name => ['Producers', name])].map(([type, name]) => ({
        type,
        name: (0, _name.format)(name, true),
        affiliation: name._affiliation,
        orcid: name._orcid
      }));
    }

  }
}, 'version', {
  source: 'language',
  target: 'language',
  when: {
    source: true,
    target: {
      language(lang) {
        return lang.length === 2 || lang.length === 3;
      }

    }
  }
}, {
  source: 'journal_title',
  target: 'container-title',
  when: WHEN.ARTICLE
}, {
  source: 'journal_volume',
  target: 'volume',
  when: WHEN.ARTICLE
}, {
  source: 'journal_issue',
  target: 'issue',
  when: WHEN.ARTICLE
}, {
  source: 'journal_pages',
  target: 'page',
  when: WHEN.ARTICLE
}, {
  source: 'conference_title',
  target: 'event'
}, {
  source: 'conference_place',
  target: 'event-place'
}, {
  source: 'conference_dates',
  target: 'event-date',
  convert: {
    toTarget: _date.parse,

    toSource(date) {
      return CONVERT.DATE.toSource(date) + ' to ' + CONVERT.DATE.toSource({
        'date-parts': [date['date-parts'][1]]
      });
    }

  }
}, {
  source: 'conference_session',
  target: 'volume',
  when: WHEN.PAPER_CONFERENCE
}, {
  source: 'conference_session_part',
  target: 'issue',
  when: WHEN.PAPER_CONFERENCE
}, {
  source: 'imprint_publisher',
  target: 'publisher',
  when: WHEN.BOOK
}, {
  source: 'imprint_place',
  target: 'publisher-place'
}, {
  source: 'imprint_isbn',
  target: 'ISBN'
}, {
  source: 'partof_title',
  target: 'container-title',
  when: WHEN.SECTION
}, {
  source: 'partof_pages',
  target: 'page',
  when: WHEN.SECTION
}, {
  source: 'thesis_university',
  target: 'publisher',
  when: WHEN.THESIS
}];
const metadataTranslator = new _core.util.Translator(METADATA_PROPS);

function parse(input) {
  const output = metadataTranslator.convertToTarget(input);
  return output;
}

function format(input) {
  return metadataTranslator.convertToSource(input);
}

const VERSION = '1.0.0';
exports.VERSION = VERSION;
},{"@citation-js/core":"citation-js","@citation-js/date":97,"@citation-js/name":46}],97:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"./input":98,"./output":99,"dup":43}],98:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"dup":82}],99:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"dup":83}],100:[function(require,module,exports){
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
},{"@citation-js/core":"citation-js"}],101:[function(require,module,exports){
module.exports={
  "langs": ["en"]
}

},{}],102:[function(require,module,exports){
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
},{"./prop":105,"./props":106,"./response":107,"@citation-js/core":"citation-js"}],103:[function(require,module,exports){
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
},{"./config":101,"wikidata-sdk":176}],104:[function(require,module,exports){
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
},{"./api":100,"./config":101,"./entity":102,"./id":103,"./prop":105,"./url":109,"@citation-js/core":"citation-js"}],105:[function(require,module,exports){
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
},{"./config":101,"./types":108,"@citation-js/core":"citation-js","@citation-js/date":43,"@citation-js/name":46}],106:[function(require,module,exports){
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

},{}],107:[function(require,module,exports){
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
},{"./api":100,"./id":103,"wikidata-sdk":176}],108:[function(require,module,exports){
module.exports={"Q191067":"article","Q1266946":"thesis","Q187685":"thesis","Q265158":"review","Q1172284":"dataset","Q2352616":"dataset","Q367035":"dataset","Q4006":"map","Q133792":"map","Q842617":"map","Q1425895":"map","Q2334719":"legal_case","Q36774":"webpage","Q15474042":"webpage","Q58494026":"webpage","Q17379835":"webpage","Q17442446":"webpage","Q21281405":"webpage","Q16222597":"webpage","Q653848":"map","Q21944833":"map","Q11424":"motion_picture","Q157443":"motion_picture","Q571":"book","Q87167":"manuscript","Q131569":"treaty","Q216665":"book","Q686822":"bill","Q10870555":"report","Q3099732":"report","Q252550":"treaty","Q3536928":"treaty","Q5707594":"article-newspaper","Q59908":"article","Q1164267":"book","Q18011172":"motion_picture","Q19389637":"article","Q11578774":"broadcast","Q15416":"broadcast","Q1555508":"broadcast","Q26260507":"broadcast","Q580922":"article","Q651270":"article","Q759838":"article","Q1580166":"entry-dictionary","Q1809676":"article","Q2106255":"article","Q1004391":"report","Q2438528":"article","Q6646525":"article","Q7216866":"post","Q7318358":"article","Q7582241":"article","Q10389811":"entry","Q13442814":"article-journal","Q17518557":"article","Q19917774":"article","Q30070590":"article-magazine","Q37974534":"article","Q637866":"review-book","Q5196473":"review","Q5251247":"review","Q42350535":"article","Q51282711":"thesis","Q51282766":"thesis","Q51282798":"thesis","Q51282875":"thesis","Q51282918":"thesis","Q51282969":"thesis","Q51282999":"thesis","Q51283026":"thesis","Q51283053":"thesis","Q51283145":"thesis","Q51283327":"thesis","Q55399605":"thesis","Q58010711":"article","Q60559362":"article","Q480498":"legal_case","Q697327":"legal_case","Q1469824":"dataset","Q2055205":"legal_case","Q162827":"map","Q460214":"map","Q2259701":"map","Q253623":"patent","Q22909582":"review","Q1172480":"dataset","Q45941145":"dataset","Q56515249":"review","Q61992233":"review","Q16968990":"book","Q21191270":"broadcast","Q26225677":"motion_picture","Q56753859":"map","Q57933693":"book","Q2823677":"legal_case","Q2865639":"legal_case","Q7307130":"legal_case","Q8016240":"legal_case","Q11827307":"legal_case","Q16738832":"legal_case","Q18146819":"legal_case","Q18536127":"legal_case","Q20917517":"legal_case","Q7366":"song","Q7302866":"song","Q25203386":"song","Q30637971":"legal_case","Q52768654":"map","Q56123235":"song","Q56612794":"song","Q60566516":"song","Q60809954":"song","Q61221204":"legal_case","Q24634210":"broadcast","Q61855877":"broadcast","Q1006160":"dataset","Q1980247":"chapter","Q19692072":"legal_case","Q23927052":"paper-conference","Q178651":"interview","Q861911":"speech","Q216526":"map","Q2940514":"map","Q3391101":"map","Q55089312":"dataset","Q56704157":"legal_case","Q26205359":"webpage","Q28326484":"webpage","Q28326490":"webpage","Q57312861":"webpage","Q106833":"book","Q128093":"book","Q20540385":"book","Q7433672":"book","Q193495":"book","Q3831846":"book","Q203490":"book","Q254554":"book","Q448980":"book","Q604219":"book","Q605076":"book","Q642946":"book","Q48498":"manuscript","Q727715":"book","Q747381":"book","Q855753":"book","Q890239":"book","Q913554":"book","Q918038":"book","Q922203":"book","Q944359":"book","Q1009641":"book","Q1631107":"dataset","Q26876682":"dataset","Q47114558":"dataset","Q1050259":"book","Q1062404":"book","Q1106827":"book","Q1173065":"book","Q1184488":"book","Q1238720":"book","Q1414013":"book","Q1415108":"book","Q162206":"map","Q191072":"map","Q320228":"map","Q352416":"map","Q441903":"map","Q573980":"map","Q602481":"map","Q715789":"map","Q728502":"map","Q1403728":"map","Q1410020":"map","Q1496857":"book","Q1528894":"book","Q1609706":"book","Q1616547":"book","Q1650727":"book","Q1760610":"book","Q1785330":"book","Q1870591":"book","Q1883939":"book","Q1977520":"book","Q1986787":"book","Q2069066":"book","Q2072218":"book","Q2104296":"book","Q2122442":"book","Q2128336":"book","Q2135225":"book","Q2208044":"book","Q2314679":"book","Q2331348":"book","Q2363145":"book","Q2374324":"book","Q2377289":"book","Q2396513":"book","Q2514954":"book","Q2537127":"book","Q2787237":"book","Q2831984":"book","Q3045706":"book","Q3831821":"book","Q3831847":"book","Q3915339":"book","Q4067007":"book","Q4224691":"book","Q4515179":"book","Q4677625":"book","Q4686085":"book","Q4931288":"book","Q5073531":"book","Q5093328":"book","Q5159310":"book","Q6675210":"book","Q8275050":"book","Q10666342":"book","Q11396303":"book","Q11750596":"book","Q12308638":"book","Q12410152":"book","Q12731131":"book","Q13137339":"book","Q13430107":"book","Q13636757":"book","Q13751595":"book","Q16046027":"book","Q16385949":"book","Q16507688":"book","Q16736578":"book","Q17134316":"book","Q21598767":"book","Q21662746":"book","Q22988237":"book","Q25679217":"book","Q12912091":"motion_picture","Q1453402":"map","Q1502030":"map","Q1664468":"map","Q1783108":"map","Q1787111":"dataset","Q1875628":"map","Q2089517":"map","Q2127425":"map","Q2353983":"map","Q2368091":"map","Q2426254":"map","Q2470969":"map","Q2471702":"map","Q2620815":"map","Q2656361":"map","Q2940478":"map","Q3509676":"map","Q3515498":"map","Q4505959":"map","Q4845530":"map","Q26267321":"book","Q26271823":"book","Q27560760":"book","Q29154430":"book","Q29586870":"book","Q31946409":"book","Q38143661":"book","Q52005090":"book","Q52153485":"book","Q55610842":"book","Q56552233":"book","Q57790812":"book","Q58142059":"book","Q58211632":"book","Q58807269":"book","Q60226001":"book","Q60475414":"book","Q60475468":"book","Q60627667":"book","Q61696018":"book","Q5047387":"map","Q5177325":"map","Q5434353":"map","Q6017843":"map","Q6664848":"map","Q7104865":"map","Q10544122":"map","Q11426259":"map","Q11618908":"map","Q14321585":"map","Q15877105":"map","Q17047956":"map","Q21935483":"map","Q22125384":"map","Q59457513":"map","Q60054914":"map","Q846662":"broadcast","Q5778924":"motion_picture","Q8513":"dataset","Q178376":"dataset","Q1675302":"map","Q267628":"article","Q871232":"article","Q3694604":"article","Q3719255":"article","Q19375673":"article","Q442919":"interview","Q850171":"interview","Q1384479":"interview","Q1477475":"interview","Q1067324":"motion_picture","Q1941707":"motion_picture","Q3055290":"interview","Q3055291":"interview","Q450873":"patent","Q681875":"patent","Q913351":"patent","Q5465504":"patent","Q2049275":"manuscript","Q213924":"manuscript","Q274076":"manuscript","Q597695":"manuscript","Q720106":"manuscript","Q865595":"manuscript","Q1067768":"manuscript","Q1266076":"manuscript","Q2209578":"manuscript","Q2217259":"manuscript","Q2531964":"manuscript","Q2816501":"manuscript","Q19787436":"patent","Q19787437":"patent","Q35639987":"patent","Q43305660":"patent","Q59818481":"dataset","Q1949797":"legal_case","Q18918145":"article-journal","Q2782326":"article-journal","Q3149408":"legal_case","Q18342738":"speech","Q3228788":"speech","Q3731370":"legal_case","Q17123524":"book","Q336144":"motion_picture","Q867242":"book","Q1093720":"treaty","Q193170":"treaty","Q625298":"treaty","Q837144":"treaty","Q864737":"treaty","Q931855":"treaty","Q1242841":"treaty","Q1414340":"treaty","Q1414472":"treaty","Q1498487":"treaty","Q1646218":"treaty","Q1671773":"treaty","Q1711115":"treaty","Q2290707":"treaty","Q2300991":"treaty","Q2465017":"treaty","Q3125472":"manuscript","Q3220177":"manuscript","Q3240926":"manuscript","Q3252544":"manuscript","Q3560324":"manuscript","Q3749265":"manuscript","Q3824506":"treaty","Q3960554":"manuscript","Q4426710":"treaty","Q4475654":"manuscript","Q4872029":"treaty","Q4985043":"treaty","Q7012086":"manuscript","Q7452368":"manuscript","Q9026959":"manuscript","Q11613006":"manuscript","Q13430250":"manuscript","Q17143154":"manuscript","Q21089188":"manuscript","Q22669850":"manuscript","Q22948347":"manuscript","Q25351420":"manuscript","Q31078443":"manuscript","Q33308141":"manuscript","Q11122":"treaty","Q451584":"legal_case","Q876477":"bill","Q1006544":"bill","Q1288220":"legal_case","Q2206565":"legal_case","Q2783852":"legal_case","Q5500839":"legal_case","Q7246224":"bill","Q7257705":"bill","Q7885007":"bill","Q859161":"dataset","Q1650567":"webpage","Q11439":"webpage","Q16602140":"bill","Q16821677":"bill","Q28457660":"bill","Q2261569":"webpage","Q2641220":"webpage","Q2737701":"webpage","Q14204246":"webpage","Q21025364":"webpage","Q23691297":"webpage","Q58040463":"webpage","Q44873079":"interview","Q4202018":"interview","Q4317093":"interview","Q7256239":"interview","Q7625207":"interview","Q8776455":"interview","Q45933791":"interview","Q60723716":"interview","Q6908053":"treaty","Q6934728":"treaty","Q6944158":"treaty","Q9160460":"treaty","Q9557810":"treaty","Q11455760":"treaty","Q11637357":"treaty","Q16567729":"treaty","Q19357149":"book","Q184528":"speech","Q203737":"speech","Q261197":"speech","Q554211":"speech","Q749054":"speech","Q787020":"speech","Q805093":"speech","Q960189":"speech","Q1346967":"speech","Q1840948":"speech","Q1980740":"speech","Q2183050":"speech","Q2895132":"speech","Q3030189":"speech","Q3040417":"speech","Q4329077":"speech","Q4388316":"speech","Q5152362":"speech","Q200092":"motion_picture","Q224700":"motion_picture","Q248583":"motion_picture","Q457832":"motion_picture","Q622548":"motion_picture","Q624771":"motion_picture","Q16835935":"treaty","Q16956642":"treaty","Q19958750":"treaty","Q27768121":"treaty","Q29526855":"treaty","Q29527278":"treaty","Q29527544":"treaty","Q29883540":"treaty","Q30921722":"treaty","Q38653134":"treaty","Q39234269":"treaty","Q41535471":"treaty","Q50192946":"treaty","Q57205857":"treaty","Q1194534":"dataset","Q7979513":"speech","Q11261492":"speech","Q11496736":"speech","Q11504413":"speech","Q13611058":"speech","Q13632631":"speech","Q15853847":"speech","Q18907443":"speech","Q19776345":"speech","Q28472611":"speech","Q56191193":"speech","Q56192445":"speech","Q60061482":"speech","Q60780612":"speech","Q47123453":"report","Q1054574":"motion_picture","Q860626":"motion_picture","Q959790":"motion_picture","Q1788980":"motion_picture","Q2331945":"motion_picture","Q188473":"motion_picture","Q2678111":"motion_picture","Q2991560":"motion_picture","Q2484376":"motion_picture","Q16950433":"motion_picture","Q18331260":"motion_picture","Q19952560":"motion_picture","Q5428822":"broadcast","Q13582719":"song","Q388480":"song","Q950683":"book","Q39825":"dataset","Q49918":"dataset","Q82753":"dataset","Q186588":"dataset","Q15706459":"article-journal","Q59387148":"report","Q6960620":"book","Q7094076":"dataset","Q367680":"dataset","Q857354":"dataset","Q1503133":"book","Q3219655":"dataset","Q3304360":"dataset","Q5227330":"dataset","Q7943567":"dataset","Q17305522":"dataset","Q18814183":"dataset","Q21264512":"dataset","Q43570203":"dataset","Q44106130":"dataset","Q50826803":"dataset","Q55387750":"dataset","Q593744":"dataset","Q83790":"book","Q539662":"dataset","Q605175":"dataset","Q550089":"dataset","Q36524":"dataset","Q1673963":"dataset","Q17152639":"dataset","Q20088085":"entry-dictionary","Q15633587":"webpage","Q15138389":"webpage","Q20088089":"entry-dictionary","Q5398426":"broadcast","Q1259759":"broadcast","Q7724161":"broadcast","Q21664088":"broadcast","Q234262":"chapter","Q21481766":"chapter","Q26989423":"chapter","Q29154515":"chapter","Q43148525":"chapter","Q43180447":"chapter","Q53460949":"chapter","Q327349":"dataset","Q1394657":"dataset","Q1988927":"dataset","Q201456":"dataset","Q220393":"dataset","Q3071343":"dataset","Q254213":"dataset","Q319949":"dataset","Q672598":"dataset","Q780605":"dataset","Q815410":"dataset","Q819688":"dataset","Q854459":"dataset","Q897682":"dataset","Q1114135":"dataset","Q1147639":"dataset","Q1400059":"dataset","Q1665882":"dataset","Q1754061":"dataset","Q1915979":"dataset","Q1991865":"dataset","Q2038458":"dataset","Q2249973":"dataset","Q2597555":"dataset","Q3346024":"dataset","Q5141544":"dataset","Q5146094":"dataset","Q5962346":"dataset","Q6941730":"dataset","Q7096331":"dataset","Q10413470":"dataset","Q15194024":"dataset","Q11722865":"dataset","Q273057":"dataset","Q16832380":"dataset","Q20820424":"dataset","Q22692845":"dataset","Q52666561":"dataset","Q59209277":"dataset","Q59977151":"dataset","Q60686104":"dataset","Q2262868":"dataset","Q7449052":"dataset","Q596138":"motion_picture","Q3464665":"broadcast","Q24862":"motion_picture","Q7751682":"motion_picture","Q187044":"article-newspaper","Q22812458":"broadcast","Q170238":"broadcast","Q309481":"article-newspaper","Q2495037":"article-newspaper","Q2602337":"article-newspaper","Q5149212":"article-newspaper","Q17628188":"article-newspaper","Q17633526":"article-newspaper","Q17928402":"post-weblog","Q50081413":"webpage","Q20136634":"article","Q43290228":"article","Q57988118":"post","Q40745":"legal_case","Q245072":"legal_case","Q321568":"legal_case","Q375727":"legal_case","Q699735":"report","Q836925":"report","Q788874":"legal_case","Q830689":"report","Q1668727":"report","Q1498464":"legal_case","Q1926270":"report","Q2070370":"legal_case","Q2145003":"legal_case","Q2307704":"report","Q2309880":"report","Q2677586":"report","Q3000100":"report","Q3922396":"legal_case","Q4343952":"report","Q4690599":"report","Q6451276":"report","Q7968600":"legal_case","Q7918438":"report","Q12038591":"legal_case","Q13433827":"entry","Q15629444":"report","Q17090395":"report","Q17329259":"entry-encyclopedia","Q19355445":"report","Q61704031":"broadcast","Q27027169":"report","Q41274869":"report","Q47126552":"report","Q56013707":"report","Q58089619":"legal_case","Q157394":"motion_picture","Q207601":"broadcast","Q1504425":"article-journal","Q1241826":"broadcast","Q2155186":"broadcast","Q2435927":"broadcast","Q2774197":"article-journal","Q3588923":"broadcast","Q5177022":"broadcast","Q7316896":"article-journal","Q7551315":"motion_picture","Q10709386":"broadcast","Q622812":"broadcast","Q11079003":"broadcast","Q10885494":"article-journal","Q11293915":"broadcast","Q11325507":"broadcast","Q11334197":"broadcast","Q11351206":"broadcast","Q11378697":"broadcast","Q187947":"musical_score","Q11451968":"broadcast","Q11483878":"broadcast","Q11491683":"broadcast","Q12183006":"article-journal","Q18458820":"broadcast","Q56478376":"article-journal","Q58038936":"article-journal","Q58898396":"article-journal","Q58900805":"article-journal","Q58901470":"article-journal","Q58902427":"article-journal","Q59458414":"article-journal","Q4249087":"legal_case","Q5710433":"legal_case","Q60456691":"legal_case","Q17074865":"map","Q18609332":"legal_case","Q29197":"broadcast","Q18011171":"motion_picture","Q506240":"motion_picture","Q653916":"motion_picture","Q240862":"motion_picture","Q914242":"motion_picture","Q5287435":"broadcast","Q5338721":"motion_picture","Q13359539":"broadcast","Q21191265":"broadcast","Q26225765":"motion_picture","Q29555881":"broadcast","Q50062923":"broadcast","Q50914552":"broadcast","Q61220733":"broadcast","Q1924747":"dataset","Q26868375":"dataset","Q61782522":"dataset","Q2033233":"dataset","Q39086821":"review","Q595971":"dataset","Q3539533":"dataset","Q276":"broadcast","Q182415":"broadcast","Q336181":"broadcast","Q356055":"broadcast","Q358942":"broadcast","Q431102":"broadcast","Q661436":"broadcast","Q677466":"motion_picture","Q854995":"broadcast","Q986699":"broadcast","Q1261214":"broadcast","Q1358344":"broadcast","Q1366112":"broadcast","Q1407240":"broadcast","Q1407245":"broadcast","Q1472288":"broadcast","Q1619206":"broadcast","Q1684600":"broadcast","Q1819008":"broadcast","Q1962634":"broadcast","Q1857766":"broadcast","Q1924371":"broadcast","Q1948292":"broadcast","Q2081003":"broadcast","Q2231383":"broadcast","Q2304946":"broadcast","Q3744532":"broadcast","Q5455086":"broadcast","Q6626746":"broadcast","Q7697093":"broadcast","Q14623351":"broadcast","Q3511312":"broadcast","Q10676514":"broadcast","Q202866":"motion_picture","Q1107":"motion_picture","Q581714":"broadcast","Q21191019":"broadcast","Q11086742":"motion_picture","Q11504513":"broadcast","Q14942329":"broadcast","Q15836186":"broadcast","Q16068806":"broadcast","Q16206641":"broadcast","Q17145545":"broadcast","Q18640746":"broadcast","Q19845560":"broadcast","Q19973797":"broadcast","Q21217315":"broadcast","Q25090976":"broadcast","Q27912070":"broadcast","Q28664032":"broadcast","Q34682961":"broadcast","Q46706005":"broadcast","Q118171":"dataset","Q192588":"dataset","Q193351":"dataset","Q212805":"dataset","Q333761":"dataset","Q702448":"dataset","Q1869909":"motion_picture","Q29982285":"broadcast","Q780524":"dataset","Q989016":"dataset","Q1172362":"dataset","Q1235236":"dataset","Q1373925":"dataset","Q1391125":"dataset","Q1393704":"dataset","Q1414426":"dataset","Q1494224":"dataset","Q1519460":"dataset","Q1787017":"dataset","Q1957894":"dataset","Q2599456":"dataset","Q2274762":"dataset","Q2302053":"dataset","Q2404903":"dataset","Q2532732":"dataset","Q2881060":"dataset","Q2912944":"dataset","Q3133368":"dataset","Q3454922":"dataset","Q4117139":"dataset","Q4501235":"dataset","Q4677551":"dataset","Q5062195":"dataset","Q5322831":"dataset","Q5473309":"dataset","Q5572370":"dataset","Q7246853":"dataset","Q7702836":"dataset","Q9067653":"dataset","Q14806568":"dataset","Q15097084":"dataset","Q15100572":"dataset","Q16155335":"dataset","Q17014602":"dataset","Q22811662":"dataset","Q24579448":"dataset","Q28146196":"dataset","Q33270056":"dataset","Q36570165":"dataset","Q45028176":"dataset","Q54933017":"dataset","Q55341040":"dataset","Q59157251":"dataset","Q13406463":"webpage","Q60856733":"dataset","Q521414":"dataset","Q883895":"dataset","Q986756":"dataset","Q1345528":"dataset","Q3404855":"dataset","Q3405306":"dataset","Q3518943":"dataset","Q3664416":"dataset","Q4127466":"dataset","Q4350734":"dataset","Q60557971":"dataset","Q4350735":"dataset","Q4350754":"dataset","Q5058966":"dataset","Q5058970":"dataset","Q5058971":"dataset","Q5058968":"dataset","Q5058969":"dataset","Q5058974":"dataset","Q5058975":"dataset","Q5058972":"dataset","Q5058978":"dataset","Q5058977":"dataset","Q5058981":"dataset","Q5058989":"dataset","Q5334384":"dataset","Q7015254":"dataset","Q10497456":"dataset","Q12058091":"dataset","Q16056280":"dataset","Q19894430":"dataset","Q24934691":"dataset","Q25383554":"dataset","Q26207721":"dataset","Q28730356":"dataset","Q29795177":"dataset","Q8025448":"book","Q1114458":"book","Q3027814":"book","Q3268307":"book","Q3491290":"book","Q4955683":"book","Q5197887":"book","Q6071891":"book","Q5296":"webpage","Q57819011":"legal_case","Q57821094":"legal_case","Q218013":"dataset","Q283579":"dataset","Q426674":"dataset","Q479833":"dataset","Q721795":"dataset","Q838281":"dataset","Q843670":"dataset","Q877809":"dataset","Q900856":"dataset","Q949532":"dataset","Q1265166":"dataset","Q1571814":"dataset","Q2025786":"book","Q2250844":"book","Q4034405":"book","Q5227352":"dataset","Q2115":"dataset","Q14679":"dataset","Q577697":"map","Q5150048":"map","Q16840211":"book","Q21032630":"book","Q8034663":"book","Q11191558":"book","Q13769783":"dataset","Q14902318":"dataset","Q24063789":"dataset","Q25975660":"dataset","Q26260540":"dataset","Q11266439":"webpage","Q26267864":"dataset","Q26987229":"dataset","Q27198004":"dataset","Q28948553":"dataset","Q29053519":"dataset","Q29694587":"dataset","Q41709380":"dataset","Q47459830":"dataset","Q57936091":"book","Q58902997":"book","Q7572716":"dataset","Q59913845":"song","Q2143665":"motion_picture","Q1957385":"motion_picture","Q5769663":"motion_picture","Q5855976":"motion_picture","Q1441669":"broadcast","Q1441929":"broadcast","Q16943561":"broadcast","Q19858063":"broadcast","Q19858074":"broadcast","Q19858077":"broadcast","Q19858082":"broadcast","Q19858080":"broadcast","Q19858086":"broadcast","Q19858087":"broadcast","Q19858088":"broadcast","Q19858095":"broadcast","Q19858093":"broadcast","Q19858098":"broadcast","Q19858107":"broadcast","Q19858110":"broadcast","Q19858108":"broadcast","Q19858123":"broadcast","Q19858126":"broadcast","Q19858124":"broadcast","Q19858125":"broadcast","Q19858142":"broadcast","Q19858143":"broadcast","Q19858140":"broadcast","Q19858141":"broadcast","Q19859744":"broadcast","Q19859780":"broadcast","Q1271915":"dataset","Q2250805":"map","Q2359829":"map","Q2415383":"map","Q2869471":"map","Q4816871":"map","Q5135690":"map","Q11025270":"map","Q21936815":"map","Q21938018":"map","Q26885495":"map","Q333779":"map","Q640492":"map","Q690851":"manuscript","Q1105486":"manuscript","Q1501880":"map","Q1501945":"map","Q1550537":"map","Q1974665":"map","Q2915844":"map","Q54298448":"map","Q21188110":"broadcast","Q918098":"broadcast","Q4765080":"broadcast","Q17113138":"broadcast","Q856314":"manuscript","Q928128":"manuscript","Q19969434":"manuscript","Q5647631":"manuscript","Q1190781":"manuscript","Q1620808":"manuscript","Q1675712":"manuscript","Q3637297":"manuscript","Q18558914":"manuscript","Q492264":"musical_score","Q10590726":"motion_picture","Q60259696":"manuscript","Q60323106":"manuscript","Q60325498":"manuscript","Q60363009":"manuscript","Q2552822":"musical_score","Q7452061":"musical_score","Q3962157":"map","Q16825889":"map","Q1826720":"map","Q3935817":"dataset","Q18616720":"dataset","Q7601206":"dataset","Q7620972":"map","Q1353555":"dataset","Q22961568":"book","Q93204":"motion_picture","Q7832972":"motion_picture","Q312083":"map","Q322943":"treaty","Q459435":"motion_picture","Q587240":"manuscript","Q595819":"treaty","Q850950":"dataset","Q1003870":"treaty","Q1688818":"map","Q1048515":"map","Q1473669":"manuscript","Q1667520":"map","Q2723202":"map","Q2941628":"dataset","Q2981686":"manuscript","Q2981685":"manuscript","Q7551149":"motion_picture","Q2933856":"book","Q266680":"map","Q1702772":"map","Q2035351":"map","Q2073537":"manuscript","Q2204393":"map","Q2325507":"map","Q5469880":"report","Q5469893":"report","Q5469912":"report","Q10438653":"map","Q42793629":"speech","Q2678443":"dataset","Q1923776":"book","Q2981450":"book","Q1413174":"dataset","Q185529":"motion_picture","Q16254232":"motion_picture","Q31803237":"treaty","Q32945468":"dataset","Q59825643":"dataset","Q934552":"dataset","Q200562":"broadcast","Q303064":"broadcast","Q1484397":"broadcast","Q2049337":"broadcast","Q2123557":"broadcast","Q2308891":"report","Q2665960":"report","Q5227671":"broadcast","Q18030695":"report","Q18385907":"broadcast","Q21190411":"broadcast","Q47512784":"report","Q56330488":"book","Q33111614":"motion_picture","Q484692":"song","Q1033831":"song","Q1497584":"book","Q19705":"book","Q628080":"book","Q1535505":"book","Q2333573":"book","Q3357101":"book","Q12041885":"book","Q5151497":"motion_picture","Q7999883":"article","Q18398246":"motion_picture","Q56309057":"manuscript","Q61314299":"dataset","Q234280":"chapter","Q234300":"chapter","Q862334":"book","Q2973181":"motion_picture","Q3072049":"motion_picture","Q1747837":"motion_picture","Q12029612":"dataset","Q50380591":"book","Q51881567":"book","Q60029764":"book","Q914229":"article","Q5465451":"article","Q20135338":"motion_picture","Q1541065":"report","Q2594143":"dataset","Q16664076":"report","Q441261":"dataset","Q457843":"dataset","Q783287":"dataset","Q1115961":"dataset","Q1713174":"dataset","Q3327521":"dataset","Q151":"dataset","Q17123180":"motion_picture","Q15982056":"article-newspaper","Q59191021":"dataset","Q59248059":"dataset","Q59248072":"dataset","Q1371849":"dataset","Q17438413":"dataset","Q61914117":"dataset","Q3352071":"motion_picture","Q25051296":"webpage","Q25054829":"dataset","Q267136":"dataset","Q488053":"book","Q914881":"book","Q1397073":"dataset","Q1662581":"dataset","Q2268965":"dataset","Q3292731":"book","Q3406872":"dataset","Q5033354":"dataset","Q5227322":"dataset","Q5532670":"dataset","Q7515656":"book","Q7598341":"dataset","Q7995661":"dataset","Q14523803":"book","Q17146953":"dataset","Q25110279":"book","Q30008669":"book","Q30009376":"book","Q41623316":"dataset","Q38647918":"book","Q249697":"speech","Q1428914":"dataset","Q255135":"book","Q471894":"book","Q586744":"book","Q956165":"book","Q1569753":"book","Q2939758":"book","Q12040484":"book","Q13583784":"book","Q59351530":"book","Q61020892":"book","Q17086104":"map","Q17147147":"map","Q19393521":"map","Q58884":"broadcast","Q2635894":"broadcast","Q193842":"map","Q261468":"map","Q943929":"song","Q1123037":"song","Q336822":"song","Q336371":"map","Q459798":"map","Q831939":"map","Q865144":"map","Q889561":"map","Q1152543":"map","Q1187667":"broadcast","Q1281814":"map","Q1674401":"map","Q1742009":"broadcast","Q1778220":"map","Q1800237":"map","Q2126801":"map","Q2125867":"broadcast","Q2298569":"map","Q2940627":"map","Q4903803":"map","Q5687679":"map","Q10480692":"map","Q10604395":"map","Q10916116":"book","Q11960416":"map","Q12008992":"map","Q58901209":"dataset","Q19969268":"broadcast","Q20741385":"book","Q21009694":"book","Q24879310":"dataset","Q56028349":"book","Q56240541":"broadcast","Q56697520":"book","Q60586493":"dataset","Q183169":"webpage","Q825914":"book","Q1391116":"dataset","Q1516252":"book","Q1569406":"dataset","Q1609353":"dataset","Q1609504":"dataset","Q1862738":"book","Q2110197":"dataset","Q3237931":"broadcast","Q3956369":"broadcast","Q3962380":"dataset","Q4769616":"dataset","Q4804740":"book","Q5051330":"dataset","Q5615468":"dataset","Q6822329":"dataset","Q6912943":"broadcast","Q7144753":"dataset","Q10688394":"book","Q12331427":"dataset","Q15961983":"broadcast","Q18311760":"broadcast","Q1499601":"dataset","Q5374928":"map","Q7444356":"motion_picture","Q6729489":"motion_picture","Q7444692":"map","Q8036547":"map","Q1383152":"dataset","Q3564515":"speech","Q3890208":"dataset","Q21050458":"dataset","Q21050912":"dataset","Q26721650":"dataset","Q31841013":"dataset","Q1865123":"dataset","Q206290":"dataset","Q1088118":"dataset","Q7502102":"dataset","Q17121221":"map","Q23888763":"book","Q46992920":"speech","Q52506277":"dataset","Q51719975":"broadcast","Q19364663":"book","Q22938710":"book","Q193977":"motion_picture","Q59032066":"song","Q1989725":"song","Q2135500":"manuscript","Q3153927":"speech","Q526877":"broadcast","Q742157":"article-newspaper","Q6899707":"map","Q725377":"book","Q10541153":"book","Q21198407":"book","Q369074":"dataset","Q3249257":"motion_picture","Q4373044":"motion_picture","Q172067":"motion_picture","Q1046788":"motion_picture","Q24886171":"broadcast","Q53746253":"broadcast","Q16709869":"book","Q16960707":"book","Q19941906":"book","Q21660824":"book","Q21818614":"book","Q57987419":"interview","Q57987455":"interview","Q57987589":"interview","Q61725752":"book","Q225672":"book","Q263790":"book","Q284465":"book","Q431193":"book","Q608971":"book","Q634123":"book","Q817063":"book","Q833590":"book","Q1027825":"book","Q1385360":"book","Q1754581":"book","Q2114246":"book","Q2144117":"book","Q2732056":"book","Q2955456":"book","Q4203401":"book","Q7163040":"book","Q7603925":"broadcast","Q12765421":"book","Q15276670":"book","Q15627042":"book","Q6548306":"book","Q12046416":"map","Q472298":"legal_case","Q1261319":"map","Q5563391":"map","Q26644852":"broadcast","Q29167422":"dataset","Q7211":"dataset","Q48473":"dataset","Q217327":"legal_case","Q951437":"dataset","Q636033":"dataset","Q672593":"dataset","Q739047":"dataset","Q891854":"legal_case","Q1207369":"dataset","Q1391014":"dataset","Q1642648":"dataset","Q2859990":"dataset","Q3307317":"dataset","Q4330194":"dataset","Q6813020":"legal_case","Q6901292":"legal_case","Q7251471":"dataset","Q18711682":"legal_case","Q20057286":"dataset","Q23015465":"dataset","Q24243801":"dataset","Q24249534":"dataset","Q25917186":"legal_case","Q27214933":"dataset","Q28934204":"legal_case","Q39740866":"dataset","Q59495116":"dataset","Q60208424":"dataset","Q61037469":"legal_case","Q40426579":"map","Q43037778":"map","Q47008743":"map","Q26225493":"book","Q29043181":"dataset","Q55850593":"song","Q55850643":"song","Q58885732":"song","Q58885754":"song","Q927803":"song","Q430010":"song","Q2292588":"song","Q2499178":"dataset","Q2560570":"dataset","Q3077240":"dataset","Q3491832":"dataset","Q1235234":"dataset","Q7096323":"dataset","Q7831478":"song","Q1564816":"legal_case","Q2698974":"legal_case","Q20089346":"motion_picture","Q5366020":"motion_picture","Q11526166":"speech","Q4167410":"webpage","Q845159":"motion_picture","Q1003021":"dataset","Q4167836":"webpage","Q1249224":"report","Q11382506":"webpage","Q15475226":"webpage","Q15475319":"webpage","Q1991869":"book","Q11690026":"book","Q31209114":"webpage","Q35243371":"webpage","Q48781895":"motion_picture","Q56005592":"webpage","Q17586363":"book","Q20043999":"book","Q59738577":"webpage","Q61033232":"webpage","Q61033736":"dataset","Q61034350":"webpage","Q29573701":"dataset","Q645928":"motion_picture","Q3209941":"report","Q5165404":"bill","Q11078958":"report","Q45182324":"article-journal","Q56119332":"post-weblog","Q60797":"speech","Q1474597":"speech","Q2069352":"book","Q2983424":"motion_picture","Q19359000":"report","Q24067746":"post-weblog","Q51844620":"dataset","Q51539995":"webpage","Q55422400":"broadcast","Q130232":"motion_picture","Q635115":"dataset","Q1553078":"dataset","Q1784036":"book","Q1813223":"book","Q2326951":"book","Q2500820":"book","Q3423635":"dataset","Q4363806":"book","Q14605760":"webpage","Q21875313":"book","Q24633474":"broadcast","Q28136925":"broadcast","Q28135032":"broadcast","Q28472638":"speech","Q28472722":"speech","Q1011299":"broadcast","Q3276244":"broadcast","Q29883647":"treaty","Q42214612":"treaty","Q60215679":"broadcast","Q60215966":"broadcast","Q7033567":"treaty","Q8576":"treaty","Q3257212":"book","Q5166307":"treaty","Q7865023":"treaty","Q8187836":"treaty","Q16923948":"treaty","Q17211914":"treaty","Q20874666":"treaty","Q39233713":"treaty","Q8041497":"patent","Q50823049":"report","Q61715571":"book","Q193934":"book","Q193955":"book","Q990683":"book","Q12047175":"book","Q1250520":"dataset","Q2334774":"song","Q22001389":"dataset","Q61782519":"dataset","Q112762":"song","Q177771":"song","Q178122":"song","Q207683":"song","Q216860":"song","Q261434":"song","Q318894":"song","Q319448":"song","Q380233":"song","Q493169":"song","Q502658":"song","Q523896":"song","Q591990":"song","Q608253":"song","Q744327":"song","Q758422":"song","Q783874":"song","Q784074":"song","Q820119":"song","Q844450":"song","Q873000":"song","Q944800":"song","Q959583":"song","Q988502":"song","Q1009280":"song","Q2281713":"song","Q1033810":"song","Q1033813":"song","Q1151663":"song","Q1195253":"song","Q1195630":"song","Q1228189":"song","Q20477577":"dataset","Q1972954":"dataset","Q842256":"motion_picture","Q643684":"motion_picture","Q1033573":"dataset","Q1205607":"dataset","Q1971947":"dataset","Q2145124":"dataset","Q2819247":"dataset","Q4685824":"dataset","Q7002108":"dataset","Q7200622":"dataset","Q8267601":"dataset","Q9732903":"webpage","Q11002482":"webpage","Q12096573":"webpage","Q16059585":"webpage","Q16059613":"webpage","Q16059624":"webpage","Q19208935":"webpage","Q21450877":"webpage","Q31936067":"dataset","Q47500192":"dataset","Q1229479":"song","Q1232283":"song","Q1236108":"song","Q1288193":"song","Q1372064":"song","Q1382036":"song","Q1779217":"song","Q1779319":"song","Q1899706":"song","Q1905727":"song","Q1942905":"song","Q1956166":"song","Q1963108":"song","Q1966622":"song","Q2038845":"song","Q2058312":"song","Q2108499":"song","Q2165184":"song","Q2235992":"song","Q2298624":"song","Q2312959":"song","Q2358279":"song","Q2544997":"song","Q2707688":"song","Q2737175":"song","Q2891357":"song","Q2894096":"song","Q2956164":"song","Q2956172":"song","Q3033130":"song","Q3246270":"song","Q3299089":"song","Q3482281":"song","Q3562031":"song","Q3843655":"song","Q3889661":"song","Q3918025":"song","Q4056436":"song","Q4130112":"song","Q4528554":"song","Q4770819":"song","Q4797274":"song","Q5031532":"song","Q5037289":"song","Q5747946":"song","Q5766029":"song","Q6109162":"song","Q7148059":"song","Q7314000":"song","Q7561608":"song","Q7824869":"song","Q8053529":"song","Q8261762":"song","Q10677514":"song","Q21653344":"song","Q56572789":"song","Q503354":"song","Q11214531":"song","Q12115862":"song","Q12135013":"song","Q12313565":"song","Q13829124":"song","Q15810872":"song","Q15907187":"song","Q16084298":"song","Q16194930":"song","Q16912992":"song","Q17118203":"song","Q17150323":"song","Q18012876":"song","Q18406550":"song","Q19607140":"song","Q20087039":"song","Q20107778":"song","Q20980372":"song","Q21127215":"song","Q22086714":"song","Q23072435":"song","Q25022242":"song","Q27981708":"song","Q27981857":"song","Q29051387":"song","Q37731261":"song","Q42681239":"song","Q46863086":"song","Q55596270":"song","Q56425213":"song","Q56425237":"song","Q61688673":"song","Q229390":"motion_picture","Q319221":"motion_picture","Q369747":"motion_picture","Q370630":"motion_picture","Q421719":"motion_picture","Q430525":"motion_picture","Q455315":"motion_picture","Q459290":"motion_picture","Q505119":"motion_picture","Q517386":"motion_picture","Q652256":"motion_picture","Q663106":"motion_picture","Q790192":"motion_picture","Q848512":"motion_picture","Q1060398":"motion_picture","Q1146335":"motion_picture","Q1200678":"motion_picture","Q1251417":"motion_picture","Q1320115":"motion_picture","Q1361932":"motion_picture","Q1397462":"motion_picture","Q1933746":"motion_picture","Q1935609":"motion_picture","Q2125170":"motion_picture","Q2156835":"motion_picture","Q2165644":"motion_picture","Q2301591":"motion_picture","Q4382232":"broadcast","Q2321734":"motion_picture","Q2553613":"motion_picture","Q2903140":"motion_picture","Q3072043":"motion_picture","Q3250548":"motion_picture","Q3585697":"motion_picture","Q3648909":"motion_picture","Q3677141":"motion_picture","Q3677185":"motion_picture","Q3745400":"motion_picture","Q3745430":"motion_picture","Q4220915":"motion_picture","Q4484381":"motion_picture","Q5145881":"motion_picture","Q5378150":"motion_picture","Q7130449":"motion_picture","Q7858343":"motion_picture","Q9259727":"motion_picture","Q12309044":"motion_picture","Q12377598":"motion_picture","Q16721823":"motion_picture","Q16909344":"motion_picture","Q19799105":"motion_picture","Q19799133":"motion_picture","Q20442589":"motion_picture","Q20650540":"motion_picture","Q21182682":"motion_picture","Q24887738":"motion_picture","Q28735856":"motion_picture","Q29017630":"motion_picture","Q30070675":"motion_picture","Q30897819":"motion_picture","Q33373157":"motion_picture","Q43079104":"motion_picture","Q54086290":"motion_picture","Q54344007":"motion_picture","Q56192069":"motion_picture","Q58415294":"motion_picture","Q58903570":"motion_picture","Q61283808":"motion_picture","Q219557":"motion_picture","Q226730":"motion_picture","Q24865":"motion_picture","Q24869":"motion_picture","Q31235":"motion_picture","Q3956596":"book","Q20012720":"book","Q27070652":"book","Q738826":"speech","Q2623953":"speech","Q2781658":"speech","Q3479856":"speech","Q7454995":"speech","Q735478":"motion_picture","Q124922":"motion_picture","Q472637":"motion_picture","Q1092621":"motion_picture","Q1323308":"motion_picture","Q1352102":"motion_picture","Q1464369":"motion_picture","Q1474387":"motion_picture","Q1480924":"motion_picture","Q1760864":"motion_picture","Q1800833":"motion_picture","Q2084909":"motion_picture","Q27697957":"motion_picture","Q2670855":"motion_picture","Q3566966":"motion_picture","Q4765076":"motion_picture","Q20732395":"motion_picture","Q1684595":"dataset","Q7168625":"motion_picture","Q8192124":"motion_picture","Q5008290":"dataset","Q220399":"dataset","Q285745":"dataset","Q542475":"motion_picture","Q846544":"motion_picture","Q3072039":"motion_picture","Q23739":"broadcast","Q338632":"broadcast","Q288608":"broadcast","Q3421644":"broadcast","Q5465514":"broadcast","Q5812300":"broadcast","Q18340550":"webpage","Q21232614":"broadcast","Q1224870":"dataset","Q79715":"broadcast","Q278425":"dataset","Q548206":"motion_picture","Q632149":"motion_picture","Q996838":"motion_picture","Q1147986":"motion_picture","Q2258523":"map","Q2514870":"dataset","Q2559958":"broadcast","Q4342538":"map","Q15518544":"broadcast","Q15518777":"broadcast","Q20707560":"dataset","Q20871935":"motion_picture","Q55960075":"motion_picture","Q1224984":"dataset","Q5227308":"dataset","Q12328550":"dataset","Q20089094":"motion_picture","Q21040941":"dataset","Q668312":"motion_picture","Q30047053":"dataset","Q18493502":"legal_case","Q1067692":"motion_picture","Q18655723":"motion_picture","Q844993":"song","Q4763437":"book","Q19894488":"book","Q262533":"speech","Q591055":"speech","Q1851305":"speech","Q3588034":"speech","Q20669604":"speech","Q29642901":"dataset","Q1061420":"map","Q2914518":"map","Q186286":"broadcast","Q940462":"broadcast","Q15823625":"map","Q54328426":"broadcast","Q1713326":"motion_picture","Q4453959":"motion_picture","Q5905221":"musical_score","Q23368955":"motion_picture","Q55848868":"motion_picture","Q3072024":"motion_picture","Q965136":"map","Q3546572":"broadcast","Q5449041":"motion_picture","Q6645282":"broadcast","Q25360500":"broadcast","Q376820":"dataset","Q2422383":"dataset","Q14552560":"article-newspaper","Q219897":"dataset","Q787397":"map","Q14943256":"book","Q15715669":"map","Q3196335":"book","Q4700148":"book","Q11669289":"map","Q56683168":"map","Q6749508":"dataset","Q13039854":"dataset","Q19354904":"legal_case","Q25917154":"legal_case","Q25456031":"dataset","Q47484674":"dataset","Q948454":"dataset","Q1734165":"dataset","Q5441632":"book","Q7321644":"book","Q7890265":"book","Q28406796":"dataset","Q46130774":"dataset","Q54820068":"book","Q17146139":"map","Q23691":"song","Q54251760":"motion_picture","Q851995":"map","Q25336664":"dataset","Q11310550":"dataset","Q18086661":"dataset","Q18086666":"dataset","Q18086667":"dataset","Q18086665":"dataset","Q18086671":"dataset","Q18089574":"dataset","Q18089575":"dataset","Q18099930":"dataset","Q18100125":"dataset","Q18889352":"dataset","Q18922463":"dataset","Q20005020":"dataset","Q798134":"thesis","Q1414362":"thesis","Q30749496":"thesis","Q46629343":"thesis","Q51282441":"thesis","Q52823264":"thesis","Q58210330":"thesis","Q1907875":"thesis","Q23745":"broadcast","Q399811":"broadcast","Q775344":"broadcast","Q1658957":"broadcast","Q1786567":"broadcast","Q4783297":"broadcast","Q5219865":"broadcast","Q7185299":"broadcast","Q7731786":"broadcast","Q7892363":"broadcast","Q11086745":"broadcast","Q20986817":"broadcast","Q60393504":"broadcast","Q16342":"dataset","Q632285":"dataset","Q1751819":"dataset","Q2560532":"dataset","Q6517465":"dataset","Q1898445":"map","Q41436524":"book","Q50310598":"dataset","Q5366501":"broadcast","Q9018710":"broadcast","Q11935070":"broadcast","Q688869":"manuscript","Q962741":"manuscript","Q7797194":"dataset","Q1662452":"motion_picture","Q4499034":"song","Q6009879":"book","Q595801":"book","Q894351":"map","Q1352815":"broadcast","Q1569955":"dataset","Q2538131":"book","Q3348148":"dataset","Q5535082":"dataset","Q7574095":"dataset","Q47214765":"broadcast","Q61990518":"broadcast","Q2933978":"broadcast","Q6537693":"dataset","Q6888313":"book","Q12270042":"book","Q21292860":"broadcast","Q350514":"map","Q357674":"map","Q5191437":"dataset","Q24265951":"dataset","Q25110971":"book","Q29966258":"dataset","Q25894883":"dataset","Q2093973":"book","Q1711400":"broadcast","Q3071014":"broadcast","Q61029068":"webpage","Q61996773":"webpage","Q175902":"dataset","Q1295532":"webpage","Q1474116":"webpage","Q1501313":"dataset","Q1916557":"dataset","Q5333554":"dataset","Q7247749":"dataset","Q4330198":"dataset","Q5570651":"dataset","Q7251500":"dataset","Q7277178":"dataset","Q7689673":"dataset","Q15407973":"webpage","Q15647814":"webpage","Q16335141":"dataset","Q18392279":"dataset","Q15623926":"webpage","Q22808320":"webpage","Q24571879":"webpage","Q24574745":"webpage","Q17362920":"webpage","Q28065731":"webpage","Q28208970":"dataset","Q30432511":"webpage","Q54662266":"webpage","Q56428020":"webpage","Q58036154":"webpage","Q58181524":"webpage","Q58423626":"webpage","Q59541917":"webpage","Q59542487":"webpage","Q5227321":"dataset","Q178840":"broadcast","Q482612":"broadcast","Q662197":"broadcast","Q1054760":"broadcast","Q1273568":"broadcast","Q1676730":"broadcast","Q1802588":"broadcast","Q2388283":"broadcast","Q3189895":"broadcast","Q3951815":"broadcast","Q5778915":"broadcast","Q7050677":"broadcast","Q7135559":"broadcast","Q9335577":"broadcast","Q9671105":"broadcast","Q20061443":"broadcast","Q20220309":"broadcast","Q20267837":"broadcast","Q21233490":"broadcast","Q21191068":"broadcast","Q27868077":"broadcast","Q30939244":"broadcast","Q55082620":"broadcast","Q56320653":"broadcast","Q45787211":"dataset","Q1799894":"broadcast","Q19220511":"dataset","Q7841716":"motion_picture","Q5987970":"book","Q7864671":"motion_picture","Q21504449":"broadcast","Q61896850":"motion_picture","Q61911910":"motion_picture","Q15184295":"webpage","Q29581299":"book","Q3507630":"dataset","Q5571730":"webpage","Q13231199":"webpage","Q15851373":"webpage","Q19692233":"webpage","Q2921195":"book","Q20009925":"webpage","Q21167233":"webpage","Q25456482":"webpage","Q26884324":"webpage","Q28197061":"webpage","Q30032916":"webpage","Q33532284":"webpage","Q37152856":"webpage","Q19887878":"webpage","Q30044873":"report","Q11664270":"broadcast","Q1852859":"map","Q2297927":"motion_picture","Q2188827":"manuscript","Q4922471":"broadcast","Q16247289":"broadcast","Q25381170":"book","Q25696292":"dataset","Q11398":"dataset","Q210918":"dataset","Q267474":"dataset","Q1062352":"dataset","Q548492":"dataset","Q732744":"dataset","Q1520859":"dataset","Q1744559":"dataset","Q2748242":"dataset","Q3445240":"dataset","Q3518464":"dataset","Q3546241":"dataset","Q5172500":"dataset","Q6857882":"dataset","Q7398671":"dataset","Q22808060":"song","Q22298551":"dataset","Q22935148":"dataset","Q23014490":"dataset","Q23015153":"dataset","Q185867":"motion_picture","Q192625":"dataset","Q784969":"dataset","Q917904":"dataset","Q3546232":"dataset","Q4382932":"dataset","Q2357684":"dataset","Q2490652":"dataset","Q562667":"treaty","Q11510761":"treaty","Q39234115":"treaty","Q39235586":"treaty","Q39236188":"treaty","Q39236506":"treaty","Q39237589":"treaty","Q691836":"dataset","Q2299775":"dataset","Q2584888":"dataset","Q934210":"dataset","Q16355541":"dataset","Q57560929":"song","Q59826893":"dataset","Q478216":"dataset","Q1138178":"dataset","Q2621880":"dataset","Q2859969":"dataset","Q2964498":"dataset","Q4223049":"dataset","Q4421014":"dataset","Q16549505":"dataset","Q21441341":"dataset","Q26975748":"dataset","Q5366097":"motion_picture","Q1137588":"song","Q6022825":"broadcast","Q15977715":"broadcast","Q24906243":"broadcast","Q471839":"motion_picture","Q1794431":"motion_picture","Q3080071":"broadcast","Q6942568":"motion_picture","Q11900986":"motion_picture","Q16677772":"motion_picture","Q17517379":"motion_picture","Q20667187":"motion_picture","Q29168811":"motion_picture","Q34487266":"broadcast","Q47486001":"motion_picture","Q57780531":"motion_picture","Q223770":"motion_picture","Q4836991":"motion_picture","Q212781":"motion_picture","Q41270":"song","Q383904":"song","Q564848":"song","Q721644":"song","Q5158512":"song","Q6037387":"song","Q3962943":"motion_picture","Q21759196":"motion_picture","Q60630702":"motion_picture","Q222639":"motion_picture","Q1033891":"motion_picture","Q1535153":"motion_picture","Q1740789":"motion_picture","Q1776156":"motion_picture","Q1894374":"motion_picture","Q2421031":"motion_picture","Q332564":"motion_picture","Q853630":"motion_picture","Q909586":"motion_picture","Q987831":"motion_picture","Q1341051":"motion_picture","Q1342372":"motion_picture","Q1696148":"motion_picture","Q2584671":"motion_picture","Q4174664":"motion_picture","Q883179":"motion_picture","Q4925568":"motion_picture","Q5551875":"motion_picture","Q13377551":"motion_picture","Q16247268":"motion_picture","Q18089587":"motion_picture","Q18355406":"motion_picture","Q18648407":"motion_picture","Q4840473":"motion_picture","Q20656232":"motion_picture","Q23044991":"motion_picture","Q25110269":"motion_picture","Q27959357":"motion_picture","Q28968258":"motion_picture","Q28968511":"motion_picture","Q43911809":"motion_picture","Q1276148":"dataset","Q3546236":"dataset","Q819652":"motion_picture","Q1433443":"motion_picture","Q2096633":"motion_picture","Q10654943":"motion_picture","Q15898171":"motion_picture","Q1502766":"motion_picture","Q22981906":"motion_picture","Q33218678":"dataset","Q33219080":"dataset","Q1502102":"dataset","Q290066":"dataset","Q21473954":"dataset","Q884257":"map","Q1136047":"song","Q3442060":"motion_picture","Q6722594":"motion_picture","Q22802898":"dataset","Q1147354":"song","Q541947":"song","Q762917":"song","Q896981":"song","Q1329536":"song","Q1523875":"song","Q1802243":"song","Q4666464":"song","Q5419334":"song","Q5956747":"song","Q5956766":"song","Q10288496":"song","Q13142456":"song","Q54932319":"broadcast","Q16523070":"book","Q1345076":"dataset","Q1331138":"dataset","Q4984974":"motion_picture","Q5442753":"motion_picture","Q59688552":"motion_picture","Q1030329":"motion_picture","Q2560052":"motion_picture","Q50306849":"dataset","Q9351310":"dataset","Q17093751":"motion_picture","Q55616422":"motion_picture","Q5400070":"motion_picture","Q7097859":"motion_picture","Q2518205":"motion_picture","Q39774781":"song","Q40039114":"song","Q496523":"motion_picture","Q586250":"motion_picture","Q658334":"song","Q1206090":"song","Q2642760":"motion_picture","Q2956178":"song","Q3656521":"song","Q4184716":"song","Q4400497":"song","Q5897543":"motion_picture","Q10743749":"song","Q11989328":"song","Q12623540":"song","Q19367312":"motion_picture","Q47011432":"broadcast","Q61057707":"broadcast","Q1192644":"broadcast","Q1193356":"broadcast","Q1193877":"broadcast","Q1193889":"broadcast","Q1198546":"broadcast","Q1200102":"broadcast","Q1200891":"broadcast","Q1203502":"broadcast","Q1328971":"broadcast","Q15548228":"broadcast","Q18611586":"broadcast","Q27986339":"broadcast","Q16984663":"motion_picture","Q535518":"motion_picture","Q583768":"motion_picture","Q1377546":"motion_picture","Q2254193":"motion_picture","Q2292320":"motion_picture","Q3677202":"motion_picture","Q4044177":"motion_picture","Q4075563":"motion_picture","Q731194":"motion_picture","Q5578091":"motion_picture","Q5768328":"motion_picture","Q6926334":"motion_picture","Q7116678":"motion_picture","Q2527949":"dataset","Q6410349":"song","Q58006100":"dataset","Q1065413":"dataset","Q1334294":"dataset","Q5281480":"dataset","Q14806579":"dataset","Q21629439":"broadcast","Q27965091":"broadcast","Q27965088":"broadcast","Q27965089":"broadcast","Q1117103":"motion_picture","Q15077373":"song","Q21848887":"song","Q42525933":"song","Q1246452":"song","Q1564657":"song","Q1786016":"song","Q4138449":"song","Q26211803":"dataset","Q28107644":"dataset","Q438958":"dataset","Q893182":"dataset","Q1361620":"dataset","Q1744558":"dataset","Q2558761":"broadcast","Q3663344":"dataset","Q5837451":"dataset","Q17080472":"dataset","Q18762344":"dataset","Q22936940":"dataset","Q51282626":"thesis","Q51283070":"thesis","Q51283092":"thesis","Q51283110":"thesis","Q51283164":"thesis","Q51283181":"thesis","Q51283199":"thesis","Q51283219":"thesis","Q51283231":"thesis","Q51283362":"thesis","Q1789476":"dataset","Q1741854":"broadcast","Q11396323":"motion_picture","Q1428162":"song","Q4440575":"song","Q2137852":"motion_picture","Q20443008":"motion_picture","Q9049284":"song","Q2976573":"dataset","Q7247163":"dataset","Q18327786":"dataset","Q18327800":"dataset","Q28444881":"song","Q47009776":"motion_picture","Q4078107":"song","Q12242979":"broadcast","Q1308255":"dataset","Q828962":"dataset","Q2976602":"dataset","Q881912":"broadcast","Q16861376":"dataset","Q59784758":"broadcast","Q829147":"song","Q6457531":"motion_picture","Q28030321":"broadcast","Q28225717":"broadcast","Q4663261":"webpage","Q15145755":"webpage","Q18707678":"webpage","Q18711811":"webpage","Q20160182":"webpage","Q20870830":"webpage","Q22676729":"webpage","Q26214208":"webpage","Q28801937":"webpage","Q30279428":"webpage","Q55510433":"webpage","Q59259626":"webpage","Q20769287":"webpage","Q23894233":"webpage","Q24046192":"webpage","Q24514938":"webpage","Q30330522":"webpage","Q38084761":"webpage","Q58118449":"webpage","Q2886579":"dataset","Q21623879":"webpage","Q28092864":"webpage","Q52147067":"webpage","Q18043430":"webpage","Q18810260":"dataset","Q18889371":"dataset","Q18889411":"dataset","Q20893947":"legal_case","Q43096126":"motion_picture","Q56876503":"webpage","Q58408484":"webpage","Q58492747":"webpage","Q61984657":"webpage","Q3309896":"motion_picture","Q5864844":"motion_picture","Q6190581":"webpage","Q25826840":"webpage","Q220898":"motion_picture","Q2513417":"dataset","Q56885002":"webpage","Q179600":"dataset","Q714750":"dataset","Q15101896":"dataset","Q56558180":"song","Q845648":"webpage","Q58310010":"book","Q16937368":"song","Q28135297":"song","Q50309914":"dataset","Q57560968":"song","Q61740934":"song","Q61729725":"song","Q1047299":"motion_picture","Q2281511":"motion_picture","Q4292083":"motion_picture","Q11446446":"motion_picture","Q11464558":"motion_picture","Q11620244":"motion_picture","Q11673786":"motion_picture","Q16000226":"motion_picture","Q43069510":"motion_picture","Q8066387":"motion_picture","Q16824564":"motion_picture","Q52631698":"song","Q20589414":"song","Q20621902":"song","Q19659229":"song","Q2997685":"song","Q5124548":"song","Q512410":"song","Q23978249":"song","Q6647160":"webpage","Q18170752":"song","Q5881246":"song","Q1723850":"motion_picture","Q169672":"motion_picture","Q622310":"motion_picture","Q3072042":"motion_picture","Q5104880":"motion_picture","Q193605":"song","Q20818018":"dataset","Q1065444":"motion_picture","Q5258881":"motion_picture","Q856638":"dataset","Q5769583":"motion_picture","Q5769580":"motion_picture","Q5769586":"motion_picture","Q5769589":"motion_picture","Q5769592":"motion_picture","Q34848596":"motion_picture","Q2145099":"motion_picture","Q43082648":"broadcast","Q21441352":"dataset","Q2976563":"dataset","Q4680764":"dataset","Q4936202":"dataset","Q4992609":"dataset","Q5281190":"dataset","Q5281191":"dataset","Q5281189":"dataset","Q5281192":"dataset","Q5281193":"dataset","Q5465786":"dataset","Q5575198":"dataset","Q7133628":"dataset","Q7133619":"dataset","Q7133626":"dataset","Q7133625":"dataset","Q7133631":"dataset","Q7133632":"dataset","Q7133633":"dataset","Q7135076":"dataset","Q7136196":"dataset","Q7532102":"dataset","Q7539622":"dataset","Q7539620":"dataset","Q7992082":"dataset","Q7992083":"dataset","Q7992119":"dataset","Q7992116":"dataset","Q7992128":"dataset","Q7992164":"dataset","Q17145514":"dataset","Q28130146":"dataset","Q28130147":"dataset","Q28130145":"dataset","Q28134034":"dataset","Q28134060":"dataset","Q28134100":"dataset","Q28134126":"dataset","Q4179738":"song","Q26829682":"webpage","Q22870229":"webpage","Q22875692":"webpage","Q22876063":"webpage","Q22876332":"webpage","Q25737003":"webpage","Q25830508":"webpage","Q57971242":"webpage","Q5611964":"webpage","Q5613278":"webpage","Q5615491":"webpage","Q5618337":"webpage","Q5620523":"webpage","Q5621344":"webpage","Q5622928":"webpage","Q5624848":"webpage","Q5626725":"webpage","Q5636579":"webpage","Q5827463":"webpage","Q5904431":"webpage","Q5911510":"webpage","Q6072180":"webpage","Q6232685":"webpage","Q6305829":"webpage","Q6372354":"webpage","Q6419146":"webpage","Q6499145":"webpage","Q6584170":"webpage","Q6584434":"webpage","Q6606549":"webpage","Q6622740":"webpage","Q6632234":"webpage","Q7241821":"webpage","Q7485705":"webpage","Q8784047":"webpage","Q10560362":"webpage","Q10584970":"webpage","Q10712699":"webpage","Q10730006":"webpage","Q10805463":"webpage","Q10992965":"webpage","Q11011669":"webpage","Q11052053":"webpage","Q11223110":"webpage","Q11839555":"webpage","Q12930680":"webpage","Q13383621":"webpage","Q13394564":"webpage","Q13492790":"webpage","Q13512760":"webpage","Q13763959":"webpage","Q14335223":"webpage","Q14336297":"webpage","Q14336339":"webpage","Q14358273":"webpage","Q14358335":"webpage","Q14358826":"webpage","Q14358898":"webpage","Q14358899":"webpage","Q14396951":"webpage","Q14404469":"webpage","Q14445515":"webpage","Q22867433":"webpage","Q15709178":"webpage","Q17615621":"webpage","Q18340985":"webpage","Q18881752":"webpage","Q22668105":"webpage","Q22706969":"webpage","Q22830149":"webpage","Q22834716":"webpage","Q22834726":"webpage","Q22838914":"webpage","Q22844738":"webpage","Q22846593":"webpage","Q22846942":"webpage","Q22846954":"webpage","Q22846964":"webpage","Q22858302":"webpage","Q22862005":"webpage","Q22867722":"webpage","Q22869003":"webpage","Q33130924":"motion_picture","Q30415057":"webpage","Q55648788":"webpage","Q4663903":"webpage","Q21528878":"webpage","Q22247630":"webpage","Q249083":"dataset","Q1750705":"dataset","Q955185":"dataset","Q1326107":"dataset","Q1520639":"dataset","Q2943040":"dataset","Q6404298":"dataset","Q7248117":"dataset","Q7674850":"dataset","Q29057009":"webpage","Q35250433":"webpage","Q35779580":"webpage","Q47382471":"webpage","Q47524402":"webpage","Q54734643":"webpage","Q58573615":"webpage","Q61866692":"webpage","Q8615872":"webpage","Q21286738":"webpage","Q21469493":"webpage","Q21479588":"webpage","Q23841178":"webpage","Q24571886":"webpage","Q26211786":"dataset","Q28368760":"webpage","Q28373483":"webpage","Q849666":"motion_picture","Q18089617":"motion_picture","Q18889701":"dataset","Q20010800":"webpage","Q163126":"dataset","Q1967745":"dataset","Q2122972":"dataset","Q2565860":"dataset","Q3516420":"dataset","Q13331174":"webpage","Q15088954":"dataset","Q15885744":"dataset","Q16069643":"dataset","Q17146890":"dataset","Q18435139":"dataset","Q20107258":"dataset","Q23894246":"webpage","Q57733325":"dataset","Q17175676":"motion_picture","Q26196748":"motion_picture","Q21484471":"webpage","Q265147":"song","Q56558213":"song","Q627181":"song","Q1151259":"song","Q7023411":"song","Q190635":"dataset","Q526334":"dataset","Q1982918":"dataset","Q2362354":"dataset","Q22842824":"webpage","Q3129804":"motion_picture","Q22677515":"webpage","Q48552277":"webpage","Q56876519":"webpage","Q11753321":"webpage","Q15671253":"webpage","Q20769160":"webpage","Q24731821":"webpage","Q26142649":"webpage","Q36330215":"webpage","Q6306272":"webpage","Q14385296":"webpage","Q14403646":"webpage","Q20107493":"dataset","Q20743001":"webpage","Q14460829":"webpage","Q11643859":"song","Q16141944":"song","Q17990546":"song","Q20043946":"song","Q44292661":"webpage","Q29075123":"webpage","Q40218570":"webpage","Q910144":"dataset","Q5622823":"webpage","Q13565583":"webpage","Q19648608":"webpage","Q19915239":"dataset","Q21278897":"webpage","Q21441359":"dataset","Q21441363":"dataset","Q23841351":"webpage","Q26932615":"webpage","Q26961029":"webpage","Q27949687":"webpage","Q27949697":"webpage","Q28858528":"webpage","Q29075121":"webpage","Q922853":"song","Q3879286":"song","Q3368338":"dataset","Q10997407":"webpage","Q19842659":"webpage","Q56062113":"webpage"}

},{}],109:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = void 0;

const parse = input => input.match(/\/(Q\d+)(?:[#?/]|\s*$)/)[1];

exports.parse = parse;
},{}],110:[function(require,module,exports){
"use strict";

require("whatwg-fetch");

var _core = require("@citation-js/core");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

  for (const plugin of _core.plugins.list()) {
    const config = _core.plugins.config.get(plugin);

    if (config) {
      Object.assign(config, getOpts(pluginConfig, plugin.slice(1)));
    }
  }

  const elements = document.getElementsByClassName('citation-js');
  Array.prototype.map.call(elements, async function (element) {
    const format = element.dataset.outputFormat || 'bibliography';

    const options = _objectSpread(_objectSpread({}, getOpts(element.dataset, 'output')), {}, {
      format: 'html'
    });

    try {
      const csl = _core.plugins.config.get('@csl');

      if (options.template && !csl.templates.has(options.template)) {
        csl.templates.add(options.template, await get(`https://${CSL_BASE_URL}/styles@master/${options.template}.csl`));
      }

      if (options.lang && !csl.locales.has(options.lang)) {
        csl.locales.add(options.lang, await get(`https://${CSL_BASE_URL}/locales@master/${options.lang}.csl`));
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
},{"@citation-js/core":"citation-js","whatwg-fetch":147}],111:[function(require,module,exports){
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

},{}],112:[function(require,module,exports){
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
},{"base64-js":111,"buffer":112,"ieee754":113}],113:[function(require,module,exports){
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

},{}],114:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":147}],115:[function(require,module,exports){
'use strict';


var loader = require('./lib/loader');
var dumper = require('./lib/dumper');


function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


module.exports.Type                = require('./lib/type');
module.exports.Schema              = require('./lib/schema');
module.exports.FAILSAFE_SCHEMA     = require('./lib/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./lib/schema/json');
module.exports.CORE_SCHEMA         = require('./lib/schema/core');
module.exports.DEFAULT_SCHEMA      = require('./lib/schema/default');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.dump                = dumper.dump;
module.exports.YAMLException       = require('./lib/exception');

// Re-export all types in case user wants to create custom schema
module.exports.types = {
  binary:    require('./lib/type/binary'),
  float:     require('./lib/type/float'),
  map:       require('./lib/type/map'),
  null:      require('./lib/type/null'),
  pairs:     require('./lib/type/pairs'),
  set:       require('./lib/type/set'),
  timestamp: require('./lib/type/timestamp'),
  bool:      require('./lib/type/bool'),
  int:       require('./lib/type/int'),
  merge:     require('./lib/type/merge'),
  omap:      require('./lib/type/omap'),
  seq:       require('./lib/type/seq'),
  str:       require('./lib/type/str')
};

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad            = renamed('safeLoad', 'load');
module.exports.safeLoadAll         = renamed('safeLoadAll', 'loadAll');
module.exports.safeDump            = renamed('safeDump', 'dump');

},{"./lib/dumper":117,"./lib/exception":118,"./lib/loader":119,"./lib/schema":120,"./lib/schema/core":121,"./lib/schema/default":122,"./lib/schema/failsafe":123,"./lib/schema/json":124,"./lib/type":126,"./lib/type/binary":127,"./lib/type/bool":128,"./lib/type/float":129,"./lib/type/int":130,"./lib/type/map":131,"./lib/type/merge":132,"./lib/type/null":133,"./lib/type/omap":134,"./lib/type/pairs":135,"./lib/type/seq":136,"./lib/type/set":137,"./lib/type/str":138,"./lib/type/timestamp":139}],116:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;

},{}],117:[function(require,module,exports){
'use strict';

/*eslint-disable no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_SCHEMA      = require('./schema/default');

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || DEFAULT_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

module.exports.dump = dump;

},{"./common":116,"./exception":118,"./schema/default":122}],118:[function(require,module,exports){
// YAML error class. http://stackoverflow.com/questions/8458984
//
'use strict';


function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


module.exports = YAMLException;

},{}],119:[function(require,module,exports){
'use strict';

/*eslint-disable max-len,no-use-before-define*/

var common              = require('./common');
var YAMLException       = require('./exception');
var makeSnippet         = require('./snippet');
var DEFAULT_SCHEMA      = require('./schema/default');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = makeSnippet(mark);

  return new YAMLException(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


module.exports.loadAll = loadAll;
module.exports.load    = load;

},{"./common":116,"./exception":118,"./schema/default":122,"./snippet":125}],120:[function(require,module,exports){
'use strict';

/*eslint-disable max-len*/

var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;

},{"./exception":118,"./type":126}],121:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


module.exports = require('./json');

},{"./json":124}],122:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


module.exports = require('./core').extend({
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../type/binary":127,"../type/merge":132,"../type/omap":134,"../type/pairs":135,"../type/set":137,"../type/timestamp":139,"./core":121}],123:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":120,"../type/map":131,"../type/seq":136,"../type/str":138}],124:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


module.exports = require('./failsafe').extend({
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../type/bool":128,"../type/float":129,"../type/int":130,"../type/null":133,"./failsafe":123}],125:[function(require,module,exports){
'use strict';


var common = require('./common');


// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


module.exports = makeSnippet;

},{"./common":116}],126:[function(require,module,exports){
'use strict';

var YAMLException = require('./exception');

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;

},{"./exception":118}],127:[function(require,module,exports){
'use strict';

/*eslint-disable no-bitwise*/


var Type = require('../type');


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

},{"../type":126}],128:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":126}],129:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

},{"../common":116,"../type":126}],130:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../common":116,"../type":126}],131:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

},{"../type":126}],132:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

},{"../type":126}],133:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});

},{"../type":126}],134:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

},{"../type":126}],135:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

},{"../type":126}],136:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

},{"../type":126}],137:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

},{"../type":126}],138:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

},{"../type":126}],139:[function(require,module,exports){
'use strict';

var Type = require('../type');

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

},{"../type":126}],140:[function(require,module,exports){
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
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
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

},{}],141:[function(require,module,exports){
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

},{}],142:[function(require,module,exports){
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

},{}],143:[function(require,module,exports){
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

},{}],144:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":142,"./encode":143}],145:[function(require,module,exports){
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

},{"buffer/":146}],146:[function(require,module,exports){
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
},{"base64-js":111,"buffer":112,"ieee754":113}],147:[function(require,module,exports){
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
      throw new TypeError('Invalid character in header field name: "' + name + '"')
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
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
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

},{}],148:[function(require,module,exports){
const toDateObject = require('./wikibase_time_to_date_object')

const helpers = {}
helpers.isNumericId = id => /^[1-9][0-9]*$/.test(id)
helpers.isEntityId = id => /^((Q|P|L)[1-9][0-9]*|L[1-9][0-9]*-(F|S)[1-9][0-9]*)$/.test(id)
helpers.isEntitySchemaId = id => /^E[1-9][0-9]*$/.test(id)
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
  let [ namespace, id ] = title.split(':')
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
  let url = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`
  if (typeof width === 'number') url += `?width=${width}`
  return url
}

helpers.getEntityIdFromGuid = guid => {
  const parts = guid.split(/[$-]/)
  if (parts.length === 6) {
    // Examples:
    // - q520$BCA8D9DE-B467-473B-943C-6FD0C5B3D02C
    // - P6216-a7fd6230-496e-6b47-ca4a-dcec5dbd7f95
    return parts[0].toUpperCase()
  } else if (parts.length === 7) {
    // Examples:
    // - L525-S1$66D20252-8CEC-4DB1-8B00-D713CFF42E48
    // - L525-F2-52c9b382-02f5-4413-9923-26ade74f5a0d
    return parts.slice(0, 2).join('-').toUpperCase()
  } else {
    throw new Error(`invalid guid: ${guid}`)
  }
}

module.exports = helpers

},{"./wikibase_time_to_date_object":163}],149:[function(require,module,exports){
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
  let timeValue
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
    // Known case requiring this: legacy "muscial notation" datatype
    datatype = datatype.replace(' ', '-')

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

},{"./helpers":148}],150:[function(require,module,exports){
const { simplifyEntity } = require('./simplify_entity')

const wb = {
  entities: res => {
    // Legacy convenience for the time the 'request' lib was all the rage
    res = res.body || res
    const { entities } = res
    Object.keys(entities).forEach(entityId => {
      entities[entityId] = simplifyEntity(entities[entityId])
    })
    return entities
  },

  pagesTitles: res => {
    // Same behavior as above
    res = res.body || res
    return res.query.search.map(result => result.title)
  }
}

module.exports = {
  wb,
  // Legacy
  wd: wb
}

},{"./simplify_entity":154}],151:[function(require,module,exports){
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

},{}],152:[function(require,module,exports){
const { labels, descriptions, aliases, lemmas, glosses } = require('./simplify_text_attributes')

const {
  simplifyClaim: claim,
  simplifyPropertyClaims: propertyClaims,
  simplifyClaims: claims,
  simplifyQualifier: qualifier,
  simplifyPropertyQualifiers: propertyQualifiers,
  simplifyQualifiers: qualifiers,
  simplifyReferences: references,
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
  references,
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

},{"./simplify_claims":153,"./simplify_forms":155,"./simplify_senses":156,"./simplify_sitelinks":157,"./simplify_sparql_results":158,"./simplify_text_attributes":159}],153:[function(require,module,exports){
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

  let value, datatype, datavalue, snaktype, isQualifierSnak, isReferenceSnak
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
    valueObj.qualifiers = simplifyQualifiers(claim.qualifiers, subSnaksOptions)
  }

  if (keepReferences) {
    claim.references = claim.references || []
    valueObj.references = simplifyReferences(claim.references, subSnaksOptions)
  }

  if (keepIds) valueObj.id = claim.id

  return valueObj
}

const parseOptions = options => {
  if (options == null) return {}

  if (options[0] && typeof options[0] === 'object') return options[0]

  // Legacy interface
  const [ entityPrefix, propertyPrefix, keepQualifiers ] = options
  return { entityPrefix, propertyPrefix, keepQualifiers }
}

const simplifyQualifiers = (qualifiers, options) => {
  return simplifyClaims(qualifiers, getSubSnakOptions(options))
}

const simplifyPropertyQualifiers = (propertyQualifiers, options) => {
  return simplifyPropertyClaims(propertyQualifiers, getSubSnakOptions(options))
}

const simplifyReferences = (references, options) => {
  return references.map(refRecord => {
    return simplifyReferenceRecord(refRecord, options)
  })
}

const simplifyReferenceRecord = (refRecord, options) => {
  const subSnaksOptions = getSubSnakOptions(options)
  const snaks = simplifyClaims(refRecord.snaks, subSnaksOptions)
  if (subSnaksOptions.keepHashes) return { snaks, hash: refRecord.hash }
  else return snaks
}

const getSubSnakOptions = (options = {}) => {
  if (options.areSubSnaks) return options
  // Using a new object so that the original options object isn't modified
  else return Object.assign({}, options, { areSubSnaks: true })
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
  simplifyQualifier: simplifyClaim,
  simplifyReferences,
}

},{"../utils/utils":174,"./parse_claim":149,"./rank":151}],154:[function(require,module,exports){
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

},{"./simplify":152}],155:[function(require,module,exports){
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

},{"./helpers":148,"./simplify_claims":153,"./simplify_text_attributes":159}],156:[function(require,module,exports){
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

},{"./helpers":148,"./simplify_claims":153,"./simplify_text_attributes":159}],157:[function(require,module,exports){
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

},{"./sitelinks":160}],158:[function(require,module,exports){
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
  let { datatype } = valueObj
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
  let shortAssociatedVarName = associatedVarName.split(varName)[1]
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

},{}],159:[function(require,module,exports){
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

},{}],160:[function(require,module,exports){
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

},{"../utils/utils":174,"./helpers":148,"./sitelinks_languages":161}],161:[function(require,module,exports){
// Generated by 'npm run update-sitelinks-languages'
module.exports = [ 'aa', 'ab', 'ace', 'ady', 'af', 'ak', 'als', 'alt', 'am', 'ang', 'an', 'arc', 'ar', 'ary', 'arz', 'ast', 'as', 'atj', 'avk', 'av', 'awa', 'ay', 'azb', 'az', 'ban', 'bar', 'bat_smg', 'ba', 'bcl', 'be_x_old', 'be', 'bg', 'bh', 'bi', 'bjn', 'bm', 'bn', 'bo', 'bpy', 'br', 'bs', 'bug', 'bxr', 'ca', 'cbk_zam', 'cdo', 'ceb', 'ce', 'cho', 'chr', 'ch', 'chy', 'ckb', 'co', 'crh', 'cr', 'csb', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'din', 'diq', 'dsb', 'dty', 'dv', 'dz', 'ee', 'el', 'eml', 'en', 'eo', 'es', 'et', 'eu', 'ext', 'fa', 'ff', 'fiu_vro', 'fi', 'fj', 'fo', 'frp', 'frr', 'fr', 'fur', 'fy', 'gag', 'gan', 'ga', 'gcr', 'gd', 'glk', 'gl', 'gn', 'gom', 'gor', 'got', 'gu', 'gv', 'hak', 'ha', 'haw', 'he', 'hif', 'hi', 'ho', 'hr', 'hsb', 'ht', 'hu', 'hy', 'hyw', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'ilo', 'inh', 'io', 'is', 'it', 'iu', 'jam', 'ja', 'jbo', 'jv', 'kaa', 'kab', 'ka', 'kbd', 'kbp', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'koi', 'ko', 'krc', 'kr', 'ksh', 'ks', 'ku', 'kv', 'kw', 'ky', 'lad', 'la', 'lbe', 'lb', 'lez', 'lfn', 'lg', 'lij', 'li', 'lld', 'lmo', 'ln', 'lo', 'lrc', 'ltg', 'lt', 'lv', 'mad', 'mai', 'map_bms', 'mdf', 'mg', 'mhr', 'mh', 'min', 'mi', 'mk', 'ml', 'mni', 'mn', 'mnw', 'mo', 'mrj', 'mr', 'ms', 'mt', 'mus', 'mwl', 'myv', 'my', 'mzn', 'nah', 'nap', 'na', 'nds_nl', 'nds', 'ne', 'new', 'ng', 'nia', 'nl', 'nn', 'nov', 'no', 'nqo', 'nrm', 'nso', 'nv', 'ny', 'oc', 'olo', 'om', 'or', 'os', 'pag', 'pam', 'pap', 'pa', 'pcd', 'pdc', 'pfl', 'pih', 'pi', 'pl', 'pms', 'pnb', 'pnt', 'ps', 'pt', 'qu', 'rm', 'rmy', 'rn', 'roa_rup', 'roa_tara', 'ro', 'rue', 'ru', 'rw', 'sah', 'sat', 'sa', 'scn', 'sco', 'sc', 'sd', 'se', 'sg', 'shn', 'sh', 'shy', 'simple', 'si', 'skr', 'sk', 'sl', 'smn', 'sm', 'sn', 'sources', 'so', 'sq', 'srn', 'sr', 'ss', 'stq', 'st', 'su', 'sv', 'sw', 'szl', 'szy', 'ta', 'tay', 'tcy', 'tet', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tpi', 'trv', 'tr', 'ts', 'tt', 'tum', 'tw', 'tyv', 'ty', 'udm', 'ug', 'uk', 'ur', 'uz', 'vec', 'vep', 've', 'vi', 'vls', 'vo', 'war', 'wa', 'wo', 'wuu', 'xal', 'xh', 'xmf', 'yi', 'yo', 'yue', 'za', 'zea', 'zh_classical', 'zh_min_nan', 'zh_yue', 'zh', 'zu' ]

},{}],162:[function(require,module,exports){
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

},{"./helpers":148}],163:[function(require,module,exports){
module.exports = wikibaseTime => {
  // Also accept claim datavalue.value objects
  if (typeof wikibaseTime === 'object') {
    wikibaseTime = wikibaseTime.time
  }

  const sign = wikibaseTime[0]
  let [ yearMonthDay, withinDay ] = wikibaseTime.slice(1).split('T')

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
  let date
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

},{}],164:[function(require,module,exports){
// See https://www.wikidata.org/w/api.php?action=help&modules=query%2Bsearch

const { isPlainObject } = require('../utils/utils')
const namespacePattern = /^\d+[|\d]*$/

module.exports = buildUrl => params => {
  if (!isPlainObject(params)) {
    throw new Error(`expected parameters to be passed as an object, got ${params} (${typeof params})`)
  }

  const { search, haswbstatement, format = 'json', limit, offset, profile, sort } = params
  let { namespace } = params

  if (!(search || haswbstatement)) throw new Error('missing "search" or "haswbstatement" parameter')

  let srsearch = ''
  if (search) srsearch += search

  if (haswbstatement) {
    const statements = haswbstatement instanceof Array ? haswbstatement : [ haswbstatement ]
    for (const statement of statements) {
      if (statement[0] === '-') srsearch += ` -haswbstatement:${statement.slice(1)}`
      else srsearch += ` haswbstatement:${statement}`
    }
  }

  if (limit != null && (typeof limit !== 'number' || limit < 1)) {
    throw new Error(`invalid limit: ${limit}`)
  }

  if (offset != null && (typeof offset !== 'number' || offset < 0)) {
    throw new Error(`invalid offset: ${offset}`)
  }

  if (namespace instanceof Array) namespace = namespace.join('|')
  else if (typeof namespace === 'number') namespace = namespace.toString()

  if (namespace && !namespacePattern.test(namespace)) {
    throw new Error(`invalid namespace: ${namespace}`)
  }

  if (profile != null && typeof profile !== 'string') {
    throw new Error(`invalid profile: ${profile} (${typeof profile}, expected string)`)
  }

  if (sort != null && typeof sort !== 'string') {
    throw new Error(`invalid sort: ${sort} (${typeof sort}, expected string)`)
  }

  return buildUrl({
    action: 'query',
    list: 'search',
    srsearch: srsearch.trim(),
    format,
    srnamespace: namespace,
    srlimit: limit,
    sroffset: offset,
    srqiprofile: profile,
    srsort: sort,
  })
}

},{"../utils/utils":174}],165:[function(require,module,exports){
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

},{"../helpers/validate":162,"../utils/utils":174}],166:[function(require,module,exports){
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

},{"../utils/utils":174}],167:[function(require,module,exports){
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

},{"../helpers/validate":162,"../utils/utils":174}],168:[function(require,module,exports){
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

},{"../utils/utils":174,"./get_entities":165}],169:[function(require,module,exports){
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
    const { limit, caseInsensitive, keepProperties } = options
    const valueFn = caseInsensitive ? caseInsensitiveValueQuery : directValueQuery
    const filter = keepProperties ? '' : itemsOnly

    // Allow to request values for several properties at once
    let properties = forceArray(property)
    properties.forEach(validate.propertyId)
    properties = properties.map(prefixifyProperty).join('|')

    const valueBlock = getValueBlock(value, valueFn, properties, filter)
    let sparql = `SELECT DISTINCT ?subject WHERE { ${valueBlock} }`
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

},{"../helpers/helpers":148,"../helpers/validate":162,"../utils/utils":174,"./sparql_query":172}],170:[function(require,module,exports){
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

},{"../helpers/validate":162,"../utils/utils":174}],171:[function(require,module,exports){
const { isPlainObject } = require('../utils/utils')
const types = [ 'item', 'property', 'lexeme', 'form', 'sense' ]

module.exports = buildUrl => (search, language, limit, format, uselang) => {
  // Using the variable 'offset' instead of 'continue' as the later is a reserved word
  let type, offset

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

},{"../utils/utils":174}],172:[function(require,module,exports){
const { fixedEncodeURIComponent } = require('../utils/utils')

module.exports = sparqlEndpoint => sparql => {
  const query = fixedEncodeURIComponent(sparql)
  return `${sparqlEndpoint}?format=json&query=${query}`
}

},{"../utils/utils":174}],173:[function(require,module,exports){
const isBrowser = typeof location !== 'undefined' && typeof document !== 'undefined'

let stringifyQuery
if (isBrowser) {
  stringifyQuery = queryObj => new URLSearchParams(queryObj).toString()
} else {
  // TODO: use URLSearchParams in NodeJS too, but that would mean dropping support for NodeJS < v10
  stringifyQuery = require('querystring').stringify
}

module.exports = instanceApiEndpoint => queryObj => {
  // Request CORS headers if the request is made from a browser
  // See https://www.wikidata.org/w/api.php ('origin' parameter)
  if (isBrowser) queryObj.origin = '*'

  // Remove null or undefined parameters
  Object.keys(queryObj).forEach(key => {
    if (queryObj[key] == null) delete queryObj[key]
  })

  return instanceApiEndpoint + '?' + stringifyQuery(queryObj)
}

},{"querystring":144}],174:[function(require,module,exports){
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

},{}],175:[function(require,module,exports){
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

const WBK = config => {
  if (!isPlainObject(config)) throw new Error('invalid config')
  const { instance, sparqlEndpoint } = config

  if (!(instance || sparqlEndpoint)) {
    throw new Error(`one of instance or sparqlEndpoint should be set at initialization.\n${tip}`)
  }

  let wikibaseApiFunctions, instanceRoot, instanceApiEndpoint
  if (instance) {
    validateEndpoint('instance', instance)

    instanceRoot = instance
      .replace(/\/$/, '')
      .replace('/w/api.php', '')

    instanceApiEndpoint = `${instanceRoot}/w/api.php`

    const buildUrl = require('./utils/build_url')(instanceApiEndpoint)

    wikibaseApiFunctions = {
      searchEntities: require('./queries/search_entities')(buildUrl),
      cirrusSearchPages: require('./queries/cirrus_search')(buildUrl),
      getEntities: require('./queries/get_entities')(buildUrl),
      getManyEntities: require('./queries/get_many_entities')(buildUrl),
      getRevisions: require('./queries/get_revisions')(buildUrl),
      getEntityRevision: require('./queries/get_entity_revision')(instance),
      getEntitiesFromSitelinks: require('./queries/get_entities_from_sitelinks')(buildUrl)
    }
  } else {
    wikibaseApiFunctions = {
      searchEntities: missingInstance('searchEntities'),
      cirrusSearchPages: missingInstance('cirrusSearchPages'),
      getEntities: missingInstance('getEntities'),
      getManyEntities: missingInstance('getManyEntities'),
      getRevisions: missingInstance('getRevisions'),
      getEntityRevision: missingInstance('getEntityRevision'),
      getEntitiesFromSitelinks: missingInstance('getEntitiesFromSitelinks')
    }
  }

  let wikibaseQueryServiceFunctions
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

},{"../lib/helpers/rank":151,"../lib/helpers/sitelinks":160,"./helpers/helpers":148,"./helpers/parse_responses":150,"./helpers/simplify":152,"./queries/cirrus_search":164,"./queries/get_entities":165,"./queries/get_entities_from_sitelinks":166,"./queries/get_entity_revision":167,"./queries/get_many_entities":168,"./queries/get_reverse_claims":169,"./queries/get_revisions":170,"./queries/search_entities":171,"./queries/sparql_query":172,"./utils/build_url":173,"./utils/utils":174}],176:[function(require,module,exports){
module.exports = require('wikibase-sdk')({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})

},{"wikibase-sdk":175}],"citation-js":[function(require,module,exports){
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"../package.json":42,"./Cite/":3,"./logger":10,"./plugin-common":11,"./plugins/":23,"./util/":38}]},{},[50,74,78,84,86,94,104,110]);
