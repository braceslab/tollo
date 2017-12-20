const settings = {
  mode: {
    SYNC: 0,
    PROMISE: 1,
    CALLBACK: 2,
    EVENT: 3,
    HTTP: 4
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
