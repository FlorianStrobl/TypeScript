interface vec2 {
  x: number;
  y: number;
}

type id = number;

enum roomNr {
  room1 = 1, // yellow
  room2 = 2, // red
  room3 = 3, // green
  room4 = 4 // blue
}

enum colors {
  red = 0,
  green = 1,
  blue = 2,
  yellow = 3,
  black = 4,
  white = 5
}

interface waescheBereich {
  id: id;
  color: colors;
  filled: boolean;
}
interface waescheblock {
  id: id;
  originRoom: roomNr;
  color: colors;
  moved: boolean;
}
interface spielball {
  id: id;
  originRoom: roomNr;
  color: colors;
  moved: boolean;
}
interface wasserflasche {}
interface tisch {}

interface room {}

interface tasks {}

class GameMap {
  constructor() {}

  public rooms = {};
}

class Roboter {
  constructor() {}

  public position = { x: 0, y: 0 };
  public rotation = 0;

  public path = [];

  public hitbox = [
    { x: 0, y: 0 },
    { x: 10, y: 10 }
  ];
}

class RoboterFuturePath {
  constructor() {}
}

class Calculations {
  constructor() {}
}

class WROHybritAStar {
  constructor() {}
}

class Main {
  constructor() {}
}
