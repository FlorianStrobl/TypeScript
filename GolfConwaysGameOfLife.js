function game(st /*starting state*/) {
  let f = new Array(25).fill('#'.repeat(20)).map(e => e.split(''));

  for (const s of st) f[s.y][s.x] = '.';
  let it = 100;
  const iv = setInterval(() => {
    console.clear();
    console.log(
      f.map((e) => e.join('')).join('\n'),
      '\n',
      'iterations to go:',
      it
    );
    // #region update field
    const kill = [];
    const toLive = [];

    for (let y = 0; y < f.length; ++y) {
      for (let x = 0; x < f[0].length; ++x) {
        const n = [];
        // three upper and downer cells
        for (let i = -1; i < 2; ++i) {
          if (x + i >= 0 && x + i < f[0].length && y - 1 >= 0)
            n.push(f[y - 1][x + i]);
          if (x + i >= 0 && x + i < f[0].length && y + 1 < f.length)
            n.push(f[y + 1][x + i]);
        }
        // get the two sides
        if (x + 1 < f[0].length) n.push(f[y][x + 1]);
        if (x - 1 >= 0) n.push(f[y][x - 1]);

        const lN = n.filter(e => e === '.').length;
        if (f[y][x] === '.') {
          // life cell

          if (lN < 2) kill.push([x, y]);
          if (lN > 3) kill.push([x, y]);
        } else if (lN === 3) toLive.push([x, y]);
      }
    }

    for (const k of kill) f[k[1]][k[0]] = '#';
    for (const k of toLive) f[k[1]][k[0]] = '.';
    // #endregion
    if (--it <= 0) clearInterval(iv); // break after iterations
  }, 1000);
}

// stable
const block = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 }
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

game(line);
