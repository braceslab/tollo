const tester = require('../')

const global = {}

const samples = {
  url: 'http://localhost:6532',
  login: {
    email: 'simone@braceslab.com',
    username: 'simone-test',
    password: '01234567890'
  },
  register: {
    email: 'simone@gmail.com',
    name: 'Simone Sanfratello',
    username: 'simone-test',
    password: '01234567890'
  }
}

// @todo delete user

tester.start = function () {
  return new Promise((resolve, reject) => {
    global.server = new Server(samples.server)

    global.server.start()
      .then(resolve)
      .catch(reject)
  })
}

tester.end = function () {
  return new Promise((resolve, reject) => {
    global.server.stop()
      .then(resolve)
      .catch(reject)
  })
}

tester.add({
  'auth.main': {
    disabled: true,
    describe: 'auth.main',
    mode: tester.mode.HTTP,

    act: {
      url: samples.url + '/v1/auth',
      method: 'get'
    },

    cases: [
      {
        describe: 'call main, redirect',
        output: {
          status: 301,
          redirect: 'https://localhost:6532/home'
        }
      }
    ]
  }
})

tester.add({
  'auth.register-page': {
    disabled: true,
    describe: 'auth.register, show register page',
    mode: tester.mode.HTTP,

    act: {
      url: samples.url + '/v1/auth/register',
      method: 'get'
    },

    cases: [
      {
        describe: 'call register page, redirect',
        output: {
          status: 301,
          redirect: 'https://localhost:6532/register'
        }
      }
    ]
  }
})

tester.add({
  'auth.register-submit': {
    disabled: true,
    describe: 'auth.register, submit register',
    mode: tester.mode.HTTP,

    act: {
      url: samples.url + '/v1/auth/register',
      method: 'post'
    },

    cases: [
      {
        describe: 'submit register (missing email), fail',
        input: {
          body: {
            email: null,
            name: samples.register.name,
            username: samples.register.username,
            password: samples.register.password
          }
        },
        output: {
          status: 400,
          body: {
            equal: {
              error: 'INVALID_EMAIL'
            }
          }
        }
      },
      {
        describe: 'submit register, success',
        input: {
          body: {
            email: samples.register.email,
            name: samples.register.name,
            username: samples.register.username,
            password: samples.register.password
          }
        },
        output: {
          status: 200,
          body: {
            partial: {
              email: samples.register.email,
              name: samples.register.name,
              username: samples.register.username
            }
          }
        }
      }
    ]
  }
})

tester.add({
  'auth.login-page': {
    disabled: true,
    describe: 'auth.login, show login page',
    mode: tester.mode.HTTP,

    act: {
      url: samples.url + '/v1/auth/login',
      method: 'get'
    },

    cases: [
      {
        describe: 'call login page (form), redirect',
        output: {
          status: 301,
          redirect: 'https://localhost:6532/login'
        }
      }
    ]
  }
})

tester.add({
  'auth.login-submit': {
    describe: 'auth.login, submit login',
    mode: tester.mode.HTTP,
    // wait: ['auth.register-submit'],

    act: {
      url: samples.url + '/v1/auth/submit',
      method: 'post'
    },

    cases: [
      {
        describe: 'submit login (username & password) fail',
        input: {
          body: {
            login: samples.login.username,
            password: samples.login.password + 'wrong!'
          }
        },
        output: {
          status: 401
        }
      },
      {
        describe: 'submit login (username & password) success',
        input: {
          body: {
            login: samples.login.username,
            password: samples.login.password
          }
        },
        output: {
          status: 200,
          header: {
            partial: {
              'set-cookie': function (cookie) {
                try {
                  let _sid = cookie[0].split(';')[0].split('=')
                  if (_sid[0] === 'batch-sid') {
                    global.sid = _sid[1]
                    return true
                  }
                } catch (e) {}
                return false
              }
            }
          }
        }
      },
      {
        describe: 'submit login (email & password) success',
        input: {
          body: {
            login: samples.login.email,
            password: samples.login.password
          }
        },
        output: {
          status: 200
        }
      }
    ]
  }
})

tester.add({
  'auth.profile-page': {
    disabled: true,
    describe: 'auth.profile-page',
    mode: tester.mode.HTTP,
    wait: ['auth.login-submit'],

    act: {
      url: samples.url + '/v1/auth/profile',
      method: 'get'
    },

    cases: [
      {
        describe: 'call profile, redirect',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          }
        },
        output: {
          status: 301,
          redirect: 'https://localhost:6532/profile'
        }
      }
    ]
  }
})

tester.add({
  'auth.profile-settings': {
    describe: 'auth.profile-settings',
    mode: tester.mode.HTTP,
    wait: ['auth.login-submit'],

    act: {
      url: samples.url + '/v1/auth/settings/:field',
      method: 'post'
    },

    cases: [
      /*
      {
        describe: 'update settings (whole)',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: '*'
          },
          body: {
            data: {f1: 1, f2: 'a', f3: {k: 'a', a: []}}
          }
        },
        output: {
          status: 200
        }
      },
      {
        describe: 'update settings (subset)',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: 'set1.f1'
          },
          body: {
            data: ['pear', 'lemon', 'peach']
          }
        },
        output: {
          status: 200
        }
      },
      {
        describe: 'update settings (not-existing subset)',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: 'set0.p0'
          },
          body: {
            data: 'lorem ipsum'
          }
        },
        output: {
          status: 200
        }
      },
      {
        describe: 'set all settings',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: '*'
          },
          body: {
            data: {
              field0: 1,
              field1: 'a',
              field2: {a: 1, b: 2, c: [9, 8, 7]},
              field3: ['banana', 'peach', 'cherry']
            }
          }
        },
        output: {
          status: 200
        }
      },
      */
      {
        describe: 'set partial settings',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: 'field2.a'
          },
          body: {
            data: {
              k1: 'lorem ipsum!'
            }
          }
        },
        output: {
          status: 200
        }
      },
      {
        describe: 'set partial settings / not yet existing field',
        input: {
          cookies: {
            'batch-sid': () => {
              return global.sid
            }
          },
          url: {
            field: 'x.y.z'
          },
          body: {
            data: {
              artist: 'Iron Maiden',
              song: 'The loneliness of the long distance runner'
            }
          }
        },
        output: {
          status: 200
        }
      }
    ]
  }
})

tester.add({
  'auth.logout': {
    disabled: true,
    describe: 'auth.logout',
    mode: tester.mode.HTTP,
    // wait: profile...

    act: {
      url: samples.url + '/v1/logout',
      method: 'get'
    },

    cases: [
      {
        describe: 'call logout, redirect',
        output: {
          status: 301,
          redirect: 'https://localhost:6532/home'
        }
      }
    ]
  }
})

tester.run()
