// ClashCrafter#0001 Aug 2021

export namespace BinaryFloats {
  export function createBinaryFloat(
    sign: string = '0',
    exponent: string = '00000000000',
    fraction: string = '0000000000000000000000000000000000000000000000000000'
  ): string {
    if (sign.length === 0) sign = '0';
    while (exponent.length < 11) exponent = '0' + exponent;
    while (fraction.length < 52) fraction += '0';

    if (
      sign.length !== 1 ||
      exponent.length !== 11 ||
      fraction.length !== 52 ||
      !sign.match(/[01]+/g) ||
      !exponent.match(/[01]+/g) ||
      !fraction.match(/[01]+/g)
    )
      throw new Error(
        'Wrong bit count/input value for a IEEE754 double precision number.'
      );

    return sign + exponent + fraction;
  }

  export function binaryFloatToNumber(binary: string): number {
    if (binary.length !== 64 || !binary.match(/[01]+/g))
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
    const buf: ArrayBuffer = new ArrayBuffer(8);
    new Float64Array(buf)[0] = number;
    let ans: string = new BigUint64Array(buf)[0].toString(2); // convert it to binary
    while (ans.length < 64) ans = '0' + ans; // fill the start with leading zeros
    return ans;
  }

  export namespace GetBits {
    export function getSign(binary: string | number): string {
      if (typeof binary === 'number') binary = numberToBinaryFloat(binary);

      // check for invalid input
      validBinary(binary);

      return binary[0];
    }

    export function getExponent(binary: string | number): string {
      if (typeof binary === 'number') binary = numberToBinaryFloat(binary);

      // check for invalid input
      validBinary(binary);

      return binary.slice(1, -52);
    }

    export function getFraction(binary: string | number): string {
      if (typeof binary === 'number') binary = numberToBinaryFloat(binary);

      // check for invalid input
      validBinary(binary);

      return binary.slice(12);
    }
  }

  export namespace SetBits {
    export function setSign<T extends string | number>(
      binary: T,
      sign: string
    ): T {
      let outputString: boolean = true;
      if (typeof binary === 'number') {
        // @ts-ignore
        binary = numberToBinaryFloat(binary) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(binary as string);
      if (sign.length !== 1 || !sign.match(/[01]/))
        throw new Error('Invalid sign bit.');

      const answer: string = sign + binary.slice(1);
      return (outputString ? answer : binaryFloatToNumber(answer)) as T; // just remove the sign and add it
    }

    export function setExponent<T extends string | number>(
      binary: T,
      exponent: string
    ): T {
      let outputString: boolean = true;
      if (typeof binary === 'number') {
        // @ts-ignore
        binary = numberToBinaryFloat(binary) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(binary as string);
      if (exponent.length !== 11 || !exponent.match(/[01]{11}/))
        throw new Error('Invalid exponent bits.');

      const answer: string = binary[0] + exponent + binary.slice(12);
      return (outputString ? answer : binaryFloatToNumber(answer)) as T;
    }

    export function setFraction<T extends string | number>(
      binary: T,
      fraction: string
    ): T {
      let outputString: boolean = true;
      if (typeof binary === 'number') {
        // @ts-ignore
        binary = numberToBinaryFloat(binary) as string;
        outputString = false;
      }

      // check for invalid input
      validBinary(binary as string);
      if (fraction.length !== 52 || !fraction.match(/[01]{52}/))
        throw new Error('Invalid fraction bits.');

      const answer: string = binary[0] + binary.slice(1, -52) + fraction;
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
    if (binary.length !== 64 || !binary.match(/[01]+/g))
      throw new Error(
        'Invalid bit count/input value for a IEEE754 double precision number.'
      );
  }
}
