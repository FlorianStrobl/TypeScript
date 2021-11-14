/**
 * NxM field with:
 *  - 1x start field (s)
 *  - 1x end field (e)
 *  - Ax wall fields (w)
 *  - Bx transparent wall fields (sw)
 *
 * Goal: find shortest way from start field (s) to end field (e),
 * without crashing into walls.
 * Start field can be inside a transparent wall.
 *
 * Every field gets a G and a H cost, which combined is called F cost.
 * G cost: cost from starting field to current field
 * H cost: cost from current field to end field (heuristic, only an approximation)
 * F cost: G cost + H cost
 *
 * The algorithm starts with a field/node and calculates
 * for all traversable fields (e and n fields) around it their G and H cost.
 * The costs and the field from which we started get saved to
 * each field individualy. If the total cost of a field
 * was already saved with different values before,
 * it will overwrite it if the new F cost is smaller than the old F cost.
 * This field gets marked as explored/traversed.
 *
 * It gets the non explored node with the lowest F cost and combines it with the previous node
 * in a new graph. If the field was already combined with a node,
 * it will combine it if and only if it is more cost efficient.
 */

namespace AStar {
  // #region types
  type cost = number;
  type field = number;
  interface Vector2d {
    x: field;
    y: field;
  }
  interface Field {
    coords: Vector2d; // const
    value: field; // const
    hCost: cost; // const

    originCoords: Vector2d; // var
    gCost: cost; // var

    explored: boolean; // var
  }
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
  const fieldXLength: number = 19;
  const fieldYLength: number = 10;

  const startField: Vector2d = { x: 4, y: 2 };
  const endField: Vector2d = { x: 5, y: 7 };

  // initialize the field with these settings
  const fieldSettings: Vector2d[][] = [
    [startField, { x: s, y: -1 }],
    [endField, { x: e, y: -1 }]
  ];

  export const fields: Field[][] = [];
  for (let y = 0; y < fieldYLength; ++y) {
    fields.push([]);
    for (let x = 0; x < fieldXLength; ++x) {
      let value = n;
      // special fields, specified in field settings
      for (let i = 0; i < fieldSettings.length; ++i)
        if (fieldSettings[i][0].x === x && fieldSettings[i][0].y === y)
          value = fieldSettings[i][1].x;

      fields[y].push({
        coords: { x: x, y: y },
        value: value,
        hCost: infinity,
        gCost: infinity,
        originCoords: { x: -1, y: -1 },
        explored: false
      });
    }
  }

  // the main field
  export const mainField: field[][] = generateGameField(
    fieldXLength,
    fieldYLength,
    fieldSettings
  );

  export const workField: (null | Field)[] = [];
  for (let i = 0; i < fieldXLength * fieldYLength; ++i) workField.push(null);

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
    _field: field[][] = mainField,
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
    const fieldValue: field = mainField[position.y][position.x];

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
        const fieldVal: field = mainField[fd.y][fd.x];
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

  function test(f: Vector2d) {
    function neightbourFiels(x: Vector2d): void {
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

      for (const nF of toExploreFields) {
        // value of current field
        const fieldValue: field = mainField[x.x + nF.x][x.y + nF.y];
        // infos of current field
        const fieldInfos: Field | null =
          workField[(x.y + nF.y) * fieldXLength + (x.x + nF.x)];

        if (fieldInfos === null || fieldInfos.gCost + fieldInfos.hCost < 0) {
          workField[(x.y + nF.y) * fieldXLength + (x.x + nF.x)] = {
            coords: nF,
            originCoords: x,
            explored: true,
            gCost: 0,
            hCost: 0,
            value: fieldValue
          };
        }
      }
    }
  }

  function foundWay(endFieldPosition: Vector2d): Vector2d[] {
    return [];
  }
  // #endregion

  export function aStarSolve(): void {
    calculateAllHCost();

    expFlds(startField);

    //while (true) {
    //  const cheapestField: Vector2d = searchCheapestField();
    //  if (expFlds(cheapestField, cheapestField, { x: 0, y: -1 })) break;
    //}
  }

  function expFlds(coords: Vector2d): boolean {
    // cost.x is the current g cost for the coords field

    const neighbourFields: Vector2d[] = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 }
    ];

    // value of current field
    const field: Field = fields[coords.y][coords.x];

    // field.value; constant
    // field.coords; constant
    // field.hCost; constant

    // field.originCoords; variable
    // field.gCost; variable

    // field.explored; variable

    // start field, wall, small wall (sw has to be handlet differently later)
    if (field.value === s || field.value === w || field.value === sw)
      return false;
    else if (field.value === e) {
      // end field
      return true;
    } else if (field.value === n) {
      // normal field
      // update values for all neighbour fields
      // which are now cheaper with this as new origin
      return false;
    }

    return false;
  }

  function updateFieldValues(
    coords: Vector2d,
    origin: Vector2d,
    gCost: cost,
    hCost: cost
  ): void {}

  function searchCheapestField(): Vector2d {
    return { x: 0, y: 0 };
  }

  function calculateAllHCost(): void {
    for (let y = 0; y < fieldYLength; ++y) {
      for (let x = 0; x < fieldXLength; ++x) {
        // TODO
        fields[y][x].hCost =
          Math.abs(endField.x - x) + Math.abs(endField.y - y);
      }
    }
  }
}

//console.log(AStar.showField(AStar.hCost));
//AStar.solveMaze();

console.log(AStar.showField());
AStar.aStarSolve();
