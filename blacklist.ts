namespace findWord {
  interface wordPosition {
    word: string;
    index: number;
    length: number;
    probability: number;
    rawString: string;
  }

  // obfuscating the word
  const probabilityDecrease: { [key: string]: number } = {
    //notStart: 20,     // bc -> abc
    //notEnd: 20,       // ab -> abc
    charsMissing: 20, // abc -> ac
    charsInbetween: 10 // ac -> abc
    //charReplace: 5    // abc -> acc
    //swappedChars: 30, // ab -> ba
  };

  export function checkForWord(
    text: string,
    wordlist: string[]
  ): wordPosition[] {
    text = normaliseText(text);
    wordlist = wordlist.map((s) => normaliseText(s).replace(/ /g, ''));

    const foundWords: wordPosition[] = [];

    for (const word of wordlist)
      for (let i = 0; i < text.length; ++i) {
        const ans: wordPosition | null = findWord(text, i, word);
        if (ans !== null) foundWords.push(ans);
      }

    // remove double findings of a word,
    // by getting all the ones with the same flagged word
    // and the same overlapping index + checking for the highest probability

    // group them by flagged words
    const foundWordsByName: { [word: string]: wordPosition[] } = {};
    for (const foundWord of foundWords)
      if (!Object.keys(foundWordsByName).includes(foundWord.word))
        foundWordsByName[foundWord.word] = [foundWord];
      else foundWordsByName[foundWord.word].push(foundWord);

    // sort the groups by probability, NOT NEEDED
    // for (const word of Object.keys(foundWordsByName))
    //   foundWordsByName[word] = foundWordsByName[word].sort(
    //     (w1, w2) => w2.probability - w1.probability
    //   );

    const answer: wordPosition[] = [];

    // TODO DEBUG
    for (const key in foundWordsByName)
      for (let i = 0; i < foundWordsByName[key].length; ++i)
        if (foundWordsByName[key][i].probability === 70) {
          foundWordsByName[key][i].index = -1;
          foundWordsByName[key][i].length = -1;
        }

    // remove values which are the same word and overlapp with another instance of that same word
    // at the SAME overlapping index but with lower probabilty
    for (const word of Object.keys(foundWordsByName)) {
      let workingFlags: wordPosition[] = foundWordsByName[word];
      const toRemoveIndexes: number[] = [];

      for (let i = 0; i < workingFlags.length; ++i) {
        const current: wordPosition = workingFlags[i];

        if (
          workingFlags.some(
            (value, index) =>
              index !== i &&
              current.probability < value.probability &&
              ((current.index >= value.index &&
                current.index <=
                  value.index +
                    value.length) /*overlap by start index in between*/ ||
                (current.index + current.length >= value.index &&
                  current.index + current.length <=
                    value.index +
                      value.length) /*overlap by end index in between*/ ||
                (current.index <= value.index &&
                  current.index + current.length >=
                    value.index +
                      value.length)) /*overlap by both start and end outside*/
          )
        )
          toRemoveIndexes.push(i);
      }

      workingFlags = workingFlags.filter(
        (v, index) => !toRemoveIndexes.includes(index)
      );

      answer.push(...workingFlags);
    }

    return answer;
  }

  function normaliseText(text: string): string {
    return removeInvalidChars(replaceSpecialChars(text.toLowerCase()));

    // TODO "aaa+" => "aa"
    function replaceSpecialChars(s: string): string {
      // TODO, æ, numbers
      const characters: { char: string; aliases: string[] }[] = [
        { char: 'a', aliases: 'âäàáåãª@4'.split('') },
        { char: 'b', aliases: ['8'] },
        { char: 'c', aliases: ['ç', '¢'] },
        { char: 'e', aliases: 'éêëè€3'.split('') },
        { char: 'f', aliases: ['ƒ'] },
        { char: 'i', aliases: 'ïîìíı!'.split('') },
        { char: 'l', aliases: ['£'] },
        { char: 'n', aliases: ['ñ'] },
        { char: 'o', aliases: 'ôöòóõø¤ðº0'.split('') },
        { char: 'p', aliases: ['¶'] },
        { char: 's', aliases: '$ß§5'.split('') },
        { char: 'u', aliases: 'ûüùúµ'.split('') },
        { char: 'x', aliases: ['×'] },
        { char: 'y', aliases: 'ÿý¥'.split('') }
      ];

      // go through each character and replace it if it is inside
      // the "characters" object
      return s
        .split('')
        .map((char) => {
          let ans: string = char;
          characters.forEach((c) => {
            if (c.aliases.includes(char)) ans = c.char;
          });
          return ans;
        })
        .join('')
        .replace(/(.)\1\1+/g, '$1$1');
    }

    function removeInvalidChars(s: string): string {
      return s
        .split('')
        .map((char) => (!!char.match(/[a-z0-9]/) ? char : ' '))
        .join('');
    }
  }

  function findWord(
    text: string,
    index: number,
    word: string
  ): wordPosition | null {
    const originalText: string = text;

    text = text.slice(index);
    let found: boolean = false;
    let probabilty: number = 100;

    let foundIndex: number = -1;
    let wordIndex: number = 0;
    for (let i = 0; i < text.length; ++i) {
      const char: string = text[i];

      // TODO both at the same time!
      // charsBetween: ac -> abc
      // charsMissing: 20; // abc -> ac

      if (char === word[wordIndex]) {
        // increase to next char in the word
        if (++wordIndex >= word.length) {
          //console.log(index, i, i + index + 1, char);

          found = true;
          foundIndex = i + index + 1; // index is -1 cause length...
          break;
        }
      } else if (text[i + 1] === word[wordIndex]) {
        // probably a char inbetween
        probabilty -= probabilityDecrease.charsInbetween;
      } else if (
        word.length !== wordIndex + 1 &&
        char === word[wordIndex + 1]
      ) {
        // probably a char missing
        probabilty -= probabilityDecrease.charsMissing;
        // // go to the next char
        // if (++wordIndex >= word.length) {
        //   found = true;
        //   foundIndex = i + index + 1; // index is -1 cause length...
        //   break;
        // }
      } else {
      }
    }

    if (found === true)
      return {
        word: word,
        index: index,
        length: foundIndex - index,
        probability: probabilty,
        rawString: originalText.slice(index, foundIndex)
      };
    else return null;
  }
}

// "abcd  zabcd  abcdz  acd  abzcd  abzd  acbd  |  accd"
console.log(findWord.checkForWord('  zzabcdzz  zzabcdzz  ', ['abcd']));
