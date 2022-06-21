namespace findWord {
  interface wordPosition {
    matchedWord: string;
    rawMatch: string;
    index: number;
    length: number;
    probability: number;
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

  // letter allisases
  const characters: { char: string; aliases: string[] }[] = [
    { char: 'a', aliases: 'âäàáåãªæ@4'.split('') },
    { char: 'b', aliases: '8'.split('') },
    { char: 'c', aliases: 'ç¢'.split('') },
    { char: 'e', aliases: 'éêëè€3'.split('') },
    { char: 'f', aliases: 'ƒ'.split('') },
    { char: 'i', aliases: 'ïîìíı!1'.split('') },
    { char: 'l', aliases: '£'.split('') },
    { char: 'n', aliases: 'ñ'.split('') },
    { char: 'o', aliases: 'ôöòóõø¤ðº0'.split('') },
    { char: 'p', aliases: '¶'.split('') },
    { char: 's', aliases: '$ß§5'.split('') },
    { char: 't', aliases: '7'.split('') },
    { char: 'u', aliases: 'ûüùúµ'.split('') },
    { char: 'x', aliases: '×'.split('') },
    { char: 'y', aliases: 'ÿý¥'.split('') }
  ];

  export function checkForWord(
    text: string,
    wordlist: string[]
  ): wordPosition[] {
    text = normaliseText(text);
    wordlist = wordlist.map((word) => normaliseText(word).replace(/ /g, ''));

    const foundWords: wordPosition[] = [];

    for (const word of wordlist)
      for (let i = 0; i < text.length; ++i) {
        const ans: wordPosition | null = findWord(
          text.slice(i, word.length),
          word
        );
        if (ans !== null) foundWords.push(ans);
      }

    console.log('The found words: ', foundWords);

    // remove double findings of a word,
    // by getting all the ones with the same flagged word
    // and the same overlapping index + checking for the highest probability

    // group them by flagged words
    const foundWordsByName: { [word: string]: wordPosition[] } = {};
    for (const entry of foundWords.values())
      (foundWordsByName[entry.matchedWord] ||= []).push(entry);

    //for (const foundWord of foundWords)
    //  if (!Object.keys(foundWordsByName).includes(foundWord.matchedWord))
    //    foundWordsByName[foundWord.matchedWord] = [foundWord]; // add this word
    //  else foundWordsByName[foundWord.matchedWord].push(foundWord); // push this word as it exists already

    // sort the groups by probability, NOT NEEDED
    // for (const word of Object.keys(foundWordsByName))
    //   foundWordsByName[word] = foundWordsByName[word].sort(
    //     (w1, w2) => w2.probability - w1.probability
    //   );

    // TODO DEBUG
    // for (const key in foundWordsByName)
    //   for (let i = 0; i < foundWordsByName[key].length; ++i)
    //     if (foundWordsByName[key][i].probability === 70) {
    //       foundWordsByName[key][i].index = -1;
    //       foundWordsByName[key][i].length = -1;
    //     }

    const answer: wordPosition[] = [];

    // remove values which are the same word and overlapp with another instance of that same word
    // at the SAME overlapping index but with lower probabilty
    for (const word in foundWordsByName) {
      let workingFlags: wordPosition[] = foundWordsByName[word];
      const toRemoveIndexes: number[] = [];

      for (let i = 0; i < workingFlags.length; ++i) {
        const current: wordPosition = workingFlags[i];

        if (
          workingFlags.some((value, index) => {
            const overlapps: boolean =
              (current.index >= value.index &&
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
                    value.length); /*overlap by both start and end outside*/
            return (
              index !== i &&
              current.probability < value.probability &&
              overlapps
            );
          })
        )
          toRemoveIndexes.push(i);
      }

      // "return" all the values for this word without the duplicated (the ones in "toRemoveIndexes")
      answer.push(
        ...workingFlags.filter((v, index) => !toRemoveIndexes.includes(index))
      );
    }

    return answer;
  }

  function normaliseText(text: string): string {
    return text
      .toLowerCase() // lower case
      .split('')
      .map((char) => {
        //return char; // TODO
        let ans: string = char;
        characters.forEach((c) => {
          if (c.aliases.includes(char)) ans = c.char; // replace alliases
        });
        const ret = !ans.match(/a-z0-9/) ? ans : ' ';
        return ret; // only letters and numbers
      })
      .join('')
      .replace(/(.)\1\1+/g, '$1$1'); // "aaa+" => "aa", up to 2 repeating characters
  }

  function findWord(text: string, word: string): wordPosition | null {
    const array = new Array(1000);
    const characterCodeCache = new Array(1000);

    const ans: wordPosition = {
      matchedWord: word,
      rawMatch: text,
      index: -1,
      length: -1,
      probability: leven(text, word)
    };

    if (ans.probability !== 0) return null;
    else return ans;

    function leven(first: string, second: string): number {
      if (first === second) return 0; // is the same

      // Swapping the strings if `a` is longer than `b` so we know which one is the
      // shortest & which one is the longest
      if (first.length > second.length) {
        const swap: string = first;
        first = second;
        second = swap;
      }

      let firstLength: number = first.length;
      let secondLength: number = second.length;

      // Performing suffix trimming:
      // We can linearly drop suffix common to both strings since they
      // don't increase distance at all
      // Note: `~-` is the bitwise way to perform a `- 1` operation
      while (
        firstLength > 0 &&
        first.charCodeAt(~-firstLength) === second.charCodeAt(~-secondLength)
      ) {
        firstLength--;
        secondLength--;
      }

      // Performing prefix trimming
      // We can linearly drop prefix common to both strings since they
      // don't increase distance at all
      let start: number = 0;

      while (
        start < firstLength &&
        first.charCodeAt(start) === second.charCodeAt(start)
      ) {
        start++;
      }

      firstLength -= start;
      secondLength -= start;

      if (firstLength === 0) return secondLength;

      let bCharacterCode: number = 0;
      let result: number = 0;
      let temporary: number = 0;
      let temporary2: number = 0;
      let index = 0;
      let index2 = 0;

      while (index < firstLength) {
        characterCodeCache[index] = first.charCodeAt(start + index);
        array[index] = ++index;
      }

      while (index2 < secondLength) {
        bCharacterCode = second.charCodeAt(start + index2);
        temporary = index2++;
        result = index2;

        for (index = 0; index < firstLength; index++) {
          temporary2 =
            bCharacterCode === characterCodeCache[index]
              ? temporary
              : temporary + 1;
          temporary = array[index];
          // eslint-disable-next-line no-multi-assign
          result = array[index] =
            temporary > result
              ? temporary2 > result
                ? result + 1
                : temporary2
              : temporary2 > temporary
              ? temporary + 1
              : temporary2;
        }
      }

      return result;
    }
  }

  /*
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
        matchedWord: word,
        index: index,
        length: foundIndex - index,
        probability: probabilty,
        rawMatch: originalText.slice(index, foundIndex)
      };
    else return null;
  }*/
}

// "abcd  zabcd  abcdz  acd  abzcd  abzd  acbd  |  accd"
console.log(findWord.checkForWord('  zz@bcdzz  zzabcdzz  ', ['abcd']));
