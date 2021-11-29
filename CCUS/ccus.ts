// #region types, vars and funcs
type alphanumeric = string;
type identifier = alphanumeric;
type code = string;

interface IVariable {
  name: identifier;
  type: Type;
  context: identifier;
  value?: string;
  varCurrentValue?: string;
  public?: boolean;
}

interface IFunction {
  name: identifier;
  body: code;
  args: IFunctionArgument[];
  retType?: Type;
}

interface IFunctionArgument {
  name: identifier;
  type: Type;
}

interface IContext {
  context: alphanumeric;
  vars: IVariable[];
  funcs: IFunction[];
}

interface IFunctionContext extends IContext {
  args?: IVariable[];
}

interface internSubstringsHandling {
  substrPlaceholder: string;
  substrValue: string;
}

const getAlphanumericNames: RegExp = /\b([A-Za-z])([A-Za-z0-9])*\b/g;
const isStringRegex: RegExp = /"((\\"|[^"])*?)"/g;
const isDefStatement: RegExp =
  /\bdef ([a-zA-Z])([a-zA-Z0-9])* (\$?(([A-Za-z0-9]+)|("[A-Za-z0-9 ]*")))/g;
const isUseStatement: RegExp = /\buse (("[a-zA-Z][a-zA-Z0-9 ]*")|(\$[0-9]+))/g;
const subStringRegex: RegExp = /"((\\"|[^"])*?)"/g;
const subStringPlaceholder: RegExp = /\$\d+\$/g;

const isWord: (word: string) => RegExp = (word: string) =>
  new RegExp(`\b${word}\b`, 'g');
const Log: (log: any) => void = (log: any) => console.log(log);

function isAlphanumeric(str: string): boolean {
  return !!str.match(/^[A-Za-z0-9]+$/); // one or more chars AZaz09
}

function isValidIdentifierName(str: string): boolean {
  return (
    str !== '' &&
    str !== ' ' &&
    isAlphanumeric(str) &&
    isLetter(str.split('')[0]) // first letter has to be a letter
  );
}

function isLetter(char: string): boolean {
  return !!char.match(/[a-zA-Z]/);
}

enum Type {
  'void' = 'void',
  'var' = 'var',
  'vars' = 'vars',
  'bool' = 'bool',
  'bools' = 'bools',
  'num' = 'num',
  'nums' = 'nums',
  'str' = 'str',
  'strs' = 'strs',
  'obj' = 'obj',
  'objs' = 'objs'
}
// #endregion

class CCUS {
  /**
   * Math lib:
   *
   * PI = 3.1415926535897931
   * E = 2.7182818284590451
   * TAU = 6.2831853071795862
   * LN10 = 2.302585092994046
   * LN2 = 0.6931471805599453
   * LOG10E = 0.4342944819032518
   * LOG2E = 1.4426950408889634
   * SQRT1_2 = 0.7071067811865476
   * SQRT2 = 1.4142135623730951
   *
   * abs()
   * sin()
   * asin()
   * cos()
   * acos()
   * acosh()
   * tan()
   * atan()
   *
   * BitDecrement(Double)	Returns the next smallest value that compares less than x.
   * BitIncrement(Double)
   * remainder()
   *
   * Clamp() Returns value clamped to the inclusive range of min and max.
   * CopySign(double magnitude, double sign) Returns the first floating-point argument with the sign of the second floating-point argument.
   */

  keywords: string[] = [
    ...Object.values(Type), // types
    'in', // input from user
    'out', // output to user
    'main', // entrypoint function
    'def', // define a placeholder name for a value (precompile)
    'use', // use/include (inc) a file
    'class', // create a class
    'op', // create an operater
    'func', // create a function
    'ret', // return from function
    'throw', // function did error
    'const', // constant variable/function (like static)
    'ref', // referenz variable (can change value inside other context)
    'if', // if boolean statements
    'else', // previous if statement was not executed so execute this statement (like an if)
    'for', // for/loop loop (var x of vars)/(num i = 0; i < n; i++)/(boolean) statement
    'break', // break inside a for loop
    'switch', // switch between multiple choices (like an if)
    'pub', // function/class/variable is accessible from other files
    'priv', // function/class/variable is not accessible from other files
    'of', // for for loops
    'typeof', // get the type of a variable at runtime
    'imp', // import public variables
    'new' // create a new object
  ];

  // can be followed/preceded by which chars/by which not? TODO
  // numbers: -?(0|[1-9][0-9*])(.[0-9]*)?(e[0-9])?
  preservedCharacters: string[] = [
    '(', // open bracket (parentheses, math, boolean, arguments)
    ')', // closing bracket (parentheses, math, boolean, arguments)
    '{', // open curly bracket (object or body)
    '}', // closing curly bracket (object or body)
    '[', // open square bracket (array)
    ']', // closing square bracket (array)
    ',', // seperator (array, object, arguments in function)
    '//', // comment
    '/*', // multiline comment start
    '/**', // multiline comment with descriptors start
    '*/', // multiline comment end
    ';', // end of a statement
    '.', // point, class/exports
    '=', // assigment
    '?', // optional argument in function
    '"', // string identifier
    '\\', // escape character in string
    '+', // add, also strings
    '*', // multiply
    '-', // subtrackt
    '/', // divide
    '**', // exponent
    '__', // root
    '%', // mod
    '+=', // add val to var and save in var
    '*=', // ""
    '-=', // ""
    '/=', // ""
    '**=', // ""
    '__=', // ""
    '%=', // ""
    '++', // increase by 1
    '--', // decrease by 1
    '==', // is equal
    '<', // is smaller than
    '>', // is bigger than
    '<=', // is smaller or equal than
    '>=', // is bigger or equal than
    '!', // not (boolean expression)
    '&&', // and (boolean expression)
    '||', // or (boolean expression)
    '&', // and (bit manipulation)
    '|', // or (bit manipulation)
    '^', // xor (bit manipulation)
    '~', // not (bit manipulation)
    '(s)', // toString()
    ':', // for each/ key value pair seperator TODO
    '_', // number seperator
    ' ', // whitespace 0
    '\n', // whitespace 1
    '\t', // whitesspace 2
    '[]' // array operator
    //'PI', // 3.1415926535897931
    //'TAU', // 6.2831853071795862
    //'E' // 2.71828
  ];

  public static RunCC(
    mainFile: string,
    otherFiles?: string[],
    headers?: string[],
    settingsFile?: string
  ) {
    mainFile = CCUSPreProcessing.preProcess(
      mainFile,
      [
        { name: 'file1', content: '-' },
        { name: 'file 2', content: `my content " haha " //test` },
        { name: 'useless file', content: '+' }
      ],
      false
    );
    const mainFunctions = this.getTopLevelFunctions(mainFile);

    // console.log('top lvl funcs', mainFunctions);

    if (mainFunctions.every((f) => f.name !== 'Main')) {
      throw new Error(
        'No entrypoint was found! Missing a main function inside the main file.'
      );
    }
  }

  private static callFunction(func: string, ctx: IFunctionContext): string {
    let curFunc: IFunction | undefined = undefined;
    for (const f of ctx.funcs) if (f.name === func) curFunc = f;
    if (curFunc === undefined)
      throw new Error(
        `Couldn't call the function "${func}" because it wasn't provided.`
      );

    return '';

    function executeCode(code: string[]): string {
      return '';
    }
  }

  // TODO, not use
  private static getTopLevelFunctions(str: string): IFunction[] {
    const chars: string[] = str.split('');
    chars.unshift(' '); // TODO because "func " is not " func "

    let funcKeyWordPos: number = 0;

    // start putting the chars in the cur vars
    let funcNameSave: boolean = false;
    let funcArgsSave: boolean = false;
    let funcBodySave: boolean = false;
    let isFunc: boolean = false;

    // the cur vars who save the values of the current thing
    let curFuncName: string = ''; // can also be at first a type
    let curFuncType: string | undefined;
    let curFuncArgs: string = '';
    let curFuncBody: string = '';

    let funcBodyOpenBrackeds: number = 0;

    let finishedFuncs: IFunction[] = [];

    for (let i = 0; i < chars.length; ++i) {
      // do not check for agrguments if saving the body
      if (!funcBodySave) {
        // check if " func " is written
        if (' func '.split('')[funcKeyWordPos] === chars[i]) {
          funcKeyWordPos++;
          if (funcKeyWordPos === ' func '.split('').length) {
            // func is written
            // save func name
            funcKeyWordPos = 0;
            funcNameSave = true;
            isFunc = true;
            continue;
          }
        }
      }

      if (isFunc) {
        // save name after the keyword "func "
        if (funcNameSave) {
          if (chars[i] === ' ' && this.isValidType(curFuncName)) {
            // func name was not name but type
            curFuncType = curFuncName;
            curFuncName = '';
          } else if (chars[i] === ' ' || chars[i] === '(') {
            // the type & name is over
            funcNameSave = false;
            funcArgsSave = true;
          } else curFuncName += chars[i];
          continue;
        }

        // save the argument string
        if (funcArgsSave) {
          if (chars[i] === '(') continue;
          // not in the string
          else if (chars[i] === ')') funcArgsSave = false;
          // end of string
          else curFuncArgs += chars[i]; // add string
          continue; // skip the rest
        }

        // start saving body
        if (!funcBodySave && chars[i] === '{') {
          funcBodySave = true;
          continue;
        }

        // check if end body or just a char
        if (funcBodySave && chars[i] === '}') {
          if (funcBodyOpenBrackeds !== 0) funcBodyOpenBrackeds--;
          else {
            funcBodySave = false;
            finishedFuncs.push({
              name: curFuncName,
              args: argStringToArgVal(curFuncArgs),
              body: curFuncBody.trimStart().trimEnd(),
              retType: curFuncType as any
            });
            // reset for next same level function
            curFuncName = '';
            curFuncArgs = '';
            curFuncBody = '';
            curFuncType = undefined;
            funcNameSave = false;
            funcArgsSave = false;
            funcBodySave = false;
            isFunc = false;
            continue;
          }
        }

        // save
        if (funcBodySave) {
          // used to have a overview of nested "{}"
          if (chars[i] === '{') funcBodyOpenBrackeds++;
          // save to the main body
          curFuncBody += chars[i];
        }
      }
    }

    for (const func of finishedFuncs)
      if (this.isValidFunc(func) !== true) throw this.isValidFunc(func);

    return finishedFuncs;

    function argStringToArgVal(argStr: string): IFunctionArgument[] {
      if (argStr === '') return [];

      let argVals: IFunctionArgument[] = [];

      const args: string[] = argStr
        .trimStart()
        .trimEnd()
        .split(',')
        .map((s) => s.trimStart().trimEnd());

      for (const arg of args) {
        // TODO better arg parsing
        const argParts: string[] = arg.split(' ');

        argVals.push({
          type: argParts[0] as unknown as Type,
          name: argParts.filter((v, i) => i !== 0).join(' ') // the rest
        });
      }

      return argVals;
    }
  }

  private static getLogicalCodeBlocks(code: string): string[] {
    let blocks: string[] = [];
    const chars: string[] = code.split('');
    for (let i = 0; i < chars.length; ++i) {
      const char: string = chars[i];
      // check if starts with keyword or ends with `;`
    }

    return blocks;
  }

  private static isValidFunc(func: IFunction): Error | boolean {
    if (!isValidIdentifierName(func.name))
      return new Error(`The function "${func.name}" has an invalid name.`);

    for (const arg of func.args) {
      if (!this.isValidType(arg.type))
        return new Error(
          `The function "${func.name}" has an invalid type in it's arguments. Type "${arg.type}" doesn't exist.`
        );
      if (!isValidIdentifierName(arg.name))
        return new Error(
          `The function "${func.name}" has an invalid argument name in it's arguments. The name "${arg.name}" isn't valid.`
        );
    }

    return true;
  }

  private static isValidType(str: Type | string): boolean {
    for (const type in Type) if (str === type) return true;
    return false;
  }

  // ccus test code
  public static testCode = `
  // valid CCS file lol
  def aDef "myVal" // every "aDef" should be replaced with "myVal"
  use "file1" // insert the "file1" file at this position
  def PI 314
  
  // just some empty line
     PI
  otherDef
  // just some spaces to potentially throw of the preCompiler
  func Main () {// just a normal func which has no return type btw
    // this is a comment and an invalid def is here def aDeff 54
    def otherDef 4 // another def in the middle of the file, which is still a global thing
    if (MyFunc(5) == 5) { // if statement with function and == use
      out("fire 1 dash 1"); // output a string
    } else { // else statement
        out  (  "fire 1 dash 2"   )    ;      
    } use "file 2" // use statment in the middle of the file
  aDef 
  
    str aStr = " Hello\\" world ";
  
    num myNum = -5.3E+5;
  
  // same as the last if just where the else should get called
    if (MyFunc(3) == 7) {
      Log("fire 2 dash 1");
    } else {otherDef
      Log("fire 2 dash 2");
    }
  otherDef
  
  // just a normal for loop
    for (num x = 0; x < 5; x++) {
     otherDef Log(x);
    }
  
     num   x    =5    ;
    while (x < 10) {
      out(x);
      x = x + 1;
    }
  
    out(h);
  }
  
  func num MyFunc (num i) {
    const num x = 5;
    out(x);
  
    return i;
  
    func NoArgsNoCode () {
        
    }
  }
  
  // valid comment? // still?
  // this should test if complex spacing is working correctly
  // especially the argument part in the middle
       func     objs    StrangeFormattedfunc     (  
         
  
       
          num   
           
  // also a valid comment lol 
  
          arg2  , str lOl // valid comment   
          
          
           )     
     
    
    {
  
  
                }
  
  // just declaring a operator as normal
  op num ("++", int x,) {
  
  }
  
  op num ("--", , int x) { }
  
  // benchmark for strange formatting lol
  func
  strs
  haha
  ()
  {}
  
  otherDeffunc obj ANewFuncWhichShouldNotWork(){}
  
  / / 0
  /  / 1
  /  / invalid comment because spaces lmao 2
  /
  / 3
  // all of them are not comments 4
  `;
}

// source code gets preprocessed: removing commas, including defs and use
class CCUSPreProcessing {
  /**
   * Pre processing:
   * - Removing comments
   * - Removing whitespaces characters
   * - Process # code: use and def statements
   *
   * @param code The source code to pre process
   * @param header The header files needed for that
   * @param isHeader If the source code is a header file itself
   * @returns Pre processed code
   */
  public static preProcess(
    code: code,
    header?: { name: string; content: code }[],
    isHeader?: boolean
  ): string {
    // #region get all the compiled versions of the other files to use them as header files
    let preCompiledCoFiles: { name: string; content: string }[] = [];

    if (isHeader !== true)
      preCompiledCoFiles =
        header?.map((f) => ({
          name: f.name,
          content:
            // compile each map
            this.preProcess(
              f.content, // the content of it
              // every other file could be needed too
              header.filter((subfile) => subfile.name !== f.name), // not the file itself to fix recursion
              true // it's a header file TODO, header else get done twice
            )
        })) ?? [];
    // #endregion

    // remove substrings for ez of use
    const substringData: {
      code: string;
      substrings: internSubstringsHandling[];
    } = this.swapSubstring(code);
    code = substringData.code;

    // remove all the comments and whitespaces
    let lines: code[] = this.removeCommentsWhiteSpaces(code);

    // do the preprocess statements
    code = this.preprocessStatements(lines, substringData.substrings);

    // insert all the headers TODO
    // file = insertSubstrings(
    //   file,
    //   subStringPlaceholder,
    //   headers.map((def) => ({
    //     substrPlaceholderVal: def.placeholderName,
    //     substrValue: def.value
    //   }))
    // );

    //console.info('final infos', {
    //  file,
    //  defs,
    //  headers,
    //  substrs
    //});
    Log(code);

    return code;
  }

  /**
   * Remove any comments in the code
   * Comments:
   * - //
   * - /* /
   * - /** /
   *
   * Whitespaces:
   * - '  '
   * - '\t'
   * - '\n'
   *
   * @returns Code without comments
   */
  public static removeCommentsWhiteSpaces(code: code): code[] {
    // format code and split them by line (for the rest)
    // attention: this is before the check for preCompile statements!!
    let lines: string[] = code
      .replace(/\/\/.*/g, '') // remove all single line comments at the end of lines
      .replace(/\/\*(.|\n)*\*\//g, '') // remove multiple line comments
      .replace(/\t/g, ' ') // removes tabs
      .replace(/\n/g, ' \n ') // ensures that key words are splitted even over line ends which have no spaces
      .replace(/ +\n(\n| )+/g, ' \n') // remove double spaces splitted over lines (" \n ")
      .replace(/  +/g, ' ') // replace all double spaces (on a single line) with a single space
      .split('\n') // split the lines
      .filter((s) => s !== '' && s !== ' '); // remove empty strs in array
    return lines;
  }

  private static preprocessStatements(
    lines: code[],
    substrs: internSubstringsHandling[]
  ): code {
    let preCompileStatements: string[] = [];
    for (const line of lines) {
      // get all the use/inc and def statments
      if (!!line.match(isDefStatement))
        preCompileStatements.push(line.match(isDefStatement)![0]);
      // if (!!line.match(isUseStatement))
      //   preCompileStatements.push(line.match(isUseStatement)![0]);
    }

    let defs: { placeholderName: string; value: string }[] = []; // def statements
    let headers: string[] = []; // use/inc files
    for (const pre of preCompileStatements) {
      lines = lines
        .map((s) => s.replace(pre, '').replace(/  +/g, ' ')) // remove precompile str from the line and fix any double spaces
        .filter((s) => s !== '' && s !== ' '); // remove empty lines

      if (!!pre.match(isDefStatement)) {
        // is a def statement, TODO add them to the main string later
        defs.push({
          placeholderName: pre.split(' ')[1],
          value: pre.split(' ')[2]
        });
      }
      // if (!!pre.match(isUseStatement)) {
      //   // is a use thing, TODO add them to the main string later
      //   headers.push(pre.split(' ')[1].trimEnd());
      // }
    }
    // replace placeholder values in defs and headers to main values
    defs = defs.map((def) => ({
      placeholderName: def.placeholderName,
      value: this.insertSubstrings(def.value, subStringPlaceholder, substrs)
    }));
    headers = headers.map((header) =>
      this.insertSubstrings(header, subStringPlaceholder, substrs)
    );

    // TODO def and header/use/inc

    // reinsert all the subtrings, which where removed at the beginning
    let code = this.insertSubstrings(
      lines.join(''),
      subStringPlaceholder,
      substrs
    );

    // insert all the defs
    code = this.insertSubstrings(
      code,
      /([a-zA-Z])([a-zA-Z0-9])*/g,
      defs.map((def) => ({
        substrPlaceholder: def.placeholderName,
        substrValue: def.value
      }))
    );

    return code;
  }

  private static swapSubstring(code: code): {
    code: code;
    substrings: internSubstringsHandling[];
  } {
    // remove all strings before accessing code
    const substrHandler: {
      code: string;
      substrings: internSubstringsHandling[];
    } = this.extractSubstrings(code, subStringRegex, '$');
    code = substrHandler.code; // replace the file with the placeholder file
    return { code: code, substrings: substrHandler.substrings }; // the placeholders
  }

  // e.g. `code "sub" code` => `code $0$ code`
  public static extractSubstrings(
    code: code,
    replaceSubstringForm: RegExp,
    replaceSymbol: string
  ): {
    code: code;
    substrings: internSubstringsHandling[];
  } {
    let inc: number = -1;
    let substrs_: internSubstringsHandling[] = [];

    const newCode: string = `"test""te"test"st"`.replace(
      subStringRegex, // everything in the specified format
      (
        placeholder // for every substring inside the main string
      ) => {
        inc++;
        substrs_.push({
          substrValue: placeholder, // the value of the to replace substr
          substrPlaceholder: '$' + inc + '$' // the replace value for the substr
        });
        return '$' + inc + '$';
      }
    );

    return { code: newCode, substrings: substrs_ };

    // #region manual version
    // the substring data
    let substrs: internSubstringsHandling[] = [];
    // keep track of the current placeholder number
    let placeholderCount: number = 0;

    for (const substr of code.match(replaceSubstringForm) ?? []) {
      // check if already was replaced once
      const index: number = substrs.findIndex((s) => s.substrValue === substr);

      if (index === -1) {
        // new substr

        const placeholderValue: string =
          replaceSymbol + placeholderCount + replaceSymbol;

        // add the substr to the array
        substrs.push({
          substrValue: substr, // the value of the to replace substr
          substrPlaceholder: placeholderValue // the replace value for the substr
        });

        // replace the substring with the placeholder (not all occurences!)
        code = code.replace(substr, placeholderValue);
        // inc placeholder count
        placeholderCount++;
      }
      // wass already replaced at least once, reuse the placeholder
      else code = code.replace(substr, substrs[index].substrPlaceholder);
    }

    return { code: code, substrings: substrs };
    // #endregion
  }

  // e.g. `code $0$ code` => `code "sub" code`
  public static insertSubstrings(
    code: code,
    placeholderForm: RegExp,
    substringData: internSubstringsHandling[]
  ): code {
    return code.replace(
      placeholderForm, // everything in the specified format
      (
        placeholder // for every substring inside the main string
      ) =>
        substringData.find(
          // check if substrings includes a placeholder name which is identical to the substring
          (substr) => substr.substrPlaceholder === placeholder
        )?.substrValue ?? placeholder // replace it with the value if not undefined (the first ?)
      // if undefined, replace it with itself again (the second ??)
    );
  }
}

// preprocessed source code gets down to simpler code (asm)
class CCUSCompiling {
  // get all the tokens of the code ("int" is a token and "++" too)
  static Lexer = class {};

  // get the syntax of every statement => parse tree
  static syntaxAnalyser = class {};

  // identifier table
  static semanticAnalyser = class {};

  // optimization of asm code
  static optimizer = class {
    // e.g. "x = x + 3" == "x += 3"
  };
}

// simple code (asm) gets executed
class CCUSExecuting {}

// interprets CCUS in real time
class CCUSInterpreter {}

const str = `"test""te"test"st"`;
const data = CCUSPreProcessing.extractSubstrings(str, subStringRegex, '$');
const data2 = CCUSPreProcessing.insertSubstrings(
  data.code,
  subStringPlaceholder,
  data.substrings
);
console.log(str, data, data2);
//CCUS.RunCC(CCUS.testCode);
//CCUSPreProcessing.preCompile(CCUS.testCode);
