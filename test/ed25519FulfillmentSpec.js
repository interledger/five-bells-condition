'use strict'

const assert = require('chai').assert
const crypto = require('crypto')
const cc = require('..')
require('./helpers/hooks')

describe('Ed25519', function () {
  testFromParams(
    {
      key: new Buffer(32).fill(0),
      message: new Buffer(0)
    },
    'cf:4:O2onvM62pC1io6jQKm8Nc2UyFXcd4kOmOsBIoYtZ2imPiVs8r-LJUGA50OKmY4JWgARnT-jSN3hQkuQNaq9IPk_GAWhwXzHxAVlhOM4hqjV8DTKgZPQj3D7kqjq_U_gD',
    'cc:4:20:O2onvM62pC1io6jQKm8Nc2UyFXcd4kOmOsBIoYtZ2ik:96'
  )

  testFromParams(
    {
      key: new Buffer(32).fill(0xff),
      message: new Buffer('616263', 'hex')
    },
    'cf:4:dqFZIESm5PURJlvKc6YE2QsFKdHfYCvjChmpJXZg0fWuxqtqkSKv8PfcuWZ_9hMTaJRzK254wm9bZzEB4mf-Litl-k1T2tR4oa2mTVD9Hf232Ukg3D4aVkpkexy6NWAB',
    'cc:4:20:dqFZIESm5PURJlvKc6YE2QsFKdHfYCvjChmpJXZg0fU:96'
  )

  testFromParams(
    {
      key: crypto.createHash('sha256').update('example').digest(),
      message: new Buffer(512).fill(0x21)
    },
    'cf:4:RCmTBlAEqh5MSPTdAVgZTAI0m8xmTNluQA6iaZGKjVGfTbzglso5Uo3i2O2WVP6abH1dz5k0H5DLylizTeL5UC0VSptUN4VCkhtbwx3B00pCeWNy1H78rq6OTXzok-EH',
    'cc:4:20:RCmTBlAEqh5MSPTdAVgZTAI0m8xmTNluQA6iaZGKjVE:96'
  )

  function testFromParams (params, fulfillmentUri, conditionUri) {
    describe('key ' + params.key.toString('hex'), function () {
      it('generates correct fulfillment uri', function () {
        const f = new cc.Ed25519()
        f.sign(params.message, params.key)
        const uri = f.serializeUri()

        assert.equal(uri, fulfillmentUri)
      })

      it('generates correct condition uri', function () {
        const f = new cc.Ed25519()
        f.sign(params.message, params.key)
        const uri = f.getConditionUri()

        assert.equal(uri, conditionUri)
      })

      it('parsing fulfillment generates condition', function () {
        const f = cc.fromFulfillmentUri(fulfillmentUri)
        const uri = f.getConditionUri()

        assert.equal(uri, conditionUri)
      })

      it('parsed condition matches generated condition', function () {
        const f = new cc.Ed25519()
        f.sign(params.message, params.key)
        const generatedCondition = f.getCondition()
        const parsedCondition = cc.fromConditionUri(conditionUri)

        assert.deepEqual(generatedCondition, parsedCondition)
      })

      it('validates the fulfillment', function () {
        const result = cc.validateFulfillment(fulfillmentUri, conditionUri, params.message)

        assert.equal(result, true)
      })
    })
  }
})
