# tollo

[![NPM Version](http://img.shields.io/npm/v/tollo.svg?style=flat)](https://www.npmjs.org/package/tollo)
[![NPM Downloads](https://img.shields.io/npm/dm/tollo.svg?style=flat)](https://www.npmjs.org/package/tollo)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

javascript testing library AAA schema

## Purpose

A tool to write declarative test unit  
[why test code is so awful?](..medium)

## Install

````bash
$ npm i tollo --save
$ npm i tap -g
````

### Quick start

in test/basic.js

````js
const tollo = require('tollo')

function sum (a, b) {
  return a + b
}

// sync
tester.add({
  'function sum': {
    describe: 'sum two numbers',
    mode: tester.mode.SYNC,

    act: sum,

    cases: [
      {
        describe: 'basic case',
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

// callback
...

// promise / async
...

// event
...

// http
...

tollo.run()
````

then

````bash
tap test/basic.js
````

## Documentation

See [documentation](./doc/README.md) for further informations.

## TODO

- [ ] PROMISE mode (doc, example, test)
- [ ] CALLBACK mode (engine, doc, example, test)
- [ ] HTTP mode (doc, example, test)
- [ ] use other testing engine (``mocha``, ``istanbul``, ``jasmine`` ...)

---

## License

The MIT License (MIT)

Copyright (c) 2017, [braces lab](https://braceslab.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
