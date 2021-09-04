// isPrimitive/isArray/isObject: unknown => bool
// isJson: string => bool
// jsonTToT: string => T
// TToJsonT: T => string

type Json = null | boolean | string | number | Json[] | JsonObject;
type JsonObject = {
  [property: string]: Json;
};

// todo string: escapes have to be correct

// [ \t\n\r]* = space/tab/new line/carraige return zero or more
const isJsonWhitespace: RegExp = /[ \t\n\r]*/;
const isJsonNullRegex: RegExp = /^null$/;
const isJsonBoolRegex: RegExp = /^(true|false)$/;
const isJsonStringRegex: RegExp =
  /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\[0-9a-fA-F]{4}|[^"\\])*?"$/;
const isJsonNumberRegex: RegExp =
  /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][\+-]?\d+)?$/;
// TODO
const isJsonArray: RegExp =
  /\[(([ \t\n\r]*)|((-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][\+-]?\d+)?)|null|true|false))\]/;

export namespace Json {
  export enum FormatMode {
    AddSpacesSimple,
    AddSpacesAdvanced,
    RemoveSpaces,
  }

  export function stringify(x: Json): string {
    return '';
  }

  export function parse<T extends Json>(jsonString: string): T {
    return null as T;
  }

  export function prettify(jsonString: string, format: FormatMode): string {
    // TODO could have many spaces
    let ans: string = '';
    if (format === FormatMode.AddSpacesSimple)
      ans = addSpacesSimple(jsonString);
    if (format === FormatMode.AddSpacesAdvanced)
      ans = addSpacesAdvanced(jsonString);
    if (format === FormatMode.RemoveSpaces) ans = removeSpaces(jsonString);

    return ans;

    function removeSpaces(str: string): string {
      return '';
    }

    function addSpacesSimple(str: string): string {
      return '';
    }

    function addSpacesAdvanced(str: string): string {
      return '';
    }
  }

  export function isValidString(jsonString: string): boolean {
    return isJsonString.isJson(jsonString);
  }

  export function isValidPrimitive(json: unknown): boolean {
    return isPrimitive.isPrimitive(json);
  }
}

// finish
namespace isPrimitive {
  /**
   * only valid json primitves so e.g. Infinity is not a valid number
   */
  export function isPrimitive(x: unknown): boolean {
    return isPrimitiveLiteral(x) || isArray(x) || isObject(x);
  }

  export function isPrimitiveLiteral(x: unknown): boolean {
    return isNull(x) || isBoolean(x) || isString(x) || isNumber(x);
  }

  export function isNull(n: unknown): n is null {
    return n === null;
  }

  export function isBoolean(bool: unknown): bool is boolean {
    return typeof bool === 'boolean' && (bool === true || bool === false);
  }

  export function isString(str: unknown): str is string {
    return typeof str === 'string';
  }

  export function isNumber(n: unknown): n is number {
    return typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n);
  }

  export function isArray(ar: unknown): ar is Json[] {
    if (!Array.isArray(ar)) return false;
    // every value has to be valid too
    for (const value of ar) if (!isPrimitive(value)) return false; // TODO why no recursion

    return true;
  }

  export function isObject(obj: unknown): obj is JsonObject {
    // false positives are not possible
    if (typeof obj !== 'object' || isNull(obj) || isArray(obj)) return false;

    // every value has to be valid too
    for (const value of Object.values(obj))
      if (!isPrimitive(value)) return false;

    return true;
  }
}

// bit todo
export namespace isJsonString {
  export function isJson(json: string): boolean {
    return (
      isNull(json) ||
      isBoolean(json) ||
      isString(json) ||
      isNumber(json) ||
      isArray(json) ||
      isObject(json)
    );
  }

  export function isJsonLiteral(json: string): boolean {
    return isNull(json) || isBoolean(json) || isString(json) || isNumber(json);
  }

  export function isNull(n: string): n is 'null' {
    n = trimValueWhitespaces(n);
    return !!n.match(isJsonNullRegex);
  }

  export function isBoolean(bool: string): bool is 'true' | 'false' {
    bool = trimValueWhitespaces(bool);
    return !!bool.match(isJsonBoolRegex);
  }

  export function isString(str: string): str is string {
    str = trimValueWhitespaces(str);
    return !!str.match(isJsonStringRegex);
  }

  export function isNumber(n: string): boolean {
    n = trimValueWhitespaces(n);
    return !!n.match(isJsonNumberRegex);
  }

  // better getAllArrayValuesUnsafe
  export function isArray(ar: string): boolean {
    ar = trimValueWhitespaces(ar);

    if (!ar.startsWith('[') || !ar.endsWith(']')) return false;

    let values: string[] = [];
    try {
      // and get all the chars seperatted by "," and trim them
      values = getAllArrayValuesUnsafe(ar);
    } catch (e) {
      return false;
    }

    for (let value of values) {
      if (
        !isNull(value) &&
        !isBoolean(value) &&
        !isString(value) &&
        !isNumber(value) &&
        !isArray(value) &&
        !isObject(value)
      )
        return false; // one part is not from type json
    }

    return true;
  }

  // TODO complete rewrite lol
  export function isObject(obj: string): boolean {
    obj = trimValueWhitespaces(obj);

    if (!obj.startsWith('{') || !obj.endsWith('}')) return false;

    // remove the "{", "}"
    // and get all the chars seperatted by "," and trim the beginning
    // (get KV pairs)
    const parts: string[] = getTopLevelCommas(removeChars(obj, 1, 1));

    let kvPair: string[];
    let name: string;
    let value: string;
    for (let part of parts) {
      kvPair = part.split(':');
      if (kvPair.length !== 2) return false;
      name = trimValueWhitespaces(kvPair[0]);
      value = kvPair[1];
      // check invalid name
      if (!isString(name)) return false;
      if (
        !isNull(value) &&
        !isBoolean(value) &&
        !isString(value) &&
        !isNumber(value) &&
        !isArray(value) &&
        !isObject(value)
      )
        return false;
    }

    return true;
  }

  // only is int todo
  export namespace SpecialSearches {
    // TODO
    export function isInteger(n: string): boolean {
      return isNumber(n) && Number.isInteger(stringToPrimitive.toNumber(n));
    }

    export function isNullArray(ar: string): boolean {
      // not an array or at least one element was not a null
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isNull(e))
      );
    }

    export function isBooleanArray(ar: string): boolean {
      // not an array or at least one element was not a boolean
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isBoolean(e))
      );
    }

    export function isStringArray(ar: string): boolean {
      // not an array or at least one element was not a string
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isString(e))
      );
    }

    export function isNumberArray(ar: string): boolean {
      // not an array or at least one element was not a number
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isNumber(e))
      );
    }

    export function isArrayArray(ar: string): boolean {
      // not an array or at least one element was not an array
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isArray(e))
      );
    }

    export function isObjectArray(ar: string): boolean {
      // not an array or at least one element was not an object
      return (
        isArray(ar) &&
        jsonStringManipulation.getArrayValues(ar).every((e) => isObject(e))
      );
    }
  }
}

/*
(
      !str
        .split('')
        .some((v, i, a) => v === '"' && (i === 0 || a[i - 1] !== '\\')) ||
      !str
        .split('')
        .some((v, i, a) => v === '\\' && (i === 0 || a[i - 1] !== '\\'))
    )
*/

// TODO
export namespace primitiveToString {
  export function primitiveToString(x: Json) {
    if (isPrimitive.isNull(x)) return toNull(x);
    else if (isPrimitive.isBoolean(x)) return toBoolean(x);
    else if (isPrimitive.isString(x)) return toString(x);
    else if (isPrimitive.isNumber(x)) return toNumber(x);
    else if (isPrimitive.isArray(x)) return toArray(x);
    else if (isPrimitive.isObject(x)) return toObject(x);
    else throw new Error('Could not convert data');
  }

  export function toNull(n: null): string {
    if (!isPrimitive.isNull(n)) throw new Error(`${n} is not a valid null.`);
    return 'null';
  }

  export function toBoolean(bool: boolean): string {
    if (!isPrimitive.isBoolean(bool))
      throw new Error(`${bool} is not a valid boolean.`);
    return bool ? 'true' : 'false';
  }

  // todo
  export function toString(str: string): string {
    if (!isPrimitive.isString(str))
      throw new Error(`${str} is not a valid string.`);
    // TODO replace single \ and " with \\ and \"
    str.replace('!', '');
    return '"' + str + '"';
  }

  // TODO mode?: "int"|"float"
  export function toNumber(n: number): string {
    if (!isPrimitive.isNumber(n))
      throw new Error(`The number "${n}" is not a primitive number.`);

    let ans: string = '';
    const integerPart: number = Math.trunc(n);
    const decimalPart: number = Math.abs(n - integerPart);

    ans = integerPart.toString();
    ans += decimalPart
      .toString()
      .split('')
      .filter((v, i) => i !== 0)
      .join('');

    if (!isJsonString.isNumber(ans))
      throw new Error(
        `Internal error, the string "${ans}" is not a json number.`
      );

    return ans;
  }

  // TODO test
  export function toArray(ar: Json[]): string {
    if (!isPrimitive.isArray(ar))
      throw new Error(`Array ${ar} is not a valid json array.`);

    let ans: string = '[';
    for (const e of ar) ans += primitiveToString(e) + ',';

    ans = removeChars(ans, 0, 1) + ']';

    return ans;
  }

  // TODO test
  export function toObject(obj: JsonObject): string {
    if (!isPrimitive.isObject(obj))
      throw new Error(`Object ${obj} is not a valid json object.`);

    let ans: string = '{';
    for (const [k, v] of Object.entries(obj))
      ans += toString(k) + ':' + primitiveToString(v) + ',';

    ans = removeChars(ans, 0, 1) + '}';

    return ans;
  }
}

// TODO
export namespace stringToPrimitive {
  export function stringToPrimitive(x: string): Json {
    if (isJsonString.isNull(x)) return toNull(x);
    else if (isJsonString.isBoolean(x)) return toBoolean(x);
    else if (isJsonString.isString(x)) return toString(x);
    else if (isJsonString.isNumber(x)) return toNumber(x);
    else if (isJsonString.isArray(x)) return toArray(x);
    else if (isJsonString.isObject(x)) return toObject(x);
    else throw new Error('Could not convert data');
  }

  export function toNull(n: string): null {
    if (!isJsonString.isNull(n))
      throw new Error(`${n} is not a valid json string.`);
    return null;
  }

  export function toBoolean(bool: string): boolean {
    if (!isJsonString.isBoolean(bool))
      throw new Error(`${bool} is not a valid json string.`);
    return bool === 'true';
  }

  // TODO
  export function toString(str: string): string {
    if (!isJsonString.isString(str))
      throw new Error(`${str} is not a valid json string.`);
    // TODO backslash for " and \(but not for certain chars)
    return removeChars(str, 1, 1);
  }

  // TODO
  export function toNumber(n: string): number {
    return 0;
  }

  // TODO
  export function toArray(ar: string): Json[] {
    return [];
  }

  // TODO
  export function toObject(obj: string): JsonObject {
    return {};
  }
}

// TODO - everything
namespace jsonStringManipulation {
  export function getArrayValues(jsonArray: string): string[] {
    if (!isJsonString.isArray(jsonArray))
      throw new Error('Not a valid json array');
    else return getAllArrayValuesUnsafe(jsonArray);
  }

  export function getNameValuePairs(jsonObject: string): string[][] {
    return [[]];
  }

  export function getValueByIndex(jsonArray: string, index: number): string {
    return '';
  }

  export function getValueByKey(jsonObject: string, key: number): string {
    return '';
  }

  export function sortArray(json: string): string {
    return '';
  }

  export function isSameJsonString(string1: string, string2: string): boolean {
    // TODO numbers with E or .0, (boolean, null, string ez), array and objects have to be sorted first
    // swap key/swap array element
    return false;
  }
}

// #region outside
function trimValueWhitespaces(str: string): string {
  return trimEndWS(trimStartWS(str));
}

function trimStartWS(str: string): string {
  if (!hasStartWWhiteSpace(str)) return str;
  return trimStartWS(removeChars(str, 1));

  function hasStartWWhiteSpace(s: string): boolean {
    return (
      s.startsWith(' ') ||
      s.startsWith('\n') ||
      s.startsWith('\t') ||
      s.startsWith('\r')
    );
  }
}

function trimEndWS(str: string): string {
  if (!hasEndWWhiteSpace(str)) return str;
  return trimEndWS(removeChars(str, 0, 1));

  function hasEndWWhiteSpace(s: string): boolean {
    return (
      s.endsWith(' ') ||
      s.endsWith('\n') ||
      s.endsWith('\t') ||
      s.endsWith('\r')
    );
  }
}

export function removeChars(
  str: string,
  numberOfStartChars: number,
  numberOfEndChars: number = 0
): string {
  return str
    .split('')
    .filter((v, i, a) => i >= numberOfStartChars)
    .filter((v, i, a) => i < a.length - (numberOfEndChars ?? 0))
    .join('');
}

// TODO get top level elements in "," TODO redundent because better just implementing the return
function getAllArrayValuesUnsafe(jsonArray: string): string[] {
  jsonArray = trimValueWhitespaces(jsonArray);

  // just assume it is an valid jsonArray
  if (!jsonArray.startsWith('[') || !jsonArray.endsWith(']'))
    throw new Error('Is not an json array');
  jsonArray = removeChars(jsonArray, 1, 1);

  return getTopLevelCommas(jsonArray);
}

export function getKVPairsUnsafe(jsonObject: string): string[][] {
  jsonObject = trimValueWhitespaces(jsonObject);

  if (!jsonObject.startsWith('{') || !jsonObject.endsWith('}'))
    throw new Error('Is not an json object');
  jsonObject = removeChars(jsonObject, 1, 1);

  let kvPairs: string[][] = [];
  const kvValues: string[] = getTopLevelCommas(jsonObject);

  // todo escaped "
  for (let value of kvValues) {
    value = trimValueWhitespaces(value);

    // value: '"str\"" : value'
    let startedName: boolean = false;
    let finishedName: boolean = false;
    let startedValue: boolean = false;
    let lastCharWasEscape: boolean = false;
    let isString: boolean = false;
    let name: string = '';
    let cvalue: string = '';
    for (const val of value) {
      // part 1: name
      if (val === '"' && !startedName && !finishedName) startedName = true;
      else if (
        val === '"' &&
        startedName &&
        !finishedName &&
        !lastCharWasEscape
      ) {
        startedName = false;
        finishedName = true;
      } else if (startedName && !finishedName) name += val;

      // part 2: value
      if (finishedName) {
        if (val === '"' && !lastCharWasEscape) isString = !isString; // TODO
        if (val === ':' && !startedValue && !isString) {
          startedValue = true;
          continue;
        }
        if (startedValue) cvalue += val;
      }

      if (lastCharWasEscape) lastCharWasEscape = false;
      if (val === '\\') lastCharWasEscape = true;
    }

    kvPairs.push([name, cvalue]);
  }

  return kvPairs;
}

// input: 'null, true, false, "Hello", 0, [0, 1, "World"], {"key":"value"}'
// output: ['null', 'true', 'false', '"Hello"', '0', '[0, 1, "World"]', '{"key":"value"}']
export function getTopLevelCommas(string: string): string[] {
  let curVal: string = '';
  let values: string[] = [];

  let isSubstring: boolean = false;
  let lastCharWasEscape: boolean = false;

  let squareBrackedCount: number = 0;
  let curlyBrackedCount: number = 0;

  let notPush: boolean; // saving current value to the values array

  for (const char of string) {
    notPush = false;

    // if in string
    if (isSubstring) {
      notPush = true; // still in string, so don't push value to values array
      if (char === '"' && !lastCharWasEscape) {
        isSubstring = false; // substring is finished
        notPush = false; // you can push now since the string is finished
      }
    } else if (char === '"') isSubstring = true;

    // if in array so not real ","
    if (squareBrackedCount !== 0 && !isSubstring) {
      if (char === '[') squareBrackedCount++;
      else if (char === ']') squareBrackedCount--;
    } else if (char === '[' && !isSubstring) squareBrackedCount++;

    // if in object so not real ","
    if (curlyBrackedCount !== 0 && !isSubstring) {
      if (char === '{') curlyBrackedCount++;
      else if (char === '}') curlyBrackedCount--;
    } else if (char === '{' && !isSubstring) curlyBrackedCount++;

    if (
      !notPush &&
      char === ',' &&
      squareBrackedCount === 0 &&
      curlyBrackedCount === 0
    ) {
      // new top level value
      values.push(curVal);
      curVal = '';
    }
    // just add the character
    else curVal += char;

    if (isSubstring && char === '\\' && !lastCharWasEscape)
      lastCharWasEscape = true;
    else if (lastCharWasEscape) lastCharWasEscape = false;
  }

  if (trimValueWhitespaces(curVal) !== '') values.push(curVal); // add last var or empty
  values = values.map((s) => trimValueWhitespaces(s)); // remove whitespaces for each value
  return values;
}
// #endregion

// #region Number parser
export function stringNumberToNumber(
  number: string,
  errorInsteadOfNaN: boolean = false
): number {
  try {
    if (!number.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?([eE][\+-]?\d+)?$/))
      throw new Error('Wrong input');

    const parts: {
      int: string;
      frac: string;
      exp: string;
      sign: number;
      valid: boolean;
    } = getParts(number);
    if (!parts.valid || number === '-')
      throw new Error('Invalid input number.');

    const values: {
      int: string;
      frac: string;
    } = intFracUpdateWithExp(
      parts.int,
      parts.frac,
      uIntStringToNumber(parts.exp === '' ? '0' : parts.exp)
    );

    let finalInt: number = 0; // the final integer part
    let finalFrac: number = 0; // the final fraction part

    if (values.int !== '') finalInt = uIntStringToNumber(values.int); // get the int part

    // get the fraction part
    if (values.frac !== '') {
      let fracN: number = uIntStringToNumber(values.frac);
      const fracNLength: number = values.frac.toString().length; // TODO toString

      for (let i = 0; i < fracNLength; ++i) fracN /= 10; // shift the value to the right point place

      finalFrac = fracN; // add the frac part to the int part
    }

    return (finalInt + finalFrac) * parts.sign; // return the value with the correct sign
  } catch (e) {
    if (errorInsteadOfNaN) throw new Error(e);
    else return NaN;
  }

  // extract the parts of a string number
  function getParts(num: string): {
    int: string;
    frac: string;
    exp: string;
    sign: number;
    valid: boolean;
  } {
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
      } else if ('eE'.split('').some((c) => n === c)) {
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

  function uIntStringToNumber(number: string): number {
    const sign: number = number.startsWith('-') ? -1 : 1;
    if (number.startsWith('-')) number = number.slice(1);

    // reverse the string for easier use
    number = removeLeadingZeros(number).split('').reverse().join('');

    let ans: number = 0;
    for (let i = 0; i < number.length; ++i)
      ans += digitToValue(number[i]) * Math.pow(10, i);

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
        default:
          return NaN;
      }
    }
  }

  function removeLeadingZeros(string: string): string {
    while (string.startsWith('0')) string = string.slice(1);
    return string;
  }

  function removeTrailingZeros(string: string): string {
    while (string.endsWith('0')) string = string.slice(0, -1);
    return string;
  }

  function removeLeadingSign(str: string): string {
    if (str.startsWith('-') || str.startsWith('+')) return str.slice(1);
    else return str;
  }
}
// #endregion

// console.log('test');
