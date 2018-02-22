const tools = require('a-toolbox')
const fs = require('fs-extra')

const tollo = require('../index')

function sum (a, b) {
  return a + b
}

function pop (array) {
  array.pop()
}

// sync
tollo.add({
  'sum': {
    describe: 'sum two numbers',
    mode: tollo.mode.SYNC,

    act: sum,

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
      },
      // fail
      {
        input: [[4, 5, 6]],
        output: [4]
      }
    ]
  }
})

// async - Promise
tollo.add({
  'fs.chmod': {
    mode: tollo.mode.PROMISE,

    arrange: async (input, sandbox) => {
      await tools.fs.unlink('/tmp/chmod', true)
      await tools.fs.touch('/tmp/chmod', 0o666)
    },
    act: fs.chmod,

    cases: [
      {
        input: ['/tmp/chmod', 0o444]
      },
      {
        input: ['/var/path/none', 0o444],
        throw: new Error('ENOENT')
      }
    ]
  }
})

tollo.run()
