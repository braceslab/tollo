const qs = require('query-string')
const url = require('url')
const request = require('request-promise')
const lodash = require('lodash')
const log = require('log-segment')
const tough = require('tough-cookie')

const _function = require('./function')

const http = {
  arrange: _function.arrange,

  act: function (test) {
    return async function (input) {
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

      // @todo check data fields
      // @todo save token on global
      try {
        const _response = await request(_options)
        if (_response.headers['content-type'].indexOf('application/json') !== -1 && typeof _response.body === 'string') {
          _response.body = JSON.parse(_response.body)
        }
        return { request: _options, response: _response }
      } catch (error) {
        return { request: _options, response: error.response }
      }
    }
  },
  /**
   * result.request
   * result.response
   */
  assert: function (test) {
    return async function (result, input, output, sandbox) {
      let _response = result.response
      if (output.status) {
        if (_response.statusCode !== output.status) {
          log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
          log.info('tester-http', 'expect status', output.status, 'instead of', _response.statusCode)
          throw new Error('TOLLO_ASSERT_HTTP_STATUS')
        }
      }

      if (output.body) {
        if (output.body.equal) {
          if (!_equal(_response.body, output.body.equal)) {
            log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
            throw new Error('TOLLO_ASSERT_HTTP_BODY_EQUAL')
          }
        } else if (output.body.partial) {
          if (!_partial(_response.body, output.body.partial)) {
            log.info('tester-http', log.v('request', result.request), log.v('response', result.response))
            throw new Error('TOLLO_ASSERT_HTTP_BODY_PARTIAL')
          }
        }
      }

      if (output.header) {
        if (output.header.equal) {
          if (!_equal(_response.headers, output.header.equal)) {
            throw new Error('TOLLO_ASSERT_HTTP_HEADER_EQUAL')
          }
        } else if (output.header.partial) {
          if (!_partial(_response.headers, output.header.partial)) {
            throw new Error('TOLLO_ASSERT_HTTP_HEADER_PARTIAL')
          }
        }
      }

      if (output.redirect) {
        if (_response.headers.location !== output.redirect) {
          throw new Error('TOLLO_ASSERT_HTTP_REDIRECT')
        }
      }
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
