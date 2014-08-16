
// global.js: File List:
//      /js/prototype.js
//      /js/lightboxes.js
//      /js/prototype_extensions.js
//      /js/user.js
//      /js/tracker.js
//      /js/header.js
//      /js/Cookie.js
//      /js/patterns.js
//      /js/util.js
//      /js/Pulldown.js
//      /js/Share.js
//      /js/search_ui/SearchWithin.js
//      /js/search_ui/searchForm.js
//      /js/search_ui/advancedSearch.js
//      /js/search_ui/sortForm.js
//      /js/color_wheel.js
//      /js/ContributorDropdown.js
//      /js/HelpText.js
//      /js/Follow.js
//      /js/PopupAnchor.js
//      /js/ui_widgets/FlyoutLayer.js
//      /js/ui_widgets/ShadowContainer.js
//      /js/SlideViewer.js
//      /js/Carousel.js
//      /js/ResponsiveCarousel.js
//      /js/recent_carousel.js
//      /js/input/TextWithDefault.js
//      /js/input/PassWithDefault.js
//      /js/input/InFieldLabel.js
//      /js/storage/storage.js
//      /js/location.js
//      /js/search/search.js
//      /js/search/client.js
//      /js/search/history/history.js
//      /js/search/history/shim.js
//      /js/search/history/support_hash_onload.js
//      /js/search/nextButton.js
//      /js/search/Pager.js
//      /js/search/preferences.js
//      /js/search/related.js
//      /js/image/Preview.js
//      /js/image/grid.js
//      /js/image/mosaic/mosaic.js
//      /js/image/mosaic/Grid.js
//      /js/image/mosaic/Row.js
//      /js/image/mosaic/Cell.js
//      /js/instant/client.js
//      /js/pic/pic.js
//      /js/pic/client.js
//      /js/feedback/FeedbackForm.js
//      /js/Autocompleter.js
//      /js/suggest.js
//      /js/Anim.js
//      /js/ImagePaginator.js
//      /js/MarketingModule.js
//      /js/absinthe.min.js
//      /js/resource_ready.js
//      /js/HandleCookie.js


// global.js: begin JavaScript file: '/js/prototype.js'
// ================================================================================
/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.3',

  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
    LTE: function(version) {
        return (
            Prototype.Browser.IE &&
            parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) <= version
        );
    }
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !==
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  defer: function() {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];



    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});


if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {

      if (this._object[key] !== Object.prototype[key])
        return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.inject([], function(results, pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
        } else results.push(toQueryPair(key, values));
        return results;
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {

      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {

      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }


    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {

      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {

  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
  if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },


  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};



    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';


      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;


    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;


    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;


      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });


    source = $(source);
    var p = source.viewportOffset();


    element = $(element);
    var delta = [0, 0];
    var parent = null;


    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }


    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }


    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':

          if (!Element.visible(element)) return null;



          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {


  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);

      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);


        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  if(Prototype.Browser.LTE(9)) {
    Element.Methods.setOpacity = function(element, value) {
      function stripAlpha(filter){
        return filter.replace(/alpha\([^\)]*\)/gi,'');
      }
      element = $(element);
      var currentStyle = element.currentStyle;
      if ((currentStyle && !currentStyle.hasLayout) ||
        (!currentStyle && element.style.zoom == 'normal'))
          element.style.zoom = 1;

      var filter = element.getStyle('filter'), style = element.style;
      if (value == 1 || value === '') {
        (filter = stripAlpha(filter)) ?
          style.filter = filter : style.removeAttribute('filter');
        return element;
      } else if (value < 0.00001) value = 0;
      style.filter = stripAlpha(filter) +
        'alpha(opacity=' + (value * 100) + ')';
      return element;
    }
  } else {
    Element.Methods.setOpacity = function(element, value) {
      element = $(element);
      if (value == 1 || value === '') value = '';
      else if (value < 0.00001) value = 0;
      element.style.opacity = value;
      return element;
    }
  }

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };




  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {

  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div')['__proto__']) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div')['__proto__'];
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;


    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {

      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName)['__proto__'];
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { }, B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      if (B.WebKit && !document.evaluate) {

        dimensions[d] = self['inner' + D];
      } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {

        dimensions[d] = document.body['client' + D]
      } else {
        dimensions[d] = document.documentElement['client' + D];
      }
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;


    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;



    if ((/(\[[\w-]*?:|:checked)/).test(e))
      return false;

    return true;
  },

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (!Selector._div) Selector._div = new Element('div');



    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
            new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':



        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {


          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {


            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {


    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,


    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },


  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {


    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },


    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },




    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },


    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },


    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },


    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {

          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },


    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },


    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {

        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE && Prototype.Browser.LTE(8)) {
  Object.extend(Selector.handlers, {


    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },


    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {

            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {

    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      event = Event.extend(event);

      var node          = event.target,
          type          = event.type,
          currentTarget = event.currentTarget;

      if (currentTarget && currentTarget.tagName) {



        if (type === 'load' || type === 'error' ||
          (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
            && currentTarget.type === 'radio'))
              node = currentTarget;
      }
      if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
      return Element.extend(node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      var docElement = document.documentElement,
      body = document.body || { scrollLeft: 0, scrollTop: 0 };
      return {
        x: event.pageX || (event.clientX +
          (docElement.scrollLeft || body.scrollLeft) -
          (docElement.clientLeft || 0)),
        y: event.pageY || (event.clientY +
          (docElement.scrollTop || body.scrollTop) -
          (docElement.clientTop || 0))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE && Prototype.Browser.LTE(8)) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }




  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }




  if (Prototype.Browser.WebKit) {
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');



var Position = {



  includeScrollOffsets: false,



  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },


  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },


  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },



  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/prototype.js'

// global.js: begin JavaScript file: '/js/lightboxes.js'
// ================================================================================
Ss = window.Ss || {};
Ss.Lightbox = {};
var activeLightboxPhotoIds = new Hash();
var fallbackLightboxId;
var lightboxContentsPopulated = false;
var lockChangeLightboxDialog = false;

var isSubscribed = false;
var lightboxAlertLimit = 10;

var loadingHTML = 'loading';
var enhanced_lightboxContentsPopulated= false;

function setPointer() {
}

function _debug(message) {
	return;
}


/****************************
 * LIGHTBOX COMPONENT CLASSES
 */

/* Lightbox Controls */
Ss.Lightbox.Control = Class.create({
	initialize: function(pulldown, action) {
		this.pulldown = pulldown;
		this.action = action;
	},
	refresh: function(lightboxes) {
		this.pulldown.clearContent();
		this.pulldown.appendJson(this._transform(lightboxes));
	},
	getPulldown: function() { return this.pulldown; },

	_transform: function(lbs) {
		var o = this;
		return lbs.map(function(l){ return {"name":l.title,"onclick":function(){o.action(l.id);/*o.pulldown.collapse();*/}};});
	}
});

/* Adder (Adds the selected photo to a lightbox) */
Ss.Lightbox.Adder = Class.create(Ss.Lightbox.Control, {
	refresh : function($super, lightboxes) {
		$super(lightboxes);
		
		var form = $('new_lightbox_form_template').down('form').cloneNode(true);
		
		this.pulldown.appendContent(form);
		
		var placehold = new Ss.input.InFieldLabel({
				label: form.down('label'),
				field: form.down('input[type=text]')
		});
		
		form.observe('submit', function(evt) {
			var lb_err = form.down('.new_lightbox_messages'),
				lb_box = form.down('input[type=text]'),
				lb_box_container = form.down('div.new_lightbox_container');;
			
			evt = evt || window.event;
			
			Event.stop(evt);
			
			if(evt.returnValue){
				evt.returnValue = false;
			}
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			mouseoverEnabled = false;
			createLightbox(lb_box.getValue(), selectedPhotoId, function(err){
					lb_err.update(err).show();
					lb_box.addClassName('lb_add_error');
					lb_box_container.addClassName('lb_add_error');
					form.addClassName('lb_add_error');
			});
		});

	}
});

/* Switcher (Selects the active lightbox) */
Ss.Lightbox.Switcher = Class.create(Ss.Lightbox.Control, {
	refresh: function($super, activeLightbox, inactiveLightboxes) {
		$super(inactiveLightboxes);
		
		this.writeActiveLightbox(activeLightbox);
	},
	writeActiveLightbox: function(lightbox) {
		var lightboxes = getAllLightboxes();
		
		if(lightboxes.length > 1){
			if(!Object.isHash(lightbox)) {
				return;
			}
			this.pulldown.replaceTrigger("<strong>" + lightbox.get('title') + "</strong> (" + activeLightboxPhotoIds.size() + ")");
			if (lightboxes.length > 1 && $('lightbox_static_title')) {
				$('lightbox_static_title').hide();
			}
		} else {
			var count = new Element('span', { 'id': 'lightbox-count'}).update(activeLightboxPhotoIds.size());
			var subtitle = new Element('span').update(" (" + count.outerHTML + ")" ).addClassName('lightbox-subtitle');
			var title = new Element('strong');
			if(Object.isHash(activeLightbox)) {
				title.update(activeLightbox.get('title'));
				$('lightbox-title').innerHTML = title.outerHTML + subtitle.outerHTML;
			}
		}
	},
	setStyle: function(styles) { this.pulldown.trigger.setStyle(styles); }
});


/************************* 
 * Lightbox Data Retrieval
 **/
function getAllLightboxes() { //returns all lightbox objects sorted by mod. date
	return lightboxes.values().sortBy(function(l){return -l.last_modified;});
}

function getInactiveLightboxes() { //returns lightbox objects (excluding active) sorted by mod. date
	return getAllLightboxes().reject(function(l){return l.id == activeLightboxId;});
}

function getActiveLightbox() { // returns the active lightbox
	return activeLightbox || lightboxes.get(activeLightboxId);
}


/**************************************
 * LIGHTBOX ACTIONS: remove, copy, move 
 * Passed into lightbox components
 **/
function selectLightbox(id) {
	(lightboxPreviewSize == 'full' ? redirectLightboxPage(id) : refreshLightboxContents(id));
}

function removeSelectedPhotos(lightboxId, forMove) {
	
	var selectedPhotoCount = selectedLightboxPhotos.keys().length;
	if (selectedPhotoCount == 0) {
		alert( $t('LB_SELECT_TO_REMOVE', "Please select some photos to remove") );
		return;
	}

	if (!forMove) {
		var confirmationMessage;
		if (selectedPhotoCount == 1) 
			confirmationMessage = $t('LB_REMOVE_CONFIRM_SINGULAR', "Are you sure you want to remove this photo from this lightbox?");
		else 
			confirmationMessage = $t('LB_REMOVE_CONFIRM_PLURAL', "Are you sure you want to remove these __SELECTED_PHOTO_COUNT__ photos from this lightbox?", { __SELECTED_PHOTO_COUNT__: selectedPhotoCount});

		if (!confirm(confirmationMessage)) {
			return;
		}
	}

	selectedLightboxPhotos.keys().each( function(photoId) {
		$('lightbox-photo-' + photoId).addClassName('semi-transparent');
	} );


	var url = WEBSTACK_LIGHTBOX_PANEL_ON
		? '/webstack/legacy/lightboxes' : '/lightbox/remove_photos_from_lightbox.html';
	var photoIdsList = selectedLightboxPhotos.keys().join(',');
	new Ajax.Request(url, {
		parameters: {
		    action: 'remove_image',
		    photo_ids: photoIdsList,
		    lightbox_id: lightboxId,
		    'image_id[]': selectedLightboxPhotos.keys()
		},
		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_REMOVING', "Unfortunately, there was a technical error removing these photos") );
		},
		onSuccess: function(transport) {
			var removalCount = 0;
			selectedLightboxPhotos.keys().each( function(photoId) {
				selectedLightboxPhotos.unset(photoId);
				activeLightboxPhotoIds.unset(photoId);
				$('lightbox-photo-' + photoId).hide();
				removalCount++;
			} );
			activeLightbox.set('count', activeLightbox.get('count') - removalCount);
			Ss.Lightbox.switcher.writeActiveLightbox(getActiveLightbox());
			exportLightboxData();
			if(forMove) {
				var confirmationMessage = (selectedPhotoCount == 1 ? 
					$t('LB_MOVE_SUCCESS_SINGULAR', "That photo has been moved to that lightbox"):
					$t('LB_MOVE_SUCCESS_PLURAL', "Those photos have been moved to that lightbox"));
				
				alert(confirmationMessage);
			}
			
            		
			if(Ss.search.lightboxes.clientStorage) {
             		Ss.search.lightboxes.updateCount();
	     			Ss.storage.session.removeItem('active_lightbox_html_v2');


	     			var size = Ss.storage.session.getItem('active_lightbox_size');
	     			if(size){
	     				new Ajax.Request( '/lightbox/get_storage_when_removing_images.html', {
	     					method: 'GET',
	     					parameters: {
	     						lightbox_id: lightboxId,
	     						size: size
	     					},
	     					onSuccess: function(content) {
	     						Ss.search.lightboxes.store(content.responseText);
	     					}
	     				});
	     			}
            	}			

			if($('photo-action-bar') && selectedLightboxPhotos.keys().length == 0){
                                $('photo-action-bar').removeClassName('photo-action-enabled');
                		$('photo-action-bar').addClassName('photo-action-disabled');
			}	
		}
		
	});
}

function copySelectedPhotos(lightboxId, forMove) {
	var selectedPhotoCount = selectedLightboxPhotos.keys().length;
	var photoIdsList = selectedLightboxPhotos.keys().join(',');
	var url = WEBSTACK_LIGHTBOX_PANEL_ON
		? '/webstack/legacy/lightboxes' : '/lightbox/copy_photos_to_lightbox.html';
	new Ajax.Request(url, {
		parameters: {
		    action: 'copy_image',
		    photo_ids: photoIdsList,
		    lightbox_id: lightboxId,
		    dest_lightbox_id: lightboxId,
		    'image_id[]': selectedLightboxPhotos.keys()
		},
		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_COPYING', "Unfortunately, there was a technical error copying these photos") );
		},
		onSuccess: function(transport) {
			if (forMove) {
				removeSelectedPhotos(activeLightboxId, true);
			} else {
				var confirmationMessage;
				if (selectedPhotoCount == 1) 
					confirmationMessage = $t('LB_COPY_SUCCESS_SINGULAR', "That photo has been copied to that lightbox");
				else 
					confirmationMessage = $t('LB_COPY_SUCCESS_PLURAL', "Those __SELECTED_PHOTO_COUNT__ photos have been copied to that lightbox", { __SELECTED_PHOTO_COUNT__: selectedPhotoCount });

				alert(confirmationMessage);

				selectedLightboxPhotos.keys().each( function(photoId) {
					togglePhotoSelection(photoId);

					selectedPhotoCount++;
				} );
			}
		}
	} );
}

function requestMoveSelectedPhotos(lightboxId) {
	if (lightboxes.keys().length <= 1) {
		alert( $t('LB_NO_OTHER_LIGHTBOXES_MOVE', "You don't have any other lightboxes to move to") );
		return;
	}
	var selectedPhotoCount = selectedLightboxPhotos.keys().length;
	if (selectedPhotoCount < 1) {
		alert( $t('LB_SELECT_PHOTOS_MOVE', "Please select some photos to move") );
		return;
	}
	copySelectedPhotos(lightboxId, true);
}

function requestCopySelectedPhotos(lightboxId) {
	if (lightboxes.keys().length <= 1) {
		alert( $t('LB_NO_OTHER_LIGHTBOXES_COPY', "You don't have any other lightboxes to copy to") );
		return;
	}
	var selectedPhotoCount = selectedLightboxPhotos.keys().length;
	if (selectedPhotoCount < 1) {
		alert( $t('LB_SELECT_PHOTOS_COPY', "Please select some photos to copy") );
		return;
	}
	copySelectedPhotos(lightboxId, false);	
}

function moveSelectedPhotos(lightboxId) {
	copySelectedPhotos(lightboxId, true);

}

function addImageToLightbox(lightboxId, showRenameDialog, photoIdOverride) {

	var lightboxPulldown = Ss.Lightbox.singleAdder || Ss.Lightbox.multipleAdder;
	
	var showLoading = function() {
		if(lightboxPulldown) {
			lightboxPulldown.getPulldown().showLoading();
		}
	};
	
	var hideLoading = function() {
		if(lightboxPulldown) {
			lightboxPulldown.getPulldown().hideLoading();
			lightboxPulldown.getPulldown().collapse();
		}	
	};
	

	mouseoverEnabled = false;
	
	var photoId = photoIdOverride ? photoIdOverride : selectedPhotoId;

	if (!showRenameDialog && lightboxId != activeLightboxId) {
	    var sizeOverride = (lightboxPreviewSize == 'expanded' ? 'expanded' : 'preview');
		refreshLightboxContents(lightboxId, false, photoId, sizeOverride);
		hideLoading();
		return;
	}

	if (lightboxId == activeLightboxId && activeLightboxPhotoIds.get(photoId)) {
		if (lightboxPreviewSize == 'minimized') {
			setLightboxPreviewSize('preview');
		}
		alert( $t('LB_ALREADY_IN_LIGHTBOX', 'That photo is already in this lightbox') );
		hideLoading();
		return;
	}

	if (lightboxId == activeLightboxId && lightboxContentsPopulated) {
		$('lightbox-contents-table').innerHTML = imageTemplateHTML.replace(/<!-- photo_id -->/g, photoId) + $('lightbox-contents-table').innerHTML;
	}
	
	var url = WEBSTACK_LIGHTBOX_PANEL_ON ? '/webstack/legacy/lightboxes' : '/lightbox/add_image_to_lightbox.html';
	new Ajax.Updater('lightbox-thumb-' + photoId, url, {
		parameters: {
			action: "add_image",
			photo_id: photoId,
			lightbox_id: lightboxId,
			src: getSelectedPhotoSrc(photoId)
		},
		onSuccess: function(transport) {
			var src_pieces = getSelectedPhotoSrc(photoId).split('-');


			var page_number = '', image_position = '', tracking_id = '', ref_photo_id = '';
			if(src_pieces.length == 2 && src_pieces[0] == 'p') {
				ref_photo_id = src_pieces[1];
			} else if(src_pieces.length >= 3) {
				page_number = src_pieces[src_pieces.length - 2];
				image_position = src_pieces[src_pieces.length - 1];
				tracking_id = src_pieces.splice(0, src_pieces.length - 2).join('-');
			}
			Ss.ResourceReady.add('lilBro', function() {
				window.Ss.lilBro.write({
					event_type:	'lightbox',
					photo_id: photoId,
					lightbox_id: lightboxId,
					page_number: page_number,
					image_position: image_position, 
					ref_photo_id: ref_photo_id,
					tracking_id: tracking_id
				});
			});
			activeLightboxPhotoIds.set(photoId, true);
			if (lightboxId != activeLightboxId) {
				lightboxPreviewSize = 'preview';
				$('lightbox-preview-container').show();
				if (showRenameDialog) {
					setLightboxPreviewSize('preview', false, lightboxId, true);
				}
			} else {
				$('lightbox-count').innerHTML = parseInt($('lightbox-count').innerHTML) + 1;
				if (lightboxPreviewSize == 'minimized' || lightboxPreviewSize == 'closed') {
					setLightboxPreviewSize('preview');
				}
			}
			if(Object.isHash(activeLightbox)) {
				activeLightbox.set('count', parseInt(activeLightbox.get('count')) + 1);
			}
			if(!Ss.Lightbox.switcher){
				$('lightbox-count').update(activeLightbox.get('count'));
			}
			else{
				Ss.Lightbox.switcher.writeActiveLightbox(getActiveLightbox());
			}
			exportLightboxData();

			toggleLightboxLimitAlert();

			hideLoading();
			
		},
		onComplete: function() {
            		if(Ss.search.lightboxes.clientStorage && lightboxPreviewSize != 'full') {
                		var lightboxContent = $('main-lightbox-cell').innerHTML;
                		Ss.search.lightboxes.store(lightboxContent);
                		Ss.search.lightboxes.updateCount();
            		}
		},
		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_ADDING', "Unfortunately, there was a technical error adding the image to your lightbox") );
		}
	} );

	logEventLightboxAdd({ photo_id: photoId, lightbox_id: lightboxId });
}

function logEventLightboxAdd(args) {
	var src = getSelectedPhotoSrc(args.photo_id).split('-');
	var tracking_id = src[0];
	var page = src[1];
	var position = src[2];

	window.Ss.tracker.logEvent('lightbox', {
		photo_id:       args.photo_id,
		lightbox_id:    args.lightbox_id,
		page_number:    page,
		image_position: position,
		tracking_id:    tracking_id
	});
}


/****************************
 * LIGHTBOX INTERFACE UPDATES
 **/
function refreshLightboxListings() {
	if(Ss.Lightbox.singleAdder) {
		Ss.Lightbox.singleAdder.refresh(getAllLightboxes());
	}

	if (Ss.Lightbox.switcher) {
		Ss.Lightbox.switcher.refresh(getActiveLightbox(),getInactiveLightboxes());
	}
	
	if(Ss.Lightbox.copier) {
		Ss.Lightbox.copier.refresh(getInactiveLightboxes());
	}
	
	if(Ss.Lightbox.mover) {
		Ss.Lightbox.mover.refresh(getInactiveLightboxes());
	}
}

function refreshLightboxContents(lightboxId, showRenameDialog, addPhotoId, overrideSize) {

	if(!lightboxId) {
		return;
	}
	
	var size = overrideSize ? overrideSize : lightboxPreviewSize;

	if(Ss.Lightbox.switcher){
		Ss.Lightbox.switcher.getPulldown().showLoading();
	}
	
  var url, params;
  if (WEBSTACK_LIGHTBOX_PANEL_ON) {
    url = '/webstack/legacy/lightboxes';
    params = {
      action: 'refresh',
      lightbox_id: lightboxId,
      size: size,
      rand: new Date().getTime(),
      language: document.language
    }; 
  }
  else {
    url = '/lightbox/refresh_lightbox.html';
    params = {
     lightbox_id: lightboxId,
     size: size,
     rand: new Date().getTime(),
     language: document.language,
     output_format: 'javascript'
    }; 
  }
	new Ajax.Request( url, {
		method: 'GET',
		parameters: params, 
		evalScripts: true,
		onComplete: function(transport) {
			if (showRenameDialog) {
				showLightboxDialog('rename');
			}
			selectedLightboxPhotos.keys().each( function(photoId) {
				selectedLightboxPhotos.unset(photoId);
			} );

			activeLightboxId = lightboxId;
			if (lightboxes.get(lightboxId)) {
				lightboxes.get(lightboxId).last_modified = parseInt(new Date().getTime()/1000);
			}
		
			refreshLightboxListings();
			
			if (size != 'minimized') {
				lightboxContentsPopulated = true;
			}

			if (addPhotoId) {
				addImageToLightbox(lightboxId, false, addPhotoId);

			} else if (size != 'minimized') {
				exportLightboxData();
			}
			if(Ss.Lightbox.switcher){
				Ss.Lightbox.switcher.getPulldown().hideLoading();
			}
	        	

			if(lightboxes.size() <= 1){
				if($('copy-action'))
               				$('copy-action').remove();
				if($('move-action'))
					$('move-action').remove();
        		}
		},
		onFailure: function(transport) {
			alert("Unfortunately there was a technical problem loading this lightbox");
		}
	} );
}

function generateLightboxListing(lightboxes, onclickAction, dontShowActive) {
	var output = '';
	var t = new Template('<div onmouseover="this.style.backgroundColor = \'#f0f4ff\'" onmouseout="this.style.backgroundColor = \'white\'" onclick="mouseoverEnabled = false; ' + onclickAction + '(#{id})" class="lightbox-dialog-link">#{title}</div>');
	lightboxes.values().sortBy( function(lightbox) {
		return lightbox.last_modified;
	} )
	.reverse()
	.each( function(lightbox) {
		if (!(dontShowActive && lightbox.id == activeLightboxId)) {
			output += t.evaluate(lightbox);
		}
	} );
	return output;
}

/***/

function $t(translationId, english, substitutions) {
	if (document.language == 'en' && !substitutions) {
		return english;
	} else {
		var translation;
		if (document.language == 'en') 
			translation = english;
		else {
			translation = document.translations[translationId] || document.translations.get(translationId);
			if (!translation) {
				translation = english;
			}
		}
		$H(substitutions).keys().each( function(substitutionKey) {
			var subRegex = new RegExp(substitutionKey, 'g');
			translation = translation.replace(subRegex, substitutions[substitutionKey]);
		} );
		return translation;
	}
}

function setLightboxPreviewSize(size, addPhotoId, refreshLightboxId, showRenameDialog) {
        if($H(selectedLightboxPhotos).keys().length >= 1){
                $('photo-action-bar').removeClassName('photo-action-disabled');
                $('photo-action-bar').addClassName('photo-action-enabled');
        }
        else { 
		if($('photo-action-bar')){
                	$('photo-action-bar').removeClassName('photo-action-enabled');
                	$('photo-action-bar').addClassName('photo-action-disabled');
        	}
	}	
	var container = $('lightbox-preview-container');

	if (size == 'closed') {
		if(container) {
			container.hide();
		}	
		lightboxPreviewSize = 'minimized';
		new Ajax.Request('/lightbox/set_preview_size.html', { 
			parameters: { size: 'closed' }
		} );
		if(Ss.search.lightboxes.clientStorage) {
		    Ss.search.lightboxes.storeSize(size);
		}
		return;
	}


    if(Ss.search.lightboxes.clientStorage && lightboxPreviewSize == 'closed' && size == 'preview') {
		lightboxPreviewSize = size;
		if (!lightboxContentsPopulated) {
			refreshLightboxContents(activeLightboxId, false, addPhotoId);
		}
    }
    

	if (lightboxPreviewSize == 'minimized' && size == 'preview') {
		lightboxPreviewSize = size;
		if (!lightboxContentsPopulated) {
			refreshLightboxContents(activeLightboxId, false, addPhotoId);
		}
	}

	if($('lightbox-preview-container'))
		$('lightbox-preview-container').show();

	if (size != 'full') {
		new Ajax.Request('/lightbox/set_preview_size.html', { 
			parameters: { size: size }
		} );
	}

	var conf = $H(lightboxElementsConf[size]);

	if($('lightbox-preview-container'))
		$('lightbox-preview-container').style.height = conf.get('preview_container_height');
	$('lightbox-contents-table').style.height = conf.get('contents_table_height') + "px";

	$H(lightboxElementsConf[size]['child_visibility']).each( function(pair) {
		if (pair.value) {
			$(pair.key).show();
		} else {
			$(pair.key).hide();
		}
	} );

	lightboxPreviewSize = size;

	if (refreshLightboxId) {
		refreshLightboxContents(refreshLightboxId, showRenameDialog);
	}
	

	$H(lightboxElementsConf).keys().each(function(sizeKey){$('lightbox-preview-container').removeClassName(sizeKey + "_lightbox");})
	$('lightbox-preview-container').addClassName(size + "_lightbox");

	if(Ss.search.lightboxes.clientStorage && size != 'full') {
	    var lightboxContent = $('main-lightbox-cell').innerHTML;
	    Ss.search.lightboxes.store(lightboxContent);
	    Ss.search.lightboxes.storeSize(lightboxPreviewSize);
	}
}

function updateLightboxNameDisplay(newName) {
	if (!newName) {
		newName = $('lightbox-new-name-input').value;
	}

	$('rename-message').innerHTML = '';
	
	newName = newName.replace(/^\s+/, '');
	newName = newName.replace(/\s+/g, ' ');

	$('lightbox-new-name-input').value = newName;
	if(getAllLightboxes().length <= 1){
		$('lightbox-title').down('strong').update(newName);
	}
	else if(Ss.Lightbox.switcher){
                Ss.Lightbox.switcher.getPulldown().replaceTrigger(newName);
        }
}

function resetLightboxNameDisplay() {
	var lb = getActiveLightbox();
	if (getAllLightboxes().length > 1) {
		Ss.Lightbox.switcher.refresh(getActiveLightbox(),getInactiveLightboxes());
	}
	else{
		$('lightbox-title').down('strong').update(lb.get('title'));
	}
}

function showLightboxDialog(action) {
	hideLightboxDialogs();
        $('lightbox-input-bar').show();
	$(action + '-lightbox-link').className = 'selected-lightbox-link secondary_link nolink';
	$(action + '-lightbox-dialog').show();
	$(action + '-lightbox-dialog').style.zIndex = parseInt(new Date().getTime()/1000); 	// to appease IE6
	if (action == 'rename') {
		if(Ss.Lightbox.switcher){
			Ss.Lightbox.switcher.setStyle({color: '#a0a0a0'});
		}
		$('lightbox-new-name-input').focus();
	} else {
		if(Ss.Lightbox.switcher){
			Ss.Lightbox.switcher.setStyle({color: '#383838'});
		}
	}

	if (action == 'share') {
		$('share-lightbox-input').focus();

	} else if (action == 'send') {
		$('send-lightbox-input').focus();
	}
}

function hideLightboxDialogs() {

	new Array('send', 'share', 'rename', 'delete', 'alert').each( 
		function(action) {
			$(action + '-lightbox-dialog').hide();
			$(action + '-lightbox-link').className = 'inactive-lightbox-link';
		}
	);
}

function sendLightbox(lightboxId, emailAddress) {

       var error = validateEmailAddress(emailAddress);
       	if (error) {
		$('send-message').innerHTML = error;
		return;
	}

  var url, params;
  if (WEBSTACK_LIGHTBOX_PANEL_ON) {
		url = '/webstack/legacy/lightboxes';
		params =  {
								action: 'send',
								email: emailAddress,
								lightbox_id: lightboxId
							};
  }
  else {
    url = '/lightbox/send_email.html';
    params =  {
                lightbox_id: lightboxId,
                email_address: emailAddress
              };
  }
       new Ajax.Request( url, {
               parameters: params, 
               onFailure: function(transport) {
                       alert( $t('LB_TECHNICAL_ERROR_SENDING', "Unfortunately, there was a technical error sending this lightbox") );
               },
               onSuccess: function(transport) {
                       alert("This lightbox has been sent to email address: " + emailAddress);
                       hideLightboxDialogs();
               }
       } );
}

function renameLightbox(lightboxId, newName) {

	newName = newName.replace(/\s+$/, '');

	var error = validateLightboxName(newName);

	if (!lightboxes.get(lightboxId) || (lightboxes.get(lightboxId) && lightboxes.get(lightboxId).title != newName)) {	
		if (error) {
			$('rename-message').innerHTML = error;
			return;
		}
		var url, params;
		if (WEBSTACK_LIGHTBOX_PANEL_ON) {
			url = '/webstack/legacy/lightboxes';
			params =  {
									action: 'rename',
									lightbox_id: lightboxId,
									lightbox_name: newName
								};
		}
		else {
			url = '/lightbox/rename_lightbox.html';
			params =  {
					lightbox_id: lightboxId,
					new_name: newName
			};
		}
		new Ajax.Request( url, {
			parameters: params,
			onFailure: function(transport) {
				alert( $t('LB_TECHNICAL_ERROR_RENAMING', "Unfortunately, there was a technical error changing the lightbox name") );
				if(Ss.Lightbox.switcher){
					Ss.Lightbox.switcher.getPulldown().replaceTrigger(lightboxes.get(lightboxId).title);
				}
			},
			onSuccess: function(transport) {
				lightboxTitle = newName;
				var lightbox = lightboxes.get(lightboxId);
				if (lightbox) {
					lightbox.title = newName;
				}
				if(Object.isHash(activeLightbox)) {
					activeLightbox.set('title', newName);
				}
				exportLightboxData();
				refreshLightboxListings();
				if(Ss.Lightbox.switcher){
					Ss.Lightbox.switcher.writeActiveLightbox(getActiveLightbox());
				}
			}
		});
	}
	if(Ss.Lightbox.switcher){
		Ss.Lightbox.switcher.setStyle({color: "#383838"});
	}
	hideLightboxDialogs();
}

function shareLightbox(lightboxId, shareTo, shareType) {
	if(shareTo.length == 0){
		$('share-message').innerHTML = $t('LB_EMPTY_SHARE_USER', 'Please enter a valid Shutterstock username.');
		return; 
	}

  var url, params;
  if (WEBSTACK_LIGHTBOX_PANEL_ON) {
		url = '/webstack/legacy/lightboxes';

		params =  {
								action: 'share',
                share_user: shareTo,
								lightbox_id: lightboxId
							};
  }
  else {
    url = '/lightbox/share_lightbox.html';
    params =  {
								lightbox_id: lightboxId,
								share_to: shareTo,
								share_type: shareType,
								title: lightboxes.get(lightboxId).title
              };
  }

	new Ajax.Request( url, {
		parameters: params,
		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_SHARING', "Unfortunately, there was a technical error sharing this lightbox") );
		},
		onSuccess: function(transport) {
			var r = eval(transport.responseText);
			if (r.error) {
				$('share-message').innerHTML = r.error;
			} else {
				if (shareType == 'share') {
					alert( $t('LB_SHARE_SUCCESS', "This lightbox has been shared with Shutterstock user: __SHARE_USERNAME__", { __SHARE_USERNAME__: r.shared_to }) );
				} else {
					alert( $t('LB_EMAIL_SUCCESS', "This lightbox has been sent to email address: __SHARE_EMAIL__", { __SHARE_EMAIL__: r.shared_to }) );
				}
				hideLightboxDialogs();
			}
		}
	} );
}

function createLightbox(lightboxName, photoId, callback) {
        var error = validateLightboxName(lightboxName);
        if (error) {
                callback(error);
                return;
        }

	$('lightbox-contents-table').innerHTML = loadingHTML;
	if(Ss.Lightbox.switcher){
		Ss.Lightbox.switcher.getPulldown().replaceTrigger("-untitled- (0)");
		Ss.Lightbox.switcher.setStyle({color: "#a0a0a0"});
	}

        var url = WEBSTACK_LIGHTBOX_PANEL_ON ? '/webstack/legacy/lightboxes'
	    : '/lightbox/create_lightbox.html';
	new Ajax.Request( url, {
		parameters: {
		        action: 'create',
			lightbox_name: lightboxName
		},
		onSuccess: function(transport) {
			var lightboxId = eval(transport.responseText);
			addImageToLightbox(lightboxId, false, photoId);
			lightboxes.set(lightboxId, { title: lightboxName, id: lightboxId, last_modified: parseInt(new Date().getTime()/1000) });
			$('show-lightbox-preview-tab').show();
		},

		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_CREATING', "Unfortunately, there was a technical error creating this lightbox") );
		}
	} );
}

function deleteLightbox(lightboxId) {

	if ($H(selectedLightboxPhotos).keys().length) {
		var proceed = confirm( $t('LB_SELECTED_PHOTOS_CONFIRM_DELETE', "You have selected some photos but you've chosen to delete this entire lightbox.  Are you sure that's what you mean to do?") );
		if (!proceed) {
			hideLightboxDialogs();
			return;
		}
	}

	var url, params;
	if (WEBSTACK_LIGHTBOX_PANEL_ON) {
		url = '/webstack/legacy/lightboxes';
		params =  {
								action: 'delete',
								lightbox_id: lightboxId
							};
	}
	else {
		url = '/lightbox/delete_lightbox.html';
		params =  {
								lightbox_id: lightboxId
							};
	}
	new Ajax.Request( url, {
		parameters: params,
		onFailure: function(transport) {
			alert( $t('LB_TECHNICAL_ERROR_DELETING', "Unfortunately, there was a technical error deleting this lightbox") );
		},
		onSuccess: function(transport) {
			var tab;
			lightboxes.unset(lightboxId);
			alert( $t('LB_LIGHTBOX_DELETED', "This lightbox has been deleted") );

			var fallbackLightboxId = (lightboxes.size() > 0 ? lightboxes.values().sortBy( function(lightbox) { return lightbox.last_modified } ).reverse()[0].id : null);

			refreshLightboxListings();
			if (fallbackLightboxId) {
				selectLightbox(fallbackLightboxId);
			} else {
				setLightboxPreviewSize('closed');
				tab = $('show-lightbox-preview-tab');
				if(tab) {
					tab.hide();
				}
			}
		}
	} );

}

function togglePhotoSelection(photoId) {
	if (selectedLightboxPhotos.get(photoId)) {
		selectedLightboxPhotos.unset(photoId);
		$('lightbox-photo-' + photoId).removeClassName('selected-lightbox-photo');
		$('lightbox-photo-checkbox-' + photoId).checked = false;
		
	} else {
		selectedLightboxPhotos.set(photoId, true);
		$('lightbox-photo-' + photoId).addClassName('selected-lightbox-photo');
		$('lightbox-photo-checkbox-' + photoId).checked = true;
	}
        if($H(selectedLightboxPhotos).keys().length >= 1){
                $('photo-action-bar').removeClassName('photo-action-disabled');
                $('photo-action-bar').addClassName('photo-action-enabled');
        }
        else {
                $('photo-action-bar').removeClassName('photo-action-enabled');
                $('photo-action-bar').addClassName('photo-action-disabled');
	}
        if(lightboxes.size() <= 1){
        	if($('copy-action'))
        	        $('copy-action').remove();
        	if($('move-action'))
        	        $('move-action').remove();        
	}
}


function redirectLightboxPage(lightboxId) {
	location.href = '/lightboxes.mhtml?lightbox_id=' + lightboxId;
}

function toggleElementVisibility(elementId) {
	if ($(elementId).visible()) {
		$(elementId).hide();
	} else {
		$(elementId).show();
	}
}

function toggleLightboxLimitAlert() {

	if ( ! isSubscribed && activeLightbox.get('count') >= lightboxAlertLimit ) {
		if ( activeLightbox.get('count') % lightboxAlertLimit == 0 ) {
			showLightboxDialog('alert');
		}
	}

}


function validateLightboxName(name) {

	var errorCode;
	
	if (name.length > 24) {
		errorCode = $t('LB_NAME_TOO_LONG', 'This lightbox name is too long');
	} else if (!name) {
		errorCode = $t('LB_NAME_TOO_SHORT', 'Please enter a name for this lightbox');

	} else if (name.match(/[<>]/)) {
		errorCode = $t('LB_NAME_BAD_CHARS', 'Lightbox names can only contain numbers and letters');

	} else {
		lightboxes.keys().each( function(lightboxId) {
			if (lightboxes.get(lightboxId) && lightboxes.get(lightboxId).title == name) {
				errorCode = $t('LB_NAME_ALREADY_EXISTS', 'You already have a lightbox with this name');
			}
		} );
	}

	return errorCode;
}

function validateEmailAddress(address) {
	var errorCode;
	if(address.length == 0){
		errorCode = $t('LB_EMPTY_EMAIL', "Please enter a valid email address");
	}
	else if (!address.match(/[\w.-]+\@[\w.-]+\.[\w]{2,5}/)) {
		errorCode = $t('LB_INVALID_EMAIL', "This is not a valid email address");
	}

	return errorCode;
}

function acceptLightbox(lightboxAccessId, lightboxName) {

	var errorCode = validateLightboxName(lightboxName);
	
	if (errorCode) {
		$('lightbox-share-prompt-' + lightboxAccessId).hide();
		$('lightbox-share-rename-' + lightboxAccessId).show();
	} else {
		new Ajax.Updater('lightboxes-overview-container', '/lightbox/accept_lightbox.html', {
			parameters: { 
				lightbox_access_id: lightboxAccessId,
				title: lightboxName
			},
			onFailure: function() {
				alert( $t('LB_TECHNICAL_ERROR_ACCEPTING', "Unfortunately, there was a technical error accepting this lightbox") );
			}
		} );
	}
}

function denyLightbox(lightboxAccessId) {
	new Ajax.Updater('lightboxes-overview-container', '/lightbox/deny_lightbox.html', {
		parameters: { lightbox_access_id: lightboxAccessId },
		onFailure: function() {
			alert( $t('LB_TECHNICAL_ERROR_DENYING', "Unfortunately, there was a technical error denying this lightbox") );
		}
	} );
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) 
			return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}

function exportLightboxData() {
	if (activeLightbox) {
		document.cookie = "active_lightbox=" + encodeURIComponent(activeLightbox.toJSON()) + "; path=/";
	} else {

	}
}

function importLightboxData() {
	new Ajax.Request('/lightbox/import_lightbox_data.html', {
		onSuccess: function(transport) {
			refreshLightboxPreview();
		},
		onComplete: function(transport) {
			refreshLightboxListings();
		}
	} );
}

function setLightboxFreshTime(timestamp) {
	document.cookie = "lightboxes_fresh_time=" + timestamp + "; path=/";
}

function restoreLightboxPreview() {
	var lightboxId;
	if (!activeLightboxId) {
		lightboxId = lightboxes.values().sortBy( function(lightbox) { return lightbox.last_modified } ).reverse()[0].id;
	}
	setLightboxPreviewSize('preview', false, lightboxId);
     
	if($H(selectedLightboxPhotos).keys().length >= 1){
                $('photo-action-bar').removeClassName('photo-action-disabled');
		$('photo-action-bar').addClassName('photo-action-enabled');
        }
        else {
		$('photo-action-bar').removeClassName('photo-action-enabled');
		$('photo-action-bar').addClassName('photo-action-disabled');
        }
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/lightboxes.js'

// global.js: begin JavaScript file: '/js/prototype_extensions.js'
// ================================================================================

Ss.Browser = {
	isIEVersion: function(v) {
		return (Prototype.Browser.IE &&
			parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5))==v);
	},
	
	supports: {
	    placeholder: function() {
	        if(Object.isUndefined(this._placeholder)) {
	            this._placeholder = 'placeholder' in document.createElement('input');
	        }
	        return this._placeholder;
	    }
	}
};

Element.addMethods({
	isElementOrDescendantOf: function(element, argElement) {
		return element === argElement || element.descendantOf(argElement);
	},
	
	CSSTransitionsSupported: function(element) {
		return element.style.webkitTransition !== undefined ||element.style.MozTransition !== undefined;
	},
	
	fadeOut: function (element, args) {
		args = args || {};
		args.endValue = 0;
		return element.fadeTo(args);
	},

	fadeIn: function (element, args) {
		args = args || {};
		args.endValue = 1;
		return element.fadeTo(args);
	},
	
	fadeTo: function(element, args) {
		args = args || {};
		args.increment = args.increment || 0.05;
		if(Prototype.Browser.IE) {
			args.increment = args.increment * 5;
		}
		return element.setStylePeriodically({
				property: 	'opacity',
				endValue: 	args.endValue,
				increment: 	args.increment,
				onComplete: args.onComplete || Prototype.emptyFunction()
		});
	},
	

	setStylePeriodically: function(element, args) {
		var property = args.property;
		var endValue = args.endValue;
		var increment = args.increment;
		var interval = args.interval || 0.010;
		var units = args.units || '';
		var onComplete = (args.onComplete && Object.isFunction(args.onComplete) ? args.onComplete : Prototype.emptyFunction);
		var currentValue = Object.isUndefined(args.startValue) ? parseFloat(element.getStyle(property)) : parseFloat(args.startValue);
		

		var getUpdater = function() {
			var updaters = {
				add: function() {
					currentValue = (currentValue + increment <= endValue ? currentValue + increment : endValue);
					return currentValue >= endValue;
				},
				sub: function() {
					currentValue = (currentValue - increment >= endValue ? currentValue - increment : endValue);
					return currentValue <= endValue;
				}
			};

			return (Math.min(currentValue, endValue) == currentValue ? updaters.add : updaters.sub);
		};
		
		var updater = getUpdater();
		

		var _pe = new PeriodicalExecuter(
			function(pe) {
				var done = updater();
				var value = currentValue + units;

				if(property == 'opacity') {



					if(Ss.Browser.isIEVersion(9) && value >= 0.99) {
						value = 0.99;
					}

					element.setOpacity(value);
				} else {
					element.style[property] = value;
				}

				if(done) {
					pe.stop();
					onComplete();
				}
			},
		interval);

		return _pe;
	},
	
		





	viewportOffsetFix: function(forElement) {
		var valueT = 0, valueL = 0;
		
		var element = forElement;
		do {
		  valueT += element.offsetTop  || 0;
		  valueL += element.offsetLeft || 0;

		  if (element.offsetParent == document.body &&
			Element.getStyle(element, 'position') == 'absolute') break;
		
		} while (element = element.offsetParent);
		
		element = forElement;
		do {
		  if (!Prototype.Browser.Opera || element.tagName == 'HTML') {
			valueT -= element.scrollTop  || 0;
			valueL -= element.scrollLeft || 0;
		  }
		} while (element = element.parentNode);
		
		return Element._returnOffset(valueL, valueT);
	},
	
	delegateClick: function(element, selector, handler) {
        if(!Object.isString(selector)) {
            throw 'selectors required.';
        }
        if(!Object.isFunction(handler)) {
            throw 'handler function required.';
        }
        var selectors = selector.split(/,\s*/);
    	element.observe('click', function(evt) {
            if(
                selectors.any(
                    function(s){ return Event.findElement(evt, s); } 
                )
            ) {
                handler(evt);
            }
        });
	},

	mousethis: function(element, action, observer) {
		element = $(element);
        element.observe(action, function(evt, currentTarget) {
            var relatedTarget = $(evt.relatedTarget || evt.fromElement);

            if(relatedTarget && !relatedTarget.isElementOrDescendantOf(currentTarget)) {
                observer();
            }
        }.bindAsEventListener({}, element));

        return element;
	},

    mouseenter: function(element, observer) {
        return element.mousethis('mouseover', observer);
    },
    
    mouseleave: function(element, observer) {
        return element.mousethis('mouseout', observer);
    },
    
    addToggle: function(element, trigger, options) {
	if(!Object.isElement(trigger)) {
		return;
	}
	options = options || {};
	trigger.observe('click', function(evt){
		element.toggle();
		if(options.className) {
			document.body.toggleClassName(options.className);
		}
		if(Object.isFunction(options.callback)) {
			options.callback({ type: 'toggle' });
		}
	});
	$(document).observe('click', function(evt){
		var target = evt.findElement();
		if(!element.visible() ||
			target.isElementOrDescendantOf(element) || 
			target.isElementOrDescendantOf(trigger)) {
			return;
		}
		element.hide();
		if(options.className) {
			document.body.removeClassName(options.className);
		}
		if(Object.isFunction(options.callback)) {
			options.callback({ type: 'hide' });
		}
	});
    },
    clearValue: function(element) {
    	if(!(element.match('input') || element.match('select'))) {
    		return;
    	}
    	if(element.type == 'checkbox') {
    		element.checked = false;
    	} else {
    		element.value = '';
    	}
    }
});

Object.extend(window, {
        

    _scrollTo: function(x,y) {
        if(window.scrollTo) {
            (function(){
                window.scrollTo(x,y);
            }).defer();
        }
    }
    
});








//



Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};
Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/prototype_extensions.js'

// global.js: begin JavaScript file: '/js/user.js'
// ================================================================================
Ss.user = window.Ss.user || {};

Object.extend(Ss.user, {

		viewportDimensions: document.viewport.getDimensions(),
		


		getViewportWidth: function() {
			return this.viewportDimensions.width;
		},
		
		getViewportHeight: function() {
			return this.viewportDimensions.height;
		}
		
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/user.js'

// global.js: begin JavaScript file: '/js/tracker.js'
// ================================================================================
Ss.tracker = window.Ss.tracker || {};

Object.extend(Ss.tracker, {

	initialize: function() {

		$('lil_brother').observe('click', Ss.tracker.eventHandlers.click);

		this.config.click_event_ids.default_select.each(
			function(id) {
				var select = $(id);
				if(select) {
					select.observe('change', Ss.tracker.eventHandlers.change);
				}
			}
		);
		
		if(Ss.storage.session.supported()) {
		    Event.observe(window, 'load', function(evt) {
		            var pendingEvent = Ss.tracker.getPendingEvent();
		            if(pendingEvent) {
		                Ss.tracker.request(pendingEvent);
		            }
		    });
		}

	},

	logEvent: function(eventType, metadata, target) {
		try {

			var _event = this.config.event.clone();


			var _event_type_id = Ss.tracker.config.event_type_ids[eventType];
			if (Object.isUndefined(_event_type_id)) {
				return;
			}

			_event[this.config.name_to_column['event_type']] = _event_type_id;


			var localCallbacks = this.config.event_callbacks[eventType];
			if (localCallbacks) {
				localCallbacks.each(function(callback) {
					try {
						_event[Ss.tracker.config.name_to_column[callback]]
							= Ss.tracker.get[callback](eventType, target);
					} catch (e) {

					}
				});
			}

			if (metadata) {
				Object.keys(metadata).each(function(columnName) {
					_event[Ss.tracker.config.name_to_column[columnName]]
						= metadata[columnName];
				});
			}



			_event[Ss.tracker.config.name_to_column['notes_json']] = 
				"{'client_seed': " + Math.floor(Math.random() * 100000000) + "}";

			_event[Ss.tracker.config.name_to_column['client_timezone']] =
				new Date().getTimezoneOffset();

			if (!Object.isUndefined(Ss.user)) {
				_event[Ss.tracker.config.name_to_column['viewport_width']] =
					Ss.user.getViewportWidth();
				_event[Ss.tracker.config.name_to_column['viewport_height']] =
					Ss.user.getViewportHeight();
			}
			this.request(this.config.img_src + '?' + _event.join('\x01'));
			

		} catch(ex) {
		}

	},

	request: function(src, pageLoadEvent) {
		


		var bug = new Image();
		
		if(Ss.storage.session.supported() && !pageLoadEvent) {
			Ss.tracker.setPendingEvent(src);
			bug.onload = function() {
				Ss.tracker.deletePendingEvent();
			};
		}
		
		bug.src = src;
	},
	
	getPendingEvent: function() {
		var pEvent = Ss.storage.session.getItem('pending_event');
		if(pEvent) {
			return decodeURIComponent(pEvent);
		}
		return null;
	},
	
	setPendingEvent: function(src) {
		Ss.storage.session.setItem('pending_event', encodeURIComponent(src));
	},
	
	deletePendingEvent: function() {
		Ss.storage.session.removeItem('pending_event');
	},
	
	eventHandlers: {

		click: function(evt) {

			try {
				var target = Event.element(evt),
					trackedElement = Ss.tracker._getTrackedElement(target),
					excludeTags = ['SELECT', 'OPTION'],
					metadata = {};

				if(!trackedElement || excludeTags.include(target.nodeName)) {
					return;
				}

				metadata.tag_name = trackedElement.nodeName;

				if(trackedElement.nodeName == 'INPUT') {
					
					metadata.input_type = trackedElement.type || '';
					
					if(trackedElement.type != 'text' && trackedElement.type != 'password') {
						metadata.input_name = trackedElement.name || '';
						metadata.input_value = trackedElement.value || '';
						metadata.input_checked = trackedElement.checked || '';
					}
					
				}

				metadata.element_id = Ss.tracker._getTrackedElementId(trackedElement);

				var eType = Ss.tracker._getEventTypeByElementId(trackedElement.id)
				         || 'click';
				Ss.tracker.logEvent(eType, metadata, target);

			} catch (ex) {
			}

		},
		
		change: function(evt) {
			
			try {

				var target = Event.element(evt),
					metadata = {},
					eType = '';
					
				metadata.tag_name = target.nodeName;
				metadata.element_id = Ss.tracker._getTrackedElementId(target);
				metadata.input_name = target.name || '';
				metadata.input_value = target.value || '';
				
				eType = Ss.tracker._getEventTypeByElementId(target.id)
				         || 'click';
				
				Ss.tracker.logEvent(eType, metadata);

			} catch(ex) {
			}

		}

	},

	get: {

		search_term: function(event_type, target) {
			var term = $('shutterstock_search').down('input[name=searchterm]').getValue();
			return term;
		},

		page_number: function(event_type, target) {
			var page_number;
			if (event_type === 'paginate') {
				page_number =  Ss.location.getHashParam('page');
			} else if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				page_number =  src[1];
			} else if (event_type === 'click') {
				page_number =  Ss.search.getCurrentPage();
			}
			return page_number;
		},

		photo_id: function(event_type, target) {
			var photo_id;
			if (event_type === 'download') {
				photo_id = $('submit_form').id.value;
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				photo_id =  p.id;
			}
			return photo_id;
		},

		image_position: function(event_type, target) {
			var image_position;
			if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				image_position = src[2];
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				var pos = p.src.split('-')[2];
				image_position = pos;
			}
			return image_position;
		},

		tracking_id: function(event_type, target) {
			var tracking_id;
			if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				tracking_id = src[0];
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				tracking_id = p.src.split('-')[0];
			}
			return tracking_id;
		}
	},

	_getTrackedElement: function(element) {
		var trackedElement,
			configIds = this._getConfigIds();

		if(configIds.include(element.id)) {
			trackedElement = element;
		} else {
			trackedElement = element.ancestors().find(
				function(elem) {
					return configIds.include(elem.id);
				}
			);
		}




		if(!trackedElement && this.config.track_all_clicks) {
			trackedElement = element;
		}

		return trackedElement;
	},
	
	_getTrackedElementId: function(elem) {
		var id = '';
		if(elem.hasAttribute('id')) {
			id = elem.getAttribute('id');
		} else if(Ss.tracker.config.track_all_clicks) {
			id = elem.ancestors().find(
				function(anc) {
					return anc.hasAttribute('id');
				}
			).getAttribute('id');
		}
		return id;
	},

	_getConfigIds: function() {
		return Object.values(Ss.tracker.config.click_event_ids).flatten();
	},

	_getEventTypeByElementId: function(id) {
		var type = '';
		Object.keys(Ss.tracker.config.click_event_ids).each(function(eventType) {
			if(Ss.tracker.config.click_event_ids[eventType].include(id)) {
				type = eventType;
			}
		});
		if (type == 'default_click' || type == 'default_select') {

			type = 'click';
		}
		return type;
	},

	_log: function(event) {
		var loggedEvent = {};
		for (var i=0; i < event.length; i++) {
			var column = $H(Ss.tracker.config.name_to_column).find(function(entry) {
				return entry.value == i;
			});
			loggedEvent[column.key] = event[i];
		};
		if (console) {
			console.log(loggedEvent);
		}
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/tracker.js'

// global.js: begin JavaScript file: '/js/header.js'
// ================================================================================
Ss.header = {
    
    activeMenu: null,
    
    loginForm: null,
    
    initialize: function(args) {
        this.element = $('navigation');
        
        this.element.observe('click', this.click.bind(this));
        
		Ss.ShadowContainer.observe(
		    function(evt) {
		        if(evt.type == 'hide') {
		            Ss.header._reset();
		        }
		    }
		);

    },

	getMenus: function() {

	    return {
            'language_menu': {
            	trigger:	$('language_selector'),
                element: 	$('language_menu'),
                options: {
                	position: {
						target:	$('language_selector'),
						type: 		'bottom',
						offsetY: 	1,
						offsetX:    -64 
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu dropdown-menu'
				}
            },
            
            'acct_menu': {
            	trigger:	$('navbar-acct'),
                element: 	$('my-acct-drop'),
                options: {
                	position: {
						target:	$('navbar-acct'),
						type: 		'bottom',
						offsetY: 	0,
						offsetX:    -5
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu dropdown-menu'
				}
            },

            'user_options_menu': {
            	trigger:	$('user_options_selector'),
                element: 	$('user_options_menu'),
                options: {
                	position: {
						target:	$('user_options_selector'),
						type: 		'bottom',
						offsetY: 	12,
						offsetX:    -24
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu dropdown-menu'
                }
            },
            
            'inline_login_form': {
            	trigger:	$('inline_login'),
                element: 	$('inline_login_form'),
                options: {
                	position: {
						target:	$('inline_login'),
						type: 		'bottom',
						offsetY: 	28,
						offsetX:    15
					},
					closeButton: false,
					modal:	false,
					notch:		{
						type: 'top',
						styles: {
							left: '80%'
						}
					},
					className: 'header_menu shadow_container_gray popover bottom inline_login_form'
				}
            }
        };
        
	},

    click: function(evt) {
        
        var trigger = Event.element(evt),
            menus = this.getMenus(),
            activeMenu = this.activeMenu;

        this._reset();
        
        if(activeMenu) {
            
            Ss.header.hideMenu();
            
            if(trigger == activeMenu.trigger || 
                trigger.descendantOf(activeMenu.trigger))
            {
                Event.stop(evt);
                return;
            }
            
        }

        Object.keys(menus).each(
            function(key) {
                var menu = menus[key];
                
                if(menu.trigger && (trigger == menu.trigger || trigger.descendantOf(menu.trigger))) {
                	if(key != 'user_options_menu' && key != 'language_menu') {
                		Event.stop(evt);
					}
                    Ss.header.showMenu(menu, key);
                }
            }
        );
        
    },
    
	showMenu: function(menu, key) {
	
	    var menuElem, header = this;
	    
	    menu.trigger.addClassName('active_menu_trigger');
	    
		if(key == 'inline_login_form') {
		    menuElem = this.loginForm || this.makeLoginForm(menu);
		} else {
		     menuElem = menu.element.cloneNode(true)
		}
		
		Ss.ShadowContainer.write(menuElem, menu.options);
		
		this.activeMenu = menu;
		
		if(key == 'inline_login_form') {
			( function(){ menuElem.down('input[type=text]').focus(); } ).defer(); // deferment is needed to support explorer
		}
	},
	
	hideMenu: function() {
		 Ss.ShadowContainer.hide()
	},
	
	makeLoginForm: function(menu) {
	    this.loginForm = menu.element;
	    


		if(Prototype.Browser.IE) {
		    Ss.input.InFieldLabel.create(this.loginForm.down('input[name=user]'));
		    Ss.input.InFieldLabel.create(this.loginForm.down('input[name=pass]'));
        }
        return this.loginForm;
	},
	
	_reset: function() {

	    $$('#language_selector, #user_options_selector, #inline_login').compact().invoke('removeClassName', 'active_menu_trigger');
	    

	    this.activeMenu = null;
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/header.js'

// global.js: begin JavaScript file: '/js/Cookie.js'
// ================================================================================
function createCookie(args) {
	if (args.days) {
		var date = new Date();
		date.setTime(date.getTime() + (args.days*24*60*60*1000));
		var expires = "; expires=" + date.toGMTString();
	} else {
		var expires = "";
	}
	document.cookie = args.name + "=" + args.value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
		   c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Cookie.js'

// global.js: begin JavaScript file: '/js/patterns.js'
// ================================================================================
/************************
 * Patterns (patterns.js)
 */
Ss = window.Ss || {};
Ss.patterns = {};


/* SUBJECT */
Ss.patterns.Subject = Class.create({
	initialize: function() {
		this.observers = [];
	},
	subscribe: function(f) {
		this.observers.push(f);	
	},
	unsubscribe: function(f) {
		this.observers = this.observers.without(f);
	},
	notify: function(data) {
		this.observers.each(function(fn) {
			fn(data);
		});
	}
});


/* ABSTRACT MODEL */
Ss.patterns.Model = Class.create(Ss.patterns.Subject, {
	initialize: function($super, data) {
		$super();
		this.data = data;
	},
	set: function(data) {
		this.data = data;
		this.notify(data);
	}
});


/* ABSTRACT VIEWS */
Ss.patterns.View = Class.create({
	initialize: function(element, model, controller) {
		this.element = element;
		this.model = model;
		this.controller = controller;
		
		this.model.subscribe(this.update.bind(this));
		this._events();
	},
	observe: function(eType) {
		this.element.observe(eType, this.controller[eType]);
	},
	update: function(data) { 

		this.element.update(data);
	},
	_events: function() { /*abstract*/ }
});

Ss.patterns.CompositeView = Class.create(Ss.patterns.View, {
	initialize: function($super, element, model, controller) {
		$super(element, model, controller);
		this._views = [];
	},
	update: function() {
		this._views.invoke('update');
	},
	add: function(view) {
		this._views.push(view);
	},
	remove: function(view) {
		this._views = this.views.reject(function(v){return view == v});
	},
	get: function(index) {
		return this.children[index];
	}
});


/* ABSTRACT CONTROLLERS */
Ss.patterns.Controller = Class.create({
	initialize: function(model) {
		this.model = model;
	},
	click: function(event) { /*abstract*/ }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/patterns.js'

// global.js: begin JavaScript file: '/js/util.js'
// ================================================================================
/*********************
 * Utilities (util.js)
 */
Ss = window.Ss || {};
Ss.util = {};
Ss.util.disableTextSelection = function(element) {
	element.onselectstart = function() { return false; };
	element.unselectable = "on";
	element.style.MozUserSelect = "none";
};
Ss.util.getElementText = function(element) {
	var ret = $A(element.childNodes).collect(function(c){
		if(c.nodeType != 8){
			return (c.nodeType != 1 ? c.nodeValue: Ss.util.getElementText(c))
		}
	}).join('');
	return ret.strip();
};
Ss.util.sum = function(list, prop) {
    return list.inject(0, function(total, item){return total + parseInt(item[prop]);});
};
Ss.util.avg = function(list, prop) {
    return Ss.util.sum(list, prop)/list.length;
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/util.js'

// global.js: begin JavaScript file: '/js/Pulldown.js'
// ================================================================================
/***********
 * Pulldown
 */
Ss = window.Ss || {};
Ss.Pulldown = Class.create(Ss.patterns.Subject, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar) {
		$super();
		this.element = element
		this.trigger = trigger;
		this.content = content;
		this.contentContainer = contentContainer;
		this.titleBar = titleBar;
		this.state = "";
		this.collapse();
		this._events();
		this._tId;
		Ss.Pulldown.INSTANCES.set(this.element.identify(), this);
	},
	/* change state/collaspe/expand */
	collapse: function() {
		this._setState(Ss.Pulldown.STATES.collapsed);
		this._resize(0);
	},
	expand: function() {
		this._setState(Ss.Pulldown.STATES.expanded);
		

        if (this.titleBar.childElements().grep(new Selector("div.no-update")).length == 0) {
            this.titleBar.update(this.trigger.cloneNode(true));
            this.titleBar.insert('<a class="close_btn close_btn_dark_trans"></a>');
        }	
        
		this.titleBar.select('a.close_btn')[0].observe('click', this.collapse.bind(this));

		var somePadding = 20;
		var elDim = this.contentContainer.getDimensions();
		var vpDim = document.viewport.getDimensions();
		var elOff = this.contentContainer.viewportOffset();
		var corrections = { 
		    'marginLeft': '',
		    'marginTop': ''
		};
		if(elDim.width + elOff.left > vpDim.width) {
			corrections['marginLeft'] = -1 * ((elOff.left + elDim.width + somePadding) - vpDim.width) + 'px';
		}
		if(elDim.height + elOff.top > vpDim.height) {
		    corrections['marginTop'] = -1 * ((elOff.top + elDim.height + somePadding) - vpDim.height) + 'px';
		}
        this.contentContainer.setStyle(corrections);
		this._resize();
	},
	/* change content */
	appendJson: function(jsonArr) {
		jsonArr = (Object.isArray(jsonArr) ? jsonArr : [jsonArr]);
		Ss.Pulldown.jsonToItems(jsonArr).each(
			function(item) {
				this._appendItem(item);		
			}, this);
	},
	appendContent: function(content) {
		$(this.content).insert(content);
		this._resize();
	},
	replaceContent: function(content) {
		$(this.content).update(content);
		this._resize();
	},
	clearContent: function(){
		this.replaceContent('');
	},
	/*change trigger*/
	appendToTrigger: function(content) {
		$(this.trigger).insert(content);
	},
	replaceTrigger: function(trigger) {
		$(this.trigger).update(trigger);
		$(this.trigger).insert('<span class="pulldown_open_icon">&#9660;</span>');
	},
	/* disable/enable automatic collapse on mouseout*/	
	disableAutoClose: function() {
		$(this.element).stopObserving('mouseout');
	},
	enableAutoClose: function() {
		$(this.element).observe('mouseout', this._mouseout.bind(this));
	},
	/* show/hide loading state */
	showLoading: function() {
		$(this.element).addClassName(Ss.Pulldown.COMPONENTS.loading);
	},
	hideLoading: function() {
		$(this.element).removeClassName(Ss.Pulldown.COMPONENTS.loading);
	},
	getElement: function() {
		return this.element;
	},
	destroy: function() {
		$(this.element, this.trigger, this.content, this.contentContainer).invoke('stopObserving');
		try { $(this.element).remove(); }
		catch(e) { }
	},
	
	/* private */
	_resize: function(width) {
		if(document.documentMode <= 7 || Ss.Browser.isIEVersion(7)) {
			width = width || this.content.getDimensions().width;
			if( width > this.titleBar.getDimensions().width ) {
				this.titleBar.setStyle({
					width: width + 'px'
				});
			}
		}
	},
	_appendItem: function(item) {
		if(!$(this.content).select("UL").size() > 0) {
			$(this.content).insert(new Element("UL"));
		}
		$(this.content).select("UL").pop().insert(item);
	},
	_toggleState: function() {
		this.state == Ss.Pulldown.STATES.expanded ? this.collapse() : this.expand();
	},
	_events: function() {
		this.enableAutoClose();
		$(this.trigger).observe('click', this._click.bind(this));
		$(this.element).observe('mouseover', this._mouseover.bind(this));

		Ss.util.disableTextSelection(this.trigger);
	},
	_click: function(event) {
		this._toggleState();
	},
	_mouseout: function(event) {
		if( !Position.within($(this.element), Event.pointerX(event), Event.pointerY(event)) &&
			!Position.within($(this.contentContainer), Event.pointerX(event), Event.pointerY(event)) &&
			this.state != Ss.Pulldown.STATES.collapsed)
		{
			this._tId = (function() {
                        	this.collapse();
                       	}).bind(this).delay(Ss.Pulldown.COLLAPSE_DELAY_SECONDS);
		}
	},
	_mouseover: function(event) {
		if(this._tId)
			window.clearTimeout(this._tId);
	},
	_reset: function() {
		$H(Ss.Pulldown.STATES).values().each(function(state) {
			$(this.element).removeClassName(state);
		}, this);
		this.contentContainer.setStyle({
				'marginLeft': '',
				'marginTop': ''
		});
	},

	_setState: function(state) {
		this._reset();
		this.state = state;
		$(this.element).addClassName(state);
		this.notify({state: state});
	}
	
});


if(Prototype.Browser.IE) {
	Ss.Pulldown.addMethods({
		_showIframe: function() {
			if(!this._iframe) {
				var iframe = new Element('IFRAME', {
					frameborder: 0
				});
				var dim = $(this.contentContainer).getDimensions();
				iframe.setStyle({
					position: 'absolute',
					top: '0',
					left: '0',
					height: dim.height + 'px',
					width: dim.width + 'px',
					zIndex: '-1'
				});
				this.contentContainer.insert({top: iframe});
				this._iframe = iframe;
			}
			$(this._iframe).show();
		},
		_hideIframe: function() {
			if(this._iframe) {
				$(this._iframe).hide();
			}
		}
	});
}

/****************
 * Ajax Pulldown
 */
Ss.AjaxPulldown = Class.create(Ss.Pulldown, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar, url, parameters, callback) {
		$super(element, trigger, content, contentContainer, titleBar);
		this.url = url;
		this.parameters = parameters;
		this.callback = callback;
		this.isLoaded = false;
	},
	load: function() {
		this.showLoading();
		this.isLoaded = true;
		var ap = this;
		var xhr = new Ajax.Request(ap.url, {
			parameters: ap.parameters,
			onSuccess: function(response) {
				ap.appendContent(response.responseText);
				response.responseText.evalScripts();
				ap._doCallback(response);
				ap.expand();
				ap.hideLoading();
			}
		});			
	},
	setCallback: function(f) {
		this.callback = f;
	},
	_doCallback: function(response) {
		if(Object.isFunction(this.callback)) {
			this.callback.call(this, response);
		}		
	},
	_click: function(event) {
		this[ this.isLoaded ? '_toggleState' : 'load']();
	}
});


/******************
 * Select Pulldown
 */
Ss.SelectPulldown = Class.create(Ss.Pulldown, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar, charLimit) {
		$super(element, trigger, content, contentContainer, titleBar);
		this.charLimit = charLimit;
	},
	items: function() {
		return $(this.element).select('LI');
	},
	select: function(key) {
		var item = this.find(key);
		if(item) {
			return this._select(item);
		}
		throw("Item '" + key + "' not found");
	},
	find: function(key) {
		if(Object.isNumber(key) 
			&& this.items().length > key) 
		{
			return this.items()[key];
		}
		if(Object.isString(key)) {
			return this.items().find(function(item) {
				return (Ss.util.getElementText(item).toLowerCase() == key.toLowerCase())
			});
		}
		return false;
	},
	_appendItem: function($super, item) {
		this._registerItem(item);
		$super(item);
	},
	_select: function(item) {
		this.items().invoke("show");
		$(item).hide();
		this.replaceTrigger(this._toTrigger(item));
		this.collapse();
		this.notify({state: this.state, selected: item});
	},
	_toTrigger : function(item) {
		var triggerText = Ss.util.getElementText(item).truncate(this.charLimit);
		var icon = $(item).select("IMG").shift();
		var trigger = new Element('SPAN').update(triggerText);
		if(icon) {
			trigger.insert({top: icon.cloneNode(true)});
		}
		return trigger;
	},
	_events: function($super) {
		$super();
		this._registerItems();
	},
	_registerItems: function() {
		this.items().each(function(item) {
			this._registerItem(item);
		}, this);
	},
	_registerItem: function(item) {
		$(item).observe('click', (function(event) {
			this._select(item);
		}).bind(this));
	}
});


/***********************
 * Ajax Select Pulldown
 */
Ss.AjaxSelectPulldown = Class.create(Ss.SelectPulldown);
Ss.AjaxSelectPulldown.addMethods({
	initialize: function($super, element, trigger, content, contentContainer, titleBar, charLimit, url, parameters, callback) {
		$super(element, trigger, content, contentContainer, titleBar, charLimit);
		this.url = url;
		this.parameters = parameters;
		this.callback = callback;
		this.isLoaded = false;
	},
	load: Ss.AjaxPulldown.prototype.load,
	setCallback: Ss.AjaxPulldown.prototype.setCallback,
	_click: Ss.AjaxPulldown.prototype._click,
	_doCallback: function(response) {
		this._registerItems();
		Ss.AjaxPulldown.prototype._doCallback.apply(this);
	}
});


/**************************
 * Class Properties/Methods
 */
Ss.Pulldown.INSTANCES = new Hash();
Ss.Pulldown.COLLAPSE_DELAY_SECONDS = .3;
Ss.Pulldown.STATES = { //CSS class names applied/removed when current state changes
	collapsed: 'collapsed',
	expanded:  'expanded'
};
Ss.Pulldown.COMPONENTS = { //CSS class names used for various elements/subcomponents
	element:            'pulldown',
	trigger:            'pulldown_trigger',
	contentContainer:   'pulldown_content_container',
	content:            'pulldown_content',
	loading:            'pulldown_loading',
	openIcon:           'pulldown_open_icon',
	titleBar:           'pulldown_title_bar'
};

Ss.Pulldown.get = function(id) {
	return Ss.Pulldown.INSTANCES.get(id);
};

Ss.Pulldown.create = function(id) {
	return Ss.Pulldown.construct(Ss.Pulldown.createElement(id));
};

Ss.Pulldown.construct = function(element) {
	return new Ss.Pulldown(element, 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar));
};
Ss.AjaxPulldown.construct = function(element, url, parameters, callback) {
	return new Ss.AjaxPulldown(element,
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		url, parameters, callback);
};
Ss.SelectPulldown.construct = function(element, charLimit) {
	return new Ss.SelectPulldown(element, 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		charLimit);
};
Ss.AjaxSelectPulldown.construct = function(element, charLimit, url, parameters, callback) {
	return new Ss.AjaxSelectPulldown(element,
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),	
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		charLimit, url, parameters, callback);
};

Ss.Pulldown.createElement = function(id) {
	var t = new Template('<div class="#{trigger}"><a class="#{openIcon}">&#9660;</a></div><div class="#{contentContainer}"><div class="#{content}"></div><div class="#{titleBar}"><a>&#215;</a></div></div>');
	var element = new Element("DIV", {"class": Ss.Pulldown.COMPONENTS.element}).insert(t.evaluate(Ss.Pulldown.COMPONENTS));
	return ( id ? element.writeAttribute({"id":id}) : element );
};

Ss.Pulldown.getComponent = function(element, type) {
	return $(element).select("." + type).shift();
};

Ss.Pulldown.jsonToItem = function(obj) {
	var anchor = new Element('A').update(obj.name);
	var item = new Element('LI').update(anchor);	
	if(obj.icon_src) {
		anchor.insert({top: new Element('IMG', {src: obj.icon_src})});
	}
	if(Object.isString(obj.onclick)) {
		item.observe('click', function() {eval(obj.onclick);})
	}
	else if(Object.isFunction(obj.onclick)) {
		item.observe('click', obj.onclick);
	}
	return item;
};
Ss.Pulldown.jsonToItems = function(jsonArr) {
	var items = [];
	jsonArr.each(function(obj) {
		items.push(Ss.Pulldown.jsonToItem(obj));
	});
	return items;
};


Ss.Pulldown.convert = function(select, id, charLimit) {
	var sOptions = select.select('option');
	var sPulldown = Ss.SelectPulldown.construct(Ss.Pulldown.createElement(id), charLimit);
	var optionsJson = sOptions.collect(function(option, i){return {name: option.text, index: i};});
	sPulldown.appendJson(optionsJson);
	sPulldown.select(select.options[select.selectedIndex].text);
	sPulldown.subscribe(function(state){
		var selectedItem = state.selected;
		if(selectedItem){
			var selectedText = Ss.util.getElementText(selectedItem);
			var itemObj = optionsJson.find(function(obj){return obj.name == selectedText});
			select.selectedIndex = itemObj.index;
		}
	});
	select.insert({after: sPulldown.element});
	select.hide();
	return sPulldown;
};

Ss.Pulldown.debug = function() {
    Object.values(Ss.Pulldown.INSTANCES.toObject()).invoke('disableAutoClose');
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Pulldown.js'

// global.js: begin JavaScript file: '/js/Share.js'
// ================================================================================
Ss = window.Ss || {};
Ss.share = {
	pulldowns: [],
	translatedToError: "",
	translatedFromError: "",
	translatedAddressError: "",
	
	closeEmailForm: function(e) {
		$(e).down('.network-form').reset();
		$(e).down('.message-area').hide();
		$(e).down('.email-form-container').hide();
		$(e).down('.network-errors').update();
		$(e).down('.social_network_list').show();
	},
	
	openEmailForm: function(e) {
		$(e).up('.share_interface_content').down('.email-form-container').show();
		$(e).up('.share_interface_content').down('.social_network_list').hide();
	},
	

	addPulldown: function(pulldown) {
		this.pulldowns.push(pulldown);
	},
	
	getPulldown: function(e){
		return this.pulldowns.find(function(p){ return e.descendantOf(p.getElement()); });
	},
	
	toggleNetworkEmail: function(e) {		
		this.openEmailForm(e);
		

		var pulldown = this.getPulldown(e);
		

		pulldown._resize();
		

		pulldown.disableAutoClose();
		

		pulldown.subscribe( function(data) {
			if(data.state == Ss.Pulldown.STATES.collapsed) {
				pulldown.enableAutoClose();
				Ss.share.closeEmailForm(pulldown.getElement());
				pulldown.unsubscribe(arguments.callee);
			}
		});
	},
	
	sendNetworkEmail: function(t) {

		var container = $(t).ancestors().find(function(e){return e.match('.share_interface_content');});
		if (this.validateAddresses($(t).up('form'))) {
			$(t).up('form').request({
				onFailure: function(){ 
					alert('Sorry, your message was not sent.');
				}
			});
			container.descendants().find(function(e){return e.match('.email-form-container');}).hide();
			container.down('.message-area').show();
		}
	},
	
	validateAddresses: function(form) {
		var addressList = new Array();
		var errors      = new Array();
		var fromAddress = form.getInputs('text', 'from')[0].getValue();
	
		if (!fromAddress) {
			errors.push(this.translatedFromError);
		}
	
		var toAddresses = form.getInputs('text', 'to')[0].getValue().split(/\s*\,\s*/);
	
		if (toAddresses && !toAddresses[0]) {
			errors.push(this.translatedToError);
		}
	
		var allAddressesValid = true;
		var translatedAddressError = this.translatedAddressError;
		$A([[fromAddress], toAddresses]).flatten().each(function(address) {
			if (!address.match(/[\w.-]+\@[\w.-]+\.[\w]{2,5}/)) {
				allAddressesValid = false;
				errors.push( translatedAddressError + " '" + address + "'");
			}
		});
	
		if (!allAddressesValid) { 
			var errorMessage = errors.shift();
			form.previous().update(errorMessage);
		}
		return allAddressesValid;
	},
	
	open: function(path) {
		window.open(path);
	},
	
	close: function(e) {
		this.getPulldown(e).collapse();
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Share.js'

// global.js: begin JavaScript file: '/js/search_ui/SearchWithin.js'
// ================================================================================
Ss = window.Ss || {};

Ss.SearchWithin = {
	
	initialize: function() {

		var advancedSearch = $('pf_advanced_search'),
			keywordTextInput = $('pf_keyword_input'),
			keywordLabel = $('pf_keyword_label'),
			firstLabel = $$('#pf_advanced_search label')[0],
			notch = $$('#pf_advanced_search .shadow_arrow_top')[0],
			notchLeft = parseInt(notch.getStyle('left')),
			advancedMenuToggle = $('pf_toggle_advanced'),
			hiddenFieldToggle = $('show_pf_hidden_fields'),
			hiddenFields = $('pf_hidden_fields'),
			container = $('pf_search_within'),
			editorialCheckbox = $('editorial_checkbox'),
			peopleCheckbox = $('people_checkbox'),
			peopleSelects = $$('#people_selects select'),
			allFields = $$('#pf_advanced_search input[type=text], #pf_advanced_search input[type=checkbox], #pf_advanced_search select'),
			body = $$('body').first();
		
		var syncPeopleAndEditorial = function() {
			if (editorialCheckbox) {
				if(peopleCheckbox.checked) {
					editorialCheckbox.checked = false;
					editorialCheckbox.disabled = true;
				} else {
					editorialCheckbox.disabled = false;
				}
			}
		};
		

		keywordTextInput.observe('focus', function(evt) {
			advancedSearch.show();
		});
		

		advancedMenuToggle.observe('click', function(evt) {
			advancedSearch.toggle();
		});



		if(hiddenFieldToggle) {
			hiddenFieldToggle.observe('click', function(evt) {
				hiddenFields.show();
				hiddenFieldToggle.up('tr').hide();
				
			});
		}
		

		body.observe('click', function(evt) {
			var target = evt.findElement();
				
			if( target.isElementOrDescendantOf(container) &&
				!target.isElementOrDescendantOf(notch)
			) {
				return;
			}
			advancedSearch.hide();
		});
		
		peopleCheckbox.observe('change', function(evt) {
				peopleSelects.each(function(select) {select.value = '';});
				syncPeopleAndEditorial();
		});
		
		peopleSelects.invoke('observe', 'change', function(evt) {
				peopleCheckbox.checked = true;
				syncPeopleAndEditorial();
		});
		

		$('clear_all').observe('click', function(evt) {
			allFields.each(
				function(field) {
					if(field.type && field.type == 'checkbox') {
						field.checked = false;   
					} else {
						field.value = ''; // works on selects and text inputs
					}
					if(field.disabled == true){
						field.disabled = false;
					}
				}
			);
			clearColor();
		});
		

		new Ss.input.InFieldLabel({
				label: keywordLabel,
				field: keywordTextInput
		});
		

		syncPeopleAndEditorial();
		

		Ss.color.init({
			swatch: advancedSearch.down('.swatch'),
			wheel: advancedSearch.down('.wheel'),
			form: advancedSearch.up('form'),
			clear: advancedSearch.down('.clear_color'),
			hexInput: advancedSearch.down('input[name=color]')
		});
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/SearchWithin.js'

// global.js: begin JavaScript file: '/js/search_ui/searchForm.js'
// ================================================================================
Ss.searchForm = {
    shim: null,
    
	initialize: function(args) {
		var ctr = args.container;
		this.els = {
			container: ctr,
			layer: args.layer, // for autocomplete
			input: ctr.down('input[name=searchterm]'),
			form: ctr.down('form'),
			mediaSelected: ctr.down('.media_selected'),
			mediaOptions: ctr.down('.media_options')
		};
        this.mediaTypes = args.mediaTypes;

		this.suggest = Ss.suggest.create({
			input: this.els.input,
			layer: this.els.layer,
			language: args.autocompleteLanguage,
			focusOnKeydown: args.focusOnKeydown
		});

		if(!Ss.Browser.supports.placeholder()) {
			this._shim = this._placeholder();
			Ss.search.subscribe('show', this._shim.update.bind(this._shim));
		}
		this.setupMediaMenu();
		Ss.pic.subscribe('show', this.clear.bind(this));
    },
    setupMediaMenu: function() {
        var mediaOptions = this.els.mediaOptions;
        var form  = this.els.form;
        var mediaSelected = this.els.mediaSelected;
        var meta = this.mediaTypes;
        mediaOptions.addToggle(mediaSelected, { className: 'media_menu_open'});
        mediaOptions.delegateClick('li', function(evt){
            var type = evt.target.getAttribute('data-media-type');
            Ss.searchForm.setMediaType(type);
            mediaOptions.hide();
            document.body.removeClassName('media_menu_open');
        });
        document.observe('searchform:change', function(evt) {
            var type = evt.memo.mediaType;
            mediaSelected.update(meta[type].label);
            form.action = meta[type].action;
        });
    },
	setMediaType: function(type) {
	    document.fire('searchform:change', { mediaType: type });
	},
    clear: function() {
        this.els.input.clear();
        if(this._shim) {
            this._shim.clear();
        }
    },
    _placeholder: function() {
        var input = this.els.input;
        var placeholder = input.getAttribute('placeholder');
        var label;
        input.insert({ before: '<span class="in_field_label">' + placeholder + '</span>' });
        label = this.els.container.down('.in_field_label');
        return new Ss.input.InFieldLabel({
                label: label,
                field: input
        });
    }
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/searchForm.js'

// global.js: begin JavaScript file: '/js/search_ui/advancedSearch.js'
// ================================================================================
Ss.advancedSearch = {
	initialize: function(args) {
		var ctr = args.container;
		this.phrases = args.phrases;
		this.els = {
			container: ctr,
			trigger: ctr.previous('.advanced_trigger'),
			form: ctr.up('form'),
			mediaFields: ctr.select('input[name=media_type]'),
			peopleFieldsToggle: ctr.down('.more_people_toggle'),
			peopleFieldsContainer: ctr.down('.more_people'),
			peopleFields: ctr.select('.more_people select'),
			peopleOnly: ctr.down('input[name=model_released]'),
			noPeople: ctr.down('input[name=no_people]'),
			editorial: ctr.down('input[name=editorial]'),
			category: ctr.down('select[name=search_cat]'),
			clear: ctr.down('.button_clear')
		};
		this.contributorMenu= new Ss.ContributorDropdown(this.els.container.down('.photographer_menu'));
		this.colorMenu = this.makeColorMenu();
		this.setupMutexFields();
		this.setupToggles();
		this.setupMediaFields();
		


		Ss.search.subscribe('show', this.reset.bind(this));
		Ss.pic.subscribe('show', this.clear.bind(this));
	},
	setupToggles: function() {
		var els = this.els;
		var phrases = this.phrases;
		els.peopleFieldsToggle.observe('click', function(evt) {
			els.peopleFieldsContainer.toggle();
			var text = (els.peopleFieldsContainer.visible() ? phrases['LESS_PEOPLE_OPTIONS'] : phrases['MORE_PEOPLE_OPTIONS'] );
			this.update(text);
		});
		els.clear.observe('click', this.clear.bind(this));
		this.els.container.addToggle(this.els.trigger, { className: 'advanced_menu_open' });
	},
	setupMutexFields: function() {
		var els = this.els;
		var peopleCategories = [13,30,31];
		els.category.observe('change', function(evt) {
			if(peopleCategories.include(this.value)) {
				els.noPeople.checked = false;
			}
		});
		els.peopleFields.invoke('observe', 'change', function(evt) {
			if(this.selectedIndex > 0) {
				els.peopleOnly.checked = true;
				els.editorial.checked = false;
				els.noPeople.checked = false;
			}
		});
		els.peopleOnly.observe('click', function(evt) {
			if(this.checked) {
				els.editorial.checked = false;
				els.noPeople.checked = false;
			} else {
				els.peopleFields.invoke('clear');
			}
		});
		els.editorial.observe('click', function(evt) {
			if(this.checked) {
				els.peopleOnly.checked = false;
				els.peopleFields.invoke('clear');
			}
		});
		els.noPeople.observe('click', function(evt) {
			if(this.checked) {
				els.peopleOnly.checked = false;
				els.peopleFields.invoke('clear');
				if(peopleCategories.include(els.category.value)) {
					els.category.clear();
				}
			}
		});
	},
	makeColorMenu: function() {
	    var ctr = this.els.container;
		return Ss.color.init({
			swatch: ctr.down('.swatch'),
			wheel: ctr.down('.wheel'),
			form: ctr.up('form'),
			toggle: ctr.down('.toggle_wheel'),
			hexInput: ctr.down('input[name=color]'),
			clear: ctr.down('.swatch .close_btn'),
			closeWheel: ctr.down('.wheel .close_btn')
		});
	},
	setupMediaFields: function() {
		var form = this.els.form;
		var mediaFields = this.els.mediaFields;
		mediaFields.invoke('observe', 'click', function(evt) {
			this.fire('searchform:change', { mediaType: evt.target.value });
		});
		document.observe('searchform:change', function(evt) {
			if(mediaFields.include(evt.target)) {
				return;
			}
			var type = evt.memo.mediaType;
			var radio = form.down('input[value=' + type + ']');
			if(radio) {
				radio.checked = true;
			}
		});
	},
	getMediaType: function() {
		return this.els.form.down('input:checked[type=radio][name=media_type]').value;
	},
	setMediaType: function(type) {
	    document.fire('searchform:change', { mediaType: type });
	},
	clear: function() {
		this.els.container.select('input[type=checkbox], input[type=text], select').invoke('clearValue');
		this.setMediaType('images');
		this.colorMenu.clear();
	},
	reset: function() {
	    this.els.form.reset();
	    this.colorMenu.update();
	    this.setMediaType(this.getMediaType());
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/advancedSearch.js'

// global.js: begin JavaScript file: '/js/search_ui/sortForm.js'
// ================================================================================
Ss = window.Ss || {};

Ss.sortForm = {
    initialize: function() {
	    $('grid_options_top').delegateClick('#grid_options_top label',
	        function(evt) {
	            var label = Event.findElement(evt, 'label');
	            var input = label.down('input');
	            var form = input.up('form');
                if(label.hasClassName('nolink')) { // if the clicked sort method is currently selected, do nothing
                    Event.stop(evt);
                    return;
                }
                Ss.sortForm.showLoading();
                (function(){
                    form.submit();
                }).defer();
	        }
	    );
    },
	showLoading: function(){
	    var text = $('sort_text');
	    var msg = $('sort_text_msg');
	    var loading = $('sort_loading');
		loading.show();
		Ss.search.showLoading();
		text.setStyle({width: text.getWidth()+'px'});
		if(Object.isElement(msg)) {
			msg.hide();
		}
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/sortForm.js'

// global.js: begin JavaScript file: '/js/color_wheel.js'
// ================================================================================
Ss.color = {};
Ss.color.init = function(els) {


    var swatchc = null;
    var wheel;
    var swatch;
    var form;
    var clear;
    var hexInput;
    hue = 60;
    adeg = 60;
    sat = 1;
    val = 1;
    
    function getRealLeft() {
      xPos = this.offsetLeft;
      tempEl = this.offsetParent;
      while (tempEl != null) {
          xPos += tempEl.offsetLeft;
          tempEl = tempEl.offsetParent;
      }
      return xPos;
    }
    
    function getRealTop() {
      yPos = this.offsetTop;
      tempEl = this.offsetParent;
      while (tempEl != null) {
          yPos += tempEl.offsetTop;
          tempEl = tempEl.offsetParent;
      }
      return yPos;
    }
    
    function colorWheelInit(els) {
      swatch = els.swatch;
      wheel = els.wheel;
      form = els.form;
      clear = els.clear;
      hexInput = els.hexInput;
      wheel.getRealTop = getRealTop;
      wheel.getRealLeft = getRealLeft;
      
      var doUpdate = function() {
          if(!form.color.value.startsWith('#')) {
              form.color.value = '#' + form.color.value;
          }
          updateColor();
      };

      wheel.observe('mousemove', mouseMoved);
      hexInput.observe('change', doUpdate);
      hexInput.observe('keypress', function(evt) {
        if(evt.keyCode == Event.KEY_RETURN) {
            evt.preventDefault();
            doUpdate();
        }
      });
      hexInput.observe('blur', doUpdate);
      
      if(clear) {
          clear.observe('click', clearColor);
      }
      wheel.observe('click', clickWheel);
      if(els.toggle) {
          wheel.addToggle(els.toggle);
      }
      if(els.closeWheel) {
      	  els.closeWheel.observe('click', function(evt){
      	  	wheel.hide();
      	  	Event.stop(evt);
      	  });
      }
      swatchc = hexInput.value;
      updateColor();
      return {
          els: els,
          clear: clearColor,
          update: updateColor
      };
    }
    

    function hsv2rgb(Hdeg,S,V) {
      H = Hdeg/360;     // convert from degrees to 0 to 1
      if (S==0) {       // HSV values = From 0 to 1
        R = V*255;     // RGB results = From 0 to 255
        G = V*255;
        B = V*255;}
      else {
        var_h = H*6;
        var_i = Math.floor( var_h );     //Or ... var_i = floor( var_h )
        var_1 = V*(1-S);
        var_2 = V*(1-S*(var_h-var_i));
        var_3 = V*(1-S*(1-(var_h-var_i)));
        if (var_i==0)      {var_r=V ;    var_g=var_3; var_b=var_1}
        else if (var_i==1) {var_r=var_2; var_g=V;     var_b=var_1}
        else if (var_i==2) {var_r=var_1; var_g=V;     var_b=var_3}
        else if (var_i==3) {var_r=var_1; var_g=var_2; var_b=V}
        else if (var_i==4) {var_r=var_3; var_g=var_1; var_b=V}
        else               {var_r=V;     var_g=var_1; var_b=var_2}
        R = Math.round(var_r*255);   //RGB results = From 0 to 255
        G = Math.round(var_g*255);
        B = Math.round(var_b*255);
      }
      return new Array(R,G,B);
    }
    
    function rgb2hex(rgbary) {
      cary = new Array; 
      cary[3] = "#";
      for (i=0; i < 3; i++) {
        cary[i] = parseInt(rgbary[i]).toString(16);
        if (cary[i].length < 2) cary[i] = "0"+ cary[i];
        cary[3] = cary[3] + cary[i];
        cary[i+4] = rgbary[i]; //save dec values for later
      }


      return cary;
    }
    
    function webRounder(c,d) {//d is the divisor

      thec = "#";
      for (i=0; i<3; i++) {
          num = Math.round(c[i+4]/d) * d; //use saved rgb value
          numc = num.toString(16);
          if (String(numc).length < 2) numc = "0" + numc;
          thec += numc;
      }
      return thec;
    }
    
    function hexColorArray(c) { //now takes string hex value with #
        swatchc = c[3];
        return false;
    }
    
    function mouseMoved(e) {
      x = e.pageX - this.getRealLeft();
      y = e.pageY - this.getRealTop();
    }
    
    function clickWheel() {
        cartx = x - 64;
        carty = 64 - y;
        cartx2 = cartx * cartx;
        carty2 = carty * carty;
        cartxs = (cartx < 0)?-1:1;
        cartys = (carty < 0)?-1:1;
        cartxn = cartx/64;                      //normalize x
        rraw = Math.sqrt(cartx2 + carty2);       //raw radius
        rnorm = rraw/64;                        //normalized radius
        if (rraw == 0) {
            sat = 0;
            val = 0;
            rgb = new Array(0,0,0);
        }
        else {
            arad = Math.acos(cartx/rraw);            //angle in radians 
            aradc = (carty>=0)?arad:2*Math.PI - arad;  //correct below axis
            adeg = 360 * aradc/(2*Math.PI);  //convert to degrees
            if (rnorm > 1) {    // outside circle
                rgb = new Array(255,255,255);
                sat = 1;
                val = 1;            
            }

            else if (rnorm >= .5) {
                sat = 1 - ((rnorm - .5) *2);
                val = 1;
                rgb = hsv2rgb(adeg,sat,val);
            } else {
                sat = 1;
                val = rnorm * 2;
                rgb = hsv2rgb(adeg,sat,val);
            }
        }
        c = rgb2hex(rgb);
        hexColorArray(c);
        setSwatchColor();
        return false;
    }
    
    function setSwatchColor() {
      swatch.setStyle({
              'backgroundColor': swatchc
      });
      swatch.show();
      form.color.value = swatchc;
      return false;
    }
    
    function updateColor() {
      color = form.color.value;
      if (color.length == 7) {
       swatchc = color;
       setSwatchColor();
      } else {
          clearColor();
      }
    }
    
    function clearColor() {
        swatchc = '';
        setSwatchColor();
        hexInput.clear();
        swatch.hide();
    }
    
    return colorWheelInit(els);
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/color_wheel.js'

// global.js: begin JavaScript file: '/js/ContributorDropdown.js'
// ================================================================================
Ss = window.Ss || {};

Ss.ContributorDropdown = Class.create({
	
	initialize: function(ctr) {
	    
	    this.ctr = ctr;
	    this.input = ctr.down('input');
	    this.list = ctr.down('div');
	    this.loader = ctr.down('span');
	    
        this.lastSequenceNumber = 0;
        this.maxDisplayCount = 10;
        this.pendingRequests = [];
        this.activePrefix = undefined;
        this.dropdownDialogShowing = false;
        
	    var instance = this;
	    this.input.observe('keyup', function(evt) {
	            instance.getMatchingNames(this.value);
	    });
	    
	    this.list.observe('click', function(evt) {
	        var item = Event.findElement(evt, 'a');
	        if(item) {
	            instance.setPhotographer(item.getAttribute('data-photographer'));
	        }
	    });
	},
	
	setPhotographer: function(item) {
		this.input.value = item;
		this.hideList();
	},
	
	hideList: function() {
	    this.list.hide();
	},
	
	populateList: function() {
		

		if (Ss.ContributorDropdown.sequenceNumber != this.lastSequenceNumber) {
			return;
		}
		
		var instance = this;
		var prefix = this.activePrefix;
		var indexPhotographers = Ss.ContributorDropdown.photographers[ prefix.substr(0, 2) ];

		var prefixRegex = new RegExp('\\b(' + prefix + ')', 'i');
		var matchingPhotographers = indexPhotographers.pluck('n').grep(prefixRegex);
		var matchesCount = matchingPhotographers.length;
		matchingPhotographers = matchingPhotographers.splice(0, 10);


		if ( matchesCount == 1 ) {
			var testRegex = new RegExp('^' + matchingPhotographers + '$', 'i');
			if (prefix.match(testRegex)) {
				this.hideList();
				return;
			}
		}
		var htmlBuffer = '';
		matchingPhotographers.each(function(item) {
			var highlightedItem = item.replace(prefixRegex, "<b>$1</b>"); 
			var escapedItem = item.replace(/\'/g, '\\\'');
			htmlBuffer += '<a data-photographer="' + escapedItem + '">' + highlightedItem + '</a>';
		});

		if (matchesCount > this.maxDisplayCount) 
			htmlBuffer += '<div>...</div>';

		var listDiv = this.list;
		listDiv.innerHTML = htmlBuffer;
		listDiv.style.display = 'block';

		this.dropdownDialogShowing = true;

		if (Ss.ContributorDropdown.sequenceNumber == this.lastSequenceNumber) {
			this.loader.hide();
		}
	},
	
	getMatchingNames: function(prefix) {
		
	    var instance = this;
	    
		if (!prefix) {
			this.hideList();
			return;
		}

		prefix = prefix.toLowerCase();
		this.activePrefix = prefix;

		if (this.pendingRequests[prefix.substr(0,2)] == undefined) {

			if (!prefix.substr(0,2).match(/^\w/))
				return;

			this.pendingRequests[prefix.substr(0,2)] = true;
			
			_debug(prefix + ' : request: ' + prefix.substr(0,2));
			
			this.loader.show();
			new Ajax.Request('/display_names.js', {
				method: 'get',
				parameters: { prefix: prefix.substr(0,2), sequence_number: ++this.lastSequenceNumber },
				onComplete: function(transport) {
					instance.populateList();
				}
			});
		} else if (this.pendingRequests[prefix.substr(0,2)] && !Ss.ContributorDropdown.photographers[prefix.substr(0,2)]) {
			/* do nothing */
		} else {
			instance.populateList();
		}
	}
});
Ss.ContributorDropdown.sequenceNumber = 0;
Ss.ContributorDropdown.photographers = [];
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ContributorDropdown.js'

// global.js: begin JavaScript file: '/js/HelpText.js'
// ================================================================================
Ss = window.Ss || {};
Ss.HelpText = {
    css: {
        ACTIVE: 'help_text_trigger_active',
        LOADING: 'help_text_trigger_loading'
    },
    elems: [],
    keyToText: new Hash(), // updated via ajax
    textLoaded: false,
    add: function(elem, key){
        if(this.elems.include(elem)) {
            return;
        }
        elem.observe('click', function(e) {
            Event.stop(e); // prevent the default for the event
            this.isActive(elem) ? this.hideText(elem) : this.showText(elem, key);
        }.bind(Ss.HelpText));   
        this.elems.push(elem);
    },
    loadText: function(elem, key) {
        this.textLoaded = true;
        this.showLoading(elem);
        new Ajax.Request('/show_component.mhtml', {
                method: 'get',
                evalJSON: true,
                parameters: {
                    component_path: '/search_ui/get_help_text.mh'
                },
                onSuccess: function(response) {
                    Ss.HelpText.hideLoading(elem);
                    Ss.HelpText.keyToText.update(response.responseJSON);
                    Ss.HelpText.showText(elem, key);
                }
        });
    },
    showText: function(elem, key) {
        if(!this.textLoaded) {
            this.loadText(elem, key);
            return;
        }
        this.activateElem(elem);
        Ss.ShadowContainer.write(this.getTextByKey(key), {
        	position: {
        		target: elem
        	},
			modal: false
        });
        var observer= function(e) {
            if(e.type == 'hide') {
                Ss.HelpText.deactivateElem(elem); // deactivate the icon when the text is hidden
                Ss.ShadowContainer.stopObserving(observer);
            }
        };
        Ss.ShadowContainer.observe(observer);
    },
    hideText: function(elem) {
        this.deactivateElem(elem);
        Ss.ShadowContainer.hide();
    },
    hideLoading: function(elem) {
        elem.removeClassName(this.css.LOADING);
    },
    showLoading: function(elem) {
        elem.addClassName(this.css.LOADING);
    },
    isActive: function(elem) {
        return elem.hasClassName(this.css.ACTIVE);
    },
    activateElem: function(elem) {
        this.elems.invoke('removeClassName', this.css.ACTIVE);
        elem.addClassName(this.css.ACTIVE);
    },
    deactivateElem: function(elem) {
        elem.removeClassName(this.css.ACTIVE);
    },
    getTextByKey: function(key) {
        return this.keyToText.get(key);
    }
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/HelpText.js'

// global.js: begin JavaScript file: '/js/Follow.js'
// ================================================================================
Ss = window.Ss || {};

Ss.Follow = {
	

	request: function(action, submitter, callback) {
		var paths = {
			'follow':	'/profile/follow_contributor.md',
			'unfollow':	'/profile/unfollow_contributor.md'
		};
		
		if(Object.isUndefined(submitter)) {
			throw 'A submitter id is required';
		}
		
		if(!Object.isString(action) || !Object.keys(paths).include(action)) {
			throw 'A valid action is required';
		}
		
		new Ajax.Request('/show_component.mhtml', {
			method: 'POST',
			parameters: {
				component_path: paths[action],
				submitter: submitter
			},
			onSuccess: Object.isFunction(callback) ? callback : Prototype.emptyFunction
		});
	}
	
};



Ss.Follow.Button = Class.create({
	
	initialize: function(args) {
		
		if(Object.isUndefined(args.submitter)) {
			throw 'submitter id is required';
		}
		
		if(!Object.isElement(args.element)) {
			throw 'button element required';
		}
		
		this.element = args.element;
		this.submitter = args.submitter;
		this.firstFollowMessage = args.firstFollowMessage;
		

		this._events();
	},
	

	classNames: {
		'follow':		['follow'],
		'following':	['following', 'button_white'],
		'unfollow':		['unfollow', 'button_gray']
	},
	


	show: function(state) {
		
		var element = this.element;
		

		if(!Object.keys(this.classNames).include(state)) {
			throw 'invalid state set on button';
		}
		

		Object.values(this.classNames).flatten().each(
			function(className) {
				element.removeClassName(className);
			}
		);
		

		this.classNames[state].each(
			function(className) {
				element.addClassName(className);
			}
		);
	},
	

	isShowing: function(state) {
		var element = this.element;
		return Object.keys(this.classNames).include(state) &&
			this.classNames[state].all(
				function(className) {
					return element.hasClassName(className);
				}
			);
	},
	
	

	_events: function() {
		

		var button = this,
			unfollowText = button.element.down('.unfollow_text'),
			followingText = button.element.down('.following_text');


		button.element.observe('click', function(evt) {
				



			
			if( button.isShowing('follow') ) {
				button.show('following');
				Ss.Follow.request('follow', button.submitter,
					function(response) {
						if(
							!response || 
							!response.responseJSON || 
							!response.responseJSON.content
						) {
							return;
						}
						var numSearches = parseInt(response.responseJSON.content.searches);
						if(numSearches == 1 && !Object.isUndefined(button.firstFollowMessage)) {
							Ss.ShadowContainer.write(button.firstFollowMessage, {
								className: 'pf_follow_tip',
								modal: false,
								position: {
									target: button.element,
									type: 'bottom',
									offsetY: 11
								},
								notch: {type: 'top', styles: {top: '-14px', left: '79px'}}
							});
						}
					}
				);
			} 
			else if( button.isShowing('unfollow') || button.isShowing('following') ) {
				button.show('follow');
				Ss.Follow.request('unfollow', button.submitter);
			}
		});
		

		button.element.observe('mouseover', function(evt) {
			var mousingFrom = evt.relatedTarget || evt.fromElement;
			if(
				Object.isElement(mousingFrom) &&
				!mousingFrom.isElementOrDescendantOf(button.element) &&
				button.isShowing('following')
			){
				button.show('unfollow');
			}
		});
		

		button.element.observe('mouseout', function(evt) {
			var mousingTo = evt.relatedTarget || evt.toElement;
			if(
				Object.isElement(mousingTo) && 
				!mousingTo.isElementOrDescendantOf(button.element) &&
				button.isShowing('unfollow')
			) {
				button.show('following');
			}
		});
		



		if(Object.isElement(unfollowText) && Object.isElement(followingText)) {
			unfollowText.setStyle({
					minWidth: followingText.getWidth() + 'px'
			});
		}
		
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Follow.js'

// global.js: begin JavaScript file: '/js/PopupAnchor.js'
// ================================================================================
var Ss = window.Ss || Ss;

Ss.PopupAnchor = Class.create({
	initialize: function(element, winName, winWidth, winHeight) {
		this.element = element;
		this.winName = winName;
		this.winWidth = winWidth || 800;
		this.winHeight = winHeight || 600;
		

		this.element.observe('click', this.click.bind(this));
	},
	click: function(evt) {
		

			Event.stop(evt);
			

			var winSpecs = this._winSpecs();
			

			var url = this.element.href;
			var name = this.name;
			var features = $H({
					
				height: 	winSpecs.height,
				width: 		winSpecs.width,
				top: 		winSpecs.getTop(),
				left: 		winSpecs.getLeft(),
				menubar: 	'no',
				resizable: 	'yes',
				scrollbars: 'yes'
				
			}).collect(function(feat){ return feat.key + '=' + feat.value; }).join(', ');
			

			var newWin = window.open(url, name, features);
			

			newWin.focus();
			
	},
	_winSpecs: function() {
		

			var cWin = {
				width: 		window.outerWidth,
				height: 	window.outerHeight,
				left: 		(window.screenLeft || window.screenX),
				top: 		(window.screenTop || window.screenY)
			};
			

			return {
				width: 		this.winWidth,
				height: 	this.winHeight,
				getLeft: 	function(){return (cWin.width > this.width ? (cWin.width - this.width)/2 + cWin.left : cWin.left);},
				getTop: 	function(){return (cWin.height > this.height ? (cWin.height - this.height)/2 + cWin.top : cWin.top);}
			};
			
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/PopupAnchor.js'

// global.js: begin JavaScript file: '/js/ui_widgets/FlyoutLayer.js'
// ================================================================================

Ss.FlyoutLayer = {
	

	TRANSITION_DURATION:	.75, // matches transition-duration value defined in stylesheet
	CSS: {
		open: 					'flyout_layer_open',
		transition_ready: 		'flyout_transition_ready'
	},
	

	_isOpen: 		false,
	_scrollHandler:	false,
	_observers: 	[],
	

    initialize: function() {


        this.elements = {
            layer:		$('flyout_layer'),
            content:	$('flyout_layer_content'),
            currentContent: null
        };
        
        this._events();
    },
	
	write: function(content) {
	    
		var layer = this.elements.layer,
			contentContainer = this.elements.content;
			

	    if(this.hidden()) {
	        this.show();
	    }
	    

	    contentContainer.childElements().invoke('remove');
	    contentContainer.update();
	    contentContainer.insert(content);
	    this.elements.currentContent = content;
	    
		if(this.isClosed()) {
			layer.removeClassName(this.CSS.transition_ready);
		    this.updateXPosition(); // recalculate the closed x position to fit the new content
		    layer.addClassName.bind(layer).defer(this.CSS.transition_ready);
		}
		
		Ss.FlyoutLayer.notifyObservers({type: 'write'});
	},
	
	getCurrentContent: function() {
		return this.elements.currentContent;
	},
	
	open: function() {
		if(this.isOpen()) {
			return;
		}
		this.elements.layer.addClassName(this.CSS.open);
		this._slideTo(0, function() {
            this.notifyObservers({type: 'open'});
            this._isOpen = true;
		}.bind(this));
	},
	
	close: function() {
		if(this.isClosed()) {
			return;
		}
        this._slideTo(this._calculateXPosition(), function() {
            this.notifyObservers({type: 'close'});
            this.elements.layer.removeClassName(this.CSS.open);
            this._isOpen = false;
        }.bind(this));
	},

	closeNoAnim: function(){
		this.notifyObservers({type: 'close'});
		this.elements.layer.removeClassName(this.CSS.open);
		this.elements.layer.setStyle({'right':this._calculateXPosition() + 'px'});
		this._isOpen = false;
	},
	
	isOpen: function() {
		return this._isOpen;
	},

	isClosed: function() {
	    return !this._isOpen;
	},
	
	show: function() {
	    this.elements.layer.show();
	},
	
	hide: function() {
	    this.elements.layer.hide();
	},
	
	visible: function() {
	    return this.elements.layer.visible();
	},

	hidden: function() {
	    return !this.elements.layer.visible();
	},
	
	enableAutoOpen: function(scrollTarget, extraOffsetY) { 


	    
        if(this._scrollHandler) {
            return;
        }
        
		function cleanup(evt) {
            if(evt.type == 'open') {
                Ss.FlyoutLayer.disableAutoOpen();
                Ss.FlyoutLayer.unsubscribeObserver(cleanup);
            }
        }
        
	    var vpH = document.viewport.getHeight();
	    var offsetY = this.getYPosition();
	    
	    if(extraOffsetY) {
	        offsetY += extraOffsetY;
	    }
	    
	    this._scrollHandler = function(e) {
            if(scrollTarget.viewportOffsetFix().top + scrollTarget.getHeight() + this.getHeight() + offsetY <= vpH) {
                if(this.isClosed()) {
                    this.open();
                    this.disableAutoOpen();
                }
            }
        }.bind(this);
        Event.observe(window, 'scroll', this._scrollHandler);
		this.subscribeObserver(cleanup);
	},
	
	disableAutoOpen: function() {
	    if(this._scrollHandler) {
	        Event.stopObserving(window, 'scroll', this._scrollHandler);
	        this._scrollHandler = false;
	    }
	},
	
	subscribeObserver: function(f) {
		this._observers.push(f);	
	},
	
	unsubscribeObserver: function(f) {
		this._observers = this._observers.without(f);
	},
	
	notifyObservers: function(event) {
		this._observers.each(function(fn) {
			fn(event);
		});
	},

	getHeight: function() {
	    return this.elements.layer.getHeight();
	},

	getYPosition: function() {
	    return  parseInt(this.elements.layer.getStyle('bottom'));
	},

	updateXPosition: function() {
	    this._isOpen = false;
	    this.elements.layer.setStyle({ right: this._calculateXPosition() + 'px' });
	},
	

	_calculateXPosition: function() {
	    return -this.elements.layer.getWidth();
	},
	
	_slideTo: function(xPosEnd, callback) {
	    
		if(this.elements.layer.CSSTransitionsSupported()) {
			this.elements.layer.setStyle({ 'right': xPosEnd + 'px' });
			Object.isFunction(callback) && callback.delay(this.TRANSITION_DURATION);
		} else {
			this.elements.layer.setStylePeriodically({
				property:	'right',
				endValue:	xPosEnd,
				increment:	30,
				units:		'px',
				onComplete:	callback
			});
		}

	},
	
    _events: function() {


        this.elements.layer.observe('mousedown', function(evt) {
                var target = Event.element(evt);
                
                if(this.isClosed()) {
                    this.open();
                }

                else if(target != this.elements.content && !target.descendantOf(this.elements.content)) {
                    this.close();
                }
        }.bind(this));
    }
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ui_widgets/FlyoutLayer.js'

// global.js: begin JavaScript file: '/js/ui_widgets/ShadowContainer.js'
// ================================================================================
var Ss = window.Ss || {};

Ss.ShadowContainer = {

/*
OPTIONS: 
{

	template: string (shadow/legacy),
	
	modal: {
		color: 		string (color code)
	},
	
	position: { 
		target: 	element,
		type: 		string (bottom/right/bottom-center), (TODO: more position types)
		offsetX: 	number,
		offsetY: 	number
	},
    


    edgeDetect:     Boolean, 
	
	notch: {,
		type:		string (top/right/bottom/left)
		styles: 	{}
	}
	
	closeButton: 	{
		type:		string (css className.. pass false/empty string for no close button)
	},
	
	className: 		string,
	events: {
		keypress: true,
		clickAway: true,
		resize: true
	}

}
*/

	DEFAULT_OPTIONS: {

		template: 'shadow',
		
		modal: {
			color: '#FFF'
		},
		
		position: null,

        edgeDetect: true,
		
		notch: null,
		
		closeButton: {
			type: 'close_btn'
		},
		
		className: '',

		events: {
			keypress: true,
			clickAway: true,
			resize: true
		},

		fadeIn: null
	
	},
	

	templates: {
	    legacy: 		'<table class="shadow-container" border="0" cellpadding="0" cellspacing="0" align="left"><tr><td class="shadow-corner-cell shadow-1 shadow-cell"><div style="_width: 30px;"></div></td><td class="shadow-top-cell shadow-2 shadow-cell"><div style="_width: 30px;"></div></td><td class="shadow-corner-cell shadow-3 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td></tr><tr><td class="shadow-side-cell shadow-4">&nbsp;</td><td id="ss_shadow_container_content" valign="middle" class="shadow-cc"></td><td class="shadow-side-cell shadow-6">&nbsp;</td></tr><tr><td class="shadow-corner-cell shadow-7 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td><td class="shadow-bottom-cell shadow-8 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td><td class="shadow-corner-cell shadow-9 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td></tr></table><div id="sc_notch"></div><span id="ss_shadow_container_close" class="legacy_close_btn">x</span>',
	    shadow:     	'<div class="shadow"><div id="ss_shadow_container_content"></div></div><div id="sc_notch"></div><div id="ss_shadow_container_close" class="close_btn"></div>',
        notch: {
        	top:		'<div class="shadow_arrow_top"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	right:		'<div class="shadow_arrow_right"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	bottom: 	'<div class="shadow_arrow_bottom"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	left:		'<div class="shadow_arrow_left"><span class="sa_border"></span><span class="sa_arrow"></span></div>'
        }
	},
	
    template:   '',

    css: {
        modal: "ss_shadow_container_modal"
    },
    
    initialized: false,
    
    activeOptions: null,
    
    observers: [],
    
    initialize: function(template) {
        

        this.setTemplate(template);
        

        this.initialized = true;

		this.current_content = null;
    },
    
    setTemplate: function(template) {

        this.template = template ? this.templates[template] : this.templates.legacy;
        

        this.element = $('ss_shadow_container');
        this.body = $$('body').first();
        this.clearContent();
        this.element.update(this.template);
        this.content = $('ss_shadow_container_content');
        this.closeButton = $('ss_shadow_container_close');
        this.pageCover = $('ss_shadow_container_page_cover');
        this.notchContainer = $('sc_notch');
        

        this.closeButton.observe('click', this.hide.bind(this));
    },
   
    show: function(_options) { // show the shadow container
		var self = this;
		var options = Object.clone(this.DEFAULT_OPTIONS),
			events = Object.clone(options.events);
		
		if(_options) {
			Object.extend(options, _options);
		}
		options.events = events;
		
		if(_options && _options.events) {
			Object.extend(options.events, _options.events);
		}
		
        if(this.element.visible()) {
            this._reset();
        }
        

        if(options.fadeIn){
            options.fadeIn(self);
        }else{
            this.element.show();
        }
        
        this.element.className = options.className;

		if(options.modal) {
			this.doModal(options);
		}
		
		if(options.notch) {
			this.doNotch(options);
		}
		
		if(options.position) {
			this.positionNextTo(options);
		} else {
			this.positionAtCenter();
		}
		
		if(options.closeButton && options.closeButton.type) {
			this.closeButton.className = options.closeButton.type;
			this.closeButton.show();
		} else {
			this.closeButton.hide();
		}

        this._setEvents(options);
        this._notifyObservers({type: 'show'});
        
        this.activeOptions = options;
    },

    hide: function() { // hide the shadow container
        this.element.hide();
        this._reset();
        this._notifyObservers({type: 'hide'});
    },
    
    visible: function() {
    	return this.element && this.element.visible();
    },
    
    write: function(content, options) { // write content, show, and position the shadow container (@content:String/Element, @options: {className:String, target:Element, modal:Boolean, template:String})
        var template = this.DEFAULT_OPTIONS.template;
        if(options && options.template) {
            template = options.template;
        }
        if(!this.initialized) {
            this.initialize(template);
        } else {
            this._reset();
        }
        if(template != this.template) {
            this.setTemplate(template);
        }
	    this.clearContent();
		this.current_content = content;
        this.content.update(content);
        this.show(options);
        return this.element;
    },
    
    clearContent: function() {

        this.content && this.content.childElements().invoke('remove');
    },
    
    getContent: function() {
    	return this.content;
    },
    
    doModal: function(options) {
        this.body.addClassName(this.css.modal);
        this.pageCover.setStyle({
        		backgroundColor: options.modal.color
        });
    },
    
    undoModal: function() {
        this.body.removeClassName(this.css.modal);
    },
    
    doNotch: function(options) {
    	var type = options.notch.type || 'top',
    		styles = options.notch.styles;

    	this.notchContainer.update(this.templates.notch[type]);

    	if(styles) {
    		this.notchContainer.down().setStyle(styles);
    	}
    },
    
    undoNotch: function() {
    	this.notchContainer.update('');
    },
    
    getNotch: function() {
    	return this.notchContainer.down();
    },
    
    positionNotch: function(target) { // position the shadow container notch so that it points to a target above (like a link)
		var notch = this.getNotch();
		
		if(!Object.isElement(notch)) {
			return;
		}
		
		var notchWidth 		= notch.down().getWidth(),
			maxLeft 		= this.element.getDimensions().width - notchWidth,
			notchPos 		= notch.getStyle('left'),
			targetCenterPos = target.viewportOffset().left + (target.getWidth()/2).round(),
			notchCenterPos 	= notch.viewportOffset().left + (notchWidth/2).round(),
			pixelsOffCenter = targetCenterPos - notchCenterPos;
		
		notch.setStyle({'marginLeft': pixelsOffCenter + 'px'});
    },
    
    positionNextTo: function(options) { // position the container (centers it or places it next to an optional @target:Element)
        var left, 
            top, 
            vpDim = 	document.viewport.getDimensions(), 
            eDim = 		this.element.getDimensions(), 
            tDim = 		options.position.target.getDimensions(), 
            tPos = 		options.position.target.cumulativeOffset(),
            dPos = 		options.position.type || 'right',
            offsetX = 	options.position.offsetX || 0,
            offsetY = 	options.position.offsetY || 0,
            SOME_PADDING = 20;

        switch(dPos) {
            
            case 'bottom':
                left =  ((vpDim.width > tPos.left + eDim.width) ?
                            tPos.left :
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top + tDim.height;
                break;
                
            case 'right':
                left =  ((vpDim.width > tPos.left + eDim.width + tDim.width) ?
                            tPos.left + tDim.width :
                            tPos.left - eDim.width);
                top =   ((vpDim.height > tPos.top + eDim.height) ?
                            tPos.top :
                            tPos.top - eDim.height);
                break;
                
            case 'left':
                left =  tPos.left - eDim.width;
                top =   (((vpDim.height > tPos.top + eDim.height) || !options.edgeDetect)?
                            tPos.top :
                            tPos.top - eDim.height);
            break;
                
            case 'bottom-center':
                left =  ((vpDim.width > tPos.left + (eDim.width/2).round() + (tDim.width/2).round()) ?
                            tPos.left - (eDim.width/2).round() + (tDim.width/2).round():
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top + tDim.height;
                break;
                
            case 'top':
                left =  ((vpDim.width > tPos.left + eDim.width) ?
                            tPos.left :
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top - eDim.height - SOME_PADDING;
               	break;
               	
            case 'top-center':
                left =  ((vpDim.width > tPos.left + (eDim.width/2).round() + (tDim.width/2).round()) ?
                            tPos.left - (eDim.width/2).round() + (tDim.width/2).round():
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top - eDim.height - SOME_PADDING;  
            
        }
        left += offsetX;
        top += offsetY;
        
        this.element.setStyle({
                top: top + 'px',
                left: left + 'px'
        });
    },
    
    positionAtCenter: function() {
        var vpDim = document.viewport.getDimensions(), eDim = this.element.getDimensions();
        this.element.setStyle({
                top: (vpDim.height/2 - eDim.height/2) + 'px',
                left: (vpDim.width/2 - eDim.width/2) + 'px'
        });
    },
    
	observe: function(f) { // register a function @f as an observer of events
		this.observers.push(f);	
	},
	
	stopObserving: function(f) { // register a function @f as an observer of events
		this.observers = this.observers.without(f);
	},
	

	_notifyObservers: function(e) {
		this.observers.each(function(f){f(e);});
	},
	
    _clickAwayHandler: function(e) {
        var elem = e.findElement() ;
        if( !elem.descendantOf(Ss.ShadowContainer.element) ||
            elem == Ss.ShadowContainer.closeButton) 
        {
            Ss.ShadowContainer.hide();
        }
    },
    
    _keypressHandler: function(e) {
        if(e.keyCode == Event.KEY_ESC) {
            Ss.ShadowContainer.hide();
        }
    },
    
    _resizeHandler: function(e) {
    	Ss.ShadowContainer.positionNextTo(Ss.ShadowContainer.activeOptions || Ss.ShadowContainer.DEFAULT_OPTIONS);
    },
    
    _setEvents: function(options) {
		if(options.events.clickAway){
			(function(){
				$(document).observe('click', this._clickAwayHandler);
			}.bind(this)).defer(); // using defer here to avoid running this document handler prematurely when called by the handler of a click event that bubbles up.
		}
		if(options.events.keypress){
			$(document).observe('keypress', this._keypressHandler);
		}
		if(options.events.resize){
			Event.observe(window, 'resize', this._resizeHandler);
		}
    },
    
    _unsetEvents: function() {
        $(document).stopObserving('click', this._clickAwayHandler);
        $(document).stopObserving('keypress', this._keypressHandler);
        Event.stopObserving(window, 'resize', this._resizeHandler);
    },
    
    _reset: function() {
        this.element.className = "";
		this.current_content = null;
		this.activeOptions = null;
        this._unsetEvents();
        this.undoModal();
        this.undoNotch();
    }
};

/*
 * register(obj) format = {
 *		key:key to use
 *		content: string or node
 *		sc_opts: options object for ShadowContainer
 *		callbacks: {show:func, hide:func}
 *		toggle: true | false 
 *	}
 */
Ss.ShadowContainer.Stateful = {
	instances: {},
	_current_key: null,
	_initialized: false,
	initialize: function(){
		var self = this;
		Ss.ShadowContainer.observe(function(obj){
			if(obj.type == 'show'){
				if(self._current_key &&
						Ss.ShadowContainer.current_content != self.instances[self._current_key].content){
					self._current_key = null;
				}
			}else{
				self._current_key = null;
			}
		});
	},
	register: function(obj){
		if(!this._initialized){
			this.initialize();
			this._initialized = true;
		}
		if(!obj.callbacks) obj.callbacks = {};
		this.instances[obj.key] = obj;
	},
	isOpen:function(key){
		return (this._current_key == key);
	},
	toggle: function(key){
		var inst = this.instances[key];
		var isShow = (this._current_key != key);
		var sc_funcname = (isShow ? 'write' : 'hide');
		var callback = (isShow ? inst.callbacks.show : inst.callbacks.hide);
		if(callback) callback(inst);
		Ss.ShadowContainer[sc_funcname](inst.content, inst.sc_opts);
		this._current_key = (isShow) ? key : null;
	}
}

        
/*  Internet Explorer 6: Shadow Container Support
 *  This is especially unfortunate, but some necessary features are not supported out of the box for Internet Explorer 6.
 *  We will only implement these features manually by modifying the Ss.ShadowContainer object for IE6 users.
 *  If IE6 support isn't needed, lines below can be safely removed.
 */
if(Prototype.Browser.IE &&
        parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5))==6) 
{
    Ss.ShadowContainer.overridedMethods = { // the following methods will be overrided for IE6
        doModal: Ss.ShadowContainer.doModal,
        show: Ss.ShadowContainer.show,
        _reset: Ss.ShadowContainer._reset,
        positionAtCenter: Ss.ShadowContainer.positionAtCenter
    };
    Ss.ShadowContainer.doModal = function(options) {
        Ss.ShadowContainer.overridedMethods.doModal.call(this, options); // call the normal method and provide IE6 support (iframe shim, and sizing of page cover)
        if(!this.pageCover) {
            this.pageCover = $('ss_shadow_container_page_cover');
        }
        this.pageCover.setStyle({
            width: document.body.clientWidth + 'px',
            height: document.body.clientHeight + 'px'
        });
        if(!this.modal_shim) {
            this.modal_shim = Ss.ShadowContainer.insertShim();
        }
        this.positionShim(this.modal_shim, this.pageCover);
    };
    Ss.ShadowContainer.show = function(_options) {
    	var options = Object.clone(this.DEFAULT_OPTIONS);
    	_options && Object.extend(options, _options);
        Ss.ShadowContainer.overridedMethods.show.call(this, options); // call the normal method, then create and position a shim
        if(!this.element_shim) {
            this.element_shim = Ss.ShadowContainer.insertShim();
        }
        this.positionShim(this.element_shim, this.element);
    };
    Ss.ShadowContainer._reset = function() {
        Ss.ShadowContainer.overridedMethods._reset.call(this); // call the normal method, then clean up after ie6 specific stuff
        this.shims.invoke('hide');
        this.body.removeClassName('ss_ie_centered');
    };
    Ss.ShadowContainer.positionAtCenter = function() { // alternate centering instructions for ie6
        var elem = this.element;
        this.body.addClassName('ss_ie_centered');
        elem.setStyle({
                top: ((document.body.scrollTop) ?
                                document.body.scrollTop + (document.body.clientHeight/2 - elem.clientHeight/2) :
                                document.documentElement.scrollTop + (document.documentElement.clientHeight/2 - elem.clientHeight/2)) + 'px', 
                left: ((document.body.clientWidth) ?
                        document.body.clientWidth/2 - elem.clientWidth/2 :
                        document.documentElement.clientWidth/2 - elem.clientWidth/2) + 'px'
        });
    };

    Ss.ShadowContainer.shims = [];
    Ss.ShadowContainer.insertShim = function() {
        var shim = new Element('iframe', {
          style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
          frameborder: 0
        });
        this.body.insert(shim);
        this.shims.push(shim);
        return shim;
    };
    Ss.ShadowContainer.positionShim = function(shim, element) {
        var element = $(element),
            offset = element.cumulativeOffset(),
            dimensions = element.getDimensions(),
            style = {
              left: offset[0] + 'px',
              top: offset[1] + 'px',
              width: dimensions.width + 'px',
              height: dimensions.height + 'px',
              zIndex: element.getStyle('zIndex') - 1
            };
        shim.setStyle(style).show();
    };
}
/* end IE6 support */
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ui_widgets/ShadowContainer.js'

// global.js: begin JavaScript file: '/js/SlideViewer.js'
// ================================================================================
Ss.SlideViewer = Class.create({
    
    initialize: function(args) {
        

        this.mover = args.mover.addClassName(this.CSS.mover);
        this.clipper = args.clipper.addClassName(this.CSS.clipper);
        this.sizeOfClipper = this._getClipperSize();
        this.sizeOfSlide = args.sizeOfSlide || this.sizeOfClipper;
        
        

        this.speed = args.speed || 30;
        

        this.slides = [];
        this._locked = false;
        this._sizeType = 'width';
        this._posType = 'left';



		this.callbacks = ((args.callbacks) ? args.callbacks : []);
    },
    

    push: function(content) {
        this._add();
        var slide = this._newSlide(content);
        this.mover.insert(slide);
        this.slides.push(slide);
        return slide;
    },
    
    unshift: function(content) {

        var slide = this._newSlide(content);
        this.mover.insert({top: slide});
        this._add(true);
        this.slides.unshift(slide);
        return slide;
    },
    

    pop: function() {
        if(!this.slides.size()) {
            return;
        }
        var slide = this.slides.pop().remove();
        this._remove();
        return slide;
    },
    
    shift: function() {
        if(!this.slides.size()) {
            return;
        }
        var slide = this.slides.shift().remove();
        this._remove(true);
        return slide;
    },

    indexOf: function(slide) {
        if(!Object.isElement(slide)) {
            return -1;
        }
        slide = (slide.hasClassName('slide') ? slide : slide.up('.slide'));
        return (slide ? this.slides.indexOf(slide) : -1);
    },

    removeSlide: function(slide) {
        slide.remove();
        this.slides = this.slides.without(slide);
    },
    
    clear: function() {
        this._clear();
        this.mover.update(''); // TODO: remove differently
        this.slides.clear();
    },
    

    next: function(options) {
        this._navigate(1, options);
    },
    
    prev: function(options) {
        this._navigate(-1, options);
    },
    
    navigate: function(by, options) {
       this._navigate(by, options);
    },
    
    navigateToIndex: function(index, options) {
        var range = this.getVisibleSlideRange(),
            by = index - range.first();
        this._navigate(by, options);
    },
    

    setSizeOfSlide: function(sizeOfSlide) {
        this.sizeOfSlide = sizeOfSlide;
    },

    setSpeed: function(speed) {
        this.speed = speed;
    },
    

    getSlideFromElement: function(elem) {
        var index = this.indexOf(elem);
        return (index != -1 ? this.slides[index] : false);
    },
    
    getSlideByIndex: function(index) {
        return this.slides[index];
    },
    
    getSlides: function() {
        return this.slides;
    },
    
    getMover: function() {
        return this.mover;
    },
    
    getClipper: function() {
        return this.clipper;
    },
    
    getVisibleSlideRange: function() {
        var firstIndex = this._getFirstVisibleSlideIndex(),
            visibleSlideCapacity = this.getVisibleSlideCapacity(),
            lastIndex = (this.slides.size() > firstIndex + visibleSlideCapacity ? firstIndex + visibleSlideCapacity : this.slides.size())
        return $A($R(firstIndex, lastIndex, true));
    },
    
    getVisibleSlideCapacity: function() {
        return Math.floor(this.sizeOfClipper/this.sizeOfSlide);
    },
    

    _clear: function() {
        this.mover.style[this._sizeType] = '';
        this.mover.style[this._posType] = '';
    },
    
    _remove: function(shift) {
        this.mover.style[this._sizeType] = (this._getMoverSize() - this.sizeOfSlide) + 'px';
        this.mover.style[this._posType] = (this.mover.positionedOffset()[this._posType] + (shift ? this.sizeOfSlide : 0)) + 'px';
    },
    
    _add: function(unshift) {
        this.mover.style[this._sizeType] = (this._getMoverSize() + this.sizeOfSlide) + 'px';
        this.mover.style[this._posType] = (this.mover.positionedOffset()[this._posType] - (unshift ? this.sizeOfSlide : 0)) + 'px';
    },
    
    _newSlide: function(content) {
        var elem = new Element('DIV');
        elem.addClassName(this.CSS.slide);
        elem.style[this._sizeType] = this.sizeOfSlide + 'px';
        elem.insert(content);
        return elem;
    },
    
    _getClipperSize: function() {
        return this.clipper.getWidth();
    },
    
    _getMoverSize: function() {
        return this.mover.getWidth();
    },
    
    _navigate: function(by, options) {
		var self = this;
        if(this._locked) {
            return;
        }
        if(!by && !(by === 0)) {
            return;
        }

        this._locked = true;
        var endValue, 
			maxValue = 0, 
			minValue = -((this.slides.size()-1) * this.sizeOfSlide),
			slideViewer = this,
			mover = this.mover,
			units = 'px',
			duration,
			_options = {
				transition: true,
				onComplete: Prototype.emptyFunction
			},
			_onComplete;
			
		Object.extend(_options, options);
		
		_onComplete = function() {
			  slideViewer._locked = false;
			  if(Object.isFunction(_options.onComplete)) {
				  _options.onComplete();
			  }
			  self.callbacks.each(function(cb){
				  cb({type: 'end',index: self._getFirstVisibleSlideIndex()});
			  });
		};
			
        endValue = this.mover.positionedOffset()[this._posType] - (by * this.sizeOfSlide);
        endValue = (endValue < minValue ? minValue : endValue);
        endValue = (endValue > maxValue ? maxValue : endValue);

        
        
        if(!_options.transition) {
        	mover.style[this._posType] = endValue + units;
        	_onComplete();
			this.callbacks.each(function(cb){
				cb({type: 'direct',index: self._getFirstVisibleSlideIndex(endValue)});
			});
        	return;
        }

		this.callbacks.each(function(cb){
			cb({type: 'start',index: self._getFirstVisibleSlideIndex(endValue)});
		});
        
		if(mover.CSSTransitionsSupported()) {
			

			mover.addClassName('transitioning');
			

			duration = parseFloat(mover.getStyle('-moz-transition-duration') || mover.getStyle('-webkit-transition-duration'));
			

			mover.style[this._posType] = endValue + units;
			
			(function(){

					mover.removeClassName('transitioning');
					

					_onComplete();
			}.delay(duration));
			
		} else {
			
			this.mover.setStylePeriodically({
					property:     this._posType,
					endValue:     endValue,
					increment:    this.speed,
					units:        units,
					onComplete:   _onComplete
			});
			
		}
    },
    
    _getFirstVisibleSlideIndex: function(pos) {
        var currentPos = (pos != null ? pos : this.mover.positionedOffset()[this._posType]);
        return Math.round(Math.abs(currentPos/this.sizeOfSlide));
    },
    

    CSS: {
        slide: 'slide',
        mover: 'mover',
        clipper: 'clipper'
    }
        
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/SlideViewer.js'

// global.js: begin JavaScript file: '/js/Carousel.js'
// ================================================================================




Ss = window.Ss || {};

Ss.Carousel = Class.create({

    initialize: function(args) {

        this.slideViewer = args.slideViewer;
        

        this._locked = false;
        this._currentIndex = null;
        
        if(args.items && args.itemToElement) {
        	this.load(args);
        }
        
    },
  
    load: function(args) {
    	

    	this.items = args.items;
    	this.itemToElement = args.itemToElement;
    	

        this._callbacks = {
        	'navigationComplete': args.onNavigationComplete ? args.onNavigationComplete.bind(this) : Prototype.emptyFunction,
        	'beforeNavigation': args.onBeforeNavigation ? args.onBeforeNavigation.bind(this) : Prototype.emptyFunction
        };
        
    	this.writeItem(0);
    },
    
    next: function() {
        this._navigate(1);
    },
    
    prev: function() {
        this._navigate(-1);
    },
    
    navigateTo: function(index) {
    	if(this.items.size() <= index ||
    		index == this._currentIndex) {
    		return;
    	}
    	this._navigate(index - this._currentIndex);
    },

    writeItem: function(index) {
        if(!this.items[index]) {
        	return;
        }
        this.slideViewer.clear();
        this.slideViewer.push( this.itemToElement( this.items[index] ) );
        this._currentIndex = index;
        this._fireEvent('navigationComplete');
    },
    

    bind: function(element, methodName, eventType) {
    	var handler;
    	
    	eventType = eventType || 'click';
    	
    	if( !Object.isFunction(this[methodName]) ) {
    		return;
    	}
    	
    	handler = function(evt) { this[methodName](); }.bind(this);
    	Event.observe(element, eventType, handler);
    	return handler;
    },
    
    bindKey: function(keyCode, methodName) {
    	var handler;
    	
    	if( !Object.isFunction(this[methodName]) ) {
    		return;
    	}
    	
    	handler = function(evt) { (evt.keyCode == keyCode) && this[methodName](); }.bind(this);
		Event.observe(document, 'keydown', handler);
		return handler;
    },

    getItems: function() {
    	return this.items;
    },
    
    _fireEvent: function(evtType, memo) {
    	
    	var _memo = {
    			currentIndex: this._currentIndex,
    			items: this.items
    	};
    	
    	if( !Object.isFunction(this._callbacks[evtType]) ) {
    		return;
    	}
    	
    	if(memo) {
    		_memo = Object.extend(_memo, memo);
    	}
    	
    	this._callbacks[evtType](_memo);
    },
    
    _navigate: function(by) {
    	var nextIndex = this._currentIndex + by,
    		item = this.items[nextIndex]; // get next or prev item that needs to be rendered and transitioned in
    		
    	if(!item || this._locked) {
    		return;
    	}
        
    	this._fireEvent('beforeNavigation', { nextIndex: nextIndex });
        this._locked = true;
        this.slideViewer[(by > 0 ? 'push' : 'unshift')](this.itemToElement(item));
        this.slideViewer.navigate(by, {
        	onComplete: function() {
                this.slideViewer[(by > 0 ? 'shift' : 'pop')]();
                this._currentIndex = nextIndex;
                this._locked = false;
                
                this._fireEvent('navigationComplete');
            }.bind(this)
        });
    }
    
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Carousel.js'

// global.js: begin JavaScript file: '/js/ResponsiveCarousel.js'
// ================================================================================
Ss.ResponsiveCarousel = Class.create({
	initialize: function(options) {
	    var ctr = options.ctr;
		this.els = {
		    ctr: ctr,
            rel: ctr.down('.rc_rel'),
            abs: ctr.down('.rc_abs ')
		};
		this._fire();
	},
	next: function() {
        var firstHidden = this.getFirstHidden();
        if(firstHidden) {
            var left = firstHidden.positionedOffset().left;
            this.els.abs.setStyle({'left': (-left) + 'px'});
        }
        this._fire();
	},
	prev: function() {
		var newLeft = Math.min(0, this.els.abs.positionedOffset().left + this.els.rel.getWidth());
		this.els.abs.setStyle({'left': newLeft + 'px'});
		this._fire();
	},
    getFirstHidden: function() {
        var firstHidden;
        var instance = this;
        var items = this.els.abs.childElements();
        var lastVisible = items.filter(function(elem) {
            return instance._startVisible(elem) && instance._endVisible(elem);
        }).last();
        var lastVisibleIndex = items.indexOf(lastVisible);
        if(lastVisibleIndex != -1 && lastVisibleIndex < items.length - 1) {
            firstHidden = items[lastVisibleIndex + 1];
        }
        return firstHidden;
    },
    atEnd: function() {
        return this._endVisible(this.els.abs.childElements().last()); 
    },
    atStart: function() {
        return this._startVisible(this.els.abs.childElements().first());
    },
    _startVisible: function(elem) {
        var eLeft = this._getElemLeft(elem);
        return eLeft >= 0 && eLeft < this._getWidth() + this.BUFFER;
    },
    _endVisible: function(elem) {
        var eLeft = this._getElemLeft(elem);
        return eLeft >= 0 && eLeft + elem.getWidth() < this._getWidth();
    },
    _getElemLeft: function(elem) {
        return elem.positionedOffset().left + this._getLeft();
    },
    _getLeft: function() {
        return parseInt(this.els.abs.getStyle('left'));;        
    },
    _getWidth: function() {
        return this.els.rel.getWidth();
    },
    _fire: function() {
        var ctr = this.els.ctr;
        var rc = this;
        (function(){
            ctr.fire('rc:navigate', {
                atStart: rc.atStart(),
                atEnd: rc.atEnd()
            });
        }).defer();
    },
    BUFFER: 10
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ResponsiveCarousel.js'

// global.js: begin JavaScript file: '/js/recent_carousel.js'
// ================================================================================
Ss = window.Ss || {};
Ss.recent = Ss.recent || {};

Ss.recent.carousel = {
    
    tabs: [],
    
    _currentTab: null,
    
    data: {},
    
    _dataLoaded: false,
    
    itemsPerSlide: 5,
    
    initialize: function(args) {
        this.elements = args.elements;
        this.counts = args.counts;
        

        this.carousel = new Ss.Carousel(
        {
            slideViewer: new Ss.SlideViewer(
            {
                mover: 		this.elements.mover,
                clipper: 	this.elements.clipper
            })
        });
        

        this._events();
    },
    
    setData: function(key, data) {
        this.data[key] = data;
    },
    
    getData: function(key) {
        return this.data[key];
    },
    
    setTab: function(key, element) {
        if(!Object.isElement(element)) {
            return;
        }
        var recent = this;
        var notch = this.elements.notch;
        var fader = this.elements.fader;
        var tabSelector = this.elements.tabSelector;
        var tab = {
            key: key,
            element: element
        };
        
        this.tabs.push(tab);
        
        tab.pos = tab.element.positionedOffset().left + (tab.element.getWidth()/2) - 6;
        
        var switchTab = function() {
            if(tab.key == recent._currentTab) {
                return;
            }
            if( fader.CSSTransitionsSupported() ) {
                tabSelector.className = tab.key + '_selected'; // setting this first to start the motion of the notch/triangle
                if(notch) {
                    notch.setStyle({ left: tab.pos + 'px'});
                }
                fader.setOpacity(0); // fading out the old
                (function() {
                    recent.showTab(tab.key); // loading in the new
                    fader.setOpacity(1); // fading in the new
                }).delay(.25); // ...after the old has finished fading out
            } else {
                recent.showTab(tab.key); // .. just load the new tab!
            }
        };
        

        tab.element.observe('click', function(evt) {
            if(!recent._dataLoaded) {
                recent._load(switchTab);
            } else {
                switchTab();
            }
        });
    },
    
    getTab: function(key) {
        return this.tabs.find(
            function(tab){
                return tab.key == key;
            }
        );
    },
    
    showTab: function(key) {
        var data = this.getData(key);
        var tab = this.getTab(key);
        var recent = this;
        var itemToElement = (
            key == 'images' ?
                recent._recentImageToHTML.bind(this) :
                recent._recentSearchToHTML.bind(this)
        );
        

        if(!tab || !data) {
            return;
        }
        

        recent._currentTab = key;
        

        recent.carousel.load({
            items: data.eachSlice(recent.itemsPerSlide), // one 'item' is a set of searches/images
            itemToElement: 	itemToElement, // how to turn an item into a slide
            onNavigationComplete: function(memo) { // after every write, check the boundaries
                var items = memo.items;
                var isLastPage = (memo.currentIndex + 1 >= items.length);
                var isFirstPage = (memo.currentIndex == 0);
                var container = recent.elements.container;
                
                if(recent._dataLoaded) {
                    container[ (isLastPage ? 'addClassName' : 'removeClassName') ]('last_page');
                    container[ (isFirstPage  ? 'addClassName' : 'removeClassName') ]('first_page');
                } else {
                    container.addClassName('first_page');
                    if(recent.counts[recent._currentTab] <= recent.itemsPerSlide) {
                        container.addClassName('last_page');
                    }
                }
            }
        });
        

        recent.elements.tabSelector.className = key + '_selected';
        if(recent.elements.notch) {
            recent.elements.notch.setStyle({ left: tab.pos + 'px'});
        }
    },
    
    _load: function(callback) {
        var recent = this;
        if(recent._dataLoaded) {
            return;
        }
        recent._dataLoaded = true;
        new Ajax.Request('/show_component.mhtml',
            {
                method: 'GET',
                parameters: {
                    'component_path': '/recent_activity/get_all.mj',
                    'client_timestamp': new Date().getTime()
                },
                onSuccess: function(transport) {
                    recent.setData('images', transport.responseJSON.images);
                    recent.setData('searches', transport.responseJSON.searches);
                    if(Object.isFunction(callback)) {
                        callback();
                    }
                }, 
                onError: function() {
                    recent._dataLoaded = false;
                }
            }
        );
    },
    
    _events: function() {
        this._setupPrevNext();
        this._setupRecentSearchHover();
    },
    
    _setupPrevNext: function() {
        var recent = this;
        var next = this.elements.next;
        var prev = this.elements.prev;
        

        prev.observe('click',
            function() {
                recent.carousel.prev();
            }
        );
        


        next.observe('click', 
            function(evt) {
                if(!recent._dataLoaded) {
                    recent._load(
                        function() {
                            recent.showTab(recent._currentTab);
                            recent.carousel.next();
                        }
                    );
                } else {
                    recent.carousel.next();
                }
            }
        );
    },
    
    _setupRecentSearchHover: function() {

        var tid;
        this.elements.container.observe('mouseover', function(evt) {
            var target = Event.element(evt);
            var activeRecentSearchElem = target.hasClassName('.recent_search') ? target : target.up('.recent_search');
            var recentSearchElems = [];
            if(!activeRecentSearchElem) {
                return;
            }
            recentSearchElems = this.select('.recent_search');
            tid && window.clearTimeout(tid);
            tid = (function(){
                recentSearchElems.invoke('addClassName', 'rs_out_of_focus');
                activeRecentSearchElem.removeClassName('rs_out_of_focus');
            }).delay(.1);
        });
        this.elements.container.observe('mouseout', function(evt) {
            var destElem = evt.relatedTarget || evt.toElement;
            if(destElem && !destElem.descendantOf(Ss.recent.carousel.elements.clipper) ) {
                this.select('.recent_search').invoke('removeClassName', 'rs_out_of_focus');
            }
            tid && window.clearTimeout(tid);
        });
    },
    
    _recentImageToHTML: function(images) {
        var html = [];
        var data = this.data.images;
        images.each(
            function(image, i) {
                var slideIndex = (i+1);
                var carouselIndex = (data.indexOf(image)+1);
                var marginTop = Math.round((100 - image.height)/2);
                html.push('<div id="carousel_recent_image_' + carouselIndex + '" class="recent_image item_' + slideIndex + '">');
                html.push('     <div class="thumb_image_container" style="width:' + image.width + 'px;height:' + image.height + 'px; margin-top:' + marginTop + 'px;">');
                html.push('         <a href="' + image.link + '">');
                html.push('             <img class="thumb_image" src="' + image.thumb_url + '" alt="' + image.description + '" />');
                html.push('         </a>');
                html.push('     </div>');
                html.push('</div>');
            }
        );
        return html.join('');
    },
    
    _recentSearchToHTML: function(searches) {
        var html = [];
        var data = this.data.searches;
        searches.each(
            function(search, i) {
                var slideIndex = (i+1);
                var carouselIndex = (data.indexOf(search)+1);
                var thumbStyles = '';
                var thumbURL;                
                if(search.cropped_cover_image && search.cropped_cover_image.elements) {
                    thumbURL = search.cropped_cover_image.thumb_url;
                    Object.keys(search.cropped_cover_image.elements.img).each(
                        function(key) {
                            if(search.cropped_cover_image.elements.img[key]) {
                                thumbStyles += key + ':' + search.cropped_cover_image.elements.img[key] + 'px;'
                            }
                        }
                    );                    
                }
                html.push('<div id="carousel_recent_search_' + carouselIndex + '" class="recent_search item_' + slideIndex + '">');
                html.push('     <div class="image_stack">');
                html.push('         <div class="cropped_image_clipper">');
                if(thumbURL && thumbStyles) {
                    html.push('             <a href="' + search.link + '">');
                    html.push('                 <img style="' + thumbStyles + '" src="' + thumbURL + '" />');
                    html.push('             </a>');
                }
                html.push('         </div>');
                html.push('         <span class="magnifier"></span>');
                html.push('         <div class="rs_desc shadow_dark_gray">');
                html.push(              search.description);
                html.push('             <div class="shadow_arrow_left"><span class="sa_border"></span><span class="sa_arrow"></span></div>');
                html.push('             <div class="shadow_arrow_right"><span class="sa_border"></span><span class="sa_arrow"></span></div>');
                html.push('         </div>');
                html.push('     </div>');
                html.push('     <a class="rs_keywords" href="' + search.link + '">');
                html.push(          search.searchterm);
                html.push('     </a>');
                html.push('</div>');
            }
        );
        return html.join('');
    }

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/recent_carousel.js'

// global.js: begin JavaScript file: '/js/input/TextWithDefault.js'
// ================================================================================
Ss.input = window.Ss.input || {};

Ss.input.TextWithDefault = Class.create({
        initialize: function(args) {
            this.textField = args.textField;
            this.defaultValue = args.defaultValue;
            this.defaultCSS = args.defaultCSS || 'default';
            
            this.textField.observe('focus', this.focus.bind(this));
            this.textField.observe('blur', this.blur.bind(this));
        },
        focus: function(evt) {
            if(!this.textField.hasClassName(this.defaultCSS)) {
                return;
            }
            this.textField.removeClassName(this.defaultCSS);
            this.textField.clear();
        },
        blur: function(evt) {
           if(this.textField.getValue().strip().empty()) {
                this.textField.addClassName('default');
                this.textField.value = this.defaultValue;
            }
        }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/TextWithDefault.js'

// global.js: begin JavaScript file: '/js/input/PassWithDefault.js'
// ================================================================================



Ss.input = window.Ss.input || {};

Ss.input.PassWithDefault = Class.create({
        initialize: function(args) {
            this.textField = args.textField;
            this.fieldName = args.fieldName || this.textField.name;
            
            this.textField.observe('focus', this.focus.bind(this));
            this.passwordField = null; // will be created/inserted when needed
        },
        focus: function(evt) {
            this.showPasswordField();
            this.passwordField.focus();
        },
        blur: function(evt) {
            if(this.passwordField.getValue().strip().empty()) {
                this.showTextField();
            }   
        },
        showPasswordField: function() {
            if(!this.passwordField) {
                this.makePasswordField();
            }
            this.passwordField.show();
            this.textField.hide();
        },
        showTextField: function() {
            this.textField.show();
            this.passwordField.hide();
        },
        makePasswordField: function() {
            this.passwordField = new Element('input', {
                    type:   'password',
                    name:   this.fieldName
            })
            .observe('blur', this.blur.bind(this));
            this.textField.insert({after: this.passwordField});
            this.textField.name = '';
        }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/PassWithDefault.js'

// global.js: begin JavaScript file: '/js/input/InFieldLabel.js'
// ================================================================================
Ss = window.Ss || {};
Ss.input = window.Ss.input || {};

Ss.input.InFieldLabel = Class.create({
		
		initialize: function(args) {
			

			this.label = args.label;
			this.field = args.field;
			

            this.options = Object.extend(Ss.input.InFieldLabel.defaultOptions, args.options || {});
			

			this.showing = true;
			

			var base = this;
			(function(){

				if(!base.field.getValue().strip().empty()) {
					base.label.hide();
					base.showing = false;
				}
			}).delay(.25);
			
			this._events();
			
		},
		
		showFocus: function() {
			if(this.showing){
				this.setOpacity(this.options.fadeOpacity);
			}
		},
		
		setOpacity: function(opacity) {
			this.label.setOpacity(opacity);
			this.showing = (opacity > 0.0);
		},

		updateText: function(text) {
		    this.label.update(text);
		},
		
		checkForEmpty: function(blur) {
			if(this.field.getValue().strip().empty()){
				if(!this.showing) {
					this.label.show();
				}
				this.setOpacity( blur ? 1 : this.options.fadeOpacity );
			} else {
				this.setOpacity(0.0);
			}
		},
		
		hideOnChange: function(e) {
			if(
				(e.keyCode == 16) || // Skip Shift
				(e.keyCode == 9) // Skip Tab
			  ) return; 
			
			if(this.showing){
				this.label.hide();
				this.showing = false;
			}
		},
		
		subscribe: function(observer) {



			var eventTypes = ['keyup', 'blur', 'change'],
				subject = this;
			
			if(Object.isFunction(observer.update)) {
				eventTypes.each(
					function(eventType) {
						subject.field.observe(eventType, function(evt) {
							observer.update();
						});
					}
				);
			}

		},
		
		clear: function() {
		    this.field.clear();
		    this.update();
		},
		
		update: function() {
			this.checkForEmpty(true);
		},
		
		_events: function() {
			var base = this;
			
			this.field.observe('focus', function(){
				base.checkForEmpty();
				base.showFocus();
				base.field.addClassName(base.options.focusCSS);
			});
			
			this.field.observe('blur', function(){
				base.checkForEmpty(true);
				base.field.removeClassName(base.options.focusCSS);
			});
			
			this.field.observe('keydown', function(e) {
				base.hideOnChange(e);
			});


			this.field.observe('change', function(e){
				base.checkForEmpty();
			});

			if(typeof (this.field.onpropertychange) == "object") {
				this.field.observe('propertychange', function() {
					base.checkForEmpty();
				});
			}

			this.label.observe('click', function() {
				( function(){ base.field.focus(); } ).defer(); // deferment is needed to support explorer
			});
			


			Event.observe(window, 'load', function() {
				if(!base.field.getValue().strip().empty()) {
					base.label.hide();
					base.showing = false;
				}
			});
		}
		
});

Ss.input.InFieldLabel.defaultOptions = {
	fadeOpacity: 0.5, // Once a field has focus, how transparent should the label be
	focusCSS: ''// Once a field has focus, what css class do we write in
};

Ss.input.InFieldLabel.create = function(input) {
    input.insert({ before: '<span class="in_field_label">' + input.getAttribute('placeholder') + '</span>' });
    var label = input.previous('.in_field_label');
    var inFieldLabel = new Ss.input.InFieldLabel({
        label: label,
        field: input
    });
    input.setAttribute('placeholder', '');
    return inFieldLabel;
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/InFieldLabel.js'

// global.js: begin JavaScript file: '/js/storage/storage.js'
// ================================================================================
Ss = window.Ss || {};
Ss.storage = {};

Ss.storage.session = {

    _purgeProofKeys: ['_keys', 'search', 'active_lightbox_html_v2', 'active_lightbox_size', 'active_lightbox_id', 'pending_event', 'search_announcement_seen'],
    
    _clearProofKeys: ['active_lightbox_html_v2', 'active_lightbox_size', 'active_lightbox_id',  'pending_event', 'search_announcement_seen'],
    
    getItem: function(key) {
		if (window.location.protocol === "https:") {
			key = "_s_" + key;
		}
        var value = window.sessionStorage.getItem(key);
        if(Object.isString(value) && value.isJSON()) {
            value = value.evalJSON()
        }
        return value;
    },
    
    setItem: function(key, value) {
		if (key.match('^_s_')) {

			return;
		}
		if (window.location.protocol === "https:") {

			key = "_s_" + key;
		}
        var keys = this.getKeys();
        
        if(!Object.isString(value)) {
            value = Object.toJSON(value);
        } 
        
        try {
            
            window.sessionStorage.setItem(key, value);
            keys.push(key);
            window.sessionStorage.setItem('_keys', keys.join(','));
            
        } catch(e) {

            if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            
                var excludeKeys = Ss.storage.session._purgeProofKeys;
                var tempKey = '';
                var deleteCount = (window.sessionStorage.length/2).round();

                while(deleteCount > 0) {
					var noSkip = window.location.protocol === 'https:' ? '^_s_.*' : '^(?!_s_).*$';
                    tempKey = keys.shift();
					if (!tempKey.match(noSkip)) {
						continue;
					}
                    if(excludeKeys.include(tempKey)) {
                        keys.push(tempKey);
                        continue;
                    }
                    window.sessionStorage.removeItem(tempKey);
                    deleteCount--;
                }
                window.sessionStorage.setItem(key, value);
                keys.push(key);
                window.sessionStorage.setItem('_keys', keys.join(','));

            }
            
        }
    },
    
    removeItem: function(key, arg) {
		if (arg && arg.noPrefix) {

		} else {
			if (window.location.protocol === "https:") {
				key = "_s_" + key;
			}
		}
        var keys = this.getKeys();
        window.sessionStorage.removeItem(key);
        window.sessionStorage.setItem('_keys', keys.without(key).join(','));
    },
    
    clear: function() {
        var excludeKeys = this._clearProofKeys,
            excludeItems = new Hash();
		var noSkip = window.location.protocol === 'https:' ? '^_s_.*' : '^(?!_s_).*$';
        excludeKeys.each(
            function(key) {
                var item = window.sessionStorage.getItem(key);
                if(item) {
                    excludeItems.set(key, item);
                }
            }
        );
        

		try {
			this.getKeys().each(
				function(key) {
					if (key.match(noSkip)) {
						Ss.storage.session.removeItem(key, {noPrefix: 1});
					} 
				}
			);
		} catch (e) {

		}
        
        excludeItems.each(
            function(entry) {
                window.sessionStorage.setItem(entry.key, entry.value);
            }
        );
        
    },
    
    getKeys: function() {
        var keys = [];
        var sKeys = window.sessionStorage.getItem('_keys');
        if(sKeys) {
            keys = sKeys.split(',');
        }
        return keys;
    },
    
    supported: function() {
    	return 'sessionStorage' in window;
    }
    
};
/*
    notes: 150 thumb pages max out at about page 53.
    
    1. improve strategy around 'what' to remove
    
    2. move expired items to a javascript structure instead of just removing them
    
    3. improve prefetching strategy
    
    4. support _exclude keys manipulation via an arg to setItem
    
*/
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/storage/storage.js'

// global.js: begin JavaScript file: '/js/location.js'
// ================================================================================
Ss = window.Ss || {};

Ss.location = {
    
    hasHashParams: function() {
        return !window.location.hash.empty();
    },
    
    getHashParams: function() {
        return this.extractHashQueryString().toQueryParams();
    },
    
    getHashParam: function(name) {
        if(this.hasHashParams()) {
            return this.getHashParams()[name];
        }
        return null;
    },
    
    setHashParams: function(params) {
        var qs = Object.toQueryString(params);
        window.location.hash = qs;
        return qs;
    },
    
    extractHashQueryString: function() {
        return window.location.hash.split('#')[1] || '';
    },
    
    getQueryParams: function() {
        return window.location.search.toQueryParams()
    },
    
    hashchangeSupported: function() {
        return 'onhashchange' in window;
    }
    
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/location.js'

// global.js: begin JavaScript file: '/js/search/search.js'
// ================================================================================
Ss = window.Ss || {};

Ss.search = {
    
    currentPage: null,
    
    _initialized: false,

    _subscribers: {},
    
    _lastScrollY: null,
    
    elements: null,
    
    CSS: {
        loading: 'search_loading'
    },
    
    initialize: function(args) {
        this.initialPage = parseInt(args.initialPage);
        this.currentPage = this.initialPage;
        this.totalPages = parseInt(args.totalPages);
        this.canonicalURL = args.canonicalURL;
        this.text = args.text;
        this.thumbSize = args.thumbSize;
        this.elements = {
            container: $('cat_container')
        };
        

        if(this.thumbSize != 'mosaic') {
            Ss.image.grid.initialize();
        }
        
        Ss.search.history.initialize();
        Ss.search.nextButton.initialize(this.initialPage, this.totalPages);
        Ss.search.pagers.initialize(this.initialPage, this.totalPages);
        
        this._initialized = true;
    },
    
    initialized: function() {
        return this._initialized;
    },
    
    ajaxSupported: function() {
        return ( 
            Ss.search.history.APISupported() || 
            (Ss.location.hashchangeSupported() && Ss.storage.session.supported())    
        );
    },
    

    addResultsCallback: function(f) {
    	Ss.search.subscribe('show', f);
    },
    

    addDetailCallback: function(f) {
    	Ss.pic.subscribe('show', f);
    },
    
    update: function(state) { 
        



        var response = state.responseJSON || state;
        

        if(this.thumbSize == 'mosaic') {
            Ss.image.mosaic.update(response.results); 
        } else {
            Ss.image.grid.update(response);
        }
        this.currentPage = parseInt(response.page);
        this.setSrcID(response.searchSrcID);      


        window._scrollTo(0,0);
        this.nextButton.update(this.currentPage, this.totalPages);
        this.pagers.update(this.currentPage, this.totalPages);


        this._publish('update', response);


        this.show();
    },
    


    show: function() {

        if(!this.visible()) {

            Ss.pic.hide();
            

            this.elements.container.show();
            

            document.body.removeClassName('photo_detail');
            document.body.addClassName('search_results');
            
            if(this._lastScrollY) {
                window._scrollTo(0, this._lastScrollY);
                this._lastScrollY = null;
            }
        }
        

        this._publish('show');
    },
    
    hide: function() {
        if(!this.elements.container.visible()) {
            return;
        }
        this._lastScrollY = (window.scrollY || window.pageYOffset);
        this.elements.container.hide();
    },
    
    visible: function() {
        return this.elements.container.visible();
    },

    showLoading: function() {
        document.body.addClassName(this.CSS.loading);
    	cancelPreview();
    },
    
    hideLoading: function() {
    	document.body.removeClassName(this.CSS.loading);
    },

    isInitialPage: function() {
        return this.getInitialPage() == this.getCurrentPage();
    },
    
    getInitialPage: function() {
        return parseInt(this.initialPage);
    },
    
    getCurrentPage: function() {
        return parseInt(this.currentPage);
    },
    
    getSrcID: function() {
        return Ss.search.client.getParam('src');
    },

    setSrcID: function(id) {
        Ss.search.client.setParam('src', id);
        Ss.search.client.setParam('search_source_id', id);
    },
    
    getTotalPages: function() {
        return parseInt(this.totalPages);
    },
    
    getCanonicalURL: function(params) {
        if(!params || !params.page) {
            throw 'pasrams and page required';
        }


        var canonicalParams = this.canonicalURL.params;
        var urlParams = Object.clone(params);
        Object.keys(canonicalParams).each(function (key) {
            if (Object.isUndefined(urlParams[key])) {
                urlParams[key] = canonicalParams[key];
            }
        });
        var url = this.canonicalURL.base;
        var qs = Object.toQueryString(urlParams);
        return url + '?' + qs ;
    },
    
    sanitizePageNumber: function(page) {
        var totalPages = this.getTotalPages();
        if(page < 1) {
            page = 1;
        }
        if(page > totalPages) {
            page = totalPages;
        }
        return page;
    },

    goToPage: function(page) {
        if(!Object.isNumber(page)) {
            throw 'page (Number) is required';
        }
        var params = { 
            'page': this.sanitizePageNumber(page) 
        };
        Ss.search.history.pushState(params, this.getCanonicalURL(params));
    },

    paginate: function(delta) {
        if(!Object.isNumber(delta)) {
            throw 'delta (Number) is required';
        }
        var params = { 
            'page': this.sanitizePageNumber(this.getCurrentPage() + delta)
        };
        Ss.search.history.pushState(params, this.getCanonicalURL(params));
    },
    
    subscribe: function(type, f) {
        if(!Object.isString(type) || !Object.isFunction(f)) {
            throw 'type (String) and f (Function) required';
        }
        this._subscribers[type] = this._subscribers[type] || [];
        this._subscribers[type].push(f);
    },

    _publish: function(type, evt) {
        if(!Object.isString(type) || 
            !Object.isArray(this._subscribers[type]) || 
            !this._subscribers[type].length) {
            return;
        }
        evt = evt || {};
        evt.type = type;
        this._subscribers[type].each(function(f){
            try { f(evt); } 
            catch(e) { }
        });
    },
    

    lightboxes: {
        
    	clientStorage: Ss.storage.session.supported() && Ss.location.hashchangeSupported(),
    	
        render: function() {
            var lightboxElem = $('main-lightbox-cell'),
                lightboxContent = Ss.storage.session.getItem('active_lightbox_html_v2'),
                lightboxOpen = (lightboxPreviewSize != 'closed' && lightboxPreviewSize != 'minimized'),
                lightboxDisplayed = $('lightbox-preview-container');

            if(!lightboxContent && lightboxDisplayed) {
                setLightboxPreviewSize('closed');
            }
            else if(lightboxElem && lightboxOpen) {
                lightboxElem.innerHTML = lightboxContent;
                lightboxElem.innerHTML.evalScripts();
                lightboxContentsPopulated = true;
                enhanced_lightboxContentsPopulated = true;
                var sessionId = Ss.storage.session.getItem('active_lightbox_id');
                var box = lightboxes.get(sessionId);
                if(sessionId && box) {
                    activeLightboxId = sessionId;
                    activeLightbox = new Hash(box);
                    refreshLightboxListings();
                    this.updateCount();
                }
		if (getAllLightboxes().length < 2){
			$('lightbox_static_title').show();
		}
            }

        },
        
        updateCount: function() {

            	var titleElem = $('select_lightbox').down('.pulldown_trigger strong'),
                contents = $$('#lightbox-contents-table .floated-image'),
                visibleThumbs = [];
	    	
		var onelb = false;
		if (getAllLightboxes().length < 2){
			onelb = true;
			titleElem = $('lightbox-title');
		}
	
            	if(contents && titleElem) {
                	visibleThumbs = contents.select(function(elem) {
                        	return elem.visible();
                    	});
			if(!onelb){
                		Ss.Lightbox.switcher.pulldown.replaceTrigger('<strong>' + titleElem.innerHTML + '</strong> (' + visibleThumbs.size() + ')');
            		}
			else{
				$('lightbox-title').down('span span#lightbox-count').update(visibleThumbs.size());
				$('lightbox-title').update(titleElem.innerHTML);
			}
		}
        },
        
        getSize: function() {
            return Ss.storage.session.getItem('active_lightbox_size');
        },
        
        store: function(activeLightboxHTML) {
            Ss.storage.session.setItem('active_lightbox_html_v2', activeLightboxHTML);
            Ss.storage.session.setItem('active_lightbox_id', activeLightboxId);
        },
        
        storeSize: function(size) {
            Ss.storage.session.setItem('active_lightbox_size', size);
        },
        
        clearLightboxSessionData: function() {
            Ss.storage.session.removeItem('active_lightbox_html_v2');
            Ss.storage.session.removeItem('active_lightbox_id');
            Ss.storage.session.removeItem('active_lightbox_size');
        }
        
    }
    
};

/**************************
 * Legacy Global Functions
 **/


    var selectedPhotoId;
    var searchSourceId;
    
    function getSelectedPhotoSrc(photoId) {
        
        if(window.selectedPhotoSrc) { // try to just return the legacy global.. ajax mode or pic.mhtml may be setting it.
            return selectedPhotoSrc;
        }
                                                                                                   
        if(window.searchSourceId && photoId) { // if cat.mhtml sets the search source id, use it and append the "photoPosition"
            var thumbs = $('grid').select('.gc');
            var thumb = $('gc_' + photoId);
            var photoIndex = thumbs.indexOf(thumb);
            if(photoIndex != -1) {
                if(Ss.search.ajaxSupported()) {
                    return Ss.search.getSrcID() + '-' + Ss.search.getCurrentPage() + "-" + photoIndex; // TODO: use the cell object instead of finding the index manually
                }
                return searchSourceId + "-" + photoIndex;
            }
        }
        
        return "";
    }
    
    var getLocationHash = function() {
        var i, href;
        href = top.location.href;
        i = href.indexOf("#");
        return i >= 0 ? href.substr(i + 1) : null;
    }
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/search.js'

// global.js: begin JavaScript file: '/js/search/client.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = Ss.search || {};

Ss.search.client = {

	_cache: {},

    _params: {
        'component_path':   '/search/get_results.md',
        'search_type':      'keyword_search'
    },

	setParam: function(key, value) {

        if(Object.isString(value)) {
            try {
                this._params[key] = decodeURIComponent(escape(value));
            } catch(e) { 
                this._params[key] = value;
            }
        } else {
            this._params[key] = value;
        }
	},
	
    getParam: function(key) {
        return this._params[key];
    },

	getParams: function() {


        return Object.extend(Ss.search.preferences.get(), this._params);
	},
	
	execute: function(parameters, callback) {
		
		if(!Object.isFunction(callback) || Object.isUndefined(parameters)) {
		    throw 'parameters and callback are required';
		}
        
        parameters = Object.extend(this.getParams(), parameters);
		    
		var cached = this.getCached(parameters);
		
		if(cached) {
			callback(cached);	
			return;
		}

        new Ajax.Request('/show_component.mhtml', {
        
            method: 'GET',
            
            parameters: parameters,
            
            onSuccess: function(response) {
                var _response = {
                    'parameters': parameters,
                    'responseText': response.responseText,
                    'responseJSON': response.responseJSON
                };
                callback(_response);
                Ss.search.client.cache(_response);
            }

        });
        
	},
	
	getKey: function(parameters) {
	    if(parameters.page) {
	        return 'page_' + parameters.page;
	    }
		return Object.toQueryString(parameters);
	},
	
	getCached: function(parameters) {
		return this._cache[ this.getKey(parameters) ];
	},
	
	cache: function(data) {
		this._cache[ this.getKey(data.parameters) ] = data;
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/client.js'

// global.js: begin JavaScript file: '/js/search/history/history.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};

Ss.search.history = {
    
    initialize: function() {
        this._events();
        this._prefetch(1);
    },
    
    APISupported: function() {
        return !!(window.history && window.history.pushState);
    },
    
    shimEnabled: function() {
        return (
            !Ss.search.history.APISupported() &&
            Ss.location.hashchangeSupported() && 
            Ss.storage.session.supported()
        );
    },
    
    pushState: function(params, url) {
        this._modifyState(params, url, 'pushState');
    },
    
    replaceState: function(params, url) {
        this._modifyState(params, url, 'replaceState');
    },
    
    isLoading: function() {
        return this._loading;
    },
    
    isPrefetching: function(page) {
        return (this._fetchPage && this._fetchPage == page);
    },
    
    observePopstate: function(f) {
        /* onload of the page, register a popstate handler
         * it's done onload for two reasons
         * (1) the logic inside of onpopstate handler breaks if the page takes a long time to load
         *     and the user navigates away from the first search page before the browser fires a popstate 
         *     onload
         * (2) the browser doesn't fire popstate events until after the load event anyway
         */
        if(!Ss.search.history.APISupported() || !Object.isFunction(f)) {
            return;
        }
        Event.observe(window, 'load', function(evt){
            (function() {
                Event.observe(window, 'popstate', f);
            }).defer();
        });
    },
    
/* Internals
 ***********/
     _loading: false,
    
    _fetchPage: null,
    
    _startLoading: function() {
        this._loading = true;
        Ss.search.showLoading();
    },
    
    _stopLoading: function() {
        this._loading = false;
        Ss.search.hideLoading();
    },
    
    _modifyState: function(params, url, method) {
        if(!params || !url || (!params.id && !params.page)) {
            throw 'url and id/page param required';
        }
        if(method != 'replaceState' && method != 'pushState') {
            throw 'method of replaceState or pushState required';
        }
        if(this.isLoading()) {
            return;
        }
        this._startLoading();
        if(params.id) {
            Ss.pic.client.execute(params, function(state) {
                Ss.search.history._stopLoading();
                Ss.pic.update(state);
                window.history[method](state, '', url);
            });
        } else if(params.page) {
            var currentPage = Ss.search.getCurrentPage();
            var delta = this._getDelta(currentPage, params.page);
            var success = function(response) {
                Ss.search.history._stopLoading();
                Ss.search.update(response);
                window.history[method](response, '', url);
            };
            if(this.isPrefetching(params.page)) {
                this._pollUntilPrefetchResponse(params.page, function(response){
                        success(response);
                        Ss.search.history._prefetch(delta);
                });
            } else {
                Ss.search.client.execute(params, success);
                this._prefetch(delta);
            }
        }
    },
    
    _onpopstate: function(event) {
        if(!event.state) {
            Ss.search.show();
            if(!Ss.search.isInitialPage()) {
                var params = Ss.location.getQueryParams();
                var page = params.page || 1;
                Ss.search.history.replaceState({'page': page }, window.location.toString());
            }
            return;
        }
        if(Ss.search.preferences.conflict(event.state.parameters)) {
            Ss.search.preferences.resolve(event.state.parameters);
            return;
        }
        if(event.state.parameters.id) {
            Ss.pic.update(event.state);
        } else if (event.state.parameters.page) {
            Ss.search.update(event.state);
        }
    },
    
    _events: function() {
        this._interceptClicks();
        this.observePopstate(Ss.search.history._onpopstate);
    },
    
     
    _interceptClicks: function() {


        var _middleClick = false;
        var isMiddleClick = function(evt) {
            return (_middleClick || evt.metaKey || evt.shiftKey || evt.altKey || evt.ctrlKey);
        };
        document.body.observe('mousedown', function(evt) {
            _middleClick = evt.isMiddleClick() || evt.which == 2;
        });
        document.body.delegateClick('a, a img',
            function(evt) {
                if(isMiddleClick(evt)) {
                    return;
                }
                var anchor = Event.findElement(evt, 'a');
                if(!Object.isElement(anchor) || !anchor.href) {
                    return;
                }
                var matches = anchor.href.match(/pic-(\d+)/);
                if(!matches || !matches[1]) {
                    return;
                }
                var params = { id: matches[1] };
                if(anchor.href.include('?')) {
                    Object.extend(params, anchor.href.toQueryParams());
                }
                Ss.search.history.pushState(params, anchor.href);
                evt.preventDefault();
            }
        );
    },
    
    _prefetch: function (delta) {
        if(delta != -1 && delta != 1) {
            return;
        }
        var parameters = { 
            'page': Ss.search.sanitizePageNumber(Ss.search.getCurrentPage() + delta)
        };
        if(parameters.page > Ss.search.getTotalPages() || parameters.page < 1 ) {
            return;
        }
        
        var cached = Ss.search.client.getCached(parameters);
        if(cached) {
            this._prefetchThumbs(cached.responseJSON.results);
            return;
        }
        this._fetchPage = parameters.page;
        Ss.search.client.execute(
            parameters,
            function (response) {
                Ss.search.history._fetchPage = null;
                Ss.search.history._prefetchThumbs(response.responseJSON.results);
            }
        );
    },
    
    _prefetchThumbs: function(results) {
        results.pluck('thumb_url').each(
            function(url){
                var img = new Image();
                img.src = url;
            }
        );
    },
    
    _pollUntilPrefetchResponse: function(page, onComplete) {
        if(!Object.isFunction(onComplete)) {
            return;
        }
        new PeriodicalExecuter(
            function(pe) {
                var cached = Ss.search.client.getCached({ page: page });
                if(cached) {
                    pe.stop();
                    onComplete(cached);
                }
            }, .0015
        );
    },
    
    _getDelta: function(srcPage, destPage) {
        var delta = 1;
        if(srcPage && destPage && (destPage == (srcPage-1))) {
            delta = -1;
        }
        return delta;
    }
    
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/history.js'

// global.js: begin JavaScript file: '/js/search/history/shim.js'
// ================================================================================
(function(){

    if(!Ss.search.history.shimEnabled()) {
        return;
    }
    
    Object.extend(Ss.search.history, {
        initialize: function() {
            Event.observe(window, 'hashchange', this._onhashchange.bind(this));
            this._initializeStorage();
            this._prefetch(1);
            this._interceptClicks(); 
        },
        
        pushState: function(params) {
            if(!params || (!params.id && !params.page)) {
                throw 'id or page required';
            }
            Ss.location.setHashParams(params);
        },
        
        replaceState: function() {
            throw 'replaceState is not supported by this history shim';
        },
        
        _onhashchange: function(evt, onComplete) {
            

            if(this.isLoading()) {
                return;
            }
            
            var hashParams = Ss.location.getHashParams();
            

            if(hashParams.id) {
                Ss.search.history._startLoading();
                Ss.pic.client.execute(hashParams, function(response) {
                    Ss.search.history._stopLoading();
                    Ss.pic.update(response);
                    

                    var tempStyles = $('temp_style');
                    if(Object.isElement(tempStyles)) {
                        tempStyles.remove();
                    }
                });
                return;
            }
            


            var hashPage = parseInt(hashParams.page);
            var currentPage = Ss.search.getCurrentPage();
            if(!hashPage) {
                Ss.search.show();
                if(!Ss.search.isInitialPage()) {
                    this.pushState({ 'page': Ss.search.getInitialPage() });
                }
                return;
            } 
            
            var delta = this._getDelta(currentPage, hashPage);
            


            if(!this._loadAndDisplayStoredPage(hashPage, onComplete)) {
                

                this._startLoading();
                


                if(this.isPrefetching(hashPage)) {
                    new PeriodicalExecuter(
                        function(pe) {     
                            if(Ss.search.history._loadAndDisplayStoredPage(hashPage, onComplete)) {
                                pe.stop();
                                Ss.search.history._stopLoading();
                                Ss.search.history._prefetch(delta);
                            }
                        }, .0015);
                    return;
                }
    

                Ss.search.client.execute(
                    Ss.location.getHashParams(),
                    function (response) {
                        Ss.search.history._stopLoading();
                        Ss.search.update(response);
                        if(onComplete && Object.isFunction(onComplete)) {
                            onComplete(response);
                        }
                        Ss.search.history._storePage(hashPage, response.responseText);
                    }
                );
            }
            this._prefetch(delta);
        },
        
        _initializeStorage: function() {


            var qs = Object.toQueryString(Ss.search.client.getParams());
            if(qs != Ss.storage.session.getItem('search')) {
                Ss.storage.session.clear();
                Ss.storage.session.setItem('search', qs);
            }
        },
        
        _storePage: function(page, responseText) {
            var key = 'page=' + page;
            Ss.storage.session.setItem(key, responseText);
        },
        
        _getStoredPage: function(page) {
            var key = 'page=' + page;
            var storedResponse = Ss.storage.session.getItem(key);
            return storedResponse;
        },
        
        _loadAndDisplayStoredPage: function(page, onComplete) {
            var storedPage = this._getStoredPage(page);
            if(storedPage) {
                Ss.search.update(storedPage);
                if(onComplete && Object.isFunction(onComplete)) {
                    onComplete(storedPage);
                }
            }
            return storedPage;
        },
        
        _prefetch: function(delta) {
            if(delta != -1 && delta != 1) {
                return;
            }
            var parameters = Ss.location.getHashParams();
            var page = parseInt(parameters.page || Ss.search.getInitialPage());
            parameters.page = delta + page;
            if(parameters.page > Ss.search.getTotalPages() || parameters.page < 1 ) {
                return;
            }
            var storedPage = Ss.search.history._getStoredPage(parameters.page);
            if(storedPage) {
                Ss.search.history._prefetchThumbs(storedPage.results);
                return;
            }
            Ss.search.history._fetchPage = parameters.page;
            Ss.search.client.execute(
                parameters,
                function(response) {
                    Ss.search.history._fetchPage = null;
                    Ss.search.history._storePage(parameters.page, response.responseText);
                    Ss.search.history._prefetchThumbs(response.responseJSON.results); // cache images
                }
            );
        },
        
        _supportHashParamsOnload: function() {
            document.write('<style id="temp_style">#bodyContentCenter, #ui_widgets, select, .gc_thumb img { visibility: hidden !important; } #bodyContent{background: url("/images/loading_icon_2.gif") no-repeat 25px 25px;}</style>');
            Event.observe(document, 'dom:loaded', function(evt) {
                var ajaxLoad = function() {
                    Ss.search.history._onhashchange(null,
                        function(){
                            $('temp_style').remove();
                        }
                    );
                };
                if(Ss.search.initialized()) {
                    ajaxLoad();
                    return;
                }
                var _pe = new PeriodicalExecuter(
                    function(pe) {
                        if(Ss.search.initialized()) {
                            ajaxLoad();
                            pe.stop();
                        }
                    }, 0.025
                );
            });
        }
    });
    
})();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/shim.js'

// global.js: begin JavaScript file: '/js/search/history/support_hash_onload.js'
// ================================================================================
/* running _supportHashParamsOnLoad right away  
 * (in the head of the page) so that the user   
 * doesn't see the query page get replaced by 
 * the hash page
 */
(function(){


    if(!Ss.ENV || Ss.ENV.SCRIPT_NAME != "/cat.mhtml" || !Ss.location.hasHashParams()) {
        return;
    }
 
    var params = Ss.location.getHashParams();



    if(!params.page && !params.id) {
        return;
    }




    if(Ss.search.getInitialPage() == params.page && !params.id) {
        return;
    }
    



    if(Ss.search.history.shimEnabled()) {
        Ss.search.history._supportHashParamsOnload();
    } else {
        if(params.id) {
            window.location = '/pic.mhtml?' + Object.toQueryString(params);
        } else if (params.page) {
            params = Object.extend(Ss.location.getQueryParams(), params);
            window.location = window.location.pathname + '?' + Object.toQueryString(params);
        }
    }

})();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/support_hash_onload.js'

// global.js: begin JavaScript file: '/js/search/nextButton.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};


Ss.search.nextButton = {

    initialize: function(currentPage, totalPages) {
        var element = $('search-results-next-button');
        
        if(!Object.isElement(element)) {
            return;
        }
        
        this.element = element;
        
        if(currentPage && totalPages) {
            this.update(currentPage, totalPages);
        }
        
        this.element.observe('click', function(evt) {
                Ss.search.paginate(1);
                evt.preventDefault();
        });
    },
    
    update: function(currentPage, totalPages) {
        if(!this.element) {
            return;
        }
        var isLastPage = currentPage >= totalPages;
        if(isLastPage) {
            this.element.hide();
        } else {
            this.element.show();
        }
    }
    
};

/*
      if(this.images != images) {
            images.push({
                _next: true,
                width: this.max,
                height: this.max
            });
        }
        this.next.setStyle({
            width: this._next._width + 'px',
            height: this._next._height + 'px'
        });

        getHTML:
        if(image._next) {
                 mosaic.setNext(image);
        }
 */
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/nextButton.js'

// global.js: begin JavaScript file: '/js/search/Pager.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};

Ss.search.Pager = Class.create({
    
    DISABLED_CSS: {
        prev: 'grid_pager_button_prev_disabled',
        next: 'grid_pager_button_next_disabled'
    },
    
    initialize: function(elements) {
        this.elements = elements; // form, input, prev, next
        
        this._prevDisabled = this.elements.prev.hasClassName(this.DISABLED_CSS.prev);
        this._nextDisabled = this.elements.next.hasClassName(this.DISABLED_CSS.next);
        
        this._events();
    },
    

    update: function(currentPage, totalPages) {
        var next = this.elements.next;
        var prev = this.elements.prev;
        var input = this.elements.input;
        var isLastPage = (currentPage >= totalPages);
        var isFirstPage = (currentPage <= 1);
        
        this.setFieldValue(currentPage);
        

        if(!isLastPage && this._nextDisabled) {
            next.removeClassName(this.DISABLED_CSS.next);
            this._nextDisabled = false;
        }


        if(isLastPage) {
            next.addClassName(this.DISABLED_CSS.next);
            this._nextDisabled = true;
        }        
        

        if(this._prevDisabled && !isFirstPage) {
            prev.removeClassName(this.DISABLED_CSS.prev);
            this._prevDisabled = false;
        }
        

        if(isFirstPage) {
            prev.addClassName(this.DISABLED_CSS.prev);
            this._prevDisabled = true;
        }
    },
    
    getFieldValue: function() {
        return parseInt($F(this.elements.input));
    },
    
    setFieldValue: function(page) {
        var input = this.elements.input;
        input.value = page;
        if(input.value.length > input.size) {
            input.size = input.value.length;
        }
    },
    
    _events: function() {
        var instance = this;
        this.elements.form.observe('submit',
            function(evt) {
                Ss.search.goToPage(instance.getFieldValue());
                evt.preventDefault();
            }
        );
        this.elements.prev.observe('click',
            function(evt) {
                Ss.search.paginate(-1);
                evt.preventDefault();
            }
        );
        this.elements.next.observe('click',
            function(evt) {
                Ss.search.paginate(1);
                evt.preventDefault();
            }
        );
    }
        
});


Ss.search.pagers = {
    
    initialize: function(currentPage, totalPages) {
        this.topPager = new Ss.search.Pager({
            form:   $('grid_options_top'),
            input:  $('grid_page_number_top'),
            prev:   $('grid_pager_prev_top'),
            next:   $('grid_pager_next_top')
        });
        this.bottomPager = new Ss.search.Pager({
            form:   $('grid_options_bottom'),
            input:  $('grid_page_number_bottom'),
            prev:   $('grid_pager_prev_bottom'),
            next:   $('grid_pager_next_bottom')
        });
        this.update(currentPage, totalPages);
    },
    
    update: function(currentPage, totalPages) {
        [this.topPager, this.bottomPager].invoke('update', currentPage, totalPages);
    }

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/Pager.js'

// global.js: begin JavaScript file: '/js/search/preferences.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = Ss.search || {};

Ss.search.preferences = {

	initialize: function(args) {
		this.form = args.form;
		this.pageInput = args.pageInput;
		this.trigger = args.trigger;
		this.container = args.container;
		this.panel = args.panel;
		this.spriteImage = args.spriteImage;
		this.safesearchTrigger = args.safesearchTrigger;
		this.safesearchContent = args.safesearchContent;
		this.safesearchClose = args.safesearchClose;

		this._setup();
		this._setPreferencesOnClick();
	},

	get: function() {
		return this.form.serialize().toQueryParams();
	},

	showLoading: function() {
		Ss.search.showLoading();
		Ss.search.preferences.container.addClassName('loading');
	},
	


	conflict: function(parameters) {
        return (
            parameters &&
            parameters['thumb_size'] &&
            (parameters['thumb_size'] == 'mosaic' || Ss.search.thumbSize == 'mosaic') &&
            parameters['thumb_size'] != Ss.search.thumbSize
        );
	},
	

	resolve: function(parameters) {
	    parameters['thumb_size'] = Ss.search.thumbSize;
	    Ss.search.history.replaceState(parameters, window.location.toString());
	},

	_setPreferencesOnClick: function() {
		var grid = Ss.image.grid;
		var preferences = this;
		var store = function() {
			var parameters = Object.extend(preferences.get(), {
				'component_path': 'set_display_prefs.md'
			});
			delete parameters.redirect;
			new Ajax.Request( '/show_component.mhtml', {
				method: 'POST',
				parameters: parameters
			});
		};
		preferences.form.delegateClick('input', function(evt){
			var input = Event.findElement(evt, 'input');
			var isActive;
			if(!Object.isElement(input)) {
				return;
			}
			isActive = Object.isElement(input.up('label.active'));
			if(isActive) {
				return;
			}
			if(input.name == 'show_descriptions') {
				grid.toggleDescriptions(input.checked);
				store();
			}
			else if(input.name == 'image_previews') {
				Ss.image.Preview[(input.checked ? 'on' : 'off' )]();
				store();
			}
			else {
				preferences.showLoading();
				preferences.form.submit();
			}
			preferences.hide(.150);
		});
		Ss.search.subscribe('update', function(evt) {
			preferences.pageInput.value = evt.page;
		});
	},

	hide: function(delay) {
	    var preferences = this;
        (function(){
            preferences.panel.hide();
            document.body.removeClassName('preferences_menu_open');
        }).delay(delay || 0);
	},
	
	_setup: function() {
		var preferences = this;

		this.container.show();

		document.body.observe('click', function(e) {
			var elem = e.findElement();


			if(elem.isElementOrDescendantOf(preferences.trigger)) {
				preferences.panel.toggle();
				document.body[preferences.panel.visible() ? 'addClassName' : 'removeClassName' ]('preferences_menu_open');
			}


			if(elem == preferences.safesearchTrigger || elem == preferences.safesearchClose) {
				preferences.safesearchContent.toggle();
			}


			else if(preferences.panel.visible() && !elem.isElementOrDescendantOf(preferences.container)) {
				preferences.hide();
				preferences.safesearchContent.hide();
			}
		});
	}

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/preferences.js'

// global.js: begin JavaScript file: '/js/search/related.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};


Ss.search.related = {
	
	_previewLimit: 5,
	
	_firstPreview: true,
	
	initialize: function(relatedPreviews) {

		this.relatedPreviews = relatedPreviews;
		
		this.elements = {
			container:	$('related_searches_container'),
			preview: 	$('ss_shadow_container')
		};
	
		if(
			!Object.isElement(this.elements.container) ||
			!Object.isArray(relatedPreviews)
		) {


			return;
		}


		this.elements.container.observe('mouseover',
			function(evt) {
				var link = evt.findElement('a');
				if(!Object.isElement(link) || !link.match('a')) {
					return;
				}
				Ss.search.related.preview(link);
			}
		);
		
	},


	setPreviewLimit: function(previewLimit) {
		this._previewLimit = previewLimit;
	},
	

	getPreviewResults: function(searchterm) {
		if(!Object.isString(searchterm)) {
			return;
		}
		
		var resultsObject = this.relatedPreviews.find(
			function(obj){
				return Object.keys(obj).include(searchterm);
			}
		);
		return resultsObject[searchterm].slice(0, this._previewLimit);
	},
	

	preview: function(link) {
		if(!Object.isElement(link)) {
			return;
		}
		
		var html = [],
			searchterm = link.innerHTML.stripTags(),
			results = this.getPreviewResults(searchterm),
			borderMarginPadding = 12,
			minWidth = results.inject(0, function(acc, result){ return acc + parseInt(result.thumb_width) + borderMarginPadding; });
			
		html.push('<ul class="clearfix" style="min-width: ' + minWidth + 'px;">');
		results.each(
			function(result, i) {
				html.push('<li>');
				html.push('<a id="related_search_image_' + (i+1) + '" style="width:' + result.thumb_width + 'px; height:' + result.thumb_height+ 'px;" href="/pic.mhtml?id=' + result.id + '">');
				html.push('<img src=' + result.thumb_url + ' />');
				html.push('</a>');
				html.push('</li>');
			}
		);
		html.push('</ul>');
		html.push('<div class="rs_hover"></div>');
		this.show( html.join(''), link);
	},
	

	show: function(content, link) {
		
		var scElem = null;
		var related = Ss.search.related;
		var args = {
			modal: false,
			position: {
					target:		link,
					type:		'bottom-center',
					offsetY:	11
	
			},
			notch: {
				type: 'top'
			},
			closeButton: false,
			className: 'related_preview' + (this._firstPreview ? ' opac_0' : '')
		};
	

		var write = function() {

			document.body.addClassName('related_preview_visible');
			

			scElem = Ss.ShadowContainer.write(content, args);
			

			Ss.ShadowContainer.positionNotch(link);
		};
		

		var writeAndFadeIn = function() {
			write();
			if(scElem.CSSTransitionsSupported()) { // if css transitions are available
				scElem.addClassName('animate_opacity'); // add the css class used for css transitions (if available)
				scElem.removeClassName('opac_0'); // unset the 0 opacity to trigger the transition
			} else {
				scElem.fadeIn({ onComplete: function(){ scElem.removeClassName('opac_0'); } }); // do the transition with javascript, unset the 0 opacity after it has completed
			}
			related._firstPreview = false;
		};


		if(this._firstPreview) {

			this._tid = writeAndFadeIn.delay(.25); 
		} else {

			write();
		}
		
		this.observeMouseout();
	},
	

	hide: function() {


		document.body.removeClassName('related_preview_visible');
		

		if(this._tid) {
			window.clearTimeout(this._tid);
			this._tid = null;
		}
		

		if(Ss.ShadowContainer.visible()) {
			Ss.ShadowContainer.hide(); // hide it
		}
		
		this.stopObservingMouseout();
	},
	
	mouseoutHandler: function(evt) {
		var destinationElement = evt.relatedTarget || evt.toElement;
		


		if(
			Object.isElement(destinationElement) &&
			!destinationElement.isElementOrDescendantOf(Ss.search.related.elements.container) &&
			!destinationElement.isElementOrDescendantOf(Ss.search.related.elements.preview)
		) {
			Ss.search.related.hide();
		}
	},
	
	observeMouseout: function() {
		[this.elements.container, this.elements.preview].invoke('observe', 'mouseout', this.mouseoutHandler);
	},
	
	stopObservingMouseout: function() {
		[this.elements.container, this.elements.preview].invoke('stopObserving', 'mouseout', this.mouseoutHandler);
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/related.js'

// global.js: begin JavaScript file: '/js/image/Preview.js'
// ================================================================================
/* Copyright (c) 2008 Shutterstock Images LLC */
Ss = window.Ss || {};
Ss.image = window.Ss.image || {};

Ss.image.Preview = Class.create({
        
        initialize: function(args) {
            
            this.elements = args.elements;
    
            this.showing = false;
    
            this.locks = {
                thumbLoad: {}
            };
    
            this.activeResultSlot = {};
            

            this.elements.previewImage = new Image();
            $(this.elements.previewImage).hide();
            this.elements.thumb.parentNode.insertBefore(
                this.elements.previewImage,
                this.elements.thumb
            );
        
            this.elements.thumb.observe('load', this.show.bind(this));
        },

        populate: function(args) {






            var resultSlot = args.resultSlot;
            var isMosaic = args.isMosaic;
            this.showing = true;





            var thumb = resultSlot.elements.thumb;
            var previewThumb = this.elements.thumb;
            var previewImage = this.elements.previewImage;
            var pageContainer = this.elements.pageContainer;
            var previewDescription = this.elements.description;
            var descriptionText = args.descriptionText;
            var showDescription = !Object.isUndefined(args.descriptionText);


            var imageSrc = resultSlot.previewThumbSrc
                ? resultSlot.previewThumbSrc
                : ['http:/', resultSlot.result.host, 'photos', 'display_pic_with_logo', resultSlot.result.set_name, resultSlot.result.filename].join('/');


            if (previewImage.src == imageSrc) {
                this.show();
            } else {
                this.locks[resultSlot.id] = true;


                var hqAnnotationHeight = 20;

                var dimensionMax = 450;


                var aspectRatio = args.resultSlot.result.aspect_ratio;
                var displayHeight = aspectRatio < 1
                    ? dimensionMax
                    : Math.round(dimensionMax / aspectRatio);
                var displayWidth = aspectRatio < 1
                    ? Math.round(dimensionMax * aspectRatio)
                    : dimensionMax;


                var previewContainer = previewThumb.parentNode;
                previewContainer.style.height = displayHeight + 'px';
                previewContainer.style.width = displayWidth + 'px';
                previewContainer.style.overflow = 'hidden';
                

                if(previewDescription && showDescription) {
                	previewDescription.style.width = displayWidth + 'px';
                	previewDescription.update(descriptionText);
                }


                var iframeBacking = this.elements.iframeBacking;
                if (iframeBacking) {
                    iframeBacking.style.height = (displayHeight + 65) + 'px';
                    iframeBacking.style.width = (displayWidth + 65) + 'px';
                }


                this.position( {
                    resultSlot: resultSlot,
                    placement: args.placement,
                    fixedContainer: args.fixedContainer,
                    fixedAncestor: args.fixedAncestor,
                    pageContainer: pageContainer,
                    showDescription: showDescription,
                    cellMax: args.cellMax,
                    isMosaic: isMosaic
                } );


                previewThumb.show();
                previewImage.hide();



                previewImage.src = imageSrc;
                previewImage.height = displayHeight + hqAnnotationHeight;
                previewImage.width = displayWidth;

                previewImage.onload = function () {

                    if (this.locks[resultSlot.id]) {
                        toggleCursorState('revert', this.activeResultSlot.elements.thumb, 'local');
                        this.locks[resultSlot.id] = false;
                    }
                    previewThumb.hide();
                    previewImage.show();
                }.bind(this);




                if(!thumb) {

                    return;
                }
                previewThumb.src = thumb.src;
                previewThumb.height = aspectRatio <= 1
                    ? dimensionMax
                    : dimensionMax * (thumb.naturalHeight || thumb.height) / (thumb.naturalWidth || thumb.width);
                previewThumb.width = aspectRatio <= 1
                    ? dimensionMax * (thumb.naturalWidth || thumb.width) / (thumb.naturalHeight || thumb.height)
                    : dimensionMax;
                



                this.elements.container.style.display = 'block';
            }



            setTimeout(function() {
                if (this.locks[resultSlot.id]) {
                    toggleCursorState('progress', thumb, 'local');
                }
            }.bind(this), 1000);

        },

        unPopulate: function(args) {
            if (!args) args = {};
            this.locks[this.activeResultSlot.id] = false;
            this.elements.container.style.display = 'none';	
            this.showing = false;
            if (this.activeResultSlot.elements && !args.dontClearCursor) {
                toggleCursorState('revert', this.activeResultSlot.elements.thumb, 'local'); 
            }

            newlyActiveThumb = false;
        },

        position: function(args) { // resultSlot, placement

            this.activeResultSlot = args.resultSlot;

            var thumbPosition;
            var isMosaic = args.isMosaic;
            var pageContainer = args.pageContainer;
            
            if (args.fixedContainer && args.fixedAncestor) {
                thumbPosition = getFixedPosition(args.fixedContainer, args.resultSlot.elements.container, args.fixedAncestor);
            } else {
                thumbPosition = getElementScreenPosition(args.resultSlot.elements.container);
            }

            var viewportDimensions = document.viewport.getDimensions();
            var viewportOffsets = document.viewport.getScrollOffsets();



            if(isMosaic) {
                var previewPadding = 60;

                if (Ss.image.mosaic && Ss.image.mosaic.options && Ss.image.mosaic.options.hover === 'hover_michal') {
                    previewPadding = 100;
                }
            } else {
                var previewPadding = (args.cellMax ? 35 : 60);
            }

            var padding = (args.cellMax ? 6 : 10);
            var descriptionHeight = 25;


            var dimensions = args.resultSlot.getDimensions(450);
            var previewHeight = dimensions.height + previewPadding;
            var previewWidth = dimensions.width + previewPadding;
            


            var cellMax = args.cellMax;

			var thumbWidth, thumbHeight;
			
			try {
			    var elem = this.activeResultSlot.elements.container.getDimensions();
				thumbWidth = parseInt(elem.width);
				thumbHeight = parseInt(elem.height);
			} catch (e) {
            	thumbWidth = thumbHeight = activeThumbSize.max_dimension_pixels;
			}
			
            var berth = {
                top: thumbPosition.top - previewHeight,
                left: thumbPosition.left - previewWidth,
                bottom: viewportDimensions.height - thumbPosition.top - previewHeight,
                right: viewportDimensions.width - thumbPosition.left - thumbWidth - previewWidth
            };

            var bestPlacement;
            $H(berth).keys().each( function(placement) {
                bestPlacement = bestPlacement ? bestPlacement : placement;
                bestPlacement = berth[placement] > berth[bestPlacement] ? placement : bestPlacement;
            } );

            bestPlacement = bestPlacement ? bestPlacement : 'bottom';
            var previewPosition, diffThumbCellX, diffThumbCellY;

            switch (bestPlacement) {
                case 'top':
                    previewPosition = {
                        top: thumbPosition.top - previewHeight - padding,
                        left: thumbPosition.left + (thumbWidth / 2) - (previewWidth / 2)
                    };
                    
					if(cellMax) {
						diffThumbCellY = cellMax - thumbHeight;
						previewPosition.top -= (diffThumbCellY + previewPadding - padding);
					}
                    break;
                case 'left':
                    previewPosition = {
                        top: thumbPosition.top + (thumbHeight / 2) - (previewHeight / 2),
                        left: thumbPosition.left - previewWidth - padding - 3
                    };
					
					if(cellMax) {
						diffThumbCellX = cellMax - thumbWidth;
						previewPosition.left -= (diffThumbCellX/2).round();
					}
                    break;
                case 'bottom':
                    previewPosition = {
                        top: thumbPosition.top + thumbHeight + padding,
                        left: thumbPosition.left + (thumbWidth / 2) - (previewWidth / 2)
                    };
                    
                    if(cellMax) {
                    	


                    	previewPosition.top += cellMax - Ss.image.grid.calculateTopMargin(thumbHeight) - thumbHeight;
                    	

                    	if(Ss.image.grid.hasDescriptions()) {
                    		previewPosition.top += descriptionHeight;
                    	}
                    	
                    }
                    break;
                case 'right':
                    previewPosition = {
                        top: thumbPosition.top + (thumbHeight / 2) - (previewHeight / 2),
                        left: thumbPosition.left + thumbWidth + padding
                    };
                    
					if(cellMax) {
						diffThumbCellX = cellMax - thumbWidth;
						previewPosition.left += (diffThumbCellX/2).round();
					}
                    break;
            }


            var offsetTop = pageContainer.cumulativeOffset();
            var viewportHeight = viewportDimensions.height;
            if(offsetTop && offsetTop[1] && previewPosition['top']) {
                previewPosition['top'] -= offsetTop[1];
                viewportHeight -= offsetTop[1];
            }

            var containerStyle = this.elements.container.style;
            $w('top left').each( function(dimension) {
                if (previewPosition[dimension] !== null) {

                    if ((bestPlacement == 'left' || bestPlacement == 'right') && (dimension  == 'top')
                        || (bestPlacement == 'top' || bestPlacement == 'bottom') && (dimension  == 'left')) {
                    
                        if (previewPosition[dimension] < 0) {
                            previewPosition[dimension] = padding;

                        } else if (dimension == 'left' && previewPosition[dimension] + previewWidth > viewportDimensions.width) {
                            previewPosition[dimension] = viewportDimensions.width - previewWidth - padding;

                        } else if (dimension == 'top' && previewPosition[dimension] + previewHeight > viewportHeight) {
                            previewPosition[dimension] = viewportHeight - previewHeight - padding;
                        }
    
                    }

                    if (dimension == 'top' || dimension == 'bottom') {
                        containerStyle[dimension] = previewPosition[dimension] + viewportOffsets.top + 'px';
                    } else {
                        containerStyle[dimension] = previewPosition[dimension] + 'px';
                    }
                
                } else {
                    containerStyle[dimensions] = null;
                }
            } );

        },
        show: function() {
            if (!this.showing) return;
            this.elements.container.style.display = 'block';
        }
});

Object.extend(Ss.image.Preview, {
        initialize: function() {

            window.resultPreview = new Ss.image.Preview( { 
                elements: {
                    container: $('photo-details-container'),
                    thumb: $('photo-comp-thumb'),
                    iframeBacking: document.getElementById('photo-details-iframe-backing'),
                    description: $('photo-details-description'),
                    pageContainer: $('shutterstock_page')
                }
            });
            
            window.activeThumbSize = { max_dimension_pixels: 100 };
        },
        
        on: function() {
            var grid = $('grid_cells');
            if(!Object.isElement(grid)) {
                return;
            }
            grid.observe('mouseover', function(evt) {
                var thumb = Event.findElement(evt, 'img');
                var mousingFromAddToLightbox = Object.isElement(evt.relatedTarget) && Object.isElement(evt.relatedTarget.up('.add_to_lightbox'));
                if(mousingFromAddToLightbox) {
                    return;
                }
                if(thumb) {
                    previewThumb(thumb);
                }
            });
            grid.observe('mouseout', function(evt) {
                var cell;
                var thumb;
                
                if(Ss.image.mosaic.isActive()) {
                    cell = Event.findElement(evt, '.gc_clip');
                    if(cell && (!evt.relatedTarget || (evt.relatedTarget && !evt.relatedTarget.isElementOrDescendantOf(cell)))) {
                        thumb = cell.down('img');
                    }
                } else {
                    thumb = Event.findElement(evt, 'img');
                }
                if(thumb) {
                    cancelPreview(thumb);
                }
            });
        },
        
        off: function() {
            var grid = $('grid_cells');
            if(!Object.isElement(grid)) {
                return;
            }
            grid.stopObserving('mouseover');
            grid.stopObserving('mouseout');
        }
        
});


/************************************************************
 * Dependencies/functions moved from other deprecated classes
 **/
var legacyActiveThumb; // dump this out into the global namespace for show_image.mh
var initialElementCursorStyles = {};

function previewThumb(e, descriptionText, cellMax) {
	legacyActiveThumb = e;
	if (!Object.isElement(legacyActiveThumb)) {
	    return;
	}
	setTimeout( function() {
		if (legacyActiveThumb && legacyActiveThumb.src == e.src) {



			var ancestors = $(legacyActiveThumb).ancestors();
			var container;
				

			container = ancestors.find(
				function(ancestor) {
					return ancestor.className.match(/thumb_image_container|gc_c|mosaic_cell/);
				}
			);
			

			container = container || legacyActiveThumb.up('a');

			

			if(!container) {
				return;
			}
			
            var thumbWidth;
            var thumbHeight;
	    var isMosaic = Ss.image.mosaic.isActive();

            if(isMosaic && e.up('.mosaic_cell')) {
                var thumb = container.hasClassName('gc_clip') ? container : container.down('.gc_clip');
                thumbWidth = parseInt(thumb.style.width);
                thumbHeight = parseInt(thumb.style.height);
            } else {
                thumbWidth =  parseInt(container.style.width);
                thumbHeight = parseInt(container.style.height);
            }

			var previewThumbSrc;
			
            if(legacyActiveThumb.src.match(/display_pic_with_logo/)) {
                previewThumbSrc = legacyActiveThumb.src;
            } else {
                previewThumbSrc = legacyActiveThumb.src.replace(/\/(thumb_small|thumb_large)\//, '/display_pic_with_logo/');
                if (!previewThumbSrc.match(/https?:\/\/[^\/]+\/photos\//ig)) {
                    /* we are using seo optimized photo url, we can use image.shutterstock.com */
                    previewThumbSrc = previewThumbSrc.replace(/(https?:\/\/)([^\/]+)/,'$1' + 'image.shutterstock.com');
                }
            }

			var fakeResultSlot = {
				elements: {
					container: container,
					thumb: legacyActiveThumb
				},
				getDimensions: function(maxDimensionPixels) {
					
					var multiplier = maxDimensionPixels / Math.max(thumbWidth, thumbHeight);
					return { 
						width: thumbWidth * multiplier, 
						height: thumbHeight * multiplier
					};
				},
				result: {
					aspect_ratio: (thumbWidth / thumbHeight)
				},
				previewThumbSrc: previewThumbSrc
			};

			if (window.resultPreview) {
				var lightboxContainer = document.getElementById('lightbox-contents-table');
				var lightboxFixedAncestor = document.getElementById('lightbox-preview-container');
				var fixedContainer = lightboxContainer && Element.extend(legacyActiveThumb).descendantOf(lightboxContainer) ? lightboxContainer: null;
				resultPreview.populate( { resultSlot: fakeResultSlot, fixedContainer: fixedContainer, fixedAncestor: lightboxFixedAncestor, descriptionText: descriptionText, cellMax: cellMax, isMosaic: isMosaic } );
				resultPreview.show();
			}
		}
	}, 250);
}

function cancelPreview(e) {
	legacyActiveThumb = null;
	if (window.resultPreview) {
		resultPreview.unPopulate();
	}
}

function toggleCursorState(state, e, scope) {

    if (this.isSafari) {
        
        var cursorIndicator = $('cursor-indicator');

        if (state == 'revert') {
            cursorIndicator.hide();	

        } else {
            this.showingCursorIndicator = true;
            this.positionCursorIndicator();
            cursorIndicator.show();
        }

    } else {

        if (state == 'revert') {
            if (e && e.style.cursor == 'progress') {
                e.style.cursor = initialElementCursorStyles[e.id];
            }
            if (scope != 'local') {
                document.body.style.cursor = 'auto';
            }

        } else {
            if (e && e.style.cursor != 'progress') {
                initialElementCursorStyles[e.id] = e.style.cursor;
            }

            if (e) e.style.cursor = state;

            if (scope != 'local') {
                document.body.style.cursor = state;
            }
        }
    }

}

function getElementScreenPosition(e, fixedOffsets) {

    var elementPagePosition = getElementPosition(e);
    var scrollOffsets = fixedOffsets ? fixedOffsets : document.viewport.getScrollOffsets();

    return { 
        left: elementPagePosition.left - scrollOffsets.left,
        top: elementPagePosition.top - scrollOffsets.top
    };

}

function getFixedPosition(container, element, fixedAncestor) {

    var elementPosition = getElementPosition(element, container.id);

    var elementAdjustedTop = elementPosition.top - container.scrollTop;
    var elementAdjustedLeft = elementPosition.left - container.scrollLeft;
    
    var containerPosition;
    if (Element.getStyle(fixedAncestor, 'position') == 'fixed') {
        containerPosition = getElementPosition(container);
    } else {
        containerPosition = getElementScreenPosition(container);
    }

    var elementScreenTop = elementAdjustedTop + containerPosition.top;
    var elementScreenLeft = elementAdjustedLeft + containerPosition.left;

    return { top: elementScreenTop, left: elementScreenLeft };

}

function getElementPosition(obj, containerId) {

        var left = 0, top = 0;
        if (obj.offsetParent) {
                do {
                    if (containerId && obj.id == containerId) {
                        break;
                    }
                    left += obj.offsetLeft;
                    top += obj.offsetTop;
                } while (obj = obj.offsetParent);
        }
    
    return { left: left, top: top };

}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/Preview.js'

// global.js: begin JavaScript file: '/js/image/grid.js'
// ================================================================================
Ss.image = window.Ss.image || {};

Ss.image.grid = {
    
    cells: [],
    
    element: null,

    _hasPreview: null,
    
    recycleElements: Prototype.Browser.WebKit || Ss.Browser.isIEVersion(10),

    setup: function(){
        this.element = $('grid_cells');
        this.handleLightboxClicks();
    },

    initialize: function() {
        this.element.select('.gc').each( 
            function(elem, index) {
                
                var content = elem.down('div');
                var imageLink = elem.down('.gc_thumb');
                var image = elem.down('.gc_thumb img');
                var descriptionLink = elem.down('.gc_desc');
                var picIcon = elem.down('.pic_btn');
                var id = elem.id.replace('gc_', '');
                
                if(this.recycleElements) {
                    this.cells.push(
                        new Ss.image.Cell({
                            index: index,
                            elements: {
                                container: elem,
                                content: content,
                                imageLink: imageLink,
                                image: image,
                                descriptionLink: descriptionLink,
                                picIcon: picIcon
                            },
                            id: id
                        })
                    );
                }
            }.bind(this));
    },

    update: function(response) {
        if(this.recycleElements) {
            this.cells.each(
                function(cell, i) {
                    var result = response.results[i];
                    result ? cell.update(result) : cell.clear();
                }
            );
        } else {
            this.element.innerHTML = this.getHTML(response.results);
        }
    },
    
    getHTML: function(results) {
		var output = [], result, id, href;
		for(var i=0, len=results.length; i<len; i++) {
			result = results[i];
			id = result.id;
			href = result.photo_detail_link;
			output.push('<div class="gc" id="gc_' + id + '">');
			output.push('    <div data-id="' + id + '">');
			output.push('        <a class="gc_thumb" href="'+ href + '" style="height: ' + result.thumb_height + 'px; width: ' + result.thumb_width +'px;">');
			output.push('            <img src="' + result.thumb_url + '" />')
			output.push('        </a>');
			output.push('        <a class="gc_desc" href="' + href + '">')
			output.push(result.display_description);
			output.push('        </a>');
			output.push('        <div class="gc_btns">');
			output.push('            <a class="lbx_btn" title="' + Ss.search.text.lightbox + '"></a>');
			output.push('            <a class="pic_btn" title="' + Ss.search.text.download + '" href="' + href + '"></a>');
			output.push('        </div>');
			output.push('    </div>');
			output.push('</div>');
		}
		return output.join('');
    },
    
    handleLightboxClicks: function() {
        if(!Object.isElement(this.element)) {
            return;
        }
        this.element.delegateClick('.lbx_btn', function(evt) {
            var cell = Event.findElement(evt, '.gc>div, .mosaic_cell');
            var placeholder;
            var photoId;
            var isMosaic = Ss.image.mosaic.isActive();
            
            if(!Object.isElement(cell)) {
                return;
            }
            
            Event.stop(evt);

            photoId = cell.getAttribute('data-id');
            

            dropdownDialogShowing = true;
            selectedPhotoId = photoId;
            

            placeholder = isMosaic ? cell : cell.down('.gc_btns');
            

            placeholder.insert(Ss.Lightbox.multipleAdder.getPulldown().getElement());
            Ss.Lightbox.multipleAdder.getPulldown().expand();
            

            if(Ss.user.loggedIn) {
                Ss.Lightbox.multipleAdder.refresh(getAllLightboxes());
            }
        });
    },
    
    writeDescriptions: function() {
		this.element.select('.gc_desc').each(
			function(desc) {
				if(desc.title && !desc.title.empty()) {
					desc.update(desc.title);
					desc.title = '';
				}
			}
		);
    },
    
    showDescriptions: function() {
        this.element.addClassName('descriptions_on');
        this.writeDescriptions();
    },

    hideDescriptions: function() {
    	this.element.removeClassName('descriptions_on');
    },
    
    toggleDescriptions: function(showOrHide) {
        if(Object.isUndefined(showOrHide)) {
            showOrHide = !this.hasDescriptions();
        }

        if(showOrHide) {
            this.showDescriptions();
        } else {
            this.hideDescriptions();
        }
    },

    hasDescriptions: function() {
    	return this.element.hasClassName('descriptions_on')
    }
    
};

Ss.image.Cell = Class.create({
        
        initialize: function(args) {
            this.index = args.index;
            this.elements = args.elements;
            
            this.elements.image.onload = function(evt) {
            	this.setStyle({
            			visibility: 'visible'
            	});
            };
        },
        
        update: function(result) {
        	

            var container = this.elements.container;
            var content = this.elements.content;
            var imageLink = this.elements.imageLink;
            var image = this.elements.image;
            var descriptionLink = this.elements.descriptionLink;
            var picIcon = this.elements.picIcon;


            if(image.src === result.thumb_url) {
                return;
            }
        	
            container.id = 'gc_' + result.id; 

            content.setAttribute('data-id', result.id)
            

            imageLink.style.cssText = 'width: ' + result.thumb_width + 'px; ' + 'height: ' + result.thumb_height + 'px';
            

            image.setStyle({
            		visibility: 'hidden'
            });
            

            image.src = result.thumb_url;
            


            image.alt = '';
            

            descriptionLink.innerHTML = result.display_description;
            

            picIcon.href = imageLink.href = descriptionLink.href = result.photo_detail_link;
            

            !container.visible() && container.show();
            
        },
        
        clear: function() {
            this.elements.container.hide();
        }
        
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/grid.js'

// global.js: begin JavaScript file: '/js/image/mosaic/mosaic.js'
// ================================================================================
Ss = window.Ss || {};
Ss.image = Ss.image || {};

Ss.image.mosaic = {
    
    options: {
        margin: 3,
        size: 280,
        border: 1
    },
    
    constraints: {
        minWidth: 150,
        maxWidth: 310,
        tolerance: 0.20,
        minHeight: 135
    },
    
	initialize: function(args) {
		this.element = args.element;
		this.grid = new Ss.image.mosaic.Grid();
		
		this._events();
	},

	isActive: function() {
	    return Ss.search.thumbSize && Ss.search.thumbSize == 'mosaic';
	},

	update: function(images) {
		if (!Object.isArray(images) || !images.length) {
			return;
		}
		images.each(function(image){
            image.width = image.width || image.thumb_width;
            image.height = image.height || image.thumb_height;
		});
		this.rows = this.grid.create(images, this.options, this.constraints);
		this.element.update(this.makeHTML(this.rows));
		this.images = images;
	},

	layout: function(targetWidth) {
        var mosaic = Ss.image.mosaic;
	    targetWidth = (Object.isNumber(targetWidth) ? targetWidth : mosaic.element.getWidth());
        if(!targetWidth || mosaic.grid.getWidth() == targetWidth) {
            return;    
        }
        mosaic.grid.setWidth(targetWidth); 
        mosaic._layout();
	},

	_layout: function() {
	    var cells = this.readCells();
	    var rows = this.grid.create(cells, this.options, this.constraints);
	    
        rows.flatten().each(function(cell){
            var top = '';
            if(cell.data.type == 'maxWidth') {
                top = Math.floor((cell.data.containerHeight - cell.data.height)/2) + 'px';
            }
            cell.elements.clipper.setStyle({
                'width': Math.floor(cell.data.width) + 'px',
                'height': Math.floor(cell.data.height) + 'px',
                'top': top
            });
            cell.elements.anchor.setStyle({
                'width': Math.floor(cell.data.containerWidth) + 'px',
                'height': Math.floor(cell.data.containerHeight) + 'px'
            });
        });
	},

	readCells: function() {
	    return this.element.select('.mosaic_cell').map(function(cell){
            return {
                width: parseInt(cell.getAttribute('data-width')),
                height: parseInt(cell.getAttribute('data-height')),
                aspect: cell.getAttribute('data-aspect'),
                elements: {
                    anchor: cell.down('a'),
                    clipper: cell.down('.gc_clip')
                }
            };
	    });
	},
	
    makeHTML: function(rows) {
        var html = [];
    
        rows.flatten().each(function(image) {
            var clipperStyles = [
                 'width:' + Math.floor(image.data.width) + 'px',
                 'height:' + Math.floor(image.data.height) + 'px'
            ];
            var containerStyles = [
                'width:' + Math.floor(image.data.containerWidth) + 'px',
                'height:' + Math.floor(image.data.containerHeight) + 'px'
            ];
            if(image.data.type == 'maxWidth') {
                var vCenter = Math.floor( (image.data.containerHeight - image.data.height) / 2);
                clipperStyles.push('top:' + vCenter + 'px');
            }
            
            html.push('<div class="mosaic_cell" data-id="' + image.id + '" data-width="' + image.width + '" data-height="' + image.height + '" data-aspect="' + image.aspect + '">');
            html.push('    <a href="' + image.photo_detail_link + '" style="' + containerStyles.join(';') + '">');
            html.push('        <span class="gc_clip" style="' + clipperStyles.join(';') + '">')
            html.push('            <img src="' + image.thumb_url + '" alt="' + (image.full_description || '') + '" />');
            html.push('        </span>');
            html.push('        <span class="gc_desc">' + image.display_description + '</span>');
            html.push('        <span class="gc_btns">');
            html.push('            <span class="lbx_btn"></span>');
            html.push('            <span class="pic_btn"></span>');
            html.push('        </span>');
            html.push('    </a>');
            html.push('</div>');
         });
        return html.join('');
    },

    _resize: function() {
        this.layout(this.element.getWidth());
    },

	_events: function() {
	    (function(){
            Event.observe(window, 'resize', function(evt) {
                Ss.image.mosaic._resize();
            });
		}).defer();

        var _tid;
        Event.observe(window, 'scroll', function(evt) {
            if(_tid) {
                window.clearTimeout(_tid);
            }
            if(!document.body.hasClassName('scrolling')) {
                document.body.addClassName('scrolling');
            }
            _tid = window.setTimeout(function() {
                var f = function(evt) {
                    document.body.removeClassName('scrolling');
                    document.stopObserving('mousemove', f);
                };
                document.observe('mousemove', f);
            }, 1000);
        });
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/mosaic.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Grid.js'
// ================================================================================
Ss.image.mosaic.Grid = Class.create({

    initialize: function() {

    },

    setWidth: function(width) {
        this.width = width;
    },

    getWidth: function() {
        return this.width;
    },

    create: function(images, options, constraints) {
        var instance = this;
        




        this._scale(images, options.size);
        
        var rows = [ new Ss.image.mosaic.Row(instance.width, options, constraints) ];
        images.each( 
            function(image, i) {
                var fits = rows.last().addImage(image);
                if(!fits) {
                    rows.push(new Ss.image.mosaic.Row(instance.width, options, constraints));
                    rows.last().addImage(image);
                }
            }
        );
        return rows.map(
            function(row) {
                return row.getImages();
            }
        );
    },





	_scale: function(images, size) {
        if(images[0].width == size || images[0].height == size) {
            return;
        }
        var scale = size/450;
        images.each(function(image) {
            image.width *= scale;
            image.height *= scale;
        });
	    return images;
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Grid.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Row.js'
// ================================================================================
Ss.image.mosaic.Row = Class.create({

    initialize: function(width, options, constraints) {
        this.width = width;
        this.margin = options.margin || 5;
        this.border = options.border || 0;
        this.size = options.size;
        this.constraints = constraints;
        
        this.images = [];
        this.height = null;
    },

    getImages: function() {
        return this.images;
    },

    getImagesByType: function() {
        return this.images.inject({}, function(types, image) {
            if(image.data) {
                types[image.data.type] = types[image.data.type] || [];
                types[image.data.type].push(image);
            }
            return types;
        });
    },

    addImage: function(image) {


        if(!this.hasRemainingPixels()) {
            this.setWidth(this.numUsablePixels()); 
            return false;
        }
        

        this.images.push(image);


        this.setHeight(this._calculateHeight());


        this._handleMinorConstraintViolations();


        if(!this.hasRemainingPixels()) {
            this.setWidth(this.numUsablePixels());    
        }
        return true;
    },                           

    setHeight: function(height, setContainers) {
        this.height = height;
        var constraints = this.constraints;
        var cells = this.images.map(function(image){
            return new Ss.image.mosaic.Cell(image, constraints);
        });
        return cells.invoke('setHeight', height, setContainers);
    },


    setWidth: function(width) {


        var rowHeight = width/this.numUsedPixels() * this.height;
        this.setHeight(rowHeight, true);
        this._fixRoundingError(width);
    },

    numUsedPixels: function() {
        return Ss.util.sum(this.images.pluck('data'), 'containerWidth');
    },

    numUsablePixels: function() {
        return this.width - this.numUnusablePixels();
    },

    numUnusablePixels: function() {
        return (this.margin * 2 + this.border * 2) * this.images.length;
    },
    
    numRemainingPixels: function() {
        return this.numUsablePixels() - this.numUsedPixels();
    },
    
    hasRemainingPixels: function() {
        return this.numRemainingPixels() > 0;
    },

    _calculateHeight: function() {

        var rowHeight = Ss.util.avg(this.images, 'height');
        

        var types = this.getImagesByType();
        

        if(types.maxWidth) {
            var candidates = [];
            $H(types).each(function(type){
                if(type.key != 'maxWidth') {
                    candidates = candidates.concat(type.value);
                }
            });
            if(candidates.length) {
                rowHeight = Ss.util.avg(candidates, 'height');
            }
        }
        

        if(this.constraints.minHeight) {
            return Math.max(rowHeight, this.constraints.minHeight);
        }

        return rowHeight;
    },
    

    _handleMinorConstraintViolations: function() {
        var types = this.getImagesByType();



        if(types.minWidthMinor) {

            var optimalHeight = types.minWidthMinor.pluck('data').pluck('optimalHeight').max();


            this.setHeight(optimalHeight);



            var newTypes = this.getImagesByType();
            if(types.maxWidth && newTypes.maxWidth && newTypes.maxWidth.length <= types.maxWidth.length) {
                this.height = optimalHeight;
                types = newTypes;
            } else {
                this.setHeight(this.height);
            }
        }



        if(types.maxWidthMinor) {
            types.maxWidthMinor.each(
                function(image){
                    image.data.width = image.data.containerWidth = image.data.optimalWidth;
                    image.data.height = image.data.containerHeight = image.data.optimalHeight;
                }
            );
        }
        
    },

    _fixRoundingError: function(width) {
        var error = this.numUsedPixels() - width;
        var errorPerImage = error/this.images.length;
        var accumulatedError = 0;
        var rounded;
        if(!error) {
            return;
        }
        this.images.each(
            function(image) {
                accumulatedError += errorPerImage;
                rounded = Math.round(accumulatedError);
                image.data.containerWidth -= rounded;
                if(image.data.width > image.data.containerWidth) {
                    image.data.width = image.data.containerWidth;
                    image.data.height = image.data.width * 1 / image.aspect;
                }
                accumulatedError -= rounded;
            }
        );
    }

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Row.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Cell.js'
// ================================================================================
Ss.image.mosaic.Cell = Class.create({

	initialize: function(image, constraints) {
		this.image = image;
        this.constraints = constraints;
	},

	setHeight: function(height, setContainers) {
		var image = this.image;
        var constraints = this.constraints;
        var aspect = image.aspect;
        var newImageWidth = height * aspect;
        var newImageHeight, optimalHeight, optimalWidth, newContainerWidth;

        if(newImageWidth > constraints.maxWidth) { // too wide
            if(setContainers) {
                newContainerWidth = height * (image.data.containerWidth/image.data.containerHeight);
                image.data = {
                    type: 'maxWidth',
                    width: newContainerWidth,
                    height: newContainerWidth * 1 / aspect,
                    containerWidth: newContainerWidth,
                    containerHeight: height
                };
            } else {
                newImageWidth = constraints.maxWidth;
                newImageHeight = newImageWidth * 1 / aspect;
                error = (height - newImageHeight) / height;
                optimalHeight = height;
                optimalWidth = optimalHeight * aspect;
                image.data = {
                    type: (error < constraints.tolerance ? 'maxWidthMinor' : 'maxWidth'),
                    width: newImageWidth,
                    height: newImageHeight,
                    containerWidth: newImageWidth,
                    containerHeight: height,
                    optimalWidth: optimalWidth,
                    optimalHeight: optimalHeight
                };
            }
        } else if(newImageWidth < constraints.minWidth) { // too narrow
            error = (constraints.minWidth - newImageWidth) / constraints.minWidth;
            optimalWidth = constraints.minWidth + constraints.minWidth * error;
            optimalHeight = optimalWidth * 1 / aspect;
            image.data = {
                type: (error < constraints.tolerance ? 'minWidthMinor' : 'minWidth'),
                width: newImageWidth,
                height: height,
                containerWidth: constraints.minWidth,
                containerHeight: height,
                optimalWidth: optimalWidth,
                optimalHeight: optimalHeight
            };
        } else { // normal case
            image.data = {
                type: 'success',
                containerWidth: newImageWidth,
                containerHeight: height,
                width: newImageWidth,
                height: height
            };
        }
        return image;
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Cell.js'

// global.js: begin JavaScript file: '/js/instant/client.js'
// ================================================================================
Ss = window.Ss || {};
Ss.instant = {};
Ss.instant.client = {
	
	SIZES: {
	    mosaic: {
		    scale: 280/150,
		    name: 'display_pic_with_logo'
	    },
	    large: {
		    scale: 1,
		    name: 'thumb_large'
	    },
	    small: {
		    scale: 100/150,
		    name: 'thumb_small'
	    }
	},
	
	cb: null,
	
	get: function(params, cb) {
		params = Object.extend({
		    mt: 'all',
		    thumb_size: 'mosaic',
            ns: 'ss50', //  for ss50 50 results, 'shutterstock' for 20 results
            wrap: 'Ss.instant.client.cb',
            m: 1
		}, params || {});
		
		if(!params.kw) {
			throw 'Keyword Required';
		}
		if(!this.SIZES[params.thumb_size]) {
			throw 'invalid thumb size';
		}
		var size = this.SIZES[params['thumb_size']];
		this.cb = function(response) {
			var results = [];
			var related = [];
			var obj = {};
			if(
			   Object.isArray(response) && 
			   Object.isArray(response[1]) && 
			   Object.isArray(response[1][0]) && 
			   response[1][0][0] == ''
			){
				obj = response[1][0][1];
				results = obj['instant_results'].map(function(enc){
				    var id = enc[0];
				    var width = enc[2] * size.scale;
				    var height = enc[3] * size.scale;
				    var thumbURL = _getThumbURL(enc, size.name);
				    return {
                        photo_detail_link: '/pic-' + id + '.html',
                        id: id,
                        aspect: width/height,
                        thumb_width: width,
                        thumb_height: height,
                        display_description: "",
                        thumb_url: thumbURL
				    }
				});
				if(Object.isArray(obj['related'])) {
				    related = obj['related'].map(function(obj){
				        return Object.keys(obj).first();
				    });
				}
			}
			cb({
			    page: 1,
			    results: results,
			    searchSrcID: '',
			    num_results: obj['num_results'],
			    related: related,
                params: params
			});
		};
		var scr = document.createElement('script');
		scr.src = 'http://instantsearch.shutterstock.com/ac/' + params.kw + '?' + Object.toQueryString(params);
		$$('head')[0].insert(scr);
		function _getThumbURL (enc, size) {
			var photoFilename = function(id, filename) {
				filename = filename.replace(/\@/, id);
				filename = filename.replace(/(\d+)&/, '$1/$1');
				return filename;
			};
			var getHostFromFilename = function(filename) {
				var thumbServers = ['thumb1.shutterstock.com', 'thumb7.shutterstock.com', 'thumb9.shutterstock.com', 'thumb10.shutterstock.com' ];
				var match = filename.match(/.*(\d{1,3})/);
				var key = ( match ? parseInt(match[1]) : 0 );
				host = thumbServers[ key % thumbServers.length ];
				return host;
			};
			var filename = photoFilename(enc[0], enc[1]);
			var host = getHostFromFilename(filename);
			return 'http://' + host + '/' + size + '/' + filename + '/' + enc[0] + '.jpg';
		}
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/instant/client.js'

// global.js: begin JavaScript file: '/js/pic/pic.js'
// ================================================================================
Ss = window.Ss || {};

Ss.pic = {
    
	initDownloadOptions: function() {
		var tabs = $$('#file_type_tabs li'),
			rows = $$('#photo_download_options tr'),
			forms = $$('#photo_download_options .size_form'),
			selectRow = function(row) {
				rows.invoke('removeClassName', 'selected');
				row.addClassName('selected');
				row.select('input[type=radio]').first().checked = true;
			};
			


		tabs.invoke('observe', 'click', function(evt) {
			var fileType = this.id.replace('file_type_',''); // parse the file type
			var form =  $('size_form_' + fileType); // use it to get the id of the form (via naming convention)
			var rows = form.select('tr');  // grab all of the rows
			

			var selectedRow = rows.find(
				function(row) {
					return row.down('input[type=radio]').checked;
				}
			);
			
			tabs.invoke('removeClassName', 'selected'); // disable all tabs
			forms.invoke('hide'); // hide all forms
			
			$(this).addClassName('selected'); // activate this tab
			form.show(); // show this form
			selectRow(selectedRow); // select the row that contains the selected radio button
		});
		rows.invoke('observe', 'click', function(evt){ selectRow(this); }); //when a row is clicked, select it
	},
	
    attachThumbEvents: function (thumbs) {
		var j, thumb;

		if (j = thumbs.length) {
			while (thumb = thumbs[--j]) {
				Event.observe(thumb, 'mouseover', this.previewThumb);
				Event.observe(thumb, 'mouseout', cancelPreview);
			}
		}
    },

	previewThumb: function (e, descriptionText, cellMax) {
	    
	    var targetImage = Object.isElement(e) ? e : e.target;
	    
	    legacyActiveThumb = targetImage;

	    if (!Object.isElement(legacyActiveThumb)) {
	        return;
	    }

	    setTimeout( function() {
	        if (legacyActiveThumb && legacyActiveThumb.src == targetImage.src) {

	            var container = Element.up(legacyActiveThumb, '.thumb_image_container'); // not using legacyActiveThumb.up() because it won't work in IE9
	           
	            var thumbWidth = parseInt(legacyActiveThumb.getAttribute("data-width"), 10);
	            var thumbHeight = parseInt(legacyActiveThumb.getAttribute("data-height"), 10);

	            var previewThumbSrc = legacyActiveThumb.src.replace(/\/thumb_(small|large)\//, '/display_pic_with_logo/');
	            
	            if (!previewThumbSrc.match(/https?:\/\/[^\/]+\/photos\//ig)) {
	                /* we are using seo optimized photo url, we can use image.shutterstock.com */
	                previewThumbSrc = previewThumbSrc.replace(/(https?:\/\/)([^\/]+)/,'$1' + 'image.shutterstock.com');
	            }
	            var fakeResultSlot = {
	                elements: {
	                    container: container,
	                    thumb: legacyActiveThumb
	                },
	                getDimensions: function(maxDimensionPixels) {
	                    
	                    var multiplier = maxDimensionPixels / Math.max(thumbWidth, thumbHeight);
	                    return { 
	                        width: thumbWidth * multiplier, 
	                        height: thumbHeight * multiplier
	                    };
	                },
	                result: {
	                    aspect_ratio: (thumbWidth / thumbHeight)
	                },
	                previewThumbSrc: previewThumbSrc
	            };

	            if (window.resultPreview) {
	                var lightboxContainer = document.getElementById('lightbox-contents-table');
	                var lightboxFixedAncestor = document.getElementById('lightbox-preview-container');
	                var fixedContainer = lightboxContainer && Element.extend(legacyActiveThumb).descendantOf(lightboxContainer) ? lightboxContainer: null;
	                resultPreview.populate( { resultSlot: fakeResultSlot, fixedContainer: fixedContainer, fixedAncestor: lightboxFixedAncestor, descriptionText: descriptionText, cellMax: cellMax } );
	                resultPreview.show();
	            }
	        }
	    }, 150);
	}
	
};



Object.extend(Ss.pic, {

    _subscribers: {},
        
    container: null,
    
    setContainer: function(container) {
        this.container = container;
    },
    
    getContainer: function() {
        return this.container;
    },
    
    show: function() {


        Ss.search.hide();
        this.container.show();


        document.body.scrollTo(); 
                 

        document.body.removeClassName('search_results');
        document.body.addClassName('photo_detail');


        this._publish('show');
    },
    
    hide: function() {
        this.container.hide();
    },

    update: function(response) {


        this.container.update(response.responseText);
        

        this.show();


        this._publish('update', response);
    },

    subscribe: function(type, f) {
        if(!Object.isString(type) || !Object.isFunction(f)) {
            throw 'type (String) and f (Function) required';
        }
        this._subscribers[type] = this._subscribers[type] || [];
        this._subscribers[type].push(f);
    },
    
    handlePopstate: function() {
        Ss.search.history.observePopstate(
            function(evt){
                var container = Ss.pic.getContainer();
                if(evt.state && evt.state.parameters.id && evt.state.responseText && Object.isElement(container)) {
                    container.update(evt.state.responseText);
                } else {
                    location.reload();
                }
            }
        );
    },

    _publish: function(type, evt) {
        if(!Object.isString(type) || 
            !Object.isArray(this._subscribers[type]) || 
            !this._subscribers[type].length) {
            return;
        }
        evt = evt || {};
        evt.type = type;
        this._subscribers[type].each(function(f){
            try { f(evt); } 
            catch(e) { }
        });
    }
	
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/pic/pic.js'

// global.js: begin JavaScript file: '/js/pic/client.js'
// ================================================================================
Ss.pic.client = {

	_params: {},
	
	_cache: {},
	
	setParam: function(key, value) {
	    this._params[key] = value;
	},
	
	getParams: function() {
	    return Object.extend({
            'component_path': 'pic.mhtml',
            'time': new Date().getTime()
	    }, this._params);
	},
	
    execute: function(parameters, callback) {
        if(!parameters || !parameters.id || !Object.isFunction(callback)) {
            throw 'photo id parameter and callback required';
        }
        

        Object.extend(parameters, this.getParams());
        
        var cached = this._cache[parameters.id];
        if(cached) {
            callback(cached);
            return;
        }
        
        var transport = new Ajax.Request('/show_component.mhtml', {
            method: 'GET',
            parameters: parameters,
            evalScripts: true,
            onSuccess: function(response) {
                var _response = { 
                    'parameters': parameters,
                    'responseText': response.responseText
                };
                Ss.pic.client._cache[parameters.id] = _response;
                callback(_response);
            },
            onFailure: function() {
                alert($t('DYNAMIC_RESULTS_ERROR_PHOTO_DETAILS', "Unfortunately there was a technical error getting details about this photo"));
            }
        });
        
        return transport;
    }
    
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/pic/client.js'

// global.js: begin JavaScript file: '/js/feedback/FeedbackForm.js'
// ================================================================================
Ss.FeedbackForm = Class.create({
		initialize: function(container) {
			
			if(!Object.isElement(container)) {
				throw 'form container required.';
			}
			
			this.elements = {
				container: container,
				form: container.down('form'),
				textarea: container.down('textarea'),
				label: container.down('label.placeholder'),
				placeholder_span: container.down('span.placeholder_span'),
				placeholderText: null
			};
			
			if(!Object.isElement(this.elements.form)) {
				throw 'form required.';
			}
			
			this._events();
			

			Ss.FlyoutLayer.write(container);
		},
		
		enable: function() {
			this.elements.container.removeClassName('feedback_form_disabled');
			/* IE9 didn't like the select using a comma for both so I've seperated it out -fcrow */
			this.elements.container.select('textarea').invoke('enable');
			this.elements.container.select('input[type=radio]').invoke('enable');
		},
		
		disable: function() {
			this.elements.container.addClassName('feedback_form_disabled');
			/* IE9 didn't like the select using a comma for both so I've seperated it out -fcrow */
			this.elements.container.select('textarea').invoke('disable');
			this.elements.container.select('input[type=radio]').invoke('disable');
		},
		
		isDisabled: function() {
			return this.elements.container.hasClassName('feedback_form_disabled');
		},
		
		showThanks: function() {
			this.elements.container.down('.feedback_thanks').show();
		},
		
		hideThanks: function() {
			this.elements.container.down('.feedback_thanks').hide();
		},
		
		clear: function() {
			this.elements.textarea.clear();
			this.elements.textarea.setAttribute('placeholder', '');
			this.elements.container.select('input[type=radio]').each( function(radio) { radio.checked = false; } );
		},
		
		reset: function() {
			this.hideThanks();
			this.clear();
			this.enable();
		},
		
		_events: function() {
			var feedbackForm = this,
				form = this.elements.form,
				textarea = this.elements.textarea;
			
			var reset = function(evt) {
				if(evt && evt.type == 'close') {
					feedbackForm.reset();
					Ss.FlyoutLayer.unsubscribeObserver(reset);
				}
			};
			
			form.observe('submit', function(evt) {





					if(evt.preventDefault) {
						evt.preventDefault();
					} 
					if(evt.returnValue) {
						evt.returnValue = false;
					} 
					if(window.event) {
						window.event.returnValue = false;
					}
					
					if(feedbackForm.isDisabled()) {
						return;
					}
					
					form.request({ method: 'POST' });
					



					feedbackForm.showThanks();
					

					Ss.FlyoutLayer.subscribeObserver(reset);
					

					feedbackForm.disable();
					

					(function(){
						if(Ss.FlyoutLayer.isOpen()) {
							Ss.FlyoutLayer.close();
						}
					}).delay(3);
			});
			
			form.select('input[type=radio]').invoke('observe', 'click', function(evt) {
				var value = $F(this), 
					placeholderInput = $$('input[name=default_' + value + ']')[0], 
					placeholderText = '';

				if (placeholderInput) {
					placeholderText = $F(placeholderInput);
				}
				
				form.select('label.placeholder span.placeholder_span')[0].update(placeholderText);
				
				if(!feedbackForm.placeholderText){
					feedbackForm.placeholderText = new Ss.input.InFieldLabel({
						   label: form.select('label.placeholder span.placeholder_span')[0],
						   field: form.select('textarea')[0]
					});
				}   
			});
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/feedback/FeedbackForm.js'

// global.js: begin JavaScript file: '/js/Autocompleter.js'
// ================================================================================
/*
    script.aculo.us controls.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010
    
    Copyright (c) 2005-2010 Thomas Fuchs (http:script.aculo.us, http:mir.aculo.us)
           (c) 2005-2010 Ivan Krstic (http:blogs.law.harvard.edu/ivan)
           (c) 2005-2010 Jon Tirsen (http:www.tirsen.com)
    Contributors:
        Richard Livsey
        Rahul Bhargava
        Rob Wills
    
    script.aculo.us is freely distributable under the terms of an MIT-style license.
    For details, see the script.aculo.us web site: http:script.aculo.us/
    
    Autocompleter.Base handles all the autocompletion functionality
    that's independent of the data source for autocompletion. This
    includes drawing the autocompletion menu, observing keyboard
    and mouse events, and similar.
    
    Specific autocompleters need to provide, at the very least,
    a getUpdatedChoices function that will be invoked every time
    the text inside the monitored textbox changes. This method
    should get the text for which to provide autocompletion by
    invoking this.getValue()
    Specific auto-completion logic (AJAX, etc) belongs in getUpdatedChoices.
    
    Removed Features: Tokenization support, Ajax support (esmiling)
    
    Add extra key codes
*/

Object.extend(Event, {
  KEY_SHIFT:    16,
  KEY_CTRL:     17,
  KEY_ALT:      18,
  KEY_CMD:      91
});

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    this.noChangeKeys = [
      Event.KEY_TAB,
      Event.KEY_RETURN,
      Event.KEY_ESC,
      Event.KEY_LEFT,
      Event.KEY_UP,
      Event.KEY_RIGHT,
      Event.KEY_DOWN,
      Event.KEY_PAGEUP,
      Event.KEY_HOME,
      Event.KEY_END,
      Event.KEY_PAGEDOWN,
      Event.KEY_INSERT,
      Event.KEY_ALT,
      Event.KEY_CTRL,
      Event.KEY_SHIFT,
      Event.KEY_CMD
    ];

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.frequency    = 0;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!$(update).style.position || $(update).style.position=='absolute') {
          $(update).style.position = 'absolute';
          Position.clone(element, $(update), {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        $(update).show();
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ update.hide() };

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(window, 'resize', function(){
	if(this.oldElementValue != '' && this.hasFocus == true){
		this.options.onShow(element, update);
	}
    }.bind(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  fireKeydown: function(event) {
    this.element.focus();
    if(this.element.value.strip()) {
        this.element.value += ' ';
    }
    this.onKeyPress.bind(this).defer(event);
  },
  
  onKeyPress: function(event) {
    if(this.active) {
      this.changed = true;
      switch(event.keyCode) {
       case Event.KEY_RETURN:
         this.selectEntry();
         this.hide();
         return;
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_TAB:
         this.onTab(event);
         Event.stop(event);
         return;
      }
    } else {
      try{
          if(this.noChangeKeys.member(event.keyCode) ||
            (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) {
            return;
          } else {
            this.changed = true;
          }
      } catch(e) {
      }
    }
    this.hasFocus = true;
    if(this.observer) { clearTimeout(this.observer); }
    this.observer =
      setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onTab: function(event) {
      var index = Math.max(this.index, 0);
      var entry = this.getEntry(index);
      this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },
  
  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {

    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) {
        this.index--;
    } else {
        this.index = this.entryCount-1;
    }
    var entry = this.getEntry(this.index);
    entry.scrollIntoView(false);
    this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },

  markNext: function() {
    if(this.index < this.entryCount-1) {
        this.index++;
    } else {
        this.index = 0;
    }
    var entry = this.getEntry(this.index);
    entry.scrollIntoView(false);
    this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },

  getEntry: function(index) {
    if(index < 0) {
      return;
    }
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    var currentEntry = this.getCurrentEntry();
    this.active = false;
    if (currentEntry !== undefined) {
      this.updateElement(currentEntry);
      currentEntry.fire('Autocompleter:selectEntry');
    }
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');
    this.element.value = value;
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement) {
      this.options.afterUpdateElement(this.element, selectedElement);
    }
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = -1;
      this.render();
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    if(this.getValue().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getValue: function() {
    return this.element.value.strip();
  }

});


/*
    This is the Shutterstock-specific/Local Autocompleter. It extends the base.
    
    The constructor takes four parameters. The first two are, as usual,
    the textbox, and the autocompletion menu.
    The third is the array you want to autocomplete from, and the fourth
    is the options block.
*/

Autocompleter.Local = Class.create(Autocompleter.Base, {
    initialize: function(element, update, options) {
        this.url = "http://autocomplete.shutterstock.com/ac?version=fuzzy";
        this.element = element;
        this.currentValue = this.getValue();
        this.choices = [];
        this.headNode = $$("head")[0];
        this.baseInitialize(element, update, options);
    },

    setOptions: function(options) {
        var instance = this;
        this.options = Object.extend({
            language: options.language || 'en',
            formatChoices: function() {
                var beginMatches = [];
                var insideMatches = [];
                var entry = instance.getValue();
                var choices = instance.choices;
                var maxChoices = 10;
                
                for (var i = 0; i < choices.length && beginMatches.length < maxChoices; i++) {
                    var choice = choices[i];
                    var foundPos = choice.toLowerCase().indexOf(entry.toLowerCase());
                    if (foundPos == -1) { 
                        beginMatches.push('<li><strong>' + choice + '</strong></li>');
                    }
                    else if (foundPos == 0 && choice.length != entry.length) {
                        beginMatches.push("<li>" + choice.substr(0, entry.length) + "<strong>" + choice.substr(entry.length) + "</strong></li>");
                    }
                }
                if (insideMatches.length) {
                    beginMatches = beginMatches.concat(insideMatches.slice(0, maxChoices - beginMatches.length));
                }
                return "<ul>" + beginMatches.join('') + "</ul>";
            }
        }, options || { });
    },
    

    processChoices: function (choices) {
        this.choices = [];
        if (choices[0].toLowerCase() !== this.currentValue.toLowerCase()) {
            return;
        }

        if (choices[1]) {
            this.choices = choices[1].findAll(function(s) {
                return s.length;
            }).invoke('first');
        }
        this.updateChoices(this.options.formatChoices());
    },
    
	selectEntry: function($super) {
		$super();
		window.Ss.tracker.logEvent('click', { element_id: "autocomplete_suggestion_selected", input_value: this.element.value });
	},
	
    getUpdatedChoices: function() {

        var script = document.createElement('script');
        var base = this.url.split('?')[0];
        var params = this.url.toQueryParams();
        var url;
        var value = this.element.value;
        
        Object.extend(params, {
            'q': value,
            'language': this.options.language
        });
        url = base + '?' + Object.toQueryString(params);
        script.type = 'text/javascript';
        script.src = url
        this.currentValue = value;
        this.headNode.appendChild(script);
    }
	
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Autocompleter.js'

// global.js: begin JavaScript file: '/js/suggest.js'
// ================================================================================
Ss = window.Ss || {};




Ss.suggest = {
    
    instances: [],
    
    create: function(args) {
        if(!Object.isElement(args.input) || !Object.isElement(args.layer)) {
            throw 'input[Element] and layer[Element] options are required';
        }
        var form = args.input.up('form');
        var autocompleter = new Autocompleter.Local(args.input, args.layer, { language: this.autocompleteLanguage(args.language) });
        this.instances.push(autocompleter);
        



        document.observe('Autocompleter:selectEntry', function(evt) {
           form.submit();
        });
        
        if(args.focusOnKeydown) {
            this.focusOnKeydown(autocompleter);
        }
        
        return autocompleter;
    },


    autocompleteLanguage: function(language) {
        var defaultEnAutocompleter = {

            'th': 1,
            'ko': 1
        };
        return defaultEnAutocompleter[language] ? 'en' : language;
    },
    
    processSuggestion: function(choices) {
        this.instances.invoke('processChoices', choices);
    },
    
    focusOnKeydown: function(autocompleter) {



        var textInput = autocompleter.element;
        var isHidden = function(element) {
            var dimensions = element.getDimensions();
            return (!element.visible() || dimensions.width <= 0 || dimensions.height <= 0);
        };
        Event.observe(document, 'keydown', function(evt) {
            var nodeName = evt.target.nodeName;
            var keyCode = evt.keyCode || evt.which;
            var isLetterKey = keyCode >= 65 && keyCode <= 90;
            var hasModifierKey = evt.ctrlKey || evt.altKey || evt.shiftKey || evt.metaKey;
            if(isHidden(textInput)) {
                return;
            }
            if(nodeName.match(/INPUT|TEXTAREA/i)) {
                return;
            }
            if(!isLetterKey || hasModifierKey) {
                return;
            }
            
            autocompleter.fireKeydown(evt);
        });
    }
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/suggest.js'

// global.js: begin JavaScript file: '/js/Anim.js'
// ================================================================================
(function(ns){
   ns.Anim = {};
   ns.Anim = function(set, duration, interval, callback, easing){
	    this.set = set;
		this.increment = 1 / (duration / interval);
		this.callback = callback || null;
		this.interval = interval || 30;
		this.easing = easing || ns.Anim.easing.in_out;
		this.val = 0;
		this._stop = null;
		this._timeout = null;
   };

   ns.Anim.easing = {
		'in': function (t) {
			return t*t;
		},
		'out': function (t) {
			return -1*t*(t-2);
		},
		'in_out': function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t;
			return -1/2 * ((--t)*(t-2) - 1);
		},
		'none': function(t){ return t; }
   };

   ns.Anim.prototype = {
		start: function(){ this._run()},
		stop: function(){ this._stop = true;},
	    _run: function(){
		     var self = this;
			 if(this._stop){
				 this._stop = null;
				 return;
			 }
			 var val = this.val + this.increment;
			 var easeval = this.easing(this.val);
			 if(val >= 1){
			   this.set(1);
			   this.val = 1;
			   if(this.callback){ this.callback()}
			 }else{
			   this.set(easeval);
			   this._timeout = setTimeout(function(){ self._run()}, this.interval);
			   this.val = val;
			 }
	   }
   }
})(window);
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Anim.js'

// global.js: begin JavaScript file: '/js/ImagePaginator.js'
// ================================================================================
function ImagePaginator(displayDuration, images){
	var instance = this;

	this.paginator = $('image_paginator');
	this.currentImage;
	this.images = images;
	this.currentIndex = 0;
	this.imagePreloader = new Image();

	this.loadCount = 1;
	this.deleterTimer = null;
	this.loopTimer = null;
	this.displayDuration = displayDuration * 1000;
	
	this.init = function(){
		this.initializePagination();
		this.initializeImages();
	}
	this.initializeImages = function(){
		this.preloadImages();
		this.loadImage(0);
	}
	this.preloadImages = function(){
		Event.observe(window, 'load', function() {
			for(var x=0;x<instance.images.length;x++){
				var tmp = new Image();
				tmp.src = instance.images[x].image_url;
			}
		});
	}
	this.initializePagination = function(){
		var paginator_wrapper = document.createElement('div');
		paginator_wrapper.className = 'paginator_wrapper';
		this.paginator.appendChild(paginator_wrapper);
		
		var html = '';
		for(var x=0;x<this.images.length;x++){
			var classString = (x==this.currentIndex?'pager_selected':'');
			html += '<div class="pager ' + classString + '"></div>';
		}

		paginator_wrapper.innerHTML = html;
		paginator_wrapper.style.marginLeft = - (paginator_wrapper.offsetWidth / 2) + 'px';
		this.setPaginatorEventListeners();
	}
	this.setPaginatorEventListeners = function(){
		$$('#image_paginator .paginator_wrapper .pager').each(function(target,x){
			target.observe('click',function(){
				instance.loadImage(x);
			});
			target.observe('mouseover',function(){
				if(!this.hasClassName('pager_selected'))
					target.addClassName('pager_hover');
			});
			target.observe('mouseout',function(){
				if(!this.hasClassName('pager_selected'))
					target.removeClassName('pager_hover');
			});
		});
	}
	this.updatePageBullets = function(){
		$$('#image_paginator .paginator_wrapper .pager').each(function(target,x){
			if(x == instance.currentIndex){
				target.addClassName('pager_selected');
				target.removeClassName('pager_hover');
			}else{
				target.removeClassName('pager_selected');
				target.removeClassName('pager_hover');
			}
		});
	}
	this.setNextIndex = function(){
		this.currentIndex++;
		if(this.currentIndex >= this.images.length) this.currentIndex = 0;
	}
	this.loadImage = function(idx){

		this.setImagesToDeleter();
		this.stopLoopTimer();
		this.stopDeleterTimer();
		this.currentIndex = idx;
		this.updatePageBullets();
		
		var loadingImage = new Element('IMG');
		loadingImage.addClassName('bgimage');
		loadingImage.src = this.images[idx].image_url;
		loadingImage.setStyle({
			'position': 'absolute',
			left: 0,
			top: 0,
			zIndex: this.loadCount
		});
		loadingImage.setOpacity(0);
		this.paginator.insert(loadingImage);

		this.loadCount++;

		var increment = Prototype.Browser.LTE(9) ? 0.042 : 1 / 60;
        var pe = loadingImage.setStylePeriodically({
           	property:     'opacity',
            endValue:     1,
            increment:    increment,
            units:        '',
            onComplete:   instance.removeDeleterImages,
            startValue:   0,
            interval:     1 / 60
        });
	}
	this.setImagesToDeleter = function(){
		$('image_paginator').select('.bgimage').each(function(target,x){
			target.addClassName('deleter');
		});
	}
	this.removeDeleterImages = function(){
		instance.stopDeleterTimer();
		instance.deleterTimer = setTimeout(function(){
			$$('#image_paginator .deleter').each(function(target,x){
				target.remove();
			});
			

			instance.loadCount = 1;
			$$('#image_paginator .bgimage').each(function(target,x){
				target.style.zIndex = instance.loadCount;
			});
		},1000);
		
		

		instance.stopLoopTimer();
		instance.loopTimer = setTimeout(function(){
			instance.setNextIndex();
			instance.loadImage(instance.currentIndex);
		},instance.displayDuration);
		
	}
	this.stopDeleterTimer = function(){
		clearTimeout(this.deleterTimer);
		this.deleterTimer = null;
	}
	this.stopLoopTimer = function(){
		clearTimeout(this.loopTimer);
		loopTimer = null;
	}
	this.init();
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ImagePaginator.js'

// global.js: begin JavaScript file: '/js/MarketingModule.js'
// ================================================================================
function MarketingModuleRotator(args) {
	var instance = this;
	this.currentPage = 0;
	this.totalPages = 0;
	this.itemsPerPage = 3;
	this.isIE = $('lil_brother').hasClassName('ie');
	this.items = args.items;
	
	this.init = function(){
		this.initializeCalloutRotator();
		this.addEventListeners();
	};
	
	this.initializeCalloutRotator = function(){

		this.getCalloutData();
		this.loadPages();
		

		this.setPage(0);


		var opac = 0;
		if(this.isIpad() || this.isIphone()) opac = 1;
		$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(x){
			x.setOpacity(opac);
		});
	};
	this.loadPages = function(){
		var html = '';
		for (var x=0; x < this.callout_data.items.length; x++) {
			var item = this.callout_data.items[x];
			if (x % this.itemsPerPage === 0)
				html += '<ul class="animate" style="left:' + (x * 100) + '%;">';
			var isLast = ((x % this.itemsPerPage) == (this.itemsPerPage - 1));
			var li_width = Math.floor(100 / this.itemsPerPage - 1);
			var thisId = 'MM_' + x;
			if (((x-1) % 3 === 0) && !this.isIE)
				li_width += 1;

			html += '<li class="' + (isLast ? 'last' : '') + '"id="' + thisId + '" style="width:' + li_width + '%;">';

			if (item.hasContainer)
				html += '<div class="image_wrapper">';
			else
				html += '<div class="none_border_wrapper">';

			var target = item.target ? 'target="' + item.target + '" ' : '';

			var second_line = '<h5>';
			if (!this.callout_data.items[x].no_link_text_anchor) second_line += '<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">';
			second_line += this.callout_data.items[x].link_text;
			if (!this.callout_data.items[x].no_link_text_anchor) second_line += '</a>';
			second_line += '</h5>';
			
			html+='			<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">' +
			' 				<img class="module_image" src="' + this.callout_data.items[x].img_src + '" border="0"/></a>'+
			'			</div>'+
			'		<h4 class="light">' + '<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">' + this.callout_data.items[x].title + '</a></h4>' + second_line +
			'	</li>';
			if(x%this.itemsPerPage == (this.itemsPerPage-1) || x == this.callout_data.items.length-1) html+= '</ul>';
		}

		$('rotation_wrapper').innerHTML = html;


		this.totalPages = $$('#rotation_wrapper ul').length;
		html = '';
		for(var x=0;x<this.totalPages;x++){
			var classString = (x==this.currentPage?'pager_selected':'');
			html += '<div class="pager ' + classString + '"></div>';
		}

		var paginator_wrapper = $$('.callout_wrapper .paginator_wrapper')[0];
		paginator_wrapper.update(html);
		paginator_wrapper.style.marginLeft = - (paginator_wrapper.offsetWidth / 2) + 'px';
	}
	this.addEventListeners = function(){
		var target = $('callout_rotator');

		target.mouseenter(function(e) {
			$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(el) {
				el.setOpacity(1);
			});
		});

		target.mouseleave(function(e) {
			$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(el) {
				el.setOpacity(0);
			});
		});

		$$('#callout_rotator #navigation_wrapper .navigation_arrow').each(function(x){
			x.observe('click',function(target){
				if(this.hasClassName('nav_left')){
					if(instance.currentPage - 1 < 0) instance.currentPage = instance.totalPages;
					instance.setPage(--instance.currentPage);
				}else{
					if(instance.currentPage +1 >= instance.totalPages) instance.currentPage = -1;
					instance.setPage(++instance.currentPage);
				}
			});
			x.observe('mouseover',function(){
				if(this.hasClassName('nav_left')){
					this.style.backgroundPosition = '-2px -126px';
				}else{
					this.style.backgroundPosition = '-2px -46px';
				}
			});
			x.observe('mouseout',function(){
				if(this.hasClassName('nav_left')){
					this.style.backgroundPosition = '-2px -86px';
				}else{
					this.style.backgroundPosition = '-2px -6px';
				}
			});
		});
		$$('.callout_wrapper .paginator_wrapper .pager').each(function(target,x){
			target.observe('click',function(){
				instance.setPage(x);
			});
			target.observe('mouseover',function(){
				if(!this.hasClassName('pager_selected'))
					target.addClassName('pager_hover');
			});
			target.observe('mouseout',function(){
				if(!this.hasClassName('pager_selected'))
					target.removeClassName('pager_hover');
			});
		});
		$$('#callout_rotator .image_wrapper').each(function(target,x){
			target.observe('mouseover',function(){
				this.addClassName('selected');
			});
			target.observe('mouseout',function(){
				this.removeClassName('selected');
			});
		});
	}
	
	/* function to navigate the callout pages */
	this.setPage = function(idx){
		this.currentPage = idx;
		this.setULCoordinates();
		this.updatePaginator();
	}
	this.setULCoordinates = function(){
		$$('#rotation_wrapper ul').each(function(target, x){
			if(target.CSSTransitionsSupported()){
				target.style.left = (x - instance.currentPage) * 100 + '%';
			}else{
				target.setStylePeriodically({
					property:     'left',
					endValue:     (x - instance.currentPage) * 100,
					increment:    10,
					units:        '%',
					onComplete:   null
				});
			}
		});
	}
	this.updatePaginator = function(){
		$$('.callout_wrapper .paginator_wrapper .pager').each(function(target,x){
			if(x == instance.currentPage){
				target.addClassName('pager_selected');
				target.removeClassName('pager_hover');
			}else{
				target.removeClassName('pager_selected');
				target.removeClassName('pager_hover');
			}
		});
	}
	this.isIpad = function(){
		var uagent = navigator.userAgent.toLowerCase();
		return uagent.search('ipad') > -1
	}
	this.isIphone = function(){
		var uagent = navigator.userAgent.toLowerCase();
		return uagent.search('iphone') > -1
	}

	this.getCalloutData = function(){
		this.callout_data = this.items;
	}
	this.init();
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/MarketingModule.js'

// global.js: begin JavaScript file: '/js/absinthe.min.js'
// ================================================================================
/*! Shutterstock Absinthe Client v0.0.2 | (c) 2014, Shutterstock | 2014-01-28 */;
Absinthe={namespace:function(a){var b,c,d,e=a.split("."),f="undefined"!=typeof global?global:window,g=f.Absinthe;for(c=1,d=e.length;d>c;c++)b=e[c],g[b]=g[b]||{},g=g[b];return g}},Absinthe.loadBottomCalled=!1,Absinthe.appIsLoaded=!1,Absinthe.requestImages=[],Absinthe.initialize=function(a,b,c){Absinthe.context="undefined"!=typeof module&&module.exports?"node":"web",a||(a={});var d=Absinthe.config,e=new Absinthe.BrowserDetect;if("Explorer"===e.browser&&6===e.version)return!1;if("Bot"===e.browser)return!1;if(d.api_key||console&&console.log&&"node"!==Absinthe.context&&console.log("Absinthe Warning: No api key defined in absinthe.config."),Absinthe.pageURL="web"===Absinthe.context?[window.location.origin,window.location.pathname].join(""):a.pageURL||"no_url",Absinthe.segmentations=a.segmentations||{},Absinthe.segmentations.ua="web"===Absinthe.context?e.toString():Absinthe.segmentations.ua||"An unknown browser;an unknown version;an unknown OS",Absinthe.segmentations.pixel_ratio="web"===Absinthe.context?window.devicePixelRatio:1,Absinthe.external_account_id=a.external_account_id,!b){var f="web"===Absinthe.context?Absinthe.Page.prototype.cookies().get("abmode")||a.abmode||"production":a.abmode||"production",g="production"===f?"":"&mode="+f,h="?api_key="+d.api_key,i=0,j=function(){--i||Absinthe.initialize(a,!0,c)};if((!Absinthe.experiments||d.fresh_experiments)&&(i++,Absinthe.util.loadScript(d.experiments_url||"//"+d.server+"/public/experiments"+h+g,j)),(!Absinthe.metrics||d.fresh_metrics)&&(i++,Absinthe.util.loadScript(d.metrics_url||"//"+d.server+"/public/metrics"+h+g,j)),i)return}var k=new Absinthe.Page({experiments:Absinthe.experiments,metrics:Absinthe.metrics||[],cookieOverride:a.cookieOverride,eligibilityParams:a.eligibilityParams});if(Absinthe.page=k,!a.visitor_id&&!d.cookie)throw"Can't continue with no cookie configuration and no explicit visitor ID assignment";!a.visitor_id&&d.cookie&&(a.visitor_id=k.cookies().get(d.cookie.name)),Absinthe.visitor=new Absinthe.Visitor(a.visitor_id),Absinthe.visit=new Absinthe.Visitor(a.visit_id),d.cookie&&k.cookies().set(d.cookie.name,Absinthe.visitor.id,d.cookie.length),k.setUp(),Absinthe.util.forEach(k.variations,function(a){k.applyVariation(a)}),Absinthe.util.forEach(k.metrics,function(a){k.applyMetric(a)}),"function"!=typeof c||d.synchronousAssignments||c(),k.recordAssignments(function(){Absinthe.unitTestCallback({initialized:!0}).call(),"function"==typeof c&&d.synchronousAssignments&&(Absinthe.page=k,c())}),Absinthe.appIsLoaded=!0,Absinthe.triggerOnLoadFunctions()},Absinthe.recordEvent=function(a,b){b=b||{};var c=Absinthe.page.getExperiments(),d=[];for(var e in c)c.hasOwnProperty(e)&&d.push(parseInt(c[e],10));var f=Absinthe.util.extend({},b,{_method:"POST",eventName:a,variationId:d,visitorId:Absinthe.visitor.id,visitId:Absinthe.visit.id,attr:Absinthe.segmentations});Absinthe.external_account_id&&(f.externalAccountId=Absinthe.external_account_id),Absinthe.synchronousEvents&&(f.synchronous=!0),Absinthe.request({path:"/public/events",query:f})},Absinthe.unitTestCallback=function(a){return"undefined"!=typeof window&&window.callPhantom?function(){window.callPhantom(a)}:function(){}},Absinthe.loadBottom=function(){Absinthe.loadBottomCalled||(Absinthe.loadBottomCalled=!0,Absinthe.runOnLoad(Absinthe.triggerBottom))},Absinthe.runAtBottom=function(a){Absinthe.util.addToFunctions("bottom",a)},Absinthe.triggerBottom=function(){Absinthe.util.callFunctions("bottom")},Absinthe.runOnLoad=function(a){return Absinthe.appIsLoaded?a():void Absinthe.util.addToFunctions("onLoad",a)},Absinthe.triggerOnLoadFunctions=function(){Absinthe.util.callFunctions("onLoad")},Absinthe.util={},Absinthe.util.queryString={stringify:function(a){var b,c,d=[];for(c in a)if(a.hasOwnProperty(c))if(a[c]instanceof Array)Absinthe.util.forEach(a[c],function(a){d.push({key:c,value:a})});else if(a[c]instanceof Object)for(b in a[c])a[c].hasOwnProperty(b)&&d.push({key:c+"["+b+"]",value:a[c][b]});else d.push({key:c,value:a[c]});return Absinthe.util.map(d,function(a){return[a.key,encodeURIComponent(a.value)].join("=")}).join("&")},parse:function(a){if(0===a.length)return{};var b={},c=a.split("&");return Absinthe.util.forEach(c,function(a){var c=unescape(a).split("="),d=c.shift(),e=c.shift();b[d]instanceof Array?b[d].push(e):b[d]=e}),b}},Absinthe.util.extend=function(a){return Absinthe.util.forEach(Array.prototype.slice.call(arguments,1),function(b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}),a},Absinthe.util._loadedScripts={},Absinthe.util.loadScript=function(url,callback){if(Absinthe.util._loadedScripts[url])return callback();if("node"===Absinthe.context){var request=require("request"),protocol=/^http/i,fullURL=protocol.test(url)?url:"http:"+url;request(fullURL,function(error,response,body){if(!error&&200===response.statusCode){try{eval(body)}catch(ex){try{console.log("Error when trying to evaluate javascript: "+ex)}catch(e){}}callback()}})}else{var script=document.createElement("script");script.type="text/javascript",script.src=url,document.getElementsByTagName("head")[0].appendChild(script),script.readyState?script.onreadystatechange=function(){("loaded"===script.readyState||"complete"===script.readyState)&&(script.onreadystatechange=null,callback(),Absinthe.util._loadedScripts[url]=1)}:script.onload=function(){callback(),Absinthe.util._loadedScripts[url]=1}}},Absinthe.util.withJQuery=function(a){return"function"==typeof jQuery?a(jQuery):void Absinthe.util.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",function(){jQuery.noConflict(),a(jQuery)})},Absinthe.util.createStyleFromText=function(a){var b=document.createElement("style"),c=document.createTextNode(a);return b.type="text/css",b.styleSheet?b.styleSheet.cssText=c.nodeValue:b.appendChild(c),b},Absinthe.util.matchURL=function(a){return("string"==typeof a||!a instanceof RegExp)&&(a=new RegExp(a)),a.test(Absinthe.pageURL)},Absinthe.util.evalJS=function(jsText){var fn;try{eval("fn = function(params) {"+jsText+"};")}catch(ex){try{console.log("Absinthe: Failed to evalJS: "+ex)}catch(e){}fn=function(){}}return fn},Absinthe.util.forEach=function(a,b,c){for(var d=0,e=a.length;e>d;d++)d in a&&b.call(c,a[d],d,a)},Absinthe.util.filter=function(a,b){if(null===a)throw new TypeError;var c=Object(a),d=c.length>>>0;if("function"!=typeof b)throw new TypeError;for(var e=[],f=arguments[1],g=0;d>g;g++)if(g in c){var h=c[g];b.call(f,h,g,c)&&e.push(h)}return e},Absinthe.util.map=function(a,b,c){var d,e,f;if(null===a)throw new TypeError(" this is null or not defined");var g=Object(a),h=g.length>>>0;if("function"!=typeof b)throw new TypeError(b+" is not a function");for(c&&(d=c),e=new Array(h),f=0;h>f;){var i,j;f in g&&(i=g[f],j=b.call(d,i,f,g),e[f]=j),f++}return e},Absinthe.util.addToFunctions=function(a,b){if(void 0!==b&&"function"==typeof b){var c="_"+a+"_functions";void 0===Absinthe[c]&&(Absinthe[c]=[]),Absinthe[c].push(b)}},Absinthe.util.callFunctions=function(a){var b="_"+a+"_functions",c=Absinthe[b];c&&Absinthe.util.forEach(c,function(a){a()})},Absinthe.util.base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){for(var b,c,d,e,f,g,h,i="",j=0;j<a.length;)b=a.charCodeAt(j++),c=a.charCodeAt(j++),d=a.charCodeAt(j++),e=b>>2,f=(3&b)<<4|c>>4,g=(15&c)<<2|d>>6,h=63&d,isNaN(c)?g=h=64:isNaN(d)&&(h=64),i=i+this._keyStr.charAt(e)+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h);return i},decode:function(a){var b,c,d,e,f,g,h,i="",j=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");j<a.length;)e=this._keyStr.indexOf(a.charAt(j++)),f=this._keyStr.indexOf(a.charAt(j++)),g=this._keyStr.indexOf(a.charAt(j++)),h=this._keyStr.indexOf(a.charAt(j++)),b=e<<2|f>>4,c=(15&f)<<4|g>>2,d=(3&g)<<6|h,i+=String.fromCharCode(b),64!==g&&(i+=String.fromCharCode(c)),64!==h&&(i+=String.fromCharCode(d));return i}},Absinthe.request=function(a){var b=a.server||Absinthe.config.server,c=a.path,d=a.query;d.rand=Math.floor(1e7*Math.random()),d.api_key=Absinthe.config.api_key;var e,f=Absinthe.util.queryString.stringify(d),g=function(a,b){var c=null;try{c=new XMLHttpRequest,"withCredentials"in c?c.open(a,b,!0):"undefined"!=typeof XDomainRequest?(c=new XDomainRequest,c.open(a,b)):c=null}catch(d){}return c},h=function(a,b){var c=new Image;b&&(c.onload=b),c.src=a,Absinthe.requestImages.push(c)};if("web"===Absinthe.context){e=[document.location.protocol+"//"+b+c,f].join("?");var i=g("GET",e);i?(i.onload=function(){a.callback&&a.callback()},i.onerror=function(){h(e,a.callback)},i.send()):h(e,a.callback)}else{if("node"!==Absinthe.context)throw new Error("Absinthe.context of '"+Absinthe.context+"' is not supported.");var j=require("request");e=["http://"+b+c,f].join("?"),j.get(e,function(b){b||"function"!=typeof a.callback||a.callback()})}},"undefined"!=typeof module&&module.exports&&(module.exports=Absinthe),function(a){function b(a){return l.call(a)===s}function c(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}function d(a){if(e(a)!==r)throw new TypeError;var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(c);return b}function e(a){switch(a){case null:return m;case void 0:return n}var b=typeof a;switch(b){case"boolean":return o;case"number":return p;case"string":return q}return r}function f(a){return"undefined"==typeof a}function g(a){var b=a.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g,"").replace(/\s+/g,"").split(",");return 1!=b.length||b[0]?b:[]}function h(a,b){var c=a;return function(){var a=i([k(c,this)],arguments);return b.apply(this,a)}}function i(a,b){for(var c=a.length,d=b.length;d--;)a[c+d]=b[d];return a}function j(a,b){return a=t.call(a,0),i(a,b)}function k(a,b){if(arguments.length<2&&f(arguments[0]))return this;var c=a,d=t.call(arguments,2);return function(){var a=j(d,arguments);return c.apply(b,a)}}var l=Object.prototype.toString,m="Null",n="Undefined",o="Boolean",p="Number",q="String",r="Object",s="[object Function]",t=Array.prototype.slice,u=function(){},v=function(){function a(){}function e(){function d(){this.initialize.apply(this,arguments)}var e=null,f=[].slice.apply(arguments);if(b(f[0])&&(e=f.shift()),c(d,v.Methods),d.superclass=e,d.subclasses=[],e){a.prototype=e.prototype,d.prototype=new a;try{e.subclasses.push(d)}catch(g){}}for(var h=0,i=f.length;i>h;h++)d.addMethods(f[h]);return d.prototype.initialize||(d.prototype.initialize=u),d.prototype.constructor=d,d}function f(a){var c=this.superclass&&this.superclass.prototype,e=d(a);i&&(a.toString!=Object.prototype.toString&&e.push("toString"),a.valueOf!=Object.prototype.valueOf&&e.push("valueOf"));for(var f=0,j=e.length;j>f;f++){var l=e[f],m=a[l];if(c&&b(m)&&"$super"==g(m)[0]){var n=m;m=h(function(a){return function(){return c[a].apply(this,arguments)}}(l),n),m.valueOf=k(n.valueOf,n),m.toString=k(n.toString,n)}this.prototype[l]=m}return this}var i=function(){for(var a in{toString:1})if("toString"===a)return!1;return!0}();return{create:e,Methods:{addMethods:f}}}();a.exports?a.exports.Class=v:a.Class=v}(Absinthe),Absinthe.namespace("Absinthe.Visitor"),Absinthe.Visitor=Absinthe.Class.create({initialize:function(a){this.id=a||this.generateId()},generateId:function(){return Math.floor(Math.random()*(Math.pow(2,32)-1))}}),Absinthe.namespace("Absinthe.Experiment"),Absinthe.Experiment=Absinthe.Class.create({initialize:function(a){this.id=a._id,this.variations=a.variations,this.isActive=void 0!==a.isActive?a.isActive:!0,this.eligibilityURLRegex=new RegExp(a.eligibilityURLRegex),this.eligibilityTest=a.eligibilityTest?Absinthe.util.evalJS(a.eligibilityTest):function(){return!0},this.eligibilityPercent=a.eligibilityPercent,this.assignmentType=a.assignmentType},isVisitorEligible:function(a){return this.eligibilityTest(a)?!0:!1},assign:function(){if(!(100!==this.eligilibityPercent&&this.eligibilityPercent/100<this.srandFraction(1337))){var a,b,c=0,d=this.srandFraction(1e3),e=this.srandFraction(1e10);return Absinthe.util.forEach(this.variations,function(f){a||(b=f._id>10432?e:d,b<c+f.weight&&(a=f),c+=f.weight)}),a}},srand:function(a){var b=Absinthe.visitor.id;return"external_account_id"===this.assignmentType&&void 0!==Absinthe.external_account_id&&null!==Absinthe.external_account_id&&(b=Absinthe.external_account_id),this.md5int||(this.md5int=parseInt(Absinthe.md5([this.id,b].join(";")),16)),this.md5int%a},srandFraction:function(a){return(this.srand(a)+1)/a}}),Absinthe.Page=Absinthe.Class.create({initialize:function(a){if(this.variations=a.variations||[],this.experiments=a.experiments||[],this.visit_variations=[],this.metrics=a.metrics||[],this.eligibilityParams=a.eligibilityParams,this._cookieOverrideJar={},"undefined"!=typeof a.cookieOverride)for(var b in a.cookieOverride)a.cookieOverride.hasOwnProperty(b)&&(this._cookieOverrideJar[b]={value:a.cookieOverride[b]})},setUp:function(){var a=this.query(),b={},c=a.abv||this.cookies().get("abv");if(c){var d=c.split(/-/),e=d.shift(),f=d.shift(),g=d.shift();if(e&&f&&g){var h="wormwood",i=Absinthe.md5([e,f,h].join(";"));i===g&&(b[e]=+f)}}var j=this.getVisitExperiments();Absinthe.util.forEach(this.experiments,function(a){var c,d,e=new Absinthe.Experiment(a);e.isActive&&Absinthe.util.matchURL(e.eligibilityURLRegex)&&e.isVisitorEligible(this.eligibilityParams)&&(d=b[a._id],c=d?Absinthe.util.filter(e.variations,function(a){return a._id===d}).shift():e.assign(),c&&(this.variations.push(c),j[e.id]||(j[e.id]=c._id,this.visit_variations.push(c._id))))},this),this.setVisitExperiments(j)},applyVariation:function(a){"web"===Absinthe.context&&(Absinthe.lastAppliedVariation=a,this._injectCSS(a.css),this._injectJS(a.js_domready),this._executeJS(a.js_head))},applyMetric:function(a){(!a.url_match_regex||Absinthe.util.matchURL(a.url_match_regex))&&a.javascript&&("web"===Absinthe.context?this._injectJS(a.javascript):"node"===Absinthe.context&&this._executeJS(a.javascript))},_injectCSS:function(a){if(a){var b=document.getElementsByTagName("head")[0],c=Absinthe.util.createStyleFromText(a);b.appendChild(c)}},_injectJS:function(a){a&&this._domReady(Absinthe.util.evalJS(a))},_executeJS:function(a){if(a)try{Absinthe.util.evalJS(a).call()}catch(b){try{console.info("Absinthe: variation JS failed to execute: "+b)}catch(c){}return}},_domReady:function(a){var b=window,c=b.document,d=!1,e=!0,f=c.documentElement,g=c.addEventListener?"addEventListener":"attachEvent",h=c.addEventListener?"removeEventListener":"detachEvent",i=c.addEventListener?"":"on";if("function"!=typeof a)throw"You must pass a function to _domReady";var j=function(e){var f="string"==typeof e?e:e.type;if("string"!=typeof e){if("readystatechange"===e.type&&"complete"!==c.readyState)return;("load"===e.type?b:c)[h](i+e.type,j,!1)}if(!d){d=!0;try{a.call(b,f)}catch(g){try{console.info("Absinthe variation failed to apply: "+g)}catch(e){}}}};Absinthe.runAtBottom(function(){if(!d){d=!0;try{a()}catch(b){try{console.info("Absinthe variation failed to apply: "+b)}catch(c){}}}});var k=function(){try{f.doScroll("left")}catch(a){return void window.setTimeout(k,50)}j("poll")};if("complete"===c.readyState){if(!d){d=!0;try{a.call(b,"lazy")}catch(l){try{console.info("Absinthe variation failed to apply: "+l)}catch(m){}}}}else{if(c.createEventObject&&f.doScroll){try{e=!b.frameElement}catch(m){}e&&k()}c[g](i+"DOMContentLoaded",j,!1),c[g](i+"readystatechange",j,!1),b[g](i+"load",j,!1)}},getVisitExperiments:function(){var a={},b=this.cookies().get("visit_exp");if(!b)return a;b=Absinthe.util.base64.decode(b);var c=Absinthe.visit.id,d=b.split("/"),e=d[0];if(parseInt(c,10)!==parseInt(e,10))return a;var f=d[1].split(",");return Absinthe.util.forEach(f,function(b){var c=b.split(":");a[c[0]]=c[1]}),a},setOverride:function(a){this.cookies().set("abv",a)},setVisitExperiments:function(a){var b=[],c=Absinthe.visit.id;for(var d in a)a.hasOwnProperty(d)&&b.push([d,a[d]].join(":"));var e=Absinthe.util.base64.encode(c+"/"+b.join(","));this.cookies().set("visit_exp",e,172800)},getExperiments:function(){var a=this.cookies().get("exp"),b=this.cookies().get("experiments"),c={},d=!1;if(b&&!a&&(a=b,this.cookies().set("experiments","",-1,!0),d=!0),a){var e;/^v2\//.test(a)?e=Absinthe.util.base64.decode(a.substr(3)):(e=a,d=!0);var f=e.split(",");Absinthe.util.forEach(f,function(a){var b=a.split(":");c[b[0]]=b[1]})}return d&&this.setExperiments(c),c},setExperiments:function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push([c,a[c]].join(":"));var d=31536e4,e="v2/"+Absinthe.util.base64.encode(b.join(","));this.cookies().set("exp",e,d)},recordAssignments:function(a){var b=this.getExperiments(),c={},d=!1;Absinthe.util.forEach(Absinthe.experiments,function(a){c[a._id]=!0});for(var e in b)b.hasOwnProperty(e)&&(c[e]||(d=!0,delete b[e]));d&&this.setExperiments(b);var f=Absinthe.util.filter(this.variations,function(a){return b[a.experimentId]?parseInt(b[a.experimentId],10)!==parseInt(a._id,10)?!0:void 0:!0}),g=Absinthe.util.map(f,function(a){return a._id}),h=!0;if(g.length){var i={_method:"POST",variationId:g,visitorId:Absinthe.visitor.id,visitId:Absinthe.visit.id,attr:Absinthe.segmentations};Absinthe.config.synchronousAssignments&&(i.synchronous=1),h=!1,Absinthe.request({path:"/public/assignments",query:i,callback:a}),b=this.getExperiments(),Absinthe.util.forEach(f,function(a){b[a.experimentId]=a._id}),this.setExperiments(b)}if(this.visit_variations.length){var j={_method:"POST",variationId:this.visit_variations,visitorId:Absinthe.visitor.id,visitId:Absinthe.visit.id};Absinthe.request({path:"/public/visits",query:j})}h&&a()},cookies:function(){return Absinthe.config.cookieOverride?this._cookieOverride(this):this._cookieHttp},_cookieHttp:{set:function(a,b,c,d){var e="",f="",g=new Date;d="undefined"!=typeof d?d:!1,c&&(g.setTime(g.getTime()+1e3*c),e=";expires="+g.toGMTString()),Absinthe.config.api_key&&Absinthe.config.api_key.length>=7&&(a=Absinthe.config.api_key.substr(1,7)+a),!d&&"undefined"!=typeof Absinthe.config&&Absinthe.config.cookieDomain&&(f=";domain="+Absinthe.config.cookieDomain),document.cookie=a+"="+encodeURIComponent(b)+e+";path=/"+f},get:function(a){Absinthe.config.api_key&&Absinthe.config.api_key.length>=7&&(a=Absinthe.config.api_key.substr(1,7)+a);for(var b=a+"=",c=document.cookie.split(";"),d=0;d<c.length;d++){for(var e=c[d];" "===e.charAt(0);)e=e.substring(1,e.length);if(0===e.indexOf(b))return decodeURIComponent(e.substring(b.length,e.length))}return null},erase:function(){throw"Not implemented"}},_cookieOverride:function(a){return{set:function(b,c,d,e){var f="";e="undefined"!=typeof e?e:!1,!e&&"undefined"!=typeof Absinthe.config&&Absinthe.config.cookieDomain&&(f=Absinthe.config.cookieDomain),a._cookieOverrideJar[b]={value:c,action:"set",seconds:d,domain:f}},get:function(b){return"undefined"!=typeof a._cookieOverrideJar[b]?a._cookieOverrideJar[b].value:null},erase:function(b){"undefined"!=typeof a._cookieOverrideJar[b]&&(a._cookieOverrideJar[b].action="erase",a._cookieOverrideJar[b].seconds=-1)}}},query:function(){var a="web"===Absinthe.context?document.location.search.substring(1):"",b=Absinthe.util.queryString.parse(a);return b}}),function(a){function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(Absinthe),Absinthe.namespace("Absinthe.BrowserDetect"),Absinthe.BrowserDetect=Absinthe.Class.create({initialize:function(){return"undefined"==typeof navigator?(this.browser="An unknown browser",this.version="an unknown version",void(this.OS="an unknown OS")):(this.browser=this.searchString(this.dataBrowser())||"An unknown browser",this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"an unknown version",void(this.OS=this.searchString(this.dataOS())||"an unknown OS"))},toString:function(){return[this.browser,this.version,this.OS].join(";")},searchString:function(a){for(var b=0;b<a.length;b++){var c=a[b].string,d=a[b].prop;if(this.versionSearchString=a[b].versionSearch||a[b].identity,c){if(-1!=c.indexOf(a[b].subString))return a[b].identity}else if(d)return a[b].identity}},searchVersion:function(a){var b=a.indexOf(this.versionSearchString);if(-1!=b)return parseFloat(a.substring(b+this.versionSearchString.length+1))},dataBrowser:function(){return[{string:navigator.userAgent.toLowerCase(),subString:"bot",identity:"Bot"},{string:navigator.userAgent.toLowerCase(),subString:"slurp",identity:"Bot"},{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}]},dataOS:function(){return[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]}});
//# sourceMappingURL=absinthe.min.map
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/absinthe.min.js'

// global.js: begin JavaScript file: '/js/resource_ready.js'
// ================================================================================
window.Ss = window.Ss || {};
(function(Ss){
	Ss.ResourceReady = {}

	Ss.ResourceReady = {
		keys: {},
		add: function(key, callback){
			if(!this.keys[key]){
				this._createKey(key);	
			}
			var t = this.keys[key];

			if(t.ready){
				callback();
			}else{
				t.add(callback);
			}
		},
		ready: function(key){
			if(!this.keys[key]){
				this._createKey(key);	
			}
			
			this.keys[key].ready = 1;

			var callbacks = this.keys[key].getAll();
			for(var i = 0, l = callbacks.length; i < l ; i++){
				callbacks[i]();
			}
		},
		_createKey: function(key){
			var t = new Key(key)
			this.keys[key] = t;
			return t 
		}
	}

	var Key = function(name){
		this.name = name;
		this.ready = false;
		this.callbacks = [];
	}

	Key.prototype.add = function(callback){
		this.callbacks.push(callback);
	}

	Key.prototype.getAll = function(){
		var callbacks = this.callbacks;
		this.callbacks = [];
		return callbacks;
	}
	Ss.ResourceReady.Key = Key;

})(window.Ss);
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/resource_ready.js'

// global.js: begin JavaScript file: '/js/HandleCookie.js'
// ================================================================================
/***********
 * Handle Cookie
 * Manages check for cookie defined on image download and related modal (or not?) interactions.
 */
Ss = window.Ss || {};

(function (document, Ss, Date) {		
	var HandleCookie = {
		options: {
			cookieName: RegExp('cookie'),
			downloadUrl: '',
			pollInterval: 100,
			frameId: '',
			isIE7_8: false,
			insertParent: document.body,
			loaderId: '',
			unloadMessage: ''
		},
		initialize: function(options) {
			if (options) {
				Object.extend(this.options, options);
			}

			detectCookie.call(this);
		}
	};

	function insertFrame () {
		var frame = document.createElement('iframe');
		frame.id = this.options.frameId;
		frame.src = this.options.downloadUrl;
		this.options.insertParent.appendChild(frame);
	}

	function detectCookie () {
		var instance = this;

		if(this.options.isIE7_8 || (!this.options.isIE7_8 && !this.options.cookieName.test(document.cookie))) {
	 		insertFrame.call(this);
	 		bindUnload.call(this);

			var pollCookie = setInterval(function() {
				if(instance.options.cookieName.test(document.cookie)) {
					clearInterval(pollCookie);
					window.onbeforeunload = null;
					success.call(instance);
				}
			}, this.options.pollInterval);
		} else {
			success.call(instance);
		}
	}

	function success () {
		var loaderElement = document.getElementById(this.options.loaderId);
		loaderElement.className = 'loaded';
	}

	function bindUnload () {
		var message = this.options.unloadMessage;

	    window.onbeforeunload = function(e){
			e = e || window.event;

			if(e) {
				e.returnValue = message;
			}

			return message;
		}
	}

	Ss.HandleCookie = HandleCookie;
}(document, Ss, Date));
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/HandleCookie.js'


// Cache Key Counter: 721



