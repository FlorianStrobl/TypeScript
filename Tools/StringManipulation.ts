export namespace StringManipulation {
  export function repeat(string: string, count: number): string {
    let answer: string = '';
    for (let i = 0; i < count; ++i) answer += string;
    return answer;
  }

  export function replaceAt(
    string: string,
    char: string,
    index: number
  ): string {
    return string.substring(0, index) + char + string.substring(index + 1);
  }

  export function insertAt(
    string: string,
    char: string,
    index: number
  ): string {
    return string.substring(0, index) + char + string.substring(index);
  }
}
