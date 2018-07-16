# TODO

remove promises >0 use async/await

### BUG
in act, try/catch early call orchestration done - before assert

! default parallel exec

#### FUNCTION TYPES
- async - act, assert / callback
- async/await mode (promise mode alias?)
- event
- http
  - params in url es /user/:id
  - verbose
  - check cookie like header and body
- args: variable args f(...args)
- default values args
- use faker to auto-add cases and/or random cases

#### WIZARD
wizard mode for cases: random (faker?) input, ask for output

#### DOC
jsdoc
jsdoc -c jsdoc.json -t ./node_modules/ink-docstrap/template -R README.md index.js
doc/README
tester block examples
---
prepare
arrange
act
assert
tidy
done
*** case
---
sandbox is shared for each test: each test cases use the same sandbox (examples)
use global to share globally in free use (examples)
https://github.com/facebook/Docusaurus

#### MISC
orchestration / parallel run
? generate chained test: example login + get locked api
use to mock functions or http api

[why test code is so awful?](..medium)
