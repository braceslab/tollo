const log = require('log-segment')
const Orchestrator = require('orchestrator')
const Promise = require('bluebird')
const checkv = require('checkv')
const tap = require('tap')

const settings = require('./settings')
const http = require('./mode/http')
const _function = require('./mode/function')

const Batch = function () {
  let __orchestrator
  let __start
  let __end

  let __tasks

  const __init = function () {
    __orchestrator = new Orchestrator()
    __tasks = []
  }

  const __testLabel = function (test, _case, i) {
    let _label = test.name + ' - case #' + i
    if (_case.describe) {
      _label += ' - ' + _case.describe
    }
    return _label
  }

  /**
   * @todo sandbox
   * @todo tap
   */
  const add = function (test) {
    if (!test.cases || test.cases.length < 1) {
      log.warning(settings.log.tag, test.name, 'no cases')
      return
    }

    let _wrap
    let _act, _assert, _arrange
    const _cases = []

    switch (test.mode) {
      case settings.mode.SYNC:
      case settings.mode.PROMISE:
      case settings.mode.ASYNC:
      case settings.mode.CALLBACK:
        _wrap = _function
        break
      case settings.mode.EVENT:
        // @todo
        _wrap = null
        break
      case settings.mode.HTTP:
        _wrap = http
        break
    }
    _arrange = _wrap.arrange(test)
    _act = _wrap.act(test)
    _assert = _wrap.assert(test)

    // start test, wait for dependencies, at least main start
    let _dependencies = [settings.tasks.start.name]
    if (test.wait) {
      _dependencies = _dependencies.concat(test.wait, _cases)
    }
    __orchestrator.add(test.name + '#start', _dependencies, async () => {
      log.info(settings.log.tag, test.name, test.describe)
    })

    // @todo add prepare

    // setup cases
    // each case is composed by: arrange, act, assert, tidy
    for (let i = 0; i < test.cases.length; i++) {
      const _case = test.cases[i]
      if (_case.disabled) {
        continue
      }
      let _name = test.name + '#' + i
      const _f = async () => {
        let _label = __testLabel(test, _case, i)
        const _throw = _case.hasOwnProperty('throw')
        log.info(settings.log.tag, _label)
        tap.test(_label, async (_tap) => {
          let _sandbox = {}
          _tap.plan(1)

          try {
            test.act._sandbox = _sandbox
            // arrange, act, assert
            // http://blog.cleancoder.com/uncle-bob/2017/03/16/DrCalvin.html
            // hey, looks like you found an easter egg
            // it's always a good read source code
            // cheers, Simone
            try {
              await _arrange(_case.input, _sandbox)
            } catch (e) {
              log.error(settings.log.tag, _label, 'arrange function', log.v('err', e))
            }

            try {
              _case.result = await _act(_case.input)
            } catch (e) {
              _case.exception = e
            }

            if (_throw) {
              await _assert(_case.exception, _case.input, _case.throw, _sandbox)
            } else {
              if (_case.exception) {
                throw _case.exception
              }
              await _assert(_case.result, _case.input, _case.output, _sandbox)
            }
            log.success(settings.log.tag, _label)
            _tap.pass(_label)
          } catch (err) {
            log.error(settings.log.tag, _label,
              log.v('input', _case.input),
              log.v('output', _case.output),
              log.v('result', _case.result),
              log.v('err', err))
            _tap.fail(_label, err)
            throw err
          }
        })
      }

      _cases.push(_name)
      // @todo case dependencies: prepare, arrange, previous case
      // @todo parallel / sequential
      let _wait = i > 0
        ? [test.name + '#' + (i - 1)]
        : [test.name + '#start']
      __orchestrator.add(_name, _wait, _f)

    // @todo add tidy function after assert
    }

    // @todo add done

    // test pack
    // actually test.name + '#end'
    // dependes on: prepare, cases, done
    __orchestrator.add(test.name, _cases, async () => {
      log.success(settings.log.tag, test.name, test.describe)
    })

    // collect test names
    __tasks.push(test.name)
  }

  /**
   * @return Promise
   */
  const run = async function () {
    if (__start) {
      __orchestrator.add(settings.tasks.start.name, __start)
    }
    if (__end) {
      __orchestrator.add(settings.tasks.end.name, __tasks, __end)
    }
    await __orchestrator.start(settings.tasks.end.name)
  }

  __init()

  Object.defineProperty(this, 'start', {
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

  Object.defineProperty(this, 'end', {
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

  this.add = add
  this.run = run
}

module.exports = Batch

/*

global.request = supertest(samples.url)

let _label = 'WebServer.start'
tap.test(_label, (test) => {
  test.plan(1)

}).then((tap) => {
  let _label = 'login: POST /api/v1/user/login user,passw ok (user)'
  return tap.test(_label, (test) => {
    test.plan(1)

      test._request = supertest(test.act.url)
    global.request
      .post('/api/v1/user')
      .send({
        user: samples.users.guy.user,
        passw: samples.users.guy.passw
      })
      //.expect('Content-Type', 'application/json')
      .expect(200)
      .then(response => {
        console.log(response)
        // @todo check data fields
        // @todo save token on global
        test.pass(_label)
      })
      .catch(err => {
        test.fail(_label, err)
      })
  })
}).then((tap) => {
  process.exit(0)
}).catch(tap.threw)
*/
