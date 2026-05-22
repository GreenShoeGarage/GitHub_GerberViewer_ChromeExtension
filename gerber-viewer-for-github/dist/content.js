(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from3, except, desc) => {
    if (from3 && typeof from3 === "object" || typeof from3 === "function") {
      for (let key of __getOwnPropNames(from3))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from3[key], enumerable: !(desc = __getOwnPropDesc(from3, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@esbuild-plugins/node-globals-polyfill/process.js
  function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
  }
  function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
  }
  function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
      return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
      cachedSetTimeout = setTimeout;
      return setTimeout(fun, 0);
    }
    try {
      return cachedSetTimeout(fun, 0);
    } catch (e) {
      try {
        return cachedSetTimeout.call(null, fun, 0);
      } catch (e2) {
        return cachedSetTimeout.call(this, fun, 0);
      }
    }
  }
  function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
      return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
      cachedClearTimeout = clearTimeout;
      return clearTimeout(marker);
    }
    try {
      return cachedClearTimeout(marker);
    } catch (e) {
      try {
        return cachedClearTimeout.call(null, marker);
      } catch (e2) {
        return cachedClearTimeout.call(this, marker);
      }
    }
  }
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
    while (len) {
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
  function nextTick(fun) {
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
  }
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  function noop() {
  }
  function binding(name) {
    throw new Error("process.binding is not supported");
  }
  function cwd() {
    return "/";
  }
  function chdir(dir) {
    throw new Error("process.chdir is not supported");
  }
  function umask() {
    return 0;
  }
  function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  }
  function uptime() {
    var currentTime = /* @__PURE__ */ new Date();
    var dif = currentTime - startTime;
    return dif / 1e3;
  }
  var cachedSetTimeout, cachedClearTimeout, queue, draining, currentQueue, queueIndex, title, platform, browser, env, argv, version, versions, release, config, on, addListener, once, off, removeListener, removeAllListeners, emit, performance, performanceNow, startTime, process, defines;
  var init_process = __esm({
    "node_modules/@esbuild-plugins/node-globals-polyfill/process.js"() {
      cachedSetTimeout = defaultSetTimout;
      cachedClearTimeout = defaultClearTimeout;
      if (typeof globalThis.setTimeout === "function") {
        cachedSetTimeout = setTimeout;
      }
      if (typeof globalThis.clearTimeout === "function") {
        cachedClearTimeout = clearTimeout;
      }
      queue = [];
      draining = false;
      queueIndex = -1;
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      title = "browser";
      platform = "browser";
      browser = true;
      env = {};
      argv = [];
      version = "";
      versions = {};
      release = {};
      config = {};
      on = noop;
      addListener = noop;
      once = noop;
      off = noop;
      removeListener = noop;
      removeAllListeners = noop;
      emit = noop;
      performance = globalThis.performance || {};
      performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
        return (/* @__PURE__ */ new Date()).getTime();
      };
      startTime = /* @__PURE__ */ new Date();
      process = {
        nextTick,
        title,
        browser,
        env,
        argv,
        version,
        versions,
        on,
        addListener,
        once,
        off,
        removeListener,
        removeAllListeners,
        emit,
        binding,
        cwd,
        chdir,
        umask,
        hrtime,
        platform,
        release,
        config,
        uptime
      };
      defines = {};
      Object.keys(defines).forEach((key) => {
        const segs = key.split(".");
        let target = process;
        for (let i = 0; i < segs.length; i++) {
          const seg = segs[i];
          if (i === segs.length - 1) {
            target[seg] = defines[key];
          } else {
            target = target[seg] || (target[seg] = {});
          }
        }
      });
    }
  });

  // node_modules/@esbuild-plugins/node-globals-polyfill/Buffer.js
  function init() {
    inited = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
  }
  function base64toByteArray(b64) {
    if (!inited) {
      init();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = tmp >> 16 & 255;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function base64fromByteArray(uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(
        encodeChunk(
          uint8,
          i,
          i + maxChunkLength > len2 ? len2 : i + maxChunkLength
        )
      );
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[tmp << 4 & 63];
      output += "==";
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      output += lookup[tmp >> 10];
      output += lookup[tmp >> 4 & 63];
      output += lookup[tmp << 2 & 63];
      output += "=";
    }
    parts.push(output);
    return parts.join("");
  }
  function kMaxLength() {
    return Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
  }
  function createBuffer(that, length) {
    if (kMaxLength() < length) {
      throw new RangeError("Invalid typed array length");
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
      that = new Uint8Array(length);
      that.__proto__ = Buffer2.prototype;
    } else {
      if (that === null) {
        that = new Buffer2(length);
      }
      that.length = length;
    }
    return that;
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
      return new Buffer2(arg, encodingOrOffset, length);
    }
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new Error(
          "If encoding is specified then the first argument must be a string"
        );
      }
      return allocUnsafe(this, arg);
    }
    return from(this, arg, encodingOrOffset, length);
  }
  function from(that, value, encodingOrOffset, length) {
    if (typeof value === "number") {
      throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length);
    }
    if (typeof value === "string") {
      return fromString(that, value, encodingOrOffset);
    }
    return fromObject(that, value);
  }
  function assertSize(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative');
    }
  }
  function alloc(that, size, fill3, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size);
    }
    if (fill3 !== void 0) {
      return typeof encoding === "string" ? createBuffer(that, size).fill(fill3, encoding) : createBuffer(that, size).fill(fill3);
    }
    return createBuffer(that, size);
  }
  function allocUnsafe(that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer2.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString(that, string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);
    var actual = that.write(string, encoding);
    if (actual !== length) {
      that = that.slice(0, actual);
    }
    return that;
  }
  function fromArrayLike(that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer(that, array, byteOffset, length) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length === void 0) {
      array = new Uint8Array(array);
    } else if (length === void 0) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
      that = array;
      that.__proto__ = Buffer2.prototype;
    } else {
      that = fromArrayLike(that, array);
    }
    return that;
  }
  function fromObject(that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);
      if (that.length === 0) {
        return that;
      }
      obj.copy(that, 0, 0, len);
      return that;
    }
    if (obj) {
      if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
        if (typeof obj.length !== "number" || isnan(obj.length)) {
          return createBuffer(that, 0);
        }
        return fromArrayLike(that, obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(that, obj.data);
      }
    }
    throw new TypeError(
      "First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object."
    );
  }
  function checked(length) {
    if (length >= kMaxLength()) {
      throw new RangeError(
        "Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes"
      );
    }
    return length | 0;
  }
  function internalIsBuffer(b) {
    return !!(b != null && b._isBuffer);
  }
  function byteLength(string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      string = "" + string;
    }
    var len = string.length;
    if (len === 0)
      return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len;
        case "utf8":
        case "utf-8":
        case void 0:
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len * 2;
        case "hex":
          return len >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase)
            return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  function slowToString(encoding, start, end) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding)
      encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
      return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0)
      byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer2.from(val, encoding);
    }
    if (internalIsBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (Buffer2.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(
            buffer,
            val,
            byteOffset
          );
        } else {
          return Uint8Array.prototype.lastIndexOf.call(
            buffer,
            val,
            byteOffset
          );
        }
      }
      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read2(buf, i2) {
      if (indexSize === 1) {
        return buf[i2];
      } else {
        return buf.readUInt16BE(i2 * indexSize);
      }
    }
    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read2(arr, i + j) !== read2(val, j)) {
            found = false;
            break;
          }
        }
        if (found)
          return i;
      }
    }
    return -1;
  }
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
      throw new TypeError("Invalid hex string");
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed))
        return i;
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(
      utf8ToBytes(string, buf.length - offset),
      buf,
      offset,
      length
    );
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(
      utf16leToBytes(string, buf.length - offset),
      buf,
      offset,
      length
    );
  }
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64fromByteArray(buf);
    } else {
      return base64fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    var out = "";
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = "";
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  function checkInt(buf, value, offset, ext, max2, min) {
    if (!internalIsBuffer(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max2 || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 65535 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 4294967295 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
    }
  }
  function checkIEEE754(buf, value, offset, ext, max2, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(
        buf,
        value,
        offset,
        4,
        34028234663852886e22,
        -34028234663852886e22
      );
    }
    ieee754write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(
        buf,
        value,
        offset,
        8,
        17976931348623157e292,
        -17976931348623157e292
      );
    }
    ieee754write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, "");
    if (str.length < 2)
      return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function stringtrim(str) {
    if (str.trim)
      return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
  }
  function toHex(n) {
    if (n < 16)
      return "0" + n.toString(16);
    return n.toString(16);
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(
          codePoint >> 18 | 240,
          codePoint >> 12 & 63 | 128,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length)
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  function isnan(val) {
    return val !== val;
  }
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
  }
  function isFastBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
  }
  function ieee754read(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  }
  function ieee754write(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
    }
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
    }
    buffer[offset + i - d] |= s * 128;
  }
  var lookup, revLookup, Arr, inited, MAX_ARGUMENTS_LENGTH, INVALID_BASE64_RE;
  var init_Buffer = __esm({
    "node_modules/@esbuild-plugins/node-globals-polyfill/Buffer.js"() {
      init_process();
      init_buffer();
      lookup = [];
      revLookup = [];
      Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      inited = false;
      Buffer2.TYPED_ARRAY_SUPPORT = globalThis.TYPED_ARRAY_SUPPORT !== void 0 ? globalThis.TYPED_ARRAY_SUPPORT : true;
      Buffer2.poolSize = 8192;
      Buffer2._augment = function(arr) {
        arr.__proto__ = Buffer2.prototype;
        return arr;
      };
      Buffer2.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      Buffer2.kMaxLength = kMaxLength();
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        Buffer2.prototype.__proto__ = Uint8Array.prototype;
        Buffer2.__proto__ = Uint8Array;
        if (typeof Symbol !== "undefined" && Symbol.species && Buffer2[Symbol.species] === Buffer2) {
        }
      }
      Buffer2.alloc = function(size, fill3, encoding) {
        return alloc(null, size, fill3, encoding);
      };
      Buffer2.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer2.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer2.isBuffer = isBuffer;
      Buffer2.compare = function compare(a, b) {
        if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
          throw new TypeError("Arguments must be Buffers");
        }
        if (a === b)
          return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      Buffer2.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer2.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer2.alloc(0);
        }
        var i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        var buffer = Buffer2.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!internalIsBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      Buffer2.byteLength = byteLength;
      Buffer2.prototype._isBuffer = true;
      Buffer2.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer2.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer2.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer2.prototype.toString = function toString() {
        var length = this.length | 0;
        if (length === 0)
          return "";
        if (arguments.length === 0)
          return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer2.prototype.equals = function equals(b) {
        if (!internalIsBuffer(b))
          throw new TypeError("Argument must be a Buffer");
        if (this === b)
          return true;
        return Buffer2.compare(this, b) === 0;
      };
      Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
        if (!internalIsBuffer(target)) {
          throw new TypeError("Argument must be a Buffer");
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target)
          return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      Buffer2.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset | 0;
          if (isFinite(length)) {
            length = length | 0;
            if (encoding === void 0)
              encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        var remaining = this.length - offset;
        if (length === void 0 || length > remaining)
          length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding)
          encoding = "utf8";
        var loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
              return asciiWrite(this, string, offset, length);
            case "latin1":
            case "binary":
              return latin1Write(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer2.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      MAX_ARGUMENTS_LENGTH = 4096;
      Buffer2.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0)
            start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0)
            end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start)
          end = start;
        var newBuf;
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer2.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer2(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start];
          }
        }
        return newBuf;
      };
      Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset(offset, byteLength3, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength3 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          checkOffset(offset, byteLength3, this.length);
        }
        var val = this[offset + --byteLength3];
        var mul = 1;
        while (byteLength3 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength3] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset(offset, byteLength3, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength3 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength3);
        return val;
      };
      Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset(offset, byteLength3, this.length);
        var i = byteLength3;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength3);
        return val;
      };
      Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128))
          return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return ieee754read(this, offset, true, 23, 4);
      };
      Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return ieee754read(this, offset, false, 23, 4);
      };
      Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 8, this.length);
        return ieee754read(this, offset, true, 52, 8);
      };
      Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        if (!noAssert)
          checkOffset(offset, 8, this.length);
        return ieee754read(this, offset, false, 52, 8);
      };
      Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength3) - 1;
          checkInt(this, value, offset, byteLength3, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = value & 255;
        while (++i < byteLength3 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength3;
      };
      Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength3) - 1;
          checkInt(this, value, offset, byteLength3, maxBytes, 0);
        }
        var i = byteLength3 - 1;
        var mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength3;
      };
      Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 1, 255, 0);
        if (!Buffer2.TYPED_ARRAY_SUPPORT)
          value = Math.floor(value);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength3 - 1);
          checkInt(this, value, offset, byteLength3, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength3 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength3;
      };
      Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength3 - 1);
          checkInt(this, value, offset, byteLength3, limit - 1, -limit);
        }
        var i = byteLength3 - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength3;
      };
      Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 1, 127, -128);
        if (!Buffer2.TYPED_ARRAY_SUPPORT)
          value = Math.floor(value);
        if (value < 0)
          value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0)
          value = 4294967295 + value + 1;
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start)
          start = 0;
        if (!end && end !== 0)
          end = this.length;
        if (targetStart >= target.length)
          targetStart = target.length;
        if (!targetStart)
          targetStart = 0;
        if (end > 0 && end < start)
          end = start;
        if (end === start)
          return 0;
        if (target.length === 0 || this.length === 0)
          return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length)
          throw new RangeError("sourceStart out of bounds");
        if (end < 0)
          throw new RangeError("sourceEnd out of bounds");
        if (end > this.length)
          end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) {
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else if (len < 1e3 || !Buffer2.TYPED_ARRAY_SUPPORT) {
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, start + len),
            targetStart
          );
        }
        return len;
      };
      Buffer2.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code;
            }
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
        } else if (typeof val === "number") {
          val = val & 255;
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val)
          val = 0;
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer2(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
    }
  });

  // node_modules/@esbuild-plugins/node-globals-polyfill/_buffer.js
  var init_buffer = __esm({
    "node_modules/@esbuild-plugins/node-globals-polyfill/_buffer.js"() {
      init_Buffer();
    }
  });

  // node_modules/whats-that-gerber/lib/constants.js
  var require_constants = __commonJS({
    "node_modules/whats-that-gerber/lib/constants.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = {
        // layer types
        TYPE_COPPER: "copper",
        TYPE_SOLDERMASK: "soldermask",
        TYPE_SILKSCREEN: "silkscreen",
        TYPE_SOLDERPASTE: "solderpaste",
        TYPE_DRILL: "drill",
        TYPE_OUTLINE: "outline",
        TYPE_DRAWING: "drawing",
        // board sides
        SIDE_TOP: "top",
        SIDE_BOTTOM: "bottom",
        SIDE_INNER: "inner",
        SIDE_ALL: "all",
        // cad packages
        // internal use only, for now
        _CAD_KICAD: "kicad",
        _CAD_ALTIUM: "altium",
        _CAD_ALLEGRO: "allegro",
        _CAD_EAGLE: "eagle",
        _CAD_EAGLE_LEGACY: "eagle-legacy",
        _CAD_EAGLE_OSHPARK: "eagle-oshpark",
        _CAD_EAGLE_PCBNG: "eagle-pcbng",
        _CAD_GEDA_PCB: "geda-pcb",
        _CAD_ORCAD: "orcad",
        _CAD_DIPTRACE: "diptrace"
      };
    }
  });

  // node_modules/whats-that-gerber/lib/flat-map.js
  var require_flat_map = __commonJS({
    "node_modules/whats-that-gerber/lib/flat-map.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = function flatMap(collection, iterator) {
        return collection.reduce(function iterate(result, element) {
          return result.concat(iterator(element));
        }, []);
      };
    }
  });

  // node_modules/whats-that-gerber/lib/get-common-cad.js
  var require_get_common_cad = __commonJS({
    "node_modules/whats-that-gerber/lib/get-common-cad.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = function getCommonCad(matches) {
        var cadCount = matches.reduce(function(counts, match) {
          counts[match.cad] = counts[match.cad] + 1 || 1;
          return counts;
        }, {});
        return Object.keys(cadCount).reduce(
          function(maxAndName, name) {
            var count = cadCount[name];
            if (count > maxAndName.max)
              return { max: count, name };
            return maxAndName;
          },
          { max: 0, name: null }
        ).name;
      };
    }
  });

  // node_modules/xtend/immutable.js
  var require_immutable = __commonJS({
    "node_modules/xtend/immutable.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = extend;
      var hasOwnProperty2 = Object.prototype.hasOwnProperty;
      function extend() {
        var target = {};
        for (var i = 0; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (hasOwnProperty2.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      }
    }
  });

  // node_modules/whats-that-gerber/lib/layer-types.js
  var require_layer_types = __commonJS({
    "node_modules/whats-that-gerber/lib/layer-types.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var c = require_constants();
      module.exports = [
        // high-priority blacklist
        {
          type: null,
          side: null,
          matchers: [
            // eagle gerber generation metadata
            {
              ext: "gpi",
              cad: [
                c._CAD_EAGLE,
                c._CAD_EAGLE_LEGACY,
                c._CAD_EAGLE_OSHPARK,
                c._CAD_EAGLE_PCBNG
              ]
            },
            // eagle drill generation metadata
            {
              ext: "dri",
              cad: [
                c._CAD_EAGLE,
                c._CAD_EAGLE_LEGACY,
                c._CAD_EAGLE_OSHPARK,
                c._CAD_EAGLE_PCBNG
              ]
            },
            // general data/BOM files
            { ext: "csv", cad: null },
            // pick-n-place BOMs
            { match: /pnp_bom/, cad: c._CAD_EAGLE_PCBNG }
          ]
        },
        {
          type: c.TYPE_COPPER,
          side: c.SIDE_TOP,
          matchers: [
            { ext: "cmp", cad: c._CAD_EAGLE_LEGACY },
            { ext: "top", cad: [c._CAD_EAGLE_LEGACY, c._CAD_ORCAD] },
            { ext: "gtl", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "toplayer\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /top\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /f[._]cu/, cad: c._CAD_KICAD },
            { match: /copper_top/, cad: c._CAD_EAGLE },
            { match: /top_copper/, cad: c._CAD_EAGLE_PCBNG },
            { match: /top copper/, cad: null }
          ]
        },
        {
          type: c.TYPE_SOLDERMASK,
          side: c.SIDE_TOP,
          matchers: [
            { ext: "stc", cad: c._CAD_EAGLE_LEGACY },
            { ext: "tsm", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gts", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "smt", cad: c._CAD_ORCAD },
            { ext: "topsoldermask\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /topmask\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /f[._]mask/, cad: c._CAD_KICAD },
            { match: /soldermask_top/, cad: c._CAD_EAGLE },
            { match: /top_mask/, cad: c._CAD_EAGLE_PCBNG },
            { match: /top solder resist/, cad: null }
          ]
        },
        {
          type: c.TYPE_SILKSCREEN,
          side: c.SIDE_TOP,
          matchers: [
            { ext: "plc", cad: c._CAD_EAGLE_LEGACY },
            { ext: "tsk", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gto", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "sst", cad: c._CAD_ORCAD },
            { ext: "topsilkscreen\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /topsilk\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /f[._]silks/, cad: c._CAD_KICAD },
            { match: /silkscreen_top/, cad: c._CAD_EAGLE },
            { match: /top_silk/, cad: c._CAD_EAGLE_PCBNG },
            { match: /top silk screen/, cad: null }
          ]
        },
        {
          type: c.TYPE_SOLDERPASTE,
          side: c.SIDE_TOP,
          matchers: [
            { ext: "crc", cad: c._CAD_EAGLE_LEGACY },
            { ext: "tsp", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gtp", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "spt", cad: c._CAD_ORCAD },
            { ext: "tcream\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /toppaste\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /f[._]paste/, cad: c._CAD_KICAD },
            { match: /solderpaste_top/, cad: c._CAD_EAGLE },
            { match: /top_paste/, cad: c._CAD_EAGLE_PCBNG }
          ]
        },
        {
          type: c.TYPE_COPPER,
          side: c.SIDE_BOTTOM,
          matchers: [
            { ext: "sol", cad: c._CAD_EAGLE_LEGACY },
            { ext: "bot", cad: [c._CAD_EAGLE_LEGACY, c._CAD_ORCAD] },
            { ext: "gbl", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "bottomlayer\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /bottom\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /b[._]cu/, cad: c._CAD_KICAD },
            { match: /copper_bottom/, cad: c._CAD_EAGLE },
            { match: /bottom_copper/, cad: c._CAD_EAGLE_PCBNG },
            { match: /bottom copper/, cad: null }
          ]
        },
        {
          type: c.TYPE_SOLDERMASK,
          side: c.SIDE_BOTTOM,
          matchers: [
            { ext: "sts", cad: c._CAD_EAGLE_LEGACY },
            { ext: "bsm", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gbs", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "smb", cad: c._CAD_ORCAD },
            { ext: "bottomsoldermask\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /bottommask\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /b[._]mask/, cad: c._CAD_KICAD },
            { match: /soldermask_bottom/, cad: c._CAD_EAGLE },
            { match: /bottom_mask/, cad: c._CAD_EAGLE_PCBNG },
            { match: /bottom solder resist/, cad: null }
          ]
        },
        {
          type: c.TYPE_SILKSCREEN,
          side: c.SIDE_BOTTOM,
          matchers: [
            { ext: "pls", cad: c._CAD_EAGLE_LEGACY },
            { ext: "bsk", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gbo", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "ssb", cad: c._CAD_ORCAD },
            { ext: "bottomsilkscreen\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /bottomsilk\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /b[._]silks/, cad: c._CAD_KICAD },
            { match: /silkscreen_bottom/, cad: c._CAD_EAGLE },
            { match: /bottom_silk/, cad: c._CAD_EAGLE_PCBNG },
            { match: /bottom silk screen/, cad: null }
          ]
        },
        {
          type: c.TYPE_SOLDERPASTE,
          side: c.SIDE_BOTTOM,
          matchers: [
            { ext: "crs", cad: c._CAD_EAGLE_LEGACY },
            { ext: "bsp", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gbp", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "spb", cad: c._CAD_ORCAD },
            { ext: "bcream\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /bottompaste\.\w+$/, cad: [c._CAD_GEDA_PCB, c._CAD_DIPTRACE] },
            { match: /b[._]paste/, cad: c._CAD_KICAD },
            { match: /solderpaste_bottom/, cad: c._CAD_EAGLE },
            { match: /bottom_paste/, cad: c._CAD_EAGLE_PCBNG }
          ]
        },
        {
          type: c.TYPE_COPPER,
          side: c.SIDE_INNER,
          matchers: [
            { ext: "ly\\d+", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gp?\\d+", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "in\\d+", cad: c._CAD_ORCAD },
            { ext: "internalplane\\d+\\.ger", cad: c._CAD_EAGLE_OSHPARK },
            { match: /in(?:ner)?\d+[._]cu/, cad: c._CAD_KICAD },
            { match: /inner/, cad: c._CAD_DIPTRACE }
          ]
        },
        {
          type: c.TYPE_OUTLINE,
          side: c.SIDE_ALL,
          matchers: [
            { ext: "dim", cad: c._CAD_EAGLE_LEGACY },
            { ext: "mil", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gml", cad: c._CAD_EAGLE_LEGACY },
            { ext: "gm\\d+", cad: [c._CAD_KICAD, c._CAD_ALTIUM] },
            { ext: "gko", cad: c._CAD_ALTIUM },
            { ext: "fab", cad: c._CAD_ORCAD },
            { ext: "drd", cad: c._CAD_ORCAD },
            { match: /outline/, cad: [c._CAD_GEDA_PCB, c._CAD_EAGLE_PCBNG] },
            { match: /boardoutline/, cad: [c._CAD_EAGLE_OSHPARK, c._CAD_DIPTRACE] },
            { match: /edge[._]cuts/, cad: c._CAD_KICAD },
            { match: /profile/, cad: c._CAD_EAGLE },
            { match: /mechanical \d+/, cad: null }
          ]
        },
        {
          type: c.TYPE_DRILL,
          side: c.SIDE_ALL,
          matchers: [
            { ext: "txt", cad: [c._CAD_EAGLE_LEGACY, c._CAD_ALTIUM] },
            {
              ext: "xln",
              cad: [c._CAD_EAGLE, c._CAD_EAGLE_LEGACY, c._CAD_EAGLE_OSHPARK]
            },
            { ext: "exc", cad: c._CAD_EAGLE_LEGACY },
            { ext: "drd", cad: c._CAD_EAGLE_LEGACY },
            { ext: "drl", cad: [c._CAD_KICAD, c._CAD_DIPTRACE] },
            { ext: "tap", cad: c._CAD_ORCAD },
            { ext: "npt", cad: c._CAD_ORCAD },
            { ext: "plated-drill\\.cnc", cad: c._CAD_GEDA_PCB },
            { match: /fab/, cad: c._CAD_GEDA_PCB },
            { match: /npth/, cad: c._CAD_KICAD },
            { match: "/drill/", cad: c._CAD_EAGLE_PCBNG }
          ]
        },
        {
          type: c.TYPE_DRAWING,
          side: null,
          matchers: [
            { ext: "pos", cad: c._CAD_KICAD },
            { ext: "art", cad: c._CAD_ALLEGRO },
            { ext: "gbr", cad: null },
            { ext: "gbx", cad: null },
            { ext: "ger", cad: null },
            { ext: "pho", cad: null }
          ]
        }
      ];
    }
  });

  // node_modules/whats-that-gerber/lib/matchers.js
  var require_matchers = __commonJS({
    "node_modules/whats-that-gerber/lib/matchers.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var flatMap = require_flat_map();
      var layerTypes = require_layer_types();
      module.exports = flatMap(layerTypes, layerTypeToMatchers);
      function layerTypeToMatchers(layer) {
        return flatMap(layer.matchers, matcherToCadMatchers);
        function matcherToCadMatchers(matcher) {
          var match = matcher.ext ? new RegExp("\\." + matcher.ext + "$", "i") : new RegExp(matcher.match, "i");
          return [].concat(matcher.cad).map(mergeLayerWithCad);
          function mergeLayerWithCad(cad) {
            return {
              type: layer.type,
              side: layer.side,
              match,
              cad
            };
          }
        }
      }
    }
  });

  // node_modules/whats-that-gerber/lib/get-matches.js
  var require_get_matches = __commonJS({
    "node_modules/whats-that-gerber/lib/get-matches.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var extend = require_immutable();
      var matchers = require_matchers();
      module.exports = function getMatches(filename) {
        return matchers.map(matcherToFileMatches).filter(Boolean);
        function matcherToFileMatches(matcher) {
          if (!matcher.match.test(filename))
            return null;
          return extend(matcher, { filename });
        }
      };
    }
  });

  // node_modules/whats-that-gerber/index.js
  var require_whats_that_gerber = __commonJS({
    "node_modules/whats-that-gerber/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var constants = require_constants();
      var flatMap = require_flat_map();
      var getCommonCad = require_get_common_cad();
      var getMatches = require_get_matches();
      var layerTypes = require_layer_types();
      module.exports = whatsThatGerber4;
      module.exports.validate = validate;
      module.exports.getAllLayers = getAllLayers;
      Object.keys(constants).forEach(function(constantName) {
        module.exports[constantName] = constants[constantName];
      });
      function whatsThatGerber4(filenames) {
        if (typeof filenames === "string")
          filenames = [filenames];
        var matches = flatMap(filenames, getMatches);
        var commonCad = getCommonCad(matches);
        return filenames.reduce(function(result, filename) {
          var match = _selectMatch(matches, filename, commonCad);
          result[filename] = match ? { type: match.type, side: match.side } : { type: null, side: null };
          return result;
        }, {});
      }
      function getAllLayers() {
        return layerTypes.map(function(layer) {
          return { type: layer.type, side: layer.side };
        }).filter(function(layer) {
          return layer.type !== null;
        });
      }
      function validate(target) {
        return {
          valid: layerTypes.some(_validateLayer),
          side: layerTypes.some(_validateSide) ? target.side : null,
          type: layerTypes.some(_validateType) ? target.type : null
        };
        function _validateLayer(layer) {
          return layer.side === target.side && layer.type === target.type;
        }
        function _validateSide(layer) {
          return layer.side === target.side;
        }
        function _validateType(layer) {
          return layer.type === target.type;
        }
      }
      function _selectMatch(matches, filename, cad) {
        var filenameMatches = matches.filter(function(match) {
          return match.filename === filename;
        });
        var result = filenameMatches.find(function(match) {
          return match.cad === cad;
        });
        return result || filenameMatches[0] || null;
      }
    }
  });

  // node_modules/@tracespace/xml-id/index.js
  var require_xml_id = __commonJS({
    "node_modules/@tracespace/xml-id/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var START_CHAR = "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      var CHAR = "-0123456789" + START_CHAR;
      var REPLACE_RE = new RegExp("^[^" + START_CHAR + "]|[^\\" + CHAR + "]", "g");
      var DEFAULT_RANDOM_LENGTH = 12;
      module.exports = {
        random,
        sanitize,
        ensure
      };
      function random(length) {
        length = length || DEFAULT_RANDOM_LENGTH;
        return _getRandomString(1, START_CHAR) + _getRandomString(length - 1, CHAR);
      }
      function sanitize(source) {
        return source.replace(REPLACE_RE, "_");
      }
      function ensure(maybeId, length) {
        return typeof maybeId === "string" ? sanitize(maybeId) : random(length);
      }
      function _getRandomString(length, alphabet) {
        var abLength = alphabet.length;
        var result = "";
        while (length > 0) {
          length--;
          result += alphabet[Math.floor(Math.random() * abLength)];
        }
        return result;
      }
    }
  });

  // node_modules/lodash.isfinite/index.js
  var require_lodash = __commonJS({
    "node_modules/lodash.isfinite/index.js"(exports, module) {
      init_process();
      init_buffer();
      var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var nativeIsFinite = root.isFinite;
      function isFinite2(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      module.exports = isFinite2;
    }
  });

  // node-modules-polyfills:buffer
  var buffer_exports = {};
  __export(buffer_exports, {
    Buffer: () => Buffer3,
    INSPECT_MAX_BYTES: () => INSPECT_MAX_BYTES,
    SlowBuffer: () => SlowBuffer,
    isBuffer: () => isBuffer2,
    kMaxLength: () => _kMaxLength
  });
  function init2() {
    inited2 = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup2[i] = code[i];
      revLookup2[code.charCodeAt(i)] = i;
    }
    revLookup2["-".charCodeAt(0)] = 62;
    revLookup2["_".charCodeAt(0)] = 63;
  }
  function toByteArray(b64) {
    if (!inited2) {
      init2();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr2(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = revLookup2[b64.charCodeAt(i)] << 18 | revLookup2[b64.charCodeAt(i + 1)] << 12 | revLookup2[b64.charCodeAt(i + 2)] << 6 | revLookup2[b64.charCodeAt(i + 3)];
      arr[L++] = tmp >> 16 & 255;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
      tmp = revLookup2[b64.charCodeAt(i)] << 2 | revLookup2[b64.charCodeAt(i + 1)] >> 4;
      arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
      tmp = revLookup2[b64.charCodeAt(i)] << 10 | revLookup2[b64.charCodeAt(i + 1)] << 4 | revLookup2[b64.charCodeAt(i + 2)] >> 2;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase642(num) {
    return lookup2[num >> 18 & 63] + lookup2[num >> 12 & 63] + lookup2[num >> 6 & 63] + lookup2[num & 63];
  }
  function encodeChunk2(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
      output.push(tripletToBase642(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    if (!inited2) {
      init2();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk2(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup2[tmp >> 2];
      output += lookup2[tmp << 4 & 63];
      output += "==";
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      output += lookup2[tmp >> 10];
      output += lookup2[tmp >> 4 & 63];
      output += lookup2[tmp << 2 & 63];
      output += "=";
    }
    parts.push(output);
    return parts.join("");
  }
  function read(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  }
  function write2(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
    }
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
    }
    buffer[offset + i - d] |= s * 128;
  }
  function kMaxLength2() {
    return Buffer3.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
  }
  function createBuffer2(that, length) {
    if (kMaxLength2() < length) {
      throw new RangeError("Invalid typed array length");
    }
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
      that = new Uint8Array(length);
      that.__proto__ = Buffer3.prototype;
    } else {
      if (that === null) {
        that = new Buffer3(length);
      }
      that.length = length;
    }
    return that;
  }
  function Buffer3(arg, encodingOrOffset, length) {
    if (!Buffer3.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer3)) {
      return new Buffer3(arg, encodingOrOffset, length);
    }
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new Error(
          "If encoding is specified then the first argument must be a string"
        );
      }
      return allocUnsafe2(this, arg);
    }
    return from2(this, arg, encodingOrOffset, length);
  }
  function from2(that, value, encodingOrOffset, length) {
    if (typeof value === "number") {
      throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
      return fromArrayBuffer2(that, value, encodingOrOffset, length);
    }
    if (typeof value === "string") {
      return fromString2(that, value, encodingOrOffset);
    }
    return fromObject2(that, value);
  }
  function assertSize2(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative');
    }
  }
  function alloc2(that, size, fill3, encoding) {
    assertSize2(size);
    if (size <= 0) {
      return createBuffer2(that, size);
    }
    if (fill3 !== void 0) {
      return typeof encoding === "string" ? createBuffer2(that, size).fill(fill3, encoding) : createBuffer2(that, size).fill(fill3);
    }
    return createBuffer2(that, size);
  }
  function allocUnsafe2(that, size) {
    assertSize2(size);
    that = createBuffer2(that, size < 0 ? 0 : checked2(size) | 0);
    if (!Buffer3.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString2(that, string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer3.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length = byteLength2(string, encoding) | 0;
    that = createBuffer2(that, length);
    var actual = that.write(string, encoding);
    if (actual !== length) {
      that = that.slice(0, actual);
    }
    return that;
  }
  function fromArrayLike2(that, array) {
    var length = array.length < 0 ? 0 : checked2(array.length) | 0;
    that = createBuffer2(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer2(that, array, byteOffset, length) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length === void 0) {
      array = new Uint8Array(array);
    } else if (length === void 0) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
      that = array;
      that.__proto__ = Buffer3.prototype;
    } else {
      that = fromArrayLike2(that, array);
    }
    return that;
  }
  function fromObject2(that, obj) {
    if (internalIsBuffer2(obj)) {
      var len = checked2(obj.length) | 0;
      that = createBuffer2(that, len);
      if (that.length === 0) {
        return that;
      }
      obj.copy(that, 0, 0, len);
      return that;
    }
    if (obj) {
      if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
        if (typeof obj.length !== "number" || isnan2(obj.length)) {
          return createBuffer2(that, 0);
        }
        return fromArrayLike2(that, obj);
      }
      if (obj.type === "Buffer" && isArray(obj.data)) {
        return fromArrayLike2(that, obj.data);
      }
    }
    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
  }
  function checked2(length) {
    if (length >= kMaxLength2()) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength2().toString(16) + " bytes");
    }
    return length | 0;
  }
  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }
    return Buffer3.alloc(+length);
  }
  function internalIsBuffer2(b) {
    return !!(b != null && b._isBuffer);
  }
  function byteLength2(string, encoding) {
    if (internalIsBuffer2(string)) {
      return string.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      string = "" + string;
    }
    var len = string.length;
    if (len === 0)
      return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len;
        case "utf8":
        case "utf-8":
        case void 0:
          return utf8ToBytes2(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len * 2;
        case "hex":
          return len >>> 1;
        case "base64":
          return base64ToBytes2(string).length;
        default:
          if (loweredCase)
            return utf8ToBytes2(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  function slowToString2(encoding, start, end) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding)
      encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice2(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice2(this, start, end);
        case "ascii":
          return asciiSlice2(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice2(this, start, end);
        case "base64":
          return base64Slice2(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice2(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  function swap2(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }
  function bidirectionalIndexOf2(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
      return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0)
      byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer3.from(val, encoding);
    }
    if (internalIsBuffer2(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf2(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (Buffer3.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
      }
      return arrayIndexOf2(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf2(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read2(buf, i2) {
      if (indexSize === 1) {
        return buf[i2];
      } else {
        return buf.readUInt16BE(i2 * indexSize);
      }
    }
    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read2(arr, i + j) !== read2(val, j)) {
            found = false;
            break;
          }
        }
        if (found)
          return i;
      }
    }
    return -1;
  }
  function hexWrite2(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
      throw new TypeError("Invalid hex string");
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed))
        return i;
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write2(buf, string, offset, length) {
    return blitBuffer2(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite2(buf, string, offset, length) {
    return blitBuffer2(asciiToBytes2(string), buf, offset, length);
  }
  function latin1Write2(buf, string, offset, length) {
    return asciiWrite2(buf, string, offset, length);
  }
  function base64Write2(buf, string, offset, length) {
    return blitBuffer2(base64ToBytes2(string), buf, offset, length);
  }
  function ucs2Write2(buf, string, offset, length) {
    return blitBuffer2(utf16leToBytes2(string, buf.length - offset), buf, offset, length);
  }
  function base64Slice2(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf);
    } else {
      return fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice2(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray2(res);
  }
  function decodeCodePointsArray2(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH2) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH2)
      );
    }
    return res;
  }
  function asciiSlice2(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
  }
  function latin1Slice2(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice2(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    var out = "";
    for (var i = start; i < end; ++i) {
      out += toHex2(buf[i]);
    }
    return out;
  }
  function utf16leSlice2(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = "";
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  function checkOffset2(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  function checkInt2(buf, value, offset, ext, max2, min) {
    if (!internalIsBuffer2(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max2 || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  function objectWriteUInt162(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 65535 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  function objectWriteUInt322(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 4294967295 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
    }
  }
  function checkIEEE7542(buf, value, offset, ext, max2, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
  }
  function writeFloat2(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE7542(buf, value, offset, 4);
    }
    write2(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  function writeDouble2(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE7542(buf, value, offset, 8);
    }
    write2(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  function base64clean2(str) {
    str = stringtrim2(str).replace(INVALID_BASE64_RE2, "");
    if (str.length < 2)
      return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function stringtrim2(str) {
    if (str.trim)
      return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
  }
  function toHex2(n) {
    if (n < 16)
      return "0" + n.toString(16);
    return n.toString(16);
  }
  function utf8ToBytes2(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(
          codePoint >> 6 | 192,
          codePoint & 63 | 128
        );
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(
          codePoint >> 18 | 240,
          codePoint >> 12 & 63 | 128,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes2(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes2(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes2(str) {
    return toByteArray(base64clean2(str));
  }
  function blitBuffer2(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length)
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  function isnan2(val) {
    return val !== val;
  }
  function isBuffer2(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer2(obj) || isSlowBuffer2(obj));
  }
  function isFastBuffer2(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer2(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer2(obj.slice(0, 0));
  }
  var lookup2, revLookup2, Arr2, inited2, toString2, isArray, INSPECT_MAX_BYTES, _kMaxLength, MAX_ARGUMENTS_LENGTH2, INVALID_BASE64_RE2;
  var init_buffer2 = __esm({
    "node-modules-polyfills:buffer"() {
      init_process();
      init_buffer();
      lookup2 = [];
      revLookup2 = [];
      Arr2 = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      inited2 = false;
      toString2 = {}.toString;
      isArray = Array.isArray || function(arr) {
        return toString2.call(arr) == "[object Array]";
      };
      INSPECT_MAX_BYTES = 50;
      Buffer3.TYPED_ARRAY_SUPPORT = globalThis.TYPED_ARRAY_SUPPORT !== void 0 ? globalThis.TYPED_ARRAY_SUPPORT : true;
      _kMaxLength = kMaxLength2();
      Buffer3.poolSize = 8192;
      Buffer3._augment = function(arr) {
        arr.__proto__ = Buffer3.prototype;
        return arr;
      };
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from2(null, value, encodingOrOffset, length);
      };
      if (Buffer3.TYPED_ARRAY_SUPPORT) {
        Buffer3.prototype.__proto__ = Uint8Array.prototype;
        Buffer3.__proto__ = Uint8Array;
      }
      Buffer3.alloc = function(size, fill3, encoding) {
        return alloc2(null, size, fill3, encoding);
      };
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe2(null, size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe2(null, size);
      };
      Buffer3.isBuffer = isBuffer2;
      Buffer3.compare = function compare3(a, b) {
        if (!internalIsBuffer2(a) || !internalIsBuffer2(b)) {
          throw new TypeError("Arguments must be Buffers");
        }
        if (a === b)
          return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding2(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat2(list, length) {
        if (!isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        var i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        var buffer = Buffer3.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!internalIsBuffer2(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      Buffer3.byteLength = byteLength2;
      Buffer3.prototype._isBuffer = true;
      Buffer3.prototype.swap16 = function swap162() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var i = 0; i < len; i += 2) {
          swap2(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap322() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var i = 0; i < len; i += 4) {
          swap2(this, i, i + 3);
          swap2(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap642() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var i = 0; i < len; i += 8) {
          swap2(this, i, i + 7);
          swap2(this, i + 1, i + 6);
          swap2(this, i + 2, i + 5);
          swap2(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString3() {
        var length = this.length | 0;
        if (length === 0)
          return "";
        if (arguments.length === 0)
          return utf8Slice2(this, 0, length);
        return slowToString2.apply(this, arguments);
      };
      Buffer3.prototype.equals = function equals2(b) {
        if (!internalIsBuffer2(b))
          throw new TypeError("Argument must be a Buffer");
        if (this === b)
          return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        var str = "";
        var max2 = INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max2).match(/.{2}/g).join(" ");
          if (this.length > max2)
            str += " ... ";
        }
        return "<Buffer " + str + ">";
      };
      Buffer3.prototype.compare = function compare4(target, start, end, thisStart, thisEnd) {
        if (!internalIsBuffer2(target)) {
          throw new TypeError("Argument must be a Buffer");
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target)
          return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      Buffer3.prototype.includes = function includes2(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf2(val, byteOffset, encoding) {
        return bidirectionalIndexOf2(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf2(val, byteOffset, encoding) {
        return bidirectionalIndexOf2(this, val, byteOffset, encoding, false);
      };
      Buffer3.prototype.write = function write3(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset | 0;
          if (isFinite(length)) {
            length = length | 0;
            if (encoding === void 0)
              encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        var remaining = this.length - offset;
        if (length === void 0 || length > remaining)
          length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding)
          encoding = "utf8";
        var loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite2(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write2(this, string, offset, length);
            case "ascii":
              return asciiWrite2(this, string, offset, length);
            case "latin1":
            case "binary":
              return latin1Write2(this, string, offset, length);
            case "base64":
              return base64Write2(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write2(this, string, offset, length);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON2() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      MAX_ARGUMENTS_LENGTH2 = 4096;
      Buffer3.prototype.slice = function slice2(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0)
            start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0)
            end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start)
          end = start;
        var newBuf;
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer3.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer3(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start];
          }
        }
        return newBuf;
      };
      Buffer3.prototype.readUIntLE = function readUIntLE2(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset2(offset, byteLength3, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength3 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUIntBE = function readUIntBE2(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          checkOffset2(offset, byteLength3, this.length);
        }
        var val = this[offset + --byteLength3];
        var mul = 1;
        while (byteLength3 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength3] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUInt8 = function readUInt82(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUInt16LE = function readUInt16LE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUInt16BE = function readUInt16BE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUInt32LE = function readUInt32LE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUInt32BE = function readUInt32BE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readIntLE = function readIntLE2(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset2(offset, byteLength3, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength3 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength3);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE2(offset, byteLength3, noAssert) {
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert)
          checkOffset2(offset, byteLength3, this.length);
        var i = byteLength3;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength3);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt82(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 1, this.length);
        if (!(this[offset] & 128))
          return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readFloatLE = function readFloatLE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 4, this.length);
        return read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 8, this.length);
        return read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE2(offset, noAssert) {
        if (!noAssert)
          checkOffset2(offset, 8, this.length);
        return read(this, offset, false, 52, 8);
      };
      Buffer3.prototype.writeUIntLE = function writeUIntLE2(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength3) - 1;
          checkInt2(this, value, offset, byteLength3, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = value & 255;
        while (++i < byteLength3 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength3;
      };
      Buffer3.prototype.writeUIntBE = function writeUIntBE2(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength3 = byteLength3 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength3) - 1;
          checkInt2(this, value, offset, byteLength3, maxBytes, 0);
        }
        var i = byteLength3 - 1;
        var mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength3;
      };
      Buffer3.prototype.writeUInt8 = function writeUInt82(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 1, 255, 0);
        if (!Buffer3.TYPED_ARRAY_SUPPORT)
          value = Math.floor(value);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUInt16LE = function writeUInt16LE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 2, 65535, 0);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt162(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer3.prototype.writeUInt16BE = function writeUInt16BE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 2, 65535, 0);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt162(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer3.prototype.writeUInt32LE = function writeUInt32LE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 4, 4294967295, 0);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255;
        } else {
          objectWriteUInt322(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer3.prototype.writeUInt32BE = function writeUInt32BE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 4, 4294967295, 0);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt322(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer3.prototype.writeIntLE = function writeIntLE2(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength3 - 1);
          checkInt2(this, value, offset, byteLength3, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength3 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength3;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE2(value, offset, byteLength3, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength3 - 1);
          checkInt2(this, value, offset, byteLength3, limit - 1, -limit);
        }
        var i = byteLength3 - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength3;
      };
      Buffer3.prototype.writeInt8 = function writeInt82(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 1, 127, -128);
        if (!Buffer3.TYPED_ARRAY_SUPPORT)
          value = Math.floor(value);
        if (value < 0)
          value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 2, 32767, -32768);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt162(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 2, 32767, -32768);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt162(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else {
          objectWriteUInt322(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE2(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert)
          checkInt2(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0)
          value = 4294967295 + value + 1;
        if (Buffer3.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt322(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer3.prototype.writeFloatLE = function writeFloatLE2(value, offset, noAssert) {
        return writeFloat2(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE2(value, offset, noAssert) {
        return writeFloat2(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE2(value, offset, noAssert) {
        return writeDouble2(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE2(value, offset, noAssert) {
        return writeDouble2(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy2(target, targetStart, start, end) {
        if (!start)
          start = 0;
        if (!end && end !== 0)
          end = this.length;
        if (targetStart >= target.length)
          targetStart = target.length;
        if (!targetStart)
          targetStart = 0;
        if (end > 0 && end < start)
          end = start;
        if (end === start)
          return 0;
        if (target.length === 0 || this.length === 0)
          return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length)
          throw new RangeError("sourceStart out of bounds");
        if (end < 0)
          throw new RangeError("sourceEnd out of bounds");
        if (end > this.length)
          end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) {
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else if (len < 1e3 || !Buffer3.TYPED_ARRAY_SUPPORT) {
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, start + len),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill2(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code;
            }
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
        } else if (typeof val === "number") {
          val = val & 255;
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val)
          val = 0;
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = internalIsBuffer2(val) ? val : utf8ToBytes2(new Buffer3(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      INVALID_BASE64_RE2 = /[^+\/0-9A-Za-z-_]/g;
    }
  });

  // node-modules-polyfills:string_decoder
  var string_decoder_exports = {};
  __export(string_decoder_exports, {
    StringDecoder: () => StringDecoder
  });
  function assertEncoding(encoding) {
    if (encoding && !isBufferEncoding(encoding)) {
      throw new Error("Unknown encoding: " + encoding);
    }
  }
  function StringDecoder(encoding) {
    this.encoding = (encoding || "utf8").toLowerCase().replace(/[-_]/, "");
    assertEncoding(encoding);
    switch (this.encoding) {
      case "utf8":
        this.surrogateSize = 3;
        break;
      case "ucs2":
      case "utf16le":
        this.surrogateSize = 2;
        this.detectIncompleteChar = utf16DetectIncompleteChar;
        break;
      case "base64":
        this.surrogateSize = 3;
        this.detectIncompleteChar = base64DetectIncompleteChar;
        break;
      default:
        this.write = passThroughWrite;
        return;
    }
    this.charBuffer = new Buffer3(6);
    this.charReceived = 0;
    this.charLength = 0;
  }
  function passThroughWrite(buffer) {
    return buffer.toString(this.encoding);
  }
  function utf16DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 2;
    this.charLength = this.charReceived ? 2 : 0;
  }
  function base64DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 3;
    this.charLength = this.charReceived ? 3 : 0;
  }
  var isBufferEncoding;
  var init_string_decoder = __esm({
    "node-modules-polyfills:string_decoder"() {
      init_process();
      init_buffer();
      init_buffer2();
      isBufferEncoding = Buffer3.isEncoding || function(encoding) {
        switch (encoding && encoding.toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
          case "raw":
            return true;
          default:
            return false;
        }
      };
      StringDecoder.prototype.write = function(buffer) {
        var charStr = "";
        while (this.charLength) {
          var available = buffer.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : buffer.length;
          buffer.copy(this.charBuffer, this.charReceived, 0, available);
          this.charReceived += available;
          if (this.charReceived < this.charLength) {
            return "";
          }
          buffer = buffer.slice(available, buffer.length);
          charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
          var charCode = charStr.charCodeAt(charStr.length - 1);
          if (charCode >= 55296 && charCode <= 56319) {
            this.charLength += this.surrogateSize;
            charStr = "";
            continue;
          }
          this.charReceived = this.charLength = 0;
          if (buffer.length === 0) {
            return charStr;
          }
          break;
        }
        this.detectIncompleteChar(buffer);
        var end = buffer.length;
        if (this.charLength) {
          buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
          end -= this.charReceived;
        }
        charStr += buffer.toString(this.encoding, 0, end);
        var end = charStr.length - 1;
        var charCode = charStr.charCodeAt(end);
        if (charCode >= 55296 && charCode <= 56319) {
          var size = this.surrogateSize;
          this.charLength += size;
          this.charReceived += size;
          this.charBuffer.copy(this.charBuffer, size, 0, size);
          buffer.copy(this.charBuffer, 0, 0, size);
          return charStr.substring(0, end);
        }
        return charStr;
      };
      StringDecoder.prototype.detectIncompleteChar = function(buffer) {
        var i = buffer.length >= 3 ? 3 : buffer.length;
        for (; i > 0; i--) {
          var c = buffer[buffer.length - i];
          if (i == 1 && c >> 5 == 6) {
            this.charLength = 2;
            break;
          }
          if (i <= 2 && c >> 4 == 14) {
            this.charLength = 3;
            break;
          }
          if (i <= 3 && c >> 3 == 30) {
            this.charLength = 4;
            break;
          }
        }
        this.charReceived = i;
      };
      StringDecoder.prototype.end = function(buffer) {
        var res = "";
        if (buffer && buffer.length)
          res = this.write(buffer);
        if (this.charReceived) {
          var cr = this.charReceived;
          var buf = this.charBuffer;
          var enc = this.encoding;
          res += buf.slice(0, cr).toString(enc);
        }
        return res;
      };
    }
  });

  // node-modules-polyfills-commonjs:string_decoder
  var require_string_decoder = __commonJS({
    "node-modules-polyfills-commonjs:string_decoder"(exports, module) {
      init_process();
      init_buffer();
      var polyfill = (init_string_decoder(), __toCommonJS(string_decoder_exports));
      if (polyfill && polyfill.default) {
        module.exports = polyfill.default;
        for (let k in polyfill) {
          module.exports[k] = polyfill[k];
        }
      } else if (polyfill) {
        module.exports = polyfill;
      }
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      init_process();
      init_buffer();
      if (typeof Object.create === "function") {
        module.exports = function inherits2(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          }
        };
      } else {
        module.exports = function inherits2(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          }
        };
      }
    }
  });

  // node-modules-polyfills:events
  var events_exports = {};
  __export(events_exports, {
    EventEmitter: () => EventEmitter,
    default: () => events_default
  });
  function EventHandlers() {
  }
  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  function $getMaxListeners(that) {
    if (that._maxListeners === void 0)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }
  function emitNone(handler, isFn, self2) {
    if (isFn)
      handler.call(self2);
    else {
      var len = handler.length;
      var listeners2 = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners2[i].call(self2);
    }
  }
  function emitOne(handler, isFn, self2, arg1) {
    if (isFn)
      handler.call(self2, arg1);
    else {
      var len = handler.length;
      var listeners2 = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners2[i].call(self2, arg1);
    }
  }
  function emitTwo(handler, isFn, self2, arg1, arg2) {
    if (isFn)
      handler.call(self2, arg1, arg2);
    else {
      var len = handler.length;
      var listeners2 = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners2[i].call(self2, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self2, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self2, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners2 = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners2[i].call(self2, arg1, arg2, arg3);
    }
  }
  function emitMany(handler, isFn, self2, args) {
    if (isFn)
      handler.apply(self2, args);
    else {
      var len = handler.length;
      var listeners2 = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners2[i].apply(self2, args);
    }
  }
  function _addListener(target, type, listener, prepend) {
    var m;
    var events2;
    var existing;
    if (typeof listener !== "function")
      throw new TypeError('"listener" argument must be a function');
    events2 = target._events;
    if (!events2) {
      events2 = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      if (events2.newListener) {
        target.emit(
          "newListener",
          type,
          listener.listener ? listener.listener : listener
        );
        events2 = target._events;
      }
      existing = events2[type];
    }
    if (!existing) {
      existing = events2[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === "function") {
        existing = events2[type] = prepend ? [listener, existing] : [existing, listener];
      } else {
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + type + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }
    return target;
  }
  function emitWarning(e) {
    typeof console.warn === "function" ? console.warn(e) : console.log(e);
  }
  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }
  function listenerCount(type) {
    var events2 = this._events;
    if (events2) {
      var evlistener = events2[type];
      if (typeof evlistener === "function") {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }
    return 0;
  }
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }
  function arrayClone(arr, i) {
    var copy3 = new Array(i);
    while (i--)
      copy3[i] = arr[i];
    return copy3;
  }
  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }
  var domain, events_default;
  var init_events = __esm({
    "node-modules-polyfills:events"() {
      "use strict";
      init_process();
      init_buffer();
      EventHandlers.prototype = /* @__PURE__ */ Object.create(null);
      events_default = EventEmitter;
      EventEmitter.EventEmitter = EventEmitter;
      EventEmitter.usingDomains = false;
      EventEmitter.prototype.domain = void 0;
      EventEmitter.prototype._events = void 0;
      EventEmitter.prototype._maxListeners = void 0;
      EventEmitter.defaultMaxListeners = 10;
      EventEmitter.init = function() {
        this.domain = null;
        if (EventEmitter.usingDomains) {
          if (domain.active && !(this instanceof domain.Domain)) {
            this.domain = domain.active;
          }
        }
        if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || void 0;
      };
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || isNaN(n))
          throw new TypeError('"n" argument must be a positive number');
        this._maxListeners = n;
        return this;
      };
      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return $getMaxListeners(this);
      };
      EventEmitter.prototype.emit = function emit2(type) {
        var er, handler, len, args, i, events2, domain2;
        var needDomainExit = false;
        var doError = type === "error";
        events2 = this._events;
        if (events2)
          doError = doError && events2.error == null;
        else if (!doError)
          return false;
        domain2 = this.domain;
        if (doError) {
          er = arguments[1];
          if (domain2) {
            if (!er)
              er = new Error('Uncaught, unspecified "error" event');
            er.domainEmitter = this;
            er.domain = domain2;
            er.domainThrown = false;
            domain2.emit("error", er);
          } else if (er instanceof Error) {
            throw er;
          } else {
            var err2 = new Error('Uncaught, unspecified "error" event. (' + er + ")");
            err2.context = er;
            throw err2;
          }
          return false;
        }
        handler = events2[type];
        if (!handler)
          return false;
        var isFn = typeof handler === "function";
        len = arguments.length;
        switch (len) {
          case 1:
            emitNone(handler, isFn, this);
            break;
          case 2:
            emitOne(handler, isFn, this, arguments[1]);
            break;
          case 3:
            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
            break;
          case 4:
            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
            break;
          default:
            args = new Array(len - 1);
            for (i = 1; i < len; i++)
              args[i - 1] = arguments[i];
            emitMany(handler, isFn, this, args);
        }
        if (needDomainExit)
          domain2.exit();
        return true;
      };
      EventEmitter.prototype.addListener = function addListener2(type, listener) {
        return _addListener(this, type, listener, false);
      };
      EventEmitter.prototype.on = EventEmitter.prototype.addListener;
      EventEmitter.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };
      EventEmitter.prototype.once = function once2(type, listener) {
        if (typeof listener !== "function")
          throw new TypeError('"listener" argument must be a function');
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        if (typeof listener !== "function")
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter.prototype.removeListener = function removeListener2(type, listener) {
        var list, events2, position, i, originalListener;
        if (typeof listener !== "function")
          throw new TypeError('"listener" argument must be a function');
        events2 = this._events;
        if (!events2)
          return this;
        list = events2[type];
        if (!list)
          return this;
        if (list === listener || list.listener && list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events2[type];
            if (events2.removeListener)
              this.emit("removeListener", type, list.listener || listener);
          }
        } else if (typeof list !== "function") {
          position = -1;
          for (i = list.length; i-- > 0; ) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (list.length === 1) {
            list[0] = void 0;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events2[type];
            }
          } else {
            spliceOne(list, position);
          }
          if (events2.removeListener)
            this.emit("removeListener", type, originalListener || listener);
        }
        return this;
      };
      EventEmitter.prototype.removeAllListeners = function removeAllListeners2(type) {
        var listeners2, events2;
        events2 = this._events;
        if (!events2)
          return this;
        if (!events2.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events2[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events2[type];
          }
          return this;
        }
        if (arguments.length === 0) {
          var keys = Object.keys(events2);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener")
              continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }
        listeners2 = events2[type];
        if (typeof listeners2 === "function") {
          this.removeListener(type, listeners2);
        } else if (listeners2) {
          do {
            this.removeListener(type, listeners2[listeners2.length - 1]);
          } while (listeners2[0]);
        }
        return this;
      };
      EventEmitter.prototype.listeners = function listeners(type) {
        var evlistener;
        var ret;
        var events2 = this._events;
        if (!events2)
          ret = [];
        else {
          evlistener = events2[type];
          if (!evlistener)
            ret = [];
          else if (typeof evlistener === "function")
            ret = [evlistener.listener || evlistener];
          else
            ret = unwrapListeners(evlistener);
        }
        return ret;
      };
      EventEmitter.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };
      EventEmitter.prototype.listenerCount = listenerCount;
      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
      };
    }
  });

  // node-modules-polyfills-commonjs:events
  var require_events = __commonJS({
    "node-modules-polyfills-commonjs:events"(exports, module) {
      init_process();
      init_buffer();
      var polyfill = (init_events(), __toCommonJS(events_exports));
      if (polyfill && polyfill.default) {
        module.exports = polyfill.default;
        for (let k in polyfill) {
          module.exports[k] = polyfill[k];
        }
      } else if (polyfill) {
        module.exports = polyfill;
      }
    }
  });

  // node_modules/readable-stream/lib/internal/streams/stream-browser.js
  var require_stream_browser = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/stream-browser.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = require_events().EventEmitter;
    }
  });

  // node-modules-polyfills-commonjs:buffer
  var require_buffer = __commonJS({
    "node-modules-polyfills-commonjs:buffer"(exports, module) {
      init_process();
      init_buffer();
      var polyfill = (init_buffer2(), __toCommonJS(buffer_exports));
      if (polyfill && polyfill.default) {
        module.exports = polyfill.default;
        for (let k in polyfill) {
          module.exports[k] = polyfill[k];
        }
      } else if (polyfill) {
        module.exports = polyfill;
      }
    }
  });

  // node-modules-polyfills:process
  function defaultSetTimout2() {
    throw new Error("setTimeout has not been defined");
  }
  function defaultClearTimeout2() {
    throw new Error("clearTimeout has not been defined");
  }
  function runTimeout2(fun) {
    if (cachedSetTimeout2 === setTimeout) {
      return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout2 === defaultSetTimout2 || !cachedSetTimeout2) && setTimeout) {
      cachedSetTimeout2 = setTimeout;
      return setTimeout(fun, 0);
    }
    try {
      return cachedSetTimeout2(fun, 0);
    } catch (e) {
      try {
        return cachedSetTimeout2.call(null, fun, 0);
      } catch (e2) {
        return cachedSetTimeout2.call(this, fun, 0);
      }
    }
  }
  function runClearTimeout2(marker) {
    if (cachedClearTimeout2 === clearTimeout) {
      return clearTimeout(marker);
    }
    if ((cachedClearTimeout2 === defaultClearTimeout2 || !cachedClearTimeout2) && clearTimeout) {
      cachedClearTimeout2 = clearTimeout;
      return clearTimeout(marker);
    }
    try {
      return cachedClearTimeout2(marker);
    } catch (e) {
      try {
        return cachedClearTimeout2.call(null, marker);
      } catch (e2) {
        return cachedClearTimeout2.call(this, marker);
      }
    }
  }
  function cleanUpNextTick2() {
    if (!draining2 || !currentQueue2) {
      return;
    }
    draining2 = false;
    if (currentQueue2.length) {
      queue2 = currentQueue2.concat(queue2);
    } else {
      queueIndex2 = -1;
    }
    if (queue2.length) {
      drainQueue2();
    }
  }
  function drainQueue2() {
    if (draining2) {
      return;
    }
    var timeout = runTimeout2(cleanUpNextTick2);
    draining2 = true;
    var len = queue2.length;
    while (len) {
      currentQueue2 = queue2;
      queue2 = [];
      while (++queueIndex2 < len) {
        if (currentQueue2) {
          currentQueue2[queueIndex2].run();
        }
      }
      queueIndex2 = -1;
      len = queue2.length;
    }
    currentQueue2 = null;
    draining2 = false;
    runClearTimeout2(timeout);
  }
  function nextTick2(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue2.push(new Item2(fun, args));
    if (queue2.length === 1 && !draining2) {
      runTimeout2(drainQueue2);
    }
  }
  function Item2(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  function noop2() {
  }
  function binding2(name) {
    throw new Error("process.binding is not supported");
  }
  function cwd2() {
    return "/";
  }
  function chdir2(dir) {
    throw new Error("process.chdir is not supported");
  }
  function umask2() {
    return 0;
  }
  function hrtime2(previousTimestamp) {
    var clocktime = performanceNow2.call(performance2) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  }
  function uptime2() {
    var currentTime = /* @__PURE__ */ new Date();
    var dif = currentTime - startTime2;
    return dif / 1e3;
  }
  var cachedSetTimeout2, cachedClearTimeout2, queue2, draining2, currentQueue2, queueIndex2, title2, platform2, browser2, env2, argv2, version2, versions2, release2, config2, on2, addListener3, once3, off2, removeListener3, removeAllListeners3, emit3, performance2, performanceNow2, startTime2, browser$1, process_default;
  var init_process2 = __esm({
    "node-modules-polyfills:process"() {
      init_process();
      init_buffer();
      cachedSetTimeout2 = defaultSetTimout2;
      cachedClearTimeout2 = defaultClearTimeout2;
      if (typeof globalThis.setTimeout === "function") {
        cachedSetTimeout2 = setTimeout;
      }
      if (typeof globalThis.clearTimeout === "function") {
        cachedClearTimeout2 = clearTimeout;
      }
      queue2 = [];
      draining2 = false;
      queueIndex2 = -1;
      Item2.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      title2 = "browser";
      platform2 = "browser";
      browser2 = true;
      env2 = {};
      argv2 = [];
      version2 = "";
      versions2 = {};
      release2 = {};
      config2 = {};
      on2 = noop2;
      addListener3 = noop2;
      once3 = noop2;
      off2 = noop2;
      removeListener3 = noop2;
      removeAllListeners3 = noop2;
      emit3 = noop2;
      performance2 = globalThis.performance || {};
      performanceNow2 = performance2.now || performance2.mozNow || performance2.msNow || performance2.oNow || performance2.webkitNow || function() {
        return (/* @__PURE__ */ new Date()).getTime();
      };
      startTime2 = /* @__PURE__ */ new Date();
      browser$1 = {
        nextTick: nextTick2,
        title: title2,
        browser: browser2,
        env: env2,
        argv: argv2,
        version: version2,
        versions: versions2,
        on: on2,
        addListener: addListener3,
        once: once3,
        off: off2,
        removeListener: removeListener3,
        removeAllListeners: removeAllListeners3,
        emit: emit3,
        binding: binding2,
        cwd: cwd2,
        chdir: chdir2,
        umask: umask2,
        hrtime: hrtime2,
        platform: platform2,
        release: release2,
        config: config2,
        uptime: uptime2
      };
      process_default = browser$1;
    }
  });

  // node_modules/rollup-plugin-node-polyfills/polyfills/inherits.js
  var inherits, inherits_default;
  var init_inherits = __esm({
    "node_modules/rollup-plugin-node-polyfills/polyfills/inherits.js"() {
      init_process();
      init_buffer();
      if (typeof Object.create === "function") {
        inherits = function inherits2(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        };
      } else {
        inherits = function inherits2(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        };
      }
      inherits_default = inherits;
    }
  });

  // node-modules-polyfills:util
  var util_exports = {};
  __export(util_exports, {
    _extend: () => _extend,
    debuglog: () => debuglog,
    default: () => util_default,
    deprecate: () => deprecate,
    format: () => format,
    inherits: () => inherits_default,
    inspect: () => inspect2,
    isArray: () => isArray2,
    isBoolean: () => isBoolean,
    isBuffer: () => isBuffer3,
    isDate: () => isDate,
    isError: () => isError,
    isFunction: () => isFunction,
    isNull: () => isNull,
    isNullOrUndefined: () => isNullOrUndefined,
    isNumber: () => isNumber,
    isObject: () => isObject,
    isPrimitive: () => isPrimitive,
    isRegExp: () => isRegExp,
    isString: () => isString,
    isSymbol: () => isSymbol,
    isUndefined: () => isUndefined,
    log: () => log
  });
  function format(f) {
    if (!isString(f)) {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect2(arguments[i]));
      }
      return objects.join(" ");
    }
    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x2) {
      if (x2 === "%%")
        return "%";
      if (i >= len)
        return x2;
      switch (x2) {
        case "%s":
          return String(args[i++]);
        case "%d":
          return Number(args[i++]);
        case "%j":
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return "[Circular]";
          }
        default:
          return x2;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (isNull(x) || !isObject(x)) {
        str += " " + x;
      } else {
        str += " " + inspect2(x);
      }
    }
    return str;
  }
  function deprecate(fn, msg) {
    if (isUndefined(globalThis.process)) {
      return function() {
        return deprecate(fn, msg).apply(this, arguments);
      };
    }
    if (process_default.noDeprecation === true) {
      return fn;
    }
    var warned = false;
    function deprecated() {
      if (!warned) {
        if (process_default.throwDeprecation) {
          throw new Error(msg);
        } else if (process_default.traceDeprecation) {
          console.trace(msg);
        } else {
          console.error(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    }
    return deprecated;
  }
  function debuglog(set) {
    if (isUndefined(debugEnviron))
      debugEnviron = process_default.env.NODE_DEBUG || "";
    set = set.toUpperCase();
    if (!debugs[set]) {
      if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
        var pid = 0;
        debugs[set] = function() {
          var msg = format.apply(null, arguments);
          console.error("%s %d: %s", set, pid, msg);
        };
      } else {
        debugs[set] = function() {
        };
      }
    }
    return debugs[set];
  }
  function inspect2(obj, opts) {
    var ctx = {
      seen: [],
      stylize: stylizeNoColor
    };
    if (arguments.length >= 3)
      ctx.depth = arguments[2];
    if (arguments.length >= 4)
      ctx.colors = arguments[3];
    if (isBoolean(opts)) {
      ctx.showHidden = opts;
    } else if (opts) {
      _extend(ctx, opts);
    }
    if (isUndefined(ctx.showHidden))
      ctx.showHidden = false;
    if (isUndefined(ctx.depth))
      ctx.depth = 2;
    if (isUndefined(ctx.colors))
      ctx.colors = false;
    if (isUndefined(ctx.customInspect))
      ctx.customInspect = true;
    if (ctx.colors)
      ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  }
  function stylizeWithColor(str, styleType) {
    var style = inspect2.styles[styleType];
    if (style) {
      return "\x1B[" + inspect2.colors[style][0] + "m" + str + "\x1B[" + inspect2.colors[style][1] + "m";
    } else {
      return str;
    }
  }
  function stylizeNoColor(str, styleType) {
    return str;
  }
  function arrayToHash(array) {
    var hash = {};
    array.forEach(function(val, idx) {
      hash[val] = true;
    });
    return hash;
  }
  function formatValue(ctx, value, recurseTimes) {
    if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
    value.inspect !== inspect2 && // Also filter out any prototype objects using the circular check.
    !(value.constructor && value.constructor.prototype === value)) {
      var ret = value.inspect(recurseTimes, ctx);
      if (!isString(ret)) {
        ret = formatValue(ctx, ret, recurseTimes);
      }
      return ret;
    }
    var primitive = formatPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }
    var keys = Object.keys(value);
    var visibleKeys = arrayToHash(keys);
    if (ctx.showHidden) {
      keys = Object.getOwnPropertyNames(value);
    }
    if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
      return formatError(value);
    }
    if (keys.length === 0) {
      if (isFunction(value)) {
        var name = value.name ? ": " + value.name : "";
        return ctx.stylize("[Function" + name + "]", "special");
      }
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
      }
      if (isDate(value)) {
        return ctx.stylize(Date.prototype.toString.call(value), "date");
      }
      if (isError(value)) {
        return formatError(value);
      }
    }
    var base = "", array = false, braces = ["{", "}"];
    if (isArray2(value)) {
      array = true;
      braces = ["[", "]"];
    }
    if (isFunction(value)) {
      var n = value.name ? ": " + value.name : "";
      base = " [Function" + n + "]";
    }
    if (isRegExp(value)) {
      base = " " + RegExp.prototype.toString.call(value);
    }
    if (isDate(value)) {
      base = " " + Date.prototype.toUTCString.call(value);
    }
    if (isError(value)) {
      base = " " + formatError(value);
    }
    if (keys.length === 0 && (!array || value.length == 0)) {
      return braces[0] + base + braces[1];
    }
    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
      } else {
        return ctx.stylize("[Object]", "special");
      }
    }
    ctx.seen.push(value);
    var output;
    if (array) {
      output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    } else {
      output = keys.map(function(key) {
        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
      });
    }
    ctx.seen.pop();
    return reduceToSingleString(output, base, braces);
  }
  function formatPrimitive(ctx, value) {
    if (isUndefined(value))
      return ctx.stylize("undefined", "undefined");
    if (isString(value)) {
      var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
      return ctx.stylize(simple, "string");
    }
    if (isNumber(value))
      return ctx.stylize("" + value, "number");
    if (isBoolean(value))
      return ctx.stylize("" + value, "boolean");
    if (isNull(value))
      return ctx.stylize("null", "null");
  }
  function formatError(value) {
    return "[" + Error.prototype.toString.call(value) + "]";
  }
  function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
      if (hasOwnProperty(value, String(i))) {
        output.push(formatProperty(
          ctx,
          value,
          recurseTimes,
          visibleKeys,
          String(i),
          true
        ));
      } else {
        output.push("");
      }
    }
    keys.forEach(function(key) {
      if (!key.match(/^\d+$/)) {
        output.push(formatProperty(
          ctx,
          value,
          recurseTimes,
          visibleKeys,
          key,
          true
        ));
      }
    });
    return output;
  }
  function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    if (desc.get) {
      if (desc.set) {
        str = ctx.stylize("[Getter/Setter]", "special");
      } else {
        str = ctx.stylize("[Getter]", "special");
      }
    } else {
      if (desc.set) {
        str = ctx.stylize("[Setter]", "special");
      }
    }
    if (!hasOwnProperty(visibleKeys, key)) {
      name = "[" + key + "]";
    }
    if (!str) {
      if (ctx.seen.indexOf(desc.value) < 0) {
        if (isNull(recurseTimes)) {
          str = formatValue(ctx, desc.value, null);
        } else {
          str = formatValue(ctx, desc.value, recurseTimes - 1);
        }
        if (str.indexOf("\n") > -1) {
          if (array) {
            str = str.split("\n").map(function(line) {
              return "  " + line;
            }).join("\n").substr(2);
          } else {
            str = "\n" + str.split("\n").map(function(line) {
              return "   " + line;
            }).join("\n");
          }
        }
      } else {
        str = ctx.stylize("[Circular]", "special");
      }
    }
    if (isUndefined(name)) {
      if (array && key.match(/^\d+$/)) {
        return str;
      }
      name = JSON.stringify("" + key);
      if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
        name = name.substr(1, name.length - 2);
        name = ctx.stylize(name, "name");
      } else {
        name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
        name = ctx.stylize(name, "string");
      }
    }
    return name + ": " + str;
  }
  function reduceToSingleString(output, base, braces) {
    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf("\n") >= 0)
        numLinesEst++;
      return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
    }, 0);
    if (length > 60) {
      return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
    }
    return braces[0] + base + " " + output.join(", ") + " " + braces[1];
  }
  function isArray2(ar) {
    return Array.isArray(ar);
  }
  function isBoolean(arg) {
    return typeof arg === "boolean";
  }
  function isNull(arg) {
    return arg === null;
  }
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  function isNumber(arg) {
    return typeof arg === "number";
  }
  function isString(arg) {
    return typeof arg === "string";
  }
  function isSymbol(arg) {
    return typeof arg === "symbol";
  }
  function isUndefined(arg) {
    return arg === void 0;
  }
  function isRegExp(re) {
    return isObject(re) && objectToString(re) === "[object RegExp]";
  }
  function isObject(arg) {
    return typeof arg === "object" && arg !== null;
  }
  function isDate(d) {
    return isObject(d) && objectToString(d) === "[object Date]";
  }
  function isError(e) {
    return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
  }
  function isFunction(arg) {
    return typeof arg === "function";
  }
  function isPrimitive(arg) {
    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
    typeof arg === "undefined";
  }
  function isBuffer3(maybeBuf) {
    return Buffer2.isBuffer(maybeBuf);
  }
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
  function pad(n) {
    return n < 10 ? "0" + n.toString(10) : n.toString(10);
  }
  function timestamp() {
    var d = /* @__PURE__ */ new Date();
    var time = [
      pad(d.getHours()),
      pad(d.getMinutes()),
      pad(d.getSeconds())
    ].join(":");
    return [d.getDate(), months[d.getMonth()], time].join(" ");
  }
  function log() {
    console.log("%s - %s", timestamp(), format.apply(null, arguments));
  }
  function _extend(origin, add) {
    if (!add || !isObject(add))
      return origin;
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  var formatRegExp, debugs, debugEnviron, months, util_default;
  var init_util = __esm({
    "node-modules-polyfills:util"() {
      init_process();
      init_buffer();
      init_process2();
      init_inherits();
      formatRegExp = /%[sdj%]/g;
      debugs = {};
      inspect2.colors = {
        "bold": [1, 22],
        "italic": [3, 23],
        "underline": [4, 24],
        "inverse": [7, 27],
        "white": [37, 39],
        "grey": [90, 39],
        "black": [30, 39],
        "blue": [34, 39],
        "cyan": [36, 39],
        "green": [32, 39],
        "magenta": [35, 39],
        "red": [31, 39],
        "yellow": [33, 39]
      };
      inspect2.styles = {
        "special": "cyan",
        "number": "yellow",
        "boolean": "yellow",
        "undefined": "grey",
        "null": "bold",
        "string": "green",
        "date": "magenta",
        // "name": intentionally not styling
        "regexp": "red"
      };
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      util_default = {
        inherits: inherits_default,
        _extend,
        log,
        isBuffer: isBuffer3,
        isPrimitive,
        isFunction,
        isError,
        isDate,
        isObject,
        isRegExp,
        isUndefined,
        isSymbol,
        isString,
        isNumber,
        isNullOrUndefined,
        isNull,
        isBoolean,
        isArray: isArray2,
        inspect: inspect2,
        deprecate,
        format,
        debuglog
      };
    }
  });

  // node-modules-polyfills-commonjs:util
  var require_util = __commonJS({
    "node-modules-polyfills-commonjs:util"(exports, module) {
      init_process();
      init_buffer();
      var polyfill = (init_util(), __toCommonJS(util_exports));
      if (polyfill && polyfill.default) {
        module.exports = polyfill.default;
        for (let k in polyfill) {
          module.exports[k] = polyfill[k];
        }
      } else if (polyfill) {
        module.exports = polyfill;
      }
    }
  });

  // node_modules/readable-stream/lib/internal/streams/buffer_list.js
  var require_buffer_list = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          enumerableOnly && (symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          })), keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
        return target;
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps)
          _defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null)
          return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object")
            return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      var _require = require_buffer();
      var Buffer4 = _require.Buffer;
      var _require2 = require_util();
      var inspect3 = _require2.inspect;
      var custom = inspect3 && inspect3.custom || "inspect";
      function copyBuffer(src, target, offset) {
        Buffer4.prototype.copy.call(src, target, offset);
      }
      module.exports = /* @__PURE__ */ function() {
        function BufferList() {
          _classCallCheck(this, BufferList);
          this.head = null;
          this.tail = null;
          this.length = 0;
        }
        _createClass(BufferList, [{
          key: "push",
          value: function push2(v) {
            var entry = {
              data: v,
              next: null
            };
            if (this.length > 0)
              this.tail.next = entry;
            else
              this.head = entry;
            this.tail = entry;
            ++this.length;
          }
        }, {
          key: "unshift",
          value: function unshift(v) {
            var entry = {
              data: v,
              next: this.head
            };
            if (this.length === 0)
              this.tail = entry;
            this.head = entry;
            ++this.length;
          }
        }, {
          key: "shift",
          value: function shift() {
            if (this.length === 0)
              return;
            var ret = this.head.data;
            if (this.length === 1)
              this.head = this.tail = null;
            else
              this.head = this.head.next;
            --this.length;
            return ret;
          }
        }, {
          key: "clear",
          value: function clear() {
            this.head = this.tail = null;
            this.length = 0;
          }
        }, {
          key: "join",
          value: function join(s) {
            if (this.length === 0)
              return "";
            var p = this.head;
            var ret = "" + p.data;
            while (p = p.next)
              ret += s + p.data;
            return ret;
          }
        }, {
          key: "concat",
          value: function concat3(n) {
            if (this.length === 0)
              return Buffer4.alloc(0);
            var ret = Buffer4.allocUnsafe(n >>> 0);
            var p = this.head;
            var i = 0;
            while (p) {
              copyBuffer(p.data, ret, i);
              i += p.data.length;
              p = p.next;
            }
            return ret;
          }
          // Consumes a specified amount of bytes or characters from the buffered data.
        }, {
          key: "consume",
          value: function consume(n, hasStrings) {
            var ret;
            if (n < this.head.data.length) {
              ret = this.head.data.slice(0, n);
              this.head.data = this.head.data.slice(n);
            } else if (n === this.head.data.length) {
              ret = this.shift();
            } else {
              ret = hasStrings ? this._getString(n) : this._getBuffer(n);
            }
            return ret;
          }
        }, {
          key: "first",
          value: function first() {
            return this.head.data;
          }
          // Consumes a specified amount of characters from the buffered data.
        }, {
          key: "_getString",
          value: function _getString(n) {
            var p = this.head;
            var c = 1;
            var ret = p.data;
            n -= ret.length;
            while (p = p.next) {
              var str = p.data;
              var nb = n > str.length ? str.length : n;
              if (nb === str.length)
                ret += str;
              else
                ret += str.slice(0, n);
              n -= nb;
              if (n === 0) {
                if (nb === str.length) {
                  ++c;
                  if (p.next)
                    this.head = p.next;
                  else
                    this.head = this.tail = null;
                } else {
                  this.head = p;
                  p.data = str.slice(nb);
                }
                break;
              }
              ++c;
            }
            this.length -= c;
            return ret;
          }
          // Consumes a specified amount of bytes from the buffered data.
        }, {
          key: "_getBuffer",
          value: function _getBuffer(n) {
            var ret = Buffer4.allocUnsafe(n);
            var p = this.head;
            var c = 1;
            p.data.copy(ret);
            n -= p.data.length;
            while (p = p.next) {
              var buf = p.data;
              var nb = n > buf.length ? buf.length : n;
              buf.copy(ret, ret.length - n, 0, nb);
              n -= nb;
              if (n === 0) {
                if (nb === buf.length) {
                  ++c;
                  if (p.next)
                    this.head = p.next;
                  else
                    this.head = this.tail = null;
                } else {
                  this.head = p;
                  p.data = buf.slice(nb);
                }
                break;
              }
              ++c;
            }
            this.length -= c;
            return ret;
          }
          // Make sure the linked list only shows the minimal necessary information.
        }, {
          key: custom,
          value: function value(_, options) {
            return inspect3(this, _objectSpread(_objectSpread({}, options), {}, {
              // Only inspect one level.
              depth: 0,
              // It should not recurse.
              customInspect: false
            }));
          }
        }]);
        return BufferList;
      }();
    }
  });

  // node_modules/readable-stream/lib/internal/streams/destroy.js
  var require_destroy = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      function destroy(err2, cb) {
        var _this = this;
        var readableDestroyed = this._readableState && this._readableState.destroyed;
        var writableDestroyed = this._writableState && this._writableState.destroyed;
        if (readableDestroyed || writableDestroyed) {
          if (cb) {
            cb(err2);
          } else if (err2) {
            if (!this._writableState) {
              process.nextTick(emitErrorNT, this, err2);
            } else if (!this._writableState.errorEmitted) {
              this._writableState.errorEmitted = true;
              process.nextTick(emitErrorNT, this, err2);
            }
          }
          return this;
        }
        if (this._readableState) {
          this._readableState.destroyed = true;
        }
        if (this._writableState) {
          this._writableState.destroyed = true;
        }
        this._destroy(err2 || null, function(err3) {
          if (!cb && err3) {
            if (!_this._writableState) {
              process.nextTick(emitErrorAndCloseNT, _this, err3);
            } else if (!_this._writableState.errorEmitted) {
              _this._writableState.errorEmitted = true;
              process.nextTick(emitErrorAndCloseNT, _this, err3);
            } else {
              process.nextTick(emitCloseNT, _this);
            }
          } else if (cb) {
            process.nextTick(emitCloseNT, _this);
            cb(err3);
          } else {
            process.nextTick(emitCloseNT, _this);
          }
        });
        return this;
      }
      function emitErrorAndCloseNT(self2, err2) {
        emitErrorNT(self2, err2);
        emitCloseNT(self2);
      }
      function emitCloseNT(self2) {
        if (self2._writableState && !self2._writableState.emitClose)
          return;
        if (self2._readableState && !self2._readableState.emitClose)
          return;
        self2.emit("close");
      }
      function undestroy() {
        if (this._readableState) {
          this._readableState.destroyed = false;
          this._readableState.reading = false;
          this._readableState.ended = false;
          this._readableState.endEmitted = false;
        }
        if (this._writableState) {
          this._writableState.destroyed = false;
          this._writableState.ended = false;
          this._writableState.ending = false;
          this._writableState.finalCalled = false;
          this._writableState.prefinished = false;
          this._writableState.finished = false;
          this._writableState.errorEmitted = false;
        }
      }
      function emitErrorNT(self2, err2) {
        self2.emit("error", err2);
      }
      function errorOrDestroy(stream, err2) {
        var rState = stream._readableState;
        var wState = stream._writableState;
        if (rState && rState.autoDestroy || wState && wState.autoDestroy)
          stream.destroy(err2);
        else
          stream.emit("error", err2);
      }
      module.exports = {
        destroy,
        undestroy,
        errorOrDestroy
      };
    }
  });

  // node_modules/readable-stream/errors-browser.js
  var require_errors_browser = __commonJS({
    "node_modules/readable-stream/errors-browser.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
      }
      var codes = {};
      function createErrorType(code, message, Base) {
        if (!Base) {
          Base = Error;
        }
        function getMessage(arg1, arg2, arg3) {
          if (typeof message === "string") {
            return message;
          } else {
            return message(arg1, arg2, arg3);
          }
        }
        var NodeError = /* @__PURE__ */ function(_Base) {
          _inheritsLoose(NodeError2, _Base);
          function NodeError2(arg1, arg2, arg3) {
            return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
          }
          return NodeError2;
        }(Base);
        NodeError.prototype.name = Base.name;
        NodeError.prototype.code = code;
        codes[code] = NodeError;
      }
      function oneOf(expected, thing) {
        if (Array.isArray(expected)) {
          var len = expected.length;
          expected = expected.map(function(i) {
            return String(i);
          });
          if (len > 2) {
            return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1];
          } else if (len === 2) {
            return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
          } else {
            return "of ".concat(thing, " ").concat(expected[0]);
          }
        } else {
          return "of ".concat(thing, " ").concat(String(expected));
        }
      }
      function startsWith(str, search, pos) {
        return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
      }
      function endsWith(str, search, this_len) {
        if (this_len === void 0 || this_len > str.length) {
          this_len = str.length;
        }
        return str.substring(this_len - search.length, this_len) === search;
      }
      function includes3(str, search, start) {
        if (typeof start !== "number") {
          start = 0;
        }
        if (start + search.length > str.length) {
          return false;
        } else {
          return str.indexOf(search, start) !== -1;
        }
      }
      createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
        return 'The value "' + value + '" is invalid for option "' + name + '"';
      }, TypeError);
      createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
        var determiner;
        if (typeof expected === "string" && startsWith(expected, "not ")) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        var msg;
        if (endsWith(name, " argument")) {
          msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        } else {
          var type = includes3(name, ".") ? "property" : "argument";
          msg = 'The "'.concat(name, '" ').concat(type, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        }
        msg += ". Received type ".concat(typeof actual);
        return msg;
      }, TypeError);
      createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
      createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
        return "The " + name + " method is not implemented";
      });
      createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
      createErrorType("ERR_STREAM_DESTROYED", function(name) {
        return "Cannot call " + name + " after a stream was destroyed";
      });
      createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
      createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
      createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
      createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
      createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
        return "Unknown encoding: " + arg;
      }, TypeError);
      createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
      module.exports.codes = codes;
    }
  });

  // node_modules/readable-stream/lib/internal/streams/state.js
  var require_state = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/state.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var ERR_INVALID_OPT_VALUE = require_errors_browser().codes.ERR_INVALID_OPT_VALUE;
      function highWaterMarkFrom(options, isDuplex, duplexKey) {
        return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
      }
      function getHighWaterMark(state, options, duplexKey, isDuplex) {
        var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
        if (hwm != null) {
          if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
            var name = isDuplex ? duplexKey : "highWaterMark";
            throw new ERR_INVALID_OPT_VALUE(name, hwm);
          }
          return Math.floor(hwm);
        }
        return state.objectMode ? 16 : 16 * 1024;
      }
      module.exports = {
        getHighWaterMark
      };
    }
  });

  // node_modules/util-deprecate/browser.js
  var require_browser = __commonJS({
    "node_modules/util-deprecate/browser.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = deprecate2;
      function deprecate2(fn, msg) {
        if (config3("noDeprecation")) {
          return fn;
        }
        var warned = false;
        function deprecated() {
          if (!warned) {
            if (config3("throwDeprecation")) {
              throw new Error(msg);
            } else if (config3("traceDeprecation")) {
              console.trace(msg);
            } else {
              console.warn(msg);
            }
            warned = true;
          }
          return fn.apply(this, arguments);
        }
        return deprecated;
      }
      function config3(name) {
        try {
          if (!globalThis.localStorage)
            return false;
        } catch (_) {
          return false;
        }
        var val = globalThis.localStorage[name];
        if (null == val)
          return false;
        return String(val).toLowerCase() === "true";
      }
    }
  });

  // node_modules/readable-stream/lib/_stream_writable.js
  var require_stream_writable = __commonJS({
    "node_modules/readable-stream/lib/_stream_writable.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = Writable;
      function CorkedRequest(state) {
        var _this = this;
        this.next = null;
        this.entry = null;
        this.finish = function() {
          onCorkedFinish(_this, state);
        };
      }
      var Duplex;
      Writable.WritableState = WritableState;
      var internalUtil = {
        deprecate: require_browser()
      };
      var Stream = require_stream_browser();
      var Buffer4 = require_buffer().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer4.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer4.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var destroyImpl = require_destroy();
      var _require = require_state();
      var getHighWaterMark = _require.getHighWaterMark;
      var _require$codes = require_errors_browser().codes;
      var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
      var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
      var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
      var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
      var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
      var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
      var errorOrDestroy = destroyImpl.errorOrDestroy;
      require_inherits_browser()(Writable, Stream);
      function nop() {
      }
      function WritableState(options, stream, isDuplex) {
        Duplex = Duplex || require_stream_duplex();
        options = options || {};
        if (typeof isDuplex !== "boolean")
          isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex)
          this.objectMode = this.objectMode || !!options.writableObjectMode;
        this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
        this.finalCalled = false;
        this.needDrain = false;
        this.ending = false;
        this.ended = false;
        this.finished = false;
        this.destroyed = false;
        var noDecode = options.decodeStrings === false;
        this.decodeStrings = !noDecode;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.length = 0;
        this.writing = false;
        this.corked = 0;
        this.sync = true;
        this.bufferProcessing = false;
        this.onwrite = function(er) {
          onwrite(stream, er);
        };
        this.writecb = null;
        this.writelen = 0;
        this.bufferedRequest = null;
        this.lastBufferedRequest = null;
        this.pendingcb = 0;
        this.prefinished = false;
        this.errorEmitted = false;
        this.emitClose = options.emitClose !== false;
        this.autoDestroy = !!options.autoDestroy;
        this.bufferedRequestCount = 0;
        this.corkedRequestsFree = new CorkedRequest(this);
      }
      WritableState.prototype.getBuffer = function getBuffer() {
        var current = this.bufferedRequest;
        var out = [];
        while (current) {
          out.push(current);
          current = current.next;
        }
        return out;
      };
      (function() {
        try {
          Object.defineProperty(WritableState.prototype, "buffer", {
            get: internalUtil.deprecate(function writableStateBufferGetter() {
              return this.getBuffer();
            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
          });
        } catch (_) {
        }
      })();
      var realHasInstance;
      if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
        realHasInstance = Function.prototype[Symbol.hasInstance];
        Object.defineProperty(Writable, Symbol.hasInstance, {
          value: function value(object) {
            if (realHasInstance.call(this, object))
              return true;
            if (this !== Writable)
              return false;
            return object && object._writableState instanceof WritableState;
          }
        });
      } else {
        realHasInstance = function realHasInstance2(object) {
          return object instanceof this;
        };
      }
      function Writable(options) {
        Duplex = Duplex || require_stream_duplex();
        var isDuplex = this instanceof Duplex;
        if (!isDuplex && !realHasInstance.call(Writable, this))
          return new Writable(options);
        this._writableState = new WritableState(options, this, isDuplex);
        this.writable = true;
        if (options) {
          if (typeof options.write === "function")
            this._write = options.write;
          if (typeof options.writev === "function")
            this._writev = options.writev;
          if (typeof options.destroy === "function")
            this._destroy = options.destroy;
          if (typeof options.final === "function")
            this._final = options.final;
        }
        Stream.call(this);
      }
      Writable.prototype.pipe = function() {
        errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
      };
      function writeAfterEnd(stream, cb) {
        var er = new ERR_STREAM_WRITE_AFTER_END();
        errorOrDestroy(stream, er);
        process.nextTick(cb, er);
      }
      function validChunk(stream, state, chunk, cb) {
        var er;
        if (chunk === null) {
          er = new ERR_STREAM_NULL_VALUES();
        } else if (typeof chunk !== "string" && !state.objectMode) {
          er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
        }
        if (er) {
          errorOrDestroy(stream, er);
          process.nextTick(cb, er);
          return false;
        }
        return true;
      }
      Writable.prototype.write = function(chunk, encoding, cb) {
        var state = this._writableState;
        var ret = false;
        var isBuf = !state.objectMode && _isUint8Array(chunk);
        if (isBuf && !Buffer4.isBuffer(chunk)) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (isBuf)
          encoding = "buffer";
        else if (!encoding)
          encoding = state.defaultEncoding;
        if (typeof cb !== "function")
          cb = nop;
        if (state.ending)
          writeAfterEnd(this, cb);
        else if (isBuf || validChunk(this, state, chunk, cb)) {
          state.pendingcb++;
          ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
        }
        return ret;
      };
      Writable.prototype.cork = function() {
        this._writableState.corked++;
      };
      Writable.prototype.uncork = function() {
        var state = this._writableState;
        if (state.corked) {
          state.corked--;
          if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
            clearBuffer(this, state);
        }
      };
      Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
        if (typeof encoding === "string")
          encoding = encoding.toLowerCase();
        if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
          throw new ERR_UNKNOWN_ENCODING(encoding);
        this._writableState.defaultEncoding = encoding;
        return this;
      };
      Object.defineProperty(Writable.prototype, "writableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState && this._writableState.getBuffer();
        }
      });
      function decodeChunk(state, chunk, encoding) {
        if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
          chunk = Buffer4.from(chunk, encoding);
        }
        return chunk;
      }
      Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.highWaterMark;
        }
      });
      function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
        if (!isBuf) {
          var newChunk = decodeChunk(state, chunk, encoding);
          if (chunk !== newChunk) {
            isBuf = true;
            encoding = "buffer";
            chunk = newChunk;
          }
        }
        var len = state.objectMode ? 1 : chunk.length;
        state.length += len;
        var ret = state.length < state.highWaterMark;
        if (!ret)
          state.needDrain = true;
        if (state.writing || state.corked) {
          var last = state.lastBufferedRequest;
          state.lastBufferedRequest = {
            chunk,
            encoding,
            isBuf,
            callback: cb,
            next: null
          };
          if (last) {
            last.next = state.lastBufferedRequest;
          } else {
            state.bufferedRequest = state.lastBufferedRequest;
          }
          state.bufferedRequestCount += 1;
        } else {
          doWrite(stream, state, false, len, chunk, encoding, cb);
        }
        return ret;
      }
      function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len;
        state.writecb = cb;
        state.writing = true;
        state.sync = true;
        if (state.destroyed)
          state.onwrite(new ERR_STREAM_DESTROYED("write"));
        else if (writev)
          stream._writev(chunk, state.onwrite);
        else
          stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      function onwriteError(stream, state, sync, er, cb) {
        --state.pendingcb;
        if (sync) {
          process.nextTick(cb, er);
          process.nextTick(finishMaybe, stream, state);
          stream._writableState.errorEmitted = true;
          errorOrDestroy(stream, er);
        } else {
          cb(er);
          stream._writableState.errorEmitted = true;
          errorOrDestroy(stream, er);
          finishMaybe(stream, state);
        }
      }
      function onwriteStateUpdate(state) {
        state.writing = false;
        state.writecb = null;
        state.length -= state.writelen;
        state.writelen = 0;
      }
      function onwrite(stream, er) {
        var state = stream._writableState;
        var sync = state.sync;
        var cb = state.writecb;
        if (typeof cb !== "function")
          throw new ERR_MULTIPLE_CALLBACK();
        onwriteStateUpdate(state);
        if (er)
          onwriteError(stream, state, sync, er, cb);
        else {
          var finished = needFinish(state) || stream.destroyed;
          if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
            clearBuffer(stream, state);
          }
          if (sync) {
            process.nextTick(afterWrite, stream, state, finished, cb);
          } else {
            afterWrite(stream, state, finished, cb);
          }
        }
      }
      function afterWrite(stream, state, finished, cb) {
        if (!finished)
          onwriteDrain(stream, state);
        state.pendingcb--;
        cb();
        finishMaybe(stream, state);
      }
      function onwriteDrain(stream, state) {
        if (state.length === 0 && state.needDrain) {
          state.needDrain = false;
          stream.emit("drain");
        }
      }
      function clearBuffer(stream, state) {
        state.bufferProcessing = true;
        var entry = state.bufferedRequest;
        if (stream._writev && entry && entry.next) {
          var l = state.bufferedRequestCount;
          var buffer = new Array(l);
          var holder = state.corkedRequestsFree;
          holder.entry = entry;
          var count = 0;
          var allBuffers = true;
          while (entry) {
            buffer[count] = entry;
            if (!entry.isBuf)
              allBuffers = false;
            entry = entry.next;
            count += 1;
          }
          buffer.allBuffers = allBuffers;
          doWrite(stream, state, true, state.length, buffer, "", holder.finish);
          state.pendingcb++;
          state.lastBufferedRequest = null;
          if (holder.next) {
            state.corkedRequestsFree = holder.next;
            holder.next = null;
          } else {
            state.corkedRequestsFree = new CorkedRequest(state);
          }
          state.bufferedRequestCount = 0;
        } else {
          while (entry) {
            var chunk = entry.chunk;
            var encoding = entry.encoding;
            var cb = entry.callback;
            var len = state.objectMode ? 1 : chunk.length;
            doWrite(stream, state, false, len, chunk, encoding, cb);
            entry = entry.next;
            state.bufferedRequestCount--;
            if (state.writing) {
              break;
            }
          }
          if (entry === null)
            state.lastBufferedRequest = null;
        }
        state.bufferedRequest = entry;
        state.bufferProcessing = false;
      }
      Writable.prototype._write = function(chunk, encoding, cb) {
        cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
      };
      Writable.prototype._writev = null;
      Writable.prototype.end = function(chunk, encoding, cb) {
        var state = this._writableState;
        if (typeof chunk === "function") {
          cb = chunk;
          chunk = null;
          encoding = null;
        } else if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        if (chunk !== null && chunk !== void 0)
          this.write(chunk, encoding);
        if (state.corked) {
          state.corked = 1;
          this.uncork();
        }
        if (!state.ending)
          endWritable(this, state, cb);
        return this;
      };
      Object.defineProperty(Writable.prototype, "writableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.length;
        }
      });
      function needFinish(state) {
        return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
      }
      function callFinal(stream, state) {
        stream._final(function(err2) {
          state.pendingcb--;
          if (err2) {
            errorOrDestroy(stream, err2);
          }
          state.prefinished = true;
          stream.emit("prefinish");
          finishMaybe(stream, state);
        });
      }
      function prefinish(stream, state) {
        if (!state.prefinished && !state.finalCalled) {
          if (typeof stream._final === "function" && !state.destroyed) {
            state.pendingcb++;
            state.finalCalled = true;
            process.nextTick(callFinal, stream, state);
          } else {
            state.prefinished = true;
            stream.emit("prefinish");
          }
        }
      }
      function finishMaybe(stream, state) {
        var need = needFinish(state);
        if (need) {
          prefinish(stream, state);
          if (state.pendingcb === 0) {
            state.finished = true;
            stream.emit("finish");
            if (state.autoDestroy) {
              var rState = stream._readableState;
              if (!rState || rState.autoDestroy && rState.endEmitted) {
                stream.destroy();
              }
            }
          }
        }
        return need;
      }
      function endWritable(stream, state, cb) {
        state.ending = true;
        finishMaybe(stream, state);
        if (cb) {
          if (state.finished)
            process.nextTick(cb);
          else
            stream.once("finish", cb);
        }
        state.ended = true;
        stream.writable = false;
      }
      function onCorkedFinish(corkReq, state, err2) {
        var entry = corkReq.entry;
        corkReq.entry = null;
        while (entry) {
          var cb = entry.callback;
          state.pendingcb--;
          cb(err2);
          entry = entry.next;
        }
        state.corkedRequestsFree.next = corkReq;
      }
      Object.defineProperty(Writable.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._writableState === void 0) {
            return false;
          }
          return this._writableState.destroyed;
        },
        set: function set(value) {
          if (!this._writableState) {
            return;
          }
          this._writableState.destroyed = value;
        }
      });
      Writable.prototype.destroy = destroyImpl.destroy;
      Writable.prototype._undestroy = destroyImpl.undestroy;
      Writable.prototype._destroy = function(err2, cb) {
        cb(err2);
      };
    }
  });

  // node_modules/readable-stream/lib/_stream_duplex.js
  var require_stream_duplex = __commonJS({
    "node_modules/readable-stream/lib/_stream_duplex.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var objectKeys = Object.keys || function(obj) {
        var keys2 = [];
        for (var key in obj)
          keys2.push(key);
        return keys2;
      };
      module.exports = Duplex;
      var Readable = require_stream_readable();
      var Writable = require_stream_writable();
      require_inherits_browser()(Duplex, Readable);
      {
        keys = objectKeys(Writable.prototype);
        for (v = 0; v < keys.length; v++) {
          method = keys[v];
          if (!Duplex.prototype[method])
            Duplex.prototype[method] = Writable.prototype[method];
        }
      }
      var keys;
      var method;
      var v;
      function Duplex(options) {
        if (!(this instanceof Duplex))
          return new Duplex(options);
        Readable.call(this, options);
        Writable.call(this, options);
        this.allowHalfOpen = true;
        if (options) {
          if (options.readable === false)
            this.readable = false;
          if (options.writable === false)
            this.writable = false;
          if (options.allowHalfOpen === false) {
            this.allowHalfOpen = false;
            this.once("end", onend);
          }
        }
      }
      Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.highWaterMark;
        }
      });
      Object.defineProperty(Duplex.prototype, "writableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState && this._writableState.getBuffer();
        }
      });
      Object.defineProperty(Duplex.prototype, "writableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._writableState.length;
        }
      });
      function onend() {
        if (this._writableState.ended)
          return;
        process.nextTick(onEndNT, this);
      }
      function onEndNT(self2) {
        self2.end();
      }
      Object.defineProperty(Duplex.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set: function set(value) {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return;
          }
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      });
    }
  });

  // node_modules/safe-buffer/index.js
  var require_safe_buffer = __commonJS({
    "node_modules/safe-buffer/index.js"(exports, module) {
      init_process();
      init_buffer();
      var buffer = require_buffer();
      var Buffer4 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer4.from && Buffer4.alloc && Buffer4.allocUnsafe && Buffer4.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer4(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer4.prototype);
      copyProps(Buffer4, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer4(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill3, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer4(size);
        if (fill3 !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill3, encoding);
          } else {
            buf.fill(fill3);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer4(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // node_modules/string_decoder/lib/string_decoder.js
  var require_string_decoder2 = __commonJS({
    "node_modules/string_decoder/lib/string_decoder.js"(exports) {
      "use strict";
      init_process();
      init_buffer();
      var Buffer4 = require_safe_buffer().Buffer;
      var isEncoding3 = Buffer4.isEncoding || function(encoding) {
        encoding = "" + encoding;
        switch (encoding && encoding.toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
          case "raw":
            return true;
          default:
            return false;
        }
      };
      function _normalizeEncoding(enc) {
        if (!enc)
          return "utf8";
        var retried;
        while (true) {
          switch (enc) {
            case "utf8":
            case "utf-8":
              return "utf8";
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return "utf16le";
            case "latin1":
            case "binary":
              return "latin1";
            case "base64":
            case "ascii":
            case "hex":
              return enc;
            default:
              if (retried)
                return;
              enc = ("" + enc).toLowerCase();
              retried = true;
          }
        }
      }
      function normalizeEncoding(enc) {
        var nenc = _normalizeEncoding(enc);
        if (typeof nenc !== "string" && (Buffer4.isEncoding === isEncoding3 || !isEncoding3(enc)))
          throw new Error("Unknown encoding: " + enc);
        return nenc || enc;
      }
      exports.StringDecoder = StringDecoder2;
      function StringDecoder2(encoding) {
        this.encoding = normalizeEncoding(encoding);
        var nb;
        switch (this.encoding) {
          case "utf16le":
            this.text = utf16Text;
            this.end = utf16End;
            nb = 4;
            break;
          case "utf8":
            this.fillLast = utf8FillLast;
            nb = 4;
            break;
          case "base64":
            this.text = base64Text;
            this.end = base64End;
            nb = 3;
            break;
          default:
            this.write = simpleWrite;
            this.end = simpleEnd;
            return;
        }
        this.lastNeed = 0;
        this.lastTotal = 0;
        this.lastChar = Buffer4.allocUnsafe(nb);
      }
      StringDecoder2.prototype.write = function(buf) {
        if (buf.length === 0)
          return "";
        var r;
        var i;
        if (this.lastNeed) {
          r = this.fillLast(buf);
          if (r === void 0)
            return "";
          i = this.lastNeed;
          this.lastNeed = 0;
        } else {
          i = 0;
        }
        if (i < buf.length)
          return r ? r + this.text(buf, i) : this.text(buf, i);
        return r || "";
      };
      StringDecoder2.prototype.end = utf8End;
      StringDecoder2.prototype.text = utf8Text;
      StringDecoder2.prototype.fillLast = function(buf) {
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
        this.lastNeed -= buf.length;
      };
      function utf8CheckByte(byte) {
        if (byte <= 127)
          return 0;
        else if (byte >> 5 === 6)
          return 2;
        else if (byte >> 4 === 14)
          return 3;
        else if (byte >> 3 === 30)
          return 4;
        return byte >> 6 === 2 ? -1 : -2;
      }
      function utf8CheckIncomplete(self2, buf, i) {
        var j = buf.length - 1;
        if (j < i)
          return 0;
        var nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0)
            self2.lastNeed = nb - 1;
          return nb;
        }
        if (--j < i || nb === -2)
          return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0)
            self2.lastNeed = nb - 2;
          return nb;
        }
        if (--j < i || nb === -2)
          return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) {
            if (nb === 2)
              nb = 0;
            else
              self2.lastNeed = nb - 3;
          }
          return nb;
        }
        return 0;
      }
      function utf8CheckExtraBytes(self2, buf, p) {
        if ((buf[0] & 192) !== 128) {
          self2.lastNeed = 0;
          return "\uFFFD";
        }
        if (self2.lastNeed > 1 && buf.length > 1) {
          if ((buf[1] & 192) !== 128) {
            self2.lastNeed = 1;
            return "\uFFFD";
          }
          if (self2.lastNeed > 2 && buf.length > 2) {
            if ((buf[2] & 192) !== 128) {
              self2.lastNeed = 2;
              return "\uFFFD";
            }
          }
        }
      }
      function utf8FillLast(buf) {
        var p = this.lastTotal - this.lastNeed;
        var r = utf8CheckExtraBytes(this, buf, p);
        if (r !== void 0)
          return r;
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, p, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, p, 0, buf.length);
        this.lastNeed -= buf.length;
      }
      function utf8Text(buf, i) {
        var total = utf8CheckIncomplete(this, buf, i);
        if (!this.lastNeed)
          return buf.toString("utf8", i);
        this.lastTotal = total;
        var end = buf.length - (total - this.lastNeed);
        buf.copy(this.lastChar, 0, end);
        return buf.toString("utf8", i, end);
      }
      function utf8End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed)
          return r + "\uFFFD";
        return r;
      }
      function utf16Text(buf, i) {
        if ((buf.length - i) % 2 === 0) {
          var r = buf.toString("utf16le", i);
          if (r) {
            var c = r.charCodeAt(r.length - 1);
            if (c >= 55296 && c <= 56319) {
              this.lastNeed = 2;
              this.lastTotal = 4;
              this.lastChar[0] = buf[buf.length - 2];
              this.lastChar[1] = buf[buf.length - 1];
              return r.slice(0, -1);
            }
          }
          return r;
        }
        this.lastNeed = 1;
        this.lastTotal = 2;
        this.lastChar[0] = buf[buf.length - 1];
        return buf.toString("utf16le", i, buf.length - 1);
      }
      function utf16End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) {
          var end = this.lastTotal - this.lastNeed;
          return r + this.lastChar.toString("utf16le", 0, end);
        }
        return r;
      }
      function base64Text(buf, i) {
        var n = (buf.length - i) % 3;
        if (n === 0)
          return buf.toString("base64", i);
        this.lastNeed = 3 - n;
        this.lastTotal = 3;
        if (n === 1) {
          this.lastChar[0] = buf[buf.length - 1];
        } else {
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
        }
        return buf.toString("base64", i, buf.length - n);
      }
      function base64End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed)
          return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
        return r;
      }
      function simpleWrite(buf) {
        return buf.toString(this.encoding);
      }
      function simpleEnd(buf) {
        return buf && buf.length ? this.write(buf) : "";
      }
    }
  });

  // node_modules/readable-stream/lib/internal/streams/end-of-stream.js
  var require_end_of_stream = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var ERR_STREAM_PREMATURE_CLOSE = require_errors_browser().codes.ERR_STREAM_PREMATURE_CLOSE;
      function once4(callback) {
        var called = false;
        return function() {
          if (called)
            return;
          called = true;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          callback.apply(this, args);
        };
      }
      function noop3() {
      }
      function isRequest(stream) {
        return stream.setHeader && typeof stream.abort === "function";
      }
      function eos(stream, opts, callback) {
        if (typeof opts === "function")
          return eos(stream, null, opts);
        if (!opts)
          opts = {};
        callback = once4(callback || noop3);
        var readable = opts.readable || opts.readable !== false && stream.readable;
        var writable = opts.writable || opts.writable !== false && stream.writable;
        var onlegacyfinish = function onlegacyfinish2() {
          if (!stream.writable)
            onfinish();
        };
        var writableEnded = stream._writableState && stream._writableState.finished;
        var onfinish = function onfinish2() {
          writable = false;
          writableEnded = true;
          if (!readable)
            callback.call(stream);
        };
        var readableEnded = stream._readableState && stream._readableState.endEmitted;
        var onend = function onend2() {
          readable = false;
          readableEnded = true;
          if (!writable)
            callback.call(stream);
        };
        var onerror = function onerror2(err2) {
          callback.call(stream, err2);
        };
        var onclose = function onclose2() {
          var err2;
          if (readable && !readableEnded) {
            if (!stream._readableState || !stream._readableState.ended)
              err2 = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err2);
          }
          if (writable && !writableEnded) {
            if (!stream._writableState || !stream._writableState.ended)
              err2 = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err2);
          }
        };
        var onrequest = function onrequest2() {
          stream.req.on("finish", onfinish);
        };
        if (isRequest(stream)) {
          stream.on("complete", onfinish);
          stream.on("abort", onclose);
          if (stream.req)
            onrequest();
          else
            stream.on("request", onrequest);
        } else if (writable && !stream._writableState) {
          stream.on("end", onlegacyfinish);
          stream.on("close", onlegacyfinish);
        }
        stream.on("end", onend);
        stream.on("finish", onfinish);
        if (opts.error !== false)
          stream.on("error", onerror);
        stream.on("close", onclose);
        return function() {
          stream.removeListener("complete", onfinish);
          stream.removeListener("abort", onclose);
          stream.removeListener("request", onrequest);
          if (stream.req)
            stream.req.removeListener("finish", onfinish);
          stream.removeListener("end", onlegacyfinish);
          stream.removeListener("close", onlegacyfinish);
          stream.removeListener("finish", onfinish);
          stream.removeListener("end", onend);
          stream.removeListener("error", onerror);
          stream.removeListener("close", onclose);
        };
      }
      module.exports = eos;
    }
  });

  // node_modules/readable-stream/lib/internal/streams/async_iterator.js
  var require_async_iterator = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/async_iterator.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var _Object$setPrototypeO;
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null)
          return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object")
            return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      var finished = require_end_of_stream();
      var kLastResolve = Symbol("lastResolve");
      var kLastReject = Symbol("lastReject");
      var kError = Symbol("error");
      var kEnded = Symbol("ended");
      var kLastPromise = Symbol("lastPromise");
      var kHandlePromise = Symbol("handlePromise");
      var kStream = Symbol("stream");
      function createIterResult(value, done) {
        return {
          value,
          done
        };
      }
      function readAndResolve(iter) {
        var resolve = iter[kLastResolve];
        if (resolve !== null) {
          var data = iter[kStream].read();
          if (data !== null) {
            iter[kLastPromise] = null;
            iter[kLastResolve] = null;
            iter[kLastReject] = null;
            resolve(createIterResult(data, false));
          }
        }
      }
      function onReadable(iter) {
        process.nextTick(readAndResolve, iter);
      }
      function wrapForNext(lastPromise, iter) {
        return function(resolve, reject) {
          lastPromise.then(function() {
            if (iter[kEnded]) {
              resolve(createIterResult(void 0, true));
              return;
            }
            iter[kHandlePromise](resolve, reject);
          }, reject);
        };
      }
      var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
      });
      var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
        get stream() {
          return this[kStream];
        },
        next: function next() {
          var _this = this;
          var error = this[kError];
          if (error !== null) {
            return Promise.reject(error);
          }
          if (this[kEnded]) {
            return Promise.resolve(createIterResult(void 0, true));
          }
          if (this[kStream].destroyed) {
            return new Promise(function(resolve, reject) {
              process.nextTick(function() {
                if (_this[kError]) {
                  reject(_this[kError]);
                } else {
                  resolve(createIterResult(void 0, true));
                }
              });
            });
          }
          var lastPromise = this[kLastPromise];
          var promise;
          if (lastPromise) {
            promise = new Promise(wrapForNext(lastPromise, this));
          } else {
            var data = this[kStream].read();
            if (data !== null) {
              return Promise.resolve(createIterResult(data, false));
            }
            promise = new Promise(this[kHandlePromise]);
          }
          this[kLastPromise] = promise;
          return promise;
        }
      }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
        return this;
      }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
        var _this2 = this;
        return new Promise(function(resolve, reject) {
          _this2[kStream].destroy(null, function(err2) {
            if (err2) {
              reject(err2);
              return;
            }
            resolve(createIterResult(void 0, true));
          });
        });
      }), _Object$setPrototypeO), AsyncIteratorPrototype);
      var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
        var _Object$create;
        var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
          value: stream,
          writable: true
        }), _defineProperty(_Object$create, kLastResolve, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kLastReject, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kError, {
          value: null,
          writable: true
        }), _defineProperty(_Object$create, kEnded, {
          value: stream._readableState.endEmitted,
          writable: true
        }), _defineProperty(_Object$create, kHandlePromise, {
          value: function value(resolve, reject) {
            var data = iterator[kStream].read();
            if (data) {
              iterator[kLastPromise] = null;
              iterator[kLastResolve] = null;
              iterator[kLastReject] = null;
              resolve(createIterResult(data, false));
            } else {
              iterator[kLastResolve] = resolve;
              iterator[kLastReject] = reject;
            }
          },
          writable: true
        }), _Object$create));
        iterator[kLastPromise] = null;
        finished(stream, function(err2) {
          if (err2 && err2.code !== "ERR_STREAM_PREMATURE_CLOSE") {
            var reject = iterator[kLastReject];
            if (reject !== null) {
              iterator[kLastPromise] = null;
              iterator[kLastResolve] = null;
              iterator[kLastReject] = null;
              reject(err2);
            }
            iterator[kError] = err2;
            return;
          }
          var resolve = iterator[kLastResolve];
          if (resolve !== null) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            resolve(createIterResult(void 0, true));
          }
          iterator[kEnded] = true;
        });
        stream.on("readable", onReadable.bind(null, iterator));
        return iterator;
      };
      module.exports = createReadableStreamAsyncIterator;
    }
  });

  // node_modules/readable-stream/lib/internal/streams/from-browser.js
  var require_from_browser = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/from-browser.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = function() {
        throw new Error("Readable.from is not available in the browser");
      };
    }
  });

  // node_modules/readable-stream/lib/_stream_readable.js
  var require_stream_readable = __commonJS({
    "node_modules/readable-stream/lib/_stream_readable.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = Readable;
      var Duplex;
      Readable.ReadableState = ReadableState;
      var EE = require_events().EventEmitter;
      var EElistenerCount = function EElistenerCount2(emitter, type) {
        return emitter.listeners(type).length;
      };
      var Stream = require_stream_browser();
      var Buffer4 = require_buffer().Buffer;
      var OurUint8Array = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
      };
      function _uint8ArrayToBuffer(chunk) {
        return Buffer4.from(chunk);
      }
      function _isUint8Array(obj) {
        return Buffer4.isBuffer(obj) || obj instanceof OurUint8Array;
      }
      var debugUtil = require_util();
      var debug;
      if (debugUtil && debugUtil.debuglog) {
        debug = debugUtil.debuglog("stream");
      } else {
        debug = function debug2() {
        };
      }
      var BufferList = require_buffer_list();
      var destroyImpl = require_destroy();
      var _require = require_state();
      var getHighWaterMark = _require.getHighWaterMark;
      var _require$codes = require_errors_browser().codes;
      var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
      var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
      var StringDecoder2;
      var createReadableStreamAsyncIterator;
      var from3;
      require_inherits_browser()(Readable, Stream);
      var errorOrDestroy = destroyImpl.errorOrDestroy;
      var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
      function prependListener2(emitter, event, fn) {
        if (typeof emitter.prependListener === "function")
          return emitter.prependListener(event, fn);
        if (!emitter._events || !emitter._events[event])
          emitter.on(event, fn);
        else if (Array.isArray(emitter._events[event]))
          emitter._events[event].unshift(fn);
        else
          emitter._events[event] = [fn, emitter._events[event]];
      }
      function ReadableState(options, stream, isDuplex) {
        Duplex = Duplex || require_stream_duplex();
        options = options || {};
        if (typeof isDuplex !== "boolean")
          isDuplex = stream instanceof Duplex;
        this.objectMode = !!options.objectMode;
        if (isDuplex)
          this.objectMode = this.objectMode || !!options.readableObjectMode;
        this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
        this.buffer = new BufferList();
        this.length = 0;
        this.pipes = null;
        this.pipesCount = 0;
        this.flowing = null;
        this.ended = false;
        this.endEmitted = false;
        this.reading = false;
        this.sync = true;
        this.needReadable = false;
        this.emittedReadable = false;
        this.readableListening = false;
        this.resumeScheduled = false;
        this.paused = true;
        this.emitClose = options.emitClose !== false;
        this.autoDestroy = !!options.autoDestroy;
        this.destroyed = false;
        this.defaultEncoding = options.defaultEncoding || "utf8";
        this.awaitDrain = 0;
        this.readingMore = false;
        this.decoder = null;
        this.encoding = null;
        if (options.encoding) {
          if (!StringDecoder2)
            StringDecoder2 = require_string_decoder2().StringDecoder;
          this.decoder = new StringDecoder2(options.encoding);
          this.encoding = options.encoding;
        }
      }
      function Readable(options) {
        Duplex = Duplex || require_stream_duplex();
        if (!(this instanceof Readable))
          return new Readable(options);
        var isDuplex = this instanceof Duplex;
        this._readableState = new ReadableState(options, this, isDuplex);
        this.readable = true;
        if (options) {
          if (typeof options.read === "function")
            this._read = options.read;
          if (typeof options.destroy === "function")
            this._destroy = options.destroy;
        }
        Stream.call(this);
      }
      Object.defineProperty(Readable.prototype, "destroyed", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          if (this._readableState === void 0) {
            return false;
          }
          return this._readableState.destroyed;
        },
        set: function set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        }
      });
      Readable.prototype.destroy = destroyImpl.destroy;
      Readable.prototype._undestroy = destroyImpl.undestroy;
      Readable.prototype._destroy = function(err2, cb) {
        cb(err2);
      };
      Readable.prototype.push = function(chunk, encoding) {
        var state = this._readableState;
        var skipChunkCheck;
        if (!state.objectMode) {
          if (typeof chunk === "string") {
            encoding = encoding || state.defaultEncoding;
            if (encoding !== state.encoding) {
              chunk = Buffer4.from(chunk, encoding);
              encoding = "";
            }
            skipChunkCheck = true;
          }
        } else {
          skipChunkCheck = true;
        }
        return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
      };
      Readable.prototype.unshift = function(chunk) {
        return readableAddChunk(this, chunk, null, true, false);
      };
      function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
        debug("readableAddChunk", chunk);
        var state = stream._readableState;
        if (chunk === null) {
          state.reading = false;
          onEofChunk(stream, state);
        } else {
          var er;
          if (!skipChunkCheck)
            er = chunkInvalid(state, chunk);
          if (er) {
            errorOrDestroy(stream, er);
          } else if (state.objectMode || chunk && chunk.length > 0) {
            if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer4.prototype) {
              chunk = _uint8ArrayToBuffer(chunk);
            }
            if (addToFront) {
              if (state.endEmitted)
                errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
              else
                addChunk(stream, state, chunk, true);
            } else if (state.ended) {
              errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
            } else if (state.destroyed) {
              return false;
            } else {
              state.reading = false;
              if (state.decoder && !encoding) {
                chunk = state.decoder.write(chunk);
                if (state.objectMode || chunk.length !== 0)
                  addChunk(stream, state, chunk, false);
                else
                  maybeReadMore(stream, state);
              } else {
                addChunk(stream, state, chunk, false);
              }
            }
          } else if (!addToFront) {
            state.reading = false;
            maybeReadMore(stream, state);
          }
        }
        return !state.ended && (state.length < state.highWaterMark || state.length === 0);
      }
      function addChunk(stream, state, chunk, addToFront) {
        if (state.flowing && state.length === 0 && !state.sync) {
          state.awaitDrain = 0;
          stream.emit("data", chunk);
        } else {
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront)
            state.buffer.unshift(chunk);
          else
            state.buffer.push(chunk);
          if (state.needReadable)
            emitReadable(stream);
        }
        maybeReadMore(stream, state);
      }
      function chunkInvalid(state, chunk) {
        var er;
        if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
          er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
        return er;
      }
      Readable.prototype.isPaused = function() {
        return this._readableState.flowing === false;
      };
      Readable.prototype.setEncoding = function(enc) {
        if (!StringDecoder2)
          StringDecoder2 = require_string_decoder2().StringDecoder;
        var decoder = new StringDecoder2(enc);
        this._readableState.decoder = decoder;
        this._readableState.encoding = this._readableState.decoder.encoding;
        var p = this._readableState.buffer.head;
        var content = "";
        while (p !== null) {
          content += decoder.write(p.data);
          p = p.next;
        }
        this._readableState.buffer.clear();
        if (content !== "")
          this._readableState.buffer.push(content);
        this._readableState.length = content.length;
        return this;
      };
      var MAX_HWM = 1073741824;
      function computeNewHighWaterMark(n) {
        if (n >= MAX_HWM) {
          n = MAX_HWM;
        } else {
          n--;
          n |= n >>> 1;
          n |= n >>> 2;
          n |= n >>> 4;
          n |= n >>> 8;
          n |= n >>> 16;
          n++;
        }
        return n;
      }
      function howMuchToRead(n, state) {
        if (n <= 0 || state.length === 0 && state.ended)
          return 0;
        if (state.objectMode)
          return 1;
        if (n !== n) {
          if (state.flowing && state.length)
            return state.buffer.head.data.length;
          else
            return state.length;
        }
        if (n > state.highWaterMark)
          state.highWaterMark = computeNewHighWaterMark(n);
        if (n <= state.length)
          return n;
        if (!state.ended) {
          state.needReadable = true;
          return 0;
        }
        return state.length;
      }
      Readable.prototype.read = function(n) {
        debug("read", n);
        n = parseInt(n, 10);
        var state = this._readableState;
        var nOrig = n;
        if (n !== 0)
          state.emittedReadable = false;
        if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
          debug("read: emitReadable", state.length, state.ended);
          if (state.length === 0 && state.ended)
            endReadable(this);
          else
            emitReadable(this);
          return null;
        }
        n = howMuchToRead(n, state);
        if (n === 0 && state.ended) {
          if (state.length === 0)
            endReadable(this);
          return null;
        }
        var doRead = state.needReadable;
        debug("need readable", doRead);
        if (state.length === 0 || state.length - n < state.highWaterMark) {
          doRead = true;
          debug("length less than watermark", doRead);
        }
        if (state.ended || state.reading) {
          doRead = false;
          debug("reading or ended", doRead);
        } else if (doRead) {
          debug("do read");
          state.reading = true;
          state.sync = true;
          if (state.length === 0)
            state.needReadable = true;
          this._read(state.highWaterMark);
          state.sync = false;
          if (!state.reading)
            n = howMuchToRead(nOrig, state);
        }
        var ret;
        if (n > 0)
          ret = fromList(n, state);
        else
          ret = null;
        if (ret === null) {
          state.needReadable = state.length <= state.highWaterMark;
          n = 0;
        } else {
          state.length -= n;
          state.awaitDrain = 0;
        }
        if (state.length === 0) {
          if (!state.ended)
            state.needReadable = true;
          if (nOrig !== n && state.ended)
            endReadable(this);
        }
        if (ret !== null)
          this.emit("data", ret);
        return ret;
      };
      function onEofChunk(stream, state) {
        debug("onEofChunk");
        if (state.ended)
          return;
        if (state.decoder) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
          }
        }
        state.ended = true;
        if (state.sync) {
          emitReadable(stream);
        } else {
          state.needReadable = false;
          if (!state.emittedReadable) {
            state.emittedReadable = true;
            emitReadable_(stream);
          }
        }
      }
      function emitReadable(stream) {
        var state = stream._readableState;
        debug("emitReadable", state.needReadable, state.emittedReadable);
        state.needReadable = false;
        if (!state.emittedReadable) {
          debug("emitReadable", state.flowing);
          state.emittedReadable = true;
          process.nextTick(emitReadable_, stream);
        }
      }
      function emitReadable_(stream) {
        var state = stream._readableState;
        debug("emitReadable_", state.destroyed, state.length, state.ended);
        if (!state.destroyed && (state.length || state.ended)) {
          stream.emit("readable");
          state.emittedReadable = false;
        }
        state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
        flow(stream);
      }
      function maybeReadMore(stream, state) {
        if (!state.readingMore) {
          state.readingMore = true;
          process.nextTick(maybeReadMore_, stream, state);
        }
      }
      function maybeReadMore_(stream, state) {
        while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
          var len = state.length;
          debug("maybeReadMore read 0");
          stream.read(0);
          if (len === state.length)
            break;
        }
        state.readingMore = false;
      }
      Readable.prototype._read = function(n) {
        errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
      };
      Readable.prototype.pipe = function(dest, pipeOpts) {
        var src = this;
        var state = this._readableState;
        switch (state.pipesCount) {
          case 0:
            state.pipes = dest;
            break;
          case 1:
            state.pipes = [state.pipes, dest];
            break;
          default:
            state.pipes.push(dest);
            break;
        }
        state.pipesCount += 1;
        debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
        var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
        var endFn = doEnd ? onend : unpipe;
        if (state.endEmitted)
          process.nextTick(endFn);
        else
          src.once("end", endFn);
        dest.on("unpipe", onunpipe);
        function onunpipe(readable, unpipeInfo) {
          debug("onunpipe");
          if (readable === src) {
            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
              unpipeInfo.hasUnpiped = true;
              cleanup();
            }
          }
        }
        function onend() {
          debug("onend");
          dest.end();
        }
        var ondrain = pipeOnDrain(src);
        dest.on("drain", ondrain);
        var cleanedUp = false;
        function cleanup() {
          debug("cleanup");
          dest.removeListener("close", onclose);
          dest.removeListener("finish", onfinish);
          dest.removeListener("drain", ondrain);
          dest.removeListener("error", onerror);
          dest.removeListener("unpipe", onunpipe);
          src.removeListener("end", onend);
          src.removeListener("end", unpipe);
          src.removeListener("data", ondata);
          cleanedUp = true;
          if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
            ondrain();
        }
        src.on("data", ondata);
        function ondata(chunk) {
          debug("ondata");
          var ret = dest.write(chunk);
          debug("dest.write", ret);
          if (ret === false) {
            if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf3(state.pipes, dest) !== -1) && !cleanedUp) {
              debug("false write response, pause", state.awaitDrain);
              state.awaitDrain++;
            }
            src.pause();
          }
        }
        function onerror(er) {
          debug("onerror", er);
          unpipe();
          dest.removeListener("error", onerror);
          if (EElistenerCount(dest, "error") === 0)
            errorOrDestroy(dest, er);
        }
        prependListener2(dest, "error", onerror);
        function onclose() {
          dest.removeListener("finish", onfinish);
          unpipe();
        }
        dest.once("close", onclose);
        function onfinish() {
          debug("onfinish");
          dest.removeListener("close", onclose);
          unpipe();
        }
        dest.once("finish", onfinish);
        function unpipe() {
          debug("unpipe");
          src.unpipe(dest);
        }
        dest.emit("pipe", src);
        if (!state.flowing) {
          debug("pipe resume");
          src.resume();
        }
        return dest;
      };
      function pipeOnDrain(src) {
        return function pipeOnDrainFunctionResult() {
          var state = src._readableState;
          debug("pipeOnDrain", state.awaitDrain);
          if (state.awaitDrain)
            state.awaitDrain--;
          if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
            state.flowing = true;
            flow(src);
          }
        };
      }
      Readable.prototype.unpipe = function(dest) {
        var state = this._readableState;
        var unpipeInfo = {
          hasUnpiped: false
        };
        if (state.pipesCount === 0)
          return this;
        if (state.pipesCount === 1) {
          if (dest && dest !== state.pipes)
            return this;
          if (!dest)
            dest = state.pipes;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          if (dest)
            dest.emit("unpipe", this, unpipeInfo);
          return this;
        }
        if (!dest) {
          var dests = state.pipes;
          var len = state.pipesCount;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          for (var i = 0; i < len; i++)
            dests[i].emit("unpipe", this, {
              hasUnpiped: false
            });
          return this;
        }
        var index = indexOf3(state.pipes, dest);
        if (index === -1)
          return this;
        state.pipes.splice(index, 1);
        state.pipesCount -= 1;
        if (state.pipesCount === 1)
          state.pipes = state.pipes[0];
        dest.emit("unpipe", this, unpipeInfo);
        return this;
      };
      Readable.prototype.on = function(ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);
        var state = this._readableState;
        if (ev === "data") {
          state.readableListening = this.listenerCount("readable") > 0;
          if (state.flowing !== false)
            this.resume();
        } else if (ev === "readable") {
          if (!state.endEmitted && !state.readableListening) {
            state.readableListening = state.needReadable = true;
            state.flowing = false;
            state.emittedReadable = false;
            debug("on readable", state.length, state.reading);
            if (state.length) {
              emitReadable(this);
            } else if (!state.reading) {
              process.nextTick(nReadingNextTick, this);
            }
          }
        }
        return res;
      };
      Readable.prototype.addListener = Readable.prototype.on;
      Readable.prototype.removeListener = function(ev, fn) {
        var res = Stream.prototype.removeListener.call(this, ev, fn);
        if (ev === "readable") {
          process.nextTick(updateReadableListening, this);
        }
        return res;
      };
      Readable.prototype.removeAllListeners = function(ev) {
        var res = Stream.prototype.removeAllListeners.apply(this, arguments);
        if (ev === "readable" || ev === void 0) {
          process.nextTick(updateReadableListening, this);
        }
        return res;
      };
      function updateReadableListening(self2) {
        var state = self2._readableState;
        state.readableListening = self2.listenerCount("readable") > 0;
        if (state.resumeScheduled && !state.paused) {
          state.flowing = true;
        } else if (self2.listenerCount("data") > 0) {
          self2.resume();
        }
      }
      function nReadingNextTick(self2) {
        debug("readable nexttick read 0");
        self2.read(0);
      }
      Readable.prototype.resume = function() {
        var state = this._readableState;
        if (!state.flowing) {
          debug("resume");
          state.flowing = !state.readableListening;
          resume(this, state);
        }
        state.paused = false;
        return this;
      };
      function resume(stream, state) {
        if (!state.resumeScheduled) {
          state.resumeScheduled = true;
          process.nextTick(resume_, stream, state);
        }
      }
      function resume_(stream, state) {
        debug("resume", state.reading);
        if (!state.reading) {
          stream.read(0);
        }
        state.resumeScheduled = false;
        stream.emit("resume");
        flow(stream);
        if (state.flowing && !state.reading)
          stream.read(0);
      }
      Readable.prototype.pause = function() {
        debug("call pause flowing=%j", this._readableState.flowing);
        if (this._readableState.flowing !== false) {
          debug("pause");
          this._readableState.flowing = false;
          this.emit("pause");
        }
        this._readableState.paused = true;
        return this;
      };
      function flow(stream) {
        var state = stream._readableState;
        debug("flow", state.flowing);
        while (state.flowing && stream.read() !== null)
          ;
      }
      Readable.prototype.wrap = function(stream) {
        var _this = this;
        var state = this._readableState;
        var paused = false;
        stream.on("end", function() {
          debug("wrapped end");
          if (state.decoder && !state.ended) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length)
              _this.push(chunk);
          }
          _this.push(null);
        });
        stream.on("data", function(chunk) {
          debug("wrapped data");
          if (state.decoder)
            chunk = state.decoder.write(chunk);
          if (state.objectMode && (chunk === null || chunk === void 0))
            return;
          else if (!state.objectMode && (!chunk || !chunk.length))
            return;
          var ret = _this.push(chunk);
          if (!ret) {
            paused = true;
            stream.pause();
          }
        });
        for (var i in stream) {
          if (this[i] === void 0 && typeof stream[i] === "function") {
            this[i] = /* @__PURE__ */ function methodWrap(method) {
              return function methodWrapReturnFunction() {
                return stream[method].apply(stream, arguments);
              };
            }(i);
          }
        }
        for (var n = 0; n < kProxyEvents.length; n++) {
          stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
        }
        this._read = function(n2) {
          debug("wrapped _read", n2);
          if (paused) {
            paused = false;
            stream.resume();
          }
        };
        return this;
      };
      if (typeof Symbol === "function") {
        Readable.prototype[Symbol.asyncIterator] = function() {
          if (createReadableStreamAsyncIterator === void 0) {
            createReadableStreamAsyncIterator = require_async_iterator();
          }
          return createReadableStreamAsyncIterator(this);
        };
      }
      Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.highWaterMark;
        }
      });
      Object.defineProperty(Readable.prototype, "readableBuffer", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState && this._readableState.buffer;
        }
      });
      Object.defineProperty(Readable.prototype, "readableFlowing", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.flowing;
        },
        set: function set(state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        }
      });
      Readable._fromList = fromList;
      Object.defineProperty(Readable.prototype, "readableLength", {
        // making it explicit this property is not enumerable
        // because otherwise some prototype manipulation in
        // userland will fail
        enumerable: false,
        get: function get() {
          return this._readableState.length;
        }
      });
      function fromList(n, state) {
        if (state.length === 0)
          return null;
        var ret;
        if (state.objectMode)
          ret = state.buffer.shift();
        else if (!n || n >= state.length) {
          if (state.decoder)
            ret = state.buffer.join("");
          else if (state.buffer.length === 1)
            ret = state.buffer.first();
          else
            ret = state.buffer.concat(state.length);
          state.buffer.clear();
        } else {
          ret = state.buffer.consume(n, state.decoder);
        }
        return ret;
      }
      function endReadable(stream) {
        var state = stream._readableState;
        debug("endReadable", state.endEmitted);
        if (!state.endEmitted) {
          state.ended = true;
          process.nextTick(endReadableNT, state, stream);
        }
      }
      function endReadableNT(state, stream) {
        debug("endReadableNT", state.endEmitted, state.length);
        if (!state.endEmitted && state.length === 0) {
          state.endEmitted = true;
          stream.readable = false;
          stream.emit("end");
          if (state.autoDestroy) {
            var wState = stream._writableState;
            if (!wState || wState.autoDestroy && wState.finished) {
              stream.destroy();
            }
          }
        }
      }
      if (typeof Symbol === "function") {
        Readable.from = function(iterable, opts) {
          if (from3 === void 0) {
            from3 = require_from_browser();
          }
          return from3(Readable, iterable, opts);
        };
      }
      function indexOf3(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x)
            return i;
        }
        return -1;
      }
    }
  });

  // node_modules/readable-stream/lib/_stream_transform.js
  var require_stream_transform = __commonJS({
    "node_modules/readable-stream/lib/_stream_transform.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = Transform;
      var _require$codes = require_errors_browser().codes;
      var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
      var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
      var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
      var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
      var Duplex = require_stream_duplex();
      require_inherits_browser()(Transform, Duplex);
      function afterTransform(er, data) {
        var ts = this._transformState;
        ts.transforming = false;
        var cb = ts.writecb;
        if (cb === null) {
          return this.emit("error", new ERR_MULTIPLE_CALLBACK());
        }
        ts.writechunk = null;
        ts.writecb = null;
        if (data != null)
          this.push(data);
        cb(er);
        var rs = this._readableState;
        rs.reading = false;
        if (rs.needReadable || rs.length < rs.highWaterMark) {
          this._read(rs.highWaterMark);
        }
      }
      function Transform(options) {
        if (!(this instanceof Transform))
          return new Transform(options);
        Duplex.call(this, options);
        this._transformState = {
          afterTransform: afterTransform.bind(this),
          needTransform: false,
          transforming: false,
          writecb: null,
          writechunk: null,
          writeencoding: null
        };
        this._readableState.needReadable = true;
        this._readableState.sync = false;
        if (options) {
          if (typeof options.transform === "function")
            this._transform = options.transform;
          if (typeof options.flush === "function")
            this._flush = options.flush;
        }
        this.on("prefinish", prefinish);
      }
      function prefinish() {
        var _this = this;
        if (typeof this._flush === "function" && !this._readableState.destroyed) {
          this._flush(function(er, data) {
            done(_this, er, data);
          });
        } else {
          done(this, null, null);
        }
      }
      Transform.prototype.push = function(chunk, encoding) {
        this._transformState.needTransform = false;
        return Duplex.prototype.push.call(this, chunk, encoding);
      };
      Transform.prototype._transform = function(chunk, encoding, cb) {
        cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
      };
      Transform.prototype._write = function(chunk, encoding, cb) {
        var ts = this._transformState;
        ts.writecb = cb;
        ts.writechunk = chunk;
        ts.writeencoding = encoding;
        if (!ts.transforming) {
          var rs = this._readableState;
          if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
            this._read(rs.highWaterMark);
        }
      };
      Transform.prototype._read = function(n) {
        var ts = this._transformState;
        if (ts.writechunk !== null && !ts.transforming) {
          ts.transforming = true;
          this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
        } else {
          ts.needTransform = true;
        }
      };
      Transform.prototype._destroy = function(err2, cb) {
        Duplex.prototype._destroy.call(this, err2, function(err22) {
          cb(err22);
        });
      };
      function done(stream, er, data) {
        if (er)
          return stream.emit("error", er);
        if (data != null)
          stream.push(data);
        if (stream._writableState.length)
          throw new ERR_TRANSFORM_WITH_LENGTH_0();
        if (stream._transformState.transforming)
          throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
        return stream.push(null);
      }
    }
  });

  // node_modules/readable-stream/lib/_stream_passthrough.js
  var require_stream_passthrough = __commonJS({
    "node_modules/readable-stream/lib/_stream_passthrough.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = PassThrough;
      var Transform = require_stream_transform();
      require_inherits_browser()(PassThrough, Transform);
      function PassThrough(options) {
        if (!(this instanceof PassThrough))
          return new PassThrough(options);
        Transform.call(this, options);
      }
      PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/pipeline.js
  var require_pipeline = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var eos;
      function once4(callback) {
        var called = false;
        return function() {
          if (called)
            return;
          called = true;
          callback.apply(void 0, arguments);
        };
      }
      var _require$codes = require_errors_browser().codes;
      var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
      var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
      function noop3(err2) {
        if (err2)
          throw err2;
      }
      function isRequest(stream) {
        return stream.setHeader && typeof stream.abort === "function";
      }
      function destroyer(stream, reading, writing, callback) {
        callback = once4(callback);
        var closed = false;
        stream.on("close", function() {
          closed = true;
        });
        if (eos === void 0)
          eos = require_end_of_stream();
        eos(stream, {
          readable: reading,
          writable: writing
        }, function(err2) {
          if (err2)
            return callback(err2);
          closed = true;
          callback();
        });
        var destroyed = false;
        return function(err2) {
          if (closed)
            return;
          if (destroyed)
            return;
          destroyed = true;
          if (isRequest(stream))
            return stream.abort();
          if (typeof stream.destroy === "function")
            return stream.destroy();
          callback(err2 || new ERR_STREAM_DESTROYED("pipe"));
        };
      }
      function call(fn) {
        fn();
      }
      function pipe(from3, to) {
        return from3.pipe(to);
      }
      function popCallback(streams) {
        if (!streams.length)
          return noop3;
        if (typeof streams[streams.length - 1] !== "function")
          return noop3;
        return streams.pop();
      }
      function pipeline() {
        for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
          streams[_key] = arguments[_key];
        }
        var callback = popCallback(streams);
        if (Array.isArray(streams[0]))
          streams = streams[0];
        if (streams.length < 2) {
          throw new ERR_MISSING_ARGS("streams");
        }
        var error;
        var destroys = streams.map(function(stream, i) {
          var reading = i < streams.length - 1;
          var writing = i > 0;
          return destroyer(stream, reading, writing, function(err2) {
            if (!error)
              error = err2;
            if (err2)
              destroys.forEach(call);
            if (reading)
              return;
            destroys.forEach(call);
            callback(error);
          });
        });
        return streams.reduce(pipe);
      }
      module.exports = pipeline;
    }
  });

  // node_modules/readable-stream/readable-browser.js
  var require_readable_browser = __commonJS({
    "node_modules/readable-stream/readable-browser.js"(exports, module) {
      init_process();
      init_buffer();
      exports = module.exports = require_stream_readable();
      exports.Stream = exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
      exports.finished = require_end_of_stream();
      exports.pipeline = require_pipeline();
    }
  });

  // node_modules/gerber-parser/lib/_determine-filetype.js
  var require_determine_filetype = __commonJS({
    "node_modules/gerber-parser/lib/_determine-filetype.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var determine = function(chunk, start, LIMIT) {
        var limit = Math.min(LIMIT - start, chunk.length);
        var current = [];
        var filetype = null;
        var index = -1;
        while (!filetype && ++index < limit) {
          var c = chunk[index];
          if (c === "\n") {
            if (current.length + index) {
              filetype = "drill";
              current = [];
            }
          } else {
            current.push(c);
            if (c === "*" && current[0] !== ";") {
              filetype = "gerber";
              current = [];
            }
          }
        }
        return filetype;
      };
      module.exports = determine;
    }
  });

  // node_modules/gerber-parser/lib/get-next-block.js
  var require_get_next_block = __commonJS({
    "node_modules/gerber-parser/lib/get-next-block.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var getNext = function(type, chunk, start) {
        if (type !== "gerber" && type !== "drill") {
          throw new Error('filetype to get next block must be "drill" or "gerber"');
        }
        var limit = chunk.length - start;
        var split = type === "gerber" ? "*" : "\n";
        var param = type === "gerber" ? "%" : "";
        var splitFound = false;
        var paramStarted = false;
        var paramFound = false;
        var blockFound = false;
        var found = [];
        var read2 = 0;
        var lines = 0;
        while (!blockFound && read2 < limit) {
          var c = chunk[start + read2];
          if (c === "\n") {
            lines++;
          }
          if (c === param) {
            if (!paramStarted) {
              paramStarted = true;
              found.push(c);
            } else {
              paramFound = true;
              found.pop();
            }
          } else if (c === split) {
            splitFound = true;
            if (paramStarted) {
              found.push(c);
            }
          } else if (c >= " " && c <= "~") {
            found.push(c);
          }
          read2++;
          blockFound = splitFound && (!paramStarted || paramFound);
        }
        var block = blockFound ? found.join("").trim() : "";
        var rem = !blockFound ? found.join("") : "";
        return { lines, read: read2, block, rem };
      };
      module.exports = getNext;
    }
  });

  // node_modules/gerber-parser/lib/_commands.js
  var require_commands = __commonJS({
    "node_modules/gerber-parser/lib/_commands.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var done = function(line) {
        return { type: "done", line: line || -1 };
      };
      var set = function(property, value, line) {
        return { type: "set", line: line || -1, prop: property, value };
      };
      var level = function(level2, value, line) {
        return { type: "level", line: line || -1, level: level2, value };
      };
      var tool = function(code, tool2, line) {
        return { type: "tool", line: line || -1, code, tool: tool2 };
      };
      var op = function(operation, location2, line) {
        return { type: "op", line: line || -1, op: operation, coord: location2 };
      };
      var macro = function(name, blocks, line) {
        return { type: "macro", line: line || -1, name, blocks };
      };
      var commandMap = {
        set,
        done,
        level,
        tool,
        op,
        macro
      };
      module.exports = commandMap;
    }
  });

  // node_modules/lodash.padstart/index.js
  var require_lodash2 = __commonJS({
    "node_modules/lodash.padstart/index.js"(exports, module) {
      init_process();
      init_buffer();
      var INFINITY = 1 / 0;
      var MAX_SAFE_INTEGER = 9007199254740991;
      var MAX_INTEGER = 17976931348623157e292;
      var NAN = 0 / 0;
      var symbolTag = "[object Symbol]";
      var reTrim = /^\s+|\s+$/g;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsOctal = /^0o[0-7]+$/i;
      var rsAstralRange = "\\ud800-\\udfff";
      var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
      var rsComboSymbolsRange = "\\u20d0-\\u20f0";
      var rsVarRange = "\\ufe0e\\ufe0f";
      var rsAstral = "[" + rsAstralRange + "]";
      var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
      var rsFitz = "\\ud83c[\\udffb-\\udfff]";
      var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
      var rsNonAstral = "[^" + rsAstralRange + "]";
      var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
      var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
      var rsZWJ = "\\u200d";
      var reOptMod = rsModifier + "?";
      var rsOptVar = "[" + rsVarRange + "]?";
      var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
      var rsSeq = rsOptVar + reOptMod + rsOptJoin;
      var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
      var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
      var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
      var freeParseInt = parseInt;
      var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var asciiSize = baseProperty("length");
      function asciiToArray(string) {
        return string.split("");
      }
      function baseProperty(key) {
        return function(object) {
          return object == null ? void 0 : object[key];
        };
      }
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }
      function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
      }
      function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
      }
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          result++;
        }
        return result;
      }
      function unicodeToArray(string) {
        return string.match(reUnicode) || [];
      }
      var objectProto = Object.prototype;
      var objectToString2 = objectProto.toString;
      var Symbol2 = root.Symbol;
      var nativeCeil = Math.ceil;
      var nativeFloor = Math.floor;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseRepeat(string, n) {
        var result = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result;
        }
        do {
          if (n % 2) {
            result += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result;
      }
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result = Array(length);
        while (++index < length) {
          result[index] = array[index + start];
        }
        return result;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isSymbol2(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === void 0 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      function createPadding(length, chars) {
        chars = chars === void 0 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
      }
      function isObject2(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function isSymbol2(value) {
        return typeof value == "symbol" || isObjectLike(value) && objectToString2.call(value) == symbolTag;
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result = toFinite(value), remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol2(value)) {
          return NAN;
        }
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toString4(value) {
        return value == null ? "" : baseToString(value);
      }
      function padStart(string, length, chars) {
        string = toString4(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      module.exports = padStart;
    }
  });

  // node_modules/lodash.padend/index.js
  var require_lodash3 = __commonJS({
    "node_modules/lodash.padend/index.js"(exports, module) {
      init_process();
      init_buffer();
      var INFINITY = 1 / 0;
      var MAX_SAFE_INTEGER = 9007199254740991;
      var MAX_INTEGER = 17976931348623157e292;
      var NAN = 0 / 0;
      var symbolTag = "[object Symbol]";
      var reTrim = /^\s+|\s+$/g;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsOctal = /^0o[0-7]+$/i;
      var rsAstralRange = "\\ud800-\\udfff";
      var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
      var rsComboSymbolsRange = "\\u20d0-\\u20f0";
      var rsVarRange = "\\ufe0e\\ufe0f";
      var rsAstral = "[" + rsAstralRange + "]";
      var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
      var rsFitz = "\\ud83c[\\udffb-\\udfff]";
      var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
      var rsNonAstral = "[^" + rsAstralRange + "]";
      var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
      var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
      var rsZWJ = "\\u200d";
      var reOptMod = rsModifier + "?";
      var rsOptVar = "[" + rsVarRange + "]?";
      var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
      var rsSeq = rsOptVar + reOptMod + rsOptJoin;
      var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
      var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
      var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
      var freeParseInt = parseInt;
      var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var asciiSize = baseProperty("length");
      function asciiToArray(string) {
        return string.split("");
      }
      function baseProperty(key) {
        return function(object) {
          return object == null ? void 0 : object[key];
        };
      }
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }
      function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
      }
      function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
      }
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          result++;
        }
        return result;
      }
      function unicodeToArray(string) {
        return string.match(reUnicode) || [];
      }
      var objectProto = Object.prototype;
      var objectToString2 = objectProto.toString;
      var Symbol2 = root.Symbol;
      var nativeCeil = Math.ceil;
      var nativeFloor = Math.floor;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseRepeat(string, n) {
        var result = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result;
        }
        do {
          if (n % 2) {
            result += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result;
      }
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result = Array(length);
        while (++index < length) {
          result[index] = array[index + start];
        }
        return result;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isSymbol2(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === void 0 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      function createPadding(length, chars) {
        chars = chars === void 0 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
      }
      function isObject2(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function isSymbol2(value) {
        return typeof value == "symbol" || isObjectLike(value) && objectToString2.call(value) == symbolTag;
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result = toFinite(value), remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol2(value)) {
          return NAN;
        }
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toString4(value) {
        return value == null ? "" : baseToString(value);
      }
      function padEnd(string, length, chars) {
        string = toString4(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      module.exports = padEnd;
    }
  });

  // node_modules/gerber-parser/lib/normalize-coord.js
  var require_normalize_coord = __commonJS({
    "node_modules/gerber-parser/lib/normalize-coord.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var numIsFinite = require_lodash();
      var padLeft = require_lodash2();
      var padRight = require_lodash3();
      var normalizeCoord = function(number, format2) {
        if (number == null) {
          return NaN;
        }
        var numberString = "" + number;
        var sign = "+";
        if (numberString[0] === "-" || numberString[0] === "+") {
          sign = numberString[0];
          numberString = numberString.slice(1);
        }
        var hasDecimal = numberString.indexOf(".") !== -1;
        if (hasDecimal || format2 == null || format2.zero == null) {
          return Number(sign + numberString);
        } else {
          if (format2.places == null || format2.places.length !== 2) {
            return NaN;
          }
          var leading = format2.places[0];
          var trailing = format2.places[1];
          if (!numIsFinite(leading) || !numIsFinite(trailing)) {
            return NaN;
          }
          if (format2.zero === "T") {
            numberString = padRight(numberString, leading + trailing, "0");
          } else if (format2.zero === "L") {
            numberString = padLeft(numberString, leading + trailing, "0");
          } else {
            return NaN;
          }
        }
        var before = numberString.slice(0, leading);
        var after = numberString.slice(leading, leading + trailing);
        return Number(sign + before + "." + after);
      };
      module.exports = normalizeCoord;
    }
  });

  // node_modules/gerber-parser/lib/parse-coord.js
  var require_parse_coord = __commonJS({
    "node_modules/gerber-parser/lib/parse-coord.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var normalize = require_normalize_coord();
      var RE_TRAILING = /[XY]0\d+/;
      var RE_LEADING = /[XY]\d+0(?=\D|$)/;
      var MATCH = [
        { coord: "x", test: /X([+-]?[\d.]+)/ },
        { coord: "y", test: /Y([+-]?[\d.]+)/ },
        { coord: "i", test: /I([+-]?[\d.]+)/ },
        { coord: "j", test: /J([+-]?[\d.]+)/ },
        { coord: "a", test: /A([\d.]+)/ }
      ];
      var parse = function(coord, format2) {
        if (coord == null) {
          return {};
        }
        if (format2.zero == null || format2.places == null) {
          throw new Error("cannot parse coordinate with format undefined");
        }
        var parsed = MATCH.reduce(function(result, matcher) {
          var coordMatch = coord.match(matcher.test);
          if (coordMatch) {
            result[matcher.coord] = normalize(coordMatch[1], format2);
          }
          return result;
        }, {});
        return parsed;
      };
      var detectZero = function(coord) {
        if (RE_LEADING.test(coord)) {
          return "L";
        }
        if (RE_TRAILING.test(coord)) {
          return "T";
        }
        return null;
      };
      module.exports = { parse, detectZero };
    }
  });

  // node_modules/gerber-parser/lib/_parse-macro-expression.js
  var require_parse_macro_expression = __commonJS({
    "node_modules/gerber-parser/lib/_parse-macro-expression.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var RE_OP = /[+\-/xX()]/;
      var RE_NUMBER = /[$\d.]+/;
      var RE_TOKEN = new RegExp([RE_OP.source, RE_NUMBER.source].join("|"), "g");
      module.exports = function parseMacroExpression(parser, expr) {
        var tokens = expr.match(RE_TOKEN);
        var parseExpression;
        var parsePrimary = function() {
          var t = tokens.shift();
          var exp;
          if (RE_NUMBER.test(t)) {
            exp = { type: "n", val: t };
          } else {
            exp = parseExpression();
            tokens.shift();
          }
          return exp;
        };
        var parseMultiplication = function() {
          var exp = parsePrimary();
          var t = tokens[0];
          if (t === "X") {
            parser._warn("multiplication in macros should use 'x', not 'X'");
            t = "x";
          }
          while (t === "x" || t === "/") {
            tokens.shift();
            var right = parsePrimary();
            exp = { type: t, left: exp, right };
            t = tokens[0];
          }
          return exp;
        };
        parseExpression = function() {
          var exp = parseMultiplication();
          var t = tokens[0];
          while (t === "+" || t === "-") {
            tokens.shift();
            var right = parseMultiplication();
            exp = { type: t, left: exp, right };
            t = tokens[0];
          }
          return exp;
        };
        var tree = parseExpression();
        var evaluate = function(op, mods) {
          var getValue = function(t) {
            if (t[0] === "$") {
              return Number(mods[t]);
            }
            return Number(t);
          };
          var type = op.type;
          if (type === "n") {
            return getValue(op.val);
          }
          if (type === "+") {
            return evaluate(op.left, mods) + evaluate(op.right, mods);
          }
          if (type === "-") {
            return evaluate(op.left, mods) - evaluate(op.right, mods);
          }
          if (type === "x") {
            return evaluate(op.left, mods) * evaluate(op.right, mods);
          }
          return evaluate(op.left, mods) / evaluate(op.right, mods);
        };
        return function(mods) {
          return evaluate(tree, mods);
        };
      };
    }
  });

  // node_modules/gerber-parser/lib/_parse-macro-block.js
  var require_parse_macro_block = __commonJS({
    "node_modules/gerber-parser/lib/_parse-macro-block.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var parseMacroExpr = require_parse_macro_expression();
      var RE_NUM = /^-?[\d.]+$/;
      var RE_VAR_DEF = /^(\$[\d+])=(.+)/;
      var parseMacroBlock = function(parser, block) {
        if (block[0] === "0") {
          return { type: "comment" };
        }
        if (RE_VAR_DEF.test(block)) {
          var varDefMatch = block.match(RE_VAR_DEF);
          var varName = varDefMatch[1];
          var varExpr = varDefMatch[2];
          var evaluate = parseMacroExpr(parser, varExpr);
          var setMods = function(mods2) {
            mods2[varName] = evaluate(mods2);
            return mods2;
          };
          return { type: "variable", set: setMods };
        }
        var modVal = function(m) {
          if (RE_NUM.test(m)) {
            return Number(m);
          }
          return parseMacroExpr(parser, m);
        };
        var mods = block.split(",").map(modVal);
        var code = mods[0];
        var exp = mods[1];
        if (code === 1) {
          return {
            type: "circle",
            exp,
            dia: mods[2],
            cx: mods[3],
            cy: mods[4],
            // handle optional rotation with circle primitives
            rot: mods[5] || 0
          };
        }
        if (code === 2) {
          parser._warn("macro aperture vector primitives with code 2 are deprecated");
        }
        if (code === 2 || code === 20) {
          return {
            type: "vect",
            exp,
            width: mods[2],
            x1: mods[3],
            y1: mods[4],
            x2: mods[5],
            y2: mods[6],
            rot: mods[7]
          };
        }
        if (code === 21) {
          return {
            type: "rect",
            exp,
            width: mods[2],
            height: mods[3],
            cx: mods[4],
            cy: mods[5],
            rot: mods[6]
          };
        }
        if (code === 22) {
          parser._warn(
            "macro aperture lower-left rectangle primitives are deprecated"
          );
          return {
            type: "rectLL",
            exp,
            width: mods[2],
            height: mods[3],
            x: mods[4],
            y: mods[5],
            rot: mods[6]
          };
        }
        if (code === 4) {
          return {
            type: "outline",
            exp,
            points: mods.slice(3, -1),
            rot: mods[mods.length - 1]
          };
        }
        if (code === 5) {
          return {
            type: "poly",
            exp,
            vertices: mods[2],
            cx: mods[3],
            cy: mods[4],
            dia: mods[5],
            rot: mods[6]
          };
        }
        if (code === 6) {
          return {
            type: "moire",
            exp: 1,
            cx: mods[1],
            cy: mods[2],
            dia: mods[3],
            ringThx: mods[4],
            ringGap: mods[5],
            maxRings: mods[6],
            crossThx: mods[7],
            crossLen: mods[8],
            rot: mods[9]
          };
        }
        if (code === 7) {
          return {
            type: "thermal",
            exp: 1,
            cx: mods[1],
            cy: mods[2],
            outerDia: mods[3],
            innerDia: mods[4],
            gap: mods[5],
            rot: mods[6]
          };
        } else {
          parser._warn(code + " is an unrecognized primitive for a macro aperture");
        }
      };
      module.exports = parseMacroBlock;
    }
  });

  // node_modules/gerber-parser/lib/_parse-gerber.js
  var require_parse_gerber = __commonJS({
    "node_modules/gerber-parser/lib/_parse-gerber.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var commands = require_commands();
      var normalize = require_normalize_coord();
      var parseCoord = require_parse_coord();
      var parseMacroBlock = require_parse_macro_block();
      var RE_MODE = /^G0*([123])/;
      var RE_REGION = /^G3([67])/;
      var RE_ARC = /^G7([45])/;
      var RE_BKP_UNITS = /^G7([01])/;
      var RE_BKP_NOTA = /^G9([01])/;
      var RE_COMMENT = /^G0*4/;
      var RE_TO = /^%TO[^%*]*/;
      var RE_TOOL = /^(?:G54)?D0*([1-9]\d+)/;
      var RE_OP = /D0*([123])$/;
      var RE_COORD = /^(?:G0*[123])?((?:[XYIJ][+-]?\d+){1,4})(?:D0*[123])?$/;
      var RE_UNITS = /^%MO(IN|MM)/;
      var RE_FORMAT = /^%FS([LT]?)([AI]?)(.*)X([0-7])([0-7])Y\4\5/;
      var RE_POLARITY = /^%LP([CD])/;
      var RE_STEP_REP = /^%SR(?:X(\d+)Y(\d+)I([\d.]+)J([\d.]+))?/;
      var RE_TOOL_DEF = /^%ADD0*(\d{2,})([A-Za-z_$][\w\-.]*)(?:,((?:X?[\d.-]+)*))?/;
      var RE_MACRO = /^%AM([A-Za-z_$][\w\-.]*)\*?(.*)/;
      var RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT = /\*MO(IN|MM)$/;
      var parseUnits = function(parser, unitsMatch) {
        var units = unitsMatch === "IN" ? "in" : "mm";
        return parser._push(commands.set("units", units));
      };
      var parseToolDef = function(parser, block) {
        var format2 = { places: parser.format.places };
        var toolMatch = block.match(RE_TOOL_DEF);
        var tool = toolMatch[1];
        var shapeMatch = toolMatch[2];
        var toolArgs = toolMatch[3] ? toolMatch[3].split("X") : [];
        var shape;
        var maxArgs;
        if (shapeMatch === "C") {
          shape = "circle";
          maxArgs = 3;
        } else if (shapeMatch === "R") {
          shape = "rect";
          maxArgs = 4;
        } else if (shapeMatch === "O") {
          shape = "obround";
          maxArgs = 4;
        } else if (shapeMatch === "P") {
          shape = "poly";
          maxArgs = 5;
        } else {
          shape = shapeMatch;
          maxArgs = 0;
        }
        var val;
        if (shape === "circle") {
          val = [normalize(toolArgs[0], format2)];
        } else if (shape === "rect" || shape === "obround") {
          val = [normalize(toolArgs[0], format2), normalize(toolArgs[1], format2)];
        } else if (shape === "poly") {
          val = [normalize(toolArgs[0], format2), Number(toolArgs[1]), 0];
          if (toolArgs[2]) {
            val[2] = Number(toolArgs[2]);
          }
        } else {
          val = toolArgs.map(Number);
        }
        var hole = [];
        if (toolArgs[maxArgs - 1]) {
          hole = [
            normalize(toolArgs[maxArgs - 2], format2),
            normalize(toolArgs[maxArgs - 1], format2)
          ];
        } else if (toolArgs[maxArgs - 2]) {
          hole = [normalize(toolArgs[maxArgs - 2], format2)];
        }
        var toolDef = { shape, params: val, hole };
        return parser._push(commands.tool(tool, toolDef));
      };
      var parseMacroDef = function(parser, block) {
        var macroMatch = block.match(RE_MACRO);
        var name = macroMatch[1];
        if (name.match(/-/)) {
          parser._warn("hyphens in macro name are illegal: " + name);
        }
        var blockMatch = macroMatch[2].length ? macroMatch[2].split("*") : [];
        var blocks = blockMatch.filter(Boolean).map(function(block2) {
          return parseMacroBlock(parser, block2);
        });
        return parser._push(commands.macro(name, blocks));
      };
      var parse = function(parser, block) {
        if (RE_COMMENT.test(block) || RE_TO.test(block)) {
          return;
        }
        if (block === "M02") {
          return parser._push(commands.done());
        }
        if (RE_REGION.test(block)) {
          var regionMatch = block.match(RE_REGION)[1];
          var region = regionMatch === "6";
          return parser._push(commands.set("region", region));
        }
        if (RE_ARC.test(block)) {
          var arcMatch = block.match(RE_ARC)[1];
          var arc = arcMatch === "4" ? "s" : "m";
          return parser._push(commands.set("arc", arc));
        }
        if (RE_UNITS.test(block)) {
          var unitsMatch = block.match(RE_UNITS)[1];
          return parseUnits(parser, unitsMatch);
        }
        if (RE_BKP_UNITS.test(block)) {
          var bkpUnitsMatch = block.match(RE_BKP_UNITS)[1];
          var backupUnits = bkpUnitsMatch === "0" ? "in" : "mm";
          return parser._push(commands.set("backupUnits", backupUnits));
        }
        if (RE_FORMAT.test(block)) {
          var formatMatch = block.match(RE_FORMAT);
          var zero = formatMatch[1];
          var nota = formatMatch[2];
          var unknown = formatMatch[3];
          var leading = Number(formatMatch[4]);
          var trailing = Number(formatMatch[5]);
          var format2 = parser.format;
          format2.zero = format2.zero || zero;
          if (!format2.places) {
            format2.places = [leading, trailing];
          }
          if (!format2.zero) {
            format2.zero = "L";
            parser._warn("zero suppression missing from format; assuming leading");
          } else if (format2.zero === "T") {
            parser._warn("trailing zero suppression has been deprecated");
          }
          if (unknown) {
            parser._warn(
              'unknown characters "' + unknown + '" in "' + block + '" were ignored'
            );
          }
          var epsilon = 1.5 * Math.pow(10, -format2.places[1]);
          parser._push(commands.set("nota", nota));
          parser._push(commands.set("epsilon", epsilon));
          if (RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT.test(block)) {
            var caUnitsMatch = block.match(RE_CADENCE_ALLEGRO_UNITS_IN_FORMAT)[1];
            parseUnits(parser, caUnitsMatch);
          }
          return;
        }
        if (RE_BKP_NOTA.test(block)) {
          var bkpNotaMatch = block.match(RE_BKP_NOTA)[1];
          var backupNota = bkpNotaMatch === "0" ? "A" : "I";
          return parser._push(commands.set("backupNota", backupNota));
        }
        if (RE_POLARITY.test(block)) {
          var polarity = block.match(RE_POLARITY)[1];
          return parser._push(commands.level("polarity", polarity));
        }
        if (RE_STEP_REP.test(block)) {
          var stepRepeatMatch = block.match(RE_STEP_REP);
          var x = stepRepeatMatch[1] || 1;
          var y = stepRepeatMatch[2] || 1;
          var i = stepRepeatMatch[3] || 0;
          var j = stepRepeatMatch[4] || 0;
          var sr = { x: Number(x), y: Number(y), i: Number(i), j: Number(j) };
          return parser._push(commands.level("stepRep", sr));
        }
        if (RE_TOOL.test(block)) {
          var tool = block.match(RE_TOOL)[1];
          return parser._push(commands.set("tool", tool));
        }
        if (RE_TOOL_DEF.test(block)) {
          return parseToolDef(parser, block);
        }
        if (RE_MACRO.test(block)) {
          return parseMacroDef(parser, block);
        }
        if (RE_OP.test(block) || RE_MODE.test(block) || RE_COORD.test(block)) {
          var opMatch = block.match(RE_OP);
          var modeMatch = block.match(RE_MODE);
          var coordMatch = block.match(RE_COORD);
          var mode;
          if (modeMatch) {
            if (modeMatch[1] === "1") {
              mode = "i";
            } else if (modeMatch[1] === "2") {
              mode = "cw";
            } else {
              mode = "ccw";
            }
            parser._push(commands.set("mode", mode));
          }
          if (opMatch || coordMatch) {
            var opCode = opMatch ? opMatch[1] : "";
            var coordString = coordMatch ? coordMatch[1] : "";
            var coord = parseCoord.parse(coordString, parser.format);
            var op = "last";
            if (opCode === "1") {
              op = "int";
            } else if (opCode === "2") {
              op = "move";
            } else if (opCode === "3") {
              op = "flash";
            }
            parser._push(commands.op(op, coord));
          }
          return;
        }
        return parser._warn(
          'block "' + block + '" was not recognized and was ignored'
        );
      };
      module.exports = parse;
    }
  });

  // node_modules/gerber-parser/lib/_drill-mode.js
  var require_drill_mode = __commonJS({
    "node_modules/gerber-parser/lib/_drill-mode.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = {
        DRILL: "5",
        MOVE: "0",
        LINEAR: "1",
        CW_ARC: "2",
        CCW_ARC: "3"
      };
    }
  });

  // node_modules/gerber-parser/lib/_parse-drill.js
  var require_parse_drill = __commonJS({
    "node_modules/gerber-parser/lib/_parse-drill.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var numIsFinite = require_lodash();
      var commands = require_commands();
      var drillMode = require_drill_mode();
      var normalize = require_normalize_coord();
      var parseCoord = require_parse_coord();
      var RE_ALTIUM_HINT = /;FILE_FORMAT=(\d):(\d)/;
      var RE_ALTIUM_PLATING_HINT = /;TYPE=(PLATED|NON_PLATED)/;
      var RE_KI_HINT = /;FORMAT={(.):(.)\/ (absolute|.+)? \/ (metric|inch) \/.+(trailing|leading|decimal|keep)/;
      var RE_UNITS = /^(INCH|METRIC|M71|M72)/;
      var RE_ZERO = /,([TL])Z/;
      var RE_FORMAT = /,(0{1,8})\.(0{1,8})/;
      var RE_TOOL_DEF = /T0*(\d+)[\S]*C([\d.]+)/;
      var RE_TOOL_SET = /T0*(\d+)(?![\S]*C)/;
      var RE_COORD = /((?:[XYIJA][+-]?[\d.]+){1,4})(?:G85((?:[XY][+-]?[\d.]+){1,2}))?/;
      var RE_ROUTE = /^G0([01235])/;
      var parseCommentForFormatHints = function(parser, block, line) {
        var result = {};
        if (RE_KI_HINT.test(block)) {
          var kicadMatch = block.match(RE_KI_HINT);
          var leading = Number(kicadMatch[1]);
          var trailing = Number(kicadMatch[2]);
          var absolute = kicadMatch[3];
          var unitSet = kicadMatch[4];
          var suppressionSet = kicadMatch[5];
          if (numIsFinite(leading) && numIsFinite(trailing)) {
            result.places = [leading, trailing];
          }
          if (absolute === "absolute") {
            parser._push(commands.set("backupNota", "A", line));
          } else {
            parser._push(commands.set("backupNota", "I", line));
          }
          if (unitSet === "metric") {
            parser._push(commands.set("backupUnits", "mm", line));
          } else {
            parser._push(commands.set("backupUnits", "in", line));
          }
          if (suppressionSet === "leading" || suppressionSet === "keep") {
            result.zero = "L";
          } else if (suppressionSet === "trailing") {
            result.zero = "T";
          } else {
            result.zero = "D";
          }
        } else if (RE_ALTIUM_HINT.test(block)) {
          var altiumMatch = block.match(RE_ALTIUM_HINT);
          result.places = [Number(altiumMatch[1]), Number(altiumMatch[2])];
        } else if (RE_ALTIUM_PLATING_HINT.test(block)) {
          var platingMatch = block.match(RE_ALTIUM_PLATING_HINT);
          var holePlating = platingMatch[1] === "PLATED" ? "pth" : "npth";
          parser._push(commands.set("holePlating", holePlating, line));
        }
        return result;
      };
      var parseUnits = function(parser, block, line) {
        var unitsMatch = block.match(RE_UNITS);
        var zeroMatch = block.match(RE_ZERO);
        var formatMatch = block.match(RE_FORMAT);
        var units = unitsMatch[1] === "METRIC" || unitsMatch[1] === "M71" ? "mm" : "in";
        var keep = zeroMatch && zeroMatch[1];
        if (parser.format.zero == null && keep) {
          parser.format.zero = keep === "T" ? "L" : "T";
        }
        if (parser.format.places == null) {
          if (formatMatch) {
            parser.format.places = [formatMatch[1].length, formatMatch[2].length];
          } else {
            parser.format.places = units === "in" ? [2, 4] : [3, 3];
          }
        }
        parser._push(commands.set("units", units, line));
      };
      var coordToCommand = function(parser, block, line) {
        var coordMatch = block.match(RE_COORD);
        var coord = parseCoord.parse(coordMatch[1], parser.format);
        if (coordMatch[2]) {
          parser._push(commands.op("move", coord, line));
          parser._push(commands.set("mode", "i", line));
          coord = parseCoord.parse(coordMatch[2], parser.format);
          return parser._push(commands.op("int", coord, line));
        }
        if (RE_ROUTE.test(block)) {
          parser._drillMode = block.match(RE_ROUTE)[1];
        }
        switch (parser._drillMode) {
          case drillMode.DRILL:
            return parser._push(commands.op("flash", coord, line));
          case drillMode.MOVE:
            return parser._push(commands.op("move", coord, line));
          case drillMode.LINEAR:
            parser._push(commands.set("mode", "i", line));
            return parser._push(commands.op("int", coord, line));
          case drillMode.CW_ARC:
            parser._push(commands.set("mode", "cw", line));
            return parser._push(commands.op("int", coord, line));
          case drillMode.CCW_ARC:
            parser._push(commands.set("mode", "ccw", line));
            return parser._push(commands.op("int", coord, line));
        }
      };
      var parseBlock = function(parser, block, line) {
        if (RE_TOOL_DEF.test(block)) {
          var toolMatch = block.match(RE_TOOL_DEF);
          var toolCode = toolMatch[1];
          var toolDia = normalize(toolMatch[2]);
          var toolDef = { shape: "circle", params: [toolDia], hole: [] };
          return parser._push(commands.tool(toolCode, toolDef, line));
        }
        if (RE_TOOL_SET.test(block)) {
          var toolSet = block.match(RE_TOOL_SET)[1];
          parser._push(commands.set("tool", toolSet, line));
        }
        if (RE_COORD.test(block)) {
          if (!parser.format.places) {
            parser.format.places = [2, 4];
            parser._warn("places format missing; assuming [2, 4]");
          }
          if (!parser.format.zero) {
            parser.format.zero = "T";
            parser._warn("zero suppression missing; assuming trailing suppression");
          }
          return coordToCommand(parser, block, line);
        }
        if (block === "M00" || block === "M30") {
          return parser._push(commands.done(line));
        }
        if (block === "G90") {
          return parser._push(commands.set("nota", "A", line));
        }
        if (block === "G91") {
          return parser._push(commands.set("nota", "I", line));
        }
        if (RE_UNITS.test(block)) {
          return parseUnits(parser, block, line);
        }
      };
      var flush = function(parser) {
        parser._drillStash.forEach(function(data) {
          parseBlock(parser, data.block, data.line);
        });
        parser._drillStash = [];
      };
      var parse = function(parser, block) {
        if (block[0] === ";") {
          var formatHints = parseCommentForFormatHints(parser, block, parser.line);
          Object.keys(formatHints).forEach(function(key) {
            if (!parser.format[key]) {
              parser.format[key] = formatHints[key];
            }
          });
        } else if (!parser.format.zero) {
          parser._drillStash.push({ line: parser.line, block });
          if (RE_COORD.test(block)) {
            parser.format.zero = parseCoord.detectZero(block);
            if (parser.format.zero) {
              parser._warn(
                "zero suppression missing; detected " + (parser.format.zero === "L" ? "leading" : "trailing") + " suppression"
              );
            }
          }
          if (parser.format.zero || RE_ZERO.test(block) || parser._drillStash.length >= 1e3) {
            flush(parser);
          }
        } else {
          parseBlock(parser, block, parser.line);
        }
      };
      module.exports = { parse, flush };
    }
  });

  // node_modules/gerber-parser/lib/_warning.js
  var require_warning = __commonJS({
    "node_modules/gerber-parser/lib/_warning.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var warning = function(message, line) {
        return { message, line };
      };
      module.exports = warning;
    }
  });

  // node_modules/gerber-parser/lib/parser.js
  var require_parser = __commonJS({
    "node_modules/gerber-parser/lib/parser.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var StringDecoder2 = require_string_decoder().StringDecoder;
      var inherits2 = require_inherits_browser();
      var Transform = require_readable_browser().Transform;
      var determineFiletype = require_determine_filetype();
      var getNext = require_get_next_block();
      var parseGerber = require_parse_gerber();
      var parseDrill = require_parse_drill();
      var warning = require_warning();
      var drillMode = require_drill_mode();
      var LIMIT = 65535;
      var Parser = function(places, zero, filetype) {
        Transform.call(this, { readableObjectMode: true });
        this._decoder = new StringDecoder2("utf8");
        this._stash = "";
        this._index = 0;
        this._drillMode = drillMode.DRILL;
        this._drillStash = [];
        this._syncResult = null;
        this.line = 0;
        this.format = { places, zero, filetype };
      };
      inherits2(Parser, Transform);
      Parser.prototype._process = function(chunk, filetype) {
        while (this._index < chunk.length) {
          var next = getNext(filetype, chunk, this._index);
          this._index += next.read;
          this.line += next.lines;
          this._stash += next.rem;
          if (next.block) {
            if (filetype === "gerber") {
              parseGerber(this, next.block);
            } else {
              parseDrill.parse(this, next.block);
            }
          }
        }
      };
      Parser.prototype._transform = function(chunk, encoding, done) {
        var filetype = this.format.filetype;
        chunk = this._decoder.write(chunk);
        if (!filetype) {
          filetype = determineFiletype(chunk, this._index, LIMIT);
          this._index += chunk.length;
          if (!filetype) {
            if (this._index >= LIMIT) {
              return done(new Error("unable to determine filetype"));
            }
            this._stash += chunk;
            return done();
          } else {
            this.format.filetype = filetype;
            this._index = 0;
          }
        }
        chunk = this._stash + chunk;
        this._stash = "";
        this._process(chunk, filetype);
        this._index = 0;
        done();
      };
      Parser.prototype._flush = function(done) {
        if (this.format.filetype === "drill") {
          parseDrill.flush(this);
        }
        return done && done();
      };
      Parser.prototype._push = function(data) {
        if (data.line === -1) {
          data.line = this.line;
        }
        var pushTarget = !this._syncResult ? this : this._syncResult;
        pushTarget.push(data);
      };
      Parser.prototype._warn = function(message) {
        this.emit("warning", warning(message, this.line));
      };
      Parser.prototype.parseSync = function(file) {
        var filetype = determineFiletype(file, this._index, 100 * LIMIT);
        this.format.filetype = filetype;
        this._syncResult = [];
        this._process(file, filetype);
        this._flush();
        return this._syncResult;
      };
      module.exports = Parser;
    }
  });

  // node_modules/gerber-parser/index.js
  var require_gerber_parser = __commonJS({
    "node_modules/gerber-parser/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var isFinite2 = require_lodash();
      var Parser = require_parser();
      var verifyPlaces = function(p) {
        if (Array.isArray(p) && p.length === 2 && isFinite2(p[0]) && isFinite2(p[1])) {
          return p;
        }
        throw new Error("places must be an array of two whole numbers");
      };
      var verifyZero = function(z) {
        if (z === "T" || z === "L") {
          return z;
        }
        throw new Error("zero suppression must be 'L' or 'T'");
      };
      var verifyFiletype = function(f) {
        if (f === "gerber" || f === "drill") {
          return f;
        }
        throw new Error('filetype must be "drill" or "gerber"');
      };
      module.exports = function(options) {
        options = options || {};
        var places = options.places ? verifyPlaces(options.places) : null;
        var zero = options.zero ? verifyZero(options.zero) : null;
        var filetype = options.filetype ? verifyFiletype(options.filetype) : null;
        return new Parser(places, zero, filetype);
      };
    }
  });

  // node_modules/lodash.fill/index.js
  var require_lodash4 = __commonJS({
    "node_modules/lodash.fill/index.js"(exports, module) {
      init_process();
      init_buffer();
      var INFINITY = 1 / 0;
      var MAX_SAFE_INTEGER = 9007199254740991;
      var MAX_INTEGER = 17976931348623157e292;
      var NAN = 0 / 0;
      var MAX_ARRAY_LENGTH = 4294967295;
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var symbolTag = "[object Symbol]";
      var reTrim = /^\s+|\s+$/g;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsOctal = /^0o[0-7]+$/i;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      var freeParseInt = parseInt;
      var objectProto = Object.prototype;
      var objectToString2 = objectProto.toString;
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== void 0) {
            number = number <= upper ? number : upper;
          }
          if (lower !== void 0) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }
      function baseFill(array, value, start, end) {
        var length = array.length;
        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end === void 0 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array[start++] = value;
        }
        return array;
      }
      function isIndex(value, length) {
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index, object) {
        if (!isObject2(object)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
          return eq(object[index], value);
        }
        return false;
      }
      function fill3(array, value, start, end) {
        var length = array ? array.length : 0;
        if (!length) {
          return [];
        }
        if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array, value, start, end);
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction2(value);
      }
      function isFunction2(value) {
        var tag = isObject2(value) ? objectToString2.call(value) : "";
        return tag == funcTag || tag == genTag;
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject2(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function isSymbol2(value) {
        return typeof value == "symbol" || isObjectLike(value) && objectToString2.call(value) == symbolTag;
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result = toFinite(value), remainder = result % 1;
        return result === result ? remainder ? result - remainder : result : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol2(value)) {
          return NAN;
        }
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      module.exports = fill3;
    }
  });

  // node_modules/gerber-plotter/lib/path-graph.js
  var require_path_graph = __commonJS({
    "node_modules/gerber-plotter/lib/path-graph.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var fill3 = require_lodash4();
      var find = function(collection, condition) {
        var element;
        var i;
        for (i = 0; i < collection.length; i++) {
          element = collection[i];
          if (condition(element)) {
            return element;
          }
        }
      };
      var findClosest = function(points, position, fillGaps) {
        var result = points.reduce(
          function(prev, point) {
            var d = distance(position, point.position);
            if (d < fillGaps && d < prev.distance) {
              return { point, distance: d };
            }
            return prev;
          },
          { point: void 0, distance: Infinity }
        );
        return result.point;
      };
      var distance = function(point, target) {
        return Math.sqrt(
          Math.pow(point[0] - target[0], 2) + Math.pow(point[1] - target[1], 2)
        );
      };
      var pointsEqual = function(point, target) {
        return point[0] === target[0] && point[1] === target[1];
      };
      var lineSegmentsEqual = function(segment, target) {
        return segment.type === "line" && (pointsEqual(segment.start, target.start) && pointsEqual(segment.end, target.end) || pointsEqual(segment.start, target.end) && pointsEqual(segment.end, target.start));
      };
      var reverseSegment = function(segment) {
        var reversed = { type: segment.type, start: segment.end, end: segment.start };
        if (segment.type === "arc") {
          reversed.center = segment.center;
          reversed.radius = segment.radius;
          reversed.sweep = segment.sweep;
          reversed.dir = segment.dir === "cw" ? "ccw" : "cw";
        }
        return reversed;
      };
      var PathGraph = function(optimize, fillGaps) {
        this._edges = [];
        this._optimize = optimize;
        this._fillGaps = fillGaps;
        this.length = 0;
      };
      PathGraph.prototype.add = function(newSeg) {
        var edge = { segment: newSeg, start: newSeg.start, end: newSeg.end };
        this._edges.push(edge);
        this.length++;
      };
      PathGraph.prototype._fillGapsAndOptimize = function() {
        var newSegs = this._edges.map(function(x) {
          return x.segment;
        });
        this._edges = [];
        this.length = 0;
        var points = newSegs.reduce(function(prev, seg) {
          return prev.concat([
            { position: seg.start, edges: [] },
            { position: seg.end, edges: [] }
          ]);
        }, []);
        var len = newSegs.length;
        for (var i = 0; i < len; i++) {
          var newSeg = newSegs[i];
          var start;
          var end;
          var fillGaps = this._fillGaps;
          var startIndex = i * 2;
          var endIndex = startIndex + 1;
          var otherPoints = points.slice(0, startIndex).concat(points.slice(endIndex + 1));
          start = findClosest(otherPoints, newSeg.start, fillGaps);
          end = findClosest(otherPoints, newSeg.end, fillGaps);
          if (!start) {
            start = { position: newSeg.start, edges: [] };
          } else if (fillGaps) {
            newSeg.start = start.position;
          }
          if (!end) {
            end = { position: newSeg.end, edges: [] };
          } else if (fillGaps) {
            newSeg.end = end.position;
          }
          var existing = find(this._edges, function(edge2) {
            return lineSegmentsEqual(edge2.segment, newSeg);
          });
          if (!existing) {
            var newEdgeIndex = this._edges.length;
            var edge = { segment: newSeg, start, end };
            points[startIndex].edges.push(newEdgeIndex);
            points[startIndex].position = edge.start.position;
            points[endIndex].edges.push(newEdgeIndex);
            points[endIndex].position = edge.end.position;
            this._edges.push(edge);
            this.length++;
          }
        }
        this._edges.forEach(function(edge2) {
          points.forEach(function(point) {
            if (pointsEqual(point.position, edge2.start.position)) {
              edge2.start.edges = edge2.start.edges.concat(point.edges);
            }
            if (pointsEqual(point.position, edge2.end.position)) {
              edge2.end.edges = edge2.end.edges.concat(point.edges);
            }
          });
        });
      };
      PathGraph.prototype.traverse = function() {
        if (!this._optimize) {
          return this._edges.map(function(edge) {
            return edge.segment;
          });
        }
        this._fillGapsAndOptimize();
        var walked = fill3(Array(this._edges.length), false);
        var discovered = [];
        var result = [];
        var current;
        var currentEdge;
        var currentEnd;
        var currentSegment;
        var lastEnd = { position: [] };
        while (result.length < this._edges.length) {
          current = walked.indexOf(false);
          discovered.push(current);
          while (discovered.length) {
            current = discovered.pop();
            if (!walked[current]) {
              walked[current] = true;
              currentEdge = this._edges[current];
              currentEnd = currentEdge.end;
              if (pointsEqual(lastEnd.position, currentEnd.position)) {
                currentSegment = reverseSegment(currentEdge.segment);
                lastEnd = currentEdge.start;
              } else {
                currentSegment = currentEdge.segment;
                lastEnd = currentEdge.end;
              }
              lastEnd.edges.reverse().forEach(function(seg) {
                if (!walked[seg]) {
                  discovered.push(seg);
                }
              });
              result.push(currentSegment);
            }
          }
        }
        return result;
      };
      module.exports = PathGraph;
    }
  });

  // node_modules/gerber-plotter/lib/_warning.js
  var require_warning2 = __commonJS({
    "node_modules/gerber-plotter/lib/_warning.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var warning = function(message, line) {
        return { message, line };
      };
      module.exports = warning;
    }
  });

  // node_modules/lodash.isfunction/index.js
  var require_lodash5 = __commonJS({
    "node_modules/lodash.isfunction/index.js"(exports, module) {
      init_process();
      init_buffer();
      var asyncTag = "[object AsyncFunction]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var nullTag = "[object Null]";
      var proxyTag = "[object Proxy]";
      var undefinedTag = "[object Undefined]";
      var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var objectProto = Object.prototype;
      var hasOwnProperty2 = objectProto.hasOwnProperty;
      var nativeObjectToString = objectProto.toString;
      var Symbol2 = root.Symbol;
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function baseGetTag(value) {
        if (value == null) {
          return value === void 0 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString2(value);
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty2.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = void 0;
          var unmasked = true;
        } catch (e) {
        }
        var result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }
      function objectToString2(value) {
        return nativeObjectToString.call(value);
      }
      function isFunction2(value) {
        if (!isObject2(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isObject2(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      module.exports = isFunction2;
    }
  });

  // node_modules/gerber-plotter/lib/_box.js
  var require_box = __commonJS({
    "node_modules/gerber-plotter/lib/_box.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var newBox = function() {
        return [Infinity, Infinity, -Infinity, -Infinity];
      };
      var add = function(box, target) {
        return [
          Math.min(box[0], target[0]),
          Math.min(box[1], target[1]),
          Math.max(box[2], target[2]),
          Math.max(box[3], target[3])
        ];
      };
      var addPoint = function(box, point) {
        return [
          Math.min(box[0], point[0]),
          Math.min(box[1], point[1]),
          Math.max(box[2], point[0]),
          Math.max(box[3], point[1])
        ];
      };
      var addCircle = function(box, r, cx, cy) {
        return [
          Math.min(box[0], cx - r),
          Math.min(box[1], cy - r),
          Math.max(box[2], cx + r),
          Math.max(box[3], cy + r)
        ];
      };
      var translate = function(box, delta) {
        var dx = delta[0];
        var dy = delta[1];
        return [box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy];
      };
      var repeat = function(box, repeat2) {
        return add(box, translate(box, repeat2));
      };
      module.exports = {
        new: newBox,
        add,
        addPoint,
        addCircle,
        translate,
        repeat
      };
    }
  });

  // node_modules/gerber-plotter/lib/_pad-shape.js
  var require_pad_shape = __commonJS({
    "node_modules/gerber-plotter/lib/_pad-shape.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var isFunction2 = require_lodash5();
      var isFinite2 = require_lodash();
      var boundingBox = require_box();
      var roundToPrecision = function(number) {
        var rounded = Math.round(number * 1e8) / 1e8;
        if (rounded === 0) {
          return 0;
        }
        return rounded;
      };
      var degreesToRadians = function(degrees) {
        return degrees * Math.PI / 180;
      };
      var rotatePointAboutOrigin = function(point, rot) {
        rot = degreesToRadians(rot);
        var sin = Math.sin(rot);
        var cos = Math.cos(rot);
        var x = point[0];
        var y = point[1];
        return [
          roundToPrecision(x * cos - y * sin),
          roundToPrecision(x * sin + y * cos)
        ];
      };
      var circle = function(dia, cx, cy, rot) {
        var r = dia / 2;
        cx = cx || 0;
        cy = cy || 0;
        if (rot && (cx || cy)) {
          var rotatedCenter = rotatePointAboutOrigin([cx, cy], rot);
          cx = rotatedCenter[0];
          cy = rotatedCenter[1];
        }
        return {
          shape: { type: "circle", cx, cy, r: dia / 2 },
          box: boundingBox.addCircle(boundingBox.new(), r, cx, cy)
        };
      };
      var vect = function(x1, y1, x2, y2, width, rot) {
        if (rot) {
          var start = rotatePointAboutOrigin([x1, y1], rot);
          var end = rotatePointAboutOrigin([x2, y2], rot);
          x1 = start[0];
          y1 = start[1];
          x2 = end[0];
          y2 = end[1];
        }
        var m = (y2 - y1) / (x2 - x1);
        var hWidth = width / 2;
        var sin = hWidth;
        var cos = hWidth;
        if (isFinite2(m)) {
          sin *= m / Math.sqrt(1 + Math.pow(m, 2));
          cos *= 1 / Math.sqrt(1 + Math.pow(m, 2));
        } else {
          cos = 0;
        }
        var points = [];
        points.push([roundToPrecision(x1 + sin), roundToPrecision(y1 - cos)]);
        points.push([roundToPrecision(x2 + sin), roundToPrecision(y2 - cos)]);
        points.push([roundToPrecision(x2 - sin), roundToPrecision(y2 + cos)]);
        points.push([roundToPrecision(x1 - sin), roundToPrecision(y1 + cos)]);
        var box = points.reduce(function(result, p) {
          return boundingBox.addPoint(result, p);
        }, boundingBox.new());
        return {
          shape: { type: "poly", points },
          box
        };
      };
      var rect = function(width, height, r, cx, cy, rot) {
        cx = cx || 0;
        cy = cy || 0;
        r = r || 0;
        rot = rot || 0;
        var hWidth = width / 2;
        var hHeight = height / 2;
        if (rot) {
          var x1 = cx - hWidth;
          var x2 = cx + hWidth;
          var y1 = cy;
          var y2 = cy;
          return vect(x1, y1, x2, y2, height, rot);
        }
        return {
          shape: { type: "rect", cx, cy, r, width, height },
          box: [-hWidth + cx, -hHeight + cy, hWidth + cx, hHeight + cy]
        };
      };
      var outlinePolygon = function(flatPoints, rot) {
        var points = [];
        var box = boundingBox.new();
        var point;
        for (var i = 0; i < flatPoints.length - 2; i += 2) {
          point = [flatPoints[i], flatPoints[i + 1]];
          if (rot) {
            point = rotatePointAboutOrigin(point, rot);
          }
          points.push(point);
          box = boundingBox.addPoint(box, point);
        }
        return {
          shape: { type: "poly", points },
          box
        };
      };
      var regularPolygon = function(dia, nPoints, rot, cx, cy) {
        cx = cx || 0;
        cy = cy || 0;
        var points = [];
        var box = boundingBox.new();
        var r = dia / 2;
        var offset = rot * Math.PI / 180;
        var step = 2 * Math.PI / nPoints;
        var theta;
        var x;
        var y;
        for (var n = 0; n < nPoints; n++) {
          theta = step * n + offset;
          x = cx + roundToPrecision(r * Math.cos(theta));
          y = cy + roundToPrecision(r * Math.sin(theta));
          box = boundingBox.addPoint(box, [x, y]);
          points.push([x, y]);
        }
        return {
          shape: { type: "poly", points },
          box
        };
      };
      var ring = function(cx, cy, r, width) {
        return { type: "ring", cx, cy, r, width };
      };
      var moire = function(dia, ringThx, ringGap, maxRings, crossThx, crossLen, cx, cy, rot) {
        var r = dia / 2;
        var shape = [];
        var box = boundingBox.addCircle(boundingBox.new(), r, cx, cy);
        var halfThx = ringThx / 2;
        var gapAndHalfThx = ringGap + halfThx;
        while (r > ringThx && shape.length < maxRings) {
          r -= halfThx;
          shape.push(ring(cx, cy, roundToPrecision(r), ringThx));
          r -= gapAndHalfThx;
        }
        if (r > 0 && shape.length < maxRings) {
          shape.push(circle(roundToPrecision(2 * r), cx, cy).shape);
        }
        var horCross = rect(crossLen, crossThx, 0, cx, cy, rot);
        var verCross = rect(crossThx, crossLen, 0, cx, cy, rot);
        shape.push(horCross.shape);
        shape.push(verCross.shape);
        box = boundingBox.add(box, horCross.box);
        box = boundingBox.add(box, verCross.box);
        return { shape, box };
      };
      var thermal = function(cx, cy, outerDia, innerDia, gap, rot) {
        var side = roundToPrecision((outerDia - gap) / 2);
        var offset = roundToPrecision((outerDia + gap) / 4);
        var width = roundToPrecision((outerDia - innerDia) / 2);
        var r = roundToPrecision((outerDia - width) / 2);
        var box = boundingBox.addCircle(boundingBox.new(), outerDia / 2, cx, cy);
        var rects = [
          rect(side, side, 0, cx + offset, cy + offset, rot).shape,
          rect(side, side, 0, cx - offset, cy + offset, rot).shape,
          rect(side, side, 0, cx - offset, cy - offset, rot).shape,
          rect(side, side, 0, cx + offset, cy - offset, rot).shape
        ];
        var clip = ring(cx, cy, r, width);
        return {
          shape: { type: "clip", shape: rects, clip },
          box
        };
      };
      var runMacro = function(mods, blocks) {
        var emptyMacro = { shape: [], box: boundingBox.new() };
        var exposure = 1;
        blocks = blocks || [];
        return blocks.reduce(function(result, block) {
          var shapeAndBox;
          if (block.type !== "variable" && block.type !== "comment") {
            block = Object.keys(block).reduce(function(result2, key) {
              var value = block[key];
              result2[key] = resolveValue(value);
              return result2;
              function resolveValue(v) {
                if (Array.isArray(v)) {
                  return v.map(resolveValue);
                } else if (isFunction2(v)) {
                  return v(mods);
                } else {
                  return v;
                }
              }
            }, {});
          }
          if (block.exp != null && block.exp !== exposure) {
            result.shape.push({
              type: "layer",
              polarity: block.exp === 1 ? "dark" : "clear",
              box: result.box.slice(0)
            });
            exposure = block.exp;
          }
          switch (block.type) {
            case "circle":
              shapeAndBox = circle(block.dia, block.cx, block.cy, block.rot);
              break;
            case "vect":
              shapeAndBox = vect(
                block.x1,
                block.y1,
                block.x2,
                block.y2,
                block.width,
                block.rot
              );
              break;
            case "rect":
              shapeAndBox = rect(
                block.width,
                block.height,
                0,
                block.cx,
                block.cy,
                block.rot
              );
              break;
            case "rectLL":
              var hHeight = block.height / 2;
              var hWidth = block.width / 2;
              var cx = block.x + hWidth;
              var cy = block.y + hHeight;
              shapeAndBox = rect(block.width, block.height, 0, cx, cy, block.rot);
              break;
            case "outline":
              shapeAndBox = outlinePolygon(block.points, block.rot);
              break;
            case "poly":
              shapeAndBox = regularPolygon(
                block.dia,
                block.vertices,
                block.rot,
                block.cx,
                block.cy
              );
              break;
            case "moire":
              shapeAndBox = moire(
                block.dia,
                block.ringThx,
                block.ringGap,
                block.maxRings,
                block.crossThx,
                block.crossLen,
                block.cx,
                block.cy,
                block.rot
              );
              break;
            case "thermal":
              shapeAndBox = thermal(
                block.cx,
                block.cy,
                block.outerDia,
                block.innerDia,
                block.gap,
                block.rot
              );
              break;
            case "variable":
              mods = block.set(mods);
              return result;
            default:
              return result;
          }
          result.shape = result.shape.concat(shapeAndBox.shape);
          if (exposure === 1) {
            result.box = boundingBox.add(result.box, shapeAndBox.box);
          }
          return result;
        }, emptyMacro);
      };
      module.exports = function padShape(tool, macros) {
        var shape = [];
        var box = boundingBox.new();
        var toolShape = tool.shape;
        var params = tool.params;
        var holeShape;
        var shapeAndBox;
        if (toolShape === "circle") {
          shapeAndBox = circle(params[0]);
        } else if (toolShape === "rect") {
          shapeAndBox = rect(params[0], params[1]);
        } else if (toolShape === "obround") {
          shapeAndBox = rect(params[0], params[1], Math.min(params[0], params[1]) / 2);
        } else if (toolShape === "poly") {
          shapeAndBox = regularPolygon(params[0], params[1], params[2]);
        } else {
          var mods = params.reduce(function(result, val, index) {
            result["$" + (index + 1)] = val;
            return result;
          }, {});
          return runMacro(mods, macros[toolShape]);
        }
        shape.push(shapeAndBox.shape);
        box = boundingBox.add(box, shapeAndBox.box);
        if (tool.hole.length) {
          holeShape = tool.hole.length === 1 ? circle(tool.hole[0]).shape : rect(tool.hole[0], tool.hole[1]).shape;
          shape.push({ type: "layer", polarity: "clear", box }, holeShape);
        }
        return { shape, box };
      };
    }
  });

  // node_modules/gerber-plotter/lib/_operate.js
  var require_operate = __commonJS({
    "node_modules/gerber-plotter/lib/_operate.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var boundingBox = require_box();
      var HALF_PI = Math.PI / 2;
      var PI = Math.PI;
      var TWO_PI = Math.PI * 2;
      var THREE_HALF_PI = 3 * Math.PI / 2;
      var flash = function(coord, tool, region, plotter) {
        if (region) {
          plotter._warn("flash in region ignored");
          return boundingBox.new();
        }
        if (!tool) {
          plotter._warn("flash with unknown tool ignored");
          return boundingBox.new();
        }
        if (!tool.flashed) {
          tool.flashed = true;
          plotter.push({ type: "shape", tool: tool.code, shape: tool.pad });
        }
        plotter.push({ type: "pad", tool: tool.code, x: coord[0], y: coord[1] });
        return boundingBox.translate(tool.box, coord);
      };
      var findCenterAndAngles = function(start, end, mode, arc, centers) {
        var thetaStart;
        var thetaEnd;
        var sweep;
        var candidate;
        var center;
        while (center == null && centers.length > 0) {
          candidate = centers.pop();
          thetaStart = Math.atan2(start[1] - candidate[1], start[0] - candidate[0]);
          thetaEnd = Math.atan2(end[1] - candidate[1], end[0] - candidate[0]);
          if (mode === "cw") {
            thetaStart = thetaStart >= thetaEnd ? thetaStart : thetaStart + TWO_PI;
          } else {
            thetaEnd = thetaEnd >= thetaStart ? thetaEnd : thetaEnd + TWO_PI;
          }
          sweep = Math.abs(thetaStart - thetaEnd);
          if (arc === "s") {
            if (sweep <= HALF_PI) {
              center = candidate;
            }
          } else {
            center = candidate;
          }
        }
        if (center == null) {
          return void 0;
        }
        thetaStart = thetaStart >= 0 ? thetaStart : thetaStart + TWO_PI;
        thetaStart = thetaStart < TWO_PI ? thetaStart : thetaStart - TWO_PI;
        thetaEnd = thetaEnd >= 0 ? thetaEnd : thetaEnd + TWO_PI;
        thetaEnd = thetaEnd < TWO_PI ? thetaEnd : thetaEnd - TWO_PI;
        return {
          center,
          sweep,
          start: start.concat(thetaStart),
          end: end.concat(thetaEnd)
        };
      };
      var arcBox = function(cenAndAngles, r, region, tool, dir) {
        var startPoint = cenAndAngles.start;
        var endPoint = cenAndAngles.end;
        var center = cenAndAngles.center;
        var sweep = cenAndAngles.sweep;
        var start;
        var end;
        if (dir === "cw") {
          start = endPoint[2];
          end = startPoint[2];
        } else {
          start = startPoint[2];
          end = endPoint[2];
        }
        var points = [startPoint, endPoint];
        if (start > end || sweep === TWO_PI) {
          points.push([center[0] + r, center[1]]);
        }
        start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI;
        end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI;
        if (start > end || sweep === TWO_PI) {
          points.push([center[0], center[1] + r]);
        }
        start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI;
        end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI;
        if (start > end || sweep === TWO_PI) {
          points.push([center[0] - r, center[1]]);
        }
        start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI;
        end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI;
        if (start > end || sweep === TWO_PI) {
          points.push([center[0], center[1] - r]);
        }
        return points.reduce(function(result, m) {
          if (!region) {
            var mBox = boundingBox.translate(tool.box, m);
            return boundingBox.add(result, mBox);
          }
          return boundingBox.addPoint(result, m);
        }, boundingBox.new());
      };
      var roundToZero = function(number, epsilon) {
        return number >= epsilon ? number : 0;
      };
      var arcCenterFromRadius = function(start, end, mode, epsilon, radius) {
        var sign = mode === "ccw" ? 1 : -1;
        var xAve = (start[0] + end[0]) / 2;
        var yAve = (start[1] + end[1]) / 2;
        var deltaX = end[0] - start[1];
        var deltaY = end[1] - start[1];
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        var halfDistance = distance / 2;
        var squareDifference = Math.sqrt(
          Math.pow(radius, 2) - Math.pow(halfDistance, 2)
        );
        var xOffset = -sign * deltaY * squareDifference / distance;
        var yOffset = sign * deltaX * squareDifference / distance;
        return [
          [
            roundToZero(xAve + xOffset, epsilon),
            roundToZero(yAve + yOffset, epsilon)
          ]
        ];
      };
      var drawArc = function(start, end, offset, tool, mode, arc, region, epsilon, pathGraph, plotter) {
        var r = offset[2] || Math.sqrt(Math.pow(offset[0], 2) + Math.pow(offset[1], 2));
        var candidates = [];
        var xCandidates = [];
        var yCandidates = [];
        if (offset[0] && arc === "s") {
          xCandidates.push(start[0] + offset[0], start[0] - offset[0]);
        } else {
          xCandidates.push(start[0] + offset[0]);
        }
        if (offset[1] && arc === "s") {
          yCandidates.push(start[1] + offset[1], start[1] - offset[1]);
        } else {
          yCandidates.push(start[1] + offset[1]);
        }
        for (var i = 0; i < xCandidates.length; i++) {
          for (var j = 0; j < yCandidates.length; j++) {
            candidates.push([xCandidates[i], yCandidates[j]]);
          }
        }
        var validCenters;
        if (offset[2]) {
          arc = "m";
          validCenters = arcCenterFromRadius(start, end, mode, epsilon, offset[2]);
        } else if (arc === "s") {
          validCenters = candidates.filter(function(c) {
            var startDist = Math.sqrt(
              Math.pow(c[0] - start[0], 2) + Math.pow(c[1] - start[1], 2)
            );
            var endDist = Math.sqrt(
              Math.pow(c[0] - end[0], 2) + Math.pow(c[1] - end[1], 2)
            );
            return Math.abs(startDist - r) <= epsilon && Math.abs(endDist - r) <= epsilon;
          });
        } else {
          validCenters = candidates;
        }
        var cenAndAngles = findCenterAndAngles(start, end, mode, arc, validCenters);
        if (arc === "m" && start[0] === end[0] && start[1] === end[1]) {
          cenAndAngles.sweep = TWO_PI;
        }
        var box = boundingBox.new();
        if (cenAndAngles != null) {
          pathGraph.add({
            type: "arc",
            start: cenAndAngles.start,
            end: cenAndAngles.end,
            center: cenAndAngles.center,
            sweep: cenAndAngles.sweep,
            radius: r,
            dir: mode
          });
          box = arcBox(cenAndAngles, r, region, tool, mode);
        } else {
          plotter._warn("skipping impossible arc");
        }
        return box;
      };
      var drawLine = function(start, end, tool, region, pathGraph) {
        pathGraph.add({ type: "line", start, end });
        if (!region) {
          var startBox = boundingBox.translate(tool.box, start);
          var endBox = boundingBox.translate(tool.box, end);
          return boundingBox.add(startBox, endBox);
        }
        var box = boundingBox.new();
        box = boundingBox.addPoint(box, start);
        box = boundingBox.addPoint(box, end);
        return box;
      };
      var interpolateRect = function(start, end, tool, pathGraph, plotter) {
        var hWidth = tool.trace[0] / 2;
        var hHeight = tool.trace[1] / 2;
        var theta = Math.atan2(end[1] - start[1], end[0] - start[0]);
        var sXMin = start[0] - hWidth;
        var sXMax = start[0] + hWidth;
        var sYMin = start[1] - hHeight;
        var sYMax = start[1] + hHeight;
        var eXMin = end[0] - hWidth;
        var eXMax = end[0] + hWidth;
        var eYMin = end[1] - hHeight;
        var eYMax = end[1] + hHeight;
        var points = [];
        if (start[0] === end[0] && start[1] === end[1]) {
          points.push([sXMin, sYMin], [sXMax, sYMin], [sXMax, sYMax], [sXMin, sYMax]);
        } else if (theta >= 0 && theta < HALF_PI) {
          points.push(
            [sXMin, sYMin],
            [sXMax, sYMin],
            [eXMax, eYMin],
            [eXMax, eYMax],
            [eXMin, eYMax],
            [sXMin, sYMax]
          );
        } else if (theta >= HALF_PI && theta <= PI) {
          points.push(
            [sXMax, sYMin],
            [sXMax, sYMax],
            [eXMax, eYMax],
            [eXMin, eYMax],
            [eXMin, eYMin],
            [sXMin, sYMin]
          );
        } else if (theta >= -PI && theta < -HALF_PI) {
          points.push(
            [sXMax, sYMax],
            [sXMin, sYMax],
            [eXMin, eYMax],
            [eXMin, eYMin],
            [eXMax, eYMin],
            [sXMax, sYMin]
          );
        } else {
          points.push(
            [sXMin, sYMax],
            [sXMin, sYMin],
            [eXMin, eYMin],
            [eXMax, eYMin],
            [eXMax, eYMax],
            [sXMax, sYMax]
          );
        }
        points.forEach(function(p, i) {
          var j = i < points.length - 1 ? i + 1 : 0;
          pathGraph.add({ type: "line", start: p, end: points[j] });
        });
        plotter._finishPath();
        return boundingBox.add(
          boundingBox.translate(tool.box, start),
          boundingBox.translate(tool.box, end)
        );
      };
      var interpolate = function(start, end, offset, tool, mode, arc, region, epsilon, pathGraph, plotter) {
        var strokableTool = region || tool && tool.trace.length > 0;
        var arcableTool = region || tool && tool.trace.length === 1;
        var toolCode = tool ? tool.code : "[NO TOOL SET]";
        if (!strokableTool) {
          plotter._warn(
            "tool " + toolCode + " is not strokable; ignoring interpolate"
          );
          return boundingBox.new();
        }
        if (mode === "i") {
          if (region || tool.trace.length === 1) {
            return drawLine(start, end, tool, region, pathGraph);
          }
          return interpolateRect(start, end, tool, pathGraph, plotter);
        }
        if (!arcableTool) {
          plotter._warn(
            "cannot draw arc with non-circular tool " + toolCode + "; ignoring interpolate"
          );
          return boundingBox.new();
        }
        return drawArc(
          start,
          end,
          offset,
          tool,
          mode,
          arc,
          region,
          epsilon,
          pathGraph,
          plotter
        );
      };
      var operate = function(type, coord, start, tool, mode, arc, region, pathGraph, epsilon, plotter) {
        var end = [
          coord.x != null ? coord.x : start[0],
          coord.y != null ? coord.y : start[1]
        ];
        var offset = [
          coord.i != null ? coord.i : 0,
          coord.j != null ? coord.j : 0,
          coord.a
        ];
        var box;
        switch (type) {
          case "flash":
            box = flash(end, tool, region, plotter);
            break;
          case "int":
            box = interpolate(
              start,
              end,
              offset,
              tool,
              mode,
              arc,
              region,
              epsilon,
              pathGraph,
              plotter
            );
            break;
          default:
            box = boundingBox.new();
            break;
        }
        return {
          pos: end,
          box
        };
      };
      module.exports = operate;
    }
  });

  // node_modules/gerber-plotter/lib/plotter.js
  var require_plotter = __commonJS({
    "node_modules/gerber-plotter/lib/plotter.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var Transform = require_readable_browser().Transform;
      var inherits2 = require_inherits_browser();
      var PathGraph = require_path_graph();
      var warning = require_warning2();
      var padShape = require_pad_shape();
      var operate = require_operate();
      var boundingBox = require_box();
      var MAX_GAP = 11e-5;
      var isFormatKey = function(key) {
        return key === "units" || key === "backupUnits" || key === "nota" || key === "backupNota";
      };
      var Plotter = function(units, backupUnits, nota, backupNota, optimizePaths, plotAsOutline) {
        Transform.call(this, {
          readableObjectMode: true,
          writableObjectMode: true
        });
        this.format = {
          units,
          backupUnits: backupUnits || "in",
          nota,
          backupNota: backupNota || "A"
        };
        this._formatLock = {
          units: units != null,
          backupUnits: backupUnits != null,
          nota: nota != null,
          backupNota: backupNota != null
        };
        this._plotAsOutline = plotAsOutline === true ? MAX_GAP : plotAsOutline;
        if ((units || this.format.backupUnits) === "in") {
          this._plotAsOutline = this._plotAsOutline / 25.4;
        }
        this._optimizePaths = optimizePaths || plotAsOutline;
        this._line = 0;
        this._done = false;
        this._tool = null;
        this._outTool = null;
        this._tools = {};
        this._macros = {};
        this._pos = [0, 0];
        this._box = boundingBox.new();
        this._mode = null;
        this._arc = null;
        this._region = false;
        this._path = new PathGraph(this._optimizePaths, this._plotAsOutline);
        this._epsilon = null;
        this._lastOp = null;
        this._stepRep = [];
      };
      inherits2(Plotter, Transform);
      Plotter.prototype._finishPath = function(doNotOptimize) {
        var path = this._path.traverse();
        this._path = new PathGraph(
          !doNotOptimize && this._optimizePaths,
          this._plotAsOutline
        );
        if (path.length) {
          var tool = !this._plotAsOutline ? this._tool : this._outTool;
          if (!this._region && tool.trace.length === 1) {
            this.push({ type: "stroke", width: tool.trace[0], path });
          } else {
            this.push({ type: "fill", path });
          }
        }
      };
      Plotter.prototype._warn = function(message) {
        this.emit("warning", warning(message, this._line));
      };
      Plotter.prototype._checkFormat = function() {
        if (!this.format.units) {
          this.format.units = this.format.backupUnits;
          this._warn("units not set; using backup units: " + this.format.units);
        }
        if (!this.format.nota) {
          this.format.nota = this.format.backupNota;
          this._warn("notation not set; using backup notation: " + this.format.nota);
        }
      };
      Plotter.prototype._updateBox = function(box) {
        var stepRepLen = this._stepRep.length;
        if (!stepRepLen) {
          this._box = boundingBox.add(this._box, box);
        } else {
          var repeatBox = boundingBox.repeat(box, this._stepRep[stepRepLen - 1]);
          this._box = boundingBox.add(this._box, repeatBox);
        }
      };
      Plotter.prototype._transform = function(chunk, encoding, done) {
        var type = chunk.type;
        this._line = chunk.line;
        if (this._done) {
          this._warn("ignoring extra command recieved after done command");
          return done();
        }
        if (type === "op") {
          this._checkFormat();
          var op = chunk.op;
          var coord = chunk.coord;
          if (this.nota === "I") {
            var _this = this;
            coord = Object.keys(coord).reduce(function(result2, key) {
              var value2 = coord[key];
              if (key === "x") {
                result2[key] = _this._pos[0] + value2;
              } else if (key === "y") {
                result2[key] = _this._pos[1] + value2;
              } else {
                result2[key] = value2;
              }
              return result2;
            }, {});
          }
          if (op === "last") {
            this._warn("modal operation commands are deprecated");
            op = this._lastOp;
          }
          if (op === "int") {
            if (this._mode == null) {
              this._warn("no interpolation mode specified; assuming linear");
              this._mode = "i";
            }
            if (this._arc == null && this._mode.slice(-2) === "cw" && !coord.a) {
              this._warn("quadrant mode unspecified; assuming single quadrant");
              this._arc = "s";
            }
          }
          if (this._plotAsOutline) {
            this._outTool = this._tool;
          }
          var result = operate(
            op,
            coord,
            this._pos,
            this._tool,
            this._mode,
            this._arc,
            this._region || this._plotAsOutline,
            this._path,
            this._epsilon,
            this
          );
          this._lastOp = op;
          this._pos = result.pos;
          this._updateBox(result.box);
        } else if (type === "set") {
          var prop = chunk.prop;
          var value = chunk.value;
          if (prop === "region") {
            this._finishPath(value);
            this._region = value;
          } else if (isFormatKey(prop) && !this._formatLock[prop]) {
            this.format[prop] = value;
            if (prop === "units" || prop === "nota") {
              this._formatLock[prop] = true;
            }
          } else if (prop === "tool") {
            if (this._region) {
              this._warn("cannot change tool while region mode is on");
            } else if (!this._tools[value]) {
              this._warn("tool " + value + " is not defined");
            } else if (!this._outTool) {
              this._finishPath();
              this._tool = this._tools[value];
            }
          } else {
            this["_" + prop] = value;
          }
        } else if (type === "tool") {
          var code = chunk.code;
          var toolDef = chunk.tool;
          if (this._tools[code]) {
            this._warn("tool " + code + " is already defined; overwriting definition");
          }
          var shapeAndBox = padShape(toolDef, this._macros);
          var tool = {
            code,
            trace: [],
            pad: shapeAndBox.shape,
            flashed: false,
            box: shapeAndBox.box
          };
          if (toolDef.shape === "circle" || toolDef.shape === "rect") {
            if (toolDef.hole.length === 0) {
              tool.trace = toolDef.params;
            }
          }
          if (!this._outTool) {
            this._finishPath();
            this._tools[code] = tool;
            this._tool = tool;
          }
        } else if (type === "macro") {
          this._macros[chunk.name] = chunk.blocks;
        } else if (type === "level") {
          var level = chunk.level;
          var levelValue = chunk.value;
          this._finishPath();
          if (level === "polarity") {
            this.push({
              type: "polarity",
              polarity: levelValue === "C" ? "clear" : "dark",
              box: this._box.slice(0)
            });
          } else {
            var offsets = [];
            if (levelValue.x > 1 || levelValue.y > 1) {
              for (var x = 0; x < levelValue.x; x++) {
                for (var y = 0; y < levelValue.y; y++) {
                  offsets.push([x * levelValue.i, y * levelValue.j]);
                }
              }
            }
            this._stepRep = offsets;
            this.push({
              type: "repeat",
              offsets: this._stepRep.slice(0),
              box: this._box.slice(0)
            });
          }
        } else if (type === "done") {
          this._done = true;
        }
        return done();
      };
      Plotter.prototype._flush = function(done) {
        this._finishPath();
        this.push({ type: "size", box: this._box, units: this.format.units });
        done();
      };
      module.exports = Plotter;
    }
  });

  // node_modules/gerber-plotter/index.js
  var require_gerber_plotter = __commonJS({
    "node_modules/gerber-plotter/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var Plotter = require_plotter();
      var verifyNota = function(nota) {
        if (nota === "A" || nota === "I") {
          return nota;
        }
        throw new Error('notation must be "in" or "mm"');
      };
      var verifyUnits = function(units) {
        if (units === "in" || units === "mm") {
          return units;
        }
        throw new Error('units must be "in" or "mm"');
      };
      module.exports = function plotterFactory(options) {
        options = options || {};
        var units = options.units ? verifyUnits(options.units) : null;
        var backupUnits = options.backupUnits ? verifyUnits(options.backupUnits) : null;
        var nota = options.nota ? verifyNota(options.nota) : null;
        var backupNota = options.backupNota ? verifyNota(options.backupNota) : null;
        return new Plotter(
          units,
          backupUnits,
          nota,
          backupNota,
          options.optimizePaths,
          options.plotAsOutline
        );
      };
    }
  });

  // node_modules/escape-html/index.js
  var require_escape_html = __commonJS({
    "node_modules/escape-html/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var matchHtmlRegExp = /["'&<>]/;
      module.exports = escapeHtml;
      function escapeHtml(string) {
        var str = "" + string;
        var match = matchHtmlRegExp.exec(str);
        if (!match) {
          return str;
        }
        var escape;
        var html = "";
        var index = 0;
        var lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
          switch (str.charCodeAt(index)) {
            case 34:
              escape = "&quot;";
              break;
            case 38:
              escape = "&amp;";
              break;
            case 39:
              escape = "&#39;";
              break;
            case 60:
              escape = "&lt;";
              break;
            case 62:
              escape = "&gt;";
              break;
            default:
              continue;
          }
          if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
          }
          lastIndex = index + 1;
          html += escape;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
      }
    }
  });

  // node_modules/xml-element-string/index.js
  var require_xml_element_string = __commonJS({
    "node_modules/xml-element-string/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var escapeHtml = require_escape_html();
      module.exports = function createXmlString(tag, attributes, children) {
        attributes = attributes || {};
        children = children || [];
        var start = "<" + escapeHtml(tag);
        var middle = Object.keys(attributes).reduce(function(result, key) {
          var value = attributes[key];
          var attr = value != null ? " " + escapeHtml(key) + '="' + escapeHtml(value) + '"' : "";
          return result + attr;
        }, "");
        var end = children.length ? ">" + children.join("") + "</" + tag + ">" : "/>";
        return start + middle + end;
      };
    }
  });

  // node_modules/gerber-to-svg/lib/_util.js
  var require_util2 = __commonJS({
    "node_modules/gerber-to-svg/lib/_util.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var shift = function(number) {
        return Math.round(1e10 * number) / 1e7;
      };
      var boundingRect = function(box, fill3, element) {
        return element("rect", {
          x: shift(box[0]),
          y: shift(box[1]),
          width: shift(box[2] - box[0]),
          height: shift(box[3] - box[1]),
          fill: fill3
        });
      };
      var maskLayer = function(maskId, layer, element) {
        var maskUrl = "url(#" + maskId + ")";
        return element("g", { mask: maskUrl }, layer);
      };
      var createMask = function(maskId, box, children, element) {
        children = [boundingRect(box, "#fff", element)].concat(children);
        var attributes = { id: maskId, fill: "#000", stroke: "#000" };
        return element("mask", attributes, [element("g", {}, children)]);
      };
      module.exports = {
        shift,
        maskLayer,
        createMask
      };
    }
  });

  // node_modules/gerber-to-svg/lib/_reduce-shape.js
  var require_reduce_shape = __commonJS({
    "node_modules/gerber-to-svg/lib/_reduce-shape.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var util = require_util2();
      var shift = util.shift;
      var createMask = util.createMask;
      var maskLayer = util.maskLayer;
      var element = function(tag, attr, children) {
        return { tag, attr, children: children || [] };
      };
      var circle = function(cx, cy, r, width) {
        var attr = {
          cx: shift(cx),
          cy: shift(cy),
          r: shift(r)
        };
        if (width != null) {
          attr["stroke-width"] = shift(width);
          attr.fill = "none";
        }
        return element("circle", attr);
      };
      var rect = function(cx, cy, r, width, height) {
        var attr = {
          x: shift(cx - width / 2),
          y: shift(cy - height / 2),
          width: shift(width),
          height: shift(height)
        };
        if (r) {
          attr.rx = shift(r);
          attr.ry = shift(r);
        }
        return element("rect", attr);
      };
      var poly = function(points) {
        var pointsAttr = points.map(function(point) {
          return point.map(shift).join(",");
        }).join(" ");
        return element("polygon", { points: pointsAttr });
      };
      var clip = function(maskIdPrefix, index, shapes, ring, createElement) {
        var maskId = maskIdPrefix + "mask-" + index;
        var maskUrl = "url(#" + maskId + ")";
        var circleNode = circle(ring.cx, ring.cy, ring.r, ring.width);
        var mask = createElement("mask", { id: maskId, stroke: "#fff" }, [
          createElement(circleNode.tag, circleNode.attr)
        ]);
        var groupChildren = shapes.map(function(shape) {
          var node = shape.type === "rect" ? rect(shape.cx, shape.cy, shape.r, shape.width, shape.height) : poly(shape.points);
          return createElement(node.tag, node.attr);
        });
        var layer = element("g", { mask: maskUrl }, groupChildren);
        return { mask, layer };
      };
      module.exports = function reduceShapeArray(prefix, code, shapeArray, createElement) {
        var id = prefix + "_pad-" + code;
        var maskIdPrefix = id + "_";
        var image = shapeArray.reduce(
          function(result, shape, index) {
            var svg;
            switch (shape.type) {
              case "circle":
                svg = circle(shape.cx, shape.cy, shape.r);
                break;
              case "ring":
                svg = circle(shape.cx, shape.cy, shape.r, shape.width);
                break;
              case "rect":
                svg = rect(shape.cx, shape.cy, shape.r, shape.width, shape.height);
                break;
              case "poly":
                svg = poly(shape.points);
                break;
              case "clip":
                var clipNodes = clip(
                  maskIdPrefix,
                  index,
                  shape.shape,
                  shape.clip,
                  createElement
                );
                result.masks.push(clipNodes.mask);
                svg = clipNodes.layer;
                break;
              case "layer":
                result.count++;
                result.last = shape.polarity;
                if (shape.polarity === "clear") {
                  var nextMaskId = maskIdPrefix + result.count;
                  result.maskId = nextMaskId;
                  result.maskBox = shape.box.slice(0);
                  result.maskChildren = [];
                  result.layers = [
                    maskLayer(nextMaskId, result.layers, createElement)
                  ];
                } else {
                  var mask = createMask(
                    result.maskId,
                    result.maskBox,
                    result.maskChildren,
                    createElement
                  );
                  result.masks.push(mask);
                }
                break;
            }
            if (svg) {
              if (shapeArray.length === 1) {
                svg.attr.id = id;
              }
              var svgElement = createElement(svg.tag, svg.attr, svg.children);
              if (result.last === "dark") {
                result.layers.push(svgElement);
              } else {
                result.maskChildren.push(svgElement);
              }
            }
            return result;
          },
          {
            count: 0,
            last: "dark",
            layers: [],
            maskId: "",
            maskBox: [],
            maskChildren: [],
            masks: []
          }
        );
        if (image.last === "clear") {
          image.masks.push(
            createMask(image.maskId, image.maskBox, image.maskChildren, createElement)
          );
        }
        if (shapeArray.length > 1) {
          image.layers = createElement("g", { id }, image.layers);
        }
        return image.masks.concat(image.layers);
      };
    }
  });

  // node_modules/gerber-to-svg/lib/_flash-pad.js
  var require_flash_pad = __commonJS({
    "node_modules/gerber-to-svg/lib/_flash-pad.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var util = require_util2();
      var shift = util.shift;
      module.exports = function flashPad(prefix, tool, x, y, element) {
        var toolId = "#" + prefix + "_pad-" + tool;
        return element("use", { "xlink:href": toolId, x: shift(x), y: shift(y) });
      };
    }
  });

  // node_modules/gerber-to-svg/lib/_create-path.js
  var require_create_path = __commonJS({
    "node_modules/gerber-to-svg/lib/_create-path.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var util = require_util2();
      var shift = util.shift;
      var pointsEqual = function(point, target) {
        return point[0] === target[0] && point[1] === target[1];
      };
      var move = function(start) {
        return "M " + shift(start[0]) + " " + shift(start[1]);
      };
      var line = function(lastCmd, end) {
        var cmd = lastCmd === "L" || lastCmd === "M" ? "" : "L ";
        return cmd + shift(end[0]) + " " + shift(end[1]);
      };
      var arc = function(lastCmd, radius, sweep, dir, end, center) {
        if (sweep === 0) {
          return line(lastCmd, end);
        }
        if (sweep === 2 * Math.PI) {
          var half = [2 * center[0] - end[0], 2 * center[1] - end[1]];
          var arc1 = arc(lastCmd, radius, Math.PI, dir, half, center);
          var arc2 = arc("A", radius, Math.PI, dir, end, center);
          return arc1 + " " + arc2;
        }
        var result = lastCmd === "A" ? "" : "A ";
        radius = shift(radius);
        result += radius + " " + radius + " 0 ";
        result += sweep > Math.PI ? "1 " : "0 ";
        result += dir === "ccw" ? "1 " : "0 ";
        result += shift(end[0]) + " " + shift(end[1]);
        return result;
      };
      var reduceSegments = function(result, segment) {
        var type = segment.type;
        var start = segment.start;
        var end = segment.end;
        if (!pointsEqual(result.last, start)) {
          result.data += (result.data ? " " : "") + move(start);
          result.lastCmd = "M";
        }
        result.data += " ";
        if (type === "line") {
          result.data += line(result.lastCmd, end);
          result.lastCmd = "L";
        } else {
          result.data += arc(
            result.lastCmd,
            segment.radius,
            segment.sweep,
            segment.dir,
            end,
            segment.center
          );
          result.lastCmd = "A";
        }
        result.last = end;
        return result;
      };
      module.exports = function createPath(segments, width, element) {
        var pathData = segments.reduce(reduceSegments, { last: [], data: "" }).data;
        var attr = { d: pathData };
        if (width != null) {
          attr.fill = "none";
          attr["stroke-width"] = shift(width);
        }
        return element("path", attr);
      };
    }
  });

  // node_modules/gerber-to-svg/render.js
  var require_render = __commonJS({
    "node_modules/gerber-to-svg/render.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var xmlElementString = require_xml_element_string();
      module.exports = function(converter, attr, createElement) {
        var element = createElement || xmlElementString;
        var attributes = {
          version: "1.1",
          xmlns: "http://www.w3.org/2000/svg",
          "xmlns:xlink": "http://www.w3.org/1999/xlink",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "0",
          "fill-rule": "evenodd",
          width: converter.width + converter.units,
          height: converter.height + converter.units,
          viewBox: converter.viewBox.join(" ")
        };
        if (typeof attr === "string")
          attr = { id: attr };
        Object.keys(attr || {}).forEach(function(key) {
          var value = attr[key];
          if (value != null) {
            attributes[key] = value;
          }
        });
        var children = [];
        if (converter.layer.length) {
          if (converter.defs.length) {
            children.push(element("defs", {}, converter.defs));
          }
          var yTranslate = converter.viewBox[3] + 2 * converter.viewBox[1];
          var transform = "translate(0," + yTranslate + ") scale(1,-1)";
          children.push(
            element(
              "g",
              {
                transform,
                fill: "currentColor",
                stroke: "currentColor"
              },
              converter.layer
            )
          );
        }
        return element("svg", attributes, children);
      };
    }
  });

  // node_modules/gerber-to-svg/lib/plotter-to-svg.js
  var require_plotter_to_svg = __commonJS({
    "node_modules/gerber-to-svg/lib/plotter-to-svg.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var Transform = require_readable_browser().Transform;
      var inherits2 = require_inherits_browser();
      var isFinite2 = require_lodash();
      var reduceShapeArray = require_reduce_shape();
      var flashPad = require_flash_pad();
      var createPath = require_create_path();
      var util = require_util2();
      var render = require_render();
      var shift = util.shift;
      var maskLayer = util.maskLayer;
      var createMask = util.createMask;
      var BLOCK_MODE_OFF = 0;
      var BLOCK_MODE_DARK = 1;
      var BLOCK_MODE_CLEAR = 2;
      var PlotterToSvg = function(id, attributes, createElement, objectMode) {
        Transform.call(this, {
          writableObjectMode: true,
          readableObjectMode: objectMode
        });
        this.id = id;
        this.attributes = attributes;
        this.defs = [];
        this.layer = [];
        this.viewBox = [0, 0, 0, 0];
        this.width = 0;
        this.height = 0;
        this.units = "";
        this._maskId = "";
        this._maskBox = [];
        this._mask = [];
        this._blockMode = false;
        this._blockBox = [];
        this._block = [];
        this._blockCount = 0;
        this._blockLayerCount = 0;
        this._offsets = [];
        this._clearCount = 0;
        this._lastLayer = 0;
        this._blockCount = 0;
        this._blockCount = 0;
        this._element = createElement;
      };
      inherits2(PlotterToSvg, Transform);
      PlotterToSvg.prototype._transform = function(chunk, encoding, done) {
        switch (chunk.type) {
          case "shape":
            this.defs = this.defs.concat(
              reduceShapeArray(this.id, chunk.tool, chunk.shape, this._element)
            );
            break;
          case "pad":
            this._draw(flashPad(this.id, chunk.tool, chunk.x, chunk.y, this._element));
            break;
          case "fill":
            this._draw(createPath(chunk.path, null, this._element));
            break;
          case "stroke":
            this._draw(createPath(chunk.path, chunk.width, this._element));
            break;
          case "polarity":
            this._handleNewPolarity(chunk.polarity, chunk.box);
            break;
          case "repeat":
            this._handleNewRepeat(chunk.offsets, chunk.box);
            break;
          case "size":
            this._handleSize(chunk.box, chunk.units);
        }
        done();
      };
      PlotterToSvg.prototype._flush = function(done) {
        this._handleNewRepeat([]);
        this.push(render(this, this.attributes, this._element));
        done();
      };
      PlotterToSvg.prototype._finishBlockLayer = function() {
        if (this._block.length) {
          this._blockLayerCount++;
          var blockLayerId = this.id + "_block-" + this._blockCount + "-" + this._blockLayerCount;
          this.defs.push(this._element("g", { id: blockLayerId }, this._block));
          this._block = [];
        }
      };
      PlotterToSvg.prototype._finishClearLayer = function() {
        if (this._maskId) {
          this.defs.push(
            createMask(this._maskId, this._maskBox, this._mask, this._element)
          );
          this._maskId = "";
          this._maskBox = [];
          this._mask = [];
          return true;
        }
        return false;
      };
      PlotterToSvg.prototype._handleNewPolarity = function(polarity, box) {
        if (this._blockMode) {
          if (this._blockLayerCount === 0 && !this._block.length) {
            this._blockMode = polarity === "dark" ? BLOCK_MODE_DARK : BLOCK_MODE_CLEAR;
          }
          return this._finishBlockLayer();
        }
        this._clearCount = polarity === "clear" ? this._clearCount + 1 : this._clearCount;
        var maskId = this.id + "_clear-" + this._clearCount;
        if (polarity === "clear") {
          this.layer = [maskLayer(maskId, this.layer, this._element)];
          this._maskId = maskId;
          this._maskBox = box.slice(0);
        } else {
          this._finishClearLayer(box);
        }
      };
      PlotterToSvg.prototype._handleNewRepeat = function(offsets, box) {
        var endOfBlock = offsets.length === 0;
        var wasClear = this._finishClearLayer();
        this._finishBlockLayer();
        var layer = this.layer;
        var element = this._element;
        var blockMode = this._blockMode;
        var blockLayers = this._blockLayerCount;
        var blockIdStart = this.id + "_block-" + this._blockCount + "-";
        this._offsets.forEach(function(offset) {
          for (var i = blockMode; i <= blockLayers; i += 2) {
            layer.push(
              element("use", {
                "xlink:href": "#" + blockIdStart + i,
                x: shift(offset[0]),
                y: shift(offset[1])
              })
            );
          }
        });
        if (blockLayers > 2 - blockMode) {
          var maskId = blockIdStart + "clear";
          this.layer = [maskLayer(maskId, layer, this._element)];
          this._maskId = maskId;
          this._maskBox = this._blockBox.slice(0);
          this._mask = this._offsets.reduce(function(result, offset) {
            var isDark;
            for (var i = 1; i <= blockLayers; i++) {
              isDark = blockMode === BLOCK_MODE_DARK ? i % 2 === 1 : i % 2 === 0;
              var attr = {
                "xlink:href": "#" + blockIdStart + i,
                x: shift(offset[0]),
                y: shift(offset[1])
              };
              if (isDark) {
                attr.fill = "#fff";
                attr.stroke = "#fff";
              }
              result.push(element("use", attr));
            }
            return result;
          }, []);
          wasClear = this._finishClearLayer();
        }
        this._offsets = offsets;
        if (!endOfBlock) {
          this._blockMode = !wasClear ? BLOCK_MODE_DARK : BLOCK_MODE_CLEAR;
          this._blockCount++;
          this._blockLayerCount = 0;
          this._blockBox = box.every(isFinite2) ? box : [0, 0, 0, 0];
        } else {
          this._blockMode = BLOCK_MODE_OFF;
        }
      };
      PlotterToSvg.prototype._handleSize = function(box, units) {
        if (box.every(isFinite2)) {
          var x = shift(box[0]);
          var y = shift(box[1]);
          var width = shift(box[2] - box[0]);
          var height = shift(box[3] - box[1]);
          this.viewBox = [x, y, width, height];
          this.width = width / 1e3;
          this.height = height / 1e3;
          this.units = units;
        }
      };
      PlotterToSvg.prototype._draw = function(object) {
        if (!this._blockMode) {
          if (!this._maskId) {
            this.layer.push(object);
          } else {
            this._mask.push(object);
          }
        } else {
          this._block.push(object);
        }
      };
      module.exports = PlotterToSvg;
    }
  });

  // node_modules/gerber-to-svg/clone.js
  var require_clone = __commonJS({
    "node_modules/gerber-to-svg/clone.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var KEYS = [
        "id",
        "attributes",
        "defs",
        "layer",
        "viewBox",
        "width",
        "height",
        "units"
      ];
      module.exports = function cloneConverter(converter) {
        return KEYS.reduce(function(result, key) {
          var value = converter[key];
          if (value != null) {
            result[key] = converter[key];
          }
          return result;
        }, {});
      };
    }
  });

  // node_modules/gerber-to-svg/index.js
  var require_gerber_to_svg = __commonJS({
    "node_modules/gerber-to-svg/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var xid = require_xml_id();
      var gerberParser = require_gerber_parser();
      var gerberPlotter = require_gerber_plotter();
      var xmlElementString = require_xml_element_string();
      var PlotterToSvg = require_plotter_to_svg();
      var render = require_render();
      var clone = require_clone();
      var parseOptions = function(options) {
        if (typeof options === "string") {
          options = { id: options };
        } else if (!options) {
          options = {};
        }
        var opts = {
          id: xid.ensure(options.id),
          attributes: options.attributes || {},
          createElement: options.createElement || xmlElementString,
          objectMode: options.objectMode == null ? false : options.objectMode,
          parser: {
            places: options.places,
            zero: options.zero,
            filetype: options.filetype
          },
          plotter: {
            units: options.units,
            backupUnits: options.backupUnits,
            nota: options.nota,
            backupNota: options.backupNota,
            optimizePaths: options.optimizePaths,
            plotAsOutline: options.plotAsOutline
          }
        };
        return opts;
      };
      module.exports = function gerberConverterFactory(gerber, inputOpts, done) {
        if (typeof inputOpts === "function") {
          done = inputOpts;
          inputOpts = null;
        }
        var opts = parseOptions(inputOpts);
        var callbackMode = done != null;
        var converter = new PlotterToSvg(
          opts.id,
          opts.attributes,
          opts.createElement,
          opts.objectMode
        );
        var parser = gerberParser(opts.parser);
        var plotter = gerberPlotter(opts.plotter);
        converter.parser = parser;
        converter.plotter = plotter;
        parser.on("warning", function handleParserWarning(w) {
          converter.emit("warning", w);
        });
        plotter.on("warning", function handlePlotterWarning(w) {
          converter.emit("warning", w);
        });
        parser.once("error", function handleParserError(e) {
          converter.emit("error", e);
        });
        plotter.once("error", function handlePlotterError(e) {
          converter.emit("error", e);
        });
        parser.once("end", function() {
          converter.filetype = parser.format.filetype;
        });
        if (gerber.pipe) {
          gerber.setEncoding("utf8");
          gerber.pipe(parser);
        } else {
          process.nextTick(function writeStringToParser() {
            parser.write(gerber);
            parser.end();
          });
        }
        parser.pipe(plotter).pipe(converter);
        if (callbackMode) {
          var result = "";
          var finishConversion = function() {
            return done(null, result);
          };
          converter.on("readable", function collectStreamData() {
            var data;
            do {
              data = converter.read() || "";
              result += data;
            } while (data);
          });
          converter.once("end", finishConversion);
          converter.once("error", function(error) {
            converter.removeListener("end", finishConversion);
            return done(error);
          });
        }
        return converter;
      };
      module.exports.render = render;
      module.exports.clone = clone;
    }
  });

  // node_modules/queue-microtask/index.js
  var require_queue_microtask = __commonJS({
    "node_modules/queue-microtask/index.js"(exports, module) {
      init_process();
      init_buffer();
      var promise;
      module.exports = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : globalThis) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err2) => setTimeout(() => {
        throw err2;
      }, 0));
    }
  });

  // node_modules/run-parallel/index.js
  var require_run_parallel = __commonJS({
    "node_modules/run-parallel/index.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = runParallel;
      var queueMicrotask2 = require_queue_microtask();
      function runParallel(tasks, cb) {
        let results, pending, keys;
        let isSync = true;
        if (Array.isArray(tasks)) {
          results = [];
          pending = tasks.length;
        } else {
          keys = Object.keys(tasks);
          results = {};
          pending = keys.length;
        }
        function done(err2) {
          function end() {
            if (cb)
              cb(err2, results);
            cb = null;
          }
          if (isSync)
            queueMicrotask2(end);
          else
            end();
        }
        function each(i, err2, result) {
          results[i] = result;
          if (--pending === 0 || err2) {
            done(err2);
          }
        }
        if (!pending) {
          done(null);
        } else if (keys) {
          keys.forEach(function(key) {
            tasks[key](function(err2, result) {
              each(key, err2, result);
            });
          });
        } else {
          tasks.forEach(function(task, i) {
            task(function(err2, result) {
              each(i, err2, result);
            });
          });
        }
        isSync = false;
      }
    }
  });

  // node_modules/run-waterfall/index.js
  var require_run_waterfall = __commonJS({
    "node_modules/run-waterfall/index.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = runWaterfall;
      function runWaterfall(tasks, cb) {
        var current = 0;
        var isSync = true;
        function done(err2, args) {
          function end() {
            args = args ? [].concat(err2, args) : [err2];
            if (cb)
              cb.apply(void 0, args);
          }
          if (isSync)
            process.nextTick(end);
          else
            end();
        }
        function each(err2) {
          var args = Array.prototype.slice.call(arguments, 1);
          if (++current >= tasks.length || err2) {
            done(err2, args);
          } else {
            tasks[current].apply(void 0, [].concat(args, each));
          }
        }
        if (tasks.length) {
          tasks[0](each);
        } else {
          done(null);
        }
        isSync = false;
      }
    }
  });

  // node_modules/viewbox/index.js
  var require_viewbox = __commonJS({
    "node_modules/viewbox/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = {
        create: function createViewbox() {
          return [];
        },
        add: function addViewboxes(box, addend) {
          if (!box.length) {
            return addend;
          }
          if (!addend.length) {
            return box;
          }
          var xMin = Math.min(box[0], addend[0]);
          var yMin = Math.min(box[1], addend[1]);
          var xMax = Math.max(box[0] + box[2], addend[0] + addend[2]);
          var yMax = Math.max(box[1] + box[3], addend[1] + addend[3]);
          return [xMin, yMin, xMax - xMin, yMax - yMin];
        },
        scale: function scaleViewboxes(box, scale) {
          return box.map(function(component) {
            return component * scale;
          });
        },
        rect: function viewboxRect(box) {
          box = box && box.length ? box : [0, 0, 0, 0];
          return {
            x: box[0],
            y: box[1],
            width: box[2],
            height: box[3]
          };
        },
        asString: function(box) {
          box = box && box.length ? box : [0, 0, 0, 0];
          return box.join(" ");
        }
      };
    }
  });

  // node_modules/color-name/index.js
  var require_color_name = __commonJS({
    "node_modules/color-name/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
      };
    }
  });

  // node_modules/is-arrayish/index.js
  var require_is_arrayish = __commonJS({
    "node_modules/is-arrayish/index.js"(exports, module) {
      init_process();
      init_buffer();
      module.exports = function isArrayish(obj) {
        if (!obj || typeof obj === "string") {
          return false;
        }
        return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
      };
    }
  });

  // node_modules/simple-swizzle/index.js
  var require_simple_swizzle = __commonJS({
    "node_modules/simple-swizzle/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var isArrayish = require_is_arrayish();
      var concat3 = Array.prototype.concat;
      var slice3 = Array.prototype.slice;
      var swizzle = module.exports = function swizzle2(args) {
        var results = [];
        for (var i = 0, len = args.length; i < len; i++) {
          var arg = args[i];
          if (isArrayish(arg)) {
            results = concat3.call(results, slice3.call(arg));
          } else {
            results.push(arg);
          }
        }
        return results;
      };
      swizzle.wrap = function(fn) {
        return function() {
          return fn(swizzle(arguments));
        };
      };
    }
  });

  // node_modules/color-string/index.js
  var require_color_string = __commonJS({
    "node_modules/color-string/index.js"(exports, module) {
      init_process();
      init_buffer();
      var colorNames = require_color_name();
      var swizzle = require_simple_swizzle();
      var hasOwnProperty2 = Object.hasOwnProperty;
      var reverseNames = /* @__PURE__ */ Object.create(null);
      for (name in colorNames) {
        if (hasOwnProperty2.call(colorNames, name)) {
          reverseNames[colorNames[name]] = name;
        }
      }
      var name;
      var cs = module.exports = {
        to: {},
        get: {}
      };
      cs.get = function(string) {
        var prefix = string.substring(0, 3).toLowerCase();
        var val;
        var model;
        switch (prefix) {
          case "hsl":
            val = cs.get.hsl(string);
            model = "hsl";
            break;
          case "hwb":
            val = cs.get.hwb(string);
            model = "hwb";
            break;
          default:
            val = cs.get.rgb(string);
            model = "rgb";
            break;
        }
        if (!val) {
          return null;
        }
        return { model, value: val };
      };
      cs.get.rgb = function(string) {
        if (!string) {
          return null;
        }
        var abbr = /^#([a-f0-9]{3,4})$/i;
        var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
        var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
        var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
        var keyword = /^(\w+)$/;
        var rgb = [0, 0, 0, 1];
        var match;
        var i;
        var hexAlpha;
        if (match = string.match(hex)) {
          hexAlpha = match[2];
          match = match[1];
          for (i = 0; i < 3; i++) {
            var i2 = i * 2;
            rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
          }
          if (hexAlpha) {
            rgb[3] = parseInt(hexAlpha, 16) / 255;
          }
        } else if (match = string.match(abbr)) {
          match = match[1];
          hexAlpha = match[3];
          for (i = 0; i < 3; i++) {
            rgb[i] = parseInt(match[i] + match[i], 16);
          }
          if (hexAlpha) {
            rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
          }
        } else if (match = string.match(rgba)) {
          for (i = 0; i < 3; i++) {
            rgb[i] = parseInt(match[i + 1], 0);
          }
          if (match[4]) {
            if (match[5]) {
              rgb[3] = parseFloat(match[4]) * 0.01;
            } else {
              rgb[3] = parseFloat(match[4]);
            }
          }
        } else if (match = string.match(per)) {
          for (i = 0; i < 3; i++) {
            rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
          }
          if (match[4]) {
            if (match[5]) {
              rgb[3] = parseFloat(match[4]) * 0.01;
            } else {
              rgb[3] = parseFloat(match[4]);
            }
          }
        } else if (match = string.match(keyword)) {
          if (match[1] === "transparent") {
            return [0, 0, 0, 0];
          }
          if (!hasOwnProperty2.call(colorNames, match[1])) {
            return null;
          }
          rgb = colorNames[match[1]];
          rgb[3] = 1;
          return rgb;
        } else {
          return null;
        }
        for (i = 0; i < 3; i++) {
          rgb[i] = clamp(rgb[i], 0, 255);
        }
        rgb[3] = clamp(rgb[3], 0, 1);
        return rgb;
      };
      cs.get.hsl = function(string) {
        if (!string) {
          return null;
        }
        var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
        var match = string.match(hsl);
        if (match) {
          var alpha = parseFloat(match[4]);
          var h = (parseFloat(match[1]) % 360 + 360) % 360;
          var s = clamp(parseFloat(match[2]), 0, 100);
          var l = clamp(parseFloat(match[3]), 0, 100);
          var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
          return [h, s, l, a];
        }
        return null;
      };
      cs.get.hwb = function(string) {
        if (!string) {
          return null;
        }
        var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
        var match = string.match(hwb);
        if (match) {
          var alpha = parseFloat(match[4]);
          var h = (parseFloat(match[1]) % 360 + 360) % 360;
          var w = clamp(parseFloat(match[2]), 0, 100);
          var b = clamp(parseFloat(match[3]), 0, 100);
          var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
          return [h, w, b, a];
        }
        return null;
      };
      cs.to.hex = function() {
        var rgba = swizzle(arguments);
        return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
      };
      cs.to.rgb = function() {
        var rgba = swizzle(arguments);
        return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
      };
      cs.to.rgb.percent = function() {
        var rgba = swizzle(arguments);
        var r = Math.round(rgba[0] / 255 * 100);
        var g = Math.round(rgba[1] / 255 * 100);
        var b = Math.round(rgba[2] / 255 * 100);
        return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
      };
      cs.to.hsl = function() {
        var hsla = swizzle(arguments);
        return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
      };
      cs.to.hwb = function() {
        var hwba = swizzle(arguments);
        var a = "";
        if (hwba.length >= 4 && hwba[3] !== 1) {
          a = ", " + hwba[3];
        }
        return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
      };
      cs.to.keyword = function(rgb) {
        return reverseNames[rgb.slice(0, 3)];
      };
      function clamp(num, min, max2) {
        return Math.min(Math.max(min, num), max2);
      }
      function hexDouble(num) {
        var str = Math.round(num).toString(16).toUpperCase();
        return str.length < 2 ? "0" + str : str;
      }
    }
  });

  // node_modules/pcb-stackup-core/lib/board-color.js
  var require_board_color = __commonJS({
    "node_modules/pcb-stackup-core/lib/board-color.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var colorString = require_color_string();
      var LAYER_IDS = ["fr4", "cu", "cf", "sm", "ss", "sp", "out"];
      var DEFAULTS2 = {
        fr4: "#666666",
        cu: "#cccccc",
        cf: "#cc9933",
        sm: "#004200bf",
        ss: "#ffffff",
        sp: "#999999",
        out: "#000000"
      };
      function getColor(overrides) {
        overrides = overrides || {};
        return LAYER_IDS.reduce(function(color, id) {
          color[id] = overrides[id] || DEFAULTS2[id];
          return color;
        }, {});
      }
      function getStyleElement(element, prefix, side, color) {
        return element("style", {}, [
          LAYER_IDS.map(function(id) {
            var selector = "." + prefix + id;
            var style = colorToCssString(color[id]);
            return selector + " {" + style + "}";
          }).join("\n")
        ]);
      }
      function colorToCssString(color) {
        var parsedColor = colorString.get(color);
        if (!parsedColor)
          return "";
        var css = "color: ";
        var components = parsedColor.value.slice(0, 3);
        var alpha = parsedColor.value[3] != null ? parsedColor.value[3] : 1;
        if (parsedColor.model === "rgb") {
          css += colorString.to.hex(components).toLowerCase();
        } else {
          css += colorString.to[parsedColor.model](components).toLowerCase();
        }
        if (alpha !== 1) {
          css += "; opacity: " + alpha;
        }
        return css + ";";
      }
      module.exports = { getColor, getStyleElement };
    }
  });

  // node_modules/pcb-stackup-core/lib/parse-options.js
  var require_parse_options = __commonJS({
    "node_modules/pcb-stackup-core/lib/parse-options.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var boardColor = require_board_color();
      var xid = require_xml_id();
      var xmlElementString = require_xml_element_string();
      module.exports = function parseOptions(input) {
        if (typeof input === "string") {
          input = { id: input };
        } else if (!input) {
          input = {};
        }
        return {
          id: xid.ensure(input.id),
          color: boardColor.getColor(input.color),
          attributes: input.attributes || {},
          useOutline: input.useOutline != null ? input.useOutline : true,
          createElement: input.createElement || xmlElementString
        };
      };
    }
  });

  // node_modules/pcb-stackup-core/lib/sort-layers.js
  var require_sort_layers = __commonJS({
    "node_modules/pcb-stackup-core/lib/sort-layers.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var wtg = require_whats_that_gerber();
      module.exports = function sortLayers(layers) {
        return layers.filter(acceptLayer).reduce(assignLayer, {
          top: [],
          bottom: [],
          drills: [],
          outline: null
        });
      };
      function acceptLayer(layer) {
        return layer != null && layer.type != null && layer.side != null && layer.converter != null && layer.converter.layer != null && layer.converter.layer.length;
      }
      function assignLayer(result, layer) {
        var type = layer.type;
        var side = layer.side;
        if (type === wtg.TYPE_DRILL) {
          result.drills.push(layer);
        } else if (type === wtg.TYPE_OUTLINE) {
          result.outline = layer;
        } else {
          if (side === wtg.SIDE_TOP) {
            result.top.push(layer);
          } else if (side === wtg.SIDE_BOTTOM) {
            result.bottom.push(layer);
          }
        }
        return result;
      }
    }
  });

  // node_modules/pcb-stackup-core/lib/wrap-layer.js
  var require_wrap_layer = __commonJS({
    "node_modules/pcb-stackup-core/lib/wrap-layer.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      module.exports = function wrapLayer(element, id, converter, scale, tag) {
        var layer = converter.layer;
        var attr = { id };
        if (scale && scale !== 1) {
          attr.transform = "scale(" + scale + "," + scale + ")";
        }
        return element(tag || "g", attr, layer);
      };
    }
  });

  // node_modules/pcb-stackup-core/lib/_gather-layers.js
  var require_gather_layers = __commonJS({
    "node_modules/pcb-stackup-core/lib/_gather-layers.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var viewbox = require_viewbox();
      var wtg = require_whats_that_gerber();
      var wrapLayer = require_wrap_layer();
      module.exports = function gatherLayers(element, idPrefix, layers, drills, outline, useOutline) {
        var defs = [];
        var layerIds = [];
        var drillIds = [];
        var units = "";
        var unitsCount = { in: 0, mm: 0 };
        var allLayers = layers.concat(drills, outline || []);
        var drillCount = 0;
        var getUniqueId = function(type) {
          var id = idPrefix + type;
          if (type === wtg.TYPE_DRILL) {
            drillCount++;
            id += drillCount;
          }
          return id;
        };
        allLayers.forEach(function(layer) {
          if (!layer.externalId) {
            defs = defs.concat(layer.converter.defs);
          }
          if (layer.converter.units === "mm") {
            unitsCount.mm++;
          } else {
            unitsCount.in++;
          }
        });
        if (unitsCount.in + unitsCount.mm) {
          units = unitsCount.in > unitsCount.mm ? "in" : "mm";
        }
        var viewboxLayers = useOutline && outline ? [outline] : allLayers;
        var box = viewboxLayers.reduce(function(result, layer) {
          var layerBox = layer.converter.viewBox;
          var layerUnits = layer.converter.units;
          if (layerUnits && layerBox[2] !== 0 && layerBox[3] !== 0) {
            return viewbox.add(
              result,
              viewbox.scale(layerBox, getScale(units, layerUnits))
            );
          }
          return result;
        }, viewbox.create());
        var wrapConverterLayer = function(collection) {
          return function(layer) {
            var id = layer.externalId;
            var converter = layer.converter;
            if (!id) {
              id = getUniqueId(layer.type);
              defs.push(
                wrapLayer(element, id, converter, getScale(units, converter.units))
              );
            }
            collection.push({ type: layer.type, id });
          };
        };
        layers.forEach(wrapConverterLayer(layerIds));
        drills.forEach(wrapConverterLayer(drillIds));
        var outlineId;
        if (outline) {
          if (outline.externalId && !useOutline) {
            outlineId = outline.externalId;
          } else {
            outlineId = getUniqueId(outline.type);
            defs.push(
              wrapLayer(
                element,
                outlineId,
                outline.converter,
                getScale(units, outline.converter.units),
                useOutline ? "clipPath" : "g"
              )
            );
          }
        }
        return {
          defs,
          box,
          units,
          layerIds,
          drillIds,
          outlineId
        };
      };
      function getScale(units, layerUnits) {
        var scale = units === "in" ? 1 / 25.4 : 25.4;
        var result = units === layerUnits ? 1 : scale;
        return result;
      }
    }
  });

  // node_modules/pcb-stackup-core/lib/stack-layers.js
  var require_stack_layers = __commonJS({
    "node_modules/pcb-stackup-core/lib/stack-layers.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var viewbox = require_viewbox();
      var wtg = require_whats_that_gerber();
      var gatherLayers = require_gather_layers();
      module.exports = function(element, id, side, layers, drills, outline, useOutline) {
        var classPrefix = id + "_";
        var idPrefix = id + "_" + side + "_";
        var mechMaskId = idPrefix + "mech-mask";
        var layerProps = gatherLayers(
          element,
          idPrefix,
          layers,
          drills,
          outline,
          useOutline
        );
        var defs = layerProps.defs;
        var box = layerProps.box;
        var units = layerProps.units;
        layers = layerProps.layerIds;
        drills = layerProps.drillIds;
        defs.push(mechMask(element, mechMaskId, box, drills));
        var layer = [createRect(element, box, "currentColor", classPrefix + "fr4")];
        var cuLayerId = findLayerId(layers, wtg.TYPE_COPPER);
        var smLayerId = findLayerId(layers, wtg.TYPE_SOLDERMASK);
        var ssLayerId = findLayerId(layers, wtg.TYPE_SILKSCREEN);
        var spLayerId = findLayerId(layers, wtg.TYPE_SOLDERPASTE);
        var outLayerId = layerProps.outlineId;
        if (cuLayerId) {
          var cfMaskId = idPrefix + "cf-mask";
          var cfMaskShape = smLayerId ? [useLayer(element, smLayerId)] : [createRect(element, box)];
          var cfMaskGroupAttr = { fill: "#fff", stroke: "#fff" };
          var cfMaskGroup = [element("g", cfMaskGroupAttr, cfMaskShape)];
          defs.push(element("mask", { id: cfMaskId }, cfMaskGroup));
          layer.push(useLayer(element, cuLayerId, classPrefix + "cu"));
          layer.push(useLayer(element, cuLayerId, classPrefix + "cf", cfMaskId));
        }
        if (smLayerId) {
          var smMaskId = idPrefix + "sm-mask";
          var smMaskShape = [
            createRect(element, box, "#fff"),
            useLayer(element, smLayerId)
          ];
          var smMaskGroupAtrr = { fill: "#000", stroke: "#000" };
          var smMaskGroup = [element("g", smMaskGroupAtrr, smMaskShape)];
          defs.push(element("mask", { id: smMaskId }, smMaskGroup));
          var smGroupAttr = { mask: "url(#" + smMaskId + ")" };
          var smGroupShape = [
            createRect(element, box, "currentColor", classPrefix + "sm")
          ];
          if (ssLayerId) {
            smGroupShape.push(useLayer(element, ssLayerId, classPrefix + "ss"));
          }
          layer.push(element("g", smGroupAttr, smGroupShape));
        }
        if (spLayerId) {
          layer.push(useLayer(element, spLayerId, classPrefix + "sp"));
        }
        if (outLayerId && !useOutline) {
          layer.push(useLayer(element, outLayerId, classPrefix + "out"));
        }
        return {
          defs,
          layer,
          mechMaskId,
          outClipId: outLayerId && useOutline ? outLayerId : null,
          box,
          units
        };
      };
      function findLayerId(layers, type) {
        var layer;
        var i;
        for (i = 0; i < layers.length; i++) {
          layer = layers[i];
          if (layer.type === type) {
            return layer.id;
          }
        }
      }
      function useLayer(element, id, className, mask) {
        var attr = { "xlink:href": "#" + id };
        if (className) {
          attr.fill = "currentColor";
          attr.stroke = "currentColor";
          attr.class = className;
        }
        if (mask) {
          attr.mask = "url(#" + mask + ")";
        }
        return element("use", attr);
      }
      function createRect(element, box, fill3, className) {
        var attr = viewbox.rect(box);
        if (fill3) {
          attr.fill = fill3;
        }
        if (className) {
          attr.class = className;
        }
        return element("rect", attr);
      }
      function mechMask(element, id, box, drills) {
        var children = drills.map(function(layer) {
          return useLayer(element, layer.id);
        });
        children.unshift(createRect(element, box, "#fff"));
        var groupAttr = { fill: "#000", stroke: "#000" };
        var group = [element("g", groupAttr, children)];
        return element("mask", { id }, group);
      }
    }
  });

  // node_modules/pcb-stackup-core/index.js
  var require_pcb_stackup_core = __commonJS({
    "node_modules/pcb-stackup-core/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var extend = require_immutable();
      var wtg = require_whats_that_gerber();
      var vb = require_viewbox();
      var boardColor = require_board_color();
      var parseOptions = require_parse_options();
      var sortLayers = require_sort_layers();
      var stackLayers = require_stack_layers();
      var SIDES = [wtg.SIDE_TOP, wtg.SIDE_BOTTOM];
      var BASE_ATTRIBUTES = {
        version: "1.1",
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": 0,
        "fill-rule": "evenodd",
        "clip-rule": "evenodd"
      };
      module.exports = function pcbStackupCore(layers, inputOpts) {
        var options = parseOptions(inputOpts);
        var sorted = sortLayers(layers);
        var id = options.id;
        var color = options.color;
        var attributes = options.attributes;
        var useOutline = options.useOutline;
        var element = options.createElement;
        var stacks = SIDES.map(function(side) {
          return stackLayers(
            element,
            id,
            side,
            sorted[side],
            sorted.drills,
            sorted.outline,
            useOutline
          );
        });
        var box = stacks.reduce(function(result, stack) {
          return vb.add(result, stack.box);
        }, vb.create());
        if (box.length !== 4)
          box = [0, 0, 0, 0];
        return stacks.reduce(function(result, stack, index) {
          var side = SIDES[index];
          var style = boardColor.getStyleElement(element, id + "_", side, color);
          var units = stack.units;
          var mechMaskId = stack.mechMaskId;
          var outClipId = stack.outClipId;
          var defs = [style].concat(stack.defs);
          var layer = [
            element(
              "g",
              getGroupAttributes(box, side, mechMaskId, outClipId),
              stack.layer
            )
          ];
          var defsNode = element("defs", {}, defs);
          var layerNode = element("g", getLayerAttributes(box), layer);
          var sideAttributes = extend(
            BASE_ATTRIBUTES,
            {
              id: id + "_" + side,
              viewBox: vb.asString(box),
              width: box[2] / 1e3 + units,
              height: box[3] / 1e3 + units
            },
            attributes
          );
          result[side] = {
            svg: element("svg", sideAttributes, [defsNode, layerNode]),
            attributes: sideAttributes,
            defs,
            layer,
            viewBox: box,
            width: box[2] / 1e3,
            height: box[3] / 1e3,
            units
          };
          return result;
        }, options);
      };
      function getGroupAttributes(box, side, mechMaskId, outClipId) {
        var attr = { mask: "url(#" + mechMaskId + ")" };
        if (outClipId) {
          attr["clip-path"] = "url(#" + outClipId + ")";
        }
        if (side === wtg.SIDE_BOTTOM) {
          var xTranslation = 2 * box[0] + box[2];
          attr.transform = "translate(" + xTranslation + ",0) scale(-1,1)";
        }
        return attr;
      }
      function getLayerAttributes(box) {
        var yTranslation = 2 * box[1] + box[3];
        return { transform: "translate(0," + yTranslation + ") scale(1,-1)" };
      }
    }
  });

  // node_modules/pcb-stackup/index.js
  var require_pcb_stackup = __commonJS({
    "node_modules/pcb-stackup/index.js"(exports, module) {
      "use strict";
      init_process();
      init_buffer();
      var extend = require_immutable();
      var runParallel = require_run_parallel();
      var runWaterfall = require_run_waterfall();
      var gerberToSvg2 = require_gerber_to_svg();
      var createStackup = require_pcb_stackup_core();
      var wtg = require_whats_that_gerber();
      module.exports = function pcbStackup2(layers, options, done) {
        var result;
        if (typeof options === "function") {
          done = options;
          options = null;
        }
        validateLayersInput(layers);
        if (done == null) {
          if (typeof Promise !== "function") {
            throw new Error("No callback specified and global Promise not found");
          }
          result = new Promise(function(resolve, reject) {
            done = function callbackToPromise(error, stackup) {
              if (error)
                return reject(error);
              resolve(stackup);
            };
          });
        }
        var layerTypes = wtg(
          layers.map(function(layer) {
            return layer.filename;
          }).filter(Boolean)
        );
        runWaterfall(
          [
            // render all layers with gerber-to-svg in parallel
            function renderAllLayers(next) {
              var layerTasks = layers.map(makeRenderLayerTask);
              runParallel(layerTasks, next);
            },
            // using the result of renderAllLayers, build the stackup
            function renderStackup(stackupLayers, next) {
              var stackup = createStackup(stackupLayers, options);
              stackup.layers = stackupLayers;
              next(null, stackup);
            }
          ],
          function finish(error, stackup) {
            if (error)
              return done(error);
            done(null, stackup);
          }
        );
        return result;
        function makeRenderLayerTask(layer) {
          return function renderLayer(next) {
            var stackupLayer = makeBaseStackupLayer(layer);
            if (stackupLayer.converter)
              return next(null, stackupLayer);
            var converter = gerberToSvg2(
              stackupLayer.gerber,
              stackupLayer.options,
              function handleLayerDone(error) {
                if (error)
                  return next(error);
                stackupLayer.converter = converter;
                next(null, stackupLayer);
              }
            );
          };
        }
        function makeBaseStackupLayer(layer) {
          var layerSide = layer.side;
          var layerType = layer.type;
          if (layer.filename && typeof layerSide === "undefined" && typeof layerType === "undefined") {
            var gerberId = layerTypes[layer.filename];
            layerSide = gerberId.side;
            layerType = gerberId.type;
          }
          var layerOptions = extend(layer.options);
          if (layerOptions.plotAsOutline == null && layerType === wtg.TYPE_OUTLINE) {
            layerOptions.plotAsOutline = true;
          }
          if (options && options.outlineGapFill != null && layerOptions.plotAsOutline) {
            layerOptions.plotAsOutline = options.outlineGapFill;
          }
          return extend(layer, {
            side: layerSide,
            type: layerType,
            options: layerOptions
          });
        }
      };
      function validateLayersInput(layers) {
        if (!Array.isArray(layers)) {
          throw new Error("first argument should be an array of layers");
        }
        var layerErrors = layers.map(getLayerValidationError).filter(Boolean).join(", ");
        if (layerErrors)
          throw new Error(layerErrors);
      }
      function getLayerValidationError(layer, index) {
        var result = wtg.validate(layer);
        var error = null;
        if (!layer.converter && !layer.gerber) {
          error = "is missing gerber source or cached converter";
        } else if (!layer.filename && !layer.type) {
          error = "is missing filename or side/type";
        } else if (!layer.filename && !result.valid) {
          error = "has invalid side/type (" + layer.side + "/" + layer.type + ")";
        }
        return error ? "layer " + index + " " + error : null;
      }
    }
  });

  // src/content.js
  init_process();
  init_buffer();

  // src/core/github.js
  init_process();
  init_buffer();
  function parseBlobUrl(pathname) {
    const m = pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
    if (!m)
      return null;
    const [, owner, repo, ref, filepath] = m;
    return {
      kind: "blob",
      owner,
      repo,
      ref,
      filepath,
      filename: filepath.split("/").pop(),
      dir: filepath.includes("/") ? filepath.substring(0, filepath.lastIndexOf("/")) : "",
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filepath}`
    };
  }
  function parseTreeUrl(pathname) {
    const m = pathname.match(/^\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
    if (!m) {
      const root = pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
      if (!root)
        return null;
      const [, owner2, repo2] = root;
      return { kind: "tree", owner: owner2, repo: repo2, ref: null, dir: "" };
    }
    const [, owner, repo, ref, dir] = m;
    return { kind: "tree", owner, repo, ref, dir };
  }
  function parseGistUrl(host, pathname) {
    if (host !== "gist.github.com")
      return null;
    const segments = pathname.replace(/^\/|\/$/g, "").split("/");
    if (segments.length === 0)
      return null;
    let gistId = null;
    let user = null;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (/^[0-9a-f]{20,}$/i.test(segments[i])) {
        gistId = segments[i];
        if (i > 0)
          user = segments[i - 1];
        break;
      }
    }
    if (!gistId)
      return null;
    return { kind: "gist", gistId, user };
  }
  function parseGitHubUrl(pathname, host = "github.com") {
    if (host === "gist.github.com") {
      return parseGistUrl(host, pathname);
    }
    return parseBlobUrl(pathname) || parseTreeUrl(pathname);
  }
  async function fetchGist(gistId) {
    const url = `https://api.github.com/gists/${gistId}`;
    const res = await fetch(url, {
      credentials: "omit",
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("GitHub API rate-limited (60/hr unauthenticated)");
      }
      throw new Error(`Gist lookup failed: ${res.status}`);
    }
    return res.json();
  }
  async function fetchRaw(rawUrl) {
    const res = await fetch(rawUrl, { credentials: "omit" });
    if (!res.ok)
      throw new Error(`Fetch failed: ${res.status}`);
    return res.text();
  }
  async function fetchRawBytes(rawUrl) {
    const res = await fetch(rawUrl, { credentials: "omit" });
    if (!res.ok)
      throw new Error(`Fetch failed: ${res.status}`);
    return res.arrayBuffer();
  }
  async function fetchDirListing({ owner, repo, ref, dir }) {
    const path = dir ? `/${dir}` : "";
    const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${path}${refQuery}`;
    const res = await fetch(url, {
      credentials: "omit",
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("GitHub API rate-limited (60/hr unauthenticated)");
      }
      throw new Error(`Directory listing failed: ${res.status}`);
    }
    return res.json();
  }
  async function fetchDefaultBranch({ owner, repo }) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const res = await fetch(url, {
      credentials: "omit",
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    if (!res.ok)
      throw new Error(`Repo lookup failed: ${res.status}`);
    const data = await res.json();
    return data.default_branch;
  }

  // src/core/detect.js
  init_process();
  init_buffer();
  var import_whats_that_gerber = __toESM(require_whats_that_gerber(), 1);
  var GERBER_EXTENSIONS = [
    // Common Gerber layer extensions
    "gbr",
    "gbl",
    "gtl",
    "gbs",
    "gts",
    "gbo",
    "gto",
    "gbp",
    "gtp",
    "gko",
    "gm1",
    "gm2",
    "gm3",
    "gml",
    "gpb",
    "gpt",
    // Eagle / CadSoft
    "cmp",
    "sol",
    "plc",
    "pls",
    "stc",
    "sts",
    // Altium
    "gd1",
    "gg1",
    "gp1",
    "gp2",
    "gp3",
    "gp4",
    // Excellon drill
    "drl",
    "drd",
    "xln",
    "txt",
    "tap",
    "nc"
  ];
  var GERBER_HEADER_PATTERNS = [
    /^G04 /m,
    /^%FS[LT][AI]/m,
    /^%MO(IN|MM)/m,
    /^%AD/m,
    /^M48/m
    // Excellon header
  ];
  function looksLikeGerberByName(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext)
      return false;
    if (GERBER_EXTENSIONS.includes(ext))
      return true;
    const id = (0, import_whats_that_gerber.default)([filename])[filename];
    return Boolean(id && id.type);
  }
  function looksLikeGerberByContent(text) {
    if (!text)
      return false;
    const head = text.slice(0, 4096);
    return GERBER_HEADER_PATTERNS.some((rx) => rx.test(head));
  }
  function sniffFiletype(text) {
    if (!text)
      return null;
    const head = text.slice(0, 4096);
    if (/^M48/m.test(head))
      return "drill";
    if (/^%FS[LT][AI]/m.test(head) || /^%MO(IN|MM)/m.test(head))
      return "gerber";
    return null;
  }
  function isAmbiguousExtension(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["txt", "tap", "nc"].includes(ext);
  }
  function isZipFilename(filename) {
    return /\.zip$/i.test(filename);
  }

  // src/handlers/blob.js
  init_process();
  init_buffer();
  var import_whats_that_gerber3 = __toESM(require_whats_that_gerber(), 1);

  // src/core/render.js
  init_process();
  init_buffer();
  var import_gerber_to_svg = __toESM(require_gerber_to_svg(), 1);
  var import_pcb_stackup = __toESM(require_pcb_stackup(), 1);
  var import_whats_that_gerber2 = __toESM(require_whats_that_gerber(), 1);

  // src/core/colors.js
  init_process();
  init_buffer();
  var DEFAULT_COLORS = {
    fr4: "#666666",
    cu: "#cccccc",
    cf: "#cc9933",
    sm: "#004200bf",
    ss: "#ffffff",
    sp: "#999999",
    out: "#000000"
  };
  var COLOR_PRESETS = [
    {
      id: "green",
      label: "Green",
      swatch: "#0a7a2f",
      colors: { sm: "#004200bf", ss: "#ffffff" }
    },
    {
      id: "red",
      label: "Red",
      swatch: "#b71c1c",
      colors: { sm: "#7a0000bf", ss: "#ffffff" }
    },
    {
      id: "blue",
      label: "Blue",
      swatch: "#1565c0",
      colors: { sm: "#00204ac8", ss: "#ffffff" }
    },
    {
      id: "black",
      label: "Black",
      swatch: "#1a1a1a",
      // Black mask is nearly opaque; silkscreen flips to white for contrast.
      colors: { sm: "#0a0a0adb", ss: "#f0f0f0" }
    },
    {
      id: "white",
      label: "White",
      swatch: "#e8e8e8",
      // White mask needs black silkscreen, otherwise the legend vanishes.
      colors: { sm: "#e6e6e6d1", ss: "#1a1a1a" }
    },
    {
      id: "yellow",
      label: "Yellow",
      swatch: "#f9a825",
      // Yellow is light enough that black silkscreen reads better.
      colors: { sm: "#caa400c8", ss: "#1a1a1a" }
    },
    {
      id: "purple",
      label: "Purple",
      swatch: "#6a1b9a",
      // The OSH Park signature.
      colors: { sm: "#2a0a4acc", ss: "#ffffff" }
    }
  ];
  var DEFAULT_PRESET_ID = "green";
  function colorsForPreset(presetId) {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId) || COLOR_PRESETS[0];
    return {
      ...DEFAULT_COLORS,
      ...preset.colors
    };
  }
  function isValidPresetId(presetId) {
    return COLOR_PRESETS.some((p) => p.id === presetId);
  }

  // src/core/render.js
  async function renderSingleLayer(gerberText, isDrill) {
    return new Promise((resolve, reject) => {
      try {
        (0, import_gerber_to_svg.default)(gerberText, {
          attributes: { color: "#0969da" },
          filetype: isDrill ? "drill" : "gerber"
        }, (err2, svgString) => {
          if (err2)
            reject(err2);
          else
            resolve(svgString);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  function makeLayerInputs(files) {
    return files.map(({ filename, content }) => {
      const layer = { filename, gerber: content };
      if (sniffFiletype(content) === "drill") {
        layer.type = "drill";
        layer.side = "all";
      }
      return layer;
    });
  }
  function getInnerLayerNumber(filename) {
    let m = filename.match(/[._-]?In(\d+)[._-]?Cu/i);
    if (m)
      return parseInt(m[1], 10);
    m = filename.match(/\.g(\d+)$/i);
    if (m)
      return parseInt(m[1], 10);
    m = filename.match(/\.in(\d+)$/i);
    if (m)
      return parseInt(m[1], 10);
    return null;
  }
  async function renderInnerLayers(files) {
    const innerFiles = [];
    for (const file of files) {
      const wtg = (0, import_whats_that_gerber2.default)([file.filename])[file.filename];
      if (wtg?.type !== "copper" || wtg?.side !== "inner")
        continue;
      const num = getInnerLayerNumber(file.filename);
      innerFiles.push({ ...file, innerNum: num });
    }
    if (innerFiles.length === 0)
      return [];
    innerFiles.sort((a, b) => {
      if (a.innerNum != null && b.innerNum != null)
        return a.innerNum - b.innerNum;
      if (a.innerNum != null)
        return -1;
      if (b.innerNum != null)
        return 1;
      return a.filename.localeCompare(b.filename);
    });
    const results = [];
    for (let i = 0; i < innerFiles.length; i++) {
      const file = innerFiles[i];
      try {
        const svg = await renderSingleLayer(file.content, false);
        const label = file.innerNum != null ? `In${file.innerNum}` : `In${i + 1}`;
        results.push({ label, svg, filename: file.filename });
      } catch (e) {
        console.warn("[gerber-gh] inner layer render failed for", file.filename, e);
      }
    }
    return results;
  }
  async function buildStackup(files, opts = {}) {
    if (files.length < 2) {
      return { stackup: null, reason: "fewer than 2 layers" };
    }
    const colorPreset = opts.colorPreset || DEFAULT_PRESET_ID;
    const color = colorsForPreset(colorPreset);
    const stackupOpts = { color };
    const layers = makeLayerInputs(files);
    const stackup = await (0, import_pcb_stackup.default)(layers, stackupOpts);
    let stackupNoOutline = null;
    const layersWithoutOutline = layers.filter((l) => {
      if (l.type === "outline")
        return false;
      const wtg = (0, import_whats_that_gerber2.default)([l.filename])[l.filename];
      return wtg?.type !== "outline";
    });
    const hasOutline = layersWithoutOutline.length < layers.length;
    if (hasOutline && layersWithoutOutline.length >= 2) {
      try {
        stackupNoOutline = await (0, import_pcb_stackup.default)(layersWithoutOutline, stackupOpts);
      } catch (e) {
        console.warn("[gerber-gh] no-outline stackup failed", e);
      }
    }
    const innerLayers = await renderInnerLayers(files);
    return {
      stackup,
      stackupNoOutline,
      hasOutline,
      layerCount: layers.length,
      innerLayers,
      colorPreset
    };
  }
  function stackupSvgs(stackup) {
    if (!stackup)
      return null;
    return { top: stackup.top.svg, bottom: stackup.bottom.svg };
  }

  // src/core/panel.js
  init_process();
  init_buffer();

  // src/core/measure.js
  init_process();
  init_buffer();
  var NS = "http://www.w3.org/2000/svg";
  var MM_PER_INCH = 25.4;
  function parsePhysical(str) {
    if (!str)
      return null;
    const m = String(str).trim().match(/^([\d.]+)\s*(in|mm|cm|pt|pc|px)?$/i);
    if (!m)
      return null;
    const value = parseFloat(m[1]);
    if (!isFinite(value))
      return null;
    const unit = (m[2] || "px").toLowerCase();
    if (unit === "in")
      return { mm: value * MM_PER_INCH };
    if (unit === "mm")
      return { mm: value };
    if (unit === "cm")
      return { mm: value * 10 };
    return null;
  }
  function getCalibration(svg) {
    const originalVb = svg.dataset.ghgvOriginalViewBox;
    const widthAttr = svg.dataset.ghgvOriginalWidth;
    const heightAttr = svg.dataset.ghgvOriginalHeight;
    if (!originalVb || !widthAttr)
      return null;
    const physWidth = parsePhysical(widthAttr);
    const physHeight = parsePhysical(heightAttr);
    if (!physWidth)
      return null;
    const [, , vbW, vbH] = originalVb.split(/\s+/).map(Number);
    if (!vbW || !vbH)
      return null;
    const unitsPerMmX = vbW / physWidth.mm;
    const unitsPerMmY = physHeight ? vbH / physHeight.mm : unitsPerMmX;
    return (unitsPerMmX + unitsPerMmY) / 2;
  }
  function clientToSvgPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm)
      return null;
    const inv = ctm.inverse();
    return pt.matrixTransform(inv);
  }
  function formatDistance(mm, unit) {
    if (unit === "mil") {
      const mils = mm / MM_PER_INCH * 1e3;
      return mils.toFixed(2) + " mil";
    }
    return mm.toFixed(3) + " mm";
  }
  function attachMeasureTool(stage, opts = {}) {
    const { onStatus, onDistance } = opts;
    let svg = null;
    let active = false;
    let unit = "mm";
    let unitsPerMm = null;
    let points = [];
    let overlay = null;
    let completed = false;
    let ac = null;
    function status(msg) {
      if (onStatus)
        onStatus(msg);
    }
    function ensureOverlay() {
      svg = stage.querySelector("svg");
      if (!svg)
        return null;
      let g = svg.querySelector("g[data-ghgv-measure]");
      if (g) {
        if (g.parentNode !== svg) {
          svg.appendChild(g);
        }
      } else {
        g = svg.ownerDocument.createElementNS(NS, "g");
        g.setAttribute("data-ghgv-measure", "1");
        svg.appendChild(g);
      }
      overlay = g;
      return g;
    }
    function clearOverlay() {
      if (overlay) {
        while (overlay.firstChild)
          overlay.removeChild(overlay.firstChild);
      }
    }
    function getCurrentScale() {
      if (!svg)
        return 1;
      const vb = svg.getAttribute("viewBox");
      if (!vb)
        return 1;
      const [, , vbW] = vb.split(/\s+/).map(Number);
      return vbW || 1;
    }
    function drawMarker(x, y) {
      const r = getCurrentScale() * 5e-3;
      const c = svg.ownerDocument.createElementNS(NS, "circle");
      c.setAttribute("cx", x);
      c.setAttribute("cy", y);
      c.setAttribute("r", r);
      c.setAttribute("fill", "#cf222e");
      c.setAttribute("stroke", "#ffffff");
      c.setAttribute("stroke-width", r * 0.3);
      overlay.appendChild(c);
    }
    function drawLine(x1, y1, x2, y2, dashed = false) {
      const w = getCurrentScale() * 3e-3;
      const line = svg.ownerDocument.createElementNS(NS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", "#cf222e");
      line.setAttribute("stroke-width", w);
      if (dashed)
        line.setAttribute("stroke-dasharray", `${w * 4} ${w * 3}`);
      line.setAttribute("stroke-linecap", "round");
      overlay.appendChild(line);
    }
    function drawLabel(x, y, text) {
      const fontSize = getCurrentScale() * 0.025;
      const padding = fontSize * 0.4;
      const t = svg.ownerDocument.createElementNS(NS, "text");
      t.setAttribute("x", x);
      t.setAttribute("y", y);
      t.setAttribute("font-family", "ui-monospace, SFMono-Regular, monospace");
      t.setAttribute("font-size", fontSize);
      t.setAttribute("fill", "#ffffff");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("paint-order", "stroke");
      t.setAttribute("stroke", "#cf222e");
      t.setAttribute("stroke-width", padding);
      t.setAttribute("stroke-linejoin", "round");
      t.textContent = text;
      overlay.appendChild(t);
    }
    function distanceMm(p1, p2) {
      if (!unitsPerMm)
        return null;
      const dxUnits = p2.x - p1.x;
      const dyUnits = p2.y - p1.y;
      const distUnits = Math.sqrt(dxUnits * dxUnits + dyUnits * dyUnits);
      return distUnits / unitsPerMm;
    }
    function redraw() {
      clearOverlay();
      if (points.length === 0)
        return;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        drawLine(a.x, a.y, b.x, b.y);
        const mm = distanceMm(a, b);
        if (mm != null) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          drawLabel(midX, midY, formatDistance(mm, unit));
        }
      }
      for (const p of points) {
        drawMarker(p.x, p.y);
      }
    }
    function totalDistanceMm() {
      if (!unitsPerMm || points.length < 2)
        return 0;
      let total = 0;
      for (let i = 0; i < points.length - 1; i++) {
        total += distanceMm(points[i], points[i + 1]);
      }
      return total;
    }
    function onPointerDown(e) {
      if (!active)
        return;
      if (e.button !== 0)
        return;
      e.stopPropagation();
      e.preventDefault();
      const p = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!p)
        return;
      if (completed) {
        if (e.shiftKey) {
          completed = false;
        } else {
          points = [];
          completed = false;
        }
      }
      points.push({ x: p.x, y: p.y });
      redraw();
      if (points.length === 1) {
        status("Click the end point (Esc to exit)");
        return;
      }
      const segMm = distanceMm(points[points.length - 2], points[points.length - 1]);
      const segments = points.length - 1;
      if (segMm == null) {
        status("Distance unavailable: SVG has no physical units");
        return;
      }
      const segText = formatDistance(segMm, unit);
      if (e.shiftKey) {
        const totalText = formatDistance(totalDistanceMm(), unit);
        status(`Segment ${segments}: ${segText} \u2022 Total: ${totalText} (Shift-click to extend, Esc to exit)`);
        if (onDistance)
          onDistance({ mm: segMm, formatted: segText, segments, totalMm: totalDistanceMm() });
        return;
      }
      completed = true;
      if (segments === 1) {
        status(`Distance: ${segText} (click to measure again, Shift-click to chain)`);
      } else {
        const totalText = formatDistance(totalDistanceMm(), unit);
        status(`Total: ${totalText} over ${segments} segments (click to measure again)`);
      }
      if (onDistance)
        onDistance({ mm: segMm, formatted: segText, segments, totalMm: totalDistanceMm() });
    }
    function onPointerMove(e) {
      if (!active || points.length === 0)
        return;
      if (completed)
        return;
      const p = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!p)
        return;
      redraw();
      const last = points[points.length - 1];
      drawLine(last.x, last.y, p.x, p.y, true);
      const mm = distanceMm(last, p);
      if (mm != null) {
        const midX = (last.x + p.x) / 2;
        const midY = (last.y + p.y) / 2;
        drawLabel(midX, midY, formatDistance(mm, unit));
      }
    }
    function onKeyDown(e) {
      if (!active)
        return;
      if (e.key === "Escape") {
        e.preventDefault();
        deactivate();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        if (points.length === 0)
          return;
        e.preventDefault();
        points.pop();
        completed = false;
        redraw();
        if (points.length === 0) {
          status("Click the start point (Esc to exit)");
        } else if (points.length === 1) {
          status("Click the end point (Esc to exit)");
        } else {
          const totalText = formatDistance(totalDistanceMm(), unit);
          status(`Total: ${totalText} (${points.length - 1} segments, Shift-click to extend)`);
        }
      }
    }
    function activate2() {
      svg = stage.querySelector("svg");
      if (!svg) {
        status("No SVG to measure");
        return false;
      }
      if (!svg.dataset.ghgvOriginalWidth && svg.getAttribute("width")) {
        svg.dataset.ghgvOriginalWidth = svg.getAttribute("width");
      }
      if (!svg.dataset.ghgvOriginalHeight && svg.getAttribute("height")) {
        svg.dataset.ghgvOriginalHeight = svg.getAttribute("height");
      }
      unitsPerMm = getCalibration(svg);
      if (!unitsPerMm) {
        status("Cannot measure: SVG has no physical-unit calibration");
        return false;
      }
      if (active)
        return true;
      active = true;
      ensureOverlay();
      points = [];
      completed = false;
      redraw();
      ac = new AbortController();
      const sig = ac.signal;
      svg.addEventListener("pointerdown", onPointerDown, { capture: true, signal: sig });
      svg.addEventListener("pointermove", onPointerMove, { signal: sig });
      document.addEventListener("keydown", onKeyDown, { signal: sig });
      svg.style.cursor = "crosshair";
      status("Click the start point (Esc to exit)");
      return true;
    }
    function deactivate() {
      if (!active)
        return;
      active = false;
      if (ac)
        ac.abort();
      ac = null;
      if (svg)
        svg.style.cursor = "";
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
      points = [];
      completed = false;
      status("");
    }
    function setUnit(newUnit) {
      if (newUnit !== "mm" && newUnit !== "mil")
        return;
      unit = newUnit;
      if (active && points.length >= 2)
        redraw();
    }
    function isAvailable() {
      const s = stage.querySelector("svg");
      if (!s)
        return false;
      if (!s.dataset.ghgvOriginalWidth && s.getAttribute("width")) {
        s.dataset.ghgvOriginalWidth = s.getAttribute("width");
      }
      if (!s.dataset.ghgvOriginalHeight && s.getAttribute("height")) {
        s.dataset.ghgvOriginalHeight = s.getAttribute("height");
      }
      return getCalibration(s) != null;
    }
    return {
      activate: activate2,
      deactivate,
      isActive: () => active,
      setUnit,
      getUnit: () => unit,
      isAvailable
    };
  }

  // src/core/shortcuts.js
  init_process();
  init_buffer();
  var SHORTCUTS = [
    { key: "z", label: "Z", desc: "Fit view (reset zoom and pan)" },
    { key: "r", label: "R", desc: "Rotate clockwise 90 degrees" },
    { key: "R", label: "Shift+R", desc: "Rotate counter-clockwise 90 degrees" },
    { key: "m", label: "M", desc: "Toggle measurement tool" },
    { key: "u", label: "U", desc: "Toggle measurement unit (mm / mil)" },
    { key: "l", label: "L", desc: "Switch to Layer view (blob pages only)" },
    { key: "t", label: "T", desc: "Switch to Top view" },
    { key: "b", label: "B", desc: "Switch to Bottom view" },
    { key: "o", label: "O", desc: "Toggle Outline mode" },
    { key: "i", label: "I", desc: "Toggle Invert (dark mode)" },
    { key: "h", label: "H", desc: "Hide / show the preview panel" },
    { key: "?", label: "?", desc: "Show / hide this help overlay" },
    { key: "Escape", label: "Esc", desc: "Close help overlay or exit measurement mode" }
  ];
  function isTypingInInput() {
    const el = document.activeElement;
    if (!el)
      return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
      return true;
    if (el.isContentEditable)
      return true;
    return false;
  }
  function buildHelpOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "ghgv-help-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Keyboard shortcuts");
    const card = document.createElement("div");
    card.className = "ghgv-help-card";
    const heading = document.createElement("h2");
    heading.className = "ghgv-help-heading";
    heading.textContent = "Keyboard shortcuts";
    card.appendChild(heading);
    const list = document.createElement("dl");
    list.className = "ghgv-help-list";
    for (const s of SHORTCUTS) {
      const dt = document.createElement("dt");
      const kbd = document.createElement("kbd");
      kbd.textContent = s.label;
      dt.appendChild(kbd);
      const dd = document.createElement("dd");
      dd.textContent = s.desc;
      list.appendChild(dt);
      list.appendChild(dd);
    }
    card.appendChild(list);
    const tip = document.createElement("p");
    tip.className = "ghgv-help-tip";
    tip.textContent = "Measurement tool: click a start point, then click an end point to measure the distance. The measurement locks when you finish. Click again to start a new measurement, or Shift-click to extend the current one into a multi-segment chain. Backspace undoes the last point, Escape exits. Zoom: pinch on a trackpad, or hold Cmd (Ctrl on Windows/Linux) and scroll. Plain scrolling moves the page.";
    card.appendChild(tip);
    const close = document.createElement("button");
    close.className = "ghgv-help-close";
    close.textContent = "Close";
    card.appendChild(close);
    overlay.appendChild(card);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target === close) {
        overlay.remove();
      }
    });
    return overlay;
  }
  function attachShortcuts(panel, actions = {}) {
    const ac = new AbortController();
    let helpOverlay = null;
    function toggleHelp() {
      if (helpOverlay) {
        helpOverlay.remove();
        helpOverlay = null;
        return;
      }
      helpOverlay = buildHelpOverlay();
      document.body.appendChild(helpOverlay);
    }
    function closeHelp() {
      if (helpOverlay) {
        helpOverlay.remove();
        helpOverlay = null;
        return true;
      }
      return false;
    }
    function onKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey)
        return;
      if (isTypingInInput())
        return;
      if (e.key === "Escape") {
        if (closeHelp()) {
          e.preventDefault();
          return;
        }
      }
      if (e.key === "?") {
        e.preventDefault();
        toggleHelp();
        return;
      }
      const key = e.key;
      let handled = false;
      switch (key) {
        case "z":
        case "Z":
          if (actions.fit) {
            actions.fit();
            handled = true;
          }
          break;
        case "r":
          if (actions.rotateRight) {
            actions.rotateRight();
            handled = true;
          }
          break;
        case "R":
          if (actions.rotateLeft) {
            actions.rotateLeft();
            handled = true;
          }
          break;
        case "m":
        case "M":
          if (actions.toggleMeasure) {
            actions.toggleMeasure();
            handled = true;
          }
          break;
        case "u":
        case "U":
          if (actions.toggleUnit) {
            actions.toggleUnit();
            handled = true;
          }
          break;
        case "l":
        case "L":
          if (actions.showLayer) {
            actions.showLayer();
            handled = true;
          }
          break;
        case "t":
        case "T":
          if (actions.showTop) {
            actions.showTop();
            handled = true;
          }
          break;
        case "b":
        case "B":
          if (actions.showBottom) {
            actions.showBottom();
            handled = true;
          }
          break;
        case "o":
        case "O":
          if (actions.toggleOutline) {
            actions.toggleOutline();
            handled = true;
          }
          break;
        case "i":
        case "I":
          if (actions.toggleInvert) {
            actions.toggleInvert();
            handled = true;
          }
          break;
        case "h":
        case "H":
          if (actions.toggleHide) {
            actions.toggleHide();
            handled = true;
          }
          break;
      }
      if (handled)
        e.preventDefault();
    }
    document.addEventListener("keydown", onKeyDown, { signal: ac.signal });
    return ac;
  }

  // src/core/layer-toggles.js
  init_process();
  init_buffer();
  var LAYER_KINDS = [
    { suffix: "_ss", label: "Silkscreen" },
    { suffix: "_sm", label: "Soldermask" },
    { suffix: "_sp", label: "Solderpaste" },
    { suffix: "_cu", label: "Copper (plated)" },
    { suffix: "_cf", label: "Copper (exposed)" },
    { suffix: "_fr4", label: "Substrate" },
    { suffix: "_out", label: "Board outline" }
  ];
  function makeLayerToggleController(stage) {
    const visibility = /* @__PURE__ */ new Map();
    LAYER_KINDS.forEach((k) => visibility.set(k.suffix, true));
    function applyVisibility() {
      const svg = stage.querySelector("svg");
      if (!svg)
        return;
      for (const [suffix, visible] of visibility) {
        const elements = svg.querySelectorAll(`[class$="${suffix}"]`);
        for (const el of elements) {
          el.style.display = visible ? "" : "none";
        }
      }
    }
    function resetVisibility() {
      LAYER_KINDS.forEach((k) => visibility.set(k.suffix, true));
    }
    function detectPresentKinds() {
      const svg = stage.querySelector("svg");
      if (!svg)
        return [];
      return LAYER_KINDS.filter((k) => svg.querySelector(`[class$="${k.suffix}"]`));
    }
    return {
      applyVisibility,
      resetVisibility,
      detectPresentKinds,
      isVisible(suffix) {
        return visibility.get(suffix) !== false;
      },
      setVisible(suffix, value) {
        visibility.set(suffix, !!value);
        applyVisibility();
      }
    };
  }
  function buildLayerToggleMenu(controller, onChange) {
    const menu = document.createElement("div");
    menu.className = "ghgv-layer-menu";
    const heading = document.createElement("div");
    heading.className = "ghgv-layer-menu-heading";
    heading.textContent = "Show layers";
    menu.appendChild(heading);
    const list = document.createElement("div");
    list.className = "ghgv-layer-menu-list";
    menu.appendChild(list);
    const present = controller.detectPresentKinds();
    if (present.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ghgv-layer-menu-empty";
      empty.textContent = "No toggleable layers detected.";
      list.appendChild(empty);
    } else {
      for (const kind of present) {
        const row = document.createElement("label");
        row.className = "ghgv-layer-menu-row";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = controller.isVisible(kind.suffix);
        checkbox.addEventListener("change", () => {
          controller.setVisible(kind.suffix, checkbox.checked);
          if (onChange)
            onChange(kind.suffix, checkbox.checked);
        });
        const text = document.createElement("span");
        text.textContent = kind.label;
        row.append(checkbox, text);
        list.appendChild(row);
      }
      const showAll = document.createElement("button");
      showAll.className = "ghgv-layer-menu-showall";
      showAll.textContent = "Show all";
      showAll.addEventListener("click", () => {
        for (const kind of present) {
          controller.setVisible(kind.suffix, true);
        }
        for (const cb of menu.querySelectorAll('input[type="checkbox"]')) {
          cb.checked = true;
        }
        if (onChange)
          onChange(null, true);
      });
      menu.appendChild(showAll);
    }
    return menu;
  }

  // src/core/panel.js
  var STYLE_ID = "ghgv-styles";
  function ensureStyles() {
    if (document.getElementById(STYLE_ID))
      return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    .ghgv-panel {
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      margin: 16px 0;
      background: var(--bgColor-muted, #f6f8fa);
      overflow: hidden;
    }
    .ghgv-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      flex-wrap: wrap;
    }
    .ghgv-toolbar .ghgv-title { font-weight: 600; }
    .ghgv-toolbar .ghgv-meta {
      color: var(--fgColor-muted, #656d76);
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .ghgv-spacer { flex: 1; }
    .ghgv-btn {
      border: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      color: var(--fgColor-default, #1f2328);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .ghgv-btn:hover:not(:disabled) { background: var(--bgColor-muted, #f6f8fa); }
    .ghgv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ghgv-btn.ghgv-active {
      background: #0969da;
      color: #ffffff;
      border-color: #0969da;
    }
    .ghgv-tabs, .ghgv-zoom, .ghgv-rotate, .ghgv-measure {
      display: inline-flex;
      gap: 0;
      margin-right: 6px;
    }
    .ghgv-tabs .ghgv-btn,
    .ghgv-zoom .ghgv-btn,
    .ghgv-rotate .ghgv-btn,
    .ghgv-measure .ghgv-btn {
      border-radius: 0;
      border-right-width: 0;
    }
    .ghgv-tabs .ghgv-btn:first-child,
    .ghgv-zoom .ghgv-btn:first-child,
    .ghgv-rotate .ghgv-btn:first-child,
    .ghgv-measure .ghgv-btn:first-child { border-radius: 6px 0 0 6px; }
    .ghgv-tabs .ghgv-btn:last-child,
    .ghgv-zoom .ghgv-btn:last-child,
    .ghgv-rotate .ghgv-btn:last-child,
    .ghgv-measure .ghgv-btn:last-child {
      border-radius: 0 6px 6px 0;
      border-right-width: 1px;
    }
    .ghgv-zoom .ghgv-btn,
    .ghgv-rotate .ghgv-btn {
      min-width: 28px;
      padding: 4px 8px;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .ghgv-rotate .ghgv-btn { font-size: 14px; padding: 4px 6px; }
    .ghgv-status {
      color: var(--fgColor-muted, #656d76);
      font-size: 11px;
      font-style: italic;
    }
    .ghgv-credit { font-size: 11px; color: var(--fgColor-muted, #656d76); }
    .ghgv-credit a {
      color: var(--fgColor-accent, #0969da);
      text-decoration: none;
    }
    .ghgv-credit a:hover { text-decoration: underline; }
    .ghgv-stage {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      max-height: 75vh;
      overflow: auto;
      position: relative;
      background:
        repeating-conic-gradient(#e6e6e6 0% 25%, transparent 0% 50%) 50% / 16px 16px;
    }
    .ghgv-zoom-hint {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 20, 25, 0.82);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      pointer-events: none;
      z-index: 10;
      opacity: 1;
      transition: opacity 0.5s ease-out;
    }
    .ghgv-zoom-hint-fade {
      opacity: 0;
    }
    .ghgv-stage svg {
      max-width: 100%;
      max-height: 70vh;
      display: block;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }
    .ghgv-stage svg.ghgv-grabbing { cursor: grabbing; }
    .ghgv-stage.ghgv-dark {
      background:
        repeating-conic-gradient(#2a2a2a 0% 25%, #1f1f1f 0% 50%) 50% / 16px 16px;
    }
    .ghgv-stage.ghgv-stage-kicad {
      padding: 0;
      background: #1a1a1a;
      min-height: 500px;
      max-height: 75vh;
      height: 600px;
      overflow: hidden;
    }
    .ghgv-stage.ghgv-stage-kicad kicanvas-embed {
      width: 100%;
      height: 100%;
      display: block;
    }
    .ghgv-error {
      color: #1f2328;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      padding: 20px 24px;
      background: #fff8f7;
      border: 1px solid #ffc1bc;
      border-radius: 6px;
      margin: 16px;
      max-width: 680px;
      line-height: 1.5;
    }
    .ghgv-error-heading {
      color: #cf222e;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .ghgv-error-detail {
      margin: 0 0 12px 0;
      color: #1f2328;
    }
    .ghgv-error-suggestion {
      margin: 0 0 12px 0;
      color: #656d76;
    }
    .ghgv-error-link {
      margin: 0;
    }
    .ghgv-error-link a {
      color: #0969da;
      text-decoration: none;
      font-weight: 500;
    }
    .ghgv-error-link a:hover {
      text-decoration: underline;
    }
    .ghgv-loading {
      color: var(--fgColor-muted, #656d76);
      font-size: 13px;
    }
    .ghgv-help-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 20, 25, 0.55);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      animation: ghgv-fade-in 0.12s ease-out;
    }
    @keyframes ghgv-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .ghgv-help-card {
      background: #ffffff;
      color: #1f2328;
      border: 1px solid #d0d7de;
      border-radius: 10px;
      max-width: 540px;
      width: calc(100% - 32px);
      padding: 24px 28px 20px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .ghgv-help-heading {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #0e7c3a;
    }
    .ghgv-help-list {
      margin: 0 0 16px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px 16px;
      align-items: baseline;
    }
    .ghgv-help-list dt {
      margin: 0;
    }
    .ghgv-help-list dt kbd {
      display: inline-block;
      min-width: 28px;
      padding: 2px 8px;
      text-align: center;
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      border-bottom-width: 2px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 11px;
      color: #1f2328;
    }
    .ghgv-help-list dd {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: #1f2328;
    }
    .ghgv-help-tip {
      margin: 0 0 16px;
      padding: 10px 12px;
      background: #f6f8fa;
      border-left: 3px solid #0e7c3a;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
      color: #656d76;
    }
    .ghgv-help-close {
      display: block;
      margin: 0 0 0 auto;
      padding: 6px 14px;
      background: #0e7c3a;
      color: #ffffff;
      border: 1px solid #0e7c3a;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .ghgv-help-close:hover {
      background: #0a5d2a;
    }
    .ghgv-layer-menu {
      background: #ffffff;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      padding: 10px 12px;
      min-width: 200px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
    }
    .ghgv-layer-menu-heading {
      color: #1f2328;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .ghgv-layer-menu-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ghgv-layer-menu-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      cursor: pointer;
      user-select: none;
      color: #1f2328;
      font-size: 13px;
    }
    .ghgv-layer-menu-row:hover {
      background: #f6f8fa;
      border-radius: 4px;
    }
    .ghgv-layer-menu-row input[type="checkbox"] {
      cursor: pointer;
    }
    .ghgv-layer-menu-empty {
      color: #656d76;
      font-style: italic;
      padding: 4px 0;
    }
    .ghgv-layer-menu-showall {
      margin-top: 8px;
      padding: 4px 10px;
      background: transparent;
      border: 1px solid #d0d7de;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      width: 100%;
      color: #1f2328;
    }
    .ghgv-layer-menu-showall:hover {
      background: #f6f8fa;
    }
    .ghgv-color-row {
      display: flex;
      align-items: center;
      gap: 9px;
      width: 100%;
      padding: 6px 8px;
      border: none;
      border-radius: 5px;
      background: transparent;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      color: #1f2328;
      text-align: left;
    }
    .ghgv-color-row:hover {
      background: #f6f8fa;
    }
    .ghgv-color-row-active {
      font-weight: 600;
    }
    .ghgv-color-row-active::after {
      content: '\u2713';
      margin-left: auto;
      color: #0e7c3a;
    }
    .ghgv-color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.25);
      flex-shrink: 0;
    }
  `;
    document.head.appendChild(style);
  }
  function setupZoomPan(stage) {
    const svg = stage.querySelector("svg");
    if (!svg)
      return null;
    if (svg._ghgvAbort)
      svg._ghgvAbort.abort();
    const ac = new AbortController();
    svg._ghgvAbort = ac;
    const { signal } = ac;
    if (!svg.dataset.ghgvOriginalViewBox) {
      let initialViewBox = svg.getAttribute("viewBox");
      if (!initialViewBox) {
        const w = (svg.getAttribute("width") || "").replace(/[^\d.]/g, "") || "100";
        const h = (svg.getAttribute("height") || "").replace(/[^\d.]/g, "") || "100";
        initialViewBox = `0 0 ${w} ${h}`;
        svg.setAttribute("viewBox", initialViewBox);
      }
      svg.dataset.ghgvOriginalViewBox = initialViewBox;
    }
    const fitViewBox = svg.getAttribute("viewBox");
    if (!svg.dataset.ghgvOriginalWidth && svg.getAttribute("width")) {
      svg.dataset.ghgvOriginalWidth = svg.getAttribute("width");
    }
    if (!svg.dataset.ghgvOriginalHeight && svg.getAttribute("height")) {
      svg.dataset.ghgvOriginalHeight = svg.getAttribute("height");
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.width = "100%";
    svg.style.height = "auto";
    const ZOOM_FACTOR = 1.2;
    const MIN_SPAN = 1e-4;
    const MAX_SPAN = 1e9;
    const parseVb = (s) => s.split(/\s+/).map(Number);
    const writeVb = (x, y, w, h) => svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
    const readVb = () => parseVb(svg.getAttribute("viewBox"));
    function zoomAt(clientX, clientY, factor) {
      const [vbX, vbY, vbW, vbH] = readVb();
      const newW = vbW * factor;
      const newH = vbH * factor;
      if (newW < MIN_SPAN || newW > MAX_SPAN)
        return;
      if (newH < MIN_SPAN || newH > MAX_SPAN)
        return;
      const rect = svg.getBoundingClientRect();
      const cx = clientX != null ? (clientX - rect.left) / rect.width : 0.5;
      const cy = clientY != null ? (clientY - rect.top) / rect.height : 0.5;
      const anchorX = vbX + cx * vbW;
      const anchorY = vbY + cy * vbH;
      writeVb(anchorX - cx * newW, anchorY - cy * newH, newW, newH);
    }
    function reset() {
      svg.setAttribute("viewBox", fitViewBox);
    }
    let hintShown = false;
    const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
    function showZoomHint() {
      if (hintShown)
        return;
      hintShown = true;
      const hint = document.createElement("div");
      hint.className = "ghgv-zoom-hint";
      hint.textContent = isMac ? "Hold \u2318 Cmd and scroll to zoom" : "Hold Ctrl and scroll to zoom";
      stage.appendChild(hint);
      setTimeout(() => {
        hint.classList.add("ghgv-zoom-hint-fade");
      }, 1600);
      setTimeout(() => {
        if (hint.parentNode)
          hint.parentNode.removeChild(hint);
      }, 2300);
    }
    const onWheel = (e) => {
      const wantsZoom = e.ctrlKey || e.metaKey;
      if (!wantsZoom) {
        showZoomHint();
        return;
      }
      e.preventDefault();
      const intensity = Math.min(Math.abs(e.deltaY), 50) / 50;
      const step = 1 + intensity * (ZOOM_FACTOR - 1);
      const factor = e.deltaY < 0 ? 1 / step : step;
      zoomAt(e.clientX, e.clientY, factor);
    };
    let drag = null;
    const onPointerDown = (e) => {
      if (e.button !== 0)
        return;
      svg.setPointerCapture?.(e.pointerId);
      drag = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startVb: readVb(),
        rect: svg.getBoundingClientRect()
      };
      svg.classList.add("ghgv-grabbing");
    };
    const onPointerMove = (e) => {
      if (!drag || drag.pointerId !== e.pointerId)
        return;
      const [, , vbW, vbH] = drag.startVb;
      const dx = (e.clientX - drag.startX) * (vbW / drag.rect.width);
      const dy = (e.clientY - drag.startY) * (vbH / drag.rect.height);
      writeVb(drag.startVb[0] - dx, drag.startVb[1] - dy, drag.startVb[2], drag.startVb[3]);
    };
    const onPointerUp = (e) => {
      if (!drag)
        return;
      if (drag.pointerId === e.pointerId) {
        svg.releasePointerCapture?.(e.pointerId);
        drag = null;
        svg.classList.remove("ghgv-grabbing");
      }
    };
    svg.addEventListener("wheel", onWheel, { passive: false, signal });
    svg.addEventListener("pointerdown", onPointerDown, { signal });
    svg.addEventListener("pointermove", onPointerMove, { signal });
    svg.addEventListener("pointerup", onPointerUp, { signal });
    svg.addEventListener("pointercancel", onPointerUp, { signal });
    return {
      reset,
      zoomIn: () => zoomAt(null, null, 1 / ZOOM_FACTOR),
      zoomOut: () => zoomAt(null, null, ZOOM_FACTOR)
    };
  }
  function applyRotation(stage, degrees) {
    const svg = stage.querySelector("svg");
    if (!svg)
      return;
    const original = svg.dataset.ghgvOriginalViewBox;
    if (!original)
      return;
    const [origX, origY, origW, origH] = original.split(/\s+/).map(Number);
    const cx = origX + origW / 2;
    const cy = origY + origH / 2;
    const deg = (degrees % 360 + 360) % 360;
    const NS2 = "http://www.w3.org/2000/svg";
    let g = svg.querySelector("g[data-ghgv-rot]");
    if (!g) {
      g = svg.ownerDocument.createElementNS(NS2, "g");
      g.setAttribute("data-ghgv-rot", "1");
      while (svg.firstChild)
        g.appendChild(svg.firstChild);
      svg.appendChild(g);
    }
    if (deg === 0) {
      g.removeAttribute("transform");
      svg.setAttribute("viewBox", original);
    } else if (deg === 180) {
      g.setAttribute("transform", `rotate(180 ${cx} ${cy})`);
      svg.setAttribute("viewBox", original);
    } else {
      g.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`);
      const newX = cx - origH / 2;
      const newY = cy - origW / 2;
      svg.setAttribute("viewBox", `${newX} ${newY} ${origH} ${origW}`);
    }
  }
  function renderError(stage, errorOrMessage) {
    stage.innerHTML = "";
    stage.classList.remove("ghgv-stage-kicad");
    const wrap = document.createElement("div");
    wrap.className = "ghgv-error";
    if (typeof errorOrMessage === "string") {
      wrap.textContent = errorOrMessage;
      stage.appendChild(wrap);
      return;
    }
    const e = errorOrMessage || {};
    const heading = document.createElement("div");
    heading.className = "ghgv-error-heading";
    heading.textContent = e.summary || "Something went wrong";
    wrap.appendChild(heading);
    if (e.detail) {
      const detail = document.createElement("p");
      detail.className = "ghgv-error-detail";
      detail.textContent = e.detail;
      wrap.appendChild(detail);
    }
    if (e.suggestion) {
      const suggestion = document.createElement("p");
      suggestion.className = "ghgv-error-suggestion";
      suggestion.textContent = e.suggestion;
      wrap.appendChild(suggestion);
    }
    if (e.rawUrl) {
      const linkPara = document.createElement("p");
      linkPara.className = "ghgv-error-link";
      const link = document.createElement("a");
      link.href = e.rawUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View raw file on GitHub \u2192";
      linkPara.appendChild(link);
      wrap.appendChild(linkPara);
    }
    stage.appendChild(wrap);
  }
  function makePanel({ filename, kind, layerInfo, mode = "blob", metaOverride = null, settings = null }) {
    ensureStyles();
    const panel = document.createElement("div");
    panel.className = "ghgv-panel";
    panel.setAttribute("data-ghgv", "1");
    const toolbar = document.createElement("div");
    toolbar.className = "ghgv-toolbar";
    const title3 = document.createElement("span");
    title3.className = "ghgv-title";
    title3.textContent = mode === "tree" ? `PCB preview: ${filename || "folder"}` : `Gerber preview: ${filename}`;
    const meta = document.createElement("span");
    meta.className = "ghgv-meta";
    if (mode === "blob") {
      if (metaOverride) {
        meta.textContent = metaOverride;
      } else {
        meta.textContent = layerInfo ? `${kind} / ${layerInfo.side ?? "?"} ${layerInfo.type ?? ""}`.trim() : kind;
      }
    }
    const tabs = document.createElement("span");
    tabs.className = "ghgv-tabs";
    const layerBtn = document.createElement("button");
    layerBtn.className = "ghgv-btn";
    layerBtn.textContent = "Layer";
    layerBtn.dataset.view = "layer";
    layerBtn.disabled = mode !== "blob";
    const topBtn = document.createElement("button");
    topBtn.className = "ghgv-btn";
    topBtn.textContent = "Top";
    topBtn.disabled = true;
    topBtn.dataset.view = "top";
    const bottomBtn = document.createElement("button");
    bottomBtn.className = "ghgv-btn";
    bottomBtn.textContent = "Bottom";
    bottomBtn.disabled = true;
    bottomBtn.dataset.view = "bottom";
    if (mode === "blob") {
      layerBtn.classList.add("ghgv-active");
      tabs.append(layerBtn, topBtn, bottomBtn);
    } else {
      topBtn.classList.add("ghgv-active");
      tabs.append(topBtn, bottomBtn);
    }
    const zoom = document.createElement("span");
    zoom.className = "ghgv-zoom";
    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.className = "ghgv-btn";
    zoomOutBtn.textContent = "\u2212";
    zoomOutBtn.title = "Zoom out";
    const zoomInBtn = document.createElement("button");
    zoomInBtn.className = "ghgv-btn";
    zoomInBtn.textContent = "+";
    zoomInBtn.title = "Zoom in";
    const fitBtn = document.createElement("button");
    fitBtn.className = "ghgv-btn";
    fitBtn.textContent = "Fit";
    fitBtn.title = "Reset zoom and pan";
    zoom.append(zoomOutBtn, zoomInBtn, fitBtn);
    const rotate = document.createElement("span");
    rotate.className = "ghgv-rotate";
    const rotateLeftBtn = document.createElement("button");
    rotateLeftBtn.className = "ghgv-btn";
    rotateLeftBtn.textContent = "\u21BA";
    rotateLeftBtn.title = "Rotate 90\xB0 counter-clockwise";
    const rotateRightBtn = document.createElement("button");
    rotateRightBtn.className = "ghgv-btn";
    rotateRightBtn.textContent = "\u21BB";
    rotateRightBtn.title = "Rotate 90\xB0 clockwise";
    rotate.append(rotateLeftBtn, rotateRightBtn);
    const measure = document.createElement("span");
    measure.className = "ghgv-measure";
    const measureBtn = document.createElement("button");
    measureBtn.className = "ghgv-btn";
    measureBtn.textContent = "Measure";
    measureBtn.title = "Click two points to measure distance (Esc to exit)";
    const unitBtn = document.createElement("button");
    unitBtn.className = "ghgv-btn";
    unitBtn.textContent = settings && settings.defaultUnit === "mil" ? "mil" : "mm";
    unitBtn.title = "Toggle measurement units (mm / mil)";
    measure.append(measureBtn, unitBtn);
    const status = document.createElement("span");
    status.className = "ghgv-status";
    const spacer = document.createElement("span");
    spacer.className = "ghgv-spacer";
    const themeBtn = document.createElement("button");
    themeBtn.className = "ghgv-btn";
    themeBtn.textContent = "Invert";
    const outlineBtn = document.createElement("button");
    outlineBtn.className = settings && settings.defaultOutline === false ? "ghgv-btn" : "ghgv-btn ghgv-active";
    outlineBtn.textContent = "Outline";
    outlineBtn.title = "Use the board outline file. Disable if the board edge looks wrong.";
    outlineBtn.disabled = true;
    const layersBtn = document.createElement("button");
    layersBtn.className = "ghgv-btn";
    layersBtn.textContent = "Layers";
    layersBtn.title = "Toggle which layers are visible in the composite view";
    layersBtn.disabled = true;
    const colorBtn = document.createElement("button");
    colorBtn.className = "ghgv-btn";
    colorBtn.textContent = "Color";
    colorBtn.title = "Change the soldermask color of the board";
    colorBtn.disabled = true;
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "ghgv-btn";
    downloadBtn.textContent = "Download SVG";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ghgv-btn";
    toggleBtn.textContent = "Hide";
    const credit = document.createElement("span");
    credit.className = "ghgv-credit";
    const creditLink = document.createElement("a");
    creditLink.href = "https://github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension";
    creditLink.target = "_blank";
    creditLink.rel = "noopener noreferrer";
    creditLink.textContent = "Green Shoe Garage";
    credit.append(creditLink);
    toolbar.append(title3, meta, tabs, zoom, rotate, measure, status, spacer, outlineBtn, layersBtn, colorBtn, themeBtn, downloadBtn, toggleBtn, credit);
    const stage = document.createElement("div");
    stage.className = "ghgv-stage";
    stage.innerHTML = '<span class="ghgv-loading">Loading...</span>';
    if (settings && settings.defaultInvert) {
      stage.classList.add("ghgv-dark");
      themeBtn.classList.add("ghgv-active");
    }
    panel.append(toolbar, stage);
    if (settings && settings.startCollapsed) {
      stage.style.display = "none";
      toggleBtn.textContent = "Show";
    }
    const views = { layer: null, top: null, bottom: null };
    const stackupVariants = { withOutline: null, noOutline: null };
    let innerTabBtns = [];
    let outlineEnabled = settings && settings.defaultOutline !== void 0 ? Boolean(settings.defaultOutline) : true;
    let currentView = mode === "blob" ? "layer" : "top";
    let rotation = 0;
    let zoomController = null;
    let measureTool = null;
    let measureUnit = settings && settings.defaultUnit === "mil" ? "mil" : "mm";
    let persistentStatus = "";
    let layerToggleController = null;
    let openLayerMenu = null;
    let colorPreset = settings && isValidPresetId(settings.defaultColor) ? settings.defaultColor : DEFAULT_PRESET_ID;
    let colorRebuilder = null;
    let openColorMenu = null;
    let colorBusy = false;
    function applyOutlineMode() {
      const variant = outlineEnabled ? stackupVariants.withOutline || stackupVariants.noOutline : stackupVariants.noOutline || stackupVariants.withOutline;
      if (!variant)
        return;
      views.top = variant.top;
      views.bottom = variant.bottom;
      if (currentView === "top" || currentView === "bottom") {
        showView(currentView);
      }
    }
    function showView(viewName) {
      if (!views[viewName])
        return;
      currentView = viewName;
      rotation = 0;
      if (measureTool)
        measureTool.deactivate();
      measureBtn.classList.remove("ghgv-active");
      stage.innerHTML = views[viewName];
      const svg = stage.querySelector("svg");
      if (svg && stage.classList.contains("ghgv-dark")) {
        svg.style.filter = "invert(1) hue-rotate(180deg)";
      }
      zoomController = setupZoomPan(stage);
      measureTool = attachMeasureTool(stage, {
        onStatus: (msg) => {
          if (msg)
            status.textContent = msg;
          else
            status.textContent = persistentStatus;
        }
      });
      measureTool.setUnit(measureUnit);
      measureBtn.disabled = !measureTool.isAvailable();
      const allTabs = [layerBtn, topBtn, bottomBtn, ...innerTabBtns.map((t) => t.btn)];
      for (const btn of allTabs) {
        btn.classList.toggle("ghgv-active", btn.dataset.view === viewName);
      }
      if (layerToggleController) {
        layerToggleController.applyVisibility();
        const isComposite = viewName === "top" || viewName === "bottom" || viewName.startsWith("inner:");
        layersBtn.disabled = !isComposite;
        const hasSoldermask = viewName === "top" || viewName === "bottom";
        colorBtn.disabled = !(hasSoldermask && colorRebuilder);
      }
    }
    function rotateBy(delta) {
      rotation = ((rotation + delta) % 360 + 360) % 360;
      if (measureTool && measureTool.isActive()) {
        measureTool.deactivate();
        measureBtn.classList.remove("ghgv-active");
      }
      applyRotation(stage, rotation);
      zoomController = setupZoomPan(stage);
    }
    for (const btn of [layerBtn, topBtn, bottomBtn]) {
      btn.addEventListener("click", () => {
        if (btn.disabled)
          return;
        showView(btn.dataset.view);
      });
    }
    zoomInBtn.addEventListener("click", () => zoomController?.zoomIn());
    zoomOutBtn.addEventListener("click", () => zoomController?.zoomOut());
    fitBtn.addEventListener("click", () => zoomController?.reset());
    rotateLeftBtn.addEventListener("click", () => rotateBy(-90));
    rotateRightBtn.addEventListener("click", () => rotateBy(90));
    measureBtn.addEventListener("click", () => {
      if (!measureTool)
        return;
      if (measureBtn.disabled)
        return;
      if (measureTool.isActive()) {
        measureTool.deactivate();
        measureBtn.classList.remove("ghgv-active");
      } else {
        const ok = measureTool.activate();
        if (ok)
          measureBtn.classList.add("ghgv-active");
      }
    });
    unitBtn.addEventListener("click", () => {
      measureUnit = measureUnit === "mm" ? "mil" : "mm";
      unitBtn.textContent = measureUnit;
      if (measureTool)
        measureTool.setUnit(measureUnit);
    });
    outlineBtn.addEventListener("click", () => {
      if (outlineBtn.disabled)
        return;
      outlineEnabled = !outlineEnabled;
      outlineBtn.classList.toggle("ghgv-active", outlineEnabled);
      applyOutlineMode();
    });
    layersBtn.addEventListener("click", (e) => {
      if (layersBtn.disabled)
        return;
      if (openLayerMenu) {
        openLayerMenu.remove();
        openLayerMenu = null;
        layersBtn.classList.remove("ghgv-active");
        return;
      }
      if (!layerToggleController)
        return;
      const menu = buildLayerToggleMenu(layerToggleController);
      const rect = layersBtn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      menu.style.position = "absolute";
      menu.style.top = `${rect.bottom - panelRect.top + 4}px`;
      menu.style.left = `${rect.left - panelRect.left}px`;
      panel.appendChild(menu);
      openLayerMenu = menu;
      layersBtn.classList.add("ghgv-active");
      const onOutside = (evt) => {
        if (!menu.contains(evt.target) && evt.target !== layersBtn) {
          menu.remove();
          openLayerMenu = null;
          layersBtn.classList.remove("ghgv-active");
          document.removeEventListener("mousedown", onOutside, true);
        }
      };
      setTimeout(() => document.addEventListener("mousedown", onOutside, true), 0);
    });
    function buildColorMenu() {
      const menu = document.createElement("div");
      menu.className = "ghgv-layer-menu";
      const heading = document.createElement("div");
      heading.className = "ghgv-layer-menu-heading";
      heading.textContent = "Board color";
      menu.appendChild(heading);
      const list = document.createElement("div");
      list.className = "ghgv-layer-menu-list";
      menu.appendChild(list);
      for (const preset of COLOR_PRESETS) {
        const row = document.createElement("button");
        row.className = "ghgv-color-row";
        if (preset.id === colorPreset)
          row.classList.add("ghgv-color-row-active");
        const dot = document.createElement("span");
        dot.className = "ghgv-color-dot";
        dot.style.background = preset.swatch;
        const label = document.createElement("span");
        label.textContent = preset.label;
        row.append(dot, label);
        row.addEventListener("click", async () => {
          if (colorBusy || preset.id === colorPreset) {
            closeColorMenu();
            return;
          }
          await applyColorPreset(preset.id);
          closeColorMenu();
        });
        list.appendChild(row);
      }
      return menu;
    }
    function closeColorMenu() {
      if (openColorMenu) {
        openColorMenu.remove();
        openColorMenu = null;
        colorBtn.classList.remove("ghgv-active");
      }
    }
    async function applyColorPreset(presetId) {
      if (!colorRebuilder)
        return;
      colorBusy = true;
      const prevStatus = status.textContent;
      status.textContent = "Recoloring board...";
      try {
        const variants = await colorRebuilder(presetId);
        if (variants) {
          colorPreset = presetId;
          stackupVariants.withOutline = variants.withOutline;
          stackupVariants.noOutline = variants.noOutline;
          applyOutlineMode();
          if (layerToggleController)
            layerToggleController.applyVisibility();
          status.textContent = persistentStatus;
        } else {
          status.textContent = prevStatus;
        }
      } catch (e) {
        console.warn("[gerber-gh] recolor failed", e);
        status.textContent = prevStatus;
      } finally {
        colorBusy = false;
      }
    }
    colorBtn.addEventListener("click", (e) => {
      if (colorBtn.disabled)
        return;
      if (openColorMenu) {
        closeColorMenu();
        return;
      }
      const menu = buildColorMenu();
      const rect = colorBtn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      menu.style.position = "absolute";
      menu.style.top = `${rect.bottom - panelRect.top + 4}px`;
      menu.style.left = `${rect.left - panelRect.left}px`;
      panel.appendChild(menu);
      openColorMenu = menu;
      colorBtn.classList.add("ghgv-active");
      const onOutside = (evt) => {
        if (!menu.contains(evt.target) && evt.target !== colorBtn) {
          closeColorMenu();
          document.removeEventListener("mousedown", onOutside, true);
        }
      };
      setTimeout(() => document.addEventListener("mousedown", onOutside, true), 0);
    });
    themeBtn.addEventListener("click", () => {
      stage.classList.toggle("ghgv-dark");
      const inverted = stage.classList.contains("ghgv-dark");
      themeBtn.classList.toggle("ghgv-active", inverted);
      const svg = stage.querySelector("svg");
      if (svg) {
        svg.style.filter = inverted ? "invert(1) hue-rotate(180deg)" : "";
      }
    });
    downloadBtn.addEventListener("click", () => {
      const svg = stage.querySelector("svg");
      if (!svg)
        return;
      const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = filename || "pcb";
      const suffix = currentView === "layer" ? "" : `-${currentView}`;
      a.download = `${baseName}${suffix}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
    toggleBtn.addEventListener("click", () => {
      if (stage.style.display === "none") {
        stage.style.display = "";
        toggleBtn.textContent = "Hide";
      } else {
        stage.style.display = "none";
        toggleBtn.textContent = "Show";
      }
    });
    attachShortcuts(panel, {
      fit: () => zoomController?.reset(),
      rotateRight: () => rotateBy(90),
      rotateLeft: () => rotateBy(-90),
      toggleMeasure: () => measureBtn.click(),
      toggleUnit: () => unitBtn.click(),
      showLayer: () => {
        if (!layerBtn.disabled)
          showView("layer");
      },
      showTop: () => {
        if (!topBtn.disabled)
          showView("top");
      },
      showBottom: () => {
        if (!bottomBtn.disabled)
          showView("bottom");
      },
      toggleOutline: () => {
        if (!outlineBtn.disabled)
          outlineBtn.click();
      },
      toggleInvert: () => themeBtn.click(),
      toggleHide: () => toggleBtn.click()
    });
    return {
      panel,
      stage,
      setLayerSvg(svg) {
        views.layer = svg;
        showView("layer");
      },
      showLoading(msg) {
        stage.innerHTML = `<span class="ghgv-loading">${msg}</span>`;
      },
      enableStackup({ withOutline, noOutline, layerCount, hasOutline, autoShow, onColorRebuild }) {
        stackupVariants.withOutline = withOutline;
        stackupVariants.noOutline = noOutline;
        outlineEnabled = Boolean(withOutline);
        outlineBtn.classList.toggle("ghgv-active", outlineEnabled);
        outlineBtn.disabled = !(withOutline && noOutline);
        applyOutlineMode();
        topBtn.disabled = false;
        bottomBtn.disabled = false;
        if (onColorRebuild)
          colorRebuilder = onColorRebuild;
        if (!layerToggleController) {
          layerToggleController = makeLayerToggleController(stage);
        } else {
          layerToggleController.resetVisibility();
        }
        const note = hasOutline && !noOutline ? `${layerCount} layers loaded` : hasOutline ? `${layerCount} layers loaded (toggle Outline if edges look wrong)` : `${layerCount} layers loaded (no outline file)`;
        persistentStatus = note;
        status.textContent = note;
        if (autoShow && !views.layer) {
          showView("top");
        }
      },
      // Adds inner-layer tab buttons between Top and Bottom. Idempotent:
      // calling again with a different set replaces the existing tabs.
      // `layers` is an array of { label, svg, filename }.
      setInnerLayers(layers) {
        for (const { btn, viewName } of innerTabBtns) {
          btn.remove();
          delete views[viewName];
        }
        innerTabBtns = [];
        if (!layers || layers.length === 0)
          return;
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          const viewName = `inner:${i}`;
          views[viewName] = layer.svg;
          const btn = document.createElement("button");
          btn.className = "ghgv-btn";
          btn.textContent = layer.label;
          btn.title = `Inner copper layer (${layer.filename})`;
          btn.dataset.view = viewName;
          btn.addEventListener("click", () => {
            if (btn.disabled)
              return;
            showView(viewName);
          });
          tabs.insertBefore(btn, bottomBtn);
          innerTabBtns.push({ btn, viewName });
        }
      },
      setStatus(msg) {
        persistentStatus = msg;
        status.textContent = msg;
      },
      setError(msg) {
        renderError(stage, msg);
      }
    };
  }

  // src/core/x2attr.js
  init_process();
  init_buffer();
  var TF_RE = /%TF\.([A-Za-z][A-Za-z0-9]*),([^*]*)\*%/g;
  function parseX2Attributes(text) {
    if (!text)
      return {};
    const head = text.slice(0, 8192);
    const attrs = {};
    let m;
    TF_RE.lastIndex = 0;
    while ((m = TF_RE.exec(head)) !== null) {
      const name = m[1];
      const args = m[2].split(",").map((s) => s.trim());
      attrs[name] = args;
    }
    return attrs;
  }
  function summarizeAttributes(attrs) {
    if (!attrs || Object.keys(attrs).length === 0)
      return null;
    const parts = [];
    if (attrs.FileFunction) {
      const [func, ...rest] = attrs.FileFunction;
      if (func === "Copper" && rest.length >= 2) {
        const layer = rest[0];
        const side = rest[1];
        const sideLabel = side === "Bot" ? "Bottom" : side === "Top" ? "Top" : side;
        parts.push(`${sideLabel} copper (${layer})`);
      } else if (func === "Soldermask" && rest[0]) {
        parts.push(`${rest[0] === "Bot" ? "Bottom" : rest[0]} soldermask`);
      } else if (func === "Legend" && rest[0]) {
        parts.push(`${rest[0] === "Bot" ? "Bottom" : rest[0]} silkscreen`);
      } else if (func === "Paste" && rest[0]) {
        parts.push(`${rest[0] === "Bot" ? "Bottom" : rest[0]} paste`);
      } else if (func === "Profile") {
        parts.push("Board outline");
      } else if (func === "Plated" || func === "NonPlated") {
        const plating = func === "Plated" ? "plated" : "non-plated";
        parts.push(`Drill (${plating})`);
      } else {
        parts.push(func);
      }
    }
    if (attrs.GenerationSoftware) {
      const [vendor, tool, version3] = attrs.GenerationSoftware;
      const label = version3 ? `${vendor} ${version3}` : tool ? `${vendor} (${tool})` : vendor;
      if (label)
        parts.push(label);
    }
    if (attrs.Part) {
      if (attrs.Part[0] === "Array")
        parts.push("Panelized");
    }
    return parts.length > 0 ? parts.join(" \u2022 ") : null;
  }

  // src/core/errors.js
  init_process();
  init_buffer();
  var ErrorCategory = {
    Network: "network",
    Parse: "parse",
    FormatTooOld: "format-too-old",
    Capability: "capability",
    Detection: "detection",
    Render: "render",
    Unknown: "unknown"
  };
  function createError({ category, summary, detail, suggestion, rawUrl, originalError }) {
    return {
      category: category || ErrorCategory.Unknown,
      summary: summary || "Something went wrong",
      detail: detail || null,
      suggestion: suggestion || null,
      rawUrl: rawUrl || null,
      originalError: originalError || null,
      timestamp: Date.now()
    };
  }
  function networkError({ status, url, rawUrl, originalError }) {
    let summary, suggestion;
    if (status === 404) {
      summary = "File not found";
      suggestion = "The repository may be private, or the file may have been moved or deleted.";
    } else if (status === 403) {
      summary = "Access denied";
      suggestion = "You may have hit the GitHub API rate limit (60 requests/hour without authentication). Try again in a few minutes.";
    } else if (status >= 500) {
      summary = "GitHub is having trouble";
      suggestion = "This is a server-side problem at GitHub, not in the extension. Try refreshing the page in a minute.";
    } else if (!status) {
      summary = "Could not reach GitHub";
      suggestion = "Check your internet connection, or your browser may be blocking the request.";
    } else {
      summary = `Network error (HTTP ${status})`;
      suggestion = "Try refreshing the page.";
    }
    return createError({
      category: ErrorCategory.Network,
      summary,
      detail: url ? `Failed to fetch: ${url}` : null,
      suggestion,
      rawUrl,
      originalError
    });
  }
  function parseError({ filename, rawUrl, originalError }) {
    return createError({
      category: ErrorCategory.Parse,
      summary: "Could not parse this file",
      detail: filename ? `The file ${filename} could not be interpreted as Gerber, Excellon drill, or KiCad PCB data.` : "The file could not be interpreted as a known PCB format.",
      suggestion: "This usually means the file uses a format variant we do not handle yet, or the file is corrupted. You can view the raw contents at the link below, and reporting the file would help us improve coverage.",
      rawUrl,
      originalError
    });
  }
  function formatTooOldError({ formatVersion, minVersion, rawUrl }) {
    return createError({
      category: ErrorCategory.FormatTooOld,
      summary: "File format too old",
      detail: formatVersion && minVersion ? `This KiCad file declares format version ${formatVersion}, but KiCanvas requires ${minVersion} or newer.` : "This KiCad file uses an older format that the embedded viewer cannot render.",
      suggestion: "You can download the raw file using the link below and open it in KiCad locally.",
      rawUrl
    });
  }
  function capabilityError({ summary, detail, suggestion, rawUrl }) {
    return createError({
      category: ErrorCategory.Capability,
      summary: summary || "Browser capability unavailable",
      detail,
      suggestion,
      rawUrl
    });
  }
  function detectionError({ reason, rawUrl }) {
    return createError({
      category: ErrorCategory.Detection,
      summary: "No PCB layer set detected",
      detail: reason || "The folder does not contain enough recognizable Gerber files to build a multi-layer view.",
      suggestion: "Open an individual Gerber file to see it rendered on its own, or navigate to a folder that contains a full layer set (typically 3 or more Gerber files plus a drill file).",
      rawUrl
    });
  }
  function renderError2({ filename, rawUrl, originalError }) {
    return createError({
      category: ErrorCategory.Render,
      summary: "Render failed",
      detail: filename ? `Rendering ${filename} produced an internal error.` : "An internal error occurred while rendering the preview.",
      suggestion: "You can view the raw file using the link below. Reporting the failure would help us track down the cause.",
      rawUrl,
      originalError
    });
  }
  function fromThrown(e, { url, filename, rawUrl } = {}) {
    if (e instanceof Error) {
      const m = e.message.match(/(?:Fetch failed|Directory listing failed): (\d+)/);
      if (m) {
        const status = parseInt(m[1], 10);
        return networkError({ status, url, rawUrl, originalError: e });
      }
      if (/parse|invalid|malformed|unexpected token/i.test(e.message)) {
        return parseError({ filename, rawUrl, originalError: e });
      }
    }
    return renderError2({ filename, rawUrl, originalError: e });
  }

  // src/core/eventlog.js
  init_process();
  init_buffer();
  var MAX_EVENTS = 50;
  var STORAGE_KEY = "ghgv_events";
  var events = [];
  function syncToStorage() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: events });
      }
    } catch (e) {
    }
  }
  function push(type, payload) {
    const entry = {
      type,
      timestamp: Date.now(),
      timestampIso: (/* @__PURE__ */ new Date()).toISOString(),
      ...payload
    };
    events.push(entry);
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }
    if (type === "error") {
      console.warn("[gerber-gh]", payload.summary || "error", payload);
    }
    syncToStorage();
  }
  function logActivation({ url, kind, filename }) {
    push("activate", { url, kind, filename });
  }
  function logFilesLoaded({ count, source }) {
    push("files-loaded", { count, source });
  }
  function logRender({ view, layerCount }) {
    push("render", { view, layerCount });
  }
  function logError(structuredError) {
    push("error", {
      category: structuredError.category,
      summary: structuredError.summary,
      detail: structuredError.detail,
      originalMessage: structuredError.originalError?.message
    });
  }
  function logInfo(message, extras) {
    push("info", { message, ...extras || {} });
  }

  // src/core/bom-mount.js
  init_process();
  init_buffer();

  // src/core/bom.js
  init_process();
  init_buffer();

  // src/core/xlsx-loader.js
  init_process();
  init_buffer();
  var STUB_SCRIPT_ID = "ghgv-sheetjs-loader";
  var READY_ATTR = "ghgvXlsxReady";
  var REQUEST_TIMEOUT_MS = 15e3;
  var injected = false;
  var readyPromise = null;
  function isReady() {
    return document.documentElement.dataset[READY_ATTR] === "1";
  }
  function injectStub() {
    if (injected)
      return;
    injected = true;
    const xlsxUrl = chrome.runtime.getURL("vendor/sheetjs/xlsx.mini.min.js");
    const stubUrl = chrome.runtime.getURL("vendor/sheetjs/loader-stub.js");
    const script = document.createElement("script");
    script.id = STUB_SCRIPT_ID;
    script.src = stubUrl;
    script.dataset.xlsxUrl = xlsxUrl;
    document.head.appendChild(script);
  }
  function waitForReady() {
    if (readyPromise)
      return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
      injectStub();
      if (isReady())
        return resolve();
      const start = Date.now();
      const tick = () => {
        if (isReady())
          return resolve();
        if (Date.now() - start > REQUEST_TIMEOUT_MS) {
          return reject(new Error("SheetJS load timed out"));
        }
        setTimeout(tick, 50);
      };
      tick();
    });
    return readyPromise;
  }
  function bytesToBase64(bytes) {
    const u82 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const CHUNK = 32768;
    let binary = "";
    for (let i = 0; i < u82.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, u82.subarray(i, i + CHUNK));
    }
    return btoa(binary);
  }
  var nextRequestId = 1;
  async function parseXlsxInPage(bytes, sheetName) {
    await waitForReady();
    const id = `ghgv-${Date.now()}-${nextRequestId++}`;
    const base64 = bytesToBase64(bytes);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("XLSX parse timed out"));
      }, REQUEST_TIMEOUT_MS);
      function onMessage(event) {
        if (event.source !== window)
          return;
        const msg = event.data;
        if (!msg || msg.source !== "ghgv-xlsx-response" || msg.id !== id)
          return;
        clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        if (msg.error) {
          reject(new Error(msg.error));
        } else {
          resolve(msg.result);
        }
      }
      window.addEventListener("message", onMessage);
      window.postMessage({
        source: "ghgv-xlsx-request",
        id,
        bytes: base64,
        sheetName: sheetName || null
      }, "*");
    });
  }

  // src/core/bom.js
  function detectDelimiter(text) {
    const sample = text.slice(0, 1024);
    let inQuote = false;
    let counts = { ",": 0, "	": 0, ";": 0 };
    for (let i = 0; i < sample.length; i++) {
      const c = sample[i];
      if (c === '"') {
        inQuote = !inQuote;
        continue;
      }
      if (inQuote)
        continue;
      if (c in counts)
        counts[c]++;
    }
    const best = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a, [",", -1]);
    return best[1] > 0 ? best[0] : ",";
  }
  function parseCsvText(text, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuote = false;
    let i = 0;
    while (i < text.length) {
      const c = text[i];
      if (inQuote) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuote = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }
      if (c === '"') {
        inQuote = true;
        i++;
        continue;
      }
      if (c === delimiter) {
        row.push(field.trim());
        field = "";
        i++;
        continue;
      }
      if (c === "\r") {
        if (text[i + 1] === "\n")
          i++;
        row.push(field.trim());
        if (row.some((v) => v !== ""))
          rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      if (c === "\n") {
        row.push(field.trim());
        if (row.some((v) => v !== ""))
          rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      field += c;
      i++;
    }
    if (field !== "" || row.length > 0) {
      row.push(field.trim());
      if (row.some((v) => v !== ""))
        rows.push(row);
    }
    return rows;
  }
  function parseCsv(text) {
    if (!text || typeof text !== "string")
      return null;
    const delimiter = detectDelimiter(text);
    const raw = parseCsvText(text, delimiter);
    if (raw.length < 2)
      return null;
    const COMMON_HEADERS = /^(reference|designator|designators|qty|quantity|value|footprint|package|part(\s|_)?(number|name)|manufacturer|mpn|description|comment|net)$/i;
    let headerIdx = 0;
    for (let i = 0; i < Math.min(raw.length, 10); i++) {
      if (raw[i].some((cell) => COMMON_HEADERS.test(cell.trim()))) {
        headerIdx = i;
        break;
      }
    }
    const headers = raw[headerIdx];
    const dataRows = raw.slice(headerIdx + 1).filter((r) => r.length > 0);
    const rowObjects = dataRows.map((r) => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i] || `col_${i + 1}`] = r[i] !== void 0 ? r[i] : "";
      }
      return obj;
    });
    return { headers, rows: rowObjects, delimiter };
  }
  async function parseXlsx(bytes, opts = {}) {
    if (!bytes)
      return null;
    try {
      const result = await parseXlsxInPage(bytes, opts.sheetName);
      if (!result || !result.rows || result.rows.length === 0)
        return null;
      return result;
    } catch (e) {
      throw new Error(`XLSX parse failed: ${e.message || e}`);
    }
  }
  function isBomFilename(filename) {
    if (!filename)
      return false;
    return /(^|[\s._-])bom\.(csv|tsv|txt|xlsx|xls)$/i.test(filename) || /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(filename) || /\.bom$/i.test(filename);
  }
  function bomFormatFromFilename(filename) {
    if (!filename)
      return "csv";
    if (/\.xlsx?$/i.test(filename))
      return "xlsx";
    return "csv";
  }

  // src/core/bom-panel.js
  init_process();
  init_buffer();
  function makeBomPanel({ filename, parsed, onSwitchSheet = null }) {
    ensureStyles();
    ensureBomStyles();
    const panel = document.createElement("div");
    panel.className = "ghgv-bom-panel";
    panel.setAttribute("data-ghgv-bom", "1");
    const toolbar = document.createElement("div");
    toolbar.className = "ghgv-bom-toolbar";
    const title3 = document.createElement("span");
    title3.className = "ghgv-bom-title";
    title3.textContent = `BOM: ${filename}`;
    const meta = document.createElement("span");
    meta.className = "ghgv-bom-meta";
    let sheetSelect = null;
    if (onSwitchSheet && parsed.sheetNames && parsed.sheetNames.length > 1) {
      sheetSelect = document.createElement("select");
      sheetSelect.className = "ghgv-bom-sheet-picker";
      sheetSelect.title = "Switch to a different sheet in this workbook";
      for (const name of parsed.sheetNames) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === parsed.activeSheet)
          opt.selected = true;
        sheetSelect.appendChild(opt);
      }
    }
    const spacer = document.createElement("span");
    spacer.style.flex = "1";
    const copyBtn = document.createElement("button");
    copyBtn.className = "ghgv-btn";
    copyBtn.textContent = "Copy as TSV";
    copyBtn.title = "Copy the table to clipboard as tab-separated values";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ghgv-btn";
    toggleBtn.textContent = "Hide";
    if (sheetSelect) {
      toolbar.append(title3, sheetSelect, meta, spacer, copyBtn, toggleBtn);
    } else {
      toolbar.append(title3, meta, spacer, copyBtn, toggleBtn);
    }
    panel.appendChild(toolbar);
    const tableWrap = document.createElement("div");
    tableWrap.className = "ghgv-bom-table-wrap";
    panel.appendChild(tableWrap);
    const table = document.createElement("table");
    table.className = "ghgv-bom-table";
    tableWrap.appendChild(table);
    let currentHeaders = parsed.headers;
    let currentRows = parsed.rows.slice();
    let currentSortKey = null;
    let currentSortDir = 1;
    function updateMeta() {
      meta.textContent = `${currentRows.length} rows \u2022 ${currentHeaders.length} columns`;
    }
    updateMeta();
    const thead = document.createElement("thead");
    table.appendChild(thead);
    function buildHeader() {
      thead.innerHTML = "";
      const headRow = document.createElement("tr");
      for (const h of currentHeaders) {
        const th = document.createElement("th");
        th.textContent = h || "(blank)";
        th.dataset.header = h;
        th.addEventListener("click", () => sortBy(h, th));
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
    }
    buildHeader();
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    function renderRows(rows) {
      tbody.innerHTML = "";
      for (const row of rows) {
        const tr = document.createElement("tr");
        for (const h of currentHeaders) {
          const td2 = document.createElement("td");
          td2.textContent = row[h] != null ? String(row[h]) : "";
          tr.appendChild(td2);
        }
        tbody.appendChild(tr);
      }
    }
    renderRows(currentRows);
    if (sheetSelect) {
      sheetSelect.addEventListener("change", async () => {
        const newSheet = sheetSelect.value;
        try {
          const reparsed = await onSwitchSheet(newSheet);
          if (!reparsed) {
            currentHeaders = [];
            currentRows = [];
            buildHeader();
            renderRows([]);
            updateMeta();
            return;
          }
          currentHeaders = reparsed.headers;
          currentRows = reparsed.rows.slice();
          currentSortKey = null;
          currentSortDir = 1;
          buildHeader();
          renderRows(currentRows);
          updateMeta();
        } catch (e) {
          meta.textContent = `Could not switch sheet: ${e.message || e}`;
        }
      });
    }
    function sortBy(key, th) {
      if (currentSortKey === key) {
        currentSortDir = -currentSortDir;
      } else {
        currentSortKey = key;
        currentSortDir = 1;
      }
      const sorted = currentRows.slice().sort((a, b) => {
        const av = a[key] != null ? String(a[key]) : "";
        const bv = b[key] != null ? String(b[key]) : "";
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn) && av.trim() !== "" && bv.trim() !== "") {
          return (an - bn) * currentSortDir;
        }
        return av.localeCompare(bv) * currentSortDir;
      });
      renderRows(sorted);
      for (const otherTh of thead.querySelectorAll("th")) {
        otherTh.classList.remove("ghgv-bom-sorted-asc", "ghgv-bom-sorted-desc");
      }
      th.classList.add(currentSortDir === 1 ? "ghgv-bom-sorted-asc" : "ghgv-bom-sorted-desc");
    }
    copyBtn.addEventListener("click", async () => {
      const lines = [currentHeaders.join("	")];
      for (const row of currentRows) {
        lines.push(currentHeaders.map((h) => row[h] != null ? String(row[h]) : "").join("	"));
      }
      const text = lines.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        const orig = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = orig;
        }, 1500);
      } catch (e) {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy as TSV";
        }, 2e3);
      }
    });
    toggleBtn.addEventListener("click", () => {
      if (tableWrap.style.display === "none") {
        tableWrap.style.display = "";
        toggleBtn.textContent = "Hide";
      } else {
        tableWrap.style.display = "none";
        toggleBtn.textContent = "Show";
      }
    });
    return { panel };
  }
  var BOM_STYLE_ID = "ghgv-bom-styles";
  function ensureBomStyles() {
    if (document.getElementById(BOM_STYLE_ID))
      return;
    const style = document.createElement("style");
    style.id = BOM_STYLE_ID;
    style.textContent = `
    .ghgv-bom-panel {
      margin: 12px 0;
      border: 1px solid var(--borderColor-default, #d0d7de);
      border-radius: 6px;
      background: var(--bgColor-default, #ffffff);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
    }
    .ghgv-bom-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-muted, #f6f8fa);
      border-radius: 6px 6px 0 0;
    }
    .ghgv-bom-title {
      font-weight: 600;
      color: var(--fgColor-default, #1f2328);
    }
    .ghgv-bom-meta {
      color: var(--fgColor-muted, #656d76);
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
    }
    .ghgv-bom-sheet-picker {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--borderColor-default, #d0d7de);
      background: var(--bgColor-default, #ffffff);
      color: var(--fgColor-default, #1f2328);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      cursor: pointer;
    }
    .ghgv-bom-sheet-picker:hover {
      border-color: #0e7c3a;
    }
    .ghgv-bom-table-wrap {
      max-height: 400px;
      overflow: auto;
    }
    .ghgv-bom-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .ghgv-bom-table thead {
      position: sticky;
      top: 0;
      background: var(--bgColor-muted, #f6f8fa);
      z-index: 1;
    }
    .ghgv-bom-table th {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid var(--borderColor-default, #d0d7de);
      cursor: pointer;
      user-select: none;
      font-weight: 600;
      color: var(--fgColor-default, #1f2328);
      white-space: nowrap;
    }
    .ghgv-bom-table th:hover {
      background: var(--bgColor-default, #ffffff);
    }
    .ghgv-bom-table th.ghgv-bom-sorted-asc::after {
      content: ' \u2191';
      color: var(--fgColor-accent, #0969da);
    }
    .ghgv-bom-table th.ghgv-bom-sorted-desc::after {
      content: ' \u2193';
      color: var(--fgColor-accent, #0969da);
    }
    .ghgv-bom-table td {
      padding: 6px 12px;
      border-bottom: 1px solid var(--borderColor-muted, #f0f0f0);
      color: var(--fgColor-default, #1f2328);
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      white-space: nowrap;
    }
    .ghgv-bom-table tr:hover td {
      background: var(--bgColor-muted, #f6f8fa);
    }
  `;
    document.head.appendChild(style);
  }

  // src/core/bom-mount.js
  async function detectAndParseBom(files) {
    const matches = files.filter((f) => isBomFilename(f.filename));
    if (matches.length === 0)
      return null;
    matches.sort((a, b) => {
      const aSimple = /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(a.filename) ? 0 : 1;
      const bSimple = /^bom\.(csv|tsv|txt|xlsx|xls)$/i.test(b.filename) ? 0 : 1;
      if (aSimple !== bSimple)
        return aSimple - bSimple;
      const aIsCsv = bomFormatFromFilename(a.filename) === "csv" ? 0 : 1;
      const bIsCsv = bomFormatFromFilename(b.filename) === "csv" ? 0 : 1;
      return aIsCsv - bIsCsv;
    });
    for (const match of matches) {
      const format2 = bomFormatFromFilename(match.filename);
      try {
        let parsed = null;
        if (format2 === "xlsx") {
          if (typeof match.getBytes !== "function") {
            continue;
          }
          const bytes = await match.getBytes();
          parsed = await parseXlsx(bytes);
        } else {
          if (typeof match.getContent !== "function")
            continue;
          const text = await match.getContent();
          parsed = parseCsv(text);
        }
        if (parsed && parsed.rows.length > 0) {
          logInfo("BOM parsed", { filename: match.filename, format: format2, rows: parsed.rows.length });
          return { filename: match.filename, parsed, format: format2, getBytes: match.getBytes };
        }
      } catch (e) {
        logError(fromThrown(e, { filename: match.filename }));
      }
    }
    return null;
  }
  async function mountBomPanel(files, anchorEl) {
    const bom = await detectAndParseBom(files);
    if (!bom)
      return null;
    let onSwitchSheet = null;
    if (bom.format === "xlsx" && bom.parsed.sheetNames?.length > 1 && bom.getBytes) {
      onSwitchSheet = async (sheetName) => {
        const bytes = await bom.getBytes();
        return parseXlsx(bytes, { sheetName });
      };
    }
    const { panel } = makeBomPanel({
      filename: bom.filename,
      parsed: bom.parsed,
      onSwitchSheet
    });
    if (anchorEl?.parentNode) {
      anchorEl.insertAdjacentElement("afterend", panel);
    } else {
      document.body.appendChild(panel);
    }
    return { panel, filename: bom.filename, rowCount: bom.parsed.rows.length };
  }

  // src/handlers/blob.js
  var stackupCache = /* @__PURE__ */ new Map();
  async function loadSiblings(info, defaultColor) {
    const cacheKey = `${info.owner}/${info.repo}/${info.ref}/${info.dir}`;
    if (stackupCache.has(cacheKey)) {
      return stackupCache.get(cacheKey);
    }
    const task = (async () => {
      const items = await fetchDirListing(info);
      const candidates = items.filter(
        (item) => item.type === "file" && item.size > 200 && looksLikeGerberByName(item.name)
      );
      if (candidates.length < 2) {
        return { stackup: null, items, reason: "fewer than 2 Gerber-shaped files in folder" };
      }
      const fetched = await Promise.all(
        candidates.map(async (item) => {
          try {
            const text = await fetchRaw(item.download_url);
            if (!looksLikeGerberByContent(text))
              return null;
            return { filename: item.name, content: text };
          } catch (e) {
            console.warn("[gerber-gh] sibling fetch failed for", item.name, e);
            return null;
          }
        })
      );
      const valid = fetched.filter(Boolean);
      if (valid.length < 2) {
        return { stackup: null, items, reason: "fewer than 2 layers passed content sniff" };
      }
      const stackup = await buildStackup(valid, { colorPreset: defaultColor });
      return { ...stackup, items, validFiles: valid };
    })();
    stackupCache.set(cacheKey, task);
    try {
      const result = await task;
      stackupCache.set(cacheKey, Promise.resolve(result));
      return result;
    } catch (e) {
      stackupCache.delete(cacheKey);
      throw e;
    }
  }
  function findInsertionTarget() {
    const reactRoot = document.querySelector('react-app[app-name="react-code-view"]');
    if (reactRoot)
      return reactRoot;
    const classicBox = document.querySelector(".repository-content .Box.mt-3.position-relative") || document.querySelector(".repository-content .Box.mt-3") || document.querySelector(".repository-content");
    if (classicBox)
      return classicBox;
    return document.querySelector("main") || document.body;
  }
  async function handleBlob(info, ctx = {}) {
    if (!looksLikeGerberByName(info.filename))
      return false;
    if (document.querySelector('[data-ghgv="1"]'))
      return true;
    let text;
    try {
      text = await fetchRaw(info.rawUrl);
    } catch (e) {
      logError(fromThrown(e, { url: info.rawUrl, filename: info.filename, rawUrl: info.rawUrl }));
      return false;
    }
    if (isAmbiguousExtension(info.filename) && !looksLikeGerberByContent(text)) {
      return false;
    }
    logActivation({ url: window.location.href, kind: "blob", filename: info.filename });
    const layerInfo = (0, import_whats_that_gerber3.default)([info.filename])[info.filename] || null;
    const sniffed = sniffFiletype(text);
    const isDrill = sniffed === "drill" || layerInfo?.type === "drill";
    const kind = isDrill ? "drill" : "gerber";
    const x2 = parseX2Attributes(text);
    const x2Summary = summarizeAttributes(x2);
    const panel = makePanel({
      filename: info.filename,
      kind,
      layerInfo,
      mode: "blob",
      metaOverride: x2Summary,
      settings: ctx.settings
    });
    const target = findInsertionTarget();
    target.insertBefore(panel.panel, target.firstChild);
    try {
      const svg = await renderSingleLayer(text, isDrill);
      panel.setLayerSvg(svg);
      logRender({ view: "layer", layerCount: 1 });
    } catch (e) {
      const err2 = fromThrown(e, {
        filename: info.filename,
        rawUrl: info.rawUrl
      });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    panel.setStatus("Loading sibling layers...");
    try {
      const result = await loadSiblings(info, ctx.settings?.defaultColor);
      if (!result || !result.stackup) {
        panel.setStatus(result?.reason ? `No multi-layer view (${result.reason})` : "No multi-layer view available");
        return true;
      }
      panel.enableStackup({
        withOutline: stackupSvgs(result.stackup),
        noOutline: stackupSvgs(result.stackupNoOutline),
        layerCount: result.layerCount,
        hasOutline: result.hasOutline,
        onColorRebuild: result.validFiles ? async (presetId) => {
          const rebuilt = await buildStackup(result.validFiles, { colorPreset: presetId });
          return {
            withOutline: stackupSvgs(rebuilt.stackup),
            noOutline: stackupSvgs(rebuilt.stackupNoOutline)
          };
        } : null
      });
      logFilesLoaded({ count: result.layerCount, source: "siblings" });
      if (result.innerLayers && result.innerLayers.length > 0) {
        panel.setInnerLayers(result.innerLayers);
      }
      if (result.items) {
        const bomFiles = result.items.filter((item) => item.type === "file" && isBomFilename(item.name)).map((item) => ({
          filename: item.name,
          getContent: async () => {
            const res = await fetch(item.download_url, { credentials: "omit" });
            if (!res.ok)
              throw new Error(`Fetch failed: ${res.status}`);
            return res.text();
          },
          getBytes: async () => {
            const res = await fetch(item.download_url, { credentials: "omit" });
            if (!res.ok)
              throw new Error(`Fetch failed: ${res.status}`);
            return res.arrayBuffer();
          }
        }));
        if (bomFiles.length > 0) {
          await mountBomPanel(bomFiles, panel.panel);
        }
      }
    } catch (e) {
      const err2 = fromThrown(e, {
        filename: info.filename,
        rawUrl: info.rawUrl
      });
      logError(err2);
      panel.setStatus(`Multi-layer unavailable: ${err2.summary}`);
    }
    return true;
  }

  // src/handlers/tree.js
  init_process();
  init_buffer();
  var treeCache = /* @__PURE__ */ new Map();
  function findInsertionTarget2() {
    const reactRoot = document.querySelector('react-app[app-name="react-code-view"]');
    if (reactRoot)
      return reactRoot;
    const fileListing = document.querySelector(".repository-content .Box.mb-3") || document.querySelector(".repository-content .Box") || document.querySelector(".repository-content");
    if (fileListing)
      return fileListing;
    return document.querySelector("main") || document.body;
  }
  async function handleTree(info, ctx = {}) {
    if (document.querySelector('[data-ghgv="1"]'))
      return true;
    let ref = info.ref;
    if (!ref) {
      try {
        ref = await fetchDefaultBranch(info);
      } catch (e) {
        logError(fromThrown(e, { url: window.location.href }));
        return false;
      }
    }
    const fullInfo = { ...info, ref };
    const cacheKey = `${fullInfo.owner}/${fullInfo.repo}/${fullInfo.ref}/${fullInfo.dir}`;
    let items;
    try {
      items = await fetchDirListing(fullInfo);
    } catch (e) {
      logError(fromThrown(e, { url: window.location.href }));
      return false;
    }
    const candidates = items.filter(
      (item) => item.type === "file" && item.size > 200 && looksLikeGerberByName(item.name)
    );
    if (candidates.length < 3)
      return false;
    const folderName = fullInfo.dir ? fullInfo.dir.split("/").pop() : fullInfo.repo;
    const panel = makePanel({
      filename: folderName,
      kind: "folder",
      layerInfo: null,
      mode: "tree",
      settings: ctx.settings
    });
    const target = findInsertionTarget2();
    target.insertBefore(panel.panel, target.firstChild);
    logActivation({ url: window.location.href, kind: "tree", filename: fullInfo.dir });
    panel.showLoading(`Found ${candidates.length} Gerber-shaped files. Loading...`);
    let result;
    if (treeCache.has(cacheKey)) {
      try {
        result = await treeCache.get(cacheKey);
      } catch (e) {
        treeCache.delete(cacheKey);
        result = null;
      }
    }
    if (!result) {
      const task = (async () => {
        const fetched = await Promise.all(
          candidates.map(async (item) => {
            try {
              const text = await fetchRaw(item.download_url);
              if (!looksLikeGerberByContent(text))
                return null;
              return { filename: item.name, content: text };
            } catch (e) {
              logError(fromThrown(e, { filename: item.name, url: item.download_url }));
              return null;
            }
          })
        );
        const valid = fetched.filter(Boolean);
        if (valid.length < 2) {
          return { stackup: null, reason: "fewer than 2 layers passed content sniff" };
        }
        const built = await buildStackup(valid, { colorPreset: ctx.settings?.defaultColor });
        return { ...built, validFiles: valid };
      })();
      treeCache.set(cacheKey, task);
      try {
        result = await task;
        treeCache.set(cacheKey, Promise.resolve(result));
      } catch (e) {
        treeCache.delete(cacheKey);
        const err2 = fromThrown(e);
        logError(err2);
        panel.setError(err2);
        return true;
      }
    }
    if (!result || !result.stackup) {
      const err2 = detectionError({ reason: result?.reason });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    panel.enableStackup({
      withOutline: stackupSvgs(result.stackup),
      noOutline: stackupSvgs(result.stackupNoOutline),
      layerCount: result.layerCount,
      hasOutline: result.hasOutline,
      autoShow: true,
      onColorRebuild: result.validFiles ? async (presetId) => {
        const rebuilt = await buildStackup(result.validFiles, { colorPreset: presetId });
        return {
          withOutline: stackupSvgs(rebuilt.stackup),
          noOutline: stackupSvgs(rebuilt.stackupNoOutline)
        };
      } : null
    });
    logFilesLoaded({ count: result.layerCount, source: "tree" });
    if (result.innerLayers && result.innerLayers.length > 0) {
      panel.setInnerLayers(result.innerLayers);
    }
    const bomFiles = items.filter((item) => item.type === "file" && isBomFilename(item.name)).map((item) => ({
      filename: item.name,
      getContent: async () => {
        const res = await fetch(item.download_url, { credentials: "omit" });
        if (!res.ok)
          throw new Error(`Fetch failed: ${res.status}`);
        return res.text();
      },
      getBytes: async () => {
        const res = await fetch(item.download_url, { credentials: "omit" });
        if (!res.ok)
          throw new Error(`Fetch failed: ${res.status}`);
        return res.arrayBuffer();
      }
    }));
    if (bomFiles.length > 0) {
      await mountBomPanel(bomFiles, panel.panel);
    }
    return true;
  }

  // src/handlers/zip.js
  init_process();
  init_buffer();

  // node_modules/fflate/esm/browser.js
  init_process();
  init_buffer();
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
      b[i] = start += 1 << eb[i - 1];
    }
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
      for (var j = b[i]; j < b[i + 1]; ++j) {
        r[j] = j - b[i] << 5 | i;
      }
    }
    return { b, r };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i = 0; i < 32768; ++i) {
    x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var x;
  var i;
  var hMap = function(cd, mb, r) {
    var s = cd.length;
    var i = 0;
    var l = new u16(mb);
    for (; i < s; ++i) {
      if (cd[i])
        ++l[cd[i] - 1];
    }
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
      le[i] = le[i - 1] + l[i - 1] << 1;
    }
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          var sv = i << 4 | cd[i];
          var r_1 = mb - cd[i];
          var v = le[cd[i] - 1]++ << r_1;
          for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
            co[rev[v] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s);
      for (i = 0; i < s; ++i) {
        if (cd[i]) {
          co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
        }
      }
    }
    return co;
  };
  var flt = new u8(288);
  for (i = 0; i < 144; ++i)
    flt[i] = 8;
  var i;
  for (i = 144; i < 256; ++i)
    flt[i] = 9;
  var i;
  for (i = 256; i < 280; ++i)
    flt[i] = 7;
  var i;
  for (i = 280; i < 288; ++i)
    flt[i] = 8;
  var i;
  var fdt = new u8(32);
  for (i = 0; i < 32; ++i)
    fdt[i] = 5;
  var i;
  var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
  var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
  var max = function(a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
      if (a[i] > m)
        m = a[i];
    }
    return m;
  };
  var bits = function(d, p, m) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
  };
  var bits16 = function(d, p) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
  };
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0)
      s = 0;
    if (e == null || e > v.length)
      e = v.length;
    return new u8(v.subarray(s, e));
  };
  var ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    // determined by compression function
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
    // determined by unknown compression method
  ];
  var err = function(ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
      Error.captureStackTrace(e, err);
    if (!nt)
      throw e;
    return e;
  };
  var inflt = function(dat, st, buf, dict) {
    var sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l)
      return buf || new u8(0);
    var noBuf = !buf;
    var resize = noBuf || st.i != 2;
    var noSt = st.i;
    if (noBuf)
      buf = new u8(sl * 3);
    var cbuf = function(l2) {
      var bl = buf.length;
      if (l2 > bl) {
        var nbuf = new u8(Math.max(bl * 2, l2));
        nbuf.set(buf);
        buf = nbuf;
      }
    };
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    var tbts = sl * 8;
    do {
      if (!lm) {
        final = bits(dat, pos, 1);
        var type = bits(dat, pos + 1, 3);
        pos += 3;
        if (!type) {
          var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
          if (t > sl) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + l);
          buf.set(dat.subarray(s, t), bt);
          st.b = bt += l, st.p = pos = t * 8, st.f = final;
          continue;
        } else if (type == 1)
          lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
        else if (type == 2) {
          var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
          var tl = hLit + bits(dat, pos + 5, 31) + 1;
          pos += 14;
          var ldt = new u8(tl);
          var clt = new u8(19);
          for (var i = 0; i < hcLen; ++i) {
            clt[clim[i]] = bits(dat, pos + i * 3, 7);
          }
          pos += hcLen * 3;
          var clb = max(clt), clbmsk = (1 << clb) - 1;
          var clm = hMap(clt, clb, 1);
          for (var i = 0; i < tl; ) {
            var r = clm[bits(dat, pos, clbmsk)];
            pos += r & 15;
            var s = r >> 4;
            if (s < 16) {
              ldt[i++] = s;
            } else {
              var c = 0, n = 0;
              if (s == 16)
                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
              else if (s == 17)
                n = 3 + bits(dat, pos, 7), pos += 3;
              else if (s == 18)
                n = 11 + bits(dat, pos, 127), pos += 7;
              while (n--)
                ldt[i++] = c;
            }
          }
          var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
          lbt = max(lt);
          dbt = max(dt);
          lm = hMap(lt, lbt, 1);
          dm = hMap(dt, dbt, 1);
        } else
          err(1);
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
      }
      if (resize)
        cbuf(bt + 131072);
      var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
      var lpos = pos;
      for (; ; lpos = pos) {
        var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
        pos += c & 15;
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (!c)
          err(2);
        if (sym < 256)
          buf[bt++] = sym;
        else if (sym == 256) {
          lpos = pos, lm = null;
          break;
        } else {
          var add = sym - 254;
          if (sym > 264) {
            var i = sym - 257, b = fleb[i];
            add = bits(dat, pos, (1 << b) - 1) + fl[i];
            pos += b;
          }
          var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
          if (!d)
            err(3);
          pos += d & 15;
          var dt = fd[dsym];
          if (dsym > 3) {
            var b = fdeb[dsym];
            dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
          }
          if (pos > tbts) {
            if (noSt)
              err(0);
            break;
          }
          if (resize)
            cbuf(bt + 131072);
          var end = bt + add;
          if (bt < dt) {
            var shift = dl - dt, dend = Math.min(dt, end);
            if (shift + bt < 0)
              err(3);
            for (; bt < dend; ++bt)
              buf[bt] = dict[shift + bt];
          }
          for (; bt < end; ++bt)
            buf[bt] = buf[bt - dt];
        }
      }
      st.l = lm, st.p = lpos, st.b = bt, st.f = final;
      if (lm)
        final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
  };
  var et = /* @__PURE__ */ new u8(0);
  var b2 = function(d, b) {
    return d[b] | d[b + 1] << 8;
  };
  var b4 = function(d, b) {
    return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
  };
  var b8 = function(d, b) {
    return b4(d, b) + b4(d, b + 4) * 4294967296;
  };
  function inflateSync(data, opts) {
    return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
  }
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e) {
  }
  var dutf8 = function(d) {
    for (var r = "", i = 0; ; ) {
      var c = d[i++];
      var eb = (c > 127) + (c > 223) + (c > 239);
      if (i + eb > d.length)
        return { s: r, r: slc(d, i - 1) };
      if (!eb)
        r += String.fromCharCode(c);
      else if (eb == 3) {
        c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
      } else if (eb & 1)
        r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
      else
        r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
    }
  };
  function strFromU8(dat, latin1) {
    if (latin1) {
      var r = "";
      for (var i = 0; i < dat.length; i += 16384)
        r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
      return r;
    } else if (td) {
      return td.decode(dat);
    } else {
      var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
      if (r.length)
        err(8);
      return s;
    }
  }
  var slzh = function(d, b) {
    return b + 30 + b2(d, b + 26) + b2(d, b + 28);
  };
  var zh = function(d, b, z) {
    var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
    var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off3 = _a2[2];
    return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off3];
  };
  var z64hs = function(d, b, l, z, sc, su, off3) {
    var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off3 == 4294967295, e = b + l;
    var nf = nsc + nsu + noff;
    if (z && nf) {
      for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
        if (b2(d, b) == 1) {
          return [
            nsc ? b8(d, b + 4 + 8 * nsu) : sc,
            nsu ? b8(d, b + 4) : su,
            noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off3,
            1
          ];
        }
      }
      if (z < 2)
        err(13);
    }
    return [sc, su, off3, 0];
  };
  function unzipSync(data, opts) {
    var files = {};
    var e = data.length - 22;
    for (; b4(data, e) != 101010256; --e) {
      if (!e || data.length - e > 65558)
        err(13);
    }
    ;
    var c = b2(data, e + 8);
    if (!c)
      return {};
    var o = b4(data, e + 16);
    var z = b4(data, e - 20) == 117853008;
    if (z) {
      var ze = b4(data, e - 12);
      z = b4(data, ze) == 101075792;
      if (z) {
        c = b4(data, ze + 32);
        o = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    for (var i = 0; i < c; ++i) {
      var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off3 = _a2[5], b = slzh(data, off3);
      o = no;
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_2
      })) {
        if (!c_2)
          files[fn] = slc(data, b, b + sc);
        else if (c_2 == 8)
          files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
        else
          err(14, "unknown compression type " + c_2);
      }
    }
    return files;
  }

  // src/handlers/zip.js
  var zipCache = /* @__PURE__ */ new Map();
  function findInsertionTarget3() {
    const reactRoot = document.querySelector('react-app[app-name="react-code-view"]');
    if (reactRoot)
      return reactRoot;
    const classicBox = document.querySelector(".repository-content .Box.mt-3.position-relative") || document.querySelector(".repository-content .Box.mt-3") || document.querySelector(".repository-content");
    if (classicBox)
      return classicBox;
    return document.querySelector("main") || document.body;
  }
  function flattenZipNames(names) {
    if (names.length === 0)
      return new Map(names.map((n) => [n, n]));
    let prefix = names[0].includes("/") ? names[0].substring(0, names[0].lastIndexOf("/") + 1) : "";
    for (const name of names) {
      while (prefix && !name.startsWith(prefix)) {
        const slashIdx = prefix.slice(0, -1).lastIndexOf("/");
        prefix = slashIdx === -1 ? "" : prefix.substring(0, slashIdx + 1);
      }
      if (!prefix)
        break;
    }
    const m = /* @__PURE__ */ new Map();
    for (const name of names) {
      m.set(name, prefix ? name.substring(prefix.length) : name);
    }
    return m;
  }
  async function handleZip(info, ctx = {}) {
    if (!isZipFilename(info.filename))
      return false;
    if (document.querySelector('[data-ghgv="1"]'))
      return true;
    const cacheKey = info.rawUrl;
    const panel = makePanel({
      filename: info.filename,
      kind: "zip",
      layerInfo: null,
      mode: "tree",
      settings: ctx.settings
    });
    const target = findInsertionTarget3();
    target.insertBefore(panel.panel, target.firstChild);
    logActivation({ url: window.location.href, kind: "zip", filename: info.filename });
    panel.showLoading("Downloading archive...");
    let result;
    if (zipCache.has(cacheKey)) {
      try {
        result = await zipCache.get(cacheKey);
      } catch (e) {
        zipCache.delete(cacheKey);
        result = null;
      }
    }
    if (!result) {
      const task = (async () => {
        const bytes = await fetchRawBytes(info.rawUrl);
        const entries = unzipSync(new Uint8Array(bytes), {
          filter: (file) => {
            const name = file.name;
            if (name.endsWith("/"))
              return false;
            if (name.includes("__MACOSX/"))
              return false;
            if (name.split("/").pop()?.startsWith("."))
              return false;
            return true;
          }
        });
        const allNames = Object.keys(entries);
        const flatMap = flattenZipNames(allNames);
        const candidateNames = allNames.filter((n) => {
          const flat = flatMap.get(n);
          return looksLikeGerberByName(flat.split("/").pop());
        });
        if (candidateNames.length < 3) {
          return { stackup: null, reason: `archive has ${candidateNames.length} Gerber-shaped files` };
        }
        const valid = [];
        for (const name of candidateNames) {
          try {
            const u82 = entries[name];
            const text = strFromU8(u82);
            if (!looksLikeGerberByContent(text))
              continue;
            const flat = flatMap.get(name);
            valid.push({ filename: flat.split("/").pop(), content: text });
          } catch (err2) {
            logError(createError({
              category: ErrorCategory.Parse,
              summary: "ZIP entry could not be decoded",
              detail: `Could not extract or decode ${name}.`,
              originalError: err2
            }));
          }
        }
        const bomEntries = allNames.filter((name) => isBomFilename(name.split("/").pop())).map((name) => ({
          filename: name.split("/").pop(),
          getContent: async () => strFromU8(entries[name]),
          getBytes: async () => {
            const view = entries[name];
            return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
          }
        }));
        if (valid.length < 2) {
          return { stackup: null, reason: "fewer than 2 layers passed content sniff", bomEntries };
        }
        const stackup = await buildStackup(valid, { colorPreset: ctx.settings?.defaultColor });
        return { ...stackup, bomEntries, validFiles: valid };
      })();
      zipCache.set(cacheKey, task);
      try {
        result = await task;
        zipCache.set(cacheKey, Promise.resolve(result));
      } catch (e) {
        zipCache.delete(cacheKey);
        const err2 = fromThrown(e, { filename: info.filename, rawUrl: info.rawUrl });
        const archiveErr = createError({
          category: err2.category,
          summary: "Archive could not be processed",
          detail: `An error occurred while extracting or parsing ${info.filename}.`,
          suggestion: "The archive may be corrupted, password-protected, or in an unsupported format. You can download the raw ZIP using the link below.",
          rawUrl: info.rawUrl,
          originalError: e
        });
        logError(archiveErr);
        panel.setError(archiveErr);
        return true;
      }
    }
    if (!result || !result.stackup) {
      const err2 = createError({
        category: ErrorCategory.Detection,
        summary: "Not a renderable PCB archive",
        detail: result?.reason ? `This archive does not appear to contain a renderable Gerber layer set: ${result.reason}.` : "This archive does not appear to contain a renderable Gerber layer set.",
        suggestion: "The extension looks for ZIP archives that contain at least 3 Gerber-shaped files. If this archive is meant to be a Gerber package, it may use unusual filenames; you can download the raw archive using the link below.",
        rawUrl: info.rawUrl
      });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    panel.enableStackup({
      withOutline: stackupSvgs(result.stackup),
      noOutline: stackupSvgs(result.stackupNoOutline),
      layerCount: result.layerCount,
      hasOutline: result.hasOutline,
      autoShow: true,
      onColorRebuild: result.validFiles ? async (presetId) => {
        const rebuilt = await buildStackup(result.validFiles, { colorPreset: presetId });
        return {
          withOutline: stackupSvgs(rebuilt.stackup),
          noOutline: stackupSvgs(rebuilt.stackupNoOutline)
        };
      } : null
    });
    logFilesLoaded({ count: result.layerCount, source: "zip" });
    if (result.innerLayers && result.innerLayers.length > 0) {
      panel.setInnerLayers(result.innerLayers);
    }
    if (result.bomEntries && result.bomEntries.length > 0) {
      await mountBomPanel(result.bomEntries, panel.panel);
    }
    return true;
  }

  // src/handlers/kicad.js
  init_process();
  init_buffer();

  // src/core/kicanvas-loader.js
  init_process();
  init_buffer();
  var READY_ATTR2 = "ghgvKicanvasReady";
  var SCRIPT_ID = "ghgv-kicanvas-loader";
  var inFlight = null;
  function isReady2() {
    return document.documentElement.dataset[READY_ATTR2] === "1";
  }
  function loadKiCanvas() {
    if (isReady2())
      return Promise.resolve();
    if (inFlight)
      return inFlight;
    inFlight = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (!existing) {
        const stubUrl = chrome.runtime.getURL("vendor/kicanvas/loader-stub.js");
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.type = "module";
        script.src = stubUrl;
        script.onerror = () => reject(new Error("Failed to load KiCanvas bundle"));
        document.head.appendChild(script);
      }
      const start = Date.now();
      const tick = () => {
        if (isReady2())
          return resolve();
        if (Date.now() - start > 15e3)
          return reject(new Error("KiCanvas load timed out"));
        setTimeout(tick, 50);
      };
      tick();
    });
    return inFlight;
  }

  // src/core/kicad-panel.js
  init_process();
  init_buffer();
  function makeKiCadPanel({ filename, kind = "board" }) {
    ensureStyles();
    const isSchematic = kind === "schematic";
    const panel = document.createElement("div");
    panel.className = "ghgv-panel";
    panel.setAttribute("data-ghgv", "1");
    const toolbar = document.createElement("div");
    toolbar.className = "ghgv-toolbar";
    const title3 = document.createElement("span");
    title3.className = "ghgv-title";
    title3.textContent = isSchematic ? `KiCad schematic preview: ${filename}` : `KiCad PCB preview: ${filename}`;
    const meta = document.createElement("span");
    meta.className = "ghgv-meta";
    meta.textContent = isSchematic ? "kicad_sch" : "kicad_pcb";
    const status = document.createElement("span");
    status.className = "ghgv-status";
    const spacer = document.createElement("span");
    spacer.className = "ghgv-spacer";
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ghgv-btn";
    toggleBtn.textContent = "Hide";
    const credit = document.createElement("span");
    credit.className = "ghgv-credit";
    const creditLink = document.createElement("a");
    creditLink.href = "https://github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension";
    creditLink.target = "_blank";
    creditLink.rel = "noopener noreferrer";
    creditLink.textContent = "Green Shoe Garage";
    credit.append(creditLink);
    toolbar.append(title3, meta, status, spacer, toggleBtn, credit);
    const stage = document.createElement("div");
    stage.className = "ghgv-stage ghgv-stage-kicad";
    stage.innerHTML = '<span class="ghgv-loading">Loading...</span>';
    panel.append(toolbar, stage);
    toggleBtn.addEventListener("click", () => {
      if (stage.style.display === "none") {
        stage.style.display = "";
        toggleBtn.textContent = "Hide";
      } else {
        stage.style.display = "none";
        toggleBtn.textContent = "Show";
      }
    });
    attachShortcuts(panel, {
      toggleHide: () => toggleBtn.click()
    });
    return {
      panel,
      stage,
      setStatus(msg) {
        status.textContent = msg;
      },
      setError(msg) {
        renderError(stage, msg);
      },
      showLoading(msg) {
        stage.innerHTML = `<span class="ghgv-loading">${msg}</span>`;
      }
    };
  }

  // src/handlers/kicad.js
  function isKiCadPcbFilename(filename) {
    return /\.kicad_pcb$/i.test(filename || "");
  }
  function isKiCadSchFilename(filename) {
    return /\.kicad_sch$/i.test(filename || "");
  }
  function isKiCadFilename(filename) {
    return isKiCadPcbFilename(filename) || isKiCadSchFilename(filename);
  }
  function kiCanvasType(filename) {
    return isKiCadSchFilename(filename) ? "schematic" : "board";
  }
  function checkWebGL2() {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("webgl2");
      if (!ctx) {
        return { ok: false, reason: "WebGL2 is unavailable in this browser" };
      }
      const lost = ctx.getExtension && ctx.getExtension("WEBGL_lose_context");
      if (ctx.isContextLost && ctx.isContextLost()) {
        return { ok: false, reason: "WebGL2 context was lost on creation" };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: `WebGL2 probe failed: ${e.message || e}` };
    }
  }
  function findInsertionTarget4() {
    const reactRoot = document.querySelector('react-app[app-name="react-code-view"]');
    if (reactRoot)
      return reactRoot;
    const classicBox = document.querySelector(".repository-content .Box.mt-3.position-relative") || document.querySelector(".repository-content .Box.mt-3") || document.querySelector(".repository-content");
    if (classicBox)
      return classicBox;
    return document.querySelector("main") || document.body;
  }
  function extractMetadata(text, isSchematic = false) {
    const head = text.slice(0, 4096);
    const versionMatch = head.match(/\(version\s+(\d+)/);
    const generatorMatch = head.match(/\(generator\s+"?([\w.-]+)/);
    if (isSchematic) {
      const sample = text.slice(0, 262144);
      const symbolMatches = sample.match(/\(\s*symbol\s+/g);
      const symbolCount = symbolMatches ? symbolMatches.length : null;
      return {
        version: versionMatch ? versionMatch[1] : null,
        generator: generatorMatch ? generatorMatch[1] : null,
        symbolCount,
        layerCount: null
      };
    }
    const layersBlock = text.match(/\(layers\s+([\s\S]+?)\n\s*\)/);
    let layerCount = null;
    if (layersBlock) {
      const matches = layersBlock[1].match(/\(\d+\s+"/g);
      if (matches)
        layerCount = matches.length;
    }
    return {
      version: versionMatch ? versionMatch[1] : null,
      generator: generatorMatch ? generatorMatch[1] : null,
      layerCount,
      symbolCount: null
    };
  }
  function showWebGLFallback(panel, info, meta, reason, kind = "board") {
    const stage = panel.stage;
    stage.innerHTML = "";
    stage.classList.remove("ghgv-stage-kicad");
    const isSchematic = kind === "schematic";
    const wrap = document.createElement("div");
    wrap.style.padding = "24px 16px";
    wrap.style.maxWidth = "640px";
    wrap.style.margin = "0 auto";
    wrap.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    wrap.style.fontSize = "13px";
    wrap.style.color = "var(--fgColor-default, #1f2328)";
    const heading = document.createElement("div");
    heading.style.fontWeight = "600";
    heading.style.marginBottom = "8px";
    heading.textContent = isSchematic ? "KiCad schematic preview unavailable" : "KiCad PCB preview unavailable";
    wrap.appendChild(heading);
    const explain = document.createElement("p");
    explain.style.margin = "0 0 12px 0";
    explain.style.lineHeight = "1.5";
    explain.textContent = `This file requires WebGL2 to render and your browser reports it as unavailable. ${reason}. WebGL2 may be disabled in your browser settings, blocked by enterprise policy, or unsupported by your GPU drivers.`;
    wrap.appendChild(explain);
    if (meta.layerCount || meta.symbolCount || meta.generator || meta.version) {
      const metaList = document.createElement("div");
      metaList.style.margin = "0 0 12px 0";
      metaList.style.padding = "8px 12px";
      metaList.style.background = "var(--bgColor-default, #ffffff)";
      metaList.style.border = "1px solid var(--borderColor-default, #d0d7de)";
      metaList.style.borderRadius = "6px";
      metaList.style.fontFamily = "ui-monospace, SFMono-Regular, monospace";
      metaList.style.fontSize = "12px";
      const lines = [];
      if (isSchematic) {
        if (meta.symbolCount)
          lines.push(`Symbols: ${meta.symbolCount}`);
      } else {
        if (meta.layerCount)
          lines.push(`Layers: ${meta.layerCount}`);
      }
      if (meta.generator)
        lines.push(`Generator: ${meta.generator}`);
      if (meta.version)
        lines.push(`Format version: ${meta.version}`);
      metaList.textContent = lines.join(" \u2022 ");
      wrap.appendChild(metaList);
    }
    const linkPara = document.createElement("p");
    linkPara.style.margin = "0";
    const link = document.createElement("a");
    link.href = info.rawUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = isSchematic ? "Download the raw .kicad_sch file" : "Download the raw .kicad_pcb file";
    link.style.color = "var(--fgColor-accent, #0969da)";
    linkPara.appendChild(link);
    linkPara.appendChild(document.createTextNode(" to open it in KiCad locally."));
    wrap.appendChild(linkPara);
    stage.appendChild(wrap);
    panel.setStatus("WebGL2 unavailable");
  }
  async function handleKiCadBlob(info, ctx = {}) {
    if (!isKiCadFilename(info.filename))
      return false;
    if (document.querySelector('[data-ghgv="1"]'))
      return true;
    const isSchematic = isKiCadSchFilename(info.filename);
    const kind = isSchematic ? "schematic" : "board";
    const extension = isSchematic ? ".kicad_sch" : ".kicad_pcb";
    const panel = makeKiCadPanel({ filename: info.filename, kind });
    const target = findInsertionTarget4();
    target.insertBefore(panel.panel, target.firstChild);
    logActivation({ url: window.location.href, kind: `kicad-${kind}`, filename: info.filename });
    let text;
    panel.showLoading(`Downloading ${extension}...`);
    try {
      text = await fetchRaw(info.rawUrl);
    } catch (e) {
      const err2 = fromThrown(e, { filename: info.filename, rawUrl: info.rawUrl });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    const meta = extractMetadata(text, isSchematic);
    if (meta.version && parseInt(meta.version, 10) < 2021e4) {
      const err2 = formatTooOldError({
        formatVersion: meta.version,
        minVersion: "20210000 (KiCad 6+)",
        rawUrl: info.rawUrl
      });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    const gl = checkWebGL2();
    if (!gl.ok) {
      logError(capabilityError({
        summary: "WebGL2 unavailable",
        detail: gl.reason,
        rawUrl: info.rawUrl
      }));
      showWebGLFallback(panel, info, meta, gl.reason, kind);
      return true;
    }
    panel.showLoading("Loading KiCanvas...");
    try {
      await loadKiCanvas();
      logRender({ view: `kicanvas-${kind}`, layerCount: meta.layerCount });
    } catch (e) {
      const err2 = createError({
        category: ErrorCategory.Capability,
        summary: "KiCanvas could not load",
        detail: "The bundled KiCanvas viewer failed to initialize in this page.",
        suggestion: "This is unusual. Try reloading the page. If the problem persists, you can download the raw file using the link below and open it in KiCad locally.",
        rawUrl: info.rawUrl,
        originalError: e
      });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    panel.stage.innerHTML = "";
    const embed = document.createElement("kicanvas-embed");
    embed.setAttribute("controls", "full");
    const source = document.createElement("kicanvas-source");
    source.setAttribute("type", kiCanvasType(info.filename));
    source.setAttribute("name", info.filename);
    source.textContent = text;
    embed.appendChild(source);
    panel.stage.appendChild(embed);
    const summary = [];
    if (isSchematic) {
      if (meta.symbolCount)
        summary.push(`${meta.symbolCount} symbols`);
    } else {
      if (meta.layerCount)
        summary.push(`${meta.layerCount} layers`);
    }
    if (meta.generator)
      summary.push(`generator: ${meta.generator}`);
    if (meta.version)
      summary.push(`format v${meta.version}`);
    panel.setStatus(summary.join(" \u2022 "));
    return true;
  }

  // src/handlers/gist.js
  init_process();
  init_buffer();
  function findInsertionTarget5() {
    const repoContent = document.querySelector(".repository-content");
    if (repoContent)
      return repoContent;
    return document.querySelector("main") || document.body;
  }
  async function handleGist(info, ctx = {}) {
    if (info.kind !== "gist")
      return false;
    if (document.querySelector('[data-ghgv="1"]'))
      return true;
    logActivation({ url: window.location.href, kind: "gist", filename: info.gistId });
    let gist;
    try {
      gist = await fetchGist(info.gistId);
    } catch (e) {
      logError(fromThrown(e, { url: window.location.href }));
      return false;
    }
    const allFiles = Object.values(gist.files || {});
    if (allFiles.length === 0)
      return false;
    const candidates = [];
    for (const f of allFiles) {
      if (!f.filename)
        continue;
      if (!looksLikeGerberByName(f.filename))
        continue;
      if (typeof f.content !== "string")
        continue;
      if (!looksLikeGerberByContent(f.content))
        continue;
      candidates.push({ filename: f.filename, content: f.content });
    }
    if (candidates.length === 0)
      return false;
    const panel = makePanel({
      filename: gist.description || info.gistId,
      kind: "gist",
      layerInfo: null,
      mode: candidates.length === 1 ? "blob" : "tree",
      settings: ctx.settings
    });
    const target = findInsertionTarget5();
    target.insertBefore(panel.panel, target.firstChild);
    if (candidates.length === 1) {
      try {
        const svg = await renderSingleLayer(candidates[0].content, false);
        panel.setLayerSvg(svg);
        panel.setStatus(`Single Gerber file: ${candidates[0].filename}`);
        logRender({ view: "layer", layerCount: 1 });
      } catch (e) {
        const err2 = fromThrown(e, { filename: candidates[0].filename });
        logError(err2);
        panel.setError(err2);
      }
      return true;
    }
    panel.showLoading(`Found ${candidates.length} Gerber files. Building composite...`);
    let result;
    try {
      result = await buildStackup(candidates, { colorPreset: ctx.settings?.defaultColor });
    } catch (e) {
      const err2 = fromThrown(e);
      logError(err2);
      panel.setError(err2);
      return true;
    }
    if (!result || !result.stackup) {
      const err2 = detectionError({ reason: result?.reason });
      logError(err2);
      panel.setError(err2);
      return true;
    }
    panel.enableStackup({
      withOutline: stackupSvgs(result.stackup),
      noOutline: stackupSvgs(result.stackupNoOutline),
      layerCount: result.layerCount,
      hasOutline: result.hasOutline,
      autoShow: true,
      onColorRebuild: async (presetId) => {
        const rebuilt = await buildStackup(candidates, { colorPreset: presetId });
        return {
          withOutline: stackupSvgs(rebuilt.stackup),
          noOutline: stackupSvgs(rebuilt.stackupNoOutline)
        };
      }
    });
    logFilesLoaded({ count: result.layerCount, source: "gist" });
    if (result.innerLayers && result.innerLayers.length > 0) {
      panel.setInnerLayers(result.innerLayers);
    }
    return true;
  }

  // src/core/settings.js
  init_process();
  init_buffer();
  var STORAGE_KEY2 = "ghgv_settings";
  var DEFAULTS = Object.freeze({
    // Default measurement unit when the tool is activated.
    defaultUnit: "mm",
    // 'mm' | 'mil'
    // Whether to invert (dark mode) the rendered SVG by default.
    defaultInvert: false,
    // Whether the outline-from-file mode is on by default for stackup views.
    defaultOutline: true,
    // Default soldermask color preset id (see core/colors.js). One of:
    // green, red, blue, black, white, yellow, purple.
    defaultColor: "green",
    // Whether to start with the panel collapsed (Show button) instead of
    // expanded (Hide button). Some users prefer to opt in per file.
    startCollapsed: false,
    // Hard cap on GitHub API calls per page-load. Useful for users on the
    // unauthenticated rate limit who want to be cautious. 0 disables.
    maxApiCalls: 0
  });
  async function load() {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return { ...DEFAULTS };
    }
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEY2], (result) => {
          const stored = result?.[STORAGE_KEY2] || {};
          resolve({ ...DEFAULTS, ...stored });
        });
      } catch (e) {
        resolve({ ...DEFAULTS });
      }
    });
  }

  // src/content.js
  var currentSettings = null;
  async function activate() {
    try {
      currentSettings = await load();
    } catch (e) {
      currentSettings = null;
    }
    const info = parseGitHubUrl(window.location.pathname, window.location.hostname);
    if (!info)
      return;
    const ctx = { settings: currentSettings };
    if (info.kind === "gist") {
      await handleGist(info, ctx);
    } else if (info.kind === "blob") {
      if (isKiCadFilename(info.filename)) {
        await handleKiCadBlob(info, ctx);
      } else if (isZipFilename(info.filename)) {
        await handleZip(info, ctx);
      } else {
        await handleBlob(info, ctx);
      }
    } else if (info.kind === "tree") {
      await handleTree(info, ctx);
    }
  }
  var lastUrl = location.href;
  function watchNavigation() {
    const obs = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(activate, 100);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("turbo:render", () => setTimeout(activate, 100));
    document.addEventListener("turbo:load", () => setTimeout(activate, 100));
    window.addEventListener("popstate", () => setTimeout(activate, 100));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      activate();
      watchNavigation();
    });
  } else {
    activate();
    watchNavigation();
  }
})();
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/*! Bundled license information:

@esbuild-plugins/node-globals-polyfill/Buffer.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

escape-html/index.js:
  (*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   *)

queue-microtask/index.js:
  (*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

run-parallel/index.js:
  (*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

run-waterfall/index.js:
  (*! run-waterfall. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
