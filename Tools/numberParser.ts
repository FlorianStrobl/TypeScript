// Florian Crafter - Aug. 2021 - 1.1.0

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

import { BinaryFloats } from './BinaryFloats';

export namespace NumberParser {
  const regxp: { [key: string]: RegExp } = {
    bin: /^(0[bB])[\+-]?[01]*(\.[01]+)?([eEpP][\+-]?\d+)?$/,
    oct: /^(0[oO])[\+-]?[0-7]*(\.[0-7]+)?([eEpP][\+-]?\d+)?$/,
    hex: /^(0[xX])[\+-]?[0-9a-fA-F]*(\.[0-9a-fA-F]+)?([pP][\+-]?\d+)?$/,
    dec: /^(0[dD])?[\+-]?(\d)*(\.\d+)?([eEpP][\+-]?\d+)?$/,
  };

  console.log('parsed number', stringToNumberParser('.5e+1'));

  export function stringToNumberParser(
    number: string,
    errorInsteadOfNaN: boolean = false
  ): number {
    try {
      number = number.replace(/ /g, () => ''); // replace all spaces
      number = number.replace(/_/g, () => ''); // remove all "_"

      // check for default values as +-Inf, +-0, and NaN
      if (number === 'Infinity') return Number.POSITIVE_INFINITY;
      else if (number === 'infinity') return Number.POSITIVE_INFINITY;
      else if (number === '+Infinity') return Number.POSITIVE_INFINITY;
      else if (number === '+infinity') return Number.POSITIVE_INFINITY;
      else if (number === '-Infinity') return Number.NEGATIVE_INFINITY;
      else if (number === '-infinity') return Number.POSITIVE_INFINITY;
      else if (number === '0') return 0;
      else if (number === '+0') return 0;
      else if (number === '-0') return -0;
      else if (number === 'NaN') return Number.NaN;
      else if (number === 'nan') return Number.NaN;

      if (!number.match(/^[\+-\.0-9a-fA-FdDbBoOxXeEpP]+$/g))
        throw new Error('Invalid input number.');
      // get the type
      let type: 'binary' | 'octal' | 'hexadecimal' | 'decimal';
      if (!!number.match(regxp.bin)) type = 'binary';
      else if (!!number.match(regxp.oct)) type = 'octal';
      else if (!!number.match(regxp.hex)) type = 'hexadecimal';
      else if (!!number.match(regxp.dec)) type = 'decimal';
      else throw new Error('Invalid input number.');

      // get the current base system
      const bases = { binary: 2, octal: 8, hexadecimal: 16, decimal: 10 };
      const base: number = bases[type];

      if (
        number.startsWith('0b') ||
        number.startsWith('0o') ||
        number.startsWith('0x') ||
        number.startsWith('0d')
      )
        number = number.slice(2); // remove prefix

      const parts: {
        int: string;
        frac: string;
        exp: string;
        sign: number;
        valid: boolean;
      } = getParts(number, 'pP' + (type === 'hexadecimal' ? '' : 'eE'));

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

      if (values.int !== '') finalInt = uIntStringToNumber(values.int, base); // get the int part

      // get the fraction part
      if (values.frac !== '') {
        let fracN: number = uIntStringToNumber(values.frac, base);
        const fracNLength: number = values.frac.toString().length; // TODO toString

        for (let i = 0; i < fracNLength; ++i) fracN /= base; // shift the value to the right point place

        finalFrac = fracN; // add the frac part to the int part
      }

      return (finalInt + finalFrac) * parts.sign; // return the value with the correct sign
    } catch (e) {
      if (errorInsteadOfNaN) throw new Error(e);
      else return NaN;
    }
  }

  export function numberToStringParser(
    number: number,
    base: 'dec' | 'bin' | 'oct' | 'hex' = 'dec',
    mode: 'normalized' | 'exp' | 'no exp' = 'no exp'
  ): string {
    if (typeof number !== 'number') throw new Error('Invalid input.');

    if (Number.isNaN(number)) return 'NaN';
    else if (number === Infinity) return 'Infinity';
    else if (number === -Infinity) return '-Infinity';
    else if (Object.is(number, -0)) return '-0';
    else if (number === 0) return '0';

    const sign: string = BinaryFloats.GetBits.getSign(number);
    const exponent: string = BinaryFloats.GetBits.getExponent(number);
    const mantissa: string = BinaryFloats.GetBits.getMantissa(number);

    let trunced: number = Math.trunc(number);

    return 'float';
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

    if (num.startsWith('+')) num = num.slice(1); // remove tenary +

    let intp: boolean = true;
    let fracp: boolean = true;
    let expp: boolean = true;

    let ints: string = '';
    let fracs: string = '';
    let exps: string = '';

    for (let n of num) {
      if (n === '.') {
        intp = false;
        fracp = true;
        expp = false;
        continue;
      } else if (_possibleExponentChars.some((c) => n === c)) {
        intp = false;
        fracp = false;
        expp = true;
        continue;
      }

      if (intp) ints += n;
      else if (fracp) fracs += n;
      else if (expp) exps += n;
    }

    let _exp: string = removeLeadingZerosWMinus(exps);

    return {
      int: removeLeadingZeros(removeLeadingSign(ints)),
      frac: removeTrailingZeros(fracs),
      exp: _exp === '-' ? '' : _exp,
      sign: ints.startsWith('-') ? -1 : 1,
      valid: ints !== '' || fracs !== '',
    };

    function removeLeadingZerosWMinus(str: string): string {
      let minus: string = '';
      if (str.startsWith('-')) minus = '-';
      str = removeLeadingSign(str);

      return minus + removeLeadingZeros(str); // return sign + str without zeros
    }
  }

  // edit int and frac with the exp modifier, input has to be formatted
  function intFracUpdateWithExp(
    integerPart: string,
    fractionPart: string,
    exponentPart: number
  ): { int: string; frac: string } {
    // shift int and frac with the exponent

    integerPart = removeLeadingZeros(integerPart);
    fractionPart = removeTrailingZeros(fractionPart);

    // only if exponent is set
    if (exponentPart !== 0)
      if (exponentPart < 0) {
        // shift to the right
        let shifts: string = '';

        // put the int part in the frac part, and edit int
        while (integerPart.length !== 0) {
          if (exponentPart === 0) break; // shifted enough

          shifts = integerPart[integerPart.length - 1] + shifts; // put the end of the int in the shift var
          integerPart = integerPart.slice(0, -1); // remove the last char
          exponentPart++; // increase exp up to 0
        }

        // fill the rest with 0s (if int don't have enough numbers)
        while (exponentPart < 0) {
          shifts = '0' + shifts;
          exponentPart++;
        }

        fractionPart = shifts + fractionPart; // give the frac the last part of int/the 0s
      } else {
        // bigger than 0 so positive so shift to the left
        let shiftsStr: string = '';

        // put the start of frac at the end of the int part, + update frac
        while (fractionPart.length !== 0) {
          // frac has still digits so put them in the tmp var
          if (exponentPart === 0) break; // stop because the count of digits is now finish

          shiftsStr += fractionPart[0]; // put the first char of frac to the end of int
          fractionPart = fractionPart.slice(1); // remove first char
          exponentPart--; // one digit finish
        }

        // fill the rest of the int part with 0s
        while (exponentPart > 0) {
          shiftsStr += '0'; // at the end a zero
          exponentPart--;
        }

        integerPart += shiftsStr; // put the shift in the int part
      }

    return {
      int: removeLeadingZeros(integerPart),
      frac: removeTrailingZeros(fractionPart),
    };
  }

  function uIntStringToNumber(number: string, base: number): number {
    const sign: number = number.startsWith('-') ? -1 : 1;
    if (number.startsWith('-')) number = number.slice(1);

    if (!number.match(/[0-9a-fA-F]+/)) return NaN;

    // reverse the string for easier use
    number = removeLeadingZeros(number).split('').reverse().join('');

    let ans: number = 0;
    for (let i = 0; i < number.length; ++i)
      ans += digitToValue(number[i]) * Math.pow(base, i);

    return ans * sign;

    function digitToValue(x: string): number {
      switch (x) {
        case '0':
          return 0;
        case '1':
          return 1;
        case '2':
          return 2;
        case '3':
          return 3;
        case '4':
          return 4;
        case '5':
          return 5;
        case '6':
          return 6;
        case '7':
          return 7;
        case '8':
          return 8;
        case '9':
          return 9;
        case 'a':
          return 10;
        case 'A':
          return 10;
        case 'b':
          return 11;
        case 'B':
          return 11;
        case 'c':
          return 12;
        case 'C':
          return 12;
        case 'd':
          return 13;
        case 'D':
          return 13;
        case 'e':
          return 14;
        case 'E':
          return 14;
        case 'f':
          return 15;
        case 'F':
          return 15;
        default:
          return NaN;
      }
    }
  }

  function removeLeadingSign(string: string): string {
    if (string.startsWith('-') || string.startsWith('+'))
      return string.slice(1);
    else return string;
  }

  function removeLeadingZeros(string: string): string {
    while (string.startsWith('0')) string = string.slice(1);
    return string;
  }

  function removeTrailingZeros(string: string): string {
    while (string.endsWith('0')) string = string.slice(0, -1);
    return string;
  }

  function generateRandomNumberString(digitsInTotal: number = 10): string {
    let randomNum: string = '0d';

    // sign
    Math.random() < 0.5 ? (randomNum += '+') : (randomNum += '-');

    // digits
    for (let i = 0; i < digitsInTotal; ++i)
      randomNum += Math.floor(Math.random() * 10).toString();

    // set komma
    let index = Math.floor(Math.random() * (digitsInTotal - 3)) + 3;
    randomNum =
      randomNum.substring(0, index) + '.' + randomNum.substring(index + 1);

    return randomNum;
  }
}
