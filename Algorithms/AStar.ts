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

//import * as fs from 'fs';
//const test = require('fs');

// Number.POSITIVE_INFINITY alias
// TODO remove
const infinity: number = 9999999999;

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
  // field types
  const n: number = 0; // nothing
  const s: number = 1; // starting field
  const e: number = 2; // end field
  const w: number = 3; // wall field
  const sw: number = 4; // small wall field (walls where you shouldn't be, but can start of)
  const p: number = 5; // path (for the end)

  // the type of field
  enum fieldType {
    nothing = n,
    startField = s,
    endField = e,
    wallField = w,
    smallWallField = sw,
    path = p
  }

  // was the field already scanned
  enum fieldState {
    nothing = 0, // didn't explore or traversed field => gCost unkown
    explored = 1, // gCost was calculated once, not sure that it is the best one
    traversed = 2 // was already explored and once the cheapest field
  }

  const fieldXLength: number = 500;
  const fieldYLength: number = 500;

  export const startField: Vector2d = { x: 4, y: 2 };
  export const endField: Vector2d = { x: 274, y: 163 };

  // initialise the field with these walls with these settings
  export const wallFields: Vector2d[][] = [
    [
      { x: 0, y: 0 }, // coord 1
      { x: w, y: -1 }
    ],
    [
      { x: 15, y: 8 }, // coord 2
      { x: w, y: -1 }
    ],
    [
      { x: 4, y: 3 }, // start wall
      { x: w, y: -1 }
    ],
    [
      { x: 5, y: 8 }, // end wall
      { x: w, y: -1 }
    ],
    [
      { x: 4, y: 8 }, // end wall
      { x: w, y: -1 }
    ],
    [
      { x: 5, y: 6 }, // end wall
      { x: w, y: -1 }
    ],
    [
      { x: 4, y: 7 }, // end wall
      { x: w, y: -1 }
    ],
    [
      { x: 6, y: 7 }, // end wall
      { x: w, y: -1 }
    ],
    [
      { x: 6, y: 8 }, // end wall
      { x: w, y: -1 }
    ],

    [
      { x: 6, y: 6 }, // end wall
      { x: w, y: -1 }
    ]
    //[
    //  { x: 4, y: 6 }, // end wall
    //  { x: w, y: -1 }
    //]
  ];

  export const fields: Field[][] = initialiseFields();
  function initialiseFields(): Field[][] {
    let _fields: Field[][] = [];
    for (let y = 0; y < fieldYLength; ++y) {
      _fields.push([]);
      for (let x = 0; x < fieldXLength; ++x) {
        let value = n;
        // special fields, specified in field settings
        for (let i = 0; i < wallFields.length; ++i)
          if (wallFields[i][0].x === x && wallFields[i][0].y === y)
            value = wallFields[i][1].x;

        if (x === startField.x && y === startField.y)
          value = fieldType.startField;
        if (x === endField.x && y === endField.y) value = fieldType.endField;

        _fields[y].push({
          coords: { x: x, y: y },
          type: value,
          // TODO round
          hCost: infinity,
          gCost: value === fieldType.startField ? 0 : infinity,
          connectedCoords: { x: -1, y: -1 },
          state: value === fieldType.startField ? 1 : 0 // set the start field to traversed
        });
      }
    }
    return _fields;
  }
  // #endregion

  export function pathfinding(): Vector2d[] {
    let searchDepthCounter: number = 178 + 1;
    let foundEnd: boolean = false;
    // the results in between
    let middleTimeResults: { state1Fields: Field[]; state2Fields: Field[] }[] =
      [];

    // the main code
    while (true) {
      // get the current cheapest field
      let currentCheapestField: Vector2d = currentCheapestExploredField();

      // avoid restarting from the begining if every field was checked
      if (currentCheapestField.x === -1 && currentCheapestField.y === -1) break;

      if (exploreNeighbourFields(currentCheapestField) === true)
        // explore the neighbour fields and search for end
        foundEnd = true;

      middleTimeResults.push({
        state1Fields: getFields((f) => f.state === 1),
        state2Fields: getFields((f) => f.state === 2)
      });

      if (--searchDepthCounter === 0 || foundEnd) break;
    }

    if (foundEnd) return findPath().map((f) => f.coords);
    else return [];

    // #region private functions
    // returns the current cheapest field with an explored state bigger than 0 (was at least once traversed)
    function currentCheapestExploredField(): Vector2d {
      let cheapestField: Vector2d = { x: -1, y: -1 }; // the current cheapest field, starts everytime with the start field
      let cheapestFCost: number = infinity;

      // only get fields with status 1
      const traversedFields: Field[] = getFields((f) => f.state === 1);

      // if the traversed field is cheaper, update it
      // TODO <= vs <
      for (const tvField of traversedFields) {
        fields[tvField.coords.y][tvField.coords.x].hCost = calculateHCost(
          tvField.coords
        );
        if (tvField.gCost + tvField.hCost <= cheapestFCost) {
          cheapestFCost = tvField.gCost + tvField.hCost;
          cheapestField = tvField.coords;
        }
      }

      return cheapestField;
    }

    function exploreNeighbourFields(coords: Vector2d): boolean {
      // update current field state to traversed
      fields[coords.y][coords.x].state = 2;

      // set all its neighbour fields to explored instead of current value
      // TODO what if was already traversed
      const neighbourFields: Vector2d[] = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: -1, y: -1 }
      ];

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
            break;
          case sw:
            // small wall
            break;
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
            if (currField.type === e) {
              fields[_y][_x].state = 2;
              return true;
            }
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
      const oldCost: number = fields[originCoords.y][originCoords.x].gCost;
      const newCost: number = Math.sqrt(
        Math.abs(originCoords.y - gotoCoords.y) ** 2 +
          Math.abs(originCoords.x - gotoCoords.x) ** 2
      );
      return oldCost + newCost;

      // TODO round
      return (
        fields[originCoords.y][originCoords.x].gCost +
        (originCoords.y === gotoCoords.y || originCoords.x === gotoCoords.x
          ? 1
          : 1.4)
      );
    }

    function calculateHCost(coords: Vector2d): number {
      return Math.sqrt(
        Math.abs(endField.x - coords.x) ** 2 +
          Math.abs(endField.y - coords.y) ** 2
      );
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

  // TODO
  export function updateFields(finalPath: Vector2d[]) {
    AStar.getFields((f) => {
      if (
        finalPath.some(
          (_f) =>
            _f.x === f.coords.x &&
            _f.y === f.coords.y &&
            !(
              (_f.x === AStar.startField.x && _f.y === AStar.startField.y) ||
              (_f.x === AStar.endField.x && +_f.y === AStar.endField.y)
            )
        )
      )
        AStar.fields[f.coords.y][f.coords.x].type = 5; // path fields

      // explored and traversed fields
      if (
        !(
          (f.coords.x === AStar.startField.x &&
            f.coords.y === AStar.startField.y) ||
          (f.coords.x === AStar.endField.x && +f.coords.y === AStar.endField.y)
        )
      )
        if (f.state === 1)
          // explored fields
          AStar.fields[f.coords.y][f.coords.x].type = 6;
        else if (f.state === 2) AStar.fields[f.coords.y][f.coords.x].type = 7; // traversed fields

      return false;
    });
  }

  export function getFields(filter: (field: Field) => boolean): Field[] {
    let fieldArray: Field[] = [];
    for (let y = 0; y < fieldYLength; ++y)
      for (let x = 0; x < fieldXLength; ++x)
        if (filter(fields[y][x])) fieldArray.push(fields[y][x]);
    return fieldArray;
  }

  export function toPixelInfo(
    _fields: Field[],
    _path: Vector2d[]
  ): string[][][] {
    let pixelInfo: string[][][] = [];
    for (let y = 0; y < fieldYLength; ++y) {
      pixelInfo.push([]); // y dimension
      for (let x = 0; x < fieldXLength; ++x) {
        // x dimension
        pixelInfo[y].push([]);

        // infos of field
        pixelInfo[y][x].push('color');
        pixelInfo[y][x].push('hCost');
        pixelInfo[y][x].push('gCost');
      }
    }

    for (const _f of _fields) {
      // color
      let color: string = '#ffffff';
      switch (_f.type) {
        case n:
          color = '#ffffff';
          break;
        case s:
          color = '#0000ff';
          break;
        case e:
          color = '#ff0000';
          break;
        case w:
          color = '#808080';
          break;
        case p:
          color = '#00ff00';
          break;
        case 6:
          color = '#ffff00';
          break;
        case 7:
          if (!_path.some((i) => i.x === _f.coords.x && i.y === _f.coords.y))
            color = '#00ffff';
          else color = '#00ff00';
          break;
      }

      pixelInfo[_f.coords.y][_f.coords.x][0] = color;

      pixelInfo[_f.coords.y][_f.coords.x][1] =
        _f.hCost !== infinity
          ? (Math.round(_f.hCost * 10) / 10).toString()
          : '-';

      pixelInfo[_f.coords.y][_f.coords.x][2] =
        _f.gCost !== infinity
          ? (Math.round(_f.gCost * 10) / 10).toString()
          : '-';
    }

    return pixelInfo;
  }
}

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

const path: Vector2d[] = AStar.pathfinding();
AStar.updateFields(path);
console.log(AStar.draw(AStar.fields));
//console.log(
//  AStar.toPixelInfo(
//    AStar.getFields(() => true),
//    path.slice(1, -1)
//  )
//);
