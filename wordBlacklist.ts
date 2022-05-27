namespace Blacklist {
  /**
   * TODO check prob for this case
   * Blacklist: "fuck"
   * Input: "fricking"
   * Percent: 100% (standart) - charsBetween (ri) * 2 - charsMissing (u) * 1 - notEnd = 20% bad
   */
  // TODO inside of a word differently (start+end)?
  const probDecrease: { [key: string]: number } = {
    charsBetween: 10, // ac -> abc
    charsMissing: 20 // abc -> ac
    //notStart: 20, // bc -> abc
    //notEnd: 20, // ab -> abc
    //charReplace: 5    // abc -> acc
    //swappedChars: 30, // ab -> ba TODO
  };

  export function wordBlacklist(
    message: string,
    blacklist: string[]
  ):
    | { bad: false }
    | {
        bad: true;
        blacklistWord: string;
        startPositionInMessage: number;
        probability: number;
      } {
    blacklist = blacklist.map((s) => replaceSpecialChars(s.toLowerCase()));
    message = removeInvalidChars(replaceSpecialChars(message.toLowerCase()));

    // TODO, do alternative (.include()) check: validate blacklist
    if (blacklist.some((word) => !word.match(/^[a-z0-9]+$/g)))
      throw new Error(
        '[Word blacklist]: Invalid word in the blacklist (allowed characters: 0-9 and a-z)'
      );

    // search for a bad word in the message
    for (const badWord of blacklist) {
      const answer = findBadWord(badWord, message);

      if (answer !== false) return answer; // found a bad word
    }

    // no bad word was found above
    return { bad: false };

    // TODO "aaa+" => "aa"
    function replaceSpecialChars(s: string): string {
      // TODO, æ, numbers
      const characters: { char: string; aliases: string[] }[] = [
        { char: 'a', aliases: 'âäàáåãª@4'.split('') },
        { char: 'b', aliases: ['8'] },
        { char: 'c', aliases: ['ç', '¢'] },
        { char: 'e', aliases: 'éêëè€3'.split('') },
        { char: 'f', aliases: ['ƒ'] },
        { char: 'i', aliases: 'ïîìíı'.split('') },
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

  export function findBadWord(
    badWord: string,
    msg: string
  ):
    | false
    | {
        bad: true;
        blacklistWord: string;
        startPositionInMessage: number;
        probability: number;
      } {
    // code

    let indexesOfSameChars: number[] = [];
    for (let i = 0; i < msg.length; ++i)
      if (badWord.includes(msg[i])) indexesOfSameChars.push(i);

    console.log(
      'Badword: ' + badWord + '\nMessage: ' + msg + '\nNotifications:\n'
    );

    // TODO
    /**
     * notStart, notEnd
     *
     * charsBetween
     * charsMissing, charReplace
     */
    let charsInCorrectOrder: string = '';
    let indexOfBadWord: number = 0;
    let curProbability = 100;
    for (let i = 0; i < indexesOfSameChars.length; ++i) {
      const curCharIndex: number = indexesOfSameChars[i];
      const curChar: string = msg[curCharIndex];

      if (curChar === badWord[indexOfBadWord]) {
        // started word
        indexOfBadWord++;
        if (indexOfBadWord === badWord.length) {
          // finish
          console.log('\nFINSIH', curProbability, badWord, curCharIndex + '\n');
        }
      } else if (curChar === badWord[indexOfBadWord + 1]) {
        if (indexOfBadWord === 0) {
          // check word wasnt checked yet
        }
        // "same char" next one
        indexOfBadWord++; // on the same page
        indexOfBadWord++; // next one as usual
        //console.log('same char next one', curChar, curCharIndex);
      } else if (indexOfBadWord !== 0) {
        // "same char" in between
        //console.log('same char (or in theory any other char) in between', curChar, curCharIndex);
        // TODO, do that later: curProbability -= probDecrease.charsBetween;
      } else {
        indexOfBadWord = 0;
        curProbability = 100;
      }
    }

    //return false;

    return {
      bad: true,
      blacklistWord: badWord,
      startPositionInMessage: -1,
      probability: -1
    };
  }

  /**
   * // do at the end
   * notStart // bc -> abc
   * notEnd // ab -> abc
   *
   * // do while
   * charsBetween // ac -> abc
   *
   * charsMissing // abc -> ac
   *
   *
   * TODO, isnt it just a mix between between and missing?
   * charReplace // abc -> acc
   * "fuck" - "fricking": "r" between, "i" replace for "u"
   */
  export function findBadWord2(
    badWord: string,
    msg: string
  ):
    | false
    | {
        bad: true;
        blacklistWord: string;
        startPositionInMessage: number;
        probability: number;
      } {
    // code

    // bad word index
    let bI: number = 0;
    let startSearchingWord: boolean = false;
    let prob: number = 100; // the probability that it is the bad word
    for (let i = 0; i < msg.length; ++i) {
      // current message char
      const char: string = msg[i];
      // bad word char
      const bChar: string = badWord[bI];

      // if (char === ' ') {
      //   // whitespace/other character, ignore
      // } else
      if (char === bChar) {
        startSearchingWord = true; // could be the start of the bad word inside the message
        bI++;
        console.log(char, i);
        if (bI === badWord.length) {
          // did go through all the characters and it was 1 to 1 the bad word
          console.log('\nEND\n');
          return {
            bad: true,
            blacklistWord: badWord,
            startPositionInMessage: -1,
            probability: prob
          };
        }
      } else if (startSearchingWord) {
        // the bad word was started but here not finished
        // reset values
        startSearchingWord = false;
        bI = 0;
        prob = 100;
      }
    }

    console.log('\nEND\n');
    return false;
  }

  // console.time();
  // console.log(
  //   wordBlacklist(
  //     (() => {
  //       let str: string = '';
  //       for (let i = 0; i < 100; ++i)
  //         str = str.concat((Math.random() * 100).toString());
  //       return str;
  //     })(),
  //     new Array(10000).fill(0).map((e) => {
  //       let str: string = '';
  //       for (let i = 0; i < 10; ++i)
  //         str = str.concat((Math.random() * 100).toString());
  //       str = str.replace(/(\.| )/g, '');
  //       return str;
  //     })
  //   )
  // );
  // console.timeEnd();

  //const defaultCharactesr: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  //const symbols: string = ',.!?:;_\'"`´(){}[]<>+-*/=^~|¦%#&\\ ¿¡«»';
  //const whitespaces: string = '\n\t\r\v\f ';

  // blacklist word match with substr:
  // space every char space: 100% bad

  // every char space x%
  // space every char x%

  // every char y%
}

//TODO "foc" for "foeck"

// console.log(
//   Blacklist.wordBlacklist('tëstf  34 .. fo. ck  f wo!rd ', ['f¤ëck', 'Hëÿ¶×'])
// );

// word: abcbd
// msg: acbd

console.log(
  Blacklist.findBadWord2(
    'abcd',
    // 1   0  0  1  0   1    1   1     0  0  0   1      1  0 0     1        1      1
    'abcd fk sh ad ue abbcd acd afd   ja avc k labcdl bbcd c b  aabbccdd  acbd  aabbccdd'
  )
);

function test(word: string, msg: string) {
  // 1 to 1
  // missing char
  // added char
  let prob: number = 100;
  let wordI: number = 0;
  //start index + end index
  for (let i = 0; i < msg.length; ++i) {
    const char: string = msg[i];
    if (char === word[wordI]) {
      wordI++;
      // character is exactly what it should be
    } else if (char !== word[wordI]) {
      prob -= 20; // missing char
      wordI++;
    }

    if (wordI === word.length) {
      // finished, found word
    }
  }
}
