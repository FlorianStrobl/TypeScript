// no diagonal, only n o s w, cost per move is 1
// TODO: correct handling of nearby end, better way of using path
// TODO: correctly handling walls

// #region Variables
interface Vector2d {
  x: number;
  y: number;
}

// settings
const fieldXLength: number = 10;
const fieldYLength: number = 10;
const s: number = 1; // start number
const e: number = 2; // end number
const w: number = 3; // wall number
const p: number = 4; // path number
const costPerMove: number = 1;

// the main field
let field: number[][] = createArray(fieldXLength, fieldYLength, 0);
// initiale field settings
field[0][0] = s; // start
//field[4][2] = e; // end
field[9][9] = e; // end TODO cost calculation
field[8][8] = w; // wall/obsticle
//field[3][3] = w; // wall/obsticle
//field[4][3] = w; // wall/obsticle
//field[5][3] = w; // wall/obsticle
//field[6][3] = w; // wall/obsticle
//field[7][3] = w; // wall/obsticle

// explored cost from start field to the current lowest cost way
let gCost: (number | null)[][] = createArray(fieldXLength, fieldYLength, null);
// explored cost from the current relativ position to the end field
let hCost: (number | null)[][] = createArray(fieldXLength, fieldYLength, null);

// the current lowest cost field, which get you the the current relativ position
// lcf(x, y) is one of its nearby fields, with the lowest gCost
let lastCoordField: Vector2d[][] = createArray(
  fieldXLength,
  fieldYLength,
  null
);
// fields which where already checked
let opendFields: Vector2d[] = [];
let finalFields: Vector2d[] = [];

const startCoords: Vector2d = getStartCoords();
const endCoords: Vector2d = getEndCoords();
// #endregion

// #region Support functions
function getStartCoords(): Vector2d {
  // get the start coords
  let sc: Vector2d = { x: null, y: null };
  for (let x = 0; x < fieldXLength; ++x)
    for (let y = 0; y < fieldYLength; ++y)
      if (field[x][y] === s) {
        // found starting point
        sc.x = x;
        sc.y = y;
      }
  return sc;
}

function getEndCoords(): Vector2d {
  // get the end coords
  let ec: Vector2d = { x: null, y: null };
  for (let x = 0; x < fieldXLength; ++x)
    for (let y = 0; y < fieldYLength; ++y)
      if (field[x][y] === e) {
        // found ending point
        ec.x = x;
        ec.y = y;
      }
  return ec;
}

function mainSearch(): 'stop' | 'stop2' {
  // the fields to open next, don't open it's origin, since recursiv problem and wrong numbers
  // TODO, skip already checked fields
  // TODO, optimize in making F and HCost loops in one
  let lowestFCostFields: Vector2d[] = []; // the current lowest f cost fields
  let lowestHCostFields: Vector2d[] = []; // the current lowest h cost fields
  for (let x = 0; x < fieldXLength; ++x)
    for (let y = 0; y < fieldYLength; ++y) {
      let curField: Vector2d = { x: x, y: y };

      // check if already traversed and skip it if so
      if (opendFields.some((v) => v.x === x && v.y === y)) continue;

      // new lowest point
      if (
        lowestFCostFields.length === 0 ||
        getFCost(curField) < getFCost(lowestFCostFields[0])
      )
        lowestFCostFields = [curField];
      // add the point, cause same value
      else if (getFCost(curField) === getFCost(lowestFCostFields[0]))
        lowestFCostFields.push(curField);
    }
  lowestFCostFields = lowestFCostFields.filter((v) => getFieldValue(v) !== w);
  for (let lcff of lowestFCostFields) {
    // new lowest point
    if (
      lowestHCostFields.length === 0 ||
      getHCost(lcff) < getHCost(lowestHCostFields[0])
    )
      lowestHCostFields = [lcff];
    // add the point, cause same value
    else if (getHCost(lcff) === getHCost(lowestHCostFields[0]))
      lowestHCostFields.push(lcff);
  }

  // TODO check if no new fields can be opend
  if (lowestHCostFields.length === 0) {
    console.log('No possible way found!');
    return 'stop2';
  }

  // stop if no possible way to end

  // check the near fields for this the lowest current point
  if (openNearFields(lowestFCostFields[0]) === 'stop') {
    // finish
    return 'stop';
  }
}

// TODO add diagonal
function openNearFields(field: Vector2d): 'stop' | void {
  if (getFieldValue(field) === w) return;
  if (getFieldValue(field) !== s) opendFields.push(field); // add to searched fields

  // open the four fields nearby, and calculate the h- and gCost
  // TODO replace the 1 by real values
  // sides
  if (
    updateFieldCost(field, { x: field.x - 1, y: field.y }, costPerMove) ===
    'stop'
  )
    return 'stop';
  if (
    updateFieldCost(field, { x: field.x + 1, y: field.y }, costPerMove) ===
    'stop'
  )
    return 'stop';
  if (
    updateFieldCost(field, { x: field.x, y: field.y - 1 }, costPerMove) ===
    'stop'
  )
    return 'stop';
  if (
    updateFieldCost(field, { x: field.x, y: field.y + 1 }, costPerMove) ===
    'stop'
  )
    return 'stop';

  // diagonals
  if (
    updateFieldCost(
      field,
      { x: field.x + 1, y: field.y + 1 },
      costPerMove * 1.4
    ) === 'stop'
  )
    return 'stop';
  if (
    updateFieldCost(
      field,
      { x: field.x - 1, y: field.y + 1 },
      costPerMove * 1.4
    ) === 'stop'
  )
    return 'stop';
  if (
    updateFieldCost(
      field,
      { x: field.x + 1, y: field.y - 1 },
      costPerMove * 1.4
    ) === 'stop'
  )
    return 'stop';
  if (
    updateFieldCost(
      field,
      { x: field.x - 1, y: field.y - 1 },
      costPerMove * 1.4
    ) === 'stop'
  )
    return 'stop';
}

// TODO, check if wall, check if multiplier/adder to the relativ coord
function updateFieldCost(
  lastCoords: Vector2d,
  pos: Vector2d,
  addCost: number
): 'stop' | void {
  const lastCost: number = getGCost(lastCoords) ?? 0;

  if (pos.x < 0 || pos.x >= fieldXLength || pos.y < 0 || pos.y >= fieldYLength)
    // TODO return if pos is out of field
    return;
  // the coords are the start field
  else if (getFieldValue(pos) === s || getFieldValue(pos) === w) return;
  // check if found the end field
  else if (getFieldValue(pos) === e) {
    // TODO wrong last pos if no path is correct
    console.log('found end');
    // reverse the way with lastCoordField[]
    // TODO reverse the way, pos is e so lastCoords is the fastes way
    // Final
    lastCoordField[pos.x][pos.y] = lastCoords; // pos == endPos
    finalFields = getFinalFields(pos);
    return 'stop'; // the coords are the end
  }

  // set the gCost
  if (getGCost(pos) === null) {
    // no old cost to update
    setGCost(lastCost + addCost, pos);
    lastCoordField[pos.x][pos.y] = lastCoords; // TODO
  } else if (getGCost(pos) > lastCost + addCost) {
    // update old cost
    // if smaller gCost is saved, dont update
    setGCost(lastCost + addCost, pos);
    lastCoordField[pos.x][pos.y] = lastCoords; // todo
  }

  // no old cost to update
  if (getHCost(pos) === null) setHCost(calculateHCost(pos, endCoords), pos);
  else if (getHCost(pos) > calculateHCost(pos, endCoords))
    // update old cost, if smaller hCost is saved, dont update
    setHCost(calculateHCost(pos, endCoords), pos);

  // TODO better formular adapted for all cases
  function calculateHCost(field1: Vector2d, field2: Vector2d): number {
    return Math.abs(field1.x - field2.x) + Math.abs(field1.y - field2.y);
  }
}

function getFinalFields(lastCoords: Vector2d): Vector2d[] {
  // TODO lastCoords is wrong
  let f: Vector2d[] = [];
  let curCoords: Vector2d = lastCoords;
  while (true) {
    curCoords = lastCoordField[curCoords.x][curCoords.y];
    if (curCoords === null) break;
    if (curCoords.x === startCoords.x && curCoords.y === startCoords.y) break;
    f.push(curCoords);
  }
  console.log(f);
  return f;
}

// #region setters and getters
// the total cost of the field (g + h cost)
function getFCost(field: Vector2d): number {
  return (getGCost(field) ?? Infinity) + (getHCost(field) ?? Infinity);
}

function getFieldValue(_field: Vector2d): number {
  return field[_field.x][_field.y];
}

function getGCost(field: Vector2d): number | null {
  return gCost[field.x][field.y];
}

function getHCost(field: Vector2d): number | null {
  return hCost[field.x][field.y];
}

function setGCost(cost: number, field: Vector2d): void {
  gCost[field.x][field.y] = cost;
}

function setHCost(cost: number, field: Vector2d): void {
  hCost[field.x][field.y] = cost;
}
// #endregion

function createArray(x: number, y: number, fill: any): any[][] {
  let ar: number[][] = new Array(x);
  for (let i = 0; i < x; ++i) ar[i] = new Array(y).fill(fill);
  return ar;
}

// TODO delete
function showField(ar: number[][]): void {
  console.log('  0123456789');
  for (let y = 0; y < fieldXLength; ++y) {
    let line: string = '';
    for (let x = 0; x < fieldYLength; ++x) line += (ar[x][y] ?? 0).toString();
    console.log(y, line);
  }
}
// #endregion

function aStar() {
  // start with the main point
  openNearFields(startCoords);

  while (true) {
    let t = mainSearch();
    if (t === 'stop' || t === 'stop2') break;
  }

  let finalField: number[][] = createArray(fieldXLength, fieldYLength, 0);
  for (let x = 0; x < fieldXLength; ++x)
    for (let y = 0; y < fieldYLength; ++y) {
      finalField[x][y] = field[x][y];
      if (opendFields.some((v) => v.x === x && v.y === y)) finalField[x][y] = 5;
      if (finalFields.some((v) => v.x === x && v.y === y)) finalField[x][y] = 4;
    }

  //console.log(fieldToColorField(finalField));

  console.log('main field:');
  showField(field);
  console.log('final field:');
  showField(finalField);

  //console.log('g cost:');
  //showField(gCost);
  //console.log('h cost:');
  //showField(hCost);
}

function fieldToColorField(_field: number[][]): string[][] {
  let colorField: string[][] = createArray(_field.length, _field[0].length, '');

  for (let x = 0; x < _field.length; ++x)
    for (let y = 0; y < _field[0].length; ++y) {
      let str: string = '';

      switch (_field[x][y]) {
        case 0:
          str = '#ffffff'; // cell
          break;
        case s:
          str = '#ff0000'; // start
          break;
        case e:
          str = '#00ff00'; // end
          break;
        case w:
          str = '#000000'; // wall
          break;
        case p:
          str = '#ff00ff'; // path
          break;
        case 5:
          str = '#ffff00'; // explored
          break;
      }

      colorField[x][y] = str;
    }

  return colorField;
}

aStar();
