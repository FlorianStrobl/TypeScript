function combine(charSet: string[]): string[] {
  // base case
  if (charSet.length === 1) return charSet;

  // ["a  ", " a ", "  a"], possible places of first char
  let curCharOptions: string[] = charSet.map((_, i) =>
    new Array(charSet.length)
      .fill(() => ' ')
      .map((__, _i) => (i === _i ? charSet[0] : ' ')) // first char or space
      .join('')
  );

  let answer: string[] = [];
  for (const str of curCharOptions) {
    // fill the char with all the options it could be and at them to finishedAns
    let otherCharsOptions: string[] = combine(charSet.slice(1, charSet.length)); // recursion without the first char

    // go through each other option
    for (const curStrOption of otherCharsOptions) {
      // TODO comment
      let curStr: string[] = str.split('');
      for (const c of curStrOption) curStr[curStr.indexOf(' ')] = c;

      // push this current string to the finished list, and restart with this currentString but another curStrOption
      answer.push(curStr.join(''));
    }
  }

  return answer;
}

const vals = combine('j9f234'.split(''));
console.log(vals);

// console.log(vals.filter((e, i) => vals.indexOf(e) !== i));
