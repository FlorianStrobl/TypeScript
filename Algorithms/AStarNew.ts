namespace AStar {
  // types
  type field = number;
  interface Vector2d {
    x: field;
    y: field;
  }

  // number alias
  const n: field = 0; // nothing
  const s: field = 1; // start point number
  const e: field = 2; // end end number
  const w: field = 3; // wall number
  const p: field = 4; // path number

  // length of the field
  const fieldXLength: number = 19;
  const fieldYLength: number = 10;

  // settings of the field
  const fieldSettings: Vector2d[][] = [
    [
      { x: 4, y: 2 },
      { x: s, y: -1 },
    ],
    [
      { x: 5, y: 7 },
      { x: e, y: -1 },
    ],
  ];

  // the main field
  export const field: field[][] = generateGameField(fieldXLength, fieldYLength);
  // #region Field
  function generateGameField(
    XLength: number = fieldXLength,
    YLength: number = fieldYLength
  ): field[][] {
    let newField: field[][] = [];

    // initialize the field with nothing
    for (let y = 0; y < YLength; ++y) {
      // for each line
      newField.push([]);
      // add a row
      for (let x = 0; x < XLength; ++x) newField[y].push(n);
    }

    // set the field values
    for (const value of fieldSettings) {
      let coords: Vector2d = value[0];
      let num: field = value[1].x;
      newField[coords.x][coords.y] = num;
    }

    return newField;
  }

  export function showField(
    _field: field[][] = field,
    XLength: number = fieldXLength,
    YLength: number = fieldYLength
  ): string {
    let fieldString: string = 'x: ';

    // top header
    for (let i = 0; i < XLength; ++i) fieldString += i % 10;
    fieldString += '\n';

    for (let y = 0; y < YLength; ++y) {
      fieldString += (y % 10) + ': '; // row beginning
      for (let x = 0; x < XLength; ++x) fieldString += _field[y][x];
      fieldString += '\n';
    }

    return fieldString;
  }
  // #endregion
}

console.log(AStar.showField());
