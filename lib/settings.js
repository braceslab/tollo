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
      name: 'tollo-start'
    },
    end: {
      name: 'tollo-end'
    }
  },
  log: {
    tag: 'tollo'
  }
}

module.exports = settings
