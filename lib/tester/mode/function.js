const sync = {
  arrange: function (test) {
    return async (input, sandbox) => {
      if (!test.arrange) {
        return
      }
      return test.arrange(input, sandbox)
    }
  },

  act: function (test) {
    return async (input) => {
      return test.act.apply(test.act, input)
    }
  },

  assert: function (test) {
    return async (result, input, output, sandbox) => {
      return test.assert(result, input, output, sandbox)
    }
  }
}

module.exports = sync
