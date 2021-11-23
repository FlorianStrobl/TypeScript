// #region enums
enum value {
  normal = 0,
  start = 1,
  goal = 2,
  wall = 3,
  empty = -1
}

enum state {
  unexplored = 0,
  explored = 1,
  traversed = 2
}
// #endregion

// #region interfaces
interface vec {
  x: number;
  y: number;
}

interface node {
  value: value;
  state: state;
  cameFrom: vec;
  gCost: number;
}
// #endregion

class AStars {
  // #region vars
  private xLength: number;
  private yLength: number;

  private startCoords: vec;
  private goalCoords: vec;

  public nodes: (node | -1)[];
  // #endregion

  constructor(
    _xLength: number,
    _yLength: number,
    _startCoords: vec,
    _goalCoords: vec,
    _wallCoords: vec[]
  ) {
    // set lengths
    this.xLength = _xLength;
    this.yLength = _yLength;

    this.startCoords = _startCoords;
    this.goalCoords = _goalCoords;

    // set all the nodes to -1/null
    this.nodes = [];
    for (let i = 0; i < _xLength * _yLength; ++i) this.nodes.push(-1);

    // set the start, goal and wall coords
    this.setNode(_startCoords, {
      value: value.start,
      state: state.explored,
      cameFrom: { x: -1, y: -1 },
      gCost: 0
    });
    this.setNode(_goalCoords, {
      value: value.goal,
      state: state.unexplored,
      cameFrom: { x: -1, y: -1 },
      gCost: -1
    });
    for (const wall of _wallCoords)
      this.setNode(wall, {
        value: value.wall,
        state: state.unexplored,
        cameFrom: { x: -1, y: -1 },
        gCost: -1
      });
  }

  public pathfinding(): vec[] {
    let arrivedAtGoal: boolean = false;

    while (true) {
      // get the cheapest explored node
      let cheapestNode: vec = this.getCheapestNode();

      // no more nodes to traverse there
      if (cheapestNode.x === -1) break;

      // traverse the node and explore it's neighbour nodes
      arrivedAtGoal = this.exploreNeighbourNodes(cheapestNode);

      // found the goal node, stop
      if (arrivedAtGoal === true) break;
    }

    //if (arrivedAtGoal) console.log('Found the goal!');
    //else console.log('Did not found the goal!');

    // retrace the whole path and return it
    return this.retracePath();
  }

  // searches the cheapest node which is in explored state
  private getCheapestNode(): vec {
    // set them to -1, to check it better
    let cheapestNode: vec = { x: -1, y: -1 };
    let cheapestNodeFCost: number = -1;

    for (let y = 0; y < this.yLength; ++y)
      for (let x = 0; x < this.xLength; ++x) {
        // for each node
        const currentNodeCoords: vec = { x: x, y: y };
        const currentNode: node = this.getNode(currentNodeCoords);

        // if node is empty, was not explored or is a wall, skip
        if (
          currentNode.value === value.empty ||
          currentNode.state !== state.explored ||
          currentNode.value === value.wall
        )
          continue;

        // calculate the current F cost
        const currentNodeFCost: number =
          currentNode.gCost + this.getHCost(currentNodeCoords, this.goalCoords);

        // if cheapest node is null, update it
        if (cheapestNode.x === -1) {
          cheapestNodeFCost = currentNodeFCost;
          cheapestNode = currentNodeCoords;
          // if current node is cheaper in total (F cost) update it
        } else if (currentNodeFCost < cheapestNodeFCost) {
          cheapestNodeFCost = currentNodeFCost;
          cheapestNode = currentNodeCoords;
        }
      }

    return cheapestNode;
  }

  private exploreNeighbourNodes(coords: vec): boolean {
    this.setNode(coords, undefined, (n) => {
      n.state = state.traversed; // current node is now traversed
      return n;
    });

    // constant relativ positions of neighbour nodes
    const neighbourNodes: vec[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 }
    ];

    for (const neighbour of neighbourNodes) {
      // current coords
      const nodeCoords: vec = {
        x: neighbour.x + coords.x,
        y: neighbour.y + coords.y
      };

      // check boundes
      if (
        nodeCoords.x < 0 ||
        nodeCoords.y < 0 ||
        nodeCoords.x >= this.xLength ||
        nodeCoords.y >= this.yLength
      )
        continue;

      // current node
      let node: node = this.getNode(nodeCoords);

      // g cost of current main node
      const currentGCost: number =
        this.getRelativGCost(nodeCoords, coords) + this.getNode(coords).gCost;

      // if node was not set already, set the data
      if (node.value === value.empty) {
        this.setNode(nodeCoords, {
          value: value.normal,
          state: state.explored,
          cameFrom: coords,
          gCost: currentGCost
        });
        // update the node for this function
        node = this.getNode(nodeCoords);
      }

      // node is the goal, finished
      if (node.value === value.goal) {
        this.setNode(nodeCoords, undefined, (n) => {
          n.state = state.explored;
          n.cameFrom = coords;
          n.gCost = currentGCost;
          return n;
        });
        return true;
      } else if (node.value !== value.wall && node.value !== value.start) {
        // TODO
        // node is valid to explore
        if (currentGCost < node.gCost)
          this.setNode(nodeCoords, undefined, (n) => {
            n.state = state.explored;
            n.cameFrom = coords;
            n.gCost = currentGCost;
            return n;
          });
      }
    }

    // didn't found the goal
    return false;
  }

  private retracePath(): vec[] {
    let lastNode: node = this.getNode(this.goalCoords);
    let pathNodes: vec[] = [];

    while (true) {
      // no nodes was connected so no path exist
      if (lastNode.value === value.empty) return [];
      pathNodes.push(lastNode.cameFrom); // add current node
      lastNode = this.getNode(lastNode.cameFrom); // set the next node to the linked one
      if (lastNode.value === value.start) break; // stop at the starting node
    }

    return pathNodes;
  }

  public getNode(coords: vec): node {
    // out of array
    if (
      coords.y * this.xLength + coords.x >= this.xLength * this.yLength ||
      coords.x < 0 ||
      coords.y < 0
    )
      return {
        value: value.empty,
        state: state.unexplored,
        gCost: -1,
        cameFrom: { x: -1, y: -1 }
      };

    // get raw node data
    const node: node | -1 = this.nodes[coords.y * this.xLength + coords.x];
    // TODO, if null return a default value
    if (node === -1)
      return {
        value: value.empty,
        state: state.unexplored,
        gCost: 0,
        cameFrom: { x: -1, y: -1 }
      };
    else return node;
  }

  private setNode(
    coords: vec,
    _value?: node | undefined,
    updateValue?: (n: node) => node
  ): void {
    if (_value !== undefined)
      this.nodes[coords.y * this.xLength + coords.x] = _value;
    else if (updateValue !== undefined) {
      const currentNode: node = this.getNode(coords);

      // update the coords, or set a default value
      if (currentNode.value !== value.empty)
        this.nodes[coords.y * this.xLength + coords.x] =
          updateValue(currentNode);
      else
        this.nodes[coords.y * this.xLength + coords.x] = updateValue({
          value: value.normal,
          state: state.unexplored,
          gCost: 0,
          cameFrom: { x: -1, y: -1 }
        });
    }
  }

  // heuristic cost
  private getHCost(coords1: vec, coords2: vec): number {
    return Math.sqrt(
      Math.abs(coords1.x - coords2.x) ** 2 +
        Math.abs(coords1.y - coords2.y) ** 2
    );
  }

  // way cost, only for neighbour nodes
  private getRelativGCost(coords1: vec, coords2: vec): number {
    // uses the same math formular to calculate it
    return this.getHCost(coords1, coords2);
  }

  public getNodesData(_path: vec[]): string[][][] {
    let pixelInfo: string[][][] = [];

    // initialise the nodes field first
    for (let y = 0; y < this.yLength; ++y) {
      pixelInfo.push([]); // y dimension
      for (let x = 0; x < this.xLength; ++x) {
        // x dimension
        pixelInfo[y].push([]);

        // infos of field
        pixelInfo[y][x].push('color');
        pixelInfo[y][x].push('hCost');
        pixelInfo[y][x].push('gCost');
      }
    }

    let x: number = 0;
    let y: number = 0;
    for (const _node of this.nodes) {
      // color
      let color: string = '#ffffff';

      if (_node !== -1) {
        switch (_node.value) {
          case value.empty:
            color = '#ffffff';
            break;
          case value.start:
            color = '#00ff00';
            break;
          case value.goal:
            color = '#ff0000';
            break;
          case value.wall:
            color = '#808080';
            break;
        }

        if (
          _node.state === state.explored &&
          _node.value !== value.start &&
          _node.value !== value.goal
        )
          color = '#ffff00';
        else if (
          _node.state === state.traversed &&
          _node.value !== value.start &&
          _node.value !== value.goal
        )
          color = '#00ffff';

        if (
          _path.some((v) => v.x === x && v.y === y) &&
          !(x === this.startCoords.x && y === this.startCoords.y)
        )
          color = '#ff00ff';
      }

      pixelInfo[y][x][0] = color;

      pixelInfo[y][x][1] = this.getHCost({ x: x, y: y }, this.goalCoords)
        .toPrecision(3)
        .toString();

      if (_node === -1) pixelInfo[y][x][2] = '-';
      else pixelInfo[y][x][2] = _node.gCost.toPrecision(3).toString();

      // increase counter
      if (++x >= this.xLength) {
        x = 0;
        ++y;
      }
    }

    return pixelInfo;
  }
}

const _aStar = new AStars(10, 10, { x: 0, y: 0 }, { x: 7, y: 8 }, [
  { x: 4, y: 3 },
  { x: 4, y: 4 },
  { x: 3, y: 4 },
  { x: 2, y: 5 }
]);
const _path = _aStar.pathfinding();
console.log(_path);
console.log(_aStar.getNodesData(_path));
