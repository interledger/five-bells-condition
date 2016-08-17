'use strict'

/**
 * @module types
 */

const Rsa = require('../crypto/rsa')
const pem = require('../util/pem')
const BaseSha256 = require('./base-sha256')
const Predictor = require('oer-utils/predictor')
const MissingDataError = require('../errors/missing-data-error')
const ValidationError = require('../errors/validation-error')

// Instantiate RSA signer with standard settings
const rsa = new Rsa()

/**
 * RSA-SHA-256: RSA signature condition using SHA-256.
 *
 * This RSA condition uses RSA-PSS padding with SHA-256. The salt length is set
 * equal the digest length of 32 bytes.
 *
 * The public exponent is fixed at 65537 and the public modulus must be between
 * 128 (1017 bits) and 512 bytes (4096 bits) long.
 *
 * RSA-SHA-256 is assigned the type ID 3. It relies on the SHA-256 and RSA-PSS
 * feature suites which corresponds to a feature bitmask of 0x11.
 */
class RsaSha256 extends BaseSha256 {
  constructor () {
    super()
    this.modulus = null
    this.signature = null
  }

  /**
   * Write static header fields.
   *
   * Some fields are common between the hash and the fulfillment payload. This
   * method writes those field to anything implementing the Writer interface.
   * It is used internally when generating the hash of the condition, when
   * generating the fulfillment payload and when calculating the maximum
   * fulfillment size.
   *
   * @param {Writer|Hasher|Predictor} Target for outputting the header.
   *
   * @private
   */
  writeCommonHeader (writer) {
    if (!this.modulus) {
      throw new MissingDataError('Requires a public modulus')
    }

    writer.writeVarOctetString(this.modulus)
  }

  /**
   * Set the public modulus.
   *
   * This is the modulus of the RSA public key. It has to be provided as a raw
   * buffer with no leading zeros.
   *
   * @param {Buffer} modulus Public RSA modulus
   */
  setPublicModulus (modulus) {
    if (!Buffer.isBuffer(modulus)) {
      throw new TypeError('Modulus must be a buffer, was: ' + modulus)
    }

    if (modulus[0] === 0) {
      throw new Error('Modulus may not contain leading zeros')
    }

    if (modulus.length > 512 || modulus.length < 128) {
      throw new Error('Modulus must be between 128 bytes (1017 bits) and ' +
        '512 bytes (4096 bits), was: ' + modulus.length + ' bytes')
    }

    this.modulus = modulus
  }

  /**
   * Set the signature manually.
   *
   * The signature must be a valid RSA-PSS siganture.
   *
   * @param {Buffer} signature RSA signature.
   */
  setSignature (signature) {
    if (!Buffer.isBuffer(signature)) {
      throw new TypeError('Signature must be a buffer, was: ' + signature)
    }

    this.signature = signature
  }

  /**
   * Sign the message.
   *
   * This method will take the provided message and create a signature using the
   * provided RSA private key. The resulting signature is stored in the
   * fulfillment.
   *
   * The key should be provided as a PEM encoded private key string.
   *
   * The message is padded using RSA-PSS with SHA256.
   *
   * @param {Buffer} message Message to sign.
   * @param {String} privateKey RSA private key
   */
  sign (message, privateKey) {
    if (!this.modulus) {
      this.setPublicModulus(pem.modulusFromPrivateKey(privateKey))
    }
    this.signature = rsa.sign(privateKey, message)
  }

  /**
   * Generate the contents of the condition hash.
   *
   * Writes the contents of the condition hash to a Hasher. Used internally by
   * `getCondition`.
   *
   * @param {Hasher} hasher Destination where the hash payload will be written.
   *
   * @private
   */
  writeHashPayload (hasher) {
    this.writeCommonHeader(hasher)
  }

  /**
   * Parse the payload of an RSA fulfillment.
   *
   * Read a fulfillment payload from a Reader and populate this object with that
   * fulfillment.
   *
   * @param {Reader} reader Source to read the fulfillment payload from.
   *
   * @private
   */
  parsePayload (reader) {
    this.setPublicModulus(reader.readVarOctetString())
    this.setSignature(reader.readVarOctetString())
  }

  /**
   * Generate the fulfillment payload.
   *
   * This writes the fulfillment payload to a Writer.
   *
   * @param {Writer} writer Subject for writing the fulfillment payload.
   *
   * @private
   */
  writePayload (writer) {
    if (!this.signature) {
      throw new MissingDataError('Requires a signature')
    }

    this.writeCommonHeader(writer)
    writer.writeVarOctetString(this.signature)
  }

  /**
   * Calculates the longest possible fulfillment length.
   *
   * The longest fulfillment for an RSA condition is the length of a fulfillment
   * where the dynamic message length equals its maximum length.
   *
   * @return {Number} Maximum length of the fulfillment payload
   *
   * @private
   */
  calculateMaxFulfillmentLength () {
    const predictor = new Predictor()

    if (!this.modulus) {
      throw new MissingDataError('Requires a public modulus')
    }

    // Calculate the length that the common header would have
    this.writeCommonHeader(predictor)

    // Signature
    predictor.writeVarOctetString(this.modulus)

    return predictor.getSize()
  }

  /**
   * Verify the signature of this RSA fulfillment.
   *
   * The signature of this RSA fulfillment is verified against the provided
   * message and the condition's public modulus.
   *
   * @param {Buffer} message Message to verify.
   * @return {Boolean} Whether this fulfillment is valid.
   */
  validate (message) {
    if (!Buffer.isBuffer(message)) {
      throw new Error('Message must be provided as a Buffer, was: ' + message)
    }

    const pssResult = rsa.verify(this.modulus, message, this.signature)

    if (!pssResult) {
      throw new ValidationError('Invalid RSA signature')
    }

    return true
  }
}

RsaSha256.TYPE_ID = 3
RsaSha256.FEATURE_BITMASK = 0x11

module.exports = RsaSha256
