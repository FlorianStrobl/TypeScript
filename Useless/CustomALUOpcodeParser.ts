// You give the function ALU() an input like "5 + 5" and it will return you the OP code for an ALU I build
// This is for everyone, besides me, useless because I'm the only one who has this very specific ALU with these OP Codes...

const operations: { [str: string]: string } = {
  '': '0000',
  a: '0001',
  not: '1001',
  and: '0100',
  or: '0101',
  xor: '0110',
  '+': '0111',
  '-': '1111'
};

type OP = '' | 'a' | 'not' | 'and' | 'or' | 'xor' | '+' | '-';

export function ALU(input: string): {
  input: string;
  code: string;
  operation: string;
  output: number | null;
  outputBinary: string;
  isTooBig: string;
} {
  let operation: OP = '';
  // format input
  input = input.toLowerCase();
  while (input.includes(' ')) input = input.replace(' ', '');

  // console.log('Formated input was: ' + input);

  // set operation
  if (input === '') operation = '';
  else if (input.includes('not')) operation = 'not';
  else if (input.includes('and')) operation = 'and';
  else if (input.includes('or') && !input.includes('xor')) operation = 'or';
  else if (input.includes('xor')) operation = 'xor';
  else if (input.includes('+')) operation = '+';
  else if (input.includes('-')) operation = '-';
  else if (input.length >= 1) operation = 'a';
  else
    return {
      input: 'ERROR',
      code: 'ERROR',
      operation: 'ERROR',
      output: null,
      outputBinary: 'ERROR',
      isTooBig: 'ERROR'
    };

  // console.log('Detected operation was: ' + operation);

  // get input string with only numbers
  let inputWithoutOp = input;
  while (inputWithoutOp.includes(operation) && operation !== '')
    inputWithoutOp = inputWithoutOp.replace(operation, ' ');

  // get the outputs
  const Numbers = GetNumbers(inputWithoutOp);
  // console.log('Detected numbers were: ' + Numbers.toString());
  const code = BinaryCode(operation, Numbers);
  const result = GetResult(operation, Numbers);
  const outputBinary = DecimalToBinary(result);

  // check if the number is too big pt1
  let tooBig = '';
  for (let n of Numbers) if ((n ?? 0) > 15) tooBig += n + 'sep';
  if (result > 15) tooBig += result + 'sep';

  let tooBigString = '';
  // check if number is too big pt2
  if (tooBig.length !== 0) {
    let tooBigNumbers = tooBig.split('sep');

    // only numbers
    for (let i = 0; i < tooBigNumbers.length; ++i)
      if (tooBigNumbers[i] === '') tooBigNumbers.splice(i, 1);

    if (tooBigNumbers.length === 1)
      tooBigString += `A number was too big! The number is: ${tooBigNumbers[0]}.`;
    else {
      tooBigString += 'Too big numbers! The numbers are: ';
      // fancy message
      for (let i = 0; i < tooBigNumbers.length; ++i) {
        if (i < tooBigNumbers.length - 2)
          tooBigString += tooBigNumbers[i] + ', ';
        else if (i < tooBigNumbers.length - 1) tooBigString += tooBigNumbers[i];
        else if (i === tooBigNumbers.length - 1)
          tooBigString += ' and ' + tooBigNumbers[i] + '.';
      }
    }
  }

  // format output
  let _input = '';
  if (operation === '') _input = 'No input';
  else if (operation === 'a') _input = Numbers[0]! + '';
  else if (operation === 'not') _input = 'not ' + Numbers[0]!;
  else _input = Numbers[0]! + ' ' + operation + ' ' + Numbers[1]!;

  return {
    input: _input,
    code: code,
    operation: operation,
    output: result,
    outputBinary: outputBinary,
    isTooBig: tooBigString
  };

  function BinaryCode(operation: OP, Numbers: (number | null)[] | null) {
    const out: string =
      DecimalToBinary(Numbers![0] ?? 0) +
      ' ' +
      DecimalToBinary(Numbers![1] ?? 0) +
      ' ';

    return out + operations[operation];
  }

  function GetResult(operation: OP, Numbers?: (number | null)[]) {
    const A = Numbers![0]!;
    const B = Numbers![1] ?? 0;

    switch (operation) {
      case '':
        return 0;
      case 'a':
        return A;
      case 'not':
        let binary = DecimalToBinary(A);
        // invert binarys
        let invertedBinary = '';
        for (let bit of binary) invertedBinary += bit === '0' ? 1 : 0;
        return parseInt(invertedBinary, 2);
      case 'and':
        return A & B;
      case 'or':
        return A | B;
      case 'xor':
        return A ^ B;
      case '+':
        return A + B;
      case '-':
        return A - B;
    }
  }

  function GetNumbers(input: string) {
    let numbers: (number | null)[] = [];

    // get all the numbers
    for (const string of input.split(' '))
      if (string !== '') numbers.push(parseInt(string));

    // fill up w/ null
    while (numbers.length < 2) numbers.push(null);

    // only abs(x)
    for (const n of numbers)
      if ((n ?? '').toString().startsWith('-'))
        numbers[numbers.indexOf(n)] = Math.abs(n!);

    return numbers;
  }

  function DecimalToBinary(n: number) {
    let binary = n.toString(2);
    while (binary.length < 4) binary = '0' + binary;
    return binary;
  }
}
