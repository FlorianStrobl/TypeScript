// no null/undefined cause it wont be recognised correctly by the lego robo
// ball, ball cage, laundry, laundry room, water, water table, markerBlock
// TODO obstacle positions

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

interface pathIntructions {}
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
// singleton, data about the field
class GameField {
  private water1Loaded: information; // the left one, loaded=true: water bottle on the robo
  private water2Loaded: information;
  private water3Loaded: information;

  private laundryRoom1: laundryRoom; // the left one
  private laundryRoom2: laundryRoom;
  private laundryRoom3: laundryRoom;

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
  private isEmpty: bool; // if it was only constructed but no data is saved
  private solved: bool; // if the room is finished

  private markerBlockColor: color;

  private ball: information; // if the ball task has to be done
  private finishedBallTask: information;

  private water: information; // if the water task has to be done
  private finishedWaterTask: information;

  private laundry: information; // if the water task has to be done
  private laundryColor: color;
  private finishedLaundryTask: information;

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

// singleton, data and code for the robo
class Robo {
  private position: vec2;
  private rotation: num;

  private armData: num; // TODO

  private toTravelPath: pathIntructions[];

  private numberOfWaterLoaded: num;

  private finishedRoomsIds: roomId[]; // solved rooms
  private roomsInstances: Room[]; // room i is at index i

  private pathfinding: Pathfinding;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.rotation = 0; // orientation

    this.toTravelPath = [];

    this.numberOfWaterLoaded = 0;

    this.finishedRoomsIds = [];
    this.roomsInstances = [new Room(0), new Room(1), new Room(2), new Room(3)];

    this.pathfinding = new Pathfinding();
    this.pathfinding.setPos(this.position, this.rotation);

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

  public solveRoom(roomId: roomId): void {
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

  public loadWater(): void {
    // TODO
    // goto water
    // move arm
  }
}

// singleton, code for pathfinding
class Pathfinding {
  private position: vec2;
  private rotation: num;

  private positionGoal: vec2;
  private rotationGoal: num;

  constructor() {}

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
    return [];
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
