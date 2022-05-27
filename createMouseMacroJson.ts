// Florian Strobl, v1.0
// Write better macros for your Glorious mouse
// Tested with: Glorius Model D Wireless: Firmware v0.3.8.0 compatible

// This script only works with english keyboard layouts!

// How to use this script?
// 1. go to the "modify" region and edit the values you need
// 2. run this typescript file with a typescript compiler/executer and get copy the json string from the console
// 3. paste the json string into a file called "your name.json"
// 4. go into the glorious core software and click on "import macro" under the key binding setting

// #region modify
const macroName: string = 'My macro #1.0';

// simple mode
const yourKeysSimple: string =
  'let list = [31, 42, 69, 420, 727, 2560];\n//positions: 0   1   2    3    4     5';

const yourKeysSimpleDelay: (string | [string, number, number?])[] = [
  ['let list', 0],
  [' = ', 1],
  ['[31, 42, 69,', 1],
  [' 420, 727, ', 1],
  ['2560];', 1],
  ['\n//positions:', 10],
  [' 0   1   2    3    4', 1],
  ['     ', 0.001],
  ['5', 0]
];

function yourKeysSimpleDelayToDelay(
  keys: (string | [string, number, number?])[]
): [string, number, number?][] {
  let vals: [string, number, number?][] = [];
  let i: number = 0;
  for (let key of keys) {
    if (typeof key === 'string') {
      let ans: [string, number][] = [];
      for (const char of key) ans.push([char, i++]);
      for (const a of ans) vals.push(a);
    } else {
      if (key[0].length === 1) {
        let oldKeyVal: number = key[1];
        key[1] += i;
        ++i;
        i += oldKeyVal;
        vals.push(key);
      } else {
        let ans: [string, number, number?][] = [];
        let oldKeyVal: number = key[1];
        for (let x = 0; x < key[0].length; ++x)
          ans.push([
            key[0][x],
            i++ + key[1],
            key.length >= 2 ? key[2] : undefined
          ]);
        i += oldKeyVal;
        for (const a of ans) vals.push(a);
      }
    }
  }
  return vals;
}

// complex mode, [key name, durationTime, holdTime] (times in milliseconds * modifier)
const yourKeysWithDelay: [string, number, number?][] = [
  ['f', 0],
  ['u', 1],
  ['n', 2],
  ['c', 3],
  ['t', 4],
  ['i', 5],
  ['o', 6],
  ['n', 7],
  [' ', 10],
  ['f', 13],
  ['(', 15],
  ['x', 17],
  [')', 19],
  [' ', 20],
  ['{', 22],
  ['\n', 23],
  ['r', 25],
  ['e', 26],
  ['t', 27],
  ['u', 29],
  ['r', 30],
  ['n', 32],
  [' ', 33],
  ['2', 35],
  [' ', 36],
  ['*', 38],
  [' ', 39],
  ['x', 42],
  [';', 44],
  ['\n', 45],
  ['}', 47]
];

// switch between simple and complex mode
const simpleMode: boolean = true;
// debug log the keys to the console
const debugLog: boolean = false;

// set default time modifier to 1 if you want to have it per millisecond
const defaultTimeModifier: number = 100;
// this setting is important for ctrl/alt/shift modifier keys. I would recommend to go into a texteditor
// and to check which settings work best for your case
const defaultHoldDuration: number = 0.1;
// only adjust if the hold duration setting can't fix issues with wrong set ctrl/alt/shift key presses
const timeHoldDifferenceModifier: number = 1;
// #endregion

// #region do not modify
const dictionary: [string, string, string?][] = [
  [' ', 'Space'],
  [';', 'Semicolon'],
  [':', 'Semicolon', 'ShiftLeft'],
  ['.', 'Period'],
  ['>', 'Period', 'ShiftLeft'],
  [',', 'Comma'],
  ['<', 'Comma', 'ShiftLeft'],
  ['/', 'Slash'],
  ['?', 'Slash', 'ShiftLeft'],
  ["'", 'Quote'],
  ['"', 'Quote', 'ShiftLeft'],
  ['[', 'BracketLeft'],
  ['{', 'BracketLeft', 'ShiftLeft'],
  [']', 'BracketRight'],
  ['}', 'BracketRight', 'ShiftLeft'],
  ['!', 'Digit1', 'ShiftLeft'],
  ['@', 'Digit2', 'ShiftLeft'],
  ['#', 'Digit3', 'ShiftLeft'],
  ['$', 'Digit4', 'ShiftLeft'],
  ['%', 'Digit5', 'ShiftLeft'],
  ['^', 'Digit6', 'ShiftLeft'],
  ['&', 'Digit7', 'ShiftLeft'],
  ['*', 'Digit8', 'ShiftLeft'],
  ['(', 'Digit9', 'ShiftLeft'],
  [')', 'Digit0', 'ShiftLeft'],
  ['\n', 'Enter'],
  ['\t', 'Tab'],
  ['=', 'Equal'],
  ['+', 'Equal', 'ShiftLeft'],
  ['\\', 'Backslash'],
  ['|', 'Backslash', 'ShiftLeft'],
  ['`', 'Backquote'],
  ['~', 'Backquote', 'ShiftLeft']
];

function createMouseJSON(
  keyData: { keyCode: string; time: number; holdDuration?: number }[],
  fileName: string = 'default macro name'
): string {
  const value: number = 0;
  const id: string = '0';

  let content: {
    [key: string]: {
      targetIndex: number;
      data: {
        startTime: number;
        marginleft: string;
        endTime: number;
        width: number;
        isDown: boolean;
        tipStart: string;
        tipEnd: string;
        tipInterval: string;
      }[];
    };
  } = {};

  // fill the acutall content
  for (let i = 0; i < keyData.length; ++i) {
    const keyPress = keyData[i];

    keyPress.time *= defaultTimeModifier;
    if (keyPress.holdDuration)
      keyPress.holdDuration *= defaultTimeModifier - timeHoldDifferenceModifier;

    if (content[keyPress.keyCode] === undefined)
      // create new key press
      content[keyPress.keyCode] = {
        targetIndex: 0,
        data: [
          {
            startTime: keyPress.time,
            marginleft: keyPress.time.toString() + 'px',
            endTime:
              keyPress.time +
              1 +
              (keyPress.holdDuration !== undefined ? keyPress.holdDuration : 0),
            width: 1,
            isDown: false,
            tipStart: keyPress.keyCode + '_tipStart0',
            tipEnd: keyPress.keyCode + '_tipEnd0',
            tipInterval: keyPress.keyCode + '_tipInterval0'
          }
        ]
      };
    else {
      content[keyPress.keyCode].targetIndex += 1;
      content[keyPress.keyCode].data = [
        ...content[keyPress.keyCode].data,
        {
          startTime: keyPress.time,
          marginleft: keyPress.time.toString() + 'px',
          endTime:
            keyPress.time +
            1 +
            (keyPress.holdDuration !== undefined ? keyPress.holdDuration : 0),
          width: 1,
          isDown: false,
          tipStart:
            keyPress.keyCode +
            '_tipStart' +
            content[keyPress.keyCode].targetIndex.toString(),
          tipEnd:
            keyPress.keyCode +
            '_tipEnd' +
            content[keyPress.keyCode].targetIndex.toString(),
          tipInterval:
            keyPress.keyCode +
            '_tipInterval' +
            content[keyPress.keyCode].targetIndex.toString()
        }
      ];
    }
  }

  return JSON.stringify({
    filename: 'Glorious_Macro',
    exportVersion: '1',
    value: {
      name: fileName,
      value: value,
      m_Identifier: id,
      content: content
    }
  });
}

function toMouseMacroFormat(
  keys: [string, number, (number | undefined)?][]
): { keyCode: string; time: number; holdDuration?: number }[] {
  let val: { keyCode: string; time: number; holdDuration?: number }[] = [];
  for (const v of keys) {
    // check if it is an none trivial key
    const dictionaryValue = dictionary.filter((e) => e[0] === v[0]);

    if (dictionaryValue.length !== 0) {
      // if it has a alt/shift/ctrl modifier
      if (dictionaryValue[0][2] !== undefined) {
        val.push({
          keyCode: dictionaryValue[0][2],
          time: v[1] - defaultHoldDuration,
          holdDuration: defaultHoldDuration
        });
        val.push({
          keyCode: dictionaryValue[0][1],
          time: v[1],
          holdDuration: undefined
        });
      } else {
        val.push({
          keyCode: dictionaryValue[0][1],
          time: v[1],
          holdDuration: undefined
        });
      }
    } else if (v[0].match(/[a-z]/g) !== null && v[0].length === 1) {
      val.push({
        keyCode: 'Key' + v[0].toUpperCase(),
        time: v[1],
        holdDuration: v[2]
      });
    } else if (v[0].match(/[A-Z]/g) !== null && v[0].length === 1) {
      val.push({
        keyCode: 'ShiftLeft',
        time: v[1] - defaultHoldDuration,
        holdDuration: defaultHoldDuration
      });
      val.push({
        keyCode: 'Key' + v[0].toUpperCase(),
        time: v[1],
        holdDuration: v[2]
      });
    } else if (!!v[0].match(/[0-9]/g) && v[0].length === 1) {
      val.push({
        keyCode: 'Digit' + v[0],
        time: v[1],
        holdDuration: v[2]
      });
    } else val.push({ keyCode: v[0], time: v[1], holdDuration: v[2] });
  }
  return val;
}

function stringToDetailedFormat(str: string): [string, number, number?][] {
  let ans: [string, number, number?][] = [];
  for (let i = 0; i < str.length; ++i) ans.push([str[i], i * 2]);
  return ans;
}

// #region console
// keys which will get printed
let workKeys: {
  keyCode: string;
  time: number;
  holdDuration?: number;
}[] = [];

if (simpleMode)
  workKeys = toMouseMacroFormat(stringToDetailedFormat(yourKeysSimple));
else workKeys = toMouseMacroFormat(yourKeysWithDelay);

//console.log(createMouseJSON(workKeys, macroName));

//if (debugLog) console.log(workKeys);

console.log(
  createMouseJSON(
    toMouseMacroFormat(yourKeysSimpleDelayToDelay(yourKeysSimpleDelay))
  )
);
// #endregion
// #endregion
