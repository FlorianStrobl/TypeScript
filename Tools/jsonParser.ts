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

// TODO Fix \r or \n for spacing, e.g. only every element on new line

type whitespace = `${'' | ' ' | '\n' | '\r' | '\t'}`;

export namespace Json {
  /**
   * @param replacer A function that transforms the results.
   * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
   */

  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   * Up to four of these characters are allowed: " ", "\n", "\r", "\t".
   * @returns Returns a valid Json string.
   */
  export function stringify(value: JSON, space: string = ''): string {
    //if (!space.match(/^(| |\n|\r|\t)*$/)) throw new Error('Invalid spacing.');
    if (space.length > 10) space = space.slice(0, 10);
    return primitiveToString.primitiveToString(value, space, 1);
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

  export function prettify(
    text: string,
    format: FormatMode | '' | '  ' | '\t' | '\n' | '\r'
  ): string {
    if (format === '\n') format = '\r';
    const data: JSON = parse(text);
    switch (format) {
      case FormatMode.NoSpace:
        return stringify(data, '');
      case FormatMode.DoubleSpace:
        return stringify(data, '  ');
      case FormatMode.Tab:
        return stringify(data, '\t');
      case FormatMode.NewLine:
        return stringify(data, '\r');
      case FormatMode.CarriageReturn:
        return stringify(data, '\r');
    }
  }

  /**
   * Check if a string is valid as a JSON string.
   *
   * @param text A string.
   * @returns If the string is comform to the JSON standart.
   */
  export function validation(text: string): boolean {
    return isJsonString.isJson(text);
  }

  /**
   * Check if JavaScript value can be stringified to a JSON string.
   *
   * @param value A JavaScript value, usually an object or array, as target to a JSON value.
   * @returns If the value can be stringified to a JSON value.
   */
  export function valueValidation(value: unknown): boolean {
    return isPrimitive.isPrimitive(value);
  }

  export const enum FormatMode {
    NoSpace = '',
    DoubleSpace = '  ',
    Tab = '\t',
    NewLine = '\r',
    CarriageReturn = '\r'
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

  // TODO only is int
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
    space: string = '',
    neastedInside: number = 1
  ) {
    if (isPrimitive.isNull(json)) return toNull(json);
    else if (isPrimitive.isBoolean(json)) return toBoolean(json);
    else if (isPrimitive.isString(json)) return toString(json);
    else if (isPrimitive.isNumber(json)) return toNumber(json);
    else if (isPrimitive.isArray(json))
      return toArray(json, space, neastedInside);
    else if (isPrimitive.isObject(json))
      return toObject(json, space, neastedInside);
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

  // TODO escape characters \uDDDD
  export function toString(str: string): string {
    if (!isPrimitive.isString(str))
      throw new Error(`${str} is not a valid string.`);
    // default escapes
    str = str.replaceAll(/\\/g, '\\\\');
    str = str.replaceAll(/"/g, '\\"');
    // replace \n, \t, \r
    str = str.replaceAll(/\t/g, '\\t');
    str = str.replaceAll(/\n/g, '\\n');
    str = str.replaceAll(/\r/g, '\\r');
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

  // TODO space
  export function toArray(
    ar: JSON[],
    space: string = '',
    neastedInside: number = 1
  ): string {
    if (!isPrimitive.isArray(ar))
      throw new Error(`Array ${ar} is not a valid json array.`);

    if (space === '') {
      // unformated
      let ans: string = '[';
      for (const e of ar)
        ans += space + primitiveToString(e, space, neastedInside + 1) + ',';
      ans = ans.length === 1 ? '[]' : removeChars(ans, 0, 1) + ']';

      return ans;
    } else {
      // formatted string
      let ans: string = '[\n';
      for (const e of ar)
        ans +=
          space.repeat(neastedInside) +
          primitiveToString(e, space, neastedInside + 1) +
          ',\n';
      ans =
        ans.length === 1
          ? '[]'
          : removeChars(ans, 0, 2) +
            '\n' +
            space.repeat(neastedInside - 1) +
            ']';

      return ans;
    }
  }

  // TODO space
  export function toObject(
    obj: JsonObject,
    space: string = '',
    neastedInside: number = 1
  ): string {
    if (!isPrimitive.isObject(obj))
      throw new Error(`Object ${obj} is not a valid json object.`);

    if (space === '') {
      // unformated
      let ans: string = '{';
      for (const [k, v] of Object.entries(obj))
        ans +=
          toString(k) +
          ':' +
          primitiveToString(v, space, neastedInside + 1) +
          ',';

      ans = ans.length === 1 ? '{}' : removeChars(ans, 0, 1) + '}';

      return ans;
    } else {
      // formatted string
      let ans: string = '{\n';
      for (const [k, v] of Object.entries(obj))
        ans +=
          space.repeat(neastedInside) +
          toString(k) +
          ': ' +
          primitiveToString(v, space, neastedInside + 1) +
          ',\n';

      ans =
        ans.length === 1
          ? '{}'
          : removeChars(ans, 0, 2) +
            '\n' +
            space.repeat(neastedInside - 1) +
            '}';

      return ans;
    }
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

  export function toArray(ar: string): JSON[] {
    if (!isJsonString.isArray(ar))
      throw new Error(`${ar} is not a valid json array.`);
    const values: JSON[] = [];
    for (const str of getAllArrayValuesUnsafe(ar))
      values.push(stringToPrimitive(str));
    return values;
  }

  export function toObject(obj: string): JsonObject {
    if (!isJsonString.isObject(obj))
      throw new Error(`${obj} is not a valid json object.`);
    const values: JsonObject = {};
    for (const [key, value] of getKVPairsUnsafe(obj))
      values[stringKeyToKey(key)] = stringToPrimitive(value);
    return values;

    function stringKeyToKey(key: string): string {
      return removeChars(key, 1, 1);
    }
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
    finalFrac = intToFrac(values.frac);

    // return the value with the correct sign
    return parts.sign === 1 ? finalInt + finalFrac : -(finalInt + finalFrac);
  } catch (e) {
    // Handle errors
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
      valid: ints !== '' || fracs !== ''
    };

    // return sign + str without zeros
    function removeLeadingZerosWMinus(str: string): string {
      return (
        (str.startsWith('-') ? '-' : '') +
        removeLeadingZeros(removeLeadingSign(str))
      );
    }
  }

  // "x" will be interpreted as "0.x"
  function intToFrac(number: string): number {
    const digits: string = '0123456789';
    const digit = (char: string) => digits.indexOf(char);
    let ans: number = 0;

    for (let i = 0; i < number.length; ++i)
      ans += digit(number[i]) / Math.pow(10, i + 1);

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
      frac: removeTrailingZeros(fractionPart)
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
    return ['+', '-'].some((s) => string.startsWith(s))
      ? string.slice(1)
      : string;
  }
}
// #endregion

const obj = {
  a: null,
  b: true,
  c: false,
  //d: Number.MIN_VALUE ** (1 / 2),
  'e e': 'Hello  world !'
  //f: [null, false, 'Hi', 'what'],
  //g: { l: 'm', a: 'o', w: { t: 'f' } },
};
const obj2 = 'Hello \t\n\r \\\\" world!';
const ws = ' ';
const ans = Json.parse(Json.stringify(obj2, ws));
const ans2 = JSON.parse(JSON.stringify(obj2, undefined, ws));
//console.log(ans);
//console.log(ans === ans2);
//console.log(ans2);

console.log(Json.prettify(Json.stringify(obj, '  '), Json.FormatMode.NewLine));

// "x" will be interpreted as "0.x"
function intToFrac1(number: string): number {
  const digits: string = '0123456789';
  const digit = (char: string) => digits.indexOf(char);
  let ans: number = 0;

  for (let i = 0; i < number.length; ++i)
    ans += digit(number[i]) / Math.pow(10, i + 1);

  return ans;
}

//import * as N from 'Numbers';

// "x" will be interpreted as "0.x"
function intToFrac2(number: string): number {
  //N.BinaryNumbers.Floats.
  const digits: string = '0123456789';
  const digit = (char: string) => digits.indexOf(char);
  let ans: number = 0;

  for (let i = 0; i < number.length; ++i)
    ans += digit(number[i]) / Math.pow(10, i + 1);

  return ans;
}

console.log(
  JSON.stringify({ test: '1', what: 2 }, (key, value) => {
    console.log('key: ' + key, 'value: ' + value);
    return value;
  })
);
