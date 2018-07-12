const settings = {
  mode: {
    SYNC: 0,
    PROMISE: 1,
    AWAIT: 1,
    CALLBACK: 2,
    ASYNC: 3,
    EVENT: 4,
    HTTP: 5
  },
  tasks: {
    start: {
      name: 'tester-start'
    },
    end: {
      name: 'tester-end'
    }
  },
  log: {
    tag: 'tollo'
  }
}

module.exports = settings
