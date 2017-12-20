const tollo = require('../index')

tollo.add({
  'missing describe': {
    mode: tollo.mode.SYNC,

    act: function () { },
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

tollo.add({
  'missing mode': {
    describe: 'void function',
    act: function () { },

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

tollo.add({
  'missing act': {
    describe: 'missing function',
    mode: tollo.mode.SYNC,
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

tollo.add({
  'missing cases': {
    describe: 'void function',
    mode: tollo.mode.SYNC,
    act: function () { }
  }
})

tollo.add({
  'missing anything': {}
})

tollo.run()
