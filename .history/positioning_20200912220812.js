
import { debugging } from './debugging.js';

const OBSTACLE_OUTER_MARGIN = 3;

export class Positioning {

  constructor(appBoard, boardService) {
    this.appBoard = appBoard;
    this.boardService = boardService;
    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });

    this.pointToObstacleList = [];
  }

  init() {
    const boardConfig = this.boardService.getConfig();
    this.pathGrid = new PF.Grid(boardConfig.width, boardConfig.height);

    _.forEach(boardConfig.boxObstacles, (boxObstacle, i, all) => {
      if (i % 2 === 0) {
        const end = all[i + 1];

        _.times(boardConfig.width, (px) => {
          _.times(boardConfig.height, (py) => {
            const startWithMargin = {
              x: boxObstacle.x - OBSTACLE_OUTER_MARGIN,
              y: boxObstacle.y - OBSTACLE_OUTER_MARGIN,
            };

            const endWithMargin = {
              x: end.x + OBSTACLE_OUTER_MARGIN,
              y: end.y + OBSTACLE_OUTER_MARGIN,
            };

            const inObstacle = this.isPointInsideBox(
              {x: px, y: py},
              startWithMargin,
              endWithMargin);
            if (inObstacle) {
              this.addToPointToObstacleList({x: px, y: py}, { start: startWithMargin, end: endWithMargin });
              this.pathGrid.setWalkableAt(px, py, false);
            }
          });
        });
      }
    });


    // console.log(this.finder.findPath(62, 86, 758, 534, this.pathGrid));
  }

  addToPointToObstacleList(point, obstacle) {
    this.pointToObstacleList[point.y] = this.pointToObstacleList[point.y] || [];
    this.pointToObstacleList[point.y][point.x] = obstacle;
  }

  getPathFromTo(fromPoint, toPoint) {
    return this.finder.findPath(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y, this.pathGrid);
  }

  getPathFromSpriteTo(sprite, toPoint) {
    return this.finder.findPath(sprite.x, sprite.y, toPoint.x, toPoint.y, this.pathGrid);
  }

  isPointInsideBox(point, boxTL, boxBR) {
    return point.x >= boxTL.x && point.x <= boxBR.x && point.y >= boxTL.y && point.y <= boxBR.y;
  }

  _getRotatedPointByOuterReference (outerP, centerP, angleDegrees) {
    const rad = angleDegrees * Math.PI/ 180;
    const rotatedX = Math.cos(rad) * (outerP.x - centerP.x) - Math.sin(rad) * (outerP.y-centerP.y) + centerP.x;
    const rotatedY = Math.sin(rad) * (outerP.x - centerP.x) + Math.cos(rad) * (outerP.y - centerP.y) + centerP.y;

    return { x: Number(rotatedX.toFixed(0)), y: Number(rotatedY.toFixed(0)) };
  };

  _getPointByDegreesInDistanceInReferenceToPointingUp(point, distance, degrees) {
    const outer = { x: point.x - distance, y: point.y };
    return this._getRotatedPointByOuterReference(outer, point, degrees);
  }

  getDistanceBetweenPoints(pa, pb) {
    const a = pa.x - pb.x;
    const b = pa.y - pb.y;

    return Math.sqrt( a*a + b*b );
  }

  correctPointToNearestWalkable(point) {
    point.x = point.x < 0 ? -point.x : point.x;
    point.y = point.y < 0 ? -point.y : point.y;

    debugging.clearDebugGraphics();

    if (this.pathGrid.isWalkableAt(point.x, point.y)) {
      debugging.placeDebuggingMark(this.appBoard.stage, point.x, point.y, 'dest', 0x99ff99);
      return point;
    } else {
      debugging.placeDebuggingMark(this.appBoard.stage, point.x, point.y, 'Xdest', 0xff9999);

      // find obstacle in way
      const obstacle = this.pointToObstacleList[point.y][point.x];
      const xStartCloserThanEnd = Math.abs(point.x - obstacle.start.x) < Math.abs(point.x - obstacle.end.x);
      const yStartCloserThanEnd = Math.abs(point.y - obstacle.start.y) < Math.abs(point.y - obstacle.end.y);

      const xPossibility = xStartCloserThanEnd ? obstacle.start.x : obstacle.end.x;
      const yPossibility = yStartCloserThanEnd ? obstacle.start.y : obstacle.end.y;

      if (xPossibility < yPossibility && xPossibility > 0) {
        debugging.placeDebuggingMark(this.appBoard.stage, xPossibility, point.y, 'Cdest(x)', 0x99ff99);

        return { x: xPossibility, y: point.y };
      } else if (yPossibility > 0) {
        debugging.placeDebuggingMark(this.appBoard.stage, 'Cdest(y)', 0x99ff99);

        return { x: point.x, y: yPossibility };
      } else {
        console.error('Cannot find correct walkable point from', point.x, point.y, '; reverting to 0,0');
        return this.correctPointToNearestWalkable({ x: 0, y: 0 });
      }
    }
  }

  getWalkablePointAroundUnitInDistance(unit, distance, degrees) {
    const unitPoint = { x: unit.sprite.x, y: unit.sprite.y };
    const initialPoint = this._getPointByDegreesInDistanceInReferenceToPointingUp(unitPoint, distance, degrees);
    return this.correctPointToNearestWalkable(initialPoint);
  }

}
