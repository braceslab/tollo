# tollo

- [Installing](#installing)
- [Getting Started](#getting-started)
- [Test block](#test-block)

---

# Installing

````bash
$ npm i tollo --save
$ npm i tap -g
````

# Getting Started

``tollo`` use ``tap`` as engine

# Test block

````js
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
````

### describe
block description, required  
type: ``string``  

### mode
declare block testing behavior, required  
type: ``tollo.mode``  
- ``tollo.mode.SYNC``
- ``tollo.mode.PROMISE``
- ``tollo.mode.CALLBACK``
- ``tollo.mode.EVENT``
- ``tollo.mode.HTTP``  

### arrange

### act
function to test, required  
type: ``function(*): *``

### assert
asserting controller; typically it's a prepared one or a custom function

params: 
- ``result`` result of ``act`` function;
it's the `return` of ``SYNC`` functions, the resolve of ``PROMISE`` functions, the args from ``CALLBACK`` (... EVENT, HTTP)
- ``input`` expected input from cases
- ``output`` expected output from cases
- ``sandbox`` the sandbox (see [sandbox](#sandbox)

type: ``function(result, input, output, sandbox): Promise<void>``
default: ``tollo.assert.equal``

prepared asserting controller:
- ``tollo.assert.equal`` check result is exactly output
- ``tollo.assert.mutation`` check result is exactly first input argument, see `array.pop` in [example/basic.js]([../example/basic.js])
- ``tollo.assert.callback`` ..
- ``tollo.assert.event`` ...
- ``tollo.assert.http`` ...

examples: 

### cases
  - describe
    case description, optional  
    type: ``string``  
    default: ``null``

  - input

  - output

### prepare

### done

### tidy

### disabled
disable block from testing  
type: ``boolean``  
default: ``false``

## sandbox
shared object between tests; it's not global

## wait (orchestration)

# tollo API

add
run
start
end
