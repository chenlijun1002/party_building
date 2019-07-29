var Long = ''
;(function (global, factory) {
  var image = ''
  global['Long'] = factory()
})(this, function () {
  // "use strict";

  Long = function (low, high, unsigned) {
    this.low = low | 0
    this.high = high | 0
    this.unsigned = !!unsigned
  }
  Long.prototype.__isLong__

  Object.defineProperty(Long.prototype, '__isLong__', {
    value: true,
    enumerable: false,
    configurable: false
  })

  function isLong(obj) {
    return (obj && obj['__isLong__']) === true
  }
  Long.isLong = isLong
  var INT_CACHE = {}
  var UINT_CACHE = {}

  function fromInt(value, unsigned) {
    var obj, cachedObj, cache
    if (unsigned) {
      value >>>= 0
      if ((cache = value >= 0 && value < 256)) {
        cachedObj = UINT_CACHE[value]
        if (cachedObj) return cachedObj
      }
      obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true)
      if (cache) UINT_CACHE[value] = obj
      return obj
    } else {
      value |= 0
      if ((cache = value >= -128 && value < 128)) {
        cachedObj = INT_CACHE[value]
        if (cachedObj) return cachedObj
      }
      obj = fromBits(value, value < 0 ? -1 : 0, false)
      if (cache) INT_CACHE[value] = obj
      return obj
    }
  }
  Long.fromInt = fromInt

  function fromNumber(value, unsigned) {
    if (isNaN(value) || !isFinite(value)) return unsigned ? UZERO : ZERO
    if (unsigned) {
      if (value < 0) return UZERO
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE
    }
    if (value < 0) return fromNumber(-value, unsigned).neg()
    return fromBits(
      value % TWO_PWR_32_DBL | 0,
      (value / TWO_PWR_32_DBL) | 0,
      unsigned
    )
  }
  Long.fromNumber = fromNumber

  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned)
  }
  Long.fromBits = fromBits
  var pow_dbl = Math.pow // Used 4 times (4*8 to 15+4)

  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string')
    if (
      str === 'NaN' ||
      str === 'Infinity' ||
      str === '+Infinity' ||
      str === '-Infinity'
    )
      return ZERO
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      ;(radix = unsigned), (unsigned = false)
    } else {
      unsigned = !!unsigned
    }
    radix = radix || 10
    if (radix < 2 || radix > 36) throw RangeError('radix')

    var p
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen')
    else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg()
    }
    var radixToPower = fromNumber(pow_dbl(radix, 8))

    var result = ZERO
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
        value = parseInt(str.substring(i, i + size), radix)
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size))
        result = result.mul(power).add(fromNumber(value))
      } else {
        result = result.mul(radixToPower)
        result = result.add(fromNumber(value))
      }
    }
    result.unsigned = unsigned
    return result
  }
  Long.fromString = fromString

  function fromValue(val) {
    if (val /* is compatible */ instanceof Long) return val
    if (typeof val === 'number') return fromNumber(val)
    if (typeof val === 'string') return fromString(val)
    // Throws for non-objects, converts non-instanceof Long:
    return fromBits(val.low, val.high, val.unsigned)
  }
  Long.fromValue = fromValue
  var TWO_PWR_16_DBL = 1 << 16
  var TWO_PWR_24_DBL = 1 << 24
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL)
  var ZERO = fromInt(0)
  Long.ZERO = ZERO
  var UZERO = fromInt(0, true)
  Long.UZERO = UZERO
  var ONE = fromInt(1)
  Long.ONE = ONE
  var UONE = fromInt(1, true)
  Long.UONE = UONE
  var NEG_ONE = fromInt(-1)
  Long.NEG_ONE = NEG_ONE
  var MAX_VALUE = fromBits(0xffffffff | 0, 0x7fffffff | 0, false)
  Long.MAX_VALUE = MAX_VALUE
  var MAX_UNSIGNED_VALUE = fromBits(0xffffffff | 0, 0xffffffff | 0, true)
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false)
  Long.MIN_VALUE = MIN_VALUE
  var LongPrototype = Long.prototype
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low
  }
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned)
      return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0)
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0)
  }

  LongPrototype.toString = function toString(radix) {
    radix = radix || 10
    if (radix < 2 || radix > 36) throw RangeError('radix')
    if (this.isZero()) return '0'
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
          div = this.div(radixLong),
          rem1 = div.mul(radixLong).sub(this)
        return div.toString(radix) + rem1.toInt().toString(radix)
      } else return '-' + this.neg().toString(radix)
    }
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
      rem = this
    var result = ''
    while (true) {
      var remDiv = rem.div(radixToPower),
        intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
        digits = intval.toString(radix)
      rem = remDiv
      if (rem.isZero()) return digits + result
      else {
        while (digits.length < 6) digits = '0' + digits
        result = '' + digits + result
      }
    }
  }
  LongPrototype.getHighBits = function getHighBits() {
    return this.high
  }
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0
  }
  LongPrototype.getLowBits = function getLowBits() {
    return this.low
  }
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0
  }
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative())
      // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs()
    var val = this.high != 0 ? this.high : this.low
    for (var bit = 31; bit > 0; bit--) if ((val & (1 << bit)) != 0) break
    return this.high != 0 ? bit + 33 : bit + 1
  }
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0
  }
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0
  }
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0
  }
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1
  }
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0
  }
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other)
    if (
      this.unsigned !== other.unsigned &&
      this.high >>> 31 === 1 &&
      other.high >>> 31 === 1
    )
      return false
    return this.high === other.high && this.low === other.low
  }
  LongPrototype.eq = LongPrototype.equals
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(/* validates */ other)
  }
  LongPrototype.neq = LongPrototype.notEquals

  /**
   * Tests if this Long's value is less than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(/* validates */ other) < 0
  }

  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.lt = LongPrototype.lessThan

  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(/* validates */ other) <= 0
  }

  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.lte = LongPrototype.lessThanOrEqual

  /**
   * Tests if this Long's value is greater than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(/* validates */ other) > 0
  }

  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.gt = LongPrototype.greaterThan

  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(/* validates */ other) >= 0
  }

  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  LongPrototype.gte = LongPrototype.greaterThanOrEqual

  /**
   * Compares this Long's value with the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other)
    if (this.eq(other)) return 0
    var thisNeg = this.isNegative(),
      otherNeg = other.isNegative()
    if (thisNeg && !otherNeg) return -1
    if (!thisNeg && otherNeg) return 1
    // At this point the sign bits are the same
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1
    // Both are positive if at least one is unsigned
    return other.high >>> 0 > this.high >>> 0 ||
      (other.high === this.high && other.low >>> 0 > this.low >>> 0)
      ? -1
      : 1
  }

  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  LongPrototype.comp = LongPrototype.compare

  /**
   * Negates this Long's value.
   * @returns {!Long} Negated Long
   */
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE
    return this.not().add(ONE)
  }

  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  LongPrototype.neg = LongPrototype.negate

  /**
   * Returns the sum of this and the specified Long.
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend)

    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high >>> 16
    var a32 = this.high & 0xffff
    var a16 = this.low >>> 16
    var a00 = this.low & 0xffff

    var b48 = addend.high >>> 16
    var b32 = addend.high & 0xffff
    var b16 = addend.low >>> 16
    var b00 = addend.low & 0xffff

    var c48 = 0,
      c32 = 0,
      c16 = 0,
      c00 = 0
    c00 += a00 + b00
    c16 += c00 >>> 16
    c00 &= 0xffff
    c16 += a16 + b16
    c32 += c16 >>> 16
    c16 &= 0xffff
    c32 += a32 + b32
    c48 += c32 >>> 16
    c32 &= 0xffff
    c48 += a48 + b48
    c48 &= 0xffff
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned)
  }

  /**
   * Returns the difference of this and the specified Long.
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend)
    return this.add(subtrahend.neg())
  }

  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  LongPrototype.sub = LongPrototype.subtract

  /**
   * Returns the product of this and the specified Long.
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return ZERO
    if (!isLong(multiplier)) multiplier = fromValue(multiplier)
    if (multiplier.isZero()) return ZERO
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO

    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg())
      else
        return this.neg()
          .mul(multiplier)
          .neg()
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg()

    // If both longs are small, use float multiplication
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
      return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned)

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high >>> 16
    var a32 = this.high & 0xffff
    var a16 = this.low >>> 16
    var a00 = this.low & 0xffff

    var b48 = multiplier.high >>> 16
    var b32 = multiplier.high & 0xffff
    var b16 = multiplier.low >>> 16
    var b00 = multiplier.low & 0xffff

    var c48 = 0,
      c32 = 0,
      c16 = 0,
      c00 = 0
    c00 += a00 * b00
    c16 += c00 >>> 16
    c00 &= 0xffff
    c16 += a16 * b00
    c32 += c16 >>> 16
    c16 &= 0xffff
    c16 += a00 * b16
    c32 += c16 >>> 16
    c16 &= 0xffff
    c32 += a32 * b00
    c48 += c32 >>> 16
    c32 &= 0xffff
    c32 += a16 * b16
    c48 += c32 >>> 16
    c32 &= 0xffff
    c32 += a00 * b32
    c48 += c32 >>> 16
    c32 &= 0xffff
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48
    c48 &= 0xffff
    return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned)
  }

  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  LongPrototype.mul = LongPrototype.multiply

  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor)
    if (divisor.isZero()) throw Error('division by zero')
    if (this.isZero()) return this.unsigned ? UZERO : ZERO
    var approx, rem, res
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE
        // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE
        else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1)
          approx = halfThis.div(divisor).shl(1)
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE
          } else {
            rem = this.sub(divisor.mul(approx))
            res = approx.add(rem.div(divisor))
            return res
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg())
        return this.neg()
          .div(divisor)
          .neg()
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg()
      res = ZERO
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned()
      if (divisor.gt(this)) return UZERO
      if (divisor.gt(this.shru(1)))
        // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE
      res = UZERO
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    rem = this
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()))

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
        delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
        // Decrease the approximation until it is smaller than the remainder.  Note
        // that if it is too large, the product overflows and is negative.
        approxRes = fromNumber(approx),
        approxRem = approxRes.mul(divisor)
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta
        approxRes = fromNumber(approx, this.unsigned)
        approxRem = approxRes.mul(divisor)
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) approxRes = ONE

      res = res.add(approxRes)
      rem = rem.sub(approxRem)
    }
    return res
  }

  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  LongPrototype.div = LongPrototype.divide

  /**
   * Returns this Long modulo the specified.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor)
    return this.sub(this.div(divisor).mul(divisor))
  }

  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  LongPrototype.mod = LongPrototype.modulo

  /**
   * Returns the bitwise NOT of this Long.
   * @returns {!Long}
   */
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned)
  }

  /**
   * Returns the bitwise AND of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other)
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned)
  }

  /**
   * Returns the bitwise OR of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other)
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned)
  }

  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other)
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned)
  }

  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt()
    if ((numBits &= 63) === 0) return this
    else if (numBits < 32)
      return fromBits(
        this.low << numBits,
        (this.high << numBits) | (this.low >>> (32 - numBits)),
        this.unsigned
      )
    else return fromBits(0, this.low << (numBits - 32), this.unsigned)
  }

  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shl = LongPrototype.shiftLeft

  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt()
    if ((numBits &= 63) === 0) return this
    else if (numBits < 32)
      return fromBits(
        (this.low >>> numBits) | (this.high << (32 - numBits)),
        this.high >> numBits,
        this.unsigned
      )
    else
      return fromBits(
        this.high >> (numBits - 32),
        this.high >= 0 ? 0 : -1,
        this.unsigned
      )
  }

  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shr = LongPrototype.shiftRight

  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt()
    numBits &= 63
    if (numBits === 0) return this
    else {
      var high = this.high
      if (numBits < 32) {
        var low = this.low
        return fromBits(
          (low >>> numBits) | (high << (32 - numBits)),
          high >>> numBits,
          this.unsigned
        )
      } else if (numBits === 32) return fromBits(high, 0, this.unsigned)
      else return fromBits(high >>> (numBits - 32), 0, this.unsigned)
    }
  }

  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  LongPrototype.shru = LongPrototype.shiftRightUnsigned

  /**
   * Converts this Long to signed.
   * @returns {!Long} Signed long
   */
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this
    return fromBits(this.low, this.high, false)
  }

  /**
   * Converts this Long to unsigned.
   * @returns {!Long} Unsigned long
   */
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this
    return fromBits(this.low, this.high, true)
  }

  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {!Array.<number>} Byte representation
   */
  LongPrototype.toBytes = function (le) {
    return le ? this.toBytesLE() : this.toBytesBE()
  }

  /**
   * Converts this Long to its little endian byte representation.
   * @returns {!Array.<number>} Little endian byte representation
   */
  LongPrototype.toBytesLE = function () {
    var hi = this.high,
      lo = this.low
    return [
      lo & 0xff,
      (lo >>> 8) & 0xff,
      (lo >>> 16) & 0xff,
      (lo >>> 24) & 0xff,
      hi & 0xff,
      (hi >>> 8) & 0xff,
      (hi >>> 16) & 0xff,
      (hi >>> 24) & 0xff
    ]
  }

  /**
   * Converts this Long to its big endian byte representation.
   * @returns {!Array.<number>} Big endian byte representation
   */
  LongPrototype.toBytesBE = function () {
    var hi = this.high,
      lo = this.low
    return [
      (hi >>> 24) & 0xff,
      (hi >>> 16) & 0xff,
      (hi >>> 8) & 0xff,
      hi & 0xff,
      (lo >>> 24) & 0xff,
      (lo >>> 16) & 0xff,
      (lo >>> 8) & 0xff,
      lo & 0xff
    ]
  }
  return Long
})

/* webim javascript SDK
 * VER 1.7.0
 */

/* webim API definitions
 */
var webim = {
  // namespace object webim

  /* function init
     *   sdk登录
     * params:
     *   loginInfo      - Object, 登录身份相关参数集合，详见下面
     *   {
     *     sdkAppID     - String, 用户标识接入SDK的应用ID，必填
     *     identifier   - String, 用户帐号,必须是字符串类型，必填
     *     accountType  - int, 账号类型，必填
     *     identifierNick   - String, 用户昵称，选填
     *     userSig      - String, 鉴权Token，必须是字符串类型，必填
     *   }
     *   listeners      - Object, 事件回调函数集合, 详见下面
     *   {
     *     onConnNotify - function(connInfo), 用于收到连接状态相关通知的回调函数,目前未使用
     *     jsonpCallback -function(rspData),//IE9(含)以下浏览器用到的jsonp回调函数
     *     onMsgNotify  - function(newMsgList), 用于收到消息通知的回调函数,
     *      newMsgList为新消息数组，格式为[Msg对象]
     *      使用方有两种处理回调: 1)处理newMsgList中的增量消息,2)直接访问webim.MsgStore获取最新的消息
     *     onGroupInfoChangeNotify  - function(groupInfo), 用于监听群组资料变更的回调函数,
     *          groupInfo为新的群组资料信息
     *     onGroupSystemNotifys - Object, 用于监听（多终端同步）群系统消息的回调函数对象
     *
     *   }
     *   options        - Object, 其它选项, 目前未使用
     * return:
     *   (无)
     */
  login: function (loginInfo, listeners, options) {},

  /* function syncMsgs
     *   拉取最新C2C消息
     *   一般不需要使用方直接调用, SDK底层会自动同步最新消息并通知使用方, 一种有用的调用场景是用户手动触发刷新消息
     * params:
     *   cbOk   - function(msgList)类型, 当同步消息成功时的回调函数, msgList为新消息数组，格式为[Msg对象],
     *            如果此参数为null或undefined则同步消息成功后会像自动同步那样回调cbNotify
     *   cbErr  - function(err)类型, 当同步消息失败时的回调函数, err为错误对象
     * return:
     *   (无)
     */
  syncMsgs: function (cbOk, cbErr) {},

  /* function getC2CHistoryMsgs
     * 拉取C2C漫游消息
     * params:
     *   options    - 请求参数
     *   cbOk   - function(msgList)类型, 成功时的回调函数, msgList为消息数组，格式为[Msg对象],
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getC2CHistoryMsgs: function (options, cbOk, cbErr) {},

  /* function syncGroupMsgs
     * 拉取群漫游消息
     * params:
     *   options    - 请求参数
     *   cbOk   - function(msgList)类型, 成功时的回调函数, msgList为消息数组，格式为[Msg对象],
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  syncGroupMsgs: function (options, cbOk, cbErr) {},

  /* function sendMsg
     *   发送一条消息
     * params:
     *   msg    - webim.Msg类型, 要发送的消息对象
     *   cbOk   - function()类型, 当发送消息成功时的回调函数
     *   cbErr  - function(err)类型, 当发送消息失败时的回调函数, err为错误对象
     * return:
     *   (无)
     */
  sendMsg: function (msg, cbOk, cbErr) {},

  /* function logout
     *   sdk登出
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  logout: function (cbOk, cbErr) {},

  /* function setAutoRead
     * 设置会话自动已读上报标志
     * params:
     *   selSess    - webim.Session类型, 当前会话
     *   isOn   - boolean, 将selSess的自动已读消息标志改为isOn，同时是否上报当前会话已读消息
     *   isResetAll - boolean，是否重置所有会话的自动已读标志
     * return:
     *   (无)
     */
  setAutoRead: function (selSess, isOn, isResetAll) {},

  /* function getProfilePortrait
     *   拉取资料（搜索用户）
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getProfilePortrait: function (options, cbOk, cbErr) {},

  /* function setProfilePortrait
     *   设置个人资料
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  setProfilePortrait: function (options, cbOk, cbErr) {},

  /* function applyAddFriend
     *   申请添加好友
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  applyAddFriend: function (options, cbOk, cbErr) {},

  /* function getPendency
     *   拉取好友申请
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getPendency: function (options, cbOk, cbErr) {},

  /* function deletePendency
     *   删除好友申请
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  deletePendency: function (options, cbOk, cbErr) {},

  /* function responseFriend
     *   响应好友申请
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  responseFriend: function (options, cbOk, cbErr) {},

  /* function getAllFriend
     *   拉取我的好友
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getAllFriend: function (options, cbOk, cbErr) {},

  /* function deleteFriend
     *   删除好友
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  deleteFriend: function (options, cbOk, cbErr) {},

  /* function addBlackList
     *   增加黑名单
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  addBlackList: function (options, cbOk, cbErr) {},

  /* function getBlackList
     *   删除黑名单
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getBlackList: function (options, cbOk, cbErr) {},

  /* function deleteBlackList
     *   我的黑名单
     * params:
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  deleteBlackList: function (options, cbOk, cbErr) {},

  /* function uploadPic
     *   上传图片
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  uploadPic: function (options, cbOk, cbErr) {},

  /* function createGroup
     *   创建群
     * params:
     *   options    - 请求参数，���见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  createGroup: function (options, cbOk, cbErr) {},

  /* function applyJoinGroup
     *   申请加群
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  applyJoinGroup: function (options, cbOk, cbErr) {},

  /* function handleApplyJoinGroup
     *   处理申请加群(同意或拒绝)
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  handleApplyJoinGroup: function (options, cbOk, cbErr) {},

  /* function deleteApplyJoinGroupPendency
     *   删除加群申请
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  deleteApplyJoinGroupPendency: function (options, cbOk, cbErr) {},

  /* function quitGroup
     *  主动退群
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  quitGroup: function (options, cbOk, cbErr) {},

  /* function getGroupPublicInfo
     *   读取群公开资料-高级接口
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getGroupPublicInfo: function (options, cbOk, cbErr) {},

  /* function getGroupInfo
     *   读取群详细资料-高级接口
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getGroupInfo: function (options, cbOk, cbErr) {},

  /* function modifyGroupBaseInfo
     *   修改群基本资料
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  modifyGroupBaseInfo: function (options, cbOk, cbErr) {},

  /* function destroyGroup
     *  解散群
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  destroyGroup: function (options, cbOk, cbErr) {},

  /* function getJoinedGroupListHigh
     *   获取我的群组-高级接口
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getJoinedGroupListHigh: function (options, cbOk, cbErr) {},

  /* function getGroupMemberInfo
     *   获取群组成员列表
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getGroupMemberInfo: function (options, cbOk, cbErr) {},

  /* function addGroupMember
     *   邀请好友加群
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  addGroupMember: function (options, cbOk, cbErr) {},

  /* function modifyGroupMember
     *   修改群成员资料（角色或者群消息提类型示）
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  modifyGroupMember: function (options, cbOk, cbErr) {},

  /* function forbidSendMsg
     *   设置群成员禁言时间
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  forbidSendMsg: function (options, cbOk, cbErr) {},

  /* function deleteGroupMember
     *   删除群成员
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  deleteGroupMember: function (options, cbOk, cbErr) {},

  /* function getPendencyGroup
     *   获取群组未决列表
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getPendencyGroup: function (options, cbOk, cbErr) {},

  /* function getPendencyReport
     *   好友未决已读上报
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getPendencyReport: function (options, cbOk, cbErr) {},

  /* function getPendencyGroupRead
     *   群组未决已读上报
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  getPendencyGroupRead: function (options, cbOk, cbErr) {},

  /* function sendCustomGroupNotify
     *   发送自定义群通知
     * params:
     *   options    - 请求参数，详见api文档
     *   cbOk   - function()类型, 成功时回调函数
     *   cbErr  - function(err)类型, 失败时回调函数, err为错误对象
     * return:
     *   (无)
     */
  sendCustomGroupNotify: function (options, cbOk, cbErr) {},

  /* class webim.Msg
     *   一条消息的描述类, 消息发送、接收的API中都会涉及此类型的对象
     * properties:
     *   sess   - Session object-ref, 消息所属的会话(e.g:我与好友A的C2C会话，我与群组G的GROUP会话)
     *   isSend - Boolean, true表示是我发出消息, false表示是发给我的消息)
     *   seq    - Integer, 消息序列号, 用于判断消息是否同一条
     *   random - Integer, 消息随机数,用于判断消息是否同一条
     *   time   - Integer, 消息时间戳, 为unix timestamp
     *   fromAccount -String,  消息发送者帐号
     *   subType -Integer,  消息子类型，c2c消息时，0-表示普通消息；群消息时，0-普通消息，1-点赞消息，2-提示消息
     *   fromAccountNick -String,  消息发送者昵称
     *   elems  - Array of webim.Msg.Elem, 描述消息内容的元素列表
     * constructor:
     *   Msg(sess, isSend, seq,random time,fromAccount) - 构造函数, 参数定义同上面properties中定义
     * methods:
     *   addText(text)  - 向elems中添加一个TEXT元素
     *   addFace(face)  - 向elems中添加一个FACE元素
     *   toHtml()       - 转成可展示的html String
     *addFace
     * sub-class webim.Msg.Elem
     *   消息中一个组成元素的描述类, 一条消息的内容被抽象描述为N个元素的有序列表
     * properties:
     *   type   - 元素类型, 目前有TEXT(文本)、FACE(表情)、IMAGE(图片)等
     *   content- 元素内容体, 当TEXT时为String, 当PIC时为UrlString
     * constructor:
     *   Elem(type, content) - 构造函数, 参数定义同上面properties中定义
     *
     * sub-class webim.Msg.Elem.TextElem
     *   文本
     * properties:
     *   text  - String 内容
     * constructor:
     *   TextElem(text) - 构造函数, 参数定义同上面properties中定义
     *
     * sub-class webim.Msg.Elem.FaceElem
     *   表情
     * properties:
     *   index  - Integer 表情索引, 用户自定义
     *   data   - String 额外数据，用户自定义
     * constructor:
     *   FaceElem(index,data) - 构造函数, 参数定义同上面properties中定义
     *
     *
     */
  Msg: function (
    sess,
    isSend,
    seq,
    random,
    time,
    fromAccount,
    subType,
    fromAccountNick
  ) {
    /*Class constructor*/
  },

  /* singleton object MsgStore
     * webim.MsgStore是消息数据的Model对象(参考MVC概念), 它提供接口访问当前存储的会话和消息数据
     * 下面说明下会话数据类型: Session
     *
     * class Session
     *   一个Session对象描述一个会话，会话可简单理解为最近会话列表的一个条目，它由两个字段唯一标识:
     *     type - String, 会话类型(如"C2C", "GROUP", ...)
     *     id   - String, 会话ID(如C2C类型中为对方帐号,"C2C"时为好友ID,"GROUP"时为群ID)
     * properties:
     *   (Session对象未对外暴露任何属性字段, 所有访问通过下面的getter方法进行)
     * methods:
     *   type()     - String, 返回会话类型,"C2C"表示与好友私聊，"GROUP"表示群聊
     *   id()       - String, 返回会话ID
     *   name()     - String, 返回会话标题(如C2C类型中为对方的昵称,暂不支持)
     *   icon()     - String, 返回会话图标(对C2C类型中为对方的头像URL，暂不支持)
     *   unread()           - Integer, 返回会话未读条数
     *   time()     - Integer, 返回会话最后活跃时间, 为unix timestamp
     *   curMaxMsgSeq() - Integer, 返回会话最大消息序列号
     *   msgCount() - Integer, 返回会话中所有消息条数
     *   msg(index) - webim.Msg, 返回会话中第index条消息
     */
  MsgStore: {
    /* function sessMap
         *   获取所有会话
         * return:
         *   所有会话对象
         */
    sessMap: function () {
      return {
        /*Object*/
      }
    },
    /* function sessCount
         *   获取当前会话的个数
         * return:
         *   Integer, 会话个数
         */
    sessCount: function () {
      return 0
    },

    /* function sessByTypeId
         *   根据会话类型和会话ID取得相应会话
         * params:
         *   type   - String, 会话类型(如"C2C", "GROUP", ...)
         *   id     - String, 会话ID(如对方ID)
         * return:
         *   Session, 会话对象(说明见上面)
         */
    sessByTypeId: function (type, id) {
      return {
        /*Session Object*/
      }
    },
    /* function delSessByTypeId
         *   根据会话类型和会话ID删除相应会话
         * params:
         *   type   - String, 会话类型(如"C2C", "GROUP", ...)
         *   id     - String, 会话ID(如对方ID)
         * return:
         *   Boolean, 布尔类型
         */
    delSessByTypeId: function (type, id) {
      return true
    },

    /* function resetCookieAndSyncFlag
         *   重置上一次读取新c2c消息Cookie和是否继续拉取标记
         * return:
         *
         */
    resetCookieAndSyncFlag: function () {},

    downloadMap: {}
  }
}

/* webim API implementation
 */
;(function (webim) {
  //sdk版本
  var SDK = {
    VERSION: '1.7.0', //sdk版本号
    APPID: '537048168', //web im sdk 版本 APPID
    PLAATFORM: '10' //发送请求时判断其是来自web端的请求
  }

  //是否启用正式环境，默认启用
  var isAccessFormaEnvironment = true
  // var isAccessFormaEnvironment = false;

  //后台接口主机
  var SRV_HOST = {
    FORMAL: {
      COMMON: 'https://webim.tim.qq.com',
      PIC: 'https://pic.tim.qq.com'
    },
    TEST: {
      COMMON: 'https://test.tim.qq.com',
      PIC: 'https://pic.tim.qq.com'
    }
  }

  //浏览器版本信息
  var BROWSER_INFO = {}
  //是否为ie9（含）以下
  var lowerBR = false

  //服务名称
  var SRV_NAME = {
    OPEN_IM: 'openim', //私聊（拉取未读c2c消息，长轮询，c2c消息已读上报等）服务名
    GROUP: 'group_open_http_svc', //群组管理（拉取群消息，创建群，群成员管理，群消息已读上报等）服务名
    FRIEND: 'sns', //关系链管理（好友管理，黑名单管理等）服务名
    PROFILE: 'profile', //资料管理（查询，设置个人资料等）服务名
    RECENT_CONTACT: 'recentcontact', //最近联系人服务名
    PIC: 'openpic', //图片（或文件）服务名
    BIG_GROUP: 'group_open_http_noauth_svc', //直播大群 群组管理（申请加大群）服务名
    BIG_GROUP_LONG_POLLING: 'group_open_long_polling_http_noauth_svc', //直播大群 长轮询（拉取消息等）服务名
    IM_OPEN_STAT: 'imopenstat', //质量上报，统计接口错误率
    DEL_CHAT: 'recentcontact' //删除会话
  }

  //不同服务对应的版本号
  var SRV_NAME_VER = {
    openim: 'v4',
    group_open_http_svc: 'v4',
    sns: 'v4',
    profile: 'v4',
    recentcontact: 'v4',
    openpic: 'v4',
    group_open_http_noauth_svc: 'v1',
    group_open_long_polling_http_noauth_svc: 'v1',
    imopenstat: 'v4',
    recentcontact: 'v4'
  }

  //不同的命令名对应的上报类型ID，用于接口质量上报
  var CMD_EVENT_ID_MAP = {
    login: 1, //登录
    pic_up: 3, //上传图片
    apply_join_group: 9, //申请加入群组
    create_group: 10, //创建群组
    longpolling: 18, //普通长轮询
    send_group_msg: 19, //群聊
    sendmsg: 20 //私聊
  }

  //聊天类型
  var SESSION_TYPE = {
    C2C: 'C2C', //私聊
    GROUP: 'GROUP' //群聊
  }

  //最近联系人类型
  var RECENT_CONTACT_TYPE = {
    C2C: 1, //好友
    GROUP: 2 //群
  }

  //消息最大长度（字节）
  var MSG_MAX_LENGTH = {
    C2C: 12000, //私聊消息
    GROUP: 8898 //群聊
  }

  //后台接口返回类型
  var ACTION_STATUS = {
    OK: 'OK', //成功
    FAIL: 'FAIL' //失败
  }

  var ERROR_CODE_CUSTOM = 99999 //自定义后台接口返回错误码

  //消息元素类型
  var MSG_ELEMENT_TYPE = {
    TEXT: 'TIMTextElem', //文本
    FACE: 'TIMFaceElem', //表情
    IMAGE: 'TIMImageElem', //图片
    CUSTOM: 'TIMCustomElem', //自定义
    SOUND: 'TIMSoundElem', //语音,只支持显示
    FILE: 'TIMFileElem', //文件,只支持显示
    LOCATION: 'TIMLocationElem', //地理位置
    GROUP_TIP: 'TIMGroupTipElem' //群提示消息,只支持显示
  }

  //图片类型
  var IMAGE_TYPE = {
    ORIGIN: 1, //原图
    LARGE: 2, //缩略大图
    SMALL: 3 //缩略小图
  }

  //图片格式
  var IMAGE_FORMAT = {
    JPG: 0x1,
    JPEG: 0x1,
    GIF: 0x2,
    PNG: 0x3,
    BMP: 0x4,
    UNKNOWN: 0xff
  }

  //上传资源包类型
  var UPLOAD_RES_PKG_FLAG = {
    RAW_DATA: 0, //原始数据
    BASE64_DATA: 1 //base64编码数据
  }

  //下载文件配置
  var DOWNLOAD_FILE = {
    BUSSINESS_ID: '10001', //下载文件业务ID
    AUTH_KEY: '617574686b6579', //下载文件authkey
    SERVER_IP: '182.140.186.147' //下载文件服务器IP
  }

  //下载文件类型
  var DOWNLOAD_FILE_TYPE = {
    SOUND: 2106, //语音
    FILE: 2107 //普通文件
  }

  //上传资源类型
  var UPLOAD_RES_TYPE = {
    IMAGE: 1, //图片
    FILE: 2, //文件
    SHORT_VIDEO: 3, //短视频
    SOUND: 4 //语音，PTT
  }

  //版本号，用于上传图片或文件接口
  var VERSION_INFO = {
    APP_VERSION: '2.1', //应用版本号
    SERVER_VERSION: 1 //服务端版本号
  }

  //长轮询消息类型
  var LONG_POLLINNG_EVENT_TYPE = {
    C2C: 1, //新的c2c消息通知
    GROUP_COMMON: 3, //新的群普通消息
    GROUP_TIP: 4, //新的群提示消息
    GROUP_SYSTEM: 5, //新的群系统消息
    GROUP_TIP2: 6, //新的群提示消息2
    FRIEND_NOTICE: 7, //好友系统通知
    PROFILE_NOTICE: 8, //资料系统通知
    C2C_COMMON: 9, //新的C2C消息
    C2C_EVENT: 10
  }

  //c2c消息子类型
  var C2C_MSG_SUB_TYPE = {
    COMMON: 0 //普通消息
  }
  //c2c消息子类型
  var C2C_EVENT_SUB_TYPE = {
    READED: 92, //已读消息同步
    KICKEDOUT: 96
  }

  //群消息子类型
  var GROUP_MSG_SUB_TYPE = {
    COMMON: 0, //普通消息
    LOVEMSG: 1, //点赞消息
    TIP: 2, //提示消息
    REDPACKET: 3 //红包消息
  }

  //群消息优先级类型
  var GROUP_MSG_PRIORITY_TYPE = {
    REDPACKET: 1, //红包消息
    COMMON: 2, //普通消息
    LOVEMSG: 3 //点赞消息
  }

  //群提示消息类型
  var GROUP_TIP_TYPE = {
    JOIN: 1, //加入群组
    QUIT: 2, //退出群组
    KICK: 3, //被踢出群组
    SET_ADMIN: 4, //被设置为管理员
    CANCEL_ADMIN: 5, //被取消管理员
    MODIFY_GROUP_INFO: 6, //修改群资料
    MODIFY_MEMBER_INFO: 7 //修改群成员信息
  }

  //群提示消息-群资料变更类型
  var GROUP_TIP_MODIFY_GROUP_INFO_TYPE = {
    FACE_URL: 1, //修改群头像URL
    NAME: 2, //修改群名称
    OWNER: 3, //修改群主
    NOTIFICATION: 4, //修改群公告
    INTRODUCTION: 5 //修改群简介
  }

  //群系统消息类型
  var GROUP_SYSTEM_TYPE = {
    JOIN_GROUP_REQUEST: 1, //申请加群请求（只有管理员会收到）
    JOIN_GROUP_ACCEPT: 2, //申请加群被同意（只有申请人能够收到）
    JOIN_GROUP_REFUSE: 3, //申请加群被拒绝（只有申请人能够收到）
    KICK: 4, //被管理员踢出群(只有被踢者接收到)
    DESTORY: 5, //群被解散(全员接收)
    CREATE: 6, //创建群(创建者接收, 不展示)
    INVITED_JOIN_GROUP_REQUEST: 7, //邀请加群(被邀请者接收)
    QUIT: 8, //主动退群(主动退出者接收, 不展示)
    SET_ADMIN: 9, //设置管理员(被设置者接收)
    CANCEL_ADMIN: 10, //取消管理员(被取消者接收)
    REVOKE: 11, //群已被回收(全员接收, 不展示)
    READED: 15, //群消息已读同步
    CUSTOM: 255, //用户自定义通知(默认全员接收)
    INVITED_JOIN_GROUP_REQUEST_AGREE: 12 //邀请加群(被邀请者需同意)
  }

  //好友系统通知子类型
  var FRIEND_NOTICE_TYPE = {
    FRIEND_ADD: 1, //好友表增加
    FRIEND_DELETE: 2, //好友表删除
    PENDENCY_ADD: 3, //未决增加
    PENDENCY_DELETE: 4, //未决删除
    BLACK_LIST_ADD: 5, //黑名单增加
    BLACK_LIST_DELETE: 6, //黑名单删除
    PENDENCY_REPORT: 7, //未决已读上报
    FRIEND_UPDATE: 8 //好友数据更新
  }

  //资料系统通知子类型
  var PROFILE_NOTICE_TYPE = {
    PROFILE_MODIFY: 1 //资料修改
  }

  //腾讯登录服务错误码（用于托管模式）
  var TLS_ERROR_CODE = {
    OK: 0, //成功
    SIGNATURE_EXPIRATION: 11 //用户身份凭证过期
  }

  //长轮询连接状态
  var CONNECTION_STATUS = {
    INIT: -1, //初始化
    ON: 0, //连接正常
    RECONNECT: 1, //连接恢复正常
    OFF: 9999 //连接已断开,可能是用户网络问题，或者长轮询接口报错引起的
  }

  var UPLOAD_PIC_BUSSINESS_TYPE = {
    //图片业务类型
    GROUP_MSG: 1, //私聊图片
    C2C_MSG: 2, //群聊图片
    USER_HEAD: 3, //用户头像
    GROUP_HEAD: 4 //群头像
  }

  var FRIEND_WRITE_MSG_ACTION = {
    //好友输入消息状态
    ING: 14, //正在输入
    STOP: 15 //停止输入
  }

  //ajax默认超时时间，单位：毫秒
  var ajaxDefaultTimeOut = 15000

  //大群长轮询接口返回正常时，延时一定时间再发起下一次请求
  var OK_DELAY_TIME = 1000

  //大群长轮询接口发生错误时，延时一定时间再发起下一次请求
  var ERROR_DELAY_TIME = 5000

  //群提示消息最多显示人数
  var GROUP_TIP_MAX_USER_COUNT = 10

  //长轮询连接状态
  var curLongPollingStatus = CONNECTION_STATUS.INIT

  //当长轮询连接断开后，是否已经回调过
  var longPollingOffCallbackFlag = false

  //当前长轮询返回错误次数
  var curLongPollingRetErrorCount = 0

  //长轮询默认超时时间，单位：毫秒
  var longPollingDefaultTimeOut = 60000

  //长轮询返回错误次数达到一定值后，发起新的长轮询请求间隔时间，单位：毫秒
  var longPollingIntervalTime = 5000

  //没有新消息时，长轮询返回60008错误码是正常的
  var longPollingTimeOutErrorCode = 60008

  //多实例登录被kick的错误码
  var longPollingKickedErrorCode = 91101

  var LongPollingId = null

  //当前大群长轮询返回错误次数
  var curBigGroupLongPollingRetErrorCount = 0

  //最大允许长轮询返回错误次数
  var LONG_POLLING_MAX_RET_ERROR_COUNT = 10

  //上传重试累计
  var Upload_Retry_Times = 0
  //最大上传重试
  var Upload_Retry_Max_Times = 20

  //ie7/8/9采用jsonp方法解决ajax跨域限制
  var jsonpRequestId = 0 //jsonp请求id
  //最新jsonp请求返回的json数据
  var jsonpLastRspData = null
  //兼容ie7/8/9,jsonp回调函数
  var jsonpCallback = null

  var uploadResultIframeId = 0 //用于上传图片的iframe id

  var ipList = [] //文件下载地址
  var authkey = null //文件下载票据
  var expireTime = null //文件下载票据超时时间

  //错误码
  var ERROR = {}
  //当前登录用户
  var ctx = {
    sdkAppID: null,
    appIDAt3rd: null,
    identifier: null,
    accountType: null,
    tinyid: null,
    identifierNick: null,
    userSig: null,
    a2: null,
    contentType: 'json',
    apn: 1
  }
  var opt = {}
  var xmlHttpObjSeq = 0 //ajax请求id
  var xmlHttpObjMap = {} //发起的ajax请求
  var curSeq = 0 //消息seq
  var tempC2CMsgList = [] //新c2c消息临时缓存
  var tempC2CHistoryMsgList = [] //漫游c2c消息临时缓存

  var maxApiReportItemCount = 20 //一次最多上报条数
  var apiReportItems = [] //暂存api接口质量上报数据

  var Resources = {
    downloadMap: {}
  }

  //表情标识字符和索引映射关系对象，用户可以自定义
  var emotionDataIndexs = {
    '[微笑]': 14,
    '[撇嘴]': 1,
    '[色]': 2,
    '[发呆]': 3,
    '[得意]': 4,
    '[流泪]': 5,
    '[害羞]': 6,
    '[闭嘴]': 7,
    '[睡]': 8,
    '[大哭]': 9,
    '[尴尬]': 10,
    '[发怒]': 11,
    '[调皮]': 12,
    '[龇牙]': 13,
    '[惊讶]': 0,
    '[难过]': 15,

    '[冷汗]': 17,
    '[抓狂]': 18,
    '[吐]': 19,
    '[偷笑]': 20,
    '[可爱]': 21,
    '[白眼]': 22,
    '[傲慢]': 23,
    '[困]': 25,
    '[惊恐]': 26,
    '[流汗]': 27,
    '[憨笑]': 28,
    '[大兵]': 29,
    '[奋斗]': 30,
    '[咒骂]': 31,
    '[疑问]': 32,
    '[嘘]': 33,
    '[晕]': 34,
    '[酷]': 16,
    '[饿]': 24
  }

  //表情对象，用户可以自定义
  var emotions = {
    '0': [
      '[惊讶]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODZDOTFFMTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODZDOTFFMDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '1': [
      '[撇嘴]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0N0Y3MkExRTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0N0Y3MkExRDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '2': [
      '[色]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODYyQUU0MzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODYyQUU0MjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz63gXiyAAAK/0lEQVR42uxaa4xU5Rl+zjkzZ247y+wN0IVlllVArHZxia3WhNWa3kwj/dE2JrUs1tQm/tH+aH/UuEv6q2lTMDZNk9awTX/YRG2xTWylacFqjK0WlwJGQMIICuuyl9nb3M6tz/udb2ZnEXRA0Jh6yLvfmTnnfOd5b8/7ft9gBEGAj/Nh4mN+fKLAR31Ezv5i5qXvXsQ0AXzP3Rz4Xq/veZs4ZuQ88Dz4vocglL2B7+eDwNvPcRdlhOf8PgivSy4Gfu084DnOkZ9XD+x/bwUu8OinbKEMAAZE5J+81qBvzagP0/fhFHnNMPrVLQE28+8gJUfZRXlEn18aD1wA8EE9ElwAK16BEXUoLgzLU0ihrCjnvjp3CwHcIuDMByjPIssLD/ACBcOUByn5y50DGcp2yh4Bb5g+rKYCom1ziGSoRJMNM5akAk30QIpjErASfEtM3IFIykK8zUR6hYmWbiDZEnoq9GBwPBwvnwd6KTvVKBZPFWEmaGVDwKU4RmpoapYP6BEKfIfhXFEj4CqzWQkDqSiQaPYxPx5gPo8MY1/m33Qh3mhUgV6/UN4z//yhjHPsFKLL40j1r0Hs2tUEE0dQDDD7zCuY+ccBFEenYV+zEsu+cxvi3a0EXcbc8wdQ+OdhFUp2VxpNt6+C1Ur0kQhKr45i9s85lM+U4VBn8/qlA8n+TjHWrY0oYZxdic/BQjLZnvzjz2VKrxyBfWUW3miOOUnrbbwaqTtuwfRv/4ry8dPwaHiXBq5QgtYM1v7yPpQPHsWZn/4Bqb5+OG+MIKCprWQUqa/2oHJ4kgqMwSMEl+AdPleik5Jf6KJxWnhz8C4lzmYhs4GY/6M3OZspvnwE3U8eR/aJ47AkBCjOvqPI/3gn/BOnEdHfmSaUcuV38pg9OIbZv4yg9ZsPYMWje9DyjQfUPQZRFp58He6BMVgWavPJc3IUD04KB/SSTLcLnQoVV+V9Q4h8vqCdFZGYzHrT02rymScfUaNpaKDKhyFdV8Wr++wX5bqFwgu7MMn7558dDp8NGTdMFx0AZNvaGI8GnD8Ay4gk9XOapS44B1iY/M2Gxbhd6Srg00/sqFlrERABq0UOV4NJ9/Vhet9+lF/bR+V31DxkGqG15dHaM8bCHOm1KbS0OBgfj8jc23W9yDdEo55TVsKKuF2qopWaRGRpE+LrloalSr/c1GCUQtZCCAh4ied0Xy/szi6k7/zy4ueMuufqjCGWLzP+raSFjs8vg01yS8bdahgP1tzaYB0YIPgsrKIqThIGS771WRjJGHTUKJEXW3WxT5djvsTzpiZ0Dz5EwBHEr78Wydturr27+lz9s3JtvhwqvvKeq2i0qLrQnBbPC3ApeEqRxjxA8FvE+pHUnLrFIL9HV3Wg+e5NylLKGBpNFYi8fHIuHK/62U/IVstrqi659+uwsp0qPIKwdap5UQ55rkAFOr7UiSV9bTrBTOaggbjtQj810GglzhI8+xYHpu0s2JtvTGz6FJq/t1nxtaNpTyhzigBOjoch0D30EMNngypkgW4jzGQCbUP3ASuWq/tF5N78PJugMWCWyd7afwU6v71mcaxxTMWdarJvKZcaSOIQvMHq7yz4vEoXlGQ/y0JTK07//PeoTBUUGOF/K92EtbR8FbwUMKjq6ypFzKSN9ofvxthvnsHo3w4pT3k62TsH1qHjKyv5hbvApdpo0QjbFbYsFcfs1WGUf08PkHk+TYFlO9VOWf+ptgcukp+5Bit/8SMYXV0KRHJND9b+agfSN1wXAvcLvLXAsRQqIe0EnzOTESy7/3Ysv589YMJWsd79g43ouCNbfZHGbizoQUVsy1OhS+ltxAO9gXggIuWU9GL4qjc3NHjVzxCkvTSNax57GBPPvozMpltgNWcIeibsg+SegIp4RX4UhRaUECO03rYaTeuXqGt2eyS8Vm+sWpKFh0UMUsNc1xAF9r6PAn6YnKavHSQzeTXrS1NmiGXJTHKl7Yt9Skm402EzV2vkKhp8SXtFGjq3poTdwR7KN0MP1dAuAK8nTNtyGV0xYblMIx4I41CA1Hp6X79YYjqCgOANhPynEtUsK8qsVrVwNeVoy0sulDhFpc4Tnp5fj/Wl/BwSqF7JQF2T8B4KqAl1iZQnjdCiZ/77BsYPvhV6hQqEo6nHut6gZr9q4fHrRr9urL8WaOOFBmtf3YK2VelFCgh4122MhRQYGQ3f0iA9lPOzmHnznQ9loZ7u4ELIb0K16HieCZeOc52GFPDzYkyHJGKTwiC5YHg1Ky3/3ABly2UBnj/8HHJPD+lO0NfNkY9CKQrHUR7INRJC+2Xh7VfIPiRrQ/fHzSszeFseSGaQWdt/2RSQI0a6FeAqGqjMfMGqemCkEQ8ITQ2WWSVjaak2oQLJjpS6Pv7qLozOZC6LAsaRYR1CibCx0pVuaiYiHpACNtJIO72XXshTgUxQ8VRfYlABy44gSe4vjOXw2r+GMDN3acE3M+TX98hCPw47ToquVJQXxqdslIqG1IBdDfVCgS906e8SNirkGYNUPZD0Zzgt37BC3bNi2fmB8N3oSp1fzndU51x2dUtofTcMn9FxG07FkPB5urEkDvvebTwZmGdhTbClNY1ws6qda4LRfSd5Nid9Gd4a1S+NAxvbgTXNDDurAXO3s3W4YTNw5yBNnsGpkb048uitiLG1aOOiv2r96dkIJiYZPhUmr4HGPKCPHBUZ9rnarnpBWs+Asvr2NbBiEWWxjtbw5o1dGVzX0iB4lUgkk907gBeGWdtmYE88jQjn7LnpypDstfXfeDOBSlnCB9sap9GFcreN0DfPTRuZqO3ROmFHmsjE0HVLN47//Sh62EDGbHpgaA+dQlDCIidGQoDj59gt7OpVFsc6stiGO9Xnuf9sR/HYU1h94xVINrHKi7Fo/WMEPzWlknevcZFr4hwBP0gldubPGGizHEQ0P7f3yH7PVTjxYo6ecDG2exta79mJiITFBR6xK28CqITFVVEgJmb8j56xkTsZByMpTybd+kG2FoeZzMMeC8oUlfBKlTA+Kw7LfQbr7liHZFtSUetLP+xG7k/bMHdy5LyTubNvoZh7dtF30bb14W6EXkwL+EOHU5DFC4Nh6/tt/L5rY+vY7/oWJbTe5pbtlQFZn7a1e4jGw8WsYYar+fGjEzj16imU5yoLG0pnFbvSRA6dPVymplfgirteXKTU6cdvlk06zJUiOPh6inGvHCHghw1jMeC7fn3gorYWt4bKYGDijIk0C1yqiUkt2xGsE23ZZrR3Z1CYKmLqxDQKk0V4+VdQma+oDsQmu0SVr1vZWc8smtiZOKTG02MMm7cTUASkwV/qzd2t1OBNRtPg9LSJYtFHmkrEYoFSQhZBiZSFxPq2ek6u2+XyMXWyiGj7tYsmLeZ2h1uac5ZYPs/bvnb2ouVSbq8P0Q8bCGekXGboTFgYp0cKM1zyMT9QFinXSfhdQFHXzzqcidcwf+QJ1etPTEaHCb77QsBf7A8ckqWych9QPZNjZksVUxnZjjDG5TcDM1DnQXU9xJPCvAnb5OLebg6Tlvw/sff7IQgr2CbG+TB/oYGO0WEyRT8tt4VJ118qWlmfawifFpVuWEqK6go4xqjQyqUObLKOJO747nuVB/S24dDFgvigv5FBu1y53XGMLC2edUUpTzeUXqhIIuKtEiYrkEZnDzymPKC9qXj+xt4ZPP/vJR+JAouLXyjviuPOpSXZURjQVpdjh/4l5tL+zHoZD7G2MExWh03uUkxqfPJ/JT5R4P9cgf8JMACcAN1BJ5mz0wAAAABJRU5ErkJggg=='
    ],
    '3': [
      '[发呆]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODYyQUU0NzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODYyQUU0NjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '4': [
      '[得意]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY0NzgyNDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODYyQUU0QTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '5': [
      '[流泪]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY0NzgyODI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY0NzgyNzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '6': [
      '[害羞]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY0NzgyQzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY0NzgyQjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6IipGaAAAMBUlEQVR42uxaW2wc1Rn+z8zs7N1Zr3NxoAanSSCEFNwAKlDauhUFtVJLKKpQaSXiPhT1oSqoLzxUCrz0orYC+tCXPsRUSJVAqAaJPkBVjCj3AIYGCE1iTFziS+L12t7r7Mycfv9/ZndtA/EmBFVImfB7LnvmnP/77/8ZlNaaPsuHRZ/x4xyA//fhrH6w+OJPzmiiMPAHdBgM6sC/PAzDfh36OdzjWUhhGIzhuojrCZzfwHlUa34WktYgnCk6yz37ZXS9+ti+941TAzjNox+0F3S7UqpfwoFS/B9pUnwjg/B34CNCxQRoBPRAdH12NNDhkQPdFzFvmHQCcpJ1UrEGKSskZQesF5Esn3UQUlAjalQ0eYuaGjUBfyeQ3onzMOjeMwFyJgB4wX0CQmmy4h5ZSQ8MMwr+Y5tRzLgOwB+AaB9a8clJA2SKKJnXAqZW1FQpaB62F1azJ9LGPZ8WgBVSZ8btjAd+MYVKswpAzZighXlhPPRx9mDPDSgCRL6EDjupKB0DmC6AmAupVJD5WTBfA90MKp5NADz506ABlrrdVSbLhaTtDJhJgHEXvMfa0hfT8aEEALRAIUwLxL9r7cnPAsRxJAym12uKJxs0PwXNNGgQg3itr3cCwjkd5pXtk72uDGEnwQtswU6D8ZQBYblGCyJ9X6StQtgJSIt2bInairFZtAKEgv04KU3rz/NoDiAadXb6zkB8CADCXOtaWSLR/W3mSxHzYNzO4u0u0YLCPWzKMCm23zCMBxWcY6QCSJ7a5qVCsKe0AcuHjfccOD60mt/kUWGKyPOgbQgOIfWLdIpyZy0NsEPtUVYAs1kAf2DeSuKcMcw78GMQOVmATUYA4Lgs+QCaUjHcinfjH5heFpWEwihSWdAMQGg2qVhA+Q3QxIyiRkNAsN/ddSaZuB/o98mgzLwsIFK2jQaEaQYQ6wHlzTM2JdaOAFuH62yknWRkZvHI1KCVZWYlzs/ati3RhhWzqTvPkUu0xFFvsGMAAQyQCaa0H9mUVLwIZkJZVJxVJYQZZRkQ4sirp2HGmHE71WZcxfGuG83jRGRHIJDqLGjJMgAYiB1TlE37kZXpfSZDhx1rYADpH6gbZCcqVC7UyatiJo40QnEhJRHoY6YAY0qYjVGj6tPMoWOYw28zLks3NaAMMQArOgNEGnnDttn0RAODp+PEP+cJrXSF5o8v0hO/fp7clEs3/24vxbvsZZJrM1+amaaX//xHuf7GL3/VjAJCz/3pITr2yuvUu+MC+ubdt7Seo/yAM3PdYcqOAyPjdOiZD2jHNRto9/WbBEg25dH8kis8oTwa7cCEPPhWsEcHQJ+steoZr+LRU78docKx2XayQpb1ykv09mOP0OM/G6JjLzwrVBg/HIVTo/J8f5+cp6GFJ3/zCJVOlqJ5DY2/NEUj+54X5kUYxYaAYyGmEgGYFDvaE4X0lYpe3ZHNPnnLIF582kn6lFhfFdt94aGDdPSFY60xvTu3Ue+uXVR4f4qmD74FEKW27f3wxzRw25AkLx3gebCEcL9Efx36BYRQbY3r7usmN+nQ/GQRptVoPd+0tYu+ettWchH5dA3Jr16n+XmLKvUY+QENXXrHW8NrmRADINv15H7+vws0OTa1Ysz020eEVh87b/o+mL9dmKewGp09mNBfhHk3GWsxOz85/5Guc82t2zEOhlEPjV9AQ4mYT6VajKPu5Wv6AJz3claf5fhY1Ken7n9JnG/rFX00cN1WmnztOI29NI5E41O+J0O9/T2U7s3QK0+8RdNvvgZpl6K6x4B44+EROvLMi8L8DXdcS3H48eTYcXr5X4cpk0nQtks2U/eFOZqeWqB3nhunyYNztOPqDSt4itncU0CZgeSFU/sAmoocNxa26yP6VA3zV15A1317F2U9iy49fyP1dKVk7PVXXUxfuqyfdu48nzK5JBXeO0pzRw5ipZIkMgqqVC8tUqYnRTf89MvUk0hQV03R5nRa3s8mXNq95Tzq787Rtot65dmhZ6Ft3czSxrxtlOccW3xfDXQWhSQyaOo+P0O3/uFbFPdQrxyvkHWyRupkvWUGXYuY2KkhWCjauftCevmfh6hw9B3K962TcoKLuat+dCNd+d3NZM0uYo6qvN+Yrsj7PUhqagqm1gipZ1OSei/IU92vGQBC1AKiUX4EvsqtDUBqGbElmcRNoHQoYuESktoCosNcnebKsGdkToX8IGkg5dDOgT7K7eih3q9cZpw3KujEiZEYqRKYOYroHRaNAOIBTBVzhDGE1IxDN952FYUbbQrL08tAGCA2qkDftzrNA0r6U9WcwGcCIA/PQLtyeYpzxgxQmMHZNCTIY3q39BjTobDVD7AZKR6H91XDvL/edumKng20PbtOpK/qgfmN1wnNmixxvtbRfaniAEBHicx4f+ih7ucSwlFRdlTm2lZ0zYZN1Gx2m8/Em9j0WgA49XMpUDfBBO9rjNMY7zo27c6vj7yQnyHS89lSzUgSWUDYyiU+K9OnsbWrUR1OsNADBhBnMJBCApUizERnUF2uC4wJsHSSeN6FZ2n8hpiu4ygdwnLkhE0twBdgIjyH4jmyGF/DHGUjTpkz64gZEs+nGm0AQpqqdZsrUwZR7EQDsm/hwYxjqcB0UlkXjGMhqDrkBAl7FQBxLJhzDTETblxMJnKiVl/MdY0wnvPFZEJoQlVN36FTy+YAGKoXZANAtlWi81LZFQ3AhJ7pwIn1CP7ex8VbGqkvrC2gJtqIkBEHS1iYJQkJCn8u7AZgwm4G6Iq2JIGRXqaFaFeCxwVcxWIOMM2+I+vFIy3mMYcLbS2VJeC3CPMsLDlGA74a7aShmYAWxhqeGvCrITkWJq0WwChq/lhCJM1OJ0Jm22UJwoTEB6TvbUliVQMD1eUg4bglDLMzyzAWApsgGpkQrZhezjykX0fuOTGHitZTqOtpbQBhICHuQRjjQGUBsR6pUysu6uawOOr/fLydZyTT43fNvW97I6u9M6FXmJMmAEQyo2TCRBdTPsI0kb0LMB0RcyCkfQNgdi4B5sV8hjtrKU1xN8xNRLVEuWQmgC9EOYVDbNRwNOsUkwia12r1PJH022C07xnnDEIjbY6NTQrMWfMZv7H0J4/HUbYovn3gdFrKIhLaA5zUlmA91GDna4iEdORN7TAXtGO+7AE1KXqml4XDqKAxEvZXMC/3vI4fgQLgI+8nqVKx2IHv/7hdu1P1xPfAocfqsI6lQigADGGxCJCRWoDKcoHe/DsKvErdaClsgooad4w58Ohhevju51DIzbaFsHy+FpCGaGf6hEvTMy7vThTx+r2+CaPUgQ+sSHco7PXrpUWU13ZAySxviYSyl6ODqH9FVDnw6BGaOYqy+82TdO0PtksN1axjuKI98Ng4jb8yG5XRS/S5bWkBpf2VJqQjDZQqNr39nzR5Rh6n3KVba1tlDFoY4r2hYsGS2ZLZ0ICQUiKQtq97U0IAzH9Qoid+/zp9/sqNlEFo9RDrx189YXphLt76MiiVkYG9Rjva+H5kUsaBS2WbXv13lljzuL0XXjX6SXfmhiOH3F9EZ8Q7FalM25l5J+Hq722h9PoUvfr4e/LC+IHZD+/RDGygwaFLKFhYpKBSa/tCENk97tls3j2aokpZmaij1t7o7XRvdNi0nnp/sWhRDfkhl2ug6eH6xkKys+mK72yhi67dTAf/MUnH352nuckSuSgPzruom75wfR9tvjhH/mKZvGWJSkcgWAkTk0lQQsyGbb7TXerT2Z2GJjgS6L/Vaio3M2NTJh1QOt2Ac/lUhVlkevPSEn7U4Z1A73ti3oRPcWwTlWZOunT4PRNtEO+LeDQUffj4VL4PjEIPWwDkPihk7+KSRaWSRalkQKlqGY1YhZxsipwu3js1AS6oooE5WUSSbhdpzOzMXFwybKlkc6RhLYwgaN11uh85zuQDRzGKTg/yXg0EuWcJjrdYsk0DhA4tZpelrE+iPGDTq9a4mrSpXHGJxxppq2aFOSomo07trGf7E5NogwnW0A+h7gHdFARqsBKiowock7P8yNyb+SkK/35DjeH5Y3h3+JN8HzsbH/maH+vuj4iZGwTDOd5BaNVlJsxPAOCEUnqUzuKhzv2vBucAnAPw2T7+J8AAkTruJ9oERDMAAAAASUVORK5CYII='
    ],
    '7': [
      '[闭嘴]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY3MUY5OTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY3MUY5ODI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6bxS9aAAALoklEQVR42uxaa2wU1xU+szv78treXT8IBuMXdhCQEFNCFUKaYKUJpFVbQC2qVKFCGkWt+gOI2j/ND6BSf7XiIVUiraICQVWUVkpRG5WmVMK0adIi0RgacAW2eez6gR/r9drr3dl59Zxz76x3/cBrU6pWyhXHs3Pnzp3vO6977gyKbdvw/9yUTwn8LxH4RkvVfOMbUPbI37dRzqIk6OSnv/gi2JYJlmnyMV8sFMDnnDndBVevjC4a7C9vDs/oUxdw/yGUg9P6jqK0oXQsAk8rShil/UEsUCyBk1LzpO1TKBdRvomyHeXCNBJb5pijQ96/XRJvkP3Ud1wq6KEQaM0Dz0BPnNlJ/We/s/tdJvbCF5pPOmMV/DNbVElXTUit5xPaIi1bj7L3YRAgXz9MgF/e6Xe0TCD2I5EtNzqHoGVVRSv5vuK2QVFNUL268H/bQuQWGBkbbnaOk/+HvR4Fvrq9GmqqXQ2q13323Pn4jqvX0o6FTy/UpYohQFo6hOAda+z7+L3z2w1dD/tKAlBWVQmGokCgGqdyW1LdZAeXNIUNPiRRr7hh/WoV6pe5wW8mYXSAlbDnyVWwJ1Liuf33K8btTNZ+sCyU/NurMwbEe/uh+9LHcwVxrq3Y0AgrNjZL0JR1SAy0ggGp4SRc//0NMLIm+CMroHrtVvAEyiEdj0H/5V8JTXrdiara0A5fQG1nTEhaHKfwPfryPxcdxAxexYfWPfMKrNj8CtBvI52E6F/fhJ7zRyB6+Rb31TzRIghYOj5cBzMzieBvMviaDbtgza4jBRM3vfAaXH3rWzDedy2cHE5dqF4ROoDdx4q1gKuIMXsczX/m1V9D4+dfY6DMHo90/tl97/P5rQ+uQDatYhyEUULoUmXQf20QwRus9engqfkjtTwvzTWZ1CCT0o/KrPcfIdA6NjB00tFU2bK1sw6ifrpO7e6lT5BZBQqRKIf+qz3C/F86PHcgInjneiqRdpS2/0EJUJ6+MNp/T/g4us39mnM9frMLFE8EUYUgFdfA0HSING1iTd+vVa/Zyke0gJOIj8o1o3gClmnkhMyoTabDpi4AOG5zPy3SOEPL4EmEtW/qYvrIyk3zp0O8nwLc0E0Ih4z8BTS8GAvswTy+RUulFrW8J2Mx9P8gzu5f1P2BUgCfzyRLEPijlI3mKjoLspCpa4KVWz0IlNurMnM+ZKg3Cn95922oWl4Hz+78esG1UBMuF8Y4TuTlc8wwM+7/w6mfweT4WO5+ymiZ0Sj4StxI3oVWyMKgpoJpczwclgtqUWmUtN+geA0IVCiUn2G05yN+gONGk8kx+MGXt/BRgHkDfvjOb3mc6g8KwyoqhOpb8NwPQ9feL7j/zI9eZwJOG+69C5uebuTf5VVI2uVCJSoQDBiQTBFE++BcZYZrugUQ/D4qA9SSCb4cqa/ga5TvnXan85MceOf8nde5PoLK1Rvz10mobFnDv3r+dKRgfH47h2RoLeFgri9F4ytMggi4FNvJSuFiYqABwbeCooPLp3PHsseXi/T4wZuzukKujV3nQ13brtwqTMe6zc+B6vNBFO8nma2FfOPsPuVL/CygkAUV5KCA3yMC2rJmz0gFBChwSfsun5bTYLAyCCuebGIX+MfPv8YgljfWQTX6rtM+t8EDS6tcUI/g/WHcFNlkySyT8JWXQsu2bTzuxu8OwaXjW2Ft85TnttS74fmnvBCs8MGqZ2sYOCiQEyZgU4aE5+athQbOfeUomm8/Ba9aiv2KFyvMANIMwq2PenBR6s6NzVhlkIiPQUXIBV4PwPKntkHTtt34sCyCRwWYk/jUFBoBMxlKaiAKne+dBy05M7NVN4ehYWM1qArWP1m0vIZzaDhHRsNSRIO+eCnoWehY991r6+8bxOQ+NmpAcZuiolRsLokVrG0an1kLlc0N0HelC9PkAPi1caitDULlo4/Bkic2Q6hxNYJNCtch7VuYwYgIW0KHYFU5bNj9EqQG70G8J8bj3Ei8oi4IvqCLfQR0SxZvU0rlGLBsMA2ldd4sZNMkiNutkt95xGRc0wufLq+pgFBtm8jx7hJ0VbKOjzMOGEn5cKeQQzcyp0jYts5zBCtLIBipE1aS5Hh+yAPOP+U5/nMrJpimZ/51wLal5nNasGRpbAhQCvm2G93UlTc+i+eqDCdxj20Z3D+bJYQyTKEYnt8Bak+VzzkBJ4DBMIvY0LAF+A45gSK0T0AVBoSLDLiB3YwfKoDaTEBxJikopwk8a9t2CBhS45KEA9ZyxJpGAt3HRCfWiyJgMhA6KgSWNW3JB5OfuiRQGRsu6vcwqb47dyBSvQQCwYAEZgi3YSKONXSI3h2DIHpgJAQF2ud7JHjbOdpCoVSaGUaxFkDt6phAvCr+dtG5yeBtfLiCeRksZcpVCCBqP3arD+LDcYgPDsDK1c3gD/jy1gK5sTEwm8RwKzmqoQArIxKSBCwJeoYIcskJFYu8Ioo5ZHyRX0Th3tQ2TakRSwIxmAQFJ/u1mWaJ9txl8KwpvKe7swvSE7iNttI5/zf1DPR0xRF4BjNPKY/tv2dBJmNPgTWnHaVksaLFgpgs0F4MgQ4yWzZti6hhEnYeCV0sUByUGkTvDMLoSJJBPf78CSwDXmQSPTdikE6NMwHTQPDdo5BOG1ASWgnrt70Ftat389TIHTLpPGXJt3p8lH3jKaF9JNAxfylh2e1kSi1FWHESh0ReKmUS6NPR6BiMxtMMfs2zP2ZwTRu+J0lYqPFhmBhPIfhEDjyNo/HLkYAYhyRiqrAEnZgy3ZjSEug+gyNeYQFduVhMLZTAm05ZWMNq4zbTtil6ppHITGbRHYRT1jTvYHC5TXqOhA09PRMI3iwA77SleB+7HU47MqaKZ5lSYVK0rAviCRVXYcV5DzvPjsyizGGdJjciNwbdmCJhTJHw+yyoXSbSZqzzDAzd+WPBpA44UV2+OAP85Fg3XP/z98VurSQLS4MTwtpSWTalHdT+3T4/ZLMKdZ+eKwvNtiMjN2o3dBs32GgFsp8uSRAhU5CIhIiEuKHn8k9yJPLBEXiyyGzgTX2CwS8vm8BkJ/NkzuIWpCYxNQ+g+2iQQE7HzKIWsqlRtAPaMoElv89vgCqXds79ZAWXm+v1SLnCK3esX2ESo/0fQnLoKoNzwBfs4pDknatvCPABBF+KmtengTfEq/h/dZc42j+Oy1FioXvidgR7jGIhMaRgwtGFJbBStHUhTmqIlBrQVGvSLhBG+z5kcJRlZgNPJOn6ktI0gh9HwHJenlNaGJMIgY+PqpDVOPMcWuxrlQNYm3RkMWsmhmkxzTIBFnpgVgr+zmoWe5YTxJRlZgPvNA8YQgkywQvwOoOP9fsg1udD7UMCT3eQUxhSXwt6rSKX8zb80ZHBNWnkHtYjmi6JOKLDYNwNsSFPQQbKb70Y5A5451rvBO4l0l5hUakQAt91OwCdN0uA3szgctA210Z+Ie9GE2iFvfyOKAOtI4MKhMMGeOiVh9sNvekgJDQfB2n9um/PAO8Ed/71sqp13N+rVWD46BA24xwCnV1BGLjnJbchze8t9qtPMS93cSKyBFzAXVHr0KAbykpNSPpRi4a/YCGbDTy1/OsOSbreZz+C2Qb329cNSI67aNeFClvYJytXkeMoC+B2zj6MuQgGjRCCD84AJ95sTBSA561q128Kt5B5GWqs9BEwsDxF8GcRfONCv7e5YGHtEMbFelXX2hVZ6uaDI/CU49ltsFpdBgN4NGcEMbWKZU/n1ofKtWH67rbD+eL5MAk437ba3KZOpk6I3H4iB54WKgpOT18/xKNZsKLDuL5YBSScsXSUHw33wiKbCotv7fKj3wW0QpjWAG3yHlbbWPvfHYExHdcPAytJKg3GRqD8sWoiG04lunMrslTG3gfAsCgLTLcGAyDwdK746N16/pudnLB/E/A88G25IvClmv+6BZx2VpKgF08H7uPHzmfaC/K8bTE+/zAIOH58qshs1pb3+9P/7PFvAQYALGdc0gL6HcQAAAAASUVORK5CYII='
    ],
    '8': [
      '[睡]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY3MUY5RDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY3MUY5QzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '9': [
      '[大哭]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY3MUZBMTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY3MUZBMDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '10': [
      '[尴尬]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY5RjI2MDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY5RjI1RjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6Cq1WCAAALGUlEQVR42uxZeWxcxRn/zd67tjfrOCRxbpNyxEmJSeihBsJWTaHiKKFCtKqKFCIVpEoIUFFVeijwBwKkVkDT/lOqJghVlVpEQqFBgpQkpuEqzgFOTLGS2I7tjeNrY+/59r03/b55897uxontmBQJKc/6/N7Ozsz7/b5rvpkVUkp8kS9xicAlAheJwMAftk78MhSpbigVIfNZyOyYc8+N8z2JXCYpC9nVspBLyGI+CYP6mQZgmoC0D1m2TNs29tF9r2nJvXQHi2nSnd4/fM1VUwK99eX952wPzJD4MpIHSTZByoQEK6FsSV+IyIcJ/xn1sQXOt0mSLfSYJtlJ8gLJ3s9qgcAMgG+BEAwcLOF4FuFFZxCMFRCebag22DStLUj8EJaJQj/JkIlsv0S6RySYOHXbpAk8THLo8yDwkLTtLbDMhJAF1DR0I7r8NPwRchPho6+DznSKmA1YFokJaZWIYAmR+QYSVxUxP1fE8DEfOjKLkZE1SWHZB7VFnpuJRaZDgDW2jcBsZN+ORj5F7dxOCMbrp+E+8hUhHFG+QuBtW4FXYnIfP6TPR10EyCaYe3UBc0uf4nDXEvSmGxCd27gxfzq1URO4l6TrYhFg8Htgllp8pSHMiu9DIJKlUeTkgaAm4HfEvRQBS1ugRH34e58iKJ2s4UQE9Wte2KsINN12N+JNV+Dw1ieSROSgJrFzOgR8k4I3jT2UWVr8Ri9m1+1CIJoHQlEgHNX3mBLJEqlx7rrN6xPkO2WzIEsYkkSRJyUEQxLz4mkMtx9Ew8prccNvt2PeV9ez0naQbLwgC9hdHeX0WVtPEt9BKbYlIIZQn2gll/ErAK7IoLaCT1tBuZBU7iO19oXbrr6SZfdyLRQwMSuWx8muTvXeYE0trvv5k2wJ9O7ZtU0Hd9dMLPCYzI4n/cZJ1MffcvydAbOECDxrNFRpBdcqldqPOP205pVo15N+tkBAueDsuhzIbape3rz5QY4LJ/Zm4ELLZH58Cy9Ws+r+AxGQ2t8ds0sG4QJigMoKficTsa9zXKjvohWW0tby5nHAOzE0EQJb4srvb+bHpE7dUxOwh1JKaGXdRtpHbc0RJ2DdF6mXOiQ8a4jzGJDdhsFqrUsXuJrLr9xOuq7nO/cci755i/u48UIs0MKlgc8cRi3leS/D+PRLXTIMRvimjjBFvBK4vwxaZSbfpPM0rLrWzYRTBzHXNqo8oIlr5w4oLY5mTLzT1ofUSFG9ODG7Dmu+ciWarq6bFHeqbxgd7U7sRUI+rPjSZZgdPQdwejat8xPInT4Fo2/kjnx7z2NTEzgzxAG4UdCksYYRpNICz+/uRcGwvc7G8TQ+PNiD2+/8Or6x/svnnPCfO9/FO60fV7dxMfbtZqxbPR8qJamM5Sx8gYAzPwcyBa43ZuCDVtVmdA+26DjomsqFkijmE5HaYRh2icAPKPBrb7kHP3vpUyxbdx9ODdeQxLDjpfdxtL3rvOAjtQls2Pxr3PSTZ9A/VIPTozTm9U9woL1/opvEc4iGDXz49KMoZTOqjVKoSqXmSAbWeH7SOChboFhIsmbCdePYfSSrwDff8F3c9Ys/obujHa0v/1X1Y5MPpaN47eX30LyqnCBGR8Y98PdtfQONV6zGQ8k1qr9JKf/0SAyvvnUMzYuvQcRbjR25rukE3uv04417bvbmm2OP4fJMLz5wPt5I8uzkpUSpuJoJhKiqPNppqKbbHvyN44tjZ6oGMaj+VF75euPCBtX2Tmu7ul9/9wMKPF+DfT3eGFsKsp4PR48NY01TzFnUNIF4JI/k8iM4k47ByPlRUywgmDVhx0RlFTx5FpKmmZAlqhwTeYzmbAWifv5SRxuLlkwYWCj5keofLgeufl5DLudesfisqjFFI4DUYMZZiVmkpVdmSZq0UB/K4LLgGMKSaijL4ehmx6nTKFeOtp6Qrmht+eWXLVyM+5/+vQfIJyTqYgbSI2MTJnRJ83XPL5+oXqCCFlJDOVVGCEuXE/ROBZRFc+Jnt62hbIUpYkDqf5pAf+dHVR3Xf+8HSgb7TmLfC4+jbdeLaFpC7sNbR87tems6eqrbI8H9V3xtHdre3IXxwRM48MozaKyv18oyy5agzY80NXgmYVbc5TRLCbVPJRA8SfNcgUImjbbXX5wwoG5WHY60vqqeGxuolCjmlDTOi6u2A7uqx7D1vrPpfggqx9WYRIC0X3L2y3y3bA2eSTgC905tJfsCCNiWRGncj7U6Hb/23CNIdR4u+z2R+vsTP1b3NasWICpMiCKluUJOfebr33/bWjWGr+MHW5XFeFFrXhByrKY3/VJrmt1+wp3AjxWVCdJTuhAROCQgkoVRP1YstrCW8LT1p/HHB27CyvW3q/R49O1/YDRFLhIP47brKbAZPJUIglbVBfVBrFu7BPvbetSYDZt/pRLBCQLPpPjasCquSMNg8GwF0n5JlMXQwJUI5A3Pfw5NgwAOs8NlBv2onS9w1woqA4IC+7vTSnvudfn8GH50cxMigt5WtKsKsluvX4x8Lo8DHYN47XePVL3oWwR+3fKwOprxtM+uwmANLYqEFuI5nJ+agHcu9NHKecvo8UQoauPKG7MQET4ekSgQx37KzVyURaJhNM6pmbidPGtPnBrM4uiJtE6RtJovi6A+bDvAmUDJUIDtItdgAjZLjoTKMTsjYGUcEm0pCwMZFQR3/jCb3TnVnriL3SifFS25YT9icyi9Ub0SCZm4nOOTd2QBclgjr4JPnk0AwltdG2tJVtbqdFly3KVUUsD5WZJrKC0XhUOCpcCE6LPhuBMHrwafnmx/7BHQRRsfNrUMnAhgWZ1NaZgp0B/ZU3ibdVPtDYQusQfpJXNmBT0ConLr6J5MuCSoplBuo4ALBVoW6LngfnaE9dCV9tLPzumnUVtutyyZHuzzIzPk0xNCvVAyQaPoWEClzjze/ngEP/3zSRz4ZJSyEbmdTqmecF8lRRpvKe3arGk9r+2Cd92o4GQg1n7XqOVCe/xCNjRp05bPmZROj7UHyhPnhfcyWbS4JkDPqRz+st+pHp//Vxo9/RmVThXwgkMQVNPIoqldhMbmK3y+Qpx2KLdS8Thgufl/+1Sbei+I310+RxdqkoXPZloWLbWwZLkFX1iqjb3a3NMe+SS5zVOtBnLlNIdYSODRDSEsSTguoFZXu7yiemnScP1eK4SAuwricb1jtiKgfb/JXQMoiCe3QLZgKSkSdXKle4lEuuu4D6luH6yszhKk2MER4Kl91eBVxUqfn3zTQPeA1JqFHsPZRZSfK8Vt1+B50eoY9Fzn3skWsAkW2L2wvvok3ZSbKFeoY42rr6CssoCtQEJhr8RP4/wTNljuoZtTkHF5wHjU6upYQGWZSguU4IF/v9d0XYf9vmobeT4LTHa0uJ2LRSbxcQe7tMDSRY4bCQbu13dfBXhNQJFQhZmoKBXKLqQIGJocnHR5lt8/drHORrdzTJCRth095rjPNcuFOi1xwQuXgChXjpUWgKkJmBUELKcvA+4ctipT5rP6uP2ink5vp5jooiy7o39QJk4TiaZ5PiopiEiwwgIVBJx6Xnj1vSqLSzqodR8O1s4RG/mSV6w9rLX/f/l9YK9tS84IzxgmNv23z8bxU8Cieh8W1wvEo6LKhaQUzgbF3Zho0OznDHwgK13gmMmR+nSDWKXUElV5OrVW/0oD9QuLs9MiK8TDArNjTlKL88GdX3jFGANnqQDtAn98uj9qnC+IZ0Kgkggfd9yhzzCnc3FV+cp0FqjPg8DZV1IfA569Ae/S8pl+0JuSwKUfui8RuETgi3n9T4ABAJj8kcN0ipJNAAAAAElFTkSuQmCC'
    ],
    '11': [
      '[发怒]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY5RjI2NDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY5RjI2MzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '12': [
      '[调皮]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODY5RjI2ODI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODY5RjI2NzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '13': [
      '[龇牙]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODZDOTFERDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODZDOTFEQzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '14': [
      '[微笑]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0N0Y3MkExQTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0N0Y3MkExOTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '15': [
      '[难过]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODZFODYyQTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODZDOTFFNDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '16': [
      '[酷]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODZFODYyRTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODZFODYyRDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '17': [
      '[冷汗]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODZFODYzMjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODZFODYzMTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '18': [
      '[抓狂]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODcxMDU3NzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODcxMDU3NjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4NaGBPAAAL30lEQVR42uxZa4wb1RX+Zvy2117v+5FN4mzeQiGbIFqCREmbUqiANhRUCbUVgVSV2j8kLf3ZpkjwjxaQoFJ/VAm0qgSoZBEtlEchQVUbILDhsUkIZOMkm03W3oftXa89tmem37kz69082HVSCkLKVW6uxzOee75zvvO6q9m2jS/z0PElH5cBfNHDO/sit+8nl/QSy6z02Ja50TbNtZZlJmyrErctS74Dr5O2mlaG63tce23bPMAV4n/yDP+Dc+18h+l7vJ49Vtz9/twALnIkOLdw3qVpWkKFAo3/OG354A5+knsJ93Iz5w7ODOcuzkc5k5+ZBWoccc6HXeEdIb0mPIEyNF8Jus+EpptiF6VZWW3TglkEylM2ynkbpbx6xzaqeJsL5P5LBXKxPiBCH5sWXg+U4G3IwddowBfX4I0EoPvD0DwRgggDnpA8RIB+3tMRatYRW6ijgfYINxK4s/sWskXe+Zv/pwXO0roIrkeoca+HUkTEBJwe91ESxhZeV6BZFa4lKrpMQ4i0vKZ1BFeElgrFLEyN2pgcUz8Uan2X8+suxT4zACL865w90Gx4YnlqmcJ6qGE9SMGpYd3H29MALCW8bZV4n9MyCMRQ921brsvVnXWCjbTYCITKyA6TXiXuYdt9vHsb54HPAkBVeM1TofBT5HmAskQUAE2POCB0/4wFKLwIqVkkPaet+Zx75ItmKfvwexvGVBkjyQn4+dPm9gAaO0rIDFsoTimnlz3X1eIXZwFQIW3aMXUl0M6q8PWTZEoIf3voDW5eQaCuDl1XrsQVN30DgViDQyNxWkUXCm4WuBKw6ZmJSpRs5EQGfS8cxqE3Tlb3uvNX6wjCj4ZWA5mUjSnl5PbuWug0lwW2qbBHtXliGSpRHDKEwf7TMPKGeuDovsPY95dXsf6Ozdiwdavivi2aN/MMpz5e6m4oZUwntd58ej/2Pd2nvguEfViwugFdq+JoWVJPVyG9vF7UNxkoGxrKZdJJ/M62754LgDa7mMv+e+tMjNf0Psb3uCc2QoYQp6eOG9RT0VSOtwGnDqVx8JW30P/iy+oHLcuX4/uPPY5AhEDNSTIpxzXHdQJGLo3nH/gzBj88yft+9Hx7OXpuXEzu2y7lCLxEywkIw4BZKCF1xsN8JveVP/SqRHbPB3MDGNv7Qye2erw7CWCLJzxJupdUWKQZKHw9GDPpB01cW7g2Iv3JAP7x4ANIf/yxopWAaFm2hHJlGXSyMLJn8Mwvf4f0wBA13YwbfnYdWhaFHEuJcyvKkbrlimMFg1GLIIq5CsYyQks7SRGXiFwrt35YEwBqXzsmMTrQNE5tM8rM0r5hhMjjSaSTo8oXZBgTk3j36accaigQj6Glu4OyZfDMz3+Nwfc+cqy0pIXU8VYTnKzNi+vwtR8sJ9hK1Qp20VCWGEnrMMq6WEFotOtCAC7kxDukHvCGCyrNaRIetZm59w+7cfDVtz+Vk8bkJC3yIH70x99j35PPVoWXkT6WPu/59PEsAaxwahDdqUU0nQGWMxou04IBkexe6nnXvD6Qevl2iT7jmqbHQx3iuD7O8Fn8T5/IY+DNT5w8wBywcP366u9j7e2IdXQ44aZCPzCFRvQD+oJcK98wZZ2iAQpIHUsh1uShL2gujcqkzwyNQEucGfHDtBgGSKNVP+5PzheFNrICjHuC5L1uO6XYdEmmIrhNanSidcUV9IEGxyckzp87yGuVfW3TDa22Qxmc3f21LK5XmVolN7HAdDU4awb9FeSLPsEnheAjc9ZCqiTmkx4WZdXAXc2uVrVEcDYtOpoUQV1wakoGVjmg6HxWQCpOyWxbs57FOZ9n6WqW3kK+isJvmri+lkS2VlDrPtlQcxU/W/iy4vRg/xAt5EfXuh7O9eqz0oUSsuxEFwFgG64lKs7v4VrEFdzISzYeQ7TZh1hj4GyduSD8TKLCLgJIzAvAsqy4JgC8plvbWCoBadz8KHn/yuN7qklMjSd3M+pEsP72W7DujpudHKCAOjWQbU6HymlLmHTkFA69fghH3z6JXDo/4z/NQXzl1kVYfXXjeYbRKINZ0XtqKyUkCkjRojRqK429sest9L14RD2z6KqNaiqnP3IAR/b04j9PPIX+l17D0mvX44obrqGftDvFnLKEgdyZEWbtfvQ9/y5yqVx1v/rOBOo7EgzDGQzzXa/uPEKLtOG673SeZQ0BUDE9NdRCiiqaaumU8ARy6uCwEj4YjeN7D+2uCl/N3qeT+Odvtysgfc++pKbSaFsDLRJkAjt91vMi9NV33ovlGzcr4afHiXf24Nn7bsOB14fRmQihe0XIVSA5YGq0QE3FnOWutsRXR/t/6lffbfrFw+cJrwSiEALMscZzShD5nBserz4jv2tb0YM1t97FCHZBJqhnbt6xE38liH/1DqH7vu5qT0z+S55DzRSySizgvBZyowYTTU5pbc0tW+Ysa0UwR7gdl9zfilUEqNBp5FQBTY2assDEpBeVci0tpW3J6QHMksQtCxPpgnMacP3mz+2YRECoDD1UUFSWJMb8JhTaUwuF3pNVmm9fmBWi6fQHR/b2Kq18HkN8SsbEuEQuPybyjvZJoWQtTqxQGsxPYSGd6xPZoaSan+uQUppzPOtTFqiUtb21nErIgVOyzOhXKViIxr34okZzq5fOqyE9RgAlTRy5d/5E5lDmUZri4exwGZPDaVyzIcxGSYNRtDGcquDE8dK8mwcZsluDM9cn8jU059yju9uP1jZHpFyqiGNS1xWiQp9djC2Z+VtKJ2ztKk8Vd5z56HhcAMmL/SGvOhJZtMiHJlaPH7xf5EtnUmU9K4mr2eO0MnQvinwKt0sOkP0jwHDxfOHXXBlEJKKzDtMRivlRyJWQzxQRxSBKZvtzNfXEQ/sPTn8UtPHGRBxdV3XAE/ShMFrA8X3SiBcVkIGBktL0zV2MHLH5NSwg18hscID8fdABpXIA3yfCh+JBLN/UzV4kgIpRweD+QYwNjKPZP3TvdFtZy8mcBPxEXXsdEptWwtvSDi3WjnCiC0tvXA2P34POBT7UhzX8dGVtwp+XtGile5YBbUFH+0Ibee/Sb63ifm3Qou3wNnVg4XUr4K9TRd5GdS5VIwA5HcPCa7uhBdn3hldAr1sDLbQM/qZ2NK1sUw99cykbEc+lO6n8dhNLHtG8gIgnGvl+7hfivtEe6JHV8EY7qvu5IGo6VlFIQ62sCv0d0KProPnbWBkPMqpVULdgEKkPhjBs6hgedenhcyhyMcMwHSrVxx0t+KMhdUgggovS7PK4KsWjXSdx+p0T04dsNQGIu0fOqp1UJxBsKWWVsyFvwJE04/fhw+HS/xQqA0EdyzpdM6oOzOe0rzrBeCvsMwLznj9fCICk3B6zWGDLm4FdPE71FGmBU+qsZ2okqx5atT6Oq25agIH+Cc4cTg3kaxI6xtzSuTioqs3OLj+Kk2UkD+dhGlIvTDj7idCVLK0wxv0ylwZg9PAptPZESBtTWUKacbuUQpYNiQxfyIco+/q1X41h7Ya46qAmxivIsQQwCiZGThdVPS9almNDyaoLFgfU3wpUecksn53w4uhgiK1THpljo+jaIMfUh6ms005DVE5X9+PYUyuAJyQSnX7nJOpaIwi3TbFF8Ki2MPX+ICaGcowYXhStMM6kbISDJmdJTgUJSEM0Ik2+D93LAm5n5f6pSP5sVCrDLNsYzfgweCaAbNarDuMaPAxHk0Ucf+0gFl+/nDRKq5zk7KcsnrwYAPLgI2bJ3PbxC4fR2N2AaGsYmcEJjB0bn3a47RKtmOo35ljqiiZ1zYZf/lKj2wi6jbhzGGFjqqCjaHiRyXlZGnvkGJ31jSZFWpLGuD/gL8qefaOfjMaNbAHRtjpMpPKYTFVpeffFHu5uV41E2dyW/mgE6ZmzqYz7sl4F0kQPFXuXHHlYlpbIW16nezL90424akTU6lSUUpQlpTTmd0+co1U5id49mZ5KcJ67355LOZ3e7v4RbrMbmZKu4Jlz/EXmdhZcCWo8QSE3KoqbqoavguA8QHAH5jjzl3tLZiWtA3MJfsGTuct/6L4M4DKAL9/4rwADABv43NkDMpfIAAAAAElFTkSuQmCC'
    ],
    '19': [
      '[吐]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODcxMDU3QjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODcxMDU3QTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '20': [
      '[偷笑]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODcxMDU3RjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODcxMDU3RTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '21': [
      '[可爱]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODczQjg5QTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODczQjg5OTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '22': [
      '[白眼]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODczQjg5RTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODczQjg5RDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '23': [
      '[傲慢]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODczQjhBMjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODczQjhBMTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '24': [
      '[饿]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc2NTMwMzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc2NTMwMjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7ghFo/AAALjklEQVR42uxZaYydVRl+vuWuM3edpXS/nS5ikXYElxJARoEAJgb4oRE10iIh8Yexkhj/OTTxhyFRQKMJRELVPyYErQuGKNIBAwgITPe0FGawnRlmxpl778zd77f4nHO+7y7t0N4pJYakJ3PmfPt5nnc/52qu6+Kj3HR8xNslAv/vZraeLPzrvgv6iGNbg65jD7m2vd1x7IzrWEnXccQ18Hzcld3JcTzAcZ/r2qMcIfxPPMN/UOfqGvx7PG9tW3YdPDeBZbYM+072uzVNy8hQoPGP3RUHXuMR72kZ7/QO9mH2HPte9kfYxy+aBjpsSfaHPPAKpGnBCFWhBWrQeawZSqqCipSu7cKuuKgX2UsuaiX5jd0U8W6PyJ4LJbJcHxCgx3zweqgCM5mFmSohkHBgRgPQg2HeiHg9xB4kQRNml4FIn474WiC1zkE06UBTs++ktYhvPvBhaqBN6jqlrUcrBGZQ/FF2MerKYChxTUjftWR35VhvnItHjKiGroCFSLyO0ryDQlbOIUzrdvbPeyZ20QgI8PvZB4kMRmyRQtUFCoIJSwmTCW1fEXAb4AnaqfGVGscqr4tzTZHUaWIBpf6unhpCYQv5WZpXjXO47pu8fCf76MUg0ACvGbTzeIFYgwq8HqXghZmQhBZQWhDu6xKcIyRO0AQOpyLvaRylo/uBReeZ0KAboOm5SK2okQRQKQmnl3N+shO/aCMgQ5rvmLoAhCca4BMLxEGwRrfsmhnj2KWISC0YynEpaR+4ZpfgSmJKO5pya48Ej4TlyVBqUpEOkr1VSaJU0ig49w+dmNO5NLBbhj3NoeRzHvioBz6O/FQOM0deRXVhEeFkL/oHr0Ni/WZpLgI47CIhUvKMq6racvlsEZMHT6E4t4hQl4nEZRH0bYzzeyJSGdLZE+kqTclAvU5zEgJ03TvPRUBrLebyL32rGeM1/U1OnjTis9AD5GkKySc4SQJvPfsSwR8762MrBm/AljvupQsskoDoC95xAdOHD+PkP149652udBhbb1oNQ6P2qzVaXhVOuYaZmQDzmQjD0h/2yUR2z6Fza8CuV5V5GuYwqSX1qLB513PUEDmFMfbCqxK8GYljy5f2IJxag0r2NE78eRjTo8/zejcGbvkq51XmBL3O55vgB26+H8mBa2CVFzD27E+xOHkER/9+GttuXQPXoBbYdVNHMlbDfD4gNPcQZbxvOSaUYfrfqTFSGOGSBC6ijCBRLVQx+eYhCf6q+55EbNUVjZe6V27FG499GRMvP41VO25DKBaSeUD4x9jIi/KZbd98HH1X3NJ4J0Ui4h1BYnZsEb1rRVAQEc5AOFxHsGijWtf9jL/3vIlMODH7sBiNcEHe1WSMN6WTzhw9KZ9bd929beBFE+fiumgz1IR6z8Dcybdh0SwE8FbwUnoUxIab7pfH86eLnE9TBLwxFqn5yL77fusWvd2EaizM7Dtcm44bLXu3mz0/MSWf6916y9IxlxIVLTd2xI83KM5My7HviluXfMcntTBTVoUUu8wpJBBkZDI0GbIGvdrrvKXEEBNRUpQIfmJVFRrOknZpIY/f//xB/Ogbt8tRnKc8AiJOsiJt1kNswldEe2bvo/KdR3/wHcxOnGpowqo5KtBqWhuRcKDuVbyyEDxvHhgSLxrBWutV/rkNIKJl33kZv/jhj3HsFWXbYnz36GHs/P631UdDDLkiA8sSQmWuAu18/9P/xFM/e1C9gxflew+PvCEdOtQdUILSPIF5PcKSo1AJwrZxA688fD4f2C7sXzdtD7hHQEYUG+kBJcVDf/xJA7zf/v3sX/H2/l/J48S6AZWBWUqkN26Q16ZefxIvPPW7tndmJ/6D5365W4XTVKg1ujd6kFhEfiWBwfOakOM4YiHCuG83wKvaxpb1TXrDako3iOnjLy9pzxOjz8AMR9B/5XbOWKZAKujqTSAUj8lIk585ddY7cweflOPKj6fUnGdoW9FxYFsd+IAXhahFp03yqtep5iDWfnYb0gkNN+4IojuqnEOMX/ycOh+48VaYAeEDJaUF1kSbb75WPieeWdmnpgwGNFx/dUB+q29TAvEVESGuhtW2EpEEbK2DWkhKmw+KDGioxYgoJWR1KQo0rYqV2zYp9b7wGtavaqrdDIWw4Qs3o2/r5eRbbBR0orSIr0rh8tt24ORzr+O269uBrNzag8xn+gHLUqCX6A7Bi9sdOLHjH6iXNaUBUdOrslgVZiu3bUTPwDrkJ2dZ35QQSiSR3rRJkhBlg68xQcL1SKQzPbjqa9di/p1JVBeLMKiB9Lpu1kS6mk8IzfHXw2p+P/bT/jslYMsoYNdYhhmOt0jxwLg8dpoWF6Q59X9sbUspzRlsq83s5BrAWxcIMiYf7d/cy+vx5gJHlt+OR6KdiBxJolgyYNU7KSVcZ9ylCdlVJpAQP6ALErYE7xKAJjKkXwpz4okD44ikupHa0C+rTmWGvu9YbZqAR8ZtXLebmnZcpf22rkjYXARVa5qQzUgnJnRAjGLhHeiiM+u6isuwGpYllcKPH/nTMUyOvodUJo1P3dPdshPh5w27Eb38FZpKbh4BeIHCB2yrUVqBf40TLhZNJjlpQuOdOLFkWaUPRlO2qktkWncUII/E7Il5CT4QMfGJO9fJkAlNa5XEGaZkt2jE8sg1pe3aKtCr7shREXGRZUXKtQFNSHu+k2pUbDiN16taxio7MHVb1SVaS1ZmO/E3Fc8H79rIep5ZslY5gwDXt5U6pg7MYuZ4DovTJVgVG5FEAGH2SMJAd38QqdUMvWm9Ab6diC1D5+w8CQgTspcuqc32HTYp5UcI4KFSzkU8ZDGqagqboZ5ZnC6gnK+hd1McPRuiBFaBV7a2EXj9N8f5bLltsnK+Lnu25Vo4bmDLNV3oW8P3rVYiDubyQVQqMoTu5edznTgxvLp7uLyIZFeCZbW3JNTEP+YGH2dxrsKFTIGZ1/S2U5oEjv5lQoJPrO7C4Nc3yrGx6psoojzPte9ECe8dnJfnlQJBW1ozXpKIRemPnwqjVpUEfr2cBU2OviC2/IbzM0B6VV2VFHLHwWTGDElAYuJXHh/H2k8nEVsR9rRTxanXslLKwj+2f2U9wlELpakZL9o4CHF5Gr5MR8+aGDYP9UEPh1Cbmkbt1KQE71rKiSfeC2OxINfGIxTaSEdr4pO/vbp1O0Xsz2TiKQddSdqPWBd7Sz4j3UsTeQf/Pbmw5EeFeQ3eNQDdLTEFWC2J6gyH9QFLL+VxTY25vIE3DsdA18rxdmN75a7HDnW8K5GjxHZx5v0L83zItJgxHXEg47WzkMWO+zZj5kRBmkJru+zKFGJ9QdSyOYKve8lI7T77oVKBF2ZjeSZD8B6JQlHHwWPdArw43UPrHL/QbZURV5LAE1lhSv0WghFRIznS2cvlClL9MfSsjXPpG1RBoFIl6DIqE/OqMPOSVEMDtt3UgtW0d1ek2XoTfKmkHHep+n+5O3N7CeIGzr1zjivDeNJCNGZLM4JBR5vLquijeyXGGZGo0b3MKmO7F+fbTEhIvqBLsykVG+B3Xay90V3UxLvEMZyjOdVZZsQSttz6gKF7eUJrrqRaU4brm09rxlUkXD/icDw9FcLxt6OMOPK0Y/DL2Z1+gGDEZusTxQKSlbKGGDUR7aIE9TMJaM3VXJsGmiWD78j5BQNvjcWQzZliY1dc2sPPLGubfTk/cOyjEUgSFNxQNqthgUGomzVTJCyqV7yPBlqcWBRnrHTnCHhiKsJoY6Im6pw6RnlrV6c70h/kF5pxteHqDok8wVQ/JEIeAw5MOrfJRGfoLsJB28OtnLhU1plRTeQWTD+2y/KAwMeF1N9v0+rD+olJRijRxUKbkrtbbHlUHT0jhWyLuiXgL8R9M5f1vAw6dS0n6hpbZdeRi/or5QW0Ua9/jxLNUOoZYV4yWvr5qhnqR0lu9IP+qHfOTHzph+5LBC4R+Oi1/wkwAEO/yfwOD6nFAAAAAElFTkSuQmCC'
    ],
    '25': [
      '[困]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc2NTMwNzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc2NTMwNjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '26': [
      '[惊恐]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc4MDRCNjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc2NTMwQTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '27': [
      '[流汗]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc4MDRCQTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc4MDRCOTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6kJ9LyAAALI0lEQVR42uxZa4xdVRX+9jn3NXfepQMtM2WGFoid8piiCX9kOiQiGCOUYPSPCR0lJgQND/mh/rBIon+hiolGk5aQmNioNLFBBAMFSQQszLS1FfoYpq9xmOed+5p773lsv7XPvnNvB2hvS9WQ9EzW7PM+61vrW4+9r9Ja49O8OfiUb5cA/L+3WP1B9o1vn/cLdBh06DDcHIbBTdwf0IHfx7GPx3KNEmY4jlLGub9P63CX3Qf3YcbqPgVmX0f7y+Lzum8eODuA89y2UO5WytmslYYSMHJWKTgJTddSiVDDK6KDZ4dqiPWT/D9KeYayg5K5aB5ocNtMESX6zJEbwk1VoGI+FQ9ISms1rSJBZEm/qOAVgPIC4JcwwAsDxLiV4zbK4/8LAGLJ7RYAVNyHmy5DJeQgJidsSGnhFYVgtE/dPTPGmj3E0gpNlykEBQ+FKY1STt6pBcR9lHusZ/4rAMRirwgI5YRwWou0NpV1UpRkpDxBKP5pAyBSHpqeCSt0QplAXI7cdxTcFqAtrpCeX0R2JkSlIt7UI3z/sKXVRQWwxVKmw0mW4DTT6rEmUidNZZqgKDUQhGCs71uly0CwGIELXUhkyHmz8ZFYewqduojirIds2YX18CYL5KIAGLAvhdu8QIPrSHGaUMVazWj2xRMGgBPRxlh9ESooGuV1IMopG+h8R6gjqsljLUmkPR/x2SLm/CSCyGDHG42LswHos7Sh8hmoVCA7RozysXaOpLDbZkEkbJLxIsWDAmOYoKj8ErUg2YppUgJbQDB7oYnPVQig5GHFXB6zKi1Xt9p42HVeAPzyYlTdYnE4buy5iDY5qCRpo5oN55XxQCuVb+fTK2j4zsgrtiYaCpFWorxStZhQFG1jQynuUyASc6Ca4tDpJOKFCtqzOcynWqt0EhDjF+KBh6UomdSYziLHQBt94TCmj+fQta4bbauvxDW3DqJ9TXvkFUMOuwmNCMhYWrzheNBOxQQ0QlpbcVTMTMq1lKPEqUaSQiCpXAkteX6zuUWy3pMsavecLwBW1mCrBGQsPWsse2zvaYw8/665eOrgaTO++qtd2PClOzH08KNItrQsewUBqWQU3EIth1QK4+JajrFIeVipeiHBWElEQFoXshib0+jqadlsi+CehgCY8i1BFOoOJ1UyxUkU2fjlflr+Kn632dDn2FtjOPTS33Hwzy/g6N9ex9ee/gW6rr12GQanTlwjTKCkTqQ4Kzj3bbGTkSCQcJeA/PX5SQzd3o1Vq1IPnQ3AGc1c4JWkf3koDALEmnKWGo6Rnuu70XNDL3puXIehB76Ob/32l/TAF1HO57HzOw9i+siRZU1SsKyXsYpWBcvEdSIhkMPTIUq+xltvTlcrf1+jFOrTQdDn0PLKDT7crOpalU02J3DHD76Hnps/h7/85KcGxP1/+KOlUxhx3hSzKhBtn68BKhd9jP3jNKbHM5gZz/L2AF0dMcxXopvm5so4ejSHtWtbBcRT56ZQEG6W1Oa6i8t7TqO4pD+TTUIGpxQqpssNd9yGU++8Y+i0Z9tTuOOH34+KWFDiMyxaoVcDIsAo2ak83ty5F4deff9DCpUvT+J0qZYURkfm0NvbuqkxAJotMTnpqFLdJV1ned9atmwKleR4SZObHhxmX5NhnKyhnrmoZQj5DoLQ5n7P9kUBDr3yLl7b/jrKTJnJdBzrB7ux7uaVWLk6hQR7iuP7Z/Hs706i/9a7UMpnMDbyGk6dLEpBxfXnBMA+XlzrmI+6tcYMtrcJ/SgNUjmNqEAZOrEY3fXEoxGX/VykMEFoASlAwgjEoZf/iZeeftl865Z7+ynrrIf4/hLvL2m8dyxvrvcP3mVGAXDkyELfxEQBd54bQBiVfJ+KBtI2SLUMjeWUtb7W7GuCmImPqEgxXiRFmkyDpRgx7YTxVMlQamrsNF76+YvmO7c/cIuxvAFW9bBUZn7z+ImiuWftxkF0rurF7m2PYWIiU+2GM2fNQtrOouBbWdYao9pZGvpE7QKCvKGNEV/GvBGEBXuPZLYSTh2ICurgfZ9F/6beWkxoC4DfK7HN/mCqjM7VvUZ52TYMfqWq3hAa8oCkuDKV9QIzvZMJS7WvV1I1Q8d4SZu+JojoYuYDjk2J9fHi2cauQqXXomtNGj3rO21chJaeYnl6md/7YKJm/eomsfD288/Cdqm7GgAgTRE/zOZKehQ4jo0BD9Pvs0K+PbVUmKJK6tZyPMdkcxJdfV3o3rDagCjnCxjdPWK9GLCSn6x5teoBWr+7uwkH9s0bPa7euGlJpzowA41koXGpjJ7vmu6Q1YR3UEGpCTz/xu8PYGzvZEN9+r1P3I2e/iswPTaBN3a+3dAzhUTcTHiuvObGpXMp0xI1CiAM95mu1FOIF8n1FDtKlneklPHC4DfWY+Od62oesF7IzhSQmyosMSjBItd1VYsJYKHMvT+6bckDkTdDptEyC1g2oqpQlgZ7670CMjkfq6+96QwlxQvMRh2N9EKm5yi5KaTy86aN1nGmS6ERe7K2lQm0dTVZzksatdxXl9W1BdVJfWjSrmSw7s90WMXrJcTa/nboPDMVO1AsFPHi3oUPKS/bYn6h4YWtUXph3GPXGCz60YvzFHrDWGopG9k8ryUjlU2W0SZdlmyWKi1dQ7WQ1VdkAUer6yLPFXmdRU3LXCDt4N9H9pncX912/+wxc+7jGrozPBAGPswyh1ZPFuLNaMvlaeyoazTFPZ2IeneZSQl2bbOWtplJ1Yo3oOsKoa4FrCSKshcpTxqJ6ELJjINXu/jTwRC//u7ty/WU/P/IuT0Q5eQd/GimlEwzjfNDC8z5WVpURDyySIsFdd6w6XLJymHdsa6zutQXzn3F4oY2hci7Wjwsx5Qb2nx89RqN6zjJa29rQmuLzPTMKsXGj1ty+agJTYaxIItNW7PNnehcmDH2U2I5Kq59NnQeH5OMEZcMVd8eL28ArVGY56vBqk12q9LG8r9qHL5blE9etgJHg5WolLFn5MDh4QuZUj7OWLi7nEwO5GNNaJkvSqfKFoNKVAhC6kPSjzKUpFmZjEigK9QCOay2B1GRkol7NdtgUShUtpa3ylf8yHqc1B+LlM+Q0cM3rr8O+/91uDEAYeDVHw5TgVfy7R0dznQF6bkC4zGyoioxFphizRQwXgfAqQsC29sYunnhEgDjgcXIA0IjQycByC2PJPaHV6Isy0m+4fz4J1lWGeWEWtz33MLKLmDyA4Jgj1NO0gOeASDTPySWATBBbfubIKqyomAE3jvTAxwNvazy7+g1jGVXlN/R6ArduRa22HvoYQLZnrmiC95cBm2zs2wxrAdkJUGyUsxOBz8KQBABQCU40wMCzJaMSdWG94LLma1dOb1DXcSVOZsFtLjyucKK9o5KUwptk9NIcC4sKwhKKGSCuQZAjFrwIyBt0tBVY0BABLV1f59J8F21CpN+q3BesP6YIXReK9WNLu7u4Uc38rPbK6nE0ExfN9LzWTTPzCNeKEaKWwqdUM2YDBJLD7r862V7vTKo1KaNKm6sfkJ30hkuvArGmeSGz7b6cDGW18ULt9HtW2RJvNjR2kdh01dGKlugR4pIFhcxmUhgzefvx9ovPAq/lMWhnY9g5thrkAXDrJNmRWrClG6h0mwaPWQ4d9rGWvfUhf7QcSE/cFQDbAut9lAplhwodiQRtq8wRdedzOPk679BfuKgAZDjiFgL9qsu6dKptJJxnFx/hpS5YMUvxk9MBgit2Ecgm6nMTWGg+hLNLUMeAzVzYiQqBaRUEMRHmVnGfV/t43271AX8kPFxm7r0Q/clAJcAXAJwCcAn2f4jwAAuB2xmoqIqMAAAAABJRU5ErkJggg=='
    ],
    '28': [
      '[憨笑]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODc4MDRCRTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODc4MDRCRDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '29': [
      '[大兵]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdBOUI0MTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdBOUI0MDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '30': [
      '[奋斗]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdBOUI0NTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdBOUI0NDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '31': [
      '[咒骂]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdBOUI0OTI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdBOUI0ODI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '32': [
      '[疑问]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdENkFDMDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdENkFCRjI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3Jp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'
    ],
    '33': [
      '[嘘]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdENkFDNDI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdENkFDMzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4comziAAAMAklEQVR42uxaeWwcZxV/M7OXvfbu2vWZuuk6SVuS0MRtkFBp1DYCeqrURaKAQDQpPQQSaoKEyh9ISSX+oBUiiYQE/QM1VEitwtEIKlokRNKgEloCOME56jT12vUV23vae8zuzHy8975vZjd2Eq/j/FOpI718453v+L37vZloQgj4OF86fMyvjz0DvoU//OQz2lJr+pCeRYoj3YOUQBpA2o90hCY8+eJXQTi2Igccdf/KnjfpcQxpr1obV3sOKPq1u8flrh8eF1dmoI7LPdy94or6kXYgHVhi/WElBBd4TP3dp/Y5siIN1HHtUAfR4Rn1207F2MsKQHwJDdLabV9/7q7Mqy8chRomEis2oTouOiTx3Z8/VfOTSPztN0cHzv5zqG/LvbcOA5AZulS9Nt+9Dk68/QGsXt+R2dq/vl844tDXfnBnBu0r89pPjx25Gh/QFobR7D+erD7Ur+jjceUL20mCudksIBNw67Z10LupCzTDAiHQ9oWD/DlglQTkpvNw9OAgbPnCOoh1NJJ/ZJAO4c3zjuMkaB7NJ79hXMIdqxhvfuJ/K2YgpkxmtxfKgiZo/jJoAQs0FLoA2lMCAGQCwJajYqacc8AkmkMHtzzQ+4gRvM8sh4HlmhDZ6essfU2A3mAiVZBR3EYLIjWw2WgM3gVNmqjwKMmGQBSpCSBsOlBMCSikBdgOC4W0+ehyHHk5DGxXTorStsBC/x351whkJ7MoyRJEV7VB+/pe6Fi/FmcoyRNwBzUjyjwKpNxkCiZPTUNqNAe+gA6R9hB09obBZwfAzKN2BUepXUj7riUDHng9XIBSIQen3jgJVtmqmt7ELNPM+2Pw6a88goBJ6gS6hPcmcl2C82+fg+mhC94aq+xAarzAtPb2FohcF4RcUhDvFNE2q4i34kzsgTea5kEYZQ9895bH4O49p+HzL4zB7c/8FppXbYTs2CQMHz0O4G9F8UTRmSO4MAypkSyD9zVEYNO3fsVriG5+eA8fcv4/aXb61g4HdJ19iM7ds1IG+jzw4TnQQwLVP8Xg2zfeBxse+xkDoqtlzR0MjP6e+PdxKOdR6D70d18zMtEEw+8M8jyaQ2vd64atT3pMjL0/D/4GHVrbbNBlBN6tEuRVMYCni9d5UmMOtFCFwg3kJrIyGjz8/KIFoZYe1gqb1PgUch1h8PlkAaNOnjVEjC68iAliPDVZxDUG+ELoGxHLjWYvq8hXHwN2pcSE6tyJ4SwORhElX8TwGGAGshNJD+ylLhdgKTfHpoPc437yWa3kF17N3Rt5LMzZyLQBDRilGkO2K8i9FE4vVfpfTgMxYdvPOraFGDJkCziTQqV/0cRCLgs//uYj8I2b2mDnPbfDyBlpKhqu0ZBh0ANy/YLr+F//DE9tWcvrXnruezWIEJKh8xhpthAg62H75cqTRQxwEnGcnVhBxvRAHqUhMK7rEgRStKdLSjg9xuPRP7wGZ959h+9nxkfhjV++yPfBWAfON5h8oUb5/NRfvHPeOvASMy/3eBXOvCf3aGwNAWdDZED36RBucCOd2M3JcWkTMqn0fZzKX184L+sZTffG6PXdPG/oT7svqbrV3QaP0d6N4B4Y7uiCYDQKcxOnIP3hsUVrAn4NWqPovDc0eeA18mK8ZwbkNv22XZ8T96H04xqGS83nwMLCrPu2TeALBlmapw9+Hz734IOw/rN38rON63xw4yodrr/jIQhFW1AQFa+EWHOPrMBPvvJtXnv/9megMRJl8A/eFcARoGdzG+NXNsikozwaA2W3hOlfspi78Fb/Tly4NxgtQyBmcYmgGQ2UBJAwJGJsz6dKMHjw92CZpUXcR+MbYNOOH6Eqi4g7D8WJIbALSQhdF4EPDx+G6dNDl9Tcuq2roH0NhuQKJr8yMm7iaGICLJmQx5opnQ9BpQL7bv3OqV1XzMRo/5uJcyNA0iMpqGLKq20qEG5vgb7Hn4CPjh2D7GgCStk0RG+8BTr7tjKBnecMnD37Hgz/7he8b0N7B6z9cj+0xtth+sx5SA1PYSlhQKS7Gbo3tEKkE23fsS/JXNBn8yOMKX1LlhJo+3FWnY82M0DWlg7yoQozNAsNS4NgcxPc9MBDHCYpvEonx5hhzamirQxTf/8j79nUuwnmh09C6vQgtG26CVpXo6Qd0pApywyhTA2U2wgBtQ5r6A7YkoH40lGIS1uMxZpzcUnsFmeCDkXTsQv4E0raRsAuWTl1P89aKF4Yh4autdDzwDO89/zYmNrDkvuC4yJWZwmVvBYzouFcy9biS2qAGnAqiMERcq3meGUxcFXpQ8sy5Bw+1OIqU2pAc9UI86PnZYRp6YSGztUy9M4mVZFHodFSUneq9T6NjmuyFxPlA9uqoxqlPOCOGkuf/IA6K2xW6HAwWR7MGz8nRy+rmK8rgTlsIhzXu9awtgLRVihnU54GRE2D40rfA+84qpMTXkNTKBpgVepiwGZJOljqGhRGKTOypOhQjM9IrHlSti41o7H0jZoeWEBxelzd2mxmAQyrLgPCbW7ArpqRTKA8XkxSO2ZZA8ta3PQvzvHCSQiUul0WYASJASJNqVxjgWm6Ky0EoFtsUuzwngkhtNK8ajf97A+uk8rcUKnxq6rULyK7el80pfSREvWY0Akay3i+v9GWfTEDw8Mcjd2emSDf0JRvuObjJTwhbZ3DZxfinPcYKM2mIUTlgmdCSvoEmEONLe9rmJjLByg9kAberiMKiUNkf2YBeIUgz3HciGFJYKo95GjEVOTExaNLQnkcP8ur9XhLyc8Fr0zHBb6QhC01lJ3zURJDONqRelrKBGphANXVV8k74NftqmkYHpsMSNAPBAalnxuZheTgqLdJeb6gGKCQayjAAOlzF5AJEyKrYx54YS0A7RI+N8s6zCT9qAEtg8pdmgFHFu/7Ed3LxTkBfmxkOBBBDROi5rUJm5EGZaz/5yeTl3Ap0ojumVD6g2n0rwpEejCZWbbUMIElbRMjVs09MvDRZCOUpfnsr6+plzH5EP67tzivxULoBwHNkmHTDXeG4WlB2rwObRs6kDqltnDOh28OQn4qy5lW2LpnQmvu+xSEYkFlnlXA1dHyNELSn7gQYOkjnweW01LS675d5Au5FGFAraDURIUID6koqblxXL3v4dFxE5SomhCRSlbhtkbuV4Sl9lEkOMxYVcL5Z8+j9E2Nos/+y703vVJPfEA44gh5fy4JDJ6YgIrLSEUeblmevV5UdngMSGd3fYKAigXAvb3o74oMGiNjIZiZ9SMDkMAj9lXk0VCvD1TfRDvw3+I8xHyGA+EoFXII0vBx2ycMlSPQiTVVv7uuYptWlQHkpTwnM7OnPc95CbjNQV6oZ1MzAfgg0UC2n8E/H615C77sF1sJzLfb6G1ZLqPHSLLhCDHgcOMNhi0zNZJA8PnZAiTPJSE3nqvxqbIbgLDJQdtHVLUxv+q8VfCDZ8Mkefpzl3oVv6I3c7iB2Ib54XA2o8UqWGJEsNnR/YZs/VAT5ZIN4ydmmAEOVMEQNF2/CsLdMQh3RRFwDvsLA/sGE3uBWWjvxebIUiHUVg6MmiWpD4+GOOpgRVPPx5K6Xy0yE/R1pVDQYmZJhxbs1gIhEqgD59/F0FhxsIPrgK6tD0DLLb34YApNYhalm2afWHPvLXDujdOQHJmD1k4/V5eu72SzBgwNhyGd8VHGzeBPBP7QtX65O4CRoZfe1KHA+meSBgT9DhQwVBL41tu+CDd+6WkQpTG0mgkV/0uqfLbZfFriLZBOpCE3VYDYdT7I53UYm2qA8cmgjPUVOILBZ8dyvtQs9ytlhl9/CyKRoApxPmXyg577n+aah5ocKp9lT1xWoVXWOs1dYZ6bnNVg4FQTHD/ZDKNjQSiVIIPgCfi25X5mutrPrKTeXqtgPk8lMLWMRhCVaWHR5uSV9E3ZAAnbKxkMVYqk0FSSaR8C1wYqEnhLPfZ+Tb8TZ4bGsEWc4dqEbF9Kvip92XpWZG7woo4MRz5hHsJoTeZ429UCv+qPfOn3P1r4wQ/K6Qnug+k1iiAG0Pal+djKfFTcV91e0CiduJovktfqK+VCBrbJmr5U84ahppxQ37q8RkWt62mSlWsiu3pFALRP/rPHJwys7Pq/AAMAdcWKJMOudbcAAAAASUVORK5CYII='
    ],
    '34': [
      '[晕]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFOEUyMkNCRDEyMjA2ODExOEE2REFBQjY5MjU1MDk5RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2ODdENkFDODI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2ODdENkFDNzI1NjUxMUUyQUNGN0RGQ0VGQ0Q4NTM3MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDU0Q0Q5RTIxMzIwNjgxMTgyMkFFNUVEQzE1MjNCQkUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RThFMjJDQkQxMjIwNjgxMThBNkRBQUI2OTI1NTA5OUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5vpUKIAAAMIklEQVR42uxaW2wc1Rn+ZmZv3rWdtR2vk9gJm0vjUBwIiilJW4qpkCCEFFdt1UpUIg4SQmpFyUuFKlWBJ6pWakFUFU8kfWgfqqp1ilLagki4FEGgxIlDQkISb7CdOHa8u7Z313ubOf3OObPjSwxeotAKKaP8npkzM+f8l++/nY0hhMAX+TDxBT+uC/D/PnzzBybffuSqJnLs8ibh2F3Ctm9xHDvO6yhJjoGU4FhCOE6a10d57hXC7uMZ0gflO/wDfa/HUHnG+9nH+p5jny7AZzzipJ2khwzDiKtwYPAfSVzxnhF3r7tJe0hpUi/pKVLimlmgyiNK+o3LvDoMnw0rWILhL8L02zBMW9pFaVaehe3ALgClrFBUzBpR9b0QO11Bdl+NIFcjgNTgXlcImEEyHM7DsKTqpUsF9VuScUH4QMKjTKvY8Fll+GqAmkbAzpeRpw1ySfVaN9HS7Vrjyc9LgDlaV4xHqHGfRcYj0gQky31VKK4U406Z5yIVXaIhpIC8p3UsChKhpWrqHeTGBTJJ9aGE1gOku1yIXTMBJPMHSZtgCFj1WZgBMmuFyUyIjAepfD8fVwRwFPPCKfI5ySlQkIJ6LoS8L3mrmxQ20iwQrClj4hLhVeQaQgy4QvRdCwE85g1CwKrPEeeEiRVRAhhmRAthBmYsQOYlk4aT5zkPYfj1M0LMcFwHd4S2lM9HnQj4wgKNy22kLznI5xAVes1bF/OLKwRQIa3imKZiaG+FeSeQxNk3L2Do2EWMfjTivdewqhUN8VXYsG0bGm5YxUlKmnF7mmcKbFPzMjy56Mqmchh4J4Hh/hGkhqdmNNVSg9jKMGLxJsrrp+LEXxeDkzG/Fpp46+HZAjyucE+1DZ4+iiO9H6A4XfpUc23YvgObH9pFL82SMhQio876OofjL/4b/QeOLmr29V9pRUt8icwFvfzzbW98V3/VEIrz4z2M7/j45DEc/tMMHFs2rEbsxnY0rtmA1OBlZC+PY/CdNxgaM/jwwIsI1Dbg5u9+T2ndgJuM6NTv7H0J5976wJunbeMyRFdEEFtbj9EzSaSGpjB8Qnvz6cPDsPwGmlbUdruRr7cqCyRf+6GuMSzfXppg51TqIl7+3StqLNJUhy0929Fy00YueJniRxFcsgINq9uRHR3BoV/8DKmBMwhEatH9/B/hDxKO5QlFg+8exuvP/UFDrq0Rtz/YiUiDpRQgfSYQMhFtDiH18QRe3XsSpbyNUMSPzvvW8rlIkM3V8tv2h49XZYE4U/9OmYzOHD6pBgI1Adzx6DbUtizHS3t+y4Uuei9v//ULFGIdOnc9hpd//piyRCoxgJYb10HI6ETq33/QU8I3d29HKTOBf/zyFWSTOW+eHU/cpixy6z1tOLz/PPLZEnITeYbaYCXj71u0mHNrlz3ybIUyGP7gkhpfvWUdnbUZ/X97Yw7zUtuSFLQ6Ni0wvYlirsBvLqiRjTu2IBAO4f2/HJnDfKDGx3EprIFINOiNh6x8hbOfLNS7XGEBm4GYztttMOQ5xhSdtqzGY+uXKWbSg6Mav52d6HqCidOq87499+pLs1Wh8wHPqfND3mikaYkqmIaODqr79jvjuPWBL7mhl5ArlTB2PjMT4ZosTBVYhghjk1t7JRYrp7vodFEzmEf64uQsDQVcprQWRk+eoOO+qUMmj0vH+/DeC8+p69rYMvpJBy1Z0hl5VmnX0r7SFURbTTrv8PEx1yMNjA5M4dTb2uqxthpE6v0IB/UaLFC7q8kDXXIii0XZvCeqvmm/uxOXTg0S5zm89qunOf70FRrY3PMoTTmtMjBkNhblmVmEtsqa29ei/+9HmQcm8cYLCyfcm7YuVdVtkIXiJJe3y7iTw88s5gO3SPyb/jIaWmu9cYljqc22TWuxZdcDCsfzj0Akgq0/ehxtmzepmA+HQojCHAFGT51Xiui47yZ0bLuRlvVfMY8/ZOHr37kBzavCCm4BmURpSNvGpkUt4DhOVMZ+U5bHfh8ijSE6Wx4Db59VzEtYrPlqB9bccTuz8QVkx6eYB9LMxGsQY3gNhMM6cQldAwk7T/9p9eYf6jvLuB9Vyui4tx0d96zmPJc4T05RtCWE1nX0qwILwELBg59Bf7LLZry6UoICGLJooYFW37YCx/95juXDII4f+A/at25G0PSp8rmlbTnEhrV8N+BWo1JNk24pXdLFnIJRgUJvZBLrx6lX+6mUIOdtpaaZ6soGli1to7eyZ1hfhBPk98XijN+4JyWAbVVRC6nFDeUxvEH7N1Zi4N2LtMI0S4A+RbOPxlgMOx7ZhfINDRBBf6VS07BRNZEWouP+TgwdOc2oVsD7f35P0Zx56ptx/9YH2T3kYUcvw1nOgtQoKB4kObaBcrmKpl71pSoX6A99+RDuXH8/YkuWL+hoydFRTJ+7gOCJj2Fm027dI+ugnCb6gWBhF2kIMoHdyyzcsPA8k24kKlOnI0shjtwMZMJaACj8LyjAJ0LIKTqwfA6c03UIW0tw1y3fwuR0CmMTIyjLUll2YD6BZW0rUFtbr1bwjSVRXB7xIpaQzYvb0EhrNKyoxX2Pb0P2WBEXB0YYyTheog4Jo5YlK+clJB+cwZUwVl1WQmRzFsqlavoB4bDuMGAX2bgEHU8DKqnUNaMpuoyC+ejkFCDE5zVu76vgJy2Xc79x3K7M1lBSxCaHDVFjrImQiQHTLLOnTX0uUGm2PR/PCsq2Y9CnDRlG+6qB0FFphVKOVSQnNDeMwwiXFi1/hVTkkqILGzeEug1NJR9Ip3asaZTD2cXbKItWXjaghMhkfSgXFYT6qnHiQ/JcIA9hCbpgAVYXY3eiCRhj+MtG5r4fsGHHcig3M2RanjE8GOlMbCvrVCxSjI6wPc7CGm+AOV03bz42QrEhGA3naDAyUXKQnAjJCoMCGK9V01LKDadEqWDEbdYglkkhWJdj/RgcWsNhjWTnQ6pFFDU61KpWUe5IOIbeGHJLDuFBqSJIBVYOynUplCPjQCvvaSAjQ8wH0nSXkqqHVCh1ITWW9LNXNuRt76IQkjjkwr+X0SibgrKbkJaQ5GhmRJCRJZhzy4SiBw8hE5cifV95VsG/JlcQOZdcSxIlcIKyb7C9cCPkNd8ZTQaQz6sQ2rtQa2ku4MSSniGlpzN6/0ZNWOJZkm3PaNTdOvHivWK06EUdtfvgMV72tE+v1MxLJmeRpyhbC1Jm7E8MhlAsKAGeLZWq39xN0xeelUlt4jIh4ZpVMI4pQVztYBau5zI6n2mXcVfrMpx4zLqK8e4ryuK7wyNBZDKWXFr65aGqdqfZiSkijJ4hJQoMItm04+LSFUReVwSRDDkVBivWceaO2RVoaC171lQMlzTz2kv1M76bnvTh7PkayHKItz0V+T7LvhA9SvSQi4OTaQM+FneBiFB7OGrnWGrTNBUZprujq3Z29ccZFoDZZIEZOIDaaEBndme2FeR+qasET/Ml9SzDpHXsZC2KeWWs3ZwzcbUbW4eEEgJ7U4RSIzOrn5HHsOSunCU7f55NJidXAEMLcOnsJP71/Mzuw90/3owVK30eNLTzOjP1wSzNS4c9cTqCXE7hft/8+v9qfuDYR0vsk+uOj5lssm0V6lS4k6GuQpXQx/GTrw/PmeDEwUEEY0vVM/VtBY7ud8KFTyZr4nBfPZJJVTZIzPdcq73RHlriPNGzJ50yUWJ+qKsvspwwPRjpElxbIOA35nwcjARg1deR0aKOQM6sKGTrgDBEhz11JqzDv9Z8TzWMfZafmJ5UO2QC6WzWwNgorTFpq8ZDeRpXFpJ4v2FzFIGg6THf+f0OlJMM4QWtefmOsiC1PjFh4r1jdfjwozBkwKDmn6qW+av5faCX+VXWI3uZ1rtSaQuTUwK1LOhCbLx9PqEcuSFq4Ac//TLGsyGs/No62OkJFM4klICqOCsLjKf8DJNhpCd8ckdaIqmPj3Z/Uri8lj9wJPSGq+iS+/m2bXSlp+igbKR8lgOfKcsPgdDkFAJiCiMHxtROdI5VZ77gV+FxSsd2VR5Q4wmi6KmFNq0+z5+Y4GrqkGy0qbmHGO67C44ZdxxTdU+2HdBQr6QLHfLd0G+kZV3D6/3GJ+x5/i8E8Io/l3ZTo3E6epyMdc3OX3alQmA5zPIgYVTxw0W1h3H9vxpcF+C6AF/s478CDACKPWIBw10QpgAAAABJRU5ErkJggg=='
    ]
  }
  //工具类
  var tool = new function () {
    //格式化时间戳
    //format格式如下：
    //yyyy-MM-dd hh:mm:ss 年月日时分秒(默认格式)
    //yyyy-MM-dd 年月日
    //hh:mm:ss 时分秒
    this.formatTimeStamp = function (timestamp, format) {
      if (!timestamp) {
        return 0
      }
      var formatTime
      format = format || 'yyyy-MM-dd hh:mm:ss'
      var date = new Date(timestamp * 1000)
      var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds() //秒
      }
      if (/(y+)/.test(format)) {
        formatTime = format.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      } else {
        formatTime = format
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(formatTime))
          formatTime = formatTime.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
      }
      return formatTime
    }

    //根据群类型英文名转换成中文名
    this.groupTypeEn2Ch = function (type_en) {
      var type_ch = null
      switch (type_en) {
        case 'Public':
          type_ch = '公开群'
          break
        case 'ChatRoom':
          type_ch = '聊天室'
          break
        case 'Private':
          type_ch = '私有群' //即讨论组
          break
        case 'AVChatRoom':
          type_ch = '直播聊天室'
          break
        default:
          type_ch = type_en
          break
      }
      return type_ch
    }
    //根据群类型中文名转换成英文名
    this.groupTypeCh2En = function (type_ch) {
      var type_en = null
      switch (type_ch) {
        case '公开群':
          type_en = 'Public'
          break
        case '聊天室':
          type_en = 'ChatRoom'
          break
        case '私有群': //即讨论组
          type_en = 'Private'
          break
        case '直播聊天室':
          type_en = 'AVChatRoom'
          break
        default:
          type_en = type_ch
          break
      }
      return type_en
    }
    //根据群身份英文名转换成群身份中文名
    this.groupRoleEn2Ch = function (role_en) {
      var role_ch = null
      switch (role_en) {
        case 'Member':
          role_ch = '成员'
          break
        case 'Admin':
          role_ch = '管理员'
          break
        case 'Owner':
          role_ch = '群主'
          break
        default:
          role_ch = role_en
          break
      }
      return role_ch
    }
    //根据群身份中文名转换成群身份英文名
    this.groupRoleCh2En = function (role_ch) {
      var role_en = null
      switch (role_ch) {
        case '成员':
          role_en = 'Member'
          break
        case '管理员':
          role_en = 'Admin'
          break
        case '群主':
          role_en = 'Owner'
          break
        default:
          role_en = role_ch
          break
      }
      return role_en
    }
    //根据群消息提示类型英文转换中文
    this.groupMsgFlagEn2Ch = function (msg_flag_en) {
      var msg_flag_ch = null
      switch (msg_flag_en) {
        case 'AcceptAndNotify':
          msg_flag_ch = '接收并提示'
          break
        case 'AcceptNotNotify':
          msg_flag_ch = '接收不提示'
          break
        case 'Discard':
          msg_flag_ch = '屏蔽'
          break
        default:
          msg_flag_ch = msg_flag_en
          break
      }
      return msg_flag_ch
    }
    //根据群消息提示类型中文名转换英文名
    this.groupMsgFlagCh2En = function (msg_flag_ch) {
      var msg_flag_en = null
      switch (msg_flag_ch) {
        case '接收并提示':
          msg_flag_en = 'AcceptAndNotify'
          break
        case '接收不提示':
          msg_flag_en = 'AcceptNotNotify'
          break
        case '屏蔽':
          msg_flag_en = 'Discard'
          break
        default:
          msg_flag_en = msg_flag_ch
          break
      }
      return msg_flag_en
    }
    //将空格和换行符转换成HTML标签
    this.formatText2Html = function (text) {
      var html = text
      if (html) {
        html = this.xssFilter(html) //用户昵称或群名称等字段会出现脚本字符串
        html = html.replace(/ /g, '&nbsp;')
        html = html.replace(/\n/g, '<br/>')
      }
      return html
    }
    //将HTML标签转换成空格和换行符
    this.formatHtml2Text = function (html) {
      var text = html
      if (text) {
        text = text.replace(/&nbsp;/g, ' ')
        text = text.replace(/<br\/>/g, '\n')
      }
      return text
    }
    //获取字符串(UTF-8编码)所占字节数
    //参考：http://zh.wikipedia.org/zh-cn/UTF-8
    this.getStrBytes = function (str) {
      if (str == null || str === undefined) return 0
      if (typeof str != 'string') {
        return 0
      }
      var total = 0,
        charCode,
        i,
        len
      for (i = 0, len = str.length; i < len; i++) {
        charCode = str.charCodeAt(i)
        if (charCode <= 0x007f) {
          total += 1 //字符代码在000000 – 00007F之间的，用一个字节编码
        } else if (charCode <= 0x07ff) {
          total += 2 //000080 – 0007FF之间的字���用两个字节
        } else if (charCode <= 0xffff) {
          total += 3 //000800 – 00D7FF 和 00E000 – 00FFFF之间的用三个字节，注: Unicode在范围 D800-DFFF 中不存在任何字符
        } else {
          total += 4 //010000 – 10FFFF之间的用4个字节
        }
      }
      return total
    }

    //防止XSS攻击
    this.xssFilter = function (val) {
      val = val.toString()
      val = val.replace(/[<]/g, '&lt;')
      val = val.replace(/[>]/g, '&gt;')
      val = val.replace(/"/g, '&quot;')
      //val = val.replace(/'/g, "&#039;");
      return val
    }

    //去掉头尾空白符
    this.trimStr = function (str) {
      if (!str) return ''
      str = str.toString()
      return str.replace(/(^\s*)|(\s*$)/g, '')
    }
    //判断是否为8位整数
    this.validNumber = function (str) {
      str = str.toString()
      return str.match(/(^\d{1,8}$)/g)
    }
    this.getReturnError = function (errorInfo, errorCode) {
      if (!errorCode) {
        errorCode = -100
      }
      var error = {
        ActionStatus: ACTION_STATUS.FAIL,
        ErrorCode: errorCode,
        ErrorInfo: errorInfo + '[' + errorCode + ']'
      }
      return error
    }
    //设置cookie
    //name 名字
    //value 值
    //expires 有效期(单位：秒)
    //path
    //domain 作用域
    this.setCookie = function (name, value, expires, path, domain) {
      var exp = new Date()
      exp.setTime(exp.getTime() + expires * 1000)
      document.cookie =
        name + '=' + escape(value) + ';expires=' + exp.toGMTString()
    }
    //获取cookie
    this.getCookie = function (name) {
      var result = document.cookie.match(
        new RegExp('(^| )' + name + '=([^;]*)(;|$)')
      )
      if (result != null) {
        return unescape(result[2])
      }
      return null
    }
    //删除cookie
    this.delCookie = function (name) {
      var exp = new Date()
      exp.setTime(exp.getTime() - 1)
      var value = this.getCookie(name)
      if (value != null)
        document.cookie =
          name + '=' + escape(value) + ';expires=' + exp.toGMTString()
    }
    //根据名字获取url参数值
    this.getQueryString = function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var r = window.location.search.substr(1).match(reg)
      if (r != null) return unescape(r[2])
      return null
    }
    //判断IE版本号，ver表示版本号
    this.isIE = function (ver) {
      var b = document.createElement('b')
      b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
      return b.getElementsByTagName('i').length === 1
    }
    //判断浏览器版本
    this.getBrowserInfo = function () {
      var Sys = {}
      var ua = navigator.userAgent.toLowerCase()
      log.info('navigator.userAgent=' + ua)
      var s
      ;(s = ua.match(/msie ([\d.]+)/))
        ? (Sys.ie = s[1])
        : (s = ua.match(/firefox\/([\d.]+)/))
          ? (Sys.firefox = s[1])
          : (s = ua.match(/chrome\/([\d.]+)/))
            ? (Sys.chrome = s[1])
            : (s = ua.match(/opera.([\d.]+)/))
              ? (Sys.opera = s[1])
              : (s = ua.match(/version\/([\d.]+).*safari/))
                ? (Sys.safari = s[1])
                : 0
      if (Sys.ie) {
        //Js判断为IE浏览器
        return {
          type: 'ie',
          ver: Sys.ie
        }
      }
      if (Sys.firefox) {
        //Js判断为火狐(firefox)浏览器
        return {
          type: 'firefox',
          ver: Sys.firefox
        }
      }
      if (Sys.chrome) {
        //Js判断为谷歌chrome浏览器
        return {
          type: 'chrome',
          ver: Sys.chrome
        }
      }
      if (Sys.opera) {
        //Js判断为opera浏览器
        return {
          type: 'opera',
          ver: Sys.opera
        }
      }
      if (Sys.safari) {
        //Js判断为苹果safari浏览器
        return {
          type: 'safari',
          ver: Sys.safari
        }
      }
      return {
        type: 'unknow',
        ver: -1
      }
    }
  }()

  //日志对象
  var log = new function () {
    var on = true

    this.setOn = function (onFlag) {
      on = onFlag
    }

    this.getOn = function () {
      return on
    }

    this.error = function (logStr) {
      try {
        on && console.error(logStr)
      } catch (e) {}
    }
    this.warn = function (logStr) {
      try {
        // on && console.warn(logStr);
      } catch (e) {}
    }
    this.info = function (logStr) {
      try {
        // on && console.info(logStr);
      } catch (e) {}
    }
    this.debug = function (logStr) {
      try {
        // on && console.debug(logStr);
      } catch (e) {}
    }
  }()
  //获取unix时间戳
  var unixtime = function (d) {
    if (!d) d = new Date()
    return Math.round(d.getTime() / 1000)
  }
  //时间戳转日期
  var fromunixtime = function (t) {
    return new Date(t * 1000)
  }
  //获取下一个消息序号
  var nextSeq = function () {
    if (curSeq) {
      curSeq = curSeq + 1
    } else {
      curSeq = Math.round(Math.random() * 10000000)
    }
    return curSeq
  }
  //产生随机数
  var createRandom = function () {
    return Math.round(Math.random() * 4294967296)
  }

  //获取ajax请求对象
  var getXmlHttp = function () {
    var xmlhttp = null
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest()
    } else {
      try {
        xmlhttp = new ActiveXObject('Msxml2.XMLHTTP')
      } catch (e) {
        try {
          xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
        } catch (e) {
          return null
        }
      }
    }
    return xmlhttp
  }
  //发起ajax请求
  var ajaxRequest = function (
    meth,
    url,
    req,
    timeout,
    isLongPolling,
    cbOk,
    cbErr
  ) {
    var xmlHttpObj = getXmlHttp()

    var error, errInfo
    if (!xmlHttpObj) {
      errInfo = '创建请求失败'
      var error = tool.getReturnError(errInfo, -1)
      log.error(errInfo)
      if (cbErr) cbErr(error)
      return
    }
    //保存ajax请求对象
    xmlHttpObjSeq++
    xmlHttpObjMap[xmlHttpObjSeq] = xmlHttpObj

    xmlHttpObj.open(meth, url, true)
    xmlHttpObj.onreadystatechange = function () {
      if (xmlHttpObj.readyState == 4) {
        xmlHttpObjMap[xmlHttpObjSeq] = null //清空
        if (xmlHttpObj.status == 200) {
          if (cbOk) cbOk(xmlHttpObj.responseText)
          xmlHttpObj = null
          curLongPollingRetErrorCount = curBigGroupLongPollingRetErrorCount = 0
        } else {
          xmlHttpObj = null
          //避免刷新的时候，由于abord ajax引起的错误回调
          setTimeout(function () {
            var errInfo = '请求服务器失败,请检查你的网络是否正常'
            var error = tool.getReturnError(errInfo, -2)
            //if (!isLongPolling && cbErr) cbErr(error);
            if (cbErr) cbErr(error)
          }, 16)
        }
      }
    }
    xmlHttpObj.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded'
    )
    //设置超时时间
    if (!timeout) {
      timeout = ajaxDefaultTimeOut //设置ajax默认超时时间
    }
    if (timeout) {
      xmlHttpObj.timeout = timeout
      xmlHttpObj.ontimeout = function (event) {
        xmlHttpObj = null
        //var errInfo = "请求服务器超时";
        //var error = tool.getReturnError(errInfo, -3);
        //if (cbErr) cbErr(error);
      }
    }
    //
    xmlHttpObj.send(req)
  }
  //发起ajax请求（json格式数据）
  var ajaxRequestJson = function (
    meth,
    url,
    req,
    timeout,
    isLongPolling,
    cbOk,
    cbErr
  ) {
    ajaxRequest(
      meth,
      url,
      JSON.stringify(req),
      timeout,
      isLongPolling,
      function (resp) {
        var json = null
        //if (resp) eval('json=('+resp+');');//将返回的json字符串转换成json对象
        //if (resp) json=eval('('+resp+')');//将返回的json字符串转换成json对象
        if (resp) json = JSON.parse(resp) //将返回的json字符串转换成json对象
        if (cbOk) cbOk(json)
      },
      cbErr
    )
  }
  //判断用户是否已登录
  var isLogin = function () {
    return ctx.sdkAppID && ctx.identifier
  }
  //检查是否登录
  var checkLogin = function (cbErr, isNeedCallBack) {
    if (!isLogin()) {
      if (isNeedCallBack) {
        var errInfo = '请登录'
        var error = tool.getReturnError(errInfo, -4)

        if (cbErr) cbErr(error)
      }
      return false
    }
    return true
  }

  //检查是否访问正式环境
  var isAccessFormalEnv = function () {
    return isAccessFormaEnvironment
  }

  //根据不同的服务名和命令，获取对应的接口地址
  var getApiUrl = function (srvName, cmd, cbOk, cbErr) {
    var srvHost = SRV_HOST
    if (isAccessFormalEnv()) {
      srvHost = SRV_HOST.FORMAL.COMMON
    } else {
      srvHost = SRV_HOST.TEST.COMMON
    }

    //if (srvName == SRV_NAME.RECENT_CONTACT) {
    //    srvHost = SRV_HOST.TEST.COMMON;
    //}

    if (srvName == SRV_NAME.PIC) {
      if (isAccessFormalEnv()) {
        srvHost = SRV_HOST.FORMAL.PIC
      } else {
        srvHost = SRV_HOST.TEST.PIC
      }
    }

    var url =
      srvHost +
      '/' +
      SRV_NAME_VER[srvName] +
      '/' +
      srvName +
      '/' +
      cmd +
      '?websdkappid=' +
      SDK.APPID +
      '&v=' +
      SDK.VERSION +
      '&platform=' +
      SDK.PLAATFORM

    if (isLogin()) {
      if (cmd == 'login') {
        url +=
          '&identifier=' +
          encodeURIComponent(ctx.identifier) +
          '&usersig=' +
          ctx.userSig
      } else {
        if (ctx.tinyid && ctx.a2) {
          url += '&tinyid=' + ctx.tinyid + '&a2=' + ctx.a2
        } else {
          if (cbErr) {
            log.error('tinyid或a2为空[' + srvName + '][' + cmd + ']')
            cbErr(
              tool.getReturnError(
                'tinyid或a2为空[' + srvName + '][' + cmd + ']',
                -5
              )
            )
            return false
          }
        }
      }
      url += '&contenttype=' + ctx.contentType
    }
    url +=
      '&sdkappid=' +
      ctx.sdkAppID +
      '&apn=' +
      ctx.apn +
      '&reqtime=' +
      unixtime() +
      '&accounttype=' +
      ctx.accountType
    return url
  }

  //获取语音下载url
  var getSoundDownUrl = function (uuid, senderId) {
    var soundUrl = null
    if (authkey && ipList[0]) {
      soundUrl =
        'http://' +
        ipList[0] +
        '/asn.com/stddownload_common_file?authkey=' +
        authkey +
        '&bid=' +
        DOWNLOAD_FILE.BUSSINESS_ID +
        '&subbid=' +
        ctx.sdkAppID +
        '&fileid=' +
        uuid +
        '&filetype=' +
        DOWNLOAD_FILE_TYPE.SOUND +
        '&openid=' +
        senderId +
        '&ver=0'
    } else {
      log.error('拼接语音下载url不报错：ip或者authkey为空')
    }
    return soundUrl
  }

  //获取文件下载地址
  var getFileDownUrl = function (uuid, senderId, fileName) {
    var fileUrl = null
    if (authkey && ipList[0]) {
      fileUrl =
        'http://' +
        ipList[0] +
        '/asn.com/stddownload_common_file?authkey=' +
        authkey +
        '&bid=' +
        DOWNLOAD_FILE.BUSSINESS_ID +
        '&subbid=' +
        ctx.sdkAppID +
        '&fileid=' +
        uuid +
        '&filetype=' +
        DOWNLOAD_FILE_TYPE.FILE +
        '&openid=' +
        senderId +
        '&ver=0&filename=' +
        encodeURIComponent(fileName)
    } else {
      log.error('拼接文件下载url不报错：ip或者authkey为空')
    }
    Resources.downloadMap['uuid_' + uuid] = fileUrl
    return fileUrl
  }

  //获取文件下载地址
  var getFileDownUrlV2 = function (
    uuid,
    senderId,
    fileName,
    downFlag,
    receiverId,
    busiId,
    type
  ) {
    var options = {
      From_Account: senderId, //"identifer_0",       // 类型: String, 发送者tinyid
      To_Account: receiverId, //"identifer_1",         // 类型: String, 接收者tinyid
      os_platform: 10, // 类型: Number, 终端的类型 1(android) 2(ios) 3(windows) 10(others...)
      Timestamp: unixtime().toString(), // 类型: Number, 时间戳
      Random: createRandom().toString(), // 类型: Number, 随机值
      request_info: [
        // 类型: Array
        {
          busi_id: busiId, // 类型: Number, 群(1) C2C(2) 其他请联系sdk开发者分配
          download_flag: downFlag, // 类型: Number, 申请下载地址标识  0(申请架平下载地址)  1(申请COS平台下载地址)  2(不需要申请, 直接拿url下载(这里应该不会为2))
          type: type, // 类型: Number, 0(短视频缩略图), 1(文件), 2(短视频), 3(ptt), 其他待分配
          uuid: uuid, // 类型: Number, 唯一标识一个文件的uuid
          version: VERSION_INFO.SERVER_VERSION, // 类型: Number, 架平server版本
          auth_key: authkey, // 类型: String, 认证签名
          ip: ipList[0] // 类型: Number, 架平IP
        }
      ]
    }
    //获取下载地址
    proto_applyDownload(
      options,
      function (resp) {
        if (resp.error_code == 0 && resp.response_info) {
          Resources.downloadMap['uuid_' + options.uuid] = resp.response_info.url
        }
        if (onAppliedDownloadUrl) {
          onAppliedDownloadUrl({
            uuid: options.uuid,
            url: resp.response_info.url,
            maps: Resources.downloadMap
          })
        }
      },
      function (resp) {
        log.error('获取下载地址失败', options.uuid)
      }
    )
  }

  //重置ajax请求
  var clearXmlHttpObjMap = function () {
    //遍历xmlHttpObjMap{}
    for (var seq in xmlHttpObjMap) {
      var xmlHttpObj = xmlHttpObjMap[seq]
      if (xmlHttpObj) {
        xmlHttpObj.abort() //中断ajax请求(长轮询)
        xmlHttpObjMap[xmlHttpObjSeq] = null //清空
      }
    }
    xmlHttpObjSeq = 0
    xmlHttpObjMap = {}
  }

  //重置sdk全局变量
  var clearSdk = function () {
    clearXmlHttpObjMap()

    //当前登录用户
    ctx = {
      sdkAppID: null,
      appIDAt3rd: null,
      identifier: null,
      identifierNick: null,
      accountType: null,
      userSig: null,
      contentType: 'json',
      apn: 1
    }
    opt = {}

    curSeq = 0

    //ie8,9采用jsonp方法解决ajax跨域限制
    jsonpRequestId = 0 //jsonp请求id
    //最新jsonp请求返回的json数据
    jsonpLastRspData = null

    apiReportItems = []

    MsgManager.clear()

    //重置longpollingId
    LongPollingId = null
  }

  //登录
  var _login = function (loginInfo, listeners, options, cbOk, cbErr) {
    clearSdk()

    if (options) opt = options
    if (webim.Tool.getQueryString('isAccessFormalEnv') == 'false') {
      isAccessFormaEnvironment = false //访问测试环境
      log.error('请切换为正式环境')
    }

    if (opt.isAccessFormalEnv == false) {
      log.error('请切换为正式环境')
      isAccessFormaEnvironment = opt.isAccessFormalEnv
    }

    if (opt.isLogOn == false) {
      log.setOn(opt.isLogOn)
    }
    /*
         if(opt.emotions){
         emotions=opt.emotions;
         webim.Emotions= emotions;
         }
         if(opt.emotionDataIndexs){
         emotionDataIndexs=opt.emotionDataIndexs;
         webim.EmotionDataIndexs= emotionDataIndexs;
         }*/

    if (!loginInfo) {
      if (cbErr) {
        cbErr(tool.getReturnError('loginInfo is empty', -6))
        return
      }
    }
    if (!loginInfo.sdkAppID) {
      if (cbErr) {
        cbErr(tool.getReturnError('loginInfo.sdkAppID is empty', -7))
        return
      }
    }

    if (!loginInfo.accountType) {
      if (cbErr) {
        cbErr(tool.getReturnError('loginInfo.accountType is empty', -8))
        return
      }
    }

    if (loginInfo.identifier) {
      ctx.identifier = loginInfo.identifier.toString()
    }
    if (loginInfo.identifier && !loginInfo.userSig) {
      if (cbErr) {
        cbErr(tool.getReturnError('loginInfo.userSig is empty', -9))
        return
      }
    }
    if (loginInfo.userSig) {
      ctx.userSig = loginInfo.userSig.toString()
    }
    ctx.sdkAppID = loginInfo.sdkAppID
    ctx.accountType = loginInfo.accountType

    if (ctx.identifier && ctx.userSig) {
      //带登录态
      //登录
      proto_login(function (identifierNick, headurl) {
        MsgManager.init(
          listeners,
          function (mmInitResp) {
            if (cbOk) {
              mmInitResp.identifierNick = identifierNick
              mmInitResp.headurl = headurl
              cbOk(mmInitResp)
            }
          },
          cbErr
        )
      }, cbErr)
    } else {
      //不带登录态，进入直播场景sdk
      MsgManager.init(listeners, cbOk, cbErr)
    }
  }

  //初始化浏览器信息
  var initBrowserInfo = function () {
    //初始化浏览器类型
    BROWSER_INFO = tool.getBrowserInfo()
    log.info(
      'BROWSER_INFO: type=' + BROWSER_INFO.type + ', ver=' + BROWSER_INFO.ver
    )
    if (BROWSER_INFO.type == 'ie') {
      if (parseInt(BROWSER_INFO.ver) < 10) {
        lowerBR = true
      }
    }
  }

  //接口质量上报
  var reportApiQuality = function (cmd, errorCode, errorInfo) {
    if (
      cmd == 'longpolling' &&
      (errorCode == longPollingTimeOutErrorCode ||
        errorCode == longPollingKickedErrorCode)
    ) {
      //longpolling 返回60008错误可以视为正常,可以不上报
      return
    }
    var eventId = CMD_EVENT_ID_MAP[cmd]
    if (eventId) {
      var reportTime = unixtime()
      var uniqKey = null
      var msgCmdErrorCode = {
        Code: errorCode,
        ErrMsg: errorInfo
      }
      if (ctx.a2) {
        uniqKey =
          ctx.a2.substring(0, 10) + '_' + reportTime + '_' + createRandom()
      } else if (ctx.userSig) {
        uniqKey =
          ctx.userSig.substring(0, 10) + '_' + reportTime + '_' + createRandom()
      }

      if (uniqKey) {
        var rptEvtItem = {
          UniqKey: uniqKey,
          EventId: eventId,
          ReportTime: reportTime,
          MsgCmdErrorCode: msgCmdErrorCode
        }

        if (cmd == 'login') {
          var loginApiReportItems = []
          loginApiReportItems.push(rptEvtItem)
          var loginReportOpt = {
            EvtItems: loginApiReportItems,
            MainVersion: SDK.VERSION,
            Version: '0'
          }
          proto_reportApiQuality(
            loginReportOpt,
            function (resp) {
              loginApiReportItems = null //
            },
            function (err) {
              loginApiReportItems = null //
            }
          )
        } else {
          apiReportItems.push(rptEvtItem)
          if (apiReportItems.length >= maxApiReportItemCount) {
            //累计一定条数再上报
            var reportOpt = {
              EvtItems: apiReportItems,
              MainVersion: SDK.VERSION,
              Version: '0'
            }
            proto_reportApiQuality(
              reportOpt,
              function (resp) {
                apiReportItems = [] //清空
              },
              function (err) {
                apiReportItems = [] //清空
              }
            )
          }
        }
      }
    }
  }

  // REST API calls
  //上线
  var proto_login = function (cbOk, cbErr) {
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'login',
      {
        State: 'Online'
      },
      function (loginResp) {
        if (loginResp.TinyId) {
          ctx.tinyid = loginResp.TinyId
        } else {
          if (cbErr) {
            cbErr(tool.getReturnError('TinyId is empty', -10))
            return
          }
        }
        if (loginResp.A2Key) {
          ctx.a2 = loginResp.A2Key
        } else {
          if (cbErr) {
            cbErr(tool.getReturnError('A2Key is empty', -11))
            return
          }
        }
        var tag_list = ['Tag_Profile_IM_Nick', 'Tag_Profile_IM_Image']
        var options = {
          From_Account: ctx.identifier,
          To_Account: [ctx.identifier],
          LastStandardSequence: 0,
          TagList: tag_list
        }
        proto_getProfilePortrait(
          options,
          function (resp) {
            var nick, gender, allowType, image
            if (resp.UserProfileItem && resp.UserProfileItem.length > 0) {
              for (var i in resp.UserProfileItem) {
                for (var j in resp.UserProfileItem[i].ProfileItem) {
                  switch (resp.UserProfileItem[i].ProfileItem[j].Tag) {
                    case 'Tag_Profile_IM_Nick':
                      nick = resp.UserProfileItem[i].ProfileItem[j].Value
                      if (nick) ctx.identifierNick = nick
                      break
                    case 'Tag_Profile_IM_Image':
                      image = resp.UserProfileItem[i].ProfileItem[j].Value
                      if (image) ctx.headurl = image
                      break
                  }
                }
              }
            }
            if (cbOk) cbOk(ctx.identifierNick, ctx.headurl) //回传当前用户昵称
          },
          cbErr
        )
      },
      cbErr
    )
  }
  //下线
  var proto_logout = function (type, cbOk, cbErr) {
    if (!checkLogin(cbErr, false)) {
      //不带登录态
      clearSdk()
      if (cbOk)
        cbOk({
          ActionStatus: ACTION_STATUS.OK,
          ErrorCode: 0,
          ErrorInfo: 'logout success'
        })
      return
    }
    if (type == 'all') {
      ConnManager.apiCall(
        SRV_NAME.OPEN_IM,
        'logout',
        {},
        function (resp) {
          clearSdk()
          if (cbOk) cbOk(resp)
        },
        cbErr
      )
    } else {
      ConnManager.apiCall(
        SRV_NAME.OPEN_IM,
        'longpollinglogout',
        {
          LongPollingId: LongPollingId
        },
        function (resp) {
          clearSdk()
          if (cbOk) cbOk(resp)
        },
        cbErr
      )
    }
  }
  //发送消息，包括私聊和群聊
  var proto_sendMsg = function (msg, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    var msgInfo = null
    switch (msg.sess.type()) {
      case SESSION_TYPE.C2C:
        msgInfo = {
          From_Account: ctx.identifier,
          To_Account: msg.sess.id().toString(),
          MsgTimeStamp: msg.time,
          MsgSeq: msg.seq,
          MsgRandom: msg.random,
          MsgBody: []
        }
        break
      case SESSION_TYPE.GROUP:
        var subType = msg.getSubType()
        msgInfo = {
          GroupId: msg.sess.id().toString(),
          From_Account: ctx.identifier,
          Random: msg.random,
          MsgBody: []
        }
        switch (subType) {
          case GROUP_MSG_SUB_TYPE.COMMON:
            msgInfo.MsgPriority = 'COMMON'
            break
          case GROUP_MSG_SUB_TYPE.REDPACKET:
            msgInfo.MsgPriority = 'REDPACKET'
            break
          case GROUP_MSG_SUB_TYPE.LOVEMSG:
            msgInfo.MsgPriority = 'LOVEMSG'
            break
          case GROUP_MSG_SUB_TYPE.TIP:
            log.error('不能主动发送群提示消息,subType=' + subType)
            break
          default:
            log.error('发送群消息时，出现未知子消息类型：subType=' + subType)
            return
            break
        }
        break
      default:
        break
    }

    for (var i in msg.elems) {
      var elem = msg.elems[i]
      var msgContent = null
      var msgType = elem.type
      switch (msgType) {
        case MSG_ELEMENT_TYPE.TEXT: //文本
          msgContent = {
            Text: elem.content.text
          }
          break
        case MSG_ELEMENT_TYPE.FACE: //表情
          msgContent = {
            Index: elem.content.index,
            Data: elem.content.data
          }
          break
        case MSG_ELEMENT_TYPE.IMAGE: //图片
          var ImageInfoArray = []
          for (var j in elem.content.ImageInfoArray) {
            ImageInfoArray.push({
              Type: elem.content.ImageInfoArray[j].type,
              Size: elem.content.ImageInfoArray[j].size,
              Width: elem.content.ImageInfoArray[j].width,
              Height: elem.content.ImageInfoArray[j].height,
              URL: elem.content.ImageInfoArray[j].url
            })
          }
          msgContent = {
            ImageFormat: elem.content.ImageFormat,
            UUID: elem.content.UUID,
            ImageInfoArray: ImageInfoArray
          }
          break
        case MSG_ELEMENT_TYPE.SOUND: //
          log.warn('web端暂不支持发送语音消息')
          continue
          break
        case MSG_ELEMENT_TYPE.LOCATION: //
          log.warn('web端暂不支持发送地理位置消息')
          continue
          break
        case MSG_ELEMENT_TYPE.FILE: //
          msgContent = {
            UUID: elem.content.uuid,
            FileName: elem.content.name,
            FileSize: elem.content.size,
            DownloadFlag: elem.content.downFlag
          }
          break
        case MSG_ELEMENT_TYPE.CUSTOM: //
          msgContent = {
            Data: elem.content.data,
            Desc: elem.content.desc,
            Ext: elem.content.ext
          }
          msgType = MSG_ELEMENT_TYPE.CUSTOM
          break
        default:
          log.warn('web端暂不支持发送' + elem.type + '消息')
          continue
          break
      }

      if (msg.PushInfoBoolean) {
        msgInfo.OfflinePushInfo = msg.PushInfo //当android终端进程被杀掉时才走push，IOS退到后台即可
      }

      msgInfo.MsgBody.push({
        MsgType: msgType,
        MsgContent: msgContent
      })
    }
    if (msg.sess.type() == SESSION_TYPE.C2C) {
      //私聊
      ConnManager.apiCall(SRV_NAME.OPEN_IM, 'sendmsg', msgInfo, cbOk, cbErr)
    } else if (msg.sess.type() == SESSION_TYPE.GROUP) {
      //群聊
      ConnManager.apiCall(
        SRV_NAME.GROUP,
        'send_group_msg',
        msgInfo,
        cbOk,
        cbErr
      )
    }
  }
  //长轮询接口
  var proto_longPolling = function (options, cbOk, cbErr) {
    if (
      !isAccessFormaEnvironment &&
      typeof stopPolling != 'undefined' &&
      stopPolling == true
    ) {
      return
    }
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'longpolling',
      options,
      cbOk,
      cbErr,
      longPollingDefaultTimeOut,
      true
    )
  }

  //长轮询接口(拉取直播聊天室新消息)
  var proto_bigGroupLongPolling = function (options, cbOk, cbErr, timeout) {
    ConnManager.apiCall(
      SRV_NAME.BIG_GROUP_LONG_POLLING,
      'get_msg',
      options,
      cbOk,
      cbErr,
      timeout
    )
  }

  //拉取未读c2c消息接口
  var proto_getMsgs = function (cookie, syncFlag, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'getmsg',
      {
        Cookie: cookie,
        SyncFlag: syncFlag
      },
      function (resp) {
        if (resp.MsgList && resp.MsgList.length) {
          for (var i in resp.MsgList) {
            tempC2CMsgList.push(resp.MsgList[i])
          }
        }
        if (resp.SyncFlag == 1) {
          proto_getMsgs(resp.Cookie, resp.SyncFlag, cbOk, cbErr)
        } else {
          resp.MsgList = tempC2CMsgList
          tempC2CMsgList = []
          if (cbOk) cbOk(resp)
        }
      },
      cbErr
    )
  }
  //C2C消息已读上报接口
  var proto_c2CMsgReaded = function (cookie, c2CMsgReadedItem, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    var tmpC2CMsgReadedItem = []
    for (var i in c2CMsgReadedItem) {
      var item = {
        To_Account: c2CMsgReadedItem[i].toAccount,
        LastedMsgTime: c2CMsgReadedItem[i].lastedMsgTime
      }
      tmpC2CMsgReadedItem.push(item)
    }
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'msgreaded',
      {
        C2CMsgReaded: {
          Cookie: cookie,
          C2CMsgReadedItem: tmpC2CMsgReadedItem
        }
      },
      cbOk,
      cbErr
    )
  }

  //删除c2c消息
  var proto_deleteC2CMsg = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(SRV_NAME.OPEN_IM, 'deletemsg', options, cbOk, cbErr)
  }

  //拉取c2c历史消息接口
  var proto_getC2CHistoryMsgs = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'getroammsg',
      options,
      function (resp) {
        var reqMsgCount = options.MaxCnt
        var complete = resp.Complete
        var rspMsgCount = resp.MaxCnt
        var msgKey = resp.MsgKey
        var lastMsgTime = resp.LastMsgTime

        if (resp.MsgList && resp.MsgList.length) {
          for (var i in resp.MsgList) {
            tempC2CHistoryMsgList.push(resp.MsgList[i])
          }
        }
        var netxOptions = null
        if (complete == 0) {
          //还有历史消息可拉取
          if (rspMsgCount < reqMsgCount) {
            netxOptions = {
              Peer_Account: options.Peer_Account,
              MaxCnt: reqMsgCount - rspMsgCount,
              LastMsgTime: lastMsgTime,
              MsgKey: msgKey
            }
          }
        }

        if (netxOptions) {
          //继续拉取
          proto_getC2CHistoryMsgs(netxOptions, cbOk, cbErr)
        } else {
          resp.MsgList = tempC2CHistoryMsgList
          tempC2CHistoryMsgList = []
          if (cbOk) cbOk(resp)
        }
      },
      cbErr
    )
  }

  //群组接口
  //创建群组
  //协议参考：https://www.qcloud.com/doc/product/269/1615
  var proto_createGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    var opt = {
      //必填    群组形态，包括Public（公开群），Private（私有群），ChatRoom（聊天室），AVChatRoom（互动直播聊天室）。
      Type: options.Type,
      //必填    群名称，最长30字节。
      Name: options.Name
    }
    var member_list = []

    //Array 选填  初始群成员列表，最多500个。成员信息字段详情参见：群成员资料。
    for (var i = 0; i < options.MemberList.length; i++) {
      member_list.push({
        Member_Account: options.MemberList[i]
      })
    }
    opt.MemberList = member_list
    //选填    为了使得群组ID更加简单，便于记忆传播，腾讯云支持APP在通过REST API创建群组时自定义群组ID。详情参见：自定义群组ID。
    if (options.GroupId) {
      opt.GroupId = options.GroupId
    }
    //选填    群主id，自动添加到群成员中。如果不填，群没有群主。
    if (options.Owner_Account) {
      opt.Owner_Account = options.Owner_Account
    }
    //选填    群简介，最长240字节。
    if (options.Introduction) {
      opt.Introduction = options.Introduction
    }
    //选填    群公告，最长300字节。
    if (options.Notification) {
      opt.Notification = options.Notification
    }
    //选填    最大群成员数量，最大为10000，不填默认为2000个。
    if (options.MaxMemberCount) {
      opt.MaxMemberCount = options.MaxMemberCount
    }
    //选填    申请加群处理方式。包含FreeAccess（自由加入），NeedPermission（需要验证），DisableApply（禁止加群），不填默认为NeedPermission（需要验证）。
    if (options.ApplyJoinOption) {
      //
      opt.ApplyJoinOption = options.ApplyJoinOption
    }
    //Array 选填  群组维度的自定义字段，默认情况是没有的，需要开通，详情参见：自定义字段。
    if (options.AppDefinedData) {
      opt.AppDefinedData = options.AppDefinedData
    }
    //选填    群头像URL，最长100字节。
    if (options.FaceUrl) {
      opt.FaceUrl = options.FaceUrl
    }
    ConnManager.apiCall(SRV_NAME.GROUP, 'create_group', opt, cbOk, cbErr)
  }

  //创建群组-高级接口
  //协议参考：https://www.qcloud.com/doc/product/269/1615
  var proto_createGroupHigh = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(SRV_NAME.GROUP, 'create_group', options, cbOk, cbErr)
  }

  //修改群组基本资料
  //协议参考：https://www.qcloud.com/doc/product/269/1620
  var proto_modifyGroupBaseInfo = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'modify_group_base_info',
      options,
      cbOk,
      cbErr
    )
  }

  //申请加群
  var proto_applyJoinGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'apply_join_group',
      {
        GroupId: options.GroupId,
        ApplyMsg: options.ApplyMsg,
        UserDefinedField: options.UserDefinedField
      },
      cbOk,
      cbErr
    )
  }

  //申请加入大群
  var proto_applyJoinBigGroup = function (options, cbOk, cbErr) {
    var srvName
    if (!checkLogin(cbErr, false)) {
      //未登录
      srvName = SRV_NAME.BIG_GROUP
    } else {
      //已登录
      srvName = SRV_NAME.GROUP
    }
    ConnManager.apiCall(
      srvName,
      'apply_join_group',
      {
        GroupId: options.GroupId,
        ApplyMsg: options.ApplyMsg,
        UserDefinedField: options.UserDefinedField
      },
      function (resp) {
        if (resp.JoinedStatus && resp.JoinedStatus == 'JoinedSuccess') {
          if (resp.LongPollingKey) {
            MsgManager.setBigGroupLongPollingOn(true) //开启长轮询
            MsgManager.setBigGroupLongPollingKey(resp.LongPollingKey) //更新大群长轮询key
            MsgManager.setBigGroupLongPollingMsgMap(options.GroupId, 0) //收到的群消息置0
            MsgManager.bigGroupLongPolling() //开启长轮询
          } else {
            //没有返回LongPollingKey，说明申请加的群不是直播聊天室(AVChatRoom)
            cbErr &&
              cbErr(
                tool.getReturnError(
                  'Join Group succeed; But the type of group is not AVChatRoom: groupid=' +
                    options.GroupId,
                  -12
                )
              )
            return
          }
        }
        if (cbOk) cbOk(resp)
      },
      function (err) {
        if (cbErr) cbErr(err)
      }
    )
  }

  //处理加群申请(同意或拒绝)
  var proto_handleApplyJoinGroupPendency = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'handle_apply_join_group',
      {
        GroupId: options.GroupId,
        Applicant_Account: options.Applicant_Account,
        HandleMsg: options.HandleMsg,
        Authentication: options.Authentication,
        MsgKey: options.MsgKey,
        ApprovalMsg: options.ApprovalMsg,
        UserDefinedField: options.UserDefinedField
      },
      cbOk,
      function (err) {
        if (err.ErrorCode == 10024) {
          //apply has be handled
          if (cbOk) {
            var resp = {
              ActionStatus: ACTION_STATUS.OK,
              ErrorCode: 0,
              ErrorInfo: '该申请已经被处理过'
            }
            cbOk(resp)
          }
        } else {
          if (cbErr) cbErr(err)
        }
      }
    )
  }

  //获取群组未决列表
  var proto_getPendencyGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'get_pendency',
      {
        StartTime: options.StartTime,
        Limit: options.Limit,
        Handle_Account: ctx.identifier
      },
      cbOk,
      function (err) {}
    )
  }

  //群组未决已经上报
  var proto_getPendencyGroupRead = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'report_pendency',
      {
        ReportTime: options.ReportTime,
        From_Account: ctx.identifier
      },
      cbOk,
      function (err) {}
    )
  }

  //处理被邀请进群申请(同意或拒绝)
  var proto_handleInviteJoinGroupRequest = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'handle_invite_join_group',
      {
        GroupId: options.GroupId,
        Inviter_Account: options.Inviter_Account,
        HandleMsg: options.HandleMsg,
        Authentication: options.Authentication,
        MsgKey: options.MsgKey,
        ApprovalMsg: options.ApprovalMsg,
        UserDefinedField: options.UserDefinedField
      },
      cbOk,
      function (err) {}
    )
  }

  //主动退群
  var proto_quitGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'quit_group',
      {
        GroupId: options.GroupId
      },
      cbOk,
      cbErr
    )
  }

  //退出大群
  var proto_quitBigGroup = function (options, cbOk, cbErr) {
    var srvName
    if (!checkLogin(cbErr, false)) {
      //未登录
      srvName = SRV_NAME.BIG_GROUP
    } else {
      //已登录
      srvName = SRV_NAME.GROUP
    }
    ConnManager.apiCall(
      srvName,
      'quit_group',
      {
        GroupId: options.GroupId
      },
      function (resp) {
        //重置当前再请求中的ajax
        //clearXmlHttpObjMap();
        //退出大群成功之后需要重置长轮询信息
        MsgManager.resetBigGroupLongPollingInfo()
        if (cbOk) cbOk(resp)
      },
      cbErr
    )
  }
  //查找群(按名称)
  var proto_searchGroupByName = function (options, cbOk, cbErr) {
    ConnManager.apiCall(SRV_NAME.GROUP, 'search_group', options, cbOk, cbErr)
  }

  //获取群组公开资料
  var proto_getGroupPublicInfo = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'get_group_public_info',
      {
        GroupIdList: options.GroupIdList,
        ResponseFilter: {
          GroupBasePublicInfoFilter: options.GroupBasePublicInfoFilter
        }
      },
      function (resp) {
        resp.ErrorInfo = ''
        if (resp.GroupInfo) {
          for (var i in resp.GroupInfo) {
            var errorCode = resp.GroupInfo[i].ErrorCode
            if (errorCode > 0) {
              resp.ActionStatus = ACTION_STATUS.FAIL
              resp.GroupInfo[i].ErrorInfo =
                '[' + errorCode + ']' + resp.GroupInfo[i].ErrorInfo
              resp.ErrorInfo += resp.GroupInfo[i].ErrorInfo + '\n'
            }
          }
        }
        if (resp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) {
            cbErr(resp)
          }
        } else if (cbOk) {
          cbOk(resp)
        }
      },
      cbErr
    )
  }

  //获取群组详细资料--高级
  //请求协议参考：https://www.qcloud.com/doc/product/269/1616
  var proto_getGroupInfo = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    var opt = {
      GroupIdList: options.GroupIdList,
      ResponseFilter: {
        GroupBaseInfoFilter: options.GroupBaseInfoFilter,
        MemberInfoFilter: options.MemberInfoFilter
      }
    }
    if (options.AppDefinedDataFilter_Group) {
      opt.ResponseFilter.AppDefinedDataFilter_Group =
        options.AppDefinedDataFilter_Group
    }
    if (options.AppDefinedDataFilter_GroupMember) {
      opt.ResponseFilter.AppDefinedDataFilter_GroupMember =
        options.AppDefinedDataFilter_GroupMember
    }
    ConnManager.apiCall(SRV_NAME.GROUP, 'get_group_info', opt, cbOk, cbErr)
  }

  //获取群组成员-高级接口
  //协议参考：https://www.qcloud.com/doc/product/269/1617
  var proto_getGroupMemberInfo = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'get_group_member_info',
      {
        GroupId: options.GroupId,
        Offset: options.Offset,
        Limit: options.Limit,
        MemberInfoFilter: options.MemberInfoFilter,
        MemberRoleFilter: options.MemberRoleFilter,
        AppDefinedDataFilter_GroupMember:
          options.AppDefinedDataFilter_GroupMember
      },
      cbOk,
      cbErr
    )
  }

  //增加群组成员
  //协议参考：https://www.qcloud.com/doc/product/269/1621
  var proto_addGroupMember = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'add_group_member',
      {
        GroupId: options.GroupId,
        Silence: options.Silence,
        MemberList: options.MemberList
      },
      cbOk,
      cbErr
    )
  }
  //修改群组成员资料
  //协议参考：https://www.qcloud.com/doc/product/269/1623
  var proto_modifyGroupMember = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    var opt = {}
    if (options.GroupId) {
      opt.GroupId = options.GroupId
    }
    if (options.Member_Account) {
      opt.Member_Account = options.Member_Account
    }
    //Admin或者Member
    if (options.Role) {
      opt.Role = options.Role
    }
    // AcceptAndNotify代表解收并提示消息，Discard代表不接收也不提示消息，AcceptNotNotify代表接收消息但不提示
    if (options.MsgFlag) {
      opt.MsgFlag = options.MsgFlag
    }
    if (options.ShutUpTime) {
      //禁言时间
      opt.ShutUpTime = options.ShutUpTime
    }
    if (options.NameCard) {
      //群名片,最大不超过50个字节
      opt.NameCard = options.NameCard
    }
    if (options.AppMemberDefinedData) {
      //群成员维度的自定义字段，默认情况是没有的，需要开通
      opt.AppMemberDefinedData = options.AppMemberDefinedData
    }
    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'modify_group_member_info',
      opt,
      cbOk,
      cbErr
    )
  }
  //删除群组成员
  //协议参考：https://www.qcloud.com/doc/product/269/1622
  var proto_deleteGroupMember = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'delete_group_member',
      {
        GroupId: options.GroupId,
        Silence: options.Silence,
        MemberToDel_Account: options.MemberToDel_Account,
        Reason: options.Reason
      },
      cbOk,
      cbErr
    )
  }
  //解散群组
  //协议参考：https://www.qcloud.com/doc/product/269/1624
  var proto_destroyGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'destroy_group',
      {
        GroupId: options.GroupId
      },
      cbOk,
      cbErr
    )
  }
  //转让群组
  //协议参考：https://www.qcloud.com/doc/product/269/1633
  var proto_changeGroupOwner = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'change_group_owner',
      options,
      cbOk,
      cbErr
    )
  }
  //获取用户所加入的群组-高级接口
  //协议参考：https://www.qcloud.com/doc/product/269/1625
  var proto_getJoinedGroupListHigh = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'get_joined_group_list',
      {
        Member_Account: options.Member_Account,
        Limit: options.Limit,
        Offset: options.Offset,
        GroupType: options.GroupType,
        ResponseFilter: {
          GroupBaseInfoFilter: options.GroupBaseInfoFilter,
          SelfInfoFilter: options.SelfInfoFilter
        }
      },
      cbOk,
      cbErr
    )
  }
  //查询一组UserId在群中的身份
  //协议参考：https://www.qcloud.com/doc/product/269/1626
  var proto_getRoleInGroup = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'get_role_in_group',
      {
        GroupId: options.GroupId,
        User_Account: options.User_Account
      },
      cbOk,
      cbErr
    )
  }
  //设置取消成员禁言时间
  //协议参考：https://www.qcloud.com/doc/product/269/1627
  var proto_forbidSendMsg = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'forbid_send_msg',
      {
        GroupId: options.GroupId,
        Members_Account: options.Members_Account,
        ShutUpTime: options.ShutUpTime //单位为秒，为0时表示取消禁言
      },
      cbOk,
      cbErr
    )
  }

  //发送自定义群系统通知
  var proto_sendCustomGroupNotify = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'send_group_system_notification',
      options,
      cbOk,
      cbErr
    )
  }

  //拉取群消息接口
  var proto_getGroupMsgs = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'group_msg_get',
      {
        GroupId: options.GroupId,
        ReqMsgSeq: options.ReqMsgSeq,
        ReqMsgNumber: options.ReqMsgNumber
      },
      cbOk,
      cbErr
    )
  }
  //群消息已读上报接口
  var proto_groupMsgReaded = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.GROUP,
      'msg_read_report',
      {
        GroupId: options.GroupId,
        MsgReadedSeq: options.MsgReadedSeq
      },
      cbOk,
      cbErr
    )
  }
  //end

  //好友接口
  //处理好友接口返回的错误码
  var convertErrorEn2ZhFriend = function (resp) {
    var errorAccount = []
    if (resp.Fail_Account && resp.Fail_Account.length) {
      errorAccount = resp.Fail_Account
    }
    if (resp.Invalid_Account && resp.Invalid_Account.length) {
      for (var k in resp.Invalid_Account) {
        errorAccount.push(resp.Invalid_Account[k])
      }
    }
    if (errorAccount.length) {
      resp.ActionStatus = ACTION_STATUS.FAIL
      resp.ErrorCode = ERROR_CODE_CUSTOM
      resp.ErrorInfo = ''
      for (var i in errorAccount) {
        var failCount = errorAccount[i]
        for (var j in resp.ResultItem) {
          if (resp.ResultItem[j].To_Account == failCount) {
            var resultCode = resp.ResultItem[j].ResultCode
            resp.ResultItem[j].ResultInfo =
              '[' + resultCode + ']' + resp.ResultItem[j].ResultInfo
            resp.ErrorInfo += resp.ResultItem[j].ResultInfo + '\n'
            break
          }
        }
      }
    }
    return resp
  }
  //添加好友
  var proto_applyAddFriend = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'friend_add',
      {
        From_Account: ctx.identifier,
        AddFriendItem: options.AddFriendItem
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }
  //删除好友
  var proto_deleteFriend = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'friend_delete',
      {
        From_Account: ctx.identifier,
        To_Account: options.To_Account,
        DeleteType: options.DeleteType
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }

  //删除会话
  var proto_deleteChat = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return

    if (options.chatType == 1) {
      ConnManager.apiCall(
        SRV_NAME.DEL_CHAT,
        'delete',
        {
          From_Account: ctx.identifier,
          Type: options.chatType,
          To_Account: options.To_Account
        },
        cbOk,
        cbErr
      )
    } else {
      ConnManager.apiCall(
        SRV_NAME.DEL_CHAT,
        'delete',
        {
          From_Account: ctx.identifier,
          Type: options.chatType,
          ToGroupid: options.To_Account
        },
        cbOk,
        cbErr
      )
    }
  }

  //获取好友申请
  var proto_getPendency = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'pendency_get',
      {
        From_Account: ctx.identifier,
        PendencyType: options.PendencyType,
        StartTime: options.StartTime,
        MaxLimited: options.MaxLimited,
        LastSequence: options.LastSequence
      },
      cbOk,
      cbErr
    )
  }
  //好友申请已读上报
  var proto_getPendencyReport = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'PendencyReport',
      {
        From_Account: ctx.identifier,
        LatestPendencyTimeStamp: options.LatestPendencyTimeStamp
      },
      cbOk,
      cbErr
    )
  }
  //删除好友申请
  var proto_deletePendency = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'pendency_delete',
      {
        From_Account: ctx.identifier,
        PendencyType: options.PendencyType,
        To_Account: options.To_Account
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }
  //处理好友申请
  var proto_responseFriend = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'friend_response',
      {
        From_Account: ctx.identifier,
        ResponseFriendItem: options.ResponseFriendItem
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }
  //我的好友
  var proto_getAllFriend = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'friend_get_all',
      {
        From_Account: ctx.identifier,
        TimeStamp: options.TimeStamp,
        StartIndex: options.StartIndex,
        GetCount: options.GetCount,
        LastStandardSequence: options.LastStandardSequence,
        TagList: options.TagList
      },
      cbOk,
      cbErr
    )
  }

  //资料接口
  //查看个人资料
  var proto_getProfilePortrait = function (options, cbOk, cbErr) {
    if (options.To_Account.length > 100) {
      options.To_Account.length = 100
      log.error('获取用户资料人数不能超过100人')
    }
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.PROFILE,
      'portrait_get',
      {
        From_Account: ctx.identifier,
        To_Account: options.To_Account,
        //'LastStandardSequence':options.LastStandardSequence,
        TagList: options.TagList
      },
      function (resp) {
        var errorAccount = []
        if (resp.Fail_Account && resp.Fail_Account.length) {
          errorAccount = resp.Fail_Account
        }
        if (resp.Invalid_Account && resp.Invalid_Account.length) {
          for (var k in resp.Invalid_Account) {
            errorAccount.push(resp.Invalid_Account[k])
          }
        }
        if (errorAccount.length) {
          resp.ActionStatus = ACTION_STATUS.FAIL
          resp.ErrorCode = ERROR_CODE_CUSTOM
          resp.ErrorInfo = ''
          for (var i in errorAccount) {
            var failCount = errorAccount[i]
            for (var j in resp.UserProfileItem) {
              if (resp.UserProfileItem[j].To_Account == failCount) {
                var resultCode = resp.UserProfileItem[j].ResultCode
                resp.UserProfileItem[j].ResultInfo =
                  '[' + resultCode + ']' + resp.UserProfileItem[j].ResultInfo
                resp.ErrorInfo +=
                  '账号:' +
                  failCount +
                  ',' +
                  resp.UserProfileItem[j].ResultInfo +
                  '\n'
                break
              }
            }
          }
        }
        if (resp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(resp)
        } else if (cbOk) {
          cbOk(resp)
        }
      },
      cbErr
    )
  }

  //设置个人资料
  var proto_setProfilePortrait = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.PROFILE,
      'portrait_set',
      {
        From_Account: ctx.identifier,
        ProfileItem: options.ProfileItem
      },
      function (resp) {
        for (var i in options.ProfileItem) {
          var profile = options.ProfileItem[i]
          if (profile.Tag == 'Tag_Profile_IM_Nick') {
            ctx.identifierNick = profile.Value //更新昵称
            break
          }
        }
        if (cbOk) cbOk(resp)
      },
      cbErr
    )
  }

  //增加黑名单
  var proto_addBlackList = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'black_list_add',
      {
        From_Account: ctx.identifier,
        To_Account: options.To_Account
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }

  //删除黑名单
  var proto_deleteBlackList = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'black_list_delete',
      {
        From_Account: ctx.identifier,
        To_Account: options.To_Account
      },
      function (resp) {
        var newResp = convertErrorEn2ZhFriend(resp)
        if (newResp.ActionStatus == ACTION_STATUS.FAIL) {
          if (cbErr) cbErr(newResp)
        } else if (cbOk) {
          cbOk(newResp)
        }
      },
      cbErr
    )
  }

  //我的黑名单
  var proto_getBlackList = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.FRIEND,
      'black_list_get',
      {
        From_Account: ctx.identifier,
        StartIndex: options.StartIndex,
        MaxLimited: options.MaxLimited,
        LastSequence: options.LastSequence
      },
      cbOk,
      cbErr
    )
  }

  //获取最近联系人
  var proto_getRecentContactList = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.RECENT_CONTACT,
      'get',
      {
        From_Account: ctx.identifier,
        Count: options.Count
      },
      cbOk,
      cbErr
    )
  }

  //上传图片或文件
  var proto_uploadPic = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    var cmdName
    if (isAccessFormalEnv()) {
      cmdName = 'pic_up'
    } else {
      cmdName = 'pic_up_test'
    }
    ConnManager.apiCall(
      SRV_NAME.PIC,
      cmdName,
      {
        App_Version: VERSION_INFO.APP_VERSION,
        From_Account: ctx.identifier,
        To_Account: options.To_Account,
        Seq: options.Seq,
        Timestamp: options.Timestamp,
        Random: options.Random,
        File_Str_Md5: options.File_Str_Md5,
        File_Size: options.File_Size,
        File_Type: options.File_Type,
        Server_Ver: VERSION_INFO.SERVER_VERSION,
        Auth_Key: authkey,
        Busi_Id: options.Busi_Id,
        PkgFlag: options.PkgFlag,
        Slice_Offset: options.Slice_Offset,
        Slice_Size: options.Slice_Size,
        Slice_Data: options.Slice_Data
      },
      cbOk,
      cbErr
    )
  }

  //获取语音和文件下载IP和authkey
  var proto_getIpAndAuthkey = function (cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(SRV_NAME.OPEN_IM, 'authkey', {}, cbOk, cbErr)
  }

  //接口质量上报
  var proto_reportApiQuality = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.IM_OPEN_STAT,
      'web_report',
      options,
      cbOk,
      cbErr
    )
  }

  var proto_getLongPollingId = function (options, cbOk, cbErr) {
    if (!checkLogin(cbErr, true)) return
    ConnManager.apiCall(
      SRV_NAME.OPEN_IM,
      'getlongpollingid',
      {},
      function (resp) {
        cbOk && cbOk(resp)
      },
      cbErr
    )
  }

  var proto_applyDownload = function (options, cbOk, cbErr) {
    //把下载地址push到map中
    ConnManager.apiCall(SRV_NAME.PIC, 'apply_download', options, cbOk, cbErr)
  }

  //end
  initBrowserInfo()
  // singleton object ConnManager
  var ConnManager =
    lowerBR == false
      ? new function () {
        var onConnCallback = null //回调函数
        this.init = function (onConnNotify, cbOk, cbErr) {
          if (onConnNotify) onConnCallback = onConnNotify
        }
        this.callBack = function (info) {
          if (onConnCallback) onConnCallback(info)
        }
        this.clear = function () {
          onConnCallback = null
        }
          //请求后台服务接口
        this.apiCall = function (
            type,
            cmd,
            data,
            cbOk,
            cbErr,
            timeout,
            isLongPolling
          ) {
            //封装后台服务接口地址
          var url = getApiUrl(type, cmd, cbOk, cbErr)
          if (url == false) return
            //发起ajax请求
          ajaxRequestJson(
              'POST',
              url,
              data,
              timeout,
              isLongPolling,
              function (resp) {
                var errorCode = null,
                  tempErrorInfo = ''
                if (cmd == 'pic_up') {
                  data.Slice_Data = ''
                }
                var info =
                  '\n request url: \n' +
                  url +
                  '\n request body: \n' +
                  JSON.stringify(data) +
                  '\n response: \n' +
                  JSON.stringify(resp)
                //成功
                if (resp.ActionStatus == ACTION_STATUS.OK) {
                  log.info('[' + type + '][' + cmd + ']success: ' + info)
                  if (cbOk) cbOk(resp) //回调
                  errorCode = 0
                  tempErrorInfo = ''
                } else {
                  errorCode = resp.ErrorCode
                  tempErrorInfo = resp.ErrorInfo
                  //报错
                  if (cbErr) {
                    resp.SrcErrorInfo = resp.ErrorInfo
                    resp.ErrorInfo =
                      '[' + type + '][' + cmd + ']failed: ' + info
                    if (
                      cmd != 'longpolling' ||
                      resp.ErrorCode != longPollingTimeOutErrorCode
                    ) {
                      log.error(resp.ErrorInfo)
                    }
                    cbErr(resp)
                  }
                }
                reportApiQuality(cmd, errorCode, tempErrorInfo) //接口质量上报
              },
              function (err) {
                cbErr && cbErr(err)
                reportApiQuality(cmd, err.ErrorCode, err.ErrorInfo) //接口质量上报
              }
            )
        }
      }()
      : new function () {
        var onConnCallback = null //回调函数
        this.init = function (onConnNotify, cbOk, cbErr) {
          if (onConnNotify) onConnCallback = onConnNotify
        }
        this.callBack = function (info) {
          if (onConnCallback) onConnCallback(info)
        }
        this.clear = function () {
          onConnCallback = null
        }
          //请求后台服务接口
        this.apiCall = function (
            type,
            cmd,
            data,
            cbOk,
            cbErr,
            timeout,
            isLongPolling
          ) {
            //封装后台服务接口地址
          var url = getApiUrl(type, cmd, cbOk, cbErr)
          if (url == false) return
            //发起jsonp请求
          var reqId = jsonpRequestId++,
            cbkey = 'jsonpcallback', // the 'callback' key
            cbval = 'jsonpRequest' + reqId, // the 'callback' value
            script = document.createElement('script'),
            loaded = 0

          window[cbval] = jsonpCallback
          script.type = 'text/javascript'
          url =
              url +
              '&' +
              cbkey +
              '=' +
              cbval +
              '&jsonpbody=' +
              encodeURIComponent(JSON.stringify(data))
          script.src = url
          script.async = true

          if (typeof script.onreadystatechange !== 'undefined') {
              // need this for IE due to out-of-order onreadystatechange(), binding script
              // execution to an event listener gives us control over when the script
              // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
            script.event = 'onclick'
            script.htmlFor = script.id = '_jsonpRequest_' + reqId
          }

          script.onload = script.onreadystatechange = function () {
            if (
                (this.readyState &&
                  this.readyState !== 'complete' &&
                  this.readyState !== 'loaded') ||
                loaded
              ) {
              return false
            }
            script.onload = script.onreadystatechange = null
            script.onclick && script.onclick()
              // Call the user callback with the last value stored and clean up values and scripts.
            var resp = jsonpLastRspData
            var info =
                '\n request url: \n' +
                url +
                '\n request body: \n' +
                JSON.stringify(data) +
                '\n response: \n' +
                JSON.stringify(resp)
            if (resp.ActionStatus == ACTION_STATUS.OK) {
              log.info('[' + type + '][' + cmd + ']success: ' + info)
              cbOk && cbOk(resp)
            } else {
              resp.ErrorInfo = '[' + type + '][' + cmd + ']failed ' + info
              if (
                  cmd != 'longpolling' ||
                  resp.ErrorCode != longPollingTimeOutErrorCode
                ) {
                log.error(resp.ErrorInfo)
              } else {
                log.warn('[' + type + '][' + cmd + ']success: ' + info)
              }
              cbErr && cbErr(resp)
            }
            jsonpLastRspData = undefined
            document.body.removeChild(script)
            loaded = 1
          }

            // Add the script to the DOM head
          document.body.appendChild(script)
        }
      }()
  // class Session
  var Session = function (type, id, name, icon, time, seq) {
    this._impl = {
      skey: Session.skey(type, id),
      type: type,
      id: id,
      name: name,
      icon: icon,
      unread: 0, //未读消息数
      isAutoRead: false,
      time: time >= 0 ? time : 0,
      curMaxMsgSeq: seq >= 0 ? seq : 0,
      msgs: [],
      isFinished: 1
    }
  }
  Session.skey = function (type, id) {
    return type + id
  }
  Session.prototype.type = function () {
    return this._impl.type
  }
  Session.prototype.id = function () {
    return this._impl.id
  }
  Session.prototype.name = function () {
    return this._impl.name
  }
  Session.prototype.icon = function () {
    return this._impl.icon
  }
  Session.prototype.unread = function (val) {
    if (typeof val !== 'undefined') {
      this._impl.unread = val
    } else {
      return this._impl.unread
    }
  }
  Session.prototype.isFinished = function (val) {
    if (typeof val !== 'undefined') {
      this._impl.isFinished = val
    } else {
      return this._impl.isFinished
    }
  }
  Session.prototype.time = function () {
    return this._impl.time
  }
  Session.prototype.curMaxMsgSeq = function (seq) {
    if (typeof seq !== 'undefined') {
      this._impl.curMaxMsgSeq = seq
    } else {
      return this._impl.curMaxMsgSeq
    }
  }
  Session.prototype.msgCount = function () {
    return this._impl.msgs.length
  }
  Session.prototype.msg = function (index) {
    return this._impl.msgs[index]
  }
  Session.prototype.msgs = function () {
    return this._impl.msgs
  }
  Session.prototype._impl_addMsg = function (msg) {
    this._impl.msgs.push(msg)
    //if (!msg.isSend && msg.time > this._impl.time)
    if (msg.time > this._impl.time) this._impl.time = msg.time
    //if (!msg.isSend && msg.seq > this._impl.curMaxMsgSeq)
    if (msg.seq > this._impl.curMaxMsgSeq) this._impl.curMaxMsgSeq = msg.seq
    //自己发送的消息不计入未读数
    if (!msg.isSend && !this._impl.isAutoRead) {
      this._impl.unread++
    }
  }
  //class C2CMsgReadedItem
  var C2CMsgReadedItem = function (toAccount, lastedMsgTime) {
    this.toAccount = toAccount
    this.lastedMsgTime = lastedMsgTime
  }
  var sig = ''
  var calcUniqId = function (num1, num2) {
    var str1 = parseInt(num1).toString(2) + '00000000000000000000000000000000'
    var str2 = parseInt(num2).toString(2)
    var arr1 = str1.split('').reverse()
    var arr2 = str2.split('').reverse()
    var res = []
    var length = arr1.length > arr2.length ? arr1.length : arr2.length
    for (var a = 0; a < length; a++) {
      sig = Number(arr1[a] || 0) || Number(arr2[a] || 0)
      res.push(sig)
    }
    var numstr = res.reverse().join('')
    var long = {
      high:
        '0x' + parseInt(numstr.substr(0, numstr.length - 32), 2).toString(16),
      low:
        '0x' + parseInt(numstr.substr(numstr.length - 32 - 1), 2).toString(16)
    }
    var longVal = new Long(long.low, long.high, true)
    return longVal.toString()
  }
  // class Msg
  var Msg = function (
    sess,
    isSend,
    seq,
    random,
    time,
    fromAccount,
    subType,
    fromAccountNick
  ) {
    this.sess = sess
    this.subType = subType >= 0 ? subType : 0 //消息类型,c2c消息时，type取值为0；group消息时，type取值0和1，0-普通群消息，1-群提示消息
    this.fromAccount = fromAccount
    this.fromAccountNick = fromAccountNick ? fromAccountNick : fromAccount
    this.isSend = Boolean(isSend)
    this.seq = seq >= 0 ? seq : nextSeq()
    this.random = random >= 0 ? random : createRandom()
    this.time = time >= 0 ? time : unixtime()
    this.elems = []
    var type = sess.type()
    switch (type) {
      case SESSION_TYPE.GROUP:
        this.uniqueId = calcUniqId(this.seq, this.random)
        break
      case SESSION_TYPE.C2C:
      default:
        this.uniqueId = calcUniqId(this.time, this.random)
        break
    }
  }
  Msg.prototype.getSession = function () {
    return this.sess
  }
  Msg.prototype.getType = function () {
    return this.subType
  }
  Msg.prototype.getSubType = function () {
    return this.subType
  }
  Msg.prototype.getFromAccount = function () {
    return this.fromAccount
  }
  Msg.prototype.getFromAccountNick = function () {
    return this.fromAccountNick
  }
  Msg.prototype.getIsSend = function () {
    return this.isSend
  }
  Msg.prototype.getSeq = function () {
    return this.seq
  }
  Msg.prototype.getTime = function () {
    return this.time
  }
  Msg.prototype.getRandom = function () {
    return this.random
  }
  Msg.prototype.getElems = function () {
    return this.elems
  }
  Msg.prototype.getMsgUniqueId = function () {
    return this.uniqueId
  }
  //文本
  Msg.prototype.addText = function (text) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.TEXT, text))
  }
  //表情
  Msg.prototype.addFace = function (face) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.FACE, face))
  }
  //图片
  Msg.prototype.addImage = function (image) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.IMAGE, image))
  }
  //地理位置
  Msg.prototype.addLocation = function (location) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.LOCATION, location))
  }
  //文件
  Msg.prototype.addFile = function (file) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.FILE, file))
  }
  //自定义
  Msg.prototype.addCustom = function (custom) {
    this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.CUSTOM, custom))
  }
  Msg.prototype.addElem = function (elem) {
    this.elems.push(elem)
  }
  Msg.prototype.toHtml = function () {
    var html = ''
    for (var i in this.elems) {
      var elem = this.elems[i]
      html += elem.toHtml()
    }
    return html
  }

  // class Msg.Elem
  Msg.Elem = function (type, value) {
    this.type = type
    this.content = value
  }
  Msg.Elem.prototype.getType = function () {
    return this.type
  }
  Msg.Elem.prototype.getContent = function () {
    return this.content
  }
  Msg.Elem.prototype.toHtml = function () {
    var html
    html = this.content.toHtml()
    return html
  }

  // class Msg.Elem.Text
  Msg.Elem.Text = function (text) {
    this.text = tool.xssFilter(text)
  }
  Msg.Elem.Text.prototype.getText = function () {
    return this.text
  }
  Msg.Elem.Text.prototype.toHtml = function () {
    return this.text
  }

  // class Msg.Elem.Face
  Msg.Elem.Face = function (index, data) {
    this.index = index
    this.data = data
  }
  Msg.Elem.Face.prototype.getIndex = function () {
    return this.index
  }
  Msg.Elem.Face.prototype.getData = function () {
    return this.data
  }
  Msg.Elem.Face.prototype.toHtml = function () {
    var faceUrl = null
    var index = emotionDataIndexs[this.data]
    var emotion = emotions[index]
    if (emotion && emotion[1]) {
      faceUrl = emotion[1]
    }
    if (faceUrl) {
      return "<img src='" + faceUrl + "'/>"
    } else {
      return this.data
    }
  }
  // 地理位置消息 class Msg.Elem.Location
  Msg.Elem.Location = function (longitude, latitude, desc) {
    this.latitude = latitude //纬度
    this.longitude = longitude //经度
    this.desc = desc //描述
  }
  Msg.Elem.Location.prototype.getLatitude = function () {
    return this.latitude
  }
  Msg.Elem.Location.prototype.getLongitude = function () {
    return this.longitude
  }
  Msg.Elem.Location.prototype.getDesc = function () {
    return this.desc
  }
  Msg.Elem.Location.prototype.toHtml = function () {
    return (
      '经度=' + this.longitude + ',纬度=' + this.latitude + ',描述=' + this.desc
    )
  }

  //图片消息
  // class Msg.Elem.Images
  Msg.Elem.Images = function (imageId, format) {
    this.UUID = imageId
    if (typeof format !== 'number') {
      format = parseInt(IMAGE_FORMAT[format] || IMAGE_FORMAT['UNKNOWN'], 10)
    }
    this.ImageFormat = format
    this.ImageInfoArray = []
  }
  Msg.Elem.Images.prototype.addImage = function (image) {
    this.ImageInfoArray.push(image)
  }
  Msg.Elem.Images.prototype.toHtml = function () {
    var smallImage = this.getImage(IMAGE_TYPE.SMALL)
    var bigImage = this.getImage(IMAGE_TYPE.LARGE)
    var oriImage = this.getImage(IMAGE_TYPE.ORIGIN)
    if (!bigImage) {
      bigImage = smallImage
    }
    if (!oriImage) {
      oriImage = smallImage
    }
    return (
      "<img src='" +
      smallImage.getUrl() +
      '#' +
      bigImage.getUrl() +
      '#' +
      oriImage.getUrl() +
      "' style='CURSOR: hand' id='" +
      this.getImageId() +
      "' bigImgUrl='" +
      bigImage.getUrl() +
      "' onclick='imageClick(this)' />"
    )
  }
  Msg.Elem.Images.prototype.getImageId = function () {
    return this.UUID
  }
  Msg.Elem.Images.prototype.getImageFormat = function () {
    return this.ImageFormat
  }
  Msg.Elem.Images.prototype.getImage = function (type) {
    for (var i in this.ImageInfoArray) {
      if (this.ImageInfoArray[i].getType() == type) {
        return this.ImageInfoArray[i]
      }
    }
    return null
  }
  // class Msg.Elem.Images.Image
  Msg.Elem.Images.Image = function (type, size, width, height, url) {
    this.type = type
    this.size = size
    this.width = width
    this.height = height
    this.url = url
  }
  Msg.Elem.Images.Image.prototype.getType = function () {
    return this.type
  }
  Msg.Elem.Images.Image.prototype.getSize = function () {
    return this.size
  }
  Msg.Elem.Images.Image.prototype.getWidth = function () {
    return this.width
  }
  Msg.Elem.Images.Image.prototype.getHeight = function () {
    return this.height
  }
  Msg.Elem.Images.Image.prototype.getUrl = function () {
    return this.url
  }

  // class Msg.Elem.Sound
  Msg.Elem.Sound = function (
    uuid,
    second,
    size,
    senderId,
    receiverId,
    downFlag,
    chatType
  ) {
    this.uuid = uuid //文件id
    this.second = second //时长，单位：秒
    this.size = size //大小，单位：字节
    this.senderId = senderId //发送者
    this.receiverId = receiverId //接收方id
    this.downFlag = downFlag //下载标志位
    this.busiId = chatType == SESSION_TYPE.C2C ? 2 : 1 //busi_id ( 1：群    2:C2C)

    //根据不同情况拉取数据
    //是否需要申请下载地址  0:到架平申请  1:到cos申请  2:不需要申请, 直接拿url下载
    if (downFlag !== undefined && busiId !== undefined) {
      getFileDownUrlV2(
        uuid,
        senderId,
        second,
        downFlag,
        receiverId,
        this.busiId,
        UPLOAD_RES_TYPE.SOUND
      )
    } else {
      this.downUrl = getSoundDownUrl(uuid, senderId, second) //下载地址
    }
  }
  Msg.Elem.Sound.prototype.getUUID = function () {
    return this.uuid
  }
  Msg.Elem.Sound.prototype.getSecond = function () {
    return this.second
  }
  Msg.Elem.Sound.prototype.getSize = function () {
    return this.size
  }
  Msg.Elem.Sound.prototype.getSenderId = function () {
    return this.senderId
  }
  Msg.Elem.Sound.prototype.getDownUrl = function () {
    return this.downUrl
  }
  Msg.Elem.Sound.prototype.toHtml = function () {
    if (BROWSER_INFO.type == 'ie' && parseInt(BROWSER_INFO.ver) <= 8) {
      return (
        '[这是一条语音消息]demo暂不支持ie8(含)以下浏览器播放语音,语音URL:' +
        this.downUrl
      )
    }
    return (
      '<audio id="uuid_' +
      this.uuid +
      '" src="' +
      this.downUrl +
      '" controls="controls" onplay="onChangePlayAudio(this)" preload="none"></audio>'
    )
  }

  // class Msg.Elem.File
  Msg.Elem.File = function (
    uuid,
    name,
    size,
    senderId,
    receiverId,
    downFlag,
    chatType
  ) {
    this.uuid = uuid //文件id
    this.name = name //文件名
    this.size = size //大小，单位：字节
    this.senderId = senderId //发送者
    this.receiverId = receiverId //接收方id
    this.downFlag = downFlag //下载标志位

    this.busiId = chatType == SESSION_TYPE.C2C ? 2 : 1 //busi_id ( 1：群    2:C2C)
    //根据不同情况拉取数据
    //是否需要申请下载地址  0:到架平申请  1:到cos申请  2:不需要申请, 直接拿url下载
    if (downFlag !== undefined && busiId !== undefined) {
      getFileDownUrlV2(
        uuid,
        senderId,
        name,
        downFlag,
        receiverId,
        this.busiId,
        UPLOAD_RES_TYPE.FILE
      )
    } else {
      this.downUrl = getFileDownUrl(uuid, senderId, name) //下载地址
    }
  }
  Msg.Elem.File.prototype.getUUID = function () {
    return this.uuid
  }
  Msg.Elem.File.prototype.getName = function () {
    return this.name
  }
  Msg.Elem.File.prototype.getSize = function () {
    return this.size
  }
  Msg.Elem.File.prototype.getSenderId = function () {
    return this.senderId
  }
  Msg.Elem.File.prototype.getDownUrl = function () {
    return this.downUrl
  }
  Msg.Elem.File.prototype.getDownFlag = function () {
    return this.downFlag
  }
  Msg.Elem.File.prototype.toHtml = function () {
    var fileSize, unitStr
    fileSize = this.size
    unitStr = 'Byte'
    if (this.size >= 1024) {
      fileSize = Math.round(this.size / 1024)
      unitStr = 'KB'
    }
    return (
      '<a href="javascript" onclick="webim.onDownFile("' +
      this.uuid +
      '")" title="点击下载文件" ><i class="glyphicon glyphicon-file">&nbsp;' +
      this.name +
      '(' +
      fileSize +
      unitStr +
      ')</i></a>'
    )
  }

  // class Msg.Elem.GroupTip 群提示消息对象
  Msg.Elem.GroupTip = function (
    opType,
    opUserId,
    groupId,
    groupName,
    userIdList
  ) {
    this.opType = opType //操作类型
    this.opUserId = opUserId //操作者id
    this.groupId = groupId //群id
    this.groupName = groupName //群名称
    this.userIdList = userIdList ? userIdList : [] //被操作的用户id列表
    this.groupInfoList = [] //新的群资料信息，群资料变更时才有值
    this.memberInfoList = [] //新的群成员资料信息，群成员资料变更时才有值
    this.groupMemberNum = null //群成员数，操作类型为加群或者退群时才有值
  }
  Msg.Elem.GroupTip.prototype.addGroupInfo = function (groupInfo) {
    this.groupInfoList.push(groupInfo)
  }
  Msg.Elem.GroupTip.prototype.addMemberInfo = function (memberInfo) {
    this.memberInfoList.push(memberInfo)
  }
  Msg.Elem.GroupTip.prototype.getOpType = function () {
    return this.opType
  }
  Msg.Elem.GroupTip.prototype.getOpUserId = function () {
    return this.opUserId
  }
  Msg.Elem.GroupTip.prototype.getGroupId = function () {
    return this.groupId
  }
  Msg.Elem.GroupTip.prototype.getGroupName = function () {
    return this.groupName
  }
  Msg.Elem.GroupTip.prototype.getUserIdList = function () {
    return this.userIdList
  }
  Msg.Elem.GroupTip.prototype.getGroupInfoList = function () {
    return this.groupInfoList
  }
  Msg.Elem.GroupTip.prototype.getMemberInfoList = function () {
    return this.memberInfoList
  }
  Msg.Elem.GroupTip.prototype.getGroupMemberNum = function () {
    return this.groupMemberNum
  }
  Msg.Elem.GroupTip.prototype.setGroupMemberNum = function (groupMemberNum) {
    return (this.groupMemberNum = groupMemberNum)
  }
  Msg.Elem.GroupTip.prototype.toHtml = function () {
    var text = '[群提示消息]'
    var maxIndex = GROUP_TIP_MAX_USER_COUNT - 1
    switch (this.opType) {
      case GROUP_TIP_TYPE.JOIN: //加入群
        text += this.opUserId + '邀请了'
        for (var m in this.userIdList) {
          text += this.userIdList[m] + ','
          if (
            this.userIdList.length > GROUP_TIP_MAX_USER_COUNT &&
            m == maxIndex
          ) {
            text += '等' + this.userIdList.length + '人'
            break
          }
        }
        text += '加入该群'
        break
      case GROUP_TIP_TYPE.QUIT: //退出群
        text += this.opUserId + '主动退出该群'
        break
      case GROUP_TIP_TYPE.KICK: //踢出群
        text += this.opUserId + '将'
        for (var m in this.userIdList) {
          text += this.userIdList[m] + ','
          if (
            this.userIdList.length > GROUP_TIP_MAX_USER_COUNT &&
            m == maxIndex
          ) {
            text += '等' + this.userIdList.length + '人'
            break
          }
        }
        text += '踢出该群'
        break
      case GROUP_TIP_TYPE.SET_ADMIN: //设置管理员
        text += this.opUserId + '将'
        for (var m in this.userIdList) {
          text += this.userIdList[m] + ','
          if (
            this.userIdList.length > GROUP_TIP_MAX_USER_COUNT &&
            m == maxIndex
          ) {
            text += '等' + this.userIdList.length + '人'
            break
          }
        }
        text += '设为管理员'
        break
      case GROUP_TIP_TYPE.CANCEL_ADMIN: //取消管理员
        text += this.opUserId + '取消'
        for (var m in this.userIdList) {
          text += this.userIdList[m] + ','
          if (
            this.userIdList.length > GROUP_TIP_MAX_USER_COUNT &&
            m == maxIndex
          ) {
            text += '等' + this.userIdList.length + '人'
            break
          }
        }
        text += '的管理员资格'
        break

      case GROUP_TIP_TYPE.MODIFY_GROUP_INFO: //群资料变更
        text += this.opUserId + '修改了群资料：'
        for (var m in this.groupInfoList) {
          var type = this.groupInfoList[m].getType()
          var value = this.groupInfoList[m].getValue()
          switch (type) {
            case GROUP_TIP_MODIFY_GROUP_INFO_TYPE.FACE_URL:
              text += '群头像为' + value + '; '
              break
            case GROUP_TIP_MODIFY_GROUP_INFO_TYPE.NAME:
              text += '群名称为' + value + '; '
              break
            case GROUP_TIP_MODIFY_GROUP_INFO_TYPE.OWNER:
              text += '群主为' + value + '; '
              break
            case GROUP_TIP_MODIFY_GROUP_INFO_TYPE.NOTIFICATION:
              text += '群公告为' + value + '; '
              break
            case GROUP_TIP_MODIFY_GROUP_INFO_TYPE.INTRODUCTION:
              text += '群简介为' + value + '; '
              break
            default:
              text += '未知信息为:type=' + type + ',value=' + value + '; '
              break
          }
        }
        break

      case GROUP_TIP_TYPE.MODIFY_MEMBER_INFO: //群成员资料变更(禁言时间)
        text += this.opUserId + '修改了群成员资料:'
        for (var m in this.memberInfoList) {
          var userId = this.memberInfoList[m].getUserId()
          var shutupTime = this.memberInfoList[m].getShutupTime()
          text += userId + ': '
          if (shutupTime != null && shutupTime !== undefined) {
            if (shutupTime == 0) {
              text += '取消禁言; '
            } else {
              text += '禁言' + shutupTime + '秒; '
            }
          } else {
            text += ' shutupTime为空'
          }
          if (
            this.memberInfoList.length > GROUP_TIP_MAX_USER_COUNT &&
            m == maxIndex
          ) {
            text += '等' + this.memberInfoList.length + '人'
            break
          }
        }
        break

      case GROUP_TIP_TYPE.READED: //消息已读
        /**/
        Log.info('消息已读同步')
        break
      default:
        text += '未知群提示消息类型：type=' + this.opType
        break
    }
    return text
  }

  // class Msg.Elem.GroupTip.GroupInfo，变更的群资料信息对象
  Msg.Elem.GroupTip.GroupInfo = function (type, value) {
    this.type = type //群资料信息类型
    this.value = value //对应的值
  }
  Msg.Elem.GroupTip.GroupInfo.prototype.getType = function () {
    return this.type
  }
  Msg.Elem.GroupTip.GroupInfo.prototype.getValue = function () {
    return this.value
  }

  // class Msg.Elem.GroupTip.MemberInfo，变更的群成员资料信息对象
  Msg.Elem.GroupTip.MemberInfo = function (userId, shutupTime) {
    this.userId = userId //群成员id
    this.shutupTime = shutupTime //群成员被禁言时间，0表示取消禁言，大于0表示被禁言时长，单位：秒
  }
  Msg.Elem.GroupTip.MemberInfo.prototype.getUserId = function () {
    return this.userId
  }
  Msg.Elem.GroupTip.MemberInfo.prototype.getShutupTime = function () {
    return this.shutupTime
  }

  // 自定义消息类型 class Msg.Elem.Custom
  Msg.Elem.Custom = function (data, desc, ext) {
    this.data = data //数据
    this.desc = desc //描述
    this.ext = ext //扩展字段
  }
  Msg.Elem.Custom.prototype.getData = function () {
    return this.data
  }
  Msg.Elem.Custom.prototype.getDesc = function () {
    return this.desc
  }
  Msg.Elem.Custom.prototype.getExt = function () {
    return this.ext
  }
  Msg.Elem.Custom.prototype.toHtml = function () {
    return this.data
  }

  // singleton object MsgStore
  var MsgStore = new function () {
    var sessMap = {} //跟所有用户或群的聊天记录MAP
    var sessTimeline = [] //按时间降序排列的会话列表
    window.msgCache = {} //消息缓存，用于判重
    //C2C
    this.cookie = '' //上一次拉取新c2c消息的cookie
    this.syncFlag = 0 //上一次拉取新c2c消息的是否继续拉取标记

    var visitSess = function (visitor) {
      for (var i in sessMap) {
        visitor(sessMap[i])
      }
    }
    // window.msgCache = msgCache;
    //消息查重
    var checkDupMsg = function (msg) {
      var dup = false
      var first_key = msg.sess._impl.skey
      var second_key = msg.isSend + msg.seq + msg.random
      var tempMsg = msgCache[first_key] && msgCache[first_key][second_key]
      if (tempMsg) {
        dup = true
      }
      if (msgCache[first_key]) {
        msgCache[first_key][second_key] = {
          time: msg.time
        }
      } else {
        msgCache[first_key] = {}
        msgCache[first_key][second_key] = {
          time: msg.time
        }
      }
      return dup
    }

    this.sessMap = function () {
      return sessMap
    }
    this.sessCount = function () {
      return sessTimeline.length
    }
    this.sessByTypeId = function (type, id) {
      var skey = Session.skey(type, id)
      if (skey === undefined || skey == null) return null
      return sessMap[skey]
    }
    this.delSessByTypeId = function (type, id) {
      var skey = Session.skey(type, id)
      if (skey === undefined || skey == null) return false
      if (sessMap[skey]) {
        delete sessMap[skey]
        delete msgCache[skey]
      }
      return true
    }
    this.resetCookieAndSyncFlag = function () {
      this.cookie = ''
      this.syncFlag = 0
    }

    //切换将当前会话的自动读取消息标志为isOn,重置其他会话的自动读取消息标志为false
    this.setAutoRead = function (selSess, isOn, isResetAll) {
      if (isResetAll)
        visitSess(function (s) {
          s._impl.isAutoRead = false
        })
      if (selSess) {
        selSess._impl.isAutoRead = isOn //
        if (isOn) {
          //是否调用已读上报接口
          selSess._impl.unread = 0

          if (selSess._impl.type == SESSION_TYPE.C2C) {
            //私聊消息已读上报
            var tmpC2CMsgReadedItem = []
            tmpC2CMsgReadedItem.push(
              new C2CMsgReadedItem(selSess._impl.id, selSess._impl.time)
            )
            //调用C2C消息已读上���接口
            proto_c2CMsgReaded(
              MsgStore.cookie,
              tmpC2CMsgReadedItem,
              function (resp) {
                log.info('[setAutoRead]: c2CMsgReaded success')
              },
              function (err) {
                log.error('[setAutoRead}: c2CMsgReaded failed:' + err.ErrorInfo)
              }
            )
          } else if (selSess._impl.type == SESSION_TYPE.GROUP) {
            //群聊消息已读上报
            var tmpOpt = {
              GroupId: selSess._impl.id,
              MsgReadedSeq: selSess._impl.curMaxMsgSeq
            }
            //调用group消息已读上报接口
            proto_groupMsgReaded(
              tmpOpt,
              function (resp) {
                log.info('groupMsgReaded success')
              },
              function (err) {
                log.error('groupMsgReaded failed:' + err.ErrorInfo)
              }
            )
          }
        }
      }
    }

    this.c2CMsgReaded = function (opts, cbOk, cbErr) {
      var tmpC2CMsgReadedItem = []
      tmpC2CMsgReadedItem.push(
        new C2CMsgReadedItem(opts.To_Account, opts.LastedMsgTime)
      )
      //调用C2C消息已读上报接口
      proto_c2CMsgReaded(
        MsgStore.cookie,
        tmpC2CMsgReadedItem,
        function (resp) {
          if (cbOk) {
            log.info('c2CMsgReaded success')
            cbOk(resp)
          }
        },
        function (err) {
          if (cbErr) {
            log.error('c2CMsgReaded failed:' + err.ErrorInfo)
            cbErr(err)
          }
        }
      )
    }

    this.addSession = function (sess) {
      sessMap[sess._impl.skey] = sess
    }
    this.delSession = function (sess) {
      delete sessMap[sess._impl.skey]
    }
    this.addMsg = function (msg) {
      if (checkDupMsg(msg)) return false
      var sess = msg.sess
      if (!sessMap[sess._impl.skey]) this.addSession(sess)
      sess._impl_addMsg(msg)
      return true
    }
    this.updateTimeline = function () {
      var arr = new Array()
      visitSess(function (sess) {
        arr.push(sess)
      })
      arr.sort(function (a, b) {
        return b.time - a.time
      })
      sessTimeline = arr
    }
  }()
  // singleton object MsgManager
  var MsgManager = new function () {
    var onMsgCallback = null //新消息(c2c和group)回调

    var onGroupInfoChangeCallback = null //群资料变化回调
    //收到新群系统消息回调列表
    var onGroupSystemNotifyCallbacks = {
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null,
      '6': null,
      '7': null,
      '8': null,
      '9': null,
      '10': null,
      '11': null,
      '15': null,
      '255': null,
      '12': null
    }
    //监听好���系统通知函数
    var onFriendSystemNotifyCallbacks = {
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null,
      '6': null,
      '7': null,
      '8': null
    }

    var onProfileSystemNotifyCallbacks = {
      '1': null
    }

    //普通长轮询
    var longPollingOn = false //是否开启普通长轮询
    var isLongPollingRequesting = false //是否在长轮询ing
    var notifySeq = 0 //c2c通知seq
    var noticeSeq = 0 //群消息seq

    //大群长轮询
    var onBigGroupMsgCallback = null //大群消息回调
    var bigGroupLongPollingOn = false //是否开启长轮询
    var bigGroupLongPollingStartSeq = 0 //请求拉消息的起始seq(大群长轮询)
    var bigGroupLongPollingHoldTime = 90 //客户端长轮询的超时时间，单位是秒(大群长轮询)
    var bigGroupLongPollingKey = null //客户端加入群组后收到的的Key(大群长轮询)
    var bigGroupLongPollingMsgMap = {} //记录收到的群消息数
    var onC2cEventCallbacks = {
      '92': null, //消息已读通知,
      '96': null
    }
    var onKickedEventCall = null //多实例登录回调
    var onAppliedDownloadUrl = null

    var getLostGroupMsgCount = 0 //补拉丢失的群消息次数
    //我的群当前最大的seq
    var myGroupMaxSeqs = {} //用于补拉丢失的群消息

    var groupSystemMsgsCache = {} //群组系统消息缓存,用于判重

    //设置长轮询开关
    //isOn=true 开启
    //isOn=false 停止
    this.setLongPollingOn = function (isOn) {
      longPollingOn = isOn
    }
    this.getLongPollingOn = function () {
      return longPollingOn
    }

    //重置长轮询变量
    this.resetLongPollingInfo = function () {
      longPollingOn = false
      notifySeq = 0
      noticeSeq = 0
    }

    //设置大群长轮询开关
    //isOn=true 开启
    //isOn=false 停止
    this.setBigGroupLongPollingOn = function (isOn) {
      bigGroupLongPollingOn = isOn
    }
    //设置大群长轮询key
    this.setBigGroupLongPollingKey = function (key) {
      bigGroupLongPollingKey = key
    }
    //重置大群长轮询变量
    this.resetBigGroupLongPollingInfo = function () {
      bigGroupLongPollingOn = false
      bigGroupLongPollingStartSeq = 0
      bigGroupLongPollingKey = null
      bigGroupLongPollingMsgMap = {}
    }

    //设置群消息数据条数
    this.setBigGroupLongPollingMsgMap = function (groupId, count) {
      var bigGroupLongPollingMsgCount = bigGroupLongPollingMsgMap[groupId]
      if (bigGroupLongPollingMsgCount) {
        bigGroupLongPollingMsgCount =
          parseInt(bigGroupLongPollingMsgCount) + count
        bigGroupLongPollingMsgMap[groupId] = bigGroupLongPollingMsgCount
      } else {
        bigGroupLongPollingMsgMap[groupId] = count
      }
    }

    //重置
    this.clear = function () {
      onGroupInfoChangeCallback = null
      onGroupSystemNotifyCallbacks = {
        '1': null, //申请加群请求（只有管理员会收到）
        '2': null, //申请加群被同意（只有申请人能够收到）
        '3': null, //申请加群被拒绝（只有申请人能够收到）
        '4': null, //被管理员踢出群(只有被踢者接收到)
        '5': null, //群被解散(全员接收)
        '6': null, //创建群(创建者接收)
        '7': null, //邀请加群(被邀请者接收)
        '8': null, //主动退群(主动退出者接收)
        '9': null, //设置管理员(被设置者接收)
        '10': null, //取消管理员(被取消者接收)
        '11': null, //群已被回收(全员接收)
        '15': null, //群已被回收(全员接收)
        '255': null, //用户自定义通知(默认全员接收)
        '12': null //邀请加群(被邀请者需要同意)
      }
      onFriendSystemNotifyCallbacks = {
        '1': null, //好友表增加
        '2': null, //好友表删除
        '3': null, //未决增加
        '4': null, //未决删除
        '5': null, //黑名单增加
        '6': null, //黑名单删除
        '7': null, //未决已读上报
        '8': null //好友信息(备注，分组)变更
      }
      onProfileSystemNotifyCallbacks = {
        '1': null //资料修改
      }
      //重置普通长轮询参数
      onMsgCallback = null
      longPollingOn = false
      notifySeq = 0 //c2c新消息通知seq
      noticeSeq = 0 //group新消息seq

      //重置大群长轮询参数
      onBigGroupMsgCallback = null
      bigGroupLongPollingOn = false
      bigGroupLongPollingStartSeq = 0
      bigGroupLongPollingKey = null
      bigGroupLongPollingMsgMap = {}

      groupSystemMsgsCache = {}

      ipList = [] //文件下载地址
      authkey = null //文件下载票据
      expireTime = null //票据超时时间
    }

    //初始化文件下载ip和票据
    var initIpAndAuthkey = function (cbOk, cbErr) {
      proto_getIpAndAuthkey(
        function (resp) {
          ipList = resp.IpList
          authkey = resp.AuthKey
          expireTime = resp.ExpireTime
          if (cbOk) cbOk(resp)
        },
        function (err) {
          log.error('initIpAndAuthkey failed:' + err.ErrorInfo)
          if (cbErr) cbErr(err)
        }
      )
    }

    //初始化我的群当前最大的seq，用于补拉丢失的群消息
    var initMyGroupMaxSeqs = function (cbOk, cbErr) {
      var opts = {
        Member_Account: ctx.identifier,
        Limit: 1000,
        Offset: 0,
        GroupBaseInfoFilter: ['NextMsgSeq']
      }
      proto_getJoinedGroupListHigh(
        opts,
        function (resp) {
          if (!resp.GroupIdList || resp.GroupIdList.length == 0) {
            log.info('initMyGroupMaxSeqs: 目前还没有加入任何群组')
            if (cbOk) cbOk(resp)
            return
          }
          for (var i = 0; i < resp.GroupIdList.length; i++) {
            var group_id = resp.GroupIdList[i].GroupId
            var curMaxSeq = resp.GroupIdList[i].NextMsgSeq - 1
            myGroupMaxSeqs[group_id] = curMaxSeq
          }

          if (cbOk) cbOk(resp)
        },
        function (err) {
          log.error('initMyGroupMaxSeqs failed:' + err.ErrorInfo)
          if (cbErr) cbErr(err)
        }
      )
    }

    //补拉群消息
    var getLostGroupMsgs = function (groupId, reqMsgSeq, reqMsgNumber) {
      getLostGroupMsgCount++
      //发起一个拉群群消息请求
      var tempOpts = {
        GroupId: groupId,
        ReqMsgSeq: reqMsgSeq,
        ReqMsgNumber: reqMsgNumber
      }
      //发起一个拉群群消息请求
      log.warn(
        '第' +
          getLostGroupMsgCount +
          '次补齐群消息,参数=' +
          JSON.stringify(tempOpts)
      )
      MsgManager.syncGroupMsgs(tempOpts)
    }

    //更新群当前最大消息seq
    var updateMyGroupCurMaxSeq = function (groupId, msgSeq) {
      //更新myGroupMaxSeqs中的群最大seq
      var curMsgSeq = myGroupMaxSeqs[groupId]
      if (curMsgSeq) {
        //如果存在，比较大小
        if (msgSeq > curMsgSeq) {
          myGroupMaxSeqs[groupId] = msgSeq
        }
      } else {
        //不存在，新增
        myGroupMaxSeqs[groupId] = msgSeq
      }
    }

    //添加群消息列表
    var addGroupMsgList = function (msgs, new_group_msgs) {
      for (var p in msgs) {
        var newGroupMsg = msgs[p]
        //发群消息时，长轮询接口会返回用户自己发的群消息
        //if(newGroupMsg.From_Account && newGroupMsg.From_Account!=ctx.identifier ){
        if (newGroupMsg.From_Account) {
          //false-不是主动拉取的历史消息
          //true-需要保存到sdk本地session,并且需要判重
          var msg = handlerGroupMsg(newGroupMsg, false, true)
          if (msg) {
            //不为空，加到新消息里
            new_group_msgs.push(msg)
          }
          //更新myGroupMaxSeqs中的群最大seq
          updateMyGroupCurMaxSeq(newGroupMsg.ToGroupId, newGroupMsg.MsgSeq)
        }
      }
      return new_group_msgs
    }

    //处理收到的群普通和提示消息
    var handlerOrdinaryAndTipC2cMsgs = function (eventType, groupMsgArray) {
      var groupMsgMap = {} //保存收到的C2c消息信息（群号，最小，最大消息seq，消息列表）
      var new_group_msgs = []
      var minGroupMsgSeq = 99999999
      var maxGroupMsgSeq = -1
      for (var j in groupMsgArray) {
        var groupMsgs = groupMsgMap[groupMsgArray[j].ToGroupId]
        if (!groupMsgs) {
          groupMsgs = groupMsgMap[groupMsgArray[j].ToGroupId] = {
            min: minGroupMsgSeq, //收到新消息最小seq
            max: maxGroupMsgSeq, //收到新消息最大seq
            msgs: [] //收到的新消息
          }
        }
        //更新长轮询的群NoticeSeq
        if (groupMsgArray[j].NoticeSeq > noticeSeq) {
          log.warn(
            'noticeSeq=' +
              noticeSeq +
              ',msgNoticeSeq=' +
              groupMsgArray[j].NoticeSeq
          )
          noticeSeq = groupMsgArray[j].NoticeSeq
        }
        groupMsgArray[j].Event = eventType
        groupMsgMap[groupMsgArray[j].ToGroupId].msgs.push(groupMsgArray[j]) //新增一条消息
        if (groupMsgArray[j].MsgSeq < groupMsgs.min) {
          //记录最小的消息seq
          groupMsgMap[groupMsgArray[j].ToGroupId].min = groupMsgArray[j].MsgSeq
        }
        if (groupMsgArray[j].MsgSeq > groupMsgs.max) {
          //记录最大的消息seq
          groupMsgMap[groupMsgArray[j].ToGroupId].max = groupMsgArray[j].MsgSeq
        }
      }

      for (var groupId in groupMsgMap) {
        var tempCount = groupMsgMap[groupId].max - groupMsgMap[groupId].min + 1 //收到的新的群消息数
        var curMaxMsgSeq = myGroupMaxSeqs[groupId] //获取本地保存的群最大消息seq
        if (curMaxMsgSeq) {
          //存在这个群的最大消息seq
          //高并发情况下，长轮询可能存在丢消息，这时需要客户端通过拉取群消息接口补齐下
          //1、如果收到的新消息最小seq比当前最大群消息seq大于1，则表示收到的群消息发生跳跃，需要补齐
          //2、收到的新群消息seq存在不连续情况，也需要补齐
          if (
            groupMsgMap[groupId].min - curMaxMsgSeq > 1 ||
            groupMsgMap[groupId].msgs.length < tempCount
          ) {
            //发起一个拉群群消息请求
            log.warn(
              '发起一次补齐群消息请求,curMaxMsgSeq=' +
                curMaxMsgSeq +
                ', minMsgSeq=' +
                groupMsgMap[groupId].min +
                ', maxMsgSeq=' +
                groupMsgMap[groupId].max +
                ', msgs.length=' +
                groupMsgMap[groupId].msgs.length +
                ', tempCount=' +
                tempCount
            )
            getLostGroupMsgs(
              groupId,
              groupMsgMap[groupId].max,
              groupMsgMap[groupId].max - curMaxMsgSeq
            )
            //更新myGroupMaxSeqs中的群最大seq
            updateMyGroupCurMaxSeq(groupId, groupMsgMap[groupId].max)
          } else {
            new_group_msgs = addGroupMsgList(
              groupMsgMap[groupId].msgs,
              new_group_msgs
            )
          }
        } else {
          //不存在该群的最大消息seq
          log.warn('不存在该群的最大消息seq，群id=' + groupId)
          //高并发情况下，长轮询可能存在丢消息，这时需要客户端通过拉取群消息接口补齐下
          //1、收到的新群消息seq存在不连续情况，也需要补齐
          if (groupMsgMap[groupId].msgs.length < tempCount) {
            //发起一个拉群群消息请求
            log.warn(
              '发起一次补齐群消息请求,minMsgSeq=' +
                groupMsgMap[groupId].min +
                ', maxMsgSeq=' +
                groupMsgMap[groupId].max +
                ', msgs.length=' +
                groupMsgMap[groupId].msgs.length +
                ', tempCount=' +
                tempCount
            )
            getLostGroupMsgs(groupId, groupMsgMap[groupId].max, tempCount)
            //更新myGroupMaxSeqs中的群最大seq
            updateMyGroupCurMaxSeq(groupId, groupMsgMap[groupId].max)
          } else {
            new_group_msgs = addGroupMsgList(
              groupMsgMap[groupId].msgs,
              new_group_msgs
            )
          }
        }
      }
      if (new_group_msgs.length) {
        MsgStore.updateTimeline()
      }
      if (onMsgCallback && new_group_msgs.length) onMsgCallback(new_group_msgs)
    }

    //处理收到的群普通和提示消息
    var handlerOrdinaryAndTipGroupMsgs = function (eventType, groupMsgArray) {
      var groupMsgMap = {} //保存收到的群消息���息（群号，最小，最大消息seq，消息列表）
      var new_group_msgs = []
      var minGroupMsgSeq = 99999999
      var maxGroupMsgSeq = -1
      for (var j in groupMsgArray) {
        var groupMsgs = groupMsgMap[groupMsgArray[j].ToGroupId]
        if (!groupMsgs) {
          groupMsgs = groupMsgMap[groupMsgArray[j].ToGroupId] = {
            min: minGroupMsgSeq, //收到新消息最小seq
            max: maxGroupMsgSeq, //收到新消息最大seq
            msgs: [] //收到的新消息
          }
        }
        //更新长轮询的群NoticeSeq
        if (groupMsgArray[j].NoticeSeq > noticeSeq) {
          log.warn(
            'noticeSeq=' +
              noticeSeq +
              ',msgNoticeSeq=' +
              groupMsgArray[j].NoticeSeq
          )
          noticeSeq = groupMsgArray[j].NoticeSeq
        }
        groupMsgArray[j].Event = eventType
        groupMsgMap[groupMsgArray[j].ToGroupId].msgs.push(groupMsgArray[j]) //新增一条消息
        if (groupMsgArray[j].MsgSeq < groupMsgs.min) {
          //记录最小的消息seq
          groupMsgMap[groupMsgArray[j].ToGroupId].min = groupMsgArray[j].MsgSeq
        }
        if (groupMsgArray[j].MsgSeq > groupMsgs.max) {
          //记录最大的消息seq
          groupMsgMap[groupMsgArray[j].ToGroupId].max = groupMsgArray[j].MsgSeq
        }
      }

      for (var groupId in groupMsgMap) {
        var tempCount = groupMsgMap[groupId].max - groupMsgMap[groupId].min + 1 //收到的新的群消息数
        var curMaxMsgSeq = myGroupMaxSeqs[groupId] //获取本地保存的群最大消息seq
        if (curMaxMsgSeq) {
          //存在这个群的最大消息seq
          //高并发情况下，长轮询可能存在丢消息，这时需要客户端通过拉取群消息接口补齐下
          //1、如果收到的新消息最小seq比当前最大群消息seq大于1，则表示收到的群消息发生跳跃，需要补齐
          //2、收到的新群消息seq存在不连续情况，也需要补齐
          if (
            groupMsgMap[groupId].min - curMaxMsgSeq > 1 ||
            groupMsgMap[groupId].msgs.length < tempCount
          ) {
            //发起一个拉群群消息请求
            log.warn(
              '发起一次补齐群消息请求,curMaxMsgSeq=' +
                curMaxMsgSeq +
                ', minMsgSeq=' +
                groupMsgMap[groupId].min +
                ', maxMsgSeq=' +
                groupMsgMap[groupId].max +
                ', msgs.length=' +
                groupMsgMap[groupId].msgs.length +
                ', tempCount=' +
                tempCount
            )
            getLostGroupMsgs(
              groupId,
              groupMsgMap[groupId].max,
              groupMsgMap[groupId].max - curMaxMsgSeq
            )
            //更新myGroupMaxSeqs中的群最大seq
            updateMyGroupCurMaxSeq(groupId, groupMsgMap[groupId].max)
          } else {
            new_group_msgs = addGroupMsgList(
              groupMsgMap[groupId].msgs,
              new_group_msgs
            )
          }
        } else {
          //不存在该群的最大消息seq
          log.warn('不存在该群的最大消息seq，群id=' + groupId)
          //高并发情况下，长轮询可能存在丢消息，这时需要客户端通过拉取群消息接口补齐下
          //1、收到的新群消息seq存在不连续情况，也需要补齐
          if (groupMsgMap[groupId].msgs.length < tempCount) {
            //发起一个拉群群消息请求
            log.warn(
              '发起一次补齐群消息请求,minMsgSeq=' +
                groupMsgMap[groupId].min +
                ', maxMsgSeq=' +
                groupMsgMap[groupId].max +
                ', msgs.length=' +
                groupMsgMap[groupId].msgs.length +
                ', tempCount=' +
                tempCount
            )
            getLostGroupMsgs(groupId, groupMsgMap[groupId].max, tempCount)
            //更新myGroupMaxSeqs中的群最大seq
            updateMyGroupCurMaxSeq(groupId, groupMsgMap[groupId].max)
          } else {
            new_group_msgs = addGroupMsgList(
              groupMsgMap[groupId].msgs,
              new_group_msgs
            )
          }
        }
      }
      if (new_group_msgs.length) {
        MsgStore.updateTimeline()
      }
      if (onMsgCallback && new_group_msgs.length) onMsgCallback(new_group_msgs)
    }

    //处理新的群提示消息
    var handlerGroupTips = function (groupTips) {
      var new_group_msgs = []
      for (var o in groupTips) {
        var groupTip = groupTips[o]
        //添加event字段
        groupTip.Event = LONG_POLLINNG_EVENT_TYPE.GROUP_TIP
        //更新群消息通知seq
        if (groupTip.NoticeSeq > noticeSeq) {
          noticeSeq = groupTip.NoticeSeq
        }
        var msg = handlerGroupMsg(groupTip, false, true)
        if (msg) {
          new_group_msgs.push(msg)
        }
      }
      if (new_group_msgs.length) {
        MsgStore.updateTimeline()
      }
      if (onMsgCallback && new_group_msgs.length) onMsgCallback(new_group_msgs)
    }

    //处理新的群系统消息
    //isNeedValidRepeatMsg 是否需要判重
    var handlerGroupSystemMsgs = function (
      groupSystemMsgs,
      isNeedValidRepeatMsg
    ) {
      for (var k in groupSystemMsgs) {
        var groupTip = groupSystemMsgs[k]
        var groupReportTypeMsg = groupTip.MsgBody
        var reportType = groupReportTypeMsg.ReportType
        //当长轮询返回的群系统消息，才需要更新群消息通知seq
        if (
          isNeedValidRepeatMsg == false &&
          groupTip.NoticeSeq &&
          groupTip.NoticeSeq > noticeSeq
        ) {
          noticeSeq = groupTip.NoticeSeq
        }
        var toAccount = groupTip.GroupInfo.To_Account
        //过滤本不应该给自己的系统消息
        /*if (!toAccount || toAccount != ctx.identifier) {
                 log.error("收到本不应该给自己的系统消息: To_Account=" + toAccount);
                 continue;
                 }*/
        if (isNeedValidRepeatMsg) {
          //var key=groupTip.ToGroupId+"_"+reportType+"_"+groupTip.MsgTimeStamp+"_"+groupReportTypeMsg.Operator_Account;
          var key =
            groupTip.ToGroupId +
            '_' +
            reportType +
            '_' +
            groupReportTypeMsg.Operator_Account
          var isExist = groupSystemMsgsCache[key]
          if (isExist) {
            log.warn('收到重复的群系统消息：key=' + key)
            continue
          }
          groupSystemMsgsCache[key] = true
        }

        var notify = {
          SrcFlag: 0,
          ReportType: reportType,
          GroupId: groupTip.ToGroupId,
          GroupName: groupTip.GroupInfo.GroupName,
          Operator_Account: groupReportTypeMsg.Operator_Account,
          MsgTime: groupTip.MsgTimeStamp,
          groupReportTypeMsg: groupReportTypeMsg
        }
        switch (reportType) {
          case GROUP_SYSTEM_TYPE.JOIN_GROUP_REQUEST: //申请加群(只有管理员会接收到)
            notify['RemarkInfo'] = groupReportTypeMsg.RemarkInfo
            notify['MsgKey'] = groupReportTypeMsg.MsgKey
            notify['Authentication'] = groupReportTypeMsg.Authentication
            notify['UserDefinedField'] = groupTip.UserDefinedField
            notify['From_Account'] = groupTip.From_Account
            notify['MsgSeq'] = groupTip.ClientSeq
            notify['MsgRandom'] = groupTip.MsgRandom
            break
          case GROUP_SYSTEM_TYPE.JOIN_GROUP_ACCEPT: //申请加群被同意(只有申请人自己接收到)
          case GROUP_SYSTEM_TYPE.JOIN_GROUP_REFUSE: //申请加群被拒绝(只有申请人自己接收到)
            notify['RemarkInfo'] = groupReportTypeMsg.RemarkInfo
            break
          case GROUP_SYSTEM_TYPE.KICK: //被管理员踢出群(只有被踢者接收到)
          case GROUP_SYSTEM_TYPE.DESTORY: //群被解散(全员接收)
          case GROUP_SYSTEM_TYPE.CREATE: //创建群(创建者接收, 不展示)
          case GROUP_SYSTEM_TYPE.INVITED_JOIN_GROUP_REQUEST: //邀请加群(被邀请者接收)
          case GROUP_SYSTEM_TYPE.INVITED_JOIN_GROUP_REQUEST_AGREE: //邀请加群(被邀请者需同意)
          case GROUP_SYSTEM_TYPE.QUIT: //主动退群(主动退出者接收, 不展示)
          case GROUP_SYSTEM_TYPE.SET_ADMIN: //群设置管理员(被设置者接收)
          case GROUP_SYSTEM_TYPE.CANCEL_ADMIN: //取消管理员(被取消者接收)
          case GROUP_SYSTEM_TYPE.REVOKE: //群已被回收(全员接收, 不展示)
            break
          case GROUP_SYSTEM_TYPE.READED: //群消息已读同步
            break
          case GROUP_SYSTEM_TYPE.CUSTOM: //用户自定义通知(默认全员接收)
            notify['MsgSeq'] = groupTip.MsgSeq
            notify['UserDefinedField'] = groupReportTypeMsg.UserDefinedField
            break
          default:
            log.error('未知群系统消息类型：reportType=' + reportType)
            break
        }

        if (isNeedValidRepeatMsg) {
          //注释只收取一种通知
          if (reportType == GROUP_SYSTEM_TYPE.JOIN_GROUP_REQUEST) {
            //回调
            if (onGroupSystemNotifyCallbacks[reportType]) {
              onGroupSystemNotifyCallbacks[reportType](notify)
            } else {
              log.error('未知群系统消息类型：reportType=' + reportType)
            }
          }
        } else {
          //回调
          if (onGroupSystemNotifyCallbacks[reportType]) {
            if (reportType == GROUP_SYSTEM_TYPE.READED) {
              var arr = notify.groupReportTypeMsg.GroupReadInfoArray
              for (var i = 0, l = arr.length; i < l; i++) {
                var item = arr[i]
                onGroupSystemNotifyCallbacks[reportType](item)
              }
            } else {
              onGroupSystemNotifyCallbacks[reportType](notify)
            }
          }
        }
      } //loop
    }

    //处理新的好友系统通知
    //isNeedValidRepeatMsg 是否需要判重
    var handlerFriendSystemNotices = function (
      friendSystemNotices,
      isNeedValidRepeatMsg
    ) {
      var friendNotice, type, notify
      for (var k in friendSystemNotices) {
        friendNotice = friendSystemNotices[k]
        type = friendNotice.PushType
        //当长轮询返回的群系统消息，才需要更新通知seq
        if (
          isNeedValidRepeatMsg == false &&
          friendNotice.NoticeSeq &&
          friendNotice.NoticeSeq > noticeSeq
        ) {
          noticeSeq = friendNotice.NoticeSeq
        }
        notify = {
          Type: type
        }
        switch (type) {
          case FRIEND_NOTICE_TYPE.FRIEND_ADD: //好友表增加
            notify['Accounts'] = friendNotice.FriendAdd_Account
            break
          case FRIEND_NOTICE_TYPE.FRIEND_DELETE: //好友表删除
            notify['Accounts'] = friendNotice.FriendDel_Account
            break
          case FRIEND_NOTICE_TYPE.PENDENCY_ADD: //未决增加
            notify['PendencyList'] = friendNotice.PendencyAdd
            break
          case FRIEND_NOTICE_TYPE.PENDENCY_DELETE: //未决删除
            notify['Accounts'] = friendNotice.FrienPencydDel_Account
            break
          case FRIEND_NOTICE_TYPE.BLACK_LIST_ADD: //黑名单增加
            notify['Accounts'] = friendNotice.BlackListAdd_Account
            break
          case FRIEND_NOTICE_TYPE.BLACK_LIST_DELETE: //黑名单删除
            notify['Accounts'] = friendNotice.BlackListDel_Account
            break
          /*case FRIEND_NOTICE_TYPE.PENDENCY_REPORT://未决已读上报

                     break;
                     case FRIEND_NOTICE_TYPE.FRIEND_UPDATE://好友数据更新

                     break;
                     */
          default:
            log.error(
              '未知好友系统通知类型：friendNotice=' +
                JSON.stringify(friendNotice)
            )
            break
        }

        if (isNeedValidRepeatMsg) {
          if (type == FRIEND_NOTICE_TYPE.PENDENCY_ADD) {
            //回调
            if (onFriendSystemNotifyCallbacks[type])
              onFriendSystemNotifyCallbacks[type](notify)
          }
        } else {
          //回调
          if (onFriendSystemNotifyCallbacks[type])
            onFriendSystemNotifyCallbacks[type](notify)
        }
      } //loop
    }

    //处理新的资料系统通知
    //isNeedValidRepeatMsg 是否需要判重
    var handlerProfileSystemNotices = function (
      profileSystemNotices,
      isNeedValidRepeatMsg
    ) {
      var profileNotice, type, notify
      for (var k in profileSystemNotices) {
        profileNotice = profileSystemNotices[k]
        type = profileNotice.PushType
        //当长轮询返回的群系统消息，才需要更新通知seq
        if (
          isNeedValidRepeatMsg == false &&
          profileNotice.NoticeSeq &&
          profileNotice.NoticeSeq > noticeSeq
        ) {
          noticeSeq = profileNotice.NoticeSeq
        }
        notify = {
          Type: type
        }
        switch (type) {
          case PROFILE_NOTICE_TYPE.PROFILE_MODIFY: //资料修改
            notify['Profile_Account'] = profileNotice.Profile_Account
            notify['ProfileList'] = profileNotice.ProfileList
            break
          default:
            log.error(
              '未知资料系统通知类型：profileNotice=' +
                JSON.stringify(profileNotice)
            )
            break
        }

        if (isNeedValidRepeatMsg) {
          if (type == PROFILE_NOTICE_TYPE.PROFILE_MODIFY) {
            //回调
            if (onProfileSystemNotifyCallbacks[type])
              onProfileSystemNotifyCallbacks[type](notify)
          }
        } else {
          //回调
          if (onProfileSystemNotifyCallbacks[type])
            onProfileSystemNotifyCallbacks[type](notify)
        }
      } //loop
    }

    //处理新的群系统消息(用于直播大群长轮询)
    var handlerGroupSystemMsg = function (groupTip) {
      var groupReportTypeMsg = groupTip.MsgBody
      var reportType = groupReportTypeMsg.ReportType
      var toAccount = groupTip.GroupInfo.To_Account
      //过滤本不应该给自己的系统消息
      //if(!toAccount || toAccount!=ctx.identifier){
      //    log.error("收到本不应该给自己的系统消息: To_Account="+toAccount);
      //    continue;
      //}
      var notify = {
        SrcFlag: 1,
        ReportType: reportType,
        GroupId: groupTip.ToGroupId,
        GroupName: groupTip.GroupInfo.GroupName,
        Operator_Account: groupReportTypeMsg.Operator_Account,
        MsgTime: groupTip.MsgTimeStamp
      }
      switch (reportType) {
        case GROUP_SYSTEM_TYPE.JOIN_GROUP_REQUEST: //申请加群(只有管理员会接收到)
          notify['RemarkInfo'] = groupReportTypeMsg.RemarkInfo
          notify['MsgKey'] = groupReportTypeMsg.MsgKey
          notify['Authentication'] = groupReportTypeMsg.Authentication
          notify['UserDefinedField'] = groupTip.UserDefinedField
          notify['From_Account'] = groupTip.From_Account
          notify['MsgSeq'] = groupTip.ClientSeq
          notify['MsgRandom'] = groupTip.MsgRandom
          break
        case GROUP_SYSTEM_TYPE.JOIN_GROUP_ACCEPT: //申请加群被同意(只有申请人自己接收到)
        case GROUP_SYSTEM_TYPE.JOIN_GROUP_REFUSE: //申请加群被拒绝(只有申请人自己接收到)
          notify['RemarkInfo'] = groupReportTypeMsg.RemarkInfo
          break
        case GROUP_SYSTEM_TYPE.KICK: //被管理员踢出群(只有被踢者接收到)
        case GROUP_SYSTEM_TYPE.DESTORY: //群被解散(全员接收)
        case GROUP_SYSTEM_TYPE.CREATE: //创建群(创建者接收, 不展示)
        case GROUP_SYSTEM_TYPE.INVITED_JOIN_GROUP_REQUEST: //邀请加群(被邀请者接收)
        case GROUP_SYSTEM_TYPE.INVITED_JOIN_GROUP_REQUEST_AGREE: //邀请加群(被邀请者需要同意)
        case GROUP_SYSTEM_TYPE.QUIT: //主动退群(主动退出者接收, 不展示)
        case GROUP_SYSTEM_TYPE.SET_ADMIN: //群设置管理员(被设置者接收)
        case GROUP_SYSTEM_TYPE.CANCEL_ADMIN: //取消管理员(被取消者接收)
        case GROUP_SYSTEM_TYPE.REVOKE: //群已被回收(全员接收, 不展示)
          break
        case GROUP_SYSTEM_TYPE.CUSTOM: //用户自定义通知(默认全员接收)
          notify['MsgSeq'] = groupTip.MsgSeq
          notify['UserDefinedField'] = groupReportTypeMsg.UserDefinedField
          break
        default:
          log.error('未知群系统消息类型：reportType=' + reportType)
          break
      }
      //回调
      if (onGroupSystemNotifyCallbacks[reportType])
        onGroupSystemNotifyCallbacks[reportType](notify)
    }

    //处理C2C EVENT 消息通道Array
    var handlerC2cNotifyMsgArray = function (arr) {
      for (var i = 0, l = arr.length; i < l; i++) {
        handlerC2cEventMsg(arr[i])
      }
    }

    //处理C2C EVENT 消息通道Item
    var handlerC2cEventMsg = function (notify) {
      var subType = notify.SubMsgType
      switch (subType) {
        case C2C_EVENT_SUB_TYPE.READED: //已读通知
          // stopPolling = true;
          //回调onMsgReadCallback
          if (
            notify.ReadC2cMsgNotify.UinPairReadArray &&
            onC2cEventCallbacks[subType]
          ) {
            for (
              var i = 0, l = notify.ReadC2cMsgNotify.UinPairReadArray.length;
              i < l;
              i++
            ) {
              var item = notify.ReadC2cMsgNotify.UinPairReadArray[i]
              onC2cEventCallbacks[subType](item)
            }
          }
          break
        case C2C_EVENT_SUB_TYPE.KICKEDOUT: //已读通知
          if (onC2cEventCallbacks[subType]) {
            onC2cEventCallbacks[subType]()
          }
          break
        default:
          log.error('未知C2c系统消息：subType=' + subType)
          break
      }
    }

    //长轮询
    this.longPolling = function (cbOk, cbErr) {
      var opts = {
        Timeout: longPollingDefaultTimeOut / 1000,
        Cookie: {
          NotifySeq: notifySeq,
          NoticeSeq: noticeSeq
        }
      }
      if (LongPollingId) {
        opts.Cookie.LongPollingId = LongPollingId
        doPolling()
      } else {
        proto_getLongPollingId({}, function (resp) {
          LongPollingId = opts.Cookie.LongPollingId = resp.LongPollingId
          //根据回包设置超时时间，超时时长不能>60秒，因为webkit手机端的最长超时时间不能大于60s
          longPollingDefaultTimeOut =
            resp.Timeout > 60 ? longPollingDefaultTimeOut : resp.Timeout * 1000
          doPolling()
        })
      }

      function doPolling() {
        proto_longPolling(
          opts,
          function (resp) {
            for (var i in resp.EventArray) {
              var e = resp.EventArray[i]
              switch (e.Event) {
                case LONG_POLLINNG_EVENT_TYPE.C2C: //c2c消息通知
                  //更新C2C消息通知seq
                  notifySeq = e.NotifySeq
                  log.warn('longpolling: received new c2c msg')
                  //获取新消息
                  MsgManager.syncMsgs()
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_COMMON: //普通群消息通知
                  log.warn('longpolling: received new group msgs')
                  handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupMsgArray)
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP: //（全员广播）群提示消息
                  log.warn('longpolling: received new group tips')
                  handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupTips)
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP2: //群提示消息
                  log.warn('longpolling: received new group tips')
                  handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupTips)
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_SYSTEM: //（多终端同步）群系统消息
                  log.warn('longpolling: received new group system msgs')
                  //false 表示 通过长轮询收到的群系统消息，可以不判重
                  handlerGroupSystemMsgs(e.GroupTips, false)
                  break
                case LONG_POLLINNG_EVENT_TYPE.FRIEND_NOTICE: //好友系统通知
                  log.warn('longpolling: received new friend system notice')
                  //false 表示 通过长轮询收到的好友系统通知，可以不判重
                  handlerFriendSystemNotices(e.FriendListMod, false)
                  break
                case LONG_POLLINNG_EVENT_TYPE.PROFILE_NOTICE: //资料系统通知
                  log.warn('longpolling: received new profile system notice')
                  //false 表示 通过长轮询收到的资料系统通知，可以不判重
                  handlerProfileSystemNotices(e.ProfileDataMod, false)
                  break
                case LONG_POLLINNG_EVENT_TYPE.C2C_COMMON: //c2c消息通知
                  noticeSeq = e.C2cMsgArray[0].NoticeSeq
                  //更新C2C消息通知seq
                  log.warn(
                    'longpolling: received new c2c_common msg',
                    noticeSeq
                  )
                  handlerOrdinaryAndTipC2cMsgs(e.Event, e.C2cMsgArray)
                  break
                case LONG_POLLINNG_EVENT_TYPE.C2C_EVENT: //c2c已读消息通知
                  noticeSeq = e.C2cNotifyMsgArray[0].NoticeSeq
                  log.warn('longpolling: received new c2c_event msg')
                  handlerC2cNotifyMsgArray(e.C2cNotifyMsgArray)
                  break
                default:
                  log.error('longpolling收到未知新消息类型: Event=' + e.Event)
                  break
              }
            }
            var successInfo = {
              ActionStatus: ACTION_STATUS.OK,
              ErrorCode: 0
            }
            updatecLongPollingStatus(successInfo)
          },
          function (err) {
            // log.error(err);
            updatecLongPollingStatus(err)
            if (cbErr) cbErr(err)
          }
        )
      }
    }

    //大群 长轮询
    this.bigGroupLongPolling = function (cbOk, cbErr) {
      var opts = {
        StartSeq: bigGroupLongPollingStartSeq, //请求拉消息的起始seq
        HoldTime: bigGroupLongPollingHoldTime, //客户端长轮询的超时时间，单位是秒
        Key: bigGroupLongPollingKey //客户端加入群组后收到的的Key
      }

      proto_bigGroupLongPolling(
        opts,
        function (resp) {
          var msgObjList = []
          bigGroupLongPollingStartSeq = resp.NextSeq
          bigGroupLongPollingHoldTime = resp.HoldTime
          bigGroupLongPollingKey = resp.Key

          if (resp.RspMsgList && resp.RspMsgList.length > 0) {
            var msgCount = 0,
              msgInfo,
              event,
              msg
            for (var i = resp.RspMsgList.length - 1; i >= 0; i--) {
              msgInfo = resp.RspMsgList[i]
              //如果是已经删除的消息或者发送者帐号为空或者消息内容为空
              //IsPlaceMsg=1
              if (
                msgInfo.IsPlaceMsg ||
                !msgInfo.From_Account ||
                !msgInfo.MsgBody ||
                msgInfo.MsgBody.length == 0
              ) {
                continue
              }

              event = msgInfo.Event //群消息类型
              switch (event) {
                case LONG_POLLINNG_EVENT_TYPE.GROUP_COMMON: //群普通消息
                  log.info('bigGroupLongPolling: return new group msg')
                  msg = handlerGroupMsg(msgInfo, false, false)
                  msg && msgObjList.push(msg)
                  msgCount = msgCount + 1
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP: //群提示消息
                case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP2: //群提示消息
                  log.info('bigGroupLongPolling: return new group tip')
                  msg = handlerGroupMsg(msgInfo, false, false)
                  msg && msgObjList.push(msg)
                  //msgCount=msgCount+1;
                  break
                case LONG_POLLINNG_EVENT_TYPE.GROUP_SYSTEM: //群系统消息
                  log.info('bigGroupLongPolling: new group system msg')
                  handlerGroupSystemMsg(msgInfo)
                  break
                default:
                  log.error(
                    'bigGroupLongPolling收到未知新消息类型: Event=' + event
                  )
                  break
              }
            } // for loop
            if (msgCount > 0) {
              MsgManager.setBigGroupLongPollingMsgMap(
                msgInfo.ToGroupId,
                msgCount
              ) //
              log.warn(
                'current bigGroupLongPollingMsgMap: ' +
                  JSON.stringify(bigGroupLongPollingMsgMap)
              )
            }
          }
          curBigGroupLongPollingRetErrorCount = 0
          //返回连接状态
          var successInfo = {
            ActionStatus: ACTION_STATUS.OK,
            ErrorCode: CONNECTION_STATUS.ON,
            ErrorInfo: 'connection is ok...'
          }
          ConnManager.callBack(successInfo)

          if (cbOk) cbOk(msgObjList)
          else if (onBigGroupMsgCallback) onBigGroupMsgCallback(msgObjList) //返回新消息

          //重新启动长轮询
          bigGroupLongPollingOn && MsgManager.bigGroupLongPolling()
        },
        function (err) {
          //
          if (err.ErrorCode != longPollingTimeOutErrorCode) {
            log.error(err.ErrorInfo)
            //记录长轮询返回错误次数
            curBigGroupLongPollingRetErrorCount++
          }
          if (err.ErrorCode == longPollingKickedErrorCode) {
            //登出
            log.error('多实例登录，被kick')
            if (onKickedEventCall) {
              onKickedEventCall()
            }
          }
          //累计超过一定次数，不再发起长轮询请求
          if (
            curBigGroupLongPollingRetErrorCount <
            LONG_POLLING_MAX_RET_ERROR_COUNT
          ) {
            bigGroupLongPollingOn && MsgManager.bigGroupLongPolling()
          } else {
            var errInfo = {
              ActionStatus: ACTION_STATUS.FAIL,
              ErrorCode: CONNECTION_STATUS.OFF,
              ErrorInfo: 'connection is off'
            }
            ConnManager.callBack(errInfo)
          }
          if (cbErr) cbErr(err)
        },
        bigGroupLongPollingHoldTime * 1000
      )
    }

    //更新连接状态
    var updatecLongPollingStatus = function (errObj) {
      if (
        errObj.ErrorCode == 0 ||
        errObj.ErrorCode == longPollingTimeOutErrorCode
      ) {
        curLongPollingRetErrorCount = 0
        longPollingOffCallbackFlag = false
        var errorInfo
        var isNeedCallback = false
        switch (curLongPollingStatus) {
          case CONNECTION_STATUS.INIT:
            isNeedCallback = true
            curLongPollingStatus = CONNECTION_STATUS.ON
            errorInfo = 'create connection successfully(INIT->ON)'
            break
          case CONNECTION_STATUS.ON:
            errorInfo = 'connection is on...(ON->ON)'
            break
          case CONNECTION_STATUS.RECONNECT:
            curLongPollingStatus = CONNECTION_STATUS.ON
            errorInfo = 'connection is on...(RECONNECT->ON)'
            break
          case CONNECTION_STATUS.OFF:
            isNeedCallback = true
            curLongPollingStatus = CONNECTION_STATUS.RECONNECT
            errorInfo = 'reconnect successfully(OFF->RECONNECT)'
            break
        }
        var successInfo = {
          ActionStatus: ACTION_STATUS.OK,
          ErrorCode: curLongPollingStatus,
          ErrorInfo: errorInfo
        }
        isNeedCallback && ConnManager.callBack(successInfo)
        longPollingOn && MsgManager.longPolling()
      } else if (errObj.ErrorCode == longPollingKickedErrorCode) {
        //登出
        log.error('多实例登录，被kick')
        if (onKickedEventCall) {
          onKickedEventCall()
        }
      } else {
        //记录长轮询返回解析json错误次数
        curLongPollingRetErrorCount++
        log.warn(
          'longPolling接口第' +
            curLongPollingRetErrorCount +
            '次报错: ' +
            errObj.ErrorInfo
        )
        //累计超过一定次数
        if (curLongPollingRetErrorCount <= LONG_POLLING_MAX_RET_ERROR_COUNT) {
          setTimeout(startNextLongPolling, 100) //
        } else {
          curLongPollingStatus = CONNECTION_STATUS.OFF
          var errInfo = {
            ActionStatus: ACTION_STATUS.FAIL,
            ErrorCode: CONNECTION_STATUS.OFF,
            ErrorInfo: 'connection is off'
          }
          longPollingOffCallbackFlag == false && ConnManager.callBack(errInfo)
          longPollingOffCallbackFlag = true
          log.warn(
            longPollingIntervalTime + '毫秒之后,SDK会发起新的longPolling请求...'
          )
          setTimeout(startNextLongPolling, longPollingIntervalTime) //长轮询接口报错次数达到一定值，每间隔5s发起新的长轮询
        }
      }
    }

    //处理收到的普通C2C消息
    var handlerOrdinaryAndTipC2cMsgs = function (eventType, C2cMsgArray) {
      //处理c2c消息
      var notifyInfo = []
      var msgInfos = []
      msgInfos = C2cMsgArray //返回的消息列表
      // MsgStore.cookie = resp.Cookie;//cookies，记录当前读到的最新消息位置

      for (var i in msgInfos) {
        var msgInfo = msgInfos[i]
        var isSendMsg, id, headUrl
        if (msgInfo.From_Account == ctx.identifier) {
          //当前用户发送的消息
          isSendMsg = true
          id = msgInfo.To_Account //读取接收者信息
          headUrl = ''
        } else {
          //当前用户收到的消息
          isSendMsg = false
          id = msgInfo.From_Account //读取发送者信息
          headUrl = ''
        }
        var sess = MsgStore.sessByTypeId(SESSION_TYPE.C2C, id)
        if (!sess) {
          sess = new Session(SESSION_TYPE.C2C, id, id, headUrl, 0, 0)
        }
        var msg = new Msg(
          sess,
          isSendMsg,
          msgInfo.MsgSeq,
          msgInfo.MsgRandom,
          msgInfo.MsgTimeStamp,
          msgInfo.From_Account
        )
        var msgBody = null
        var msgContent = null
        var msgType = null
        for (var mi in msgInfo.MsgBody) {
          msgBody = msgInfo.MsgBody[mi]
          msgType = msgBody.MsgType
          switch (msgType) {
            case MSG_ELEMENT_TYPE.TEXT:
              msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text)
              break
            case MSG_ELEMENT_TYPE.FACE:
              msgContent = new Msg.Elem.Face(
                msgBody.MsgContent.Index,
                msgBody.MsgContent.Data
              )
              break
            case MSG_ELEMENT_TYPE.IMAGE:
              msgContent = new Msg.Elem.Images(
                msgBody.MsgContent.UUID,
                msgBody.MsgContent.ImageFormat || ''
              )
              for (var j in msgBody.MsgContent.ImageInfoArray) {
                var tempImg = msgBody.MsgContent.ImageInfoArray[j]
                msgContent.addImage(
                  new Msg.Elem.Images.Image(
                    tempImg.Type,
                    tempImg.Size,
                    tempImg.Width,
                    tempImg.Height,
                    tempImg.URL
                  )
                )
              }
              break
            case MSG_ELEMENT_TYPE.SOUND:
              if (msgBody.MsgContent) {
                msgContent = new Msg.Elem.Sound(
                  msgBody.MsgContent.UUID,
                  msgBody.MsgContent.Second,
                  msgBody.MsgContent.Size,
                  msgInfo.From_Account,
                  msgInfo.To_Account,
                  msgBody.MsgContent.Download_Flag,
                  SESSION_TYPE.C2C
                )
              } else {
                msgType = MSG_ELEMENT_TYPE.TEXT
                msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错')
              }
              break
            case MSG_ELEMENT_TYPE.LOCATION:
              msgContent = new Msg.Elem.Location(
                msgBody.MsgContent.Longitude,
                msgBody.MsgContent.Latitude,
                msgBody.MsgContent.Desc
              )
              break
            case MSG_ELEMENT_TYPE.FILE:
            case MSG_ELEMENT_TYPE.FILE + ' ':
              msgType = MSG_ELEMENT_TYPE.FILE
              if (msgBody.MsgContent) {
                msgContent = new Msg.Elem.File(
                  msgBody.MsgContent.UUID,
                  msgBody.MsgContent.FileName,
                  msgBody.MsgContent.FileSize,
                  msgInfo.From_Account,
                  msgInfo.To_Account,
                  msgBody.MsgContent.Download_Flag,
                  SESSION_TYPE.C2C
                )
              } else {
                msgType = MSG_ELEMENT_TYPE.TEXT
                msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]')
              }
              break
            case MSG_ELEMENT_TYPE.CUSTOM:
              try {
                var data = JSON.parse(msgBody.MsgContent.Data)
                if (
                  data &&
                  data.userAction &&
                  data.userAction == FRIEND_WRITE_MSG_ACTION.ING
                ) {
                  //过滤安卓或ios的正在输入自定义消息
                  continue
                }
              } catch (e) {}

              msgType = MSG_ELEMENT_TYPE.CUSTOM
              msgContent = new Msg.Elem.Custom(
                msgBody.MsgContent.Data,
                msgBody.MsgContent.Desc,
                msgBody.MsgContent.Ext
              )
              break
            default:
              msgType = MSG_ELEMENT_TYPE.TEXT
              msgContent = new Msg.Elem.Text(
                'web端暂不支持' + msgBody.MsgType + '消息'
              )
              break
          }
          msg.elems.push(new Msg.Elem(msgType, msgContent))
        }

        if (msg.elems.length > 0 && MsgStore.addMsg(msg)) {
          notifyInfo.push(msg)
        }
      } // for loop
      if (notifyInfo.length > 0) MsgStore.updateTimeline()
      if (notifyInfo.length > 0) {
        if (onMsgCallback) onMsgCallback(notifyInfo)
      }
    }

    //发起新的长轮询请求
    var startNextLongPolling = function () {
      longPollingOn && MsgManager.longPolling()
    }

    //处理未决的加群申请消息列表
    var handlerApplyJoinGroupSystemMsgs = function (eventArray) {
      for (var i in eventArray) {
        var e = eventArray[i]
        handlerGroupSystemMsgs(e.GroupTips, true)
        switch (e.Event) {
          case LONG_POLLINNG_EVENT_TYPE.GROUP_SYSTEM: //（多终端同步）群系统消息
            log.warn(
              'handlerApplyJoinGroupSystemMsgs： handler new group system msg'
            )
            //true 表示 解决加群申请通知存在重复的问题（已处理的通知，下次登录还会拉到），需要判重
            handlerGroupSystemMsgs(e.GroupTips, true)
            break
          default:
            log.error('syncMsgs收到未知的群系统消息类型: Event=' + e.Event)
            break
        }
      }
    }

    //拉取c2c消息(包含加群未决消息，需要处理)
    this.syncMsgs = function (cbOk, cbErr) {
      var notifyInfo = []
      var msgInfos = []
      //读取C2C消息
      proto_getMsgs(
        MsgStore.cookie,
        MsgStore.syncFlag,
        function (resp) {
          //拉取完毕
          if (resp.SyncFlag == 2) {
            MsgStore.syncFlag = 0
          }
          //处理c2c消息
          msgInfos = resp.MsgList //返回的消息列表
          MsgStore.cookie = resp.Cookie //cookies，记录当前读到的最新消息位置

          for (var i in msgInfos) {
            var msgInfo = msgInfos[i]
            var isSendMsg, id, headUrl
            if (msgInfo.From_Account == ctx.identifier) {
              //当前用户发送的消息
              isSendMsg = true
              id = msgInfo.To_Account //读取接收者信息
              headUrl = ''
            } else {
              //当前用户收到的消息
              isSendMsg = false
              id = msgInfo.From_Account //读取发送者信息
              headUrl = ''
            }
            var sess = MsgStore.sessByTypeId(SESSION_TYPE.C2C, id)
            if (!sess) {
              sess = new Session(SESSION_TYPE.C2C, id, id, headUrl, 0, 0)
            }
            var msg = new Msg(
              sess,
              isSendMsg,
              msgInfo.MsgSeq,
              msgInfo.MsgRandom,
              msgInfo.MsgTimeStamp,
              msgInfo.From_Account
            )
            var msgBody = null
            var msgContent = null
            var msgType = null
            for (var mi in msgInfo.MsgBody) {
              msgBody = msgInfo.MsgBody[mi]
              msgType = msgBody.MsgType
              switch (msgType) {
                case MSG_ELEMENT_TYPE.TEXT:
                  msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text)
                  break
                case MSG_ELEMENT_TYPE.FACE:
                  msgContent = new Msg.Elem.Face(
                    msgBody.MsgContent.Index,
                    msgBody.MsgContent.Data
                  )
                  break
                case MSG_ELEMENT_TYPE.IMAGE:
                  msgContent = new Msg.Elem.Images(
                    msgBody.MsgContent.UUID,
                    msgBody.MsgContent.ImageFormat
                  )
                  for (var j in msgBody.MsgContent.ImageInfoArray) {
                    var tempImg = msgBody.MsgContent.ImageInfoArray[j]
                    msgContent.addImage(
                      new Msg.Elem.Images.Image(
                        tempImg.Type,
                        tempImg.Size,
                        tempImg.Width,
                        tempImg.Height,
                        tempImg.URL
                      )
                    )
                  }
                  break
                case MSG_ELEMENT_TYPE.SOUND:
                  // var soundUrl = getSoundDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account);
                  if (msgBody.MsgContent) {
                    msgContent = new Msg.Elem.Sound(
                      msgBody.MsgContent.UUID,
                      msgBody.MsgContent.Second,
                      msgBody.MsgContent.Size,
                      msgInfo.From_Account,
                      msgInfo.To_Account,
                      msgBody.MsgContent.Download_Flag,
                      SESSION_TYPE.C2C
                    )
                  } else {
                    msgType = MSG_ELEMENT_TYPE.TEXT
                    msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错')
                  }
                  break
                case MSG_ELEMENT_TYPE.LOCATION:
                  msgContent = new Msg.Elem.Location(
                    msgBody.MsgContent.Longitude,
                    msgBody.MsgContent.Latitude,
                    msgBody.MsgContent.Desc
                  )
                  break
                case MSG_ELEMENT_TYPE.FILE:
                case MSG_ELEMENT_TYPE.FILE + ' ':
                  msgType = MSG_ELEMENT_TYPE.FILE
                  // var fileUrl = getFileDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account, msgBody.MsgContent.FileName);
                  if (msgBody.MsgContent) {
                    msgContent = new Msg.Elem.File(
                      msgBody.MsgContent.UUID,
                      msgBody.MsgContent.FileName,
                      msgBody.MsgContent.FileSize,
                      msgInfo.From_Account,
                      msgInfo.To_Account,
                      msgBody.MsgContent.Download_Flag,
                      SESSION_TYPE.C2C
                    )
                  } else {
                    msgType = MSG_ELEMENT_TYPE.TEXT
                    msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]')
                  }
                  break
                case MSG_ELEMENT_TYPE.CUSTOM:
                  try {
                    var data = JSON.parse(msgBody.MsgContent.Data)
                    if (
                      data &&
                      data.userAction &&
                      data.userAction == FRIEND_WRITE_MSG_ACTION.ING
                    ) {
                      //过滤安卓或ios的正在输入自定义消息
                      continue
                    }
                  } catch (e) {}

                  msgType = MSG_ELEMENT_TYPE.CUSTOM
                  msgContent = new Msg.Elem.Custom(
                    msgBody.MsgContent.Data,
                    msgBody.MsgContent.Desc,
                    msgBody.MsgContent.Ext
                  )
                  break
                default:
                  msgType = MSG_ELEMENT_TYPE.TEXT
                  msgContent = new Msg.Elem.Text(
                    'web端暂不支持' + msgBody.MsgType + '消息'
                  )
                  break
              }
              msg.elems.push(new Msg.Elem(msgType, msgContent))
            }

            if (msg.elems.length > 0 && MsgStore.addMsg(msg)) {
              notifyInfo.push(msg)
            }
          } // for loop

          //处理加群未决申请消息
          handlerApplyJoinGroupSystemMsgs(resp.EventArray)

          if (notifyInfo.length > 0) MsgStore.updateTimeline()
          if (cbOk) cbOk(notifyInfo)
          else if (notifyInfo.length > 0) {
            if (onMsgCallback) onMsgCallback(notifyInfo)
          }
        },
        function (err) {
          log.error('getMsgs failed:' + err.ErrorInfo)
          if (cbErr) cbErr(err)
        }
      )
    }

    //拉取C2C漫游消息
    this.getC2CHistoryMsgs = function (options, cbOk, cbErr) {
      if (!options.Peer_Account) {
        if (cbErr) {
          cbErr(tool.getReturnError('Peer_Account is empty', -13))
          return
        }
      }
      if (!options.MaxCnt) {
        options.MaxCnt = 15
      }
      if (options.MaxCnt <= 0) {
        if (cbErr) {
          cbErr(tool.getReturnError('MaxCnt should be greater than 0', -14))
          return
        }
      }
      if (options.MaxCnt > 15) {
        if (cbErr) {
          cbErr(tool.getReturnError('MaxCnt can not be greater than 15', -15))
          return
        }
        return
      }
      if (options.MsgKey == null || options.MsgKey === undefined) {
        options.MsgKey = ''
      }
      var opts = {
        Peer_Account: options.Peer_Account,
        MaxCnt: options.MaxCnt,
        LastMsgTime: options.LastMsgTime,
        MsgKey: options.MsgKey
      }
      //读取c2c漫游消息
      proto_getC2CHistoryMsgs(
        opts,
        function (resp) {
          var msgObjList = []
          var msgInfos = []
          //处理c2c消息
          msgInfos = resp.MsgList //返回的消息列表
          var sess = MsgStore.sessByTypeId(
            SESSION_TYPE.C2C,
            options.Peer_Account
          )
          if (!sess) {
            sess = new Session(
              SESSION_TYPE.C2C,
              options.Peer_Account,
              options.Peer_Account,
              '',
              0,
              0
            )
          }
          for (var i in msgInfos) {
            var msgInfo = msgInfos[i]
            var isSendMsg, id, headUrl
            if (msgInfo.From_Account == ctx.identifier) {
              //当前用户发送的消息
              isSendMsg = true
              id = msgInfo.To_Account //读取接收者信息
              headUrl = ''
            } else {
              //当前用户收到的消息
              isSendMsg = false
              id = msgInfo.From_Account //读取发送者信息
              headUrl = ''
            }
            var msg = new Msg(
              sess,
              isSendMsg,
              msgInfo.MsgSeq,
              msgInfo.MsgRandom,
              msgInfo.MsgTimeStamp,
              msgInfo.From_Account
            )
            var msgBody = null
            var msgContent = null
            var msgType = null
            for (var mi in msgInfo.MsgBody) {
              msgBody = msgInfo.MsgBody[mi]
              msgType = msgBody.MsgType
              switch (msgType) {
                case MSG_ELEMENT_TYPE.TEXT:
                  msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text)
                  break
                case MSG_ELEMENT_TYPE.FACE:
                  msgContent = new Msg.Elem.Face(
                    msgBody.MsgContent.Index,
                    msgBody.MsgContent.Data
                  )
                  break
                case MSG_ELEMENT_TYPE.IMAGE:
                  msgContent = new Msg.Elem.Images(
                    msgBody.MsgContent.UUID,
                    msgBody.MsgContent.ImageFormat
                  )
                  for (var j in msgBody.MsgContent.ImageInfoArray) {
                    var tempImg = msgBody.MsgContent.ImageInfoArray[j]
                    msgContent.addImage(
                      new Msg.Elem.Images.Image(
                        tempImg.Type,
                        tempImg.Size,
                        tempImg.Width,
                        tempImg.Height,
                        tempImg.URL
                      )
                    )
                  }
                  break
                case MSG_ELEMENT_TYPE.SOUND:
                  // var soundUrl = getSoundDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account);

                  if (msgBody.MsgContent) {
                    msgContent = new Msg.Elem.Sound(
                      msgBody.MsgContent.UUID,
                      msgBody.MsgContent.Second,
                      msgBody.MsgContent.Size,
                      msgInfo.From_Account,
                      msgInfo.To_Account,
                      msgBody.MsgContent.Download_Flag,
                      SESSION_TYPE.C2C
                    )
                  } else {
                    msgType = MSG_ELEMENT_TYPE.TEXT
                    msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错')
                  }
                  break
                case MSG_ELEMENT_TYPE.LOCATION:
                  msgContent = new Msg.Elem.Location(
                    msgBody.MsgContent.Longitude,
                    msgBody.MsgContent.Latitude,
                    msgBody.MsgContent.Desc
                  )
                  break
                case MSG_ELEMENT_TYPE.FILE:
                case MSG_ELEMENT_TYPE.FILE + ' ':
                  msgType = MSG_ELEMENT_TYPE.FILE
                  // var fileUrl = getFileDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account, msgBody.MsgContent.FileName);

                  if (msgBody.MsgContent) {
                    msgContent = new Msg.Elem.File(
                      msgBody.MsgContent.UUID,
                      msgBody.MsgContent.FileName,
                      msgBody.MsgContent.FileSize,
                      msgInfo.From_Account,
                      msgInfo.To_Account,
                      msgBody.MsgContent.Download_Flag,
                      SESSION_TYPE.C2C
                    )
                  } else {
                    msgType = MSG_ELEMENT_TYPE.TEXT
                    msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]')
                  }
                  break
                case MSG_ELEMENT_TYPE.CUSTOM:
                  msgType = MSG_ELEMENT_TYPE.CUSTOM
                  msgContent = new Msg.Elem.Custom(
                    msgBody.MsgContent.Data,
                    msgBody.MsgContent.Desc,
                    msgBody.MsgContent.Ext
                  )

                  break
                default:
                  msgType = MSG_ELEMENT_TYPE.TEXT
                  msgContent = new Msg.Elem.Text(
                    'web端暂不支持' + msgBody.MsgType + '消息'
                  )
                  break
              }
              msg.elems.push(new Msg.Elem(msgType, msgContent))
            }
            MsgStore.addMsg(msg)
            msgObjList.push(msg)
          } // for loop

          MsgStore.updateTimeline()
          if (cbOk) {
            var newResp = {
              Complete: resp.Complete,
              MsgCount: msgObjList.length,
              LastMsgTime: resp.LastMsgTime,
              MsgKey: resp.MsgKey,
              MsgList: msgObjList
            }
            sess.isFinished(resp.Complete)
            cbOk(newResp)
          }
        },
        function (err) {
          log.error('getC2CHistoryMsgs failed:' + err.ErrorInfo)
          if (cbErr) cbErr(err)
        }
      )
    }

    //拉群历史消息
    //不传cbOk 和 cbErr，则会调用新消息回调函数
    this.syncGroupMsgs = function (options, cbOk, cbErr) {
      if (options.ReqMsgSeq <= 0) {
        if (cbErr) {
          var errInfo = 'ReqMsgSeq must be greater than 0'
          var error = tool.getReturnError(errInfo, -16)
          cbErr(error)
        }
        return
      }
      var opts = {
        GroupId: options.GroupId,
        ReqMsgSeq: options.ReqMsgSeq,
        ReqMsgNumber: options.ReqMsgNumber
      }
      //读群漫游消息
      proto_getGroupMsgs(
        opts,
        function (resp) {
          var notifyInfo = []
          var group_id = resp.GroupId //返回的群id
          var msgInfos = resp.RspMsgList //返回的消息列表
          var isFinished = resp.IsFinished

          if (msgInfos == null || msgInfos === undefined) {
            if (cbOk) {
              cbOk([])
            }
            return
          }
          for (var i = msgInfos.length - 1; i >= 0; i--) {
            var msgInfo = msgInfos[i]
            //如果是已经删除的消息或者发送者帐号为空或者消息内容为空
            //IsPlaceMsg=1
            if (
              msgInfo.IsPlaceMsg ||
              !msgInfo.From_Account ||
              !msgInfo.MsgBody ||
              msgInfo.MsgBody.length == 0
            ) {
              continue
            }
            var msg = handlerGroupMsg(msgInfo, true, true, isFinished)
            if (msg) {
              notifyInfo.push(msg)
            }
          } // for loop
          if (notifyInfo.length > 0) MsgStore.updateTimeline()
          if (cbOk) cbOk(notifyInfo)
          else if (notifyInfo.length > 0) {
            if (onMsgCallback) onMsgCallback(notifyInfo)
          }
        },
        function (err) {
          log.error('getGroupMsgs failed:' + err.ErrorInfo)
          if (cbErr) cbErr(err)
        }
      )
    }

    //处理群消息(普通消息+提示消息)
    //isSyncGroupMsgs 是否主动拉取群消息标志
    //isAddMsgFlag 是否需要保存到MsgStore，如果需要，这里会存在判重逻辑
    var handlerGroupMsg = function (
      msgInfo,
      isSyncGroupMsgs,
      isAddMsgFlag,
      isFinished
    ) {
      if (
        msgInfo.IsPlaceMsg ||
        !msgInfo.From_Account ||
        !msgInfo.MsgBody ||
        msgInfo.MsgBody.length == 0
      ) {
        return null
      }
      var isSendMsg, id, headUrl, fromAccountNick, fromAccountHeadurl
      var group_id = msgInfo.ToGroupId
      var group_name = group_id
      if (msgInfo.GroupInfo) {
        //取出群名称
        if (msgInfo.GroupInfo.GroupName) {
          group_name = msgInfo.GroupInfo.GroupName
        }
      }
      //取出成员昵称
      fromAccountNick = msgInfo.From_Account
      //fromAccountHeadurl = msgInfo.GroupInfo.From_AccountHeadurl;
      if (msgInfo.GroupInfo) {
        if (msgInfo.GroupInfo.From_AccountNick) {
          fromAccountNick = msgInfo.GroupInfo.From_AccountNick
        }
        if (msgInfo.GroupInfo.From_AccountHeadurl) {
          fromAccountHeadurl = msgInfo.GroupInfo.From_AccountHeadurl
        } else {
          fromAccountHeadurl = null
        }
      }
      if (msgInfo.From_Account == ctx.identifier) {
        //当前用户发送的消息
        isSendMsg = true
        id = msgInfo.From_Account //读取接收者信息
        headUrl = ''
      } else {
        //当前用户收到的消息
        isSendMsg = false
        id = msgInfo.From_Account //读取发送者信息
        headUrl = ''
      }
      var sess = MsgStore.sessByTypeId(SESSION_TYPE.GROUP, group_id)
      if (!sess) {
        sess = new Session(
          SESSION_TYPE.GROUP,
          group_id,
          group_name,
          headUrl,
          0,
          0
        )
      }
      if (typeof isFinished !== 'undefined') {
        sess.isFinished(isFinished || 0)
      }
      var subType = GROUP_MSG_SUB_TYPE.COMMON //消息类型
      //群提示消息,重新封装下
      if (
        LONG_POLLINNG_EVENT_TYPE.GROUP_TIP == msgInfo.Event ||
        LONG_POLLINNG_EVENT_TYPE.GROUP_TIP2 == msgInfo.Event
      ) {
        subType = GROUP_MSG_SUB_TYPE.TIP
        var groupTip = msgInfo.MsgBody
        msgInfo.MsgBody = []
        msgInfo.MsgBody.push({
          MsgType: MSG_ELEMENT_TYPE.GROUP_TIP,
          MsgContent: groupTip
        })
      } else if (msgInfo.MsgPriority) {
        //群点赞消息
        if (msgInfo.MsgPriority == GROUP_MSG_PRIORITY_TYPE.REDPACKET) {
          subType = GROUP_MSG_SUB_TYPE.REDPACKET
        } else if (msgInfo.MsgPriority == GROUP_MSG_PRIORITY_TYPE.LOVEMSG) {
          subType = GROUP_MSG_SUB_TYPE.LOVEMSG
        }
      }
      var msg = new Msg(
        sess,
        isSendMsg,
        msgInfo.MsgSeq,
        msgInfo.MsgRandom,
        msgInfo.MsgTimeStamp,
        msgInfo.From_Account,
        subType,
        fromAccountNick,
        fromAccountHeadurl
      )
      var msgBody = null
      var msgContent = null
      var msgType = null
      for (var mi in msgInfo.MsgBody) {
        msgBody = msgInfo.MsgBody[mi]
        msgType = msgBody.MsgType
        switch (msgType) {
          case MSG_ELEMENT_TYPE.TEXT:
            msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text)
            break
          case MSG_ELEMENT_TYPE.FACE:
            msgContent = new Msg.Elem.Face(
              msgBody.MsgContent.Index,
              msgBody.MsgContent.Data
            )
            break
          case MSG_ELEMENT_TYPE.IMAGE:
            msgContent = new Msg.Elem.Images(
              msgBody.MsgContent.UUID,
              msgBody.MsgContent.ImageFormat || ''
            )
            for (var j in msgBody.MsgContent.ImageInfoArray) {
              msgContent.addImage(
                new Msg.Elem.Images.Image(
                  msgBody.MsgContent.ImageInfoArray[j].Type,
                  msgBody.MsgContent.ImageInfoArray[j].Size,
                  msgBody.MsgContent.ImageInfoArray[j].Width,
                  msgBody.MsgContent.ImageInfoArray[j].Height,
                  msgBody.MsgContent.ImageInfoArray[j].URL
                )
              )
            }
            break
          case MSG_ELEMENT_TYPE.SOUND:
            if (msgBody.MsgContent) {
              msgContent = new Msg.Elem.Sound(
                msgBody.MsgContent.UUID,
                msgBody.MsgContent.Second,
                msgBody.MsgContent.Size,
                msgInfo.From_Account,
                msgInfo.To_Account,
                msgBody.MsgContent.Download_Flag,
                SESSION_TYPE.GROUP
              )
            } else {
              msgType = MSG_ELEMENT_TYPE.TEXT
              msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错')
            }
            break
          case MSG_ELEMENT_TYPE.LOCATION:
            msgContent = new Msg.Elem.Location(
              msgBody.MsgContent.Longitude,
              msgBody.MsgContent.Latitude,
              msgBody.MsgContent.Desc
            )
            break
          case MSG_ELEMENT_TYPE.FILE:
          case MSG_ELEMENT_TYPE.FILE + ' ':
            msgType = MSG_ELEMENT_TYPE.FILE
            var fileUrl = getFileDownUrl(
              msgBody.MsgContent.UUID,
              msgInfo.From_Account,
              msgBody.MsgContent.FileName
            )

            if (msgBody.MsgContent) {
              msgContent = new Msg.Elem.File(
                msgBody.MsgContent.UUID,
                msgBody.MsgContent.FileName,
                msgBody.MsgContent.FileSize,
                msgInfo.From_Account,
                msgInfo.To_Account,
                msgBody.MsgContent.Download_Flag,
                SESSION_TYPE.GROUP
              )
            } else {
              msgType = MSG_ELEMENT_TYPE.TEXT
              msgContent = new Msg.Elem.Text('[文件消息]地址解析出错')
            }
            break
          case MSG_ELEMENT_TYPE.GROUP_TIP:
            var opType = msgBody.MsgContent.OpType
            msgContent = new Msg.Elem.GroupTip(
              opType,
              msgBody.MsgContent.Operator_Account,
              group_id,
              msgInfo.GroupInfo.GroupName,
              msgBody.MsgContent.List_Account
            )
            if (
              GROUP_TIP_TYPE.JOIN == opType ||
              GROUP_TIP_TYPE.QUIT == opType
            ) {
              //加群或退群时，设置最新群成员数
              msgContent.setGroupMemberNum(msgBody.MsgContent.MemberNum)
            } else if (GROUP_TIP_TYPE.MODIFY_GROUP_INFO == opType) {
              //群资料变更
              var tempIsCallbackFlag = false
              var tempNewGroupInfo = {
                GroupId: group_id,
                GroupFaceUrl: null,
                GroupName: null,
                OwnerAccount: null,
                GroupNotification: null,
                GroupIntroduction: null
              }
              var msgGroupNewInfo = msgBody.MsgContent.MsgGroupNewInfo
              if (msgGroupNewInfo.GroupFaceUrl) {
                var tmpNGIFaceUrl = new Msg.Elem.GroupTip.GroupInfo(
                  GROUP_TIP_MODIFY_GROUP_INFO_TYPE.FACE_URL,
                  msgGroupNewInfo.GroupFaceUrl
                )
                msgContent.addGroupInfo(tmpNGIFaceUrl)
                tempIsCallbackFlag = true
                tempNewGroupInfo.GroupFaceUrl = msgGroupNewInfo.GroupFaceUrl
              }
              if (msgGroupNewInfo.GroupName) {
                var tmpNGIName = new Msg.Elem.GroupTip.GroupInfo(
                  GROUP_TIP_MODIFY_GROUP_INFO_TYPE.NAME,
                  msgGroupNewInfo.GroupName
                )
                msgContent.addGroupInfo(tmpNGIName)
                tempIsCallbackFlag = true
                tempNewGroupInfo.GroupName = msgGroupNewInfo.GroupName
              }
              if (msgGroupNewInfo.Owner_Account) {
                var tmpNGIOwner = new Msg.Elem.GroupTip.GroupInfo(
                  GROUP_TIP_MODIFY_GROUP_INFO_TYPE.OWNER,
                  msgGroupNewInfo.Owner_Account
                )
                msgContent.addGroupInfo(tmpNGIOwner)
                tempIsCallbackFlag = true
                tempNewGroupInfo.OwnerAccount = msgGroupNewInfo.Owner_Account
              }
              if (msgGroupNewInfo.GroupNotification) {
                var tmpNGINotification = new Msg.Elem.GroupTip.GroupInfo(
                  GROUP_TIP_MODIFY_GROUP_INFO_TYPE.NOTIFICATION,
                  msgGroupNewInfo.GroupNotification
                )
                msgContent.addGroupInfo(tmpNGINotification)
                tempIsCallbackFlag = true
                tempNewGroupInfo.GroupNotification =
                  msgGroupNewInfo.GroupNotification
              }
              if (msgGroupNewInfo.GroupIntroduction) {
                var tmpNGIIntroduction = new Msg.Elem.GroupTip.GroupInfo(
                  GROUP_TIP_MODIFY_GROUP_INFO_TYPE.INTRODUCTION,
                  msgGroupNewInfo.GroupIntroduction
                )
                msgContent.addGroupInfo(tmpNGIIntroduction)
                tempIsCallbackFlag = true
                tempNewGroupInfo.GroupIntroduction =
                  msgGroupNewInfo.GroupIntroduction
              }

              //回调群资料变化通知方法
              if (
                isSyncGroupMsgs == false &&
                tempIsCallbackFlag &&
                onGroupInfoChangeCallback
              ) {
                onGroupInfoChangeCallback(tempNewGroupInfo)
              }
            } else if (GROUP_TIP_TYPE.MODIFY_MEMBER_INFO == opType) {
              //群成员变更
              var memberInfos = msgBody.MsgContent.MsgMemberInfo
              for (var n in memberInfos) {
                var memberInfo = memberInfos[n]
                msgContent.addMemberInfo(
                  new Msg.Elem.GroupTip.MemberInfo(
                    memberInfo.User_Account,
                    memberInfo.ShutupTime
                  )
                )
              }
            }
            break
          case MSG_ELEMENT_TYPE.CUSTOM:
            msgType = MSG_ELEMENT_TYPE.CUSTOM
            msgContent = new Msg.Elem.Custom(
              msgBody.MsgContent.Data,
              msgBody.MsgContent.Desc,
              msgBody.MsgContent.Ext
            )
            break
          default:
            msgType = MSG_ELEMENT_TYPE.TEXT
            msgContent = new Msg.Elem.Text(
              'web端暂不支持' + msgBody.MsgType + '消息'
            )
            break
        }
        msg.elems.push(new Msg.Elem(msgType, msgContent))
      }

      if (isAddMsgFlag == false) {
        //不需要保存消息
        return msg
      }

      if (MsgStore.addMsg(msg)) {
        return msg
      } else {
        return null
      }
    }

    //初始化
    this.init = function (listeners, cbOk, cbErr) {
      if (!listeners.onMsgNotify) {
        log.warn('listeners.onMsgNotify is empty')
      }
      onMsgCallback = listeners.onMsgNotify

      if (listeners.onBigGroupMsgNotify) {
        onBigGroupMsgCallback = listeners.onBigGroupMsgNotify
      } else {
        log.warn('listeners.onBigGroupMsgNotify is empty')
      }

      if (listeners.onC2cEventNotifys) {
        onC2cEventCallbacks = listeners.onC2cEventNotifys
      } else {
        log.warn('listeners.onC2cEventNotifys is empty')
      }
      if (listeners.onGroupSystemNotifys) {
        onGroupSystemNotifyCallbacks = listeners.onGroupSystemNotifys
      } else {
        log.warn('listeners.onGroupSystemNotifys is empty')
      }
      if (listeners.onGroupInfoChangeNotify) {
        onGroupInfoChangeCallback = listeners.onGroupInfoChangeNotify
      } else {
        log.warn('listeners.onGroupInfoChangeNotify is empty')
      }
      if (listeners.onFriendSystemNotifys) {
        onFriendSystemNotifyCallbacks = listeners.onFriendSystemNotifys
      } else {
        log.warn('listeners.onFriendSystemNotifys is empty')
      }
      if (listeners.onProfileSystemNotifys) {
        onProfileSystemNotifyCallbacks = listeners.onProfileSystemNotifys
      } else {
        log.warn('listeners.onProfileSystemNotifys is empty')
      }
      if (listeners.onKickedEventCall) {
        onKickedEventCall = listeners.onKickedEventCall
      } else {
        log.warn('listeners.onKickedEventCall is empty')
      }

      if (listeners.onAppliedDownloadUrl) {
        onAppliedDownloadUrl = listeners.onAppliedDownloadUrl
      } else {
        log.warn('listeners.onAppliedDownloadUrl is empty')
      }

      if (!ctx.identifier || !ctx.userSig) {
        if (cbOk) {
          var success = {
            ActionStatus: ACTION_STATUS.OK,
            ErrorCode: 0,
            ErrorInfo: 'login success(no login state)'
          }
          cbOk(success)
        }
        return
      }

      //初始化
      initMyGroupMaxSeqs(function (resp) {
        log.info('initMyGroupMaxSeqs success')
        //初始化文件
        initIpAndAuthkey(function (initIpAndAuthkeyResp) {
          log.info('initIpAndAuthkey success')
          if (cbOk) {
            log.info('login success(have login state))')
            var success = {
              ActionStatus: ACTION_STATUS.OK,
              ErrorCode: 0,
              ErrorInfo: 'login success'
            }
            cbOk(success)
          }
          MsgManager.setLongPollingOn(true) //开启长轮询
          longPollingOn && MsgManager.longPolling(cbOk)
        }, cbErr)
      }, cbErr)
    }

    //发消息（私聊或群聊）
    this.sendMsg = function (msg, cbOk, cbErr) {
      proto_sendMsg(
        msg,
        function (resp) {
          //私聊时，加入自己的发的消息，群聊时，由于seq和服务器的seq不一样，所以不作处理
          if (msg.sess.type() == SESSION_TYPE.C2C) {
            if (!MsgStore.addMsg(msg)) {
              var errInfo = 'sendMsg: addMsg failed!'
              var error = tool.getReturnError(errInfo, -17)
              log.error(errInfo)
              if (cbErr) cbErr(error)
              return
            }
            //更新信息流时间
            MsgStore.updateTimeline()
          }
          if (cbOk) cbOk(resp)
        },
        function (err) {
          if (cbErr) cbErr(err)
        }
      )
    }
  }()

  //上传文件
  var FileUploader = new function () {
    this.fileMd5 = null
    //获取文件MD5
    var getFileMD5 = function (file, cbOk, cbErr) {
      //FileReader pc浏览器兼容性
      //Feature   Firefox (Gecko) Chrome  Internet Explorer   Opera   Safari
      //Basic support 3.6 7   10                      12.02   6.0.2
      var fileReader = null
      try {
        fileReader = new FileReader() //分块读取文件对象
      } catch (e) {
        if (cbErr) {
          cbErr(tool.getReturnError('当前浏览器不支持FileReader', -18))
          return
        }
      }
      //file的slice方法，注意它的兼容性，在不同浏览器的写法不同
      var blobSlice =
        File.prototype.mozSlice ||
        File.prototype.webkitSlice ||
        File.prototype.slice
      if (!blobSlice) {
        if (cbErr) {
          cbErr(tool.getReturnError('当前浏览器不支持FileAPI', -19))
          return
        }
      }

      var chunkSize = 2 * 1024 * 1024 //分块大小，2M
      var chunks = Math.ceil(file.size / chunkSize) //总块数
      var currentChunk = 0 //当前块数
      var spark = new SparkMD5() //获取MD5对象

      fileReader.onload = function (e) {
        //数据加载完毕事件

        var binaryStr = ''
        var bytes = new Uint8Array(e.target.result)
        var length = bytes.byteLength
        for (var i = 0; i < length; i++) {
          binaryStr += String.fromCharCode(bytes[i]) //二进制转换字符串
        }
        spark.appendBinary(binaryStr)
        currentChunk++
        if (currentChunk < chunks) {
          loadNext() //读取下一块数据
        } else {
          this.fileMd5 = spark.end() //得到文件MD5值
          if (cbOk) {
            cbOk(this.fileMd5)
          }
        }
      }
      //分片读取文件

      function loadNext() {
        var start = currentChunk * chunkSize,
          end = start + chunkSize >= file.size ? file.size : start + chunkSize
        //根据开始和结束位置，切割文件
        var b = blobSlice.call(file, start, end)
        //readAsBinaryString ie浏览器不兼容此方法
        //fileReader.readAsBinaryString(blobSlice.call(file, start, end));
        fileReader.readAsArrayBuffer(b) //ie，chrome，firefox等主流浏览器兼容此方法
      }

      loadNext() //开始读取
    }
    //提交上传图片表单(用于低版本IE9以下)
    this.submitUploadFileForm = function (options, cbOk, cbErr) {
      var errInfo
      var error
      var formId = options.formId
      var fileId = options.fileId
      var iframeNum = uploadResultIframeId++
      var iframeName = 'uploadResultIframe_' + iframeNum
      var toAccount = options.To_Account
      var businessType = options.businessType

      var form = document.getElementById(formId)
      if (!form) {
        errInfo = '获取表单对象为空: formId=' + formId + '(formId非法)'
        error = tool.getReturnError(errInfo, -20)
        if (cbErr) cbErr(error)
        return
      }

      var fileObj = document.getElementById(fileId)
      if (!fileObj) {
        errInfo =
          '获取文件对象为空: fileId=' + fileId + '(没有选择文件或者fileId非法)'
        error = tool.getReturnError(errInfo, -21)
        if (cbErr) cbErr(error)
        return
      }
      //fileObj.type="file";//ie8下不起作用，必须由业务自己设置
      fileObj.name = 'file'

      var iframe = document.createElement('iframe')
      iframe.name = iframeName
      iframe.id = iframeName
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      var cmdName
      if (isAccessFormalEnv()) {
        cmdName = 'pic_up'
      } else {
        cmdName = 'pic_up_test'
      }
      var uploadApiUrl =
        'https://pic.tim.qq.com/v4/openpic/' +
        cmdName +
        '?tinyid=' +
        ctx.tinyid +
        '&a2=' +
        ctx.a2 +
        '&sdkappid=' +
        ctx.sdkAppID +
        '&contenttype=http' +
        '&accounttype=' +
        ctx.accountType
      form.action = uploadApiUrl
      form.method = 'post'
      //form.enctype='multipart/form-data';//ie8下不起作用，必须由业务自己设置
      form.target = iframeName

      function createFormInput(name, value) {
        var tempInput = document.createElement('input')
        tempInput.type = 'hidden'
        tempInput.name = name
        tempInput.value = value
        form.appendChild(tempInput)
      }

      createFormInput('App_Version', VERSION_INFO.APP_VERSION)
      createFormInput('From_Account', ctx.identifier)
      createFormInput('To_Account', toAccount)
      createFormInput('Seq', nextSeq().toString())
      createFormInput('Timestamp', unixtime().toString())
      createFormInput('Random', createRandom().toString())
      createFormInput('Busi_Id', businessType)
      createFormInput('PkgFlag', UPLOAD_RES_PKG_FLAG.RAW_DATA.toString())
      createFormInput('Auth_Key', authkey)
      createFormInput('Server_Ver', VERSION_INFO.SERVER_VERSION.toString())
      createFormInput('File_Type', options.fileType)

      //检测iframe.contentWindow.name是否有值

      function checkFrameName() {
        var resp
        try {
          resp = JSON.parse(iframe.contentWindow.name) || {}
        } catch (e) {
          resp = {}
        }
        if (resp.ActionStatus) {
          //上传接口返回
          // We've got what we need. Stop the iframe from loading further content.
          iframe.src = 'about:blank'
          iframe.parentNode.removeChild(iframe)
          iframe = null

          if (resp.ActionStatus == ACTION_STATUS.OK) {
            cbOk && cbOk(resp)
          } else {
            cbErr && cbErr(resp)
          }
        } else {
          setTimeout(checkFrameName, 100)
        }
      }

      setTimeout(checkFrameName, 500)

      form.submit() //提交上传图片表单
    }
    //上传图片或文件(用于高版本浏览器，支持FileAPI)
    this.uploadFile = function (options, cbOk, cbErr) {
      var file_upload = {
        //初始化
        init: function (options, cbOk, cbErr) {
          var me = this
          me.file = options.file
          //分片上传进度回调事件
          me.onProgressCallBack = options.onProgressCallBack
          //停止上传图片按钮
          if (options.abortButton) {
            options.abortButton.onclick = me.abortHandler
          }
          me.total = me.file.size //文件总大小
          me.loaded = 0 //已读取字节数
          me.step = 1080 * 1024 //分块大小，1080K
          me.sliceSize = 0 //分片大小
          me.sliceOffset = 0 //当前分片位置
          me.timestamp = unixtime() //当前时间戳
          me.seq = nextSeq() //请求seq
          me.random = createRandom() //请求随机数
          me.fromAccount = ctx.identifier //发送者
          me.toAccount = options.To_Account //接收者
          me.fileMd5 = options.fileMd5 //文件MD5
          me.businessType = options.businessType //图片或文件的业务类型，群消息:1; c2c消息:2; 个人头像：3; 群头像：4;
          me.fileType = options.fileType //文件类型，不填为默认认为上传的是图片；1：图片；2：文件；3：短视频；4：PTT

          me.cbOk = cbOk //上传成功回调事件
          me.cbErr = cbErr //上传失败回调事件

          me.reader = new FileReader() //读取文件对象
          me.blobSlice =
            File.prototype.mozSlice ||
            File.prototype.webkitSlice ||
            File.prototype.slice //file的slice方法,不同浏览器不一样

          me.reader.onloadstart = me.onLoadStart //开始读取回调事件
          me.reader.onprogress = me.onProgress //读取文件进度回调事件
          me.reader.onabort = me.onAbort //停止读取回调事件
          me.reader.onerror = me.onerror //读取发生错误回调事件
          me.reader.onload = me.onLoad //分片加载完毕回调事件
          me.reader.onloadend = me.onLoadEnd //读取文件完毕回调事件
        },
        //上传方法
        upload: function () {
          var me = file_upload
          //读取第一块
          me.readBlob(0)
        },
        onLoadStart: function () {
          var me = file_upload
        },
        onProgress: function (e) {
          var me = file_upload
          me.loaded += e.loaded
          if (me.onProgressCallBack) {
            me.onProgressCallBack(me.loaded, me.total)
          }
        },
        onAbort: function () {
          var me = file_upload
        },
        onError: function () {
          var me = file_upload
        },
        onLoad: function (e) {
          var me = file_upload
          if (e.target.readyState == FileReader.DONE) {
            var slice_data_base64 = e.target.result
            //注意，一定要去除base64编码头部
            var pos = slice_data_base64.indexOf(',')
            if (pos != -1) {
              slice_data_base64 = slice_data_base64.substr(pos + 1)
            }
            //封装上传图片接口的请求参数
            var opt = {
              From_Account: me.fromAccount,
              To_Account: me.toAccount,
              Busi_Id: me.businessType,
              File_Type: me.fileType,
              File_Str_Md5: me.fileMd5,
              PkgFlag: UPLOAD_RES_PKG_FLAG.BASE64_DATA,
              File_Size: me.total,
              Slice_Offset: me.sliceOffset,
              Slice_Size: me.sliceSize,
              Slice_Data: slice_data_base64,
              Seq: me.seq,
              Timestamp: me.timestamp,
              Random: me.random
            }

            //上传成功的成功回调
            var succCallback = function (resp) {
              if (resp.IsFinish == 0) {
                me.loaded = resp.Next_Offset
                if (me.loaded < me.total) {
                  me.readBlob(me.loaded)
                } else {
                  me.loaded = me.total
                }
              } else {
                if (me.cbOk) {
                  var tempResp = {
                    ActionStatus: resp.ActionStatus,
                    ErrorCode: resp.ErrorCode,
                    ErrorInfo: resp.ErrorInfo,
                    File_UUID: resp.File_UUID,
                    File_Size: resp.Next_Offset,
                    URL_INFO: resp.URL_INFO,
                    Download_Flag: resp.Download_Flag
                  }
                  if (me.fileType == UPLOAD_RES_TYPE.FILE) {
                    //如果上传的是文件，下载地址需要sdk内部拼接
                    tempResp.URL_INFO = getFileDownUrl(
                      resp.File_UUID,
                      ctx.identifier,
                      me.file.name
                    )
                  }
                  me.cbOk(tempResp)
                }
              }
              Upload_Retry_Times = 0
            }
            //上传失败的回调
            var errorCallback = function (resp) {
              if (Upload_Retry_Times < Upload_Retry_Max_Times) {
                Upload_Retry_Times++
                setTimeout(function () {
                  proto_uploadPic(opt, succCallback, errorCallback)
                }, 1000)
              } else {
                me.cbErr(resp)
              }
              //me.cbErr
            }
            //分片上传图片接口
            proto_uploadPic(opt, succCallback, errorCallback)
          }
        },
        onLoadEnd: function () {
          var me = file_upload
        },
        //分片读取文件方法
        readBlob: function (start) {
          var me = file_upload
          var blob,
            file = me.file
          var end = start + me.step
          if (end > me.total) {
            end = me.total
            me.sliceSize = end - start
          } else {
            me.sliceSize = me.step
          }
          me.sliceOffset = start
          //根据起始和结束位置，分片读取文件
          blob = me.blobSlice.call(file, start, end)
          //将分片的二进制数据转换为base64编码
          me.reader.readAsDataURL(blob)
        },
        abortHandler: function () {
          var me = file_upload
          if (me.reader) {
            me.reader.abort()
          }
        }
      }

      //读取文件MD5
      getFileMD5(
        options.file,
        function (fileMd5) {
          log.info('fileMd5: ' + fileMd5)
          options.fileMd5 = fileMd5
          //初始化上传参数
          file_upload.init(options, cbOk, cbErr)
          //开始上传文件
          file_upload.upload()
        },
        cbErr
      )
    }
  }()

  //web im 基础对象

  //常量对象

  //会话类型
  webim.SESSION_TYPE = SESSION_TYPE

  webim.MSG_MAX_LENGTH = MSG_MAX_LENGTH

  //c2c消息子类型
  webim.C2C_MSG_SUB_TYPE = C2C_MSG_SUB_TYPE

  //群消息子类型
  webim.GROUP_MSG_SUB_TYPE = GROUP_MSG_SUB_TYPE

  //消息元素类型
  webim.MSG_ELEMENT_TYPE = MSG_ELEMENT_TYPE

  //群提示消息类型
  webim.GROUP_TIP_TYPE = GROUP_TIP_TYPE

  //图片类型
  webim.IMAGE_TYPE = IMAGE_TYPE

  //群系统消息类型
  webim.GROUP_SYSTEM_TYPE = GROUP_SYSTEM_TYPE

  //好友系统通知子类型
  webim.FRIEND_NOTICE_TYPE = FRIEND_NOTICE_TYPE

  //群提示消息-群资料变更类型
  webim.GROUP_TIP_MODIFY_GROUP_INFO_TYPE = GROUP_TIP_MODIFY_GROUP_INFO_TYPE

  //浏览器信息
  webim.BROWSER_INFO = BROWSER_INFO

  //表情对象
  webim.Emotions = webim.EmotionPicData = emotions
  //表情标识符和index Map
  webim.EmotionDataIndexs = webim.EmotionPicDataIndex = emotionDataIndexs

  //腾讯登录服务错误码(托管模式)
  webim.TLS_ERROR_CODE = TLS_ERROR_CODE

  //连接状态
  webim.CONNECTION_STATUS = CONNECTION_STATUS

  //上传图片业务类型
  webim.UPLOAD_PIC_BUSSINESS_TYPE = UPLOAD_PIC_BUSSINESS_TYPE

  //最近联系人类型
  webim.RECENT_CONTACT_TYPE = RECENT_CONTACT_TYPE

  //上传资源类型
  webim.UPLOAD_RES_TYPE = UPLOAD_RES_TYPE

  /**************************************/

  //类对象
  //
  //工具对象
  webim.Tool = tool
  //控制台打印日志对象
  webim.Log = log

  //消息对象
  webim.Msg = Msg
  //会话对象
  webim.Session = Session
  //会话存储对象
  webim.MsgStore = {
    sessMap: function () {
      return MsgStore.sessMap()
    },
    sessCount: function () {
      return MsgStore.sessCount()
    },
    sessByTypeId: function (type, id) {
      return MsgStore.sessByTypeId(type, id)
    },
    delSessByTypeId: function (type, id) {
      return MsgStore.delSessByTypeId(type, id)
    },
    resetCookieAndSyncFlag: function () {
      return MsgStore.resetCookieAndSyncFlag()
    }
  }

  webim.Resources = Resources

  /**************************************/

  // webim API impl
  //
  //基本接口
  //登录
  webim.login = webim.init = function (loginInfo, listeners, opts, cbOk, cbErr) {
    //初始化连接状态回调函数
    ConnManager.init(listeners.onConnNotify, cbOk, cbErr)

    //设置ie9以下浏览器jsonp回调
    if (listeners.jsonpCallback) jsonpCallback = listeners.jsonpCallback
    //登录
    _login(loginInfo, listeners, opts, cbOk, cbErr)
  }
  //登出
  //需要传长轮询id
  //这样登出之后其他的登录实例还可以继续收取消息
  webim.logout = webim.offline = function (cbOk, cbErr) {
    return proto_logout('instance', cbOk, cbErr)
  }

  //登出
  //这种登出方式，所有的实例都将不会收到消息推送，直到重新登录
  webim.logoutAll = function (cbOk, cbErr) {
    return proto_logout('all', cbOk, cbErr)
  }

  //消息管理接口
  //发消息接口（私聊和群聊）
  webim.sendMsg = function (msg, cbOk, cbErr) {
    return MsgManager.sendMsg(msg, cbOk, cbErr)
  }
  //拉取未读c2c消息
  webim.syncMsgs = function (cbOk, cbErr) {
    return MsgManager.syncMsgs(cbOk, cbErr)
  }
  //拉取C2C漫游消息
  webim.getC2CHistoryMsgs = function (options, cbOk, cbErr) {
    return MsgManager.getC2CHistoryMsgs(options, cbOk, cbErr)
  }
  //拉取群漫游消息
  webim.syncGroupMsgs = function (options, cbOk, cbErr) {
    return MsgManager.syncGroupMsgs(options, cbOk, cbErr)
  }

  //上报c2c消息已读
  webim.c2CMsgReaded = function (options, cbOk, cbErr) {
    return MsgStore.c2CMsgReaded(options, cbOk, cbErr)
  }

  //上报群消息已读
  webim.groupMsgReaded = function (options, cbOk, cbErr) {
    return proto_groupMsgReaded(options, cbOk, cbErr)
  }

  //设置聊天会话自动标记已读
  webim.setAutoRead = function (selSess, isOn, isResetAll) {
    return MsgStore.setAutoRead(selSess, isOn, isResetAll)
  }

  //群组管理接口
  //
  //创建群
  webim.createGroup = function (options, cbOk, cbErr) {
    return proto_createGroup(options, cbOk, cbErr)
  }
  //创建群-高级接口
  webim.createGroupHigh = function (options, cbOk, cbErr) {
    return proto_createGroupHigh(options, cbOk, cbErr)
  }
  //申请加群
  webim.applyJoinGroup = function (options, cbOk, cbErr) {
    return proto_applyJoinGroup(options, cbOk, cbErr)
  }
  //处理加群申请(同意或拒绝)
  webim.handleApplyJoinGroupPendency = function (options, cbOk, cbErr) {
    return proto_handleApplyJoinGroupPendency(options, cbOk, cbErr)
  }

  //获取群组未决列表
  webim.getPendencyGroup = function (options, cbOk, cbErr) {
    return proto_getPendencyGroup(options, cbOk, cbErr)
  }

  //群未决已读上报
  webim.getPendencyGroupRead = function (options, cbOk, cbErr) {
    return proto_getPendencyGroupRead(options, cbOk, cbErr)
  }

  //处理邀请进群申请(同意或拒绝)
  webim.handleInviteJoinGroupRequest = function (options, cbOk, cbErr) {
    return proto_handleInviteJoinGroupRequest(options, cbOk, cbErr)
  }

  //删除加群申请
  webim.deleteApplyJoinGroupPendency = function (options, cbOk, cbErr) {
    return proto_deleteC2CMsg(options, cbOk, cbErr)
  }

  //主动退群
  webim.quitGroup = function (options, cbOk, cbErr) {
    return proto_quitGroup(options, cbOk, cbErr)
  }
  //搜索群组(根据名称)
  webim.searchGroupByName = function (options, cbOk, cbErr) {
    return proto_searchGroupByName(options, cbOk, cbErr)
  }
  //获取群组公开资料(根据群id搜索)
  webim.getGroupPublicInfo = function (options, cbOk, cbErr) {
    return proto_getGroupPublicInfo(options, cbOk, cbErr)
  }
  //获取群组详细资料-高级接口
  webim.getGroupInfo = function (options, cbOk, cbErr) {
    return proto_getGroupInfo(options, cbOk, cbErr)
  }
  //修改群基本资料
  webim.modifyGroupBaseInfo = function (options, cbOk, cbErr) {
    return proto_modifyGroupBaseInfo(options, cbOk, cbErr)
  }
  //获取群成员列表
  webim.getGroupMemberInfo = function (options, cbOk, cbErr) {
    return proto_getGroupMemberInfo(options, cbOk, cbErr)
  }
  //邀请好友加群
  webim.addGroupMember = function (options, cbOk, cbErr) {
    return proto_addGroupMember(options, cbOk, cbErr)
  }
  //修改群成员资料
  webim.modifyGroupMember = function (options, cbOk, cbErr) {
    return proto_modifyGroupMember(options, cbOk, cbErr)
  }
  //删除群成员
  webim.deleteGroupMember = function (options, cbOk, cbErr) {
    return proto_deleteGroupMember(options, cbOk, cbErr)
  }
  //解散群
  webim.destroyGroup = function (options, cbOk, cbErr) {
    return proto_destroyGroup(options, cbOk, cbErr)
  }
  //转让群组
  webim.changeGroupOwner = function (options, cbOk, cbErr) {
    return proto_changeGroupOwner(options, cbOk, cbErr)
  }

  //获取我的群组列表-高级接口
  webim.getJoinedGroupListHigh = function (options, cbOk, cbErr) {
    return proto_getJoinedGroupListHigh(options, cbOk, cbErr)
  }
  //获取群成员角色
  webim.getRoleInGroup = function (options, cbOk, cbErr) {
    return proto_getRoleInGroup(options, cbOk, cbErr)
  }
  //设置群成员禁言时间
  webim.forbidSendMsg = function (options, cbOk, cbErr) {
    return proto_forbidSendMsg(options, cbOk, cbErr)
  }
  //发送自定义群系统通知
  webim.sendCustomGroupNotify = function (options, cbOk, cbErr) {
    return proto_sendCustomGroupNotify(options, cbOk, cbErr)
  }

  //进入大群
  webim.applyJoinBigGroup = function (options, cbOk, cbErr) {
    return proto_applyJoinBigGroup(options, cbOk, cbErr)
  }
  //退出大群
  webim.quitBigGroup = function (options, cbOk, cbErr) {
    return proto_quitBigGroup(options, cbOk, cbErr)
  }

  //资料关系链管理接口
  //
  //获取个人资料接口，可用于搜索用户
  webim.getProfilePortrait = function (options, cbOk, cbErr) {
    return proto_getProfilePortrait(options, cbOk, cbErr)
  }
  //设置个人资料
  webim.setProfilePortrait = function (options, cbOk, cbErr) {
    return proto_setProfilePortrait(options, cbOk, cbErr)
  }
  //申请加好友
  webim.applyAddFriend = function (options, cbOk, cbErr) {
    return proto_applyAddFriend(options, cbOk, cbErr)
  }
  //获取好友申请列表
  webim.getPendency = function (options, cbOk, cbErr) {
    return proto_getPendency(options, cbOk, cbErr)
  }
  //好友申请列表已读上报
  webim.getPendencyReport = function (options, cbOk, cbErr) {
    return proto_getPendencyReport(options, cbOk, cbErr)
  }
  //删除好友申请
  webim.deletePendency = function (options, cbOk, cbErr) {
    return proto_deletePendency(options, cbOk, cbErr)
  }
  //处理好友申请
  webim.responseFriend = function (options, cbOk, cbErr) {
    return proto_responseFriend(options, cbOk, cbErr)
  }
  //获取我的好友
  webim.getAllFriend = function (options, cbOk, cbErr) {
    return proto_getAllFriend(options, cbOk, cbErr)
  }
  //删除会话
  webim.deleteChat = function (options, cbOk, cbErr) {
    return proto_deleteChat(options, cbOk, cbErr)
  }
  //删除好友
  webim.deleteFriend = function (options, cbOk, cbErr) {
    return proto_deleteFriend(options, cbOk, cbErr)
  }
  //拉黑
  webim.addBlackList = function (options, cbOk, cbErr) {
    return proto_addBlackList(options, cbOk, cbErr)
  }
  //删除黑名单
  webim.deleteBlackList = function (options, cbOk, cbErr) {
    return proto_deleteBlackList(options, cbOk, cbErr)
  }
  //获取我的黑名单
  webim.getBlackList = function (options, cbOk, cbErr) {
    return proto_getBlackList(options, cbOk, cbErr)
  }

  //获取最近会话
  webim.getRecentContactList = function (options, cbOk, cbErr) {
    return proto_getRecentContactList(options, cbOk, cbErr)
  }

  //图片或文件服务接口
  //
  //上传文件接口（高版本浏览器）
  webim.uploadFile = webim.uploadPic = function (options, cbOk, cbErr) {
    return FileUploader.uploadFile(options, cbOk, cbErr)
  }
  //提交上传图片表单接口（用于低版本ie）
  webim.submitUploadFileForm = function (options, cbOk, cbErr) {
    return FileUploader.submitUploadFileForm(options, cbOk, cbErr)
  }
  //上传图片或文件(Base64)接口
  webim.uploadFileByBase64 = webim.uploadPicByBase64 = function (
    options,
    cbOk,
    cbErr
  ) {
    //请求参数
    var opt = {
      To_Account: options.toAccount,
      Busi_Id: options.businessType,
      File_Type: options.File_Type,
      File_Str_Md5: options.fileMd5,
      PkgFlag: UPLOAD_RES_PKG_FLAG.BASE64_DATA,
      File_Size: options.totalSize,
      Slice_Offset: 0,
      Slice_Size: options.totalSize,
      Slice_Data: options.base64Str,
      Seq: nextSeq(),
      Timestamp: unixtime(),
      Random: createRandom()
    }
    return proto_uploadPic(opt, cbOk, cbErr)
  }

  //设置jsonp返回的值
  webim.setJsonpLastRspData = function (rspData) {
    jsonpLastRspData =
      typeof rspData == 'string' ? JSON.parse(rspData) : rspData
  }

  //获取长轮询ID
  webim.getLongPollingId = function (options, cbOk, cbErr) {
    return proto_getLongPollingId(options, cbOk, cbErr)
  }

  //获取下载地址
  webim.applyDownload = function (options, cbOk, cbErr) {
    return proto_applyDownload(options, cbOk, cbErr)
  }

  //获取下载地址
  webim.onDownFile = function (uuid) {
    window.open(Resources.downloadMap['uuid_' + uuid])
  }

  //检查是否登录
  webim.checkLogin = function (cbErr, isNeedCallBack) {
    return checkLogin(cbErr, isNeedCallBack)
  }
})(webim)

export default {
  install: function (vm) {
    vm.prototype.$webim = webim
  }
}
