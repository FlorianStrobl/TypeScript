/**
 * NxM field with:
 *  - 1x start field
 *  - 1x end field
 *  - Ax wall fields
 *  - Bx transparent wall fields
 *
 * Goal: find shortest way from start field (s) to end field (e),
 * without crashing into walls.
 * Start field can be inside a transparent wall.
 *
 * Every field gets a G and a H cost, which combined are called C cost.
 * G cost: cost from starting field to current field
 * H cost: cost from current field to end field
 * C cost: G cost + H cost
 */

namespace AStar {
  // #region types
  type cost = number;
  type field = number;
  interface Vector2d {
    x: field;
    y: field;
  }
  // #endregion

  // #region length of the field
  const fieldXLength: number = 19;
  const fieldYLength: number = 10;
  // #endregion

  // #region number alias
  const infinity: cost = 9999999999;

  const n: field = 0; // nothing
  const s: field = 1; // start point number
  const e: field = 2; // end end number
  const w: field = 3; // wall number
  const sw: field = 4; // small wall number (walls where you shouldn't be, but can)
  const p: field = -1; // path number
  // #endregion

  // #region Field variables
  const startField: Vector2d = { x: 4, y: 2 };
  const endField: Vector2d = { x: 5, y: 7 };
  // settings of the field
  const fieldSettings: Vector2d[][] = [
    [startField, { x: s, y: -1 }],
    [endField, { x: e, y: -1 }]
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
  export const currentWayFields: Vector2d[][] = [];
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
        newField[coords.y][coords.x] = num;
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
  export function solveMaze(): void {
    const ans: Vector2d | undefined = cheapestNearField(
      startField,
      startField,
      {
        x: 0,
        y: -1
      }
    );

    if (ans === undefined) {
      console.log('No way found!');
    } else {
      console.log('Found way!');
    }
  }

  function cheapestNearField(
    position: Vector2d,
    origin: Vector2d,
    currentGCost: Vector2d
  ): undefined | Vector2d {
    // value of the searched field
    const fieldValue: field = field[position.y][position.x];

    //// check if already traversed and skip it if so
    //if (opendFields.some((v) => v.x === x && v.y === y)) continue;

    switch (fieldValue) {
      case e:
        // found end and shortest path
        addCurrentWayFields();
        foundWay(position);
        return position;
      case n:
        // normal field, start exploring the neighbour fields
        addCurrentWayFields();
        const bestNeighbourField: Vector2d = exploreNeighbours();
        if (bestNeighbourField.x === -1) return undefined;
        // TODO, GCost
        else
          return cheapestNearField(bestNeighbourField, position, {
            x:
              calcPos1ToPos2Cost(bestNeighbourField, position) + currentGCost.x,
            y: -1
          });
      // hit a wall, return
      case w:
      case sw:
      // returned to start, just ignore
      case s:
      default:
        // error, should value should always be one of these four
        return undefined;
    }

    // find the best neighbour
    function exploreNeighbours(): Vector2d {
      const toExploreFields: Vector2d[] = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 }
      ];

      // TODO search for lowest gCost
      let cheapestField: Vector2d = { x: -1, y: -1 };
      let cheapestFieldCost: cost = infinity;
      for (const fd of toExploreFields) {
        const fieldVal: field = field[fd.y][fd.x];
        if (fieldVal === e) {
          // found end, return this
          return { x: position.x + fd.x, y: position.y + fd.y };
        } else if (fieldVal === n) {
          const fieldCost: number =
            currentGCost.x +
            1 +
            calculateHCost({ x: position.x + fd.x, y: position.y + fd.y });
          if (fieldCost < cheapestFieldCost) cheapestField = fd;
        }
      }
      // no best way found, because there is no other way
      if (cheapestField.x === -1) return cheapestField;
      return {
        x: position.x + cheapestField.x,
        y: position.y + cheapestField.y
      };
    }

    function addCurrentWayFields(): void {
      // check if position is already in array
      for (let i = 0; i < currentWayFields.length; ++i) {
        const curPoint: Vector2d[] = currentWayFields[i];

        if (curPoint[0].x === position.x && curPoint[1].y === position.y) {
          // position is already in the array

          // new way is slower
          // new way is faster

          return;
        }
      }

      // is not in the array so just add it
      currentWayFields.push([
        position,
        origin,
        { x: currentGCost.x + 1, y: 0 }
      ]);
    }

    // TODO
    function calcPos1ToPos2Cost(
      position1: Vector2d,
      position2: Vector2d
    ): cost {
      // adjasond
      if (position1.x === position2.x || position.y === position.y) return 10;
      else return 14; // diagonal
    }

    // TODO position to end field
    function calculateHCost(position: Vector2d): cost {
      return (
        Math.abs(position.x - endField.x) + Math.abs(position.y - endField.y)
      );
    }
  }

  function foundWay(endFieldPosition: Vector2d): Vector2d[] {
    return [];
  }
  // #endregion
}

console.log(AStar.showField());
//console.log(AStar.showField(AStar.hCost));
AStar.solveMaze();
