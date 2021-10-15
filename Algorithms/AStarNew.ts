namespace AStar {
  // #region types
  type cost = number;
  type field = number;
  interface Vector2d {
    x: field;
    y: field;
  }
  // #endregion

  // #region number alias
  const n: field = 0; // nothing
  const s: field = 1; // start point number
  const e: field = 2; // end end number
  const w: field = 3; // wall number
  const p: field = 4; // path number
  // #endregion

  // #region length of the field
  const fieldXLength: number = 19;
  const fieldYLength: number = 10;
  // #endregion

  // #region Field variables
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
  export const field: field[][] = generateGameField(
    fieldXLength,
    fieldYLength,
    fieldSettings
  );

  // #region costs and way
  // way cost from start field to current field
  export const gCost: cost[][] = generateGameField(
    fieldXLength,
    fieldYLength,
    undefined
  );
  // cost from the current position to the end field
  export const hCost: cost[][] = generateGameField(
    fieldXLength,
    fieldYLength,
    undefined
  );
  // #endregion
  // #endregion

  // #region Field functions
  function generateGameField(
    XLength: number = fieldXLength,
    YLength: number = fieldYLength,
    preValues?: Vector2d[][]
  ): field[][] {
    let newField: field[][] = [];

    // initialize the field with nothing
    for (let y = 0; y < YLength; ++y) {
      // for each line
      newField.push([]);
      // add a row
      for (let x = 0; x < XLength; ++x) newField[y].push(n);
    }

    if (preValues !== undefined)
      // set the field values
      for (const value of preValues) {
        let coords: Vector2d = value[0]; // coords for the value
        let num: field = value[1].x; // value for the field
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

  // #region a star solve functions
  function discoverField(pos: Vector2d): void {
    // value of the searched field
    const fieldValue: field = field[pos.y][pos.x];

    if (fieldValue === s) {
      // returned to start, just ignore
    } else if (fieldValue === e) {
      // found end and shortest way
    } else if (fieldValue === w) {
      // hit wall, return
    } else if (fieldValue === n) {
      // normal field, start exploring
    } else {
      // error, should value should always be one of these four
    }
  }
  // #endregion
}

console.log(AStar.showField());
console.log(AStar.showField(AStar.hCost));
