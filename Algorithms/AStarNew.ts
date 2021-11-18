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
interface Vector2d {
  x: number;
  y: number;
}

namespace AStar {
  interface Field {
    coords: Vector2d; // const: coordinates of the field
    connectedCoords: Vector2d; // var: origin of the gCost field
    type: fieldType; // const: field type
    state: fieldState; // var: current explored state
    hCost: number; // const: heuristic cost from here to end
    gCost: number; // var: current cost from here to start
  }

  // #region vars
  // Number.POSITIVE_INFINITY alias
  // TODO remove
  const infinity: number = 9999999999;

  // field types
  const n: number = 0; // nothing
  const s: number = 1; // starting field
  const e: number = 2; // end field
  const w: number = 3; // wall field
  const sw: number = 4; // small wall field (walls where you shouldn't be, but can start of)

  // the type of field
  enum fieldType {
    nothing = n,
    startField = s,
    endField = e,
    wallField = w,
    smallWallField = sw
  }

  // was the field already scanned
  enum fieldState {
    nothing = 0, // didn't explore or traversed field => gCost unkown
    explored = 1, // gCost was calculated once, not sure that it is the best one
    traversed = 2 // was already explored and once the cheapest field
  }

  const fieldXLength: number = 19;
  const fieldYLength: number = 10;

  const startField: Vector2d = { x: 4, y: 2 };
  const endField: Vector2d = { x: 5, y: 7 };

  // initialize the field with these settings
  const fieldSettings: Vector2d[][] = [
    [startField, { x: s, y: -1 }],
    [endField, { x: e, y: -1 }]
  ];

  export const fields: Field[][] = doFields();
  function doFields(): Field[][] {
    let _fields: Field[][] = [];
    for (let y = 0; y < fieldYLength; ++y) {
      _fields.push([]);
      for (let x = 0; x < fieldXLength; ++x) {
        let value = n;
        // special fields, specified in field settings
        for (let i = 0; i < fieldSettings.length; ++i)
          if (fieldSettings[i][0].x === x && fieldSettings[i][0].y === y)
            value = fieldSettings[i][1].x;

        _fields[y].push({
          coords: { x: x, y: y },
          type: value,
          hCost: Math.sqrt(
            Math.abs(endField.x - x) ** 2 + Math.abs(endField.y - y) ** 2
          ),

          gCost: value === fieldType.startField ? 0 : infinity,
          connectedCoords: { x: -1, y: -1 },
          state: value === fieldType.startField ? 2 : 0 // set the start field to traversed
        });
      }
    }
    return _fields;
  }
  // #endregion

  export function pathfinding(): Vector2d[] {
    let searchDepthCounter: number = 0;
    let foundEnd: boolean = false;
    while (true) {
      // get the current cheapest field
      let currentCheapestField: Vector2d = cheapestTraversedField();
      //console.log(fields[currentCheapestField.y][currentCheapestField.x]);

      // explore the neighbour fields and search for end
      if (expFlds(currentCheapestField) === true) {
        foundEnd = true;
        break;
      }

      if (++searchDepthCounter === 10000) break;
    }

    if (foundEnd) return findPath().map((f) => f.coords);
    else return [];

    /*
    let ar = [];
    for (let y = 0; y < 19; ++y) {
      ar.push([]);
      for (let x = 0; x < 10; ++x) {
        if (
          (startField.x === x && startField.y === y) ||
          (endField.x === x && endField.y === y)
        )
          ar[y].push('#ff0000');
        else if (findPath().some((c) => c.coords.x === x && c.coords.y === y))
          ar[y].push('#ff00ff');
        else ar[y].push('#ffffff');
      }
    }
    */

    //console.log(ar);

    //console.log(
    //  _getFields((f) => f.explored === 2).map((f) => f.coords).length
    //);

    // #region private functions
    // returns the current cheapest field with an explored state bigger than 0 (was at least once traversed)
    function cheapestTraversedField(): Vector2d {
      let cheapestField: Vector2d = startField; // the current cheapest field, starts everytime with the start field
      const cheapestFCost: number = infinity;

      // only get fields with status 1
      const traversedFields: Field[] = getFields((f) => f.state === 1);

      // if the traversed field is cheaper, update it
      // TODO <= vs <
      for (const tvField of traversedFields)
        if (tvField.gCost + tvField.hCost <= cheapestFCost)
          cheapestField = tvField.coords;

      return cheapestField;
    }

    function expFlds(coords: Vector2d): boolean {
      // update current field state to traversed
      fields[coords.y][coords.x].state = 2;

      // set all its neighbour fields to explored instead of current value
      // TODO what if was already traversed
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
      //const field: Field = fields[coords.y][coords.x];

      // field.originCoords; variable
      // field.gCost; variable

      // field.explored; variable

      for (const neighbour of neighbourFields) {
        const _y: number = neighbour.y + coords.y;
        const _x: number = neighbour.x + coords.x;
        // check bounces
        if (_y < 0 || _x < 0 || _y >= fieldYLength || _x >= fieldXLength)
          continue;
        const currField: Field = fields[_y][_x];

        switch (currField.type) {
          case s:
          case w:
            // start or wall
            return false;
          case sw:
            // small wall
            return false;
          case n:
          case e:
            // normal or end
            // update field
            const curGCost: number = calculateGCost(coords, currField.coords);
            if (currField.state === 0) {
              fields[_y][_x].gCost = curGCost;
              fields[_y][_x].connectedCoords = coords;
              fields[_y][_x].state = 1;
            } else {
              // if new gCost is below old gCost, update field
              if (curGCost <= currField.gCost) {
                fields[_y][_x].gCost = curGCost;
                fields[_y][_x].connectedCoords = coords;
                fields[_y][_x].state = 1;
              }
            }
            if (currField.type === e) return true;
            break;
        }
      }

      return false;
    }

    function findPath(): Field[] {
      // check for not found path
      if (fields[endField.y][endField.x].coords.x === -1) return [];

      let path: Field[] = [];
      let lastCoords: Vector2d = endField;

      // if arived at the start field (where x is -1) break
      while (lastCoords.x !== -1) {
        // add current field to path
        path.push(fields[lastCoords.y][lastCoords.x]);
        // redirect it to the origin coords
        lastCoords = fields[lastCoords.y][lastCoords.x].connectedCoords;
      }

      return path;
    }

    function calculateGCost(
      originCoords: Vector2d,
      gotoCoords: Vector2d
    ): number {
      // TODO
      const newFactor: number = Math.sqrt(
        Math.abs(originCoords.y - gotoCoords.y) ** 2 +
          Math.abs(originCoords.x - gotoCoords.x) ** 2
      );
      return fields[originCoords.y][originCoords.x].gCost + newFactor;
    }
    // #endregion
  }

  export function draw(
    _fields: { type: fieldType }[][] = fields,
    xLength: number = fieldXLength,
    yLength: number = fieldYLength
  ): string {
    let fieldString: string = 'x: ';
    // header
    for (let i = 0; i < xLength; ++i) fieldString += i % 10;
    fieldString += '\n';

    for (let y = 0; y < yLength; ++y) {
      // row beginning
      fieldString += (y % 10) + ': ';

      // actuall field value
      for (let x = 0; x < xLength; ++x) fieldString += _fields[y][x].type;

      fieldString += '\n';
    }

    return fieldString;
  }

  export function getFields(filter: (field: Field) => boolean): Field[] {
    let fieldArray: Field[] = [];
    for (let y = 0; y < fieldYLength; ++y)
      for (let x = 0; x < fieldXLength; ++x)
        if (filter(fields[y][x])) fieldArray.push(fields[y][x]);
    return fieldArray;
  }
}

const path: Vector2d[] = AStar.pathfinding();
AStar.getFields((f) => {
  if (path.some((_f) => _f.x === f.coords.x && _f.y === f.coords.y))
    AStar.fields[f.coords.y][f.coords.x].type = 4;
  return false;
});
console.log(AStar.draw(AStar.fields));

namespace LegoRoboter {
  // motors.getAllMotorData()[0].actualSpeed: number
  // motors.getAllMotorData()[0].count: number
  // motors.getAllMotorData()[0].tachoCount: number

  // Motor.angle(): number
  // Motor.speed(): number
  // Motor.isReady(): boolean

  // Motor.stop(): void
  // Motor.reset(): void
  // Motor.clearCounts(): void
  // Motor.markUsed(): void

  // Motor.setBrake(brake: boolean): void
  // Motor.setBrakeSettleTime(millis: number): void

  // Motor.pauseUntilReady(timeOut ?: number): void
  // Motor.pauseUntilStalled(timeOut?: number): void

  // Motor.setPauseOnRun(value: boolean): void

  // Motor.setRunPhase(phase: MovePhase, value: number, unit: MoveUnit = MoveUnit.MilliSeconds): void

  // Motor.run(speed: number, value: number = 0, unit: MoveUnit = MoveUnit.MilliSeconds): void
  // Motor.ramp(speed: number, value: number = 500, unit: MoveUnit = MoveUnit.MilliSeconds, acceleration?: number, deceleration?: number): void

  // SynchedMotorPair.steer(turnRatio: number, speed: number, value: number = 0, unit: MoveUnit = MoveUnit.MilliSeconds): void
  // SynchedMotorPair.tank(speedLeft: number, speedRight: number, value: number = 0, unit: MoveUnit = MoveUnit.MilliSeconds): void

  interface position {
    coordinates: Vector2d;
    angle: number;
  }
  interface movement {
    motor1Speed: number;
    motor1Time: number;
    motor2Speed: number;
    motor2Time: number;
  }
}
