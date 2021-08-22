// Florian Strobl - ClashCrafter#0001 - Aug. 2021 - 1.1

export namespace BinaryFloats {
  export function createBinaryFloat(
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
  
  export function BinaryUIntToNumber(bInt: string): number {
    if (!bInt.match(/[01]+/)) return NaN; // Not a valid number

    // reverse the string for easier use
    bInt = bInt
      .split('')
      .reverse()
      .join('');

    let ans: number = 0; // the final number
    for (
      let i = 0;
      i < bInt.length;
      ++i // for each bit
    )
      ans += bInt[i] === '0' ? 0 : Math.pow(2, i); // add (bitValue + 2^bitIndex)

    return ans;
  }

  export function binaryFloatToNumber(binary: string): number {
    if (!binary.match(/[01]{64}/g))
      throw new Error(
        'Wrong bit count/input value for a IEEE754 double precision number.'
      );

    const hex: string = binToHex(binary); // convert it to hexadecimal

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

  export function numberToBinaryFloat(number: number): string {
    if (typeof number !== 'number') throw new Error('Invalid input number');
    const buf: ArrayBuffer = new ArrayBuffer(8);
    new Float64Array(buf)[0] = number;
    let ans: string = new BigUint64Array(buf)[0].toString(2); // convert it to binary
    while (ans.length < 64) ans = '0' + ans; // fill the start with leading zeros
    return ans;
  }

  export namespace GetBits {
    export function getSign(number: string | number): string {
      if (typeof number === 'number') number = numberToBinaryFloat(number);

      // check for invalid input
      validBinary(number);

      return number[0];
    }

    export function getExponent(number: string | number): string {
      if (typeof number === 'number') number = numberToBinaryFloat(number);

      // check for invalid input
      validBinary(number);

      return number.slice(1, -52);
    }

    export function getMantissa(number: string | number): string {
      if (typeof number === 'number') number = numberToBinaryFloat(number);

      // check for invalid input
      validBinary(number);

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
        number = numberToBinaryFloat(number) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(number as string);
      if (!sign.match(/^[01]$/)) throw new Error('Invalid sign bit.');

      const answer: string = sign + number.slice(1);
      return (outputString ? answer : binaryFloatToNumber(answer)) as T; // just remove the sign and add it
    }

    export function setExponent<T extends string | number>(
      number: T,
      exponent: string
    ): T {
      let outputString: boolean = true;
      if (typeof number === 'number') {
        // @ts-ignore
        number = numberToBinaryFloat(number) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(number as string);
      if (!exponent.match(/^[01]{11}$/))
        throw new Error('Invalid exponent bits.');

      const answer: string = number[0] + exponent + number.slice(12);
      return (outputString ? answer : binaryFloatToNumber(answer)) as T;
    }

    export function setMantissa<T extends string | number>(
      number: T,
      mantissa: string
    ): T {
      let outputString: boolean = true;
      if (typeof number === 'number') {
        // @ts-ignore
        number = numberToBinaryFloat(number) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(number as string);
      if (!mantissa.match(/^[01]{52}$/))
        throw new Error('Invalid mantissa bits.');

      const answer: string = number[0] + number.slice(1, -52) + mantissa;
      return (outputString ? answer : binaryFloatToNumber(answer)) as T;
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

  function validBinary(binary: string): void {
    if (!binary.match(/^[01]{64}$/))
      throw new Error(
        'Invalid bit count/input value for a IEEE754 double precision number.'
      );
  }
}
