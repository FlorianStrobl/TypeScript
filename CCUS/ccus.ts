// #region types
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
  substrPlaceholderVal: string;
  substrValue: string;
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

  private getAlphanumericNames: RegExp = /\b([A-Za-z])([A-Za-z0-9])*\b/g;
  private isStringRegex: RegExp = /"((\\"|[^"])*?)"/g;
  private isDefStatement: RegExp =
    /\bdef ([a-zA-Z])([a-zA-Z0-9])* (\$?(([A-Za-z0-9]+)|("[A-Za-z0-9 ]*")))/g;
  private isUseStatement: RegExp =
    /\buse (("[a-zA-Z][a-zA-Z0-9 ]*")|(\$[0-9]+))/g;
  private subStringRegex: RegExp = /"((\\"|[^"])*?)"/g;

  private isWord = (word: string) => new RegExp(`\b${word}\b`, 'g');
  private Log = (log: any) => console.log(log);

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
    '\t' // whitesspace 2
    //'PI', // 3.1415926535897931
    //'TAU', // 6.2831853071795862
    //'E' // 2.71828
  ];

  public RunCC(
    mainFile: string,
    otherFiles?: string[],
    headers?: string[],
    settingsFile?: string
  ) {
    mainFile = this.preCompile(
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

  private callFunction(func: string, ctx: IFunctionContext): string {
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

  private preCompile(
    file: string,
    files?: { name: string; content: string }[],
    isHeader?: boolean
  ): string {
    // get all the compiled versions of the other files to use them as header files
    let preCompiledCoFiles: { name: string; content: string }[] = [];
    if (isHeader !== true)
      preCompiledCoFiles =
        files?.map((f) => ({
          name: f.name,
          content:
            // compile each map
            this.preCompile(
              f.content, // the content of it
              // every other file could be needed too
              files.filter((subfile) => subfile.name !== f.name), // not the file itself to fix recursion
              true // it's a header file TODO, header else get done twice
            )
        })) ?? [];

    // remove all strings before accessing code
    const substrHandler: {
      string: string;
      substrings: internSubstringsHandling[];
    } = this.extractSubstrings(file, '$', this.subStringRegex);
    file = substrHandler.string; // replace the file with the placeholder file
    let substrs: internSubstringsHandling[] = substrHandler.substrings; // the placeholders

    // format code and split them by line (for the rest)
    // attention: this is before the check for preCompile statements!!
    let lines: string[] = file
      .replace(/\/\/.*/g, '') // remove all comments at the end of lines TODO, make them to " "?
      .replace(/\t/g, ' ') // removes tabs
      .replace(/\n/g, ' \n ') // ensures that key words are splitted even over line ends which have no spaces
      .replace(/ +\n(\n| )+/g, ' \n') // remove double spaces splitted over lines (" \n ")
      .replace(/  +/g, ' ') // replace all double spaces (on a single line) with a single space
      .split('\n') // split the lines
      .filter((s) => s !== '' && s !== ' '); // remove empty strs in array

    let preCompileStatements: string[] = [];
    for (const line of lines) {
      // get all the use/inc and def statments
      if (!!line.match(this.isDefStatement))
        preCompileStatements.push(line.match(this.isDefStatement)![0]);
      // if (!!line.match(isUseStatement))
      //   preCompileStatements.push(line.match(isUseStatement)![0]);
    }

    let defs: { placeholderName: string; value: string }[] = []; // def statements
    let headers: string[] = []; // use/inc files
    for (const pre of preCompileStatements) {
      lines = lines
        .map((s) => s.replace(pre, '').replace(/  +/g, ' ')) // remove precompile str from the line and fix any double spaces
        .filter((s) => s !== '' && s !== ' '); // remove empty lines

      if (!!pre.match(this.isDefStatement)) {
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
      value: this.insertSubstrings(def.value, /\$\d+/g, substrs)
    }));
    headers = headers.map((header) =>
      this.insertSubstrings(header, /\$\d+/g, substrs)
    );

    // TODO def and header/use/inc

    // reinsert all the subtrings, which where removed at the beginning
    file = this.insertSubstrings(lines.join(''), /\$\d+/g, substrs);

    // insert all the defs
    file = this.insertSubstrings(
      file,
      /([a-zA-Z])([a-zA-Z0-9])*/g,
      defs.map((def) => ({
        substrPlaceholderVal: def.placeholderName,
        substrValue: def.value
      }))
    );

    // insert all the headers TODO
    // file = insertSubstrings(
    //   file,
    //   /\$\$\d+/g,
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
    this.Log(file);

    return file;
  }

  private extractSubstrings(
    string: string,
    replaceSymbol: string,
    replaceSubstringForm: RegExp
  ): {
    string: string;
    substrings: internSubstringsHandling[];
  } {
    // all the substrings
    let substrs: internSubstringsHandling[] = [];
    // keep track of the current placeholder
    let placeholderCount: number = 0;

    for (const substr of string.match(replaceSubstringForm) ?? []) {
      const alreadyExist: internSubstringsHandling | undefined = substrs.find(
        (s) => s.substrValue === substr
      );
      // search for already existing placeholder
      if (alreadyExist !== undefined) {
        string = string.replace(substr, alreadyExist.substrPlaceholderVal); // replace the string with an placeholder inside the main file
      } else {
        substrs.push({
          substrValue: substr,
          substrPlaceholderVal: replaceSymbol + placeholderCount
        }); // add the substr to the array

        string = string.replace(substr, replaceSymbol + placeholderCount); // replace the string with an placeholder inside the main file
        placeholderCount++; // inc placeholder count
      }
    }

    return { substrings: substrs, string: string };
  }

  private insertSubstrings(
    string: string,
    format: RegExp,
    substrings: internSubstringsHandling[]
  ): string {
    string = string.replace(
      format, // everything in the specified format
      (
        placeholder // for every substring inside the main string
      ) =>
        substrings.find(
          // check if substrings includes a placeholder name which is identical to the substring
          (substr) => substr.substrPlaceholderVal === placeholder
        )?.substrValue ?? placeholder // replace it with the value if not undefined (the first ?)
      // if undefined, replace it with itself again (the second ??)
    );
    return string;
  }

  // TODO, not use
  private getTopLevelFunctions(str: string): IFunction[] {
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

  private getLogicalCodeBlocks(code: string): string[] {
    let blocks: string[] = [];
    const chars: string[] = code.split('');
    for (let i = 0; i < chars.length; ++i) {
      const char: string = chars[i];
      // check if starts with keyword or ends with `;`
    }

    return blocks;
  }

  private isValidFunc(func: IFunction): Error | boolean {
    if (!this.isValidIdentifierName(func.name))
      return new Error(`The function "${func.name}" has an invalid name.`);

    for (const arg of func.args) {
      if (!this.isValidType(arg.type))
        return new Error(
          `The function "${func.name}" has an invalid type in it's arguments. Type "${arg.type}" doesn't exist.`
        );
      if (!this.isValidIdentifierName(arg.name))
        return new Error(
          `The function "${func.name}" has an invalid argument name in it's arguments. The name "${arg.name}" isn't valid.`
        );
    }

    return true;
  }

  private isValidType(str: Type | string): boolean {
    for (const type in Type) if (str === type) return true;
    return false;
  }

  private isValidIdentifierName(str: string): boolean {
    return (
      str !== '' &&
      str !== ' ' &&
      this.isAlphanumeric(str) &&
      this.isLetter(str.split('')[0]) // first letter has to be a letter
    );
  }

  private isAlphanumeric(str: string): boolean {
    return !!str.match(/^[A-Za-z0-9]+$/); // one or more chars AZaz09
  }

  private isLetter(char: string): boolean {
    return !!char.match(/[a-zA-Z]/);
  }

  // ccus test code
  public main = `
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
class CCUSPreProcessing {}

// preprocessed source code gets down to simpler code (asm)
class CCUSCompiling {
  // get all the tokens of the code ("int" is a token and "++" too)
  static Lexer = class {};

  // get the syntax of every statement => parse tree
  static syntaxAnalyser = class {};

  // identifier table
  static semanticAnalyser = class {};

  // optimization of asm code
  static optimizer = class {};
}

// simple code (asm) gets executed
class CCUSExecuting {}

try {
  const c = new CCUS();
  c.RunCC(c.main);
} catch (err) {
  console.error(err);
}
