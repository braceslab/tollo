const log = require('log-segment')

log.set({
  levels: {
    '*': { color: 'white' },
    trace: { color: 'cyan', marker: 'trace' },
    info: { color: 'blue', marker: 'info' },
    success: { color: 'green', marker: 'success' },
    warning: { color: 'yellow', marker: 'warning' },
    error: { color: 'red', marker: 'error' },
    panic: { color: 'magenta', marker: 'panic' }
  },
  segments: { '*': { color: 'white' } },
  format: '[{marker}] {message}',
  enabled: { segments: '*', levels: ['trace', 'error', 'warning', 'panic'] }
})

module.exports = require('./lib/engine')
