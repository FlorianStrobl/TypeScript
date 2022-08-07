// @ts-ignore
import * as logg from './logtest';

namespace findWord {
  interface wordPosition {
    matchedWord: string;
    rawMatch: string;
    index: number;
    probability: number;
    checkedString: string; // the filtered string
  }

  // obfuscating the word
  // const probabilityDecrease: { [key: string]: number } = {
  //   //notStart: 20,     // bc -> abc
  //   //notEnd: 20,       // ab -> abc
  //   charsMissing: 20, // abc -> ac
  //   charsInbetween: 10 // ac -> abc
  //   //charReplace: 5    // abc -> acc
  //   //swappedChars: 30, // ab -> ba
  // };

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

    for (const word of wordlist) {
      let answers: wordPosition[] = [];
      for (let i = 0; i < text.length; ++i) {
        // go through each char of the text

        // start at -50% of the word from curChar
        // and go until +50% of the word from curChar
        for (
          let y = Math.floor(word.length * 0.5);
          y <= Math.ceil(word.length * 1.5) && i + y <= text.length;
          ++y
        )
          answers.push(findWord(text.slice(i, i + y), word, i));

        answers = answers
          .filter((e) => e !== null)
          .map((e) => {
            e.checkedString = text; // add the used string
            return e;
          });
      }

      foundWords.push(...answers);
    }

    // remove double findings of a word,
    // by getting all the ones with the same flagged word
    // and the same overlapping index + checking for the highest probability

    // group them by flagged words
    const foundWordsByName: { [word: string]: wordPosition[] } = {};
    for (const entry of foundWords.values())
      (foundWordsByName[entry.matchedWord] ||= []).push(entry);

    Object.keys(foundWordsByName).map(
      (key) =>
        (foundWordsByName[key] = foundWordsByName[key].sort(
          (a, b) => a.probability - b.probability
        ))
    );

    return removeDuplicates(foundWordsByName);
  }

  function findWord(
    text: string,
    word: string,
    index: number
  ): wordPosition | null {
    const array = new Array(1000);
    const characterCodeCache = new Array(1000);

    // @ts-ignore
    const ans: wordPosition = {
      matchedWord: word,
      rawMatch: text,
      index: index,
      probability: leven(text, word)
    };

    // TODO, is 30% a good choice?
    if (word.length * 0.3 >= ans.probability) {
      return ans;
    } else return null;

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
        first.charCodeAt(firstLength - 1) ===
          second.charCodeAt(secondLength - 1)
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

  export function normaliseText(text: string): string {
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

  function removeDuplicates(foundWordsByName: {
    [word: string]: wordPosition[];
  }) {
    const results: wordPosition[] = [];

    // remove values which are the same word and overlapp with another instance of that same word
    // at the SAME overlapping index but with lower probabilty
    for (const word in foundWordsByName) {
      const toRemoveFlagsIndexes: number[] = [];
      let workingFlags: wordPosition[] = foundWordsByName[word];

      for (let i = 0; i < workingFlags.length; ++i) {
        const current: wordPosition = workingFlags[i];

        if (
          workingFlags.some((value, index) => {
            if (index === i) return false; // if we are talking about the same flag, we shoudlnt do something

            // check if we are talking about the same substring
            const overlapps: boolean =
              (current.index >= value.index &&
                current.index <=
                  value.index +
                    value.rawMatch
                      .length) /*overlap by start index in between*/ ||
              (current.index + current.rawMatch.length >= value.index &&
                current.index + current.rawMatch.length <=
                  value.index +
                    value.rawMatch
                      .length) /*overlap by end index in between*/ ||
              (current.index <= value.index &&
                current.index + current.rawMatch.length >=
                  value.index +
                    value.rawMatch
                      .length); /*overlap by both start and end outside*/

            // console.log(
            //   current.index,
            //   value.index,
            //   overlapps,
            //   current.probability < value.probability
            // );
            return (
              overlapps && // its the same substring we are talking about
              current.probability > value.probability // current probability is higher than one alternative
              // case: "tesl", "tes" is one off, but "tesl" aswell
              // case: "lest", "est" and "lest" are one off
            );
          })
        )
          toRemoveFlagsIndexes.push(i);
      }

      // "return" all the values for this word without the duplicated (the ones in "toRemoveIndexes")
      results.push(
        ...workingFlags.filter(
          (_, index) => !toRemoveFlagsIndexes.includes(index)
        )
      );
    }

    return results;
  }
}

// TODO, fix "acbd", "abbcd", "zbcd", "abcz", "abcbd", "aabbccdd", 

// TODO, test it with rust message type styl!!

//' testtest this lest is a tesl sentence with b@ddww0rd t€st',
//  ['badword', 'test'];

// 'abcd  zabcd  abcdz  acd  abzcd  abzd  acbd abcdabcd bacd zbcd abcz aabcd abcdd abbcd aabbccdd aaabbbcccddd aaabcccd abcbd | accd'
//console.log(
findWord
  .checkForWord(
    'abcd  zabcd  abcdz  acd  abzcd  abzd  acbd abcdabcd bacd zbcd abcz aabcd abcdd abbcd aabbccdd aaabbbcccddd aaabcccd abcbd | accd',
    ['abcd']
  )
  .sort((a, b) => a.index - b.index)
  .forEach((res) => {
    logg.logger.logInfo(
      { author: '', fileName: '' },
      findWord.normaliseText(
        'abcd  zabcd  abcdz  acd  abzcd  abzd  acbd abcdabcd bacd zbcd abcz aabcd abcdd abbcd aabbccdd aaabbbcccddd aaabcccd abcbd | accd'
      ),
      [
        {
          index: res.index,
          length: res.rawMatch.length,
          markColor: 1,
          message: `Matched the word "abcd" with the substring "${
            res.rawMatch
          }". The probability of a correct match is ${
            (4 - res.probability) / 4
          }`,
          infoCode: 'none',
          infoType: 'warning',
          infoDescription: ''
        }
      ],
      true
    );
  });

//);

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
