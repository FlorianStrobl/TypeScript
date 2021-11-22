// #region enums
enum value {
  normal = 0,
  start = 1,
  goal = 2,
  wall = 3
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

  private wallCoords: vec[];

  public nodes: (node | null)[];
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

    // set main coords
    this.startCoords = _startCoords;
    this.goalCoords = _goalCoords;

    // set wall coords
    this.wallCoords = _wallCoords;

    // set all the nodes to null
    this.nodes = [];
    for (let i = 0; i < _xLength * _yLength; ++i) this.nodes.push(null);

    // set the main and wall coords
    this.setNode(_startCoords, {
      value: value.start,
      state: state.explored,
      cameFrom: null,
      gCost: 0
    });
    this.setNode(_goalCoords, {
      value: value.goal,
      state: state.unexplored,
      cameFrom: null,
      gCost: null
    });
    for (const wall of _wallCoords)
      this.setNode(wall, {
        value: value.wall,
        state: state.unexplored,
        cameFrom: null,
        gCost: null
      });
  }

  public pathfinding(): vec[] {
    let arrivedAtGoal: boolean = false;

    while (true) {
      let cheapestNode: vec | null = this.getCheapestNode();

      // no more nodes to traverse there
      if (cheapestNode === null) break;

      // traverse the node and explore the neighbours
      arrivedAtGoal = this.exploreNeighbourNodes(cheapestNode);

      // if found the goal node stop
      if (arrivedAtGoal === true) break;
    }

    //if (arrivedAtGoal) console.log('Found the goal!');
    //else console.log('Did not found the goal!');

    // retrace the whole path and return it
    return this.retracePath();
  }

  // searches the cheapest node which is in explored state
  private getCheapestNode(): vec | null {
    let cheapestNode: vec | null = null;
    let cheapestNodeFCost: number | null = null;

    for (let y = 0; y < this.yLength; ++y)
      for (let x = 0; x < this.xLength; ++x) {
        // for each node
        const currentNodeCoords: vec = { x: x, y: y };
        const currentNode: node | null = this.getNode(currentNodeCoords);

        // if node is null, was not explored or is a wall, skip
        if (
          currentNode === null ||
          (currentNode !== null &&
            (currentNode.state !== state.explored ||
              currentNode.value === value.wall))
        )
          continue;

        // calculate the current F cost
        const currentNodeFCost: number =
          currentNode.gCost + this.getHCost(currentNodeCoords, this.goalCoords);

        // if cheapest node is null, update it
        if (cheapestNode === null) {
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
      n.state = state.traversed;
      return n;
    });

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
      const node: node = this.getNode(nodeCoords);

      // TODO, optimize three times the "same" code
      const currentGCost: number =
        this.getRelativGCost(nodeCoords, coords) + this.getNode(coords).gCost;

      // node is the goal => finished
      if (node !== null && node.value === value.goal) {
        this.setNode(nodeCoords, undefined, (n) => {
          n.cameFrom = coords;
          n.gCost = currentGCost;
          n.state = state.explored;
          return n;
        });
        return true;
      }

      // node is valid to explore
      if (node === null) {
        this.setNode(nodeCoords, {
          cameFrom: coords,
          gCost: currentGCost,
          state: state.explored,
          value: value.normal
        });
      } else if (node.value !== value.wall && node.value !== value.start) {
        if (currentGCost < node.gCost)
          this.setNode(nodeCoords, undefined, (n) => {
            n.cameFrom = coords;
            n.gCost = currentGCost;
            n.state = state.explored;
            return n;
          });
      }
    }

    return false;
  }

  private retracePath(): vec[] {
    let lastNode: node = this.getNode(this.goalCoords);
    let pathNodes: vec[] = [];

    while (true) {
      pathNodes.push(lastNode.cameFrom);
      lastNode = this.getNode(lastNode.cameFrom);
      if (lastNode.value === value.start) break;
    }

    return pathNodes;
  }

  public getNode(coords: vec): node | null {
    // out of array
    if (coords.y * this.xLength + coords.x > this.xLength * this.yLength)
      return null;
    return this.nodes[coords.y * this.xLength + coords.x];
  }

  private setNode(
    coords: vec,
    _value?: node | null,
    updateValue?: (n: node) => node | null
  ): void {
    if (_value !== null && _value !== undefined)
      this.nodes[coords.y * this.xLength + coords.x] = _value;
    else if (updateValue !== null && updateValue !== undefined) {
      const currentNode: node | null =
        this.nodes[coords.y * this.xLength + coords.x];

      if (currentNode !== null)
        this.nodes[coords.y * this.xLength + coords.x] =
          updateValue(currentNode);
      else
        this.nodes[coords.y * this.xLength + coords.x] = updateValue({
          value: value.normal,
          state: state.unexplored,
          gCost: 0,
          cameFrom: null
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
}

const test = new AStars(1000, 1000, { x: 0, y: 0 }, { x: 9, y: 9 }, []);
console.log(test.pathfinding());
