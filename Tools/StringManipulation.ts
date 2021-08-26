export namespace StringManipulation {
  export function repeat(string: string, count: number = 0): string {
    let answer: string = '';
    for (let i = 0; i < count; ++i) answer += string;
    return answer;
  }

  export function replaceAt(
    string: string,
    char: string,
    index: number = 0
  ): string {
    return string.substring(0, index) + char + string.substring(index + 1);
  }

  export function insertAt(
    string: string,
    char: string,
    index: number = 0
  ): string {
    return string.substring(0, index) + char + string.substring(index);
  }

  export function slice(
    string: string,
    start: number = 0,
    end?: number
  ): string {
    return string.slice(start, end);
  }
}
