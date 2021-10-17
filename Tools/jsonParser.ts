// isPrimitive/isArray/isObject: unknown => bool
// isJson: string => bool
// jsonTToT: string => T
// TToJsonT: T => string

// #region Types and RegExp
type JSON = null | boolean | string | number | JSON[] | JsonObject;
type JsonObject = {
  [property: string]: JSON;
};

// [ \t\n\r]* = space/tab/new line/carraige return zero or more
const isJsonWhitespaceRegex: RegExp = /[ \n\r\t]*/;
const isJsonNullRegex: RegExp = /^null$/;
const isJsonBoolRegex: RegExp = /^(true|false)$/;
const isJsonNumberRegex: RegExp = /^-?(0|[1-9]\d*)(\.\d+)?([eE][\+-]?\d+)?$/;
const isJsonStringRegex: RegExp =
  /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\[0-9a-fA-F]{4}|[^"\\])*"$/;
// #endregion

// TODO Fix \r for spacing

export namespace Json {
  export enum FormatMode {
    AddSpacesSimple,
    AddSpacesAdvanced,
    RemoveSpaces,
  }

  /**
   * @param replacer A function that transforms the results.
   * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
   */

  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   * @returns Returns a valid Json string.
   */
  export function stringify(
    value: JSON,
    space: '' | ' ' | '\n' | '\r' | '\t' = ''
  ): string {
    return primitiveToString.primitiveToString(value, space);
  }

  /**
   * Converts a JavaScript Object Notation (JSON) string into an object.
   *
   * @param text A valid JSON string.
   * @returns A JavaScript value.
   */
  export function parse<T extends JSON>(text: string): T {
    return stringToPrimitive.stringToPrimitive(text) as T;
  }

  export function prettify(text: string, format: FormatMode): string {
    // TODO could have many spaces
    let ans: string = '';
    if (format === FormatMode.AddSpacesSimple) ans = addSpacesSimple(text);
    if (format === FormatMode.AddSpacesAdvanced) ans = addSpacesAdvanced(text);
    if (format === FormatMode.RemoveSpaces) ans = removeSpaces(text);

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

  export function validation(text: string): boolean {
    return isJsonString.isJson(text);
  }

  export function valueValidation(value: unknown): boolean {
    return isPrimitive.isPrimitive(value);
  }
}

// finish
namespace isPrimitive {
  /**
   * only valid json primitives so e.g. Infinity is not a valid number
   */
  export function isPrimitive(primitive: unknown): boolean {
    return (
      isPrimitiveLiteral(primitive) || isArray(primitive) || isObject(primitive)
    );
  }

  export function isPrimitiveLiteral(primitive: unknown): boolean {
    return (
      isNull(primitive) ||
      isBoolean(primitive) ||
      isString(primitive) ||
      isNumber(primitive)
    );
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

  export function isArray(ar: unknown): ar is JSON[] {
    if (!Array.isArray(ar)) return false;
    // every value has to be valid too
    for (const value of ar) if (!isPrimitive(value)) return false;

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

// special case (int) TODO
export namespace isJsonString {
  export function isJson(json: string): boolean {
    return isJsonLiteral(json) || isArray(json) || isObject(json);
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

  export function isArray(ar: string): boolean {
    ar = trimValueWhitespaces(ar);

    // ez invalid checker
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
        return false; // not from type json
    }

    return true; // passed all tests
  }

  export function isObject(obj: string): boolean {
    obj = trimValueWhitespaces(obj);

    // ez invalid checker
    if (!obj.startsWith('{') || !obj.endsWith('}')) return false;

    // get the KV pairs in the format of [ [key,value],[key,value] ]
    const parts: string[][] = getKVPairsUnsafe(obj);

    for (let part of parts) {
      // check invalid name
      if (!isString(part[0])) return false;
      // check for invalid value
      const value: string = part[1];
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

  // TODO only is int todo
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

// to number
export namespace primitiveToString {
  export function primitiveToString(
    json: JSON,
    space: '' | ' ' | '\n' | '\r' | '\t' = ''
  ) {
    if (isPrimitive.isNull(json)) return toNull(json);
    else if (isPrimitive.isBoolean(json)) return toBoolean(json);
    else if (isPrimitive.isString(json)) return toString(json);
    else if (isPrimitive.isNumber(json)) return toNumber(json);
    else if (isPrimitive.isArray(json)) return toArray(json, space);
    else if (isPrimitive.isObject(json)) return toObject(json, space);
    else throw new Error(`${json} is not a valid json primitive.`);
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

  export function toString(str: string): string {
    if (!isPrimitive.isString(str))
      throw new Error(`${str} is not a valid string.`);
    str = str.replaceAll(/\\/g, '\\\\');
    str = str.replaceAll(/"/g, '\\"');
    return '"' + str + '"';
  }

  // TODO correct output
  export function toNumber(n: number): string {
    if (!isPrimitive.isNumber(n))
      throw new Error(`${n} is not a primitive number.`);

    let ans: string = '';
    const integerPart: number = Math.trunc(n);
    const decimalPart: number = Math.abs(n - integerPart);

    ans = integerPart.toString(); // TODO, not use to string
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

  export function toArray(
    ar: JSON[],
    space: '' | ' ' | '\n' | '\r' | '\t' = ''
  ): string {
    if (!isPrimitive.isArray(ar))
      throw new Error(`Array ${ar} is not a valid json array.`);

    let ans: string = '[';
    for (const e of ar) ans += primitiveToString(e) + ',' + space;

    ans = ans.length === 1 ? '[]' : removeChars(ans, 0, space.length + 1) + ']';

    return ans;
  }

  // TODO space
  export function toObject(
    obj: JsonObject,
    space: '' | ' ' | '\n' | '\r' | '\t' = ''
  ): string {
    if (!isPrimitive.isObject(obj))
      throw new Error(`Object ${obj} is not a valid json object.`);

    let ans: string = '{';
    for (const [k, v] of Object.entries(obj))
      ans += toString(k) + ':' + primitiveToString(v) + ',' + space;

    ans = ans.length === 1 ? '{}' : removeChars(ans, 0, space.length + 1) + '}';

    return ans;
  }
}

// TODO
export namespace stringToPrimitive {
  export function stringToPrimitive(string: string): JSON {
    if (isJsonString.isNull(string)) return toNull(string);
    else if (isJsonString.isBoolean(string)) return toBoolean(string);
    else if (isJsonString.isString(string)) return toString(string);
    else if (isJsonString.isNumber(string)) return toNumber(string);
    else if (isJsonString.isArray(string)) return toArray(string);
    else if (isJsonString.isObject(string)) return toObject(string);
    else throw new Error(`${string} is not a valid json string.`);
  }

  export function toNull(n: string): null {
    if (!isJsonString.isNull(n))
      throw new Error(`${n} is not a valid json null.`);
    return null;
  }

  export function toBoolean(bool: string): boolean {
    if (!isJsonString.isBoolean(bool))
      throw new Error(`${bool} is not a valid json boolean.`);
    return trimValueWhitespaces(bool) === 'true';
  }

  export function toString(str: string): string {
    if (!isJsonString.isString(str))
      throw new Error(`${str} is not a valid json string.`);
    // remove the beginning and ending "
    str = removeChars(str, 1, 1);

    // replace escaped characters
    str = str.replaceAll(
      /(\\\\)|(\\")|(\\\/)|(\\n)|(\\t)|(\\b)|(\\f)|(\\r)/g,
      (sub) => {
        switch (sub) {
          case '\\\\':
            return '\\'; // backspace
          case '\\"':
            return '"'; // "
          case '\\/':
            return '/'; // Soldius
          case '\\n':
            return '\n'; // New line
          case '\\t':
            return '\t'; // Tab
          case '\\b':
            return '\b'; // Backspace
          case '\\f':
            return '\f'; // Form feed
          case '\\r':
            return '\r'; // Carriage return
        }
      }
    );
    return str;
  }

  export function toNumber(n: string): number {
    if (!isJsonString.isNumber(n))
      throw new Error(`${n} is not a valid json number.`);
    return stringNumberToNumber(n);
  }

  // TODO escaped characters
  export function toArray(ar: string): JSON[] {
    if (!isJsonString.isArray(ar))
      throw new Error(`${ar} is not a valid json array.`);
    const values: JSON[] = [];
    for (const str of getAllArrayValuesUnsafe(ar))
      values.push(stringToPrimitive(str));
    return values;
  }

  // TODO escaped characters
  export function toObject(obj: string): JsonObject {
    if (!isJsonString.isObject(obj))
      throw new Error(`${obj} is not a valid json object.`);
    const values: JsonObject = {};
    for (const [key, value] of getKVPairsUnsafe(obj))
      values[key] = stringToPrimitive(value);
    return values;
  }
}

// TODO - everything
export namespace jsonStringManipulation {
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
  return trimStartWS(removeChars(str, 1, 0));

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

function removeChars(
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
function getAllArrayValuesUnsafe(text: string): string[] {
  text = trimValueWhitespaces(text);

  // just assume it is an valid jsonArray
  if (!text.startsWith('[') || !text.endsWith(']'))
    throw new Error('Is not an json array');
  text = removeChars(text, 1, 1);

  return getTopLevelCommas(text);
}

// assumes that it gets an valid json object and works arcordingly to this
function getKVPairsUnsafe(text: string): string[][] {
  text = trimValueWhitespaces(text);

  if (!text.startsWith('{') || !text.endsWith('}'))
    throw new Error('Is not an json object');
  text = removeChars(text, 1, 1);

  let kvPairs: string[][] = [];
  const kvValues: string[] = getTopLevelCommas(text);

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
        continue;
      } else if (startedName && !finishedName) name += val;

      // part 2: value
      if (finishedName) {
        if (val === '"' && !lastCharWasEscape) isString = !isString; // TODO
        if (val === ':' && !startedValue && !isString) {
          startedValue = true;
          continue; // go to the next iteration
        }
        if (startedValue) cvalue += val;
      }

      if (lastCharWasEscape) lastCharWasEscape = false;
      if (val === '\\') lastCharWasEscape = true;
    }

    kvPairs.push(['"' + name + '"', trimValueWhitespaces(cvalue)]);
  }

  return kvPairs;
}

// input: 'null, true, false, "Hello", 0, [0, 1, "World"], {"key":"value"}'
// output: ['null', 'true', 'false', '"Hello"', '0', '[0, 1, "World"]', '{"key":"value"}']
function getTopLevelCommas(text: string): string[] {
  let curVal: string = '';
  let values: string[] = [];

  let isSubstring: boolean = false;
  let lastCharWasEscape: boolean = false;

  let squareBracketCount: number = 0;
  let curlyBracketCount: number = 0;

  let notPush: boolean; // saving current value to the values array

  for (const char of text) {
    notPush = false;

    // if in string
    if (isSubstring) {
      notPush = true; // still in string, so don't push value to values array
      if (char === '"' && !lastCharWasEscape) {
        isSubstring = false; // substring is finished
        notPush = false; // you can push now since the string is finished
      }
    } else if (char === '"') isSubstring = true;

    // #region brackets
    // if in array so not real ","
    if (squareBracketCount !== 0 && !isSubstring) {
      if (char === '[') squareBracketCount++;
      else if (char === ']') squareBracketCount--;
    } else if (char === '[' && !isSubstring) squareBracketCount++;

    // if in object so not real ","
    if (curlyBracketCount !== 0 && !isSubstring) {
      if (char === '{') curlyBracketCount++;
      else if (char === '}') curlyBracketCount--;
    } else if (char === '{' && !isSubstring) curlyBracketCount++;
    // #endregion

    if (
      !notPush &&
      char === ',' &&
      squareBracketCount === 0 &&
      curlyBracketCount === 0
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

  // remove whitespaces for each value
  return values.map((s) => trimValueWhitespaces(s));
}
// #endregion

// #region Number parser
function stringNumberToNumber(
  number: string,
  errorInsteadOfNaN: boolean = false
): number {
  try {
    if (!number.match(isJsonNumberRegex)) throw new Error('Not a JSON number.');

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

    // convert the string fraction part (saved as a BigInt String) into a floating point part
    finalFrac = binIntToFloat(values.frac);

    // return the value with the correct sign
    return parts.sign === 1 ? finalInt + finalFrac : -(finalInt + finalFrac);
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
    // the different parts of a number
    let ints: string = '';
    let fracs: string = '';
    let exps: string = '';

    // checks in which part of the number we are
    let intp: boolean = true;
    let fracp: boolean = false;
    let expp: boolean = false;
    for (let n of num) {
      if (n === '.') {
        // in the fraction part
        fracp = true;
        intp = false;
        expp = false;
        continue;
      } else if ('eE'.split('').some((c) => n === c)) {
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

  // "101" will be interpreted as "0.101"
  function binIntToFloat(number: string): number {
    const digits: string = '0123456789';
    const digit = (char: string) => digits.indexOf(char);
    let ans: number = 0;

    for (let i = 0; i < number.length; ++i)
      ans += digit(number[i]) / Math.pow(10, i);
    ans /= 10;

    return ans;
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

  function uIntStringToNumber(number: string): number {
    const digits: string = '0123456789';
    const digit = (char: string) => digits.indexOf(char);
    const sign: number = number.startsWith('-') ? -1 : 1;

    // reverse the string for easier use
    number = removeLeadingZeros(removeLeadingSign(number))
      .split('')
      .reverse()
      .join('');

    let ans: number = 0;
    for (let i = 0; i < number.length; ++i)
      ans += digit(number[i]) * Math.pow(10, i);

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

  function removeLeadingSign(string: string): string {
    return string.startsWith('-') || string.startsWith('+')
      ? string.slice(1)
      : string;
  }
}
// #endregion

function bin(float: number): string {
  if (typeof float !== 'number') throw new Error('Invalid input number');

  const buffer: ArrayBuffer = new ArrayBuffer(8);
  new Float64Array(buffer)[0] = float;
  let ans: string = new BigUint64Array(buffer)[0].toString(2); // convert it to binary, TODO toString()
  while (ans.length < 64) ans = '0' + ans; // fill the start with leading zeros

  return ans;
}

// TODO
const t = [
  /*
  Number.MAX_SAFE_INTEGER,
  Number.MAX_VALUE,
  Number.MIN_SAFE_INTEGER,
  Number.MIN_VALUE,
  Number.EPSILON,
  '0.0',
  '0.1',
  '0.2',
  '0.3',
  '0.9',
  '0.99999999999999999',
  '1',
  '0.30000000000000004',
  '0.30000000000000009',
  '0.30000000000000010',
  '0.30000000000000011',
  '0.30000000000000012',
  '0.30000000000000013',
  '0.30000000000000014',
  '0.30000000000000015',
  '0.30000000000000016',
  '0.30000000000000017',
  '0.30000000000000018',
  '0.30000000000000019',
  '0.30000000000000020',
  '0.30000000000000021',
  '0.78942874538795347',
  '0.07892617895637856',
  '0.76427890543798563',
  '0.34216798543265437',
  '0.12390854379843127',
  '0.45536786846807972',
  '0.65487598766374637',
  */
  '0.03142675474538745',
  '0.0314267547453874587',
  '0.45536786846807972',
  '0.4553678684680797245',
];
//for (const s of t) console.log(s, Number(s), stringToPrimitive.toNumber(s));

const testString: string[] = [
  '0.78942874538795347',
  '0.30000000000000015',
  '0.30000000000000019',
  '0.99999999999999999',
];
const f: number = 2;

//console.log(Number('0.99999999999999993'));
//console.log(Number(Number.MIN_VALUE.toString()));
//console.log(stringToPrimitive.toNumber('0.99999999999999993'));
//console.log(stringToPrimitive.toNumber(Number.MIN_VALUE.toString()));

//console.log(Number(testString[f]), stringToPrimitive.toNumber(testString[f]));

//console.log(binIntToFloat(testString[f].slice(2)));

// "101" will be interpreted as "0.101"
function binIntToFloat(number: string): number {
  const digits: string = '0123456789';
  const digit = (char: string) => digits.indexOf(char);

  let ans: number = 0;

  for (let i = 0; i < number.length; ++i) {
    // one line
    //ans += digits.indexOf(number[i]) / Math.pow(10, i + 1);
    //ans += digits.indexOf(number[i]) * Math.pow(10, -(i + 1));

    // two lines
    ans += digit(number[i]) / Math.pow(10, i - 1);
    //ans += digits.indexOf(number[i]) * Math.pow(10, -i);
  }
  ans /= 100;

  return ans;
}
