// no null/undefined cause it wont be recognised correctly by the lego robo
// ball, ballCage, laundry, laundryRoom, water, waterTable, markerBlock
// TODO obstacle positions
// http://ai.stanford.edu/~ddolgov/papers/dolgov_gpp_stair08.pdf

// no "new" keyword, no null/undefined, keine STRINGs,
// keine ENUMS => const enums

// #region types
type num = number;
type bool = boolean;

interface vec2 {
  x: num;
  y: num;
}

interface laundryRoom {
  position: num; // left is 0
  color: color;
  finished: information; // finished=laundry in the laundry room
}

// TODO, after a drive instruction, it will be off by some
// because the motors arent perfect
// the travel distance will be a bit higher so it has to account for that
// motions
interface pathIntructions {
  wheelRotation: num;
  travelDistance: num;
}

// a perfect box
interface hitbox {
  positionOfCenter: vec2;
  verticalLength: num;
  horizontalLength: num;
  active: bool; // starts by being there, but gets deactive if it gets moved
}

interface simpleHitbox {
  cornerUpLeft: vec2;
  cornerDownRight: vec2;
}
// #endregion

// #region enums
const enum roomId {
  yellow = 0,
  red = 1,
  blue = 2,
  green = 3
}

const enum color {
  none = 0,
  red = 1,
  green = 2,
  blue = 3,
  yellow = 4,
  black = 5,
  white = 6,
  turqoise = 7
}

// aliase for a boolean
const enum information {
  none = 0,
  true = 1,
  false = 2,
  noneExistent = 3 // e.g. only three rooms have laundry but initialized are all by none
}
// #endregion

// #region classes
// singleton, data and code for the robo
class Robo {
  private position: vec2;
  private rotation: num;

  private armData: num; // TODO

  private toTravelPath: pathIntructions[];

  private numberOfWaterLoaded: num;

  private finishedRoomsIds: roomId[]; // solved rooms
  // should be in gameField, but would be to much unnecessary code
  private roomsInstances: Room[]; // room i is at index i

  private gameField: GameField;

  private pathfinding: Pathfinding;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.rotation = 0; // orientation

    this.toTravelPath = [];

    this.numberOfWaterLoaded = 0;

    this.finishedRoomsIds = [];
    this.roomsInstances = [new Room(0), new Room(1), new Room(2), new Room(3)];

    this.gameField = new GameField();

    this.pathfinding = new Pathfinding();
    this.pathfinding.setPos(this.position, this.rotation);
  }

  // the running function
  public main(): void {
    this.loadWater();
    this.solveRoom(0);
    // go to laundry room if necessary
    this.solveRoom(1);
    // go to laundry room if necessary
    this.solveRoom(2);
    // go to laundry room if necessary
    this.solveRoom(3);
    // go to laundry room if necessary
  }

  private solveRoom(roomId: roomId): void {
    // this.roomsInstances[roomId]

    /** TODO
     * possible tasks per room:
     * - water + laundry
     * - water
     * - ball + laundry
     * - ball
     *
     * 75% of rooms have laundry
     * 50% of rooms have water the other 50% ball
     */

    if (this.roomsInstances[roomId].wasVisited() === true) {
      // no room data given
      // #region marker block and ball/water task
      const markerBlockColor: color = getMarkerColor();

      this.roomsInstances[roomId].setMarkerBlockColor(markerBlockColor); // TODO why save?

      if (markerBlockColor === color.green) {
        // ball
        // TODO while doing, check laundry for data?
      } else if (markerBlockColor === color.white) {
        // water
      }
      // #endregion

      const goToLaundryRoom: bool = doLaundryTask();
      // TODO goToLaundryRoom
    }

    function getMarkerColor(): color {
      // TODO
      return color.none;
    }

    // returns true if the robo has to go to the laundry
    function doLaundryTask(): bool {
      // #region laundry
      let inf: information = this.roomsInstances[roomId].haveToDoLaundry();

      if (inf === information.false) return false; // finished

      if (inf === information.none) {
        // check if it has to be done and if so, set haveToDoLaundry to true
        inf = information.true; // TODO only if it is really true, aka after the check
      }

      if (inf === information.true) {
        // do laundry now
        // TODO goto the laundry room?
        return true;
      }

      return false;
      // #endregion
    }

    function doWaterTask(): void {}

    function doBallTask(): void {}
  }

  private loadWater(): void {
    // TODO
    // goto water
    // move arm
  }
}

// singleton, data about the field
class GameField {
  private water1Loaded: information; // the left one, loaded=true: water bottle on the robo
  private water2Loaded: information;
  private water3Loaded: information;
  private water1Box: hitbox; // none const
  private water2Box: hitbox;
  private water3Box: hitbox;

  private laundryRoom1: laundryRoom; // the left one
  private laundryRoom2: laundryRoom;
  private laundryRoom3: laundryRoom;
  private laundryRoom1Box: hitbox; // const
  private laundryRoom2Box: hitbox;
  private laundryRoom3Box: hitbox;

  constructor() {
    this.water1Loaded = information.none;
    this.water2Loaded = information.none;
    this.water3Loaded = information.none;

    this.laundryRoom1 = {
      position: 0,
      color: color.none,
      finished: information.none
    };
    this.laundryRoom2 = {
      position: 0,
      color: color.none,
      finished: information.none
    };
    this.laundryRoom3 = {
      position: 0,
      color: color.none,
      finished: information.none
    };
  }
}

// 4 instances inside Robo, data about a room
class Room {
  private roomId: roomId; // color and id
  private isEmpty: bool; // if obj was constructed but no real data added
  private solved: bool; // if the room is finished, no need to come here again

  private markerBlockColor: color;

  private ball: information; // if the ball task has to be done
  private finishedBallTask: information;
  private ballBox: hitbox;

  private water: information; // if the water task has to be done
  private finishedWaterTask: information;
  private waterTableBox: hitbox; // const

  private laundry: information; // if the water task has to be done
  private laundryColor: color;
  private finishedLaundryTask: information;
  private laundryBox: hitbox;

  constructor(roomId: roomId) {
    this.roomId = roomId;
    this.isEmpty = true;

    this.markerBlockColor = color.none;

    this.ball = information.none;
    this.finishedBallTask = information.none;

    this.water = information.none;
    this.finishedWaterTask = information.none;

    this.laundry = information.none;
    this.laundryColor = color.none;
    this.finishedLaundryTask = information.none;
  }

  public getId(): roomId {
    return this.roomId;
  }

  public wasVisited(): bool {
    return !this.isEmpty;
  }

  public finishedRoom(): bool {
    if (this.solved === true) return true;

    // either the task is finished or the task doesnt have to be done
    if (
      (this.finishedBallTask === information.true ||
        this.ball === information.false) &&
      (this.finishedWaterTask === information.true ||
        this.water === information.false) &&
      (this.finishedLaundryTask === information.true ||
        this.laundry === information.false)
    ) {
      this.solved = true;
      return true;
    }
  }

  public setMarkerBlockColor(color: color): void {
    this.markerBlockColor = color;
    this.isEmpty = false;
  }

  public haveToDoLaundry(): information {
    // laundry was already done for this room
    if (this.finishedLaundryTask === information.true) return information.false;

    // laundry has to be done, but wasnt yet
    if (this.laundry === information.true) return information.true;

    // no information given
    if (this.laundry === information.none) return information.none;
  }
}

// singleton, code for pathfinding
class Pathfinding {
  private position: vec2;
  private rotation: num;

  private positionGoal: vec2;
  private rotationGoal: num;

  private obstacles: vec2[];

  constructor() {
    // TODO calculate/get them and update them later
    this.obstacles = [];
    this.calculateHitboxes();
  }

  // TODO
  public calculateHitboxes(...hitboxes: hitbox[][]): simpleHitbox[] {
    // get linear hitbox array
    // filter the deactive ones
    // return the two corner positions
    return [];
  }

  public setPos(position: vec2, rotation: num): void {
    this.position = position;
    this.rotation = rotation;
  }

  public setGoal(position: vec2, rotation: num): void {
    this.positionGoal = position;
    this.rotationGoal = rotation;
  }

  public getPath(): pathIntructions[] {
    // main function

    // interpolation later
    const possibleTurns: num[] = [-40, -30, -20, -10, -5, 0, 5, 10, 20, 30, 40]; // in degree
    const possibleDistances: num[] = [-10, -5, -1, 0, 1, 5, 10]; // in cm

    let possibilities: { cost: num; turn: num; dist: num }[] = [];
    for (let i = 0; i < possibleTurns.length; ++i) {
      for (let y = 0; y < possibleDistances.length; ++y) {
        const travelCost: num = this.travelCost(
          possibleDistances[y],
          possibleTurns[i]
        );
        const goalCost: num = this.goalCost(
          possibleDistances[y],
          possibleTurns[i]
        ); // heuristic
        possibilities.push({
          cost: travelCost + goalCost,
          dist: possibleDistances[y],
          turn: possibleTurns[i]
        });
      }
    }
    // get the best three possibilities (lowest cost)
    // TODO interpolate the best way here
    possibilities.sort((a, b) =>
      a.cost === b.cost ? 0 : a.cost < b.cost ? -1 : 1
    );

    return [];
  }

  public drivePath(instr: pathIntructions[]): void {
    for (const inst of instr) {
      // set the front position
      // drive the number of rotation necessary
      // get the actuall number of rotation driven
      // calculate the current position out of that number
    }
  }

  private travelCost(distance: num, turns: num): num {
    return 0;
  }

  private goalCost(distance: num, turns: num): num {
    return -1;
  }
}
// #endregion

// #region namespaces
namespace Constants {
  const waterPosition: vec2 = { x: 0, y: 0 };
  const laundryRoomPosition: vec2 = { x: 0, y: 0 };

  const yellowRoomPosition: vec2 = { x: 0, y: 0 };
  const redRoomPosition: vec2 = { x: 0, y: 0 };
  const blueRoomPosition: vec2 = { x: 0, y: 0 };
  const greenRoomPosition: vec2 = { x: 0, y: 0 };

  // relativ to what TODO
  const waterTableRelativPosition: vec2 = { x: 0, y: 0 };
  const laundryRelativPosition: vec2 = { x: 0, y: 0 };
  const ballRelativPosition: vec2 = { x: 0, y: 0 };
  const ballCageRelativPosition: vec2 = { x: 0, y: 0 };
}
// #endregion

const EV3: Robo = new Robo();
EV3.main(); // start the challange
