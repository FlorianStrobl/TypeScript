// Florian Crafter - Aug. 2021 - 2.0.0

// number = (prefix) (sign) (integer) (fraction) (exponent)
// Special values: "Infinity", "-Infinity", "0", "-0", "NaN"

// prefix: "0d", "0b", "0o", "0x"
// sign: "+", "-"
// integer: charset
// fraction: "."charset
// exponent: exp(sign)charset

// exp: "e", "E", "p", "P"
// charset: "01", "0-7", "0-9", "0-9" "a-f" "A-F" // as many as you want, starting by what you want

// "_" can be used anywhere in a number as seperators
// "e" and "E" not usable for hexadecimal values
// () is ment as optional thing
// you need at least one of the three parts: integer, fraction, exponent
// Number support: binary, octal, hexadecimal and decimal numbers

import { StringManipulation } from './StringManipulation';

export namespace BinaryNumbers {
  export namespace Floats {
    export function fixedPointFloatToBinaryString(fpFloat: number): string {
      return '';
    }

    export function binaryStringToFixedPointFloat(
      binaryString: string
    ): number {
      return 0;
    }

    export function FloatToBinaryString(float: number): string {
      if (typeof float !== 'number') throw new Error('Invalid input number');

      const buffer: ArrayBuffer = new ArrayBuffer(8);
      new Float64Array(buffer)[0] = float;
      let ans: string = new BigUint64Array(buffer)[0].toString(2); // convert it to binary, TODO toString()
      while (ans.length < 64) ans = '0' + ans; // fill the start with leading zeros

      return ans;
    }

    export function binaryStringToFloat(binaryString: string): number {
      if (!Bits.validIEEE754BinaryString(binaryString))
        throw new Error(
          'Wrong bit count/input value for a IEEE754 double precision number.'
        );

      const hex: string = binToHex(binaryString); // convert it to hexadecimal

      // get it in pairs and reverse it
      const numberHex: number[] = (hex.match(/.{1,2}/g) ?? [])
        .map((s) => Number('0x' + s))
        .reverse();

      // magic, do not touch
      const buffer: ArrayBuffer = new ArrayBuffer(numberHex.length);
      const byteArray: Uint8Array = new Uint8Array(buffer);
      for (let i = 0; i < numberHex.length; ++i) byteArray[i] = numberHex[i];

      return new Float64Array(buffer)[0];

      function binToHex(bin: string): string {
        let res: string = '';
        let fourPacks: string[] = bin.match(/.{1,4}/g) ?? []; // put it in pairs of 4
        for (let b of fourPacks) res += Number('0b' + b).toString(16); // convert it to hex
        return res;
      }
    }

    export namespace Bits {
      export function validIEEE754BinaryString(binary: string): boolean {
        if (!binary.match(/^[01]{64}$/))
          throw new Error(
            'Invalid bit count/input value for a IEEE754 double precision number.'
          );
        return true;
      }

      export function createIEEE754BinaryString(
        sign: string = '0',
        exponent: string = '00000000000',
        mantissa: string = '0000000000000000000000000000000000000000000000000000'
      ): string {
        if (sign.length === 0) sign = '0';
        while (exponent.length < 11) exponent = '0' + exponent;
        while (mantissa.length < 52) mantissa += '0';

        if (
          !sign.match(/[01]{1}/g) ||
          !exponent.match(/[01]{11}/g) ||
          !mantissa.match(/[01]{52}/g)
        )
          throw new Error(
            'Wrong bit count/input value for a IEEE754 double precision number.'
          );

        return sign + exponent + mantissa;
      }

      export namespace GetBits {
        export function getSign(number: string | number): string {
          if (typeof number === 'number') number = FloatToBinaryString(number);

          // check for invalid input
          validIEEE754BinaryString(number);

          return number[0];
        }

        export function getExponent(number: string | number): string {
          if (typeof number === 'number') number = FloatToBinaryString(number);

          // check for invalid input
          validIEEE754BinaryString(number);

          return number.slice(1, -52);
        }

        export function getMantissa(number: string | number): string {
          if (typeof number === 'number') number = FloatToBinaryString(number);

          // check for invalid input
          validIEEE754BinaryString(number);

          return number.slice(12);
        }
      }

      export namespace SetBits {
        export function setSign<T extends string | number>(
          number: T,
          sign: string
        ): T {
          let outputString: boolean = true;
          if (typeof number === 'number') {
            // @ts-ignore
            number = FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!sign.match(/^[01]$/)) throw new Error('Invalid sign bit.');

          const answer: string = sign + number.slice(1);
          return (outputString ? answer : binaryStringToFloat(answer)) as T; // just remove the sign and add it
        }

        export function setExponent<T extends string | number>(
          number: T,
          exponent: string
        ): T {
          let outputString: boolean = true;
          if (typeof number === 'number') {
            // @ts-ignore
            number = FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!exponent.match(/^[01]{11}$/))
            throw new Error('Invalid exponent bits.');

          const answer: string = number[0] + exponent + number.slice(12);
          return (outputString ? answer : binaryStringToFloat(answer)) as T;
        }

        export function setMantissa<T extends string | number>(
          number: T,
          mantissa: string
        ): T {
          let outputString: boolean = true;
          if (typeof number === 'number') {
            // @ts-ignore
            number = FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!mantissa.match(/^[01]{52}$/))
            throw new Error('Invalid mantissa bits.');

          const answer: string = number[0] + number.slice(1, -52) + mantissa;
          return (outputString ? answer : binaryStringToFloat(answer)) as T;
        }
      }

      export namespace SpecialValues {
        export const positiveZero: string =
          '0000000000000000000000000000000000000000000000000000000000000000';

        export const negativeZero: string =
          '1000000000000000000000000000000000000000000000000000000000000000';

        export const positiveInfinity: string =
          '0111111111110000000000000000000000000000000000000000000000000000';

        export const negativeInfinity: string =
          '1111111111110000000000000000000000000000000000000000000000000000';

        // has many other forms too
        export const NaN: string =
          '0111111111111000000000000000000000000000000000000000000000000000';
      }
    }
  }

  export namespace Integer {
    export function uIntToBinaryString(unsignedInteger: number): string {
      if (
        !Number.isFinite(unsignedInteger) ||
        unsignedInteger < 0 ||
        unsignedInteger !== Math.trunc(unsignedInteger)
      )
        throw new Error(
          'Invalid input. Input has to be an unsigned integer. Your input was: ' +
            unsignedInteger
        );

      let powers: number[] = [];
      // from the maximum binary bit to the minimum for integers
      for (let i = 1023; i >= 0; --i)
        if (unsignedInteger - Math.pow(2, i) >= 0) {
          unsignedInteger -= Math.pow(2, i);
          powers.push(i);
        }

      // the biggest number chooses the zero count
      let answer: string = StringManipulation.repeat('0', powers[0]);
      for (const index of powers) // add the ones
        answer = StringManipulation.replaceAt(answer, '1', powers[0] - index);

      return answer;
    }

    export function binaryStringToUInt(binaryString: string): number {
      if (!validIntBinary(binaryString)) return NaN; // Not a valid number

      let number: number = 0;
      for (let i = 0; i < binaryString.length; ++i)
        if (binaryString[i] === '1')
          // add (bitValue + 2^bitIndex), to each position
          number += Math.pow(2, binaryString.length - (i + 1));

      return number;
    }

    export function sIntToBinaryString(
      signedInteger: number,
      bitCount: number | undefined = undefined
    ): string {
      if (
        !Number.isFinite(signedInteger) ||
        signedInteger !== Math.trunc(signedInteger)
      )
        throw new Error(
          'Invalid input. Input has to be an integer. Your input was: ' +
            signedInteger
        );

      if (signedInteger > 0) {
        let ans: string = uIntToBinaryString(signedInteger);
        if (bitCount !== undefined) {
          if (bitCount < ans.length)
            throw new Error(
              'Result was too big. Maximum bit count: ' +
                bitCount +
                '. Actuall value: ' +
                ans
            );

          if (bitCount !== ans.length)
            while (ans.length < bitCount) ans = '0' + ans;

          return ans;
        } else return ans;
      } else {
        signedInteger = Math.abs(signedInteger); // get the absoulte value
        let unsignedIntegerV: string = uIntToBinaryString(signedInteger); // get it's unsgn value

        if (bitCount !== undefined) {
          if (bitCount < unsignedIntegerV.length)
            throw new Error(
              'Result was too big. Maximum bit count: ' +
                bitCount +
                '. Actuall value: ' +
                unsignedIntegerV
            );

          if (bitCount !== unsignedIntegerV.length)
            while (unsignedIntegerV.length < bitCount)
              unsignedIntegerV = '0' + unsignedIntegerV;
        }

        console.log('original', unsignedIntegerV);

        // invert/flip each bit
        for (let i = 0; i < unsignedIntegerV.length; ++i) {
          let val: string = '0';
          if (unsignedIntegerV[i] === '0') val = '1';

          // replace the 0s with 1s and the 1s with 0s
          unsignedIntegerV = StringManipulation.replaceAt(
            unsignedIntegerV,
            val,
            i
          );
        }

        console.log('fliped', unsignedIntegerV);

        // add one
        const dec: number = Numbers.stringToNumber('0b' + unsignedIntegerV);
        unsignedIntegerV = Numbers.numberToString(dec + 1, 'bin');
        // TODO check if works
        console.log('added one', unsignedIntegerV);

        return unsignedIntegerV;
      }
    }

    export function binaryStringToSInt(
      binaryString: string,
      bitCount: number | undefined = undefined
    ): number {
      if (!validIntBinary(binaryString)) return NaN; // Not a valid number

      // bit count
      let signBitIndex: number = binaryString.length;
      if (bitCount !== undefined) {
        if (bitCount < signBitIndex)
          throw new Error(
            'Invalid input. Your bit count was set to: ' +
              bitCount +
              '. You have given a number with: ' +
              signBitIndex +
              'nr of bits.'
          );
        signBitIndex = bitCount;
      }

      while (binaryString.length < signBitIndex)
        binaryString = '0' + binaryString;

      // get the sign bit
      let sign: number = 1;
      if (binaryString[0] === '1' && signBitIndex === bitCount) sign = -1;

      // remove the sign bit
      if (signBitIndex === bitCount)
        binaryString = StringManipulation.slice(binaryString, 1);

      if (sign === 1) return binaryStringToUInt(binaryString);
      else {
        // invert/flip each bit
        for (let i = 0; i < binaryString.length; ++i) {
          let val: string = '0';
          if (binaryString[i] === '0') val = '1';

          // replace the 0s with 1s and the 1s with 0s
          binaryString = StringManipulation.replaceAt(binaryString, val, i);
        }

        // add one
        const dec: number = Numbers.stringToNumber('0b' + binaryString);
        binaryString = Numbers.numberToString(dec + 1, 'bin');

        // leading zeros
        while (binaryString.length < signBitIndex - 1)
          binaryString = '0' + binaryString;

        return binaryStringToUInt(binaryString) * sign;
      }
    }

    export function validIntBinary(binary: string): boolean {
      return !!binary.match(/^[01]+$/);
    }
  }
}

export namespace Numbers {
  const regexp: { [key: string]: RegExp } = {
    dec: /^(0[dD])?[\+-]?(\d)*(\.\d+)?([eEpP][\+-]?\d+)?$/,
    bin: /^(0[bB])[\+-]?[01]*(\.[01]+)?([eEpP][\+-]?\d+)?$/,
    oct: /^(0[oO])[\+-]?[0-7]*(\.[0-7]+)?([eEpP][\+-]?\d+)?$/,
    hex: /^(0[xX])[\+-]?[0-9a-fA-F]*(\.[0-9a-fA-F]+)?([pP][\+-]?\d+)?$/,
    pzero: /^(\+?)0$/,
    nzero: /^-0$/,
    pinf: /^(\+)?infinity$/i,
    ninf: /^-infinity$/i,
    nan: /^nan$/i,
    numsymbols: /^[\+-\.0-9a-fA-FdDbBoOxXeEpP]+$/g,
  };

  /**
   * Convert a number in a string to a JavaScript number
   *
   * @param number The string to parse
   * @param nanInsteadOfError
   * @returns A 64 Bit Floating Point Number
   */
  export function stringToNumber(
    number: string,
    nanInsteadOfError: boolean = false
  ): number {
    try {
      number = number.replace(/ |_/g, () => ''); // remove all spaces and underscores

      // check for default values (+-Inf, +-0, and NaN)
      if (!!number.match(regexp.pinf)) return Number.POSITIVE_INFINITY;
      else if (!!number.match(regexp.ninf)) return Number.NEGATIVE_INFINITY;
      else if (!!number.match(regexp.nan)) return Number.NaN;
      else if (!!number.match(regexp.pzero)) return 0;
      else if (!!number.match(regexp.nzero)) return -0;

      // check for invalid symbols
      if (!number.match(regexp.numsymbols))
        throw new Error('Invalid input number.');

      // get the base
      let base: number;
      if (!!number.match(regexp.dec)) base = 10;
      else if (!!number.match(regexp.hex)) base = 16;
      else if (!!number.match(regexp.bin)) base = 2;
      else if (!!number.match(regexp.oct)) base = 8;
      else throw new Error('Invalid input number.');

      // remove the prefix
      if (['0b', '0o', '0x', '0d'].some((str) => number.startsWith(str)))
        number = number.slice(2);

      const parts: {
        int: string;
        frac: string;
        exp: string;
        sign: number;
        valid: boolean;
      } = getParts(number, 'pP' + (base === 16 ? '' : 'eE'));

      if (!parts.valid || number === '-')
        throw new Error('Invalid input number.');

      const values: {
        int: string;
        frac: string;
      } = intFracUpdateWithExp(
        parts.int,
        parts.frac,
        uIntStringToNumber(parts.exp === '' ? '0' : parts.exp, 10)
      );

      let finalInt: number = 0; // the final integer part
      let finalFrac: number = 0; // the final fraction part

      // get the int part
      if (values.int !== '') finalInt = uIntStringToNumber(values.int, base);
      // get the fraction part
      if (values.frac !== '') finalFrac = intToFrac(values.frac, base);

      // return the value with the correct sign
      return parts.sign === 1 ? finalInt + finalFrac : -(finalInt + finalFrac); // return the value with the correct sign
    } catch (e) {
      // Handle errors
      if (nanInsteadOfError) return Number.NaN;
      else throw new Error(e);
    }
  }

  // TODO
  export function numberToString(
    number: number,
    base: number | 'dec' | 'hex' | 'bin' | 'oct' = 10,
    mode: 'normalized' | 'exp' | 'no exp' = 'no exp'
  ): string {
    if (typeof number !== 'number') throw new Error('Invalid input.');

    // check for default values (+-Inf, +-0, and NaN)
    if (number === Infinity) return 'Infinity';
    else if (number === -Infinity) return '-Infinity';
    else if (Number.isNaN(number)) return 'NaN';
    else if (Object.is(number, -0)) return '-0';
    else if (number === 0) return '0';

    // do not worry about 0, since it is already out of question
    const sign: number = Math.sign(number);

    const _binExponent: string =
      BinaryNumbers.Floats.Bits.GetBits.getExponent(number);
    let binExponent: number = stringToNumber('0b' + _binExponent) - 1023;
    // handle subnormals correctly
    let wasSubnormal: boolean = false;
    if (binExponent === -1023) {
      binExponent = -1022;
      wasSubnormal = true;
    }

    const mantissa: string =
      BinaryNumbers.Floats.Bits.GetBits.getMantissa(number);

    let numberInBin: string = '';
    if (binExponent === 0) {
      // no shift, just add the leading one
      numberInBin = '1.' + mantissa;
    } else {
      const zeros: string = '0'.repeat(Math.abs(binExponent) - 1);
      if (binExponent < 0) {
        // shift to the right
        // check for subnormal, and add implicit 0
        if (wasSubnormal) numberInBin = '0.' + zeros + '0' + mantissa;
        else numberInBin = '0.' + zeros + '1' + mantissa;
      } else {
        // shift to the left
        numberInBin = '1' + mantissa + zeros;
        numberInBin = insertAt(numberInBin, '.', binExponent + 1); // add a comma
      }
    }
    numberInBin = binRmLeadingZeros(binRmTrailingZerosAndDot(numberInBin));

    return numberInBin;

    function binRmTrailingZerosAndDot(s: string): string {
      while (!!s.match(/^[01]*\.[01]*0$/) || !!s.match(/^[01]*\.$/))
        s = s.slice(0, -1);
      return s;
    }

    function binRmLeadingZeros(s: string): string {
      while (!!s.match(/^0[01.]+$/)) s = s.slice(1);
      if (s.startsWith('.')) s = '0' + s;
      return s;
    }
  }

  // #region private help functions
  // "x" will be interpreted as "0.x"
  function intToFrac(number: string, base: number): number {
    const digits: string = '0123456789abcdef';
    const digit = (char: string) => digits.indexOf(char);
    let ans: number = 0;

    for (let i = 0; i < number.length; ++i)
      ans += digit(number[i].toLowerCase()) / Math.pow(base, i + 1);

    return ans;
  }

  // extract the parts of a string number
  function getParts(
    num: string,
    possibleExponentChars: string
  ): {
    int: string;
    frac: string;
    exp: string;
    sign: number;
    valid: boolean;
  } {
    const _possibleExponentChars: string[] = possibleExponentChars.split('');

    // remove unwanted +
    if (num.startsWith('+')) num = num.slice(1);

    // the different parts of a number
    let ints: string = '';
    let fracs: string = '';
    let exps: string = '';

    // checks in which part of the number we are
    let intp: boolean = true;
    let fracp: boolean = true;
    let expp: boolean = true;
    for (let n of num) {
      if (n === '.') {
        // in the fraction part
        fracp = true;
        intp = false;
        expp = false;
        continue;
      } else if (_possibleExponentChars.some((c) => n === c)) {
        // in the exponent part
        expp = true;
        intp = false;
        fracp = false;
        continue;
      }

      if (intp) ints += n;
      else if (fracp) fracs += n;
      else if (expp) exps += n;
    }

    // exponent without leading zeros
    let _exp: string = removeLeadingZerosWMinus(exps);

    return {
      int: removeLeadingZeros(removeLeadingSign(ints)),
      frac: removeTrailingZeros(fracs),
      exp: _exp === '-' ? '' : _exp,
      sign: ints.startsWith('-') ? -1 : 1,
      valid: ints !== '' || fracs !== '',
    };

    // return sign + str without zeros
    function removeLeadingZerosWMinus(str: string): string {
      return (
        (str.startsWith('-') ? '-' : '') +
        removeLeadingZeros(removeLeadingSign(str))
      );
    }
  }

  // edit int and frac with the exp modifier, input has to be formatted
  function intFracUpdateWithExp(
    integerPart: string,
    fractionPart: string,
    exponentPart: number
  ): { int: string; frac: string } {
    // shift int and frac with the exponent

    // only if exponent is set
    if (exponentPart !== 0)
      if (exponentPart < 0) {
        // shift to the right
        let intPartInFrac: string = '';

        // put the int part in the frac part, and edit int
        while (integerPart.length !== 0) {
          if (exponentPart === 0) break; // shifted enough

          intPartInFrac = integerPart[integerPart.length - 1] + intPartInFrac; // put the end of the int in the shift var
          integerPart = integerPart.slice(0, -1); // remove the last char
          ++exponentPart; // increase exp up to 0
        }

        // fill the rest with 0s (if int don't have enough numbers)
        for (let i = exponentPart; i < 0; ++i)
          intPartInFrac = '0' + intPartInFrac;

        fractionPart = intPartInFrac + fractionPart; // give the frac the last part of int/the 0s
      } else {
        // bigger than 0, so positive, so shift to the left
        let fracPartInInt: string = '';

        // put the start of frac at the end of the int part, + update frac
        while (fractionPart.length !== 0) {
          // frac has still digits so put them in the tmp var
          if (exponentPart === 0) break; // stop because the count of digits is now finish

          fracPartInInt += fractionPart[0]; // put the first char of frac to the end of int
          fractionPart = fractionPart.slice(1); // remove first char
          --exponentPart; // one digit finish
        }

        // fill the rest of the int part with 0s
        for (let i = exponentPart; i > 0; --i) fracPartInInt += '0'; // at the end a zero

        integerPart += fracPartInInt; // put the frac part in the int part
      }

    return {
      int: removeLeadingZeros(integerPart),
      frac: removeTrailingZeros(fractionPart),
    };
  }

  function uIntStringToNumber(number: string, base: number = 10): number {
    const digits: string = '0123456789abcdef';
    const digit = (char: string) => digits.indexOf(char);
    const sign: number = number.startsWith('-') ? -1 : 1;

    if (!number.match(/[0-9a-fA-F]+/)) return Number.NaN;

    // reverse the string for easier use
    number = removeLeadingZeros(removeLeadingSign(number))
      .split('')
      .reverse()
      .join('');

    let ans: number = 0;
    for (let i = 0; i < number.length; ++i)
      ans += digit(number[i].toLowerCase()) * Math.pow(base, i);

    return ans * sign;
  }

  function removeLeadingZeros(string: string): string {
    while (string.startsWith('0')) string = string.slice(1);
    return string;
  }

  function removeTrailingZeros(string: string): string {
    while (string.endsWith('0')) string = string.slice(0, -1);
    return string;
  }

  function removeTrailingDot(string: string): string {
    while (string.endsWith('0') || string.endsWith('.'))
      string = string.slice(0, -1);
    return string;
  }

  function removeLeadingSign(string: string): string {
    return ['+', '-'].some((s) => string.startsWith(s))
      ? string.slice(1)
      : string;
  }

  function insertAt(string: string, char: string, index: number): string {
    return string.substring(0, index) + char + string.substring(index);
  }
  // #endregion

  function generateRandomNumberString(digitsInTotal: number = 10): string {
    let randomNum: string = '0d';

    // sign
    const sign: string =
      Math.random() < 0.5 ? (randomNum += '+') : (randomNum += '-');

    // digits
    for (let i = 0; i < digitsInTotal; ++i)
      randomNum += Math.floor(Math.random() * 10).toString();

    // set comma
    let index = Math.floor(Math.random() * (digitsInTotal - 3)) + 3;
    randomNum = insertAt(randomNum, '.', index);

    return randomNum;
  }
}

//console.log(NumberParser.stringToNumberParser('.5e+1'));
//console.log(NumberParser.numberToStringParser(5));

//console.log(BinaryNumbers.Integer.binaryStringToSInt('10'));

/*
console.log(BinaryNumbers.Integer.sIntToBinaryString(0, 5));
console.log(BinaryNumbers.Integer.sIntToBinaryString(1, 5));
console.log(BinaryNumbers.Integer.sIntToBinaryString(7, 4));

console.log(BinaryNumbers.Integer.sIntToBinaryString(-8, 5));
console.log(BinaryNumbers.Integer.sIntToBinaryString(-1, 4));
console.log(BinaryNumbers.Integer.sIntToBinaryString(-7, 5));
console.log(BinaryNumbers.Integer.sIntToBinaryString(-6, 4));
*/

const testNr: number[] = [
  1,
  //10,
  //0.1,
  //Math.SQRT1_2,
  //Number.EPSILON,
  //Number.MAX_VALUE,
  BinaryNumbers.Floats.Bits.SetBits.setMantissa(
    0,
    '0000000000000000000000000000000000000000000000000001'
  ),
  Number.MIN_VALUE,
];
console.log(
  Numbers.numberToString(testNr[1]) === Numbers.numberToString(testNr[2])
);
for (const t of testNr) {
  const ans: string = Numbers.numberToString(t);
  try {
    const nm: number = Numbers.stringToNumber('0b' + ans);
    //console.log(t === nm, t, nm, ans);
  } catch (e) {}
}
