const log = require('log-segment')
const checkv = require('checkv')
const Promise = require('bluebird')

const settings = require('./settings')
const Batch = require('./Batch')

/**
 * @class module
 *
 * @todo run parallel cases (default sequential)
 */
const Tester = function () {
  /**
   * function start
   */
  let __start = async function () {
    log.info(settings.log.tag, 'start')
  }

  /**
   * function end
   */
  let __end = async function () {
    log.info(settings.log.tag, 'end')
  }

  /**
   * Batch instance
   */
  let __batch

  /**
   * @constructor
   */
  const __init = function () {
    __batch = new Batch()
  }

  /**
   * add test
   * @param {Object} test
   */
  const add = function (test) {
    let _valid = __isValidTest(test)
    if (_valid.err) {
      log.error(settings.log.tag, 'invalid test',
        test.name || '(missing test name)',
        _valid.message)
      return
    } else if (_valid.message) {
      log.info(settings.log.tag,
        test.name || '(missing test name)',
        _valid.message)
    }

    if (!test[test.name].disabled) {
      __batch.add(test[test.name])
    }
  }

  const bulk = function (tests) {
    for (const i in tests) {
      const _test = {}
      _test[i] = tests[i]
      add(_test)
    }
  }

  /**
   * validate (and adjust) test
   * @param {*} test
   */
  const __isValidTest = function (test) {
    if (!checkv(test, {isObject: true})) {
      return {err: true, message: 'test is not an object'}
    }
    try {
      let _key = Object.keys(test)[0]
      // test name can't be a reserved name: tester-start, testar-end
      if (checkv(_key, {isIn: [settings.tasks.end.name, settings.tasks.start.name]})) {
        return {err: true, message: `name ${_key} is invalid, use another one`}
      }

      let _test = test[_key]
      test.name = _key
      _test.name = _key

      if (_test.disabled) {
        return {err: false, message: `is disabled`}
      }

      if (!checkv(_test.mode, {isEnum: settings.mode})) {
        return {err: true, message: 'test.mode is invalid'}
      }
      if (_test.mode === settings.mode.HTTP) {
        if (!checkv(_test.act, {isObject: true})) {
          return {err: true, message: 'test.act is not an object'}
        }
      } else {
        if (!checkv(_test.act, {isFunction: true})) {
          return {err: true, message: 'test.act is not a function'}
        }
      }

      // if assert function is not defined, use default assert by test mode
      if (_test.assert) {
        if (!checkv(_test.assert, {isFunction: true})) {
          return {err: true, message: 'test.assert is not a function'}
        }
      } else {
        switch (_test.mode) {
          case settings.mode.SYNC:
          case settings.mode.PROMISE:
            _test.assert = tester.assert.equal
            break
          case settings.mode.CALLBACK:
            _test.assert = tester.assert.callback
            break
          case settings.mode.ASYNC:
            _test.assert = tester.assert.promise
            break
          case settings.mode.EVENT:
            _test.assert = tester.assert.event
            break
          case settings.mode.HTTP:
            _test.assert = tester.assert.http
            break
        }
      }

      if (!checkv(_test.cases, {isArray: true})) {
        return {err: true, message: 'test.cases is not an array'}
      }

      if (_test.arrange && !checkv(_test.arrange, {isFunction: true})) {
        return {err: true, message: 'test.arrange is not a function'}
      }
      if (_test.tidy && !checkv(_test.tidy, {isFunction: true})) {
        return {err: true, message: 'test.tidy is not a function'}
      }
      if (_test.prepare && !checkv(_test.prepare, {isFunction: true})) {
        return {err: true, message: 'test.prepare is not a function'}
      }
      if (_test.done && !checkv(_test.done, {isFunction: true})) {
        return {err: true, message: 'test.done is not a function'}
      }

      /*
      // check cases has input and output
      for (let i = 0; i < _test.cases.length; i++) {
        if (!_test.cases[i].input || !_test.cases[i].output) {
          return {err: true, message: `missing input or output in test.cases[${i}]`}
        }
      }
      */

      if (!_test.describe) {
        _test.describe = ''
      }
    } catch (e) {
      return {err: true, message: e.toString()}
    }

    return {err: false}
  }

  const run = function () {
    __batch.start = __start
    __batch.end = __end
    return __batch.run()
  }

  /**
   * promise wrapper
   */
  const promise = function (f) {
    return new Promise(f)
  // @todo
  }

  // connect output callback mode to assert.callback
  const callback = function (...args) {
    // @todo
  }

  const assert = {
    equal: function (result, input, output, sandbox) {
      return tester.promise((resolve, reject) => {
        tester.validate(result, { isExactly: output })
          ? resolve()
          : reject()
      })
    },
    mutation: function (result, input, output, sandbox) {
      return tester.promise((resolve, reject) => {
        tester.validate(input[0], { isExactly: output })
          ? resolve()
          : reject()
      })
    },
    callback: function (result, input, output) {
      return tester.promise((resolve, reject) => {
        if (output[0]) {
          return reject()
        }
        resolve()
      })
    },
    /**
     * @param result collect from events
     * @todo
     */
    event: function (result, input, output) {
      return tester.promise((resolve, reject) => {
        resolve()
      })
    },
    /**
     * @param result collect from events
     * @todo
     */
    http: function (result, input, output) {
      return tester.promise((resolve, reject) => {
        resolve()
      })
    }
  }

  __init()

  Object.defineProperty(Tester.prototype, 'start', {
    get: () => {
      return __start
    },
    set: (f) => {
      // @todo isPromise
      if (!checkv(f, {isFunction: true})) {
        log.error(settings.log.tag, 'is not a function', log.v('f', f))
      }
      __start = f
    }
  })

  Object.defineProperty(Tester.prototype, 'end', {
    get: () => {
      return __end
    },
    set: (f) => {
      // @todo isPromise
      if (!checkv(f, {isFunction: true})) {
        log.error(settings.log.tag, 'is not a function', log.v('f', f))
      }
      __end = f
    }
  })

  Tester.prototype.mode = settings.mode

  Tester.prototype.assert = assert
  Tester.prototype.promise = promise
  Tester.prototype.callback = callback
  Tester.prototype.validate = checkv

  Tester.prototype.add = add
  Tester.prototype.bulk = bulk
  Tester.prototype.run = run
}

const tester = new Tester()

module.exports = tester
