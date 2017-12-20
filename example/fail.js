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
        output: -1
      },
      {
        input: [1, 5],
        output: -2
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
        output: [2]
      },
      {
        input: [[1, 2, 3]],
        output: [3, 2]
      }
    ]
  }
})

tollo.run()
