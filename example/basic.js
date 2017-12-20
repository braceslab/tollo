const tollo = require('../index')

const fs = require('fs')

function sum (a, b) {
  return a + b
}

function pop (array) {
  array.pop()
}

tollo.start = function () {
  return new Promise((resolve, reject) => {
    // declare start function
    console.log('start')
    resolve()
  })
}

tollo.end = function () {
  return new Promise((resolve, reject) => {
    // declare end function
    console.log('end')
    resolve()
  })
}

// sync
tollo.add({
  'sum': {
    describe: 'sum two numbers',
    mode: tollo.mode.SYNC,

    act: sum,
    // assert: default > tollo.assert.equal

    cases: [
      {
        describe: 'basic',
        input: [1, 2],
        output: 3
      },
      {
        input: [1, 5],
        output: 6
      }
    ]
  }
})

// sync mutation
tollo.add({
  'array.pop': {
    describe: 'pop the last element of array',
    mode: tollo.mode.SYNC,

    act: pop,
    assert: tollo.assert.mutation,

    cases: [
      {
        input: [[1, 2]],
        output: [1]
      },
      {
        input: [[1, 2, 3]],
        output: [1, 2]
      }
    ]
  }
})

/*
// async - Promise
tollo.add({
  'fs.chmodAsync': {
    disabled: true,
    mode: tollo.mode.PROMISE,

    arrange: (input, sandbox) => {
      return new Promise((resolve, reject) => {
        // fs.chmod 123
        resolve()
      })
    },
    act: fs.chmodAsync,
    assert: tollo.assert.promise,
    // === tollo.assert.promise
    // assert: (result, input, output, sandbox) => { // < output: {resolve: value} | {reject: value}
    //   return tollo.promise((resolve, reject) => {
    //     if (output.hasKey(resolve)) {
    //       result === output.resolve
    //         ? resolve()
    //         : reject()
    //     }
    //     result === output.reject
    //       ? resolve()
    //       : reject()
    //   })
    // },

    cases: [
      {
        input: ['path', 555]
      },
      {
        input: ['path/denied', 444],
        throw: new Error('EDENIED')
      }
    ]
  }
})

/*
// async - callback
tollo.add({
  'fs.chmod': {
    describe: 'fs.chmod',
    mode: tollo.mode.CALLBACK,

    arrange: (input, sandbox) => {
      return new Promise((resolve, reject) => {
        fs.chmod(input[0], 555, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
    },
    act: fs.chmod,
    assert: tollo.assert.callback, // !default assert for async is promise

    cases: [
      {
        input: ['path', 666, tollo.callback], // < need tollo.callback in args
        output: undefined
      },
      {
        input: ['path/denied', 123, tollo.callback],
        output: new Error('EAUTH_DENIED') // more args > use []
      }
    ]
  }
})

// event
tollo.add({
  'fs.createWriteStream': {
    disabled: true,
    mode: tollo.mode.EVENT,

    arrange: (input, sandbox) => {
      return new Promise((resolve, reject) => {
        // fs.chmod 123
        resolve()
      })
    },
    act: fs.createWriteStream,
    // assert: tollo.assert.event,

    cases: [
      {
        input: ['path/file', { mode: 'r' }],
        output: { start: ['...'] } // append event listener to $act and check output - once or on/off
      },
      {
        input: ['path/file/denied', { mode: 'r' }],
        output: { error: [new Error('EDENIED')] } // append event listener to $act and check output - once or on/off
      }
    ]
  }
})

// event
tollo.add({
  'fs.createWriteStream().something': {
    disabled: true,
    mode: tollo.mode.EVENT,

    prepare: (resolve, reject, sandbox) => {
    },
    done: (resolve, reject, sandbox) => {
    },

    arrange: (input, sandbox) => {
      return new Promise((resolve, reject) => {
        let _stream = fs.createWriteStream('...')
        _stream.once('start', () => {
          _stream.removeAllListeners()
          resolve()
        })
        _stream.once('error', (err) => {
          _stream.removeAllListeners()
          reject(err)
        })
        sandbox.stream = _stream
      })
    },
    act: (...args) => {
      this._sandbox.stream.something(...args)
      return this._sandbox.stream
    },
    // assert: tollo.assert.event,
    tidy: (sandbox, resolve, reject) => {
      sandbox.stream.end()
    },

    cases: [
      {
        input: [1, 2, 3],
        output: { data: ['...'] }
      },
      {
        input: [-1],
        output: { error: [new Error('ENONE')] }
      }
    ]
  }
})

tollo.add({
  'user find': {
    disabled: true,
    describe: 'attempt to login using username and/or email and password',
    mode: tollo.mode.HTTP,

    act: {post: '/api/v1/user/login'}, // header: ...
    // assert: tollo.assert.http,

    cases: [
      {
        describe: 'admin login by username and success',
        input: [{
          body: {
            user: 'admin-test',
            passw: '1234567890'
          }
        }],
        output: {
          status: 200,
          body: {username: 'admin-test'}
        // @todo check user data
        }
      },
      {
        describe: 'admin login by email and success',
        input: [{
          body: {
            user: 'admin-test@email.com',
            passw: '1234567890'
          }
        }],
        output: {
          status: 200,
          body: {username: 'admin-test'}
        // @todo check user data
        }
      },
      {
        describe: 'user login by username and success',
        input: [{
          body: {
            user: 'guy',
            passw: '0987654321'
          }
        }],
        output: {
          status: 200,
          body: {username: 'guy'}
        // @todo check user data
        }
      },
      {
        describe: 'user login by email and success',
        input: [{
          body: {
            email: 'guy@email.com',
            passw: '0987654321'
          }
        }],
        output: {
          status: 200,
          body: {username: 'guy'}
        // @todo check user data
        }
      },
      {
        describe: 'try login without password',
        input: [{
          body: {
            user: 'no-pass',
            email: 'no-pass@email.com'
          }
        }],
        output: {
          status: 401
        }
      },
      {
        describe: 'try login without username and email',
        input: [{
          body: {
            password: 'only-pass-is-not-enough'
          }
        }],
        output: {
          status: 401
        }
      },
      {
        describe: 'non existing user try to login by username and fail',
        input: [{
          body: {
            user: 'bigfoot',
            passw: '0987654321'
          }
        }],
        output: {
          status: 401
        }
      },
      {
        describe: 'non existing user try to login by email and fail',
        input: [{
          body: {
            email: 'chupacabra@email.com',
            passw: '0987654321'
          }
        }],
        output: {
          status: 401
        }
      }
    ]
  }
})

tollo.add({
  'fs.exists': {
    describe: '',
    mode: tollo.mode.PROMISE,
    act: fs.exists,
    cases: [
      {
        input: ['/tmp/file'],
        output: true
      },
      {
        input: ['/tmp/none'],
        output: false
      },
      {
        input: ['/tmp'],
        output: false
      }
    ],
    arrange: async function (input, sandbox) {
      const fs = require('a-toolbox').fs
      return fs.touch('/tmp/file')
    },
    assert: tollo.assert.equal
  },
  'fs.touch': {
    describe: '',
    mode: tollo.mode.PROMISE,
    act: fs.touch,
    cases: [
      {
        input: ['/none'],
        throw: new Error('EACCES')
      },
      {
        input: ['/tmp/touch-me']
      }
    ],
    assert: async (result, input, output, sandbox) => {
      if (!await tollo.assert.equal(result, input, output, sandbox)) {
        return false
      }
      const fs = require('a-toolbox').fs
      return fs.exists(input[0])
    }
  },
  'fs.unlink': {
    describe: '',
    mode: tollo.mode.PROMISE,
    act: fs.unlink,
    cases: [
      {
        input: ['/tmp/file']
      },
      {
        input: ['/tmp/none', false],
        throw: new Error('EACCES')
      },
      {
        input: ['/tmp/none', true]
      }
    ],
    arrange: async function (input, sandbox) {
      const fs = require('a-toolbox').fs
      return fs.touch('/tmp/file')
    },
    assert: tollo.assert.equal
  }
})
*/

tollo.run()
