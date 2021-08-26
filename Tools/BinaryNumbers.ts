// Florian Strobl - ClashCrafter#0001 - Aug. 2021 - 2.0.0

import { StringManipulation } from './StringManipulation';

export namespace BinaryNumbers {
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
      return '';
    }

    export function binaryStringToSInt(
      binaryString: string,
      bitCount: number | undefined = undefined
    ): number {
      if (!validIntBinary(binaryString)) return NaN; // Not a valid number

      // TODO bitCount

      const sign: number = binaryString[0] === '0' ? 1 : -1;

      if (bitCount === undefined)
        if (binaryString[0] === '0')
          // get the sign bit
          return binaryStringToUInt(binaryString);
        else {
          binaryString = StringManipulation.slice(binaryString, 1); // remove the sign bit

          // subtract one
          binaryString = (Number.parseInt(binaryString, 2) - 1).toString(2); // TODO

          // invert/flip each bit
          for (let i = 0; i < binaryString.length; ++i) {
            let val: string = '';
            if (binaryString[i] === '0') val = '1';
            else val = '0';

            // replace the 0s with 1s and the 1s with 0s
            binaryString = StringManipulation.replaceAt(binaryString, val, i);
          }

          return binaryStringToUInt(binaryString) * sign;
        }
      else return 0;
    }

    export function validIntBinary(binary: string): boolean {
      return !!binary.match(/^[01]+$/);
    }
  }

  export namespace Floats {
    export function fixedPointFloatToBinaryString(fpFloat: number): string {
      return '';
    }

    export function binaryStringToFixedPointFloat(
      binaryString: string
    ): number {
      return 0;
    }

    export function IEEE754FloatToBinaryString(float: number): string {
      if (typeof float !== 'number') throw new Error('Invalid input number');

      const buffer: ArrayBuffer = new ArrayBuffer(8);

      new Float64Array(buffer)[0] = float;

      let ans: string = new BigUint64Array(buffer)[0].toString(2); // convert it to binary, TODO toString()

      while (ans.length < 64) ans = '0' + ans; // fill the start with leading zeros

      return ans;
    }

    export function binaryStringToIEEE754Float(binaryString: string): number {
      if (!IEEE754Bits.validIEEE754BinaryString(binaryString))
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

    export namespace IEEE754Bits {
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
          if (typeof number === 'number')
            number = IEEE754FloatToBinaryString(number);

          // check for invalid input
          validIEEE754BinaryString(number);

          return number[0];
        }

        export function getExponent(number: string | number): string {
          if (typeof number === 'number')
            number = IEEE754FloatToBinaryString(number);

          // check for invalid input
          validIEEE754BinaryString(number);

          return number.slice(1, -52);
        }

        export function getMantissa(number: string | number): string {
          if (typeof number === 'number')
            number = IEEE754FloatToBinaryString(number);

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
            number = IEEE754FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!sign.match(/^[01]$/)) throw new Error('Invalid sign bit.');

          const answer: string = sign + number.slice(1);
          return (
            outputString ? answer : binaryStringToIEEE754Float(answer)
          ) as T; // just remove the sign and add it
        }

        export function setExponent<T extends string | number>(
          number: T,
          exponent: string
        ): T {
          let outputString: boolean = true;
          if (typeof number === 'number') {
            // @ts-ignore
            number = IEEE754FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!exponent.match(/^[01]{11}$/))
            throw new Error('Invalid exponent bits.');

          const answer: string = number[0] + exponent + number.slice(12);
          return (
            outputString ? answer : binaryStringToIEEE754Float(answer)
          ) as T;
        }

        export function setMantissa<T extends string | number>(
          number: T,
          mantissa: string
        ): T {
          let outputString: boolean = true;
          if (typeof number === 'number') {
            // @ts-ignore
            number = IEEE754FloatToBinaryString(number) as string;
            outputString = false;
          }

          // check for invalid input
          validIEEE754BinaryString(number as string);
          if (!mantissa.match(/^[01]{52}$/))
            throw new Error('Invalid mantissa bits.');

          const answer: string = number[0] + number.slice(1, -52) + mantissa;
          return (
            outputString ? answer : binaryStringToIEEE754Float(answer)
          ) as T;
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
}

console.log(BinaryNumbers.Integer.binaryStringToSInt('0000'));
