const qs = require('query-string')
const url = require('url')
const request = require('request-promise')
const Promise = require('bluebird')
const lodash = require('lodash')
const log = require('log-segment')
const tough = require('tough-cookie')

const _function = require('./function')

const http = {
  arrange: _function.arrange,

  act: function (test) {
    return (input) => {
      return new Promise((resolve) => {
        let _method = test.act.method.toUpperCase()

        const _options = {
          method: _method,
          uri: test.act.url,
          resolveWithFullResponse: true,
          followRedirect: false
        }

        // @todo json: true
        // @todo header
        // headers: {
        //    'User-Agent': 'Request-Promise'
        // }
        if (input) {
          if (input.cookies) {
            let _jar = request.jar()
            const _url = url.parse(test.act.url)
            const _domain = `${_url.protocol}//${_url.host}`

            for (const _key in input.cookies) {
              let cookie = new tough.Cookie({
                key: _key,
                value: _value(input.cookies[_key])
              })
              _jar.setCookie(cookie, _domain)
            }
            _options.jar = _jar
          }
          if (input.body) {
            _options.body = input.body
            _options.json = true
          }
          if (input.url) {
            for (const _key in input.url) {
              // @todo replace all?
              _options.uri = _options.uri.replace(`:${_key}`, input.url[_key])
            }
          }
          if (input.query) {
            _options.qs = qs.stringify(input.query)
          }
        }

        request(_options)
          .then(response => {
            // @todo check data fields
            // @todo save token on global
            resolve({ request: _options, response: response })
          })
          .catch((err) => {
            resolve({ request: _options, response: err.response })
          })
      })
    }
  },
  /**
   * result.request
   * result.response
   */
  assert: function (test) {
    return (result, input, output, sandbox) => {
      return new Promise((resolve, reject) => {
        let _response = result.response
        if (output.status) {
          if (_response.statusCode !== output.status) {
            log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
            log.info('tester-http', 'expect status', output.status, 'instead of', _response.statusCode)
            reject(new Error('TESTER_HTTP_STATUS'))
            return
          }
        }

        if (output.body) {
          if (output.body.equal) {
            if (!_equal(_response.body, output.body.equal)) {
              log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
              reject(new Error('TESTER_HTTP_BODY_EQUAL'))
              return
            }
          } else if (output.body.partial) {
            if (!_partial(_response.body, output.body.partial)) {
              log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
              reject(new Error('TESTER_HTTP_BODY_PARTIAL'))
              return
            }
          }
        }

        if (output.header) {
          if (output.header.equal) {
            if (!_equal(_response.headers, output.header.equal)) {
              reject(new Error('TESTER_HTTP_HEADER_EQUAL'))
              return
            }
          } else if (output.header.partial) {
            if (!_partial(_response.headers, output.header.partial)) {
              reject(new Error('TESTER_HTTP_HEADER_PARTIAL'))
              return
            }
          }
        }

        if (output.redirect) {
          if (_response.headers.location !== output.redirect) {
            reject(new Error('TESTER_HTTP_REDIRECT'))
            return
          }
        }

        resolve()
      })
    }
  }
}

const _equal = function (a, b) {
  return lodash.isEqual(a, b)
}

const _partial = function (a, b) {
  for (const _key in b) {
    if (typeof b[_key] === 'function') {
      if (!b[_key](a[_key])) {
        return false
      }
    } else {
      // eslint-disable-next-line eqeqeq
      if (a[_key] != b[_key]) {
        return false
      }
    }
  }
  return true
}

const _value = function (v) {
  return typeof v === 'function' ? v() : v
}

module.exports = http
