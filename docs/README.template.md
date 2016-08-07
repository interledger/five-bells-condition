# Crypto Conditions

[![npm][npm-image]][npm-url] [![circle][circle-image]][circle-url] [![codecov][codecov-image]][codecov-url]

[npm-image]: https://img.shields.io/npm/v/five-bells-condition.svg?style=flat
[npm-url]: https://npmjs.org/package/five-bells-condition
[circle-image]: https://circleci.com/gh/interledger/five-bells-condition.svg?style=shield
[circle-url]: https://circleci.com/gh/interledger/five-bells-condition
[codecov-image]: https://codecov.io/gh/interledger/five-bells-condition/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/interledger/five-bells-condition

> Implementation of crypto-conditions

## Specification

Editor's Draft: [**draft-thomas-crypto-conditions-00**](https://tools.ietf.org/html/draft-thomas-crypto-conditions-00)

This specification is only a draft at this stage and has not been submitted.

## Table of Contents

@@TOC@@

## API Documentation

**[API Docs](https://interledger.org/five-bells-condition/jsdoc/)**

## Usage

### Validate a Condition

``` js
const cc = require('five-bells-condition')

// Check a condition for validity
const condition = 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0'
const validationResult = cc.validateCondition(condition)
// validationResult === true
```

This will ensure that the requested type, features and fulfillment length are
all accepted by the current implementation.

### Validate a Fulfillment (No Message)

``` js
const cc = require('five-bells-condition')

const condition = 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0'
const fulfillment = 'cf:0:'
const validationResult = cc.validateFulfillment(fulfillment, condition)
// validationResult === true
```

This validates the fulfillment and ensures that it matches the given condition.

### Get Condition from Fulfillment And Validate

``` js
const cc = require('five-bells-condition')

const fulfillment = 'cf:0:'
const condition = cc.fulfillmentToCondition(fulfillment)

// You could now look up this condition in your database etc.

const validationResult = cc.validateFulfillment(fulfillment, condition)
// validationResult === true
```

### Create a PREIMAGE-SHA-256 Condition (Hashlock)

``` js
const cc = require('five-bells-condition')

const myFulfillment = new cc.PreimageSha256()
myFulfillment.setPreimage(new Buffer(''))
console.log(myFulfillment.getConditionUri())
// prints 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0'
```

### Create a PREIMAGE-SHA-256 Fullfillment (Hashlock)

``` js
const cc = require('five-bells-condition')

const myFulfillment = new cc.PreimageSha256()
myFulfillment.setPreimage(new Buffer(''))
console.log(myFulfillment.serializeUri())
// prints 'cf:0:'
```

### Parse a Fulfillment

``` js
const cc = require('five-bells-condition')

const parsedFulfillment = cc.fromFulfillmentUri('cf:0:')
// parsedFulfillment instanceof cc.PreimageSha256 === true
// Note: Merely parsing a fulfillment DOES NOT validate it.

// Validate a fulfillment
parsedFulfillment.validate()
```

### Create an ED25519 Condition

``` js
const cc = require('five-bells-condition')

const ed25519Fulfillment = new cc.Ed25519()
ed25519Fulfillment.setPublicKey(new Buffer('ec172b93ad5e563bf4932c70e1245034c35467ef2efd4d64ebf819683467e2bf', 'hex'))
console.log(ed25519Fulfillment.getConditionUri())
// prints 'cc:4:20:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r8:96'
```

### Fulfill an ED25519 Condition

``` js
const cc = require('five-bells-condition')

const edPrivateKey = new Buffer('833fe62409237b9d62ec77587520911e9a759cec1d19755b7da901b96dca3d42', 'hex')

const ed25519Fulfillment = new cc.Ed25519()
// ed25519Fulfillment.setPublicKey(new Buffer('...'))
// ed25519Fulfillment.setSignature(new Buffer('...'))
// -- or --
ed25519Fulfillment.sign(new Buffer('Hello World! Conditions are here!'), edPrivateKey)
console.log(ed25519Fulfillment.getConditionUri())
// prints 'cc:4:20:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r8:96'
console.log(ed25519Fulfillment.serializeUri())
// prints 'cf:4:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r-2IpH62UMvjymLnEpIldvik_b_2hpo2t8Mze9fR6DHISpf6jzal6P0wD6p8uisHOyGpR1FISer26CdG28zHAcK'
```

### Verify a Fulfillment (with Message)

``` js
const cc = require('five-bells-condition')

const fulfillment = 'cf:4:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r-2IpH62UMvjymLnEpIldvik_b_2hpo2t8Mze9fR6DHISpf6jzal6P0wD6p8uisHOyGpR1FISer26CdG28zHAcK'
const condition = 'cc:4:20:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r8:96'
const message = new Buffer('Hello World! Conditions are here!')

const result = cc.validateFulfillment(fulfillment, condition, message)
// result === true
```

### Create a THRESHOLD-SHA-256 Condition
``` js
const cc = require('five-bells-condition')

const thresholdFulfillment = new cc.ThresholdSha256()
thresholdFulfillment.addSubconditionUri('cc:4:20:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r8:96')
thresholdFulfillment.addSubfulfillmentUri('cf:0:')
thresholdFulfillment.setThreshold(1) // defaults to subconditions.length
console.log(thresholdFulfillment.getConditionUri())
// prints 'cc:2:2b:mJUaGKCuF5n-3tfXM2U81VYtHbX-N8MP6kz8R-ASwNQ:146'
```

### Create a THRESHOLD-SHA-256 Fulfillment

``` js
const cc = require('five-bells-condition')

const thresholdFulfillment = new cc.ThresholdSha256()
thresholdFulfillment.addSubfulfillmentUri('cf:4:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r-2IpH62UMvjymLnEpIldvik_b_2hpo2t8Mze9fR6DHISpf6jzal6P0wD6p8uisHOyGpR1FISer26CdG28zHAcK')
thresholdFulfillment.addSubfulfillmentUri('cf:0:')
thresholdFulfillment.setThreshold(1) // defaults to subconditions.length
console.log(thresholdFulfillment.getConditionUri())
// prints 'cc:2:2b:mJUaGKCuF5n-3tfXM2U81VYtHbX-N8MP6kz8R-ASwNQ:146'
const thresholdFulfillmentUri = thresholdFulfillment.serializeUri()
// Note: If there are more than enough fulfilled subconditions, shorter
// fulfillments will be chosen over longer ones.
// thresholdFulfillmentUri.length === 77
console.log(thresholdFulfillmentUri)
// prints 'cf:2:AQEBAgEBAwAAAAABAQAnAAQBICDsFyuTrV5WO_STLHDhJFA0w1Rn7y79TWTr-BloNGfivwFg'
```

### Create a PREFIX-SHA-256 Condition

``` js
const cc = require('five-bells-condition')

const prefix = new cc.PrefixSha256()
prefix.setPrefix(new Buffer('2016:'))
prefix.setSubconditionUri('cc:4:20:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r8:96')
console.log(prefix.getConditionUri())
// prints 'cc:1:25:7myveZs3EaZMMuez-3kq6u69BDNYMYRMi_VF9yIuFLc:102'
```

### Create a PREFIX-SHA-256 Fulfillment

``` js
const cc = require('five-bells-condition')

const prefix = new cc.PrefixSha256()
prefix.setPrefix(new Buffer('Hello World! '))
prefix.setSubfulfillmentUri('cf:4:7Bcrk61eVjv0kyxw4SRQNMNUZ-8u_U1k6_gZaDRn4r-2IpH62UMvjymLnEpIldvik_b_2hpo2t8Mze9fR6DHISpf6jzal6P0wD6p8uisHOyGpR1FISer26CdG28zHAcK')
const fulfillmentUri = prefix.serializeUri()
console.log(fulfillmentUri)
// prints 'cf:1:DUhlbGxvIFdvcmxkISAABGDsFyuTrV5WO_STLHDhJFA0w1Rn7y79TWTr-BloNGfiv7YikfrZQy-PKYucSkiV2-KT9v_aGmja3wzN719HoMchKl_qPNqXo_TAPqny6Kwc7IalHUUhJ6vboJ0bbzMcBwo'

const conditionUri = prefix.getConditionUri()
const message = new Buffer('Conditions are here!')
cc.validateFulfillment(fulfillmentUri, conditionUri, message)
```

### Create an RSA-SHA-256 Condition

``` js
const cc = require('five-bells-condition')

const rsaFulfillment = new cc.RsaSha256()
rsaFulfillment.setPublicModulus(new Buffer('b30e7a938783babf836850ff49e14f87e3f92d5c46e33feca3e4f0b22358580b11765995f4b8eea7fb4712c2e1e316f7f775a953d232216a169d9a64ddc007120a400b37f2afc077b62fe304de74de6a119ec4076b529c4f6096b0baad4f533df0173b9b822fd85d65fa4befa92d8f524f69cbca0136bd80d095c169aec0e095', 'hex'))
console.log(rsaFulfillment.getConditionUri())
// prints 'cc:3:11:Bw-r77AGqSCL0huuMQYj3KW0Jh67Fpayeq9h_4UJctg:260'
```

### Create an RSA-SHA-256 Fulfillment

``` js
const cc = require('five-bells-condition')

const exampleMessage = new Buffer('Hello World! Conditions are here!')
const privateKey =
'-----BEGIN RSA PRIVATE KEY-----\n' +
'MIICXAIBAAKBgQCzDnqTh4O6v4NoUP9J4U+H4/ktXEbjP+yj5PCyI1hYCxF2WZX0\n' +
'uO6n+0cSwuHjFvf3dalT0jIhahadmmTdwAcSCkALN/KvwHe2L+ME3nTeahGexAdr\n' +
'UpxPYJawuq1PUz3wFzubgi/YXWX6S++pLY9ST2nLygE2vYDQlcFprsDglQIDAQAB\n' +
'AoGAB7Rjyd1W6b475U027vLm/S3uFumVk0m44QSE5uVmc8NmKPWJ4lHi0w+Y61G/\n' +
'booaeWdytcyho5ZxCq8OEAynQSkJiBNtzBg+xCGcO6GPOf+dFBYZFQsXiG/EbwrA\n' +
'pT0cv+AqiGzLIAh2WtNI6cr5/ZEMScNhMcQ4AZ1kRyUdpIECQQDbRtFz0dSMMvS/\n' +
'1KtDZxej9HqC5xOEuCDEZuLvk4bW4mC02OP/H/VV5qqclz0LIvMWK6TDtoFRpkvD\n' +
'UYiYoc85AkEA0QtH1zQlGGlliLcWoPeqjkbtf3ocmYy2exBSCwnOf87xV//k9pNC\n' +
'7jmoIzRgKVef8kQR/mXWszo3WbWMt0aAPQJBAMtoRD/GM/7h/fw9Uamy5lEnJsZr\n' +
'iMWi8HKAZp+LIJgRY1gfolA12yWWVknwWaYNA6ZbUfpjQE73jmxfI/FCmLECQBmF\n' +
'WAr06cZ2L5gmShPyyJbAIASdItq4LBsQHgQM+XHvENXeftR/m/87eMR7g3XopbVN\n' +
'DClTw4d0Bwfjuz8w0z0CQFG7RmgPqsTEGfojpRgLZnec87R6XhuUY5ZoGgpnx7r9\n' +
'/zGekAwjBZDKpc+H0jC14JjMzRRKeWVEpDU3k2cfBH0=\n' +
'-----END RSA PRIVATE KEY-----\n'

const rsaFulfillment = new cc.RsaSha256()
// rsaFulfillment.setPublicModulus(new Buffer('...'))
// rsaFulfillment.setSignature(new Buffer('...'))
// -- or --
rsaFulfillment.sign(exampleMessage, privateKey)
console.log(rsaFulfillment.serializeUri().length)
// prints '352'

// Verify RSA-SHA256 condition
const rsaFulfillmentUri = rsaFulfillment.serializeUri()
const rsaConditionUri = rsaFulfillment.getConditionUri()
cc.validateFulfillment(rsaFulfillmentUri, rsaConditionUri, exampleMessage)
```

### Advanced: Parse a Condition
``` js
const cc = require('five-bells-condition')

// Parse a condition
const condition = 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0'
const parsedCondition = cc.fromConditionUri(condition)
console.log(parsedCondition.constructor.name)
// prints 'Condition'

// Compile to a condition
console.log(parsedCondition.serializeUri())
// prints condition
```
### Advanced: Parse and Reserialize a THRESHOLD-SHA-256 Fulfillment

``` js
const cc = require('five-bells-condition')

const thresholdFulfillmentUri = 'cf:2:AQEBAgEBAwAAAAABAQAnAAQBICDsFyuTrV5WO_STLHDhJFA0w1Rn7y79TWTr-BloNGfivwFg'
const reparsedFulfillment = cc.fromFulfillmentUri(thresholdFulfillmentUri)

const reserializedFulfillment = reparsedFulfillment.serializeUri()
console.log(reserializedFulfillment)
// prints thresholdFulfillmentUri
```

### Advanced: Manually Create a Condition

``` js
const cc = require('five-bells-condition')

const myCondition = new cc.Condition()
myCondition.setTypeId(cc.PreimageSha256.TYPE_ID)
myCondition.setBitmask(cc.PreimageSha256.FEATURE_BITMASK)
myCondition.setHash(new Buffer('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'))
myCondition.setMaxFulfillmentLength(0)
console.log(myCondition.serializeUri())
// prints 'cc:0:3:47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU:0'
```
