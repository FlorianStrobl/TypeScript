interface vec2d {
  x: number;
  y: number;
}

function doIteration(field: string[][]): void {
  const toKill: vec2d[] = [];
  const toLife: vec2d[]  = [];

  for (let y = 0; y < field.length; ++y) {
    for (let x = 0; x < field[0].length; ++x) {
      const neighbours: string[] = [];
      // three upper and downer cells
      for (let i = -1; i < 2; ++i) {
        if (x + i >= 0 && x + i < field[0].length && y - 1 >= 0)
          neighbours.push(field[y - 1][x + i]);
        if (x + i >= 0 && x + i < field[0].length && y + 1 < field.length)
          neighbours.push(field[y + 1][x + i]);
      }
      // get the two sides
      if (x + 1 < field[0].length) neighbours.push(field[y][x + 1]);
      if (x - 1 >= 0) neighbours.push(field[y][x - 1]);

      const livingNeighbours = neighbours.filter((e) => e === '.').length;
      if (field[y][x] === '.') {
        // life cell
        if (livingNeighbours < 2 || livingNeighbours > 3) toKill.push({x: x, y: y});
      } else if (livingNeighbours === 3) toLife.push({x: x, y: y}) ;
    }
  }

  for (const k of toKill) field[k.y][k.x] = "#";
  for (const k of toLife) field[k.y][k.x] = ".";
}

function game(
  initialState: vec2d[],
  iterations: number = 100,
  sizeX: number = 10,
  sizeY: number = 10,
  delay: number = 1000
): void {
  let field: string[][] = new Array(sizeY)
    .fill('#'.repeat(sizeX))
    .map((e) => e.split(''));

  for (const state of initialState)
    if (
      Number.isInteger(state.y) &&
      Number.isInteger(state.x) &&
      state.y < sizeY &&
      state.x < sizeX
    )
      field[state.y][state.x] = '.';

  const int = setInterval(() => {
    console.clear();
    console.log(field.map((e) => e.join('')).join('\n'));
    console.log('iterations to go: %d', iterations);
    doIteration(field);
    if (--iterations <= 0) clearInterval(int); // break after iterations
  }, delay);
}

// stable
const block = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 }
];

// stable
const beehive = [
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 3, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 2 }
];

// oscillator (cycle 2)
const line = [
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 }
];

// oscilator (cycle 15)
const Pentadecathlon = [
  { x: 5, y: 5 },
  { x: 6, y: 5 },
  { x: 7, y: 5 },
  { x: 5, y: 6 },
  { x: 7, y: 6 },
  { x: 5, y: 7 },
  { x: 6, y: 7 },
  { x: 7, y: 7 },
  { x: 5, y: 8 },
  { x: 6, y: 8 },
  { x: 7, y: 8 },
  { x: 5, y: 9 },
  { x: 6, y: 9 },
  { x: 7, y: 9 },
  { x: 5, y: 10 },
  { x: 6, y: 10 },
  { x: 7, y: 10 },
  { x: 5, y: 11 },
  { x: 7, y: 11 },
  { x: 5, y: 12 },
  { x: 6, y: 12 },
  { x: 7, y: 12 }
];

// spaceship
const spaceShip = [
  { x: 1, y: 0 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 }
];

game(line, 100, 15, 20, 500);
